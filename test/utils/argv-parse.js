import test from 'ava'
import Cli from '../../lib/cli'
import { argvParse } from '../../lib/utils'

const cli = new Cli()

// EG: add <repo> [<repo> ...]
test('native `add`', t => {
  const argvs = ['add', 'https://a.com/x.git', 'https://a.com/y.git']
  const native = cli.commandsSchema[argvs[0]]
  const retNative = argvParse({
    inputs: argvs.slice(1),
    filters: cli.modeSchema,
    native
  })

  const retTasks =
    retNative.tasks.length === 2 &&
    retNative.tasks[0] === 'https://a.com/x.git' &&
    retNative.tasks[1] === 'https://a.com/y.git'

  t.true(retTasks, 'tasks parse error')
  t.deepEqual(retNative.mode, {}, 'mode parse error')
  t.deepEqual(retNative.params, {}, 'params parse error')
})

// EG: init <tmpl>[@<ver>] [proj] [opts]
test('native `init`', t => {
  const argvs = ['init', 'template@v1', 'project', '-a', '-D']
  const native = cli.commandsSchema[argvs[0]]
  const retNative = argvParse({
    inputs: argvs.slice(1),
    filters: cli.modeSchema,
    native
  })

  const retTasks =
    retNative.tasks.length === 2 &&
    retNative.tasks[0] === 'template@v1' &&
    retNative.tasks[1] === 'project'

  t.true(retTasks, 'tasks parse error')
  t.deepEqual(retNative.mode, { debug: true }, 'mode parse error')
  t.deepEqual(retNative.params, { a: true }, 'params parse error')
})

test('custom command', t => {
  const argvs = [
    'serve',
    '-t',
    '-port=9000',
    '--p1=true',
    '-p2=false',
    '--',
    'build',
    '-p',
    '-x=x'
  ]
  const native = cli.commandsSchema[argvs[0]]
  const retCustom = argvParse({
    inputs: argvs,
    filters: cli.modeSchema,
    prefix: '--',
    prefix2: '-',
    native
  })

  const ret = retCustom.tasks
  t.true(Array.isArray(ret), 'tasks parse error')
  t.is(ret[0].name, 'serve', '`serve` name parse error')
  t.true(ret[0].params.t, '`serve` params parse error')
  t.is(ret[0].params.port, '9000', '`serve` params parse error')
  t.true(ret[0].params.p1, '`serve` params parse error')
  t.false(ret[0].params.p2, '`serve` params parse error')
  t.is(ret[1].name, 'build', '`build` name parse error')
  t.true(ret[1].params.p, '`build` params parse error')
  t.is(ret[1].params.x, 'x', '`x` params parse error')
  t.deepEqual(retCustom.mode, {}, 'mode parse error')
  t.deepEqual(retCustom.params, {}, 'params parse error')
})

test('illegal', t => {
  const argvs = null
  const retCustom = argvParse({
    inputs: argvs,
    filters: cli.modeSchema,
    native: false
  })

  t.deepEqual(retCustom.tasks, [], 'tasks parse error')
  t.deepEqual(retCustom.mode, {}, 'params parse error')
})
