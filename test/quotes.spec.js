import test from 'ava'
import TypographizerJS from '../source'

import exampleEn from './__samples__/en'

let Typographizer
let replaced

test.beforeEach(async (t) => {
  Typographizer = new TypographizerJS()
  replaced = await Typographizer.typographize(exampleEn)
})

test('Remove ` "`', (t) => {
  t.false(replaced.includes(' "'))
})

test.skip('Remove `" `', (t) => {
  t.false(replaced.includes('" '))
})

test('Quotes - Remove `"` at beginning of string.', (t) => {
  t.false(replaced.slice(0, 1) === '"')
})

test.skip('Quotes - Remove `"` at end of string.', (t) => {
  t.false(replaced.slice(-1) === '"')
})

// The accent aigu is a diacritical sign and should, in western languages, not stand on its own
test('Remove ´', (t) => {
  t.false(replaced.includes('´'))
})

test('replaceOpeningQuotes does not fix apostrophes', async (t) => {
  replaced = await Typographizer.replaceOpeningQuotes(exampleEn)

  t.true(replaced.includes(`It's`))
})

test('replaceOpeningQuotes preserves nested quotes', async (t) => {
  replaced = await Typographizer.replaceOpeningQuotes(exampleEn)

  t.true(replaced.includes('“‘Let'))
})
