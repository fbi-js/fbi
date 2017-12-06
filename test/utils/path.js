import path from 'path'
import test from 'ava'
import utils from '../../lib/utils'

// Path
const tmp1 = path.join(__dirname, '../fixtures/mdirp')
const tmp2 = '../fixtures/mdirp'

test('isAbsolute', t => {
  t.true(utils.path.isAbsolute(tmp1))
  t.false(utils.path.isAbsolute(tmp2))
})

test('isRelative', t => {
  t.false(utils.path.isRelative(tmp1))
  t.true(utils.path.isRelative(tmp2))
})

test('normalize', t => {
  const ret = utils.path.normalize('..\\fixtures\\mdirp')
  t.is(ret, '../fixtures/mdirp')
})

test('join', t => {
  const ret = utils.path.join('../x/y', './a/b.c')
  t.is(ret, '../x/y/a/b.c')
})

test('cwd', t => {
  const ret = utils.path.cwd('./a/b.c')
  const compare = path.join(process.cwd(), './a/b.c')
  t.is(ret, compare)
})
