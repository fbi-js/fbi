const watch = require('watch')
const complier = require('./config/complier')(require, ctx)

watch.watchTree('src/', (f, curr, prev) => {
  if (typeof f == "object" && prev === null && curr === null) {
    // Finished walking the tree, complie all
    complier()
  } else if (prev === null) {
    // f is a new file, complie all
    complier()
  } else if (curr.nlink === 0) {
    // f was removed, complie all
    complier()
  } else {
    // f was changed
    if (ctx.options.rollup.entry.includes(f.replace('src/', ''))) {
      // f is entry, complie it
      complier(f)
    } else {
      // f is not entry, complie all
      complier()
    }
  }
})