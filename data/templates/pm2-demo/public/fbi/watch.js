const webpack = require('webpack');

const compiler = webpack(ctx.options.webpackConfig);

compiler.watch({
  aggregateTimeout: 300,
  poll: true
}, function (err, stats) {
  if (err) {
    ctx.log(err, 0)
  }

  ctx.log(stats.toString({
    chunks: false,
    colors: true
  }))
});