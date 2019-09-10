function stringToObject (str) {
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

function parseSingleCmd (input) {
  const key = '--argv'
  const idx = input.indexOf(key)
  if (idx == -1) {
    return input
  }
  else {
    input = input.slice(0, idx).concat(`${key}=${input.slice(idx + 1).join(' ')}`)
  }
  return input
}
/**
 * Argvs Parse
 *
  Input : `init vue@1.2.0 vue-project --all -D`
  Output:
  {
    "tasks": [
      "init",
      "vue@1.2.0",
      "vue-project"
    ],
    "mode": {
      "debug": true
    },
    "params": {
      "all": true
    }
  }

  Input :   `serve -port=9000 -test deploy -ip=10.11.11.11 -silent`
  Output:
  {
    "tasks": [
      {
        "name": "fbi",
        "params": {}
      },
      {
        "name": "serve",
        "params": {
          "port": "9000",
          "test": true
        }
      },
      {
        "name": "deploy",
        "params": {
          "ip": "10.11.11.11",
          "silent": true
        }
      }
    ],
    "mode": {},
    "params": {}
  }
 * @param {any} [{inputs, filters, native}={}]
 * @returns
 */
module.exports = ({ inputs, filters, native } = {}) => {
  const prefix = '--'
  const prefix2 = '-'
  const tasks = []
  const mode = {}
  const params = {}
  if (!inputs || inputs.length < 1) {
    return { tasks, mode }
  }
  
  inputs = parseSingleCmd(inputs)
  inputs.reduce((prev, curr) => {
    const startsWithPrefix = curr.startsWith(prefix) || curr.startsWith(prefix2)
    const _prefix = curr.startsWith(prefix) ? prefix : prefix2
    if (startsWithPrefix) {
      const obj = stringToObject(curr)
      if (filters && filters[obj.key]) {
        mode[filters[obj.key]] = obj.value
      } else if (obj.key.replace(_prefix, '')) {
        if (native) {
          params[obj.key.replace(_prefix, '')] = obj.value
        } else if (tasks[tasks.length - 1]) {
          tasks[tasks.length - 1].params[obj.key.replace(_prefix, '')] =
            obj.value
        }
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

  return { tasks, mode, params }
}
