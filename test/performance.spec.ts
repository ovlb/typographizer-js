import test from 'ava'
import {
  LANGUAGES,
  METHODS,
  SIZE_LABELS,
  runMethodBenchmark,
  runPipelineBenchmark
} from './perf/benchmark.ts'

test.serial('the benchmark size ladder spans 256 B to 1 MB', (t) => {
  t.deepEqual(Object.keys(SIZE_LABELS), ['256 B', '1 KB', '10 KB', '100 KB', '1 MB'])
})

test.serial('the benchmark language suite has English plus at least three other languages', (t) => {
  t.true(LANGUAGES.includes('en_US'))
  t.true(LANGUAGES.filter((language) => language !== 'en_US').length >= 3)
})

test.serial('the benchmark method list names every public pipeline method', (t) => {
  t.deepEqual(
    [...METHODS].sort(),
    ['fixAiryPunctuation', 'fixApostroph', 'fixEllipsis', 'formatClosingQuotes', 'formatOpeningQuotes', 'formatQuotes', 'trimWhitespace'].sort()
  )
})

test.serial('typographize() output stays typographically correct at every size and language', async (t) => {
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

test.serial('each public method is benchmarked at 10 KB, 100 KB and 1 MB', async (t) => {
  const results = await runMethodBenchmark()
  const covered = new Set(results.map((result) => result.method))

  for (const method of METHODS) {
    t.true(covered.has(method), `${method} must be benchmarked`)
  }

  for (const result of results) {
    t.true(result.bestMs > 0, `${result.suite} (${result.label}): best duration must be measurable, got ${result.bestMs}`)
  }
})

test.serial('each public method only changes what it is responsible for', async (t) => {
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
