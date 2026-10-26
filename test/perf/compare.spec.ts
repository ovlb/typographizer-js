import test from 'ava'
import { evaluateComparison, runComparison } from './compare.ts'

test.serial('evaluateComparison() passes suites at or below the 1.5× factor', (t) => {
  const evaluation = evaluateComparison([
    { suite: 'typographize:en_US', label: '1 MB', ratio: 1.2, referenceMs: 3.5, currentMs: 4.2 }
  ])

  t.true(evaluation.ok)
  t.deepEqual(evaluation.failures, [])
})

test.serial('evaluateComparison() fails suites above the factor and names them', (t) => {
  const evaluation = evaluateComparison([
    { suite: 'typographize:en_US', label: '1 MB', ratio: 1.2, referenceMs: 3.5, currentMs: 4.2 },
    { suite: 'method:fixEllipsis', label: '1 MB', ratio: 2.1, referenceMs: 0.13, currentMs: 0.27 }
  ])

  t.false(evaluation.ok)
  t.is(evaluation.failures.length, 1)
  t.regex(evaluation.failures[0], /method:fixEllipsis/)
})

test.serial('evaluateComparison() ignores ratios on sub-0.1 ms measurements, where noise rules', (t) => {
  // 256 B pipeline runs in ~0.00 ms; a ratio of noise there is meaningless
  const evaluation = evaluateComparison([
    { suite: 'typographize:en_US', label: '256 B', ratio: 8, referenceMs: 0.004, currentMs: 0.032 }
  ])

  t.true(evaluation.ok)
})

test.serial('comparing identical code against itself reports no regressions', async (t) => {
  const evaluation = await runComparison(new URL('../..', import.meta.url).pathname)

  t.true(evaluation.ok, evaluation.failures.join('\n'))
})
