import path from 'path'
import test from 'ava'
import execa from 'execa'
import {version as pkgVersion} from '../../package'

const fbi = path.join(__dirname, '../../bin/fbi')
process.chdir(__dirname)

test('fbi --version', async t => {
  t.is(await execa.stdout(fbi, ['--version']), 'v' + pkgVersion)
})

test('fbi -v', async t => {
  t.is(await execa.stdout(fbi, ['-v']), 'v' + pkgVersion)
})

test('fbi --help', async t => {
  t.regex(
    await execa.stdout(fbi, ['--help']),
    /fbi <command>\|<task> \[mode\] \[options\]/
  )
})

test('fbi -h', async t => {
  t.regex(
    await execa.stdout(fbi, ['-h']),
    /fbi <command>\|<task> \[mode\] \[options\]/
  )
})

test('fbi ls', async t => {
  t.regex(await execa.stdout(fbi, ['ls']), /Tasks:/)
})

test('fbi ls config', async t => {
  t.regex(await execa.stdout(fbi, ['ls', 'config']), /_DATA_ROOT/)
})

test('fbi ls store', async t => {
  t.regex(await execa.stdout(fbi, ['ls', 'store']), /repository:/)
})

test('fbi ls util', async t => {
  t.regex(await execa.stdout(fbi, ['ls', 'util']), /\[Function:/)
})

test('fbi ls: invalid', async t => {
  t.regex(await execa.stdout(fbi, ['ls', 'aaa']), /`aaa` is invalid/)
})

test('fbi: command not found', async t => {
  t.regex(await execa.stdout(fbi, ['-aaa']), /Command not found/)
})

test('fbi init: command not found', async t => {
  t.regex(await execa.stdout(fbi, ['-aaa']), /Command not found/)
})

test('fbi set: item should success', async t => {
  t.regex(await execa.stdout(fbi, ['set', 'LOG_LEVEL=info']), /successfully/)
  t.regex(await execa.stdout(fbi, ['set', 'log_level=info']), /successfully/)
})

test('fbi set: shouw usage', async t => {
  t.regex(await execa.stdout(fbi, ['set', 'a']), /Usage: `fbi set key=value`/)
})

test('fbi set: item readonly', async t => {
  await Promise.all(
    [
      '_DATA_ROOT',
      '_STORE_FILE',
      '_CUSTOM_CONFIG_FILE',
      '_data_root',
      '_store_file',
      '_custom_config_file',
      'xxxx'
    ].map(async item => {
      t.regex(await execa.stdout(fbi, ['set', `${item}='xxx'`]), /is readonly/)
    })
  )
})
