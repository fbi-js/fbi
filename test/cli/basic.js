import fs from 'fs'
import path from 'path'
import test from 'ava'
import execa from 'execa'
import {version as pkgVersion} from '../../package'

const fbi = '../../bin/fbi'
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
    /fbi <command>|<task> [mode] [options]/
  )
})

test('fbi -h', async t => {
  t.regex(
    await execa.stdout(fbi, ['-h']),
    /fbi <command>|<task> [mode] [options]/
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

