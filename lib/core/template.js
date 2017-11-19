const path = require('path')
const Version = require('./version')
const {fs, logger, assign, git, flow, style, exec} = require('../utils')
const defaultPackage = require('../data/package.json')

module.exports = class Template {
  start({mode, stores, configs, options, logger} = {}) {
    this.mode = mode
    this.stores = stores
    this.configs = configs
    this.options = options
    this.logger = logger
  }

  /**
   * Create project via template
   *
   * @param {object} tmplInfo tmplate info
   * @param {object} target target info
   */
  async init(tmplInfo, target) {
    if (!tmplInfo) {
      return false
    }

    const pathRelative = path.relative(process.cwd(), target.dir) || '.'
    // Check if the destination is empty
    if (!await fs.isEmptyDir(target.dir)) {
      const answer = await flow.prompt(
        `${this.logger.getPrefix()}${style.yellow(
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

    await this.createPackageJson(tmplInfo.path, target.dir, target.name, {
      name: tmplInfo.fullname,
      version: target.version
    })

    // Copy files
    await this.copyFiles(tmplInfo.path, target.dir)

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
    if (await fs.exist(pkg)) {
      this.logger.debug('Creating `package.json`...')
      const projectPackage = require(pkg)
      const localPackage = assign(defaultPackage, {
        name: projectName,
        dependencies: projectPackage.dependencies,
        fbi: {
          template: {
            name: templateInfo.name,
            version: templateInfo.version
          }
        }
      })
      await fs.write(
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
  async copyFiles(src, dst) {
    this.logger.debug('Copying files...')
    await fs.copy({
      from: src,
      to: dst,
      ignore: this.configs.TEMPLATE_INIT_IGNORE || [],
      log: this.logger
    })
    this.logger.debug('Files copied.')
  }

  /**
   * Parse name by prefix
   *
   * @param {string} name original name
   * @param {string} prefix prefix
   * @returns 
   */
  nameParse(name, prefix) {
    if (typeof name !== 'string' || typeof prefix !== 'string') {
      return ''
    }
    return name.startsWith(prefix) ? name : prefix + name
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
}
