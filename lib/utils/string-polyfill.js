module.exports = () => {
  // https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart

  if (!String.prototype.padStart) {
    String.prototype.padStart = function (targetLength, padString) {
      targetLength >>= 0 // Floor if number or convert non-number to 0;
      padString = String(padString || ' ')
      if (this.length > targetLength) {
        return String(this)
      }
      targetLength -= this.length
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length) // Append to original to ensure we are longer than needed
      }
      return padString.slice(0, targetLength) + String(this)
    }
  }

  // https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd
  if (!String.prototype.padEnd) {
    String.prototype.padEnd = function (targetLength, padString) {
      targetLength >>= 0 // Floor if number or convert non-number to 0;
      padString = String(padString || ' ')
      if (this.length > targetLength) {
        return String(this)
      }
      targetLength -= this.length
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length) // Append to original to ensure we are longer than needed
      }
      return String(this) + padString.slice(0, targetLength)
    }
  }
}
