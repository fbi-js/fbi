import { isClass, isValidArray, isString } from '@fbi-js/utils'
import { Factory } from './core/factory'
import { Command } from './core/command'
import { Template } from './core/template'
import { Plugin } from './core/plugin'
import CommandList from './commands/list'
import CommandLink from './commands/link'
import CommandInfo from './commands/info'
import PluginLogger from './plugins/logger'

export class Fbi extends Factory {
  id = 'fbi'
  factories: Factory[] = []
  commands: Command[] = [new CommandList(this), new CommandLink(this), new CommandInfo(this)]
  templates: Template[] = []
  plugins: Plugin[] = [new PluginLogger(this)]

  constructor(private _factories: any[] = []) {
    super()
  }

  private _createFactory(factory: any) {
    return factory instanceof Factory ? factory : isClass(factory) ? new factory() : null
  }

  public createFactory(factory: any, ignoreDuplicateError = false) {
    const factoryInstance = this._createFactory(
      isString(factory) ? require(factory).default : factory
    )

    if (!factoryInstance) {
      this.error(`Fbi:`, `can not create factory`, factory)
      return
    }

    if (this.factories.find(x => factoryInstance && x.id === factoryInstance.id)) {
      if (!ignoreDuplicateError) {
        this.error(`Fbi:`, `factory "${factoryInstance.id}" already exist`)
      }
      return
    } else {
      this.factories.push(factoryInstance)
    }

    return factoryInstance
  }

  public createAllFactories() {
    this.debug('createAllFactories')
    if (isValidArray(this._factories)) {
      this._factories.map(x => this.createFactory(x, true))
    }

    const factories = this.store.get()
    if (factories) {
      Object.values(factories).map((x: any) => this.createFactory(x.path, true))
    }

    return this.factories
  }

  public resolveFactory(factoryId: string) {
    const factory = this.factories.find(f => f.id === factoryId)
    if (!factory) {
      this.debug('Fbi:', `Factory "${factoryId}" not found`)
    } else {
      this.debug(`Fbi: found factory`, this.style.bold(factory.id))
    }

    return factory
  }

  public runCommand(factoryId: string, commandId: string): void {
    if (factoryId) {
      // run factory command
      const factory = this.resolveFactory(factoryId)
      if (!factory) {
        this.error('Fbi:', `Factory "${factoryId}" not found`).exit()
        return
      }
      if (commandId) {
        factory.runCommand(commandId)
      }
    } else if (commandId) {
      // run fbi command
      const command = this.commands.find(x => x.id === commandId)
      if (command) {
        // run plugin hooks
        let context = {}
        for (let plugin of this.plugins) {
          if (plugin.beforeEachCommand) {
            context = plugin.beforeEachCommand({
              context: {
                ...context,
                from: plugin.id
              },
              command,
              plugin
            })
          }
        }
        command.run(context)
      } else {
        this.error(`Fbi:`, `Command ${commandId} not found`)
      }
    }
  }

  public runTemplate(factoryId: string, templateId: string): void {
    if (factoryId) {
      const factory = this.resolveFactory(factoryId)
      if (!factory) {
        this.error('Fbi:', `Factory "${factoryId}" not found`).exit()
        return
      }
      if (templateId) {
        factory.runTemplate(templateId)
      }
    } else if (templateId) {
      // run fbi command
      const template = this.templates.find(x => x.id === templateId)
      if (template) {
        template.run()
      } else {
        this.error(`Fbi:`, `Template ${templateId} not found`)
      }
    }
  }
}
