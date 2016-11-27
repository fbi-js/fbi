import fs from 'fs'
import { exist, mkdir, readDir, copyFile,
  join, basename
} from './utils'

let ignore = []

export default async (src, dst, ign) => {
  try {
    ignore = ign || ignore

    await copy(src, dst, walk)
  } catch (e) {
    throw e
  }
}

async function copy(src, dst, cb) {
  try {
    const _exist = await exist(dst)
    if (!_exist) {
      // fs.mkdirSync(dst)
      await mkdir(dst)
    }
    await walk(src, dst)
  } catch (e) {
    throw e
  }
}

async function walk(src, dst) {
  try {
    const _stats = await stats(src)
    if (_stats.isDirectory()) {
      const files = await readDir(src, ignore)
      return Promise.all(files.map(async f => {
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
    throw e
  }
}

function stats(src) {
  return new Promise((resolve, reject) => {
    fs.stat(src, (err, stats) => {
      return err ? reject(err) : resolve(stats)
    })
  })
}
