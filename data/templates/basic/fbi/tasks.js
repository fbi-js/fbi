const Koa = require('koa')
const serve = require('koa-static')

module.exports = {
  serve: {
    desc: 'serve static files',
    fn: function () {
      const svrCfg = this.config.server
      const app = new Koa()
      app.use(serve(process.cwd()))
      // 监听
      app.listen(svrCfg.port || 3000, err => {
        if (err) {
          this.log(err)
          return
        }
        this.log(`Server runing at http://${svrCfg.protocol}:${svrCfg.port}`, 1)
      })
    }
  }
}