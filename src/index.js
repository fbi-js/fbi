import fs from 'fs'
// fbi assets
import config from './config'
import * as _ from './utils'
// fbi tasks
import create from './tasks/create'
import serve from './tasks/serve'
import build from './tasks/build'

const defTasks = [
  {
    name: 'new',
    short: 'n',
    fn: create
  },
  {
    name: 'build',
    short: 'b',
    fn: build
  },
  {
    name: 'serve',
    short: 's',
    fn: serve
  }
]

class Fbi {

  constructor (...args) {
    this._ = _
    this.config = config
    this.tasks = []
    this.addTask(defTasks)
  }

  run (uCmds) {
    const argvs = uCmds || this.argvs
    let cmds = []
    let cmdsExecuted = []

    if (typeof argvs === 'string') {
      cmds.push(argvs)
    } else {
      cmds = argvs
    }

    for (let cmd of cmds) {
      this.tasks.map(task => {
        if (cmd === task.name || cmd === task.short) {
          cmdsExecuted.push(cmd)
          this._.log(`Running task '${task.name}'`)
          task.fn(this)
        }
      })
    }

    let difference = cmds.concat(cmdsExecuted).filter(v => !cmds.includes(v) || !cmdsExecuted.includes(v))
    if (difference.length) {
      this._.log(`Error: Commands '${difference}' not found.`)
    }
  }

  addTask (task) {
    if (Array.isArray(task)) {
      this.tasks = this.tasks.concat(task)
    } else {
      this.tasks.push(task)
    }
  }

}

export default Fbi

// constructor(){
//   (async function() {
//     console.log('async in')
//     await _this.mergeCfg()
//   }())
//   this.init()
// }

// static staticMethod () {
//   return 'static method'
// }
