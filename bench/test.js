(function (require, ctx) {
  try {
    const rollup = require('rollup')

    const opts = {
      entry: 'src/js/app.js',
      format: 'cjs',
      out: 'dist/js/app.js'
    }

    rollup.rollup({
      entry: opts.entry
    }).then(function (bundle) {
      var code = bundle.generate({
        format: opts.format,
        moduleName: 'App',
        banner: opts.banner ? banner : null
      }).code

      return write(opts.out, code)
    })

    function write(dest, code) {
      return new Promise(function (resolve, reject) {
        fs.writeFile(dest, code, function (err) {
          if (err) return reject(err)
          console.log(blue(dest) + ' ' + getSize(code))
          resolve()
        })
      })
    }
  } catch (e) {
    console.log(e)
  }
})