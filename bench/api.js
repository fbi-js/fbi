const Fbi = require('../dst/fbi')
const fbi = new Fbi()

// fbi.config = {
//   template: 'd'
// }

// console.log(fbi.config)

// fbi.run(['build'])

// fbi.run('build')

// fbi.run('b', {
//   pre() {
//     console.log('pre build')
//   },
//   post() {
//     console.log('post build')
//   }
// })

fbi.version()
fbi.list()

fbi.run(ctx => {
  console.log('this is fn alone A')
})

fbi.run(function () {
  console.log('this is fn alone B')
})

fbi.run({
  a() {
    console.log('fn a')
  },
  b() {
    console.log('fn b')
  },
  c(ctx) {
    console.log('fn c')
    console.log(ctx.isfbi)
  }
})

// fbi.run(function(){
//   console.log('this is custom task')
// })
// .list()
