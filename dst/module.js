
/*
  fbi v2.1.2
  Node.js workflow tool.

  Author: neikvon
  Built:  2016-11-28 11:52:22 via fbi

  Copyright 2016 neikvon
*/
'use strict';

var __helpers_utils_js = require('./helpers/utils.js');

class Module {

  constructor(opts) {
    /**
     * modules find path:
     *
     * 1. current folder ＝> process.cwd()/node_modules
     * 2. template folder => data/templates/template/node_modules
     * 3. fbi global folder => data/node_modules
     * 4. system globale folder => username/node_modules
     */
    this.modulePaths = [__helpers_utils_js.cwd('node_modules')];
    if (opts.template) {
      this.modulePaths.push(
        __helpers_utils_js.join(opts.data.templates, opts.template, 'node_modules')
      );
    }
    this.modulePaths.push(__helpers_utils_js.join(opts.data.tasks, 'node_modules'));
    this.modulePaths.push(''); // global

    this.opts = opts;

    /*
    this.modulePaths:

     [
      '.../test/webpack-demo/node_modules',
      '.../fbi/data/templates/webpack-demo/node_modules',
      '.../fbi/data/tasks/node_modules',
      ''
    ]
   */
  }

  get(name, type) {
    let ret;

    if (__helpers_utils_js.isRelative(name)) {
      let localTasks;
      if (type === 'local') {
        localTasks = __helpers_utils_js.cwd(this.opts.paths.tasks);
        try {
          // local
          // const found = require.resolve(join(localTasks, name))
          ret = localTasks;
        } catch (e) {
          try {
            // template
            localTasks = __helpers_utils_js.join(this.opts.data.templates, this.opts.template, this.opts.paths.tasks);
            // const found = require.resolve(join(localTasks, name))
            ret = localTasks;
          } catch (e) {
            __helpers_utils_js.log(`can't find module ${name} in template '${this.opts.template}'`, 0);
          }
        }
      } else if (type === 'template') {
        try {
          // template
          localTasks = __helpers_utils_js.join(this.opts.data.templates, this.opts.template, this.opts.paths.tasks);
          // const found = require.resolve(join(localTasks, name))
          ret = localTasks;
        } catch (e) {
          __helpers_utils_js.log(`can't find module ${name} in template '${this.opts.template}'`, 0);
        }
      } else if (type === 'global') {
        try {
          // template
          localTasks = __helpers_utils_js.join(this.opts.data.tasks);
          // const found = require.resolve(join(localTasks, name))
          ret = localTasks;
        } catch (e) {
          __helpers_utils_js.log(`can't find module ${name} in global tasks folder`, 0);
        }
      }
    } else {
      this.modulePaths.map(item => {
        if (!ret) {
          try {
            require.resolve(__helpers_utils_js.join(item, name));
            ret = item;
          } catch (e) {}
        }
      });
    }
    return ret
  }
}

module.exports = Module;
