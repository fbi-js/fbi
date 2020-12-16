import { join, isAbsolute } from 'path'
import { Fbi } from '../fbi'
import { Command } from '../core/command'

// Does not support version control
export default class CommandLink extends Command {
  id = 'link'
  alias = ''
  args = '[factories...]'
  flags = []
  description = `link local factories to the store`
  examples = ['fbi link', 'fbi link local-folder']

  constructor(public factory: Fbi) {
    super()
  }

  async run(factories: any, flags: any) {
    this.debug(`Running command "${this.id}" from factory "${this.factory.id}" with options:`, {
      factories,
      flags
    })
    const ids = (Array.isArray(factories) && factories.length > 0 && factories) || ['.']

    for (const id of ids) {
      // base info
      const factory = this.factory.createFactory(id)
      if (!factory) {
        this.error(`Cann't resolve factory from '${id}'`)
        continue
      }
      const baseInfo: any = factory
        ? {
            id: factory.id,
            type: 'local',
            from: isAbsolute(id) ? id : join(process.cwd(), id),
            global: factory.isGlobal
          }
        : null
      if (!baseInfo) {
        this.error(`Unable to load ${this.style.yellow(id)}. Please check if the resource exists`)
        continue
      }

      this.debug(JSON.stringify({ baseInfo }))

      const linkSpinner = this.createSpinner(
        `Linking ${this.style.yellow.bold(baseInfo.id)} from ${this.style.blue(baseInfo.from)}...`
      ).start()

      // save in store
      this.debug('Save to store...')
      this.store.set(baseInfo.id, {
        ...baseInfo,
        path: baseInfo.from,
        updatedAt: Date.now()
      })

      this.debug('Save to store, done')

      linkSpinner.succeed(`${this.style.yellow(baseInfo.id)} successfully linked`)
    }
  }
}
