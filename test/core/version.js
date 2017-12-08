import path from 'path'
import test from 'ava'
import tempfile from 'tempfile'
import Version from '../../lib/core/version'
import utils from '../../lib/utils'

function ensureTmpdir(dir) {
  const _dir = path.join(dir, 'x.txt')
  return utils.fs.mkdirp(_dir)
}

test.beforeEach(t => {
  t.context.tmpdir = tempfile()
})

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
    /v3/,
    'current version should match `v3`'
  )
})

test('version.add & change & update', async t => {
  await ensureTmpdir(t.context.tmpdir)
  try {
    const projectName = 'fbi-project-mod'
    const gitRepo = 'https://github.com/fbi-templates/fbi-project-mod.git'

    // Add
    const ret = await version.add(gitRepo, t.context.tmpdir, projectName)
    t.true(Array.isArray(ret.versions), 'versions should be array')
    t.true(Boolean(ret.current), 'current version should not be null')

    // Change
    const projectDir = path.join(t.context.tmpdir, projectName)
    const retChange = await version.change({
      dir: projectDir,
      version: 'v3.0.0'
    })
    t.true(retChange, 'change version should be successful')

    // Update
    const retUpdate = await version.update(projectDir)
    t.true(retUpdate, 'update should be successful')

    // Get valid version

    await utils.fs.remove(projectDir)
  } catch (err) {
    throw err
  }
})
