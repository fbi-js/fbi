const path = require('path')

module.exports = function (
  webpack,
  ExtractTextPlugin,
  HtmlWebpackPlugin,
  nodeModulesPath,
  isProduction) {

  return {
    entry: {
      app: './src/assets/index.js'
    },
    output: {
        filename: isProduction ? 'js/[name]-[hash:8].js' : 'js/[name].js?[hash:8]',
        chunkFilename: isProduction ? 'js/[name]-[hash:8].js' : 'js/[name].js?[hash:8]',
      path: path.join(__dirname, '..', '/dst/assets'),
      publicPath: './assets/'
    },
    resolve: {
      // root: [ctx.options.node_modules_path]
      modulesDirectories: [nodeModulesPath]
      // fallback: ctx.options.node_modules_path
    },
    resolveLoader: {
      fallback: nodeModulesPath,
      modulesDirectories: nodeModulesPath
    },
    devtool: !isProduction ? 'cheap-module-eval-source-map' : null,
    module: {
      loaders: [
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            publicPath: './',
            notExtractLoader: 'style-loader',
            // loader: 'css-loader!postcss-loader'
            loader: require.resolve(
              nodeModulesPath + '/css-loader') + '!' +
            require.resolve(nodeModulesPath + '/postcss-loader'
            )
          })
        }
      ]
    },
    plugins: [
      new ExtractTextPlugin({
          filename: isProduction ? 'css/[name]-[hash:8].css' : 'css/[name].css?[hash:8]',
        disable: false,
        allChunks: true
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        filename: isProduction ? 'js/[name]-[hash:8].js' : 'js/[name].js?[hash:8]'
      }),
      new HtmlWebpackPlugin({
        filename: '../index.html'
      })
    ]
  }
}