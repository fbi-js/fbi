import { isAbsolute, join } from 'path'
import { BaseClass } from './base'
import { Factory } from './factory'
import { isValidObject } from '../utils'

type FileMap = {
  from: string
  to: string
  options?: Record<string, unknown>
  data?: Record<string, unknown>
  cwd?: string
}

type StringOrFileMap = string | FileMap

type Files = {
  copy?: StringOrFileMap[]
  render?: StringOrFileMap[]
  renderOptions?: [] | Record<string, unknown>
}

export abstract class Template extends BaseClass {
  [key: string]: any
  public abstract id = ''
  public description = ''
  // absolute path to template dir
  public path = ''
  public templates: Template[] = []
  protected renderer = () => {}
  protected data: Record<string | number, any> = {}
  protected files: Files = {}
  protected targetDir = process.cwd()
  protected _debugPrefix = ''
  private rootPath = ''

  constructor (public factory: Factory) {
    super()
  }

  // public methods
  public resolveTemplate (templateId: string) {
    const template = this.templates.find((x) => x.id === templateId)
    if (!template) {
      this.debug(
        `Template (${this.id}${this.factory?.id || ''}):`,
        `template "${templateId}" not found`
      )
    } else {
      this.debug(
        `Template (${this.id}${this.factory?.id || ''}):`,
        `found template "${templateId}"`
      )
    }

    return template
  }

  public async run (data: Record<string, any>, flags: any): Promise<any> {
    this.targetDir = join(this.targetDir, data.subDirectory || '')
    await this.prepare(data)
    // 1. gathering: this.data
    this.debug(`${this._debugPrefix} run gathering`)
    await this.gathering(flags || {})
    await this.afterGathering()
    // 2. checking: verify dir exist
    this.debug(`${this._debugPrefix} run checking`)
    await this.checking()
    await this.afterChecking()
    // 3. writing: this.files
    this.debug(`${this._debugPrefix} run writing`)
    await this.writing()
    await this.afterWriting()
    // 4. installing: deps
    this.debug(`${this._debugPrefix} run installing`)
    await this.installing(flags || {})
    await this.afterInstalling()
    // 5. ending: save data to store
    this.debug(`${this._debugPrefix} run ending`)
    await this.ending()
    await this.afterEnding()

    return {
      name: this.data.project.name,
      path: this.targetDir,
      factory: this.data.factory.id,
      template: this.data.factory.template,
      features: this.data.project.features
    }
  }

  // processes
  private async prepare (data?: any) {
    this._debugPrefix = `Template "${this.id}", ${data}`

    if (data && isValidObject(data)) {
      this.data = data
    }

    if (isAbsolute(this.path)) {
      this.rootPath = this.path
    } else {
      const factoryDir = this.data?.factory?.path || this.factory.baseDir

      if (!factoryDir) {
        this.error(
          "Cann't find the path of factory. Please update the factory."
        )
        return this.exit()
      }

      this.rootPath = join(factoryDir, this.path)

      this.debug(`prepare: ${this.rootPath}`)
    }
  }

  protected async gathering(flags: any): Promise<any> {
    this.debug(`${this._debugPrefix} gathering: ${flags}`)
    // gathering some file
  }

  private async afterGathering() {
    this.debug(`${this._debugPrefix} rootPath: ${this.rootPath}; targetDir: ${this.targetDir}`)
  }

  protected async checking(): Promise<any> {
    // checking something
  }

  private async afterChecking() {
    // after checking
  }

  protected async writing(): Promise<any> {
    // writing file
  }

  private async afterWriting() {
    // after writing
  }

  protected async installing(flags: any): Promise<any> {
    this.debug(`${this._debugPrefix} installing: ${flags}`)
    // install dependencies
  }

  private async afterInstalling() {
    // after install
  }

  protected async ending(): Promise<any> {
    // end
  }

  private async afterEnding() {
    // after end
  }

  // utils - to do delete
  // private async copy (fileMaps: StringOrFileMap[]) {
  //   const maps: FileMap[] = this.foramtFileMaps(fileMaps)
  //   for (const map of maps) {
  //     const paths = await this.globFile(map)
  //     const replace = map.to.split('/').filter(Boolean)
  //     for (const p of paths) {
  //       const rest = p.split('/').filter(Boolean).slice(replace.length)
  //       const src = join(this.rootPath, p)
  //       if (!(await this.fs.pathExists(src))) {
  //         this.warn(`${src} not found`)
  //         continue
  //       }
  //       const dest = join(this.targetDir, replace.join('/'), rest.join('/'))
  //       this.debug(
  //         'copy:',
  //         src.replace(this.rootPath + '/', ''),
  //         '=>',
  //         dest.replace(this.targetDir + '/', '')
  //       )
  //       await this.fs.copy(src, dest, map.options || {})
  //     }
  //   }
  // }

  // private async render (
  //   fileMaps: StringOrFileMap[],
  //   data: Record<string | number, any>,
  //   options?: [] | Record<string, unknown>
  // ) {
  //   if (!this.renderer || !isFunction(this.renderer)) {
  //     return
  //   }
  //   const maps = this.foramtFileMaps(fileMaps)
  //   for (const map of maps) {
  //     const paths = await this.globFile(map)
  //     const replace = map.to.split('/').filter(Boolean)
  //     for (const p of paths) {
  //       const rest = p.split('/').filter(Boolean).slice(replace.length)
  //       const src = join(this.rootPath, p)
  //       const stats = await this.fs.stat(src)
  //       if (stats.isFile()) {
  //         const content = await this.fs.readFile(src, 'utf8')
  //         const opts = Array.isArray(options) ? options : [options]
  //         const rendered = await this.renderer(
  //           content.trim() + '\n',
  //           { ...data, ...(map.data || {}) },
  //           ...opts
  //         )
  //         const dest = join(this.targetDir, replace.join('/'), rest.join('/'))
  //         // this.debug('render:', p, '=>', dest.replace(this.targetDir + '/', ''))
  //         await this.fs.outputFile(dest, rendered, map.options || {})
  //       }
  //     }
  //   }
  // }

  // private foramtFileMaps (fileMaps: any[]): FileMap[] {
  //   return ensureArray(fileMaps)
  //     .map((m: any) =>
  //       isString(m)
  //         ? {
  //             from: m,
  //             to: m
  //               .split('/')
  //               .filter(
  //                 (x: string) => !!x && !x.includes('*') && !x.includes('!')
  //               )
  //               .join('/')
  //           }
  //         : isFunction(m)
  //           ? m()
  //           : m
  //     )
  //     .filter((m: any) => Boolean(m) && m.from && m.to)
  // }

  // private async globFile ({
  //   from,
  //   options,
  //   cwd = ''
  // }: Record<string, any>): Promise<string[]> {
  //   const patterns = ensureArray(from)
  //   let ret: string[] = []
  //   for (let p of patterns) {
  //     if (p.startsWith('./')) {
  //       p = p.slice(2)
  //     }
  //     const trimp = p.trim()
  //     if (trimp) {
  //       const r = await this.glob(trimp, {
  //         cwd: join(this.rootPath, cwd || ''),
  //         dot: true,
  //         ...(options || {})
  //       })
  //       ret = ret.concat(r)
  //     }
  //   }
  //   return [...new Set(ret)]
  // }
}
