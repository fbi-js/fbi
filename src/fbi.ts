import { isAbsolute } from 'path'
import { isClass, isValidArray, isString, isFunction, pathResolve, getMatchVersion } from './utils'
import { Factory, FactoryInfo } from './core/factory'
import { Command } from './core/command'
import { Template } from './core/template'
import { Plugin } from './core/plugin'
import CommandAdd from './commands/add'
import CommandRemove from './commands/remove'
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
    new CommandCreate(this),
    new CommandClean(this),
    new CommandInfo(this),
    new CommandLink(this),
    new CommandList(this),
    new CommandRemove(this),
    new CommandUnLink(this)
  ]
  templates: Template[] = []
  plugins: Plugin[] = [new PluginLogger(this)]

  constructor(private _factories: any[] = []) {
    super()
  }

  private _createFactory(factory: any) {
    return factory instanceof Factory ? factory : isClass(factory) ? new factory() : null
  }

  public createFactory(factory: any, ignoreDuplicateError = false): Factory | null {
    let fn
    if (isString(factory)) {
      const realpath = isAbsolute(factory)
        ? pathResolve(factory)
        : pathResolve(factory, {
            paths: [process.cwd()]
          })
      if (!realpath) {
        return null
      }

      try {
        fn = require(realpath)
      } catch (err) {
        this.error(err)
      }
    } else {
      fn = factory
    }

    if (!fn) {
      return null
    }
    const factoryInstance = this._createFactory(fn.default || fn)

    if (!factoryInstance) {
      this.error(`Fbi:`, `can not create factory`, factory)
      return null
    }

    if (isFunction(factoryInstance.init)) {
      factoryInstance.init()
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
        if (!f || !f.path || !pathResolve(f.path)) {
          this.debug(`factory "${key}" can't resolve from ${f.path}. delete from store`)
          this.store.del(key)
        } else {
          this.createFactory(f.path, true)
        }
      }
    }

    return this.factories
  }

  public resolveFactory(targetId: string, targetVersion?: string) {
    const factory = this.factories.find(f => f.id === targetId)
    if (factory) {
      this.debug('Fbi:', `Factory "${targetId}" found in memory`)
      return factory
    }

    // from store
    const factoryInfo: FactoryInfo = this.store.get(targetId)
    if (factoryInfo) {
      this.debug('Fbi:', `Factory "${targetId}" found in store`)
      if (targetVersion) {
        const matchVersion = factoryInfo.version?.versions
          ? getMatchVersion(factoryInfo.version?.versions, targetVersion)
          : null
        if (!matchVersion) {
          return null
        }

        return this.createFactory(factoryInfo.path)
      } else {
        return this.createFactory(factoryInfo.path)
      }
    }

    // from node_modules
    const realpath = pathResolve(targetId, {
      paths: [process.cwd()]
    })
    if (realpath) {
      this.debug('Fbi:', `Factory "${targetId}" found in node_modules`)
      try {
        const factoryFn = require(realpath)
        return this.createFactory(factoryFn)
      } catch (err) {
        this.error(err)
      }
    }

    return null
  }
}
