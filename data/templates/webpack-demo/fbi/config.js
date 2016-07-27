module.exports = {
  server: {
    host: 'localhost',
    port: 8888
  },
  npm: {
    alias: 'tnpm',
    options: '--save-dev'
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
    }
  }
}