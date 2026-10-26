export default {
  input: 'dist/index.js',
  output: [
    {
      format: 'umd',
      file: 'dist/index.umd.cjs',
      name: 'TypographerJS',
      exports: 'default'
    }
  ]
}
