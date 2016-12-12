import * as _ from './helpers/utils'

import path from 'path'
import vm from 'vm'
import vmRunner from './helpers/vm-runner'

export default class Task {

  constructor() {
    this.tasks = {}
  }

  async get(name, type, opts) {
    // if alias, get fullname from alias
    if (opts.alias && opts.alias[name]) {
      name = opts.alias[name]
    }

    // local task > tempalte task => global task
    const ret = {
      name: name,
      cnt: '',
      type: '',
      path: ''
    }

    let found = false

    async function find(file, type) {
      if (await _.exist(file + '.js')) {
        found = true
        ret.type = type
        ret.path = file + '.js'
      }
    }

    // find in local
    if (type === 'local') {
      await find(_.cwd(opts.PATHS.local.tasks, name), type)
    }

    // find in template
    if (!found && opts.template && opts.template !== '') {
      await find(_.join(
        opts.PATHS.global.templates,
        opts.template,
        opts.PATHS.local.tasks,
        name), 'template')
    }

    // find in global
    if (!found || type === 'global') {
      await find(_.join(opts.PATHS.global.tasks, opts.PATHS.local.tasks, name), 'global')
    }

    return ret
  }

  async all(opts, justNames, justAvailable) {
    const _this = this
    let names = {
      local: new Set(),
      global: new Set(),
      template: new Set()
    }

    async function collect(_dir, type) {
      let _exist = await _.exist(_dir)
      let _modules
      if (_exist) {
        _modules = await _.readDir(_dir)
        _modules = _modules.filter(_.isTaskFile)
        if (justNames) {
          _modules.map(item => {
            item = _.basename(item, '.js')
            names[type].add(item)
          })
        } else if (_modules.length) {
          await Promise.all(_modules.map(async item => {
            _this.tasks[_.basename(item, '.js')] = await _.read(_.join(_dir, item))
          }))
        }
      }
    }

    // template tasks
    if (opts.template && opts.template !== '') {
      await collect(_.join(
        opts.PATHS.global.templates,
        opts.template,
        opts.PATHS.local.tasks), 'template')
    }

    // global tasks
    await collect(_.join(opts.PATHS.global.tasks, opts.PATHS.local.tasks), 'global')

    // locals
    await collect(_.cwd(opts.PATHS.local.tasks), 'local')

    if (justAvailable) {
      for (let item of names.template.values()) {
        if (names.local.has(item)) {
          names.template.delete(item)
        }
      }
      for (let item of names.global.values()) {
        if (names.local.has(item)) {
          names.global.delete(item)
        }
        if (names.template.has(item)) {
          names.global.delete(item)
        }
      }
    }

    if (justNames) {
      Object.keys(names).map(item => {
        names[item] = Array.from(names[item]) // Set => Array
          // alias
        if (names[item].length) {
          for (let i = 0, len = names[item].length; i < len; i++) {
            let alias = ''
            let description = ''
            if (opts.alias) {
              Object.keys(opts.alias).map(a => {
                if (opts.alias[a] === names[item][i]) {
                  alias = a
                }
              })
            }

            names[item][i] = {
              name: names[item][i],
              alias: alias,
              desc: description
            }
          }
        }
      })
    }
    return justNames ? names : _this.tasks
  }

  run(name, ctx, taskObj) {
    const taskDir = path.dirname(taskObj.path)
    const tmpl = ctx.options.template
    if (!tmpl) {
      // if is not a fbi template, just require the file
      try {
        return require(taskObj.path)
      } catch (err) {
        if (err.message.includes('ctx is not defined')) {
          ctx.log('This is not a project base on FBI template, there is no global variable named "ctx"', -1)
        }
        console.log(err)
      }
    }

    // if is a fbi template
    tmpl && ctx.log(`This project is base on template '${_.colors().yellow(tmpl)}'.`)
    ctx.log(`Running ${taskObj.type} task "${taskObj.name} ${taskObj.params}"...`, 1)

    return vmRunner(taskObj.path, {
      modulePaths: [
        path.join(process.cwd(), 'node_modules'),
        tmpl ?
        path.join(ctx.options.PATHS.global.templates, tmpl, 'node_modules') :
        path.join(ctx.options.PATHS.global.tasks, 'node_modules')
      ],
      ctx: ctx
    })
  }
}