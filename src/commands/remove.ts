import { join } from 'path'

import { Fbi } from '../fbi'
import { Command } from '../core/command'

export default class CommandRemove extends Command {
  id = 'remove'
  alias = ''
  args = '[factoryIds...]'
  flags = []
  description = 'remove factories from the store'
  examples = ['fbi remove', 'fbi remove @fbi-js/factory-node']

  constructor (public factory: Fbi) {
    super()
  }

  async run (factoryIds: any, flags: any) {
    this.debug(
      `Running command "${this.id}" from factory "${this.factory.id}" with options:`,
      {
        factoryIds,
        flags
      }
    )
    const ids =
      (Array.isArray(factoryIds) && factoryIds.length > 0 && factoryIds) || null
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

      // TODO: remove versions dir

      await this.deleteConfig(factory)

      if (factory.type !== 'local') {
        await this.deleteFiles(factory)
      }
      spinner.succeed(`${this.style.yellow(factory.id)} successfully removed`)
    }
  }

  private async selectFactory () {
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

  private async deleteConfig (factory: any) {
    this.store.del(factory.id)
  }

  private async deleteFiles (factory: any) {
    // remove main dir
    if (factory?.path) {
      await this.fs.remove(factory.path)
    }

    // remove version dirs
    if (factory?.version?.versions) {
      for (const version of factory.version.versions) {
        await this.fs.remove(
          join(
            factory.version.baseDir,
            `${this.getFactoryName(factory.id)}__${version.short}`
          )
        )
      }
    }
  }

  private getFactoryName (id: string) {
    return id.replace('@', '')
  }
}
