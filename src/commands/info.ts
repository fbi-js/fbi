import { Fbi } from '../fbi'
import { Command } from '../core/command'
import { nonEditableKeys } from '../helpers'

export default class CommandInfo extends Command {
  id = 'info'
  alias = 'if'
  args = ''
  flags = [['-e, --edit', 'Edit config']]
  description = `show context info `

  constructor(public factory: Fbi) {
    super()
  }

  async run(factories: any, flags: any) {
    this.clear()

    const config = this.loadConfig()
    let globalConfig = {}

    if (flags.edit) {
      const ret: Record<'config', any> = await this.prompt({
        type: 'Form',
        name: 'config',
        message: 'Edit fbi global config:',
        choices: Object.entries(config._global)
          .map(([key, val]) =>
            !nonEditableKeys.includes(key)
              ? {
                  name: key,
                  initial: val
                }
              : null
          )
          .filter(Boolean)
      } as any)

      if (ret.config) {
        globalConfig = await this.configStore.merge(ret.config)
      }
    }

    const context = this.context.get()
    this.log('debug:', context.debug)
    this.log('env:', context.env)
    this.log('config:', {
      ...context.config,
      ...globalConfig,
      _global: {
        ...context.config._global,
        ...globalConfig
      }
    })
  }
}
