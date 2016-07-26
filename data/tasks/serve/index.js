const http = require('http');
const Koa = require('koa')
const serve = require('koa-static')
const app = new Koa()

// ctx is FBI Cli
// ctx.log(ctx)

var start = 8888

// serve static
app.use(serve(process.cwd()))

// auto selected a valid port & start server
function autoPortServer(cb) {
  var port = start
  start += 1
  var server = http.createServer(app.callback())

  server.listen(port, err => {
    server.once('close', () => {
      app.listen(port, err => {
        if (err) {
          ctx.log(err)
          return
        }
        cb(port)
      })
    })
    server.close()
  })
  server.on('error', err => {
    autoPortServer(cb)
  })
}

// listen
autoPortServer(port => {
  ctx.log(`Server runing at http://localhost:${port}`, 1)
})