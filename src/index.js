import fs from 'fs'
// fbi assets
import config from './config'
import * as _ from './utils'
import Store from './store'
import install from './utils/install'
// import fbc from 'fbi-create'
// console.log(fbc)

const dbTasks = new Store('tasks')
const dbTemplates = new Store('templates')

const defs = {
  new: {
    desc: 'create a fbi project',
    module: 'pm2'
  },
  build: {
    desc: 'build the fbi project',
    module: 'fbi-build'
  },
  serve: {
    desc: 'serve the project or files',
    module: 'gulp'
  }
}

const tdefs = {
  h5pc: 'http://google.com/h5pc',
  h5mobile: 'http://google.com/h5pc',
  vue: 'http://google.com/h5pc',
  react: 'http://google.com/h5pc',
  angular: 'http://google.com/h5pc'
}

export default class Fbi {

  constructor() {
    this._ = _
    this.config = config
    global.log = this.log = _.log
    delete _.log
    this.user = []

    // dbTasks.set(defs)
    this.tasks = dbTasks.all() || {}

    // dbTemplates.set(tdefs)
    this.templates = dbTemplates.all() || {}
  }

  run(uCmds) {
    const argvs = uCmds || this.argvs
    let cmds = []
    let cmdsExecuted = []

    typeof argvs === 'string' ?
      cmds.push(argvs)
      : cmds = argvs

    for (let cmd of cmds) {
      let task = this.tasks[cmd]
      if (task) {
        if (task.fn) {
          cmdsExecuted.push(cmd)
          log(`Running task '${cmd}'...`, 1)

          try {
            task.fn(this)
          } catch (e) {
            log(`Task function error`, 0)
          }
        } else if (task.module) {
          cmdsExecuted.push(cmd)
          log(`Running task '${cmd}'...`, 1)

          try {
            let target = require(task.module)
            if (typeof target === 'function') { // es5
              target(this)
            } else if (typeof target === 'object'
              && typeof target.default === 'function') { // es6
              target.default(this)
            }
          } catch (e) {
            // log(__dirname)
            log(`Module not found: '${task.module}'`)
            // install(this, task.module)
          }
        }
      }
    }

    let diff = cmds.concat(cmdsExecuted).filter(v => {
      return !cmds.includes(v) || !cmdsExecuted.includes(v)
    })
    if (diff.length) {
      log(`Commands not found: '${diff}'`, 0)
    }
  }

  // add anything
  add(any) {

    const tasks_path = this._.dir(this.config.paths.tasks)

    Object.keys(any).map(a => {

      if (any[a].fn) { // task require a function
        const name = `${tasks_path}/${a}.js`
        const cnt = 'module.exports = ' + any[a].fn.toString() // to commonJS

        delete any[a].fn
        any[a]['module'] = `.${this.config.paths.tasks}/${a}.js`
        this.tasks[a] = any[a]
        fs.writeFileSync(name, cnt)

      } else if (any[a].module) { // task require a npm module
        this.tasks[a] = any[a]

      } else if (typeof any[a] === 'string') { // templates
        this.templates[a] = any[a]
      }

    })

    // sync tasks
    dbTasks.set(this.tasks)
    dbTemplates.set(this.templates)
  }

}
