import fs from 'fs'
import path from 'path'
import test from 'ava'
import utils from '../../lib/utils'
import Version from '../../lib/core/version'

const logger = new utils.Logger({level: 'debug'})
const version = new Version()

const dir1 = '/Users/x/.fbi/fbi-project-vue'
const dir2 = process.cwd()
const dir3 = '/Users/x/.fbi/fbi-project-mod'

// test('version.isSupport: shoud support', async t => {
//   const dir = path.join(process.cwd())
//   const ret = await version.isSupport(dir)
//   t.true(Boolean(ret))
// })

// test('version.isSupport: shoud not support', async t => {
//   const dir = path.join(process.cwd(), '../')
//   const ret = await version.isSupport(dir)
//   t.false(Boolean(ret))
// })

// test('version.isVersionMatch: shoud match', async t => {
//   const ret = await version.isVersionMatch(dir1, '1.0.1')
//   t.true(ret)
// })

// test('version.isVersionMatch: shoud not match', async t => {
//   const ret = await version.isVersionMatch(dir1, '1.0.0')
//   t.false(ret)
// })

test('version.getVersions', async t => {
  const ret = await version.getVersions(dir2)
  t.true(Array.isArray(ret))
})

// test('version.isVersionExist: should exist', async t => {
//   const ret = await version.isVersionExist(dir1, '1.0.1')
//   t.true(ret)
// })

// test('version.isVersionExist: should not exist', async t => {
//   const ret = await version.isVersionExist(dir2, '1.0.1')
//   t.false(ret)
// })

// test('version.change', async t => {
//   const ret1 = await version.change(dir1, '1.0.0')
//   const ret2 = await version.change(dir1, '1.0.1')
//   t.true(ret1 && ret2)
// })
