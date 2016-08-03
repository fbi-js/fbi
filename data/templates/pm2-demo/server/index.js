const Koa = require('koa')
const serve = require('koa-static')
const app = new Koa()

let port = 9000


// serve static
app.use(serve('./public/dst'))

// middleware
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// response
app.use(ctx => {
  ctx.body = 'Hello Koa'
})

// listen
app.listen(port, err => {
  if (err) {
    console.log(err)
    return
  }
  console.log(`Server runing at http://localhost:${port}`)
})
