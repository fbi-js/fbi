import commander, { createCommand } from 'commander'

import { Fbi } from './fbi'
import { Factory } from './core/factory'
import { BaseClass, Command } from './'
import { isValidArray, isArray } from './utils'

const pkg = require('../package.json')

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

    if (isBuiltInCmd) {
      this.registerCommands(this.fbi.commands)
    } else {
      const factoryId = (config.factory && config.factory.id) || ''
      const factoryVersion = (config.factory && config.factory.version) || ''
      const factories: Factory[] = this.fbi.resolveGlobalFactories()

      if (factoryId) {
        const factory = this.fbi.resolveFactory(factoryId, factoryVersion)
        if (!factory) {
          this.error(
            `factory "${factoryId}${factoryVersion ? `@${factoryVersion}` : ''}" not found`
          )
        } else {
          factories.unshift(factory)
        }
      }

      for (const factory of factories) {
        if (factory.commands) {
          this.registerCommands(factory.commands)
        }
      }
    }

    // set debug flag in context
    this.program.on('option:debug', () => {
      this.context.set('debug', true)
    })

    await this.program.parseAsync(process.argv).catch((err) => (err ? this.error(err).exit() : ''))
  }

  private createProgram(id: string): commander.Command {
    const program = createCommand()
    const _this = this
    program
      .storeOptionsAsProperties(false)
      .passCommandToAction(false)
      .name(id)
      .version(`${id} ${pkg.version}`, '-v, --version', 'output the current version')
      .usage('[command] ...')
      .description(pkg.description)
      .option('-d, --debug', 'output extra debugging')
      .on('--help', () => {
        console.log('')
        console.log(`Run ${this.style.cyan(id + ' list')} for available commands`)
        console.log(
          `Run ${this.style.cyan(id + ' <command> -h')} for detailed usage of given command`
        )
      })
      .command('help', { hidden: true }) // hide 'help' command
      .command('unknown', { isDefault: true, hidden: true }) // for 'fbi' default commands
      .action(() => {
        if (program.args && program.args.length > 0) {
          _this.error(`Unknown command "${program.args.join(' ')}"`)
          console.log(
            `Run ${this.style.cyan(id + ' -h')} or ${this.style.cyan(
              id + ' list'
            )} for available commands`
          )
        } else {
          program.help()
        }
      })

    return program
  }

  private registerCommands(commands: Command[]): void {
    for (const command of commands) {
      const nameAndArgs = `${command.id}${command.args ? ` ${command.args}` : ''}`
      const cmd = this.program.command(nameAndArgs)
      if (command.alias) {
        cmd.alias(command.alias)
      }
      if (command.description) {
        cmd.description(command.description)
      }
      cmd.action(async (...options: any[]) => {
        const disabled = command.disable ? await command.disable() : ''
        const prefix = `command "${command.id}" has been disabled.`
        const message =
          typeof disabled === 'string' && disabled.trim()
            ? `${prefix} ${disabled.trim()}`
            : disabled
            ? prefix
            : ''
        if (message) {
          this.warn(message).exit()
        }
        // set 'debug' flag from parent flags
        const parentOpts = this.program.opts()
        cmd._setOptionValue('debug', parentOpts.debug)

        return command.run(...options)
      })

      if (isValidArray(command.flags)) {
        for (const flag of command.flags) {
          const _flag = ((isArray(flag) && flag) || []).filter(Boolean)
          if (_flag.length > 0) {
            cmd.option(_flag[0], ..._flag.slice(1))
          }
        }
      }
      cmd.option('-d, --debug', 'output extra debugging')
      cmd.allowUnknownOption(true)
      cmd
        // set debug flag in context
        .on('option:debug', () => {
          command.context.set('debug', true)
        })
        .on('--help', () => {
          console.log('')
          if (command.examples && command.examples.length > 0) {
            console.log('Examples:')
            for (const str of command.examples) {
              console.log(`  ${str}`)
            }
          }
        })
    }
  }

  private isBuiltInCommand(argv = process.argv): boolean {
    const id = argv.slice(2)[0]
    if (!id || id.startsWith('-')) {
      return true
    }
    const cmd = this.fbi.commands.find((c) => c.id === id || c.alias === id)
    return !!cmd
  }
}
