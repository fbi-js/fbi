'use strict';

var Fbi = require('./fbi');
var fbi = new Fbi([]);

var index = {
  run: function run(tasks) {
    var _test;

    return Promise.resolve().then(function () {
      _test = Array.isArray(tasks);

      if (!(_test && !tasks.length)) {
        return Promise.resolve().then(function () {
          if (typeof tasks === 'string') {
            tasks = [tasks];
          }

          fbi.argvs = tasks;

          return fbi.config();
        }).then(function () {
          return fbi.run();
        });
      }
    }).then(function () {});
  }
};

module.exports = index;