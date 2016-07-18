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
            console.log(cmds);

            if (!(cmds.length === 0)) {
              _context.next = 4;
              break;
            }

            _index2.default.help();
            return _context.abrupt('return');

          case 4:
            stop = false;
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 8;
            _iterator = (0, _getIterator3.default)(cmds);

          case 10:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 33;
              break;
            }

            cmd = _step.value;

            if (!stop) {
              _context.next = 14;
              break;
            }

            return _context.abrupt('continue', 30);

          case 14:
            _context.t0 = cmd;
            _context.next = _context.t0 === 's' ? 17 : _context.t0 === 'serve' ? 17 : _context.t0 === 'w' ? 20 : _context.t0 === 'watch' ? 20 : _context.t0 === '-v' ? 22 : _context.t0 === '-V' ? 22 : _context.t0 === '--version' ? 22 : _context.t0 === '-h' ? 25 : _context.t0 === '--help' ? 25 : 28;
            break;

          case 17:
            _context.next = 19;
            return _index2.default.serve();

          case 19:
            return _context.abrupt('break', 30);

          case 20:
            _index2.default.watch();
            return _context.abrupt('break', 30);

          case 22:
            stop = true;
            _index2.default.version();
            return _context.abrupt('break', 30);

          case 25:
            stop = true;
            _index2.default.help();
            return _context.abrupt('break', 30);

          case 28:
            _index2.default.run();
            return _context.abrupt('break', 30);

          case 30:
            _iteratorNormalCompletion = true;
            _context.next = 10;
            break;

          case 33:
            _context.next = 39;
            break;

          case 35:
            _context.prev = 35;
            _context.t1 = _context['catch'](8);
            _didIteratorError = true;
            _iteratorError = _context.t1;

          case 39:
            _context.prev = 39;
            _context.prev = 40;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 42:
            _context.prev = 42;

            if (!_didIteratorError) {
              _context.next = 45;
              break;
            }

            throw _iteratorError;

          case 45:
            return _context.finish(42);

          case 46:
            return _context.finish(39);

          case 47:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[8, 35, 39, 47], [40,, 42, 46]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=cli.js.map