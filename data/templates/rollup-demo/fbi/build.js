/**
 * global vars:
 * ctx => fbi
 * require => requireResolve
 */
const fs = require('fs')
const rollup = require('rollup')
const uglify = require('uglify-js')
const babel = require('rollup-plugin-babel')
const postcss = require('rollup-plugin-postcss')
const precss = require('precss')
const autoprefixer = require('autoprefixer')
const es2015Rollup = require('babel-preset-es2015-rollup')
const asyncToPromises = require('babel-plugin-async-to-promises')

const _ = ctx._

// ctx.log(ctx)

let cache

let opts = {
  entry: 'src/js/app.js',
  format: 'iife', // amd cjs es iife umd
  plugins: [
    postcss({
      plugins: [
        precss(),
        autoprefixer({
          "browsers": ["last 2 versions", "> 5%", "safari >= 5", "ie >= 8", "opera >= 12", "Firefox ESR", "iOS >= 6", "android >= 4"]
        })
      ],
      extensions: ['.css', '.sss']  // default value
      // parser: sugarss
    }),
    babel({
      presets: [es2015Rollup],
      plugins: [asyncToPromises]
    })
  ],
  out: 'dst/js/app.js'
}

const dst = opts.out.split('/')[0]

const isProduction = ctx.taskParams && ctx.taskParams[0] === 'p' // fbi build -p

if (isProduction) {
  ctx.log('Env: production')
}

try {
  fs.accessSync(dst)
} catch (e) {
  fs.mkdirSync(dst)
  fs.mkdirSync(dst + '/js')
}

rollup.rollup({
  entry: opts.entry,
  plugins: opts.plugins,
  cache: cache
})
  .then(bundle => {
    var code = bundle.generate({
      format: opts.format,
      moduleName: 'App',
      banner: opts.banner ? banner : null
    }).code

    cache = bundle

    if (isProduction) {
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

      // bundle.write({
      //   format: opts.format,
      //   dest: opts.out,
      //   sourceMap: true
      // })
    }
  })
  .catch(e => {
    ctx.log(e, 0)
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