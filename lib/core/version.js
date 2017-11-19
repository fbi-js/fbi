const path = require('path')
const {git, fs} = require('../utils')

module.exports = class Version {
  start({logger} = {}) {
    this.logger = logger
  }

  /**
   * Check if version control is supported
   * @param {string} dir target path
   * @returns
   */
  isSupport(dir) {
    return git.is(dir)
  }

  /**
   * Get target's versions
   *
   * @param {string} dir target path
   * @returns 
   */
  async getVersions(dir, logger) {
    const versions = await git.tags(dir, logger)
    return versions ? versions.split('\n') : []
  }

  /**
   * Get target's current version
   * 
   * @param {string} dir target path
   * @returns 
   */
  async getCurrentVersion(dir, logger) {
    const version = await git.currentTag(dir, logger)
    return version
  }

  /**
   * Check if version matchs
   * @param {string} dir target path
   * @param {string} targetVersion target version
   */
  async isVersionMatch(dir, targetVersion) {
    const ret = await this.getCurrentVersion(dir)
    return ret === targetVersion
  }

  /**
   * Check if version exist
   * @param {string} dir target path
   * @param {string} targetVersion target version
   * @returns
   */
  async isVersionExist(dir, targetVersion) {
    const versions = await this.getVersions(dir)
    return versions.length > 0 ? versions.includes(targetVersion) : false
  }

  /**
   * Add version
   * 
   * @param {any} url 
   * @param {string} [cwd='.'] 
   * @param {string} [name=''] 
   * @param {boolean} [showlog=false] 
   * @param {any} logger 
   * @returns 
   */
  async add(url, cwd = '.', name = '', showlog = false, logger) {
    if (!await this.isSupport(dir)) {
      throw 'Can not add, because current terminal does not support `git` command.'
    }
    try {
      // Clone
      await git.clone(url, cwd, name, showlog, logger)
      const targetDir = path.join(cwd, name)

      // Get versions & latest
      const versions = await this.getVersions(targetDir, logger)
      const current = await this.getCurrentVersion(targetDir, logger)

      // Checkout latest version to a new branch
      await this.change(targetDir, current, showlog, logger)

      return {
        versions,
        current
      }
    } catch (err) {
      throw err
    }
  }

  // Change version
  async change(dir, targetVersion, showlog = false, logger) {
    if (!await this.isSupport(dir)) {
      throw 'Can not change version, because current terminal does not support `git` command.'
    }
    try {
      // Checkout
      return git.checkout(dir, targetVersion, showlog, logger)
    } catch (err) {
      if (err.toString().includes('did not match')) {
        throw `Version \`${targetVersion}\` not exist.`
      } else {
        throw err
      }
    }
  }

  /**
   * Pull from remote
   *
   * @param {string} dir target path
   * @returns 
   */
  async update(dir, showlog = false) {
    if (!await this.isSupport(dir)) {
      return false
    }

    const currentBranch = await git.currentBranch(dir)
    if (currentBranch !== 'master') {
      await git.checkout(dir, 'master', showlog)
    }

    await git.pull(dir)

    return true
  }
}
