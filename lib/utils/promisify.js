const util = require('util')

module.exports = fn => {
  if (util.promisify) {
    // Node v8.0+ use util.promisify
    return util.promisify(fn)
  }

  if (typeof fn !== 'function') {
    throw new TypeError('promisify must receive a function')
  }
  return function (...args) {
    return new Promise((resolve, reject) => fn(...args, (err, val) => (err ? reject(err) : resolve(val))))
  }
}
