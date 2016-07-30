import fs from 'fs'
import util from 'util'
import path from 'path'
import { exec } from 'child_process'

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

export function read(_p, charset) {
  return new Promise((resolve, reject) => {
    fs.readFile(_p, charset || 'utf8', (err, data) => {
      return err ? reject(err) : resolve(data)
    })
  })
}

export function write(file, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      return err ? reject(err) : resolve(true)
    })
  })
}

export function exist(_p, opts) {
  return new Promise((resolve, reject) => {
    fs.access(_p, opts || (fs.R_OK | fs.W_OK), err => {
      return err ? resolve(false) : resolve(true)
    })
  })
}

export function existSync(src) {
  try {
    fs.accessSync(src, fs.R_OK | fs.W_OK)
    return true
  } catch (e) {
    return false
  }
}

export function install(source, rootPath, command, opts) {
  const prevDir = process.cwd()
  let pkgs = ''

  Object.keys(source).map(item => {
    pkgs += `${item}@${source[item]} `
  })

  process.chdir(rootPath)
  const cmd = `${command} install ${pkgs} ${opts ? opts : ''}`
  log(cmd + '...')
  log(`install dest: ${rootPath}/node_modules`)
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      process.chdir(prevDir)
      if (error) {
        const msg = stderr.toString()
        log(msg, 0)
        return reject(msg)
      }

      log(stdout)
      resolve(stdout)
    })
  })
}

export function copyFile(source, target) {
  return new Promise((resolve, reject) => {
    var rd = fs.createReadStream(source)
    rd.on('error', reject)
    var wr = fs.createWriteStream(target)
    wr.on('error', reject)
    wr.on('finish', () => {
      log(`copied ${source} => ${target}`)
      resolve()
    })
    rd.pipe(wr)
  })
}

export function readDir(folder, ignore) {
  function valid(item) {
    return !ignore.includes(item)
  }
  return new Promise((resolve, reject) => {
    fs.readdir(folder, (err, ret) => {
      if (err) {
        reject(err)
      }
      if (ignore && ignore.length) {
        ret = ret.filter(valid)
      }
      resolve(ret)
    })
  })
}

export function isTaskFile(file) {
  return path.extname(file) === '.js' && file.indexOf('config') < 0
}

export function isTemplate(name) {
  return path.extname(name) === '' && name.indexOf('.') !== 0
}

export function isTaskName(item) {
  // return !['-g'].includes(item)
  return item.indexOf('-') !== 0
}

export function isAbsolute(str) {
  return /^(?:\/|(?:[A-Za-z]:)?[\\|\/])/.test(str);
}

export function isRelative(str) {
  return /^\.?\.\//.test(str);
}

export function normalize(str) {
  return str.replace(/\\/g, '/');
}

export function basename(src, ext) {
  return path.basename(src, ext)
}

/**
 * arr:
 * build -p -w serve -3000 deploy -10.11.11.1
 * prefix: -
 *
 * return

  { build: { params: [ 'p', 'w' ] },
    serve: { params: [ '3000' ] },
    deploy: { params: [ '10.11.11.1' ] }
  }

 */
export function parseArgvs(arr, prefix) {

  if (!arr.length || !prefix) {
    log('Usage: let ret = parseArgvs(arr, prefix)', 0)
    return arr
  }

  let ret = {}

  arr.reduce((prev, curr, idx) => {
    if (curr.indexOf(prefix) === 0) {
      if (ret[prev]) {
        if (Array.isArray(ret[prev]['params'])) {
          ret[prev]['params'].push(curr.slice(prefix.length))
        } else {
          ret[prev]['params'] = [curr.slice(prefix.length)]
        }
      }
      return prev
    } else {
      ret[curr] = {}
      return curr
    }
  }, arr[0])

  return ret
}