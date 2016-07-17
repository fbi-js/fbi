'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _utils = require('./utils');

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _help = '\n  Usage: fbi [command] [command] [command] ...\n\n  Commands:\n\n    n, new            new project\n    b, build          build project\n    s, serve          serve project or files\n\n  Options:\n\n    -h, --help        output usage information\n    -v, --version     output the version number\n';

var usrConfig = void 0;

var fbi = {
  addTask: function addTask() {
    (0, _utils.log)('add task');
  },
  new: function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.t0 = usrConfig;

              if (_context.t0) {
                _context.next = 6;
                break;
              }

              _context.next = 5;
              return (0, _utils.isfbi)(_config2.default.paths.config);

            case 5:
              _context.t0 = _context.sent;

            case 6:
              usrConfig = _context.t0;
              _context.next = 9;
              return require('./lib/new').default(usrConfig);

            case 9:
              _context.next = 14;
              break;

            case 11:
              _context.prev = 11;
              _context.t1 = _context['catch'](0);

              (0, _utils.log)(_context.t1);

            case 14:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined, [[0, 11]]);
    }));

    return function _new() {
      return _ref.apply(this, arguments);
    };
  }(),
  serve: function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.t0 = usrConfig;

              if (_context2.t0) {
                _context2.next = 6;
                break;
              }

              _context2.next = 5;
              return (0, _utils.isfbi)(_config2.default.paths.config);

            case 5:
              _context2.t0 = _context2.sent;

            case 6:
              usrConfig = _context2.t0;
              _context2.next = 9;
              return require('./lib/serve').default(usrConfig);

            case 9:
              _context2.next = 14;
              break;

            case 11:
              _context2.prev = 11;
              _context2.t1 = _context2['catch'](0);

              (0, _utils.log)(_context2.t1);

            case 14:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined, [[0, 11]]);
    }));

    return function serve() {
      return _ref2.apply(this, arguments);
    };
  }(),
  watch: function watch() {
    (0, _utils.log)('watch');
  },
  run: function run() {
    (0, _utils.log)('run');
  },
  help: function help() {
    (0, _utils.log)(_help);
  },
  version: function version() {
    var v = require('../package.json').version;
    (0, _utils.log)(v);
  }
};

exports.default = fbi;
//# sourceMappingURL=index.js.map