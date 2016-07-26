import path from 'path'
import {version} from '../package.json'
import Store from './store'
import Parser from './parser'
import Task from './task'
import {getOptions} from './helpers/options'
import {cwd, dir, join, exist, existSync, log, merge, read, write, install, copyFile} from './helpers/utils'

const task = new Task()

let helps =
  `
   Usage:

     fbi [task]
     fbi new [template]

   Options:

     -h, --help        output usage information
     -v, --version     output the version number
     rm, remove        remove tasks or templates

   Tasks & Templates

     fbi ls
`

export default class Cli {
  constructor(argvs) {
    this.argvs = argvs
    this.next = true
    this.log = log
    this.dependencies = {}

    ; (async () => {

      this.version()

      this.help()

      await this.config()
      await this.list()

      // await this.install()

      await this.run()
    })()

  }

  version() {
    if (!this.next) return

    if (this.argvs[0] === '-v'
      || this.argvs[0] === '--verison') {
      this.next = false
      console.log(version)
    }
  }

  help() {
    if (!this.next) return

    if (!this.argvs.length
      || this.argvs[0] === '-h'
      || this.argvs[0] === '--help') {
      this.next = false
      console.log(helps)
    }
  }

  async config() {
    if (!this.next) return

    try {
      // options
      const pathConfig = cwd('./fbi/config.js')
      const existUserOptions = await exist(pathConfig)
      const userOptions = existUserOptions ? require(pathConfig) : null
      this.options = getOptions(userOptions)
    } catch (e) {
      log(e)
    }
  }

  async task() {
    if (!this.next) return

    try {
      const dbTasks = new Store('tasks')
      // let needinstall = {}
      // let userPks
      const templateDir = dir('data/templates/', this.options.template)
      const existTemplate = await exist(templateDir)
      const templateTasksPath = join(templateDir, 'fbi/tasks.js')

      // // template default tasks
      // if (existTemplate) {
      //   const hasDefaultTasks = await exist(templateTasksPath)
      //   if (hasDefaultTasks) {
      //     const source = await read(templateTasksPath)
      //     const parser = new Parser(source)
      //     const deps = parser.splitDependencies()
      //     deps.globals.map(dep => {

      //       try {
      //         require.resolve(dep)
      //       } catch (err) {
      //         try {
      //           // require(join(templateDir, 'node_modules', dep)) // test module installed
      //           require.resolve(join(templateDir, 'node_modules', dep))
      //         } catch (e) {
      //           needinstall[dep] = '*'
      //         }
      //       }

      //     })
      //   }
      // }

      // // user tasks
      const userDir = cwd()
      // try {
      //   userPks = require(join(userDir, 'package.json'))
      // } catch (e) {
      //   userPks = {
      //     dependencies: {}
      //   }
      // }
      const userTasksPath = join(userDir, 'fbi/tasks.js')
      // const hasUserTasks = await exist(userTasksPath)
      // if (hasUserTasks) {
      //   const source = await read(userTasksPath)
      //   const parser = new Parser(source)
      //   const deps = parser.splitDependencies()
      //   deps.globals.map(dep => {
      //     try {
      //       require.resolve(dep) // global or native module
      //     } catch (err) {
      //       try {
      //         // require(join(templateDir, 'node_modules', dep)) // test module installed
      //         require.resolve(join(templateDir, 'node_modules', dep))
      //         userPks['dependencies'][dep] = '*'
      //       } catch (e) {
      //         if (userPks['dependencies'][dep]) {
      //           needinstall[dep] = userPks['dependencies'][dep]
      //         } else {
      //           userPks['dependencies'][dep] = '*'
      //           needinstall[dep] = '*'
      //         }
      //       }
      //     }
      //   })
      // }

      // if (Object.keys(needinstall).length) {
      //   await install(needinstall, templateDir, this.options.npm.alias, this.options.npm.options)
      // }

      // add tasks
      log(templateTasksPath)
      if (existTemplate) {
        dbTasks.set(require(templateTasksPath))
      }

      if (hasUserTasks) {
        // copy
        const dest = join(templateDir, 'fbi/tmp', path.basename(userTasksPath))
        log(userTasksPath)
        log(dest)
        await copyFile(userTasksPath, dest)
        dbTasks.set(require(dest))
      }

      this.tasks = dbTasks.all()
      log(this)

      // write user package.json
      write(join(userDir, 'package.json'), JSON.stringify(userPks, null, 2))

    } catch (e) {
      log(e)
    }
  }

  async install() {
    if (!this.next) return

    if (this.argvs[0] === 'i' || this.argvs[0] === 'install') {
      let needinstall = {}
      let userPks
      const templateDir = dir('data/templates/', this.options.template)
      const existTemplate = await exist(templateDir)
      const templateTasksPath = join(templateDir, 'fbi/tasks.js')

      // template default tasks
      if (existTemplate) {
        const hasDefaultTasks = await exist(templateTasksPath)
        if (hasDefaultTasks) {
          const source = await read(templateTasksPath)
          const parser = new Parser(source)
          const deps = parser.splitDependencies()
          deps.globals.map(dep => {

            try {
              require.resolve(dep)
            } catch (err) {
              try {
                // require(join(templateDir, 'node_modules', dep)) // test module installed
                require.resolve(join(templateDir, 'node_modules', dep))
              } catch (e) {
                needinstall[dep] = '*'
              }
            }

          })
        }
      }

      // user tasks
      const userDir = cwd()
      try {
        userPks = require(join(userDir, 'package.json'))
      } catch (e) {
        userPks = {
          dependencies: {}
        }
      }
      const userTasksPath = join(userDir, 'fbi/tasks.js')
      const hasUserTasks = await exist(userTasksPath)
      if (hasUserTasks) {
        const source = await read(userTasksPath)
        const parser = new Parser(source)
        const deps = parser.splitDependencies()
        deps.globals.map(dep => {
          try {
            require.resolve(dep) // global or native module
          } catch (err) {
            try {
              // require(join(templateDir, 'node_modules', dep)) // test module installed
              require.resolve(join(templateDir, 'node_modules', dep))
              userPks['dependencies'][dep] = '*'
            } catch (e) {
              if (userPks['dependencies'][dep]) {
                needinstall[dep] = userPks['dependencies'][dep]
              } else {
                userPks['dependencies'][dep] = '*'
                needinstall[dep] = '*'
              }
            }
          }
        })
      }

      if (Object.keys(needinstall).length) {
        await install(needinstall, templateDir, this.options.npm.alias, this.options.npm.options)
      }
    }
  }

  create() {
    if (!this.next) return

    if (this.argvs[0] === 'new') {
      let mod = this.argvs[1] ? this.argvs[1].match(/^[^\\/:*""<>|,]+$/i) : null
      mod = mod ? mod[0] : null

      try {

        if (this.templates[mod]) {
          log(`Installing template '${mod}' ...`, 1)
          const src = this._.dir(this.config.paths.data, 'templates', mod, path.sep)
          const dst = this._.cwd(path.sep)

          // copy(src, dst)
          copy(src, dst, ['package.json', 'node_modules'])
        } else {
          if (!mod) {
            log('Invalid template name', 0)
            show(this)
          } else {
            log(`Template '${mod}' not found`, 0)
          }
        }
      } catch (e) {
        log(e)
      }
      this.next = false
    }

  }

  remove() {
    if (!this.next) return

    if (this.argvs[0] === 'rm'
      || this.argvs[0] === 'remove') {
      this.next = false
      const mods = this.argvs.slice(1)
      if (!mods.length) {
        show(this)
      }
      for (const mod of mods) {
        if (this.tasks[mod]) {
          if (this.tasks[mod].module.indexOf('.js') > 0) { // fn task
            // del task
            const _path = this._.dir(this.tasks[mod].module.replace('../', ''))
            const exist = this._.existSync(_path)
            if (exist) {
              fs.unlinkSync(_path)
              dbTasks.del(mod)
              log(`Task module '${mod}' removed`, 1)
            } else {
              log(`Task module '${mod}' not found`, 0)
            }
          } else {
            dbTasks.del(mod)
            // TODO: uninstall?
            log(`Task module '${mod}' removed`, 1)
          }
        } else if (this.templates[mod]) {
          // del template
          dbTemplates.del(mod)
          log(`Template '${mod}' removed`, 1)
        } else {
          log(`Module '${mod}' not found`, 0)
        }
      }
    }
  }

  async list() {
    if (!this.next) return

    if (this.argvs[0] === 'ls'
      || this.argvs[0] === 'list') {
      this.next = false

      const all = await task.all(true)
      console.log(all.join('\n'))
    }
  }

  async run() {
    if (!this.next) return

    const cmds = this.argvs
    try {
      cmds.map(async (cmd) => {
        const taskCnt = await task.get(cmd)
        if (taskCnt) {
          log(`Running task '${cmd}'...`, 1)
          task.run(cmd, this, taskCnt)
        } else {
          log(`Task not found: '${cmd}'`, 0)
        }
      })
    } catch (e) {
      log(`Task function error`, 0)
      log(e)
    }
  }

}