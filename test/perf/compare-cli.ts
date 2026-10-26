#!/usr/bin/env node
/**
 * A/B performance comparison, the PR performance gate.
 *
 * Usage: node test/perf/compare-cli.ts [<path-to-reference-checkout>]
 *
 * With a path: compare against that checkout (usually a checkout of `main`).
 * Without: temporarily create a git worktree of `main` for the comparison.
 *
 * Benchmarks the current checkout against the reference back-to-back on the
 * same machine, interleaved per suite, and exits non-zero when any suite is
 * more than 1.5× slower than the reference. Hardware and host noise cancel
 * out, which is why this — unlike absolute baselines — works reliably on
 * shared CI runners, other machines, and under background load.
 */
import { execSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { FACTOR, runComparison } from './compare.ts'

const referenceDirectory = process.argv[2]
let worktreeToRemove: string | undefined

if (!referenceDirectory) {
  worktreeToRemove = mkdtempSync(join(tmpdir(), 'typographizer-reference-'))
  execSync(`git worktree add --detach ${JSON.stringify(worktreeToRemove)} main`, { stdio: 'pipe' })
  console.log('comparing against a temporary worktree of main\n')
}

const reference = referenceDirectory ?? worktreeToRemove!

try {
  const evaluation = await runComparison(reference)

  const suiteWidth = Math.max(...evaluation.rows.map((row) => row.suite.length))
  const labelWidth = Math.max(...evaluation.rows.map((row) => row.label.length))

  for (const { suite, label, referenceMs, currentMs, ratio } of evaluation.rows) {
    const ratioText = ratio === undefined ? 'skip' : `${ratio.toFixed(2)}×`
    console.log(`${suite.padEnd(suiteWidth)}  ${label.padEnd(labelWidth)}  ref ${referenceMs.toFixed(3)} ms  current ${currentMs.toFixed(3)} ms  ${ratioText}`)
  }

  if (!evaluation.ok) {
    console.error(`\nperformance regression detected (limit ${FACTOR}×):\n${evaluation.failures.join('\n')}`)
    process.exit(1)
  }

  console.log(`\nno performance regressions (limit ${FACTOR}×)`)
} finally {
  if (worktreeToRemove) {
    execSync(`git worktree remove --force ${JSON.stringify(worktreeToRemove)}`, { stdio: 'pipe' })
  }
}
