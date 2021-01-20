// eslint-disable-next-line eqeqeq
export const isUndef = (val: any) => val == null || val == undefined
export const isArray = (val: unknown) => Array.isArray(val)
export const isString = (val: unknown) => typeof val === 'string'
export const isBoolean = (val: unknown) => typeof val === 'boolean'
export const isNumber = (val: unknown) => typeof val === 'number'
export const isFunction = (val: unknown) => typeof val === 'function'
export const isObject = (val: any) =>
  Boolean(val) && val.constructor.name === 'Object'
export const isAsyncFunction = (val: any) =>
  isFunction(val) && val.constructor.name === 'AsyncFunction'
export const isClass = (val: any) => {
  const isCtorClass =
    val.constructor && val.constructor.toString().substring(0, 5) === 'class'
  if (isUndef(val.prototype)) {
    return isCtorClass
  }
  const isPrototypeCtorClass =
    val.prototype.constructor &&
    val.prototype.constructor.toString &&
    val.prototype.constructor.toString().substring(0, 5) === 'class'
  return isCtorClass || isPrototypeCtorClass
}
export const isValidJSON = (val: any) => {
  try {
    JSON.parse(val)
    return true
  } catch (e) {
    return false
  }
}
export const isEmpty = (val: any) =>
  // val == null || val == undefined || (Object.keys(val) || val).length < 1
  // val == null ||
  // val == undefined
  isUndef(val) ||
  (isArray(val)
    ? val.filter((v: any) => v !== null && v !== undefined).length < 1
    : isObject(val)
    ? Object.keys.length < 1
    : false)
export const isValidArray = (val: any) => isArray(val) && !isEmpty(val)
export const isValidObject = (val: any) => isObject(val) && !isEmpty(val)
export const isGitUrl = (string: string) =>
  // eslint-disable-next-line no-useless-escape
  /(?:git|ssh|https?|git@[-\w.]+):(\/\/)?(.*?)(\.git)(\/?|\#[-\d\w._]+?)$/.test(
    string
  )
