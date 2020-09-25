import { join } from 'path'

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
    const ids = (Array.isArray(factories) && factories.length > 0 && factories) || null
    const targets = (ids
      ? ids.map((id: string) => {
          const result = this.store.get(id)
          if (!result) {
            this.warn(`factory "${id}" not in the store`)
          }
          return result
        })
      : await this.selectFactory()
    ).filter(Boolean)

    if (targets.length < 1) {
      return this.exit()
    }

    for (const factory of targets) {
      const spinner = this.createSpinner(
        `Removing ${this.style.yellow.bold(factory.id)} from the store...`
      ).start()

      await this.deleteConfig(factory)

      if (factory.type !== 'local') {
        await this.deleteFiles(factory)
      }
      spinner.succeed(`${this.style.yellow(factory.id)} successfully removed`)
    }
  }

  private async selectFactory() {
    const factories = Object.values(this.store.get())
    const { selected } = (await this.prompt({
      type: 'multiselect',
      name: 'selected',
      message: 'Select factories to remove',
      hint: 'Use arrow-keys, <return> to submit',
      choices: factories.map((f: any) => ({
        name: f.id
      }))
    })) as any

    return factories.filter((f: any) => selected.includes(f.id))
  }

  private async deleteConfig(factory: any) {
    this.store.del(factory.id)
  }

  private async deleteFiles(factory: any) {
    // remove main dir
    await this.fs.remove(factory.path)

    // remove version dirs
    if (factory.version?.versions) {
      for (let version of factory.version.versions) {
        await this.fs.remove(join(factory.version.baseDir, `${factory.id}__${version.short}`))
      }
    }
  }
}
