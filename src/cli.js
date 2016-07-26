import path from 'path'
import {version} from '../package.json'
import Store from './store'
import Parser from './parser'
import Task from './task'
import {getOptions} from './helpers/options'
import {cwd, dir, join, exist, existSync, readDir, log, merge, read, write, install, copyFile, isTask, isNotConfigFile} from './helpers/utils'

const task = new Task()

let helps =
  `
    Usage:

      fbi [command]         run command
      fbi [task]            run a local preference task
      fbi [task] -g         run a global task
      fbi new [template]    init a new template

    Commands:

      -h, --help            output usage information
      -v, --version         output the version number
      rm, remove            remove tasks or templates
`

export default class Cli {
  constructor(argvs) {
    this.argvs = argvs
    this.next = true
    this.log = log
    this.dependencies = {}

      ; (async () => {

        this.version()
        await this.help()
        await this.config()
        await this.install()
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

  async help() {
    if (!this.next) return

    if (!this.argvs.length
      || this.argvs[0] === '-h'
      || this.argvs[0] === '--help') {
      this.next = false

      const all = await task.all(true)
      helps += `
    Tasks:
    `
      if (all.globals.length) {
        all.globals.map(item => {
          helps += `
      ${item} <global>`
        })
      }
      if (all.locals.length) {
        all.locals.map(item => {
          helps += `
      ${item} <local>`
        })
      }
      helps += `
      `
      console.log(helps)
    }
  }

  async config() {
    if (!this.next) return

    try {
      // options
      const pathConfig = cwd('./fbi/config.js')
      this.isfbi = await exist(pathConfig)
      const userOptions = this.isfbi ? require(pathConfig) : null
      this.options = getOptions(userOptions)
    } catch (e) {
      log(e)
    }
  }

  async install() {
    if (!this.next) return

    if (this.argvs[0] === 'i' || this.argvs[0] === 'install') {
      this.next = false

      let dependencies = {}
      let needinstall = {}

      // 1. local dependencies
      // parser task files
      // write deps into fbi/config.js => dependencies
      if (Object.keys(this.options.dependencies).length) {
        dependencies = this.options.dependencies
      }

      const all = await task.all()
      let deps

      const allTasks = Object.keys(all)
      if (allTasks.length) {
        allTasks.map(item => {
          let parser = new Parser(all[item])
          deps = parser.getDependencies()
        })
      }

      deps.map(item => {
        if (!dependencies[item]) {
          dependencies[item] = '*'
        }
      })

      // needinstall = merge({}, dependencies)
      needinstall = JSON.parse(JSON.stringify(dependencies));

      let templateDir = dir('data/templates/basic/node_modules')

      Object.keys(dependencies).map(item => {
        try {
          // native module or global module
          require.resolve(item)
          delete dependencies[item]
          // TODO: why?
          delete needinstall[item]
        } catch (err) {
          try {
            require.resolve(join(templateDir, 'node_modules', item))
            delete needinstall[item]
          } catch (e) {
          }
        }
      })

      if (Object.keys(needinstall).length) {
        await install(needinstall, templateDir, this.options.npm.alias, this.options.npm.options)
      }

      // write
      let userConfig = await read(cwd('fbi/config.js'))
      // TODO
      // log(userConfig)
      // userConfig['dependencies'] = dependencies
      // write(cwd('fbi/config.js'), JSON.stringify(userConfig, null, 2))

      // install dependencies

      // 2. global dependencies
    }
  }

  create() {
    if (!this.next) return

    const dbTemplates = new Store('templates')
    this.templates = dbTemplates.all()
    log(this.templates)

    if (this.argvs[0] === 'new') {
      log('new===')
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

  async run() {
    if (!this.next) return

    let cmds = this.argvs
    if (this.argvs.length > 0) {
      let isGlobal
      if (this.argvs[1] === '-g') {
        isGlobal = true
      }
      try {
        cmds = cmds.filter(isTask)
        cmds.map(async (cmd) => {
          const taskObj = await task.get(cmd, isGlobal)
          if (taskObj.cnt) {
            log(`Running ${taskObj.type} task '${cmd}'...`, 1)
            task.run(cmd, this, taskObj.cnt)
          } else {
            log(`Task not found: '${cmd}${isGlobal ? ' <global>' : ''}'`, 0)
          }
        })
      } catch (e) {
        log(`Task function error`, 0)
        log(e)
      }
    }
  }

}

// async task() {
//   if (!this.next) return

//   try {
//     const dbTasks = new Store('tasks')
//     // let needinstall = {}
//     // let userPks
//     const templateDir = dir('data/templates/', this.options.template)
//     const existTemplate = await exist(templateDir)
//     const templateTasksPath = join(templateDir, 'fbi/tasks.js')

//     // // template default tasks
//     // if (existTemplate) {
//     //   const hasDefaultTasks = await exist(templateTasksPath)
//     //   if (hasDefaultTasks) {
//     //     const source = await read(templateTasksPath)
//     //     const parser = new Parser(source)
//     //     const deps = parser.splitDependencies()
//     //     deps.globals.map(dep => {

//     //       try {
//     //         require.resolve(dep)
//     //       } catch (err) {
//     //         try {
//     //           // require(join(templateDir, 'node_modules', dep)) // test module installed
//     //           require.resolve(join(templateDir, 'node_modules', dep))
//     //         } catch (e) {
//     //           needinstall[dep] = '*'
//     //         }
//     //       }

//     //     })
//     //   }
//     // }

//     // // user tasks
//     const userDir = cwd()
//     // try {
//     //   userPks = require(join(userDir, 'package.json'))
//     // } catch (e) {
//     //   userPks = {
//     //     dependencies: {}
//     //   }
//     // }
//     const userTasksPath = join(userDir, 'fbi/tasks.js')
//     // const hasUserTasks = await exist(userTasksPath)
//     // if (hasUserTasks) {
//     //   const source = await read(userTasksPath)
//     //   const parser = new Parser(source)
//     //   const deps = parser.splitDependencies()
//     //   deps.globals.map(dep => {
//     //     try {
//     //       require.resolve(dep) // global or native module
//     //     } catch (err) {
//     //       try {
//     //         // require(join(templateDir, 'node_modules', dep)) // test module installed
//     //         require.resolve(join(templateDir, 'node_modules', dep))
//     //         userPks['dependencies'][dep] = '*'
//     //       } catch (e) {
//     //         if (userPks['dependencies'][dep]) {
//     //           needinstall[dep] = userPks['dependencies'][dep]
//     //         } else {
//     //           userPks['dependencies'][dep] = '*'
//     //           needinstall[dep] = '*'
//     //         }
//     //       }
//     //     }
//     //   })
//     // }

//     // if (Object.keys(needinstall).length) {
//     //   await install(needinstall, templateDir, this.options.npm.alias, this.options.npm.options)
//     // }

//     // add tasks
//     log(templateTasksPath)
//     if (existTemplate) {
//       dbTasks.set(require(templateTasksPath))
//     }

//     if (hasUserTasks) {
//       // copy
//       const dest = join(templateDir, 'fbi/tmp', path.basename(userTasksPath))
//       log(userTasksPath)
//       log(dest)
//       await copyFile(userTasksPath, dest)
//       dbTasks.set(require(dest))
//     }

//     this.tasks = dbTasks.all()
//     log(this)

//     // write user package.json
//     write(join(userDir, 'package.json'), JSON.stringify(userPks, null, 2))

//   } catch (e) {
//     log(e)
//   }
// }

async function install_bak() {
  if (!this.next) return

  this.next = false

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
          // try {
          //   // require(join(templateDir, 'node_modules', dep)) // test module installed
          //   return require.resolve(join(templateDir, 'node_modules', dep))
          // } catch (err) {
          //   // if (err.code === 'MODULE_NOT_FOUND') {
          //   needinstall[dep] = '*'
          //   // }
          // }

          try {
            // native module or global module
            return require.resolve(dep)
          } catch (err) {
            try {
              // require.resolve(join(templateDir, 'node_modules', dep))
              // require(join(templateDir, 'node_modules', dep)) // if local modules installed
              return require.resolve(join(templateDir, 'node_modules', dep))
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
    let userPkgs

    if (hasUserTasks) {
      userPkgs = require(join(userDir, 'package.json'))
      const source = await read(userTasksPath)
      const parser = new Parser(source)
      const deps = parser.splitDependencies()
      deps.globals.map(dep => {
        if (!userPkgs['dependencies'][dep]) {
          userPkgs['dependencies'][dep] = '*'
        }

        try {
          // native module or global module
          return require.resolve(dep)
        } catch (err) {
          try {
            // require.resolve(join(templateDir, 'node_modules', dep))
            // require(join(templateDir, 'node_modules', dep)) // if local modules installed
            return require.resolve(join(templateDir, 'node_modules', dep))
          } catch (e) {
            needinstall[dep] = userPkgs['dependencies'][dep]
          }
        }


      })
    }

    // log(needinstall)
    // write
    write(join(userDir, 'package.json'), JSON.stringify(userPkgs, null, 2))

    // TODO: split globals & locals, globals=> --save; locals=> ''
    // log(Module)
    if (Object.keys(needinstall).length) {
      await install(needinstall, templateDir, this.options.npm.alias, this.options.npm.options)
    }

    // add tasks
    if (existTemplate) {
      dbTasks.set(require(templateTasksPath))
    }

    if (hasUserTasks) {
      // TODO: deal with user tasks's `require`

      // or Copy to template folder
      const dest = dir(`data/templates/${this.options.template}/fbi/tmp/`)
      // copy(userTasksPath, dest)
      await copyFile(userTasksPath, join(dest, path.basename(userTasksPath)))
      const tmp = join(dest, path.basename(userTasksPath))
      // log(tmp)
      const t = require(tmp)
      dbTasks.set(t)
    }

    this.tasks = dbTasks.all()

  }
}