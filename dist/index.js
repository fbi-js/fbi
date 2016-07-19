'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _utils = require('./utils');

<<<<<<< HEAD
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
=======
var _ = _interopRequireWildcard(_utils);

var _help = require('./tasks/help');

var _help2 = _interopRequireDefault(_help);

var _create = require('./tasks/create');

var _create2 = _interopRequireDefault(_create);

var _serve = require('./tasks/serve');

var _serve2 = _interopRequireDefault(_serve);

var _build = require('./tasks/build');

var _build2 = _interopRequireDefault(_build);

var _version = require('./tasks/version');

var _version2 = _interopRequireDefault(_version);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defTasks = [{
  name: '--help',
  short: '-h',
  fn: _help2.default
}, {
  name: '--version',
  short: '-v',
  fn: _version2.default
}, {
  name: 'new',
  short: 'n',
  fn: _create2.default
}, {
  name: 'build',
  short: 'b',
  fn: _build2.default
}, {
  name: 'serve',
  short: 's',
  fn: _serve2.default
}];
// fbi tasks

// fbi assets


var Fbi = function () {
  function Fbi() {
    (0, _classCallCheck3.default)(this, Fbi);

    this._ = _;
    this.cfg = _config2.default;
    this.help = _help2.default;
    this.tasks = [];

    // (async function() {
    //   console.log('async in')
    //   await _this.mergeCfg()
    // }())
    this.init();
    this.addTask(defTasks);
  }

  (0, _createClass3.default)(Fbi, [{
    key: 'run',
    value: function run(argvs) {
      var _this = this;

      var cmds = [];
      if (!argvs.length) {
        this.help(this);
        return;
      }

      if (typeof argvs === 'string') {
        cmds.push(argvs);
      } else {
        cmds = argvs;
      }

      var utilTasks = ['-h', '--help', '-v', '--verison']; // don't log

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        var _loop = function _loop() {
          var cmd = _step.value;

          _this.tasks.map(function (task) {
            if (cmd === task.name || cmd === task.short) {
              if (!utilTasks.includes(task.name) && !utilTasks.includes(task.short)) {
                console.log('Running task \'' + task.name + '\'');
              }
              task.fn(_this);
            }
          });
        };

        for (var _iterator = (0, _getIterator3.default)(cmds), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          _loop();
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
    }
  }, {
    key: 'init',
    value: function init() {
      // is fbi or not
      // get user config
      try {
        var _path = this._.cwd(this.cfg.paths.options);
        _fs2.default.accessSync(_path, _fs2.default.R_OK | _fs2.default.W_OK);
        this.isFbi = true;
        var usrCfg = require(_path);
        this._.merge(this.cfg, usrCfg);
      } catch (e) {
        this.isFbi = false;
      }
    }
  }, {
    key: 'addTask',
    value: function addTask(task) {
      if (Array.isArray(task)) {
        this.tasks = this.tasks.concat(task);
      } else {
        this.tasks.push(task);
      }
    }
  }]);
  return Fbi;
}();

exports.default = Fbi;
>>>>>>> 0cd192e0eba8f45a996a02a06123145b444a7ef3
//# sourceMappingURL=index.js.map