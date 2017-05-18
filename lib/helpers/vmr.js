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

  // 如果没有指定环境变量和父模块，则清除缓存模块并加载
  if (!context && !parent) {
    delete require.cache[filename]
    const m = require(filename)
    delete require.cache[filename]

    return m
  }
  // 否则，使用指定的环境变量和父模块来载入文件
  else {
    if (typeof context !== 'object')
      context = {}

    // 复制全局变量
    const sandbox = vm.createContext(utils.merge(global, context))

    return runInSandbox(filename, sandbox, parent)
  }
}


/**
 * run in sandbox
 *
 * @param {any} filename
 * @param {any} [sandbox={}]
 * @param {any} [parent={
 *   require: require
 * }]
 * @returns
 */
const runInSandbox = (filename, sandbox = {}, parent = {
  require: require
}) => {
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
  vm.runInContext(code, sandbox, {
    filename,
    lineOffset: 0,
    displayErrors: true
  })
  return sandbox.module.exports
}