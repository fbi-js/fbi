const Fbi = require('fbi').default
const fbi = new Fbi()

fbi.addTask([{
  name: 'custom',
  short: 'c',
  fn: function (ctx) {
    // console.log(ctx)
  }
}, {
  name: 'custom-aaa',
  short: 'caaa',
  fn: function (ctx) {
    // console.log(ctx)
  }
}])

fbi.run(['c', 'caaa'])
