const fs = require('fs')
const vm = require('vm')
const path = require('path')
const Module = require('module')
const {assign} = require('../utils')

module.exports = function vmr(filepath, context, parent = {require}) {
  const sandbox = vm.createContext(Object.assign(global, context))
  sandbox.__filename = filepath
  sandbox.__dirname = path.dirname(filepath)
  sandbox.module = new Module(filepath, parent)
  sandbox.module.paths = sandbox.ctx.nodeModulesPaths
  sandbox.module.filename = filepath

  sandbox.require = function(_filepath) {
    const realpath = sandbox.require.resolve(_filepath)
    return parent.require(realpath)
  }
  
  sandbox.require.resolve = request => {
    return Module._resolveFilename(request, sandbox.module)
  }

  sandbox.require.main = process.mainModule
  sandbox.require.extensions = Module._extensions
  sandbox.require.cache = Module._cache

  const code = fs.readFileSync(filepath, 'utf8')
  const wrapCode = `
  process.env.NODE_PATH = '${sandbox.module.paths.join(path.delimiter)}';
  require('module').Module._initPaths();
  ${code}
    `
  const result = vm.runInNewContext(wrapCode, sandbox, {
    filename: filepath,
    lineOffset: -3,
    displayErrors: true,
    timeout: sandbox.ctx.configs.TASK_TIMEOUT || 5 * 60 * 1000 // 5min
  })
  return result || sandbox.module.exports
}
