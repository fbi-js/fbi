import { isfbi, log } from './utils'
import cfg from './config'

const help = `
  Usage: fbi [command] [command] [command] ...

  Commands:

    n, new            new project
    b, build          build project
    s, serve          serve project or files

  Options:

    -h, --help        output usage information
    -v, --version     output the version number
`

let usrConfig

let fbi = {
  addTask: () => {
    log('add task')
  },
  new: async () => {
    try {
      usrConfig = usrConfig || await isfbi(cfg.paths.config)
      await require('./lib/new').default(usrConfig)
    } catch (e) {
      log(e)
    }
  },
  serve: async () => {
    try {
      usrConfig = usrConfig || await isfbi(cfg.paths.config)
      await require('./lib/serve').default(usrConfig)
    } catch (e) {
      log(e)
    }
  },
  watch: () => {
    log('watch')
  },
  run: () => {
    log('run')
  },
  help: () => {
    log(help)
  },
  version: () => {
    const v = require('../package.json').version
    log(v)
  }
}

export default fbi
