import fs from 'fs'
import path from 'path'
import colors from 'colors'
import Fbi from './index'
import Store from './store'
import copy from './utils/copy'
import pkg from '../package.json'

const dbTasks = new Store('tasks')
const dbTemplates = new Store('templates')

export default class Cli extends Fbi {

  constructor(argvs) {
    super()

    this.argvs = argvs
    global.log = this.log
    this.next = true
    this.init()

    // (async function (ctx) {
    //   log('async in')
    //   log(ctx.init)
    //   let a = await ctx.init()
    //   console.log(a)
    // } (this))
  }

  init() {
    this.makeConfig()
    this.makeTasks()
    this.help()
    this.version()
    this.remove()
    this.create()

    if (this.next) super.run()
  }

  makeConfig() {
    try {
      // access user config
      const _path = this._.cwd(this.config.paths.options)
      fs.accessSync(_path, fs.R_OK | fs.W_OK)
      this.isFbi = true
      const usrCfg = require(_path)
      this._.merge(this.config, usrCfg)
    } catch (e) {
      this.isFbi = false
    }
  }

  makeTasks() {
    try {
      // access user tasks
      // const _path = this._.cwd(this.config.paths.tasks)
      // log(_path)
      // fs.accessSync(_path, fs.R_OK | fs.W_OK)
      // const usrTasks = require(_path)
      const usrTasks = require(this._.dir(`${this.config.paths.data_templates}/${this.config.template || 'basic'}/${this.config.paths.tasks}`))
      this.add(usrTasks, false)
    } catch (e) {
      log(e)
      // if(e.code === 'MODULE_NOT_FOUND'){
      //   log(e.message)
      //   this.makeTasks()
      // }
    }
  }

  help() {
    if (!this.next) return

    if (!this.argvs.length
      || this.argvs[0] === '-h'
      || this.argvs[0] === '--help') {
      this.next = false
      show(this)
    }
  }

  version() {
    if (!this.next) return

    if (this.argvs[0] === '-v'
      || this.argvs[0] === '--verison') {
      this.next = false
      this.log(pkg.version)
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
