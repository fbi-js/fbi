import Cli from './cli'
import Parser from './parser'
// import Store from './store'
import { getOptions } from './helpers/options'
import { dir } from './helpers/utils'

// const dbTasks = new Store('tasks')
// const dbTemplates = new Store('templates')

export default class Fbi {
  constructor() {
    this.options = getOptions()

    // this.tasks = dbTasks.all() || {}
    // this.templates = dbTemplates.all() || {}

    this.Cli = Cli
    this.Parser = Parser
  }

  static get cli() {
    return Cli
  }

  run(cmds) {
    if (!cmds) {
      return
    }

    new Fbi.cli(typeof cmds === 'string' ? [cmds] : cmds)
  }

  // add(mods) {
  //   if (!mods) {
  //     return
  //   }

  //   new Fbi.module(typeof mods === 'string' ? [mods] : mods)
  // }

  // add anything
  add2(any, globally) {
    const tasks_path = dir(this.config.paths.data, 'tasks')

    Object.keys(any).map(a => {

      if (any[a].fn) { // task require a function
        if (globally) {
          const name = `${tasks_path}/${a}.js`
          const cnt = 'module.exports = ' + any[a].fn.toString() // to commonJS

          delete any[a].fn
          any[a]['module'] = `.${this.config.paths.data}/tasks/${a}.js`
          // fs.writeFileSync(name, cnt)
        }
        this.tasks[a] = any[a]
      } else if (any[a].module) { // task require a npm module
        this.tasks[a] = any[a]
      } else if (typeof any[a] === 'string') { // templates
        this.templates[a] = any[a]
      }
    })

    // sync tasks
    if (globally) {
      dbTasks.set(this.tasks)
    }
    if (globally) {
      dbTemplates.set(this.templates)
    }
  }

}

