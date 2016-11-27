module.exports = (require, ctx) => {
  const path = require('path')
  const rollup = require('rollup')
  const rollupConfig = require('./config/rollup.config')(require, ctx)

  function complier(file) {
    rollupConfig.entry = file

    rollup.rollup(rollupConfig)
      .then(bundle => {
        bundle.write({
          format: ctx.options.rollup.format || 'cjs',
          moduleName: ctx.options.rollup.moduleName || '',
          moduleId: ctx.options.rollup.moduleId || 'moduleId',
          dest: ctx.options.dist + file.replace('src/', ''),
          banner: ctx.options.rollup.banner,
          footer: ctx.options.rollup.footer,
        })

        console.log(file)
      })
      .catch(err => {
        throw err
      })
  }

  return function (file) {
    const files = ctx.options.rollup.entry
    rollupConfig.external = files.map(item => path.resolve('./src/' + item))

    if (file) {
      complier(file)
    } else {
      files.map(item => {
        complier('src/' +item)
      })
    }
  }
}