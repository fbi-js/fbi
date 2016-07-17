'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _utils = require('../utils');

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function templateQuestions() {
  return new _promise2.default(function (resolve, reject) {
    _inquirer2.default.prompt({
      type: 'list',
      name: 'action',
      message: 'choose',
      choices: ['select a template', 'new template']
    }).then(function (ans) {
      if (ans.action === 'select a template') {
        // select
        _inquirer2.default.prompt({
          type: 'list',
          name: 'tmpl',
          message: 'choose one',
          choices: ['fbi-template-h5-pc', 'fbi-template-h5-mobile', 'fbi-template-vue', 'fbi-template-react', 'fbi-template-angular']
        }).then(function (ret) {
          resolve(ret);
        });
      } else {
        // new
        _inquirer2.default.prompt({
          type: 'input',
          name: 'url',
          message: 'where is the template?'
        }).then(function (ret) {
          resolve(ret);
        });
      }
    });
  });
}

function overwriteQuestions() {
  return new _promise2.default(function (resolve, reject) {
    _inquirer2.default.prompt({
      type: 'confirm',
      name: 'overwrite',
      default: false,
      message: 'Current folder is a fbi project, do you want overwrite it?'
    }).then(function (ans) {
      resolve(ans);
    });
  });
}

exports.default = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ucfg) {
    var data, ow;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            (0, _utils.merge)(_config2.default, ucfg);

            _context.next = 3;
            return templateQuestions();

          case 3:
            data = _context.sent;

            (0, _utils.log)(data);

            if (!data.tmpl) {
              _context.next = 13;
              break;
            }

            if (!ucfg) {
              _context.next = 11;
              break;
            }

            _context.next = 9;
            return overwriteQuestions();

          case 9:
            ow = _context.sent;

            (0, _utils.log)(ow);

          case 11:
            _context.next = 14;
            break;

          case 13:
            if (data.url) {}

          case 14:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=new.js.map