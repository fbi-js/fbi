import { join } from 'path'
import { BaseClass } from './base'
import { Command } from './command'
import { Template } from './template'
import { Plugin } from './plugin'
import { Version } from './version'

type VersionInfo = {
  baseDir: string
  latest: Record<string, any>
  versions: []
}

export type FactoryType = 'git' | 'npm' | 'local'

export type FactoryInfo = {
  id: string
  type: FactoryType
  from: string
  path: string
  updatedAt: number
  version?: VersionInfo
  global?: boolean
}

export type FactoryOptions = {
  rootDir?: string
  type?: FactoryType
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
  public baseDir = ''
  public type: FactoryType = 'npm'

  constructor(public options?: FactoryOptions) {
    super()

    if (options) {
      if (options.baseDir) {
        this.baseDir = options.baseDir
      }
      if (options.type) {
        this.type = options.type
      }
    }
  }

  public init(baseDir?: string, type?: FactoryType) {
    this.baseDir = this.baseDir || baseDir || ''
    this.type = this.type || type || 'npm'

    if (!this.baseDir) {
      return
    }

    if (this.type === 'git') {
      this.version = new Version(this.baseDir)
    }

    try {
      const pkg = require(join(this.baseDir, 'package.json'))
      if (pkg?.version) {
        this._version = pkg.version
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
