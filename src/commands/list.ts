import { Fbi } from '../fbi'
import { Command } from '../core/command'
import { Factory } from '../core/factory'
import { Template } from '../core/template'
import { isValidArray, ensureArray, flatten, isFunction } from '@fbi-js/utils'

const screenColumns = process.stdout.columns > 120 ? 120 : process.stdout.columns || 80
const minPadWdith = 16

export default class CommandList extends Command {
  id = 'list'
  alias = 'ls'
  args = '[factories...]'
  flags = []
  description = `list factories and commands info`
  private padWidth = 0
  private listTarget: Factory[] = []
  private listUsing: Factory[] = []
  private listOthers: Factory[] = []

  constructor(public factory: Fbi) {
    super()
  }

  async run(factories: any, flags: any) {
    this.debug(`Factory: (${this.factory.id})`, 'from command', this.id, { factories, flags })
    this.factory.createAllFactories()

    const hasTarget = isValidArray(factories)
    if (hasTarget) {
      this.listTarget = factories
        .map((id: string) => this.factory.resolveFactory(id))
        .filter(Boolean)
    } else {
      const using = ensureArray(this.context.get('config.factory'))
      if (isValidArray(using)) {
        this.listUsing = this.factory.factories.filter((f: Factory) =>
          using.some((f2: any) => f2.id === f.id)
        )
      }

      this.listOthers = isValidArray(this.listUsing)
        ? this.factory.factories.filter(
            (f: Factory) => !this.listUsing.find((f2: Factory) => f2.id === f.id)
          )
        : this.factory.factories
    }

    const allFactories = [...this.listTarget, ...this.listUsing, ...this.listOthers]
    this.padWidth =
      Math.max(
        ...flatten(allFactories.map((item: Factory) => item.commands || null))
          .filter(Boolean)
          .map(
            (command: Command) =>
              `${command.alias ? command.alias + ', ' : ''}${command.id}${
                command.args ? ` ${command.args}` : ''
              }`.length
          ),
        ...flatten(allFactories.map((item: Factory) => item.templates || null))
          .filter(Boolean)
          .map((template: Template) => template.id.length),
        minPadWdith
      ) + 4

    if (hasTarget) {
      for (const obj of this.listTarget) {
        this.log(await this.showDetail(obj, true))
      }
    } else {
      if (isValidArray(this.listUsing)) {
        this.log(this.style.bold.green('※ Currently using:'))
        for (const obj of this.listUsing) {
          this.log(await this.showDetail(obj, true))
        }
      } else {
        this.log('current directory is not an fbi project')
        this.log(`use ${this.style.cyan('fbi create')} to create a project`)
      }

      if (isValidArray(this.listOthers)) {
        this.log(this.showList(this.listOthers, this.style.cyan('※ Available factories:')))
        this.log(`\n  ${this.style.grey('use fbi ls <factory>` for detailed usage of a plugin')}`)
      }
    }
  }

  private showList(list: any[], title: string) {
    const wrapOpts = [screenColumns - this.padWidth, this.padWidth + 2]

    let txt = title ? `\n${this.style.bold(title)}\n` : ''
    for (const item of list) {
      txt += `\n  ${((item.alias ? item.alias + ', ' : '') + (item.id || item.name)).padEnd(
        this.padWidth,
        ' '
      )}${this.wrap(item.description, ...wrapOpts)}`
    }
    return txt
  }

  private async showDetail(obj: any, highlight = false, showProjects = false) {
    let verTxt = ''
    if (obj.version) {
      if (obj.version.current) {
        verTxt += ' ' + this.style[obj.version.isFresh ? 'green' : 'red'](obj.version.current)
      }
      if (obj.version.latest) {
        verTxt += ' ' + this.style.blue(obj.version.latest)
      }
    }
    let txt = `\n  ${this.style.bold(obj.id)}${verTxt}`

    if (obj.description) {
      txt += '\n\n  ' + this.wrap(obj.description, screenColumns - 2, 2)
    }

    // commands list
    txt += '\n'
    if (isValidArray(obj.commands)) {
      let title = '\n  ▼ Commands:'
      txt += highlight ? title : this.style.bold(title)
      for (const cmd of obj.commands) {
        const disabled = isFunction(cmd.disabled) ? await cmd.disabled() : cmd.disabled
        const nameStr = `${cmd.alias ? cmd.alias + ', ' : ''}${cmd.id}${
          cmd.args ? ` ${cmd.args}` : ''
        }${disabled ? ' (disabled)' : ''}`.padEnd(this.padWidth, ' ')
        txt += `\n  ${
          disabled ? this.style.dim(nameStr) : highlight ? this.style.green(nameStr) : nameStr
        }${
          cmd.description
            ? this.wrap(disabled ? this.style.dim(cmd.description) : cmd.description)
            : ''
        }`
      }
      // txt += `\n  ${this.style.grey('Usage: fbi <command>')}`
      // txt += `\n  ${this.style.grey('Use `fbi <command> -h` for detailed usage of a command')}`
    } else {
      txt += this.style.dim(`\n  No commands available`)
    }

    // templates list
    txt += '\n'
    if (isValidArray(obj.templates)) {
      let title = '\n\n  ▼ Templates:'
      txt += highlight ? title : this.style.bold(title)
      for (const t of obj.templates) {
        txt += `\n  ${t.id.padEnd(this.padWidth, ' ')}${this.wrap(t.description)}`
      }
      // txt += `\n  ${this.style.grey('Usage: fbi create <template>')}`
    } else {
      txt += this.style.dim(`\n  No templates available`)
    }

    // global plugin === command
    if (obj.command) {
      txt += `\n\n      type: global`
      txt += `\n   version: ${obj.version}`
      txt += `\n   command: ${obj.command.id}`
      txt += `\n     alias: ${obj.command.alias}`
      txt += `\n      from: ${obj.from}`
    }

    if (showProjects && isValidArray(obj.projects)) {
      let title = '\n\n  ▼ Projects using the plugin:'
      txt += highlight ? title : this.style.bold(title)
      for (let project of obj.projects) {
        // check if project exist
        const exist = await this.fs.pathExists(project.path)
        if (exist) {
          txt += `\n  ${project.name}: ${project.path}`
        } else {
          // remove item from store
          this.store.del(`${obj.id}.projects`, { path: project.path })
        }
      }
    }

    return txt
  }

  private wrap(str: string, width = screenColumns - this.padWidth, indent = this.padWidth) {
    if (str.match(/[\n]\s+/)) return str
    const minWidth = 40
    if (width < minWidth) return str

    const regex = new RegExp(
      '.{1,' + (width - 1) + '}([\\s\u200B]|$)|[^\\s\u200B]+?([\\s\u200B]|$)',
      'g'
    )
    const lines = str.match(regex) || []
    return lines
      .map((line, i) => {
        if (line.slice(-1) === '\n') {
          line = line.slice(0, line.length - 1)
        }
        return (i > 0 && indent ? Array(indent + 1).join(' ') : '') + line.trimRight()
      })
      .join('\n')
  }
}
