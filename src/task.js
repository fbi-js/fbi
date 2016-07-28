import fs from 'fs'
import path from 'path'
import vm from 'vm'
import Module from './module'
import options from './options'
import { dir, join, cwd, readDir, log, read, exist,
  existSync, isTaskFile } from './helpers/utils'

export default class Task {

  constructor() {
    this.tasks = {}
  }

  async get(name, type, opts) {

    if (opts.alias && opts.alias[name]) {
      name = opts.alias[name]
      // Object.keys(opts.alias).map(item => {
      //   if (name === item) {
      //     name = opts.alias[item]
      //   }
      // })
    }

    // local task > tempalte task => global task

    let ret = {
      name: name,
      cnt: '',
      type: ''
    }

    // find in local
    if (type === 'local') {
      const u_path = cwd(opts.paths.tasks, name + '.js')
      let u_exist = existSync(u_path)
      if (u_exist) {
        ret.cnt = await read(u_path)
        ret.type = 'local'
      }
    }

    // find in template
    if (!ret.cnt && opts.template && opts.template !== '') {
      const u_path = dir(options.data_templates, opts.template, opts.paths.tasks, name + '.js')
      let u_exist = existSync(u_path)
      if (u_exist) {
        ret.cnt = await read(u_path)
        ret.type = 'template'
      }
    }

    // find in global
    if (!ret.cnt || type === 'global') {
      const u_path = dir(options.data_tasks, name, 'index.js')
      let u_exist = existSync(u_path)
      if (u_exist) {
        ret.cnt = await read(u_path)
        ret.type = 'global'
      }
    }

    return ret
  }

  async all(opts, justNames, justAvailable) {
    const _this = this
    let names = {
      locals: new Set(),
      globals: new Set(),
      template: new Set()
    }

    // template tasks
    if (opts.template && opts.template !== '') {
      const m_task_dir = dir(options.data_templates, opts.template, opts.paths.tasks)
      let m_exist = await exist(m_task_dir)
      if (m_exist) {
        let m_modules = await readDir(m_task_dir)
        m_modules = m_modules.filter(isTaskFile)

        if (justNames) {
          // names.template = new Set(m_modules)
          m_modules.map(item => {
            item = path.basename(item, '.js')
            names.template.add(item)
          })
        } else if (m_modules.length) {
          await Promise.all(m_modules.map(async (item) => {
            _this.tasks[path.basename(item, '.js')] = await read(join(m_task_dir, item))
          }))
        }
      }
    }

    // global tasks
    const t_task_dir = dir(options.data_tasks)
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
      u_modules = u_modules.filter(isTaskFile)

      if (justNames) {
        u_modules.map(item => {
          item = path.basename(item, '.js')
          names.locals.add(item)
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

    if (justAvailable) {
      for (let item of names.template.values()) {
        if (names.locals.has(item)) {
          names.template.delete(item)
        }
      }
      for (let item of names.globals.values()) {
        if (names.locals.has(item)) {
          names.globals.delete(item)
        }
        if (names.template.has(item)) {
          names.globals.delete(item)
        }
      }
    }

    if (justNames) {
      Object.keys(names).map(item => {
        names[item] = Array.from(names[item]) // Set => Array

        // alias
        for (let i = 0, len = names[item].length; i < len; i++) {
          let alias = ''
          if (opts.alias) {
            Object.keys(opts.alias).map(a => {
              if (opts.alias[a] === names[item][i]) {
                alias = a
              }
            })
          }

          names[item][i] = {
            name: names[item][i],
            alias: alias
          }
        }
      })
    }

    return justNames ? names : _this.tasks
  }

  run(name, ctx, taskObj) {
    let taskCnt = taskObj.cnt || this.tasks[name]
    const module = new Module(ctx.options)

    function requireRelative(mod) {
      // find mod path
      let mod_path = module.get(mod, taskObj.type)

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

    vm.runInThisContext(code, {
      filename: `${name}.js`,
      lineOffset: -3,
      displayErrors: true
    })(requireRelative, ctx)
  }
}