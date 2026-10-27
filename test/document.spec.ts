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

test('typographize handles documents that start or chain code segments', async (t) => {
  const Typographizer = new TypographizerJS()

  // Leading fence, adjacent fences, trailing fence: every prose slot that
  // String.split() fills with '' must stay empty and odd indexes stay code
  const leading = '```js\nconst a = "b";\n```\nProse "here".'
  t.is(await Typographizer.typographize(leading), '```js\nconst a = "b";\n```\nProse “here”.')

  const adjacent = '```js\nconst a = 1;\n```' + '```css\nbody { color: red }\n```\ntail "here".'
  t.is(await Typographizer.typographize(adjacent), '```js\nconst a = 1;\n```' + '```css\nbody { color: red }\n```\ntail “here”.')

  const trailing = 'Prose "here".\n```js\nconst a = 1;\n```'
  t.is(await Typographizer.typographize(trailing), 'Prose “here”.\n```js\nconst a = 1;\n```')
})

test('standalone methods also skip code segments', async (t) => {
  const Typographizer = new TypographizerJS()

  const str = 'Keep `this "quoted"...` intact and fix "that"...'
  t.is(await Typographizer.formatQuotes(str), 'Keep `this "quoted"...` intact and fix “that”...')
  t.is(await Typographizer.fixEllipsis(str), 'Keep `this "quoted"...` intact and fix "that"…')
  t.is(await Typographizer.fixApostroph(str), 'Keep `this "quoted"...` intact and fix "that"...')

  const html = '<p>Fix "this"…</p><code>skip "this"...</code>'
  t.is(await Typographizer.formatQuotes(html), '<p>Fix “this”…</p><code>skip "this"...</code>')
})

test('typographize keeps its plain-string behavior when no code segments exist', async (t) => {
  const Typographizer = new TypographizerJS()
  const replaced = await Typographizer.typographize(html)

  // The html sample contains no code segments, quotes were already
  // typographically correct, so nothing may change
  t.is(replaced, html)
})
