export * from './env'
export * from './git'
export * from './object'
export * from './type'
export * from './format'
export * from './version'

export const timeMeasurement = (
  name: string | undefined,
  cacheObject: Record<string, any>
): string => {
  if (!name || !name.trim()) {
    return ''
  }
  let str = ''
  const sym: string = (Symbol.for(name) as unknown) as string
  if (cacheObject[sym]) {
    const diff = process.hrtime(cacheObject[sym])
    const ms = ((diff[0] * 1000 + diff[1] / 1000000).toFixed(0) as any) * 1
    str = ms < 1000 ? ms + 'ms' : ms / 1000 + 's'
    delete cacheObject[sym]
  } else {
    cacheObject[sym] = process.hrtime()
  }
  return str
}

export function applyMixins(
  derivedCtor: any,
  baseCtors: any[],
  exclude: string[] = ['constructor']
) {
  baseCtors.forEach(baseCtor => {
    const instance = baseCtor.prototype || baseCtor
    const propertyNames = Object.getOwnPropertyNames(instance).filter(
      (name: string) => !exclude.includes(name)
    )
    propertyNames.forEach(name => {
      if (exclude.includes(name)) return
      const propDesc = Object.getOwnPropertyDescriptor(instance, name) as
        | PropertyDescriptor
        | ThisType<any>
      Object.defineProperty(derivedCtor.prototype, name, propDesc)
    })
  })

  return derivedCtor
}

export function pathResolve(path: string, options: Record<string, any> = {}) {
  try {
    const _path = require.resolve(path, options)
    return _path
  } catch (e) {
    return ''
  }
}
