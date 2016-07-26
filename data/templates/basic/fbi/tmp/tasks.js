const Koa = require('koa')
const pm2 = require('pm2')

module.exports = {
  serve2: {
    desc: ' user server ',
    fn: function () {
      // const sub = require('./sub')
      this.log('this is user server', 1)
    }
  },
  build2: {
    desc: 'bbb',
    fn: function(){
      this.log('this is user build')
    }
  }
}