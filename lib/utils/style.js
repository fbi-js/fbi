const util = require('util')

const isWindows = process.platform === 'win32'

/**
 * Styles:
 *
 * bold, italic, underline, inverse, white, grey,
 * black, blue, cyan, green, magenta, red, yellow
 */
function colorize(color, text) {
  const codes = util.inspect.colors[color]
  return `\x1b[${codes[0]}m${text}\x1b[${codes[1]}m`
}
const style = {}
Object.keys(util.inspect.colors).map(c => {
  style[c] = text => {
    // fix display on windows
    if (['bold'].includes(c)) {
      return isWindows ? text : colorize(c, text)
    } else {
      return colorize(c, text)
    }
  }
  return true
})
style.normal = text => text

module.exports = style
