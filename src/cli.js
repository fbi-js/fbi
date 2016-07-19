import fs from 'fs'
import Fbi from './index'
import pkg from '../package.json'

export default class Cli extends Fbi {

  constructor(argvs) {
    super()

    this.argvs = argvs
    this.init()
  }

  init() {
    this.initConfig()

    // help
    if (!this.argvs.length
      || this.argvs[0] === '-h'
      || this.argvs[0] === '--help') {
      return help()
    }

    // show version
    if (this.argvs[0] === '-v'
      || this.argvs[0] === '--verison') {
      return version()
    }

    // show tasks & templates
    if (this.argvs[0] === 'ls') {
      return show(this)
    }

    super.run()
  }

  initConfig() {
    try {
      let _path = this._.cwd(this.config.paths.options)
      fs.accessSync(_path, fs.R_OK | fs.W_OK)
      this.isFbi = true
      let usrCfg = require(_path)
      this._.merge(this.config, usrCfg)
    } catch (e) {
      this.isFbi = false
    }
  }
}

const helpTxt = `
  Usage: fbi [command] [command] [command] ...

  Commands:

    check available commands use: fbi ls

  Options:

    -h, --help        output usage information
    -v, --version     output the version number
`

function help() {
  console.log(helpTxt)
}

function version() {
  console.log(pkg.version)
}

function show(ctx) {

  let msg = `
  Tasks:
  `
  const tasks = ctx.tasks
  const tmpls = ctx.templates

  if (!tasks) {
    ctx.log('No available task.')
  } else {
    Object.keys(tasks).map(t => {
      msg += `
    ${t}${tasks[t].short ? ',' + tasks[t].short : ''}:     ${tasks[t].desc}`
    })
  }

  msg += `

  Templates:
  `
  if (!tmpls) {
    ctx.log('No available template.')
  } else {
    Object.keys(tmpls).map(t => {
      msg += `
    ${t}:      ${tmpls[t]}`
    })
  }
  msg += `

  `

  ctx.log(msg)
}