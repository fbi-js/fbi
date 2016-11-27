import fs from 'fs'
import os from 'os'
import util from 'util'
import path, {
  extname
} from 'path'
import {
  exec,
  spawn
} from 'child_process'
import {
  createInterface
} from 'readline'

const win = os.type() === 'Windows_NT'

/*
 * bold, italic, underline, inverse, white, grey,
 * black, blue, cyan, green, magenta, red, yellow
 */
export function colors() {
  function colorize(color, text) {
    const codes = util.inspect.colors[color]
    return `\x1b[${codes[0]}m${text}\x1b[${codes[1]}m`
  }
  const returnValue = {}
  Object.keys(util.inspect.colors).map(color => {
    returnValue[color] = text => colorize(color, text)
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
    for (var p in source) {
      if (typeof source[p] === 'object') {
        target[p] = target[p] || (Array.isArray(source[p]) ? [] : {})
        merge(target[p], source[p])
      } else {
        target[p] = source[p]
      }
    }
  })
  return target
}

export function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
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
    fs.writeFile(file, data, err => {
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

export function install2(source, rootPath, command, opts) {
  const prevDir = process.cwd()
  let pkgs = ''
  let info = ''

  Object.keys(source).map(item => {
    pkgs += `${item}@${source[item]} `
    info += `
       ${item}@${source[item]} `
  })
  info += `
       ${opts || ''}
    to:${rootPath}
  `

  process.chdir(rootPath)
  const cmd = `${command} install ${pkgs} ${opts || ''}`
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

export function install(source, rootPath, command, opts) {
  let info = ''

  const cmd = win ? command + '.cmd' : command
  const params = ['install']

  Object.keys(source).map(item => {
    params.push(`${item}@${source[item]}`)
    info += `
       ${item}@${source[item]} `
  })
  if (opts) {
    params.push(opts)
  }
  info += `
       ${opts || ''}
    to:${rootPath}
  `

  // process.chdir(rootPath)
  log(`${command} install ${info}`)

  return new Promise((resolve, reject) => {
    const installer = spawn(cmd, params, {
      cwd: rootPath,
      stdio: [0, 1, 2] // child_process log style
    })

    installer.on('error', err => {
      log(`Failed to '${cmd}'`, 0)
      reject(err)
    })

    installer.on('close', function () {
      resolve()
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

export async function mkdir(p) {
  if (await exist(p)) {
    return true
  } else {
    return new Promise((resolve, reject) => {
      fs.mkdir(p, err => err ? reject(err) : resolve())
    })
  }
}

export function rmfile(p, callback) {
  fs.lstat(p, (err, stat) => {
    if (err) callback(err)
    else if (stat.isDirectory()) rmdir(p, callback)
    else fs.unlink(p, callback)
  })
}

export function rmdir(dir, callback) {
  fs.readdir(dir, (err, files) => {
    if (err) callback(err)
    else if (files.length) {
      var i, j
      for (i = j = files.length; i--;) {
        rmfile(join(dir, files[i]), err => {
          if (err) callback(err)
          else if (--j === 0) fs.rmdir(dir, callback)
        })
      }
    } else fs.rmdir(dir, callback)
  })
}

export { extname } from 'path'

export function isTaskFile(file) {
  // log(file)
  return basename(file).indexOf('.') !== 0 &&
    extname(file) === '.js' &&
    file.indexOf('config') < 0
}

export function isTemplate(name) {
  return extname(name) === '' && name.indexOf('.') !== 0
}

export function isTaskName(item) {
  // return !['-g'].includes(item)
  return item.indexOf('-') !== 0
}

export function isAbsolute(str) {
  return /^(?:\/|(?:[A-Za-z]:)?[\\|])/.test(str)
}

export function isRelative(str) {
  return /^\.?\.\//.test(str)
}

export function normalize(str) {
  return str.replace(/\\/g, '/')
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

export function fillGap(str, max, gap) {
  gap = gap === undefined ? ' ' : gap
  if (str.length >= max) {
    return str
  } else {
    return str + gap.repeat(max - str.length)
  }
}

export function genTaskHelpTxt(all) {
  let txt = `
    Tasks:
    `
  let tasksTxt = ''
  if (Object.keys(all).length) {
    ['global', 'template', 'local'].map(type => {
      if (all[type].length) {
        all[type].map(item => {
          if (type === 'local') {
            tasksTxt += `
      ${colors().green(fillGap((item.alias ? item.alias + ', ' : '') + item.name, 15, ' '))}`
          } else {
            tasksTxt += `
      ${fillGap((item.alias ? item.alias + ', ' : '') + item.name, 15, ' ')} ${colors().grey(type === 'template' ? '-t' : '-g')}`
          }
        })
      }
    })
  }
  if (!tasksTxt) {
    tasksTxt = colors().grey(`
      No tasks, use 'fbi ata, fbi ata [name]' to add tasks.`)
  } else {
    tasksTxt = colors().grey(`
      usage: fbi [task] [-t, -g]
    `) + tasksTxt
  }

  return txt + tasksTxt
}

export function genTmplHelpTxt(all, curr, desc) {
  let txt = `

    Templates:
    `
  let tmplsTxt = ''
  if (all.length) {
    all.map(item => {
      const ext = `${item.name === curr ? colors().yellow(' <current>') : ''}`
      tmplsTxt += `
      ${colors().yellow('★')}  ${colors().green(item.name)} ${colors().blue('v' + item.version)} ${ext} ${' - ' + item.desc}`
    })
  }
  if (!tmplsTxt) {
    tmplsTxt = colors().grey(`
      No templates, use 'fbi atm' to add templates.`)
  } else {
    tmplsTxt = colors().grey(`
      usage: fbi init [template]
    `) + tmplsTxt
  }
  return txt + tmplsTxt
}

export function genNpmscriptsHelpTxt(all) {
  if (!Object.keys(all).length) {
    return ''
  }
  let txt = `

    npm scrips:
    `
  Object.keys(all).map(item => {
    txt += `
      ${item}: '${all[item]}'`
  })
  return txt
}

export function flatLog(cnt) {
  console.log(
    `

${cnt}

`
  )
}

export function indexDir(arr) {
  let ret = []
  return new Promise((resolve, reject) => {
    Promise.all(arr.map(async item => {
      if (win) {
        if (item === '*') {
          const all = await readDir(cwd())
          ret = ret.concat(all)
        } else {
          ret.push(item)
        }
      } else {
        ret.push(item)
      }
    })).then(() => {
      resolve(ret)
    })
  })
}

export function prompt(keys) {
  let
    rl = createInterface(process.stdin, process.stdout),
    prompts = typeof keys === 'string' ? [keys] : keys,
    p = 0,
    data = {}
  const get = function () {
    rl.setPrompt(prompts[p] + ': ')
    rl.prompt()
    p++
  }
  get()

  return new Promise((resolve, reject) => {
    rl.on('line', line => {
      data[prompts[p - 1]] = line
      if (p === prompts.length) {
        return rl.close()
      }
      get()
    }).on('close', () => {
      resolve(data)
    })
  })
}
