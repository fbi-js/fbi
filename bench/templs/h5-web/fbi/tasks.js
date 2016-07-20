const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')

var webpackConfig = {
  entry: {
    app: ['./src/js/index.js']
  },
  output: {
    filename: 'bundle.js',
    publicPath: '/assets/',
    path: './dist'
  }
// ,
// module:{
//   loaders:[{
//     test: /\.jsx$/,
//   }
//   ]
// }
}

module.exports = {
  build: {
    desc: 'build for me',
    fn: function () {
      var fbi = this
      var compiler = webpack(webpackConfig)

      compiler.run(function (err, stats) {
        if (err) {
          fbi.log(err, 0)
        }
        fbi.log(stats.toString({
          chunks: false, // Makes the build much quieter
          colors: true
        }))
      })
    }
  },
  watch: {
    desc: 'watch files change',
    fn: function () {
      var fbi = this
      var compiler = webpack(webpackConfig)

      compiler.watch({ // watch options:
        aggregateTimeout: 300, // wait so long for more changes
        poll: true // use polling instead of native watchers
      // pass a number to set the polling interval
      }, function (err, stats) {
        if (err) {
          fbi.log(err, 0)
        }
        fbi.log(stats.toString({
          chunks: false, // Makes the build much quieter
          colors: true
        }))
      })
    }
  },

  // TODO
  serve: {
    desc: 'serve file for me',
    fn: function () {
      var fbi = this
      webpackConfig.entry.app.unshift('webpack-dev-server/client?http://localhost:8080/', 'webpack/hot/dev-server')
      // webpackConfig.entry.app.unshift('webpack-dev-server/client?http://localhost:9999/')
      var compiler = webpack(webpackConfig)
      var server = new WebpackDevServer(compiler, {
        contentBase: 'http://localhost/',
        historyApiFallback: false,
        compress: true,
        quiet: false,
        noInfo: false,
        lazy: true,
        filename: 'bundle.js',
        watchOptions: {
          aggregateTimeout: 300,
          poll: 1000
        },
        publicPath: '/assets/',
        headers: { 'X-Custom-Header': 'yes' },
        stats: { colors: true }
      })
      server.listen(9999)
      fbi.log('Server is listen on http://localhost:9999')
    }
  }
}
