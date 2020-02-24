import { join, dirname } from 'path'
import { BaseClass } from './base'
import { isValidArray, isFunction, isString, isValidObject, ensureArray } from '@fbi-js/utils'

export abstract class Template extends BaseClass {
  [key: string]: any
  public abstract id = ''
  public description = ''
  public path = ''
  protected renderer?: Function
  protected answers: Record<string | number, any> = {}
  protected files: Record<'copy' | 'render', any[]> = {
    copy: [],
    render: []
  }
  protected targetDir = process.cwd()

  public async run(...args: any[]): Promise<void> {
    const debugPrefix = `Template "${this.id}"`
    this.debug(`${debugPrefix} run prompting`)
    await this.prompting()
    this.debug(`${debugPrefix} run start`)
    await this.start()
    this.debug(`${debugPrefix} run writing`)
    await this.writing()
    const project = this.answers.project
    this.targetDir = join(process.cwd(), (project && project.name) || '')
    this.debug(`${debugPrefix} targetDir: ${this.targetDir}`)

    if (isValidArray(this.files.copy)) {
      this.debug(`${debugPrefix} start copy`)
      await this.copy(this.files.copy)
    }

    if (isFunction(this.renderer) && isValidArray(this.files.render)) {
      this.debug(`${debugPrefix} start render`)
      await this.render(this.files.render, this.answers)
    }

    this.debug(`${debugPrefix} run install`)
    await this.install()
    this.debug(`${debugPrefix} run end`)
    await this.end()

    await this.configuring()
  }

  public async prompting(): Promise<any> {}
  public async start(): Promise<any> {}
  public async configuring(): Promise<any> {}
  public async writing(): Promise<any> {}
  public async install(): Promise<any> {}
  public async end(): Promise<any> {}

  private async copy(files: any[]) {
    const maps = ensureArray(files)
    for (const map of maps) {
      const opts = isString(map) ? { from: map, to: map } : map
      if (!isValidObject(opts)) {
        continue
      }
      const paths = await this.globFile(opts)
      const replace = opts.to.split('/').filter(Boolean)
      for (const p of paths) {
        const rest = p
          .split('/')
          .filter(Boolean)
          .slice(replace.length)
        const src = join(this.path as string, p)
        if (!(await this.fs.pathExists(src))) {
          this.warn(`${src} not found`)
          continue
        }
        const dest = join(this.targetDir, replace.join('/'), rest.join('/'))
        this.debug(
          'copy:',
          src.replace(this.path + '/', ''),
          '=>',
          dest.replace(this.targetDir + '/', '')
        )
        await this.fs.ensureDir(dirname(dest))
        await this.fs.copy(src, dest)
      }
    }
  }
  private async render(files: any[], data: Record<string | number, any>, ...options: any[]) {
    const maps = ensureArray(files)
    for (const map of maps) {
      const opts = isString(map) ? { from: map, to: map } : map
      if (!isValidObject(opts)) {
        continue
      }

      const paths = await this.globFile(opts)
      const replace = opts.to.split('/').filter(Boolean)
      for (const p of paths) {
        const rest = p
          .split('/')
          .filter(Boolean)
          .slice(replace.length)
        const src = join(this.path as string, p)
        const stats = await this.fs.stat(src)
        if (stats.isFile()) {
          const content = await this.fs.readFile(src, 'utf8')
          const rendered = await this.renderFn(content.trim() + `\n`, data, ...options) // ejs.render(content.trim() + `\n`, data, { async: true })
          const destFile = join(this.targetDir, replace.join('/'), rest.join('/'))
          this.debug('render:', p, '=>', destFile)
          await this.fs.ensureDir(dirname(destFile))
          await this.write(rendered, destFile)
        }
      }
    }
  }

  private async write(content: string, dest: string) {
    await this.fs.ensureDir(dirname(dest))
    await this.fs.writeFile(dest, content)
  }

  private async globFile({ from, options }: Record<string | number, any>, cwd = this.path) {
    const patterns = ensureArray(from)
    let ret: string[] = []
    for (const p of patterns) {
      if (p.trim()) {
        const r = await this.glob(p.trim(), {
          cwd,
          dot: true,
          ...(options || {})
        })
        ret = ret.concat(r)
      }
    }
    return ret
  }
}
