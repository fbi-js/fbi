import fs from 'fs'
import path from 'path'
import {getOptions} from './helpers/options'
import { read, exist } from './helpers/file'
import {dir} from './helpers/utils'
import options from './helpers/options'
// classes
import Cli from './cli'
import Module from './module'
import Store from './store'
import Parser from './parser'

const dbTasks = new Store('tasks')
const dbTemplates = new Store('templates')

const module = new Module()

export default class Fbi {
  constructor() {
    this.options = getOptions()

    this.tasks = dbTasks.all() || {}
    this.templates = dbTemplates.all() || {}

    // parser /Users/Inman/work/git/github/neikvon/fbi/data/templates/basic/fbi/tasks.js
    // const source = fs.readFileSync(path.join(__dirname, '../data/templates/basic/fbi/tasks.js'))
    // const parser = new Parser(source)

    // console.log(parser.getLocalDependencies())
    // console.log(parser.getGlobalDependencies())

    this.Cli = Cli
    this.Module = Module
    this.Parser = Parser

    module.set('a', 'aaa')
    module.set('b', function () {
      console.log('b')
    })
    console.log(module.getAll())
  }

  static get cli() {
    return Cli
  }

  static get module() {
    return Module
  }

  run(cmds) {
    if (!cmds) {
      return
    }

    new Fbi.cli(typeof cmds === 'string' ? [cmds] : cmds)
  }

  add(mods) {
    if (!mods) {
      return
    }

    new Fbi.module(typeof mods === 'string' ? [mods] : mods)
  }

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
          fs.writeFileSync(name, cnt)
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

