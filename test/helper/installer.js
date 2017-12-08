import path from 'path'
import test from 'ava'
import installer from '../../lib/helpers/installer'
import utils from '../../lib/utils'

const logger = new utils.Logger()
const root = path.join(__dirname, '../fixtures/installer')
const dirNoPkg = path.join(root, 'no-pkg')
const dirDepsNoexist = path.join(root, 'deps-noexist')
const dir1 = path.join(root, '1')
const dir2 = path.join(root, '2')
const dir3 = path.join(root, '3')
const dir4 = path.join(root, '4')

test('check: package.json not exist', async t => {
  const ret = await installer.check(dirNoPkg)
  t.false(ret, 'package.json should not exist')
})

test('check: dependencies not exist', async t => {
  const ret = await installer.check(dirDepsNoexist)
  t.false(ret, 'dependencies should not exist')
})

test('npm install dependencies', async t => {
  const ret = await installer.start({
    dir: dir1,
    logger,
    show: false
  })
  t.true(ret, 'install fail')
})

test('npm install devDependencies', async t => {
  const ret = await installer.start({
    dir: dir2,
    logger,
    packages: ['debug'],
    type: 'dev',
    show: true
  })
  t.true(ret, 'install fail')
})

test('yarn install dependencies', async t => {
  try {
    const ret = await installer.start({
      dir: dir3,
      logger,
      command: 'yarn'
    })
    t.true(ret, 'install fail')
  } catch (err) {
    t.fail(err)
  }
})

test('yarn add devDependencies', async t => {
  try {
    const ret = await installer.start({
      dir: dir4,
      logger,
      command: 'yarn',
      action: 'add',
      packages: ['debug'],
      type: 'prod'
    })
    t.true(ret, 'install fail')
  } catch (err) {
    t.fail(err)
  }
})
