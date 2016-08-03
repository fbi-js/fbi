const webpack = require('webpack');
const isProduction = ctx.taskParams && ctx.taskParams[0] === 'p' // fbi build -p

// fbi build -p
if (isProduction) {
  ctx.log('env: production')
  ctx.options.webpackConfig['plugins'].push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  )
}

const compiler = webpack(ctx.options.webpackConfig);

compiler.run(function (err, stats) {
  if (err) {
    ctx.log(err, 0)
  }

  ctx.log(`webpack output:
${stats.toString({
      chunks: false,
      colors: true
    })}`)
});


ctx._.copyFile('./src/index.html', './dst/index.html')