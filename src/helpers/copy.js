import fs from 'fs'
import path from 'path'

let ignore = []

export default (src, dst, ign) => {
  ignore = ign ? ign : ignore
  copy(src, dst, walk)
}

// src: dir or file
// dst: dir
function walk(src, dst) {
  const type = fs.statSync(src)

  if (type.isDirectory()) {
    return fs.readdirSync(src).filter(f => {
      if (ignore.includes(f)) {
        return false
      } else if (f[0] === '.' && ignore.includes('.')) {
        return false
      } else {
        return true
      }
    }).map(f => {
      let
        _src = path.join(src, f),
        _dst = path.join(dst, f),
        stat = fs.statSync(_src),
        readable,
        writable

      if (stat.isDirectory()) {
        copy(_src, _dst, walk)
      } else {
        _copy(_src, _dst)
      }
    })
  } else {
    return _copy(src, path.join(dst, path.basename(src)))
  }
}

function _copy(src, dst) {
  let
    readable,
    writable

  readable = fs.createReadStream(src)
  writable = fs.createWriteStream(dst)
  readable.pipe(writable)

  let _path = path.relative(process.cwd(), dst)
  console.log(`copied => ${_path}`)
}

function copy(src, dst, cb) {
  try {
    fs.accessSync(dst)
    cb(src, dst)
  } catch (e) {
    fs.mkdirSync(dst)
    cb(src, dst)

    // fs.mkdir(dst, () => {
    //   cb(src, dst)
    // })
  }
}