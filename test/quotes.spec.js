import test from 'ava'
import TypographizerJS from '../source'

import exampleEn from './__samples__/en'

let Typographizer
let replaced

test.beforeEach(async (t) => {
  Typographizer = new TypographizerJS()
  replaced = await Typographizer.formatQuotes(exampleEn)
})

test('Remove ` "`', (t) => {
  t.false(replaced.includes(' "'))
})

test('Remove `" `', (t) => {
  t.false(replaced.includes('" '))
})

test('Remove `"` at beginning of string.', (t) => {
  t.false(replaced.slice(0, 1) === '"')
})

test('Remove `"` at end of string.', (t) => {
  t.false(replaced.slice(-1) === '"')
})

test('Remove ` \'`', (t) => {
  t.false(replaced.includes(` '`))
})

test('Remove `\',`', (t) => {
  t.false(replaced.includes(`',`))
})

test('Do not fix apostrophes', (t) => {
  t.true(replaced.includes(`It's`))
})

test('Do not remove whitespace', (t) => {
  t.true(replaced.includes('  '))
})

test('Preserve nested opening quotes', (t) => {
  t.true(replaced.includes('“‘Let'))
})

test('Preserve nested closing quote', (t) => {
  t.true(replaced.includes(`’”`))
})
