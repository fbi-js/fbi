/**
 * Run sequence tasks
 *
 * @param {array} tasks Things to do
 * @returns
 */
module.exports = tasks => {
  function recordValue(results, value) {
    results.push(value)
    return results
  }
  const pushValue = recordValue.bind(null, [])
  return tasks.reduce((promise, task) => {
    return promise.then(task).then(pushValue)
  }, Promise.resolve())
}
