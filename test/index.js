const Fbi = require('fbi').default
const fbi = new Fbi({ type: 'vue', config: 'config.jss' })

var tasks = {
  custom: {
    short: 'c',
    fn: function (ctx) {
      // console.log(ctx)
    }
  },
  customA: {
    short: 'caaa',
    fn: function (ctx) {
      ctx.log(ctx)
    }
  },
  customB: {
    short: 'bbb',
    module: 'slash'
  }
}

var tmpls = {
  cusT1: 'http://google.com/h5pc',
  cusT2: 'http://google.com/h5pc'
}

// var nothing = {
//   a: 1,
//   b: 2,
//   c: 3
// }

// var nothing2 = 'this is nothing 2'


fbi.add(tasks)
fbi.add(tmpls)

// fbi.add(nothing)
// fbi.add(nothing2)

// fbi.run('c')
// fbi.run(['c', 'caaa'])

// const a = fbi.publicMethod()
// console.log(fbi)


fbi.run('customA')
