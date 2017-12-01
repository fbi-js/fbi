import path from 'path'
import test from 'ava'
import Version from '../../lib/core/version'

const version = new Version()

const cwd = process.cwd()

test('version.isSupport', async t => {
  t.plan(2)

  const dir = path.join(process.cwd())
  const ret = await version.isSupport(dir)
  t.true(Boolean(ret), 'shoud support')

  const dir2 = path.join(process.cwd(), '../')
  const ret2 = await version.isSupport(dir2)
  t.false(Boolean(ret2), 'shoud not support')
})

test('version.getVersions', async t => {
  const ret = await version.getVersions(cwd)
  t.true(Array.isArray(ret), 'versions should be array')
})

test('version.isVersionExist', async t => {
  t.plan(2)

  const ret = await version.isVersionExist(cwd, 'v3.0.0-beta.15')
  t.true(ret, 'should exist')

  const ret2 = await version.isVersionExist(cwd, 'v3.0.0-beta.151')
  t.false(ret2, 'should not exist')
})

test('version.getCurrentVersion', async t => {
  const ret = await version.getCurrentVersion(cwd)
  t.is(Array.isArray(ret), 'versions should be array')
})