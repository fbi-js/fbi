import * as ora from 'ora'
import * as execa from 'execa'
import * as fs from 'fs-extra'
import * as chalk from 'chalk'
import { prompt } from 'enquirer'
import glob = require('tiny-glob')
import cleanStack = require('clean-stack')
import { isWindows } from '@fbi-js/utils'

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
    console.log(chalk.red(`[error]`), ...messages.map(m => safeStylized(m, chalk.red)))
    return this
  }

  // error(err: any, type?: string): this {
  //   const pad = '\n'
  //   const prefix = type ? chalk.red(`[${type}]`) : ''
  //   if (typeof err === 'string') {
  //     console.error(`${prefix}${chalk.red(err)}`)
  //   } else if (typeof err === 'object') {
  //     const stack = (err.stack && cleanError(err.stack)) || ''
  //     const info =
  //       (stack &&
  //         stack
  //           .split('\n')
  //           .map((m: string) => m.trimLeft())
  //           .filter(Boolean)
  //           .map((m: string, idx: number) => (idx === 0 ? chalk.red(m) : m))
  //           .join(pad)) ||
  //       ''
  //     // const code = err.code ? `${chalk.red(`[${err.code}]`)}` : ''
  //     console.error(`${prefix}${info}`)
  //     // const command = err.command ? `${pad}${chalk.dim('command: ') + chalk.red(err.command)}` : ''
  //     // console.error(
  //     //   `${chalk.grey('name:')} ${chalk.red(errName)}${code}${command}${
  //     //     info ? `${pad}${chalk.dim('info:')} ${info}` : ''
  //     //   }`
  //     // )
  //   }

  //   return this
  // }

  clearConsole(): this {
    process.stdout.write(isWindows ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H')
    return this
  }

  exit(code?: number): void {
    process.exit(typeof code === undefined ? 0 : code)
  }
}
