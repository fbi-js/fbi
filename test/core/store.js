import path from 'path'
import test from 'ava'
import Store from '../../lib/core/store'

const storePath = path.join(process.cwd(), 'test/fixtures/store/info.json')
const store = new Store(storePath)

test('store methods', t => {
  t.plan(5)

  // Get all
  const retAll = store.get()
  t.true(Object.keys(retAll).length > 0, 'get all error')

  // Get item
  const retItem = store.get('init')
  t.true(retItem, 'get item error')

  // Set item
  store.set('demo', 'demo')
  t.is(store.get('demo'), 'demo', 'set item error')

  // Del item
  store.del('demo')
  t.is(store.get('demo'), undefined, 'del item error')

  // Update item
  store.set('test', 'test')
  store.update('test', 'test1')
  t.is(store.get('test'), 'test1', 'update error')

  // Clear
  store.del('test')
})
