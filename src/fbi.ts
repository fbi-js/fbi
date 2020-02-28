import { join, isAbsolute } from 'path'
import { isClass, isValidArray, isString, isModuleAvailable } from './utils'
import { Factory } from './core/factory'
import { Command } from './core/command'
import { Template } from './core/template'
import { Plugin } from './core/plugin'
import CommandAdd from './commands/add'
import CommandList from './commands/list'
import CommandLink from './commands/link'
import CommandUnLink from './commands/unlink'
import CommandInfo from './commands/info'
import CommandCreate from './commands/create'
import CommandClean from './commands/clean'
import PluginLogger from './plugins/logger'

export class Fbi extends Factory {
  id = 'fbi'
  factories: Factory[] = []
  commands: Command[] = [
    new CommandAdd(this),
    new CommandList(this),
    new CommandLink(this),
    new CommandUnLink(this),
    new CommandInfo(this),
    new CommandCreate(this),
    new CommandClean(this)
  ]
  templates: Template[] = []
  plugins: Plugin[] = [new PluginLogger(this)]

  constructor(private _factories: any[] = []) {
    super()
  }

  private _createFactory(factory: any) {
    return factory instanceof Factory ? factory : isClass(factory) ? new factory() : null
  }

  public createFactory(factory: any, ignoreDuplicateError = false) {
    let fn
    if (isString(factory)) {
      const fullpath = isAbsolute(factory) ? factory : join(process.cwd(), factory)

      if (!isModuleAvailable(fullpath)) {
        return null
      }

      fn = require(fullpath)
    } else {
      fn = factory
    }

    const factoryInstance = this._createFactory(fn.default || fn)

    if (!factoryInstance) {
      this.error(`Fbi:`, `can not create factory`, factory)
      return null
    }

    if (this.factories.find(x => factoryInstance && x.id === factoryInstance.id)) {
      if (!ignoreDuplicateError) {
        this.error(`Fbi:`, `factory "${factoryInstance.id}" already exist`)
      }
      return null
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
      for (const [key, val] of Object.entries(factories)) {
        const f: any = val
        if (!f || !f.path || !isModuleAvailable(f.path)) {
          this.debug(`factory "${key}" can't resolve from ${f.path}. delete from store`)
          this.store.del(key)
        } else {
          this.createFactory(f.path, true)
        }
      }
    }

    return this.factories
  }

  public resolveFactory(factoryId: string) {
    const factory = this.factories.find(f => f.id === factoryId)
    if (!factory) {
      this.debug('Fbi:', `Factory "${factoryId}" not found`)
    } else {
      this.debug(`Fbi: found factory "${factoryId}"`)
    }

    return factory
  }
}
