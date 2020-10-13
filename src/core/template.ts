import { join } from 'path'
import { BaseClass } from './base'
import { isValidArray, isFunction, isString, ensureArray, isValidObject } from '../utils'

type FileMap = {
  from: string
  to: string
  options?: {}
  data?: {}
  cwd?: string
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
  protected _debugPrefix = ''
  private rootPath = ''
  private subDirectory = false

  constructor() {
    super()
  }

  // public methods
  public resolveTemplate(templateId: string) {
    const template = this.templates.find((x) => x.id === templateId)
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

  public async run(data: Record<string, any>, flags: any): Promise<any> {
    if (data?.subDirectory) {
      this.subDirectory = data.subDirectory
    }

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

  public installDeps(cwd = process.cwd(), packageManager?: string, lockfile = false, opts?: any) {
    const pm = packageManager || this.context.get('config').packageManager

    const cmds = [pm, 'install']

    if (!lockfile) {
      cmds.push(
        pm === 'npm' ? '--no-package-lock' : pm === 'yarn' ? '--no-lockfile' : '--frozen-lockfile'
      )
    }

    this.debug(`\nrunning \`${cmds.join(' ')}\` in ${cwd}`)

    return this.exec(cmds[0], cmds.slice(1), {
      ...(opts || {}),
      cwd
    })
  }

  // processes
  private async prepare(data?: any) {
    this._debugPrefix = `Template "${this.id}"`

    if (data && isValidObject(data)) {
      this.data = data
    }

    if (!this.data.factory || !this.data?.factory?.path) {
      this.error(`need path of factory`)
      return this.exit()
    }

    this.rootPath = join(this.data.factory.path, this.path)
  }
  protected async gathering(flags: any): Promise<any> {}
  private async afterGathering() {
    if (this.subDirectory) {
      this.targetDir = join(this.targetDir, this.data?.project?.name || '')
    }
    this.debug(`${this._debugPrefix} rootPath: ${this.rootPath}; targetDir: ${this.targetDir}`)
  }
  protected async checking(): Promise<any> {}
  private async afterChecking() {}
  protected async writing(): Promise<any> {}
  private async afterWriting() {
    if (this.files.copy && isValidArray(this.files.copy)) {
      this.debug(`${this._debugPrefix} start copy`, this.files.copy)
      await this.copy(this.files.copy)
    }

    if (isFunction(this.renderer) && this.files.render && isValidArray(this.files.render)) {
      this.debug(`${this._debugPrefix} start render`, this.files.render, this.files?.renderOptions)
      await this.render(this.files.render, this.data, this.files?.renderOptions)
    }
  }
  protected async installing(flags: any): Promise<any> {}
  private async afterInstalling() {}
  protected async ending(): Promise<any> {}
  private async afterEnding() {}

  // utils
  private async copy(fileMaps: StringOrFileMap[]) {
    const maps: FileMap[] = this.foramtFileMaps(fileMaps)
    for (const map of maps) {
      const paths = await this.globFile(map)
      const replace = map.to.split('/').filter(Boolean)
      for (const p of paths) {
        const rest = p.split('/').filter(Boolean).slice(replace.length)
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
    options?: [] | {}
  ) {
    if (!this.renderer || !isFunction(this.renderer)) {
      return
    }
    const maps = this.foramtFileMaps(fileMaps)
    for (const map of maps) {
      const paths = await this.globFile(map)
      const replace = map.to.split('/').filter(Boolean)
      for (const p of paths) {
        const rest = p.split('/').filter(Boolean).slice(replace.length)
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
                .filter((x: string) => !!x && !x.includes('*') && !x.includes('!'))
                .join('/')
            }
          : isFunction(m)
          ? m()
          : m
      )
      .filter((m: any) => Boolean(m) && m.from && m.to)
  }

  private async globFile({ from, options, cwd = '' }: Record<string, any>): Promise<string[]> {
    const patterns = ensureArray(from)
    let ret: string[] = []
    for (let p of patterns) {
      if (p.startsWith('./')) {
        p = p.slice(2)
      }
      const trimp = p.trim()
      if (trimp) {
        const r = await this.glob(trimp, {
          cwd: join(this.rootPath, cwd || ''),
          dot: true,
          ...(options || {})
        })
        ret = ret.concat(r)
      }
    }
    return [...new Set(ret)]
  }
}
