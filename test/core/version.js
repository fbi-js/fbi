import path from 'path'
import test from 'ava'
import Version from '../../lib/core/version'
import utils from '../../lib/utils'

const version = new Version()

const cwd = process.cwd()

test('version.isSupport', async t => {
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

test('version.getCurrentVersion', async t => {
  t.regex(
    await version.getCurrentVersion(cwd),
    /v3\.0\.0/,
    'current version should match `v3.0.0`'
  )
})

test('version.add & change & update', async t => {
  const targetDir = path.join(__dirname, '../fixtures/templates')
  const projectName = 'fbi-project-mod'

  const gitRepo = 'https://github.com/fbi-templates/fbi-project-mod.git'
  const ret = await version.add(gitRepo, targetDir, projectName)

  // Add
  t.true(Array.isArray(ret.versions), 'versions should be array')
  t.true(Boolean(ret.current), 'current version should not be null')

  // Change
  const projectDir = path.join(targetDir, projectName)
  const retChange = await version.change(projectDir, 'v3.0.0')
  t.true(retChange, 'change version should be successful')

  // Update
  const retUpdate = await version.update(projectDir)
  t.true(retUpdate, 'update should be successful')

  await utils.fs.remove(projectDir)
})
