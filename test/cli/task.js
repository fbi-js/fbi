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
  t.context.template = path.join(
    __dirname,
    '../fixtures/templates/local-template-for-task'
  )
})

test.serial('fbi add/remove & init & run', async t => {
  // Clean
  if (await isTemplateExist('fbi-project-local-template-for-task')) {
    const msgDel = await execa.stdout(
      fbi,
      ['remove', 'fbi-project-local-template-for-task'],
      {
        input: 'y'
      }
    )
    t.regex(msgDel, /removed/, 'remove fail')
  }

  // Add
  const msgAdd = await execa.stdout(fbi, ['add', '.'], {
    input: '1',
    cwd: t.context.template
  })
  t.regex(msgAdd, /added/, 'add local template fail')

  // Init
  await ensureTmpdir(t.context.tmpdir)
  const projectDir = path.join(t.context.tmpdir, 'local-demo')
  const msg = await execa.stdout(
    fbi,
    ['init', 'local-template-for-task', 'local-demo'],
    {
      cwd: t.context.tmpdir
    }
  )
  t.regex(msg, /created successfully/, 'init fail')

  // Run tasks
  const msgTask1 = await execa.stdout(fbi, ['task1'], {
    cwd: projectDir
  })
  t.regex(msgTask1, /from task1/, 'run task1 fail')

  const msgTask2 = await execa.stdout(fbi, ['task2'], {
    cwd: projectDir
  })
  t.regex(msgTask2, /from task2/, 'run task2 fail')

  const msgTask3 = await execa.stdout(fbi, ['task3'], {
    cwd: projectDir
  })
  t.regex(msgTask3, /from task3/, 'run task3 fail')

  // Task not found
  const msgTask4 = await execa.stdout(fbi, ['task'], {
    cwd: projectDir
  })
  t.regex(
    msgTask4,
    /Error: Task `task` not found/,
    'Task `task` should not found/'
  )

  // Modes
  const ret1 = await execa.stdout(fbi, ['task1', '-D'], {
    cwd: projectDir
  })
  t.regex(ret1, /debug: true/, 'debug mode')

  const ret2 = await execa.stdout(fbi, ['task1', '-T'], {
    cwd: projectDir
  })
  t.regex(ret2, /Running template task/, 'template mode')

  const ret3 = await execa.stdout(fbi, ['task1', '-G'], {
    cwd: projectDir
  })
  t.regex(ret3, /Running template task/, 'global mode')
})

test('task emit', async t => {
  await execa.stdout(fbi, ['emit'], {
    cwd: t.context.template
  })
  t.pass()
})

test('task get params', async t => {
  await execa.stdout(fbi, ['get-params', '-t', '--port=8000'], {
    cwd: t.context.template
  })
  t.pass()
})

test.after.always('guaranteed cleanup', async () => {
  const tmplPath = path.join(
    utils.fs.homeDir,
    '.fbi',
    'fbi-project-local-template-for-task'
  )
  const storeFile = path.join(tmplPath, '../store.json')
  await utils.fs.remove(tmplPath)
  const store = require(storeFile)
  if (store['fbi-project-local-template-for-task']) {
    delete store['fbi-project-local-template-for-task']
    await utils.fs.write(storeFile, JSON.stringify(store, null, 2))
  }
})
