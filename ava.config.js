export default {
  files: ['test/**/*.spec.ts'],
  extensions: ['ts'],
  // Benchmark tests measure wall-clock time. Ava runs test files (and tests
  // within files) concurrently by default, which steals CPU from the worker
  // running benchmarks and inflates the measurements. Keep everything serial.
  concurrency: 1
}
