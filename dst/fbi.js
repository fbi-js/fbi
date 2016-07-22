'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs$1 = _interopDefault(require('fs'));
var util = _interopDefault(require('util'));
var path$1 = _interopDefault(require('path'));

var config = {
  paths: {
    data: './data',
    data_tasks: './data/tasks',
    data_templates: './data/templates',
    options: 'fbi/config.js',
    tasks: 'fbi/tasks.js',
    starters: '../tmpls/starters/',
    settings: 'default.config.js'
  },
  meta: {
    src: {
      root: 'src',
      html: 'tmpl',
      css: 'style',
      js: 'script',
      img: 'image'
    },
    dist: {
      root: 'dist',
      html: '.',
      css: 'css',
      js: 'js',
      img: 'img'
    },
    archive: 'archive'
  },
  server: {
    protocol: 'localhost',
    port: 9999
  }
};

function exist(_p, opts) {
  return new Promise(function (resolve, reject) {
    fs$1.access(_p, opts || fs$1.R_OK | fs$1.W_OK, function (err) {
      return err ? resolve(false) : resolve(true);
    });
  });
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

function colors() {
  function colorize(color, text) {
    var codes = util.inspect.colors[color];
    return '\u001b[' + codes[0] + 'm' + text + '\u001b[' + codes[1] + 'm';
  }
  var returnValue = {};
  Object.keys(util.inspect.colors).map(function (color) {
    returnValue[color] = function (text) {
      return colorize(color, text);
    };
  });
  return returnValue;
}

/**
 * type: 0-error, 1-succ
 */
function log$1(msg, type) {
  if (typeof msg === 'string') {
    if (type !== undefined) {
      msg = type ? colors().grey('FBI => ') + colors().cyan(msg) : colors().grey('FBI Error => ') + colors().magenta(msg);
    } else {
      msg = colors().grey('FBI => ') + msg;
    }
  }
  console.log(msg);
}

function cwd() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var arr = [].slice.call(args || []);
  return path$1.join.apply(null, [process.cwd()].concat(arr));
}

function join() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  var arr = [].slice.call(args || []);
  return path$1.join.apply(null, arr);
}

function dir() {
  for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  var arr = [].slice.call(args || []);
  return path$1.join.apply(null, [__dirname, '../'].concat(arr));
}

function merge(target) {
  var sources = [].slice.call(arguments, 1);
  sources.forEach(function (source) {
    for (var p in source) {
      if (_typeof(source[p]) === 'object') {
        target[p] = target[p] || (Array.isArray(source[p]) ? [] : {});
        merge(target[p], source[p]);
      } else {
        target[p] = source[p];
      }
    }
  });
  return target;
}

var Store = function () {
  function Store(name) {
    classCallCheck(this, Store);

    this.name = name;
    this.root = dir('data');
    this.path = join(this.root, this.name + '.json');
    this.init();
  }

  createClass(Store, [{
    key: 'get',
    value: function get(attr) {
      return this.db[attr];
    }
  }, {
    key: 'set',
    value: function set(obj) {
      var _this = this;

      // { attr: 'val', attr2: 'val2' }

      if (Array.isArray(obj)) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = obj[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;

            Object.keys(item).map(function (o) {
              _this.db[o] = obj[o]; // deepth: 1
            });
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
      } else {
        Object.keys(obj).map(function (o) {
          _this.db[o] = obj[o]; // deepth: 1
        });
      }

      this.sync();
    }
  }, {
    key: 'del',
    value: function del(attr) {
      delete this.db[attr];
      this.sync();
    }
  }, {
    key: 'all',
    value: function all() {
      return this.db;
    }
  }, {
    key: 'init',
    value: function init() {
      var data = void 0;
      try {
        data = require(this.path);
      } catch (e) {
        data = {};
        fs$1.writeFileSync(this.path, JSON.stringify(data));
      }
      this.db = data;
    }
  }, {
    key: 'sync',
    value: function sync() {
      var data = JSON.stringify(this.db);
      fs$1.writeFileSync(this.path, data);
    }
  }]);
  return Store;
}();

var dbTasks = new Store('tasks');
var dbTemplates = new Store('templates');

var Fbi = function () {
  function Fbi() {
    classCallCheck(this, Fbi);

    this.config = config;

    this.tasks = dbTasks.all() || {};
    this.templates = dbTemplates.all() || {};
  }

  createClass(Fbi, [{
    key: 'cli',
    value: function cli(argvs) {
      var _this2 = this;

      return Promise.resolve().then(function () {
        _this2.argvs = argvs;
        _this2.next = true;
        return _this2.makeConfig();
      }).then(function () {
        _this2.makeTasks();
        console.log(1);
        _this2.help();
        _this2.version();
        _this2.remove();
        _this2.create();
      });
    }
  }, {
    key: 'makeConfig',
    value: function makeConfig() {
      var _path,
          usrCfg,
          _this3 = this;

      return Promise.resolve().then(function () {
        return Promise.resolve().then(function () {
          // access user config
          _path = cwd(_this3.config.paths.options);
          return exist(_path);
        }).then(function (_resp) {
          _this3.isFbi = _resp;
          if (_this3.isFbi) {
            usrCfg = require(_path);

            merge(_this3.config, usrCfg);
          }
        }).catch(function (e) {
          log$1(e);
        });
      }).then(function () {});
    }
  }, {
    key: 'makeTasks',
    value: function makeTasks() {
      try {
        // access user tasks
        var usrTasks = require(dir(this.config.paths.data_templates + '/' + (this.config.template || 'basic') + '/' + this.config.paths.tasks));
        this.add(usrTasks, false);
      } catch (e) {
        log$1(e);
        // if(e.code === 'MODULE_NOT_FOUND'){
        //   log(e.message)
        //   this.makeTasks()
        // }
      }
    }

    // get Cli(){
    //   return Cli
    // }

  }, {
    key: 'help',
    value: function help() {
      if (!this.next) return;

      if (!this.argvs.length || this.argvs[0] === '-h' || this.argvs[0] === '--help') {
        this.next = false;
        show(this);
      }
    }
  }, {
    key: 'version',
    value: function version() {
      if (!this.next) return;

      if (this.argvs[0] === '-v' || this.argvs[0] === '--verison') {
        this.next = false;
        this.log(pkg.version);
      }
    }
  }, {
    key: 'create',
    value: function create() {
      if (!this.next) return;

      if (this.argvs[0] === 'new') {
        var mod = this.argvs[1] ? this.argvs[1].match(/^[^\\/:*""<>|,]+$/i) : null;
        mod = mod ? mod[0] : null;

        try {

          if (this.templates[mod]) {
            log('Installing template \'' + mod + '\' ...', 1);
            var src = this._.dir(this.config.paths.data, 'templates', mod, path.sep);
            var dst = this._.cwd(path.sep);

            // copy(src, dst)
            copy(src, dst, ['package.json', 'node_modules']);
          } else {
            if (!mod) {
              log('Invalid template name', 0);
              show(this);
            } else {
              log('Template \'' + mod + '\' not found', 0);
            }
          }
        } catch (e) {
          log(e);
        }
        this.next = false;
      }
    }
  }, {
    key: 'remove',
    value: function remove() {
      if (!this.next) return;

      if (this.argvs[0] === 'rm' || this.argvs[0] === 'remove') {
        this.next = false;
        var mods = this.argvs.slice(1);
        if (!mods.length) {
          show(this);
        }
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = mods[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var mod = _step.value;

            if (this.tasks[mod]) {
              if (this.tasks[mod].module.indexOf('.js') > 0) {
                // fn task
                // del task
                var _path = this._.dir(this.tasks[mod].module.replace('../', ''));
                var _exist = this._.existSync(_path);
                if (_exist) {
                  fs.unlinkSync(_path);
                  dbTasks.del(mod);
                  log('Task module \'' + mod + '\' removed', 1);
                } else {
                  log('Task module \'' + mod + '\' not found', 0);
                }
              } else {
                dbTasks.del(mod);
                // TODO: uninstall?
                log('Task module \'' + mod + '\' removed', 1);
              }
            } else if (this.templates[mod]) {
              // del template
              dbTemplates.del(mod);
              log('Template \'' + mod + '\' removed', 1);
            } else {
              log('Module \'' + mod + '\' not found', 0);
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
      }
    }

    // add anything

  }, {
    key: 'add',
    value: function add(any, globally) {
      var _this = this;

      var tasks_path = dir(this.config.paths.data, 'tasks');

      Object.keys(any).map(function (a) {

        if (any[a].fn) {
          // task require a function
          if (globally) {
            var name = tasks_path + '/' + a + '.js';
            var cnt = 'module.exports = ' + any[a].fn.toString(); // to commonJS

            delete any[a].fn;
            any[a]['module'] = '.' + _this.config.paths.data + '/tasks/' + a + '.js';
            fs.writeFileSync(name, cnt);
          }
          _this.tasks[a] = any[a];
        } else if (any[a].module) {
          // task require a npm module
          _this.tasks[a] = any[a];
        } else if (typeof any[a] === 'string') {
          // templates
          _this.templates[a] = any[a];
        }
      });

      // sync tasks
      if (globally) {
        dbTasks.set(this.tasks);
      }
      if (globally) {
        dbTemplates.set(this.templates);
      }
    }
  }]);
  return Fbi;
}();

var helps = ['\n   Usage:\n\n     fbi [task]\n     fbi new [template]\n\n', '\n\n   Options:\n\n     -h, --help        output usage information\n     -v, --version     output the version number\n     rm, remove        remove tasks or templates\n'];
// show tasks & templates
function show(ctx) {
  var msg = helps[0];
  msg += '\n     Tasks:';

  var tasks = ctx.tasks;
  var tmpls = ctx.templates;

  console.log(tasks);

  if (!Object.keys(tasks).length) {
    msg += '\n       No available task.\n    ';
  } else {
    Object.keys(tasks).map(function (t) {
      msg += '\n       ' + t + ':  ' + tasks[t].desc;
    });
  }

  msg += '\n\n     Templates:';

  if (!Object.keys(tmpls).length) {
    msg += '\n       No available template.\n    ';
  } else {
    Object.keys(tmpls).map(function (t) {
      msg += '\n       ' + t + ':  ' + tmpls[t];
    });
  }
  msg += helps[1];

  ctx.log(msg);
}

module.exports = Fbi;