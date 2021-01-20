import { getEnv } from '../helpers/env'
import { Store } from './store'

function getContext () {
  if ((global as any).fbiContext) {
    return (global as any).fbiContext
  }

  const context = new Store()
  context.set('env', getEnv())
  context.set('debug', false)
  ;(global as any).fbiContext = context
  return (global as any).fbiContext
}

export default getContext()
