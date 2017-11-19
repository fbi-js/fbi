const {Logger} = require('../utils')

module.exports = {
  init(vector, logger) {
    vector.on('exit', (...args) => {
      if (args && args.length > 0) {
        logger.error(...args)
      }
      process.exit(0)
    })
  }
}
