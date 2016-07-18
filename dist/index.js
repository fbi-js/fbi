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

var _ = _interopRequireWildcard(_utils);

var _create = require('./tasks/create');

var _create2 = _interopRequireDefault(_create);

var _serve = require('./tasks/serve');

var _serve2 = _interopRequireDefault(_serve);

var _build = require('./tasks/build');

var _build2 = _interopRequireDefault(_build);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defTasks = [{
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
    this.config = _config2.default;
    this.tasks = [];
    this.addTask(defTasks);
  }

  (0, _createClass3.default)(Fbi, [{
    key: 'run',
    value: function run(uCmds) {
      var _this = this;

      var argvs = uCmds || this.argvs;
      var cmds = [];
      var cmdsExecuted = [];

      if (typeof argvs === 'string') {
        cmds.push(argvs);
      } else {
        cmds = argvs;
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        var _loop = function _loop() {
          var cmd = _step.value;

          _this.tasks.map(function (task) {
            if (cmd === task.name || cmd === task.short) {
              cmdsExecuted.push(cmd);
              _this._.log('Running task \'' + task.name + '\'');
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

      var difference = cmds.concat(cmdsExecuted).filter(function (v) {
        return !cmds.includes(v) || !cmdsExecuted.includes(v);
      });
      if (difference.length) {
        this._.log('Error: Commands \'' + difference + '\' not found.');
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

// constructor(){
//   (async function() {
//     console.log('async in')
//     await _this.mergeCfg()
//   }())
//   this.init()
// }

// static staticMethod () {
//   return 'static method'
// }
//# sourceMappingURL=index.js.map