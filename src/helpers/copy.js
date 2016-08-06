import fs from 'fs'
import path from 'path'
import { log, exist, existSync, mkdir, readDir, copyFile,
  join, basename
} from './utils'

let ignore = []

// export default (src, dst, ign) => {
//   ignore = ign || ignore
//   copy(src, dst, walk)
// }

// // src: dir or file
// // dst: dir
// function walk(src, dst) {
//   fs.stat(src, (err, stats) => {
//     if (err) {
//       log(err
//     }

//     if (stats.isDirectory()) {
//       return fs.readdir(src, (err, files) => {
//         if (err) {
//           log(err
//         }

//         files = files.filter(f => {
//           if (ignore.includes(f)) {
//             return false
//           } else if (f[0] === '.' && ignore.includes('.')) {
//             return false
//           } else {
//             return true
//           }
//         })

//         files.map(f => {
//           let
//             _src = join(src, f),
//             _dst = join(dst, f),
//             stat = fs.statSync(_src)

//           if (stat.isDirectory()) {
//             copy(_src, _dst, walk)
//           } else {
//             _copy(_src, _dst)
//           }
//         })
//       })
//     } else {
//       return _copy(src, join(dst, path.basename(src)))
//     }
//   })
// }

// function _copy(src, dst) {
//   // const _path = path.relative(process.cwd(), dst)
//   const readable = fs.createReadStream(src)
//   const writable = fs.createWriteStream(dst)
//   readable.pipe(writable)
//   log(`copied => ${dst}`)
// }

// function copy(src, dst, cb) {
//   fs.access(dst, fs.constants.R_OK | fs.constants.W_OK, (err) => {
//     if (err) {
//       fs.mkdir(dst, () => {
//         cb(src, dst)
//       })
//     } else {
//       cb(src, dst)
//     }
//   })
// }


export default async (src, dst, ign) => {
  try {
    ignore = ign || ignore

    await copy(src, dst, walk)
  } catch (e) {
    log(e)
  }
}


// v4
async function copy(src, dst, cb) {
  try {
    const _exist = await exist(dst)
    if (!_exist) {
      fs.mkdirSync(dst)
    }
    await walk(src, dst)
  } catch (e) {
    log(e)
  }
}

async function walk(src, dst) {
  try {
    const _stats = await stats(src)
    if (_stats.isDirectory()) {
      const files = await readDir(src, ignore)
      return Promise.all(files.map(async (f) => {
        let
          _src = join(src, f),
          _dst = join(dst, f),
          stat = await stats(_src)

        if (stat.isDirectory()) {
          await copy(_src, _dst, walk)
        } else {
          copyFile(_src, _dst, true)
        }
      }))
    } else {
      return copyFile(src, join(dst, basename(src)), true)
    }
  } catch (e) {
    log(e)
  }
}

function stats(src) {
  return new Promise((resolve, reject) => {
    fs.stat(src, (err, stats) => {
      return err ? reject(err) : resolve(stats)
    })
  })
}

// function copyFile(src, dst) {
//   try {
//     // const _path = path.relative(process.cwd(), dst)
//     const readable = fs.createReadStream(src)
//     const writable = fs.createWriteStream(dst)
//     readable.pipe(writable)
//     // log(`copied => ${dst}`)
//   } catch (e) {
//     log(e)
//   }
// }