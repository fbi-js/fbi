const path = require('path')
const EventEmitter = require('events')
const utils = require('./utils')
const Config = require('./core/config')
const Store = require('./core/store')
const Version = require('./core/version')
const Template = require('./core/template')
const Task = require('./core/task')
const usage = require('./helpers/usage')
const messenger = require('./helpers/messenger')
const installer = require('./helpers/installer')

const task = new Task()
const template = new Template()
const version = new Version()
const store = new Store()

class Fbi extends EventEmitter {
  constructor() {
    super()
    this.utils = utils
    this.logger = this.logger || new utils.Logger()
  }

  async config(mode = {}) {
    // Mode
    this.mode = mode

    // Configs
    const config = new Config()
    this.configs = await config.baseConfig()

    // Logger
    this.logger = new utils.Logger({
      level: this.configs.LOG_LEVEL,
      prefix: this.configs.LOG_PREFIX
    })
    this.logger.level = this.mode.debug ? 'debug' : this.configs.LOG_LEVEL
    this.logger.debug('Log level:', this.logger.level)
    this.logger.debug('Mode:', this.mode)
    this.logger.debug('Configs:\n', JSON.stringify(this.configs, null, 2))

    // Store
    store.start(this.configs._STORE_FILE)
    this.stores = store.get()
    this.logger.debug('Stores:\n', JSON.stringify(this.stores, null, 2))

    // Options
    this.options = await config.userConfig(this.mode, this.stores, this.logger)
    this.logger.debug('Options:\n', JSON.stringify(this.options, null, 2))

    if (this.mode.parallel) {
      this.logger.log('Running in `parallel` mode.')
    }

    template.start({
      mode: this.mode,
      stores: this.stores,
      configs: this.configs,
      options: this.options,
      logger: this.logger
    })

    version.start({
      logger: this.logger
    })

    messenger.init(this, this.logger)
  }

  /**
   * Run user tasks
   * @param {array} params Command options
   * @memberof Fbi
   */
  async run(params) {
    if (this.options.template) {
      const tmplInfo = this.stores[this.options.template.name]
      const target = {
        path: tmplInfo.path,
        version: this.options.template.version || tmplInfo.version.latest
      }

      // 1. Check template version
      try {
        this.logger.debug(`Change to version ${target.version}`)
        const versionChanged = await version.change(target.path, target.version)

        if (versionChanged) {
          this.logger.debug('Version changed, update store')
          // Update template's current version in store
          await store.update(tmplInfo.fullname, {
            version: {current: target.version}
          })

          // Remove template dependencies
          if (!tmplInfo.withModules) {
            this.logger.debug('Deleting node_modules')
            const targetModules = path.join(target.path, 'node_modules')
            if (await utils.fs.exist(targetModules)) {
              await utils.fs.remove(targetModules)
            }
          }
        }

        // Install dependencies
        this.logger.debug('Check dependencies installation...')

        await this.install('run')
      } catch (err) {
        this.logger.error(err)
      }
    }

    // Task mode: serial(default), parallel
    if (this.mode.parallel) {
      task.runInParallel(params, this)
    } else {
      await task.runInSerial(params, this)
    }
  }

  /**
   * Add tasks and templates
   * @param {string} cmd Command name
   * @param {array} argvs Command options
   * @memberof Fbi
   */
  // TODO: add local path
  async add(cmd, params) {
    if (params.length < 1) {
      return this.logger.error('Usage: fbi add <repo> [<repo> ...]')
    }

    const targetPaths = []

    const result = await Promise.all(
      params.map(async url => {
        try {
          if (!this.utils.type.isGitUrl(url)) {
            this.logger.error(
              `\`${url}\` is not a valid git repository address.`
            )
            return {
              message: 'invalid'
            }
          }

          this.logger.debug(`\`url\` is a valid git repository address.`)

          // Get path info
          const repoName = url.split('/').pop().replace('.git', '')
          const repoPath = path.join(this.configs._DATA_ROOT, repoName)
          this.logger.debug('Template name:', repoName)
          this.logger.debug('Template path:', repoPath)
          if (!template.isTemplate(repoName)) {
            this.logger.error(
              `FBI does not support this template, the name should start with \`${this
                .configs.TEMPLATE_PREFIX}\` or \`${this.configs.TASK_PREFIX}\` `
            )
            return
          }

          // Check if already exist
          if (this.stores[repoName]) {
            this.logger.warn(
              `\`${repoName}\` already exist, use \`fbi update ${repoName}\` to update it. `
            )
            return utils.assign(this.stores[repoName], {
              message: 'exist'
            })
          }

          // Clone
          this.logger.info(`Add \`${repoName}\`...`)

          const repoInfo = await version.add(
            url,
            this.configs._DATA_ROOT,
            repoName,
            this.mode.debug,
            this.logger
          )

          this.logger.debug('repoInfo:\n', repoInfo)
          const type = repoName.startsWith(this.configs.TASK_PREFIX)
            ? 'task'
            : 'template'
          let description = ''
          try {
            description = require(path.join(repoPath, 'package.json'))
              .description
          } catch (e) {}
          const withModules = !await utils.fs.isEmptyDir(
            path.join(repoPath, 'node_modules')
          )
          const info = {
            type,
            name: repoName
              .replace(this.configs.TEMPLATE_PREFIX, '')
              .replace(this.configs.TASK_PREFIX, ''),
            fullname: repoName,
            repo: url,
            version: {
              latest: repoInfo.current || 'master',
              current: repoInfo.current || 'master',
              all: repoInfo.versions || []
            },
            path: repoPath,
            description,
            withModules
          }
          if (type === 'task') {
            const file = require(path.join(repoPath, 'package.json')).main
            info.file = file
          }
          // Set store
          await store.set(repoName, info)

          this.logger.info(`\`${repoName || url}\` added.`)

          targetPaths.push({
            type,
            path: repoPath
          })

          return {
            type,
            fullname: repoName
          }
        } catch (err) {
          throw err
        }
      })
    )

    if (targetPaths.length > 0) {
      const targets = []
      targetPaths.map(t => {
        targets.push({
          path: t.path,
          type: t.type === 'task' ? 'prod' : 'dev'
        })
      })

      await this.install('add', null, targets)
    }

    return result
  }

  /**
   * Init template
   * Examples:
   * $ fbi init name@version
   * $ fbi init name@version@1.0.0 projectName
   * $ fbi init git@path/to/name.git
   * $ fbi init git@path/to/name.git@2.0.0 projectName
   * @param {string} cmd Command name
   * @param {array} params Command options
   * @returns
   * @memberof Fbi
   */
  async init(cmd, params) {
    if (params.length < 1) {
      return this.logger.error('Usage: fbi init <template name>[@<version>]')
    }

    const srcName = params[0]
    const dstName = params[1]
    const pathObj = template.pathParse(srcName)

    this.logger.debug('Template name   :', pathObj.name)
    this.logger.debug('Template version:', pathObj.version)

    const targetDir = path.join(process.cwd(), dstName || '')
    const projectName = dstName || path.basename(utils.path.cwd())

    let fullname
    if (this.utils.type.isGitUrl(pathObj.name)) {
      const _addResult = await this.add('init', [pathObj.name])
      const addResult = _addResult[0]
      if (!addResult || !addResult.fullname) {
        return
      }
      fullname = addResult.fullname
    } else if (this.utils.type.isPath(pathObj.name)) {
      return this.logger.error('Not yet supported.')
      // TODO: copy
    } else {
      fullname = template.nameParse(pathObj.name, this.configs.TEMPLATE_PREFIX)
    }

    const tmplInfo = this.stores[fullname]
    this.logger.debug('Template info:\n', tmplInfo)
    if (!tmplInfo) {
      return this.logger.error(`Template \`${fullname}\` not found.`)
    }

    // Init
    // use the lastest version by default
    pathObj.version = pathObj.version || tmplInfo.version.latest
    this.logger.info(
      `Creating a new project \`${projectName}\` based on template \`${fullname}\`...`
    )
    const initSuccess = await template.init(tmplInfo, {
      dir: targetDir,
      name: projectName,
      version: pathObj.version
    })
    if (!initSuccess) {
      return
    }

    // Set store
    this.logger.debug('Updating store...')
    await store.update(tmplInfo.fullname, {
      version: {
        current: pathObj.version
      }
    })
    this.logger.debug('Store updated.')
    this.logger.success(`✔ Project \`${projectName}\` created successfully.`)

    // Install dependencies
    await this.install('init', null, [
      {
        path: tmplInfo.path,
        type: 'dev'
      },
      {
        path: targetDir,
        type: 'prod'
      }
    ])
  }

  /**
   * Remove tasks and templates
   * @param {string} cmd Command name
   * @param {array} argvs Command options
   * @returns
   * @memberof Fbi
   */
  async remove(cmd, params) {
    if (params.length < 1) {
      return this.logger.error(
        'Usage: fbi remove <fbi-task-name> [<fbi-template-name>]'
      )
    }

    for (const item of params) {
      const itemInfo = getStoreItem(item, this)
      if (!itemInfo) {
        return this.logger.error(
          `Template or task \`${item}\` not found, use \`fbi ls\` to show all available local templates and tasks.`
        )
      }
      const answer = await utils.flow.prompt(
        `${this.logger.getPrefix()}${utils.style.yellow(
          'Sure you want to delete `' + itemInfo.fullname + '`? (y/N): '
        )}`
      )
      if (answer === 'y') {
        this.logger.debug(`Removing \`${itemInfo.path}\`...`)
        await utils.fs.remove(itemInfo.path)
        await store.del(itemInfo.fullname)
        this.logger.info(`\`${itemInfo.fullname}\` removed.`)
      }
    }
  }

  /**
   * Remove tasks and templates (using git)
   * @param {string} cmd Command name
   * @param {array} argvs Command options
   * @returns
   * @memberof Fbi
   */
  async update(cmd, params) {
    if (params.length < 1) {
      return this.logger.error('Usage: fbi update <fbi-task/template-name>')
    }

    Promise.all(
      params.map(async item => {
        try {
          const itemInfo = getStoreItem(item, this)
          if (!itemInfo) {
            return this.logger.error(
              `Template or task \`${item}\` not found, use \`fbi ls\` to show all available local templates and tasks.`
            )
          }

          this.logger.info(`Updating \`${itemInfo.fullname}\`...`)
          const updated = await version.update(itemInfo.path)
          if (!updated) {
            return this.logger.error(
              `\`${itemInfo.fullname}\` do not support version control.`
            )
          }

          // Set store
          const latestVersion = await version.getCurrentVersion(itemInfo.path)
          const versions = await version.getVersions(itemInfo.path)
          this.logger.debug('Latest version:', latestVersion)
          this.logger.debug('Versions: ', versions)

          await version.change(itemInfo.path, latestVersion)

          let description = ''
          try {
            description = require(path.join(itemInfo.path, 'package.json'))
              .description
          } catch (e) {}
          const withModules = !await utils.fs.isEmptyDir(
            path.join(itemInfo.path, 'node_modules')
          )
          const info = {
            version: {
              latest: latestVersion,
              current: latestVersion,
              all: versions
            },
            description,
            withModules
          }
          await store.update(itemInfo.fullname, info)
          this.logger.info(`\`${itemInfo.fullname}\` updated.`)
        } catch (err) {
          this.logger.error(err)
        }
      })
    )
  }

  /**
   * Change template version
   * Demo: $ fbi use <version>
   * @param {string} cmd Command name
   * @param {array} params Command options
   * @memberof Fbi
   */
  async use(cmd, params) {
    if (!this.options.template) {
      return this.logger.error('This is not a FBI project.')
    }
    if (params.length < 1) {
      return this.logger.error('Please specify version.')
    }

    // TODO: Separate name@verson
    const name = this.options.template.name
    const ver = params[0]
    const tmplInfo = this.stores[name]

    // 1. Check template version
    const versionChanged = await version.change(
      tmplInfo.path,
      ver,
      this.mode.debug
    )

    if (versionChanged) {
      this.logger.info(`Version changed to \`${ver}\`.`)

      if (!tmplInfo.withModules) {
        const targetModules = path.join(tmplInfo.path, 'node_modules')
        if (await utils.fs.exist(targetModules)) {
          await utils.fs.remove(targetModules)
        }
      }

      // Update local version
      const localPackage = require(utils.path.cwd('package.json'))
      localPackage.fbi.template.version = ver
      await utils.fs.write(
        utils.path.cwd('package.json'),
        JSON.stringify(localPackage, null, 2)
      )

      //  Update template's current version in store
      await store.update(name, {
        version: {current: ver}
      })
    } else {
      this.logger.warn(`You are already in version \`${ver}\`.`)
    }

    // Install dependencies
    await this.install('use')
  }

  /**
   * Install dependencies
   * 
   * @param {string} cmd Command name
   * @param {array} params Command options 
   * @memberof Fbi
   */
  async install(cmd, params, targetDir) {
    let targets = []
    if (targetDir && targetDir.length > 0) {
      targets = targetDir
    } else {
      if (this.options.template) {
        targets.push({
          path: this.stores[this.options.template.name].path,
          type: 'dev'
        })
      }
      targets.push({path: process.cwd(), type: 'prod'})
    }

    const logLevel = cmd === 'i' || cmd === 'install' ? 'log' : 'debug'

    for (const item of targets) {
      try {
        const needInstall = await installer.check(item.path, item.type)
        if (!needInstall) {
          this.logger[logLevel](`No ${item.type} dependencies need install.`)
        } else {
          this.logger[logLevel](`Installing ${item.type} dependencies...`)

          await installer.start({
            command: this.configs.NPM,
            action: 'install',
            extra: this.configs.NPM_OPTIONS,
            dir: item.path,
            type: item.type,
            logger: this.logger,
            show: true
          })
        }
      } catch (err) {
        this.logger.error(err)
      }
    }
  }

  /**
   * Set configs
   * 
   * @param {string} cmd Command name
   * @param {array} params Command options 
   * @memberof Fbi
   */
  async set(cmd, params) {
    const warnings =
      '\nModifications may lead to incompatibilities with previous projects and situations.\n'

    const canSetItems = Object.keys(this.configs).filter(
      item => !item.startsWith('_')
    )

    if (params.length < 1) {
      // Set all
      console.log('Set the FBI configuration... ')
      console.log(utils.style.yellow(warnings))
      console.log(
        'Please enter a custom value, leave blank will use the default value. (ctrl+c to exit)'
      )
      const questions = []
      Object.keys(this.configs).map(c => {
        if (canSetItems.includes(c)) {
          questions.push(
            `${c.padEnd(20)} ${utils.style.grey('(' + this.configs[c] + ')')}: `
          )
        }
      })
      const answers = await utils.flow.prompt(questions)
      if (answers.length < 1) {
        return
      }
      answers.map((a, index) => {
        const val = a.trim()
        if (val) {
          this.configs[canSetItems[index]] = val
        }
      })

      // Write file
      await utils.fs.write(
        this.configs._CUSTOM_CONFIG_FILE,
        JSON.stringify(this.configs, null, 2)
      )

      this.logger.success('Configuration saved successfully.')
    } else {
      // Set item
      try {
        const inputs = {}
        params.map(p => {
          const tmpArr = p.split('=')
          const key = (tmpArr[0] || '').trim().toUpperCase()
          const val = (tmpArr[1] ? tmpArr[1] : '').trim()
          if (key && val) {
            if (canSetItems.includes(key)) {
              inputs[key] = val
            } else {
              throw `Item \`${key}\` can not be set.`
            }
          } else {
            throw 'Usage: `fbi set key=value`.'
          }
        })

        if (Object.keys(inputs).length > 0) {
          if (
            inputs.LOG_LEVEL &&
            !['debug', 'info', 'success', 'warn', 'error'].includes(
              inputs.LOG_LEVEL
            )
          ) {
            throw `LOG_LEVEL should be one of ['debug', 'info', 'success', 'warn', 'error']`
          }
          if (
            inputs.TASK_TIMEOUT &&
            (isNaN(inputs.TASK_TIMEOUT) || inputs.TASK_TIMEOUT * 1 < 10000)
          ) {
            throw '`TASK_TIMEOUT` must be a number and greater than 10000.'
          }

          // Do
          await utils.fs.write(
            this.configs._CUSTOM_CONFIG_FILE,
            JSON.stringify(utils.assign(this.configs, inputs), null, 2)
          )
          this.logger.success('Configuration saved successfully.')
        }
      } catch (err) {
        this.logger.error(err)
      }
    }
  }

  /**
   * Configs reset
   * 
   * @param {string} cmd Command name
   * @param {array} params Command options 
   * @memberof Fbi
   */
  async reset(cmd, params) {
    const customFile = this.configs._CUSTOM_CONFIG_FILE
    if (!await utils.fs.exist(customFile)) {
      this.logger.log(
        'No custom configs found, you are using the default configuration.'
      )
      return this.logger.log('Use `fbi set` to customize the configuration.')
    }

    const answer = await utils.flow.prompt(
      'Sure you want to reset FBI configuration? (y/N):'
    )
    if (answer === 'y') {
      try {
        await utils.fs.remove(customFile)
      } catch (err) {}
      this.logger.success('FBI configuration set to defaults.')
    } else {
      this.logger.log('Cancelled.')
    }
  }

  /**
   * Show tasks and templates list
   * @param {string} cmd Command name
   * @param {array} params Command options
   * @memberof Fbi
   */
  async list(cmd, params) {
    if (params.length < 1) {
      const task = new Task()
      const tasks = await task.all(this.configs, this.options, this.stores)
      const highlightColor = 'green'

      const tasksTxt = `
  ${utils.style.bold('Tasks:')} 
    `
      let tasksExt = ''
      const tmplsTxt = `\n
  ${utils.style.bold('Templates:')}
    `
      let tmplsExt = ''

      // Tasks
      ;['global', 'template', 'local'].map(type => {
        const flag = type === 'global' ? '-G' : type === 'template' ? '-T' : ''
        const color = type === 'local' ? highlightColor : ''
        tasks[type].map(t => {
          const version = t.version ? utils.style.grey(t.version) : ''
          const alias = t.alias ? t.alias + ', ' : ''
          const name = t.name

          const left = (color
            ? utils.style[color](`${alias}${name}`)
            : `${alias}${name}`).padEnd(17)
          const center =
            flag || version ? (flag + ' ' + version).padEnd(8) : ' '.padEnd(17)
          const right = t.desc || ''

          tasksExt += `
    ${left} ${center}  ${right}`
          return false
        })
      })
      if (!tasksExt) {
        tasksExt = utils.style.grey(`
      No task, use 'fbi add <repo>' to add tasks.`)
      }

      // Templates
      Object.keys(this.stores).map(item => {
        if (item.startsWith(this.configs.TEMPLATE_PREFIX)) {
          const _name = item.replace(this.configs.TEMPLATE_PREFIX, '')
          const isCurrent =
            this.options.template && this.options.template.name === item
          const star = isCurrent ? utils.style[highlightColor]('★  ') : '★  '
          const name = isCurrent
            ? utils.style[highlightColor](_name.padEnd(15))
            : _name.padEnd(15)
          const version = utils.style.grey(
            `${this.stores[item].version.current}`.padEnd(10)
          )
          const description = this.stores[item].description
          tmplsExt += `
    ${star}${name}${version}${description}`
        }
      })
      if (!tmplsExt) {
        tmplsExt = utils.style.grey(`
      No template, use 'fbi add <repo>' to add templates.`)
      }

      console.log(tasksTxt + tasksExt + tmplsTxt + tmplsExt + '\n')
    }

    // Others
    for (const param of params) {
      switch (param) {
        case 'config':
        case 'configs': {
          // List configs
          let txt = '\n'
          Object.keys(this.configs).map(c => {
            txt += txt === '\n' ? '' : '\n'
            if (c.startsWith('_')) {
              const key = c + utils.style.grey('(readonly)')
              txt += key.padEnd(40)
            } else {
              txt += c.padEnd(30)
            }
            txt += `: ${this.configs[c]}`
          })
          console.log(txt)
          break
        }
        case 'store':
        case 'stores': {
          // List stores
          const stores = this.stores
          const task = new Task()
          let txt = ''
          for (const c of Object.keys(stores)) {
            txt += `\n${utils.style.cyan(c)}\n`
            txt += `${'repository'.padStart(15)}: ${stores[c]
              .repo}\n${'version'.padStart(15)}: ${JSON.stringify(
              stores[c].version
            )}\n${'path'.padStart(15)}: ${stores[c]
              .path}\n${'description'.padStart(15)}: ${stores[c].description}\n`
            if (stores[c].type !== 'task') {
              const tasks = await task.findTasks(
                path.join(stores[c].path, this.configs.TEMPLATE_TASKS),
                this.options
              )
              txt += `${'tasks'.padStart(15)}: ${tasks.map(t => t.name)}\n`
            }
          }
          console.log(txt)
          break
        }
        case 'util':
        case 'utils': {
          // List utils
          console.log(this.utils)
          break
        }
      }
    }
  }

  /**
   * Display help information
   * @memberof Fbi
   */
  async help() {
    const v = require('../package.json').version
    console.log(usage(v))
  }

  /**
   * Display fbi version number
   * @memberof Fbi
   */
  async showVersion() {
    const v = require('../package.json').version
    console.log(`v${v}`)
  }
}

module.exports = Fbi

function getStoreItem(item, ctx) {
  let info
  if (
    !item.startsWith(ctx.configs.TASK_PREFIX) &&
    !item.startsWith(ctx.configs.TEMPLATE_PREFIX)
  ) {
    info =
      ctx.stores[ctx.configs.TEMPLATE_PREFIX + item] ||
      ctx.stores[ctx.configs.TASK_PREFIX + item]
  } else {
    info = ctx.stores[item]
  }

  return info
}

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart

if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength, padString) {
    targetLength = targetLength >> 0 // Floor if number or convert non-number to 0;
    padString = String(padString || ' ')
    if (this.length > targetLength) {
      return String(this)
    }
    targetLength = targetLength - this.length
    if (targetLength > padString.length) {
      padString += padString.repeat(targetLength / padString.length) // Append to original to ensure we are longer than needed
    }
    return padString.slice(0, targetLength) + String(this)
  }
}

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd
if (!String.prototype.padEnd) {
  String.prototype.padEnd = function padEnd(targetLength, padString) {
    targetLength = targetLength >> 0 // Floor if number or convert non-number to 0;
    padString = String(padString || ' ')
    if (this.length > targetLength) {
      return String(this)
    }
    targetLength = targetLength - this.length
    if (targetLength > padString.length) {
      padString += padString.repeat(targetLength / padString.length) // Append to original to ensure we are longer than needed
    }
    return String(this) + padString.slice(0, targetLength)
  }
}
