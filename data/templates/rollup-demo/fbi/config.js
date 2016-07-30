module.exports = {
  template: 'rollup-demo',
  alias: {
    b: 'build',
    s: 'serve'
  },
  npm: {
    options: '--save-dev --registry=https://registry.npm.taobao.org'
  }
}