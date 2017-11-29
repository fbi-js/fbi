import fs from 'fs'
import path from 'path'
import test from 'ava'
import execa from 'execa'
import utils from '../../lib/utils'
import Store from '../../lib/core/store'

const storePath = path.join(process.cwd(), 'test/fixtures/store/info.json')
const store = new Store(storePath)

test.serial('store.get', async t => {
  const ret = store.get()
  t.true(ret.init)
})

test.serial('store.set', async t => {
  const ret = store.set('demo', 'demo')
  t.is(store.get('demo'), 'demo')
})

test.serial('store.del', async t => {
  const ret = store.del('demo')
  t.is(store.get('demo'), undefined)
})

test.serial('store.update', async t => {
  const ret = store.set('test', 'test')
  store.update('test', 'test1')
  t.is(store.get('test'), 'test1')
  store.del('test')
})
