import path from 'path'
import test from 'ava'
import Store from '../../lib/core/store'

const storePath = path.join(process.cwd(), 'test/fixtures/store/info.json')
const store = new Store(storePath)

test('store methods', async t => {
  // Get all
  const retAll = await store.get()
  t.true(Object.keys(retAll).length > 0, 'get all error')

  // Get item
  const retItem = await store.get('init')
  t.true(retItem, 'get item error')

  // Set item
  await store.set('demo', 'demo')
  t.is(await store.get('demo'), 'demo', 'set item error')

  // Del item
  await store.del('demo')
  t.is(await store.get('demo'), undefined, 'del item error')

  // Update item
  await store.set('test', 'test')
  await store.update('test', 'test1')
  t.is(await store.get('test'), 'test1', 'update error')

  // Clear
  await store.del('test')

  // Get items
  const ret1 = await store.get('x', 'fbi-task-')
  t.is(ret1.name, 'x', 'get item with prefix string')

  // Get items
  const ret2 = await store.get('x', ['fbi-task-', 'fbi-project-'])
  t.true(Array.isArray(ret2), 'get item with prefix array')
  t.is(ret2[0].name, 'x', 'get item with prefix array')
  t.is(ret2[1].name, 'x', 'get item with prefix array')

  const ret3 = await store.get('x', {a: 1})
  t.is(ret3, null, 'get item with prefix object')

  const ret4 = await store.get('x', 'not-exist')
  t.is(ret4, undefined, 'get item with prefix not exist string')

  const ret5 = await store.get('x', ['not-exist'])
  t.is(ret5, null, 'get item with prefix not exist array')
})
