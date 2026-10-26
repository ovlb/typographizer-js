import test from 'ava'
import TypographizerJS from '../source/index.js'

import exampleEn from './__samples__/en.js'

let Typographizer
let replaced

test.beforeEach(async (t) => {
  Typographizer = new TypographizerJS()
  replaced = await Typographizer.fixApostroph(exampleEn)
})

test('Replace straight apostroph', (t) => {
  t.plan(2)
  t.false(replaced.includes(`wasn't`))
  t.false(replaced.includes(`It's`))
})

// The accent aigu is a diacritical sign and should, in western languages, not stand on its own
test('Remove ´', (t) => {
  t.false(replaced.includes('´'))
})
