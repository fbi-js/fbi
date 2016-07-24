import {version} from '../package.json'
import Module from './module'
import Store from './store'
import Parser from './parser'
import {getOptions} from './helpers/options'
import {cwd, exist, existSync, log, merge, read, install} from './helpers/utils'

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

      // modules
      // const dbTasks = new Store('tasks')
      // const dbTemplates = new Store('templates')
      // const pathTasks = cwd('./fbi/tasks.js')
      // const existUserTasks = await exist(pathTasks)
      // const userTasks = existUserTasks ? require(pathTasks) : {}
      // this.tasks = merge(dbTasks.all(), userTasks)
      // this.templates = dbTemplates.all() || {}

      // const usrTasks = require(_.dir(`${this.config.paths.data_templates}/${this.config.template || 'basic'}/${this.config.paths.tasks}`))
      // this.add(usrTasks, false)
    } catch (e) {
      log(e)
    }
  }

  async task() {
    if (!this.next) return

    try {
      const dbTasks = new Store('tasks')
      const pathTasks = cwd('./fbi/tasks.js')
      const existUserTasks = await exist(pathTasks)
      const source = await read(pathTasks)
      const parser = new Parser(source)
      const deps = parser.splitDependencies()
      let needinstall = []
      deps.globals.map(dep => {
        try {
          require(cwd('node_modules', dep)) // test module installed
        } catch (e) {
          needinstall.push(dep)
        }
      })

      if (needinstall.length) {
        await install(needinstall, process.cwd(), 'npm', '--save-dev --registry=https://registry.npm.taobao.org')

      }
    } catch (e) {
      log(e)
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
