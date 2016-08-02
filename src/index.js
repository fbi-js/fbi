import Cli from './cli'

export default class Fbi {

  constructor() {
    this.Cli = Cli
  }

  static get cli() {
    return Cli
  }

  run(cmds) {
    if (!cmds) {
      return
    }

    new Fbi.cli(typeof cmds === 'string' ? [cmds] : cmds)
  }

}

