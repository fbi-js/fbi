const path = require('path');
const webpack = require('webpack');
const babelConfig = require('./babel.client');

const config = {
  debug: true,

  devtool: 'source-map',

  entry: {
    bundle: './src/client.js',
  },

  output: {
    path: path.resolve(__dirname, 'src/public'),
    filename: '[name].js',
  },

  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: Object.assign(babelConfig, { cacheDirectory: './tmp' }),
    }],
  },
  plugins: [],
  resolve: {},
};

// Hot mode
if (process.env.HOT) {
  config.devtool = 'eval';
  config.entry.bundle.unshift('webpack/hot/only-dev-server');
  config.entry.bundle.unshift('webpack-dev-server/client?http://localhost:8082');
  config.output.publicPath = 'http://localhost:8082/';
  config.plugins.unshift(new webpack.HotModuleReplacementPlugin());
}

if (process.env.NODE_ENV === 'production') {
  config.devtool = false;
  config.debug = false;
  config.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
  config.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = config;