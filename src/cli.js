import * as _ from './helpers/utils'

import Fbi from './fbi'

export default class Cli extends Fbi {

  constructor (argvs) {
    super()
    this.argvs = argvs
    this.start()
  }

  start () {
    switch (this.argvs[0]) {
      case '-v':
      case '-version':
      case '--version':
        return super.version()
        break
      case 'backup':
        return super.backup()
        break
      case 'recover':
        return super.recover()
        break
      case undefined:
      case '-h':
      case '-help':
      case '--help':
        return super.help()
        break
      case 'i':
      case 'install':
        const type = this.argvs[1]
        return super.install(type)
        break
      case 'init': {
        const name = this.argvs[1]
        if (!name) {
          _.log('Usage: fbi init [template name]', -1)
          return
        }
        return super.init(name)
        break
      }
      case 'cat':
        if (!this.argvs[1]) {
          return _.log('Usage: fbi cat [task, config] [ , -t, -g]', -1)
        }
        return super.cat(this.argvs[1], this.argvs[2])
        break
      case 'ls':
      case 'list':
        return super.list()
        break
      case 'ata':
      case 'add-task':
        return super.addTask()
        break
      case 'atm':
      case 'add-tmpl':
      case 'add-template':
        return super.addTmpl()
        break
      case 'rta':
      case 'rm-task':
      case 'remove-task': {
        const names = this.argvs.slice(1)
        console.log(names)
        if (!names.length) {
          _.log('Usage: fbi rta [name]', -1)
          process.exit(0)
        } else {
          return super.removeTask(names)
        }
        break
      }
      case 'rtm':
      case 'rm-tmpl':
      case 'remove-template': {
        const names = this.argvs.slice(1)
        console.log(names)
        if (!names.length) {
          _.log('Usage: fbi rtm [name]', -1)
          process.exit(0)
        } else {
          return super.removeTmpl(names)
        }
        break
      }
      default:
        return super.run(this.argvs)
    }
  }
}
