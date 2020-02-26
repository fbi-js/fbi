import { join } from 'path'
import { BaseClass } from './base'
import { isValidArray, isFunction, isString, ensureArray } from '../utils'

type FileMap = {
  from: string
  to: string
  options?: {}
  data?: {}
}

type StringOrFileMap = string | FileMap

type Files = {
  copy?: StringOrFileMap[]
  render?: StringOrFileMap[]
  renderOptions?: [] | {}
}

export abstract class Template extends BaseClass {
  [key: string]: any
  public abstract id = ''
  public description = ''
  public path = ''
  public templates: Template[] = []
  protected renderer?: Function
  protected data: Record<string | number, any> = {}
  protected files: Files = {}
  protected targetDir = process.cwd()

  constructor() {
    super()
  }

  public async run(data?: any): Promise<any> {
    if (data) {
      this.data = data
    }

    if (!this.data.factory || !this.data.factory.path) {
      this.error(`need path of factory`)
      return this.exit()
    }

    this.rootPath = join(this.data.factory.path, this.path)

    const debugPrefix = `Template "${this.id}"`
    this.debug(`${debugPrefix} run prompting`)
    await this.prompting()
    this.debug(`${debugPrefix} run start`)
    await this.start()
    this.debug(`\n${debugPrefix} run writing`)
    await this.writing()
    const project = this.data.project
    this.targetDir = join(process.cwd(), (project && project.name) || '')
    this.debug(`${debugPrefix} rootPath: ${this.rootPath} targetDir: ${this.targetDir}`)

    if (this.files.copy && isValidArray(this.files.copy)) {
      this.debug(`${debugPrefix} start copy`, this.files.copy)
      await this.copy(this.files.copy)
    }

    if (isFunction(this.renderer) && this.files.render && isValidArray(this.files.render)) {
      this.debug(`${debugPrefix} start render`, this.files.render)
      await this.render(this.files.render, this.data, this.renderOptions)
    }

    this.debug(`${debugPrefix} run install`)
    await this.install()
    this.debug(`${debugPrefix} run end`)
    await this.end()

    await this.configuring()

    return this.data
  }

  public resolveTemplate(templateId: string) {
    const template = this.templates.find(x => x.id === templateId)
    if (!template) {
      this.debug(
        `Template (${this.id}${this.factory ? `:${this.factory.id}` : ''}):`,
        `template "${templateId}" not found`
      )
    } else {
      this.debug(
        `Template (${this.id}${this.factory ? `:${this.factory.id}` : ''}):`,
        `found template "${templateId}"`
      )
    }

    return template
  }

  protected async prompting(): Promise<any> {}
  protected async start(): Promise<any> {}
  protected async configuring(): Promise<any> {}
  protected async writing(): Promise<any> {}
  protected async install(): Promise<any> {}
  protected async end(): Promise<any> {}

  private async copy(fileMaps: StringOrFileMap[]) {
    const maps: FileMap[] = this.foramtFileMaps(fileMaps)
    for (const map of maps) {
      const paths = await this.globFile({ from: map.from })
      // console.log('copy', { map, paths })
      const replace = map.to.split('/').filter(Boolean)
      for (const p of paths) {
        const rest = p
          .split('/')
          .filter(Boolean)
          .slice(replace.length)
        const src = join(this.rootPath, p)
        if (!(await this.fs.pathExists(src))) {
          this.warn(`${src} not found`)
          continue
        }
        const dest = join(this.targetDir, replace.join('/'), rest.join('/'))
        this.debug(
          'copy:',
          src.replace(this.rootPath + '/', ''),
          '=>',
          dest.replace(this.targetDir + '/', '')
        )
        await this.fs.copy(src, dest, map.options || {})
      }
    }
  }

  private async render(
    fileMaps: StringOrFileMap[],
    data: Record<string | number, any>,
    options: [] | {}
  ) {
    if (!this.renderer || !isFunction(this.renderer)) {
      return
    }
    const maps = this.foramtFileMaps(fileMaps)
    for (const map of maps) {
      const paths = await this.globFile({ from: map.from })
      console.log({ paths })
      const replace = map.to.split('/').filter(Boolean)
      for (const p of paths) {
        const rest = p
          .split('/')
          .filter(Boolean)
          .slice(replace.length)
        const src = join(this.rootPath, p)
        const stats = await this.fs.stat(src)
        if (stats.isFile()) {
          const content = await this.fs.readFile(src, 'utf8')
          const opts = Array.isArray(options) ? options : [options]
          const rendered = await this.renderer(
            content.trim() + `\n`,
            { ...data, ...(map.data || {}) },
            ...opts
          )
          const dest = join(this.targetDir, replace.join('/'), rest.join('/'))
          this.debug('render:', p, '=>', dest.replace(this.targetDir + '/', ''))
          await this.fs.outputFile(dest, rendered, map.options || {})
        }
      }
    }
  }

  private foramtFileMaps(fileMaps: any[]): FileMap[] {
    return ensureArray(fileMaps)
      .map((m: any) =>
        isString(m)
          ? {
              from: m,
              to: m
                .split('/')
                .filter((x: string) => !!x && !x.includes('*'))
                .join('/')
            }
          : isFunction(m)
          ? m()
          : m
      )
      .filter((m: any) => Boolean(m) && m.from && m.to)
  }

  private async globFile({ from, options }: Record<string, any>): Promise<string[]> {
    const patterns = ensureArray(from)
    let ret: string[] = []
    for (let p of patterns) {
      if (p.startsWith('./')) {
        p = p.slice(2)
      }
      if (p.trim()) {
        const r = await this.glob(p.trim(), {
          cwd: this.rootPath,
          dot: true,
          ...(options || {})
        })
        ret = ret.concat(r)
      }
    }
    return [...new Set(ret)]
  }
}
