import { Fbi } from '../fbi'
import { Command } from '../core/command'
import { Factory } from '../core/factory'
import { Template } from '../core/template'
import { isValidArray, ensureArray, flatten, isFunction } from '../utils'

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
      ) + 8

    if (hasTarget) {
      for (const obj of this.listTarget) {
        this.log(await this.showDetail(obj, true))
      }
    } else {
      if (isValidArray(this.listUsing)) {
        this.log(this.style.bold.green('\n※ Factory in use:'))
        for (const obj of this.listUsing) {
          this.log(await this.showDetail(obj, true))
        }
      } else if (isValidArray(this.listOthers)) {
        this.log(this.showList(this.listOthers, this.style.cyan('※ Available factories:')))
        this.log(`\nuse ${this.style.cyan('fbi list <factory>')} for detailed usage of a factory`)
        this.log(`use ${this.style.cyan('fbi create')} to create a project`)
      } else {
        this.log('No factories available')
        this.log(`Check official factories here: http://github.com/fbi-js`)
        this.log(`Use ${this.style.cyan('fbi add [factories...]')} for adding remote factories, or`)
        this.log(`use ${this.style.cyan('fbi link [factories...]')} for linking local factories`)
      }
    }
  }

  private showList(list: any[], title: string) {
    let txt = title ? `\n${this.style.bold(title)}\n` : ''
    for (const item of list) {
      const name = (item.alias ? item.alias + ', ' : '') + (item.id || item.name)
      txt += this.colWrap(
        this.lines(name, this.padWidth + 4, 2, true, true),
        this.lines(item.description, screenColumns - (this.padWidth + 10))
      )
    }
    return txt
  }

  private async showDetail(obj: Factory, highlight = false, showProjects = false) {
    let verTxt = ''
    // if (obj.version) {
    //   if (obj.version.current) {
    //     verTxt += ' ' + this.style[obj.version.isFresh ? 'green' : 'red'](obj.version.current)
    //   }
    //   if (obj.version.latest) {
    //     verTxt += ' ' + this.style.blue(obj.version.latest)
    //   }
    // }
    let txt = `\n  ${this.style.bold(obj.id)}${verTxt}`

    if (obj.description) {
      // txt += '\n\n  ' + this.wrap(obj.description, screenColumns - 2, 2)
      txt += '\n\n  ' + obj.description
    }

    // commands list
    txt += '\n'
    if (isValidArray(obj.commands)) {
      let title = '\n  ▼ Commands:'
      txt += highlight ? title : this.style.bold(title)
      for (const cmd of obj.commands) {
        const disabled = isFunction(cmd.disable) ? await cmd.disable() : cmd.disable
        const name = `${cmd.alias ? cmd.alias + ', ' : ''}${cmd.id}${
          cmd.args ? ` ${cmd.args}` : ''
        }${disabled ? ' (disabled)' : ''}`.padEnd(this.padWidth, ' ')
        const nameStr =
          '  ' + (disabled ? this.style.dim(name) : highlight ? this.style.green(name) : name)
        txt += this.colWrap([nameStr], this.lines(cmd.description))
      }
    } else {
      txt += this.style.dim(`\n  No commands available`)
    }

    // templates list
    if (isValidArray(obj.templates)) {
      let title = '\n\n  ▼ Templates:'
      txt += highlight ? title : this.style.bold(title)
      for (const t of obj.templates) {
        txt += this.colWrap(
          this.lines(`- ${t.id}`, this.padWidth - 1, 2, true, true),
          this.lines(t.description)
        )

        if (isValidArray(t.templates)) {
          for (const subt of t.templates) {
            txt += this.colWrap(
              this.lines(`  - ${subt.id}`, this.padWidth - 1, 2, true, true),
              this.lines(subt.description)
            )
          }
        }
      }
    } else {
      txt += this.style.dim(`\n  No templates available`)
    }

    // global plugin === command
    // if (obj.command) {
    //   txt += `\n\n      type: global`
    //   txt += `\n   version: ${obj.version}`
    //   txt += `\n   command: ${obj.command.id}`
    //   txt += `\n     alias: ${obj.command.alias}`
    //   txt += `\n      from: ${obj.from}`
    // }

    if (showProjects) {
      const projects = this.store.get(`${obj.id}.projects`)
      if (isValidArray(projects)) {
        let title = '\n\n  ▼ Projects using the plugin:'
        txt += highlight ? title : this.style.bold(title)
        for (let project of projects) {
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
    }

    return txt
  }

  private lines(
    str: string,
    width: number = screenColumns - this.padWidth,
    indent: number = 0,
    minWidth: boolean = false,
    wordBreak: boolean = false
  ) {
    if (str.match(/[\n]\s+/)) return [str]
    let lines = []
    const indentStr = indent ? Array(indent + 1).join(' ') : ''

    const regex = wordBreak
      ? new RegExp(`.{${width}}`, 'g')
      : new RegExp('.{1,' + (width - 1) + '}([\\s\u200B]|$)|[^\\s\u200B]+?([\\s\u200B]|$)', 'g')
    lines = str.match(regex) || []

    if (wordBreak) {
      lines.push(str.substring(lines.join('').length))
    }

    return (lines as string[]).map(
      (l: string) => indentStr + (minWidth ? l.padEnd(width + 1, ' ') : l.trimRight())
    )
  }

  private colWrap(left: string[], right: string[], padWidth = 4) {
    let txt = ''
    const leftMaxWidth = Math.max(...left.map((s: string) => s.length))
    const pad = leftMaxWidth + padWidth
    const lines = Math.max(left.length, right.length)
    for (let i = 0; i < lines; i++) {
      txt += `\n${left[i] || ''}`.padEnd(pad, ' ') + `${right[i] || ''}`
    }
    return txt
  }
}
