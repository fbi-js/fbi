const fs = require('fs')
const vm = require('vm')
const path = require('path')
const Module = require('module')
const {assign} = require('../utils')

/**
 * Run in vm
 *
 * @param {string} code
 * @param {object} sandbox
 * @param {string} filename
 * @returns
 */
function runInVm(code, sandbox, filename, taskParams) {
  const wrapCode = `try{
  ;(taskParams => {
    ${code}
  })(${taskParams})
  } catch(err) {
    throw err
  }
  `
  // const result = vm.runInNewContext(wrapCode, sandbox, {
  const result = vm.runInThisContext(wrapCode, {
    filename,
    lineOffset: -2,
    displayErrors: true,
    timeout: sandbox.fbi.configs.TASK_TIMEOUT * 1 || 5 * 60 * 1000 // 5min
  })

  if (typeof result === 'function') {
    return result()
  }
  return sandbox.module.exports
}

/**
 * Run in sandbox
 *
 * @param {string} filename
 * @param {object} [sandbox={}]
 * @param {obejct} [parent={ require: require }]
 * @returns
 */
const runInSandbox = (
  filename,
  sandbox = {},
  taskParams,
  parent = {
    require
  }
) => {
  try {
    sandbox.module = new Module(filename, parent)
    sandbox.exports = sandbox.module.exports
    sandbox.__dirname = path.dirname(filename)
    sandbox.__filename = filename
    sandbox.module.filename = filename
    sandbox.module.paths = sandbox.modulePaths
    sandbox.fbi.logger.debug('sandbox.module.paths:\n', sandbox.module.paths)
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
    return runInVm(code, sandbox, filename, taskParams)
  } catch (err) {
    throw err
  }
}

/**
 * Run in vm
 *
 * @param {any} filename
 * @param {any} context
 * @param {any} parent
 * @returns
 */
module.exports = (filename, context, taskParams, parent) => {
  filename = path.resolve(filename)

  // If no parent or context, clear cache
  if (!context && !parent) {
    delete require.cache[filename]
    const m = require(filename)
    delete require.cache[filename]

    return m
  }
  if (typeof context !== 'object') {
    context = {}
  }

  const sandbox = vm.createContext(assign(global, context))
  return runInSandbox(filename, sandbox, taskParams, parent)
}
