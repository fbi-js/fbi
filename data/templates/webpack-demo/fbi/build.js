/**
 * global vars:
 * ctx => fbi
 * require => requireResolve
 */

const webpack = require('webpack')
const webpackConfig = require('./webpack.config.js')(require, ctx)

const isProduction = ctx.argvs[1] === '-p' // fbi build -p

if (isProduction) {
  ctx.log('env: production')
  webpackConfig['plugins'].push(
    new webpack.optimize.UglifyJsPlugin({ // js ugllify
      compress: {
        warnings: false
      }
    })
  )
}

const compiler = webpack(webpackConfig)

compiler.run(function (err, stats) {
  if (err) {
    ctx.log(err, 0)
  }

  ctx.log(`webpack output:
${stats.toString({
      chunks: false,
      colors: true
    })}`)
})
