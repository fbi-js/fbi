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

export default class Fbi {

  constructor() {
    this._ = _
    this.config = config
    this.tasks = []
    this.templates = []
    this.addTask(defTasks)
  }

  run(uCmds) {
    const argvs = uCmds || this.argvs
    let cmds = []
    let cmdsExecuted = []

    typeof argvs === 'string' ?
      cmds.push(argvs)
      : cmds = argvs

    for (let cmd of cmds) {
      this.tasks.map(task => {
        if (cmd === task.name || cmd === task.short) {
          cmdsExecuted.push(cmd)
          this._.log(`Running task '${task.name}'`)
          task.fn(this)
        }
      })
    }

    let diff = cmds.concat(cmdsExecuted).filter(v => {
      return !cmds.includes(v) || !cmdsExecuted.includes(v)
    })
    if (diff.length) {
      this._.log(`Error: Commands '${diff}' not found.`)
    }
  }

  addTask(task) {
    Array.isArray(task)
      ? this.tasks = this.tasks.concat(task)
      : this.tasks.push(task)
  }
}
