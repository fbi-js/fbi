import { join } from 'path'
import ora from 'ora'
import execa from 'execa'
import fs from 'fs-extra'
import chalk from 'chalk'
import { prompt } from 'enquirer'
import readline from 'readline'

import context from './context'
import { Store } from './store'
import { isWindows, isString, symbols } from '../utils'
import { resolveConfig, objHasProperty, defaultConfigs } from '../helpers'
import glob = require('tiny-glob')
import cleanStack = require('clean-stack')

function cleanError (err: object | string): string {
  const stack =
    typeof err === 'string'
      ? err
      : typeof err === 'object' &&
        objHasProperty(err, 'stack') &&
        typeof err.stack === 'string'
        ? err.stack
        : ''

  return cleanStack(stack, {
    pretty: true
  })
}

const safeStylized = (str: any, style: Function) =>
  typeof str === 'string' ? style(str) : str

// handle ctrl+c on prompt
;(prompt as any).on('cancel', () => process.exit())

interface InstallOptions {
  cwd?: string
  packageManager?: string
  lockfile?: boolean
  opts?: Record<string, any>
  names?: string[]
}

export abstract class BaseClass {
  private _store?: Store
  private _configStore?: Store
  private _projectStore?: Store
  public context: Store = context

  get store () {
    if (!this._store) {
      this._store = new Store(
        join(defaultConfigs.rootDirectory, 'factories.json')
      )
    }
    return this._store
  }

  get projectStore () {
    if (!this._projectStore) {
      this._projectStore = new Store(
        join(defaultConfigs.rootDirectory, 'projects.json')
      )
    }
    return this._projectStore
  }

  get configStore () {
    if (!this._configStore) {
      this._configStore = new Store(
        join(defaultConfigs.rootDirectory, 'configs.json')
      )
    }
    return this._configStore
  }

  get fs () {
    return fs
  }

  get glob () {
    return glob
  }

  get style (): chalk.Chalk {
    // @ts-ignore
    return chalk
  }

  get prompt () {
    return prompt
  }

  get exec () {
    return execa
  }

  loadConfig () {
    const config = resolveConfig(
      this.context.get('env'),
      this.configStore,
      this.projectStore
    )
    this.context.set('config', config)
    return config
  }

  createSpinner (str: string) {
    return (str && ora(str)) || ora()
  }

  log (...messages: any[]): this {
    console.log(...messages)
    return this
  }

  debug (...messages: any[]): this {
    if (this.context.get('debug')) {
      console.log(
        chalk.dim('[debug]'),
        ...messages.map((m) => safeStylized(m, chalk.dim))
      )
    }
    return this
  }

  warn (...messages: any[]): this {
    console.log(
      chalk.yellow(symbols.warning),
      ...messages.map((m) => safeStylized(m, chalk.yellow))
    )
    return this
  }

  error (...messages: any[]): this {
    const errors = messages.map((err: any) =>
      isString(err) ? err : (err?.stack && cleanError(err.stack)) || err
    )
    console.log(
      chalk.red(symbols.cross),
      ...errors.map((m) => safeStylized(m, chalk.red))
    )
    return this
  }

  logStart (...messages: any[]): this {
    return this.log(symbols.pointerSmall, ...messages)
  }

  logEnd (...messages: any[]): this {
    return this.log(symbols.check, ...messages)
  }

  logItem (...messages: any[]): this {
    return this.log(symbols.bulletWhite, ...messages)
  }

  clearConsole (): this {
    process.stdout.write(isWindows ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H')
    return this
  }

  clear () {
    if (console.clear) {
      console.clear()
    } else if (process.stdout.isTTY) {
      const blank = '\n'.repeat(process.stdout.rows || 0)
      console.log(blank)
      readline.cursorTo(process.stdout, 0, 0)
      readline.clearScreenDown(process.stdout)
    }
  }

  exit (code?: number): void {
    process.exit(typeof code === undefined ? 0 : code)
  }

  installDeps (
    cwd = process.cwd(),
    packageManager?: string,
    lockfile = false,
    opts?: any
  ) {
    return this.installPkgs({
      cwd,
      packageManager,
      lockfile,
      opts
    })
  }

  installPkgs ({
    cwd = process.cwd(),
    lockfile = false,
    opts = {},
    names = [],
    packageManager
  }: InstallOptions) {
    const npmVersion = this.context.get('env.npmVersion')
    const pm = packageManager || this.context.get('config').packageManager

    let cmds = [pm, 'install']

    if (!lockfile) {
      // pnpm: Headless installation requires a pnpm-lock.yaml file
      cmds.push(
        pm === 'npm'
          ? '--no-package-lock'
          : pm === 'yarn'
            ? '--no-lockfile'
            : ''
      )
    }

    if (pm === 'npm' && npmVersion && npmVersion[0] >= 7) {
      cmds.push('--legacy-peer-deps')
    }

    if (Array.isArray(names)) {
      cmds = cmds.concat(names)
    }

    this.debug(`\nrunning \`${cmds.join(' ')}\` in ${cwd}`)

    return this.exec(cmds[0], cmds.slice(1).filter(Boolean), {
      stdout: 'inherit',
      ...(opts || {}),
      cwd
    })
  }
}
