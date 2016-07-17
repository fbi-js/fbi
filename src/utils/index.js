import fs from 'fs'
import path from 'path'

export function log (msg) {
  console.log(msg)
}

export function cwd(...args) {
  const arr = [].slice.call(args || [])
  return path.join.apply(null, [process.cwd()].concat(arr))
}

export function join(...args) {
  const arr = [].slice.call(args || [])
  return path.join.apply(null, arr)
}

export function dir(...args) {
  console.log('__dirname: ' + __dirname)
  const arr = [].slice.call(args || [])
  return path.join.apply(null, [__dirname].concat(arr))
}

export function exist(src) {
  return new Promise((resolve, reject) => {
    fs.access(cwd(src), fs.R_OK | fs.W_OK, err => {
      return err ? resolve(false) : resolve(true)
    })
  })
}

export function merge(target) {
  var sources = [].slice.call(arguments, 1)
  sources.forEach(function(source) {
    for (var p in source)
      if (typeof source[p] === 'object') {
        target[p] = target[p] || (Array.isArray(source[p]) ? [] : {})
        merge(target[p], source[p])
      } else {
        target[p] = source[p]
      }
  })
  return target
}

export async function isfbi (src) {
  let ret = await fsp.exist(src)
  return ret ? require(cwd(src)) : ret
}