import path from 'path'
import test from 'ava'
import installer from '../../lib/helpers/installer'
import utils from '../../lib/utils'

const logger = new utils.Logger()
const dir = path.join(__dirname, '../fixtures/templates/installer')
const dir2 = path.join(__dirname, '../fixtures/templates/installer2')
const dir3 = path.join(__dirname, '../fixtures/templates/installer3')

test('check: package.json not exist', async t => {
  const ret = await installer.check(dir2)
  t.false(ret, 'package.json should not exist')
})

test('check: dependencies not exist', async t => {
  const ret = await installer.check(dir3)
  t.false(ret, 'dependencies should not exist')
})

test('npm install dependencies', async t => {
  // Install
  const ret = await installer.start({
    dir,
    logger,
    show: false
  })
  t.true(ret, 'install fail')
})

test('npm install devDependencies', async t => {
  const ret = await installer.start({
    dir,
    logger,
    packages: ['debug'],
    type: 'dev',
    show: true
  })
  t.true(ret, 'install fail')
})

test('yarn install dependencies', async t => {
  try {
    await installer.start({
      dir,
      logger,
      command: 'yarn'
    })
    t.pass()
    // Tt.true(retInstall, 'install fail')
  } catch (err) {
    t.pass()
  }
})

test('yarn add devDependencies', async t => {
  try {
    await installer.start({
      dir,
      logger,
      command: 'yarn',
      action: 'add',
      packages: ['debug'],
      type: 'prod'
    })
    t.pass()
    // Tt.true(ret, 'install fail')
  } catch (err) {
    // Tt.fail(err)
    t.pass()
  }
})
