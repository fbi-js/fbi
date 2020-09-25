import { Fbi } from '../fbi'
import { Command } from '../core/command'
import { Factory } from '../core/factory'
import { Template } from '../core/template'
import { isValidArray, flatten, isFunction, isNumber, symbols } from '../utils'

const screenColumns = process.stdout.columns > 120 ? 120 : process.stdout.columns || 80
const minPadWdith = 16

export default class CommandList extends Command {
  id = 'list'
  alias = 'ls'
  args = '[factories...]'
  flags = [
    ['-a, --all', 'show all factories'],
    ['-p, --projects', 'show projects']
  ]
  description = `list factories and commands info`
  private padWidth = 0
  private showProjects = false
  private showVersions = true

  constructor(public factory: Fbi) {
    super()
  }

  async run(targetFactories: any, flags: any) {
    this.debug(`Running command "${this.id}" from factory "${this.factory.id}" with options:`, {
      targetFactories,
      flags
    })
    this.showProjects = flags.projects

    const hasTarget = isValidArray(targetFactories)
    const current = this.context.get('config.factory')
    const showAll = flags.all || (!hasTarget && !(current && current.id))

    let factories: Factory[]
    if (showAll) {
      factories = this.factory.createAllFactories()
    } else {
      if (hasTarget) {
        factories = targetFactories
          .map((id: string) => this.factory.resolveFactory(id))
          .filter(Boolean)
      } else {
        // show using & global
        factories = this.factory.resolveGlobalFactories()
        factories = ([this.factory.resolveFactory(current.id, current.version)].filter(
          Boolean
        ) as Factory[]).concat(factories)
      }
    }

    this.padWidth =
      Math.max(
        ...flatten(factories.map((item: Factory) => item.commands || null))
          .filter(Boolean)
          .map(
            (command: Command) =>
              `${command.alias ? command.alias + ', ' : ''}${command.id}${
                command.args ? ` ${command.args}` : ''
              }`.length
          ),
        ...flatten(factories.map((item: Factory) => item.templates || null))
          .filter(Boolean)
          .map((template: Template) => template.id.length),
        minPadWdith
      ) + 8

    const showIndex = factories.length > 1
    for (const [idx, factory] of factories.entries()) {
      this.log(await this.showDetail(factory, current, showIndex ? idx : undefined))
    }

    if (factories.length < 1) {
      // no factories
      this.log('No factories available')
      this.log(`Check official factories here: http://github.com/fbi-js`)
      this.log(`Use ${this.style.cyan('fbi add [factories...]')} to add remote factories`)
      this.log(`Use ${this.style.cyan('fbi link [factories...]')} to link local factories`)
    } else {
      this.log()
      if (showAll) {
        this.log(`Use ${this.style.cyan('fbi create')} to create a project`)
        this.log(`Use ${this.style.cyan('fbi add [factories...]')} to add remote factories`)
        this.log(`Use ${this.style.cyan('fbi link [factories...]')} to link local factories`)
      } else if (current) {
        this.log(`  Use ${this.style.cyan('fbi <command>')} to execute a command`)
        this.log(`  Use ${this.style.cyan('fbi create')} to use a sub template`)
      }
    }
  }

  // 展示factory详细信息
  private async showDetail(obj: Factory, current: any, idx?: number) {
    const showIdx = isNumber(idx)
    const isCurrent = current && obj.id === current.id
    const index = showIdx ? this.style.bold(symbols.numbers[idx as number]) : ' '
    const title = this.style.bold(obj.id)
    const version = isCurrent && current.version ? this.style.italic(`@${current.version}`) : ''
    const path = this.style.dim(
      obj.rootDir
        ? obj.rootDir.startsWith(process.cwd())
          ? obj.rootDir.replace(process.cwd() + '/', '')
          : obj.rootDir
        : ''
    )
    let txt = `\n${index} ${title}${version} ${path}`

    if (obj.description) {
      txt += '\n\n  ' + obj.description
    }

    // commands list
    txt += '\n'
    if (isValidArray(obj.commands)) {
      let title = '\n  Commands:'
      txt += title
      for (const cmd of obj.commands) {
        const disabled = isFunction(cmd.disable) ? await cmd.disable() : cmd.disable
        const name = `${cmd.alias ? cmd.alias + ', ' : ''}${cmd.id}${
          cmd.args ? ` ${cmd.args}` : ''
        }${disabled ? ' (disabled)' : ''}`.padEnd(this.padWidth, ' ')
        const nameStr =
          '  ' + (disabled ? this.style.dim(name) : isCurrent ? this.style.green(name) : name)
        txt += this.colWrap([nameStr], this.lines(cmd.description))
      }
    } else {
      txt += this.style.dim(`\n  No commands available`)
    }

    // templates list
    if (isValidArray(obj.templates)) {
      let title = '\n\n  Templates:'
      txt += title
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

    if (this.showVersions) {
      const factory = this.store.get(obj.id)
      if (factory.version && factory.version.versions) {
        txt += '\n\n  Versions:'
        txt += '\n  ' + factory.version.versions.map((v: any) => v.short).join(', ')
      }
    }

    if (this.showProjects) {
      const projects = this.projectStore.find(
        {
          factory: obj.id
        },
        '',
        {
          props: ['createdAt'],
          orders: ['desc']
        }
      )
      if (isValidArray(projects)) {
        txt += '\n\n  Projects:'
        for (let project of projects) {
          // check if project exist
          const exist = await this.fs.pathExists(project.path)
          if (exist) {
            txt += `\n  - ${project.name}: ${this.style.dim(project.path)}`
          } else {
            // remove item from store
            this.projectStore.del(project.path)
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
