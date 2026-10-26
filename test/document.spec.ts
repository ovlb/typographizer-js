import test from 'ava'
import TypographizerJS from '../source/index.ts'

import markdown, { wellFormattedMarkdown } from './__samples__/markdown.ts'
import renderedHtml, { wellFormattedRenderedHtml } from './__samples__/renderedHtml.ts'
import html from './__samples__/html.ts'

test('typographize skips fenced code blocks and inline code in Markdown', async (t) => {
  const Typographizer = new TypographizerJS()
  const replaced = await Typographizer.typographize(markdown)

  t.is(replaced, wellFormattedMarkdown)
})

test('typographize skips <pre> and <code> elements in rendered HTML', async (t) => {
  const Typographizer = new TypographizerJS()
  const replaced = await Typographizer.typographize(renderedHtml)

  t.is(replaced, wellFormattedRenderedHtml)
})

test('typographize preserves the document structure around code segments', async (t) => {
  const Typographizer = new TypographizerJS()
  const replaced = await Typographizer.typographize(markdown)

  // Whitespace must not be collapsed or trimmed: hard line breaks and the
  // blank lines around the fenced block have to survive
  t.true(replaced.endsWith('\n'))
  t.true(replaced.includes('\n\n```js\n'))
})

test('typographize keeps its plain-string behavior when no code segments exist', async (t) => {
  const Typographizer = new TypographizerJS()
  const replaced = await Typographizer.typographize(html)

  // The html sample contains no code segments, quotes were already
  // typographically correct, so nothing may change
  t.is(replaced, html)
})
