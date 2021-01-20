export * from './env'
export * from './config'

// Check for object properties
export function objHasProperty<X extends {}, Y extends PropertyKey> (
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  // eslint-disable-next-line no-prototype-builtins
  return obj.hasOwnProperty(prop)
}
