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

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

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
var serverStarted = false;

function listen(app, port) {
  return new _promise2.default(function (resolve, reject) {
    var server = _http2.default.createServer(app.callback());
    server.on('error', function (err) {
      if (err.code === 'EADDRINUSE') {
        // port in use
        reject(err);
      }
    });
    server.listen(port, function () {
      resolve(server.address().port);
    });
  });
}

exports.default = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ucfg) {
    var port, p;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:

            (0, _utils.merge)(_config2.default, ucfg);

            // no fbi
            if (!ucfg || _config2.default.type === 'normal') {
              (0, _utils.log)('This is not a fbi project, serve current folder.');
              app.use((0, _serveError2.default)());
              app.use((0, _koaViewer2.default)());
            } else {
              // serve static
              app.use((0, _koaStatic2.default)(_config2.default.static.src || '.'));
            }

            // find an available port & start the server
            port = _config2.default.server.port;

          case 3:
            if (serverStarted) {
              _context.next = 19;
              break;
            }

            _context.prev = 4;
            _context.next = 7;
            return listen(app, port);

          case 7:
            p = _context.sent;

            serverStarted = true;
            (0, _utils.log)('Server runing at http://' + _config2.default.server.ip + ':' + p);
            return _context.abrupt('break', 19);

          case 13:
            _context.prev = 13;
            _context.t0 = _context['catch'](4);

            (0, _utils.log)('Warning: port \'' + _context.t0.port + '\' in use, trying to find a available one...');
            port = 0;

          case 17:
            _context.next = 3;
            break;

          case 19:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[4, 13]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=serve.js.map