'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var readline = require('readline');
var vm = _interopDefault(require('vm'));
var fs = _interopDefault(require('fs'));
var util = _interopDefault(require('util'));
var path = _interopDefault(require('path'));
var child_process = require('child_process');

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

// util.inspect.styles

// { special: 'cyan',
//   number: 'yellow',
//   boolean: 'yellow',
//   undefined: 'grey',
//   null: 'bold',
//   string: 'green',
//   date: 'magenta',
//   regexp: 'red' }

// util.inspect.colors

// { bold: [ 1, 22 ],
//   italic: [ 3, 23 ],
//   underline: [ 4, 24 ],
//   inverse: [ 7, 27 ],
//   white: [ 37, 39 ],
//   grey: [ 90, 39 ],
//   black: [ 30, 39 ],
//   blue: [ 34, 39 ],
//   cyan: [ 36, 39 ],
//   green: [ 32, 39 ],
//   magenta: [ 35, 39 ],
//   red: [ 31, 39 ],
//   yellow: [ 33, 39 ] }

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
  log('install dest: ' + rootPath + '/node_modules');
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
    wr.on('finish', function () {
      log('copied ' + source + ' => ' + target);
      resolve();
    });
    rd.pipe(wr);
  });
}

function readDir(folder, ignore) {
  function valid(item) {
    return !ignore.includes(item);
  }
  return new Promise(function (resolve, reject) {
    fs.readdir(folder, function (err, ret) {
      if (err) {
        reject(err);
      }
      if (ignore && ignore.length) {
        ret = ret.filter(valid);
      }
      resolve(ret);
    });
  });
}

function isTaskFile(file) {
  return path.extname(file) === '.js' && file.indexOf('config') < 0;
}

function isTemplate(name) {
  return path.extname(name) === '' && name.indexOf('.') !== 0;
}

function isTaskName(item) {
  // return !['-g'].includes(item)
  return item.indexOf('-') !== 0;
}

function isRelative(str) {
  return (/^\.?\.\//.test(str)
  );
}

function basename(src, ext) {
  return path.basename(src, ext);
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
     */
    this.modulePaths = [cwd('node_modules')];
    if (opts.template) {
      this.modulePaths.push(dir(options.data_templates, opts.template, 'node_modules'));
    }
    this.modulePaths.push(dir(options.data_tasks, 'node_modules'));
    this.modulePaths.push(''); // global

    this.opts = opts;
  }

  createClass(Module, [{
    key: 'get',
    value: function get(name, type) {
      var ret = void 0;

      if (isRelative(name)) {
        // if (type === 'local') {
        //   ret = cwd(this.opts.paths.tasks)
        // } else if (type === 'template') {
        //   ret = dir(options.data_templates, this.opts.template, this.opts.paths.tasks)
        // }

        // local => template
        try {
          var localTasks = cwd(this.opts.paths.tasks);
          var found = require.resolve(join(localTasks, name));
          ret = localTasks;
        } catch (e) {
          log(e);
          try {
            var tmplTasks = dir(options.data_templates, this.opts.template, this.opts.paths.tasks);
            var _found = require.resolve(join(tmplTasks, name));
            ret = tmplTasks;
          } catch (e) {}
        }
      } else {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.modulePaths[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;

            var _p = join(item, name);

            try {
              var _found2 = require.resolve(_p);

              if (_found2) {
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
      }
      return ret;
    }
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
    value: function get(name, type, opts) {
      var ret, u_path, u_exist, _u_path, _u_exist, _u_path2, _u_exist2, _test, _test2, _test3;

      return Promise.resolve().then(function () {

        // if alias, get fullname from alias
        if (opts.alias && opts.alias[name]) {
          name = opts.alias[name];
        }

        // local task > tempalte task => global task

        ret = {
          name: name,
          cnt: '',
          type: ''
        };

        // find in local

        _test = type === 'local';

        if (_test) {
          u_path = cwd(opts.paths.tasks, name + '.js');
          u_exist = existSync(u_path);
        }

        if (_test && u_exist) {
          return Promise.resolve().then(function () {
            return read(u_path);
          }).then(function (_resp) {
            ret.cnt = _resp;
            ret.type = 'local';
          });
        }
      }).then(function () {

        // find in template
        _test2 = !ret.cnt && opts.template && opts.template !== '';

        if (_test2) {
          _u_path = dir(options.data_templates, opts.template, opts.paths.tasks, name + '.js');
          _u_exist = existSync(_u_path);
        }

        if (_test2 && _u_exist) {
          return Promise.resolve().then(function () {
            return read(_u_path);
          }).then(function (_resp) {
            ret.cnt = _resp;
            ret.type = 'template';
          });
        }
      }).then(function () {

        // find in global
        _test3 = !ret.cnt || type === 'global';

        if (_test3) {
          _u_path2 = dir(options.data_tasks, name, 'index.js');
          _u_exist2 = existSync(_u_path2);
        }

        if (_test3 && _u_exist2) {
          return Promise.resolve().then(function () {
            return read(_u_path2);
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
    value: function all(opts, justNames, justAvailable) {
      var _this,
          names,
          t_task_dir,
          t_exist,
          t_modules,
          u_task_dir,
          u_exist,
          u_modules,
          _iteratorNormalCompletion,
          _didIteratorError,
          _iteratorError,
          _iterator,
          _step,
          item,
          _iteratorNormalCompletion2,
          _didIteratorError2,
          _iteratorError2,
          _iterator2,
          _step2,
          _item,
          _test4,
          _test5,
          _test6,
          _test7,
          _this9 = this;

      return Promise.resolve().then(function () {
        _this = _this9;
        names = {
          locals: new Set(),
          globals: new Set(),
          template: new Set()
        };

        // template tasks

        if (opts.template && opts.template !== '') {
          return function () {
            var m_task_dir, m_exist, m_modules, _test8, _test9;

            return Promise.resolve().then(function () {
              m_task_dir = dir(options.data_templates, opts.template, opts.paths.tasks);
              return exist(m_task_dir);
            }).then(function (_resp) {
              m_exist = _resp;
              _test8 = m_exist;

              if (_test8) {
                return Promise.resolve().then(function () {
                  return readDir(m_task_dir);
                }).then(function (_resp) {
                  m_modules = _resp;

                  m_modules = m_modules.filter(isTaskFile);
                });
              }
            }).then(function () {
              if (_test8 && justNames) {
                m_modules.map(function (item) {
                  item = basename(item, '.js');
                  names.template.add(item);
                });
              } else {
                _test9 = _test8;
                if (_test9 && m_modules.length) {
                  return Promise.all(m_modules.map(function (item) {
                    return Promise.resolve().then(function () {
                      return read(join(m_task_dir, item));
                    }).then(function (_resp) {
                      _this.tasks[basename(item, '.js')] = _resp;
                    });
                  }));
                }
              }
            }).then(function () {});
          }();
        }
      }).then(function () {
        // global tasks
        t_task_dir = dir(options.data_tasks);
        return exist(t_task_dir);
      }).then(function (_resp) {
        t_exist = _resp;
        _test4 = t_exist;

        if (_test4) {
          return Promise.resolve().then(function () {
            return readDir(t_task_dir, ['node_modules', 'package.json']);
          }).then(function (_resp) {
            t_modules = _resp;
          });
        }
      }).then(function () {

        if (_test4 && justNames) {
          names.globals = new Set(t_modules);
        } else {
          _test6 = _test4;
          if (_test6 && t_modules.length) {
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
        _test5 = u_exist;

        if (_test5) {
          return Promise.resolve().then(function () {
            return readDir(u_task_dir);
          }).then(function (_resp) {
            u_modules = _resp;

            u_modules = u_modules.filter(isTaskFile);
          });
        }
      }).then(function () {
        if (_test5 && justNames) {
          u_modules.map(function (item) {
            item = basename(item, '.js');
            names.locals.add(item);
          });
        } else {
          _test7 = _test5;
          if (_test7 && u_modules.length) {
            return Promise.all(u_modules.map(function (item) {
              return Promise.resolve().then(function () {
                return Promise.resolve().then(function () {
                  return read(join(u_task_dir, item));
                }).then(function (_resp) {
                  _this.tasks[basename(item, '.js')] = _resp;
                }).catch(function (e) {
                  log(e);
                });
              }).then(function () {});
            }));
          }
        }
      }).then(function () {
        // names.locals = Array.from(new Set(names.locals)) // duplicate removal
        if (justAvailable) {
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;

          try {
            for (_iterator = names.template.values()[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              item = _step.value;

              if (names.locals.has(item)) {
                names.template.delete(item);
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

          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;

          try {
            for (_iterator2 = names.globals.values()[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              _item = _step2.value;

              if (names.locals.has(_item)) {
                names.globals.delete(_item);
              }
              if (names.template.has(_item)) {
                names.globals.delete(_item);
              }
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
        }

        if (justNames) {
          Object.keys(names).map(function (item) {
            names[item] = Array.from(names[item]); // Set => Array

            // alias

            var _loop = function _loop(i, len) {
              var alias = '';
              if (opts.alias) {
                Object.keys(opts.alias).map(function (a) {
                  if (opts.alias[a] === names[item][i]) {
                    alias = a;
                  }
                });
              }

              names[item][i] = {
                name: names[item][i],
                alias: alias
              };
            };

            for (var i = 0, len = names[item].length; i < len; i++) {
              _loop(i, len);
            }
          });
        }

        return justNames ? names : _this.tasks;
      });
    }
  }, {
    key: 'run',
    value: function run(name, ctx, taskObj) {
      var taskCnt = taskObj.cnt || this.tasks[name];
      var module = new Module(ctx.options);

      function requireResolve(mod) {
        // find mod path
        var mod_path = module.get(mod, taskObj.type);

        // if (mod_path) {
        //   if (mod_path === 'global') {
        //     return require(mod) // native or global module
        //   } else {
        //     return require(join(mod_path, mod))
        //   }
        // } else {
        //   log(`Module not found: ${mod}, try 'fbi install'`, 0)
        // }

        if (mod_path && mod_path !== 'global') {
          return require(join(mod_path, mod));
        } else {
          return mod ? require(mod) : require;
          // log(`Module not found: ${mod}, try 'fbi install'`, 0)
        }
      }

      var code = '\n    (function(require, ctx) {\n      try {\n        ' + taskCnt + '\n      } catch (e) {\n        console.log(e)\n      }\n    })';

      vm.runInThisContext(code, {
        filename: name + '.js',
        lineOffset: -3,
        displayErrors: true
      })(requireResolve, ctx);
    }
  }]);
  return Task;
}();

var ignore = [];

var _copy = (function (src, dst, ign) {
  ignore = ign ? ign : ignore;
  copy(src, dst, walk);
});

// src: dir or file
// dst: dir
function walk(src, dst) {
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
        copy(_src, _dst, walk);
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

      if (!name) {
        return false;
      } else {
        ret = false;
        src = dir(_this.opts.data_templates, name);
        has = existSync(src);


        if (has) {
          _copy(src, dst, ['node_modules', 'dst', 'dist']);
          return true;
        } else {
          return ret;
        }
      }
    }
  }, {
    key: 'all',
    value: function all() {
      var templates,
          _this2 = this;

      return Promise.resolve().then(function () {
        return readDir(dir(_this2.opts.data_templates));
      }).then(function (_resp) {
        templates = _resp;

        templates = templates.filter(isTemplate);
        return templates;
      });
    }
  }]);
  return Template;
}();

var defaultOptions = {
  // template: 'basic',
  paths: {
    tasks: 'fbi/',
    options: 'fbi/config.js'
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

var helps = '\n    Usage:\n\n      fbi [command]           run command\n      fbi [task]              run a local preference task\n      fbi [task] -g           run a global task\n      fbi [task] -t           run a template task\n\n    Commands:\n\n      new [template]          init a new template\n      rm [task][template]     remove tasks or templates\n      cat [task][-t, -g]      cat task content\n      ls, list                list all tasks & templates\n      i, install              install dependencies\n      i -f, install -f        install dependencies force\n      add-task                add task files in current folder\n      add-tmpl [name]         add current folder as a template named [name]\n      -h, --help              output usage information\n      -v, --version           output the version number\n';

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
      isTaskName: isTaskName, isTaskFile: isTaskFile
    };Promise.resolve().then(function () {
      return Promise.resolve().then(function () {
        _this.version();
        return _this.config();
      }).then(function () {
        return _this.help();
      }).then(function () {
        return _this.create();
      }).then(function () {
        return _this.install();
      }).then(function () {
        return _this.remove();
      }).then(function () {
        return _this.cat();
      }).then(function () {
        return _this.list();
      }).then(function () {
        return _this.add();
      }).then(function () {
        return _this.run();
      }).catch(function (e) {
        log(e, 0);
      });
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

                return task.all(_this5.options, true, true);
              }).then(function (_resp) {
                all = _resp;

                helps += '\n    Tasks:\n    ';
              });
            }
          }).then(function () {
            if (_test && all.globals.length) {
              all.globals.map(function (item) {
                helps += '\n      ' + item.name + ' ' + item.alias + ' <global>';
              });
            }

            if (_test && all.template.length) {
              all.template.map(function (item) {
                helps += '\n      ' + item.name + ' ' + item.alias + ' <template>';
              });
            }

            if (_test && all.locals.length) {
              all.locals.map(function (item) {
                helps += '\n      ' + item.name + ' ' + item.alias + ' <local>';
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
      var userOptionsPath,
          userOptions,
          templateOptionsPath,
          templateOptions,
          _this12 = this;

      return Promise.resolve().then(function () {
        if (!!_this12.next) {
          return Promise.resolve().then(function () {
            // default options
            _this12.options = defaultOptions;

            // user options
            userOptionsPath = cwd(_this12.options.paths.options);
            return exist(userOptionsPath);
          }).then(function (_resp) {
            _this12.isfbi = _resp;
            userOptions = _this12.isfbi ? require(userOptionsPath) : null;

            // template options

            if (userOptions && userOptions.template) {
              _this12.options['node_modules_path'] = dir(options.data_templates, userOptions.template, 'node_modules');

              templateOptionsPath = dir(options.data_templates, userOptions.template, _this12.options.paths.options);


              if (existSync(templateOptionsPath)) {
                templateOptions = require(templateOptionsPath);
                // merge template options

                _this12.options = getOptions(templateOptions);
              }
            }

            // merge user options
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
      var force,
          localdeps,
          tmplDeps,
          taskDeps,
          opts,
          tmplPkg,
          tmplPkg_exist,
          tmplPkg_dev,
          tmplPkgCnt,
          taskPkg,
          taskPkg_exist,
          taskPkg_dev,
          taskPkgCnt,
          npms,
          installTmplDeps,
          installTaskDeps,
          _test2,
          _test3,
          _test4,
          _this15 = this;

      return Promise.resolve().then(function () {
        if (!!_this15.next) {
          return Promise.resolve().then(function () {
            _test2 = _this15.argvs[0] === 'i' || _this15.argvs[0] === 'install';

            if (_test2) {
              _this15.next = false;

              force = _this15.argvs[1] === '-f' || _this15.argvs[1] === '-force';
              localdeps = {};
              tmplDeps = {};
              taskDeps = {};
              opts = _this15.options;

              // local package.json => devDependencies
            }

            return _test2 && exist(cwd('package.json'));
          }).then(function (_resp) {
            if (_resp) {
              localdeps = require(cwd('package.json')).devDependencies;
            }

            // template package.json => devDependencies
            _test3 = _test2 && opts.template;

            if (_test3) {
              return Promise.resolve().then(function () {
                tmplPkg = dir(options.data_templates, opts.template, 'package.json');
                return exist(tmplPkg);
              }).then(function (_resp) {
                tmplPkg_exist = _resp;
              });
            }
          }).then(function () {
            if (_test3 && tmplPkg_exist) {
              tmplPkg_dev = require(tmplPkg)['devDependencies'];

              tmplDeps = merge(tmplPkg_dev, localdeps);
            }
            if (_test3 && Object.keys(tmplDeps).length) {
              tmplPkgCnt = require(tmplPkg);

              tmplPkgCnt['devDependencies'] = tmplDeps;
              return write(tmplPkg, JSON.stringify(tmplPkgCnt, null, 2));
            } else {
              return Promise.resolve().then(function () {
                _test4 = _test2;

                if (_test4) {
                  return Promise.resolve().then(function () {
                    taskPkg = dir(options.data_tasks, 'package.json');
                    return exist(taskPkg);
                  }).then(function (_resp) {
                    taskPkg_exist = _resp;
                  });
                }
              }).then(function () {
                if (_test4 && taskPkg_exist) {
                  taskPkg_dev = require(taskPkg).devDependencies;

                  taskDeps = merge(taskPkg_dev, localdeps);
                }
                if (_test4 && Object.keys(taskDeps).length) {
                  taskPkgCnt = require(taskPkg);

                  taskPkgCnt['devDependencies'] = taskDeps;
                  return write(taskPkg, JSON.stringify(taskPkgCnt, null, 2));
                }
              });
            }
          }).then(function () {
            if (_test2) {
              return Promise.resolve().then(function () {
                npms = opts.npm;
                return Object.keys(tmplDeps).length ? install(tmplDeps, dir(options.data_templates, opts.template), npms.alias, npms.options) : Promise.resolve();
              }).then(function (_resp) {
                installTmplDeps = _resp;
                return Object.keys(taskDeps).length ? install(taskDeps, dir(options.data_tasks), npms.alias, npms.options) : Promise.resolve();
              }).then(function (_resp) {
                installTaskDeps = _resp;

                // install

                Promise.all([installTmplDeps, installTaskDeps]).then(function (ret) {
                  log('All Dependencies Installed', 1);
                }).catch(function (err) {
                  log(err, 0);
                });
              });
            }
          });
        }
      }).then(function () {});
    }
  }, {
    key: 'create',
    value: function create() {
      var name,
          succ,
          _test5,
          _this32 = this;

      return Promise.resolve().then(function () {
        if (!!_this32.next) {
          _test5 = _this32.argvs[0] === 'new';

          // log(this.argvs[1].match(/^[^\\/:*""<>|,]+$/i))
          if (_test5) {
            _this32.next = false;
          }

          if (_test5 && !_this32.argvs[1]) {
            return log('Usage: fbi new [template name]', 0);
          } else {
            if (_test5) {
              return Promise.resolve().then(function () {
                name = _this32.argvs[1];
                return template.copy(name, cwd());
              }).then(function (_resp) {
                succ = _resp;

                if (succ) {
                  log('Template \'' + name + '\' copied to current folder', 1);
                } else {
                  log('Template \'' + name + '\' not found', 0);
                }
              }).catch(function (e) {
                log(e);
              });
            }
          }
        }
      }).then(function () {});
    }
  }, {
    key: 'remove',
    value: function remove() {
      var mods,
          _this39 = this;

      if (!!_this39.next) {

        if (_this39.argvs[0] === 'rm' || _this39.argvs[0] === 'remove') {
          _this39.next = false;

          mods = _this39.argvs.slice(1);

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
    key: 'cat',
    value: function cat() {
      var name,
          type,
          taskObj,
          _test6,
          _this40 = this;

      return Promise.resolve().then(function () {
        if (!!_this40.next) {
          _test6 = _this40.argvs[0] === 'cat';

          if (_test6) {
            _this40.next = false;
          }

          if (_test6 && !_this40.argvs[1]) {
            return log('Usage: fbi cat [task] [-t, -g]', 0);
          } else {
            if (_test6) {
              name = _this40.argvs[1];
              type = 'local';
            }

            if (_test6 && _this40.argvs[2] === '-g') {
              type = 'global';
            } else {
              if (_test6) {
                if (_this40.argvs[2] === '-t') {
                  type = 'template';
                }
              }
            }
            if (_test6) {
              return Promise.resolve().then(function () {
                return task.get(name, type, _this40.options);
              }).then(function (_resp) {
                taskObj = _resp;

                log(taskObj.type + ' task ' + name + '\'s content:\n\n' + taskObj.cnt + '\n        ');
              });
            }
          }
        }
      }).then(function () {});
    }
  }, {
    key: 'list',
    value: function list() {
      var _helps,
          all,
          tmpls,
          _test7,
          _this47 = this;

      return Promise.resolve().then(function () {
        if (!!_this47.next) {
          return Promise.resolve().then(function () {
            _test7 = _this47.argvs[0] === 'ls' || _this47.argvs[0] === 'list';

            if (_test7) {
              return Promise.resolve().then(function () {
                _this47.next = false;

                _helps = '';
                return task.all(_this47.options, true, false);
              }).then(function (_resp) {
                all = _resp;

                _helps += '\n    Tasks:\n    ';
              });
            }
          }).then(function () {
            if (_test7 && all.globals.length) {
              all.globals.map(function (item) {
                _helps += '\n      ' + item.name + ' ' + item.alias + ' <global>';
              });
            }

            if (_test7 && all.template.length) {
              all.template.map(function (item) {
                _helps += '\n      ' + item.name + ' ' + item.alias + ' <template>';
              });
            }

            if (_test7 && all.locals.length) {
              all.locals.map(function (item) {
                _helps += '\n      ' + item.name + ' ' + item.alias + ' <local>';
              });
            }

            if (_test7) {
              return Promise.resolve().then(function () {
                return template.all();
              }).then(function (_resp) {
                tmpls = _resp;
              });
            }
          }).then(function () {
            if (_test7 && tmpls.length) {
              _helps += '\n\n    Templates:\n      ';
              tmpls.map(function (item) {
                _helps += '\n      ' + item;
              });
            }

            if (_test7) {
              _helps += '\n      ';

              console.log(_helps);
            }
          });
        }
      }).then(function () {});
    }
  }, {
    key: 'add',
    value: function add() {
      var _this2,
          ts,
          _this54 = this;

      return Promise.resolve().then(function () {
        _this2 = _this54;

        if (!!_this54.next) {

          if (_this54.argvs[0] === 'add-tmpl') {
            return function () {
              var name, isExist;
              return Promise.resolve().then(function () {
                _this2.next = false;

                // add template
                name = _this2.argvs[1] || basename(cwd(), '');
                return exist(dir(options.data_templates, name));
              }).then(function (_resp) {
                isExist = _resp;


                if (isExist) {
                  (function () {
                    log('tempalte \'' + name + '\' already exist, type \'y\' to replace, type a name to create a new one', 0);

                    var rl = readline.createInterface(process.stdin, process.stdout),
                        prompts = ['name'],
                        p = 0,
                        data = {};

                    var get = function get() {
                      rl.setPrompt(prompts[p] + '> ');
                      rl.prompt();

                      p++;
                    };

                    get();

                    rl.on('line', function (line) {
                      data[prompts[p - 1]] = line;

                      if (p === prompts.length) {
                        return rl.close();
                      }

                      get();
                    }).on('close', function () {
                      var isExist2;
                      return Promise.resolve().then(function () {
                        if (data.name === 'y') {
                          _copy(cwd(), dir(options.data_templates, name), ['dst', 'dist']);
                        } else {
                          if (data.name === '') {
                            log('name can\'t be empty');
                          } else {
                            return Promise.resolve().then(function () {
                              return exist(dir(options.data_templates, data.name));
                            }).then(function (_resp) {
                              isExist2 = _resp;

                              if (isExist2) {
                                log(data.name + ' already exist too', 0);
                                process.exit(0);
                              } else {
                                _copy(cwd(), dir(options.data_templates, data.name), ['dst', 'dist']);
                              }
                            });
                          }
                        }
                      }).then(function () {});
                    });
                  })();
                } else {
                  _copy(cwd(), dir(options.data_templates, name));
                }
              });
            }();
          } else {
            if (_this54.argvs[0] === 'add-task') {
              _this54.next = false;

              log(_this54.argvs);

              if (!_this54.argvs[1]) {
                log('Usage: fbi add-task [*] or [name.js]');
              } else {
                log('y');
                ts = _this54.argvs.slice(1);

                ts = ts.filter(isTaskFile);
                if (!ts.length) {
                  log('no task found.', 0);
                } else {
                  ts.map(function (item) {
                    return Promise.resolve().then(function () {
                      return copyFile(cwd(item), dir(options.data_tasks, basename(item, '.js'), 'index.js'));
                    }).then(function () {
                      log('task \'' + item + '\' added successfully', 1);
                      // TODO: mkdirp
                    });
                  });
                }
              }
            }
          }
        }
      }).then(function () {});
    }
  }, {
    key: 'run',
    value: function run() {
      var _this3,
          cmds,
          _this66 = this;

      _this3 = _this66;

      if (!!_this66.next) {
        cmds = _this66.argvs;

        if (_this66.argvs.length > 0) {
          (function () {
            var type = 'local';
            if (_this3.argvs[1] === '-g') {
              type = 'global';
            } else if (_this3.argvs[1] === '-t') {
              type = 'template';
            }
            try {
              cmds = cmds.filter(isTaskName);
              cmds.map(function (cmd) {
                var taskObj;
                return Promise.resolve().then(function () {
                  return task.get(cmd, type, _this3.options);
                }).then(function (_resp) {
                  taskObj = _resp;

                  if (taskObj.cnt) {
                    log('Running ' + taskObj.type + ' task \'' + taskObj.name + '\'...', 1);
                    task.run(cmd, _this3, taskObj);
                  } else {
                    log('Task not found: \'' + cmd, 0);
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

    this.Cli = Cli;
  }

  createClass(Fbi, [{
    key: 'run',
    value: function run(cmds) {
      if (!cmds) {
        return;
      }

      new Fbi.cli(typeof cmds === 'string' ? [cmds] : cmds);
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
