import fs from 'fs-extra'
import assert from 'assert'
import { isAbsolute, extname } from 'path'
import {
  isObject,
  isValidObject,
  merge,
  isArray,
  getObjectValue,
  setObjectValue,
  orderBy
} from '../utils'

export class Store {
  private data: Record<string, any> = {}

  constructor (readonly filepath?: string) {
    if (filepath) {
      assert(
        isAbsolute(filepath),
        `store filepath should be an absolute path. recived "${filepath}"`
      )
      assert(
        extname(filepath) === '.json',
        `store file's extname should be ".json". recived "${extname(filepath)}"`
      )
      this.init()
    }
  }

  private init () {
    if (this.filepath) {
      const oldData = fs.readJsonSync(this.filepath, { throws: false })
      if (oldData) {
        this.data = oldData
      } else {
        fs.outputJsonSync(this.filepath, this.data)
      }
    }
  }

  get (key?: string, where?: Record<string | number, any>) {
    if (!key) {
      return this.data
    }

    const data = getObjectValue(this.data, key)
    if (isArray(data) && isValidObject(where)) {
      return data.filter((item: Record<string | number, any>) =>
        Object.entries(where as any).some(
          ([k, v]: any) => item[k] && item[k] === v
        )
      )
    }

    return data
  }

  find (
    where: Record<string | number, any>,
    key?: string,
    order?: Record<string, any>
  ) {
    const data = key ? getObjectValue(this.data, key) : this.data

    const result: Record<string, any>[] = Object.values(
      data
    ).filter((item: Record<string | number, any>) =>
      Object.entries(where as any).some(
        ([k, v]: any) => item[k] && item[k] === v
      )
    )

    return order ? orderBy(result, order.props, order.orders) : result
  }

  set (key: string, value: any) {
    setObjectValue(this.data, key, value)
    return this.sync()
  }

  merge (obj: string | any, val?: any) {
    if (isObject(obj)) {
      this.data = merge(this.data, obj as any)
    } else if (typeof obj === 'string' && val) {
      const oldValue = getObjectValue(this.data, obj)
      setObjectValue(
        this.data,
        obj,
        (isArray(oldValue) && isArray(val)) ||
          (isObject(oldValue) && isObject(val))
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
  del (key: string, where?: Record<string | number, any>) {
    if (isValidObject(where)) {
      const arr = getObjectValue(this.data, key)
      if (isArray(arr)) {
        const newArr = arr.filter((item: Record<string | number, any>) =>
          Object.entries(where as any).some(
            ([k, v]: any) => item[k] === undefined || item[k] !== v
          )
        )
        setObjectValue(this.data, key, newArr)
      }
    } else {
      setObjectValue(this.data, key, null)
    }

    return this.sync()
  }

  clear () {
    this.data = {}
    return this.sync()
  }

  sync () {
    // clean up
    for (const [key, val] of Object.entries(this.data)) {
      if (val === null || val === undefined) {
        delete this.data[key]
      }
    }
    if (this.filepath) {
      fs.outputJsonSync(this.filepath, this.data || {}, { spaces: 4 })
    }
    return this.data
  }
}
