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
 * type:
 * -1 waring, 0 error, 1 succ
 * bold, italic, underline, inverse, white, grey,
 * black, blue, cyan, green, magenta, red, yellow
 */
function log(msg, type) {
  if (typeof msg === 'string') {
    if (type !== undefined) {
      switch (type) {
        case -1:
          msg = colors().grey('FBI => ') + colors().red(msg);
          break;
        case 0:
          msg = colors().grey('FBI Error => ') + colors().magenta(msg);
          break;
        case 1:
          msg = colors().grey('FBI => ') + colors().cyan(msg);
          break;
        default:
          msg = colors().grey('FBI => ') + colors()[type] ? colors()[type](msg) : msg;
      }
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

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
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
  var info = '';

  Object.keys(source).map(function (item) {
    pkgs += item + '@' + source[item] + ' ';
    info += '\n       ' + item + '@' + source[item] + ' ';
  });
  info += '\n       ' + (opts ? opts : '') + '\n    to:' + rootPath + '\n  ';

  process.chdir(rootPath);
  var cmd = command + ' install ' + pkgs + ' ' + (opts ? opts : '');
  log(command + ' install ' + info);
  return new Promise(function (resolve, reject) {
    child_process.exec(cmd, function (error, stdout, stderr) {
      process.chdir(prevDir);
      if (error) {
        var msg = stderr.toString();
        log(msg, 0);
        return reject(msg);
      }

      log('\n' + stdout);
      resolve(stdout);
    });
  });
}

function copyFile(source, target, quiet) {
  return new Promise(function (resolve, reject) {
    var rd = fs.createReadStream(source);
    rd.on('error', reject);
    var wr = fs.createWriteStream(target);
    wr.on('error', reject);
    wr.on('finish', function () {
      if (!quiet) {
        log('copied ' + source + ' => ' + target);
      }
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

function mkdir(p) {
  return new Promise(function (resolve, reject) {
    fs.mkdir(p, function (err) {
      return err ? reject(err) : resolve();
    });
  });
}

function rmfile(p, callback) {
  fs.lstat(p, function (err, stat) {
    if (err) callback.call(null, err);else if (stat.isDirectory()) rmdir(p, callback);else fs.unlink(p, callback);
  });
}

function rmdir(dir, callback) {
  fs.readdir(dir, function (err, files) {
    if (err) callback.call(null, err);else if (files.length) {
      var i, j;
      for (i = j = files.length; i--;) {
        rmfile(join(dir, files[i]), function (err) {
          if (err) callback.call(null, err);else if (--j === 0) fs.rmdir(dir, callback);
        });
      }
    } else fs.rmdir(dir, callback);
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

function isAbsolute(str) {
  return (/^(?:\/|(?:[A-Za-z]:)?[\\|\/])/.test(str)
  );
}

function isRelative(str) {
  return (/^\.?\.\//.test(str)
  );
}

function basename(src, ext) {
  return path.basename(src, ext);
}

/**
 * arr:
 * build -p -w serve -3000 deploy -10.11.11.1
 * prefix: -
 *
 * return

  { build: { params: [ 'p', 'w' ] },
    serve: { params: [ '3000' ] },
    deploy: { params: [ '10.11.11.1' ] }
  }

 */
function parseArgvs(arr, prefix) {

  if (!arr.length || !prefix) {
    log('Usage: let ret = parseArgvs(arr, prefix)', 0);
    return arr;
  }

  var ret = {};

  arr.reduce(function (prev, curr, idx) {
    if (curr.indexOf(prefix) === 0) {
      if (ret[prev]) {
        if (Array.isArray(ret[prev]['params'])) {
          ret[prev]['params'].push(curr.slice(prefix.length));
        } else {
          ret[prev]['params'] = [curr.slice(prefix.length)];
        }
      }
      return prev;
    } else {
      ret[curr] = {};
      return curr;
    }
  }, arr[0]);

  return ret;
}

function fillGap(str, max, gap) {
  gap = gap === undefined ? ' ' : gap;
  if (str.length >= max) {
    return str;
  } else {
    return str + gap.repeat(max - str.length);
  }
}

function genTaskHelpTxt(all) {
  if (!Object.keys(all).length) {
    return '';
  }
  var txt = '\n    Tasks:\n    ';
  var tasksTxt = '';
  ['global', 'template', 'local'].map(function (type) {
    if (all[type].length) {
      all[type].map(function (item) {
        tasksTxt += '\n      ' + fillGap((item.alias ? item.alias + ', ' : '') + item.name, 15, ' ') + ' <' + type + '>';
      });
    }
  });
  return tasksTxt ? txt + tasksTxt : '';
}

function genTmplHelpTxt(all) {
  if (!all.length) {
    return '';
  }
  var txt = '\n\n    Templates:\n    ';
  all.map(function (item) {
    txt += '\n      ' + item;
  });
  return txt;
}

function genNpmscriptsHelpTxt(all) {
  if (!Object.keys(all).length) {
    return '';
  }
  var txt = '\n\n    npm scrips:\n    ';
  Object.keys(all).map(function (item) {
    txt += '\n      ' + item + ': \'' + all[item] + '\'';
  });
  return txt;
}

function flatLog(cnt) {
  console.log('\n\n' + cnt + '\n\n');
}

var Task = function () {
  function Task() {
    classCallCheck(this, Task);

    this.tasks = {};
  }

  createClass(Task, [{
    key: 'get',
    value: function get(name, type, opts) {

      function find(_path, _type) {
        var _exist;

        return Promise.resolve().then(function () {
          _path = _path + '.js';
          _exist = existSync(_path);

          if (_exist) {
            return Promise.resolve().then(function () {
              return read(_path);
            }).then(function (_resp) {
              ret.cnt = _resp;
              ret.type = _type;
              ret.path = _path;
            });
          }
        }).then(function () {});
      }

      // find in local
      var ret;
      return Promise.resolve().then(function () {
        // if alias, get fullname from alias
        if (opts.alias && opts.alias[name]) {
          name = opts.alias[name];
        }

        // local task > tempalte task => global task
        ret = {
          name: name,
          cnt: '',
          type: '',
          path: ''
        };

        // find in template


        // find in global

        if (type === 'local') {
          return find(cwd(opts.paths.tasks, name), type);
        }
      }).then(function () {
        if (!ret.cnt && opts.template && opts.template !== '') {
          return find(join(opts.data.templates, opts.template, opts.paths.tasks, name), 'template');
        }
      }).then(function () {
        if (!ret.cnt || type === 'global') {
          return find(join(opts.data.tasks, name), 'global');
        }
      }).then(function () {
        return ret;
      });
    }
  }, {
    key: 'all',
    value: function all(opts, justNames, justAvailable) {

      function collect(_dir, type) {
        var _exist, _modules, _test, _test2;

        return Promise.resolve().then(function () {
          return exist(_dir);
        }).then(function (_resp) {
          _exist = _resp;
          _modules = void 0;
          _test = _exist;

          if (_test) {
            return Promise.resolve().then(function () {
              return readDir(_dir);
            }).then(function (_resp) {
              _modules = _resp;
              _modules = _modules.filter(isTaskFile);
            });
          }
        }).then(function () {
          if (_test && justNames) {
            _modules.map(function (item) {
              item = basename(item, '.js');
              names[type].add(item);
            });
          } else {
            _test2 = _test;
            if (_test2 && _modules.length) {
              return Promise.all(_modules.map(function (item) {
                return Promise.resolve().then(function () {
                  return read(join(_dir, item));
                }).then(function (_resp) {
                  _this.tasks[basename(item, '.js')] = _resp;
                });
              }));
            }
          }
        }).then(function () {});
      }

      // template tasks

      var _this,
          names,
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
          _this12 = this;

      return Promise.resolve().then(function () {
        _this = _this12;
        names = {
          local: new Set(),
          global: new Set(),
          template: new Set()
        };

        // global tasks


        // locals

        if (opts.template && opts.template !== '') {
          return collect(join(opts.data.templates, opts.template, opts.paths.tasks), 'template');
        }
      }).then(function () {
        return collect(join(opts.data.tasks), 'global');
      }).then(function () {
        return collect(cwd(opts.paths.tasks), 'local');
      }).then(function () {

        if (justAvailable) {
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;

          try {
            for (_iterator = names.template.values()[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              item = _step.value;

              if (names.local.has(item)) {
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
            for (_iterator2 = names.global.values()[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              _item = _step2.value;

              if (names.local.has(_item)) {
                names.global.delete(_item);
              }
              if (names.template.has(_item)) {
                names.global.delete(_item);
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
            if (names[item].length) {
              var _loop = function _loop(i, len) {
                var alias = '';
                var description = '';
                if (opts.alias) {
                  Object.keys(opts.alias).map(function (a) {
                    if (opts.alias[a] === names[item][i]) {
                      alias = a;
                    }
                  });
                }

                names[item][i] = {
                  name: names[item][i],
                  alias: alias,
                  desc: description
                };
              };

              for (var i = 0, len = names[item].length; i < len; i++) {
                _loop(i, len);
              }
            }
          });
        }
        return justNames ? names : _this.tasks;
      });
    }
  }, {
    key: 'run',
    value: function run(name, ctx, taskObj, module) {
      var taskCnt = taskObj.cnt || this.tasks[name];

      function requireResolve(mod) {
        // find mod path
        var mod_path = module.get(mod, taskObj.type);
        if (mod_path && mod_path !== 'global') {
          return require(join(mod_path, mod));
        } else {
          return mod ? require(mod) : require;
        }
      }

      var code = '\n    (function(require, ctx) {\n      if(!ctx.next || ctx.next === \'false\') return false;\n\n      ctx.log(\'Running ' + taskObj.type + ' task "' + taskObj.name + taskObj.params + '"...\', 1);\n      try {\n        ' + taskCnt + '\n      } catch (e) {\n        ctx.log(\'task function error\', 0)\n        ctx.log(e, 0)\n      }\n    })';

      vm.runInThisContext(code, {
        filename: taskObj.name + '.js',
        lineOffset: -3,
        displayErrors: true
      })(requireResolve, ctx);
    }
  }]);
  return Task;
}();

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
      this.modulePaths.push(join(opts.data.templates, opts.template, 'node_modules'));
    }
    this.modulePaths.push(join(opts.data.tasks, 'node_modules'));
    this.modulePaths.push(''); // global

    this.opts = opts;
  }

  createClass(Module, [{
    key: 'get',
    value: function get(name, type) {
      var ret = void 0;

      if (isRelative(name)) {
        // local => template
        try {
          var localTasks = cwd(this.opts.paths.tasks);
          var found = require.resolve(join(localTasks, name));
          ret = localTasks;
        } catch (e) {
          try {
            var tmplTasks = join(this.opts.data.templates, this.opts.template, this.opts.paths.tasks);
            var _found = require.resolve(join(tmplTasks, name));
            ret = tmplTasks;
          } catch (e) {
            log('can\'t find module ' + name + ' in template \'' + this.opts.template + '\'', 0);
          }
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

var ignore = [];

var copy = (function (src, dst, ign) {
  ignore = ign ? ign : ignore;
  copy$1(src, dst, walk);
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
        copy$1(_src, _dst, walk);
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

  readable = fs.createReadStream(src);
  writable = fs.createWriteStream(dst);
  readable.pipe(writable);

  var _path = path.relative(process.cwd(), dst);
  log('copied => ' + _path);
}

function copy$1(src, dst, cb) {
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
  function Template() {
    classCallCheck(this, Template);
  }

  createClass(Template, [{
    key: 'init',
    value: function init(name, dst, opts) {
      var ret, src, has;

      if (!name) {
        return false;
      } else {
        ret = false;
        src = join(opts.data.templates, name);
        has = existSync(src);


        if (has) {
          copy(src, dst, opts.TEMPLATE_INIT_IGNORE);
          return true;
        } else {
          return ret;
        }
      }
    }
  }, {
    key: 'all',
    value: function all(opts) {
      var _exist, templates;

      return Promise.resolve().then(function () {
        return exist(join(opts.data.templates));
      }).then(function (_resp) {
        _exist = _resp;
        templates = void 0;

        if (_exist) {
          return Promise.resolve().then(function () {
            return readDir(join(opts.data.templates));
          }).then(function (_resp) {
            templates = _resp;
            templates = templates.filter(isTemplate);
          });
        } else {
          templates = [];
        }
      }).then(function () {
        return templates;
      });
    }
  }]);
  return Template;
}();

var opts = {
  task_param_prefix: '-',
  paths: {
    tasks: 'fbi/',
    config: 'fbi/config.js'
  },
  data: {
    root: './data',
    tasks: './data/tasks',
    templates: './data/templates'
  },
  server: {
    root: './',
    host: 'localhost',
    port: 8888
  },
  npm: {
    alias: 'npm',
    options: '--save-dev'
  },
  TEMPLATE_ADD_IGNORE: ['node_modules', 'dst', 'dist', '.DS_Store', '.svn', '.git'],
  TEMPLATE_INIT_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist'],
  BACKUP_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist'],
  RECOVER_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist']
};

var version = "2.0.0";

var helps = '\n    Usage:\n\n      fbi [command]           run command\n      fbi [task]              run a local preference task\n      fbi [task] -g           run a global task\n      fbi [task] -t           run a template task\n\n    Commands:\n\n      ata,   add-task [*, name.js]    add task files in current folder\n      atm,   add-tmpl [name]          add current folder as a template named [name]\n      rta,   rm-task  [-t] [name]     remove task\n      rtm,   rm-tmpl  [name]          remove template\n      i,     install                  install dependencies\n      ls,    list                     list all tasks & templates\n      cat    [task]   [-t, -g]        cat task content\n      init   [template]               init a new project via template\n      backup                          backup tasks & templates\n      recover                         recover tasks & templates from current folder\n\n      -h,    --help                   output usage information\n      -v,    --version                output the version number\n';

var task = new Task();
var template = new Template();

var Fbi = function () {
  function Fbi(argvs) {
    var _this = this;

    classCallCheck(this, Fbi);

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
        return _this.init();
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
        _this.backup();
        _this.recover();
        return _this.run();
      }).catch(function (e) {
        log(e, 0);
      });
    }).then(function () {});
  }

  createClass(Fbi, [{
    key: 'version',
    value: function version$$() {
      if (!this.next || !this.argvs.length) return;

      if (this.argvs[0] === '-v' || this.argvs[0] === '--verison') {
        this.next = false;
        console.log(version);
      }
    }
  }, {
    key: 'config',
    value: function config() {
      var _this2,
          _this7 = this;

      return Promise.resolve().then(function () {

        // user options > tempalte options > default options
        _this2 = _this7;

        if (!!_this7.next) {
          return Promise.resolve().then(function () {
            return function () {
              var userConfigPath, userConfig, data, templateOptionsPath, templateOptions;
              return Promise.resolve().then(function () {
                // user options
                userConfigPath = cwd(opts.paths.config);
                return exist(userConfigPath);
              }).then(function (_resp) {
                _this2.isfbi = _resp;
                userConfig = _this2.isfbi ? require(userConfigPath) : null;

                // merge user options

                _this2.options = merge(opts, userConfig);

                data = clone(_this2.options.data);
                // parse data path

                Object.keys(data).map(function (item) {
                  if (!isAbsolute(data[item])) {
                    data[item] = dir(data[item]);
                  }
                });

                // template options
                if (userConfig && userConfig.template) {
                  _this2.options['node_modules_path'] = join(data.templates, userConfig.template, 'node_modules');

                  templateOptionsPath = join(data.templates, userConfig.template, _this2.options.paths.config);


                  if (existSync(templateOptionsPath)) {
                    templateOptions = require(templateOptionsPath);
                    // merge template options

                    merge(_this2.options, templateOptions);
                  }
                }
                // merge user options
                merge(_this2.options, userConfig);
                // parse data path
                Object.keys(_this2.options.data).map(function (item) {
                  if (!isAbsolute(_this2.options.data[item])) {
                    _this2.options.data[item] = dir(_this2.options.data[item]);
                  }
                });
              });
            }();
          }).catch(function (e) {
            log(e);
          });
        }
      }).then(function () {});
    }
  }, {
    key: 'help',
    value: function help() {
      var _this11 = this;

      return Promise.resolve().then(function () {
        if (!!_this11.next) {

          if (!_this11.argvs.length || _this11.argvs[0] === '-h' || _this11.argvs[0] === '--help') {
            return Promise.resolve().then(function () {
              _this11.next = false;

              return task.all(_this11.options, true, true);
            }).then(function (_resp) {
              helps += genTaskHelpTxt(_resp);
              return template.all(_this11.options);
            }).then(function (_resp) {
              helps += genTmplHelpTxt(_resp);
              helps += '\n      ';
              console.log(helps);
            });
          }
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
          _opts,
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
          _test,
          _test2,
          _test3,
          _this16 = this;

      return Promise.resolve().then(function () {
        if (!!_this16.next) {
          return Promise.resolve().then(function () {
            _test = _this16.argvs[0] === 'i' || _this16.argvs[0] === 'install';

            if (_test) {
              _this16.next = false;

              force = _this16.argvs[1] === '-f' || _this16.argvs[1] === '-force';
              localdeps = {};
              tmplDeps = {};
              taskDeps = {};
              _opts = _this16.options;

              // local package.json => devDependencies
            }

            return _test && exist(cwd('package.json'));
          }).then(function (_resp) {
            if (_resp) {
              localdeps = require(cwd('package.json')).devDependencies;
            }

            // template package.json => devDependencies
            _test2 = _test && _opts.template;

            if (_test2) {
              return Promise.resolve().then(function () {
                tmplPkg = join(_opts.data.templates, _opts.template, 'package.json');
                return exist(tmplPkg);
              }).then(function (_resp) {
                tmplPkg_exist = _resp;
              });
            }
          }).then(function () {
            if (_test2 && tmplPkg_exist) {
              tmplPkg_dev = require(tmplPkg)['devDependencies'];

              tmplDeps = merge(tmplPkg_dev, localdeps);
            }
            if (_test2 && Object.keys(tmplDeps).length) {
              tmplPkgCnt = require(tmplPkg);

              tmplPkgCnt['devDependencies'] = tmplDeps;
              return write(tmplPkg, JSON.stringify(tmplPkgCnt, null, 2));
            } else {
              return Promise.resolve().then(function () {
                _test3 = _test;

                if (_test3) {
                  return Promise.resolve().then(function () {
                    taskPkg = join(_opts.data.tasks, 'package.json');
                    return exist(taskPkg);
                  }).then(function (_resp) {
                    taskPkg_exist = _resp;
                  });
                }
              }).then(function () {
                if (_test3 && taskPkg_exist) {
                  taskPkg_dev = require(taskPkg).devDependencies;

                  taskDeps = merge(taskPkg_dev, localdeps);
                }
                if (_test3 && Object.keys(taskDeps).length) {
                  taskPkgCnt = require(taskPkg);

                  taskPkgCnt['devDependencies'] = taskDeps;
                  return write(taskPkg, JSON.stringify(taskPkgCnt, null, 2));
                }
              });
            }
          }).then(function () {
            if (_test) {
              return Promise.resolve().then(function () {
                npms = _opts.npm;
                return Object.keys(tmplDeps).length ? install(tmplDeps, join(_opts.data.templates, _opts.template), npms.alias, npms.options) : Promise.resolve();
              }).then(function (_resp) {
                installTmplDeps = _resp;
                return Object.keys(taskDeps).length ? install(taskDeps, _opts.data.tasks, npms.alias, npms.options) : Promise.resolve();
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
    key: 'init',
    value: function init() {
      var name,
          succ,
          _test4,
          _this33 = this;

      return Promise.resolve().then(function () {
        if (!!_this33.next) {
          _test4 = _this33.argvs[0] === 'init';

          // log(this.argvs[1].match(/^[^\\/:*""<>|,]+$/i))
          if (_test4) {
            _this33.next = false;
          }

          if (_test4 && !_this33.argvs[1]) {
            return log('Usage: fbi init [template name]', 0);
          } else {
            if (_test4) {
              return Promise.resolve().then(function () {
                name = _this33.argvs[1];
                return template.init(name, cwd(), _this33.options);
              }).then(function (_resp) {
                succ = _resp;

                if (succ) {
                  log('Template \'' + name + '\' init in current folder', 1);
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
      var _this3,
          _this40 = this;

      return Promise.resolve().then(function () {
        _this3 = _this40;

        if (!!_this40.next) {
          return Promise.resolve().then(function () {

            if (_this40.argvs[0] === 'rm-task' || _this40.argvs[0] === 'rta') {
              return function () {
                var mods, tasks_path, tmpl_name, tmpl_exist, tasks, _test5, _test6, _test7;

                return Promise.resolve().then(function () {
                  _this3.next = false;

                  mods = _this3.argvs.slice(1);

                  if (!mods.length) {
                    log('Usage: fbi rm-task [name]', 0);
                    process.exit(0);
                  }
                  tasks_path = _this3.options.data.tasks;
                  tmpl_name = void 0;
                  _test5 = mods[0].indexOf('-') === 0;

                  if (_test5) {
                    tmpl_name = mods[0].slice(1);
                    mods = mods.splice(1, 1);
                  }

                  _test6 = _test5 && tmpl_name !== '';
                  _test7 = _test6 && mods.length;

                  if (_test7) {
                    return Promise.resolve().then(function () {
                      return exist(join(_this3.options.data.templates, tmpl_name));
                    }).then(function (_resp) {
                      tmpl_exist = _resp;
                    });
                  }
                }).then(function () {
                  if (_test7 && tmpl_exist) {
                    tasks_path = join(_this3.options.data.templates, tmpl_name, _this3.options.paths.tasks);
                  } else {
                    if (_test7) {
                      log('template \'' + tmpl_name + '\' not found', 0);
                      process.exit(0);
                    }

                    if (_test6) {
                      log('Usage: fbi rm-task -[template] [task]', 0);
                      process.exit(0);
                    }

                    if (_test5) {
                      log('Usage: fbi rm-task -[template] [task]', 0);
                      process.exit(0);
                    }
                  }
                  return readDir(tasks_path);
                }).then(function (_resp) {
                  tasks = _resp;

                  mods.map(function (item) {
                    item = item + '.js';
                    if (tasks.includes(item)) {
                      try {
                        rmfile(join(tasks_path, item), function (err) {
                          if (err) {
                            log(err, 0);
                          }
                          log('task ' + basename(item, '.js') + ' ' + (tmpl_name ? 'in ' + tmpl_name + ' ' : '') + 'removed', 1);
                        });
                      } catch (e) {
                        log(e, 0);
                      }
                    } else {
                      log('task \'' + basename(item, '.js') + '\' ' + (tmpl_name ? 'in ' + tmpl_name + ' ' : '') + ' not found', 0);
                    }
                  });
                });
              }();
            }
          }).then(function () {
            if (_this40.argvs[0] === 'rm-tmpl' || _this40.argvs[0] === 'rtm') {
              return function () {
                var mods, tmpls;
                return Promise.resolve().then(function () {
                  _this3.next = false;

                  mods = _this3.argvs.slice(1);

                  if (!mods.length) {
                    log('Usage: fbi rm-tmpl [name]', 0);
                    process.exit(0);
                  }
                  return readDir(_this3.options.data.templates);
                }).then(function (_resp) {
                  tmpls = _resp;

                  mods.map(function (item) {
                    if (tmpls.includes(item)) {
                      try {
                        rmdir(join(_this3.options.data.templates, item), function (err) {
                          if (err) {
                            log(err, 0);
                          }
                          log('template \'' + item + '\' removed', 1);
                        });
                      } catch (e) {
                        log(e, 0);
                      }
                    } else {
                      log('template \'' + item + '\' not found', 0);
                    }
                  });
                });
              }();
            }
          });
        }
      }).then(function () {});
    }
  }, {
    key: 'cat',
    value: function cat() {
      var name,
          type,
          taskObj,
          _test8,
          _this53 = this;

      return Promise.resolve().then(function () {
        if (!!_this53.next) {
          _test8 = _this53.argvs[0] === 'cat';

          if (_test8) {
            _this53.next = false;
          }

          if (_test8 && !_this53.argvs[1]) {
            return log('Usage: fbi cat [task] [-t, -g]', 0);
          } else {
            if (_test8) {
              name = _this53.argvs[1];
              type = 'local';
            }

            if (_test8 && _this53.argvs[2] === '-g') {
              type = 'global';
            } else {
              if (_test8) {
                if (_this53.argvs[2] === '-t') {
                  type = 'template';
                }
              }
            }
            if (_test8) {
              return Promise.resolve().then(function () {
                return task.get(name, type, _this53.options);
              }).then(function (_resp) {
                taskObj = _resp;

                log('file path: ' + taskObj.path);
                log(taskObj.type + ' task ' + name + '\'s content:', 1);
                flatLog(taskObj.cnt);
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
          usrpkg,
          _test9,
          _test10,
          _this60 = this;

      return Promise.resolve().then(function () {
        if (!!_this60.next) {
          return Promise.resolve().then(function () {
            _test9 = _this60.argvs[0] === 'ls' || _this60.argvs[0] === 'list';

            if (_test9) {
              return Promise.resolve().then(function () {
                _this60.next = false;

                return task.all(_this60.options, true, false);
              }).then(function (_resp) {
                _helps = genTaskHelpTxt(_resp);
                return template.all(_this60.options);
              }).then(function (_resp) {

                _helps += genTmplHelpTxt(_resp);
              });
            }
          }).then(function () {
            return _test9 && exist(cwd('package.json'));
          }).then(function (_resp) {
            _test10 = _resp;

            if (_test10) {
              usrpkg = require(cwd('package.json'));
            }

            if (_test10 && usrpkg.scripts && Object.keys(usrpkg.scripts).length > 0) {
              _helps += genNpmscriptsHelpTxt(usrpkg.scripts);
            }

            if (_test9) {

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
      var _this4,
          ts,
          _this66 = this;

      return Promise.resolve().then(function () {
        _this4 = _this66;

        if (!!_this66.next) {
          return Promise.resolve().then(function () {

            if (_this66.argvs[0] === 'add-tmpl' || _this66.argvs[0] === 'atm') {
              return function () {
                var name, isExist;
                return Promise.resolve().then(function () {
                  _this4.next = false;

                  // add template
                  name = _this4.argvs[1] || basename(cwd(), '');
                  return exist(join(_this4.options.data.templates, name));
                }).then(function (_resp) {
                  isExist = _resp;


                  if (isExist) {
                    (function () {
                      log('tempalte \'' + name + '\' already exist, type \'y\' to replace, or type name to create new one', -1);
                      var rl = readline.createInterface(process.stdin, process.stdout),
                          prompts = ['name'],
                          p = 0,
                          data = {};
                      var get = function get() {
                        rl.setPrompt(prompts[p] + ': ');
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
                            copy(cwd(), join(_this4.options.data.templates, name), _this4.options.TEMPLATE_ADD_IGNORE);
                          } else {
                            if (data.name === '') {
                              log('name can\'t be empty', 0);
                            } else {
                              return Promise.resolve().then(function () {
                                return exist(join(_this4.options.data.templates, data.name));
                              }).then(function (_resp) {
                                isExist2 = _resp;

                                if (isExist2) {
                                  log(data.name + ' already exist too', 0);
                                  process.exit(0);
                                } else {
                                  copy(cwd(), join(_this4.options.data.templates, data.name), _this4.options.TEMPLATE_ADD_IGNORE);
                                }
                              });
                            }
                          }
                        }).then(function () {});
                      });
                    })();
                  } else {
                    copy(cwd(), join(_this4.options.data.templates, name), _this4.options.TEMPLATE_ADD_IGNORE);
                  }
                });
              }();
            }
          }).then(function () {
            if (_this66.argvs[0] === 'add-task' || _this66.argvs[0] === 'ata') {
              _this66.next = false;

              if (!_this66.argvs[1]) {
                log('Usage: fbi add-task [*] or [name.js]', 0);
              } else {
                ts = _this66.argvs.slice(1);

                ts = ts.filter(isTaskFile);
                if (!ts.length) {
                  log('no task found.', 0);
                } else {
                  ts.map(function (item) {
                    var taskdir, taskdir_exist, task_exist;
                    return Promise.resolve().then(function () {
                      taskdir = join(_this4.options.data.tasks);
                      return exist(taskdir);
                    }).then(function (_resp) {
                      taskdir_exist = _resp;
                      return exist(join(taskdir, item));
                    }).then(function (_resp) {
                      task_exist = _resp;

                      if (!taskdir_exist) {
                        return mkdir(taskdir);
                      }
                    }).then(function () {
                      return Promise.resolve().then(function () {
                        return copyFile(cwd(item), join(taskdir, item), 'quiet');
                      }).then(function () {
                        log('task \'' + basename(item, '.js') + '\' ' + (task_exist ? 'updated' : 'added'), 1);
                      }).catch(function (e) {
                        log(e, 0);
                      });
                    }).then(function () {});
                  });
                }
              }
            }
          });
        }
      }).then(function () {});
    }
  }, {
    key: 'backup',
    value: function backup() {
      if (!this.next) return;

      if (this.argvs[0] === 'backup') {
        this.next = false;

        var _dir = 'fbi-data-bak-' + Date.now();

        log('Start to backup data...', 1);
        copy(this.options.data.root, cwd(_dir), this.options.BACKUP_IGNORE);
      }
    }
  }, {
    key: 'recover',
    value: function recover() {
      if (!this.next) return;

      if (this.argvs[0] === 'recover') {
        this.next = false;

        log('Start to recover data...', 1);
        copy(cwd(), this.options.data.root, this.options.RECOVER_IGNORE);
      }
    }
  }, {
    key: 'run',
    value: function run() {
      var _this5,
          cmds,
          _this80 = this;

      _this5 = _this80;

      if (!!_this80.next) {
        cmds = _this80.argvs;

        if (_this80.argvs.length > 0) {
          (function () {
            var ret = void 0;
            var prefix = _this5.options.task_param_prefix;
            try {
              ret = parseArgvs(cmds, prefix);
            } catch (e) {
              log('task params parsed error', 0);
              log(e);
            }

            if (Object.keys(ret).length) {
              (function () {
                var module = new Module(_this5.options);
                Object.keys(ret).map(function (item) {
                  var taskType, itemParams, taskObj, _discriminant, _match, _brokenOut;

                  return Promise.resolve().then(function () {
                    return Promise.resolve().then(function () {
                      taskType = 'local';
                      itemParams = ret[item]['params'];

                      if (itemParams) {
                        _discriminant = itemParams[0];
                        _match = false;
                        _brokenOut = false;

                        if (!_brokenOut && (_match || 't' === _discriminant)) {
                          taskType = 'template';
                          itemParams.splice(0, 1);
                          _brokenOut = true;
                          _match = true;
                        }

                        if (!_brokenOut && (_match || 'g' === _discriminant)) {
                          taskType = 'global';
                          itemParams.splice(0, 1);
                          _brokenOut = true;
                          _match = true;
                        }
                      }
                      return task.get(item, taskType, _this5.options);
                    }).then(function (_resp) {
                      taskObj = _resp;

                      if (taskObj.cnt) {
                        taskObj['params'] = itemParams && itemParams.length ? ' ' + prefix + itemParams.join(' ' + prefix) : '';
                        _this5['taskParams'] = itemParams && itemParams.length ? itemParams : null;
                        task.run(item, _this5, taskObj, module);
                      } else {
                        log('Task not found: \'' + item, 0);
                      }
                    }).catch(function (e) {
                      log(e, 0);
                    });
                  }).then(function () {});
                });
              })();
            }
          })();
        }
      }
    }
  }]);
  return Fbi;
}();

module.exports = Fbi;