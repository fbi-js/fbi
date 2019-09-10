const Fbi = require('./')

const fbi = new Fbi()
function stringToObject (str) {
  let key
  let value
  if (str.indexOf('=') > 0) {
    const peels = str.split('=')
    key = peels[0]
    value = peels[1] === 'true' ? true : peels[1] === 'false' ? false : peels[1]
  } else {
    key = str
    value = true
  }
  return {
    key,
    value
  }
}

const isOption = str => str.startsWith('-') || str.startsWith('--')

module.exports = class Cli {
  get commandsSchema () {
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

  get modeSchema () {
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

  async start (argvs) {
    // find mode
    let mode = {}
    for (const arg of argvs) {
      const obj = stringToObject(arg)
      if (this.modeSchema[obj.key]) {
        mode[this.modeSchema[obj.key]] = obj.value
      }
    }
    await fbi.config(mode)

    // native command
    const cmd = argvs[0]
    const native = this.commandsSchema[cmd]
    if (native) {
      const params = []
      const options = {}
      for (const arg of argvs.slice(1)) {
        if (isOption(arg)) {
          const obj = stringToObject(arg.replace(/^-{1,2}/, ''))
          options[obj.key] = obj.value
        } else {
          params.push(arg)
        }
      }
      return fbi[native](cmd, params, options).catch(err => {
        fbi.logger.error(err)
      })
    }

    // project commands
    const tasks = []
    for (const arg of argvs) {
      if (!isOption(arg)) {
        const task = await fbi.task.get(arg, 'local', fbi)
        if (task) {
          tasks.push({
            name: task.name,
            params: {}
          })
        } else if (tasks[tasks.length - 1]) {
          tasks[tasks.length - 1].params['_'] = [
            ...(tasks[tasks.length - 1].params['_'] || []),
            arg
          ]
        }
        continue
      }

      const obj = stringToObject(arg.replace(/^-{1,2}/, ''))
      if (tasks[tasks.length - 1]) {
        tasks[tasks.length - 1].params[obj.key] = obj.value
      }
    }

    if (tasks && tasks.length < 1) {
      fbi.logger.error('Command not found.')
      return fbi.logger.warn('Use `fbi -h` and `fbi ls` to find help.😋')
    }

    // User commands
    await fbi.run(tasks)
  }

  init (argvs) {
    this.start(argvs)
  }
}
