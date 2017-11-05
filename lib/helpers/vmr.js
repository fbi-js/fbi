const fs = require('fs')
const vm = require('vm')
const path = require('path')
const Module = require('module')
const utils = require('./utils')

/**
 * run in vm
 *
 * @param {any} filename
 * @param {any} context
 * @param {any} parent
 * @returns
 */
module.exports = (filename, context, parent) => {
  filename = path.resolve(filename)

  // if no parent or context, clear cache
  if (!context && !parent) {
    delete require.cache[filename]
    const m = require(filename)
    delete require.cache[filename]

    return m
  } else {
    if (typeof context !== 'object') {
      context = {}
    }

    const sandbox = vm.createContext(utils.merge(global, context))

    return runInSandbox(filename, sandbox, parent)
  }
}

/**
 * run in sandbox
 *
 * @param {string} filename
 * @param {object} [sandbox={}]
 * @param {obejct} [parent={ require: require }]
 * @returns
 */
const runInSandbox = (
  filename,
  sandbox = {},
  parent = {
    require: require
  }
) => {
  try {
    sandbox.module = new Module(filename, parent)
    sandbox.exports = sandbox.module.exports
    sandbox.__dirname = path.dirname(filename)
    sandbox.__filename = filename
    sandbox.module.filename = filename
    sandbox.module.paths = sandbox.modulePaths.concat(
      Module._nodeModulePaths(sandbox.__dirname)
    )
    sandbox.global = sandbox
    sandbox.require = path => {
      const file = sandbox.require.resolve(path)
      return parent.require(file)
    }
    sandbox.require.resolve = request => {
      return Module._resolveFilename(request, sandbox.module)
    }
    sandbox.require.main = process.mainModule
    sandbox.require.extensions = Module._extensions
    sandbox.require.cache = Module._cache

    const code = fs.readFileSync(filename, 'utf8')

    return runInVm(code, sandbox, filename)
  } catch (err) {
    throw err
  }
}

/**
 * run in vm
 *
 * @param {any} code
 * @param {any} sandbox
 * @param {any} filename
 * @returns
 */
function runInVm(code, sandbox, filename) {
  const wrapCode = `
  try {
    ${code}
  } catch (e) {
    ctx.log('Task fail!')
    if (ctx.argvs.includes('--debug')) {
      ctx.log('File: ${filename}')
      ctx.log(e.message, -2)
      ctx.log(e.stack, -2)
    } else {
      ctx.log(e.message, -2)
    }
  }
  `

  vm.runInContext(wrapCode, sandbox, {
    filename,
    lineOffset: -2,
    displayErrors: true
  })
  return sandbox.module.exports
}
