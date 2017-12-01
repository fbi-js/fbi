const path = require('path')
const utils = require('../utils')
const configs = require('../data/configs.json')
const Template = require('./template')

const template = new Template()

module.exports = class Conifg {
  constructor(opts = {}) {
    this.configs = opts
  }

  get configs() {
    return utils.assign(configs, this.initConfig)
  }

  set configs(cfg = {}) {
    this.initConfig = cfg
  }

  // Base configuration for FBI
  async baseConfig() {
    // Make sure data root foler is exist
    const dataRoot = path.join(utils.fs.homeDir, this.configs._DATA_ROOT)
    this.configs._DATA_ROOT = dataRoot
    this.configs._STORE_FILE = path.join(dataRoot, this.configs._STORE_FILE)
    this.configs._CUSTOM_CONFIG_FILE = path.join(
      dataRoot,
      this.configs._CUSTOM_CONFIG_FILE
    )

    // Make sure `store file` and `data root` exist
    if (!await utils.fs.exist(this.configs._STORE_FILE)) {
      await utils.fs.write(this.configs._STORE_FILE, '{}')
    } else if (!await utils.fs.exist(dataRoot)) {
      await utils.fs.mkdirp(path.join(dataRoot, 'x'))
    }

    // Merge custom configs
    try {
      const customConfigs = require(this.configs._CUSTOM_CONFIG_FILE)
      utils.assign(this.configs, customConfigs)
    } catch (err) {}

    return this.configs
  }

  // User options
  async userConfig(mode, stores, logger) {
    // Options: local
    const localOpts = await this.local()

    // Zero config support
    let templateName
    let templateVersion
    let templatePath
    if (mode.template && typeof mode.template === 'string') {
      // TODO: split name and version
      templateName = template.nameParse(mode.template, [
        this.configs.TEMPLATE_PREFIX,
        this.configs.TASK_PREFIX
      ])
    } else if (localOpts.template) {
      templateName = localOpts.template.name
      templateVersion = localOpts.template.version
    }

    // Check if template exist
    if (templateName) {
      try {
        templatePath = stores[templateName] ? stores[templateName].path : ''
      } catch (err) {
        throw err
      }
      if (templatePath) {
        localOpts.template = {
          name: templateName,
          version: templateVersion || ''
        }
      } else {
        logger.warn(`Template \`${templateName}\` not found.`)
        delete localOpts.template
      }
    }

    // Options: template
    const templateOpts = await this.template(templatePath)
    utils.assign(templateOpts, localOpts)

    return utils.assign(templateOpts, localOpts)
  }

  // Order: package.json => fbi:{}
  async local() {
    // Package.json => fbi
    let pkgCfg = {}
    const pkgFile = utils.path.cwd('package.json')
    if (await utils.fs.exist(pkgFile)) {
      const pkg = require(pkgFile)
      if (pkg.fbi) {
        if (typeof pkg.fbi === 'string') {
          pkgCfg = {
            template: {
              name: pkg.fbi
            }
          }
        } else {
          pkgCfg = pkg.fbi
        }
      }
    }

    // Config file
    let fileCfg = {}
    const fileCfgPath = utils.path.cwd(this.configs.TEMPLATE_CONFIG)
    if (await utils.fs.exist(fileCfgPath)) {
      fileCfg = require(fileCfgPath)
    }

    const localCfg = utils.assign(pkgCfg, fileCfg)

    // Name is necessary for template
    if (!localCfg.template || !localCfg.template.name) {
      delete localCfg.template
    } else {
      // Name parse
      localCfg.template.name = template.nameParse(localCfg.template.name, [
        this.configs.TEMPLATE_PREFIX,
        this.configs.TASK_PREFIX
      ])
    }

    return localCfg
  }

  async template(templatePath) {
    if (!templatePath) {
      return {}
    }
    const tmplCfg = {}
    if (await utils.fs.exist(templatePath)) {
      tmplCfg.node_modules_path = path.join(templatePath, 'node_modules')

      // Package.json => fbi
      let pkgCfg = {}
      const pkgFile = path.join(templatePath, 'package.json')
      if (await utils.fs.exist(pkgFile)) {
        const pkg = require(pkgFile)
        if (pkg.fbi && typeof pkg.fbi === 'object') {
          pkgCfg = pkg.fbi
          delete pkgCfg.template
        }
      }

      // Config file: fbi/config.js
      const tmplCfgFile = path.join(templatePath, this.configs.TEMPLATE_CONFIG)
      if (await utils.fs.exist(tmplCfgFile)) {
        const fileCfg = require(tmplCfgFile)
        delete fileCfg.template
        utils.assign(tmplCfg, pkgCfg, fileCfg || {})
      }
    }

    // If template is not exist, use process.cwd()'s modules path
    if (!tmplCfg.node_modules_path) {
      tmplCfg.node_modules_path = utils.path.cwd('node_modules')
    }
    return tmplCfg
  }
}
