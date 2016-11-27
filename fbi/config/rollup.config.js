module.exports = (require, ctx) => {
  const buble = require('rollup-plugin-buble')
  const async = require('rollup-plugin-async')
  const json = require('rollup-plugin-json')
  const eslint = require('rollup-plugin-eslint')
  const fileSize = require('rollup-plugin-filesize')
  const eslintConfig = require('./config/eslint.config')(require, ctx)
  const bubleConfig = require('./config/buble.config')(require, ctx)

  return {
    entry: 'src/index.js',
    plugins: [
      eslint(eslintConfig),
      json(),
      async(),
      buble(bubleConfig),
      fileSize({
        render(options, size) {
          return size
        }
      }),
    ],
    onwarn: function () {},
  }
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