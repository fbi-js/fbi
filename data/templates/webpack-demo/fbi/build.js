/**
 * global vars:
 * ctx => fbi
 * require => requireResolve
 */
const ora = require('ora')
const webpack = require('webpack')
const webpackConfig = require('./webpack.config.js')(require, ctx)

const isProduction = ctx.taskParams && ctx.taskParams[0] === 'p' // fbi build -p
const env = isProduction ? 'production' : 'development'
const spinner = ora(`Running webpack in env:${env}`).start()

webpack(webpackConfig, (err, stats) => {
  spinner.succeed()
  if (err) {
    console.log(err, 0)
  }

  console.log(`
${stats.toString({
      chunks: false,
      colors: true
    })}
    `)
})
