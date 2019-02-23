import test from 'ava'
import TypographizerJS from '../source'

import exampleEn from './__samples__/en'

test('EN', async (t) => {
  const Typographizer = new TypographizerJS()
  const replaced = await Typographizer.typographize(exampleEn)

  const wellFormatted = `“Hi”, he said … while running away. Maybe it wasn’t running, maybe it was more like gliding. “It’s a beautiful day out in the country.” He’d been right. Wouldn’t it be just another day full of running away. I looked around and gave a nod to the pink elephant, “Hi. ‘What a time to be alive’, the once alive philosopher said. And died.” The pink elephant gave me a stern look. “‘Let it be.’, to quote Paul McCartney. I started responding “Well, to quote you ‘Let it …’”, I stopped. The world was upside down. I began to run and said: “Good bye!”`

  t.is(replaced, wellFormatted)
})
