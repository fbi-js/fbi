import { join } from 'path'
import * as semver from 'semver'

export function getMatchVersion(versions: string[], target: string) {
  const _target = target.trim()
  if (!_target || !Array.isArray(versions) || versions.length < 1) {
    return null
  }

  const range = semver.validRange(target)
  if (!range) {
    return versions.find((v: string) => v === target)
  }

  return semver.maxSatisfying(versions, range)
}

export function getPathByVersion(baseDir: string, id: string, version: string, separator = '__') {
  return join(baseDir, `${id}${separator}${version}`)
}
