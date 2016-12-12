import * as _ from './helpers/utils'

import copy from './helpers/copy'

export default class Template {

  async init(name, dst, opts) {
    if (!name) {
      return false
    }
    let ret = false

    const src = _.join(opts.PATHS.global.templates, name)
    const has = _.existSync(src)

    if (has) {
      copy(src, dst, opts.TEMPLATE_INIT_IGNORE)
      return true
    }
    return ret
  }

  async all(opts) {
    const _exist = await _.exist(opts.PATHS.global.templates)
    let ret = []
    if (_exist) {
      let templates = await _.readDir(opts.PATHS.global.templates)
      templates = templates.filter(_.isTemplate)
      templates.map(item => {
        try {
          const config = require(_.join(opts.PATHS.global.templates, item, opts.paths.config))
          const pkg = require(_.join(opts.PATHS.global.templates, item, 'package.json'))
          ret.push({
            name: item,
            desc: config.templateDescription || '',
            version: pkg.version
          })
        } catch (err) {}
      })
    }
    return ret
  }
}