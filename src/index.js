import fs from 'fs'
// fbi assets
import config from './config'
import * as _ from './utils'
// fbi tasks
import help from './tasks/help'
import create from './tasks/create'
import serve from './tasks/serve'
import build from './tasks/build'
import version from './tasks/version'

const defTasks = [
  {
    name: '--help',
    short: '-h',
    fn: help
  },
  {
    name: '--version',
    short: '-v',
    fn: version
  },
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

  constructor () {
    this._ = _
    this.cfg = config
    this.help = help
    this.tasks = []

    // (async function() {
    //   console.log('async in')
    //   await _this.mergeCfg()
    // }())
    this.init()
    this.addTask(defTasks)
  }

  run (argvs) {
    let cmds = []
    if (!argvs.length) {
      this.help(this)
      return
    }

    if (typeof argvs === 'string') {
      cmds.push(argvs)
    } else {
      cmds = argvs
    }

    const utilTasks = ['-h', '--help', '-v', '--verison'] // don't log

    for (let cmd of cmds) {
      this.tasks.map(task => {
        if (cmd === task.name || cmd === task.short) {
          if (!utilTasks.includes(task.name) && !utilTasks.includes(task.short)) {
            console.log(`Running task '${task.name}'`)
          }
          task.fn(this)
        }
      })
    }
  }

  init () {
    // is fbi or not
    // get user config
    try {
      let _path = this._.cwd(this.cfg.paths.options)
      fs.accessSync(_path, fs.R_OK | fs.W_OK)
      this.isFbi = true
      let usrCfg = require(_path)
      this._.merge(this.cfg, usrCfg)
    } catch(e) {
      this.isFbi = false
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
