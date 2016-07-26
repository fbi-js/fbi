'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs$1 = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var util = _interopDefault(require('util'));
var child_process = require('child_process');
var estreeWalker = require('estree-walker');
var acorn = _interopDefault(require('acorn'));

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

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
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
function log(msg, type) {
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
  return path.join.apply(null, [process.cwd()].concat(arr));
}

function join() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  var arr = [].slice.call(args || []);
  return path.join.apply(null, arr);
}

function dir() {
  for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  var arr = [].slice.call(args || []);
  return path.join.apply(null, [__dirname, '../'].concat(arr));
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

function read(_p, charset) {
  return new Promise(function (resolve, reject) {
    fs$1.readFile(_p, charset || 'utf8', function (err, data) {
      return err ? reject(err) : resolve(data);
    });
  });
}

function write(file, data) {
  return new Promise(function (resolve, reject) {
    fs$1.writeFile(file, data, function (err) {
      return err ? reject(err) : resolve(true);
    });
  });
}

function exist(_p, opts) {
  return new Promise(function (resolve, reject) {
    fs$1.access(_p, opts || fs$1.R_OK | fs$1.W_OK, function (err) {
      return err ? resolve(false) : resolve(true);
    });
  });
}

function install(source, rootPath, command, opts) {
  var prevDir = process.cwd();
  var pkgs = '';

  Object.keys(source).map(function (item) {
    pkgs += item + '@' + source[item] + ' ';
  });

  process.chdir(rootPath);
  var cmd = command + ' install ' + pkgs + ' ' + (opts ? opts : '');
  log(cmd + '...');
  log('install dest: ' + rootPath);
  return new Promise(function (resolve, reject) {
    child_process.exec(cmd, function (error, stdout, stderr) {
      process.chdir(prevDir);
      if (error) {
        var msg = stderr.toString();
        log(msg, 0);
        return reject(msg);
      }

      log(stdout);
      resolve(stdout);
    });
  });
}

function copyFile(source, target) {
  return new Promise(function (resolve, reject) {
    var rd = fs$1.createReadStream(source);
    rd.on('error', reject);
    var wr = fs$1.createWriteStream(target);
    wr.on('error', reject);
    wr.on('finish', resolve);
    rd.pipe(wr);
  });
}

var defaultOptions = {
  template: 'basic',
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
  },
  npm: {
    alias: 'npm',
    options: '--save-dev --registry=https://registry.npm.taobao.org'
  }
};

function getOptions(opts) {
  return merge(defaultOptions, opts || {});
}

var version = "2.0.0-alpha";

var Store = function () {
  function Store(name) {
    classCallCheck(this, Store);

    this.name = name;
    this.root = dir('data');
    this.path = join(this.root, this.name + '.json');
    this.init();
  }

  createClass(Store, [{
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
    key: 'sync',
    value: function sync() {
      var data = JSON.stringify(this.db);
      fs$1.writeFileSync(this.path, data);
    }
  }]);
  return Store;
}();

var Parser = function () {
  function Parser(source, options) {
    classCallCheck(this, Parser);

    this.dependencies = [];
    this.localDependencies = [];
    this.globalDependencies = [];
    this.options = merge({ sourceType: 'module' }, options || {});

    this.ast = acorn.parse(source, this.options);
  }

  createClass(Parser, [{
    key: 'getDependencies',
    value: function getDependencies() {
      var _this = this;

      estreeWalker.walk(this.ast, {
        enter: function enter(node, parent) {
          // import
          if (node.type === 'ImportDeclaration') {
            _this.dependencies.push(node.source.value);
          }

          // require
          if (node.type === 'CallExpression' && node.callee.name === 'require') {
            _this.dependencies.push(node.arguments[0].value);
          }
        }
      });

      return this.dependencies;
    }
  }, {
    key: 'splitDependencies',
    value: function splitDependencies() {
      var _this2 = this;

      if (!this.dependencies.length) {
        this.getDependencies();
      }

      this.dependencies.map(function (item) {
        if (/^\.?\.\//.test(item)) {
          // local
          _this2.localDependencies.push(item);
        } else {
          _this2.globalDependencies.push(item);
        }
      });

      return {
        locals: this.localDependencies,
        globals: this.globalDependencies
      };
    }
  }, {
    key: 'getLocalDependencies',
    value: function getLocalDependencies() {
      if (!this.dependencies.length) {
        this.splitDependencies();
      }
      return this.localDependencies;
    }
  }, {
    key: 'getGlobalDependencies',
    value: function getGlobalDependencies() {
      if (!this.dependencies.length) {
        this.splitDependencies();
      }
      return this.globalDependencies;
    }
  }]);
  return Parser;
}();

var ignore = [];

var copy = (function (src, dst, ign) {
  ignore = ign ? ign : ignore;
  copy$1(src, dst, walk$1);
});

// src: dir or file
// dst: dir
function walk$1(src, dst) {
  var type = fs$1.statSync(src);

  if (type.isDirectory()) {
    return fs$1.readdirSync(src).filter(function (f) {
      if (ignore.includes(f)) {
        return false;
      } else if (f[0] === '.' && ignore.includes('.')) {
        return false;
      } else {
        return true;
      }
    }).map(function (f) {
      var _src = path.join(src, f),
          _dst = path.join(dst, f),
          stat = fs$1.statSync(_src),
          readable = void 0,
          writable = void 0;

      if (stat.isDirectory()) {
        copy$1(_src, _dst, walk$1);
      } else {
        _copy(_src, _dst);
      }
    });
  } else {
    return _copy(src, path.join(dst, path.basename(src)));
  }
}

function _copy(src, dst) {
  var readable = void 0,
      writable = void 0;

  readable = fs$1.createReadStream(src);
  writable = fs$1.createWriteStream(dst);
  readable.pipe(writable);

  var _path = path.relative(process.cwd(), dst);
  console.log('copied => ' + _path);
}

function copy$1(src, dst, cb) {
  try {
    fs$1.accessSync(dst);
    cb(src, dst);
  } catch (e) {
    fs$1.mkdirSync(dst);
    cb(src, dst);

    // fs.mkdir(dst, () => {
    //   cb(src, dst)
    // })
  }
}

var Cli = function () {
  function Cli(argvs) {
    var _this = this;

    classCallCheck(this, Cli);

    this.argvs = argvs;
    this.next = true;
    this.log = log;

    this.version();
    this.help();Promise.resolve().then(function () {
      return _this.config();
    }).then(function () {
      return _this.task();
    }).then(function () {
      _this.create();
      _this.run();
    });
  }

  createClass(Cli, [{
    key: 'version',
    value: function version$$() {
      if (!this.next) return;

      if (this.argvs[0] === '-v' || this.argvs[0] === '--verison') {
        this.next = false;
        console.log(version);
      }
    }
  }, {
    key: 'help',
    value: function help() {
      if (!this.next) return;

      if (!this.argvs.length || this.argvs[0] === '-h' || this.argvs[0] === '--help') {
        this.next = false;
        console.log(helps.join(''));
      }
    }
  }, {
    key: 'config',
    value: function config() {
      var pathConfig,
          userOptions,
          _this5 = this;

      return Promise.resolve().then(function () {
        if (!!_this5.next) {
          return Promise.resolve().then(function () {
            // options
            pathConfig = cwd('./fbi/config.js');
            return exist(pathConfig);
          }).then(function (_resp) {
            _this5.isfbi = _resp;
            userOptions = _this5.isfbi ? require(pathConfig) : null;

            _this5.options = getOptions(userOptions);
          }).catch(function (e) {
            log(e);
          });
        }
      }).then(function () {});
    }
  }, {
    key: 'task',
    value: function task() {
      var _this2,
          _this8 = this;

      return Promise.resolve().then(function () {
        _this2 = _this8;

        if (!!_this8.next) {
          return Promise.resolve().then(function () {
            return function () {
              var dbTasks, needinstall, templateDir, existTemplate, templateTasksPath, hasDefaultTasks, source, parser, deps, userDir, userTasksPath, hasUserTasks, userPkgs, _source, _parser, _deps, dest, tmp, t, _test;

              return Promise.resolve().then(function () {
                dbTasks = new Store('tasks');
                needinstall = {};
                templateDir = dir('data/templates/', _this2.options.template);
                return exist(templateDir);
              }).then(function (_resp) {
                existTemplate = _resp;
                templateTasksPath = join(templateDir, 'fbi/tasks.js');

                // template default tasks

                _test = existTemplate;

                if (_test) {
                  return Promise.resolve().then(function () {
                    return exist(templateTasksPath);
                  }).then(function (_resp) {
                    hasDefaultTasks = _resp;
                  });
                }
              }).then(function () {
                if (_test && hasDefaultTasks) {
                  return Promise.resolve().then(function () {
                    return read(templateTasksPath);
                  }).then(function (_resp) {
                    source = _resp;
                    parser = new Parser(source);
                    deps = parser.splitDependencies();

                    deps.globals.map(function (dep) {
                      // try {
                      //   // require(join(templateDir, 'node_modules', dep)) // test module installed
                      //   return require.resolve(join(templateDir, 'node_modules', dep))
                      // } catch (err) {
                      //   // if (err.code === 'MODULE_NOT_FOUND') {
                      //   needinstall[dep] = '*'
                      //   // }
                      // }

                      try {
                        // native module or global module
                        return require.resolve(dep);
                      } catch (err) {
                        try {
                          // require.resolve(join(templateDir, 'node_modules', dep))
                          // require(join(templateDir, 'node_modules', dep)) // if local modules installed
                          return require.resolve(join(templateDir, 'node_modules', dep));
                        } catch (e) {
                          needinstall[dep] = '*';
                        }
                      }
                    });
                    // dbTasks.set(require(templateTasksPath))
                  });
                }
              }).then(function () {

                // user tasks
                userDir = cwd();
                userTasksPath = join(userDir, 'fbi/tasks.js');
                return exist(userTasksPath);
              }).then(function (_resp) {
                hasUserTasks = _resp;
                userPkgs = void 0;


                if (hasUserTasks) {
                  return Promise.resolve().then(function () {
                    userPkgs = require(join(userDir, 'package.json'));
                    return read(userTasksPath);
                  }).then(function (_resp) {
                    _source = _resp;
                    _parser = new Parser(_source);
                    _deps = _parser.splitDependencies();

                    _deps.globals.map(function (dep) {
                      if (!userPkgs['dependencies'][dep]) {
                        userPkgs['dependencies'][dep] = '*';
                      }

                      try {
                        // native module or global module
                        return require.resolve(dep);
                      } catch (err) {
                        try {
                          // require.resolve(join(templateDir, 'node_modules', dep))
                          // require(join(templateDir, 'node_modules', dep)) // if local modules installed
                          return require.resolve(join(templateDir, 'node_modules', dep));
                        } catch (e) {
                          needinstall[dep] = userPkgs['dependencies'][dep];
                        }
                      }
                    });
                    // dbTasks.set(require(userTasksPath))
                  });
                }
              }).then(function () {
                // log(needinstall)
                // write
                write(join(userDir, 'package.json'), JSON.stringify(userPkgs, null, 2));

                // TODO: split globals & locals, globals=> --save; locals=> ''
                // log(Module)
                if (Object.keys(needinstall).length) {
                  return install(needinstall, templateDir, _this2.options.npm.alias, _this2.options.npm.options);
                }
              }).then(function () {
                // add tasks
                if (existTemplate) {
                  dbTasks.set(require(templateTasksPath));
                }

                if (hasUserTasks) {
                  return Promise.resolve().then(function () {
                    // TODO: deal with user tasks's `require`

                    // or Copy to template folder
                    dest = dir('data/templates/' + _this2.options.template + '/fbi/tmp/');
                    // copy(userTasksPath, dest)

                    return copyFile(userTasksPath, join(dest, path.basename(userTasksPath)));
                  }).then(function () {
                    tmp = join(dest, path.basename(userTasksPath));
                    // log(tmp)

                    t = require(tmp);

                    dbTasks.set(t);
                  });
                }
              }).then(function () {
                _this2.tasks = dbTasks.all();
              });
            }();
          }).catch(function (e) {
            log(e);
          });
        }
      }).then(function () {});
    }
  }, {
    key: 'create',
    value: function create() {
      if (!this.next) return;

      var dbTemplates = new Store('templates');
      this.templates = dbTemplates.all();
      log(this.templates);

      if (this.argvs[0] === 'new') {
        log('new===');
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
  }, {
    key: 'run',
    value: function run() {
      var _this3 = this;

      if (!this.next) return;

      var cmds = this.argvs;
      try {
        cmds.map(function (cmd) {
          if (_this3.tasks[cmd]) {
            _this3.tasks[cmd].fn.call(_this3);
          }
        });
      } catch (e) {
        log('Task function error', 0);
        log(e);
      }
      this.next = false;
    }
  }]);
  return Cli;
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

var Module = function () {
  function Module(mod) {
    classCallCheck(this, Module);

    this.modules = new Map();

    if (mod !== undefined && mod !== '') {
      this.mod = new Map();
      this.mod.set(mod, this.modules);
      // this.set(mod, this.modules)
    }
  }

  createClass(Module, [{
    key: 'get',
    value: function get(name) {
      return this.modules.get(name);
    }
  }, {
    key: 'set',
    value: function set(name, value) {
      this.modules.set(name, value);
    }
  }, {
    key: 'del',
    value: function del(name) {
      this.modules.delete(name);
    }
  }, {
    key: 'delAll',
    value: function delAll() {
      this.modules.clear();
    }
  }, {
    key: 'has',
    value: function has(name) {
      return this.modules.has(name);
    }
  }, {
    key: 'getAll',
    value: function getAll() {
      var modules = {};
      modules[this.mod] = {};
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.modules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = slicedToArray(_step.value, 2);

          var key = _step$value[0];
          var value = _step$value[1];

          modules[this.mod][key] = value;
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

      return modules;
    }
  }, {
    key: 'sync',
    value: function sync() {}
  }]);
  return Module;
}();

var dbTasks$1 = new Store('tasks');
var dbTemplates$1 = new Store('templates');

var module$1 = new Module();

var Fbi = function () {
  function Fbi() {
    classCallCheck(this, Fbi);

    this.options = getOptions();

    this.tasks = dbTasks$1.all() || {};
    this.templates = dbTemplates$1.all() || {};

    // parser /Users/Inman/work/git/github/neikvon/fbi/data/templates/basic/fbi/tasks.js
    // const source = fs.readFileSync(path.join(__dirname, '../data/templates/basic/fbi/tasks.js'))
    // const parser = new Parser(source)

    // console.log(parser.getLocalDependencies())
    // console.log(parser.getGlobalDependencies())

    this.Cli = Cli;
    // this.Module = Module
    this.Parser = Parser;

    // module.set('a', 'aaa')
    // module.set('b', function () {
    //   console.log('b')
    // })
    // console.log(module.getAll())
  }

  createClass(Fbi, [{
    key: 'run',


    // static get module() {
    //   return Module
    // }

    value: function run(cmds) {
      if (!cmds) {
        return;
      }

      new Fbi.cli(typeof cmds === 'string' ? [cmds] : cmds);
    }
  }, {
    key: 'add',
    value: function add(mods) {
      if (!mods) {
        return;
      }

      new Fbi.module(typeof mods === 'string' ? [mods] : mods);
    }

    // add anything

  }, {
    key: 'add2',
    value: function add2(any, globally) {
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
            fs$1.writeFileSync(name, cnt);
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
        dbTasks$1.set(this.tasks);
      }
      if (globally) {
        dbTemplates$1.set(this.templates);
      }
    }
  }], [{
    key: 'cli',
    get: function get() {
      return Cli;
    }
  }]);
  return Fbi;
}();

module.exports = Fbi;