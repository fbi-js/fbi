import { join, basename } from 'path'
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

    for (const id of ids) {
      // base info
      const baseInfo = await this.resolveLocalPath(id)
      if (!baseInfo) {
        this.error(`Unable to load ${this.style.yellow(id)}. Please check if the resource exists`)
        continue
      }
      this.debug(JSON.stringify(baseInfo))

      const linkSpinner = this.createSpinner(
        `Linking ${this.style.yellow.bold(baseInfo.id)} from ${this.style.blue(baseInfo.from)}...`
      ).start()

      // save in store
      this.debug('Save to store...')
      const oldItem = this.store.get(baseInfo.id)
      const timeinfo: { updatedAt?: number; createdAt?: number } = {}
      timeinfo[oldItem ? 'updatedAt' : 'createdAt'] = Date.now()
      this.store.set(baseInfo.id, {
        ...baseInfo,
        ...timeinfo,
        path: baseInfo.from
      })

      this.debug('Save to store, done')

      linkSpinner.succeed(`${this.style.yellow(baseInfo.id)} successfully linked`)
    }
  }

  private async resolveLocalPath(url: string) {
    const localPath = join(process.cwd(), url)
    if (await this.fs.pathExists(localPath)) {
      return {
        id: url === '.' ? basename(localPath) : url,
        type: 'local',
        from: localPath
      }
    }

    return null
  }
}