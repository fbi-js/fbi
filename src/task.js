import vm from 'vm'
import {
  dir, join, cwd, readDir, log, read, exist,
  existSync, isTaskFile, basename, isRelative
} from './helpers/utils'

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
    let ret = {
      name: name,
      cnt: '',
      type: '',
      path: ''
    }

    async function find(_path, _type) {
      _path = _path + '.js'
      let _exist = existSync(_path)
      if (_exist) {
        ret.cnt = await read(_path)
        ret.type = _type
        ret.path = _path
      }
    }

    // find in local
    if (type === 'local') {
      await find(cwd(opts.paths.tasks, name), type)
    }

    // find in template
    if (!ret.cnt && opts.template && opts.template !== '') {
      await find(join(
        opts.data.templates,
        opts.template,
        opts.paths.tasks,
        name), 'template')
    }

    // find in global
    if (!ret.cnt || type === 'global') {
      await find(join(opts.data.tasks, name), 'global')
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
      let _exist = await exist(_dir)
      let _modules
      if (_exist) {
        _modules = await readDir(_dir)
        _modules = _modules.filter(isTaskFile)
        if (justNames) {
          _modules.map(item => {
            item = basename(item, '.js')
            names[type].add(item)
          })
        } else if (_modules.length) {
          await Promise.all(_modules.map(async (item) => {
            _this.tasks[basename(item, '.js')] = await read(join(_dir, item))
          }))
        }
      }
    }

    // template tasks
    if (opts.template && opts.template !== '') {
      await collect(join(
        opts.data.templates,
        opts.template,
        opts.paths.tasks), 'template')
    }

    // global tasks
    await collect(join(opts.data.tasks), 'global')

    // locals
    await collect(cwd(opts.paths.tasks), 'local')

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
      })
    }

    return justNames ? names : _this.tasks
  }

  run(name, ctx, taskObj, module) {
    let taskCnt = taskObj.cnt || this.tasks[name]

    function requireResolve(mod) {
      // find mod path
      let mod_path = module.get(mod, taskObj.type)
      if (mod_path && mod_path !== 'global') {
        return require(join(mod_path, mod))
      } else {
        return mod ? require(mod) : require
      }
    }

    let code = `
    (function(require, ctx) {
      if(!ctx.next || ctx.next === 'false') return false;

      ctx.log('Running ${taskObj.type} task "${taskObj.name}${taskObj.params}"...', 1);
      try {
        ${taskCnt}
      } catch (e) {
        ctx.log('task function error', 0)
        ctx.log(e, 0)
      }
    })`

    vm.runInThisContext(code, {
      filename: `${taskObj.name}.js`,
      lineOffset: -3,
      displayErrors: true
    })(requireResolve, ctx)
  }
}