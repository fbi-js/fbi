const fs = require('fs')
const path = require('path')
const rollup = require('rollup')
const nodemon = require('nodemon')
const rollupConfig = require('../config/rollup.config')

const glob = require('glob')

function getEntry () {
  const jsFiles = glob.sync('src/**/*.js')
  return jsFiles
}

function getFileSize (filename) {
  var stats = fs.statSync(filename)
  var fileSizeInBytes = stats['size']
  return (fileSizeInBytes / 1000).toFixed(3) + 'kb'
}

function complier (file) {
  rollupConfig.entry = file
  const dist = ctx.options.dist + file.replace('src/', '')

  rollup.rollup(rollupConfig)
    .then(bundle => {
      bundle.write(Object.assign({
        format: 'cjs',
        moduleName: '',
        moduleId: 'myModuleId',
        dest: dist,
        sourceMap: true
      }, ctx.options.rollup)
      ).then(() => {
        ctx.log(`complied:  ${dist}  ${getFileSize(dist)}`)
      })
    })
    .catch(err => {
      throw err
    })
}

module.exports = function (file) {
  let files
  let specifiedEntry = ctx.options.rollup.entry

  if (specifiedEntry) {
    // 若指定了入口文件，则只编译入口文件
    if (Array.isArray(specifiedEntry)) {
      files = specifiedEntry
    } else {
      file = specifiedEntry
      files = [file]
    }
  } else {
    // 若没指定入口文件，则编译所有js文件
    files = getEntry()
  }

  // 配置external 目的是分开输出入口文件
  rollupConfig.external = files.map(item => path.resolve(item))

  if (files.includes(file)) {
    // 在入口文件列表里的文件才会单独编译
    complier(file)
  } else {
    files.map(item => {
      complier(item)
    })
  }
  // 重启fbi s 时启动的监控服务
  nodemon.emit('restart')
}
