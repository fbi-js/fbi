import {cwd, dir, join, log, exist, readDir} from './helpers/utils'
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
    const has = await exist(src)

    if (has) {
      // copy
      copy(src, dst, ['package.json', 'node_modules'])
      ret = true
    }
    log(ret)
    return ret
  }

  async all() {
    let templates = await readDir(dir(this.opts.data_templates))
    return templates
  }

}