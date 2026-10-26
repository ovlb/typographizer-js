import test from 'ava'
import { computeLimit, runCalibration } from './benchmark.ts'

const ENTRY = { bestMs: 1 }

test.serial('calibration ratio of 1 keeps the plain 1.5× limit', (t) => {
  t.is(computeLimit(ENTRY, 10, 10), 1.5)
})

test.serial('calibration ratio scales the limit with machine speed', (t) => {
  // CI runner ~4× slower than the machine the baseline was recorded on
  t.is(computeLimit(ENTRY, 10, 40), 6)
  t.is(computeLimit(ENTRY, 40, 10), 1.5 * (10 / 40))
})

test.serial('absolute floor scales with the calibration ratio too', (t) => {
  // baseline entry below the floor: plain limit would be floored to 0.15
  const tiny = { bestMs: 0.05 }

  t.is(computeLimit(tiny, 10, 10), 0.15)
  t.is(computeLimit(tiny, 10, 40), 0.6)
})

test.serial('calibration is repeatable within tight bounds', async (t) => {
  const first = await runCalibration()
  const second = await runCalibration()

  t.true(first > 0)
  t.true(Math.max(first, second) / Math.min(first, second) < 1.5, `calibration varied too much: ${first.toFixed(2)} vs ${second.toFixed(2)}`)
})
