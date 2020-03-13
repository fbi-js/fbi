import { Fbi } from '../fbi'
import { Command } from '../core/command'
import { isValidObject, pathResolve } from '../utils'

export default class CommandCreate extends Command {
  id = 'clean'
  alias = ''
  args = ''
  description = `clean info in store`
  flags = []

  constructor(public factory: Fbi) {
    super()
  }

  public async run(flags: any) {
    await this.removeUnavailableFactories()
    await this.removeUnavailableProjects()
  }

  private async removeUnavailableFactories() {
    const spinner = this.createSpinner(`collecting non-available factories...`).start()
    const factories = this.store.get()
    const nonexist = (
      await Promise.all(
        Object.values(factories).map(async (x: any) => {
          // non-exist
          if (!x.path || !(await this.fs.pathExists(x.path))) {
            return x
          }
          // non-available
          return !pathResolve(x.path) ? x : null
        })
      )
    ).filter(Boolean)

    if (nonexist.length < 1) {
      spinner.succeed(`all factories are available`)
      return
    }

    spinner.fail('Non-available factories found')
    this.debug({ nonexist })
    const selected = await this.selectDeletion(nonexist)
    this.debug({ selected })

    if (!selected) {
      return
    }

    await this.deleteAction(selected, 'factories')
  }

  private async removeUnavailableProjects() {
    const spinner = this.createSpinner(`collecting non-available projects...`).start()
    const items = this.projectStore.get()
    const nonexist = (
      await Promise.all(
        Object.entries(items).map(async ([key, val]: any) => {
          if (!(await this.fs.pathExists(key))) {
            return {
              ...val,
              id: val.name,
              path: key
            }
          }
          return null
        })
      )
    ).filter(Boolean)

    if (nonexist.length < 1) {
      spinner.succeed(`all projects are available`)
      return
    }

    spinner.fail('Non-available projects found')
    this.debug({ nonexist })
    const selected = await this.selectDeletion(nonexist)
    this.debug({ selected })

    if (!selected) {
      return
    }

    await this.deleteAction(selected, 'projects')
  }

  private async selectDeletion(arr: Record<string, any>[]) {
    const { selected } = await this.prompt({
      type: 'multiselect',
      name: 'selected',
      message: `Select items for deletion from store`,
      hint: '(Use <space> to select, <return> to submit)',
      choices: arr.map((x: any) => ({
        name: x.id,
        value: x.path,
        hint: x.path
      })),
      result(names: string[]) {
        return this.map(names)
      }
    } as any)

    return isValidObject(selected) ? selected : null
  }

  private async deleteAction(selected: Record<string, string>, name: string) {
    const spinner = this.createSpinner(`Cleaning ${name}...`).start()
    await Promise.all(
      Object[name === 'projects' ? 'values' : 'keys'](selected).map(
        async (key: any) => await this[name === 'projects' ? 'projectStore' : 'store'].del(key)
      )
    )
      .then((ret: any[]) => {
        if (ret.length > 0) {
          spinner.succeed(`Removed non-available ${name}: ${Object.keys(selected).join(', ')}`)
        } else {
          spinner.stop()
        }
      })
      .catch((err: any) => {
        spinner.fail(`Failed to remove ${name}`)
        console.log(err)
      })
  }
}
