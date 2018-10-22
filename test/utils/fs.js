import fs from 'fs'
import path from 'path'
import test from 'ava'
import utils from '../../lib/utils'

const tmpDir = path.join(__dirname, '../fixtures/mdirp/mdirp1/mdirp2')

test('stat', async t => {
  try {
    const tmp = path.join(__dirname, 'fs.js')
    await utils.fs.stat(tmp)
    t.pass()
  } catch (err) {
    t.fail()
  }
})

test('mkdirp', async t => {
  const tmp = path.join(tmpDir, '0.txt')
  await utils.fs.mkdirp(tmp)

  // $
  t.true(fs.existsSync(path.dirname(tmp)), 'Directory should exist.')
})

test('exist', async t => {
  const tmp = path.join(tmpDir, '3.txt')
  await utils.fs.write(tmp, 'success')
  const exist = await utils.fs.exist(tmp)

  t.true(exist, 'File should exist.')
})

test('existSync', async t => {
  const tmp = path.join(tmpDir, '3.txt')
  await utils.fs.write(tmp, 'success')
  const exist = utils.fs.existSync(tmp)

  t.true(exist, 'File should exist.')
})

test('write', async t => {
  const tmp = path.join(tmpDir, '1.txt')
  await utils.fs.write(tmp, 'success')

  // $
  t.is(
    fs.readFileSync(tmp, 'utf8'),
    'success',
    'File content should be `success`.'
  )
})

test('read', async t => {
  const tmp = path.join(tmpDir, '2.txt')
  await utils.fs.write(tmp, 'success')
  const cnt = await utils.fs.read(tmp)

  t.is(cnt, 'success', 'File content should be `success`.')
})

test('remove', async t => {
  const tmp = path.join(tmpDir, '4.txt')
  await utils.fs.write(tmp, 'success')
  await utils.fs.remove(tmp)

  t.false(fs.existsSync(tmp), 'File should not exist.')
})

test('remove: error', async t => {
  try {
    const tmp = path.join(tmpDir, '14.txt')
    await utils.fs.remove(tmp)
    t.fail('should error')
  } catch (err) {
    if (err.code === 'ENOENT') {
      t.pass()
    }
  }
})

test('copy', async t => {
  try {
    const tmp = path.join(tmpDir, '5.txt')
    await utils.fs.write(tmp, 'success')
    const target = path.join(
      __dirname,
      '../fixtures/mdirp-copy/mdirp1/mdirp2/5-copy.txt'
    )
    await utils.fs.copy({ from: tmp, to: target })
    t.pass()
  } catch (err) {
    t.fail(err)
  }
})

test('list', async t => {
  try {
    const list = await utils.fs.list(path.join(__dirname, '../fixtures/'), [
      'mdirp1',
      '5.txt'
    ])
    t.true(list.length > 0)
  } catch (err) {
    t.fail(err)
  }
})

test('isEmptyDir', async t => {
  const ret = await utils.fs.isEmptyDir(tmpDir)
  t.false(ret)
})

test('isEmptyDir: not empty', async t => {
  const ret = await utils.fs.isEmptyDir(path.join(tmpDir, 'not-exist'))
  t.true(ret)
})

test('move', async t => {
  try {
    const src = path.join(__dirname, '../fixtures/fs/source')
    const dst = path.join(__dirname, '../fixtures/fs/target')
    await utils.fs.move(src, dst)
    t.pass()
    await utils.fs.move(dst, src)
  } catch (err) {
    t.fail(err)
  }
})
