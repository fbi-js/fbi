
/*
  fbi v2.1.2
  Node.js workflow tool.

  Author: neikvon
  Built:  2016-11-28 11:52:22 via fbi

  Copyright 2016 neikvon
*/
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _ = require('./helpers/utils.js');
var vm = _interopDefault(require('vm'));

function __async(g){return new Promise(function(s,j){function c(a,x){try{var r=g[x?"throw":"next"](a);}catch(e){j(e);return}r.done?s(r.value):Promise.resolve(r.value).then(c,d);}function d(e){c(e,1);}c();})}

class Task {

  constructor() {
    this.tasks = {};
  }

  get(name, type, opts) {return __async(function*(){
    // if alias, get fullname from alias
    if (opts.alias && opts.alias[name]) {
      name = opts.alias[name];
    }

    // local task > tempalte task => global task
    let ret = {
      name: name,
      cnt: '',
      type: '',
      path: ''
    };

    function find(_path, _type) {return __async(function*(){
      _path = _path + '.js';
      let _exist = _.existSync(_path);
      if (_exist) {
        ret.cnt = yield _.read(_path);
        ret.type = _type;
        ret.path = _path;
      }
    }())}

    // find in local
    if (type === 'local') {
      yield find(_.cwd(opts.paths.tasks, name), type);
    }

    // find in template
    if (!ret.cnt && opts.template && opts.template !== '') {
      yield find(_.join(
        opts.data.templates,
        opts.template,
        opts.paths.tasks,
        name), 'template');
    }

    // find in global
    if (!ret.cnt || type === 'global') {
      yield find(_.join(opts.data.tasks, opts.paths.tasks, name), 'global');
    }

    return ret
  }())}

  all(opts, justNames, justAvailable) {return __async(function*(){
    const _this = this;
    let names = {
      local: new Set(),
      global: new Set(),
      template: new Set()
    };

    function collect(_dir, type) {return __async(function*(){
      let _exist = yield _.exist(_dir);
      let _modules;
      if (_exist) {
        _modules = yield _.readDir(_dir);
        _modules = _modules.filter(_.isTaskFile);
        if (justNames) {
          _modules.map(item => {
            item = _.basename(item, '.js');
            names[type].add(item);
          });
        } else if (_modules.length) {
          yield Promise.all(_modules.map(item => __async(function*(){
            _this.tasks[_.basename(item, '.js')] = yield _.read(_.join(_dir, item));
          }())));
        }
      }
    }())}

    // template tasks
    if (opts.template && opts.template !== '') {
      yield collect(_.join(
        opts.data.templates,
        opts.template,
        opts.paths.tasks), 'template');
    }

    // global tasks
    yield collect(_.join(opts.data.tasks, opts.paths.tasks), 'global');

    // locals
    yield collect(_.cwd(opts.paths.tasks), 'local');

    if (justAvailable) {
      for (let item of names.template.values()) {
        if (names.local.has(item)) {
          names.template.delete(item);
        }
      }
      for (let item of names.global.values()) {
        if (names.local.has(item)) {
          names.global.delete(item);
        }
        if (names.template.has(item)) {
          names.global.delete(item);
        }
      }
    }

    if (justNames) {
      Object.keys(names).map(item => {
        names[item] = Array.from(names[item]); // Set => Array
          // alias
        if (names[item].length) {
          for (let i = 0, len = names[item].length; i < len; i++) {
            let alias = '';
            let description = '';
            if (opts.alias) {
              Object.keys(opts.alias).map(a => {
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
          }
        }
      });
    }
    return justNames ? names : _this.tasks
  }.call(this))}

  run(name, ctx, taskObj, module) {
    let taskCnt = taskObj.cnt || this.tasks[name];

    function requireResolve(mod) {
      // find mod path
      const modPath = module.get(mod, taskObj.type);
      if (modPath && modPath !== 'global') {
        return require(_.join(modPath, mod))
      } else {
        return mod ? require(mod) : require
      }
    }

    let code = `
    'use strict';

    (function(require, ctx) {
      if(!ctx.next || ctx.next === 'false') return false;

      ctx.log('Running ${taskObj.type} task "${taskObj.name}${taskObj.params}"...', 1);
      try {
        ${taskCnt}
      } catch (e) {
        ctx.log('task function error', 0)
        ctx.log(e, 0)
      }
    })`;

    vm.runInThisContext(code, {
      lineOffset: -3,
      displayErrors: true
    })(requireResolve, ctx);
  }

}

module.exports = Task;
