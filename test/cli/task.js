import path from 'path'
import test from 'ava'
import execa from 'execa'

import utils from '../../lib/utils'

const fbi = path.join(__dirname, '../../bin/fbi')
process.chdir(__dirname)

const templatePath = path.join(
  __dirname,
  '../fixtures/templates/local-template-for-task'
)
const projectPath = templatePath + '-demo'

test('run', async t => {
  // Add template
  const msgAdd = await execa.stdout(fbi, ['add', templatePath], {
    input: '1'
  })
  t.regex(msgAdd, /added|already exist/, 'add fail')

  try {
    // Init
    const msgInit = await execa.stdout(
      fbi,
      ['init', 'local-template-for-task', 'local-template-for-task-demo'],
      {
        cwd: path.join(__dirname, '../fixtures/templates'),
        input: 'y'
      }
    )
    t.regex(msgInit, /created successfully/, 'init fail')

    // Run task
    const msgTask1 = await execa.stdout(fbi, ['task1'], {
      cwd: projectPath
    })
    t.regex(msgTask1, /from task1/, 'run task1 fail')
    const msgTask2 = await execa.stdout(fbi, ['task2'], {
      cwd: projectPath
    })
    t.regex(msgTask2, /from task2/, 'run task2 fail')
    const msgTask3 = await execa.stdout(fbi, ['task3'], {
      cwd: projectPath
    })
    t.regex(msgTask3, /from task3/, 'run task3 fail')

    // Modes
    const ret1 = await execa.stdout(fbi, ['task1', '-D'], {
      cwd: projectPath
    })
    t.regex(ret1, /debug: true/, 'debug mode')

    const ret2 = await execa.stdout(fbi, ['task1', '-T'], {
      cwd: projectPath
    })
    t.regex(ret2, /Running template task/, 'template mode')

    const ret3 = await execa.stdout(fbi, ['task1', '-G'], {
      cwd: projectPath
    })
    t.regex(ret3, /Running template task/, 'global mode')

    await utils.fs.remove(projectPath)
  } catch (err) {
    t.fail(err)
    await utils.fs.remove(projectPath)
  }
})
