import fs from 'fs'
import path from 'path'
import vm from 'vm'
import {dir, join, cwd, readDir, log, read, exist} from './helpers/utils'

function isNotConfigFile(file) {
  return file !== 'config.js'
}

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

  set(obj) {

  }

  del(name) {

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
      }
      // if (t_modules.length) {
      //   await Promise.all(t_modules.map(async (item) => {
      //     _this.tasks[item] = await read(join(t_task_dir, item, 'index.js'))
      //   }))
      // }
    }

    // locals
    const u_task_dir = cwd('fbi')
    let u_exist = await exist(u_task_dir)
    if (u_exist) {
      let u_modules = await readDir(u_task_dir)
      u_modules = u_modules.filter(isNotConfigFile)
      u_modules.map(item => {
        item = path.basename(item, '.js')
        names.locals.add(item)
        // if (names.globals.has(item)) {
        //   // names.locals.push(item)
        // }
      })
      // names.locals = Array.from(new Set(names.locals)) // 去重

      // let u_tasks = []
      // if (u_modules.length) {
      //   await Promise.all(u_modules.map(async (item) => {
      //     if (justNames) {
      //       u_tasks.push(path.basename(item, '.js'))
      //     } else {
      //       try {
      //         _this.tasks[path.basename(item, '.js')] = await read(join(u_task_dir, item))
      //       } catch (e) {
      //         log(e)
      //       }
      //     }
      //   }))
      // }

      // if (justNames) {
      //   names.locals = names.locals.concat(u_modules)
      //   names.locals = Array.from(new Set(names.locals))
      // }
    }
    names.globals = Array.from(names.globals)
    names.locals = Array.from(names.locals)

    return justNames ? names : _this.tasks
  }

  run(name, ctx, task) {
    let taskCnt = task || this.tasks[name]

    function requireRelative(mod) {
      try {
        return require(mod) // native module
      } catch (err) {
        const global_path = dir('data/templates/basic/node_modules', mod)
        return require(global_path)
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