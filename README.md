<img width="240" height="240" src="https://raw.githubusercontent.com/ovlb/typographizer-js/main/img/logo-8c.png" alt="Logo of Typographizer JS">

# TypographizerJS

<!-- Shortcode definitions at the bottom of the file -->

[![Published version][npm-img]][npm-url]
[![Build Status][ci-img]][ci-url]

Typographizer automates ~~everything~~ some things you don’t want (or need) to know about typography.

---

## Acknowledgement

The JS version is inspired by the [Typographizer](https://github.com/frankrausch/Typographizer) by [Frank Rausch](https://frankrausch.com/ "Homepage of Frank Rausch"), written in Swift. 🙇‍

## Usage

### Here be dragons 🐉

This package uses RegExp lookbehinds. These are supported in evergreen browsers and Node ≥ 16 (out of the box).

You can use this in the browser, but know what you’re signing up for: formatting and reinserting long strings costs time. Measured numbers live in the [Performance](#performance) section below.

In general, this is more of a fun project. So, use with caution.

### Installation

```bash
npm install typographizer-js
```

Import the bundle into your project:

```js
// ESM
import TypographizerJS from 'typographizer-js'

// CommonJS
const TypographizerJS = require('typographizer-js')
```

TypeScript types ship with the package.

And crate a new instance:

```js
const Typographizer = new TypographizerJS()
```

Note: `typographize()` is safe to use on Markdown documents and rendered HTML. Inline HTML tags (a, strong, em) are preserved, and code samples are skipped: fenced code blocks (``` and ~~~), inline code spans (`…`), as well as `<pre>` and `<code>` elements are left untouched. Everything outside of code segments gets the usual fixes. When code segments are present, whitespace is neither trimmed nor collapsed, so the document structure stays intact.

Once you have your Typographizer instance available you can format strings using the `typographize()` method.

`typographize` returns a Promise. So you need to either await the return value or use `.then()`.

```js
const str = `I introduced myself, "Hi, I'm Oscar".`

/**
 * Using await
 */
const formatted = await Typographizer.typographize(str)

console.log(formatted)
// I introduced myself, “Hi, I’m Oscar“.

/**
 * Using .then()
 */
Typographizer.typographize(str)
  .then((str) => {
    console.log(str)
    // I introduced myself, “Hi, I’m Oscar“.
  })
```

Typographizer uses a bunch of different methods under the hood. All of them can be called on their own and skip code segments as well — with the exception of `trimWhitespace()`, which operates on the whole string by definition. For details, take a look at the API section below.

### Options

By default quotes will be formatted to match `en_US` style. If you need different formatting, pass a language code while initializing.

```js
const Typographizer = new TypographizerJS('fr')
```

You can find a list of supported languages further down this file.

⚠️ To avoid side effects and confusion, It is **not** possible to change these options after you created your instance. If you want to format text in multiple languages, you need to create multiple instances.

## API

All these methods return Promises. Usage instructions for `typographize` usage apply.

### Methods

| Method | Description |
| --- | --- |
| fixApostroph(str) | Replace ', ´ and ` used as an apostroph
| fixEllipsis(str) | Formats all occurences of ... to use the correct … character
| fixAiryPunctuation(str) | Finds punctuation that is surrounded by whitespace
| formatQuotes(str) | Format quotes, but not whitespace or apostrophes
| formatOpeningQuotes(str) | Format all opening quotes
| formatClosingQuotes(str) | Format all closing quotes
| trimWhitespace(str) | Remove whitespace from the beginning and end of a string, replaces multiple spaces with a single one
| typographize(str) | Takes a string and applies all optimizations |

## Performance

The benchmark measures

- the full `typographize()` pipeline for English and non-English languages (`en_US`, `de`, `fr`, `pl`) at 256 B, 1 KB, 10 KB, 100 KB and 1 MB, and
- every public method individually at 10 KB, 100 KB and 1 MB.

Each measurement is the **best of 27 runs** after 5 warmups: GC pauses and scheduler noise only ever add upward error, so the minimum is the most reproducible estimate of actual cost.

Every pull request is gated by an **A/B comparison against `main`**: the benchmark runs both checkouts back-to-back on the same machine, interleaved per suite so both sides share the same noise window, and fails when any suite is more than **1.5× slower than `main`**. Hardware and load differences cancel out this way — absolute thresholds were tried first and proved unreliable: they break across machines, across CI runners (whose timing varies up to 4× run to run) and on your own machine the moment something else eats CPU.

Latest numbers (2026-10-26, Node v26.12.1, Apple M5, macOS 26 — absolute values vary with the machine, the 1.5× ratio is what gets enforced):

Full pipeline (`typographize()`), best run in ms:

| Size | en_US | de | fr | pl |
| --- | --- | --- | --- | --- |
| 256 B | 0.00 | 0.00 | 0.00 | 0.01 |
| 1 KB | 0.01 | 0.01 | 0.00 | 0.01 |
| 10 KB | 0.04 | 0.04 | 0.04 | 0.04 |
| 100 KB | 0.35 | 0.36 | 0.30 | 0.36 |
| 1 MB | 3.56 | 3.60 | 3.01 | 3.59 |

Single methods (en_US), best run in ms:

| Method | 10 KB | 100 KB | 1 MB |
| --- | --- | --- | --- |
| trimWhitespace | 0.00 | 0.02 | 0.24 |
| formatQuotes | 0.02 | 0.20 | 2.02 |
| formatOpeningQuotes | 0.01 | 0.10 | 0.95 |
| formatClosingQuotes | 0.01 | 0.09 | 0.91 |
| fixApostroph | 0.00 | 0.02 | 0.20 |
| fixEllipsis | 0.00 | 0.01 | 0.13 |
| fixAiryPunctuation | 0.01 | 0.07 | 0.69 |

To run the benchmark yourself:

```bash
npm run bench             # print absolute numbers (reporting only)
npm run bench:compare     # A/B against main; creates a temporary worktree
npm run bench:compare -- path/to/other-checkout  # A/B against any checkout
```

## Supported languages

Language support has been ported from the original Typographizer.

Supported languages are:

| Language | Shortcode |
| --- | --- |
| Bosnian | bs |
| Czech | cz |
| Danish | da |
| Dutch, Flemish | nl |
| British English | en_GB |
| American English (default) | en_US |
| Estonian | es |
| Finnish | fi |
| French | fr |
| German | de |
| German (Suisse) | de_CH |
| German (Liechtenstein) | de_LI |
| Hungarian | hu |
| Icelandic | is |
| Lithuanian | lt |
| Latvian | lv |
| Polish | pl |
| Romanian | ro |
| Slovak | sk |
| Slovenian | sl |
| Swedish | sw |

This list is missing Japanese and Hebrew, which are supported by Typographizer. Hebrew is missing due to complicated support. Japanese requires extended Unicode checks.

<!-- Badges shortcodes -->
[npm-img]: https://img.shields.io/npm/v/typographizer-js.svg?style=flat
[npm-url]: https://www.npmjs.com/package/typographizer-js

[ci-url]: https://github.com/ovlb/typographizer-js/actions/workflows/ci.yml
[ci-img]: https://github.com/ovlb/typographizer-js/actions/workflows/ci.yml/badge.svg
