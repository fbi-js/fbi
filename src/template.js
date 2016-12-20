import * as _ from './helpers/utils'

import copy from './helpers/copy'

export default class Template {

  async init(name, dst, opts) {
    if (!name) {
      return false
    }
    let ret = false

    const src = _.join(opts.DATA_TEMPLATES, name)
    const has = _.existSync(src)

    if (has) {
      copy(src, dst, opts.TEMPLATE_INIT_IGNORE)
      return true
    }
    return ret
  }

  async all(opts) {
    const _exist = await _.exist(opts.DATA_TEMPLATES)
    const ret = []
    if (_exist) {
      let templates = await _.readDir(opts.DATA_TEMPLATES)
      templates = templates.filter(_.isTemplate)
      await Promise.all(templates.map(async item => {
        try {
          const config = {}
          const tmplGlobalCfgPath = _.join(opts.DATA_TEMPLATES, item, opts.paths.config)
          if (await _.exist(tmplGlobalCfgPath)) {
            config.description = require(tmplGlobalCfgPath).description
          } else {
            config.description = 'Global template doesn\'t match local template.'
          }
          const pkg = require(_.join(opts.DATA_TEMPLATES, item, 'package.json'))
          ret.push({
            name: item,
            desc: config.description || '',
            version: pkg.version
          })
        } catch (err) {console.log(err)}
      }))
    }

    return ret
  }
}