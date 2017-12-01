/**
 * Datetime format
 *
 * @param {string|date} s
 * @param {string} pattern
 * @returns
 */
module.exports = (s, pattern) => {
  const two = numStr => ('00' + numStr).slice(-2)
  const get = str => (str instanceof Date ? str : new Date(str))

  const date = get(s)
  const dateObj = {
    YYYY: date.getFullYear(),
    YY: two(date.getFullYear()),
    MM: two(date.getMonth() + 1),
    M: date.getMonth() + 1,
    DD: two(date.getDate()),
    D: date.getDate(),
    hh: two(date.getHours()),
    h: date.getHours(),
    mm: two(date.getMinutes()),
    m: date.getMinutes(),
    ss: two(date.getSeconds()),
    s: date.getSeconds()
  }

  const pieces = pattern.split(/(-|\.|[\u4e00-\u9fa5]{1}| |\/|:)/)
  const ret = pieces.map(it => {
    return dateObj[it] || it
  })

  return ret.join('')
}
