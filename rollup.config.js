import filesize from 'rollup-plugin-filesize'
import cleaner from 'rollup-plugin-cleaner'
import babel from 'rollup-plugin-babel'

export default [{
  input: './source/index.js',
  output: [{
    format: 'umd',
    file: './dist/index.umd.js',
    name: 'TypographerJS'
  }],
  plugins: [
    babel({
      runtimeHelpers: true,
      presets: [
        '@babel/preset-env'
      ],
      plugins: [
      ]
    }),
    cleaner({
      targets: [
        './dist/'
      ]
    }),
    filesize()
  ]
}]
