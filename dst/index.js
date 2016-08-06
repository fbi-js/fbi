'use strict';

var Cli = require('./cli');
var cli = new Cli([]);

var index = {
  run: function run(cmds) {
    var _test;

    return Promise.resolve().then(function () {
      _test = Array.isArray(cmds);

      if (!(_test && !cmds.length)) {
        if (typeof cmds === 'string') {
          cmds = [cmds];
        }

        cli.argvs = cmds;
      }
    });
  }
};

module.exports = index;