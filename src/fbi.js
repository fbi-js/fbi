import { createInterface } from 'readline'
import Task from './task'
import Module from './module'
import Template from './template'
import copy from './helpers/copy'
import opts from './options'
import { version } from '../package.json'
import {
  cwd, dir, join, exist, existSync, readDir,
  log, merge, read, write, install, copyFile,
  isTaskName, isTaskFile, basename, parseArgvs,
  rmdir, rmfile, mkdir, isAbsolute, clone, flatLog,
  genTaskHelpTxt, genTmplHelpTxt, genNpmscriptsHelpTxt
} from './helpers/utils'

let helps =
  `
    Usage:

      fbi [command]           run command
      fbi [task]              run a local preference task
      fbi [task] -g           run a global task
      fbi [task] -t           run a template task

    Commands:

      ata,   add-task [*, name.js]    add task files in current folder
      atm,   add-tmpl [name]          add current folder as a template named [name]
      rta,   rm-task  [-t] [name]     remove task
      rtm,   rm-tmpl  [name]          remove template
      i,     install                  install dependencies
      l,     list                     list all tasks & templates
      cat    [task]   [-t, -g]        cat task content
      init   [template]               init a new project via template
      backup                          backup tasks & templates
      recover                         recover tasks & templates from current folder

      -h,    --help                   output usage information
      -v,    --version                output the version number
`

const task = new Task()
const template = new Template()

export default class Fbi {

  constructor(argvs) {
    this.argvs = argvs
    this.next = true
    this.log = log
    this.options = {}
    this._ = {
      cwd, dir, join, exist, existSync, readDir,
      log, merge, read, write, install, copyFile,
      isTaskName, isTaskFile
    }

      ; (async () => {
        try {
          this.version()
          await this.config()
          await this.help()
          await this.init()
          await this.install()
          await this.remove()
          await this.cat()
          await this.list()
          await this.add()
          this.backup()
          this.recover()
          await this.run()
        } catch (e) {
          log(e, 0)
        }
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

  async config() {
    if (!this.next) return

    // user options > tempalte options > default options
    try {
      // user options
      const userConfigPath = cwd(opts.paths.config)
      this.isfbi = await exist(userConfigPath)
      const userConfig = this.isfbi ? require(userConfigPath) : null

      // merge user options
      this.options = merge(opts, userConfig)

      let data = clone(this.options.data)
      // parse data path
      Object.keys(data).map(item => {
        if (!isAbsolute(data[item])) {
          data[item] = dir(data[item])
        }
      })

      // template options
      if (userConfig && userConfig.template) {
        this.options['node_modules_path'] = join(
          data.templates,
          userConfig.template,
          'node_modules'
        )

        const templateOptionsPath = join(
          data.templates,
          userConfig.template,
          this.options.paths.config
        )

        if (existSync(templateOptionsPath)) {
          const templateOptions = require(templateOptionsPath)
          // merge template options
          merge(this.options, templateOptions)
        }
      }
      // merge user options
      merge(this.options, userConfig)
      // parse data path
      Object.keys(this.options.data).map(item => {
        if (!isAbsolute(this.options.data[item])) {
          this.options.data[item] = dir(this.options.data[item])
        }
      })
    } catch (e) {
      log(e)
    }
  }

  async help() {
    if (!this.next) return

    if (!this.argvs.length
      || this.argvs[0] === '-h'
      || this.argvs[0] === '--help') {
      this.next = false

      helps += genTaskHelpTxt(await task.all(this.options, true, true))
      helps += genTmplHelpTxt(await template.all(this.options))
      helps += `
      `
      console.log(helps)
    }
  }

  async install() {
    if (!this.next) return

    if (this.argvs[0] === 'i' || this.argvs[0] === 'install') {
      this.next = false

      let force = this.argvs[1] === '-f' || this.argvs[1] === '-force'

      let localdeps = {}
      let tmplDeps = {}
      let taskDeps = {}
      const opts = this.options

      // local package.json => devDependencies
      if (await exist(cwd('package.json'))) {
        localdeps = require(cwd('package.json')).devDependencies
      }

      // template package.json => devDependencies
      if (opts.template) {
        const tmplPkg = join(opts.data.templates, opts.template, 'package.json')
        const tmplPkg_exist = await exist(tmplPkg)
        if (tmplPkg_exist) {
          const tmplPkg_dev = require(tmplPkg)['devDependencies']
          tmplDeps = merge(tmplPkg_dev, localdeps)
        }
        if (Object.keys(tmplDeps).length) {
          let tmplPkgCnt = require(tmplPkg)
          tmplPkgCnt['devDependencies'] = tmplDeps
          await write(tmplPkg, JSON.stringify(tmplPkgCnt, null, 2))
        }
      }

      // task package.json => devDependencies
      else {
        const taskPkg = join(opts.data.tasks, 'package.json')
        const taskPkg_exist = await exist(taskPkg)
        if (taskPkg_exist) {
          const taskPkg_dev = require(taskPkg).devDependencies
          taskDeps = merge(taskPkg_dev, localdeps)
        }
        if (Object.keys(taskDeps).length) {
          let taskPkgCnt = require(taskPkg)
          taskPkgCnt['devDependencies'] = taskDeps
          await write(taskPkg, JSON.stringify(taskPkgCnt, null, 2))
        }
      }

      const npms = opts.npm

      const installTmplDeps = Object.keys(tmplDeps).length
        ? await install(tmplDeps, join(opts.data.templates, opts.template), npms.alias, npms.options)
        : Promise.resolve()

      const installTaskDeps = Object.keys(taskDeps).length
        ? await install(taskDeps, opts.data.tasks, npms.alias, npms.options)
        : Promise.resolve()

      // install
      Promise.all([installTmplDeps, installTaskDeps]).then(ret => {
        log('All Dependencies Installed', 1)
      }).catch(err => {
        log(err, 0)
      })

    }
  }

  async init() {
    if (!this.next) return

    if (this.argvs[0] === 'init') {
      this.next = false

      if (!this.argvs[1]) {
        return log(`Usage: fbi init [template name]`, 0)
      }
      // log(this.argvs[1].match(/^[^\\/:*""<>|,]+$/i))
      try {
        const name = this.argvs[1]
        let succ = await template.init(name, cwd(), this.options)
        if (succ) {
          log(`Template '${name}' init in current folder`, 1)
        } else {
          log(`Template '${name}' not found`, 0)
        }
      } catch (e) {
        log(e)
      }
    }
  }

  async remove() {
    if (!this.next) return

    if (this.argvs[0] === 'rm-task' || this.argvs[0] === 'rta') {
      this.next = false

      let mods = this.argvs.slice(1)
      if (!mods.length) {
        log(`Usage: fbi rm-task [name]`, 0)
        process.exit(0)
      }
      let tasks_path = this.options.data.tasks
      let tmpl_name
      if (mods[0].indexOf('-') === 0) {
        tmpl_name = mods[0].slice(1)
        mods = mods.splice(1, 1)
        if (tmpl_name !== '') {
          if (mods.length) {
            const tmpl_exist = await exist(join(this.options.data.templates, tmpl_name))
            if (tmpl_exist) {
              tasks_path = join(this.options.data.templates, tmpl_name, this.options.paths.tasks)
            } else {
              log(`template '${tmpl_name}' not found`, 0)
              process.exit(0)
            }
          } else {
            log(`Usage: fbi rm-task -[template] [task]`, 0)
            process.exit(0)
          }
        }
        else {
          log(`Usage: fbi rm-task -[template] [task]`, 0)
          process.exit(0)
        }
      }
      const tasks = await readDir(tasks_path)
      mods.map(async (item) => {
        item = item + '.js'
        if (tasks.includes(item)) {
          try {
            rmfile(join(tasks_path, item), err => {
              if (err) {
                log(err, 0)
              }
              log(`task ${basename(item, '.js')} ${tmpl_name ? 'in ' + tmpl_name + ' ' : ''}removed`, 1)
            })
          } catch (e) {
            log(e, 0)
          }
        } else {
          log(`task '${basename(item, '.js')}' ${tmpl_name ? 'in ' + tmpl_name + ' ' : ''} not found`, 0)
        }
      })
    }

    if (this.argvs[0] === 'rm-tmpl' || this.argvs[0] === 'rtm') {
      this.next = false

      const mods = this.argvs.slice(1)
      if (!mods.length) {
        log(`Usage: fbi rm-tmpl [name]`, 0)
        process.exit(0)
      }
      const tmpls = await readDir(this.options.data.templates)
      mods.map(async (item) => {
        if (tmpls.includes(item)) {
          try {
            rmdir(join(this.options.data.templates, item), err => {
              if (err) {
                log(err, 0)
              }
              log(`template '${item}' removed`, 1)
            })
          } catch (e) {
            log(e, 0)
          }
        } else {
          log(`template '${item}' not found`, 0)
        }
      })
    }
  }

  async cat() {
    if (!this.next) return

    if (this.argvs[0] === 'cat') {
      this.next = false

      if (!this.argvs[1]) {
        return log(`Usage: fbi cat [task] [-t, -g]`, 0)
      }

      const name = this.argvs[1]
      let type = 'local'
      if (this.argvs[2] === '-g') {
        type = 'global'
      } else if (this.argvs[2] === '-t') {
        type = 'template'
      }

      const taskObj = await task.get(name, type, this.options)
      log(`file path: ${taskObj.path}`)
      log(`${taskObj.type} task ${name}'s content:`, 1)
      flatLog(taskObj.cnt)
    }
  }

  async list() {
    if (!this.next) return

    if (this.argvs[0] === 'l'
      || this.argvs[0] === 'list') {
      this.next = false

      let helps = genTaskHelpTxt(await task.all(this.options, true, false))

      helps += genTmplHelpTxt(await template.all(this.options))

      if (await exist(cwd('package.json'))) {
        const usrpkg = require(cwd('package.json'))
        if (usrpkg.scripts && Object.keys(usrpkg.scripts).length > 0) {
          helps += genNpmscriptsHelpTxt(usrpkg.scripts)
        }
      }

      helps += `
      `

      console.log(helps)
    }
  }

  async add() {
    if (!this.next) return

    if (this.argvs[0] === 'add-tmpl' || this.argvs[0] === 'atm') {
      this.next = false

      // add template
      const name = this.argvs[1] || basename(cwd(), '')
      const isExist = await exist(join(this.options.data.templates, name))

      if (isExist) {
        log(`tempalte '${name}' already exist, type 'y' to replace, or type name to create new one`, -1)
        let
          rl = createInterface(process.stdin, process.stdout),
          prompts = ['name'],
          p = 0,
          data = {}
        let get = function () {
          rl.setPrompt(prompts[p] + ': ')
          rl.prompt()

          p++
        }
        get()
        rl.on('line', (line) => {
          data[prompts[p - 1]] = line
          if (p === prompts.length) {
            return rl.close()
          }
          get()
        }).on('close', async () => {
          if (data.name === 'y') {
            copy(cwd(), join(this.options.data.templates, name), this.options.TEMPLATE_ADD_IGNORE)
          } else if (data.name === '') {
            log('name can\'t be empty', 0)
          } else {
            const isExist2 = await exist(join(this.options.data.templates, data.name))
            if (isExist2) {
              log(`${data.name} already exist too`, 0)
              process.exit(0)
            } else {
              copy(cwd(), join(this.options.data.templates, data.name), this.options.TEMPLATE_ADD_IGNORE)
            }
          }
        })
      } else {
        copy(cwd(), join(this.options.data.templates, name), this.options.TEMPLATE_ADD_IGNORE)
      }
    }

    if (this.argvs[0] === 'add-task' || this.argvs[0] === 'ata') {
      this.next = false

      if (!this.argvs[1]) {
        log(`Usage: fbi add-task [*] or [name.js]`, 0)
      } else {
        let ts = this.argvs.slice(1)
        ts = ts.filter(isTaskFile)
        if (!ts.length) {
          log(`no task found.`, 0)
        } else {
          ts.map(async (item) => {
            const taskdir = join(this.options.data.tasks)
            const taskdir_exist = await exist(taskdir)
            const task_exist = await exist(join(taskdir, item))
            if (!taskdir_exist) {
              await mkdir(taskdir)
            }
            try {
              await copyFile(cwd(item), join(taskdir, item), 'quiet')
              log(`task '${basename(item, '.js')}' ${task_exist ? 'updated' : 'added'}`, 1)
            } catch (e) {
              log(e, 0)
            }
          })
        }
      }
    }
  }

  backup() {
    if (!this.next) return

    if (this.argvs[0] === 'backup') {
      this.next = false

      const _dir = 'fbi-data-bak-' + Date.now()

      log('Start to backup data...', 1)
      copy(this.options.data.root, cwd(_dir), this.options.BACKUP_IGNORE)
    }
  }

  recover() {
    if (!this.next) return

    if (this.argvs[0] === 'recover') {
      this.next = false

      log('Start to recover data...', 1)
      copy(cwd(), this.options.data.root, this.options.RECOVER_IGNORE)
    }
  }

  async run() {
    if (!this.next) return

    let cmds = this.argvs
    if (this.argvs.length > 0) {
      let ret
      const prefix = this.options.task_param_prefix
      try {
        ret = parseArgvs(cmds, prefix)
      } catch (e) {
        log(`task params parsed error`, 0)
        log(e)
      }

      if (Object.keys(ret).length) {
        const module = new Module(this.options)
        Object.keys(ret).map(async (item) => {
          try {
            let taskType = 'local'
            let itemParams = ret[item]['params']
            if (itemParams) {
              switch (itemParams[0]) {
                case 't':
                  taskType = 'template'
                  itemParams.splice(0, 1)
                  break
                case 'g':
                  taskType = 'global'
                  itemParams.splice(0, 1)
                  break
              }
            }
            const taskObj = await task.get(item, taskType, this.options)
            if (taskObj.cnt) {
              taskObj['params'] = (itemParams && itemParams.length)
                ? ' ' + prefix + itemParams.join(' ' + prefix)
                : ''
              this['taskParams'] = (itemParams && itemParams.length)
                ? itemParams
                : null
              task.run(item, this, taskObj, module)
            } else {
              log(`Task not found: '${item}`, 0)
            }
          } catch (e) {
            log(e, 0)
          }
        })
      }
    }
  }

}

