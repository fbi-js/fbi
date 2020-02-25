import { isValidArray, isArray } from '@fbi-js/utils'
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
        const found = this.store.get(factoryId)
        if (found && found.path) {
          const factoryInstance = this.fbi.createFactory(found.path)
          this.registerCommands(this.program, factoryInstance.commands)
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
      cmd.action(async function(...args: any[]) {
        return command.run(...args, this.opts())
      })

      if (isValidArray(command.flags)) {
        for (const flag of command.flags) {
          const tmp = ((isArray(flag) && flag) || []).filter(Boolean)
          cmd.option(tmp[0], ...tmp.slice(1))
        }
      }
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
