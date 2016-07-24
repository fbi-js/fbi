import test from 'ava'

test('foo', t => {
  t.pass()
})

test('bar', async t => {
  const bar = Promise.resolve('bar')

  t.is(await bar, 'bar')
})

test('Demo test', t => {
  const a = /foo/
  const b = 'bar'
  const c = 'baz'
  t.true(a.test(b) || b === c)
})