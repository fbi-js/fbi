import Koa from 'koa'
import viewer from 'koa-viewer'
import serve from 'koa-static'
import { log, merge } from '../utils'
import error from './serve-error'
import cfg from '../config'

const app = new Koa()

export default async (ucfg) => {

  merge(cfg, ucfg)

  // no fbi
  if(!ucfg || cfg.type === 'normal'){
    log('serve static file')
    app.use(error())
    app.use(viewer())
  } else {
    // serve static
    app.use(serve(cfg.static.src || '.'))
  }

  app.listen(cfg.server.port, err => {
    if (err) {
      log(err)
      return
    }
    log(`Server runing at http://${cfg.server.ip}:${cfg.server.port}`)
  })
}
