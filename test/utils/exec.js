import test from 'ava'
import {exec} from '../../lib/utils'

test('empty', async t => {
  const ret = await exec('')
  t.false(Boolean(ret))
})

test('error', async t => {
  try {
    await exec('gfjsd')
    t.fail()
  } catch (err) {
    t.regex(err.toString(), /Command not found/)
  }
})
