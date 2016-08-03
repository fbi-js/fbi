const Fbi = require('./fbi')
const fbi = new Fbi([])

export default {
  async run(tasks) {
    if (Array.isArray(tasks)) {
      if(!tasks.length){
        return
      }
    } else if (typeof tasks === 'string') {
      tasks = [tasks]
    }

    fbi.argvs = tasks

    await fbi.config()
    await fbi.run()
  }
}