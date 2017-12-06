/**
 * Deep assign
 *
 * @param {object} target
 * @returns
 */
function assign(target) {
  const sources = [].slice.call(arguments, 1)
  sources.forEach(source => {
    for (const p in source) {
      if (typeof source[p] === 'object') {
        if (target === null || target === undefined) {
          target = {}
        } else if (target[p] === null || target[p] === undefined) {
          if (source[p] === null) {
            target[p] = source[p]
            continue
          } else {
            target[p] = {}
          }
        }
        target[p] = source[p]

        assign(target[p], source[p])
      } else if (target === null || target === undefined) {
        if (source[p] === undefined) {
          target = source
        } else {
          target = {}
          target[p] = source[p]
        }
        continue
      } else {
        target[p] = source[p]
      }
    }
  })
  return target
}

module.exports = assign
