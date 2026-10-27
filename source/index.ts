import supportedLanguages from './data/supportedLanguages.ts'
import quotesets from './data/quotesets.ts'

/**
 * Matches code segments in Markdown and HTML documents: fenced code blocks
 * (``` and ~~~), inline code spans (`…`) as well as <pre> and <code> elements.
 * When used with String.split() and its capturing group, the odd-indexed
 * results are code segments.
 */
const codeSegmentPattern = /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`|<pre\b[\s\S]*?<\/pre>|<code\b[\s\S]*?<\/code>)/gi

/**
 * Applies a fix only to the prose segments of a string, leaving code segments
 * untouched. When the fix is applied to the whole string, this is identical
 * to calling it directly.
 *
 * @param {String} str
 * @param {Function} fix Receives a prose segment and returns the fixed segment
 * @returns {Promise<String>}
 */
async function applyToProse (str: string, fix: (segment: string) => Promise<string> | string): Promise<string> {
  const segments = str.split(codeSegmentPattern)

  // No code segments found: behave exactly as if the fix ran on the whole string
  if (segments.length === 1) return fix(str)

  const processed = await Promise.all(segments.map(async (segment, index) => {
    // String.split() with a capturing regex puts the matches at odd indexes
    if (index % 2 === 1) return segment

    return fix(segment)
  }))

  return processed.join('')
}

export interface QuoteSet {
  openingDouble: string
  closingDouble: string
  openingSingle: string
  closingSingle: string
}

export interface Language {
  code: string
  set: number
}

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
  options!: { characterRange: string }
  language!: Language
  quotes!: QuoteSet

  constructor (language?: string) {
    const userLanguage = language ? supportedLanguages.find(l => l.code === language) : false

    if (language && !userLanguage) {
      return new Error(`Language «${language}» is not supported.`) as unknown as TypographizerJS
    }

    this.options = {
      characterRange: `\\u0030-\\u02af|\\u0370-\\u1fff`
    }

    this.language = userLanguage || { code: 'en_US', set: 0 }

    const { set } = this.language
    this.quotes = quotesets[set]
  }

  /**
   * Runs all operations on a given subject string. It will trim whitespace,
   * fix typographically wrong signs ("Hello", He´d and so forth) as well as
   * removing doubled spaces in the string.
   *
   * Code segments in Markdown and HTML documents (fenced code blocks, inline
   * code spans, <pre> and <code> elements) are left untouched. When code
   * segments are present, whitespace is neither trimmed nor collapsed, since
   * that would destroy the structure of the document.
   *
   * @async
   * @param {String} string
   * @returns {Promise<String>} The formatted string
   * @memberof TypographizerJS
   */
  async typographize (string: string): Promise<string> {
    const hasCodeSegments = string.split(codeSegmentPattern).length > 1
    const str = hasCodeSegments ? string : await this.trimWhitespace(string)

    return this.formatQuotes(str)
      .then((str) => this.fixApostroph(str))
      .then((str) => this.fixEllipsis(str))
      .then((str) => this.fixAiryPunctuation(str))
  }

  /**
   * Fix ', `, ´ used as apostrophes in a sentence
   *
   * @param {String} str
   * @async
   * @returns {Promise<String>} str with all occurences of wrong apostrophes replaced
   * @memberof TypographizerJS
   */
  async fixApostroph (str: string): Promise<string> {
    return applyToProse(str, (segment) => {
      const { characterRange } = this.options
      const find = new RegExp(`(?<=[${characterRange}])(['\u0300\u0301´])(?=[${characterRange}])`, 'gmiu')

      return segment.replace(find, '’')
    })
  }

  /**
   * Formats all occurences of ... to use the correct … character
   *
   * @param {String} str String to test
   * @async
   * @returns {Promise<String>}
   * @memberof TypographizerJS
   */
  async fixEllipsis (str: string): Promise<string> {
    return applyToProse(str, (segment) => segment.replace(/(\.{3})/gmiu, '…'))
  }

  /**
   * Trim whitespace
   *
   * Regexr example: https://regexr.com/4he5a
   *
   * @param {String} str
   * @returns
   * @memberof TypographizerJS
   */
  async fixAiryPunctuation (str: string): Promise<string> {
    return applyToProse(str, (segment) => {
      if (this.language.code === 'fr') return segment

      const airy = /( )[.,;?!]{1}(?= *)/gimu

      return segment.replace(airy, (found) => found.trim())
    })
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
  async trimWhitespace (str: string): Promise<string> {
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
  async formatQuotes (str: string): Promise<string> {
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
  async formatOpeningQuotes (str: string): Promise<string> {
    return applyToProse(str, (segment) => {
      const { openingDouble, openingSingle } = this.quotes
      const { characterRange } = this.options
      // Match all " that are followed by any letter from the Basic Latin to Greek Extended character sets
      // The characters between \u02af and \u0370 are Combining Diacrital Marks
      // To allow for nested quotes we also check for single quotes
      const openingDoubleQuotes = new RegExp(`^"|(?<!=)(?<= )"(?=[${characterRange}'${openingSingle}])(?!>)`, 'gmiu')
      const openingSingleQuotes = new RegExp(`(?<=[ "${openingDouble}])(')(?=[${characterRange}])`, 'gmiu')

      return segment
        .replace(openingDoubleQuotes, openingDouble)
        .replace(openingSingleQuotes, openingSingle)
    })
  }

  /**
   *Check for all closing straight quotes
   *
   * @param {String} str
   * @async
   * @returns {Promise<String>}
   * @memberof TypographizerJS
   */
  async formatClosingQuotes (str: string): Promise<string> {
    return applyToProse(str, (segment) => {
      const { closingDouble, closingSingle } = this.quotes

      const closingDoubleQuote = /(?<!\d)"(?=[\s,.…])(?!( [a-z]+=))|(?<!\d)"(?=<)|("$)/gimu
      const closingSingleQuote = new RegExp(`(?<!\\d)'(?=[\\s,."${closingDouble}])|(?<!\\d)'(?=<)`, 'gimu')

      return segment
        .replace(closingDoubleQuote, closingDouble)
        .replace(closingSingleQuote, closingSingle)
    })
  }
}
