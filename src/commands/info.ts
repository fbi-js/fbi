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
    this.clearConsole()

    let config = this.loadConfig()

    if (flags.edit) {
      const ret = await this.prompt({
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
      })

      if (ret.config) {
        config = config.store.merge(ret.config)
      }
    }

    const context = this.context.get()
    console.log(JSON.stringify(context, null, 2))
  }
}
