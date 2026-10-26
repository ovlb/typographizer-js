export default {
  // Benchmark specs are excluded here and run serially via ava.perf.config.js
  // (see the "test:perf" script): they measure wall-clock time and must not
  // share CPU with other workers.
  files: ['test/**/*.spec.ts', '!test/perf/**', '!test/performance.spec.ts'],
  extensions: ['ts']
}
