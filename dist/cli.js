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

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

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

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(this.argvs), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var cmd = _step.value;

          switch (cmd) {
            case '-v':
              fbi.utils.log(_package2.default.version);
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
          }
        }
      }

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