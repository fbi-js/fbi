/**
 * Argvs Parse:
 *
  Command line:   $ fbi serve -port=9000 -test deploy -ip=10.11.11.11 -silent
  Input:          ['serve', '-port=9000', '-test', 'deploy', '-ip=10.11.11.11', '-silent']
  Return:
  [
    {
      name: 'serve',
      tasks: {
        port: 9000,
        test: true
      }
    },
    {
      name: 'deploy',
      tasks: {
        ip: '10.11.11.11',
        silent: true
      }
    }
  ]
 */
function parseArgvs(
  {inputs, filters, native, prefix = '--', prefix2 = '-'} = {}
) {
  const tasks = []
  const mode = {}
  if (!inputs || inputs.length <= 0) {
    return {tasks, mode}
  }

  inputs.reduce((prev, curr) => {
    if (curr.startsWith(prefix)) {
      const obj = stringToObject(curr)
      if (filters && filters[obj.key]) {
        mode[filters[obj.key]] = obj.value
      } else if (
        !native &&
        tasks[tasks.length - 1] &&
        obj.key.replace(prefix, '')
      ) {
        tasks[tasks.length - 1].params[obj.key.replace(prefix, '')] = obj.value
      }
      return prev
    } else if (curr.startsWith(prefix2)) {
      const obj = stringToObject(curr)
      if (filters && filters[obj.key]) {
        mode[filters[obj.key]] = obj.value
      } else if (
        !native &&
        tasks[tasks.length - 1] &&
        obj.key.replace(prefix2, '')
      ) {
        tasks[tasks.length - 1].params[obj.key.replace(prefix2, '')] = obj.value
      }
      return prev
    }
    if (native) {
      tasks.push(curr)
    } else {
      tasks.push({
        name: curr,
        params: {}
      })
    }
    return curr
  }, inputs[0])

  return {tasks, mode}
}

function stringToObject(str) {
  let key
  let value
  if (str.indexOf('=') > 0) {
    const peels = str.split('=')
    key = peels[0]
    value = peels[1] === 'true' ? true : peels[1] === 'false' ? false : peels[1]
  } else {
    key = str
    value = true
  }
  return {
    key,
    value
  }
}

module.exports = parseArgvs
