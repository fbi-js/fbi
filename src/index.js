const Cli = require('./cli')
const cli = new Cli([])

export default {

  async run(cmds) {
    if (Array.isArray(cmds)) {
      if(!cmds.length){
        return
      }
    } else if (typeof cmds === 'string') {
      cmds = [cmds]
    }

    cli.argvs = cmds
  }

}