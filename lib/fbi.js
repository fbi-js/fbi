const _ = require('./helpers/utils')
const defaultOpts = require('./config/options')
const version = require('../package.json').version
const copy = require('./helpers/copy')
const helpTxt = require('./helpers/helps')
const Template = require('./template')
const Task = require('./task')

module.exports = class Fbi {

  constructor() {
    this.config = {}
    this.log = _.log
    this._ = _
    this._.copy = copy
  }

  set config(opts = {}) {
    try {
      /**
       * get local config
       * 1. package.json
       * 2. fbi/config.js
       */
      let localOpts = {}
      const userPkgPath = _.cwd('package.json')
      if (_.existSync(userPkgPath)) {
        const pkg = require(userPkgPath)
        if (pkg.fbi) {
          this.isfbi = true
          if (typeof pkg.fbi === 'string') {
            localOpts['template'] = pkg.fbi
          } else {
            localOpts = pkg.fbi
          }
        }
      }

      const userCfgPath = _.cwd(defaultOpts.paths.config)
      if (_.existSync(userCfgPath)) {
        this.isfbi = true
        localOpts = _.merge(require(userCfgPath), localOpts)
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
       * 1. package.json
       * 2. fbi/config.js
       */
      let tmplOpts = {}
      if (localOpts && localOpts.template) {
        const globalTmplPath = _.join(_.dir('..', defaultOpts.DATA_TEMPLATES), localOpts.template)
        const tmplExist = _.existSync(globalTmplPath)

        opts['node_modules_path'] = tmplExist ?
          _.join(globalTmplPath, 'node_modules/') :
          _.cwd('node_modules/')

        // package.json
        const tmplPkgPath = _.join(globalTmplPath, 'package.json')
        const tmplPkg = require(tmplPkgPath)
        tmplOpts['template'] = {}
        tmplOpts.template['name'] = tmplPkg.name
        tmplOpts.template['version'] = tmplPkg.version
        tmplOpts.template['description'] = tmplPkg.description
        if (tmplPkg.fbi) {
          delete tmplPkg.fbi.name
          delete tmplPkg.fbi.version
          delete tmplPkg.fbi.description

          _.merge(tmplOpts, tmplPkg.fbi)


          // if (typeof tmplPkg.fbi === 'string') {
          //   tmplOpts['template'] = tmplPkg.fbi
          // } else {
          //   tmplOpts = tmplPkg.fbi
          // }
        }

        // fbi/config.js
        const tmplCfgPath = _.join(globalTmplPath, defaultOpts.paths.config)
        if (_.existSync(tmplCfgPath)) {
          // const tmplOpts_tmp = require(tmplCfgPath)
          tmplOpts = _.merge(require(tmplCfgPath), tmplOpts)
        }
      } else {
        opts['node_modules_path'] = _.cwd('node_modules/')
      }

      delete localOpts.template

      // this.options = {
      //   ...defaultOpts,
      //   ...tmplOpts,
      //   ...localOpts,
      //   ...opts
      // }
      this.options = _.merge(defaultOpts, tmplOpts, localOpts, opts)

      /**
       * init data paths
       */
      this.options.DATA_ROOT = _.dir('..', this.options.DATA_ROOT)
      this.options.DATA_TASKS = _.dir('..', this.options.DATA_TASKS)
      this.options.DATA_TEMPLATES = _.dir('..', this.options.DATA_TEMPLATES)

      // console.log(this.options)
      return this
    } catch (err) {
      throw err
    }
  }

  get config() {
    return this.options
  }

  async list() {
    try {
      const opts = this.options
      const task = new Task()
      const template = new Template()
      let helps = _.genTaskHelpTxt(await task.all(opts, true, false))
      const tmplName = opts.template ? (opts.template.name || '') : ''
      const tmplDesc = opts.template ? (opts.template.description || '') : ''

      helps += _.genTmplHelpTxt(await template.all(opts), tmplName, tmplDesc)

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
    } catch (err) {
      throw err
    }
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
          taskObj['params'] = itemParams || ''
          this['taskParams'] = (itemParams && itemParams.length) ?
            itemParams : null
          await task.run(item, this, taskObj)
        } else {
          _.log(`Task not found: '${item}'`, -1)
        }
      } catch (e) {
        _.log(e, -1)
      }
    }))

    // TODO: post on each task

    return this
  }

  version() {
    console.log(`v${version}`)
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

  /**
   * init template
   *
   * @param {string} name
   * @returns
   */
  async init(name) {
    if (!await _.isEmptyDir(_.cwd())) {
      _.log('Initialization fail: current folder is not empty', -2)
      return false
    }

    const template = new Template()
    const succ = await template.init(name, _.cwd(), this.options)
    if (succ) {
      _.log(`Template '${name}' init in current folder`, 1)
    } else {
      _.log(`Template '${name}' not found`, -2)
    }
  }

  /**
   * install dependencies
   * Local:
   * $ fbi i [package, package,...]
   * All:
   * $ fbi i [package, package,...] -a
   * Template:
   * $ fbi i [package, package,...] -t
   * Tasks(global):
   * $ fbi i [package, package,...] -g
   *
   * @param {string} params
   */
  async install(params) {
    const opts = this.options
    let target = 'local'
    let packages = {}
    const needInstalls = []

    if (params && params.length) {
      params.map(p => {
        if (p.startsWith(opts.TASK_PARAM_PREFIX)) {
          // type
          switch (p) {
            case '-a':
              target = 'all'
              break
            case '-t':
              target = 'template'
              break
            case '-g':
              target = 'global'
              break
          }
        } else {
          // pkgs
          const arr = p.split('@')
          packages[arr[0]] = arr[1] || '*'
        }
      })
    }

    if (!Object.keys(packages).length) {
      packages = null
    }

    let localDeps = {}
    let tmplDeps = {}
    let taskDeps = {}
    const npms = opts.npm || {
      alias: 'npm',
      options: ''
    }

    // Local
    if (target === 'all' || target === 'local') {
      const localPkgPath = _.cwd('package.json')
      let localPkgCnt
      if (await _.exist(localPkgPath)) {
        localPkgCnt = require(localPkgPath)
        localDeps = localPkgCnt.dependencies || {}
        packages && _.merge(localDeps, packages)
      }
      localPkgCnt = localPkgCnt || {
        dependencies: {}
      }
      if (localDeps && Object.keys(localDeps).length) {
        // write package.json
        localPkgCnt['dependencies'] = _.merge(localPkgCnt['dependencies'] || {}, localDeps)
        _.write(localPkgPath, JSON.stringify(localPkgCnt, null, 2))

        needInstalls.push({
          name: 'Local',
          deps: localDeps,
          path: _.cwd(''),
          opts: '--save ' + (npms.options || ''),
        })
      } else {
        _.log('No local dependencies found.')
      }
    }

    // Template
    if ((target === 'all' || target === 'template') && opts.template.name) {
      // template package.json => devDependencies
      try {
        const tmplPkg = _.join(opts.DATA_TEMPLATES, opts.template.name, 'package.json')
        tmplDeps = packages || require(tmplPkg).devDependencies
        if (Object.keys(tmplDeps).length) {
          // write package.json
          const tmplPkgCnt = require(tmplPkg)
          tmplPkgCnt['devDependencies'] = _.merge(tmplPkgCnt.devDependencies, tmplDeps)
          _.write(tmplPkg, JSON.stringify(tmplPkgCnt, null, 2))

          needInstalls.push({
            name: 'Template',
            deps: tmplDeps,
            path: _.join(opts.DATA_TEMPLATES, opts.template.name || ''),
            opts: '--save-dev ' + (npms.options || ''),
          })
        } else {
          _.log('No template dependencies found.')
        }
      } catch (e) {}
    }

    // Global tasks
    if (target === 'all' || target === 'global') {
      try {
        const taskPkg = _.join(opts.DATA_TASKS, 'package.json')
        taskDeps = packages || require(taskPkg).dependencies
        if (Object.keys(taskDeps).length) {
          // write package.json
          const taskPkgCnt = require(taskPkg)
          taskPkgCnt['dependencies'] = _.merge(taskPkgCnt.dependencies, taskDeps)
          _.write(taskPkg, JSON.stringify(taskPkgCnt, null, 2))

          needInstalls.push({
            name: 'Global task',
            deps: taskDeps,
            path: opts.DATA_TASKS,
            opts: '--save ' + (npms.options || ''),
          })
        }
      } catch (e) {}
    }

    if (!needInstalls.length) {
      _.log('No package need install.')
      return
    }

    const tasks = []
    needInstalls.map(async item => {
      if (item.deps && Object.keys(item.deps).length) {
        tasks.push(function () {
          return _.install(item.deps, item.path, npms.alias, item.opts, `${item.name} dependencies installtion`)
        })
      }
    })

    _.sequenceTasks(tasks)
      .then(value => {
        _.log('All done.', 1)
      }).catch(err => {
        _.log(err, -2)
      })
  }

  /**
   * Add template
   * name:        package.json "name"
   * version:     package.json "version"
   * description: package.json "description"
   */
  async addTempalte() {
    const opts = this.options
    let name = opts.template ? (opts.template.name || '') : ''
    if (!name) {
      // create name
      name = require(_.cwd('package.json')).name
    }

    const isExist = await _.exist(_.join(opts.DATA_TEMPLATES, name))
    if (isExist) {
      _.log(`Tempalte '${name}' already exist, input 'y' to update, or change the field 'template' value in './fbi/config.js' to create a new one.`, -1)

      const answer = await _.prompt('update')
      if (answer['update'] === 'y') {
        _.log(`Start to update template '${name}' ...`)
        await copy(_.cwd(), _.join(opts.DATA_TEMPLATES, name), opts.TEMPLATE_ADD_IGNORE)
        _.log(`Template '${name}' updated successfully`, 1)
      }
      process.exit(0)
    }

    _.log(`Start to add template '${name}' ...`)
    await copy(_.cwd(), _.join(opts.DATA_TEMPLATES, name), opts.TEMPLATE_ADD_IGNORE)
    _.log(`Template '${name}' added successfully`, 1)
  }

  async addTask() {
    const opts = this.options
    const userTasksFolerName = opts.paths.tasks
    const userTasksFolerPath = _.cwd(userTasksFolerName)
    const globalTasksFolderPath = _.join(opts.DATA_TASKS)

    async function addTaskFile(file, to) {
      const taskPath = _.join(userTasksFolerPath, file)
      const name = file.replace(_.extname(file), '')
      const taskExist = await _.exist(taskPath)
      await _.copyFile(taskPath, _.join(to, file), 'quiet')
      _.log(`Task '${name}' ${taskExist ? 'updated' : 'added'} successfully`, 1)
    }

    // add tasks
    const localTasksFolderExist = await _.exist(userTasksFolerPath)
    if (!localTasksFolderExist) {
      _.log(`Local tasks folder '${userTasksFolerName}' not found.`, 0)
    } else {
      const name = this.argvs[1]
      const globalTasksFolderExist = await _.exist(globalTasksFolderPath)
      if (!globalTasksFolderExist) {
        await _.mkdir(globalTasksFolderPath)
        await _.mkdir(_.join(globalTasksFolderPath, userTasksFolerName))
      }
      // copy node_modules
      const nodeModulesExist = await _.exist('node_modules')
      if (nodeModulesExist) {
        copy(_.cwd('node_modules'), _.join(globalTasksFolderPath, 'node_modules'))
      }

      // merge package.json
      // user package.json
      let usrPkg = {}
      try {
        usrPkg = require(_.cwd('package.json')).devDependencies
      } catch (e) {}

      // global task package.json
      let tskPkg = require(_.join(globalTasksFolderPath, 'package.json'))
      _.merge(tskPkg.devDependencies, usrPkg)
      await _.write(_.join(userTasksFolerName, 'package.json'), JSON.stringify(tskPkg, null, 2))

      if (name) {
        const file = _.extname(name) ? name : name + '.js'
        await addTaskFile(file, _.join(globalTasksFolderPath, userTasksFolerName))
      } else {
        const files = await _.readDir(userTasksFolerPath)
        // copy task files
        Promise.all(files.map(async item => {
          try {
            await addTaskFile(item, _.join(globalTasksFolderPath, userTasksFolerName))
          } catch (e) {
            _.log(e, 0)
          }
        }))
      }
    }
  }

  /**
   *
   * fbi rta -all
   * fbi rta task1
   * fbi rta task1 task2
   */
  async removeTask() {
    const prefix = this.options.TASK_PARAM_PREFIX
    const argvs = this.argvs.slice(1)
    const opts = _.parseArgvs(argvs, prefix)

    if (!argvs.length) {
      _.log(`No task was removed`)
      _.log(`Usage: fbi rm-task [name]`, -1)
      process.exit(0)
    }

    // rm all
    if (argvs.includes(`${prefix}all`)) {
      const answer = await _.ask(`${_.style.red('Remove all global tasks, sure?')} (y/N) `)
      if (answer && answer.toLowerCase() === 'y') {
        _.log(`Start to remove all global tasks ...`)
        _.rmdir(_.join(this.options.DATA_TASKS, this.options.paths.tasks), err => {
          if (err) {
            _.log(err, -2)
          } else {
            _.log(`All global tasks removed successfully`, 1)
          }
        })

      } else {
        process.exit(0)
      }
    }
    // rm a few
    else {
      const task = new Task()
      await Promise.all(Object.keys(opts).map(async item => {
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
        const taskName = _.style.bold(_.style.cyan(taskObj.name))
        if (taskObj.path) {
          _.log(`Removing ${taskObj.type} task ${taskName}...`)
          try {
            _.rmfile(taskObj.path, err => {
              if (err) {
                _.log(err, -2)
              }
              _.log(`${taskObj.type} task "${taskObj.name}" removed`, 1)
            })
          } catch (e) {
            _.log(e, -2)
          }
        } else {
          _.log(`Task "${taskObj.name}" not found.`, -2)
        }
      }))
    }
  }

  /**
   * only update "fbi" field in "package.json"
   *
   */
  async update() {
    const opts = this.options
    if (opts.template.name) {
      const pkgPath = _.join(opts.DATA_TEMPLATES, opts.template.name, 'package.json')
      if (await _.exist(pkgPath)) {} else {
        _.log(`Error: Global template "${opts.template.name}" not exist`, -2)
        process.exit(1)
      }

      let msg = `${_.style.yellow('This will replace "fbi" filed in "package.json", sure?')} (y/N) `
      const answer = await _.ask(msg)
      if (answer && answer.toLowerCase() === 'y') {
        const fbiOpts = require(pkgPath).fbi
        const usrOpts = require(_.cwd('package.json'))
        usrOpts['fbi'] = fbiOpts
        await _.write(_.cwd('package.json'), JSON.stringify(usrOpts, null, 2) + '\n')
        _.log('Update successfully', 1)
      }
    } else {
      _.log('This is not a FBI template')
    }
  }
}