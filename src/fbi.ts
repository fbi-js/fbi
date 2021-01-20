import { isAbsolute, join } from 'path'
import assert from 'assert'
import {
  isClass,
  isValidArray,
  isString,
  pathResolve,
  getMatchVersion,
  getPathByVersion,
  flatten,
  pkgDir
} from './utils'

import { Factory, FactoryInfo, FactoryType } from './core/factory'
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

  constructor (public options?: FbiOptions) {
    super()
  }

  public createFactory (
    pathOrId: string,
    type: FactoryType = 'git'
  ): Factory | null {
    this.debug(`createFactory ${pathOrId} ${type}`)
    assert(
      isString(pathOrId),
      `factory path should be string, recived '${pathOrId}'`
    )

    const targetDir = join(isAbsolute(pathOrId) ? '' : process.cwd(), pathOrId)
    const mainFilePath = pathResolve(targetDir)
    if (!mainFilePath) {
      this.error('Fbi:', 'can not create factory from', targetDir)
      return null
    }

    let fn
    try {
      fn = require(mainFilePath)
    } catch (err) {
      this.error(err)
      return null
    }

    fn = fn?.default || fn
    assert(isClass(fn), `factory should be a class, recived '${typeof fn}'`)

    // eslint-disable-next-line new-cap
    const factory: Factory = new fn()
    if (!factory) {
      this.error('Fbi:', 'can not create factory from', targetDir)
      return null
    }

    if (!this.resolveFromCache(factory.id)) {
      if (typeof factory.init === 'function') {
        factory.init(pkgDir.sync(mainFilePath), type)
      }

      this.factories.unshift(factory)
    }

    return factory
  }

  public createAllFactories () {
    this.debug('createAllFactories')
    if (isValidArray(this.options?.factories)) {
      this.options?.factories?.map((x) => this.createFactory(x))
    }

    // create from store
    const factories: Record<string, FactoryInfo> = this.store.get()
    if (factories) {
      for (const [id, info] of Object.entries(factories)) {
        if (!info?.path || !pathResolve(info.path)) {
          this.debug(
            `factory "${id}" can't resolve from ${info.path}. delete from store`
          )
          this.store.del(id)
        } else {
          this.createFactory(info.path, info.type)
        }
      }
    }

    // create from local
    const local = this.context.get('config.factory')
    if (local?.id && !this.factories.find((f) => f.id === local.id)) {
      this.resolveFromLocal(local.id)
    }

    return this.factories
  }

  public resolveFactory (
    targetId: string,
    targetVersion?: string,
    cwd = process.cwd()
  ) {
    this.debug('Fbi<resolveFactory>:', targetId, targetVersion)
    let found = this.resolveFromCache(targetId)
    if (found) {
      return found
    }

    found = this.resolveFromLocal(targetId, cwd)
    if (found) {
      return found
    }

    return this.resolveFromGlobal(targetId, targetVersion)
  }

  public resolveGlobalFactories () {
    // resolve global factories
    const globalFactories: Factory[] = []
    const factories: Record<string, FactoryInfo> = this.store.get()
    for (const info of Object.values(factories)) {
      if (info?.global) {
        const factory = this.createFactory(info.path, info.type)
        if (factory) {
          globalFactories.push(factory)
        }
        this.debug('Fbi<resolveGlobalFactories>:', info?.id)
      }
    }

    return globalFactories
  }

  public resolveCommand (targetId: string) {
    if (!targetId) {
      return null
    }
    return this.commands.find((cmd) => cmd?.id === targetId)
  }

  public resolveTemplates (targetId?: string) {
    if (targetId) {
      const found = this.resolveTemplate(targetId)
      if (found) {
        return [found]
      }
    }

    const allFactories = this.createAllFactories()
    const allTemplates = flatten(allFactories.map((f: Factory) => f.templates))
    return targetId
      ? allTemplates.filter((t: Template) => t.id === targetId)
      : allTemplates
  }

  public resolveFromCache (targetId: string) {
    const factory = this.factories.find((f) => f?.id === targetId)
    if (!factory) {
      return null
    }
    this.debug(`Factory "${targetId}" found in memory`)
    return factory
  }

  public resolveFromGlobal (targetId: string, targetVersion?: string) {
    // from store
    const factoryInfo: FactoryInfo = this.store.get(targetId)
    if (!factoryInfo) {
      return null
    }
    this.debug(`Factory "${targetId}" found in store`)
    // local link not support version control
    if (targetVersion && factoryInfo.type !== 'local') {
      const matchVersion = factoryInfo?.version?.versions
        ? getMatchVersion(factoryInfo.version.versions, targetVersion)
        : null
      if (!matchVersion) {
        return null
      }

      return this.createFactory(
        getPathByVersion(
          factoryInfo?.version?.baseDir as string,
          factoryInfo.id,
          matchVersion
        ),
        'local'
      )
    }
    return this.createFactory(factoryInfo.path, factoryInfo.type)
  }

  public resolveFromLocal (targetId: string, cwd = process.cwd()) {
    // from node_modules
    const filePath = pathResolve(targetId, {
      paths: [cwd]
    })
    if (!filePath) {
      return null
    }

    this.debug(`Factory "${targetId}" found in local`)
    return this.createFactory(filePath, 'npm')
  }
}
