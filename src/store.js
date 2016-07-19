import fs from 'fs'
import * as _ from './utils'

export default class Store {

  constructor(name) {
    this.name = name
    this.root = _.dir('../../data')
    this.path = _.join(this.root, this.name + '.json')
    this.init()
  }

  get(attr) {
    return this.db[attr]
  }

  set(obj) { // { attr: 'val', attr2: 'val2' }
    Object.keys(obj).map(o => {
      this.db[o] = obj[o] // deepth: 1
    })
    this.sync()
  }

  del(attr) {
    delete this.db[attr]
    this.sync()
  }

  all() {
    return this.db
  }

  init() {
    let data
    try {
      data = require(this.path)
    } catch (e) {
      data = {}
      fs.writeFileSync(this.path, JSON.stringify(data))
    }
    this.db = data
  }

  sync() {
    const data = JSON.stringify(this.db)
    fs.writeFileSync(this.path, data)
  }

}