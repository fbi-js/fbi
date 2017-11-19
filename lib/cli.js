const {argvParse} = require('./utils')
const Fbi = require('./')

const fbi = new Fbi()

module.exports = class Cli {
  get commandsSchema() {
    return {
      // Add templates and tasks from local or remote repositories
      add: 'add',
      // Create a new project based on the specified template
      init: 'init',
      // Install dependencies intelligently
      i: 'install',
      install: 'install',
      // Lists all the available templates and tasks
      l: 'list',
      ls: 'list',
      list: 'list',
      // Delete local template or task
      rm: 'remove',
      remove: 'remove',
      // Set FBI configs
      set: 'set',
      // Reset FBI configs
      reset: 'reset',
      // Update local templates and tasks from the remote repository or current project
      up: 'update',
      update: 'update',
      // Specify the template for the current local project
      use: 'use',
      '-v': 'showVersion',
      '--version': 'showVersion',
      '-h': 'help',
      '--help': 'help',
      undefined: 'help'
    }
  }

  get modeSchema() {
    return {
      // Debug mode
      '-D': 'debug',
      '--debug': 'debug',
      // Template Mode
      '-T': 'template',
      '--template': 'template',
      // Global Mode
      '-G': 'global',
      '--global': 'global',
      // Parallel Mode
      '-P': 'parallel',
      '--parallel': 'parallel'
    }
  }

  checkNodeVersion() {
    const version = parseFloat(process.versions.node.match(/(.*)\./)[1])
    const versionTarget = 7.6
    if (version < versionTarget) {
      fbi.logger.error(
        `Error: FBI v3+ requires Node.js v${versionTarget} or higher (you have v${version}).`
      )
    }
  }

  async start(argvs) {
    const cmd = argvs[0]
    const native = this.commandsSchema[cmd]
    const {tasks, mode} = argvParse({
      inputs: native ? argvs.slice(1) : argvs,
      filters: this.modeSchema,
      native: Boolean(native)
    })

    await fbi.config(mode)

    if (native) {
      // Native command
      return fbi[native](cmd, tasks).catch(err => {
        fbi.logger.error(err)
      })
    }

    if (tasks && tasks.length < 1) {
      fbi.logger.error('Command not found.')
      fbi.logger.warn('Use `fbi -h` and `fbi ls` to find help.😋')
      return
    }

    // User commands
    await fbi.run(tasks)
  }

  async init(argvs) {
    this.checkNodeVersion()
    this.start(argvs)
  }
}
