import test from 'ava'
import utils from '../../lib/utils'

test('levels string', t => {
  try {
    const logger = new utils.Logger()
    logger.debug('!! should not show.')
    logger.level = 'debug'
    logger.debug('aa')
    logger.info({
      x: 1,
      fn() {
        console.log(1)
      }
    })
    logger.warn('aa')
    logger.error('aa')
    t.pass()
  } catch (err) {
    t.fail()
  }
})

test('levels number', t => {
  try {
    const logger = new utils.Logger()
    logger.debug('!! should not show.')
    logger.level = 2
    logger.debug('aa')
    t.pass()
  } catch (err) {
    t.fail()
  }
})

test('errors', t => {
  try {
    const logger = new utils.Logger()
    const err = new Error('no')
    logger.error(err)
    t.pass()
  } catch (err) {
    t.fail()
  }
})

test('logger.getPrefix', t => {
  const logger = new utils.Logger({prefix: 'xxx'})
  const prefix = logger.getPrefix()
  t.regex(prefix, /xxx/)
})
