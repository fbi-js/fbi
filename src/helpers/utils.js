import util from 'util'
import path from 'path'

// util.inspect.styles

// { special: 'cyan',
//   number: 'yellow',
//   boolean: 'yellow',
//   undefined: 'grey',
//   null: 'bold',
//   string: 'green',
//   date: 'magenta',
//   regexp: 'red' }

// util.inspect.colors

// { bold: [ 1, 22 ],
//   italic: [ 3, 23 ],
//   underline: [ 4, 24 ],
//   inverse: [ 7, 27 ],
//   white: [ 37, 39 ],
//   grey: [ 90, 39 ],
//   black: [ 30, 39 ],
//   blue: [ 34, 39 ],
//   cyan: [ 36, 39 ],
//   green: [ 32, 39 ],
//   magenta: [ 35, 39 ],
//   red: [ 31, 39 ],
//   yellow: [ 33, 39 ] }

export function colors() {
  function colorize(color, text) {
    const codes = util.inspect.colors[color]
    return `\x1b[${codes[0]}m${text}\x1b[${codes[1]}m`
  }
  let returnValue = {}
  Object.keys(util.inspect.colors).map((color) => {
    returnValue[color] = (text) => colorize(color, text)
  })
  return returnValue
}

/**
 * type: 0-error, 1-succ
 */
export function log(msg, type) {
  if (typeof msg === 'string') {
    if (type !== undefined) {
      msg = type
        ? colors().grey('FBI => ') + colors().cyan(msg)
        : colors().grey('FBI Error => ') + colors().magenta(msg)
    } else {
      msg = colors().grey('FBI => ') + msg
    }
  }
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
  const arr = [].slice.call(args || [])
  return path.join.apply(null, [__dirname, '../'].concat(arr))
}

export function merge(target) {
  var sources = [].slice.call(arguments, 1)
  sources.forEach(function (source) {
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

export function validJson(data) {
  try {
    var o = JSON.parse(data)
    // JSON.parse(null) returns null, and typeof null === "object"
    if (o && typeof o === 'object') {
      return o
    }
  } catch (e) {
    return false
  }
}