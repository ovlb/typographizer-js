import filesize from 'rollup-plugin-filesize'
import cleaner from 'rollup-plugin-cleaner'

export default [{
  input: './source/index.js',
  output: [{
    format: 'umd',
    file: './dist/index.umd.js',
    name: 'TypographerJS'
  }],
  plugins: [
    cleaner({
      targets: [
        './dist/'
      ]
    }),
    filesize()
  ]
}]
