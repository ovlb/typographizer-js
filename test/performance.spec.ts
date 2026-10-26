import test from 'ava'
import {
  LANGUAGES,
  METHODS,
  SIZE_LABELS,
  runMethodBenchmark,
  runPipelineBenchmark
} from './perf/benchmark.ts'

test.serial('benchmark covers all documented text sizes', (t) => {
  t.deepEqual(Object.keys(SIZE_LABELS), ['256 B', '1 KB', '10 KB', '100 KB', '1 MB'])
})

test.serial('benchmark covers English and non-English languages', (t) => {
  t.true(LANGUAGES.includes('en_US'))
  t.true(LANGUAGES.filter((language) => language !== 'en_US').length >= 3)
})

test.serial('benchmark covers every public pipeline method', (t) => {
  t.deepEqual(
    [...METHODS].sort(),
    ['fixAiryPunctuation', 'fixApostroph', 'fixEllipsis', 'formatClosingQuotes', 'formatOpeningQuotes', 'formatQuotes', 'trimWhitespace'].sort()
  )
})

test.serial('typographize preserves correctness on every language and size', async (t) => {
  for (const language of LANGUAGES) {
    const results = await runPipelineBenchmark(language)

    for (const result of results) {
      t.true(result.output.length > 0, `${result.suite} (${result.label}): output is non-empty`)
      t.false(result.output.includes('"'), `${result.suite} (${result.label}): straight double quotes should be formatted`)
      t.false(result.output.includes("'"), `${result.suite} (${result.label}): straight single quotes should be formatted`)
      t.false(result.output.includes('...'), `${result.suite} (${result.label}): raw ellipses should be formatted`)
      t.false(result.output.includes('  '), `${result.suite} (${result.label}): doubled whitespace should be collapsed`)
    }
  }
})

test.serial('every single method is benchmarked on pipeline sizes', async (t) => {
  const results = await runMethodBenchmark()
  const covered = new Set(results.map((result) => result.method))

  for (const method of METHODS) {
    t.true(covered.has(method), `${method} must be benchmarked`)
  }

  for (const result of results) {
    t.true(result.bestMs > 0, `${result.suite} (${result.label}): best duration must be measurable, got ${result.bestMs}`)
  }
})

test.serial('every single method preserves correctness on its sample', async (t) => {
  const results = await runMethodBenchmark()

  for (const result of results) {
    switch (result.method) {
      case 'fixEllipsis':
        t.false(result.output.includes('...'), `${result.suite}: raw ellipses must be formatted`)
        break
      case 'trimWhitespace':
        t.false(result.output.includes('  '), `${result.suite}: doubled whitespace must be collapsed`)
        break
      case 'fixApostroph':
        t.false(/['´`]u/.test(result.output), `${result.suite}: wrong apostrophes must be fixed`)
        break
      case 'fixAiryPunctuation':
        t.false(/ [.,;?!]/.test(result.output), `${result.suite}: airy punctuation must be fixed`)
        break
      case 'formatQuotes':
        t.false(result.output.includes('"'), `${result.suite}: straight double quotes must be formatted`)
        break
      case 'formatOpeningQuotes':
      case 'formatClosingQuotes':
        t.not(result.output, result.input, `${result.suite}: quotes must be formatted`)
        break
    }
  }
})
