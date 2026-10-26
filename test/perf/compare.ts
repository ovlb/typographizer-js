import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import TypographizerJS from '../../source/index.ts'
import {
  LANGUAGES,
  METHOD_SIZE_LABELS,
  METHODS,
  SIZE_LABELS,
  buildSample
} from './benchmark.ts'

export interface ComparisonRow {
  suite: string
  label: string
  /** current best / reference best; undefined when skipped */
  ratio?: number
  referenceMs: number
  currentMs: number
}

export interface ComparisonEvaluation {
  ok: boolean
  failures: string[]
  rows: ComparisonRow[]
}

type AnyMethod = (input: string) => Promise<string>
type TypographizerSide = { typographize (input: string): Promise<string> } & Record<string, AnyMethod>

const ROUND_BATCH_RUNS = 7
const ROUNDS = 3

/** Measurements below this reference time are noise; their ratio is meaningless. */
const MIN_REFERENCE_MS = 0.1

/** PR gate: a suite may not exceed this factor of its main counterpart. */
export const FACTOR = 1.5

export function evaluateComparison (
  rows: Array<{ suite: string, label: string, ratio?: number, referenceMs: number, currentMs: number }>,
  factor = FACTOR,
  minReferenceMs = MIN_REFERENCE_MS
): ComparisonEvaluation {
  const failures: string[] = []

  for (const row of rows) {
    if (row.referenceMs < minReferenceMs) continue

    if ((row.ratio ?? 1) > factor) {
      failures.push(
        `${row.suite} (${row.label}): ${row.currentMs.toFixed(2)} ms is ${(row.ratio ?? 0).toFixed(2)}× the reference ${row.referenceMs.toFixed(2)} ms (limit ${factor}×)`
      )
    }
  }

  return { ok: failures.length === 0, failures, rows }
}

function fastestBatch (operation: AnyMethod, input: string, runs: number): number {
  const durations: number[] = []

  for (let i = 0; i < runs; i++) {
    const start = performance.now()
    void operation(input)
    durations.push(performance.now() - start)
  }

  return Math.min(...durations)
}

async function compareSuite (
  suite: string,
  method: string | undefined,
  language: string,
  targetBytes: number,
  label: string,
  createReferenceSide: (language: string) => TypographizerSide
): Promise<ComparisonRow> {
  const currentSide = new TypographizerJS(language) as unknown as TypographizerSide
  const referenceSide = createReferenceSide(language)
  const input = buildSample(targetBytes)
  const currentOperation = method ? (str: string) => currentSide[method](str) : (str: string) => currentSide.typographize(str)
  const referenceOperation = method ? (str: string) => referenceSide[method](str) : (str: string) => referenceSide.typographize(str)

  // Warm both sides so JIT state is comparable before measuring.
  await currentOperation(input)
  await referenceOperation(input)

  // Alternate which side runs first per round so both share the same
  // host-noise windows. Fixed ordering biases the result: whichever batch
  // runs right after the other side's allocations eats the GC pause.
  let currentMs = Infinity
  let referenceMs = Infinity

  for (let round = 0; round < ROUNDS; round++) {
    if (round % 2 === 0) {
      currentMs = Math.min(currentMs, await fastestBatch(currentOperation, input, ROUND_BATCH_RUNS))
      referenceMs = Math.min(referenceMs, await fastestBatch(referenceOperation, input, ROUND_BATCH_RUNS))
    } else {
      referenceMs = Math.min(referenceMs, await fastestBatch(referenceOperation, input, ROUND_BATCH_RUNS))
      currentMs = Math.min(currentMs, await fastestBatch(currentOperation, input, ROUND_BATCH_RUNS))
    }
  }

  return {
    suite,
    label,
    referenceMs,
    currentMs,
    ratio: referenceMs >= MIN_REFERENCE_MS ? currentMs / referenceMs : undefined
  }
}

/**
 * Compare the current checkout against another checkout (usually `main`)
 * back-to-back on the same machine, interleaved per suite. Hardware and
 * host-noise differences cancel out, which makes a strict factor meaningful
 * even on shared CI runners where absolute wall-clock thresholds are not.
 */
export async function runComparison (referenceDirectory: string): Promise<ComparisonEvaluation> {
  const referenceModule = await import(pathToFileURL(resolve(referenceDirectory, 'source/index.ts')).href) as {
    default: new (language?: string) => TypographizerSide
  }

  const rows: ComparisonRow[] = []

  for (const language of LANGUAGES) {
    for (const [label, targetBytes] of Object.entries(SIZE_LABELS)) {
      rows.push(await compareSuite(
        `typographize:${language}`,
        undefined,
        language,
        targetBytes,
        label,
        (sideLanguage) => new referenceModule.default(sideLanguage)
      ))
    }
  }

  for (const method of METHODS) {
    for (const label of METHOD_SIZE_LABELS) {
      rows.push(await compareSuite(
        `method:${method}`,
        method,
        'en_US',
        SIZE_LABELS[label],
        label,
        (sideLanguage) => new referenceModule.default(sideLanguage)
      ))
    }
  }

  return evaluateComparison(rows)
}
