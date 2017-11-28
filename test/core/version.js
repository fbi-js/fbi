import path from 'path'
import test from 'ava'
import utils from '../../lib/utils'
import Version from '../../lib/core/version'

const version = new Version()

const dir2 = process.cwd()

test('version.isSupport: shoud support', async t => {
  const dir = path.join(process.cwd())
  const ret = await version.isSupport(dir)
  t.true(Boolean(ret))
})

test('version.isSupport: shoud not support', async t => {
  const dir = path.join(process.cwd(), '../')
  const ret = await version.isSupport(dir)
  t.false(Boolean(ret))
})

test('version.getVersions', async t => {
  const ret = await version.getVersions(dir2)
  t.true(Array.isArray(ret))
})

test('version.isVersionExist: should exist', async t => {
  const ret = await version.isVersionExist(dir2, 'v3.0.0-beta.15')
  t.true(ret)
})

test('version.isVersionExist: should not exist', async t => {
  const ret = await version.isVersionExist(dir2, 'v3.0.0-beta.151')
  t.false(ret)
})
