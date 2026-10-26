import test from 'ava'
import { readFileSync } from 'node:fs'
import { computeLimit, runAllBenchmarks, runCalibration, type BenchResult } from './benchmark.ts'

const BASELINE_PATH = new URL('./baseline.json', import.meta.url)

interface Baseline {
  recordedAt: string
  node: string
  calibrationMs: number
  entries: Array<{ suite: string, label: string, bytes: number, bestMs: number }>
}

function loadBaseline (): Baseline {
  return JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) as Baseline
}

// Benchmark tests must never overlap: concurrent runs compete for GC and
// inflate each other's timings.
test.serial('current implementation stays within 1.5× of the machine-normalized baseline', async (t) => {
  const baseline = loadBaseline()
  const current = await runAllBenchmarks()
  const calibrationCurrent = await runCalibration()

  for (const result of current) {
    const entry = baseline.entries.find((candidate) =>
      candidate.suite === result.suite && candidate.bytes === result.bytes
    )

    t.truthy(entry, `baseline contains an entry for ${result.suite} at ${result.bytes} bytes`)

    if (!entry) continue

    const limit = computeLimit(entry, baseline.calibrationMs, calibrationCurrent)
    t.true(
      result.bestMs <= limit,
      `${result.suite} (${result.label}): ${result.bestMs.toFixed(2)} ms exceeds machine-normalized limit ${limit.toFixed(2)} ms (baseline ${entry.bestMs.toFixed(2)} ms, calibration ${baseline.calibrationMs.toFixed(2)} → ${calibrationCurrent.toFixed(2)})`
    )
  }
})

test.serial('baseline covers every measured suite', async (t) => {
  const baseline = loadBaseline()
  const current = await runAllBenchmarks()
  const covered = new Set(baseline.entries.map((entry) => entry.suite))
  const expected = new Set<string>(current.map((result: BenchResult) => result.suite))

  t.deepEqual([...covered].sort(), [...expected].sort())
})
