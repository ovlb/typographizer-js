import test from 'ava'
import TypographizerJS from '../../source'
import quotesets from '../../source/data/quotesets'

test('set english quotes as default', (t) => {
  const Typographizer = new TypographizerJS()
  t.is(Typographizer.quotes, quotesets[0])
})

test('set correct quotes for french (set 1)', (t) => {
  const Typographizer = new TypographizerJS('fr')

  t.is(Typographizer.quotes, quotesets[1])
})

test('set correct quotes for icelandic (set 2)', (t) => {
  const Typographizer = new TypographizerJS('is')

  t.is(Typographizer.quotes, quotesets[2])
})

test('set correct quotes for suisse (set 3)', (t) => {
  const Typographizer = new TypographizerJS('de_CH')

  t.is(Typographizer.quotes, quotesets[3])
})

test('set correct quotes for bosnian (set 4)', (t) => {
  const Typographizer = new TypographizerJS('bs')

  t.is(Typographizer.quotes, quotesets[4])
})

test('set correct quotes for polnish (set 5)', (t) => {
  const Typographizer = new TypographizerJS('pl')

  t.is(Typographizer.quotes, quotesets[5])
})

test('set correct code for norwegian (set 6)', (t) => {
  const Typographizer = new TypographizerJS('no')

  t.is(Typographizer.quotes, quotesets[6])
})
