import { join } from 'path'
import { BaseClass } from './base'
import { Command } from './command'
import { Template } from './template'
import { Plugin } from './plugin'
import { Version } from './version'
import { pathResolve } from '../utils'

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

export abstract class Factory extends BaseClass {
  public abstract id = ''
  public commands: Command[] = []
  public templates: Template[] = []
  public plugins: Plugin[] = []
  public description = ''
  public version: Version | null = null
  public _version = ''
  public rootDir = ''
  public isGlobal = false

  constructor(rootDir = '') {
    super()
    this.rootDir = rootDir
    // this.version = new Version(this.rootDir)
  }

  public init() {
    this.version = new Version(this.id, this.rootDir)

    // get version number
    try {
      const pkgPath = pathResolve(join(this.rootDir, 'package.json'))
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
