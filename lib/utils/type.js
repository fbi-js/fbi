const path = require('path')
const pathUtil = require('./path')

function isJson (data) {
  try {
    if (!isNaN(data)) {
      return false
    }

    if (data instanceof RegExp) {
      return false
    }

    if (data && typeof data === 'object') {
      return Boolean(data)
    }

    // JSON.parse(null) returns null, and typeof null === "object"
    const o = JSON.parse(data)
    if (o && typeof o === 'object') {
      return Boolean(o)
    }
    return false
  } catch (err) {
    return false
  }
}

function isObject (data) {
  return Boolean(typeof data === 'object')
}

function isArray (data) {
  return Boolean(Array.isArray(data))
}

function isTaskFile (file) {
  if (!file || typeof file !== 'string') {
    return false
  }
  return (
    path.basename(file).indexOf('.') !== 0 &&
    path.extname(file) === '.js' &&
    file.indexOf('options') < 0
  )
}

function isPath (string) {
  return pathUtil.isAbsolute(string) || pathUtil.isRelative(string)
}

function isGitUrl (string) {
  return /^(git|http|https)(.*?)\.git$/.test(string)
}

module.exports = {
  isJson,
  isObject,
  isArray,
  isTaskFile,
  isPath,
  isGitUrl
}
