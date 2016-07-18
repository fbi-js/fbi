'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Cli = function (_Fbi) {
  (0, _inherits3.default)(Cli, _Fbi);

  function Cli(argvs) {
    (0, _classCallCheck3.default)(this, Cli);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Cli).call(this));

    _this.argvs = argvs;

    _this.init();
    return _this;
  }

  (0, _createClass3.default)(Cli, [{
    key: 'init',
    value: function init() {
      this.initConfig();

      // help
      if (!this.argvs.length || this.argvs[0] === '-h' || this.argvs[0] === '--help') {
        help();
        return;
      }

      // show version
      if (this.argvs[0] === '-v' || this.argvs[0] === '--verison') {
        version();
        return;
      }

      (0, _get3.default)((0, _getPrototypeOf2.default)(Cli.prototype), 'run', this).call(this);
    }
  }, {
    key: 'initConfig',
    value: function initConfig() {
      try {
        var _path = this._.cwd(this.config.paths.options);
        _fs2.default.accessSync(_path, _fs2.default.R_OK | _fs2.default.W_OK);
        this.isFbi = true;
        var usrCfg = require(_path);
        this._.merge(this.config, usrCfg);
      } catch (e) {
        this.isFbi = false;
      }
    }
  }]);
  return Cli;
}(_index2.default);

exports.default = Cli;


var helpTxt = '\n  Usage: fbi [command] [command] [command] ...\n\n  Commands:\n\n    n, new            new project\n    b, build          build project\n    s, serve          serve project or files\n\n  Options:\n\n    -h, --help        output usage information\n    -v, --version     output the version number\n';

function help() {
  console.log(helpTxt);
}

function version() {
  console.log(_package2.default.version);
}
//# sourceMappingURL=cli.js.map