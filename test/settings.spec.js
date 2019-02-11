import test from 'ava'
import TypographizerJS from '../source'

let Typographizer

test.beforeEach(async (t) => {
  Typographizer = new TypographizerJS()
})

test('Default language is en', (t) => {
  const { code } = Typographizer.language

  t.is(code, 'en')
})

test('Can set language', (t) => {
  const TypographizerDE = new TypographizerJS('de')
  const { language } = TypographizerDE

  t.is(language.code, 'de')
})

test('Returns an error if an unsupported language is set', (t) => {
  const TypographizerNoSupport = new TypographizerJS({
    language: 'css'
  })

  t.true(TypographizerNoSupport instanceof Error)
})
