const params1 = ctx.task.getParams()
const params2 = ctx.task.getParams('get-params')
const params3 = ctx.task.getParams('get-params', 't')
console.log(params2)