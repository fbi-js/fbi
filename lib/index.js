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

const template = new Template()
const version = new Version()

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
    this.store = new Store(this.configs._STORE_FILE)
    this.stores = this.store.get()
    this.logger.debug('Stores:\n', JSON.stringify(this.stores, null, 2))

    // Options
    this.options = await config.userConfig(this.mode, this.stores, this.logger)
    this.logger.debug('Options:\n', JSON.stringify(this.options, null, 2))

    if (this.mode.parallel) {
      this.logger.log('Running in `parallel` mode.')
    }

    this.task = new Task()

    this.template = new Template({
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

    process.on('SIGINT', () => {
      console.log('')
      this.logger.warn('Gracefully shutting down from SIGINT (ctrl+c).')
      process.exit()
    })
  }

  /**
   * Run user tasks
   * @param {array} params Command params
   * @memberof Fbi
   */
  async run(params) {
    if (this.options.template) {
      const tmplInfo = this.stores[this.options.template.name]
      this.logger.debug('tmplInfo:', tmplInfo)
      if (tmplInfo.version) {
        const target = {
          path: tmplInfo.path,
          version: this.options.template.version || tmplInfo.version.latest
        }

        // 1. Check template version
        try {
          this.logger.debug(`Change to version ${target.version}`)
          const versionChanged = await version.change(
            target.path,
            target.version
          )
          this.logger.debug('versionChanged: ', versionChanged)

          if (versionChanged) {
            this.logger.debug('Version changed, update store')
            // Update template's current version in store
            await this.store.update(tmplInfo.fullname, {
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
    }

    // Task mode: serial(default), parallel
    if (this.mode.parallel) {
      this.task.runInParallel(params, this)
    } else {
      await this.task.runInSerial(params, this)
    }
  }

  /**
   * Add tasks and templates (from git url or (TODO: local path))
   * @param {string} cmd Command name
   * @param {array} params Command params
   * @param {object} opts Command options
   * @memberof Fbi
   */
  async add(cmd, params, opts) {
    if (params.length < 1) {
      return this.logger.error('Usage: fbi add <repo> [<repo> ...]')
    }

    const targetPaths = []
    const result = []

    // const result = await Promise.all(
    //   params.map(async url => {
    for (const url of params) {
      try {
        // Add
        const tmplInfo = await this.template.add(url)
        this.logger.debug('tmplInfo:\n', tmplInfo)
        if (tmplInfo.message) {
          break
        }

        // Get extra info
        let description = ''
        try {
          description = require(path.join(tmplInfo.path, 'package.json'))
            .description
        } catch (e) {}

        const withModules = !await utils.fs.isEmptyDir(
          path.join(tmplInfo.path, 'node_modules')
        )

        const info = Object.assign({}, tmplInfo, {
          description,
          withModules
        })

        if (tmplInfo.type === 'task') {
          const file = require(path.join(tmplInfo.path, 'package.json')).main
          info.file = file
        }

        // Set store
        await this.store.set(tmplInfo.fullname, info)
        this.logger.success(`\`${tmplInfo.fullname || url}\` added.`)

        targetPaths.push({
          type: tmplInfo.type,
          path: tmplInfo.path
        })

        result.push({
          type: tmplInfo.type,
          fullname: tmplInfo.path
        })
      } catch (err) {
        this.logger.error(err)
        continue
      }
    }

    //   })
    // )

    if (targetPaths.length > 0) {
      const targets = []
      targetPaths.map(t => {
        targets.push({
          path: t.path,
          type: t.type === 'task' ? 'prod' : 'dev'
        })
      })

      await this.install('add', null, null, targets)
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
   * Opts: -t(ask), -a(ll)
   * @param {string} cmd Command name
   * @param {array} params Command params
   * @param {object} opts Command options
   * @returns
   * @memberof Fbi
   */
  async init(cmd, params, opts) {
    if (params.length < 1) {
      return this.logger.error(
        'Usage: fbi init <template name>[@<version>] [project-name] [options]'
      )
    }
    const extra =
      opts.t || opts.task ? 'with-tasks' : opts.a || opts.all ? 'with-all' : ''

    const srcName = params[0]
    const dstName = params[1]
    const pathObj = this.template.pathParse(srcName)

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
      fullname = this.template.nameParse(pathObj.name, [
        this.configs.TEMPLATE_PREFIX,
        this.configs.TASK_PREFIX
      ])
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

    const initSuccess = await this.template.init(
      tmplInfo,
      {
        dir: targetDir,
        name: projectName,
        version: pathObj.version
      },
      extra
    )
    if (!initSuccess) {
      return
    }

    // Set store
    if (tmplInfo.version && pathObj.version) {
      this.logger.debug('Updating store...')
      await this.store.update(tmplInfo.fullname, {
        version: {
          current: pathObj.version
        }
      })
      this.logger.debug('Store updated.')
    }
    this.logger.success(`✔ Project \`${projectName}\` created successfully.`)

    // Install dependencies
    await this.install('init', null, null, [
      {
        path: tmplInfo.path,
        type: 'dev'
      },
      {
        path: targetDir,
        type: 'prod',
        force: extra === 'with-all'
      }
    ])
  }

  /**
   * Remove tasks and templates
   * @param {string} cmd Command name
   * @param {array} params Command params
   * @param {object} opts Command options
   * @returns
   * @memberof Fbi
   */
  async remove(cmd, params, opts) {
    if (params.length < 1) {
      return this.logger.error(
        'Usage: fbi remove <fbi-task-name> [<fbi-template-name>]'
      )
    }

    for (const item of params) {
      try {
        const itemInfo = await this.template.getInfo(item)
        this.logger.debug('itemInfo:', itemInfo)
        if (!itemInfo) {
          this.logger.error(
            `Template or task \`${item}\` not found, use \`fbi ls\` to show all available local templates and tasks.`
          )
          continue
        }
        const answer = await utils.flow.prompt(
          `${this.logger.getPrefix()}${utils.style.yellow(
            'Sure you want to delete `' + itemInfo.fullname + '`? (y/N): '
          )}`
        )
        if (answer === 'y') {
          this.logger.debug(`Removing \`${itemInfo.path}\`...`)
          await utils.fs.remove(itemInfo.path)
          await this.store.del(itemInfo.fullname)
          this.logger.success(`\`${itemInfo.fullname}\` removed.`)
        }
      } catch (err) {
        this.logger.error(err)
        continue
      }
    }
  }

  /**
   * Update tasks and templates (using git)
   * @param {string} cmd Command name
   * @param {array} params Command params
   * @param {object} opts Command options
   * @returns
   * @memberof Fbi
   */
  async update(cmd, params, opts) {
    if (params.length < 1) {
      return this.logger.error('Usage: fbi update <fbi-task/template-name>')
    }

    Promise.all(
      params.map(async item => {
        try {
          const itemInfo = await this.template.getInfo(item)
          if (!itemInfo) {
            return this.logger.error(
              `Template or task \`${item}\` not found, use \`fbi ls\` to show all available local templates and tasks.`
            )
          }

          this.logger.info(`Updating \`${itemInfo.fullname}\`...`)
          const updated = await version.update(
            itemInfo.path,
            this.mode.debug,
            this.logger
          )
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
          await this.store.update(itemInfo.fullname, info)
          this.logger.success(`\`${itemInfo.fullname}\` updated.`)
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
   * @param {array} params Command params
   * @param {object} opts Command options
   * @memberof Fbi
   */
  async use(cmd, params, opts) {
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
      await this.store.update(name, {
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
   * @param {string} cmd Command name
   * @param {array} params Command params
   * @param {object} opts Command options 
   * @param {object} targetDir Specified targets
   * @memberof Fbi
   */
  async install(cmd, params, opts, targetDir) {
    let force = (opts && opts.f) || (opts && opts.force)

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
        let needInstall = force || item.force
        if (!needInstall) {
          needInstall = await installer.check(item.path, item.type)
        }
        if (!needInstall) {
          this.logger[logLevel](`No ${item.type} dependencies need install.`)
        } else {
          this.logger.log(`Installing ${item.type} dependencies...`)

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
   * @param {string} cmd Command name
   * @param {array} params Command params
   * @param {object} opts Command options 
   * @memberof Fbi
   */
  async set(cmd, params, opts) {
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
   * @param {string} cmd Command name
   * @param {array} params Command params
   * @param {object} opts Command options
   * @memberof Fbi
   */
  async reset(cmd, params, opts) {
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
   * @param {array} params Command params
   * @param {object} opts Command options
   * @memberof Fbi
   */
  async list(cmd, params, opts) {
    if (params.length < 1) {
      const task = new Task()
      const tasks = await this.task.all(this.configs, this.options, this.stores)

      const highlightColor = 'green'

      const tasksTxt = `
  ${utils.style.bold('Tasks:')} 
    `

      const tmplsTxt = `\n
  ${utils.style.bold('Templates:')}
    `
      const extraInfo = `
  ${utils.style.grey('Official templates:')} ${utils.style.blue(
        'https://github.com/fbi-templates'
      )}
    `
      let tasksExt = ''
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
            flag || version ? (flag + ' ' + version).padEnd(9) : ' '.padEnd(18)
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
          const version = this.stores[item].version
            ? utils.style.grey(
                `${this.stores[item].version.current}`.padEnd(11)
              )
            : ' '.padEnd(11)
          const description = this.stores[item].description
          tmplsExt += `
    ${star}${name}${version}${description}`
        }
      })
      if (!tmplsExt) {
        tmplsExt = utils.style.grey(`
      No template, use 'fbi add <repo>' to add templates.`)
      }

      console.log(tasksTxt + tasksExt + tmplsTxt + tmplsExt + '\n' + extraInfo)

      // https://github.com/fbi-templates
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
            txt += `${'type'.padStart(15)}: ${stores[c]
              .type}\n${'path'.padStart(15)}: ${stores[c]
              .path}\n${'version'.padStart(15)}: ${JSON.stringify(
              stores[c].version
            )}\n${'repository'.padStart(15)}: ${stores[c]
              .repo}\n${'description'.padStart(15)}: ${stores[c].description}\n`
            if (stores[c].type !== 'task') {
              const tasks = await this.task.findTasks(
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
