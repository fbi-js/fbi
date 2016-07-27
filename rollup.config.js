import babel from 'rollup-plugin-babel'
import json from 'rollup-plugin-json'
import sourcemaps from 'rollup-plugin-sourcemaps'

let pkg = require('./package.json');
let external = Object.keys(pkg.dependencies).concat(['./fbi']);

export default {
  entry: `src/${process.env.entry}.js`,
  format: 'cjs',
  plugins: [json(), babel(), sourcemaps()],
  external: external,
  sourceMap: true,
  dest: `dst/${process.env.entry}.js`
}