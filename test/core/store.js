import path from 'path'
import test from 'ava'
import Store from '../../lib/core/store'

const storePath = path.join(process.cwd(), 'test/fixtures/store/info.json')
const store = new Store(storePath)

test.serial('store.get', t => {
  const ret = store.get()
  t.true(ret.init)
})

test.serial('store.set', t => {
  store.set('demo', 'demo')
  t.is(store.get('demo'), 'demo')
})

test.serial('store.del', t => {
  store.del('demo')
  t.is(store.get('demo'), undefined)
})

test.serial('store.update', t => {
  store.set('test', 'test')
  store.update('test', 'test1')
  t.is(store.get('test'), 'test1')
  store.del('test')
})
