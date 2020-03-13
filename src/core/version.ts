import * as semver from 'semver'
import { join, dirname, basename } from 'path'
import * as assert from 'assert'

import { BaseClass } from './base'
import { git, isGitRepo, groupBy, getPathByVersion } from '../utils'

const types = ['tag', 'branch']

export class Version extends BaseClass {
  private type = 'tag' // or branch
  private enable: boolean = false
  private versions: Record<string, any>[] = []
  // main source dir
  private mainPath: string = ''
  // for version dir
  private baseDir: string = ''

  constructor(public baseName: string = '') {
    super()
  }

  public async init(mainPath: string, baseDir: string, type = 'tag') {
    assert(mainPath.trim(), `mainPath should not be empty`)
    assert(types.includes(type), `supported types: ${types.join(', ')}`)

    this.mainPath = mainPath
    this.baseDir = baseDir || dirname(this.mainPath)
    this.baseName = this.baseName || basename(this.mainPath)
    this.type = type
    this.enable = isGitRepo(mainPath)

    if (!this.enable) {
      return null
    }
    this.logStart('Factory version initializing')
    const vers = await this.getVersions()
    this.versions =
      this.type === 'tag'
        ? this.parseVersions(vers)
        : vers.map(v => ({
            short: v,
            long: v
          }))
    this.logItem(`Valid versions: ${this.versions.map(v => v.short).join(', ')}`)

    await this.cleanUp()

    if (this.versions.length < 1) {
      return null
    }

    this.logItem('Get latest version...')
    const latest = await this.getVersion()
    this.logItem(`Latest version: ${latest?.short}`)
    return {
      latest,
      versions: this.versions
    }
  }

  public async getVersion(target?: string) {
    if (!this.enable) {
      this.warn(`${this.mainPath} does not support version control`)
    }

    let version
    if (this.type === 'branch') {
      if (target) {
        const found = this.versions.find(v => v.short === target || v.long === target)
        if (!found) {
          return null
        }

        version = {
          ...found,
          dir:
            found.short !== 'master'
              ? getPathByVersion(this.baseDir, this.baseName, found.short)
              : this.mainPath
        }
      } else {
        version = {
          ...this.versions[0],
          dir: this.mainPath
        }
      }
    } else {
      const versions = this.versions.map(v => v.long)
      const long = semver.maxSatisfying(versions, target || '*')
      const short = this.versions.find(v => v.long === long)?.short
      const dir = getPathByVersion(this.baseDir, this.baseName, short)
      version = { dir, long, short }
    }

    if (await this.fs.pathExists(version.dir)) {
      return version
    }

    if (!['master'].includes(version.short)) {
      this.logItem(`Initializing version '${version.short}'...`)
      await this.fs.copy(this.mainPath, version.dir)
      await git.checkout(version.long, { cwd: version.dir })
      await git.hardReset(version.long, { cwd: version.dir })
    }
    return version
  }

  public getLatest() {
    const versions = this.versions.map(v => v.long)
    const long = semver.maxSatisfying(versions, '*')
    return this.versions.find(v => v.long === long)?.short
  }

  private getVersions() {
    const opts = { cwd: this.mainPath }
    return this.type === 'tag' ? git.tag.list(opts) : git.branch.locals(opts)
  }

  private parseVersion(version: string): string {
    const parsed = semver.parse(version)
    return parsed ? parsed.major + '.' + parsed.minor : '*'
  }

  private parseVersions(versions: string[]) {
    // slim versions
    const groupVersions = groupBy(semver.sort(versions).reverse(), semver.minor)
    return Object.values(groupVersions)
      .map(val => semver.maxSatisfying(val, '*') || '')
      .filter(Boolean)
      .map((val: any) => ({
        short: this.parseVersion(val),
        long: val
      }))
  }

  // clear unfresh versions
  private async cleanUp() {
    if (!this.enable) {
      this.warn(`${this.mainPath} does not support version control`)
    }
    const dirs = await this.glob(getPathByVersion('', this.baseName, '*'), {
      cwd: this.baseDir
    })

    for (const dir of dirs) {
      // don't remove valid versions
      const ver = dir.replace(getPathByVersion('', this.baseName, ''), '')
      if (!this.versions.find(v => v.short === ver)) {
        const target = join(this.baseDir, dir)
        await this.fs.remove(target)
        this.logItem(`Removed inValid version: ${dirname(target)}`)
      }
    }
  }
}
