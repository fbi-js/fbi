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
  dependencies: {
    koa: '2.0.0-alpha.4',
    webpack: '^2.1.0-beta.20'
  },
  webpackConfig: {
    entry: './src/assets/index.js',
    output: {
      filename: 'index.js',
      path: './dst/assets'
    },
    plugins: []
  }
}