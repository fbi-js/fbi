import { isAbsolute, join, sep } from 'path'
import assert from 'assert'
import {
  isClass,
  isValidArray,
  isString,
  pathResolve,
  getMatchVersion,
  getPathByVersion,
  flatten
} from './utils'

import { Factory, FactoryInfo } from './core/factory'
import { Command } from './core/command'
import { Template } from './core/template'
import { Plugin } from './core/plugin'

import CommandAdd from './commands/add'
import CommandRemove from './commands/remove'
import CommandList from './commands/list'
import CommandLink from './commands/link'
import CommandInfo from './commands/info'
import CommandCreate from './commands/create'
import CommandClean from './commands/clean'
import PluginLogger from './plugins/logger'

export type FbiOptions = {
  factories?: any[]
}

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
    new CommandRemove(this)
  ]
  templates: Template[] = []
  plugins: Plugin[] = [new PluginLogger(this)]

  constructor(public options?: FbiOptions) {
    super()
  }

  public createFactory(path: string): Factory | null {
    assert(isString(path), `factory path should be string, recived '${path}'`)
    const _path = isAbsolute(path) ? path : join(process.cwd(), path)
    const filepath = pathResolve(_path)
    if (!filepath) {
      return null
    }

    let fn
    try {
      fn = require(filepath)
    } catch (err) {
      this.error(err)
      return null
    }
    fn = fn.default || fn
    assert(isClass(fn), `factory should be a class, recived '${typeof fn}'`)

    const factoryInstance: Factory = new fn({ rootDir: _path })
    if (!factoryInstance) {
      this.error(`Fbi:`, `can not create factory`, _path)
      return null
    }

    if (this.factories.find((x) => factoryInstance && x.id === factoryInstance.id)) {
      this.debug(`Fbi:`, `factory "${factoryInstance.id}" already exist`)
    } else {
      this.factories.unshift(factoryInstance)
    }
    return factoryInstance
  }

  public createAllFactories() {
    this.debug('createAllFactories')
    if (isValidArray(this.options?.factories)) {
      this.options?.factories?.map((x) => this.createFactory(x))
    }

    // create from store
    const factories = this.store.get()
    if (factories) {
      for (const [key, val] of Object.entries(factories)) {
        const f: any = val
        if (!f || !f.path || !pathResolve(f.path)) {
          this.debug(`factory "${key}" can't resolve from ${f.path}. delete from store`)
          this.store.del(key)
        } else {
          this.createFactory(f.path)
        }
      }
    }

    // create from local
    const local = this.context.get('config.factory')
    if (local && local.id && !this.factories.find((f) => f.id === local.id)) {
      this.resolveFromLocal(local.id, local.version)
    }

    return this.factories
  }

  public resolveFactory(targetId: string, targetVersion?: string) {
    this.debug('Fbi<resolveFactory>:', targetId, targetVersion)
    let found = this.resolveFromCache(targetId, targetVersion)
    if (found) {
      return found
    }

    found = this.resolveFromGlobal(targetId, targetVersion)
    if (found) {
      return found
    }

    return this.resolveFromLocal(targetId, targetVersion)
  }

  public resolveGlobalFactories() {
    // resolve global factories
    const globalFactories: any[] = []
    const factories = this.store.get()
    for (const [_, value] of Object.entries(factories)) {
      const info: any = value
      if (info.global) {
        globalFactories.push(this.createFactory(info.path))
        this.debug('Fbi<resolveGlobalFactories>:', info.id)
      }
    }

    return globalFactories
  }

  public resolveCommand(targetId: string) {
    if (!targetId) {
      return null
    }
    return this.commands.find((cmd) => cmd.id === targetId)
  }

  public resolveTemplates(targetId?: string) {
    if (targetId) {
      const found = this.resolveTemplate(targetId)
      return found ? [found] : []
    }

    const allFactories = this.createAllFactories()
    const allTemplates = flatten(allFactories.map((f: Factory) => f.templates))
    return targetId ? allTemplates.filter((t: Template) => t.id === targetId) : allTemplates
  }

  private resolveFromCache(targetId: string, targetVersion?: string) {
    const factory = this.factories.find((f) => f.id === targetId)
    if (!factory) {
      return null
    }
    this.debug(`Factory "${targetId}" found in memory`)
    return factory
  }

  private resolveFromGlobal(targetId: string, targetVersion?: string) {
    // from store
    const factoryInfo: FactoryInfo = this.store.get(targetId)
    if (!factoryInfo) {
      return null
    }
    this.debug(`Factory "${targetId}" found in store`)
    // local link not support version control
    if (targetVersion && factoryInfo.type !== 'local') {
      const matchVersion = factoryInfo.version?.versions
        ? getMatchVersion(factoryInfo.version?.versions, targetVersion)
        : null
      if (!matchVersion) {
        return null
      }

      return this.createFactory(
        getPathByVersion(factoryInfo.version?.baseDir as string, factoryInfo.id, matchVersion)
      )
    }
    return this.createFactory(factoryInfo.path)
  }

  private resolveFromLocal(targetId: string, targetVersion?: string) {
    // from node_modules
    const realpath = pathResolve(targetId, {
      paths: [process.cwd()]
    })
    if (!realpath) {
      return null
    }
    const arr = realpath.split(sep)
    const idx = arr.lastIndexOf('node_modules')
    const dir = arr.slice(0, idx + 2).join(sep)
    this.debug(`Factory "${targetId}" found in node_modules`)
    return this.createFactory(dir)
  }
}
