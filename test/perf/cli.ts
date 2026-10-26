#!/usr/bin/env node
/**
 * Benchmark CLI. `npm run bench` prints current absolute numbers.
 * These are for reporting only — the gate is the A/B comparison
 * (npm run bench:compare), which is robust to machine and load differences.
 */
import { runAllBenchmarks } from './benchmark.ts'

const results = await runAllBenchmarks()

const labelWidth = 'size'.length
const bytesWidth = 'bytes'.length
const suites = [...new Set(results.map((result) => result.suite))]

for (const suite of suites) {
  const rows = results.filter((result) => result.suite === suite)

  console.log(`\n${suite}`)
  console.log(`${'size'.padEnd(labelWidth)}  ${'bytes'.padStart(bytesWidth)}  best ms`)

  for (const { label, bytes, bestMs } of rows) {
    console.log(`${label.padEnd(labelWidth)}  ${String(bytes).padStart(bytesWidth)}  ${bestMs.toFixed(2)}`)
  }
}
