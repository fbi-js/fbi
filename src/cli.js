import Task from './task'
import Parser from './parser'
import Module from './module'
import Template from './template'
import options from './options'
import { getOptions } from './helpers/options'
import { version } from '../package.json'
import {
  cwd, dir, join, exist, existSync, readDir,
  log, merge, read, write, install, copyFile,
  isTask, isNotConfigFile} from './helpers/utils'

let helps =
  `
    Usage:

      fbi [command]           run command
      fbi [task]              run a local preference task
      fbi [task] -g           run a global task
      fbi new [template]      init a new template
      fbi rm [task][template] remove tasks or templates

    Commands:

      -h, --help              output usage information
      -v, --version           output the version number
      i, install              install dependencies
      i -f, install -f        install dependencies force
`

const task = new Task()
const template = new Template(options)

export default class Cli {

  constructor(argvs) {
    this.argvs = argvs
    this.next = true
    this.log = log
    this.options = {}
    this._ = {
      cwd, dir, join, exist, existSync, readDir,
      log, merge, read, write, install, copyFile,
      isTask, isNotConfigFile
    }

      ; (async () => {
        this.version()
        await this.help()
        await this.config()
        await this.create()
        await this.install()
        await this.remove()
        await this.run()
      })()
  }

  version() {
    if (!this.next) return

    if (this.argvs[0] === '-v'
      || this.argvs[0] === '--verison') {
      this.next = false
      console.log(version)
    }
  }

  async help() {
    if (!this.next) return

    if (!this.argvs.length
      || this.argvs[0] === '-h'
      || this.argvs[0] === '--help') {
      this.next = false

      const all = await task.all(true)
      helps += `
    Tasks:
    `
      if (all.globals.length) {
        all.globals.map(item => {
          helps += `
      ${item} <global>`
        })
      }
      if (all.locals.length) {
        all.locals.map(item => {
          helps += `
      ${item} <local>`
        })
      }

      const tmpls = await template.all()
      if (tmpls.length) {
        helps += `

    Templates:
      `
        tmpls.map(item => {
          helps += `
      ${item}`
        })
      }
      helps += `
      `

      console.log(helps)
    }
  }

  async config() {
    if (!this.next) return

    try {
      // options
      const pathConfig = cwd('./fbi/config.js')
      this.isfbi = await exist(pathConfig)
      const userOptions = this.isfbi ? require(pathConfig) : null
      this.options = getOptions(userOptions)
    } catch (e) {
      log(e)
    }
  }

  async install() {
    if (!this.next) return

    if (this.argvs[0] === 'i' || this.argvs[0] === 'install') {
      this.next = false

      let force = this.argvs[1] === '-f' || this.argvs[1] === '-force'

      let dependencies = {}
      let needinstall = {}

      // 1. local dependencies
      // fbi/config.js => dependencies
      if (this.options.dependencies
        && Object.keys(this.options.dependencies).length) {
        dependencies = this.options.dependencies
      }

      // 2. dependencies
      // collect tasks
      const all = await task.all()
      let deps = []

      const allTasks = Object.keys(all)
      if (allTasks.length) {
        allTasks.map(item => {
          // get task deps
          let parser = new Parser(all[item])
          let dep = parser.getDependencies()
          deps = deps.concat(dep)
        })
      }

      deps = Array.from(new Set(deps)) // duplicate removal

      // merge to dependencies
      deps.map(item => {
        if (!dependencies[item]) {
          dependencies[item] = '*'
        }
      })

      if (force) {
        needinstall = dependencies
      } else {
        // find modules
        const mod = new Module(this.options)

        Object.keys(dependencies).map(item => {
          let ret = mod.get(item)
          if (ret) {
            log(`Found '${item}' at: ${ret}`, 1)
          } else {
            log(`Not Fount '${item}'`)
            needinstall[item] = dependencies[item]
          }
        })
      }

      let targetDir = this.options.template
        ? dir(this.options.paths.data_templates, this.options.template)
        : dir(this.options.paths.data)

      if (Object.keys(needinstall).length) {
        await install(needinstall, targetDir, this.options.npm.alias, this.options.npm.options)
      } else {
        log('All Dependencies installed.')
      }
    }
  }

  async create() {
    if (!this.next) return

    if (this.argvs[0] === 'new') {
      this.next = false

      try {
        let name = this.argvs[1] ? this.argvs[1].match(/^[^\\/:*""<>|,]+$/i) : null
        name = name.length ? name[0] : null
        if (name !== null) {
          let succ = await template.copy(name, cwd())
          if (succ) {
            log(`Template '${name}' copied to current folder`, 1)
          } else {
            log(`Template '${name}' not found`, 0)
          }
        } else {
          log(`Usage: fbi new [template name]`, 0)
        }
      } catch (e) {
        log(e)
      }
    }
  }

  async remove() {
    if (!this.next) return

    if (this.argvs[0] === 'rm' || this.argvs[0] === 'remove') {
      this.next = false

      const mods = this.argvs.slice(1)
      if (!mods.length) {
        log(`Usage: fbi rm [task] or [template]`)
        process.exit(1)
      } else {
        // for (const mod of mods) {
        //   if (this.tasks[mod]) {
        //     if (this.tasks[mod].module.indexOf('.js') > 0) { // fn task
        //       // del task
        //       const _path = this._.dir(this.tasks[mod].module.replace('../', ''))
        //       const exist = this._.existSync(_path)
        //       if (exist) {
        //         fs.unlinkSync(_path)
        //         dbTasks.del(mod)
        //         log(`Task module '${mod}' removed`, 1)
        //       } else {
        //         log(`Task module '${mod}' not found`, 0)
        //       }
        //     } else {
        //       dbTasks.del(mod)
        //       // TODO: uninstall?
        //       log(`Task module '${mod}' removed`, 1)
        //     }
        //   } else if (this.templates[mod]) {
        //     // del template
        //     dbTemplates.del(mod)
        //     log(`Template '${mod}' removed`, 1)
        //   } else {
        //     log(`Module '${mod}' not found`, 0)
        //   }
        // }
      }
    }
  }

  async run() {
    if (!this.next) return

    let cmds = this.argvs
    if (this.argvs.length > 0) {
      let isGlobal
      if (this.argvs[1] === '-g') {
        isGlobal = true
      }
      try {
        cmds = cmds.filter(isTask)
        cmds.map(async (cmd) => {
          const taskObj = await task.get(cmd, isGlobal)
          if (taskObj.cnt) {
            log(`Running ${taskObj.type} task '${cmd}'...`, 1)
            task.run(cmd, this, taskObj.cnt)
          } else {
            log(`Task not found: '${cmd}${isGlobal ? ' <global>' : ''}'`, 0)
          }
        })
      } catch (e) {
        log(`Task function error`, 0)
        log(e)
      }
    }
  }

}