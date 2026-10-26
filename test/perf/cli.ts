#!/usr/bin/env node
/**
 * Benchmark CLI.
 *
 * `node test/perf/cli.ts` prints the current benchmark results.
 * `node test/perf/cli.ts --update` additionally overwrites test/perf/baseline.json.
 */
import { writeFileSync } from 'node:fs'
import { runAllBenchmarks } from './benchmark.ts'

const updateBaseline = process.argv.includes('--update')
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

if (updateBaseline) {
  const baseline = {
    recordedAt: new Date().toISOString(),
    node: process.version,
    entries: results.map(({ suite, label, bytes, bestMs }) => ({
      suite,
      label,
      bytes,
      bestMs: Number(bestMs.toFixed(4))
    }))
  }

  writeFileSync(new URL('./baseline.json', import.meta.url), `${JSON.stringify(baseline, null, 2)}\n`)
  console.log('\nbaseline.json updated')
}
