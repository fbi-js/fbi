const webpack = require('webpack');

const webpackConfig = ctx.options.webpackConfig;

ctx.options.webpackConfig['plugins'] = [];
ctx.options.webpackConfig['plugins'].push(
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  })
);

const compiler = webpack(webpackConfig);

compiler.run(function (err, stats) {
  if (err) {
    ctx.log(err, 0)
  }

  ctx.log(stats.toString({
    chunks: false,
    colors: true
  }))
});