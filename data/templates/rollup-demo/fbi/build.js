const fs = require('fs')
const rollup = require('rollup')
const uglify = require('uglify-js')

const opts = ctx.options.rollupConfig
const _ = ctx._

// ctx.log(ctx)

rollup.rollup({
  entry: opts.entry
}).then(bundle => {
  var code = bundle.generate({
    format: opts.format,
    moduleName: 'App',
    banner: opts.banner ? banner : null
  }).code

  if (ctx.argvs[1] === '-p') {
    try {
      var minified = (opts.banner ? banner + '\n' : '') + uglify.minify(code, {
        fromString: true,
        output: {
          screw_ie8: true,
          ascii_only: true
        },
        compress: {
          pure_funcs: ['makeMap']
        }
      }).code
    } catch (e) {
      ctx.log(e)
    }
    return write(opts.out, minified)
  } else {
    return write(opts.out, code)
  }
})

function write(dest, code) {
  return new Promise((resolve, reject) => {
    try {
      fs.writeFile(dest, code, (err) => {
        if (err) return reject(err)
        ctx.log(`Output: ${dest}    ${getSize(code)}`, 1)
        resolve()
      })
    } catch (e) {
      ctx.log(e, 0)
    }
  })
}

function getSize(code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}