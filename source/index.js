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
    if (options && !supportedLanguages.find(l => l.code === options.language)) {
      return new Error('Language in `options` is not supported.')
    }

    const defaultOptions = {
      isHTML: false,
      language: { code: 'en', set: 0 }
    }

    this.quotes = {
      openingDouble: '“',
      closingDouble: '”',
      openingSingle: '‘',
      closingSingle: '’'
    }

    this.options = { ...defaultOptions, ...options }
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
    return this.trimWhitespace(string)
      .then((str) => this.formatQuotes(str))
      .then((str) => this.fixApostroph(str))
      .then((str) => this.fixEllipsis(str))
  }

  /**
   * Fix ', `, ´ used as apostrophes in a sentence
   *
   * @param {String} str
   * @async
   * @returns {Promise<String>} str with all occurences of wrong apostrophes replaced
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
   * Formats all occurences of ... to use the correct … character
   *
   * @param {String} str String to test
   * @async
   * @returns {Promise<String>}
   * @memberof TypographizerJS
   */
  async fixEllipsis (str) {
    return str.replace(/(\.{3})/gmiu, '…')
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
   * Format opening and closing quotes
   *
   * @param {String}
   * @async
   * @returns {Promise<String>}
   * @memberof TypographizerJS
   */
  async formatQuotes (str) {
    return this.formatOpeningQuotes(str).then((str) => this.formatClosingQuotes(str))
  }

  /**
   * format all occurences of straight opening quotes (" and ')
   *
   * @param {String} str
   * @async
   * @returns {Promise<String>} The formatted string
   * @memberof TypographizerJS
   */
  async formatOpeningQuotes (str) {
    // Match all " that are followed by any letter from the Basic Latin to Greek Extended character sets
    // The characters between \u02af and \u0370 are Combining Diacrital Marks
    // To allow for nested quotes we also check for single quotes
    const openingDoubleQuotes = /(")(?=[\u0030-\u02af|\u0370-\u1fff'’‹›])/gimu

    const openingSingleQuotes = /([\s |"|«|»|„|“])(')(?=[\u0030-\u02af|\u0370-\u1fff])/gmiu

    const { openingDouble, openingSingle } = this.quotes

    return str
      .replace(openingDoubleQuotes, openingDouble)
      .replace(openingSingleQuotes, (found) => found.replace(`'`, openingSingle))
  }

  /**
   *Check for all closing straight quotes
   *
   * @param {String} str
   * @async
   * @returns {Promise<String>}
   * @memberof TypographizerJS
   */
  async formatClosingQuotes (str) {
    const closingDoubleQuote = /"(?=[\s,.])|("$)/gimu
    const closingSingleQuote = /'(?=[\s,."”«»])/gimu

    const { closingDouble, closingSingle } = this.quotes

    return str
      .replace(closingDoubleQuote, closingDouble)
      .replace(closingSingleQuote, closingSingle)
  }
}
