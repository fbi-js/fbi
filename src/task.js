import fs from 'fs'
import path from 'path'
import vm from 'vm'
import Module from './module'
import {dir, join, cwd, readDir, log, read, exist, isNotConfigFile} from './helpers/utils'

export default class Task {

  constructor() {
    this.tasks = {}
  }

  async get(name, isGlobal) {
    const _this = this
    let ret = {
      cnt: '',
      type: ''
    }

    // locals
    if (!isGlobal) {
      const u_task_dir = cwd('fbi')
      let u_exist = await exist(u_task_dir)
      if (u_exist) {
        let u_modules = await readDir(u_task_dir)
        u_modules = u_modules.filter(isNotConfigFile)
        if (u_modules.length && u_modules.includes(name + '.js')) {
          ret.cnt = await read(join(u_task_dir, name + '.js'))
          ret.type = 'local'
        }
      }
    }

    if (!ret.cnt) {
      // global tasks
      const t_task_dir = dir('data/tasks/')
      let t_exist = await exist(t_task_dir)
      if (t_exist) {
        const t_modules = await readDir(t_task_dir)
        if (t_modules.length && t_modules.includes(name)) {
          ret.cnt = await read(join(t_task_dir, name, 'index.js'))
          ret.type = 'global'
        }
      }
    }

    return ret
  }

  async all(justNames) {
    const _this = this
    let names = {
      globals: new Set(),
      locals: new Set()
    }

    // global tasks
    const t_task_dir = dir('data/tasks/')
    let t_exist = await exist(t_task_dir)
    if (t_exist) {
      const t_modules = await readDir(t_task_dir)

      if (justNames) {
        // names.globals = names.globals.concat(t_modules)
        names.globals = new Set(t_modules)
      } else if (t_modules.length) {
        await Promise.all(t_modules.map(async (item) => {
          _this.tasks[item] = await read(join(t_task_dir, item, 'index.js'))
        }))
      }
    }

    // locals
    const u_task_dir = cwd('fbi')
    let u_exist = await exist(u_task_dir)
    if (u_exist) {
      let u_modules = await readDir(u_task_dir)
      u_modules = u_modules.filter(isNotConfigFile)

      if (justNames) {
        u_modules.map(item => {
          item = path.basename(item, '.js')
          names.locals.add(item)
          // if (names.globals.has(item)) {
          //   // names.locals.push(item)
          // }
        })
      } else if (u_modules.length) {
        await Promise.all(u_modules.map(async (item) => {
          try {
            _this.tasks[path.basename(item, '.js')] = await read(join(u_task_dir, item))
          } catch (e) {
            log(e)
          }
        }))
      }
      // names.locals = Array.from(new Set(names.locals)) // duplicate removal
    }
    if (justNames) {
      names.globals = Array.from(names.globals)
      names.locals = Array.from(names.locals)
    }

    return justNames ? names : _this.tasks
  }

  run(name, ctx, task) {
    let taskCnt = task || this.tasks[name]
    const module = new Module(ctx.options)

    function requireRelative(mod) {

      // find mod path
      let mod_path = module.get(mod)

      if (mod_path) {
        if (mod_path === 'global') {
          return require(mod) // native or global module
        } else {
          return require(join(mod_path, mod))
        }
      } else {
        log(`Module not found: ${mod}, try 'fbi install'`, 0)
      }
    }

    let code = `
    (function(require, ctx) {
      try {
        ${taskCnt}
      } catch (e) {
        console.log(e)
      }
    })`

    vm.runInThisContext(code, { displayErrors: true })(requireRelative, ctx)
  }
}