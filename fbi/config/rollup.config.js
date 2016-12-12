const buble = require('rollup-plugin-buble')
const async = require('rollup-plugin-async')
const json = require('rollup-plugin-json')
const eslint = require('rollup-plugin-eslint')
const eslintConfig = require('./eslint.config')
const bubleConfig = require('./buble.config')

module.exports = {
  entry: 'src/index.js',
  plugins: [
    eslint(eslintConfig),
    json(),
    async(),
    buble(bubleConfig)
  ],
  onwarn: function () {}
}

/* options:

  acorn
  banner
  cache
  context
  dest
  entry
  exports
  external
  footer
  format
  globals
  indent
  interop
  intro
  legacy
  moduleContext
  moduleId
  moduleName
  noConflict
  onwarn
  outro
  paths
  plugins
  preferConst
  sourceMap
  sourceMapFile
  targets
  treeshake
  useStrict

*/
