'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = _interopDefault(require('path'));
var readline = require('readline');
var vm = _interopDefault(require('vm'));
var fs = _interopDefault(require('fs'));
var os = _interopDefault(require('os'));
var util = _interopDefault(require('util'));
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

var win = os.type() === 'Windows_NT';

/*
 * bold, italic, underline, inverse, white, grey,
 * black, blue, cyan, green, magenta, red, yellow
 */
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
  var info = '';

  var cmd = win ? 'cmd' : command;
  var params = win ? ['/s', '/c', cmd] : ['install'];

  Object.keys(source).map(function (item) {
    params.push(item + '@' + source[item]);
    info += '\n       ' + item + '@' + source[item] + ' ';
  });
  if (opts) {
    params.push(opts);
  }
  info += '\n       ' + (opts || '') + '\n    to:' + rootPath + '\n  ';

  process.chdir(rootPath);
  log(command + ' install ' + info);

  return new Promise(function (resolve, reject) {
    var installer = child_process.spawn(cmd, params, {
      cwd: rootPath,
      stdio: [0, 1, 2] // child_process log style
    });

    installer.on('error', function (err) {
      // process.chdir(prevDir)
      log('Failed to \'' + cmd + '\'', 0);
      reject(err);
    });

    installer.on('close', function () {
      // process.chdir(prevDir)
      resolve();
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
    return !(ignore.indexOf(item) !== -1);
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
  // log(file)
  return basename(file).indexOf('.') !== 0 && path.extname(file) === '.js' && file.indexOf('config') < 0;
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
  var txt = '\n    Tasks:\n    ';
  var tasksTxt = '';
  if (Object.keys(all).length) {
    ['global', 'template', 'local'].map(function (type) {
      if (all[type].length) {
        all[type].map(function (item) {
          if (type === 'local') {
            tasksTxt += '\n      ' + colors().green(fillGap((item.alias ? item.alias + ', ' : '') + item.name, 15, ' '));
          } else {
            tasksTxt += '\n      ' + fillGap((item.alias ? item.alias + ', ' : '') + item.name, 15, ' ') + ' ' + colors().grey(type === 'template' ? '-t' : '-g');
          }
        });
      }
    });
  }
  if (!tasksTxt) {
    tasksTxt = colors().grey('\n      No tasks, use \'fbi ata, fbi ata [name]\' to add tasks.');
  } else {
    tasksTxt = colors().grey('\n      usage: fbi [task] [-t, -g]\n    ') + tasksTxt;
  }

  return txt + tasksTxt;
}

function genTmplHelpTxt(all, curr, desc) {
  var txt = '\n\n    Templates:\n    ';
  var tmplsTxt = '';
  if (all.length) {
    all.map(function (item) {
      tmplsTxt += '\n      ' + colors().yellow('★') + '  ' + (colors().green(item.name) + (item.name === curr ? colors().yellow(' <current>') : '') + ' - ' + item.desc);
    });
  }
  if (!tmplsTxt) {
    tmplsTxt = colors().grey('\n      No templates, use \'fbi atm\' to add templates.');
  } else {
    tmplsTxt = colors().grey('\n      usage: fbi init [template]\n    ') + tmplsTxt;
  }
  return txt + tmplsTxt;
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

function prompt(keys) {
  var rl = readline.createInterface(process.stdin, process.stdout),
      prompts = typeof keys === 'string' ? [keys] : keys,
      p = 0,
      data = {};
  var get = function get() {
    rl.setPrompt(prompts[p] + ': ');
    rl.prompt();
    p++;
  };
  get();

  return new Promise(function (resolve, reject) {
    rl.on('line', function (line) {
      data[prompts[p - 1]] = line;
      if (p === prompts.length) {
        return rl.close();
      }
      get();
    }).on('close', function () {
      resolve(data);
    });
  });
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
          return find(join(opts.data.tasks, opts.paths.tasks, name), 'global');
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
        return collect(join(opts.data.tasks, opts.paths.tasks), 'global');
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

      var code = '\n    \'use strict\';\n    (function(require, ctx) {\n      if(!ctx.next || ctx.next === \'false\') return false;\n\n      ctx.log(\'Running ' + taskObj.type + ' task "' + taskObj.name + taskObj.params + '"...\', 1);\n      try {\n        ' + taskCnt + '\n      } catch (e) {\n        ctx.log(\'task function error\', 0)\n        ctx.log(e, 0)\n      }\n    })';

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

    /*
    this.modulePaths:
      [
      '.../test/webpack-demo/node_modules',
      '.../fbi/data/templates/webpack-demo/node_modules',
      '.../fbi/data/tasks/node_modules',
      ''
    ]
    */
  }

  createClass(Module, [{
    key: 'get',
    value: function get(name, type) {
      var ret = void 0;

      if (isRelative(name)) {

        var localTasks = void 0;
        if (type === 'local') {
          localTasks = cwd(this.opts.paths.tasks);
          try {
            // local
            var found = require.resolve(join(localTasks, name));
            ret = localTasks;
          } catch (e) {
            try {
              // template
              localTasks = join(this.opts.data.templates, this.opts.template, this.opts.paths.tasks);
              var _found = require.resolve(join(localTasks, name));
              ret = localTasks;
            } catch (e) {
              log('can\'t find module ' + name + ' in template \'' + this.opts.template + '\'', 0);
            }
          }
        } else if (type === 'template') {
          try {
            // template
            localTasks = join(this.opts.data.templates, this.opts.template, this.opts.paths.tasks);
            var _found2 = require.resolve(join(localTasks, name));
            ret = localTasks;
          } catch (e) {
            log('can\'t find module ' + name + ' in template \'' + this.opts.template + '\'', 0);
          }
        } else if (type === 'global') {
          try {
            // template
            localTasks = join(this.opts.data.tasks);
            var _found3 = require.resolve(join(localTasks, name));
            ret = localTasks;
          } catch (e) {
            log('can\'t find module ' + name + ' in global tasks folder', 0);
          }
        }
      } else {
        this.modulePaths.map(function (item) {
          if (!ret) {
            try {
              require.resolve(join(item, name));
              ret = item;
            } catch (e) {}
          }
        });
      }
      return ret;
    }
  }]);
  return Module;
}();

var ignore = [];

var copy = (function (src, dst, ign) {
  return Promise.resolve().then(function () {
    return Promise.resolve().then(function () {
      ignore = ign || ignore;

      return copy$1(src, dst, walk);
    }).catch(function (e) {
      log(e);
    });
  }).then(function () {});
});

function copy$1(src, dst, cb) {
  var _exist;

  return Promise.resolve().then(function () {
    return Promise.resolve().then(function () {
      return exist(dst);
    }).then(function (_resp) {
      _exist = _resp;

      if (!_exist) {
        fs.mkdirSync(dst);
      }
      return walk(src, dst);
    }).catch(function (e) {
      log(e);
    });
  }).then(function () {});
}

function walk(src, dst) {
  var _stats, files;

  return Promise.resolve().then(function () {
    return Promise.resolve().then(function () {
      return stats(src);
    }).then(function (_resp) {
      _stats = _resp;
      return readDir(src, ignore);
    }).then(function (_resp) {
      if (_stats.isDirectory()) {
        files = _resp;

        return Promise.all(files.map(function (f) {
          var _src, _dst, stat;

          return Promise.resolve().then(function () {
            _src = join(src, f);
            _dst = join(dst, f);
            return stats(_src);
          }).then(function (_resp) {
            stat = _resp;


            if (stat.isDirectory()) {
              return copy$1(_src, _dst, walk);
            } else {
              copyFile(_src, _dst, true);
            }
          }).then(function () {});
        }));
      } else {
        return copyFile(src, join(dst, basename(src)), true);
      }
    }).catch(function (e) {
      log(e);
    });
  }).then(function () {});
}

function stats(src) {
  return new Promise(function (resolve, reject) {
    fs.stat(src, function (err, stats) {
      return err ? reject(err) : resolve(stats);
    });
  });
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
      var _exist, ret, templates;

      return Promise.resolve().then(function () {
        return exist(opts.data.templates);
      }).then(function (_resp) {
        _exist = _resp;
        ret = [];

        if (_exist) {
          return Promise.resolve().then(function () {
            return readDir(opts.data.templates);
          }).then(function (_resp) {
            templates = _resp;

            templates = templates.filter(isTemplate);
            templates.map(function (item) {
              var config = require(join(opts.data.templates, item, opts.paths.config));
              ret.push({
                name: item,
                desc: config.templateDescription || ''
              });
            });
          });
        }
      }).then(function () {
        return ret;
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
    options: ''
  },
  TEMPLATE_ADD_IGNORE: ['.DS_Store', '.svn', '.git'],
  TEMPLATE_INIT_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist'],
  BACKUP_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist'],
  RECOVER_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist']
};

var version = "2.0.9";

var helps = '\n    Usage:\n\n      fbi [command]           run command\n      fbi [task]              run a local preference task\n      fbi [task] -g           run a global task\n      fbi [task] -t           run a template task\n\n      ' + colors().yellow('use \'fbi ls\' to see available tasks & templates') + '\n\n    Commands:\n\n      ata,   add-task [name]          add task file of files in \'fbi\' folder\n      atm,   add-tmpl                 add current folder as a template\n      rta,   rm-task  [-t] [name]     remove task\n      rtm,   rm-tmpl  [name]          remove template\n      i,     install                  install dependencies\n      ls,    list                     list all tasks & templates\n      cat    [task]   [-t, -g]        cat task content\n      init   [template]               init a new project via template\n      backup                          backup tasks & templates\n      recover                         recover tasks & templates from current folder\n\n      -h,    --help                   output usage information\n      -v,    --version                output the version number\n';

var task = new Task();
var template = new Template();

var Cli = function () {
  function Cli(argvs) {
    var _this = this;

    classCallCheck(this, Cli);

    this.argvs = argvs || [];
    this.next = true;
    this.log = log;
    this.options = {};
    this._ = {
      cwd: cwd, dir: dir, join: join, exist: exist, existSync: existSync, readDir: readDir,
      log: log, merge: merge, read: read, write: write, install: install, copyFile: copyFile,
      isTaskName: isTaskName, isTaskFile: isTaskFile
    };Promise.resolve().then(function () {
      return Promise.resolve().then(function () {
        return _this.config();
      }).then(function () {
        _this.version();
        _this.backup();
        _this.recover();
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
        return _this.run();
      }).catch(function (e) {
        log(e, 0);
      });
    }).then(function () {});
  }

  createClass(Cli, [{
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
              var userConfigPath, userConfig, data, _existTmpl, templateOptionsPath, templateOptions, _test;

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
                _test = userConfig && userConfig.template;

                if (_test) {
                  return Promise.resolve().then(function () {
                    return exist(join(data.templates, userConfig.template));
                  }).then(function (_resp) {
                    _existTmpl = _resp;

                    _this2.options['node_modules_path'] = _existTmpl ? join(data.templates, userConfig.template, 'node_modules') : cwd('node_modules');

                    templateOptionsPath = join(data.templates, userConfig.template, _this2.options.paths.config);
                  });
                }
              }).then(function () {

                if (_test && existSync(templateOptionsPath)) {
                  templateOptions = require(templateOptionsPath);
                  // merge template options

                  merge(_this2.options, templateOptions);
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
      var _this13 = this;

      if (!!_this13.next) {

        if (!_this13.argvs.length || _this13.argvs[0] === '-h' || _this13.argvs[0] === '--help') {
          _this13.next = false;

          // helps += genTaskHelpTxt(await task.all(this.options, true, true))
          // helps += genTmplHelpTxt(await template.all(this.options),
          //   this.options.template, this.options.templateDescription)
          // helps += `
          // `
          console.log(helps);
        }
      }
    }
  }, {
    key: 'install',
    value: function install$$() {
      var localDeps,
          localDeps_dev,
          tmplDeps,
          taskDeps,
          _opts,
          pkgs,
          _path,
          _dev,
          tmplPkgCnt,
          taskPkg,
          taskPkg_dev,
          taskPkgCnt,
          npms,
          _test2,
          _this14 = this;

      return Promise.resolve().then(function () {
        if (!!_this14.next) {
          return Promise.resolve().then(function () {
            _test2 = _this14.argvs[0] === 'i' || _this14.argvs[0] === 'install';

            if (_test2) {
              _this14.next = false;

              localDeps = {};
              localDeps_dev = {};
              tmplDeps = {};
              taskDeps = {};
              _opts = _this14.options;

              // local package.json => dependencies && devDependencies
            }

            return _test2 && exist(cwd('package.json'));
          }).then(function (_resp) {
            if (_resp) {
              pkgs = require(cwd('package.json'));

              localDeps = pkgs.dependencies || {};
              localDeps_dev = pkgs.devDependencies || {};
            }

            // template package.json => devDependencies
            if (_test2 && _opts.template) {
              try {
                _path = join(_opts.data.templates, _opts.template, 'package.json');
                _dev = require(_path)['devDependencies'];

                tmplDeps = merge(_dev, localDeps_dev);
                if (Object.keys(tmplDeps).length) {
                  tmplPkgCnt = require(_path);

                  tmplPkgCnt['devDependencies'] = tmplDeps;
                  write(_path, JSON.stringify(tmplPkgCnt, null, 2));
                }
              } catch (e) {}
            }

            // task package.json => devDependencies
            else {
              if (_test2) {
                  try {
                    taskPkg = join(_opts.data.tasks, 'package.json');
                    taskPkg_dev = require(taskPkg).devDependencies;

                    taskDeps = merge(taskPkg_dev, localDeps_dev);
                    if (Object.keys(taskDeps).length) {
                      taskPkgCnt = require(taskPkg);

                      taskPkgCnt['devDependencies'] = taskDeps;
                      write(taskPkg, JSON.stringify(taskPkgCnt, null, 2));
                    }
                  } catch (e) {}
                }
            }

            if (_test2) {
              npms = _opts.npm;
            }

            if (_test2 && Object.keys(localDeps).length) {
              return install(localDeps, cwd(''), npms.alias, '--save ' + npms.options).then(function (s) {
                log('Tempaltes dependencies installed.', 1);
              }).catch(function (err) {
                log('Tempaltes dependencies installtion error', 0);
                log(err, 0);
              });
            }
          }).then(function () {
            if (_test2 && Object.keys(tmplDeps).length) {
              return install(tmplDeps, join(_opts.data.templates, _opts.template), npms.alias, '--save-dev ' + npms.options).then(function (s) {
                log('Tempaltes devDependencies installed.', 1);
              }).catch(function (err) {
                log('Tempaltes devDependencies installtion error', 0);
                log(err, 0);
              });
            }
          }).then(function () {
            if (_test2 && Object.keys(taskDeps).length) {
              return install(taskDeps, _opts.data.tasks, npms.alias, '--save-dev ' + npms.options).then(function (s) {
                log('Tasks devDependencies installed.', 1);
              }).catch(function (err) {
                log('Tasks devDependencies installtion error', 0);
                log(err, 0);
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
          _test3,
          _this24 = this;

      return Promise.resolve().then(function () {
        if (!!_this24.next) {
          _test3 = _this24.argvs[0] === 'init';

          // log(this.argvs[1].match(/^[^\\/:*""<>|,]+$/i))
          if (_test3) {
            _this24.next = false;
          }

          if (_test3 && !_this24.argvs[1]) {
            return log('Usage: fbi init [template name]', 0);
          } else {
            if (_test3) {
              return Promise.resolve().then(function () {
                name = _this24.argvs[1];
                return template.init(name, cwd(), _this24.options);
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
          _this31 = this;

      return Promise.resolve().then(function () {
        _this3 = _this31;

        if (!!_this31.next) {
          return Promise.resolve().then(function () {

            if (_this31.argvs[0] === 'rm-task' || _this31.argvs[0] === 'rta') {
              return function () {
                var mods, tasks_path, tmpl_name, tmpl_exist, tasks, _test4, _test5, _test6;

                return Promise.resolve().then(function () {
                  _this3.next = false;

                  mods = _this3.argvs.slice(1);

                  if (!mods.length) {
                    log('Usage: fbi rm-task [name]', 0);
                    process.exit(0);
                  }
                  tasks_path = join(_this3.options.data.tasks, _this3.options.paths.tasks);
                  tmpl_name = void 0;
                  _test4 = mods[0].indexOf('-') === 0;

                  if (_test4) {
                    tmpl_name = mods[0].slice(1);
                    mods = mods.splice(1, 1);
                  }

                  _test5 = _test4 && tmpl_name !== '';
                  _test6 = _test5 && mods.length;

                  if (_test6) {
                    return Promise.resolve().then(function () {
                      return exist(join(_this3.options.data.templates, tmpl_name));
                    }).then(function (_resp) {
                      tmpl_exist = _resp;
                    });
                  }
                }).then(function () {
                  if (_test6 && tmpl_exist) {
                    tasks_path = join(_this3.options.data.templates, tmpl_name, _this3.options.paths.tasks);
                  } else {
                    if (_test6) {
                      log('template \'' + tmpl_name + '\' not found', 0);
                      process.exit(0);
                    }

                    if (_test5) {
                      log('Usage: fbi rm-task -[template] [task]', 0);
                      process.exit(0);
                    }

                    if (_test4) {
                      log('Usage: fbi rm-task -[template] [task]', 0);
                      process.exit(0);
                    }
                  }
                  return readDir(tasks_path);
                }).then(function (_resp) {
                  tasks = _resp;

                  mods.map(function (item) {
                    item = item + '.js';
                    if (tasks.indexOf(item) !== -1) {
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
            if (_this31.argvs[0] === 'rm-tmpl' || _this31.argvs[0] === 'rtm') {
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
                    if (tmpls.indexOf(item) !== -1) {
                      try {
                        log('start to remove template \'' + item + '\'...');
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
          _test7,
          _this44 = this;

      return Promise.resolve().then(function () {
        if (!!_this44.next) {
          _test7 = _this44.argvs[0] === 'cat';

          if (_test7) {
            _this44.next = false;
          }

          if (_test7 && !_this44.argvs[1]) {
            return log('Usage: fbi cat [task] [-t, -g]', 0);
          } else {
            if (_test7) {
              name = _this44.argvs[1];
              type = 'local';
            }

            if (_test7 && _this44.argvs[2] === '-g') {
              type = 'global';
            } else {
              if (_test7) {
                if (_this44.argvs[2] === '-t') {
                  type = 'template';
                }
              }
            }
            if (_test7) {
              return Promise.resolve().then(function () {
                return task.get(name, type, _this44.options);
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
          _test8,
          _test9,
          _this51 = this;

      return Promise.resolve().then(function () {
        if (!!_this51.next) {
          return Promise.resolve().then(function () {
            _test8 = _this51.argvs[0] === 'ls' || _this51.argvs[0] === 'list';

            if (_test8) {
              return Promise.resolve().then(function () {
                _this51.next = false;

                return task.all(_this51.options, true, false);
              }).then(function (_resp) {
                _helps = genTaskHelpTxt(_resp);
                return template.all(_this51.options);
              }).then(function (_resp) {

                _helps += genTmplHelpTxt(_resp, _this51.options.template, _this51.options.templateDescription);
              });
            }
          }).then(function () {
            return _test8 && exist(cwd('package.json'));
          }).then(function (_resp) {
            _test9 = _resp;

            if (_test9) {
              usrpkg = require(cwd('package.json'));
            }

            if (_test9 && usrpkg.scripts && Object.keys(usrpkg.scripts).length > 0) {
              _helps += genNpmscriptsHelpTxt(usrpkg.scripts);
            }

            if (_test8) {

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
      function addTaskFile(file, to) {
        var name, task_exist;
        return Promise.resolve().then(function () {
          name = file.replace(path.extname(file), '');
          return exist(cwd(tasks_path, file));
        }).then(function (_resp) {
          task_exist = _resp;
          return copyFile(cwd(tasks_path, file), join(to, file), 'quiet');
        }).then(function () {
          log('Task \'' + name + '\' ' + (task_exist ? 'updated' : 'added') + ' successfully', 1);
        });
      }

      var _this4,
          name,
          isExist,
          answer,
          tasks_path,
          local_tasks_folder_exist,
          _test10,
          _test11,
          _test12,
          _this57 = this;

      return Promise.resolve().then(function () {
        _this4 = _this57;

        if (!!_this57.next) {
          return Promise.resolve().then(function () {
            _test10 = _this57.argvs[0] === 'add-tmpl' || _this57.argvs[0] === 'atm';

            if (_test10) {
              return Promise.resolve().then(function () {
                _this57.next = false;

                // add template
                name = _this57.options.template;
                return exist(join(_this57.options.data.templates, name));
              }).then(function (_resp) {
                isExist = _resp;
              });
            }
          }).then(function () {
            _test12 = _test10 && isExist;

            if (_test12) {
              return Promise.resolve().then(function () {
                log('Tempalte \'' + name + '\' already exist, input \'y\' to update, or change the field \'template\' value in \'./fbi/config.js\' to create a new one.', 'yellow');

                return prompt('update');
              }).then(function (_resp) {
                answer = _resp;
              });
            }
          }).then(function () {
            if (_test12 && answer['update'] === 'y') {
              return Promise.resolve().then(function () {
                log('Start to update template \'' + name + '\' ...');
                return copy(cwd(), join(_this57.options.data.templates, name), _this57.options.TEMPLATE_ADD_IGNORE);
              }).then(function () {
                log('Template \'' + name + '\' updated successfully', 1);
              });
            } else {
              if (_test12) {
                process.exit(0);
              }

              if (_test10) {
                return Promise.resolve().then(function () {
                  log('Start to add template \'' + name + '\' ...');
                  return copy(cwd(), join(_this57.options.data.templates, name), _this57.options.TEMPLATE_ADD_IGNORE);
                }).then(function () {
                  log('Template \'' + name + '\' added successfully', 1);
                });
              }
            }
          }).then(function () {
            tasks_path = _this57.options.paths.tasks;
            _test11 = _this57.argvs[0] === 'add-task' || _this57.argvs[0] === 'ata';

            if (_test11) {
              return Promise.resolve().then(function () {
                _this57.next = false;

                return exist(cwd(tasks_path));
              }).then(function (_resp) {
                local_tasks_folder_exist = _resp;
              });
            }
          }).then(function () {
            if (_test11 && !local_tasks_folder_exist) {
              log('Local tasks folder \'' + tasks_path + '\' not found.', 0);
            } else {
              if (_test11) {
                return function () {
                  var name, taskdir, taskdir_exist, node_modules_exist, usr_psk, tsk_pkg, file, files;
                  return Promise.resolve().then(function () {
                    name = _this4.argvs[1];
                    taskdir = join(_this4.options.data.tasks);
                    return exist(taskdir);
                  }).then(function (_resp) {
                    taskdir_exist = _resp;

                    if (!taskdir_exist) {
                      return Promise.resolve().then(function () {
                        return mkdir(taskdir);
                      }).then(function () {
                        return mkdir(join(taskdir, _this4.options.paths.tasks));
                      });
                    }
                  }).then(function () {
                    return exist('node_modules');
                  }).then(function (_resp) {
                    // copy node_modules
                    node_modules_exist = _resp;

                    if (node_modules_exist) {
                      copy(cwd('node_modules'), join(taskdir, 'node_modules'));
                    }

                    // merge package.json
                    usr_psk = {};


                    try {
                      usr_psk = require(cwd('package.json')).devDependencies;
                    } catch (e) {}
                    tsk_pkg = require(join(_this4.options.data.tasks, 'package.json'));

                    merge(tsk_pkg.devDependencies, usr_psk);
                    return write(join(_this4.options.data.tasks, 'package.json'), JSON.stringify(tsk_pkg, null, 2));
                  }).then(function () {

                    if (name) {
                      file = path.extname(name) ? name : name + '.js';
                      return addTaskFile(file, join(taskdir, _this4.options.paths.tasks));
                    } else {
                      return Promise.resolve().then(function () {
                        return readDir(cwd(tasks_path));
                      }).then(function (_resp) {
                        files = _resp;
                        // copy task files

                        Promise.all(files.map(function (item) {
                          return Promise.resolve().then(function () {
                            return Promise.resolve().then(function () {
                              return addTaskFile(item, join(taskdir, _this4.options.paths.tasks));
                            }).catch(function (e) {
                              log(e, 0);
                            });
                          }).then(function () {});
                        }));
                      });
                    }
                  }).then(function () {});
                }();
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
          _this83 = this;

      _this5 = _this83;

      if (!!_this83.next) {
        cmds = _this83.argvs;

        if (_this83.argvs.length > 0) {
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
  return Cli;
}();

module.exports = Cli;