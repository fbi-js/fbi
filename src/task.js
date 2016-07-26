import fs from 'fs'
import path from 'path'
import vm from 'vm'
import {dir, join, cwd, readDir, log, read, exist} from './helpers/utils'

export default class Task {

  constructor() {
    this.tasks = {}
  }

  async get(name) {
    const _this = this
    let ret = false

    // locals
    const u_task_dir = cwd('fbi')
    let u_exist = await exist(u_task_dir)
    if (u_exist) {
      const u_modules = await readDir(u_task_dir)
      if (u_modules.length && u_modules.includes(name + '.js')) {
        ret = await read(join(u_task_dir, name + '.js'))
      }
    }

    // global tasks
    const t_task_dir = dir('data/tasks/')
    let t_exist = await exist(t_task_dir)
    if (t_exist) {
      const t_modules = await readDir(t_task_dir)

      if (t_modules.length && t_modules.includes(name)) {
        ret = ret ? ret : await read(join(t_task_dir, name, 'index.js'))
      }
    }

    return ret
  }

  set(obj) {

  }

  del(name) {

  }

  async all(justNames) {
    // const _this = this
    // try {
    //   // global tasks
    //   const t_task_dir = dir('data/tasks/')
    //   const t_modules = await readDir(t_task_dir)

    //   if (t_modules.length) {
    //     await Promise.all(t_modules.map(async (item) => {
    //       _this.tasks[item] = await read(join(t_task_dir, item, 'index.js'))
    //     }))
    //   }

    //   // locals
    //   const u_task_dir = cwd('fbi')
    //   let is_exist = await exist(u_task_dir)
    //   if (is_exist) {
    //     const u_modules = await readDir(u_task_dir)
    //     log(u_modules)
    //     if (u_modules.length) {
    //       await Promise.all(u_modules.map(async (item) => {
    //         _this.tasks[path.basename(item, '.js')] = await read(join(u_task_dir, item))
    //       }))
    //     }
    //   }
    //   return _this.tasks
    // } catch (e) {
    //   log(e)
    // }


    const _this = this
    let names = []

    // global tasks
    const t_task_dir = dir('data/tasks/')
    let t_exist = await exist(t_task_dir)
    if (t_exist) {
      const t_modules = await readDir(t_task_dir)

      if (justNames) {
        names = names.concat(t_modules)
      }

      if (t_modules.length && !justNames) {
        for (let item of t_modules) {
          try {
            _this.tasks[item] = await read(join(t_task_dir, item, 'index.js'))
          } catch (e) {
            log(e)
          }
        }
      }
    }

    // locals
    const u_task_dir = cwd('fbi')
    let u_exist = await exist(u_task_dir)
    if (u_exist) {
      const u_modules = await readDir(u_task_dir)
      let u_tasks = []

      if (u_modules.length) {
        for (let item of u_modules) {
          if (justNames) {
            u_tasks.push(path.basename(item, '.js'))
          } else {
            try {
              _this.tasks[path.basename(item, '.js')] = await read(join(u_task_dir, item))
            } catch (e) {
              log(e)
            }
          }
        }
      }

      if (justNames) {
        names = names.concat(u_tasks)
        names = Array.from(new Set(names))
      }
    }

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