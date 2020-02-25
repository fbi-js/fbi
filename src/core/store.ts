import { join } from 'path'
import * as fs from 'fs-extra'
import {
  git,
  isGitRepo,
  isObject,
  isValidObject,
  merge,
  isArray,
  getValueByProperty,
  setValueByProperty
} from '@fbi-js/utils'

export class Store {
  private data: any
  private filepath?: string

  constructor(name?: string, rootDirectory?: string) {
    if (name && rootDirectory) {
      this.filepath = join(rootDirectory, `${name}.json`)
    }
    this.data = {}

    this.init()
  }

  private init() {
    if (this.filepath) {
      if (fs.pathExistsSync(this.filepath)) {
        try {
          this.data = require(this.filepath)
        } catch (err) {
          this.data = {}
          this.sync()
        }
      } else {
        this.data = {}
        this.sync()
      }
    }
  }

  get(key?: string, where?: Record<string | number, any>) {
    if (!key) {
      return this.data
    }

    const data = getValueByProperty(this.data, key)
    if (isArray(data) && isValidObject(where)) {
      return data.filter((item: Record<string | number, any>) =>
        Object.entries(where as any).some(([k, v]: any) => item[k] && item[k] === v)
      )
    }

    return data
  }

  set(key: string, value: any) {
    setValueByProperty(this.data, key, value)
    return this.sync()
  }

  merge(obj: string | any, val?: any) {
    if (isObject(obj)) {
      this.data = merge(this.data, obj as any)
    } else if (typeof obj === 'string' && val) {
      const oldValue = getValueByProperty(this.data, obj)
      setValueByProperty(
        this.data,
        obj,
        (isArray(oldValue) && isArray(val)) || (isObject(oldValue) && isObject(val))
          ? merge(oldValue, val)
          : val
      )
    }
    return this.sync()
  }

  // Example:
  // this.data: {a:{ arr: [{x:1, y:2}, {x:2, y:3}, {x:3, y:1}]}}
  // del('a.arr', {x:1})
  // del('a.arr', {x:1, y:2})
  del(key: string, where?: Record<string | number, any>) {
    if (isValidObject(where)) {
      const arr = getValueByProperty(this.data, key)
      if (isArray(arr)) {
        const newArr = arr.filter((item: Record<string | number, any>) =>
          Object.entries(where as any).some(([k, v]: any) => item[k] === undefined || item[k] !== v)
        )
        setValueByProperty(this.data, key, newArr)
      }
    } else {
      setValueByProperty(this.data, key, null)
    }

    return this.sync()
  }

  sync() {
    // clean up
    for (const [key, val] of Object.entries(this.data)) {
      if (val === null || val === undefined) {
        delete this.data[key]
      }
    }
    return this.filepath ? fs.outputJSONSync(this.filepath, this.data || {}) : this.data
  }

  async listVersions(dir: string) {
    if (await isGitRepo(dir)) {
      return git.tag.list({ dir })
    }

    throw new Error(`${dir} is not a git repository`)
  }
}
