import test from 'ava'
import TypographizerJS from '../source'

import example from './__samples__/ellipsis'

let Typographizer
let replaced

test.beforeEach(async (t) => {
  Typographizer = new TypographizerJS()
  replaced = await Typographizer.fixEllipsis(example)
})

test('Remove ...', (t) => {
  t.false(replaced.includes('...'))
})

test('Only formats ...', (t) => {
  t.plan(2)
  t.true(replaced.includes(`"That's`))
  t.true(replaced.includes(`that's splendid."`))
})
