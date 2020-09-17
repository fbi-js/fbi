import { Fbi } from '../fbi'
import { Plugin } from '../core/plugin'

export default class Log extends Plugin {
  id = 'log'

  constructor(public factory: Fbi) {
    super()
  }

  beforeEachCommand({
    context,
    command,
    plugin
  }: {
    context: any
    command: any
    plugin: any
  }): any {
    this.log(
      `About to run command`,
      command.id,
      `with context`,
      context,
      'prev plugin is',
      plugin.id
    )

    return {
      context,
      command,
      plugin: this
    }
  }
}
