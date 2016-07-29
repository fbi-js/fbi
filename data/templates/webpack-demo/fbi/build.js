const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const autoprefixer = require('autoprefixer')
const precss = require('precss')
const cssnano = require('cssnano')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpackConfigFn = require('./webpack.config.js')

const isProduction = ctx.argvs[1] === '-p' // fbi build -p

const webpackConfig = webpackConfigFn(
  webpack,
  ExtractTextPlugin,
  HtmlWebpackPlugin,
  ctx.options.node_modules_path,
  isProduction)

// ctx._.copyFile('./src/index.html', './dst/index.html')


webpackConfig['postcss'] = function () {
  if (isProduction) {
    return [
      autoprefixer({
        browsers: [
          'last 2 versions',
          '> 5%',
          'safari >= 5',
          'ie >= 8',
          'opera >= 12',
          'Firefox ESR',
          'iOS >= 6',
          'android >= 4'
        ]
      }),
      precss,
      cssnano // css minify
    ]
  } else {
    return [
      autoprefixer({
        browsers: [
          'last 2 versions',
          '> 5%',
          'safari >= 5',
          'ie >= 8',
          'opera >= 12',
          'Firefox ESR',
          'iOS >= 6',
          'android >= 4'
        ]
      }),
      precss
    ]
  }
}

if (isProduction) {
  ctx.log('type: production')
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
