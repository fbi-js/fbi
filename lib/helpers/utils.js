const path = require('path')
const {
  extname,
} = require('path')
const {
  createInterface,
} = require('readline')
const fs = require('fs')
const os = require('os')
const {
  spawn,
} = require('child_process')
const util = require('util')
const win = os.type() === 'Windows_NT'

/*
 * bold, italic, underline, inverse, white, grey,
 * black, blue, cyan, green, magenta, red, yellow
 */
function colorize(color, text) {
  const codes = util.inspect.colors[color]
  return `\x1b[${codes[0]}m${text}\x1b[${codes[1]}m`
}
const style = {}
Object.keys(util.inspect.colors).map(c => {
  style[c] = text => colorize(c, text)
})

/**
 * Log
 *
 * @export
 * @param {string} msg message to log
 * @param {number} type -2:error, -1:warning, 0:info, 1:success, 2:bold
 */
function log(msg, type) {
  if (typeof msg === 'string') {
    const prefix = style.grey('FBI ··> ')
    if (type !== undefined) {
      switch (type) {
        case -2:
          msg = prefix + style.red(msg)
          break
        case -1:
          msg = prefix + style.yellow(msg)
          break
        case 0:
          msg = prefix + style.cyan(msg)
          break
        case 1:
          msg = prefix + style.green(msg)
          break
        case 2:
          msg = prefix + style.bold(msg)
          break
        default:
          try {
            msg = prefix + color[type] ? color[type](msg) : msg
          } catch (err) {
            msg = prefix + msg
          }
      }
    } else {
      msg = prefix + msg
    }
  }
  console.log(msg)
}

function cwd(...args) {
  const arr = [].slice.call(args || [])
  return path.join.apply(null, [process.cwd()].concat(arr))
}

function join(...args) {
  const arr = [].slice.call(args || [])
  return path.join.apply(null, arr)
}

function dir(...args) {
  const arr = [].slice.call(args || [])
  return path.join.apply(null, [__dirname, '../'].concat(arr))
}

function merge(target) {
  var sources = [].slice.call(arguments, 1)
  sources.forEach(function (source) {
    for (var p in source) {
      if (typeof source[p] === 'object') {
        if ((target[p] === null || target[p] === undefined) && (source[p] === null || source[p] === undefined)) {
          target[p] = null
        } else {
          target[p] = target[p] || (Array.isArray(source[p]) ? [] : {})
        }
        // target[p] = target[p] || (Array.isArray(source[p]) ? [] : {})
        merge(target[p], source[p])
      } else {
        target[p] = source[p]
      }
    }
  })
  return target
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function validJson(data) {
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

function read(_p, charset) {
  return new Promise((resolve, reject) => {
    fs.readFile(_p, charset || 'utf8', (err, data) => {
      return err ? reject(err) : resolve(data)
    })
  })
}

function write(file, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, err => {
      return err ? reject(err) : resolve(true)
    })
  })
}

function exist(_p, opts) {
  return new Promise((resolve, reject) => {
    fs.access(_p, opts || (fs.R_OK | fs.W_OK), err => {
      return err ? resolve(false) : resolve(true)
    })
  })
}

function existSync(src) {
  try {
    fs.accessSync(src, fs.R_OK | fs.W_OK)
    return true
  } catch (e) {
    return false
  }
}

function install(source, rootPath, command, opts, msg) {
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
  info += ` ${opts || ''} to ${rootPath}
  `
  log(`${command} install ${info}`)

  return new Promise((resolve, reject) => {
    const installer = spawn(cmd, params, {
      cwd: rootPath,
      stdio: 'inherit' // child_process log style
    })

    installer.on('error', err => {
      log(`Failed to '${cmd} ${params.join(' ')}'`, -2)
      log(err, -2)
      reject(err)
    })

    installer.on('close', code => {
      if (code) {
        // fail
        reject(msg + ' fail.')
      } else {
        // success
        msg && log(msg + ' success.', 1)
        resolve()
      }
    })
  })
}

function copyFile(source, target, quiet) {
  const dir = path.dirname(target)
  if (!existSync(dir)) {
    fs.mkdirSync(dir)
  }
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

function readDir(folder, ignore) {
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

async function mkdir(p) {
  if (await exist(p)) {
    return true
  } else {
    return new Promise((resolve, reject) => {
      fs.mkdir(p, err => err ? reject(err) : resolve())
    })
  }
}

function rmfile(p, callback) {
  fs.lstat(p, (err, stat) => {
    if (err) callback(err)
    else if (stat.isDirectory()) rmdir(p, callback)
    else fs.unlink(p, callback)
  })
}

function rmdir(dir, callback) {
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

function isEmptyDir(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      return err ? resolve(false) : resolve(!files.length)
    })
  })
}

function isTaskFile(file) {
  return basename(file).indexOf('.') !== 0 && extname(file) === '.js' && file.indexOf('config') < 0
}

function isTemplate(name) {
  return extname(name) === '' && name.indexOf('.') !== 0
}

function isTaskName(item) {
  // return !['-g'].includes(item)
  return item.indexOf('-') !== 0
}

function isAbsolute(str) {
  return /^(?:\/|(?:[A-Za-z]:)?[\\|])/.test(str)
}

function isRelative(str) {
  return /^\.?\.\//.test(str)
}

function normalize(str) {
  return str.replace(/\\/g, '/')
}

function basename(src, ext) {
  return path.basename(src, ext)
}

function fixModuleName(mod) {
  const ext = extname(mod)
  if (!ext || (ext !== '.js' && ext !== '.json' && ext !== '.node')) {
    return mod + '.js'
  } else {
    return mod
  }
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
function parseArgvs(arr, prefix) {
  if (!arr || !arr.length || !prefix) {
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
    } else if (curr.indexOf('/') >= 0 || ['.js', '.json'].includes(path.extname(curr))) {
      // not a task name
      if (ret[prev]) {
        if (Array.isArray(ret[prev]['params'])) {
          ret[prev]['params'].push(curr)
        } else {
          ret[prev]['params'] = [curr]
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

function fillGap(str, max, gap) {
  gap = gap === undefined ? ' ' : gap
  if (str.length >= max) {
    return str
  } else {
    return str + gap.repeat(max - str.length)
  }
}

function genTaskHelpTxt(all) {
  let txt = `
    Tasks:
    `
  let tasksTxt = ''
  if (Object.keys(all).length) {
    ['global', 'template', 'local'].map(type => {
      if (all[type].length) {
        all[type].map(item => {
          switch (type) {
            case 'global':
              {
                //           const existInLocal = all.local.find(p => p.name === item.name)
                //           const existInTmpl = all.template.find(p => p.name === item.name)
                //           if (!existInLocal && !existInTmpl) {
                //             // highlight
                //             tasksTxt += `
                // ${style.green(fillGap((item.alias ? item.alias + ', ' : '') + item.name, 15, ' '))}`
                //           } else {
                tasksTxt += `
      ${fillGap((item.alias ? item.alias + ', ' : '') + item.name, 15, ' ')} ${style.grey('-g')}`
                // }
              }
              break
            case 'template':
              {
                const existInLocal = all.local.find(p => p.name === item.name)
                if (!existInLocal) {
                  // highlight
                  tasksTxt += `
      ${style.green(fillGap((item.alias ? item.alias + ', ' : '') + item.name, 15, ' '))}`
                } else {
                  tasksTxt += `
      ${fillGap((item.alias ? item.alias + ', ' : '') + item.name, 15, ' ')} ${style.grey('-t')}`
                }
              }
              break
            case 'local':
              {
                tasksTxt += `
      ${style.green(fillGap((item.alias ? item.alias + ', ' : '') + item.name, 15, ' '))}`
              }
              break
          }

          //     if (type === 'template') {
          //       const existInLocal = all.local.find(p => p.name === item.name)
          //       if (!existInLocal) {
          //         // highlight
          //         tasksTxt += `
          // ${style.green(fillGap((item.alias ? item.alias + ', ' : '') + item.name, 15, ' '))}`
          //       } else {
          //         tasksTxt += `
          // ${fillGap((item.alias ? item.alias + ', ' : '') + item.name, 15, ' ')} ${style.grey('-t')}`
          //       }
          //     } else if (type === 'local') {
          //       tasksTxt += `
          // ${style.green(fillGap((item.alias ? item.alias + ', ' : '') + item.name, 15, ' '))}`
          //     } else {
          //       tasksTxt += `
          // ${fillGap((item.alias ? item.alias + ', ' : '') + item.name, 15, ' ')} ${style.grey('-g')}`
          //     }
        })
      }
    })
  }
  if (!tasksTxt) {
    tasksTxt = style.grey(`
      No task, use 'fbi ata, fbi ata [name]' to add tasks.`)
  } else {
    tasksTxt = style.grey(`
      usage: fbi task [-t, -g]
    `) + tasksTxt
  }

  return txt + tasksTxt
}

function genTmplHelpTxt(all, curr, desc) {
  let txt = `

    Templates:
    `
  let tmplsTxt = ''
  if (all.length) {
    all.map(item => {
      const current = `${item.name === curr ? style.yellow('★') : '★'}`
      tmplsTxt += `
      ${current}  ${style.green(item.name)} ${style.blue('v' + item.version)} ${item.desc ? ' - ' + item.desc : ''}`
    })
  }
  if (!tmplsTxt) {
    tmplsTxt = style.grey(`
      No template, use 'fbi atm' to add templates.`)
  } else {
    tmplsTxt = style.grey(`
      usage: fbi init template
    `) + tmplsTxt
  }
  return txt + tmplsTxt
}

function genNpmscriptsHelpTxt(all) {
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

function flatLog(cnt) {
  console.log(
    `
${cnt}

`
  )
}

function indexDir(arr) {
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

function ask(question) {
  const r = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  })
  return new Promise((resolve, reject) => {
    r.question(question, answer => {
      r.close()
      resolve(answer)
    })
  })
}

function prompt(keys) {
  let
    rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    }),
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

// Depth first
function walk(dir, ignore) {
  const list = []
  ignore = ignore || []
  ignore = Array.isArray(ignore) ? ignore : [ignore]
  dir = dir.endsWith(path.sep) ? dir.substring(0, dir.length - 1) : dir

  function valid(item) {
    return !ignore.includes(item)
  }

  function walker(dir) {
    try {
      fs.readdirSync(dir).map(item => {
        if (!valid(item)) {
          return
        }
        const curr = `${dir}/${item}`
        if (fs.statSync(curr).isDirectory()) {
          walker(curr)
        } else {
          list.push(curr)
        }
      })
    } catch (err) {
      throw err
    }
  }
  walker(dir)
  return list
}

function sequenceTasks(tasks) {
  function recordValue(results, value) {
    results.push(value)
    return results
  }
  const pushValue = recordValue.bind(null, [])
  return tasks.reduce((promise, task) => {
    return promise.then(task).then(pushValue)
  }, Promise.resolve())
}

module.exports = {
  style,
  log,
  cwd,
  join,
  dir,
  merge,
  clone,
  validJson,
  read,
  write,
  exist,
  existSync,
  install,
  copyFile,
  readDir,
  mkdir,
  rmfile,
  rmdir,
  isEmptyDir,
  extname,
  isTaskFile,
  isTemplate,
  isTaskName,
  isAbsolute,
  isRelative,
  normalize,
  basename,
  fixModuleName,
  parseArgvs,
  fillGap,
  genTaskHelpTxt,
  genTmplHelpTxt,
  genNpmscriptsHelpTxt,
  flatLog,
  indexDir,
  ask,
  prompt,
  walk,
  sequenceTasks,
}