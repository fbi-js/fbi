module.exports = {
  template: 'webpack-demo',
  server: {
    host: 'localhost',
    port: 8888
  },
  npm: {
    alias: 'npm',
    // options: '--save-dev'
    options: '--save-dev --registry=https://registry.npm.taobao.org'
  },
  webpackConfig: {
    entry: './src/assets/index.js',
    output: {
      filename: 'index.js',
      path: './dst/assets'
    },
    plugins: []
  },
  alias: {
    b: 'build',
    w: 'watch',
    s: 'serve'
  }
}