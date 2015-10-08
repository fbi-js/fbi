/*
 * fbi
 *
 * Copyright (c) 2015 Inman <neikvon@icloud.com>
 * Licensed under the MIT license.
 */

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var isWindows = process.platform === 'win32' || process.platform === 'win64';

// get node_modules path
// un use
var getNpmPaths = function() {
  var npmPath = '';

  if (isWindows) {
    npmPath = path.join(process.env.APPDATA, 'npm/node_modules');
  } else {
    // npmPath = '/usr/lib/node_modules';
    npmPath = '/usr/local/lib/node_modules';
  }

  return npmPath;
};

// json extend
function extendJson(destination, source) {
  for (var property in source) {
    destination[property] = source[property];
  }
  return destination;
}

function isExist(src) {
  if (src && src !== '') {
    return fs.existsSync(src);
  } else {
    console.log(chalk.red('plz provide the path'));
  }
}

// merge array
function arrayMerge(from, to) {
  return from.reduce(function(col, item) {
    col.push(item);
    return col;
  }, to);
}

function createBlank(num) {
  if (isNaN(num) || num < 0) {
    return '';
  }
  var ret = '';
  for (var i = 0; i < num; i++) {
    ret += ' ';
  }
  return ret;
}

// {} es5
function isJsonEmpty(obj) {
    return Object.keys(obj).length === 0;
}

module.exports = {
  getNpmPaths: getNpmPaths,
  extendJson: extendJson,
  arrayMerge: arrayMerge,
  createBlank: createBlank,
  isExist: isExist,
  isJsonEmpty: isJsonEmpty
};
