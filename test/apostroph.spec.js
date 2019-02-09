import test from 'ava'
import TypographizerJS from '../source'

import exampleEn from './__samples__/en'

let Typographizer
let replaced

test.beforeEach(async (t) => {
  Typographizer = new TypographizerJS()
  replaced = await Typographizer.fixApostroph(exampleEn)
})

// The accent aigu is a diacritical sign and should, in western languages, not stand on its own
test('Remove ´', (t) => {
  t.false(replaced.includes('´'))
})
