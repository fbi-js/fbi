import * as _ from './helpers/utils'

import Task from './task'
import Template from './template'
import copy from './helpers/copy'
import {
  exec,
} from 'child_process'
import helpTxt from './helpers/helps'
import opts from './config/options'
import path from 'path'
import {
  version,
} from '../package.json'

const task = new Task()
const template = new Template()

export default class Cli {

  constructor(argvs) {
    if (parseInt(process.versions.node.split('.')[0]) < 6) {
      _.log('FBI requires Node.js version 6 or newer.', 0)
      return
    }
    this.options = {}
    this.argvs = argvs || []
    this.next = true
    this.log = _.log
    this._ = _

    ;
    (async() => {
      try {
        await this.config()
          // console.log(this.options)
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
        await this.update()
        await this.run()
      } catch (e) {
        _.log(e, 0)
      }
    })()
  }

  setTerminalTitle() {
    const projectName = path.basename(process.cwd())

    exec('echo "\\033];FBI-' + projectName + '\\007"', (error, stdout, stderr) => {
      if (error) {
        return
      }
      _.log(`Setting terminal tab title... ${stdout}`)
    })
  }

  async config() {
    if (!this.next) return

    try {
      /**
       * init data paths
       */
      Object.keys(opts.PATHS.global).map(item => {
        if (!_.isAbsolute(opts.PATHS.global[item])) {
          opts.PATHS.global[item] = _.dir('../', opts.PATHS.global[item])
        }
      })

      /**
       * get user config
       * 1. try package.json
       * 2. try PATHS.local.config
       */
      let userConfig
      const userPkgPath = _.cwd('package.json')
      if (await _.exist(userPkgPath)) {
        const pkg = require(userPkgPath)
        this.isfbi = pkg.fbi ? true : false
        userConfig = pkg.fbi ? pkg.fbi : {}
      }

      const userCfgPath = _.cwd(opts.PATHS.local.config)
      if (await _.exist(userCfgPath)) {
        this.isfbi = true
        userConfig = _.merge(userConfig, require(userCfgPath))
      }

      /**
       * merge template config with user config
       */
      if (userConfig && userConfig.template) {
        const globalTmplPath = _.join(opts.PATHS.global.templates, userConfig.template)
        const tmplExist = await _.exist(globalTmplPath)

        opts['NODE_MODULES_PATH'] = tmplExist ?
          _.join(globalTmplPath, 'node_modules/') :
          _.cwd('node_modules/')

        const tmplCfgPath = _.join(globalTmplPath, opts.PATHS.local.config)
        if (await _.exist(tmplCfgPath)) {
          userConfig = _.merge(require(tmplCfgPath), userConfig)
        }
      } else {
        opts['NODE_MODULES_PATH'] = _.cwd('node_modules/')
      }

      /**
       * generate this.options
       * merge userConfig & default options
       */
      this.options = _.merge(opts, userConfig)
    } catch (e) {
      _.log(e)
    }
  }

  version() {
    if (!this.next) return

    if (this.argvs[0] === '-v' || this.argvs[0] === '--verison') {
      this.next = false
      console.log(version)
    }
  }

  backup() {
    if (!this.next) return

    if (this.argvs[0] === 'backup') {
      this.next = false

      const _dir = 'fbi-data-bak-' + Date.now()

      _.log('Starting backup data to local folder ...', 1)
      copy(this.options.PATHS.global.root, _.cwd(_dir), this.options.BACKUP_IGNORE)
    }
  }

  recover() {
    if (!this.next) return

    if (this.argvs[0] === 'recover') {
      this.next = false

      _.log('Starting recover data to local folder ...', 1)
      copy(_.cwd(), this.options.PATHS.global.root, this.options.RECOVER_IGNORE)
    }
  }

  async help() {
    if (!this.next) return

    if (!this.argvs.length || this.argvs[0] === '-h' || this.argvs[0] === '--help') {
      this.next = false
      console.log(helpTxt(version))
    }
  }

  async init() {
    if (!this.next) return

    if (this.argvs[0] === 'init') {
      this.next = false

      if (!this.argvs[1]) {
        return _.log('Usage: fbi init [template name]', -1)
      }
      try {
        const name = this.argvs[1]
        let succ = await template.init(name, _.cwd(), this.options)
        if (succ) {
          _.log(`Template '${name}' init in current folder`, 1)
        } else {
          _.log(`Template '${name}' not found`, 0)
        }
      } catch (e) {
        _.log(e)
      }
    }
  }

  async install() {
    if (!this.next) return

    if (this.argvs[0] === 'i' || this.argvs[0] === 'install') {
      this.next = false

      let localDeps = {}
      let localDevDeps = {}
      let tmplDeps = {}
      let taskDeps = {}
      const opts = this.options

      // local package.json => dependencies && devDependencies
      if (await _.exist(_.cwd('package.json'))) {
        const pkgs = require(_.cwd('package.json'))
        localDeps = pkgs.dependencies || {}
        localDevDeps = pkgs.devDependencies || {}
      }

      // template package.json => devDependencies
      if (opts.template) {
        try {
          const _path = _.join(this.options.PATHS.global.templates, opts.template, 'package.json')
          const _dev = require(_path)['devDependencies']
          tmplDeps = _.merge(_dev, localDevDeps)
          if (Object.keys(tmplDeps).length) {
            let tmplPkgCnt = require(_path)
            tmplPkgCnt['devDependencies'] = tmplDeps
            _.write(_path, JSON.stringify(tmplPkgCnt, null, 2))
          }
        } catch (e) {}
      } else {
        // task package.json => devDependencies
        try {
          const taskPkg = _.join(this.options.PATHS.global.tasks, 'package.json')
          const taskPkgDev = require(taskPkg).devDependencies
          taskDeps = _.merge(taskPkgDev, localDevDeps)
          if (Object.keys(taskDeps).length) {
            let taskPkgCnt = require(taskPkg)
            taskPkgCnt['devDependencies'] = taskDeps
            _.write(taskPkg, JSON.stringify(taskPkgCnt, null, 2))
          }
        } catch (e) {}
      }

      const npms = opts.npm

      if (Object.keys(localDeps).length) {
        await _.install(localDeps, _.cwd(''), npms.alias, '--save ' + npms.options)
          .then(s => {
            _.log('Tempaltes dependencies installed.', 1)
          })
          .catch(err => {
            _.log('Tempaltes dependencies installtion error', 0)
            _.log(err, 0)
          })
      }

      if (Object.keys(tmplDeps).length) {
        await _.install(tmplDeps, _.join(this.options.PATHS.global.templates, opts.template), npms.alias, '--save-dev ' + npms.options)
          .then(s => {
            _.log('Tempaltes devDependencies installed.', 1)
          })
          .catch(err => {
            _.log('Tempaltes devDependencies installtion error', 0)
            _.log(err, 0)
          })
      }

      if (Object.keys(taskDeps).length) {
        await _.install(taskDeps, this.options.PATHS.global.tasks, npms.alias, '--save-dev ' + npms.options)
          .then(s => {
            _.log('Tasks devDependencies installed.', 1)
          })
          .catch(err => {
            _.log('Tasks devDependencies installtion error', 0)
            _.log(err, 0)
          })
      }
    }
  }

  async remove() {
    if (!this.next) return

    if (this.argvs[0] === 'rm-task' || this.argvs[0] === 'rta') {
      this.next = false

      let mods = this.argvs.slice(1)
      if (!mods.length) {
        _.log('Usage: fbi rm-task [name]', 0)
        process.exit(0)
      }
      let tasksPath = _.join(this.options.PATHS.global.tasks, this.options.PATHS.local.tasks)
      let tmplName
      if (mods[0].indexOf('-') === 0) {
        tmplName = mods[0].slice(1)
        mods = mods.splice(1, 1)
        if (tmplName !== '') {
          if (mods.length) {
            const tmplExist = await _.exist(_.join(this.options.PATHS.global.templates, tmplName))
            if (tmplExist) {
              tasksPath = _.join(this.options.PATHS.global.templates, tmplName, this.options.PATHS.local.tasks)
            } else {
              _.log(`template '${tmplName}' not found`, 0)
              process.exit(0)
            }
          } else {
            _.log('Usage: fbi rm-task -[template] [task]', 0)
            process.exit(0)
          }
        } else {
          _.log('Usage: fbi rm-task -[template] [task]', 0)
          process.exit(0)
        }
      }
      const tasks = await _.readDir(tasksPath)
      mods.map(async item => {
        item = item + '.js'
        if (tasks.includes(item)) {
          try {
            _.rmfile(_.join(tasksPath, item), err => {
              if (err) {
                _.log(err, 0)
              }
              _.log(`task ${_.basename(item, '.js')} ${tmplName ? 'in ' + tmplName + ' ' : ''}removed`, 1)
            })
          } catch (e) {
            _.log(e, 0)
          }
        } else {
          _.log(`task '${_.basename(item, '.js')}' ${tmplName ? 'in ' + tmplName + ' ' : ''} not found`, 0)
        }
      })
    }

    if (this.argvs[0] === 'rm-tmpl' || this.argvs[0] === 'rtm') {
      this.next = false

      const mods = this.argvs.slice(1)
      if (!mods.length) {
        _.log('Usage: fbi rm-tmpl [name]', 0)
        process.exit(0)
      }
      const tmpls = await _.readDir(this.options.PATHS.global.templates)
      mods.map(async item => {
        if (tmpls.includes(item)) {
          try {
            _.log(`start to remove template '${item}'...`)
            _.rmdir(_.join(this.options.PATHS.global.templates, item), err => {
              if (err) {
                _.log(err, 0)
              }
              _.log(`template '${item}' removed`, 1)
            })
          } catch (e) {
            _.log(e, 0)
          }
        } else {
          _.log(`template '${item}' not found`, 0)
        }
      })
    }
  }

  async cat() {
    if (!this.next) return

    if (this.argvs[0] === 'cat') {
      this.next = false

      if (!this.argvs[1]) {
        return _.log('Usage: fbi cat [task] [-t, -g]', 0)
      }

      const name = this.argvs[1]
      let type = 'local'
      if (this.argvs[2] === '-g') {
        type = 'global'
      } else if (this.argvs[2] === '-t') {
        type = 'template'
      }

      const taskObj = await task.get(name, type, this.options)
      _.log(`file path: ${taskObj.path}`)
      _.log(`${taskObj.type} task ${name}'s content:`, 1)
      _.flatLog(taskObj.cnt)
    }
  }

  async list() {
    if (!this.next) return

    if (this.argvs[0] === 'ls' ||
      this.argvs[0] === 'list') {
      this.next = false

      let helps = _.genTaskHelpTxt(await task.all(this.options, true, false))

      helps += _.genTmplHelpTxt(await template.all(this.options),
        this.options.template, this.options.templateDescription)

      if (await _.exist(_.cwd('package.json'))) {
        const usrpkg = require(_.cwd('package.json'))
        if (usrpkg.scripts && Object.keys(usrpkg.scripts).length > 0) {
          helps += _.genNpmscriptsHelpTxt(usrpkg.scripts)
        }
      }

      helps += `
      `

      console.log(helps)
    }
  }

  async add() {
    if (!this.next) return

    // add template
    if (this.argvs[0] === 'add-tmpl' || this.argvs[0] === 'atm') {
      this.next = false

      try {
        // add template
        const name = this.options.template
        if (!name) {
          throw 'There is no template name found.'
        }
        const isExist = await _.exist(_.join(this.options.PATHS.global.templates, name))

        if (isExist) {
          _.log(`Tempalte '${name}' already exist, input 'y' to update, or change the field 'template' value in './fbi/config.js' to create a new one.`, 'yellow')

          const answer = await _.prompt('update')
          if (answer['update'] === 'y') {
            _.log(`Start to update template '${name}' ...`)
            await copy(_.cwd(), _.join(this.options.PATHS.global.templates, name), this.options.TEMPLATE_ADD_IGNORE)
            _.log(`Template '${name}' updated successfully`, 1)
          } else {
            process.exit(0)
          }
        } else {
          _.log(`Start to add template '${name}' ...`)
          await copy(_.cwd(), _.join(this.options.PATHS.global.templates, name), this.options.TEMPLATE_ADD_IGNORE)
          _.log(`Template '${name}' added successfully`, 1)
        }
      } catch (err) {
        _.log(err || 'add template fail.', -1)
      }
    }

    const tasksPath = this.options.PATHS.local.tasks
    async function addTaskFile(file, to) {
      const name = file.replace(_.extname(file), '')
      const taskExist = await _.exist(_.cwd(tasksPath, file))
      await _.copyFile(_.cwd(tasksPath, file), _.join(to, file), 'quiet')
      _.log(`Task '${name}' ${taskExist ? 'updated' : 'added'} successfully`, 1)
    }

    // add tasks
    if (this.argvs[0] === 'add-task' || this.argvs[0] === 'ata') {
      this.next = false

      const localTasksFolderExist = await _.exist(_.cwd(tasksPath))
      if (!localTasksFolderExist) {
        _.log(`Local tasks folder '${tasksPath}' not found.`, -1)
      } else {
        let name = this.argvs[1]
        const taskdir = _.join(this.options.PATHS.global.tasks)
        const taskdirExist = await _.exist(taskdir)
        if (!taskdirExist) {
          await _.mkdir(taskdir)
          await _.mkdir(_.join(taskdir, this.options.PATHS.local.tasks))
        }
        // copy node_modules
        const nodeModulesExist = await _.exist('node_modules')
        if (nodeModulesExist) {
          copy(_.cwd('node_modules'), _.join(taskdir, 'node_modules'))
        }

        // merge package.json
        let usrPkg = {}

        try {
          usrPkg = require(_.cwd('package.json')).devDependencies
        } catch (e) {

        }
        let tskPkg = require(_.join(this.options.PATHS.global.tasks, 'package.json'))
        _.merge(tskPkg.devDependencies, usrPkg)
        await _.write(_.join(this.options.PATHS.global.tasks, 'package.json'), JSON.stringify(tskPkg, null, 2))

        if (name) {
          const file = _.extname(name) ? name : name + '.js'
          await addTaskFile(file, _.join(taskdir, this.options.PATHS.local.tasks))
        } else {
          const files = await _.readDir(_.cwd(tasksPath))
            // copy task files
          Promise.all(files.map(async item => {
            try {
              await addTaskFile(item, _.join(taskdir, this.options.PATHS.local.tasks))
            } catch (e) {
              _.log(e, 0)
            }
          }))
        }
      }
    }
  }

  async update() {
    if (!this.next) return

    // update local project from template
    if (this.argvs[0] === 'update') {
      this.next = false

      if (this.options.template) {
        try {
          // update fbi folder
          await copy(_.join(this.options.PATHS.global.templates, this.options.template, 'fbi'), _.cwd('fbi'))

          // update package.json devDependencies
          if (await _.exist(_.cwd('package.json'))) {
            const localPkgPath = _.cwd('package.json')
            const localPkg = require(localPkgPath)
            const localDevDeps = localPkg['devDependencies'] || {}
            const tmplDevDeps = require(_.join(this.options.PATHS.global.templates, this.options.template, 'package.json'))['devDependencies'] || {}
            const newDevDeps = _.merge(localDevDeps, tmplDevDeps)
            localPkg.devDependencies = newDevDeps
            _.write(localPkgPath, JSON.stringify(localPkg, null, 2))
          }

          _.log('local folder "./fbi/" and file "package.json" updated successfully.', 1)
        } catch (err) {
          _.log(err, 0)
        }
      } else {
        _.log('this is not a fbi template.', 0)
      }
    }
  }

  async run() {
    if (!this.next) return

    let cmds = this.argvs
    if (this.argvs.length > 0) {

      let ret
      const prefix = this.options.TASK_PARAM_PREFIX
      try {
        ret = _.parseArgvs(cmds, prefix)
      } catch (e) {
        _.log('task params parsed error', 0)
        _.log(e)
      }

      let titleSeted = false

      if (Object.keys(ret).length) {
        Object.keys(ret).map(async item => {
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
            if (taskObj.path) {
              if (!titleSeted) {
                this.setTerminalTitle()
                titleSeted = true
              }
              taskObj['params'] = (itemParams && itemParams.length) ?
                ' ' + prefix + itemParams.join(' ' + prefix) :
                ''
              this['taskParams'] = (itemParams && itemParams.length) ?
                itemParams :
                null
              task.run(item, this, taskObj)
            } else {
              _.log(`Task not found: '${item}'`, -1)
            }
          } catch (e) {
            _.log(e, -1)
          }
        })
      }
    }
  }
}