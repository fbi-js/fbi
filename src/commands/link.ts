import { join, isAbsolute } from 'path'
import { Fbi } from '../fbi'
import { Command } from '../core/command'

export default class CommandLink extends Command {
  id = 'link'
  alias = ''
  args = '[factories...]'
  flags = []
  description = `link local factories to the store`

  constructor(public factory: Fbi) {
    super()
  }

  async run(factories: any, flags: any) {
    const ids = (Array.isArray(factories) && factories.length > 0 && factories) || ['.']

    const config = this.context.get('config')
    const factoriesDir = join(config.rootDirectory, config.directoryName)

    for (const id of ids) {
      // base info
      const factory = this.factory.createFactory(id)
      if (!factory) {
        continue
      }
      const baseInfo: any = factory
        ? {
            id: factory.id,
            type: 'local',
            from: isAbsolute(id) ? id : join(process.cwd(), id)
          }
        : null
      if (!baseInfo) {
        this.error(`Unable to load ${this.style.yellow(id)}. Please check if the resource exists`)
        continue
      }

      const versionInfo = await factory.version.init(baseInfo.from, factoriesDir)

      this.debug(JSON.stringify(baseInfo))

      const linkSpinner = this.createSpinner(
        `Linking ${this.style.yellow.bold(baseInfo.id)} from ${this.style.blue(baseInfo.from)}...`
      ).start()

      // save in store
      this.debug('Save to store...')
      this.store.set(baseInfo.id, {
        ...baseInfo,
        version: {
          baseDir: factoriesDir,
          ...versionInfo
        },
        path: baseInfo.from,
        updatedAt: Date.now()
      })

      this.debug('Save to store, done')

      linkSpinner.succeed(`${this.style.yellow(baseInfo.id)} successfully linked`)
    }
  }
}
