import {
  cwd, dir, join, log, exist,
  existSync, readDir, isTemplate
} from './helpers/utils'
import copy from './helpers/copy'

export default class Template {

  async init(name, dst, opts) {
    if (!name) {
      return false
    }
    let ret = false
    const src = join(opts.data.templates, name)
    const has = existSync(src)

    if (has) {
      copy(src, dst, opts.TEMPLATE_INIT_IGNORE)
      return true
    }
    return ret
  }

  async all(opts) {
    const _exist = await exist(opts.data.templates)
    let ret = []
    if (_exist) {
      let templates = await readDir(opts.data.templates)
      templates = templates.filter(isTemplate)
      templates.map(item => {
        const config = require(join(opts.data.templates, item, opts.paths.config))
        ret.push({
          name: item,
          desc: config.templateDescription || ''
        })
      })
    }
    return ret
  }

}