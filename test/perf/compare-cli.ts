#!/usr/bin/env node
/**
 * A/B performance comparison CLI, used as the PR performance gate in CI.
 *
 * Usage: node test/perf/compare-cli.ts <path-to-reference-checkout>
 *
 * Benchmarks the current checkout against the reference checkout (usually
 * `main`) back-to-back on the same machine, interleaved per suite, and
 * exits non-zero when any suite is more than 1.5× slower than the reference.
 */
import { runComparison } from './compare.ts'

const referenceDirectory = process.argv[2]

if (!referenceDirectory) {
  console.error('usage: node test/perf/compare-cli.ts <path-to-reference-checkout>')
  process.exit(1)
}

const evaluation = await runComparison(referenceDirectory)

const suiteWidth = Math.max(...evaluation.rows.map((row) => row.suite.length))
const labelWidth = Math.max(...evaluation.rows.map((row) => row.label.length))

for (const { suite, label, referenceMs, currentMs, ratio } of evaluation.rows) {
  const ratioText = ratio === undefined ? 'skip' : `${ratio.toFixed(2)}×`
  console.log(`${suite.padEnd(suiteWidth)}  ${label.padEnd(labelWidth)}  ref ${referenceMs.toFixed(3)} ms  current ${currentMs.toFixed(3)} ms  ${ratioText}`)
}

if (!evaluation.ok) {
  console.error(`\nperformance regression detected:\n${evaluation.failures.join('\n')}`)
  process.exit(1)
}

console.log('\nno performance regressions')
