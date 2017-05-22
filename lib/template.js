const _ = require('./helpers/utils')
const copy = require('./helpers/copy')

module.exports = class Template {

  async init(name, dst, opts) {
    if (!name) {
      return false
    }

    const src = _.join(opts.DATA_TEMPLATES, name)
    const exist = _.existSync(src)

    if (exist) {
      // delete devDependencies
      const pkg = require(_.join(src, 'package.json'))
      delete pkg.devDependencies
      delete pkg.fbi
      pkg['fbi'] = name
      await _.write(_.join(dst, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')

      // copy files
      await copy(src, dst, opts.TEMPLATE_INIT_IGNORE)
      return true
    }
    return false
  }

  async all(opts) {
    const ret = []

    if (await _.exist(opts.DATA_TEMPLATES)) {
      let templates = await _.readDir(opts.DATA_TEMPLATES)
      templates = templates.filter(_.isTemplate)
      await Promise.all(templates.map(async item => {
        try {
          const config = {}
          const tmplInfo = require(_.join(opts.DATA_TEMPLATES, item, 'package.json'))
          ret.push({
            name: tmplInfo.name,
            desc: tmplInfo.description || '',
            version: tmplInfo.version
          })
        } catch (err) {
          console.log(err)
        }
      }))
    }

    return ret
  }
}