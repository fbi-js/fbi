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
  public description: string = ''
  public version: Version = new Version()

  constructor() {
    super()
  }

  public init() {
    this.version = new Version(this.id)
  }

  public resolveTemplate(templateId: string) {
    const template = this.templates.find(x => x.id === templateId)
    if (!template) {
      this.debug(`Factory (${this.id}):`, `template "${templateId}" not found`)
    } else {
      this.debug(`Factory (${this.id}):`, `found template "${templateId}"`)
    }

    return template
  }
}
