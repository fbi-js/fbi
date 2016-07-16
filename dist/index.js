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
  serve: function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return (0, _utils.isfbi)(_config2.default.paths.config);

            case 3:
              usrConfig = _context.sent;
              _context.next = 6;
              return require('./lib/serve').default(usrConfig);

            case 6:
              _context.next = 11;
              break;

            case 8:
              _context.prev = 8;
              _context.t0 = _context['catch'](0);

              (0, _utils.log)(_context.t0);

            case 11:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined, [[0, 8]]);
    }));

    return function serve() {
      return _ref.apply(this, arguments);
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