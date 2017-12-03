import path from 'path'
import test from 'ava'
import execa from 'execa'
import tempfile from 'tempfile'
import utils from '../../lib/utils'

const fbi = path.join(__dirname, '../../bin/fbi')
process.chdir(__dirname)

function ensureTmpdir(dir) {
  const _dir = path.join(dir, 'x.txt')
  return utils.fs.mkdirp(_dir)
}

function isTemplateExist(name) {
  const dir = path.join(utils.fs.homeDir, '.fbi', name)
  return utils.fs.exist(dir)
}

test.beforeEach(t => {
  t.context.tmpdir = tempfile()
})

test.serial('fbi add/remove', async t => {
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
})

test.serial('fbi update/up', async t => {
  t.regex(await execa.stdout(fbi, ['up', 'mod']), /updated/, 'update fail')
  t.regex(
    await execa.stdout(fbi, ['update', 'fbi-project-mod']),
    /updated/,
    'update fail'
  )
})

test.serial('fbi init/update with-*/update version', async t => {
  await ensureTmpdir(t.context.tmpdir)
  const projectDir = path.join(t.context.tmpdir, 'mod-demo1')
  const msg = await execa.stdout(fbi, ['init', 'mod', 'mod-demo1'], {
    cwd: t.context.tmpdir,
    input: 'y'
  })
  t.regex(msg, /created successfully/, 'init fail')

  // Update option
  const msgUp1 = await execa.stdout(fbi, ['init', '-o'], {
    cwd: projectDir
  })
  t.regex(msgUp1, /Updated/, 'update with options fail')
  t.true(
    await utils.fs.exist(path.join(projectDir, 'fbi/options.js')),
    'update with options fail, `fbi/options.js` not exist'
  )

  // Update option (options exist)
  const msgUp2 = await execa.stdout(fbi, ['init', '-o'], {
    cwd: projectDir
  })
  t.regex(msgUp2, /Updated/, 'update with options (options exist) fail')
  t.true(
    await utils.fs.exist(path.join(projectDir, 'fbi/options.js')),
    'update with options (options exist) fail, `fbi/options.js` not exist'
  )
  t.true(
    await utils.fs.exist(path.join(projectDir, 'fbi-bak/options.js')),
    'update with options (options exist) fail, `fbi-bak/options.js` not exist'
  )

  // Update with-tasks
  const msgUp3 = await execa.stdout(fbi, ['init', '-t'], {
    cwd: projectDir
  })
  t.regex(msgUp3, /Updated/, 'update with-tasks fail')
  t.true(
    await utils.fs.exist(path.join(projectDir, 'fbi')),
    'update with-tasks fail, `fbi` folder is not exist'
  )

  // Update with-tasks (tasks exist)
  const msgUp4 = await execa.stdout(fbi, ['init', '-t'], {
    cwd: projectDir
  })
  t.regex(msgUp4, /Updated/, 'update with-tasks (tasks exist) fail')
  t.true(
    await utils.fs.exist(path.join(projectDir, 'fbi')),
    'update with-tasks (tasks exist) fail, `fbi` folder is not exist'
  )
  t.true(
    await utils.fs.exist(path.join(projectDir, 'fbi-bak')),
    'update with-tasks (tasks exist) fail, `fbi-bak` folder is not exist'
  )

  // Update with-all
  const msgUp5 = await execa.stdout(fbi, ['init', '-a'], {
    cwd: projectDir
  })
  t.regex(msgUp5, /Updated/, 'update with-all fail')
  t.true(
    await utils.fs.exist(path.join(projectDir, 'node_modules')),
    'update with-all fail, `node_modules` folder is not exist'
  )

  // Use
  const msgUse = await execa.stdout(fbi, ['use', 'v3.1.0'], {
    cwd: projectDir
  })
  t.regex(msgUse, /Version changed to|Template already in version/, 'use fail')
})

test.serial('fbi init with-options', async t => {
  await ensureTmpdir(t.context.tmpdir)
  const projectDir = path.join(t.context.tmpdir, 'mod-demo')
  const msg = await execa.stdout(fbi, ['init', 'mod', 'mod-demo', '-o'], {
    cwd: t.context.tmpdir
  })
  t.regex(msg, /created successfully/, 'init with-options fail')
  t.true(
    await utils.fs.exist(path.join(projectDir, 'fbi')),
    'init with-options fail, `fbi` folder is not exist'
  )
})

test.serial('fbi init with-tasks', async t => {
  await ensureTmpdir(t.context.tmpdir)
  const projectDir = path.join(t.context.tmpdir, 'mod-demo')
  const msg = await execa.stdout(fbi, ['init', 'mod', 'mod-demo', '-t'], {
    cwd: t.context.tmpdir
  })
  t.regex(msg, /created successfully/, 'init with-tasks fail')
  t.true(
    await utils.fs.exist(path.join(projectDir, 'fbi')),
    'init with-tasks fail, `fbi` folder is not exist'
  )
})

test.serial('fbi init with-all', async t => {
  await ensureTmpdir(t.context.tmpdir)
  const projectDir = path.join(t.context.tmpdir, 'mod-demo')
  const msg = await execa.stdout(fbi, ['init', 'mod', 'mod-demo', '-a'], {
    cwd: t.context.tmpdir
  })
  t.regex(msg, /created successfully/, 'init with-all fail')
  t.true(
    await utils.fs.exist(path.join(projectDir, 'fbi')),
    'init with-all fail, `fbi` folder is not exist'
  )
  t.true(
    await utils.fs.exist(path.join(projectDir, 'node_modules')),
    'init with-all fail, `node_modules` folder is not exist'
  )
})

test.serial('fbi init with specified version/Update version', async t => {
  await ensureTmpdir(t.context.tmpdir)
  const projectDir = path.join(t.context.tmpdir, 'mod-demo')

  // Init with version
  const msg = await execa.stdout(fbi, ['init', 'mod@v3.0.0', 'mod-demo'], {
    cwd: t.context.tmpdir
  })
  t.regex(msg, /created successfully/, 'init with version fail')

  // Update version
  const msgUse = await execa.stdout(fbi, ['use', 'v3.1.0'], {
    cwd: projectDir
  })
  t.regex(
    msgUse,
    /Version changed to|Template already in version/,
    'update version fail'
  )

  // Update version
  const msgUse2 = await execa.stdout(fbi, ['use'], {
    cwd: projectDir
  })
  t.regex(msgUse2, /Please specify version/, 'update version should fail')
})
