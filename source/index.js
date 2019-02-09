import supportedLanguages from './data/supportedLanguages'

/**
 * Typographizer. Your friendly helper to correct common typographic mistakes.
 *
 * Use TypographizerJS.typographize() to run all optimizations.
 *
 * If you want to be specific you can use the internal methods yourself.
 * Using TypographizerJS.fixApostroph() will only fix occurences of wrong apostrophes,
 * and leave everything else alone
 *
 * @export
 * @class TypographizerJS
 * @author Oscar Braunert
 * @license MIT
 */
export default class TypographizerJS {
  constructor (options) {
    if (options && !supportedLanguages.includes(options.language)) {
      return new Error('Language in options is not supported.')
    }

    const defaultOptions = {
      isHTML: false,
      language: 'en'
    }

    this.quotes = {
      openingDouble: '“',
      closingDouble: '”',
      openingSingle: '‘',
      closingSingle: '’'
    }

    this.options = { ...defaultOptions, ...options }

    this.string = undefined
  }

  /**
   * Runs all operations on a given subject string. It will trim whitespace,
   * fix typographically wrong signs ("Hello", He´d and so forth) as well as
   * removing doubled spaces in the string.
   *
   * @async
   * @param {String} string
   * @returns {Promise<String>} The formatted string
   * @memberof TypographizerJS
   */
  async typographize (string) {
    this.string = string

    string = string.trim()

    return this.replaceOpeningQuotes(string)
      .then((str) => this.fixApostroph(str))

    // return string
  }

  /**
   * Fix ', `, ´ used as apostrophes in a sentence
   *
   * @param {String} str
   * @async
   * @returns {Promise<String>} str with all occurences of wrong apostrophes replaces
   * @memberof TypographizerJS
   */
  async fixApostroph (str) {
    // TODO: Once lookbehinds land this could well be optimized
    // (or once someone who actually understands regex looks at this)
    const find = /(?:[a-z])(['´`])(?=[a-z])/gimu
    const apo = /['´`]/gimu

    return str.replace(find, (found) => found.replace(apo, '’'))
  }

  /**
   * Trim whitespace from beginning and end of string and replace multiple spaces
   * inside of a string with a single one.
   *
   * @param {String} str
   * @async
   * @returns {Promise<String>}
   * @memberof TypographizerJS
   */
  async trimWhitespace (str) {
    return str.trim().replace(/\u0020{2,}/gmiu, ' ')
  }

  /**
   * Replace all occurences of straight opening quotes (" and ')
   *
   * @param {String} str
   * @async
   * @returns {Promise<String>} The formatted string
   * @memberof TypographizerJS
   */
  async replaceOpeningQuotes (str) {
    const openingDoubleQuotes = /(")(?=[a-zäöü'’])/gimu
    const openingSingleQuotes = /([\s |"|«|»|„|“])(')(?=[a-zäöü])/gmiu

    const { openingDouble, openingSingle } = this.quotes

    return str
      .replace(openingDoubleQuotes, openingDouble)
      .replace(openingSingleQuotes, (found) => found.replace(`'`, openingSingle))
  }
}
