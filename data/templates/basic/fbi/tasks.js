const Koa = require('koa')
const serve = require('koa-static')
const pm2 = require('pm2')

module.exports = {
  build: {
    desc: 'build fo em',
    fn: function(){
      this.log('hahahahahah')
    }
  },
  serve: {
    desc: 'serve static files',
    fn: function () {
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