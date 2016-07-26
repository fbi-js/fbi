
console.log(111)
const http = require('http')
// const Koa = require('koa')
// const serve = require('koa-static')

// const svrCfg = this.options.server
// var start = svrCfg.port || 8888
// const app = new Koa()

// // serve static
// app.use(serve(process.cwd()))

// // auto selected a valid port & start server
// function autoPortServer(cb) {
//   var port = start
//   start += 1
//   var server = http.createServer(app.callback())

//   server.listen(port, err => {
//     server.once('close', () => {
//       app.listen(port, err => {
//         if (err) {
//           this.log(err)
//           return
//         }
//         cb(port)
//       })

//     })
//     server.close()
//   })
//   server.on('error', err => {
//     autoPortServer(cb)
//   })
// }

// // listen
// autoPortServer(port => {
//   this.log(`Server runing at http://${svrCfg.protocol}:${port}`, 1)
// })