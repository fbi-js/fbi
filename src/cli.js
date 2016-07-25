import {version} from '../package.json'
import Module from './module'
import Store from './store'
import Parser from './parser'
import {getOptions} from './helpers/options'
import {cwd, dir, join, exist, existSync, log, merge, read, install} from './helpers/utils'

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
        // this.run()
        // log(this)
      })()


  }

  version() {
    if (!this.next) return

    if (this.argvs[0] === '-v'
      || this.argvs[0] === '--verison') {
      this.next = false
      log(version)
    }
  }

  help() {
    if (!this.next) return

    if (!this.argvs.length
      || this.argvs[0] === '-h'
      || this.argvs[0] === '--help') {
      this.next = false
      log('help')
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
      let needinstall = {}
      const defaultTmplDir = dir('data/templates/', this.options.template)
      const existDefaultTmpl = await exist(defaultTmplDir)
      const defaultTasksPath = join(defaultTmplDir, 'fbi/tasks.js')

      // template default tasks
      if (existDefaultTmpl) {
        const hasDefaultTasks = await exist(defaultTasksPath)
        if (hasDefaultTasks) {
          const source = await read(defaultTasksPath)
          const parser = new Parser(source)
          const deps = parser.splitDependencies()
          deps.globals.map(dep => {
            try {
              require(join(defaultTmplDir, 'node_modules', dep)) // test module installed
            } catch (e) {
              needinstall[dep] = '*'
            }
          })
          // dbTasks.set(require(defaultTasksPath))
        }
      }

      // user tasks
      const userDir = cwd()
      const userTasksPath = join(userDir, 'fbi/tasks.js')
      const hasUserTasks = await exist(userTasksPath)
      if (hasUserTasks) {
        const source = await read(userTasksPath)
        const parser = new Parser(source)
        const deps = parser.splitDependencies()
        deps.globals.map(dep => {
          try {
            // require.resolve(join(defaultTmplDir, 'node_modules', dep))
            require(join(defaultTmplDir, 'node_modules', dep)) // if local modules installed
          } catch (e) {
            needinstall[dep] = '*'
          }
        })
        // dbTasks.set(require(userTasksPath))
      }

      // log(needinstall)

      if (Object.keys(needinstall).length) {
        await install(needinstall, defaultTmplDir, 'npm', '--save-dev --registry=https://registry.npm.taobao.org')
      }

      log('=================')
      // add tasks
      if (existDefaultTmpl) {
        dbTasks.set(require(defaultTasksPath))
      }

      if (hasUserTasks) {
        dbTasks.set(require(userTasksPath))
      }

      this.tasks = dbTasks.all()
    } catch (e) {
      log(e)
    }
  }

  run() {
    if (!this.next) return
    log(this.tasks)

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
  }

  // get run() {
  //   // console.log(v)
  // }

  // run2(argvs){
  //   this.argvs = argvs
  //   console.log(this)
  //   // console.log(argvs)

  //   this.showHelp()
  //   // Cli.showHelp.call(this)
  // }

  static helps() {
    return [
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
  }

  showHelp() {
    console.log(this)
    // let msg = this.helps[0]
    // msg += `
    //  Tasks:`

    // const tasks = this.tasks
    // const tmpls = this.templates

    // console.log(tasks)

    // if (!Object.keys(tasks).length) {
    //   msg += `
    //    No available task.
    // `
    // } else {
    //   Object.keys(tasks).map(t => {
    //     msg += `
    //    ${t}:  ${tasks[t].desc}`
    //   })
    // }

    // msg += `

    //  Templates:`

    // if (!Object.keys(tmpls).length) {
    //   msg += `
    //    No available template.
    // `
    // } else {
    //   Object.keys(tmpls).map(t => {
    //     msg += `
    //    ${t}:  ${tmpls[t]}`
    //   })
    // }
    // msg += helps[1]

    // console.log(msg)
  }

  async init() {
    // Cli.showHelp()
    // this.argvs = argvs
    // this.next = true
    // await this.makeConfig()
    // this.makeTasks()
    // this.help()
    // this.version()
    // this.remove()
    // this.create()
  }

  async makeConfig() {
    try {
      // access user config
      const _path = _.cwd(this.config.paths.options)
      this.isFbi = await exist(_path)
      if (this.isFbi) {
        const usrCfg = require(_path)
        _.merge(this.config, usrCfg)
      }
    } catch (e) {
      _.log(e)
    }
  }

  makeTasks() {
    try {
      // access user tasks
      const usrTasks = require(_.dir(`${this.config.paths.data_templates}/${this.config.template || 'basic'}/${this.config.paths.tasks}`))
      this.add(usrTasks, false)
    } catch (e) {
      _.log(e)
      // if(e.code === 'MODULE_NOT_FOUND'){
      //   log(e.message)
      //   this.makeTasks()
      // }
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
