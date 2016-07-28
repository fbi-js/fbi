const webpack = require('webpack');

console.log(ctx)

// fbi build -p
if (ctx.argvs[1] === '-p') {
  ctx.log('type: production')
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

  ctx.log(stats.toString({
    chunks: false,
    colors: true
  }))
});

