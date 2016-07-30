var arr = ["bus", "-d", "-p", "as", "-w", "dskj", "-fkdl"]
var ret = {}

console.log(arr)

arr.reduce((prev, curr, idx, ary) => {

  if (curr.indexOf('-') === 0) {
    console.log(curr + ' =>' + prev)
    if (ret[prev]) {
      if (Array.isArray(ret[prev]['param'])) {
        ret[prev]['param'].push(curr)
      } else {
        ret[prev]['param'] = [curr]
      }
    }

    return prev
  } else {
    ret[curr] = {}
    return curr
  }

}, arr[0])

console.log('arr')
console.log(arr)
console.log('ret')
console.log(JSON.stringify(ret, null, 2))