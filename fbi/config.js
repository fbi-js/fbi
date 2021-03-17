module.exports = {
  template: 'npm-module',
  templateDescription: 'Npm module template, build via rollup.',
  npm: {
    alias: 'npm',
    options: '', // --registry=https://registry.npm.taobao.org'
  },
  alias: {
    b: 'build',
    w: 'watch'
  },
  dist: './lib/',
  rollup: {
    entry: [
      'cli.js',
      'module.js',
      'task.js',
      'template.js',
      'helpers/copy.js',
      'helpers/helps.js',
      'helpers/utils.js',
      'config/options.js'
    ], // files will be bundle independently
    format: 'cjs', // 'amd', 'cjs', 'es', 'iife', 'umd'
    moduleName: '', // for UMD/IIFE bundles: var MyBundle = (function () {...
    moduleId: '', // for AMD/UMD bundles: define('my-bundle',...
    banner: `
/*
  fbi v2.1.2
  Node.js workflow tool.

  Author: neikvon
  Built:  ${new Date().toLocaleString()} via fbi

  Copyright 2016 neikvon
*/`,
    footer: '',
  }
}
