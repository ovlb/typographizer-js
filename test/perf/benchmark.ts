import TypographizerJS from '../../source/index.ts'
import exampleEn from '../__samples__/en.ts'

export interface BenchResult {
  /** Suite identifier, e.g. "typographize:de" or "method:fixEllipsis" */
  suite: string
  /** Method under test; undefined for full-pipeline suites */
  method?: string
  /** Human-readable size label, e.g. "1 KB" */
  label: string
  /** Actual byte length of the measured input */
  bytes: number
  /** Best (fastest) wall-clock duration in milliseconds */
  bestMs: number
  /** Output of the last measured run (for correctness assertions) */
  output: string
  /** Input of the last measured run (for correctness assertions) */
  input: string
}

export const SIZE_LABELS = {
  '256 B': 256,
  '1 KB': 1024,
  '10 KB': 10 * 1024,
  '100 KB': 100 * 1024,
  '1 MB': 1024 * 1024
} as const

/** Languages measured for the full typographize() pipeline. */
export const LANGUAGES = ['en_US', 'de', 'fr', 'pl'] as const

/** Public pipeline methods, measured individually. */
export const METHODS = [
  'trimWhitespace',
  'formatQuotes',
  'formatOpeningQuotes',
  'formatClosingQuotes',
  'fixApostroph',
  'fixEllipsis',
  'fixAiryPunctuation'
] as const

/** Methods are only measured at sizes where their runtime is not pure noise. */
export const METHOD_SIZE_LABELS = ['10 KB', '100 KB', '1 MB'] as const

const WARMUP_RUNS = 5
const MEASURED_RUNS = 27

/**
 * Machine-speed calibration: a fixed regex workload with lookbehind, the same
 * cost driver as this package, but independent of its code. Comparing its
 * runtime against the value recorded with the baseline tells us how much
 * slower or faster the current machine (and Node version) is, so the 1.5×
 * threshold stays meaningful across CI runners and developer machines.
 *
 * Plain indexOf-based calibration was not enough: Node 24's regex engine is
 * disproportionately slower than Node 26's, which undercorrected the limits.
 */
export async function runCalibration (): Promise<number> {
  // ~1 MB of prose-like text with rare apostrophes to find.
  const haystack = 'The_quick_brown_fox '.repeat(52_428) + " it's"
  const pattern = /(?<=[a-z])'(?!')/g
  const durations: number[] = []

  for (let i = 0; i < 9; i++) {
    const start = performance.now()
    let checksum = 0
    let match: RegExpExecArray | null

    while ((match = pattern.exec(haystack)) !== null) {
      checksum += match.index
    }

    durations.push(performance.now() - start)

    if (checksum < 0) console.log(checksum) // defeat dead-code elimination
  }

  return Math.min(...durations)
}

/** Relative threshold for PR checks. */
export const ALLOWED_REGRESSION_FACTOR = 1.5

/**
 * Baselines are recorded on one machine but checked on many. Scale the limit
 * by the ratio of current vs recorded calibration so the 1.5× rule measures
 * code regressions, not hardware differences.
 */
export function computeLimit (
  entry: { bestMs: number },
  calibrationReference: number,
  calibrationCurrent: number,
  floorMs = 0.15
): number {
  const ratio = calibrationCurrent / calibrationReference

  return Math.max(entry.bestMs * ALLOWED_REGRESSION_FACTOR * ratio, floorMs * ratio)
}

/**
 * Build a sample string of at least `targetBytes` bytes by repeating the
 * English sample text. Quotes, ellipses, apostrophes and whitespace issues
 * recur throughout, so every pass of the pipeline has work to do.
 */
function buildSample (targetBytes: number): string {
  const separator = ' '
  const unit = exampleEn + separator
  const unitBytes = Buffer.byteLength(unit)

  const repetitions = Math.max(1, Math.ceil(targetBytes / unitBytes))

  return unit.repeat(repetitions).trimEnd()
}

/**
 * Measure one asynchronous operation on one input.
 *
 * We report the best (fastest) run, not the median: GC pauses and scheduler
 * noise only ever add upward error, so the minimum is the most reproducible
 * estimate of actual cost. A real regression shifts the whole distribution
 * and shows up in the minimum too.
 */
async function measure (operation: (input: string) => Promise<string>, input: string): Promise<{ bestMs: number, output: string, input: string }> {
  for (let i = 0; i < WARMUP_RUNS; i++) {
    await operation(input)
  }

  const durations: number[] = []
  let output = ''

  for (let i = 0; i < MEASURED_RUNS; i++) {
    const start = performance.now()
    output = await operation(input)
    durations.push(performance.now() - start)
  }

  return { bestMs: Math.min(...durations), output, input }
}

/** Benchmark the full typographize() pipeline for one language across all sizes. */
export async function runPipelineBenchmark (language = 'en_US'): Promise<BenchResult[]> {
  const results: BenchResult[] = []

  for (const [label, targetBytes] of Object.entries(SIZE_LABELS)) {
    const input = buildSample(targetBytes)
    const Typographizer = new TypographizerJS(language)
    const { bestMs, output, input: lastInput } = await measure((str) => Typographizer.typographize(str), input)

    results.push({
      suite: `typographize:${language}`,
      label,
      bytes: Buffer.byteLength(input),
      bestMs,
      output,
      input: lastInput
    })
  }

  return results
}

/** Benchmark every public method individually at the method sizes. */
export async function runMethodBenchmark (): Promise<BenchResult[]> {
  const results: BenchResult[] = []

  for (const method of METHODS) {
    for (const label of METHOD_SIZE_LABELS) {
      const input = buildSample(SIZE_LABELS[label])
      const Typographizer = new TypographizerJS('en_US')
      const { bestMs, output, input: lastInput } = await measure((str) => Typographizer[method](str), input)

      results.push({
        suite: `method:${method}`,
        method,
        label,
        bytes: Buffer.byteLength(input),
        bestMs,
        output,
        input: lastInput
      })
    }
  }

  return results
}

/** Everything the baseline tracks: pipeline for all languages plus single methods. */
export async function runAllBenchmarks (): Promise<BenchResult[]> {
  // Sequential on purpose: concurrent suites compete for GC and inflate each
  // other's timings.
  const pipeline: BenchResult[] = []

  for (const language of LANGUAGES) {
    pipeline.push(...await runPipelineBenchmark(language))
  }

  return [...pipeline, ...await runMethodBenchmark()]
}
