import * as _ from './utils'

import Module from 'module'
import fs from 'fs'
import path from 'path'
import vm from 'vm'

// export default function vmRunner(file, sandbox = {}, parent = {
//   require: require
// }) {
//   sandbox = Object.assign({}, global, sandbox)
//   sandbox.module = new Module(file, parent)
//   sandbox.exports = sandbox.module.exports
//   sandbox.__dirname = path.dirname(file)
//   sandbox.__filename = file
//   sandbox.module.filename = file
//   sandbox.module.paths = sandbox.modulePaths.concat(
//     Module._nodeModulePaths(sandbox.__dirname)
//   )
//   sandbox.global = sandbox
//   sandbox.require = function (filepath) {
//     try {
//       const fullpath = sandbox.require.resolve(filepath)
//       if (!fullpath.includes('node_modules') && fullpath.includes(path.sep)) {
//         // FBI task file
//         return vmRunner(fullpath, sandbox)
//       } else {
//         const ret = parent.require(fullpath)
//         return ret
//       }
//     } catch (err) {
//       console.log(err)
//     }
//   }
//   sandbox.require.resolve = function (request) {
//     return Module._resolveFilename(request, sandbox.module)
//   }
//   sandbox.require.main = process.mainModule
//   sandbox.require.extensions = Module._extensions
//   sandbox.require.cache = Module._cache

//   if (path.extname(file) === '.js') {
//     // get code
//     const code = fs.readFileSync(file, 'utf8')

//     // run code
//     const ctx = vm.createContext(sandbox)
//     vm.runInContext(code, ctx, {
//       filename: file,
//       lineOffset: 0,
//       displayErrors: true
//     })

//     return sandbox.module.exports
//   } else {
//     return require(file)
//   }
// }

function runInVm (code, file, sandbox) {
  try {
    const ctx = vm.createContext(sandbox)
    vm.runInContext(code, ctx, {
      filename: file,
      lineOffset: 0,
      displayErrors: true
    })

    return sandbox.module.exports
  } catch (err) {
    _.log(err, -2)
    process.exit(0)
  }
}

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
      if (err.code === 'MODULE_NOT_FOUND') {
        _.log(`${err.name}: ${err.message}, try 'fbi i${sandbox.taskType}' to install dependencies.`, -2)
        process.exit(0)
      }
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
    let code
    let compilerName
    let compilerFile
    let compiler
    if (sandbox.ctx.options.compiler) {
      compilerName = sandbox.ctx.options.compiler.name
      compilerFile = _.join(
        sandbox.ctx.options.DATA_TASKS,
        sandbox.ctx.options.paths.tasks,
        compilerName + '.js'
      )
    }
    if (compilerName && _.basename(file, '.js') !== compilerName) {
      if (_.existSync(compilerFile)) {
        try {
          compiler = require(compilerFile)

          _.log(`Using compiler '${compilerName}'...`, 0)

          compiler(file, {
            compile: sandbox.ctx.options.compiler.compile,
            generate: sandbox.ctx.options.compiler.generate
          }).then(result => runInVm(result.code, file, sandbox))
        } catch (err) {
          if (err.code === 'MODULE_NOT_FOUND') {
            _.log(`${err.name}: ${err.message} in '${compilerName}', try 'fbi i -g' to install task dependencies.`, -2)
            process.exit(0)
          }
        }
      } else {
        _.log(`Compiler '${compilerName}' not found, running as normal way...`, -1)
        code = fs.readFileSync(file, 'utf8')
        return runInVm(code, file, sandbox)
      }
    } else {
      code = fs.readFileSync(file, 'utf8')
      return runInVm(code, file, sandbox)
    }
  } else {
    return require(file)
  }
}
