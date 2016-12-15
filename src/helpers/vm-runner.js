import * as _ from './utils'

import Module from 'module'
import fs from 'fs'
import path from 'path'
import vm from 'vm'

export default function vmRunner (file, sandbox = {} , parent = {
  require: require
}) {
  sandbox = Object.assign({}, global, sandbox)
  sandbox.module = new Module(file, parent)
  sandbox.exports = sandbox.module.exports
  sandbox.__dirname = path.dirname(file)
  sandbox.__filename = file
  sandbox.module.filename = file
  sandbox.module.paths = sandbox.modulePaths.concat(
    Module._nodeModulePaths(sandbox.__dirname)
  )
  sandbox.global = sandbox
  sandbox.require = function (filepath) {
    try {
      const fullpath = sandbox.require.resolve(filepath)
      if (!fullpath.includes('node_modules') && fullpath.includes(path.sep)) {
        // FBI task file
        return vmRunner(fullpath, sandbox)
      } else {
        const ret = parent.require(fullpath)
        return ret
      }
    } catch (err) {
      console.log(err)
    }
  }
  sandbox.require.resolve = function (request) {
    return Module._resolveFilename(request, sandbox.module)
  }
  sandbox.require.main = process.mainModule
  sandbox.require.extensions = Module._extensions
  sandbox.require.cache = Module._cache

  if (path.extname(file) === '.js') {
    // get code
    const code = fs.readFileSync(file, 'utf8')

    // run code
    const ctx = vm.createContext(sandbox)
    vm.runInContext(code, ctx, {
      filename: file,
      lineOffset: 0,
      displayErrors: true
    })

    return sandbox.module.exports
  } else {
    return require(file)
  }
}
