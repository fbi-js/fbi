import path from 'path'
import test from 'ava'
import installer from '../../lib/helpers/installer'
import Logger from '../../lib/utils/logger'

const logger = new Logger()

test('installer', async t => {
  t.plan(2)

  // Check
  const dir = path.join(__dirname, '../fixtures/templates/installer')
  const retCheckProd = await installer.check(dir)
  t.true(retCheckProd, 'prod deps should not exist')

  // Install
  const retInstall = await installer.start({
    dir,
    logger
  })
  t.true(retInstall, 'install fail')
})
