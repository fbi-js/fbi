import { join, basename, dirname, sep } from 'path'
import { Fbi } from '../fbi'
import { Command } from '../core/command'

export default class CommandUnLink extends Command {
  id = 'unlink'
  alias = ''
  args = '[factories...]'
  flags = []
  description = `unlink factories from the store`

  constructor(public factory: Fbi) {
    super()
  }

  async run(factories: any, flags: any) {
    const ids = (Array.isArray(factories) && factories.length > 0 && factories) || [
      process
        .cwd()
        .split(sep)
        .pop()
    ]
    for (const id of ids) {
      const exist = this.store.get(id)
      if (!exist) {
        this.warn(`factory "${id}" not in the store`).exit()
      }

      const linkSpinner = this.createSpinner(
        `Unlinking ${this.style.yellow.bold(id)} from the store...`
      ).start()
      this.store.del(id)
      linkSpinner.succeed(`${this.style.yellow(id)} successfully unlinked`)
    }
  }
}
