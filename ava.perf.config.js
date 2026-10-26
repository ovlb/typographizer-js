export default {
  // Benchmarks measure wall-clock time. Ava runs test files (and tests within
  // files) concurrently by default, which steals CPU from benchmark workers
  // and inflates the measurements. Run everything here serially.
  files: ['test/performance.spec.ts', 'test/perf/**/*.spec.ts'],
  extensions: ['ts'],
  concurrency: 1
}
