import babel from 'rollup-plugin-babel'
import json from 'rollup-plugin-json'

let pkg = require('./package.json');
let external = Object.keys(pkg.dependencies).concat([
  'fs',
  'util',
  'path',
  'child_process',
  'readline',
  'vm',
  './fbi'
]);

export default {
  entry: `src/${process.env.entry}.js`,
  format: 'cjs',
  plugins: [
    json(),
    babel(),
  ],
  external: external,
  dest: `dst/${process.env.entry}.js`
}