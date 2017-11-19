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
        if ((target[p] === null || target[p] === undefined) && (source[p] === null || source[p] === undefined)) {
          target[p] = null
        } else {
          target[p] = target[p] || (Array.isArray(source[p]) ? [] : {})
        }
        assign(target[p], source[p])
      } else {
        target[p] = source[p]
      }
    }
  })
  return target
}

module.exports = assign
