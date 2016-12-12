const copy = require('./helpers/copy')
const clean = require('./helpers/clean')
const watch = require('./helpers/watch')
const complier = require('./helpers/complier')
const nodemon = require('nodemon')

// start server
function startServer () {
  nodemon(`${ctx.options.mainFile} --config fbi/config/nodemon.json`)

  nodemon
    .on('start', () => {
      ctx.log('Service started', 1)
    })
    .on('quit', () => {
      ctx.log('Service quit', -1)
    })
    .on('restart', files => {
      ctx.log(`Service restarted`, 1)
    })
    .on('crash', () => {
      ctx.log('Service crashed for some reason', 0)
    })
}

clean()
complier()
copy()
watch()
startServer()
