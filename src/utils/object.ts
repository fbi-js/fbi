import { isObject, isArray, isFunction, isString } from './type'

type AnyObject = Record<string | number, any>

export const capitalize = ([first, ...rest]: any, lowerRest = false) =>
  first.toUpperCase() + (lowerRest ? rest.join('').toLowerCase() : rest.join(''))

export const flatten = (arr: any[], depth = 1): any[] =>
  arr.reduce((a, v) => a.concat(depth > 1 && isArray(v) ? flatten(v, depth - 1) : v), [])

export const uniqueElements = (...arrs: any[]) => {
  const ret = [...arrs].reduce((prev, curr) => {
    if (isArray(curr)) {
      prev = [...prev, ...curr]
    }
    return prev
  }, [])

  return Array.from(new Set(ret))
}
export const shallowClone = (obj: AnyObject) => Object.assign({}, obj)

export const deepClone = (obj: any) => {
  let clone = Object.assign({}, obj)
  Object.keys(clone).forEach(
    key => (clone[key] = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key])
  )
  return isArray(obj) && obj.length
    ? (clone.length = obj.length) && Array.from(clone)
    : isArray(obj)
    ? Array.from(obj)
    : clone
}

// Example: merge([...],[...],[...])
// Example: merge({...},{...},{...})
export const merge = (...objs: AnyObject[] | [][]) => {
  // check
  const isArr = objs.every(isArray)
  const isObj = objs.every(isObject)

  if (!isArr && !isObj) {
    throw new Error('can only merge objects or arrays')
  }

  // merge
  return isObj
    ? [...objs].reduce((ret: Record<string, any>, curr: Record<string, any>) => {
        if (isObject(curr)) {
          Object.keys(curr).reduce((a, k: string): any => {
            if (ret.hasOwnProperty(k)) {
              ret[k] = isObject(curr[k])
                ? merge(ret[k], curr[k])
                : isArray(curr[k])
                ? uniqueElements(ret[k], curr[k])
                : curr[k]
            } else {
              ret[k] = isObject(curr[k]) || isArray(curr[k]) ? deepClone(curr[k]) : curr[k]
            }
          }, {})
        }
        return ret
      }, {})
    : uniqueElements((objs[0] as []).concat(...(objs as []).slice(1)))
}

export const stringifyObjectItems = (obj: any) => {
  if (!isObject(obj)) {
    return obj
  }
  const copy = deepClone(obj)

  for (let [name, value] of Object.entries(copy)) {
    if (typeof name === 'string') {
      copy[name] = JSON.stringify(value)
    }
  }

  return copy
}

// Example: getValueByProperty({a:{b:{c:{ xx: 11}}}}, 'a.b.c.xx')
export const getValueByProperty = (obj: AnyObject, props: string) => {
  const array = props.split('.').filter(Boolean)
  const len = array.length
  return array.slice(0).reduce((acc, curr, i, arr) => {
    const val = acc[curr]
    if (!val) {
      arr.splice(1) //
      if (i < len - 1) return undefined
    }
    return val
  }, obj)
}

// Example: setValueByProperty({}, 'a.b.c', [1,2,3])
// Example: setValueByProperty({a:{b:{c:1}}}, 'a.b.c', [1,2,3])
export const setValueByProperty = (obj: AnyObject, props: string, val: any, clone = false) => {
  if (!obj) {
    return null
  }

  const tmp = clone ? deepClone(obj) : obj
  const array = props.split('.').filter(Boolean)
  const len = array.length
  array.slice(0).reduce((acc, curr, i, arr) => {
    if (i === len - 1) acc[curr] = val
    else if (!acc[curr]) acc[curr] = {}

    return acc[curr]
  }, tmp)
  return tmp
}

export const groupBy = (arr: Array<any>, fn: any): AnyObject => {
  const _fn = isFunction(fn)
    ? fn
    : isString(fn)
    ? (obj: Record<string, any>) => getValueByProperty(obj, fn)
    : null
  if (!_fn) {
    return arr
  }

  return arr.map(_fn).reduce((acc: { [key: string]: any }, val: any, i) => {
    acc[val] = (acc[val] || []).concat(arr[i])
    return acc
  }, {})
}

export const getLongestItem = (...vals: any[]) =>
  vals.reduce((a, x) => (x.length > a.length ? x : a))

export const getShortestItem = (...vals: any[]) =>
  vals.reduce((a, x) => (x.length < a.length ? x : a))

export const ensureArray = (val: unknown) => (Array.isArray(val) ? val : [val])
