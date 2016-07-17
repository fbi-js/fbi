import http from 'http'
import Koa from 'koa'
import viewer from 'koa-viewer'
import serve from 'koa-static'
import { log, merge } from '../utils'
import error from './serve-error'
import cfg from '../config'

const app = new Koa()
let serverStarted = false

function listen(app, port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app.callback())
    server.on('error', err => {
      if (err.code === 'EADDRINUSE') { // port in use
        reject(err)
      }
    })
    server.listen(port, () => {
      resolve(server.address().port)
    })
  })
}

export default async (ucfg) => {

  merge(cfg, ucfg)

  // no fbi
  if (!ucfg || cfg.type === 'normal') {
    log('This is not a fbi project, serve current folder.')
    app.use(error())
    app.use(viewer())
  } else {
    // serve static
    app.use(serve(cfg.static.src || '.'))
  }

  // find an available port & start the server
  let port = cfg.server.port
  while (!serverStarted) {
    try {
      let p = await listen(app, port)
      serverStarted = true
      log(`Server runing at http://${cfg.server.ip}:${p}`)
      break
    } catch (e) {
      log(`Warning: port '${e.port}' in use, trying to find a available one...`)
      port = 0
    }
  }

}
