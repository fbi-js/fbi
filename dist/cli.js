'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

<<<<<<< HEAD
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
=======
var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');
>>>>>>> 0cd192e0eba8f45a996a02a06123145b444a7ef3

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

<<<<<<< HEAD
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
=======
var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _help = require('./tasks/help');

var _help2 = _interopRequireDefault(_help);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cli = function (_Fbi) {
  (0, _inherits3.default)(cli, _Fbi);

  function cli(argvs) {
    (0, _classCallCheck3.default)(this, cli);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(cli).call(this));

    _this.argvs = argvs;
    _this.tasks = {};

    _this.run();
    return _this;
  }

  (0, _createClass3.default)(cli, [{
    key: 'run',
    value: function run() {
      if (!this.argvs.length) {
        return (0, _help2.default)();
      }
>>>>>>> 0cd192e0eba8f45a996a02a06123145b444a7ef3

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

<<<<<<< HEAD
          case 42:
            _context.prev = 42;

            if (!_didIteratorError) {
              _context.next = 45;
=======
      try {
        for (var _iterator = (0, _getIterator3.default)(this.argvs), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var cmd = _step.value;

          switch (cmd) {
            case '-v':
              fbi.utils.log(_package2.default.version);
>>>>>>> 0cd192e0eba8f45a996a02a06123145b444a7ef3
              break;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
<<<<<<< HEAD

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
=======
          }
        }
      }
>>>>>>> 0cd192e0eba8f45a996a02a06123145b444a7ef3

      console.log('run: ');
      // console.log(this.argv)
      console.log(this.cfg);
      console.log(this.isFbi);
    }
  }]);
  return cli;
}(_index2.default);

exports.default = cli;
//# sourceMappingURL=cli.js.map