'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _koaViewer = require('koa-viewer');

var _koaViewer2 = _interopRequireDefault(_koaViewer);

var _koaStatic = require('koa-static');

var _koaStatic2 = _interopRequireDefault(_koaStatic);

var _utils = require('../utils');

var _serveError = require('./serve-error');

var _serveError2 = _interopRequireDefault(_serveError);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = new _koa2.default();

exports.default = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ucfg) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:

            (0, _utils.merge)(_config2.default, ucfg);

            // no fbi
            if (!ucfg || _config2.default.type === 'normal') {
              (0, _utils.log)('serve static file');
              app.use((0, _serveError2.default)());
              app.use((0, _koaViewer2.default)());
            } else {
              // serve static
              app.use((0, _koaStatic2.default)(_config2.default.static.src || '.'));
            }

            app.listen(_config2.default.server.port, function (err) {
              if (err) {
                (0, _utils.log)(err);
                return;
              }
              (0, _utils.log)('Server runing at http://' + _config2.default.server.ip + ':' + _config2.default.server.port);
            });

          case 3:
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
//# sourceMappingURL=serve.js.map