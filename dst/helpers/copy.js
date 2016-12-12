
require('source-map-support').install();
    
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var __utils_js = require('./utils.js');

function __async(g){return new Promise(function(s,j){function c(a,x){try{var r=g[x?"throw":"next"](a);}catch(e){j(e);return}r.done?s(r.value):Promise.resolve(r.value).then(c,d);}function d(e){c(e,1);}c();})}

let ignore = [];

var copy = (src, dst, ign) => __async(function*(){
  try {
    ignore = ign || ignore;

    yield copy$1(src, dst, walk);
  } catch (e) {
    throw e
  }
}());

function copy$1(src, dst, cb) {return __async(function*(){
  try {
    const _exist = yield __utils_js.exist(dst);
    if (!_exist) {
      // fs.mkdirSync(dst)
      yield __utils_js.mkdir(dst);
    }
    yield walk(src, dst);
  } catch (e) {
    throw e
  }
}())}

function walk(src, dst) {return __async(function*(){
  try {
    const _stats = yield stats(src);
    if (_stats.isDirectory()) {
      const files = yield __utils_js.readDir(src, ignore);
      return Promise.all(files.map(f => __async(function*(){
        let
          _src = __utils_js.join(src, f),
          _dst = __utils_js.join(dst, f),
          stat = yield stats(_src);

        if (stat.isDirectory()) {
          yield copy$1(_src, _dst, walk);
        } else {
          __utils_js.copyFile(_src, _dst, true);
        }
      }())))
    } else {
      return __utils_js.copyFile(src, __utils_js.join(dst, __utils_js.basename(src)), true)
    }
  } catch (e) {
    throw e
  }
}())}

function stats(src) {
  return new Promise((resolve, reject) => {
    fs.stat(src, (err, stats) => {
      return err ? reject(err) : resolve(stats)
    });
  })
}

module.exports = copy;
// this is outro
// this is footer
//# sourceMappingURL=copy.js.map
