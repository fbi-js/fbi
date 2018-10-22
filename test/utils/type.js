import test from 'ava'
import { type } from '../../lib/utils'

test('isJson', t => {
  t.true(type.isJson({}))
  t.true(type.isJson('{"a":1}'))
  t.true(type.isJson('[{"a":1}]'))
  t.false(type.isJson(1))
  t.false(type.isJson('a'))
  t.false(type.isJson(null))
  t.false(type.isJson('null'))
  t.false(type.isJson(undefined))
  t.false(type.isJson(/a/))
})

test('isArray', t => {
  t.true(type.isArray([]))
  t.true(type.isArray([1, 2, '3']))
  t.false(type.isArray('a'))
  t.false(type.isArray({}))
  t.false(type.isArray(null))
  t.false(type.isArray(undefined))
})

test('isObject', t => {
  t.true(type.isObject([]))
  t.true(type.isObject(null))
  t.false(type.isObject('a'))
  t.false(type.isObject(1))
  t.false(type.isObject(undefined))
})

test('isPath', t => {
  t.true(type.isPath('../a/b.txt'))
  t.true(type.isPath('/a/b.txt'))
  t.false(type.isPath('https://a.github.com/x.git'))
  t.false(type.isPath('a'))
  t.false(type.isPath(null))
  t.false(type.isPath(undefined))
  t.false(type.isPath({}))
  t.false(type.isPath([]))
  t.false(type.isPath(1))
})

test('isGitUrl', t => {
  t.true(type.isGitUrl('https://a.github.com/x.git'))
  t.true(type.isGitUrl('git@github.com/x.git'))
  t.false(type.isGitUrl(1))
  t.false(type.isGitUrl('a'))
  t.false(type.isGitUrl('../a/b.txt'))
  t.false(type.isGitUrl(null))
  t.false(type.isGitUrl(undefined))
  t.false(type.isGitUrl([]))
  t.false(type.isGitUrl({}))
})

test('isTaskFile', t => {
  t.true(type.isTaskFile('a.js'))
  t.true(type.isTaskFile('x/a.js'))
  t.false(type.isTaskFile('.a.js'))
  t.false(type.isTaskFile('../a/b.txt'))
  t.false(type.isTaskFile('x/options.js'))
  t.false(type.isTaskFile(1))
  t.false(type.isTaskFile('a'))
  t.false(type.isTaskFile(undefined))
  t.false(type.isTaskFile({}))
  t.false(type.isTaskFile([]))
})
