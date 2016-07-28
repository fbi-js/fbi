import {cwd, dir, join, log, exist, existSync, readDir} from './helpers/utils'
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
      copy(src, dst, ['package.json', 'node_modules'])
      return true
    }
    return ret
  }

  async all() {
    let templates = await readDir(dir(this.opts.data_templates))
    return templates
  }

}