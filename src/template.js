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
    let templates = await readDir(join(opts.data.templates))
    templates = templates.filter(isTemplate)
    return templates
  }

}