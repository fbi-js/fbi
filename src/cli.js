import colors from 'colors'
import Fbi from './index'
import Store from './store'
import pkg from '../package.json'

const dbTasks = new Store('tasks')
const dbTemplates = new Store('templates')

export default class Cli extends Fbi {

  constructor (argvs) {
    super()

    this.argvs = argvs
    global.log = this.log
    this.next = true
    this.init()
  }

  init () {
    this.makeConfig()
    this.makeTasks()
    this.help()
    this.version()
    this.remove()

    if (this.next) super.run()
  }

  makeConfig () {
    try {
      // access user config
      const _path = this._.cwd(this.config.paths.options)
      this._.fs.accessSync(_path, this._.fs.R_OK | this._.fs.W_OK)
      this.isFbi = true
      const usrCfg = require(_path)
      this._.merge(this.config, usrCfg)
    } catch (e) {
      this.isFbi = false
    }
  }

  makeTasks () {
    try {
      // access user tasks
      const _path = this._.cwd(this.config.paths.tasks)
      this._.fs.accessSync(_path, this._.fs.R_OK | this._.fs.W_OK)
      const usrTasks = require(_path)
      this.add(usrTasks, false)
    } catch (e) {}
  }

  help () {
    if (!this.next) return

    if (!this.argvs.length
      || this.argvs[0] === '-h'
      || this.argvs[0] === '--help') {
      this.next = false
      show(this)
    }
  }

  version () {
    if (!this.next) return

    if (this.argvs[0] === '-v'
      || this.argvs[0] === '--verison') {
      this.next = false
      this.log(pkg.version)
    }
  }

  remove () {
    if (!this.next) return

    if (this.argvs[0] === 'rm'
      || this.argvs[0] === 'remove') {
      this.next = false
      const mods = this.argvs.slice(1)
      for (const mod of mods) {
        if (this.tasks[mod]) {
          if (this.tasks[mod].module.indexOf('.js') > 0) { // fn task
            // del task
            const _path = this._.dir(this.tasks[mod].module.replace('../', ''))
            const exist = this._.existSync(_path)
            if (exist) {
              this._.fs.unlinkSync(_path)
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
function show (ctx) {
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
