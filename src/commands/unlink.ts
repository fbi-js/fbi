import { join, sep } from 'path'
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
      const factory = this.store.get(id)
      if (!factory) {
        this.warn(`factory "${id}" not in the store`).exit()
      }

      const spinner = this.createSpinner(
        `Unlinking ${this.style.yellow.bold(id)} from the store...`
      ).start()
      if (factory.version?.versions) {
        // remove version dirs
        for (let version of factory.version.versions) {
          await this.fs.remove(join(factory.version.baseDir, `${factory.id}__${version.short}`))
        }
      }
      this.store.del(id)
      spinner.succeed(`${this.style.yellow(id)} successfully unlinked`)
    }
  }
}
