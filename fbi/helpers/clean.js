const rm = require('rimraf')

module.exports = function clean () {
  rm.sync(ctx.options.dist)
  ctx.log(`deleted:   ${ctx.options.dist}`)
}
