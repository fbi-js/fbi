// fbi assets
import config from './config'
import * as _ from './utils'
import Store from './store'

const dbTasks = new Store('tasks')
const dbTemplates = new Store('templates')

const defs = {
  new: {
    name: 'new',
    module: 'create'
  },
  build: {
    name: 'build',
    short: 'b',
    module: 'build'
  },
  serve: {
    name: 'serve',
    short: 's',
    module: 'serve'
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

    dbTasks.set(defs)
    this.tasks = dbTasks.all() || {}

    dbTemplates.set(tdefs)
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
      if(task){
        if (task.fn) {
          cmdsExecuted.push(cmd)
          log(`Running task '${cmd}'...`, 1)

          try {
              task.fn(this)
          } catch (e) {
            log(`Task function error`, 0)
          }
        }else if (task.module) {
          cmdsExecuted.push(cmd)
          log(`Running task '${cmd}'...`, 1)

          try {
              require(task.module)(this)
          } catch (e) {
            log(`Module not found: '${task.module}'`, 0)
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
    Object.keys(any).map(a => {
      // tasks
      if(any[a].fn || any[a].module){
        this.tasks[a] = any[a] // deepth: 1
      }

      if(typeof any[a] === 'string'){
        this.templates[a] = any[a]
      }
    })


  }

}
