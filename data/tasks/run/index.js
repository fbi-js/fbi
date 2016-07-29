const npm = require('global-npm')

// if (!ctx.argvs[1]) {
//   return
// }

let cmdName = ctx.argvs[1]

ctx.log(cmdName,1)

npm.load({}, function (er) {
  if (er) {
    ctx.log(er, 0)
    return
  }
  // npm.commands[npm.command](npm.argv, errorHandler)
  npm.commands.run([cmdName]);
})

// process.exit(0)