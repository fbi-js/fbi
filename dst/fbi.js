'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var vm = _interopDefault(require('vm'));
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
    fs.readFile(_p, charset || 'utf8', function (err, data) {
      return err ? reject(err) : resolve(data);
    });
  });
}

function write(file, data) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(file, data, function (err) {
      return err ? reject(err) : resolve(true);
    });
  });
}

function exist(_p, opts) {
  return new Promise(function (resolve, reject) {
    fs.access(_p, opts || fs.R_OK | fs.W_OK, function (err) {
      return err ? resolve(false) : resolve(true);
    });
  });
}

function existSync(src) {
  try {
    fs.accessSync(src, fs.R_OK | fs.W_OK);
    return true;
  } catch (e) {
    return false;
  }
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
    var rd = fs.createReadStream(source);
    rd.on('error', reject);
    var wr = fs.createWriteStream(target);
    wr.on('error', reject);
    wr.on('finish', resolve);
    rd.pipe(wr);
  });
}

function readDir(folder, opts) {
  return new Promise(function (resolve, reject) {
    fs.readdir(folder, opts, function (err, ret) {
      return err ? reject(err) : resolve(ret);
    });
  });
}

function isNotConfigFile(file) {
  return file.indexOf('config') < 0;
}

function isTask(item) {
  // return !['-g'].includes(item)
  return item.indexOf('-') !== 0;
}

var options = {
  data: './data',
  data_tasks: './data/tasks',
  data_templates: './data/templates'
};

var Module = function () {
  function Module(opts) {
    classCallCheck(this, Module);

    /**
     * modules find path:
     *
     * 1. current folder ＝> process.cwd()/node_modules
     * 2. template folder => data/templates/template/node_modules
     * 3. fbi global folder => data/node_modules
     * 4. system globale folder => username/node_modules
     *
     */

    this.modulePaths = [cwd('node_modules'), dir(options.data, opts.template ? 'templates/' + opts.template : '', 'node_modules'), dir(options.data, 'node_modules'), '' // global
    ];

    this.modulePaths = Array.from(new Set(this.modulePaths)); // duplicate removal
  }

  createClass(Module, [{
    key: 'get',
    value: function get(name) {
      var ret = void 0;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.modulePaths[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          var _p = join(item, name);
          try {
            var found = require.resolve(_p);

            if (found) {
              ret = item ? item : 'global';
              break;
            }
          } catch (e) {}
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

      return ret;
    }
  }, {
    key: 'getAll',
    value: function getAll() {
      var modules = {};
      modules[this.mod] = {};
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.modules[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _step2$value = slicedToArray(_step2.value, 2);

          var key = _step2$value[0];
          var value = _step2$value[1];

          modules[this.mod][key] = value;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
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

var Task = function () {
  function Task() {
    classCallCheck(this, Task);

    this.tasks = {};
  }

  createClass(Task, [{
    key: 'get',
    value: function get(name, isGlobal) {
      var _this,
          ret,
          u_task_dir,
          u_exist,
          u_modules,
          t_task_dir,
          t_exist,
          t_modules,
          _test,
          _test2,
          _test3,
          _test4,
          _this2 = this;

      return Promise.resolve().then(function () {
        _this = _this2;
        ret = {
          cnt: '',
          type: ''
        };

        // locals

        _test = !isGlobal;

        if (_test) {
          return Promise.resolve().then(function () {
            u_task_dir = cwd('fbi');
            return exist(u_task_dir);
          }).then(function (_resp) {
            u_exist = _resp;
          });
        }
      }).then(function () {
        _test3 = _test && u_exist;

        if (_test3) {
          return Promise.resolve().then(function () {
            return readDir(u_task_dir);
          }).then(function (_resp) {
            u_modules = _resp;

            u_modules = u_modules.filter(isNotConfigFile);
          });
        }
      }).then(function () {
        if (_test3 && u_modules.length && u_modules.includes(name + '.js')) {
          return Promise.resolve().then(function () {
            return read(join(u_task_dir, name + '.js'));
          }).then(function (_resp) {
            ret.cnt = _resp;
            ret.type = 'local';
          });
        }
      }).then(function () {
        _test2 = !ret.cnt;

        if (_test2) {
          return Promise.resolve().then(function () {
            // global tasks
            t_task_dir = dir('data/tasks/');
            return exist(t_task_dir);
          }).then(function (_resp) {
            t_exist = _resp;
          });
        }
      }).then(function () {
        _test4 = _test2 && t_exist;

        if (_test4) {
          return Promise.resolve().then(function () {
            return readDir(t_task_dir);
          }).then(function (_resp) {
            t_modules = _resp;
          });
        }
      }).then(function () {
        if (_test4 && t_modules.length && t_modules.includes(name)) {
          return Promise.resolve().then(function () {
            return read(join(t_task_dir, name, 'index.js'));
          }).then(function (_resp) {
            ret.cnt = _resp;
            ret.type = 'global';
          });
        }
      }).then(function () {

        return ret;
      });
    }
  }, {
    key: 'all',
    value: function all(justNames) {
      var _this,
          names,
          t_task_dir,
          t_exist,
          t_modules,
          u_task_dir,
          u_exist,
          u_modules,
          _test5,
          _test6,
          _test7,
          _test8,
          _this15 = this;

      return Promise.resolve().then(function () {
        _this = _this15;
        names = {
          globals: new Set(),
          locals: new Set()
        };

        // global tasks

        t_task_dir = dir('data/tasks/');
        return exist(t_task_dir);
      }).then(function (_resp) {
        t_exist = _resp;
        _test5 = t_exist;

        if (_test5) {
          return Promise.resolve().then(function () {
            return readDir(t_task_dir);
          }).then(function (_resp) {
            t_modules = _resp;
          });
        }
      }).then(function () {

        if (_test5 && justNames) {
          // names.globals = names.globals.concat(t_modules)
          names.globals = new Set(t_modules);
        } else {
          _test7 = _test5;
          if (_test7 && t_modules.length) {
            return Promise.all(t_modules.map(function (item) {
              return Promise.resolve().then(function () {
                return read(join(t_task_dir, item, 'index.js'));
              }).then(function (_resp) {
                _this.tasks[item] = _resp;
              });
            }));
          }
        }
      }).then(function () {

        // locals
        u_task_dir = cwd('fbi');
        return exist(u_task_dir);
      }).then(function (_resp) {
        u_exist = _resp;
        _test6 = u_exist;

        if (_test6) {
          return Promise.resolve().then(function () {
            return readDir(u_task_dir);
          }).then(function (_resp) {
            u_modules = _resp;

            u_modules = u_modules.filter(isNotConfigFile);
          });
        }
      }).then(function () {
        if (_test6 && justNames) {
          u_modules.map(function (item) {
            item = path.basename(item, '.js');
            names.locals.add(item);
            // if (names.globals.has(item)) {
            //   // names.locals.push(item)
            // }
          });
        } else {
          _test8 = _test6;
          if (_test8 && u_modules.length) {
            return Promise.all(u_modules.map(function (item) {
              return Promise.resolve().then(function () {
                return Promise.resolve().then(function () {
                  return read(join(u_task_dir, item));
                }).then(function (_resp) {
                  _this.tasks[path.basename(item, '.js')] = _resp;
                }).catch(function (e) {
                  log(e);
                });
              }).then(function () {});
            }));
          }
        }
      }).then(function () {
        // names.locals = Array.from(new Set(names.locals)) // duplicate removal
        if (justNames) {
          names.globals = Array.from(names.globals);
          names.locals = Array.from(names.locals);
        }

        return justNames ? names : _this.tasks;
      });
    }
  }, {
    key: 'run',
    value: function run(name, ctx, task) {
      var taskCnt = task || this.tasks[name];
      var module = new Module(ctx.options);

      function requireRelative(mod) {

        // find mod path
        var mod_path = module.get(mod);

        if (mod_path) {
          if (mod_path === 'global') {
            return require(mod); // native or global module
          } else {
            return require(join(mod_path, mod));
          }
        } else {
          log('Module not found: ' + mod + ', try \'fbi install\'', 0);
        }
      }

      var code = '\n    (function(require, ctx) {\n      try {\n        ' + taskCnt + '\n      } catch (e) {\n        console.log(e)\n      }\n    })';

      vm.runInThisContext(code, {
        filename: name + '.js',
        lineOffset: -3,
        displayErrors: true
      })(requireRelative, ctx);
    }
  }]);
  return Task;
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

var _copy = (function (src, dst, ign) {
  ignore = ign ? ign : ignore;
  copy(src, dst, walk$1);
});

// src: dir or file
// dst: dir
function walk$1(src, dst) {
  var type = fs.statSync(src);

  if (type.isDirectory()) {
    return fs.readdirSync(src).filter(function (f) {
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
          stat = fs.statSync(_src),
          readable = void 0,
          writable = void 0;

      if (stat.isDirectory()) {
        copy(_src, _dst, walk$1);
      } else {
        _copy$1(_src, _dst);
      }
    });
  } else {
    return _copy$1(src, path.join(dst, path.basename(src)));
  }
}

function _copy$1(src, dst) {
  var readable = void 0,
      writable = void 0;

  readable = fs.createReadStream(src);
  writable = fs.createWriteStream(dst);
  readable.pipe(writable);

  var _path = path.relative(process.cwd(), dst);
  console.log('copied => ' + _path);
}

function copy(src, dst, cb) {
  try {
    fs.accessSync(dst);
    cb(src, dst);
  } catch (e) {
    fs.mkdirSync(dst);
    cb(src, dst);

    // fs.mkdir(dst, () => {
    //   cb(src, dst)
    // })
  }
}

var Template = function () {
  function Template(opts) {
    classCallCheck(this, Template);


    this.opts = opts;
  }

  createClass(Template, [{
    key: 'copy',
    value: function copy(name, dst) {
      var ret,
          src,
          has,
          _this = this;

      return Promise.resolve().then(function () {
        if (!name) {
          return false;
        } else {
          return Promise.resolve().then(function () {
            ret = false;
            src = dir(_this.opts.data_templates, name);
            return exist(src);
          }).then(function (_resp) {
            has = _resp;


            if (has) {
              // copy
              _copy(src, dst, ['package.json', 'node_modules']);
              ret = true;
            }
            log(ret);
            return ret;
          });
        }
      }).then(function () {});
    }
  }, {
    key: 'all',
    value: function all() {
      var templates,
          _this4 = this;

      return Promise.resolve().then(function () {
        return readDir(dir(_this4.opts.data_templates));
      }).then(function (_resp) {
        templates = _resp;

        return templates;
      });
    }
  }]);
  return Template;
}();

var defaultOptions = {
  // template: 'basic',
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
    host: 'localhost',
    port: 8888
  },
  npm: {
    alias: 'npm',
    // options:'--save-dev --registry=https://registry.npm.taobao.org'
    options: '--save-dev'
  }
};

function getOptions(opts) {
  return merge(defaultOptions, opts || {});
}

var version = "2.0.0-alpha.1";

var helps = '\n    Usage:\n\n      fbi [command]           run command\n      fbi [task]              run a local preference task\n      fbi [task] -g           run a global task\n      fbi new [template]      init a new template\n      fbi rm [task][template] remove tasks or templates\n\n    Commands:\n\n      -h, --help              output usage information\n      -v, --version           output the version number\n      i, install              install dependencies\n      i -f, install -f        install dependencies force\n';

var task = new Task();
var template = new Template(options);

var Cli = function () {
  function Cli(argvs) {
    var _this = this;

    classCallCheck(this, Cli);

    this.argvs = argvs;
    this.next = true;
    this.log = log;
    this.options = {};
    this._ = {
      cwd: cwd, dir: dir, join: join, exist: exist, existSync: existSync, readDir: readDir,
      log: log, merge: merge, read: read, write: write, install: install, copyFile: copyFile,
      isTask: isTask, isNotConfigFile: isNotConfigFile
    };Promise.resolve().then(function () {
      _this.version();
      return _this.help();
    }).then(function () {
      return _this.config();
    }).then(function () {
      return _this.create();
    }).then(function () {
      return _this.install();
    }).then(function () {
      return _this.remove();
    }).then(function () {
      return _this.run();
    }).then(function () {});
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
      var all,
          tmpls,
          _test,
          _this5 = this;

      return Promise.resolve().then(function () {
        if (!!_this5.next) {
          return Promise.resolve().then(function () {
            _test = !_this5.argvs.length || _this5.argvs[0] === '-h' || _this5.argvs[0] === '--help';

            if (_test) {
              return Promise.resolve().then(function () {
                _this5.next = false;

                return task.all(true);
              }).then(function (_resp) {
                all = _resp;

                helps += '\n    Tasks:\n    ';
              });
            }
          }).then(function () {
            if (_test && all.globals.length) {
              all.globals.map(function (item) {
                helps += '\n      ' + item + ' <global>';
              });
            }
            if (_test && all.locals.length) {
              all.locals.map(function (item) {
                helps += '\n      ' + item + ' <local>';
              });
            }

            if (_test) {
              return Promise.resolve().then(function () {
                return template.all();
              }).then(function (_resp) {
                tmpls = _resp;
              });
            }
          }).then(function () {
            if (_test && tmpls.length) {
              helps += '\n\n    Templates:\n      ';
              tmpls.map(function (item) {
                helps += '\n      ' + item;
              });
            }

            if (_test) {
              helps += '\n      ';

              console.log(helps);
            }
          });
        }
      }).then(function () {});
    }
  }, {
    key: 'config',
    value: function config() {
      var pathConfig,
          userOptions,
          _this12 = this;

      return Promise.resolve().then(function () {
        if (!!_this12.next) {
          return Promise.resolve().then(function () {
            // options
            pathConfig = cwd('./fbi/config.js');
            return exist(pathConfig);
          }).then(function (_resp) {
            _this12.isfbi = _resp;
            userOptions = _this12.isfbi ? require(pathConfig) : null;

            _this12.options = getOptions(userOptions);
          }).catch(function (e) {
            log(e);
          });
        }
      }).then(function () {});
    }
  }, {
    key: 'install',
    value: function install$$() {
      var _this2,
          _this15 = this;

      return Promise.resolve().then(function () {
        _this2 = _this15;

        if (!!_this15.next) {

          if (_this15.argvs[0] === 'i' || _this15.argvs[0] === 'install') {
            return function () {
              var force, dependencies, needinstall, all, deps, allTasks, targetDir;
              return Promise.resolve().then(function () {
                _this2.next = false;

                force = _this2.argvs[1] === '-f' || _this2.argvs[1] === '-force';
                dependencies = {};
                needinstall = {};

                // 1. local dependencies
                // fbi/config.js => dependencies

                if (_this2.options.dependencies && Object.keys(_this2.options.dependencies).length) {
                  dependencies = _this2.options.dependencies;
                }

                // 2. dependencies
                // collect tasks
                return task.all();
              }).then(function (_resp) {
                all = _resp;
                deps = [];
                allTasks = Object.keys(all);

                if (allTasks.length) {
                  allTasks.map(function (item) {
                    // get task deps
                    var parser = new Parser(all[item]);
                    var dep = parser.getDependencies();
                    deps = deps.concat(dep);
                  });
                }

                deps = Array.from(new Set(deps)); // duplicate removal

                // merge to dependencies
                deps.map(function (item) {
                  if (!dependencies[item]) {
                    dependencies[item] = '*';
                  }
                });

                if (force) {
                  needinstall = dependencies;
                } else {
                  (function () {
                    // find modules
                    var mod = new Module(_this2.options);

                    Object.keys(dependencies).map(function (item) {
                      var ret = mod.get(item);
                      if (ret) {
                        log('Found \'' + item + '\' at: ' + ret, 1);
                      } else {
                        log('Not Fount \'' + item + '\'');
                        needinstall[item] = dependencies[item];
                      }
                    });
                  })();
                }

                targetDir = _this2.options.template ? dir(_this2.options.paths.data_templates, _this2.options.template) : dir(_this2.options.paths.data);


                if (Object.keys(needinstall).length) {
                  return install(needinstall, targetDir, _this2.options.npm.alias, _this2.options.npm.options);
                } else {
                  log('All Dependencies installed.');
                }
              }).then(function () {});
            }();
          }
        }
      }).then(function () {});
    }
  }, {
    key: 'create',
    value: function create() {
      var name,
          succ,
          _test2,
          _this23 = this;

      return Promise.resolve().then(function () {
        if (!!_this23.next) {

          if (_this23.argvs[0] === 'new') {
            _this23.next = false;

            return Promise.resolve().then(function () {
              name = _this23.argvs[1] ? _this23.argvs[1].match(/^[^\\/:*""<>|,]+$/i) : null;

              name = name.length ? name[0] : null;
              _test2 = name !== null;
              return template.copy(name, cwd());
            }).then(function (_resp) {
              if (_test2) {
                succ = _resp;

                log(succ);
              }

              if (_test2 && succ) {
                log('Template \'' + name + '\' copied to current folder', 1);
              } else {
                if (_test2) {
                  log('Template \'' + name + '\' not found', 0);
                }

                log('Usage: fbi new [template name]', 0);
              }
            }).catch(function (e) {
              log(e);
            });
          }
        }
      }).then(function () {});
    }
  }, {
    key: 'remove',
    value: function remove() {
      var mods,
          _this28 = this;

      if (!!_this28.next) {

        if (_this28.argvs[0] === 'rm' || _this28.argvs[0] === 'remove') {
          _this28.next = false;

          mods = _this28.argvs.slice(1);

          if (!mods.length) {
            log('Usage: fbi rm [task] or [template]');
            process.exit(1);
          } else {
            // for (const mod of mods) {
            //   if (this.tasks[mod]) {
            //     if (this.tasks[mod].module.indexOf('.js') > 0) { // fn task
            //       // del task
            //       const _path = this._.dir(this.tasks[mod].module.replace('../', ''))
            //       const exist = this._.existSync(_path)
            //       if (exist) {
            //         fs.unlinkSync(_path)
            //         dbTasks.del(mod)
            //         log(`Task module '${mod}' removed`, 1)
            //       } else {
            //         log(`Task module '${mod}' not found`, 0)
            //       }
            //     } else {
            //       dbTasks.del(mod)
            //       // TODO: uninstall?
            //       log(`Task module '${mod}' removed`, 1)
            //     }
            //   } else if (this.templates[mod]) {
            //     // del template
            //     dbTemplates.del(mod)
            //     log(`Template '${mod}' removed`, 1)
            //   } else {
            //     log(`Module '${mod}' not found`, 0)
            //   }
            // }
          }
        }
      }
    }
  }, {
    key: 'run',
    value: function run() {
      var _this3,
          cmds,
          _this29 = this;

      _this3 = _this29;

      if (!!_this29.next) {
        cmds = _this29.argvs;

        if (_this29.argvs.length > 0) {
          (function () {
            var isGlobal = void 0;
            if (_this3.argvs[1] === '-g') {
              isGlobal = true;
            }
            try {
              cmds = cmds.filter(isTask);
              cmds.map(function (cmd) {
                var taskObj;
                return Promise.resolve().then(function () {
                  return task.get(cmd, isGlobal);
                }).then(function (_resp) {
                  taskObj = _resp;

                  if (taskObj.cnt) {
                    log('Running ' + taskObj.type + ' task \'' + cmd + '\'...', 1);
                    task.run(cmd, _this3, taskObj.cnt);
                  } else {
                    log('Task not found: \'' + cmd + (isGlobal ? ' <global>' : '') + '\'', 0);
                  }
                });
              });
            } catch (e) {
              log('Task function error', 0);
              log(e);
            }
          })();
        }
      }
    }
  }]);
  return Cli;
}();

var Fbi = function () {
  function Fbi() {
    classCallCheck(this, Fbi);

    this.options = getOptions();

    // this.tasks = dbTasks.all() || {}
    // this.templates = dbTemplates.all() || {}

    this.Cli = Cli;
    this.Parser = Parser;
  }

  createClass(Fbi, [{
    key: 'run',
    value: function run(cmds) {
      if (!cmds) {
        return;
      }

      new Fbi.cli(typeof cmds === 'string' ? [cmds] : cmds);
    }

    // add(mods) {
    //   if (!mods) {
    //     return
    //   }

    //   new Fbi.module(typeof mods === 'string' ? [mods] : mods)
    // }

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
            // fs.writeFileSync(name, cnt)
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
  }], [{
    key: 'cli',
    get: function get() {
      return Cli;
    }
  }]);
  return Fbi;
}();

module.exports = Fbi;
//# sourceMappingURL=fbi.js.map
