import { join } from 'path'
import { BaseClass } from './base'
import { Command } from './command'
import { Template } from './template'
import { Plugin } from './plugin'
import { Version } from './version'
import { pathResolve, pkgDir } from '../utils'

type VersionInfo = {
  baseDir: string
  latest: Record<string, any>
  versions: []
}

export type FactoryInfo = {
  id: string
  type: string
  from: string
  path: string
  updatedAt: number
  version?: VersionInfo
}

export type FactoryOptions = {
  rootDir?: string
  [key: string]: any
}

export abstract class Factory extends BaseClass {
  public abstract id = ''
  public commands: Command[] = []
  public templates: Template[] = []
  public plugins: Plugin[] = []
  public description = ''
  public version: Version | null = null
  public _version = ''
  public isGlobal = false

  constructor(public options?: FactoryOptions) {
    super()
  }

  public init() {
    if (!this.options) {
      return
    }

    this.options.rootDir = this.options.rootDir ? pkgDir.sync(this.options.rootDir) : ''

    if (!this.options.rootDir) {
      return
    }

    this.version = new Version(this.options.rootDir)

    // get version number
    try {
      const pkgPath = pathResolve(join(this.options.rootDir, 'package.json'))
      const { version } = require(pkgPath)
      if (version) {
        this._version = version
      }
    } catch (err) {}
  }

  public resolveTemplate(templateId: string) {
    const template = this.templates.find((x) => x.id === templateId)
    if (!template) {
      this.debug(`Factory (${this.id}):`, `template "${templateId}" not found`)
    } else {
      this.debug(`Factory (${this.id}):`, `found template "${templateId}"`)
    }

    return template
  }
}
