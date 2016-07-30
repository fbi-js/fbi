import fs from 'fs'
import util from 'util'
import path from 'path'
import { exec } from 'child_process'

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
 * type:
 * -1 waring, 0 error, 1 succ
 * bold, italic, underline, inverse, white, grey,
 * black, blue, cyan, green, magenta, red, yellow
 */
export function log(msg, type) {
  if (typeof msg === 'string') {
    if (type !== undefined) {
      switch (type) {
        case -1:
          msg = colors().grey('FBI => ') + colors().red(msg)
          break
        case 0:
          msg = colors().grey('FBI Error => ') + colors().magenta(msg)
          break
        case 1:
          msg = colors().grey('FBI => ') + colors().cyan(msg)
          break
        default:
          msg = colors().grey('FBI => ') + colors()[type]
            ? colors()[type](msg)
            : msg
      }
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
  let info = ''

  Object.keys(source).map(item => {
    pkgs += `${item}@${source[item]} `
    info += `
       ${item}@${source[item]} `
  })
  info += `
       ${opts ? opts : ''}
  ...
  `;

  process.chdir(rootPath)
  const cmd = `${command} install ${pkgs} ${opts ? opts : ''}`
  log(`${command} install ${info}`)
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      process.chdir(prevDir)
      if (error) {
        const msg = stderr.toString()
        log(msg, 0)
        return reject(msg)
      }

      log(`
${stdout}`)
      resolve(stdout)
    })
  })
}

export function copyFile(source, target, quiet) {
  return new Promise((resolve, reject) => {
    var rd = fs.createReadStream(source)
    rd.on('error', reject)
    var wr = fs.createWriteStream(target)
    wr.on('error', reject)
    wr.on('finish', () => {
      if (!quiet) {
        log(`copied ${source} => ${target}`)
      }
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

export function mkdir(p) {
  return new Promise((resolve, reject) => {
    fs.mkdir(p, err => {
      return err ? reject(err) : resolve()
    })
  })
}

export function rmfile(p, callback) {
  fs.lstat(p, (err, stat) => {
    if (err) callback.call(null, err)
    else if (stat.isDirectory()) rmdir(p, callback)
    else fs.unlink(p, callback)
  })
}

export function rmdir(dir, callback) {
  fs.readdir(dir, (err, files) => {
    if (err) callback.call(null, err)
    else if (files.length) {
      var i, j
      for (i = j = files.length; i--;) {
        rmfile(join(dir, files[i]), err => {
          if (err) callback.call(null, err)
          else if (--j === 0) fs.rmdir(dir, callback)
        })
      }
    }
    else fs.rmdir(dir, callback)
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

export function genTaskHelpTxt(all) {
  if (!Object.keys(all).length) {
    return ''
  }
  let txt = `
    Tasks:
    `;
  ['global', 'template', 'local'].map(type => {
    if (all[type].length) {
      all[type].map(item => {
        txt += `
      ${item.name} ${item.alias} <${type}>`;
      })
    }
  })
  return txt
}

export function genTmplHelpTxt(all) {
  if (!all.length) {
    return ''
  }
  let txt = `

    Templates:
    `;
  all.map(item => {
    txt += `
      ${item}`;
  })
  return txt
}

export function genNpmscriptsHelpTxt(all) {
  if (!Object.keys(all).length) {
    return ''
  }
  let txt = `

    npm scrips:
    `;
  Object.keys(all).map(item => {
    txt += `
      ${item}: '${all[item]}'`;
  })
  return txt
}