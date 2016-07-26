import path from 'path'
import {version} from '../package.json'
// import Module from './module'
import Store from './store'
import Parser from './parser'
import {getOptions} from './helpers/options'
import {cwd, dir, join, exist, existSync, log, merge, read, write, install, copyFile} from './helpers/utils'
import copy from './helpers/copy'

export default class Cli {
  constructor(argvs) {
    this.argvs = argvs
    this.next = true
    this.log = log

    this.version()
    this.help()

      ; (async () => {
        await this.config()
        await this.task()
        this.create()
        this.run()
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
      console.log(helps.join(''))
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

  async task() {
    if (!this.next) return

    try {
      const dbTasks = new Store('tasks')
      let needinstall = {}
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
          // dbTasks.set(require(templateTasksPath))
        }
      }

      // user tasks
      const userDir = cwd()
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
        // dbTasks.set(require(userTasksPath))
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

    } catch (e) {
      log(e)
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

  run() {
    if (!this.next) return

    const cmds = this.argvs
    try {
      cmds.map(cmd => {
        if (this.tasks[cmd]) {
          this.tasks[cmd].fn.call(this)
        }
      })
    } catch (e) {
      log(`Task function error`, 0)
      log(e)
    }
    this.next = false
  }

}


let helps = [
  `
   Usage:

     fbi [task]
     fbi new [template]

`,
  `

   Options:

     -h, --help        output usage information
     -v, --version     output the version number
     rm, remove        remove tasks or templates
`
]
// show tasks & templates
function show(ctx) {
  let msg = helps[0]
  msg += `
     Tasks:`

  const tasks = ctx.tasks
  const tmpls = ctx.templates

  console.log(tasks)

  if (!Object.keys(tasks).length) {
    msg += `
       No available task.
    `
  } else {
    Object.keys(tasks).map(t => {
      msg += `
       ${t}:  ${tasks[t].desc}`
    })
  }

  msg += `

     Templates:`

  if (!Object.keys(tmpls).length) {
    msg += `
       No available template.
    `
  } else {
    Object.keys(tmpls).map(t => {
      msg += `
       ${t}:  ${tmpls[t]}`
    })
  }
  msg += helps[1]

  ctx.log(msg)
}
