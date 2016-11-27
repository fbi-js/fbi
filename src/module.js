import {
  cwd, join, log, isRelative
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

    /*
    this.modulePaths:

     [
      '.../test/webpack-demo/node_modules',
      '.../fbi/data/templates/webpack-demo/node_modules',
      '.../fbi/data/tasks/node_modules',
      ''
    ]
   */
  }

  get(name, type) {
    let ret

    if (isRelative(name)) {
      let localTasks
      if (type === 'local') {
        localTasks = cwd(this.opts.paths.tasks)
        try {
          // local
          // const found = require.resolve(join(localTasks, name))
          ret = localTasks
        } catch (e) {
          try {
            // template
            localTasks = join(this.opts.data.templates, this.opts.template, this.opts.paths.tasks)
            // const found = require.resolve(join(localTasks, name))
            ret = localTasks
          } catch (e) {
            log(`can't find module ${name} in template '${this.opts.template}'`, 0)
          }
        }
      } else if (type === 'template') {
        try {
          // template
          localTasks = join(this.opts.data.templates, this.opts.template, this.opts.paths.tasks)
          // const found = require.resolve(join(localTasks, name))
          ret = localTasks
        } catch (e) {
          log(`can't find module ${name} in template '${this.opts.template}'`, 0)
        }
      } else if (type === 'global') {
        try {
          // template
          localTasks = join(this.opts.data.tasks)
          // const found = require.resolve(join(localTasks, name))
          ret = localTasks
        } catch (e) {
          log(`can't find module ${name} in global tasks folder`, 0)
        }
      }
    } else {
      this.modulePaths.map(item => {
        if (!ret) {
          try {
            require.resolve(join(item, name))
            ret = item
          } catch (e) {}
        }
      })
    }
    return ret
  }
}
