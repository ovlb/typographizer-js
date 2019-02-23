<img width="240" height="240" src="https://raw.githubusercontent.com/ovlb/typographizer-js/master/img/logo-8c.png" alt="Logo of Typographizer JS">

# TypographizerJS


<!-- Shortcode definitions at the bottom of the file -->

[![Published version][npm-img]][npm-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Build Status][travis-img]][travis-url]
[![Dependency Status][depstat-image]][depstat-url]
[![Dev Dependency Status][devdepstat-image]][devdepstat-url]
[![Greenkeeper badge][greenkeeper-img]][greenkeeper-url]


Typographizer automates ~~everything~~ some things you don’t want (or need) to know about typography.

---

## Acknowledgement

The JS version is inspired by the [Typographizer](https://github.com/frankrausch/Typographizer) by [Frank Rausch](https://frankrausch.com/ "Homepage of Frank Rausch"), written in Swift. 🙇‍


## Usage

### Here be dragons 🐉

This package uses RegExp lookbehinds. These are not universally supported. You can use it in Node >=6.4 with enabled `--harmony` flag, without a flag in Node >=9.11.

You should not use this in the browser (probably). Formatting and reinserting long strings is a mayor performance hit.

In general, this is more of a fun project. So, use with caution.

### Installation

```bash
npm install typographizer-js
```

If you are using Yarn:

```bash
yarn add typographizer-js
```

Import the bundle into your project:

```js
const TypographizerJS = require('typographizer-js')
```

And crate a new instance:

```js
const Typographizer = new TypographizerJS()
```

Note: Typographizer will preserve inline HTML Tags (a, strong, em), but should not be used to format large bunches of source code.

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

Typographizer uses a bunch of different methods under the hood. All of them can be called on their own. For details, take a look at the API section below.

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
| formatQuotes(str) | Format quotes, but not whitespace or apostrophes
| formatOpeningQuotes(str) | Format all opening quotes
| formatClosingQuotes(str) | Format all closing quotes
| trimWhitespace(str) | Remove whitespace from the beginning and end of a string, replaces multiple spaces with a single one
| typographize(str) | Takes a string and applies all optimizations |

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

This list is missing Japanese and Hebrew, which are supported by Typographizer. Hebrew is missing due to complicated support. Japanese requires extended Unicode checks.

<!-- Badges shortcodes -->
[npm-img]: https://img.shields.io/npm/v/typographizer-js.svg?style=flat
[npm-url]: https://www.npmjs.com/package/typographizer-js

[codecov-url]: https://codecov.io/gh/ovlb/typographizer-js
[codecov-img]: https://codecov.io/gh/ovlb/typographizer-js/branch/master/graph/badge.svg

[travis-url]: https://travis-ci.org/ovlb/typographizer-js
[travis-img]: https://travis-ci.org/ovlb/typographizer-js.svg?branch=master

[depstat-url]: https://david-dm.org/ovlb/typographizer-js
[depstat-image]: https://img.shields.io/david/ovlb/typographizer-js/master.svg

[devdepstat-url]: https://david-dm.org/ovlb/typographizer-js#info=devDependencies
[devdepstat-image]: https://img.shields.io/david/dev/ovlb/typographizer-js/master.svg
[greenkeeper-img]: https://badges.greenkeeper.io/ovlb/typographizer-js.svg
[greenkeeper-url]: https://greenkeeper.io/
