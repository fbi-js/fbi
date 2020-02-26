import * as ora from 'ora'
import * as execa from 'execa'
import * as fs from 'fs-extra'
import * as chalk from 'chalk'
import { prompt } from 'enquirer'
import glob = require('tiny-glob')
import cleanStack = require('clean-stack')
import { isWindows, isString } from '../utils'

import { Store } from './store'
import { getEnv, resolveConfig, hasOwnProperty, defaultConfigs } from '../helpers'

function cleanError(err: object | string): string {
  const stack =
    typeof err === 'string'
      ? err
      : typeof err === 'object' && hasOwnProperty(err, 'stack') && typeof err.stack === 'string'
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
  public context = context

  get store() {
    if (!this._store) {
      this._store = new Store(defaultConfigs.directoryName, defaultConfigs.rootDirectory)
    }
    return this._store
  }

  get fs(): any {
    return fs
  }

  get glob(): any {
    return glob
  }

  get style(): chalk.Chalk {
    return chalk
  }

  get prompt(): any {
    return prompt
  }

  get exec() {
    return execa
  }

  loadConfig() {
    const config = resolveConfig(context.get('env'), this.store)
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
  debug = (...messages: any[]): this => {
    if (context.get('debug')) {
      console.log(chalk.dim(`[debug]`), ...messages.map(m => safeStylized(m, chalk.dim)))
    }
    return this
  }

  warn(...messages: any[]): this {
    console.log(chalk.yellow(`[warn]`), ...messages.map(m => safeStylized(m, chalk.yellow)))
    return this
  }

  error(...messages: any[]): this {
    const errors = messages.map((err: any) =>
      isString(err) ? err : (err.stack && cleanError(err.stack)) || err
    )
    console.log(chalk.red(`[error]`), ...errors.map(m => safeStylized(m, chalk.red)))
    return this
  }

  clearConsole(): this {
    process.stdout.write(isWindows ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H')
    return this
  }

  exit(code?: number): void {
    process.exit(typeof code === undefined ? 0 : code)
  }
}
