import {
  cwd, dir, join, log, exist, isRelative
} from './helpers/utils'

export default class Module {

  constructor(opts) {
    /**
     * modules find path:
     *
     * 1. current folder ＝> process.cwd()/node_modules
     * 2. template folder => data/templates/template/node_modules
     * 3. fbi global folder => data/node_modules
     * 4. system globale folder => username/node_modules
     */
    this.modulePaths = [cwd('node_modules')]
    if (opts.template) {
      this.modulePaths.push(
        join(opts.data.templates, opts.template, 'node_modules')
      )
    }
    this.modulePaths.push(join(opts.data.tasks, 'node_modules'))
    this.modulePaths.push('') // global

    this.opts = opts
  }

  get(name, type) {
    let ret

    if (isRelative(name)) {
      // local => template
      try {
        const localTasks = cwd(this.opts.paths.tasks)
        const found = require.resolve(join(localTasks, name))
        ret = localTasks
      } catch (e) {
        try {
          const tmplTasks = join(this.opts.data.templates, this.opts.template, this.opts.paths.tasks)
          const found = require.resolve(join(tmplTasks, name))
          ret = tmplTasks
        } catch (e) {
          log(`can't find module ${name} in template '${this.opts.template}'`, 0)
        }
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
}