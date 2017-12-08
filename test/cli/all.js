import path from 'path'
import test from 'ava'
import execa from 'execa'
import tempfile from 'tempfile'
import utils from '../../lib/utils'
import configs from '../configs.json'

const fbi = path.join(__dirname, '../../bin/fbi')

// remote
const remoteProject = configs.repos.project
const remoteTask = configs.repos.task

const tmplName = 'fbi-project-fortest'
const tmplShortName = 'fortest'
const tmplVersions = ['v1.0.0', 'v2.0.0']
const taskName = 'fbi-task-fortest'
const taskShortName = 'fortest'

const home = path.join(utils.fs.homeDir, '.fbi')
const tmpdir = tempfile()
const projectDir = path.join(tmpdir, 'demo')

// local
const localTmplName = 'fbi-project-local-template-for-task'
const localTmplShortName = 'local-template-for-task'
const localTmplPath = path.join(
  __dirname,
  '../fixtures/templates/' + localTmplShortName
)
const tmpdirLocal = tempfile()
const localProjectDir = path.join(tmpdirLocal, 'demo')

function ensureTmpdir(dir) {
  const _dir = path.join(dir, 'x.txt')
  return utils.fs.mkdirp(_dir)
}

test.before(async t => {
  process.chdir(__dirname)
})

test.beforeEach(t => {
  t.context.tmpdir = tempfile()
})

// remote::

test.serial('add template & init project', async t => {
  await ensureTmpdir(tmpdir)
  t.regex(
    await execa.stdout(fbi, ['add', remoteProject]),
    /dev dependencies installed|already exist/
  )

  t.regex(
    await execa.stdout(fbi, ['init', tmplShortName, 'demo'], {
      cwd: tmpdir,
      input: 'y'
    }),
    /created successfully/
  )
})

test.serial('add task', async t => {
  t.regex(await execa.stdout(fbi, ['add', remoteTask]), /added|already exist/)
})

// template

test.serial('fbi update/up', async t => {
  t.regex(
    await execa.stdout(fbi, ['up', tmplShortName]),
    /updated/,
    'update fail'
  )
  t.regex(
    await execa.stdout(fbi, ['update', tmplName]),
    /updated/,
    'update fail'
  )
})

test('fbi update with-*/update version', async t => {
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

  // Use
  const msgUse = await execa.stdout(fbi, ['use', 'v1.0.0'], {
    cwd: projectDir
  })
  t.regex(msgUse, /Version changed to|Template already in version/, 'use fail')
})

test('fbi init with-options', async t => {
  await ensureTmpdir(t.context.tmpdir)
  const dir = path.join(t.context.tmpdir, 'demo')
  const msg = await execa.stdout(fbi, ['init', tmplShortName, 'demo', '-o'], {
    cwd: t.context.tmpdir
  })
  t.regex(msg, /created successfully/, 'init with-options fail')
  t.true(
    await utils.fs.exist(path.join(dir, 'fbi')),
    'init with-options fail, `fbi` folder is not exist'
  )
})

test('fbi init with-tasks', async t => {
  await ensureTmpdir(t.context.tmpdir)
  const dir = path.join(t.context.tmpdir, 'demo')
  const msg = await execa.stdout(fbi, ['init', tmplShortName, 'demo', '-t'], {
    cwd: t.context.tmpdir
  })
  t.regex(msg, /created successfully/, 'init with-tasks fail')
})

test('fbi init with-all', async t => {
  await ensureTmpdir(t.context.tmpdir)
  const dir = path.join(t.context.tmpdir, 'demo')
  const msg = await execa.stdout(fbi, ['init', tmplShortName, 'demo', '-a'], {
    cwd: t.context.tmpdir
  })
  t.regex(msg, /created successfully/, 'init with-all fail')
})

test('fbi init with specified version/Update version', async t => {
  await ensureTmpdir(t.context.tmpdir)
  const dir = path.join(t.context.tmpdir, 'demo')

  // Init with version
  const msg = await execa.stdout(
    fbi,
    ['init', `${tmplShortName}@${tmplVersions[0]}`, 'demo'],
    {
      cwd: t.context.tmpdir
    }
  )
  t.regex(msg, /created successfully/, 'init with version fail')

  // Update version
  const msgUse = await execa.stdout(fbi, ['use', tmplVersions[1]], {
    cwd: dir
  })
  t.regex(
    msgUse,
    /Version changed to|Template already in version/,
    'update version fail'
  )

  const msgUse2 = await execa.stdout(
    fbi,
    ['use', tmplVersions[0].replace('v', '')],
    {
      cwd: dir
    }
  )
  t.regex(
    msgUse2,
    /Version changed to|Template already in version/,
    'update version fail'
  )

  const msgUse3 = await execa.stdout(fbi, ['use', 'v0.0.1'], {
    cwd: dir
  })
  t.regex(msgUse3, /not found/, 'update version noexist should fail')

  // Update version
  const msgUse4 = await execa.stdout(fbi, ['use'], {
    cwd: dir
  })
  t.regex(msgUse4, /Please specify version/, 'update version should fail')
})

// task

test('run global task', async t => {
  t.regex(await execa.stdout(fbi, ['fortest']), /Task `fortest` done/)
})

test('run global task with param t', async t => {
  t.regex(await execa.stdout(fbi, ['fortest', '-t']), /task param t is true/)
  t.regex(await execa.stdout(fbi, ['fortest', '--t']), /task param t is true/)
  t.regex(
    await execa.stdout(fbi, ['fortest', '--t=false']),
    /task param t is false/
  )
})

test('run template task: check options valid', async t => {
  try {
    const msg = await execa.stdout(fbi, ['task-basic'], {cwd: projectDir})
    t.regex(msg, /options demo is demo/)
  } catch (err) {
    console.log(err)
    t.fail()
  }
})

test('run template task: promise', async t => {
  t.regex(
    await execa.stdout(fbi, ['task-promise-1'], {cwd: projectDir}),
    /Task `task-promise-1` done/
  )
})

test('run template task: promises', async t => {
  t.regex(
    await execa.stdout(fbi, ['tp1', 'tp2', 'tp3'], {cwd: projectDir}),
    /Task `task-promise-3` done/
  )
})

test('run template task: in template', async t => {
  t.regex(
    await execa.stdout(fbi, ['tp1', '-T'], {cwd: projectDir}),
    /Running template task/
  )
})

test('run template task: with params', async t => {
  t.regex(
    await execa.stdout(fbi, ['task-promise-1', '-t'], {cwd: projectDir}),
    /task param t is true/
  )
  t.regex(
    await execa.stdout(fbi, ['task-promise-1', '-p=9000'], {cwd: projectDir}),
    /task param p is 9000/
  )
  t.regex(
    await execa.stdout(fbi, ['task-promise-1', '--t=aa'], {cwd: projectDir}),
    /task param t is aa/
  )
})

test('run template task: shoud not found', async t => {
  t.regex(
    await execa.stdout(fbi, ['task-noexist'], {
      cwd: projectDir
    }),
    /Error: Task `task-noexist` not found/
  )
})

// local::

test.serial('local: add template & init project', async t => {
  // process.chdir(__dirname)
  await ensureTmpdir(tmpdirLocal)

  const msg = await execa.stdout(fbi, ['add', '.'], {
    cwd: localTmplPath,
    input: '1'
  })

  t.regex(msg, /added|already exist/)

  t.regex(
    await execa.stdout(fbi, ['init', localTmplShortName, 'demo'], {
      cwd: tmpdirLocal
    }),
    /created successfully/
  )
})

// template

test.serial('local: fbi update/up', async t => {
  t.regex(
    await execa.stdout(fbi, ['up', localTmplShortName]),
    /not support version control/
  )
  t.regex(
    await execa.stdout(fbi, ['update', localTmplName]),
    /not support version control/
  )
})

test('local: fbi update with-*/update version', async t => {
  // Update option
  const msgUp1 = await execa.stdout(fbi, ['init', '-o'], {
    cwd: localProjectDir
  })
  t.regex(msgUp1, /Updated/, 'update with options fail')
  t.true(
    await utils.fs.exist(path.join(localProjectDir, 'fbi/options.js')),
    'update with options fail, `fbi/options.js` not exist'
  )

  // Update option (options exist)
  const msgUp2 = await execa.stdout(fbi, ['init', '-o'], {
    cwd: localProjectDir
  })
  t.regex(msgUp2, /Updated/, 'update with options (options exist) fail')
  t.true(
    await utils.fs.exist(path.join(localProjectDir, 'fbi/options.js')),
    'update with options (options exist) fail, `fbi/options.js` not exist'
  )
  t.true(
    await utils.fs.exist(path.join(localProjectDir, 'fbi-bak/options.js')),
    'update with options (options exist) fail, `fbi-bak/options.js` not exist'
  )

  // Update with-tasks
  const msgUp3 = await execa.stdout(fbi, ['init', '-t'], {
    cwd: localProjectDir
  })
  t.regex(msgUp3, /Updated/, 'update with-tasks fail')
  t.true(
    await utils.fs.exist(path.join(localProjectDir, 'fbi')),
    'update with-tasks fail, `fbi` folder is not exist'
  )

  // Update with-tasks (tasks exist)
  const msgUp4 = await execa.stdout(fbi, ['init', '-t'], {
    cwd: localProjectDir
  })
  t.regex(msgUp4, /Updated/, 'update with-tasks (tasks exist) fail')
  t.true(
    await utils.fs.exist(path.join(localProjectDir, 'fbi')),
    'update with-tasks (tasks exist) fail, `fbi` folder is not exist'
  )
  t.true(
    await utils.fs.exist(path.join(localProjectDir, 'fbi-bak')),
    'update with-tasks (tasks exist) fail, `fbi-bak` folder is not exist'
  )

  // Update with-all
  const msgUp5 = await execa.stdout(fbi, ['init', '-a'], {
    cwd: localProjectDir
  })
  t.regex(msgUp5, /Updated/, 'update with-all fail')

  // Use
  const msgUse = await execa.stdout(fbi, ['use', 'v3.1.0'], {
    cwd: localProjectDir
  })
  t.regex(msgUse, /not support|This is not a fbi project/, 'use fail')
})

test('local: fbi init with-options', async t => {
  await ensureTmpdir(t.context.tmpdir)
  const localProjectDir = path.join(t.context.tmpdir, 'demo')
  const msg = await execa.stdout(
    fbi,
    ['init', localTmplShortName, 'demo', '-o'],
    {
      cwd: t.context.tmpdir
    }
  )
  t.regex(msg, /created successfully/, 'init with-options fail')
})

test('local: fbi init with-tasks', async t => {
  await ensureTmpdir(t.context.tmpdir)
  const localProjectDir = path.join(t.context.tmpdir, 'demo')
  const msg = await execa.stdout(
    fbi,
    ['init', localTmplShortName, 'demo', '-t'],
    {
      cwd: t.context.tmpdir
    }
  )
  t.regex(msg, /created successfully/, 'local init with-tasks fail')
})

test('local: fbi init with-all', async t => {
  await ensureTmpdir(t.context.tmpdir)
  const localProjectDir = path.join(t.context.tmpdir, 'demo')
  const msg = await execa.stdout(
    fbi,
    ['init', localTmplShortName, 'demo', '-a'],
    {
      cwd: t.context.tmpdir
    }
  )
  t.regex(msg, /created successfully/, 'init with-all fail')
})

test('local: fbi init with specified version/Update version', async t => {
  await ensureTmpdir(t.context.tmpdir)
  const localProjectDir = path.join(t.context.tmpdir, 'demo')

  // Init with version
  const msg = await execa.stdout(
    fbi,
    ['init', `${localTmplShortName}@v3.0.0`, 'demo'],
    {
      cwd: t.context.tmpdir
    }
  )
  t.regex(msg, /not support/, 'init with version fail')

  // Update version
  const msgUse = await execa.stdout(fbi, ['use', 'v3.1.0'], {
    cwd: localProjectDir
  })
  t.regex(msgUse, /not support/, 'update version fail')

  // Update version
  const msgUse2 = await execa.stdout(fbi, ['use'], {
    cwd: localProjectDir
  })
  t.regex(msgUse2, /Please specify version/, 'update version fail')
})

test('local: fbi use: not a fbi project', async t => {
  await ensureTmpdir(t.context.tmpdir)
  const msg = await execa.stdout(fbi, ['use', 'v1.0.0'], {
    cwd: t.context.tmpdir
  })
  t.regex(msg, /This is not/, 'update version fail')
})

test('local: fbi init: no params & no options', async t => {
  await ensureTmpdir(t.context.tmpdir)
  const ret = await execa.stdout(fbi, ['init'], {
    cwd: t.context.tmpdir
  })
  t.regex(ret, /Usage: fbi init/, 'shold show init usage')
})

test('local: fbi init: template not exist', async t => {
  await ensureTmpdir(t.context.tmpdir)
  const ret = await execa.stdout(fbi, ['init', 'not-exist', 'demo'], {
    cwd: t.context.tmpdir
  })
  t.regex(
    ret,
    /Template `not-exist` not found/,
    'init template should not exist'
  )
})

test('local: fbi add: invalid', async t => {
  await ensureTmpdir(t.context.tmpdir)
  const ret = await execa.stdout(fbi, ['add'], {
    cwd: t.context.tmpdir
  })
  t.regex(ret, /Usage: fbi add/, 'add invalid')
})

test('local: fbi use: invalid', async t => {
  await ensureTmpdir(t.context.tmpdir)
  const ret = await execa.stdout(fbi, ['use'], {
    cwd: t.context.tmpdir
  })
  t.regex(ret, /This is not/, 'use invalid')
})

test('local: fbi install: invalid', async t => {
  await ensureTmpdir(t.context.tmpdir)
  const ret = await execa.stdout(fbi, ['i'], {
    cwd: t.context.tmpdir
  })
  t.regex(ret, /No prod dependencies need install/, 'fbi i')

  const ret2 = await execa.stdout(fbi, ['install'], {
    cwd: t.context.tmpdir
  })
  t.regex(ret2, /No prod dependencies need install/, 'fbi install')
})

test('local: fbi install: force', async t => {
  await ensureTmpdir(t.context.tmpdir)
  const ret = await execa.stdout(fbi, ['i', '-f'], {
    cwd: t.context.tmpdir
  })
  t.regex(ret, /prod dependencies installed/, 'fbi i -f')
})

// task

test('local: run task1', async t => {
  t.regex(
    await execa.stdout(fbi, ['task1'], {
      cwd: localProjectDir
    }),
    /from task1/
  )
})

test('local: run task: not found', async t => {
  t.regex(
    await execa.stdout(fbi, ['task-noexist'], {
      cwd: localProjectDir
    }),
    /Error: Task `task-noexist` not found/
  )
})

test('local: run task: with mode -D', async t => {
  t.regex(
    await execa.stdout(fbi, ['task1', '-D'], {
      cwd: localProjectDir
    }),
    /debug: true/
  )
})

test('local: run task: with mode -T', async t => {
  t.regex(
    await execa.stdout(fbi, ['task1', '-T'], {
      cwd: localProjectDir
    }),
    /Running template task/
  )
})

test('local: task emit', async t => {
  const msg = await execa.stdout(fbi, ['emit'], {
    cwd: localTmplPath
  })
  t.pass()
})

test('local: task get params', async t => {
  const msg = await execa.stdout(fbi, ['get-params', '-t', '--port=8000'], {
    cwd: localTmplPath
  })
  t.regex(msg, /t: true, port: '8000'/)
})

test.after.always('guaranteed cleanup', async t => {
  try {
    // Remove templte & task
    await execa(fbi, ['rm', tmplName], {
      input: 'y'
    })
    await execa(fbi, ['rm', taskName], {
      input: 'y'
    })
    await execa(fbi, ['rm', localTmplName], {
      input: 'y'
    })
  } catch (err) {}
})
