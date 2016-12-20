import * as _ from './helpers/utils'

import Task from './task'
import Template from './template'
import copy from './helpers/copy'
import defaultOpts from './config/options'
import helpTxt from './helpers/helps'
import {
  version,
} from '../package.json'

export default class Fbi {

  constructor() {
    this.config = {}
    this.log = _.log
    this._ = _
    this._.copy = copy
  }

  set config(opts = {}) {
    /**
     * get local config
     * 1. try package.json
     * 2. try paths.config
     */
    let localOpts = {}
    const userPkgPath = _.cwd('package.json')
    if (_.existSync(userPkgPath)) {
      const pkg = require(userPkgPath)
      this.isfbi = pkg.fbi ? true : false
      localOpts = pkg.fbi ? pkg.fbi : {}
    }

    const userCfgPath = _.cwd(defaultOpts.paths.config)
    if (_.existSync(userCfgPath)) {
      this.isfbi = true
      localOpts = _.merge(localOpts, require(userCfgPath))
    }
    if (localOpts && localOpts.paths && Object.keys(localOpts.paths).length) {
      Object.keys(localOpts.paths).map(item => {
        if (!localOpts.paths[item]) {
          localOpts.paths[item] = defaultOpts.paths[item]
        }
      })
    }

    /**
     * merge template config with user config
     */
    let tmplOpts = {}
    if (localOpts && localOpts.template) {
      const globalTmplPath = _.dir('..', defaultOpts.DATA_TEMPLATES, localOpts.template)
      const tmplExist = _.existSync(globalTmplPath)

      opts['NODE_MODULES_PATH'] = tmplExist ?
        _.join(globalTmplPath, 'node_modules/') :
        _.cwd('node_modules/')

      const tmplCfgPath = _.join(globalTmplPath, defaultOpts.paths.config)
      if (_.existSync(tmplCfgPath)) {
        // localOpts = _.merge(require(tmplCfgPath), localOpts)
        tmplOpts = require(tmplCfgPath)
      }
    } else {
      opts['NODE_MODULES_PATH'] = _.cwd('node_modules/')
    }

    this.options = {
      ...defaultOpts,
      ...tmplOpts,
      ...localOpts,
      ...opts
    }

    /**
     * init data paths
     */
    this.options.DATA_ROOT = _.dir('..', this.options.DATA_ROOT)
    this.options.DATA_TASKS = _.dir('..', this.options.DATA_TASKS)
    this.options.DATA_TEMPLATES = _.dir('..', this.options.DATA_TEMPLATES)
      // console.log(this.options)
    return this
  }

  get config() {
    console.log('get config')
    return this.options
  }

  async list() {
    const task = new Task()
    const template = new Template()
    let helps = _.genTaskHelpTxt(await task.all(this.options, true, false))

    helps += _.genTmplHelpTxt(await template.all(this.options),
      this.options.template, this.options.description)

    if (await _.exist(_.cwd('package.json'))) {
      const usrpkg = require(_.cwd('package.json'))
      if (usrpkg.scripts && Object.keys(usrpkg.scripts).length > 0) {
        helps += _.genNpmscriptsHelpTxt(usrpkg.scripts)
      }
    }

    helps += `
      `

    console.log(helps)
    return this
  }

  async run(params, hooks) {
    let tasks = params
    if (typeof params === 'string') {
      // task name
      tasks = [params]
    } else if (typeof params === 'function') {
      // function
      params.call(this, this)
      return this
    } else if (Array.isArray(params)) {
      // array
      tasks = params
    } else if (Object.keys(params).length) {
      // functions
      Object.keys(params).map(item => {
        params[item].call(this, this)
      })
      return this
    }
    const prefix = this.options.TASK_PARAM_PREFIX
    const opts = _.parseArgvs(tasks, prefix)

    if (!Object.keys(opts).length) {
      return this
    }

    const task = new Task()

    // TODO: pre on each task
    if (hooks && typeof hooks.pre === 'function') {
      hooks.pre.call(this)
    }

    await Promise.all(Object.keys(opts).map(async item => {
      try {
        let taskType = 'local'
        const itemParams = opts[item]['params']
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
          taskObj['params'] = (itemParams && itemParams.length) ?
            ' ' + itemParams.join(' ') :
            ''
          this['taskParams'] = (itemParams && itemParams.length) ?
            itemParams : []
          await task.run(item, this, taskObj)
        } else {
          _.log(`${taskType} task not found: '${item}'`, -1)
        }
      } catch (e) {
        _.log(e, -1)
      }
    }))

    // TODO: post on each task

    return this
  }

  version() {
    console.log(version)
    return this
  }

  backup() {
    const dir = 'fbi-data-bak-' + Date.now()

    _.log('Starting backup data to local folder ...', 1)
    copy(this.options.DATA_ROOT, _.cwd(dir), this.options.BACKUP_IGNORE)

    return this
  }

  recover() {
    _.log('Starting recover data to local folder ...', 1)
    copy(_.cwd(), this.options.DATA_ROOT, this.options.RECOVER_IGNORE)

    return this
  }

  help() {
    console.log(helpTxt(version))
  }

  async cat(name, type) {
    let filepath
    const file = _.extname(name) ? name : name + '.js'
    if (type === '-g') {
      filepath = _.join(this.options.DATA_TASKS, this.options.paths.tasks, file)
    } else if (type === '-t') {
      if (this.options.template && _.existSync(_.join(this.options.DATA_TEMPLATES, this.options.template))) {
        filepath = _.join(this.options.DATA_TEMPLATES, this.options.template, this.options.paths.tasks, file)
      } else {
        _.log(`Template '${this.options.template}' not found`, -2)
      }
    } else {
      filepath = _.cwd(this.options.paths.tasks, file)
    }

    if (filepath) {
      const cnt = await _.read(filepath)
      _.log(`File path: ${filepath}`, 0)
      _.log('Content: ', 0)
      _.flatLog(cnt)
    }
  }

  async init(name) {
    const template = new Template()
    const succ = await template.init(name, _.cwd(), this.options)
    if (succ) {
      _.log(`Template '${name}' init in current folder`, 1)
    } else {
      _.log(`Template '${name}' not found`, 0)
    }
  }

  async install(type) {
    let localDeps = {}
    let localDevDeps = {}
    let tmplDeps = {}
    let taskDeps = {}
    let localDevInstallToLocal = false
    const opts = this.options
    const tmplNeeded = !type || type === '-t'
    const taskNeeded = type === '-g'

    // local package.json => dependencies && devDependencies
    if (await _.exist(_.cwd('package.json'))) {
      const pkgs = require(_.cwd('package.json'))
      localDeps = pkgs.dependencies || {}
      localDevDeps = pkgs.devDependencies || {}
    }

    // template package.json => devDependencies
    if (opts.template && tmplNeeded) {
      const isTmplExist = await _.exist(_.join(this.options.DATA_TEMPLATES, opts.template))
      if (isTmplExist) {
        const _path = _.join(this.options.DATA_TEMPLATES, opts.template, 'package.json')
        const _dev = require(_path)['devDependencies']
        tmplDeps = _.merge(_dev, localDevDeps)
        if (Object.keys(tmplDeps).length) {
          const tmplPkgCnt = require(_path)
          tmplPkgCnt['devDependencies'] = tmplDeps
          _.write(_path, JSON.stringify(tmplPkgCnt, null, 2))
        }
      } else {
        localDevInstallToLocal = true
      }
    }

    // if (!opts.template || !await _.exist(_.join(opts.DATA_TASKS, 'node_modules'))) {
    if (taskNeeded) {
      // task package.json => devDependencies
      try {
        const taskPkg = _.join(this.options.DATA_TASKS, 'package.json')
        const taskPkgDev = require(taskPkg).devDependencies
        if (!opts.template) {
          taskDeps = _.merge(taskPkgDev, localDevDeps)
          if (Object.keys(taskDeps).length) {
            let taskPkgCnt = require(taskPkg)
            taskPkgCnt['devDependencies'] = taskDeps
            _.write(taskPkg, JSON.stringify(taskPkgCnt, null, 2))
          }
        } else {
          taskDeps = taskPkgDev
        }
      } catch (e) {}
    }

    const npms = opts.npm || {
      alias: 'npm',
      options: ''
    }

    const targets = [{
      name: 'Local',
      deps: localDeps,
      path: _.cwd(''),
      opts: '--save ' + (npms.options || ''),
    }, {
      name: 'Template',
      deps: tmplDeps,
      path: _.join(this.options.DATA_TEMPLATES, opts.template || ''),
      opts: '--save-dev ' + (npms.options || ''),
    }, {
      name: 'Task',
      deps: taskDeps,
      path: this.options.DATA_TASKS,
      opts: '--save-dev ' + (npms.options || ''),
    }]

    if (localDevInstallToLocal) {
      targets.splice(1, 0, {
        name: 'Local dev',
        deps: localDevDeps,
        path: _.cwd(''),
        opts: '--save-dev ' + (npms.options || ''),
      })
    }

    const tasks = []

    targets.map(async item => {
      if (item.deps && Object.keys(item.deps).length) {
        tasks.push(function () {
          return _.install(item.deps, item.path, npms.alias, item.opts, `${item.name} dependencies installed`)
        })
      }
    })

    _.sequenceTasks(tasks)
      .then(value => {
        _.log('All done', 1)
      }).catch(error => {
        _.log('Dependencies installtion error', -1)
        _.log(err, -1)
      })
  }

  async addTask() {
    const tasksPath = this.options.paths.tasks
    async function addTaskFile(file, to) {
      const name = file.replace(_.extname(file), '')
      const taskExist = await _.exist(_.cwd(tasksPath, file))
      await _.copyFile(_.cwd(tasksPath, file), _.join(to, file), 'quiet')
      _.log(`Task '${name}' ${taskExist ? 'updated' : 'added'} successfully`, 1)
    }

    const localTasksFolderExist = await _.exist(_.cwd(tasksPath))
    if (!localTasksFolderExist) {
      _.log(`Local tasks folder '${tasksPath}' not found.`, -1)
    } else {
      let name = this.argvs[1]
      const taskdir = _.join(this.options.DATA_TASKS)
      const taskdirExist = await _.exist(taskdir)
      if (!taskdirExist) {
        await _.mkdir(taskdir)
        await _.mkdir(_.join(taskdir, this.options.paths.tasks))
      }
      // copy node_modules
      const nodeModulesExist = await _.exist('node_modules')
      if (nodeModulesExist) {
        copy(_.cwd('node_modules'), _.join(taskdir, 'node_modules'))
      }

      // merge package.json
      let usrPkg = {}
      let tskPkg = {}

      try {
        usrPkg = require(_.cwd('package.json'))
      } catch (e) {}

      try {
        tskPkg = require(_.join(this.options.DATA_TASKS, 'package.json'))
      } catch (e) {}

      _.merge(tskPkg, usrPkg)
      await _.write(_.join(this.options.DATA_TASKS, 'package.json'), JSON.stringify(tskPkg, null, 2))

      if (name) {
        const file = _.extname(name) ? name : name + '.js'
        await addTaskFile(file, _.join(taskdir, this.options.paths.tasks))
      } else {
        const files = await _.readDir(_.cwd(tasksPath))

        // copy task files
        Promise.all(files.map(async item => {
          try {
            await addTaskFile(item, _.join(taskdir, this.options.paths.tasks))
          } catch (e) {
            _.log(e, -2)
          }
        }))
      }
    }
  }

  async addTmpl() {
    try {
      // add template
      const name = this.options.template
      if (!name) {
        throw 'There is no template name found.'
      }
      const isExist = await _.exist(_.join(this.options.DATA_TEMPLATES, name))

      if (isExist) {
        _.log(`Tempalte '${name}' already exist, type 'y' to update, or 'ctrl+c' to exit.`, -1)

        const answer = await _.prompt('update')
        if (answer['update'] === 'y') {
          _.log(`Start to update template '${name}' ...`, 0)
          await copy(_.cwd(), _.join(this.options.DATA_TEMPLATES, name), this.options.TEMPLATE_ADD_IGNORE)
          _.log(`Template '${name}' updated successfully`, 1)
        } else {
          process.exit(0)
        }
      } else {
        _.log(`Start to add template '${name}' ...`, 0)
        await copy(_.cwd(), _.join(this.options.DATA_TEMPLATES, name), this.options.TEMPLATE_ADD_IGNORE)
        _.log(`Template '${name}' added successfully`, 1)
      }
    } catch (err) {
      _.log(err || 'Add template fail.', -2)
    }
  }

  async removeTask(names) {
    let tasksPath = _.join(this.options.DATA_TASKS, this.options.paths.tasks)
    let tmplName
    if (names[0].indexOf('-') === 0) {
      tmplName = names[0].slice(1)
      names = names.splice(1, 1)
      if (tmplName !== '') {
        if (names.length) {
          const tmplExist = await _.exist(_.join(this.options.DATA_TEMPLATES, tmplName))
          if (tmplExist) {
            tasksPath = _.join(this.options.DATA_TEMPLATES, tmplName, this.options.paths.tasks)
          } else {
            _.log(`Template '${tmplName}' not found`, 0)
            process.exit(0)
          }
        } else {
          _.log('Usage: fbi rta -[template] [task]', 0)
          process.exit(0)
        }
      } else {
        _.log('Usage: fbi rta -[template] [task]', 0)
        process.exit(0)
      }
    }
    const tasks = await _.readDir(tasksPath)
    names.map(async item => {
      item = item + '.js'
      if (tasks.includes(item)) {
        try {
          _.rmfile(_.join(tasksPath, item), err => {
            if (err) {
              _.log(err, 0)
            }
            _.log(`Task '${_.basename(item, '.js')}' ${tmplName ? 'in ' + tmplName + ' ' : ''}removed`, 1)
          })
        } catch (e) {
          _.log(e, 0)
        }
      } else {
        _.log(`Task '${_.basename(item, '.js')}' ${tmplName ? 'in ' + tmplName + ' ' : ''} not found`, -1)
      }
    })
  }

  async removeTmpl(names) {
    const tmpls = await _.readDir(this.options.DATA_TEMPLATES)
    names.map(async item => {
      if (tmpls.includes(item)) {
        try {
          _.log(`Start to remove template '${item}'...`, 0)
          _.rmdir(_.join(this.options.DATA_TEMPLATES, item), err => {
            if (err) {
              _.log(err, -2)
            }
            _.log(`Template '${item}' removed`, 1)
          })
        } catch (e) {
          _.log(e, 0)
        }
      } else {
        _.log(`Template '${item}' not found`, -1)
      }
    })
  }
}