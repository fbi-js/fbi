const {spawn} = require('child_process')

/**
 * `child_process.spawn`
 *
 * @param {string} str full command string
 * @param {object} [{ cwd = '.' }={}]
 * @returns
 */
module.exports = (str, opts = {}, _logger) => {
  if (!str) {
    return
  }

  opts = Object.assign({cwd: '.', stdio: 'pipe'}, opts)

  const logger = _logger || {debug: () => {}, log: console.log}

  return new Promise((resolve, reject) => {
    const cmds = str.split(' ').filter(c => Boolean(c))
    logger.debug('Exec cmds:', cmds)
    logger.debug('Exec opts:', opts)
    const main = cmds[0]
    const params = cmds.slice(1)
    const cmd = spawn(main, params, opts)

    if (cmd.stdout) {
      cmd.stdout.on('data', data => {
        resolve(data.toString().trim())
      })
    }

    if (cmd.stderr) {
      cmd.stderr.on('data', err => {
        logger.debug('err:', err.toString())
        // Execution error
        reject(err.toString())
      })
    }

    cmd.on('close', code => {
      if (code !== 0) {
        reject(new Error(`Error with status ${code}.`))
      }
      return resolve()
    })

    cmd.on('error', err => {
      // Command not found
      logger.debug('err :', err)
      reject(new Error(`Command not found \`${str}\``))
    })
  })
}
