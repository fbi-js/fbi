const config = {
  presets: ['es2015', 'stage-3'],
  plugins: [
    'transform-object-rest-spread',
    'transform-function-bind',
    'transform-class-properties',
    'transform-decorators',
  ],
  sourceMaps: 'both',
};

if (process.NODE_ENV === 'production') {
  [
    'transform-react-constant-elements',
    'transform-react-inline-elements',
    'transform-node-env-inline',
    'remove-debugger',
    'remove-console',
  ].forEach(p => config.plugins.push(p));
  config.sourceMaps = false;
}

module.exports = config;