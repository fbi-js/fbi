const copy = require('./helpers/copy')
const clean = require('./helpers/clean')
const complier = require('./helpers/complier')

process.env.NODE_ENV = 'production'
clean()
complier()
copy()
