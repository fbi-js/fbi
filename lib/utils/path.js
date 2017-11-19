const path = require('path')

function isAbsolute(str) {
  return /^(?:\/|(?:[A-Za-z]:)?[\\|])/.test(str)
}

function isRelative(str) {
  return /^\.?\.\//.test(str)
}

function normalize(str) {
  return str.replace(/\\/g, '/')
}

function cwd(...args) {
  return path.join.apply(null, [process.cwd()].concat(args))
}

function join(...args) {
  return path.join.apply(null, args)
}

function dir(...args) {
  return path.join.apply(null, [__dirname, '../'].concat(args))
}

module.exports = {
  isAbsolute,
  isRelative,
  normalize,
  cwd,
  join,
  dir
}
