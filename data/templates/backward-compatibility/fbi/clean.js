const ora = require('ora')
const rm = require('rimraf')

const spinner = ora(`Clean '${ctx.options.server.root}'`).start()

rm.sync(ctx.options.server.root)

spinner.succeed()