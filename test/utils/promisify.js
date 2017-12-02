import test from 'ava'
import {promisify} from '../../lib/utils'

// Promisify
const twice = (data, callback) => {
  if (!callback) {
    throw new Error('No callback')
  }
  setTimeout(() => {
    callback(null, data * 2)
  })
}

const twiceError = (data, callback) => {
  if (!callback) {
    throw new Error('No callback')
  }
  setTimeout(() => {
    callback(new Error('Invalid'))
  })
}

test('promisify', async t => {
  try {
    const pfn = promisify(twice)
    await pfn(5)
    t.pass()
  } catch (err) {
    t.fail(err)
  }
})

test('promisify with error', async t => {
  try {
    const pfn = promisify(twiceError)
    await pfn(5)
    t.fail()
  } catch (err) {
    t.is(err.message, 'Invalid')
  }
})

test('not a function', async t => {
  try {
    const pfn = promisify({})
    await pfn(5)
    t.fail()
  } catch (err) {
    t.regex(err.toString(), /promisify must receive a function|must be of type function|must be of type Function/)
  }
})
