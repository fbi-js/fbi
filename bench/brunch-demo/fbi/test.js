const brunch = require('brunch')

ctx.log(brunch.build.toString())

const build = brunch.watch('../brunch-config.js')

build()