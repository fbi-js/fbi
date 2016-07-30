import {
  cwd, dir, join, log, exist,
  existSync, readDir, isTemplate
} from './helpers/utils'
import copy from './helpers/copy'

export default class Template {

  constructor(opts) {
    this.opts = opts
  }

  async copy(name, dst) {
    if (!name) {
      return false
    }
    let ret = false
    const src = dir(this.opts.data_templates, name)
    const has = existSync(src)

    if (has) {
      copy(src, dst, ['node_modules', 'dst', 'dist'])
      return true
    }
    return ret
  }

  async all() {
    let templates = await readDir(dir(this.opts.data_templates))
    templates = templates.filter(isTemplate)
    return templates
  }

}