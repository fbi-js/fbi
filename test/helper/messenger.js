import { EventEmitter } from 'events'
import test from 'ava'
import messenger from '../../lib/helpers/messenger'
import { Logger } from '../../lib/utils'

const logger = new Logger()

test('init', t => {
  try {
    const obj = new EventEmitter()
    messenger.init(obj, logger)
    t.pass()
  } catch (err) {
    t.fail(err)
  }
})
