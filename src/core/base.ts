import { join } from 'path'
import * as ora from 'ora'
import * as execa from 'execa'
import * as fs from 'fs-extra'
import * as chalk from 'chalk'
import { prompt } from 'enquirer'
import glob = require('tiny-glob')
import * as readline from 'readline'
import cleanStack = require('clean-stack')
import { isWindows, isString, symbols } from '../utils'

import { Store } from './store'
import { getEnv, resolveConfig, objHasProperty, defaultConfigs } from '../helpers'

function cleanError(err: object | string): string {
  const stack =
    typeof err === 'string'
      ? err
      : typeof err === 'object' && objHasProperty(err, 'stack') && typeof err.stack === 'string'
      ? err.stack
      : ''

  return cleanStack(stack, {
    pretty: true
  })
}

const safeStylized = (str: any, style: Function) => (typeof str === 'string' ? style(str) : str)

  // handle ctrl+c on prompt
;(prompt as any).on('cancel', () => process.exit())

const context = new Store()
context.set('env', getEnv())
context.set('debug', false)

export abstract class BaseClass {
  private _store?: Store
  private _configStore?: Store
  private _projectStore?: Store
  public context = context

  get store() {
    if (!this._store) {
      this._store = new Store(join(defaultConfigs.rootDirectory, 'factories.json'))
    }
    return this._store
  }

  get projectStore() {
    if (!this._projectStore) {
      this._projectStore = new Store(join(defaultConfigs.rootDirectory, 'projects.json'))
    }
    return this._projectStore
  }

  get configStore() {
    if (!this._configStore) {
      this._configStore = new Store(join(defaultConfigs.rootDirectory, 'configs.json'))
    }
    return this._configStore
  }

  get fs() {
    return fs
  }

  get glob() {
    return glob
  }

  get style(): chalk.Chalk {
    return chalk
  }

  get prompt() {
    return prompt
  }

  get exec() {
    return execa
  }

  loadConfig() {
    const config = resolveConfig(context.get('env'), this.configStore, this.projectStore)
    context.set('config', config)
    return config
  }

  createSpinner(str: string) {
    return (str && ora(str)) || ora()
  }

  log(...messages: any[]): this {
    console.log(...messages)
    return this
  }

  debug(...messages: any[]): this {
    if (context.get('debug')) {
      console.log(chalk.dim(`[debug]`), ...messages.map(m => safeStylized(m, chalk.dim)))
    }
    return this
  }

  warn(...messages: any[]): this {
    console.log(chalk.yellow(symbols.warning), ...messages.map(m => safeStylized(m, chalk.yellow)))
    return this
  }

  error(...messages: any[]): this {
    const errors = messages.map((err: any) =>
      isString(err) ? err : (err.stack && cleanError(err.stack)) || err
    )
    console.log(chalk.red(symbols.cross), ...errors.map(m => safeStylized(m, chalk.red)))
    return this
  }

  logStart(...messages: any[]): this {
    return this.log(symbols.pointerSmall, ...messages)
  }

  logEnd(...messages: any[]): this {
    return this.log(symbols.check, ...messages)
  }

  logItem(...messages: any[]): this {
    return this.log(symbols.bulletWhite, ...messages)
  }

  clearConsole(): this {
    process.stdout.write(isWindows ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H')
    return this
  }

  clear() {
    if (console.clear) {
      console.clear()
    } else if (process.stdout.isTTY) {
      const blank = '\n'.repeat(process.stdout.rows || 0)
      console.log(blank)
      readline.cursorTo(process.stdout, 0, 0)
      readline.clearScreenDown(process.stdout)
    }
  }

  exit(code?: number): void {
    process.exit(typeof code === undefined ? 0 : code)
  }
}
