import test from 'ava'
import TypographizerJS from '../source'

let Typographizer

test.beforeEach(async (t) => {
  Typographizer = new TypographizerJS()
})

test('Default language is en', (t) => {
  const { language } = Typographizer.options

  t.is(language, 'en')
})

test('Can set language', (t) => {
  const TypographizerDE = new TypographizerJS({ language: 'de' })
  const { language } = TypographizerDE.options

  t.is(language, 'de')
})

test('Returns an error if an unsupported language is set', (t) => {
  const TypographizerNoSupport = new TypographizerJS({
    language: 'css'
  })

  t.true(TypographizerNoSupport instanceof Error)
})
