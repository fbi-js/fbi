const Koa = require('koa')
const serve = require('koa-static')
const webpack = require('webpack')
// const sub = require('./sub')

module.exports = {
  serve2: {
    desc: 'serve static files 22',
    fn: function () {
      // sub()
      this.log('this is usr server', 1)
      const svrCfg = this.options.server
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