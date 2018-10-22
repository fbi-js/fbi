import test from 'ava'
import utils from '../../lib/utils'

test('levels string', t => {
  try {
    const logger = new utils.Logger()
    logger.debug('!! should not show.')
    logger.level = 'debug'
    logger.debug('this should show')
    logger.info({
      x: 1,
      fn () {
        console.log(1)
      }
    })
    logger.warn('nevermind')
    logger.error('nevermind')
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
    logger.level = 'info'
    logger.debug('this should not show')
    t.pass()
  } catch (err) {
    t.fail()
  }
})

test('errors', t => {
  try {
    const logger = new utils.Logger()
    const err = new Error('nevermind')
    logger.error(err)
    t.pass()
  } catch (err) {
    t.fail()
  }
})

test('errors: no stack', t => {
  try {
    const logger = new utils.Logger()
    const err = new Error('nevermind')
    err.stack = ''
    logger.error(err)
    t.pass()
  } catch (err) {
    t.fail()
  }
})

test('logger.getPrefix', t => {
  const logger = new utils.Logger({ prefix: 'xxx' })
  const prefix = logger.getPrefix()
  t.regex(prefix, /xxx/)
})
