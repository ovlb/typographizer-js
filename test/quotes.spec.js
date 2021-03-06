import test from 'ava'
import TypographizerJS from '../source'

import exampleEn from './__samples__/en'
import footInch from './__samples__/foot-inch'
import html from './__samples__/html'

let Typographizer
let replaced

test.beforeEach(async (t) => {
  Typographizer = new TypographizerJS('en_US')
  replaced = await Typographizer.formatQuotes(exampleEn)
})

test('Remove ` "`', (t) => {
  t.false(replaced.includes(' "'))
})

test('Remove `" `', (t) => {
  t.false(replaced.includes('" '))
})

test('Remove `"` at beginning of string.', (t) => {
  t.false(replaced.startsWith('"'))
})

test('Remove `"` at end of string.', (t) => {
  t.false(replaced.endsWith('"'))
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

test('Do not format foot and inch', async (t) => {
  const TypographizerFootInch = new TypographizerJS('en_US')
  const replaced = await TypographizerFootInch.formatQuotes(footInch)

  t.true(replaced.includes(`6' 10".`))
})

test('Preserve nested opening quotes', (t) => {
  t.true(replaced.includes('“‘Let'))
})

test('Preserve nested closing quote', (t) => {
  t.true(replaced.includes(`’”`))
})

test('Preserve HTML tags', async (t) => {
  replaced = await Typographizer.formatQuotes(html)

  t.is(replaced, html)
})
