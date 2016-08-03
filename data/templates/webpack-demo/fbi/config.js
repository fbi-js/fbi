module.exports = {
  template: 'webpack-demo',
  server: {
    root: 'dst/',
    host: 'localhost',
    port: 8888
  },
  npm: {
    alias: 'npm',
    // options: '--save-dev'
    options: '--save-dev --registry=https://registry.npm.taobao.org'
  },
  alias: {
    b: 'build',
    w: 'watch',
    s: 'serve',
    c: 'clean'
  }
}