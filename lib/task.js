const fs = require('fs')
const vm = require('vm')
const path = require('path')
const Module = require('module')
const vmr = require('./helpers/vmr')
const _ = require('./helpers/utils')

module.exports = class Task {

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
      await find(_.cwd(opts.paths.tasks, name), type)
    }

    // find in template
    if (!found && opts.template.name) {
      await find(_.join(
        opts.DATA_TEMPLATES,
        opts.template.name,
        opts.paths.tasks,
        name), 'template')
    }

    // find in global
    if (!found || type === 'global') {
      await find(_.join(opts.DATA_TASKS, opts.paths.tasks, name), 'global')
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
      if (await _.exist(_dir)) {
        let _modules = await _.readDir(_dir)
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
    if (opts.template && opts.template.name) {
      await collect(_.join(
        opts.DATA_TEMPLATES,
        opts.template.name,
        opts.paths.tasks), 'template')
    }

    // global tasks
    await collect(_.join(opts.DATA_TASKS, opts.paths.tasks), 'global')

    // locals
    await collect(_.cwd(opts.paths.tasks), 'local')

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

    // console.log(names)

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

  async run(name, ctx, taskObj) {
    const opts = ctx.options
    const taskDir = path.dirname(taskObj.path)
    const tmpl = opts.template ? (opts.template.name || '') : ''
    let params = ''
    const prefix = opts.TASK_PARAM_PREFIX || '-'
    if (taskObj.params && Array.isArray(taskObj.params)) {
      if (taskObj.params.length === 1) {
        params = prefix + taskObj.params + ' '
      } else {
        const paramsArr = taskObj.params.map(item => prefix + item)
        params = paramsArr.join(' ') + ' '
      }
    }
    let logMsg = `Running ${taskObj.type} task ${_.style.bold(_.style.cyan(taskObj.name))} ${_.style.bold(_.style.cyan(params))}`
    if (tmpl) {
      logMsg += `in template ${_.style.bold(_.style.cyan(tmpl))}`
    }

    _.log(logMsg)

    vmr(taskObj.path, {
      modulePaths: [
        path.join(process.cwd(), 'node_modules'),
        tmpl ?
        path.join(opts.DATA_TEMPLATES, tmpl, 'node_modules') :
        path.join(opts.DATA_TASKS, 'node_modules')
      ],
      ctx
    })
  }
}

// about vm instanceof
// > vm.runInNewContext('new Array', { Array: Array }) instanceof Array
// true
// > vm.runInNewContext('[]', { Array: Array }) instanceof Array
// false

// The new context gets its own RegExp and set of built-ins.
// RegExp , [] and Array, {} and Object, and function(){} and Function