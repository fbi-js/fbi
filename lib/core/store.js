const {fs, assign} = require('../utils')

module.exports = class Store {
  constructor(_path) {
    this.path = _path
    try {
      this.data = require(_path)
    } catch (err) {
      this.data = {}
    }
  }

  get(key, prefix) {
    if (prefix) {
      if (typeof prefix === 'string') {
        return this.data[prefix + key]
      } else if (Array.isArray(prefix)) {
        const ret = []
        prefix.map(p => {
          if (this.data[p + key]) {
            ret.push(this.data[p + key])
          }
          return true
        })

        return ret.length < 1 ? null : ret
      }
      return null
    }

    return key ? this.data[key] : this.data
  }

  set(key, value) {
    this.data[key] = value
    return this.sync()
  }

  del(key) {
    const keys = Array.isArray(key) ? key : [key]
    for (let i = 0, len = keys.length; i < len; i++) {
      delete this.data[keys[i]]
    }
    return this.sync()
  }

  update(key, val) {
    this.data[key] = val instanceof Object ? assign({}, this.data[key], val) : val
    return this.sync()
  }

  sync() {
    return fs.write(this.path, JSON.stringify(this.data, null, 2))
  }
}
