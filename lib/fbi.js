const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
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
      // make sure data root foler is exist
      const dataRoot = _.join(process.env.HOME, defaultOpts.DATA_ROOT)
      const infoPath = _.join(dataRoot, defaultOpts.INFO)
      if (!_.existSync(dataRoot)) {
        fs.mkdirSync(dataRoot)
      }

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
            localOpts['template'] = {}
            localOpts['template']['name'] = pkg.fbi
            localOpts['template']['version'] = 'master'
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
      if (
        _.existSync(infoPath) &&
        localOpts.template &&
        localOpts.template.name
      ) {
        const info = require(infoPath)
        const templatePath = info.templates[localOpts.template.name].path

        if (_.existSync(templatePath)) {
          opts['node_modules_path'] = _.join(templatePath, 'node_modules/')
          tmplOpts['template'] = info.templates[localOpts.template.name]

          // package.json
          const tmplPkgPath = _.join(templatePath, 'package.json')
          if (_.existSync(tmplPkgPath)) {
            const tmplPkg = require(tmplPkgPath)
            if (tmplPkg.fbi) {
              _.merge(tmplOpts, tmplPkg.fbi)
            }
          }

          // fbi/config.js
          const tmplCfgPath = _.join(templatePath, defaultOpts.paths.config)
          if (_.existSync(tmplCfgPath)) {
            tmplOpts = _.merge(require(tmplCfgPath), tmplOpts)
          }
        } else {
          opts['node_modules_path'] = _.cwd('node_modules/')
        }
      } else {
        opts['node_modules_path'] = _.cwd('node_modules/')
      }

      this.options = _.merge(defaultOpts, tmplOpts, localOpts, opts)

      /**
       * init data paths
       */
      this.options.DATA_ROOT = dataRoot
      this.options.INFO = infoPath

      // console.log(this.options)

      return this
    } catch (err) {
      throw err
    }
  }

  get config() {
    return this.options
  }

  async list(params) {
    try {
      const task = new Task()
      const template = new Template()
      const opts = this.options
      let info
      try {
        info = require(opts.INFO)
      } catch (e) {}

      // list template's info
      if (params[0] === '-t') {
        if (opts.template) {
          await template.list(opts, info)
        } else {
          _.log('This is not a FBI template.', -2)
        }
        return
      }

      let helps = _.genTaskHelpTxt(await task.all(opts, true, false))
      // const tmplName = opts.template ? opts.template.name || '' : ''
      // const tmplDesc = opts.template ? opts.template.description || '' : ''

      // helps += _.genTmplHelpTxt(await template.all(opts), tmplName, tmplDesc)
      helps += _.genTmplHelpTxt(info ? info.templates : null, opts.template)

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

    await Promise.all(
      Object.keys(opts).map(async item => {
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
            this['taskParams'] =
              itemParams && itemParams.length ? itemParams : null
            await task.run(item, this, taskObj)
          } else {
            _.log(`Task not found: '${item}'`, -2)
          }
        } catch (e) {
          _.log(e, -1)
        }
      })
    )

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
  async init(params) {
    if (!await _.isEmptyDir(_.cwd())) {
      _.log('Initialization fail: current folder is not empty.', -2)
      return false
    }

    const template = new Template()
    const succ = await template.init(params, _.cwd(), this.options)
    if (succ) {
      _.log(
        `Template "${params[0]} (${params[1] ||
          'master'})" initialized in current folder.`,
        1
      )
    } else {
      _.log(`Template "${params[0]} (${params[1] || 'master'})" not found.`, -2)
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
   * @param {array} params
   */
  async install(params) {
    const opts = this.options
    let target = 'local'
    let packages = {}
    const needInstalls = []
    const npms = opts.npm || {
      alias: 'npm',
      options: ''
    }

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
            default:
              npms.alias = p.replace('-', '')
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

    // Local
    if (target === 'all' || target === 'local') {
      try {
        const localPkgPath = _.cwd('package.json')
        let localPkgCnt
        if (await _.exist(localPkgPath)) {
          localPkgCnt = require(localPkgPath)
          localDeps = localPkgCnt.dependencies || {}
        }
        packages && _.merge(localDeps, packages)
        localPkgCnt = localPkgCnt || {
          name: 'fbi-inited',
          description: 'This is inited by fbi',
          repository: 'https://github.com/neikvon/fbi',
          dependencies: {},
          license: 'MIT'
        }
        if (Object.keys(localDeps).length) {
          // write package.json
          localPkgCnt['dependencies'] = _.merge(
            localPkgCnt['dependencies'] || {},
            localDeps
          )
          _.write(localPkgPath, JSON.stringify(localPkgCnt, null, 2))

          needInstalls.push({
            name: 'Local',
            deps: localDeps,
            path: _.cwd(''),
            opts: '--save ' + (npms.options || '')
          })
        } else {
          _.log('No local dependencies found.')
        }
      } catch (e) {
        _.log('Error occurred during install local dependencies: ', -2)
        _.log(e.message, -2)
        return false
      }
    }

    // Template
    if (
      (target === 'all' || target === 'template') &&
      opts.template &&
      opts.template.name
    ) {
      // template package.json => devDependencies
      try {
        const tmplPkg = _.join(opts.template.path, 'package.json')
        tmplDeps = packages || require(tmplPkg).devDependencies
        if (Object.keys(tmplDeps).length) {
          // write package.json
          const tmplPkgCnt = require(tmplPkg)
          tmplPkgCnt['devDependencies'] = _.merge(
            tmplPkgCnt.devDependencies,
            tmplDeps
          )
          _.write(tmplPkg, JSON.stringify(tmplPkgCnt, null, 2))

          needInstalls.push({
            name: 'Template',
            deps: tmplDeps,
            path: opts.template.path,
            opts: '--save-dev ' + (npms.options || '')
          })
        } else {
          _.log('No template dependencies found.')
        }
      } catch (e) {
        _.log('Error occurred during install template devDependencies: ', -2)
        _.log(e.message, -2)
        return false
      }
    }

    // Global tasks
    if (target === 'all' || target === 'global') {
      try {
        const taskPkg = _.join(opts.DATA_TASKS, 'package.json')
        taskDeps = packages || require(taskPkg).dependencies
        if (Object.keys(taskDeps).length) {
          // write package.json
          const taskPkgCnt = require(taskPkg)
          taskPkgCnt['dependencies'] = _.merge(
            taskPkgCnt.dependencies,
            taskDeps
          )
          _.write(taskPkg, JSON.stringify(taskPkgCnt, null, 2))

          needInstalls.push({
            name: 'Global task',
            deps: taskDeps,
            path: opts.DATA_TASKS,
            opts: '--save ' + (npms.options || '')
          })
        }
      } catch (e) {
        _.log('Error occurred during install global task dependencies: ', -2)
        _.log(e.message, -2)
        return false
      }
    }

    if (!needInstalls.length) {
      _.log('No package need install.')
      return
    }
    // _.log(needInstalls)

    const tasks = []
    needInstalls.map(async item => {
      if (item.deps && Object.keys(item.deps).length) {
        tasks.push(function() {
          return _.install(
            item.deps,
            item.path,
            npms.alias,
            item.opts,
            `${item.name} dependencies installtion`
          )
        })
      }
    })

    _.sequenceTasks(tasks)
      .then(value => {
        _.log('All done.', 1)
      })
      .catch(err => {
        _.log(err.code, -2)
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
    let name = opts.template ? opts.template.name || '' : ''
    if (!name) {
      // create name
      name = require(_.cwd('package.json')).name
    }

    const isExist = await _.exist(_.join(opts.DATA_TEMPLATES, name))
    if (isExist) {
      _.log(
        `Tempalte '${name}' already exist, input 'y' to update, or change the field 'template' value in './fbi/config.js' to create a new one.`,
        -1
      )

      const answer = await _.prompt('update')
      if (answer['update'] === 'y') {
        _.log(`Start to update template '${name}' ...`)
        await copy(
          _.cwd(),
          _.join(opts.DATA_TEMPLATES, name),
          opts.TEMPLATE_ADD_IGNORE
        )
        _.log(`Template '${name}' updated successfully`, 1)
      }
      process.exit(0)
    }

    _.log(`Start to add template '${name}' ...`)
    await copy(
      _.cwd(),
      _.join(opts.DATA_TEMPLATES, name),
      opts.TEMPLATE_ADD_IGNORE
    )
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
        copy(
          _.cwd('node_modules'),
          _.join(globalTasksFolderPath, 'node_modules')
        )
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
      await _.write(
        _.join(userTasksFolerName, 'package.json'),
        JSON.stringify(tskPkg, null, 2)
      )

      if (name) {
        const file = _.extname(name) ? name : name + '.js'
        await addTaskFile(
          file,
          _.join(globalTasksFolderPath, userTasksFolerName)
        )
      } else {
        const files = await _.readDir(userTasksFolerPath)
        // copy task files
        Promise.all(
          files.map(async item => {
            try {
              await addTaskFile(
                item,
                _.join(globalTasksFolderPath, userTasksFolerName)
              )
            } catch (e) {
              _.log(e, 0)
            }
          })
        )
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
      const answer = await _.ask(
        `${_.style.red('Remove all global tasks, sure?')} (y/N) `
      )
      if (answer && answer.toLowerCase() === 'y') {
        _.log(`Start to remove all global tasks ...`)
        _.rmdir(
          _.join(this.options.DATA_TASKS, this.options.paths.tasks),
          err => {
            if (err) {
              _.log(err, -2)
            } else {
              _.log(`All global tasks removed successfully`, 1)
            }
          }
        )
      } else {
        process.exit(0)
      }
    } else {
      // rm a few
      const task = new Task()
      await Promise.all(
        Object.keys(opts).map(async item => {
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
        })
      )
    }
  }

  /**
   * only update "fbi" field in "package.json"
   *
   */
  async update() {
    const opts = this.options
    if (opts.template.name) {
      const pkgPath = _.join(
        opts.DATA_TEMPLATES,
        opts.template.name,
        'package.json'
      )
      if (await _.exist(pkgPath)) {
      } else {
        _.log(`Error: Global template "${opts.template.name}" not exist`, -2)
        process.exit(1)
      }

      let msg = `${_.style.yellow(
        'This will replace "fbi" filed in "package.json", sure?'
      )} (y/N) `
      const answer = await _.ask(msg)
      if (answer && answer.toLowerCase() === 'y') {
        const fbiOpts = require(pkgPath).fbi
        const usrOpts = require(_.cwd('package.json'))
        usrOpts['fbi'] = fbiOpts
        await _.write(
          _.cwd('package.json'),
          JSON.stringify(usrOpts, null, 2) + '\n'
        )
        _.log('Update successfully', 1)
      }
    } else {
      _.log('This is not a FBI template')
    }
  }

  async clone(params) {
    const dataRoot = this.options.DATA_ROOT
    const everything = await _.readDir(dataRoot)
    const isTaskOrTemplate = name =>
      name.startsWith(this.options.TASK_PREFIX) ||
      name.startsWith(this.options.TEMPLATE_PREFIX)
    const items = everything.filter(isTaskOrTemplate)
    const info = {
      tasks: {},
      templates: {}
    }

    await Promise.all(
      params.map(async url => {
        try {
          if (!url.endsWith('.git')) {
            _.log(`"${url}" is not a valid git repo.`, -2)
            return
          }

          const repoName = url
            .split('/')
            .pop()
            .replace('.git', '')
          // const regx = /((?!.*-).+)\./ // between last '-' and last '.'
          // const nameArr = repoName.match(regx)
          // const item = nameArr[1]
          const repoPath = _.join(dataRoot, repoName)
          let type
          if (repoName.startsWith(this.options.TASK_PREFIX)) {
            type = 'task'
          } else if (repoName.startsWith(this.options.TEMPLATE_PREFIX)) {
            type = 'template'
          }
          const pureName = repoName.substr(
            type === 'task'
              ? this.options.TASK_PREFIX.length
              : this.options.TEMPLATE_PREFIX.length,
            repoName.length
          )

          if (!type) {
            _.log('FBI not support this kind of repo', -2)
            return
          }

          if (items.includes(repoName)) {
            _.log(`"${repoName}" already exist.`, -2)
            return
          }

          // clone
          await _.repoClone(url, dataRoot, repoName)
          _.log(`"${repoName || url}" cloned successfully.`, 1)

          // get latest version
          // const version = await _.repoVersion(repoPath)
          // _.log(`version: ${version}`)
          let description = ''
          try {
            description = require(_.join(repoPath, 'package.json')).description
          } catch (e) {}
          info[`${type}s`][pureName] = {
            repo: url,
            version: 'master',
            path: repoPath,
            description
          }
        } catch (e) {
          throw e
        }
      })
    )

    // write file
    let newInfo = info
    if (await _.exist(this.options.INFO)) {
      const oldInfo = require(this.options.INFO)
      newInfo = _.merge(oldInfo, info)
    }
    await _.write(this.options.INFO, JSON.stringify(newInfo, null, 2))
  }

  async pull(params) {
    const items = await getValidItems(this.options)
    if (!params || params.length <= 0) {
      process.exit(0)
    }
    Promise.all(
      params.map(async item => {
        try {
          if (items.all.includes(item)) {
            await _.repoPull(_.join(this.options.DATA_ROOT, item))
            _.log(`"${item}" updated.`, 1)
          } else {
            _.log(`${item} not exist.`, -2)
          }
        } catch (e) {
          _.log(e, -2)
        }
      })
    )
  }

  async use(params) {
    if (!this.options.template) {
      _.log('This is not a FBI template.', -2)
      return
    }
    if (params.length < 1) {
      _.log('Please specify version.', -2)
      return
    }
    const name = this.options.template.name
    const version = params[0]
    const repo = require(this.options.INFO).templates[name].path

    // checkout version
    await _.repoCheckout(repo, version)
    _.log(`Now using template ${_.style.cyan(name)} (${version})`)

    // update local version
    const localPackage = require(_.cwd('package.json'))
    localPackage.fbi.template['version'] = version
    await _.write(_.cwd('package.json'), JSON.stringify(localPackage, null, 2))
  }
}

async function getValidItems(opts) {
  const everything = await _.readDir(opts.DATA_ROOT)
  const isTask = name => name.startsWith(opts.TASK_PREFIX)
  const isTemplate = name => name.startsWith(opts.TEMPLATE_PREFIX)
  const tasks = everything.filter(isTask)
  const templates = everything.filter(isTemplate)
  const all = tasks.concat(templates)
  return {
    tasks,
    templates,
    all
  }
}
