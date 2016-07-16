import { STATUS_CODES } from 'http'

export default () => {
  return async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      ctx.app.emit('error', err, ctx)

      ctx.status = ctx.status || 500
      ctx.type = 'application/json'
      ctx.body = {
        code: STATUS_CODES[ctx.status],
        message: err.message
      }
    }
  }
}
