const path = require('path')
const Version = require('./version')
const utils = require('../utils')
const defaultPackage = require('../data/package.json')

module.exports = class Template {
  constructor({mode, stores, configs, options, logger} = {}) {
    this.mode = mode
    this.stores = stores
    this.configs = configs
    this.options = options
    this.logger = logger
  }

  add(url) {
    this.logger.log(`Adding \`${url}\`...`)
    if (utils.type.isGitUrl(url)) {
      return this.addRemoteGitRepo(url)
    } else {
      return this.addLocalFolder(url)
    }
  }

  async addRemoteGitRepo(url) {
    const srcPath = url

    // Get path info
    const basename = url.split('/').pop().replace('.git', '')

    // Check template type
    const {name, type, fullname} = await this.detectTemplateType(basename)
    const dstPath = path.join(this.configs._DATA_ROOT, fullname)
    this.logger.debug('Template name:', fullname)
    this.logger.debug('Template path:', dstPath)

    // Check if already exist
    if (await utils.fs.exist(dstPath)) {
      this.logger.error(
        `\`${fullname}\` already exist, use \`fbi update ${fullname}\` to update it. `
      )
      return utils.assign(this.stores[fullname], {
        message: 'exist'
      })
    }

    const version = new Version({
      logger: this.logger
    })

    // Clone
    const versionInfo = await version.add(
      srcPath,
      this.configs._DATA_ROOT,
      fullname,
      this.mode.debug,
      this.logger
    )
    this.logger.debug('versionInfo:\n', versionInfo)

    // Return template info
    return {
      name,
      fullname,
      type,
      repo: srcPath,
      version: {
        latest: versionInfo.current || 'master',
        current: versionInfo.current || 'master',
        all: versionInfo.versions || []
      },
      path: dstPath
    }
  }

  async addLocalFolder(url) {
    let srcPath
    if (utils.path.isAbsolute(url)) {
      srcPath = url
    } else {
      srcPath = utils.path.cwd(url)
    }
    const basename = path.basename(srcPath)

    // Check src exist
    if (!await utils.fs.exist(srcPath)) {
      this.logger.error(`\`${srcPath}\` not exist. `)
      return {
        message: 'src not exist'
      }
    }

    const {name, type, fullname} = await this.detectTemplateType(basename)
    const dstPath = path.join(this.configs._DATA_ROOT, fullname)

    // Check dst exist
    if (await utils.fs.exist(dstPath)) {
      this.logger.error(
        `\`${fullname}\` already exist, use \`fbi update ${fullname}\` to update it. `
      )
      return utils.assign(this.stores[fullname], {
        message: 'exist'
      })
    }

    // Copy
    await utils.fs.copy({
      from: srcPath,
      to: dstPath,
      log: this.logger,
      ignore: this.configs.TEMPLATE_ADD_IGNORE || []
    })

    // Return template info
    return {
      name,
      fullname,
      type,
      repo: srcPath,
      path: dstPath,
      version: false
    }
  }

  /**
   * Create project via template
   *
   * @param {object} tmplInfo tmplate info
   * @param {object} target target info
   */
  async init(tmplInfo, target, extra) {
    if (!tmplInfo) {
      return false
    }

    const withOptions = Boolean(extra === 'with-options')
    const withTasks = Boolean(extra === 'with-tasks')
    const withAll = Boolean(extra === 'with-all')

    const pathRelative = path.relative(process.cwd(), target.dir) || '.'
    // Check if the destination is empty
    if (!await utils.fs.isEmptyDir(target.dir)) {
      const answer = await utils.flow.prompt(
        `${this.logger.getPrefix()}${utils.style.yellow(
          'Warning: `' +
            pathRelative +
            '` is not empty, sure you want to cover it? (y/N):'
        )}`,
        'yellow'
      )
      if (answer !== 'y') {
        return false
      }
    }

    if (tmplInfo.version) {
      // Change version
      const version = new Version({
        logger: this.logger
      })
      try {
        const changeResult = await version.change(tmplInfo.path, target.version)
        if (changeResult) {
          this.logger.debug(
            `Template \`${tmplInfo.fullname}\` version changed to \`${target.version}\`.`
          )
        }
      } catch (err) {
        this.logger.warn(err)
      }
    }

    await this.createPackageJson(tmplInfo.path, target.dir, target.name, {
      name: tmplInfo.fullname,
      version: target.version
    })

    // Copy files
    let ignore = this.configs.TEMPLATE_INIT_IGNORE
    if (withTasks || withAll) {
      const idx = this.configs.TEMPLATE_INIT_IGNORE.indexOf(
        this.configs.TEMPLATE_TASKS
      )
      if (idx >= 0) {
        this.configs.TEMPLATE_INIT_IGNORE.splice(idx, 1)
      }

      if (withAll) {
        ignore = ['.DS_Store', '.svn', '.git']
      }
    }
    await this.copyFiles(tmplInfo.path, target.dir, ignore)

    if (withOptions) {
      // Copy fbi/options.js
      const optsSrc = path.join(tmplInfo.path, this.configs.TEMPLATE_CONFIG)
      const optsDst = path.join(target.dir, this.configs.TEMPLATE_CONFIG)
      await this.copyFiles(optsSrc, optsDst, [])
    }

    return true
  }

  /**
   * Copy package.json to project folder
   *
   * @param {string} src template directory
   * @param {string} dst project directory
   * @param {string} projectName project name
   * @param {object} templateInfo template information
   */
  async createPackageJson(src, dst, projectName, templateInfo) {
    const pkg = path.join(src, 'package.json')
    if (await utils.fs.exist(pkg)) {
      this.logger.debug('Creating `package.json`...')
      const projectPackage = require(pkg)
      const localPackage = utils.assign(defaultPackage, {
        name: projectName,
        dependencies: projectPackage.dependencies,
        fbi: {
          template: {
            name: templateInfo.name,
            version: templateInfo.version
          }
        }
      })
      await utils.fs.write(
        path.join(dst, 'package.json'),
        JSON.stringify(localPackage, null, 2) + '\n'
      )
      this.logger.debug('`package.json` created.')
    }
  }

  /**
   * Copy files from src to dst
   *
   * @param {string} src source directory
   * @param {string} dst destination directory
   */
  async copyFiles(src, dst, ignore) {
    this.logger.debug('Copying files...')
    if (!ignore) {
      ignore = this.configs.TEMPLATE_INIT_IGNORE || []
    }
    await utils.fs.copy({
      from: src,
      to: dst,
      ignore,
      log: this.logger
    })
    this.logger.debug('Files copied.')
  }

  /**
   * Parse name by prefix
   *
   * @param {string} name original name
   * @param {array} prefixs prefixs [template-prefix, task-prefix]
   * @returns 
   */
  nameParse(name, prefixs) {
    if (!name || !Array.isArray(prefixs) || prefixs.length < 1) {
      return name
    }
    return name.startsWith(prefixs[0]) || name.startsWith(prefixs[1])
      ? name
      : prefixs[0] + name
  }

  /**
   * Parse info by path
   *
   * @param {string} str path
   * @returns 
   */
  pathParse(str) {
    if (!str) {
      return
    }
    let name
    let vers = ''
    if (str.startsWith('git@')) {
      const tmpArr = str.split(this.configs.VERSION_SEPARATOR)
      if (tmpArr.length > 2) {
        // git@xxxxxx.git@2.1.0
        vers = tmpArr.pop()
        name = tmpArr.join(this.configs.VERSION_SEPARATOR)
      } else {
        // git@xxxxxx.git
        name = str
      }
    } else {
      const tmpIdx = str.lastIndexOf(this.configs.VERSION_SEPARATOR)
      if (tmpIdx < 0) {
        name = str
      } else {
        name = str.substr(0, tmpIdx)
        vers = str.substr(tmpIdx + 1, str.length) || ''
      }
    }

    return {
      name,
      version: vers
    }
  }

  /**
   * Check if a name is template name
   *
   * @param {string} name input name
   * @returns 
   */
  isTemplate(name) {
    return (
      name.startsWith(this.configs.TASK_PREFIX) ||
      name.startsWith(this.configs.TEMPLATE_PREFIX)
    )
  }

  async detectTemplateType(name) {
    let type
    let fullname
    if (name.startsWith(this.configs.TEMPLATE_PREFIX)) {
      type = 'project'
      fullname = name
    } else if (name.startsWith(this.configs.TASK_PREFIX)) {
      type = 'task'
      fullname = name
    } else {
      console.log(` Template types:\n  1.project\n  2.task`)
      const answer = await utils.flow.prompt(
        'Please choose a template type (1/2): '
      )
      type = !answer || answer === '1' ? 'project' : 'task'
      fullname =
        this.configs[(type === 'project' ? 'TEMPLATE' : 'TASK') + '_PREFIX'] +
        name
    }

    return {
      name,
      type,
      fullname
    }
  }

  async getInfo(item) {
    if (this.stores[item]) {
      return this.stores[item]
    }

    let fullname
    let info

    if (
      item.startsWith(this.configs.TASK_PREFIX) ||
      item.startsWith(this.configs.TEMPLATE_PREFIX)
    ) {
      // File
      const tmplPath = path.join(this.configs._DATA_ROOT, item)
      if (await utils.fs.exist(tmplPath)) {
        return {
          fullname: item,
          path: tmplPath
        }
      }
    } else {
      const nameTmpl = this.configs.TEMPLATE_PREFIX + item
      const nameTask = this.configs.TASK_PREFIX + item

      if (this.stores[nameTmpl]) {
        return this.stores[nameTmpl]
      } else if (this.stores[nameTask]) {
        return this.stores[nameTask]
      } else {
        const pathProj = path.join(this.configs._DATA_ROOT, nameTmpl)
        const pathTask = path.join(this.configs._DATA_ROOT, nameTask)
        if (await utils.fs.exist(pathProj)) {
          fullname = nameTmpl
          info = {
            fullname,
            path: pathProj
          }
        } else if (await utils.fs.exist(pathTask)) {
          fullname = nameTask
          info = {
            fullname,
            path: pathTask
          }
        }
      }
    }

    return info
  }
}
