const Fbi = require('../dst/fbi')

// new Fbi()

// new Fbi.cli(['-v'])

// test run
// const fbi = new Fbi()
// fbi.run('myCmd')

// test add
new Fbi()
const a = new Fbi.module('tasks')

a.set('aaa', [1,2,3])

let all = a.getAll()

console.log(all)
console.log(a.get('aaa'))