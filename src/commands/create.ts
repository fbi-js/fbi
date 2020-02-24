import { join, basename } from 'path'
import { Fbi } from '../fbi'
import { Command } from '../core/command'
import { nonEditableKeys } from '../helpers'
import { ensureArray, groupBy, flatten } from '@fbi-js/utils'

export default class CreateCommand extends Command {
  id = 'create'
  alias = 'c'
  args = '[template] [project]'
  description = `create a project via template`
  flags = [['-p, --package-manager <name>', 'Specifying a package manager. e.g. pnpm/yarn/npm']]

  constructor(public factory: Fbi) {
    super()
  }

  async run(factories: any, flags: any) {
    // get all templates
  }
}
