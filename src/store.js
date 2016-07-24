import fs from 'fs'
import {dir, join} from './helpers/utils'

// json files storage
export default class Store {

  constructor(name) {
    this.name = name
    this.root = dir('data')
    this.path = join(this.root, this.name + '.json')
    this.init()
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

  get(attr) {
    return this.db[attr]
  }

  set(obj) { // { attr: 'val', attr2: 'val2' }

    if (Array.isArray(obj)) {
      for (const item of obj) {
        Object.keys(item).map(o => {
          this.db[o] = obj[o] // deepth: 1
        })
      }
    } else {
      Object.keys(obj).map(o => {
        this.db[o] = obj[o] // deepth: 1
      })
    }

    this.sync()
  }

  del(attr) {
    delete this.db[attr]
    this.sync()
  }

  all() {
    return this.db
  }

  sync() {
    const data = JSON.stringify(this.db)
    fs.writeFileSync(this.path, data)
  }

}