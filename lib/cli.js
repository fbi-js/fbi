const _ = require('./helpers/utils')
const Fbi = require('./fbi')

module.exports = class Cli extends Fbi {

  constructor(argvs) {
    super()
    this.argvs = argvs
    this.start()
  }

  start() {
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
        const params = this.argvs.slice(1)
        return super.install(params)
        break
      case 'atm':
      case 'add-tmpl':
        return super.addTempalte()
        break
      case 'ata':
      case 'add-task':
        return super.addTask()
        break
      case 'rta':
      case 'rm-task':
        return super.removeTask()
        break
      case 'init':
        {
          const name = this.argvs[1]
          if (!name) {
            _.log('Usage: fbi init [template name]', -1)
            return
          }
          return super.init(name)
          break
        }
      case 'l':
      case 'ls':
      case 'list':
        return super.list()
        break
      case 'update':
        return super.update()
        break
      default:
        return super.run(this.argvs)
    }
  }
}