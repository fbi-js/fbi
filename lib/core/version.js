const path = require('path')
const { git } = require('../utils')

module.exports = class Version {
  constructor ({ logger } = {}) {
    this.logger = logger
  }

  /**
   * Check if version control is supported
   * @param {string} dir target path
   * @returns
   */
  isSupport (dir) {
    return git.is(dir)
  }

  /**
   * Get target's versions
   *
   * @param {string} dir target path
   * @param {object} logger
   * @returns
   */
  async getVersions (dir, logger) {
    const versions = await git.tags(dir, logger)
    const branches = await git.remoteBranches(dir, logger)

    const validBranches = branches.filter(
      b => !b.startsWith('bv') && !['master', 'HEAD'].includes(b)
    )
    return [...versions, ...validBranches]
  }

  /**
   * Get target's current version
   *
   * @param {string} dir target path
   * @param {object} logger
   * @returns
   */
  async getCurrentVersion (dir, logger) {
    try {
      const branch = await git.currentBranch(dir, logger)
      return branch.startsWith('bv') ? branch.substring(1) : branch
    } catch (err) {
      return 'master'
    }
  }

  async getLatestVersion (dir, logger) {
    try {
      return git.currentTag(dir, logger)
    } catch (err) {
      return 'master'
    }
  }

  /**
   * Add version
   *
   * @param {any} url
   * @param {string} [cwd='.']
   * @param {string} [name='']
   * @param {boolean} [showlog=false]
   * @param {object} logger
   * @returns
   */
  async add (url, cwd = '.', name = '', showlog = false, logger) {
    try {
      // Clone
      await git.clone(url, cwd, name, showlog, logger)
      const targetDir = path.join(cwd, name)

      // Get versions & latest
      const versions = await this.getVersions(targetDir, logger)
      const current = await this.getLatestVersion(targetDir, logger)

      // Checkout latest version to a new branch
      await this.change({
        dir: targetDir,
        version: current,
        name,
        showlog,
        logger
      })

      return {
        versions,
        current
      }
    } catch (err) {
      throw err
    }
  }

  /**
   * Change version
   *
   * @param {object} [{dir, name, version, showlog = false, logger, store}={}]
   * @returns
   */
  async change ({ dir, name, version, showlog = false, logger, store } = {}) {
    if (!version) {
      return false
    }

    if (!(await this.isSupport(dir))) {
      logger.warn('Current template not support version control')
      return false
    }
    try {
      // Checkout
      const changed = await git.checkout(dir, version, showlog, logger)

      if (changed && store) {
        // Update store
        await store.update(name, {
          version: {
            current: version
          }
        })
      }
      return changed
    } catch (err) {
      throw err
    }
  }

  /**
   * Pull from remote
   *
   * @param {string} dir target path
   * @returns
   */
  async update (dir, showlog = false, logger) {
    if (!(await this.isSupport(dir))) {
      return false
    }

    const currentBranch = await git.currentBranch(dir)
    if (currentBranch !== 'master') {
      await git.checkout(dir, 'master', showlog, logger)
    }

    await git.pull(dir)

    return true
  }

  /**
   * Get valid version
   *
   * @param {string} dir target path
   * @param {string} version target version
   * @param {string} latest if not found, use latest or current
   * @param {object} logger logger object
   * @returns
   */
  async getValidVersion (dir, version, latest, logger) {
    if (!(await this.isSupport(dir))) {
      return {
        version: '',
        message: 'Target not support version control.'
      }
    }

    const prefix = 'v'

    // Get versions & current
    const versions = await this.getVersions(dir, logger)
    const current = await this.getCurrentVersion(dir, logger)

    if (versions.includes(version)) {
      return {
        version
      }
    }

    if (versions.includes(prefix + version)) {
      return {
        version: prefix + version
      }
    }

    const message = version ? `Version \`${version}\` not found` : ''
    // Use latest
    if (latest) {
      return {
        version: latest,
        message: message + `Use latest version \`${latest}\`.`
      }
    }

    // Use current version
    return {
      version: current,
      message: message + `Use current version \`${current}\`.`
    }
  }
}
