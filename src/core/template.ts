import * as ejs from 'ejs'
import { isAbsolute, join } from 'path'
import { BaseClass } from './base'
import { Factory } from './factory'
import { isValidObject } from '../utils'

const globrex = require('globrex');

type GlobRule = {
  glob?: string
  ignores?: any[]
}

export abstract class Template extends BaseClass {
  [key: string]: any
  public abstract id = ''
  public description = ''
  // absolute path to template dir
  public path = ''
  public templates: Template[] = []
  protected data: Record<string | number, any> = {}
  protected rule: GlobRule = {
    glob: '/**/*',
    ignores: []
  }
  protected targetDir = process.cwd()
  protected _debugPrefix = ''
  private rootPath = ''

  constructor (public factory: Factory) {
    super()
  }

  get globPath() {
    return `${this.path}/${this.rule.glob}`
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

  // public methods
  /**
   * output -> ${this.targetDir}/src/routes/index.ts
   * @param srcPath file entry path
   */
  private getOutputPath(srcPath: string) {
    const { template } = this.data.factory
    const formatPath = srcPath
      .replace(/(.*)(templates)(.*)/, '$3')
      .replace(`/${template}`, '')
      .replace(/(.*)(.ejs)$/, '$1')
    const outputPath = `${this.targetDir}${formatPath}`
    return outputPath
  }

  /**
   * determine the srcPath file is ignored
   * @param srcPath file entry path
   */
  private isIgnoreFile(srcPath: string, outputPath: string) {
    let isIgnoreFile = false
    this.rule.ignores?.forEach(ignoreRule => {
      const filePath = join(this.path, ignoreRule)
      const { regex } = globrex(filePath)
      const isIgnore = regex.test(srcPath)
      if (isIgnore) {
        isIgnoreFile = true
        console.log(this.style.grey(`ignore file: ${outputPath}`))
      }
    })
    return isIgnoreFile
  }

  /**
   * copy or render file from srcPath to outputPath, .ejs file will be render by ejs
   * @param srcPath file entry path
   * @param outputPath file output path
   */
  private async writeFile(srcPath: string, outputPath: string) {
    const isEjsFile = /(.*)(.ejs)$/.test(srcPath)
    if (this.isIgnoreFile(srcPath, outputPath)) {
      return
    }

    if (!isEjsFile) {
      await this.fs.copy(srcPath, outputPath, {})
    } else {
      const content = await this.fs.readFile(srcPath, 'utf8')
      const rendered = await ejs.render(
        content.trim() + '\n',
        {
          ...this.data
        },
        {
          async: true
        }
      )
      await this.fs.outputFile(outputPath, rendered, {})
    }

    console.log(this.style.grey(`write file: ${outputPath}`))
    this.debug('writing file', {
      srcPath,
      outputPath
    })
  }

  /**
   * copy or render files
   * @param files file path list
   */
  public async writingFiles(files: string[]) {
    for (const srcPath of files) {
      const isExist = await this.fs.pathExists(srcPath)
      const outputPath = this.getOutputPath(srcPath)
      const stats = await this.fs.stat(srcPath)
      if (isExist) {
        if (stats.isFile()) {
          try {
            await this.writeFile(srcPath, outputPath)
          } catch (error) {
            this.debug('write file error:', {
              srcPath,
              outputPath,
              error
            })
          }
        } else {
          await this.fs.ensureDir(outputPath)
        }
      }
    }
  }
}
