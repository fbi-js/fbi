const fs = require('fs')
const path = require('path')
ctx.next = false

// update local project settings from template
if (ctx.options.template) {
  const isAll = ctx.taskParams && (ctx.taskParams[0] === 'a' || ctx.taskParams[0] === 'all')
  const tmpl = ctx._.join(ctx.options.PATHS.global.templates, ctx.options.template)
  try {
    if (isAll) {
      // update all settings
      const files = ctx._.walk(ctx._.join(tmpl, ctx.options.PATHS.local.tasks))

      files.length && files.map(item => {
        const dst = item.substring(tmpl.length + 1)
          // const dir = path.dirname(dst)
          // if (!ctx._.existSync(dir)) {
          //   fs.mkdirSync(dir)
          // }
        ctx._.copyFile(item, dst, 1)
          .then(() => {
            ctx.log(`${dst} updated`)
          })
          .catch(err => {
            ctx.log('Update error', -1)
            ctx.log(err)
          })
      })
    } else {
      // update user only settings
      const files = ctx._.walk(ctx.options.PATHS.local.tasks)

      files.length && files.map(item => {
        ctx._.copyFile(ctx._.join(tmpl, item), item, 1)
          .then(() => {
            ctx.log(`${item} updated`)
          })
          .catch(err => {
            ctx.log('Update error', -1)
            ctx.log(err)
          })
      })
    }
  } catch (err) {
    ctx.log(err.toString(), -1)
  }
} else {
  ctx.log('It\'s not a fbi template.', -1)
}