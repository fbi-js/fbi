module.exports = {
  template: 'rollup-demo',
  // test
  data: {
    root: './data',
    tasks: './data/tasks',
    templates: './data/templates'
  },
  // end test
  alias: {
    b: 'build',
    s: 'serve'
  },
  npm: {
    options: '--save-dev --registry=https://registry.npm.taobao.org'
  }
}