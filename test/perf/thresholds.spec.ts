import test from 'ava'
import { readFileSync } from 'node:fs'
import { runAllBenchmarks, type BenchResult } from './benchmark.ts'

const BASELINE_PATH = new URL('./baseline.json', import.meta.url)
const ALLOWED_REGRESSION_FACTOR = 1.5

/** Timings below ~0.1 ms are pure jitter; a relative limit alone would flake. */
const ABSOLUTE_FLOOR_MS = 0.15

interface Baseline {
  recordedAt: string
  entries: Array<{ suite: string, label: string, bytes: number, bestMs: number }>
}

function loadBaseline (): Baseline {
  return JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) as Baseline
}

// Benchmark tests must never overlap: concurrent runs compete for GC and
// inflate each other's timings.
test.serial('current implementation stays within 1.5× of recorded baseline (min 0.15 ms)', async (t) => {
  const baseline = loadBaseline()
  const current = await runAllBenchmarks()

  for (const result of current) {
    const entry = baseline.entries.find((candidate) =>
      candidate.suite === result.suite && candidate.bytes === result.bytes
    )

    t.truthy(entry, `baseline contains an entry for ${result.suite} at ${result.bytes} bytes`)

    if (!entry) continue

    const limit = Math.max(entry.bestMs * ALLOWED_REGRESSION_FACTOR, ABSOLUTE_FLOOR_MS)
    t.true(
      result.bestMs <= limit,
      `${result.suite} (${result.label}): ${result.bestMs.toFixed(2)} ms exceeds baseline ${entry.bestMs.toFixed(2)} ms × ${ALLOWED_REGRESSION_FACTOR} (limit ${limit.toFixed(2)} ms)`
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
