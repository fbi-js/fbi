import fs from 'fs'
import path from 'path'
import test from 'ava'
import utils from '../lib/utils'

// Assign
test('utils.assign', t => {
  const a = {a: {b: {c: 1}}}
  const b = {d: 2}
  const c = {
    a: {b: 22},
    f: [1, 2, 3]
  }
  const ret = {
    a: {b: 22},
    d: 2,
    f: [1, 2, 3]
  }
  utils.assign(a, b, c)
  // $
  t.deepEqual(a, ret)
})

// T
// test('utils.argvParse', t => {
//   try {
//     const tmp = path.join(__dirname, 'utils.js')
//     utils.fs.stat(tmp)
//     t.pass()
//   } catch (err) {
//     t.fail()
//   }
// })

// Datetime format
test('utils.dateFormat: -', t => {
  const dt = 'Fri Dec 01 2017 13:44:42 GMT+0800 (CST)'
  const formated = utils.dateFormat(dt, 'YYYY-MM-DD hh:mm:ss')
  t.is(formated, '2017-12-01 13:44:42')
})

test('utils.dateFormat: /', t => {
  const dt = 'Fri Dec 01 2017 13:44:42 GMT+0800 (CST)'
  const formated = utils.dateFormat(dt, 'YYYY/MM/DD hh:mm:ss')
  t.is(formated, '2017/12/01 13:44:42')
})

test('utils.dateFormat: 年月日 时分秒', t => {
  const dt = 'Fri Dec 01 2017 13:44:42 GMT+0800 (CST)'
  const formated = utils.dateFormat(dt, 'YYYY年MM月DD日 hh时mm分ss秒')
  t.is(formated, '2017年12月01日 13时44分42秒')
})

// Utils.fs
const tmpDir = path.join(__dirname, 'fixtures/mdirp/mdirp1/mdirp2')

test('utils.fs.stat', async t => {
  try {
    const tmp = path.join(__dirname, 'utils.js')
    await utils.fs.stat(tmp)
    t.pass()
  } catch (err) {
    t.fail()
  }
})

test('utils.fs.mkdirp', async t => {
  const tmp = path.join(tmpDir, '0.txt')
  await utils.fs.mkdirp(tmp)

  // $
  t.true(fs.existsSync(path.dirname(tmp)), 'Directory should exist.')
})

test('utils.fs.exist', async t => {
  const tmp = path.join(tmpDir, '3.txt')
  await utils.fs.write(tmp, 'success')
  const exist = await utils.fs.exist(tmp)

  t.true(exist, 'File should exist.')
})

test('utils.fs.existSync', async t => {
  const tmp = path.join(tmpDir, '3.txt')
  await utils.fs.write(tmp, 'success')
  const exist = utils.fs.existSync(tmp)

  t.true(exist, 'File should exist.')
})

test('utils.fs.write', async t => {
  const tmp = path.join(tmpDir, '1.txt')
  await utils.fs.write(tmp, 'success')

  // $
  t.is(
    fs.readFileSync(tmp, 'utf8'),
    'success',
    'File content should be `success`.'
  )
})

test('utils.fs.read', async t => {
  const tmp = path.join(tmpDir, '2.txt')
  await utils.fs.write(tmp, 'success')
  const cnt = await utils.fs.read(tmp)

  t.is(cnt, 'success', 'File content should be `success`.')
})

test('utils.fs.remove', async t => {
  const tmp = path.join(tmpDir, '4.txt')
  await utils.fs.write(tmp, 'success')
  await utils.fs.remove(tmp)

  t.false(fs.existsSync(tmp), 'File should not exist.')
})

test('utils.fs.remove error', async t => {
  try {
    const tmp = path.join(tmpDir, '14.txt')
    await utils.fs.remove(tmp)
    t.fail('should error')
  } catch (err) {
    if (err.code === 'ENOENT') {
      t.pass()
    }
  }
})

test('utils.fs.copy', async t => {
  try {
    const tmp = path.join(tmpDir, '5.txt')
    await utils.fs.write(tmp, 'success')
    const target = path.join(
      __dirname,
      'fixtures/mdirp-copy/mdirp1/mdirp2/5-copy.txt'
    )
    await utils.fs.copy({from: tmp, to: target})
    t.pass()
  } catch (err) {
    t.fail(err)
  }
})

test('utils.fs.list', async t => {
  try {
    const list = await utils.fs.list(path.join(__dirname, 'fixtures/'), [
      'mdirp1',
      '5.txt'
    ])
    console.log(list)
    t.pass()
  } catch (err) {
    t.fail(err)
  }
})

test('utils.fs.isEmptyDir', async t => {
  const ret = await utils.fs.isEmptyDir(tmpDir)
  t.false(ret)
})

test('utils.fs.isEmptyDir not empty', async t => {
  const ret = await utils.fs.isEmptyDir(path.join(tmpDir, 'not-exist'))
  t.true(ret)
})

// Promisify
const twice = (data, callback) => {
  if (!callback) {
    throw new Error('No callback')
  }
  setTimeout(() => {
    callback(null, data * 2)
  })
}

const twiceError = (data, callback) => {
  if (!callback) {
    throw new Error('No callback')
  }
  setTimeout(() => {
    callback(new Error('Invalid'))
  })
}

test('utils.promisify', async t => {
  try {
    const pfn = utils.promisify(twice)
    await pfn(5)
    t.pass()
  } catch (err) {
    t.fail(err)
  }
})

test('utils.promisify with error', async t => {
  try {
    const pfn = utils.promisify(twiceError)
    await pfn(5)
    t.fail()
  } catch (err) {
    t.is(err.message, 'Invalid')
  }
})

// Logger
test('utils.logger levels', t => {
  try {
    const logger = new utils.Logger()
    logger.debug('!! should not show.')
    logger.level = 'debug'
    logger.debug('aa')
    logger.info({
      x: 1,
      fn() {
        console.log(1)
      }
    })
    logger.warn('aa')
    logger.error('aa')
    t.pass()
  } catch (err) {
    console.log(err)
    t.fail()
  }
})

// Path
const tmp1 = path.join(__dirname, './fixtures/mdirp')
const tmp2 = './fixtures/mdirp'
// T const tmp3 = 'mdirp'
// T const tmp4 = 'http://fixtures/mdirp/x.git'

test('utils.path', t => {
  t.true(utils.path.isAbsolute(tmp1))
  t.false(utils.path.isAbsolute(tmp2))

  t.false(utils.path.isRelative(tmp1))
  t.true(utils.path.isRelative(tmp2))
})

// Sequence
test('utils.sequence', async t => {
  const task1 = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('ret1')
      }, 200)
    })
  }
  const task2 = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('ret2')
      }, 200)
    })
  }
  const task3 = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('ret3')
      }, 200)
    })
  }

  const ret = await utils.sequence([task3, task2, task1])
  t.deepEqual(ret, ['ret3', 'ret2', 'ret1'])
})

// Style
test('utils.style', t => {
  const styles = [
    'bold',
    'italic',
    'underline',
    'inverse',
    'white',
    'grey',
    'black',
    'blue',
    'cyan',
    'green',
    'magenta',
    'red',
    'yellow'
  ]

  styles.map(s => {
    return t.true(utils.style[s] !== undefined, `utils.style.${s} exists`)
  })
})
