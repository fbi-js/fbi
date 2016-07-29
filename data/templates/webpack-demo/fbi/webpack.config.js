module.exports = function (requireReslove, ctx) {

  const path = require('path')
  const webpack = requireReslove('webpack')
  const ExtractTextPlugin = requireReslove('extract-text-webpack-plugin')
  const autoprefixer = requireReslove('autoprefixer')
  const precss = requireReslove('precss')
  const cssnano = requireReslove('cssnano')
  const HtmlWebpackPlugin = requireReslove('html-webpack-plugin')
  const nodeModulesPath = ctx.options.node_modules_path

  const isProduction = ctx.argvs[1] === '-p' // fbi build -p
  const autoprefixerBrowsers = [
    'last 2 versions',
    '> 5%',
    'safari >= 5',
    'ie >= 8',
    'opera >= 12',
    'Firefox ESR',
    'iOS >= 6',
    'android >= 4'
  ]

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
    // resolve: {
    //   // root: [ctx.options.node_modules_path]
    //   modulesDirectories: [nodeModulesPath]
    //   // fallback: ctx.options.node_modules_path
    // },
    // resolveLoader: {
    //   fallback: nodeModulesPath,
    //   modulesDirectories: nodeModulesPath
    // },
    devtool: !isProduction ? 'cheap-module-eval-source-map' : null,
    module: {
      loaders: [
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            publicPath: './',
            notExtractLoader: 'style-loader',
            loader: require.resolve(nodeModulesPath + '/css-loader') + '!' + require.resolve(nodeModulesPath + '/postcss-loader')
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
    ],
    postcss: function () {
      if (isProduction) {
        return [
          autoprefixer({
            browsers: autoprefixerBrowsers
          }),
          precss,
          cssnano // css minify
        ]
      } else {
        return [
          autoprefixer({
            browsers: autoprefixerBrowsers
          }),
          precss
        ]
      }
    }
  }
}