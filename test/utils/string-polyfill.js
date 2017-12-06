import test from 'ava'
import {stringPolyfill} from '../../lib/utils'

stringPolyfill()

test('string polyfill: padStart', t => {
  t.is(''.padStart(20).length, 20)
  t.is('a'.padStart(20).length, 20)
  t.is('   a'.padStart(20).length, 20)
  t.is('a   '.padStart(20).length, 20)
  t.is('012345678901234567890123456789'.padStart(20).length, 30)
})

test('string polyfill: padEnd', t => {
  t.is(''.padEnd(20).length, 20)
  t.is('a'.padEnd(20).length, 20)
  t.is('   a'.padEnd(20).length, 20)
  t.is('a   '.padEnd(20).length, 20)
  t.is('012345678901234567890123456789'.padEnd(20).length, 30)
})
