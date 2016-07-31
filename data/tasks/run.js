ctx.next = false

// ctx.log(ctx)

const npm = require('global-npm')

let cmdName = ctx.argvs[1]

if (cmdName) {
  ctx.log(`npm script: ${cmdName}`, 1)

  npm.load({}, function (er) {
    if (er) {
      ctx.log(er, 0)
      return
    }
    // npm.commands[npm.command](npm.argv, errorHandler)
    npm.commands.run([cmdName]);
  })

  // process.exit(0)
} else {
  ctx.log('Usage: fbi new [npm script name]', 0)
}