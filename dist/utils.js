'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isfbi = exports.fsp = exports._ = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var isfbi = exports.isfbi = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(src) {
    var ret;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return fsp.exist(src);

          case 2:
            ret = _context.sent;
            return _context.abrupt('return', ret ? require(_.cwd(src)) : ret);

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function isfbi(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.log = log;
exports.merge = merge;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function log(msg) {
  console.log(msg);
}

var _ = exports._ = {
  cwd: function cwd() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var arr = [].slice.call(args || []);
    return _path2.default.join.apply(null, [process.cwd()].concat(arr));
  },

  join: function join() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var arr = [].slice.call(args || []);
    return _path2.default.join.apply(null, arr);
  },

  dir: function dir() {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    console.log('__dirname: ' + __dirname);
    var arr = [].slice.call(args || []);
    return _path2.default.join.apply(null, [__dirname].concat(arr));
  }
};

var fsp = exports.fsp = {
  exist: function exist(src) {
    return new _promise2.default(function (resolve, reject) {
      _fs2.default.access(_.cwd(src), _fs2.default.R_OK | _fs2.default.W_OK, function (err) {
        return err ? resolve(false) : resolve(true);
      });
    });
  }
};

function merge(target) {
  var sources = [].slice.call(arguments, 1);
  sources.forEach(function (source) {
    for (var p in source) {
      if ((0, _typeof3.default)(source[p]) === 'object') {
        target[p] = target[p] || (Array.isArray(source[p]) ? [] : {});
        merge(target[p], source[p]);
      } else {
        target[p] = source[p];
      }
    }
  });
  return target;
}
//# sourceMappingURL=utils.js.map