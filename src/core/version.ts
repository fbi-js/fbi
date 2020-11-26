import semver from 'semver'
import { join, dirname, basename } from 'path'
import assert from 'assert'

import { BaseClass } from './base'
import { git, isGitRepo, groupBy, getPathByVersion, getVersionByPath } from '../utils'

const types = ['tag', 'branch']
const semverMatchOptions = { includePrerelease: true }

export class Version extends BaseClass {
  private type = 'tag' // or branch
  private enable = false
  private versions: Record<string, any>[] = []
  // versions dir
  private baseDir = ''

  // mainPath: main source dir
  // baseName: factory name
  constructor(public baseName: string = '', public mainPath: string) {
    super()
    assert(mainPath.trim(), `mainPath should not be empty`)
  }

  public async init(baseDir: string, type = 'tag') {
    assert(types.includes(type), `supported types: ${types.join(', ')}`)
    this.type = type
    this.enable = isGitRepo(this.mainPath)
    if (!this.enable) {
      return null
    }

    this.baseDir = baseDir || dirname(this.mainPath)
    this.baseName = this.baseName || basename(this.mainPath)
    this.logStart('Factory version initializing')
    const vers = await this.getVersions()
    this.versions =
      this.type === 'tag'
        ? this.parseVersions(vers)
        : vers.map((v) => ({
            short: v,
            long: v
          }))
    this.logItem(`Valid versions: ${this.versions.map((v) => v.short).join(', ')}`)

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
        const found = this.versions.find((v) => v.short === target || v.long === target)
        if (!found) {
          return null
        }

        version = {
          ...found,
          dir:
            found.short !== 'master' && found.short !== 'main'
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
      const versions = this.versions.map((v) => v.long)
      const long = semver.maxSatisfying(versions, target || '*', semverMatchOptions)
      const short = this.versions.find((v) => v.long === long)?.short
      const dir = getPathByVersion(this.baseDir, this.baseName, short)
      version = { dir, long, short }
    }

    if (await this.fs.pathExists(version.dir)) {
      await git.checkout(version.long, { cwd: version.dir })
      await git.hardReset(version.long, { cwd: version.dir })
      return version
    }

    if (!['master', 'main'].includes(version.short)) {
      this.logItem(`Initializing version '${version.short}'...`)
      await this.fs.copy(this.mainPath, version.dir)
      await git.checkout(version.long, { cwd: version.dir })
      await git.hardReset(version.long, { cwd: version.dir })
    }
    return version
  }

  public getLatest() {
    const versions = this.versions.map((v) => v.long)
    const long = semver.maxSatisfying(versions, '*', semverMatchOptions)
    return this.versions.find((v) => v.long === long)?.short
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
      .map((val) => semver.maxSatisfying(val, '*', semverMatchOptions) || '')
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
      const ver = getVersionByPath(dir, '', this.baseName)
      if (!this.versions.find((v) => v.short === ver)) {
        const target = join(this.baseDir, dir)
        await this.fs.remove(target)
        this.logItem(`Removed inValid version: ${target}`)
      }
    }
  }
}
