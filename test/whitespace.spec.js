import test, { beforeEach } from 'ava'
import TypographizerJS from '../source'

import example from './__samples__/whitespace'

let Typographizer
let replaced

beforeEach(async () => {
  Typographizer = new TypographizerJS()
  replaced = await Typographizer.trimWhitespace(example)
})

test('Remove whitespace at the beginning of string', (t) => {
  const firstToken = replaced.slice(0, 1)

  t.false(firstToken === ' ')
})

test('Remove whitespace at the end of string', (t) => {
  const lastToken = replaced.slice(-1)

  t.false(lastToken === ' ')
})

test('Remove multiple spaces inside string', (t) => {
  t.false(replaced.includes('   '))
})

test('Don’t format other properties', (t) => {
  t.true(replaced.includes(`it's`))
})
