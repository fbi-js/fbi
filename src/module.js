import {cwd, dir, join, log, exist, isRelative} from './helpers/utils'
import options from './options'

export default class Module {
  constructor(opts) {
    /**
     * modules find path:
     *
     * 1. current folder ＝> process.cwd()/node_modules
     * 2. template folder => data/templates/template/node_modules
     * 3. fbi global folder => data/node_modules
     * 4. system globale folder => username/node_modules
     *
     */

    this.modulePaths = [
      cwd('node_modules'),
      dir(options.data, opts.template ? 'templates/' + opts.template : '', 'node_modules'),
      dir(options.data, 'node_modules')
      ,
      '' // global
    ]

    this.opts = opts
    this.modulePaths = Array.from(new Set(this.modulePaths)) // duplicate removal
  }

  get(name, type) {
    let ret

    if (isRelative(name)) {
      if (type === 'local') {
        ret = cwd(this.opts.paths.tasks)
      } else if (type === 'template') {
        ret = dir(options.data_templates, this.opts.template, this.opts.paths.tasks)
      }
    } else {
      for (let item of this.modulePaths) {
        let _p = join(item, name)
        try {
          let found = require.resolve(_p)

          if (found) {
            ret = item ? item : 'global'
            break
          }
        } catch (e) {

        }
      }
    }
    return ret
  }

  getAll() {
    let modules = {}
    modules[this.mod] = {}
    for (let [key, value] of this.modules) {
      modules[this.mod][key] = value
    }
    return modules
  }

}