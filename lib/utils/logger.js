const path = require('path')
const util = require('util')
const style = require('./style')
const dateFormat = require('./date-format')

class Logger {
  constructor ({ level = 'info', prefix = '' } = {}) {
    this.prefix = style.grey(prefix)
    this.levels = ['debug', 'info', 'success', 'warn', 'error', 'log']
    this.level = level

    this.configs.map(item => {
      const levelIndex = item.level
      const levelName = this.levels[levelIndex]

      // Logger methods: debug() info() success() warn() error() log()
      this[levelName] = (...messages) => {
        if (levelIndex >= this.level) {
          const time = dateFormat(Date.now(), 'hh:mm:ss')
          const prefix = `${this.prefix}${style.grey('[' + time + ']')} `
          const msg = this.format(messages, prefix, item.style)
          console.log(msg)
          return msg
        }
        return false
      }

      return false
    })
  }

  get level () {
    return this._level === 0 ? this._level : this._level || 1
  }

  set level (param) {
    let _level
    if (Number.isInteger(param)) {
      if (this.levels[param]) {
        _level = param
      }
    } else if (typeof param === 'string') {
      if (this.levels.includes(param)) {
        _level = this.levels.indexOf(param)
      }
    }
    this._level = _level
  }

  // Items: debug, info, success, warn, error, log
  get configs () {
    return [
      {
        level: 0,
        style: style.grey
      },
      {
        level: 1,
        style: style.cyan
      },
      {
        level: 2,
        style: style.green
      },
      {
        level: 3,
        style: style.yellow
      },
      {
        level: 4,
        style: style.red
      },

      {
        level: 5,
        style: style.normal
      }
    ]
  }

  getPrefix () {
    const time = dateFormat(Date.now(), 'hh:mm:ss')
    return `${this.prefix}${style.grey('[' + time + ']')} `
  }

  format (messages, prefix, style) {
    let result = ''
    messages.map(msg => {
      if (msg instanceof Error) {
        const obj = this.errorStackLeaner(msg)
        const br = result ? `\n${prefix}` : ''
        result += `${br}${style(obj.title)}${obj.stack}`
      }
      return true
    })
    if (!result) {
      result = style(util.format(...messages))
    }

    return prefix + result
  }

  /**
   *
  Demos:

  -- Case 1:
  ReferenceError: xx is not defined
    at taskParams (/Users/yourname/.fbi/fbi-template-vue2/fbi/build.js:24:1)
    at /Users/yourname/.fbi/fbi-template-vue2/fbi/build.js:56:5
    at ContextifyScript.Script.runInContext (vm.js:32:29)
    at Object.exports.runInContext (vm.js:64:17)
    at runInVm (/Users/yourname/work/git/fbi-v3/lib/vmr.js:70:21)
    at runInSandbox (/Users/yourname/work/git/fbi-v3/lib/vmr.js:44:12)
    at module.exports (/Users/yourname/work/git/fbi-v3/lib/vmr.js:107:10)
    at Task.run (/Users/yourname/work/git/fbi-v3/lib/task.js:135:13)

  -- Case 2:
  /Users/yourname/.fbi/fbi-template-vue2/fbi/config/webpack.base.js:59
    modules: fbiModulesPaths
    ^^^^^^^
  SyntaxError: Unexpected identifier
    at Object.exports.runInThisContext (vm.js:73:16)
    at Module._compile (module.js:543:28)
    at Object.Module._extensions..js (module.js:580:10)
    at Module.load (module.js:488:32)
    at tryModuleLoad (module.js:447:12)
    at Function.Module._load (module.js:439:3)
    at Module.require (module.js:498:17)
    at require (internal/module.js:20:19)
    at Object.<anonymous> (/Users/yourname/.fbi/fbi-template-vue2/fbi/config/webpack.prod.js:14:27)
    at Module._compile (module.js:571:32)
    at Object.Module._extensions..js (module.js:580:10)
    at Module.load (module.js:488:32)
    at tryModuleLoad (module.js:447:12)
    at Function.Module._load (module.js:439:3)
    at Module.require (module.js:498:17)
    at Object.require (internal/module.js:20:19)
   */
  errorStackLeaner (err) {
    if (!err || !err.stack) {
      return {
        title: '',
        stack: err
      }
    }

    // Ref: https://github.com/v8/v8/wiki/Stack%20Trace%20API
    const title = err.toString()
    const stacks = err.stack.split('\n').slice(1)
    const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i
    const stackReg2 = /at\s+()(.*):(\d*):(\d*)/i
    let stack = ''
    for (const s of stacks) {
      const sp = stackReg.exec(s) || stackReg2.exec(s)
      if (sp && sp.length === 5 && sp[2].includes(path.sep)) {
        const file = style.magenta(sp[2])
        const line = style.yellow(`${sp[3]}:${sp[4]}`)
        const method = sp[1]
        stack += `\n at ${file} ${line} ${method}`
      }
    }
    return {
      title,
      stack
    }
  }
}

module.exports = Logger
