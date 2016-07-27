module.exports = {
  template: 'rollup-demo',
  rollupConfig: {
    entry: 'src/js/app.js',
    format: 'umd',
    out: 'dst/js/app.js'
  }
}