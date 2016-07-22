import babel from 'rollup-plugin-babel'

let pkg = require('./package.json');
let external = Object.keys(pkg.dependencies);

export default {
  entry: 'src/fbi.js',
  format: 'cjs',
  plugins: [babel()],
  external: external,
  dest: 'dst/fbi.js'
}