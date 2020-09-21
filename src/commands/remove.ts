import { join, sep } from 'path'
import { Fbi } from '../fbi'
import { Command } from '../core/command'

export default class CommandRemove extends Command {
  id = 'remove'
  alias = ''
  args = '[factories...]'
  flags = []
  description = `remove factories from the store`

  constructor(public factory: Fbi) {
    super()
  }

  async run(factories: any, flags: any) {
    this.debug(`Running command "${this.id}" from factory "${this.factory.id}" with options:`, {
      factories,
      flags
    })
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
        `Removing ${this.style.yellow.bold(id)} from the store...`
      ).start()

      // remove main dir
      await this.fs.remove(factory.path)

      // remove version dirs
      if (factory.version?.versions) {
        for (let version of factory.version.versions) {
          await this.fs.remove(join(factory.version.baseDir, `${factory.id}__${version.short}`))
        }
      }
      this.store.del(id)
      spinner.succeed(`${this.style.yellow(id)} successfully removed`)
    }
  }
}
