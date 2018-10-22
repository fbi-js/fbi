import test from 'ava'
import { sequence } from '../../lib/utils'

test('sequence', async t => {
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

  const ret = await sequence([task3, task2, task1])
  t.deepEqual(ret, ['ret3', 'ret2', 'ret1'])
})
