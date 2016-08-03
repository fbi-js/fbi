module.exports = (requireReslove, ctx) => {
  const webpack = requireReslove('webpack')
  const ExtractTextPlugin = requireReslove('extract-text-webpack-plugin')
  const HtmlWebpackPlugin = requireReslove('html-webpack-plugin')
  const nodeModulesPath = ctx.options.node_modules_path
  const isProduction = ctx.taskParams && ctx.taskParams[0] === 'p' // fbi build -p
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
  const noop = function () { }

  return {
    entry: {
      app: './src/js/index.js'
    },
    output: {
      filename: isProduction ? 'js/[name]-[hash:8].js' : 'js/[name].js?[hash:8]',
      chunkFilename: isProduction ? 'js/[name]-[hash:8].js' : 'js/[name].js?[hash:8]',
      path: ctx._.join(__dirname, '../', ctx.options.server.root),
      publicPath: './'
    },
    resolve: {
      modules: [nodeModulesPath] // important !!
    },
    resolveLoader: {
      modules: [nodeModulesPath] // important !!
    },
    devtool: !isProduction ? 'source-map' : null,
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'babel',
          query: {
            presets: [
              nodeModulesPath + '/babel-preset-es2015'
            ]
          }
        },
        {
          test: /\.html$/,
          loader: 'html'
        },
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style?name=css/' + (isProduction ? '[hash:8].[ext]' : '[name].[ext]?[hash:8]'),
            loader: 'css!postcss'
          })
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          loaders: [
            'file?name=img/' + (isProduction ? '[hash:8].[ext]' : '[name].[ext]?[hash:8]'),
            'image-webpack'
          ]
        }
      ]
    },
    imageWebpackLoader: {
      pngquant: {
        quality: '65-90',
        speed: 4
      },
      svgo: {
        plugins: [
          {
            removeViewBox: false
          },
          {
            removeEmptyAttrs: false
          }
        ]
      }
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
        filename: 'index.html',
        favicon: './src/favicon.ico',
        template: './src/index.html'
      }),
      isProduction ? new webpack.optimize.UglifyJsPlugin({ // js ugllify
        compress: {
          warnings: false
        }
      }) : noop
    ],
    postcss: [
      requireReslove('autoprefixer')({
        browsers: autoprefixerBrowsers
      }),
      requireReslove('precss'),
      isProduction ? requireReslove('cssnano') : noop // css minify
    ]
  }
}