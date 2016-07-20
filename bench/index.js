const Fbi = require('../dist/').default
const fbi = new Fbi()

// let n = parseInt(process.env.MW || '1', 10);
// console.log(`  ${n} middleware`);

const tasks = {
  custom: {
    desc:'custom command',
    fn: function (ctx) {
      ctx.log('Success !!! custom', 1)
      // console.log(ctx)
    }
  },
  customA: {
    desc:'custom command',
    fn: function (ctx) {
      ctx.log('Success !!! ', 1)
      ctx.log(ctx)
    }
  },
  customB: {
    desc:'custom command',
    module: 'slash'
  }
}

const tmpls = {
  cusT1: 'http://google.com/h5pc',
  cusT2: 'http://google.com/h5pc'
}

fbi.add(tasks)
fbi.add(tmpls)

fbi.run('custom')
