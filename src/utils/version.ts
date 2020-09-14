import { join } from 'path'
import semver from 'semver'

export function parseVersion(version: string): string {
  const parsed = semver.parse(version)
  return parsed ? parsed.major + '.' + parsed.minor : '*'
}

export function getMatchVersion(versions: string[], target: string) {
  const _target = target.trim()
  if (!_target || !Array.isArray(versions) || versions.length < 1) {
    return null
  }

  const range = semver.validRange(target)
  if (!range) {
    return versions.find((v: string) => v === target)
  }
  try {
    const ret = semver.maxSatisfying(
      versions.map((v: any) => v.long),
      range
    )
    if (!ret) {
      return null
    }
    return parseVersion(ret)
  } catch (err) {
    console.log(err)
    return null
  }
}

export function getPathByVersion(baseDir: string, id: string, version?: string, separator = '__') {
  if (!version || !version.trim()) {
    return join(baseDir, id)
  }
  return join(baseDir, `${id}${separator}${version}`)
}

export function getVersionByPath(path: string, baseDir: string, id: string, separator = '__') {
  const prefix = getPathByVersion(baseDir, id)
  const version = path.replace(prefix, '')
  return version.startsWith(separator) ? version.replace(separator, '') : version
}
