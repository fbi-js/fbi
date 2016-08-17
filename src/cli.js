import path from 'path'
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
  genTaskHelpTxt, genTmplHelpTxt, genNpmscriptsHelpTxt,
  writeSync, indexDir, colors, prompt
} from './helpers/utils'

let helps =
  `
    Usage:11

      fbi [command]           run command
      fbi [task]              run a local preference task
      fbi [task] -g           run a global task
      fbi [task] -t           run a template task

      ${colors().yellow('use \'fbi ls\' to see available tasks & templates')}

    Commands:

      ata,   add-task [name]          add task file of files in 'fbi' folder
      atm,   add-tmpl                 add current folder as a template
      rta,   rm-task  [-t] [name]     remove task
      rtm,   rm-tmpl  [name]          remove template
      i,     install                  install dependencies
      ls,    list                     list all tasks & templates
      cat    [task]   [-t, -g]        cat task content
      init   [template]               init a new project via template
      backup                          backup tasks & templates
      recover                         recover tasks & templates from current folder

      -h,    --help                   output usage information
      -v,    --version                output the version number
`

const task = new Task()
const template = new Template()

export default class Cli {

  constructor(argvs) {
    this.argvs = argvs || []
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
          await this.config()
          this.version()
          this.backup()
          this.recover()
          await this.help()
          await this.init()
          await this.install()
          await this.remove()
          await this.cat()
          await this.list()
          await this.add()
          await this.run()
        } catch (e) {
          log(e, 0)
        }
      })()

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
        const _existTmpl = await exist(join(data.templates, userConfig.template))
        this.options['node_modules_path'] = _existTmpl
          ? join(data.templates, userConfig.template, 'node_modules')
          : cwd('node_modules')

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

  version() {
    if (!this.next) return

    if (this.argvs[0] === '-v' || this.argvs[0] === '--verison') {
      this.next = false
      console.log(version)
    }
  }

  async help() {
    if (!this.next) return

    if (!this.argvs.length || this.argvs[0] === '-h' || this.argvs[0] === '--help') {
      this.next = false

      // helps += genTaskHelpTxt(await task.all(this.options, true, true))
      // helps += genTmplHelpTxt(await template.all(this.options),
      //   this.options.template, this.options.templateDescription)
      // helps += `
      // `
      console.log(helps)
    }
  }

  async install() {
    if (!this.next) return

    if (this.argvs[0] === 'i' || this.argvs[0] === 'install') {
      this.next = false

      let localDeps = {}
      let localDeps_dev = {}
      let tmplDeps = {}
      let taskDeps = {}
      const opts = this.options

      // local package.json => dependencies && devDependencies
      if (await exist(cwd('package.json'))) {
        const pkgs = require(cwd('package.json'))
        localDeps = pkgs.dependencies || {}
        localDeps_dev = pkgs.devDependencies || {}
      }

      // template package.json => devDependencies
      if (opts.template) {
        try {
          const _path = join(opts.data.templates, opts.template, 'package.json')
          const _dev = require(_path)['devDependencies']
          tmplDeps = merge(_dev, localDeps_dev)
          if (Object.keys(tmplDeps).length) {
            let tmplPkgCnt = require(_path)
            tmplPkgCnt['devDependencies'] = tmplDeps
            write(_path, JSON.stringify(tmplPkgCnt, null, 2))
          }
        } catch (e) {
        }
      }

      // task package.json => devDependencies
      else {
        try {
          const taskPkg = join(opts.data.tasks, 'package.json')
          const taskPkg_dev = require(taskPkg).devDependencies
          taskDeps = merge(taskPkg_dev, localDeps_dev)
          if (Object.keys(taskDeps).length) {
            let taskPkgCnt = require(taskPkg)
            taskPkgCnt['devDependencies'] = taskDeps
            write(taskPkg, JSON.stringify(taskPkgCnt, null, 2))
          }
        } catch (e) {
        }
      }

      const npms = opts.npm

      if (Object.keys(localDeps).length) {
        await install(localDeps, cwd(''), npms.alias, '--save ' + npms.options)
          .then(s => {
            log('Tempaltes dependencies installed.', 1)
          })
          .catch(err => {
            log('Tempaltes dependencies installtion error', 0)
            log(err, 0)
          })
      }

      if (Object.keys(tmplDeps).length) {
        await install(tmplDeps, join(opts.data.templates, opts.template), npms.alias, '--save-dev ' + npms.options)
          .then(s => {
            log('Tempaltes devDependencies installed.', 1)
          })
          .catch(err => {
            log('Tempaltes devDependencies installtion error', 0)
            log(err, 0)
          })
      }

      if (Object.keys(taskDeps).length) {
        await install(taskDeps, opts.data.tasks, npms.alias, '--save-dev ' + npms.options)
          .then(s => {
            log('Tasks devDependencies installed.', 1)
          })
          .catch(err => {
            log('Tasks devDependencies installtion error', 0)
            log(err, 0)
          })
      }
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
            log(`start to remove template '${item}'...`)
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

    if (this.argvs[0] === 'ls'
      || this.argvs[0] === 'list') {
      this.next = false

      let helps = genTaskHelpTxt(await task.all(this.options, true, false))

      helps += genTmplHelpTxt(await template.all(this.options),
        this.options.template, this.options.templateDescription)

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
      const name = this.options.template
      const isExist = await exist(join(this.options.data.templates, name))

      if (isExist) {
        log(`Tempalte '${name}' already exist, input 'y' to update, or change the field 'template' value in './fbi/config.js' to create a new one.`, 'yellow')

        const answer = await prompt('update')
        if (answer['update'] === 'y') {
          log(`Start to update template '${name}' ...`)
          await copy(cwd(), join(this.options.data.templates, name), this.options.TEMPLATE_ADD_IGNORE)
          log(`Template '${name}' updated successfully`, 1)
        } else {
          process.exit(0)
        }
      } else {
        log(`Start to add template '${name}' ...`)
        await copy(cwd(), join(this.options.data.templates, name), this.options.TEMPLATE_ADD_IGNORE)
        log(`Template '${name}' added successfully`, 1)
      }
    }

    const tasks_path = this.options.paths.tasks
    async function addTaskFile(file, to) {
      const name = file.replace(path.extname(file), '')
      const task_exist = await exist(cwd(tasks_path, file))
      await copyFile(cwd(tasks_path, file), join(to, file), 'quiet')
      log(`Task '${name}' ${task_exist ? 'updated' : 'added'} successfully`, 1)
    }

    if (this.argvs[0] === 'add-task' || this.argvs[0] === 'ata') {
      this.next = false

      const local_tasks_folder_exist = await exist(cwd(tasks_path))
      if (!local_tasks_folder_exist) {
        log(`Local tasks folder '${tasks_path}' not found.`, 0)
      } else {
        let name = this.argvs[1]
        const taskdir = join(this.options.data.tasks)
        const taskdir_exist = await exist(taskdir)
        if (!taskdir_exist) {
          await mkdir(taskdir)
        }
        // copy node_modules
        copy(cwd('node_modules'), join(taskdir, 'node_modules'))

        // merge package.json
        let usr_psk = {}

        try {
          usr_psk = require(cwd('package.json')).devDependencies
        } catch (e) {

        }
        let tsk_pkg = require(join(this.options.data.tasks, 'package.json'))
        merge(tsk_pkg.devDependencies, usr_psk)
        await write(join(this.options.data.tasks, 'package.json'), JSON.stringify(tsk_pkg, null, 2))

        if (name) {
          const file = path.extname(name) ? name : name + '.js'
          await addTaskFile(file, taskdir)
        } else {
          const files = await readDir(cwd(tasks_path))
          // copy task files
          Promise.all(files.map(async (item) => {
            try {
              await addTaskFile(item, taskdir)
            } catch (e) {
              log(e, 0)
            }
          }))
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

