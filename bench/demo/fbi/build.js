try {
  var rollup = require('rollup');

  var cwd = process.cwd()
  ctx.log(rollup.rollup.toString())

  // used to track the cache for subsequent bundles
  var cache;

  rollup.rollup({
    entry: 'src/index.js',
    cache: cache
  }).then(function (bundle) {

    log('then')
    var result = bundle.generate({
      // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
      format: 'cjs'
    });

    // Cache our bundle for later use (optional)
    cache = bundle;

    fs.writeFileSync('bundle.js', result.code);

    // Alternatively, let Rollup do it for you
    // (this returns a promise). This is much
    // easier if you're generating a sourcemap
    bundle.write({
      format: 'cjs',
      dest: 'dst/bundle.js'
    });
  })

} catch (e) {
  ctx.log(e)
}