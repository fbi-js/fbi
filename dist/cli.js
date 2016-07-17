'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(cmds) {
    var stop, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, cmd;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(cmds.length === 0)) {
              _context.next = 3;
              break;
            }

            _index2.default.help();
            return _context.abrupt('return');

          case 3:
            stop = false;
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 7;
            _iterator = (0, _getIterator3.default)(cmds);

          case 9:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 35;
              break;
            }

            cmd = _step.value;

            if (!stop) {
              _context.next = 13;
              break;
            }

            return _context.abrupt('continue', 32);

          case 13:
            _context.t0 = cmd;
            _context.next = _context.t0 === 'n' ? 16 : _context.t0 === 'new' ? 16 : _context.t0 === 's' ? 19 : _context.t0 === 'serve' ? 19 : _context.t0 === 'w' ? 22 : _context.t0 === 'watch' ? 22 : _context.t0 === '-v' ? 24 : _context.t0 === '-V' ? 24 : _context.t0 === '--version' ? 24 : _context.t0 === '-h' ? 27 : _context.t0 === '--help' ? 27 : 30;
            break;

          case 16:
            _context.next = 18;
            return _index2.default.new();

          case 18:
            return _context.abrupt('break', 32);

          case 19:
            _context.next = 21;
            return _index2.default.serve();

          case 21:
            return _context.abrupt('break', 32);

          case 22:
            _index2.default.watch();
            return _context.abrupt('break', 32);

          case 24:
            stop = true;
            _index2.default.version();
            return _context.abrupt('break', 32);

          case 27:
            stop = true;
            _index2.default.help();
            return _context.abrupt('break', 32);

          case 30:
            _index2.default.run();
            return _context.abrupt('break', 32);

          case 32:
            _iteratorNormalCompletion = true;
            _context.next = 9;
            break;

          case 35:
            _context.next = 41;
            break;

          case 37:
            _context.prev = 37;
            _context.t1 = _context['catch'](7);
            _didIteratorError = true;
            _iteratorError = _context.t1;

          case 41:
            _context.prev = 41;
            _context.prev = 42;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 44:
            _context.prev = 44;

            if (!_didIteratorError) {
              _context.next = 47;
              break;
            }

            throw _iteratorError;

          case 47:
            return _context.finish(44);

          case 48:
            return _context.finish(41);

          case 49:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[7, 37, 41, 49], [42,, 44, 48]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=cli.js.map