import test from 'ava'
import { style } from '../../lib/utils'

test('style', t => {
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
    return t.true(style[s] !== undefined, `style.${s} exists`)
  })
})
