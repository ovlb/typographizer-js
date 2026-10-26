import test from 'ava'
import TypographizerJS from '../../source/index.ts'

let Typographizer: TypographizerJS

test.beforeEach(() => {
  Typographizer = new TypographizerJS('fr')
})

test('preserves white space around punctuation', async (t) => {
  const formatted = await Typographizer.typographize('Je t’aime ; m’aimes-tu ?')

  t.is(formatted, 'Je t’aime ; m’aimes-tu ?')
})