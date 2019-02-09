# typographizer-js

Take your unformatted text and turn it into something that makes your typographer friends happy.

---

## Acknowledgement

The JS version is inspired by the [Typographizer](https://github.com/frankrausch/Typographizer) by [Frank Rausch](https://frankrausch.com/ "Homepage of Frank Rausch"), written in Swift.

🙇‍

## Installation

```bash
npm install typographizer-js
```

If you are using Yarn:

```bash
yarn add typographizer-js
```

## Usage

Import the bundle into your project:

```js
import TypographizerJS from 'typographizer-js'
```

And crate a new instance:

```js
const Typographizer = new TypographizerJS()
```

Note: Typographizer will preserve inline HTML Tags (a, strong, em), but should not be used to format large bunches of source code.

Once you have your Typographizer available you can format strings using the `typographize()` method.

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

Typographizer uses a bunch of different methods under the hood. All of them can be called on their own. For details, take a look at the API section below.

### Options

Typographizer accepts an options object. You can specify this during initialization.

```js
const Typographizer = new TypographizerJS({
  language: 'de'
})
```

You can find a list of supported languages further down this file.

To avoid side effects and confusion, It is **not** possible to change these options after you created your instance. If you want to format text in multiple languages, you need to create multiple instances.

## API

While the

### Methods

| Method | Description |
| --- | --- |
| typographize(str) | Takes a string and applies all optimizations |
| replaceQuotes(str) | Format quotes, but not whitespace or apostrophes
| replaceOpeningQuotes(str) | Format all opening quotes
| replaceClosingQuotes(str) | Format all closing quotes
| fixApostroph(str) | Replace ', ´ and ` used as an apostroph
| trimWhitespace(str) | Remove whitespace from the beginning and end of a string, replaces multiple spaces with a single one

## Supported languages

Language support has been ported from the original Typographizer.

Supported languages are:

| Language | Shortcode |
| --- | --- |
| Bosnian | bs |
| Czech | cz |
| Danish | da |
| Dutch, Flemish | nl |
| English (default) | en |
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

This list is missing Japanese and Hebrew, which are supported by Typographizer. Hebrew is missing due to complicated support and Japanese will be added once I can confirm that TypographizerJS does not break its formatting.