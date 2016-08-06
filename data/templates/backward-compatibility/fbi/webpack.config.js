module.exports = (requireReslove, ctx) => {
  const webpack = requireReslove('webpack')
  const glob = requireReslove('glob')
  const noop = function () { }
  const hash = ctx.isProduction && ctx.options.webpack.hash

  function genEntries() {
    let entries = {}
    const files = glob.sync('src/**/*.main.js')
    files.map(item => {
      entries[item.replace('src/script/', '').replace('.main.js', '')] = './' + item
    })
    return entries
  }

  return {
    entry: genEntries(),
    output: {
      filename: hash ? 'js/[name]-[hash:8].js' : 'js/[name].js?[hash:8]',
      chunkFilename: hash ? 'js/[name]-[hash:8].js' : 'js/[name].js?[hash:8]',
      path: ctx._.join(__dirname, '../', ctx.options.server.root),
      publicPath: './'
    },
    resolveLoader: {
      modules: [ctx.options.node_modules_path] // important !!
    },
    devtool: !ctx.isProduction ? 'source-map' : null,
    module: {
      loaders: [
        {
          test: /\.html$/,
          loader: 'html'
        },
        {
          test: /\.json$/,
          loader: 'json'
        }
      ]
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        filename: hash ? 'js/[name]-[hash:8].js' : 'js/[name].js?[hash:8]'
      }),
      ctx.isProduction ? new webpack.optimize.UglifyJsPlugin({ // js ugllify
        compress: {
          warnings: false
        }
      }) : noop
    ],
    debug: !ctx.isProduction
  }
}