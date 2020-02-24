import { join } from 'path'
import * as fs from 'fs-extra'
import { isValidArray, isFunction, isObject, merge } from '@fbi-js/utils'

export const nonEditableKeys = [
  'rootDirectory',
  'directoryName',
  'globalConfigFile',
  'factory',
  '_global',
  '_local',
  '_factory'
]

const home = (process.platform === 'win32' && process.env.USERPROFILE) || process.env.HOME || '/'

export const defaultConfigs = {
  rootDirectory: join(home, '.fbi'),
  directoryName: 'factories',
  globalConfigFile: 'global-config.json'
  // localConfigFile: '.fbi.config.js',
  // packageFile: 'package.json',
  // packageKey: 'fbi',
  // organization: 'https://github.com/fbi-js',
  // packageManager: env.hasPnpm ? 'pnpm' : env.hasYarn ? 'yarn' : env.hasNpm ? 'npm' : '',
  // factory: null
}

function resolveLocalConfig(config: Record<string | number, any>): Record<string | number, any> {
  let pkgConfig = {}
  let fileConfig = {}
  const pwd = process.cwd()
  const pkgPath = join(pwd, config.packageFile)
  const filePath = join(pwd, config.localConfigFile)

  if (fs.pathExistsSync(pkgPath)) {
    const pkg = require(pkgPath)
    if (pkg[config.packageKey] && isValidArray(Object.keys(pkg[config.packageKey]))) {
      pkgConfig = pkg[config.packageKey]
    }
  }

  if (fs.pathExistsSync(filePath)) {
    const tmp = require(filePath)
    const obj = isFunction(tmp) ? tmp() : isObject(tmp) ? tmp : {}
    fileConfig = obj.default || obj
  }

  return merge(pkgConfig, fileConfig)
}

function resolveFactoryConfig(
  config: Record<string | number, any>,
  factory: Record<string | number, any>,
  store: any
): Record<string | number, any> {
  const factoryInfo = store.get(factory.id)

  if (!factoryInfo) {
    return {}
  }

  const project = store.get(`${factory.id}.projects`, { path: process.cwd() })
  const extraInfo = (project && project[0]) || {}

  try {
    const factoryConfig = require(join(factoryInfo.path, config.localConfigFile))

    return {
      ...factoryConfig,
      ...extraInfo
    }
  } catch (err) {
    return {}
  }
}

export function resolveConfig(env: any, store?: any): Record<string | number, any> {
  const config: Record<string | number, any> = {
    ...defaultConfigs,
    localConfigFile: '.fbi.config.js',
    packageFile: 'package.json',
    packageKey: 'fbi',
    organization: 'https://github.com/fbi-js',
    packageManager: env.hasPnpm ? 'pnpm' : env.hasYarn ? 'yarn' : env.hasNpm ? 'npm' : ''
    // factory: null
  }
  const localConfig = resolveLocalConfig(config)
  const factoryConfig =
    store && localConfig.factory && localConfig.factory.id
      ? resolveFactoryConfig(config, localConfig.factory, store)
      : {}

  for (const [key, val] of Object.entries(factoryConfig)) {
    if (!nonEditableKeys.includes(key)) {
      config[key] = val
    }
  }

  for (const [key, val] of Object.entries(localConfig)) {
    if (!nonEditableKeys.includes(key)) {
      config[key] = val
    }
  }

  return {
    ...config,
    factory: localConfig.factory,
    _global: config,
    _factory: factoryConfig,
    _local: localConfig
  }
}
