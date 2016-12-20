const fs = require('fs')
const path = require('path')
const rollup = require('rollup')
const buble = require('rollup-plugin-buble')
const async = require('rollup-plugin-async')

const bubleOptions = {
  transforms: {
    arrow: false,
    classes: false,
    defaultParameter: false,
    destructuring: false,
    forOf: false,
    generator: false,
    letConst: false,
    parameterDestructuring: false,
    spreadRest: false,
    templateString: false,
  },
  objectAssign: 'Object.assign'
}

function compile(filepath, {
  compile = bubleOptions,
  generate = {
    format: 'cjs'
  }
}) {
  const rollupConfig = {
    entry: filepath,
    plugins: [
      // json(),
      async(),
      buble(compile)
    ],
    onwarn: function () {}
  }
  return new Promise((resolve, reject) => {
    rollup.rollup(rollupConfig)
      .then(bundle => {
        if (generate.dest) {
          bundle.write(generate)
            .then(ret => {
              ctx.log(`Done.`, 1)
            })
        } else {
          const result = bundle.generate(generate)
          resolve(result)
        }
      })
      .catch(err => {
        reject(err)
      })
  })
}

module.exports = compile

try {
  if (ctx.taskParams.length) {
    const compileOpts = ctx.options.compiler.compile
    let generateOpts = ctx.options.compiler.generate
    const input = ctx.taskParams[0]
    const ouput = ctx.taskParams[1]
    let srcPath = ctx._.isAbsolute(input) ? input : ctx._.cwd(input)
    srcPath = ctx._.extname(srcPath) ? srcPath : srcPath + '.js'
    let dstPath
    if (ouput) {
      dstPath = ctx._.isAbsolute(ouput) ? ouput : ctx._.cwd(ouput)
      generateOpts = Object.assign({}, generateOpts, {
        dest: dstPath
      })
    }
    compile(srcPath, {
        compile: compileOpts,
        generate: generateOpts
      })
      .then(result => {
        ctx.log('Result: \n')
        console.log(result.code)
      })
  } else {
    ctx.log('Usage: fbi compile [filepath] , fbi compile [from] [to]', -1)
  }
} catch (e) {}