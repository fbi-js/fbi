import fs from 'fs'
import Fbi from './index'
import pkg from '../package.json'

export default class Cli extends Fbi {
  constructor (argvs) {
    super()
    this.argvs = argvs

    this.init()
  }

  init () {
    this.initConfig()

    // help
    if (!this.argvs.length
      || this.argvs[0] === '-h'
      || this.argvs[0] === '--help') {
      help()
      return
    }

    // show version
    if (this.argvs[0] === '-v'
      || this.argvs[0] === '--verison') {
      version()
      return
    }

    super.run()
  }

  initConfig () {
    try {
      let _path = this._.cwd(this.config.paths.options)
      fs.accessSync(_path, fs.R_OK | fs.W_OK)
      this.isFbi = true
      let usrCfg = require(_path)
      this._.merge(this.config, usrCfg)
    } catch(e) {
      this.isFbi = false
    }
  }
}

const helpTxt = `
  Usage: fbi [command] [command] [command] ...

  Commands:

    n, new            new project
    b, build          build project
    s, serve          serve project or files

  Options:

    -h, --help        output usage information
    -v, --version     output the version number
`

function help () {
  console.log(helpTxt)
}

function version () {
  console.log(pkg.version)
}
