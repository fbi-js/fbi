module.exports = {
  template: 'rollup-demo',
  data: {
    root: './data2',
    tasks: './data2/tasks',
    templates: './data2/templates'
  },
  alias: {
    b: 'build',
    s: 'serve'
  },
  npm: {
    options: '--save-dev --registry=https://registry.npm.taobao.org'
  }
}