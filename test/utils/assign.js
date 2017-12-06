import test from 'ava'
import {assign} from '../../lib/utils'

test('normal', t => {
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
  assign(a, b, c)
  t.deepEqual(a, ret, 'assign error')
})

test('target null', t => {
  const a = null
  const b = {d: 2}
  const ret = assign(a, b)

  t.deepEqual(ret, {d: 2}, 'null item error')
  t.deepEqual(a, null, 'null item error')
})

test('target null & source item null', t => {
  const a = null
  const b = {d: null}
  const ret = assign(a, b)
  t.deepEqual(ret, {d: null}, 'null item error')
  t.deepEqual(a, null, 'null item error')
})

test('target null & source item undefined', t => {
  const a = null
  const b = {d: undefined}
  const ret = assign(a, b)

  t.deepEqual(ret, {d: undefined}, 'null item error')
  t.deepEqual(a, null, 'null item error')
})

test('target item null & source item undefined', t => {
  const a = {
    x: null
  }
  const b = {d: 2, x: undefined}
  const ret = {
    x: undefined,
    d: 2
  }
  assign(a, b)
  t.deepEqual(a, ret, 'null item error')
})

test('target item undefined & source item null', t => {
  const a = {
    x: undefined
  }
  const b = {d: 2, x: null}
  const ret = {
    x: null,
    d: 2
  }
  assign(a, b)
  t.deepEqual(a, ret, 'null item error')
})

test('target item undefined', t => {
  const a = {
    x: undefined
  }
  const b = {d: 2, x: 1}
  const ret = {
    x: 1,
    d: 2
  }
  assign(a, b)
  t.deepEqual(a, ret, 'null item error')
})

test('target item null', t => {
  const a = {
    x: null
  }
  const b = {d: 2, x: {y: 1}}
  const ret = {
    x: {y: 1},
    d: 2
  }
  assign(a, b)
  t.deepEqual(a, ret, 'null item error')
})

test('target item undefined & source item undefined', t => {
  const a = {
    x: undefined
  }
  const b = {d: 2, x: undefined}
  const ret = {
    x: undefined,
    d: 2
  }
  assign(a, b)
  t.deepEqual(a, ret, 'null item error')
})

test('item boolean both true', t => {
  const a = {
    x: true
  }
  const b = {d: 2, x: true}
  const ret = {
    x: true,
    d: 2
  }
  assign(a, b)
  t.deepEqual(a, ret, 'error')
})

test('item boolean diff', t => {
  const a = {
    x: true
  }
  const b = {d: 2, x: false}
  const ret = {
    x: false,
    d: 2
  }
  assign(a, b)
  t.deepEqual(a, ret, 'item boolean error')
})

test('item function', t => {
  const a = {
    x: 1
  }
  const b = {
    d: 2,
    x() {
      console.log('y')
    }
  }
  const ret = {
    x() {
      console.log('y')
    },
    d: 2
  }
  assign(a, b)

  t.is(ret.d, b.d, 'item function error')
  t.is(typeof ret.x.toString, 'function', 'item function error')
})

test('item object', t => {
  const a = {
    x: {}
  }
  const b = {d: 2}
  const ret = {
    x: {},
    d: 2
  }
  assign(a, b)
  t.deepEqual(a, ret, 'item object error')
})

test('item array', t => {
  const a = {
    x: false
  }
  const b = {d: 2, x: [3, 4]}
  const ret = {
    x: [3, 4],
    d: 2
  }
  assign(a, b)

  t.deepEqual(a, ret, 'item array error')
})
