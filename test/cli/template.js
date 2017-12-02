import path from 'path'
import test from 'ava'
import execa from 'execa'

import utils from '../../lib/utils'

const fbi = path.join(__dirname, '../../bin/fbi')
process.chdir(__dirname)

function isTemplateExist(name) {
  const dir = path.join(utils.fs.homeDir, '.fbi', name)
  return utils.fs.exist(dir)
}

test('fbi add/update/remove/init/use/install (remote template)', async t => {
  // Clean
  if (await isTemplateExist('fbi-project-mod')) {
    const msgDel = await execa.stdout(fbi, ['rm', 'mod'], {
      input: 'y'
    })
    t.regex(msgDel, /removed/, 'remove fail')
  }

  // Add
  const msgAdd = await execa.stdout(fbi, [
    'add',
    'https://github.com/fbi-templates/fbi-project-mod.git'
  ])
  t.regex(msgAdd, /added/, 'add fail')

  // Update
  const msg2 = await execa.stdout(fbi, ['up', 'mod'])
  t.regex(msg2, /updated/, 'update fail')
  const msg3 = await execa.stdout(fbi, ['update', 'fbi-project-mod'])
  t.regex(msg3, /updated/, 'update fail')

  const targetDir = path.join(__dirname, '../fixtures/templates/mod-clean')
  try {
    // Clean
    if (await utils.fs.exist(targetDir)) {
      await utils.fs.remove(targetDir)
    }

    // Init
    const msgInit = await execa.stdout(
      fbi,
      ['init', 'mod', '../fixtures/templates/mod-clean'],
      {
        input: 'y'
      }
    )
    t.regex(msgInit, /created successfully/, 'init fail')

    // Use
    const msgUse = await execa.stdout(fbi, ['use', 'v3.1.0'], {
      cwd: targetDir
    })
    t.regex(
      msgUse,
      /Version changed to|Template already in version/,
      'use fail'
    )

    // Remove node_modules
    await utils.fs.remove(path.join(targetDir, 'node_modules'))

    // Install
    const msgInstall = await execa.stdout(fbi, ['i'], {
      cwd: targetDir
    })
    t.regex(msgInstall, /prod dependencies installed/, 'install fail')

    await utils.fs.remove(targetDir)
  } catch (err) {
    t.fail(err)
    await utils.fs.remove(targetDir)
  }
})

test('fbi add/update/remove/init/use/install (local template)', async t => {
  try {
    // Clean
    if (await isTemplateExist('fbi-project-local-template')) {
      const msgDel = await execa.stdout(fbi, ['rm', 'local-template'], {
        input: 'y'
      })
      t.regex(msgDel, /removed/)
    }

    // Add template
    const localDir = path.join(
      __dirname,
      '../fixtures/templates/local-template'
    )
    const msgAdd = await execa.stdout(fbi, ['add', localDir], {
      input: '1'
    })
    t.regex(msgAdd, /dev dependencies installed|already exist/, 'add fail')

    // Update
    const msg2 = await execa.stdout(fbi, ['up', 'local-template'])
    t.regex(msg2, /not support version control/, 'update fail')
    const msg3 = await execa.stdout(fbi, [
      'update',
      'fbi-project-local-template'
    ])
    t.regex(msg3, /not support version control/, 'update fail')
  } catch (err) {
    t.fail(err)
    await utils.fs.remove(
      path.join(utils.fs.homeDir, '.fbi', 'fbi-project-local-template')
    )
  }

  const targetDir = path.join(
    __dirname,
    '../fixtures/templates/local-template-demo'
  )
  try {
    // Clean
    if (await utils.fs.exist(targetDir)) {
      await utils.fs.remove(targetDir)
    }

    // Init
    const msgInit = await execa.stdout(
      fbi,
      ['init', 'local-template', 'local-template-demo'],
      {
        cwd: path.join(__dirname, '../fixtures/templates'),
        input: 'y'
      }
    )
    t.regex(msgInit, /created successfully/, 'init fail')

    // Use
    const msgUse = await execa.stdout(fbi, ['use', 'v3.1.0'], {
      cwd: targetDir
    })
    t.regex(msgUse, /Can not change version/, 'use fail')

    // Remove node_modules
    await utils.fs.remove(path.join(targetDir, 'node_modules'))

    // Install
    const msgInstall = await execa.stdout(fbi, ['i'], {
      cwd: targetDir
    })
    t.regex(msgInstall, /prod dependencies installed/, 'install fail')

    await utils.fs.remove(targetDir)
  } catch (err) {
    t.fail(err)
    await utils.fs.remove(targetDir)
  }
})
