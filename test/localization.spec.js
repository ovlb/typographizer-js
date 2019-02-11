import test from 'ava'
import TypographizerJS from '../source'

test('set english quotes as default', (t) => {
  const Typographizer = new TypographizerJS()
  t.deepEqual(Typographizer.quotes, {
    openingDouble: '“',
    closingDouble: '”',
    openingSingle: '‘',
    closingSingle: '’'
  })
})
