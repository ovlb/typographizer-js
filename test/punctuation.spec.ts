import test from 'ava'
import TypographizerJS from '../source/index.ts'

import { airyPunctuation } from './__samples__/punctuation.ts'

let Typographizer: TypographizerJS
let replaced: string

test.beforeEach(async (_t) => {
  Typographizer = new TypographizerJS()
  replaced = await Typographizer.fixAiryPunctuation(airyPunctuation)
})

test('Remove spaces in front of punctuation', (t) => {
  t.is(replaced, 'I know that many people were taught to put two spaces between sentences. I was too. But these days, using two spaces is an obsolete habit. Some say the habit originated in the typewriter era. Oh; by the way, what time is it?')
})
