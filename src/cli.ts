import { isValidArray, isArray } from './utils'
import { BaseClass, Command } from './'
import { Fbi } from './fbi'
const pkg = require('../package.json')
import * as commander from 'commander'

export class Cli extends BaseClass {
  fbi: Fbi
  program: commander.Command

  constructor() {
    super()
    this.fbi = new Fbi()
    this.program = this.createProgram(this.fbi.id)
  }

  public async run() {
    const isBuiltInCmd = this.isBuiltInCommand()
    const config = this.loadConfig()
    this.debug('isBuiltInCmd:', isBuiltInCmd)
    if (isBuiltInCmd) {
      this.registerCommands(this.program, this.fbi.commands)
      this.program.allowUnknownOption()
    } else {
      const factoryId = (config.factory && config.factory.id) || ''
      if (factoryId) {
        const factory = this.fbi.resolveFactory(factoryId)
        if (factory && factory.commands) {
          this.registerCommands(this.program, factory.commands)
        } else {
          this.error(`factory "${factoryId}" not found`)
        }
      }
    }

    // set debug flag in context
    this.program.on('option:debug', () => {
      this.context.set('debug', true)
    })

    await this.program.parseAsync(process.argv).catch(err => (err ? this.error(err).exit() : ''))
  }

  private createProgram(id: string): commander.Command {
    return new commander.Command()
      .storeOptionsAsProperties(false)
      .passCommandToAction(false)
      .name(id)
      .version(`${id} ${pkg.version}`, '-v, --version', 'output the current version')
      .usage('[command] ...')
      .description(pkg.description)
      .on('--help', () => {
        console.log('')
        console.log(`Run ${id + ' <command> -h'} for detailed usage of given command`)
      })
      .option('-D, --debug', 'output extra debugging')
  }

  private registerCommands(program: commander.Command, commands: Command[]) {
    for (let command of commands) {
      const nameAndArgs = `${command.id}${command.args ? ` ${command.args}` : ''}`
      const cmd = program.command(nameAndArgs)
      if (command.alias) {
        cmd.alias(command.alias)
      }
      if (command.description) {
        cmd.description(command.description)
      }
      const _this = this
      cmd.action(async function(...args: any[]) {
        const disabled = command.disable ? await command.disable() : ''
        const prefix = `command "${command.id}" has been disabled.`
        const message =
          typeof disabled === 'string' && disabled.trim()
            ? `${prefix} ${disabled.trim()}`
            : disabled
            ? prefix
            : ''
        if (message) {
          _this.warn(message).exit()
        }
        const opts = this.opts()
        const parentOpts = this.parent.opts()
        const debug = opts.debug || parentOpts.debug
        return command.run(...args, {
          ...opts,
          debug
        })
      })

      if (isValidArray(command.flags)) {
        for (const flag of command.flags) {
          const tmp = ((isArray(flag) && flag) || []).filter(Boolean)
          cmd.option(tmp[0], ...tmp.slice(1))
        }
      }
      cmd.option('-D, --debug', 'output extra debugging')
    }
  }

  private isBuiltInCommand(argv = process.argv) {
    const id = argv.slice(2)[0]
    if (!id) {
      return true
    }
    const cmd = this.fbi.commands.find(c => c.id === id || c.alias === id)
    return !!cmd
  }
}
