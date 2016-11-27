
/*
  fbi v2.1.2
  Node.js workflow tool.

  Author: neikvon
  Built:  2016-11-28 00:00:44 via fbi

  Copyright 2016 neikvon
*/
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Task = _interopDefault(require('./task.js'));
var Module = _interopDefault(require('./module.js'));
var Template = _interopDefault(require('./template.js'));
var opts = _interopDefault(require('./config/options.js'));
var _ = require('./helpers/utils.js');
var copy = _interopDefault(require('./helpers/copy.js'));
var helpTxt = _interopDefault(require('./helpers/helps.js'));

function __async(g){return new Promise(function(s,j){function c(a,x){try{var r=g[x?"throw":"next"](a);}catch(e){j(e);return}r.done?s(r.value):Promise.resolve(r.value).then(c,d);}function d(e){c(e,1);}c();})}

var version = "2.1.4";

const task = new Task();
const template = new Template();

class Cli {

  constructor(argvs) {
    this.options = {};
    this.argvs = argvs || [];
    this.next = true;
    this.log = _.log;
    this._ = _

    ;
    (() => __async(function*(){
      try {
        yield this.config();
        this.version();
        this.backup();
        this.recover();
        yield this.help();
        yield this.init();
        yield this.install();
        yield this.remove();
        yield this.cat();
        yield this.list();
        yield this.add();
        yield this.update();
        yield this.run();
      } catch (e) {
        _.log(e, 0);
      }
    }.call(this)))();
  }

  config() {return __async(function*(){
    if (!this.next) { return }

    // user options > tempalte options > default options
    try {
      // user options
      const userConfigPath = _.cwd(opts.paths.config);
      this.isfbi = yield _.exist(userConfigPath);
      const userConfig = this.isfbi ? require(userConfigPath) : null;

      // merge user options
      this.options = _.merge(opts, userConfig);

      let data = _.clone(this.options.data);
        // parse data path
      Object.keys(data).map(item => {
        if (!_.isAbsolute(data[item])) {
          data[item] = _.dir(data[item]);
        }
      });

      // template options
      if (userConfig && userConfig.template) {
        const _existTmpl = yield _.exist(_.join(data.templates, userConfig.template));
        this.options['node_modules_path'] = _existTmpl
        ? _.join(data.templates, userConfig.template, 'node_modules')
        : _.cwd('node_modules');

        const templateOptionsPath = _.join(
          data.templates,
          userConfig.template,
          this.options.paths.config
        );

        if (_.existSync(templateOptionsPath)) {
          const templateOptions = require(templateOptionsPath);

          // merge template options
          _.merge(this.options, templateOptions);
        }
      }

      // merge user options
      _.merge(this.options, userConfig);

      // parse data path
      Object.keys(this.options.data).map(item => {
        if (!_.isAbsolute(this.options.data[item])) {
          this.options.data[item] = _.dir(this.options.data[item]);
        }
      });
    } catch (e) {
      _.log(e);
    }
  }.call(this))}

  version() {
    if (!this.next) { return }

    if (this.argvs[0] === '-v' || this.argvs[0] === '--verison') {
      this.next = false;
      console.log(version);
    }
  }

  backup() {
    if (!this.next) { return }

    if (this.argvs[0] === 'backup') {
      this.next = false;

      const _dir = 'fbi-data-bak-' + Date.now();

      _.log('Starting backup data to local folder ...', 1);
      copy(this.options.data.root, _.cwd(_dir), this.options.BACKUP_IGNORE);
    }
  }

  recover() {
    if (!this.next) { return }

    if (this.argvs[0] === 'recover') {
      this.next = false;

      _.log('Starting recover data to local folder ...', 1);
      copy(_.cwd(), this.options.data.root, this.options.RECOVER_IGNORE);
    }
  }

  help() {return __async(function*(){
    if (!this.next) { return }

    if (!this.argvs.length || this.argvs[0] === '-h' || this.argvs[0] === '--help') {
      this.next = false;
      console.log(helpTxt);
    }
  }.call(this))}

  init() {return __async(function*(){
    if (!this.next) { return }

    if (this.argvs[0] === 'init') {
      this.next = false;

      if (!this.argvs[1]) {
        return _.log(`Usage: fbi init [template name]`, 0)
      }
      try {
        const name$$1 = this.argvs[1];
        let succ = yield template.init(name$$1, _.cwd(), this.options);
        if (succ) {
          _.log(`Template '${name$$1}' init in current folder`, 1);
        } else {
          _.log(`Template '${name$$1}' not found`, 0);
        }
      } catch (e) {
        _.log(e);
      }
    }
  }.call(this))}

  install() {return __async(function*(){
    if (!this.next) { return }

    if (this.argvs[0] === 'i' || this.argvs[0] === 'install') {
      this.next = false;

      let localDeps = {};
      let localDevDeps = {};
      let tmplDeps = {};
      let taskDeps = {};
      const opts$$1 = this.options;

      // local package.json => dependencies && devDependencies
      if (yield _.exist(_.cwd('package.json'))) {
        const pkgs = require(_.cwd('package.json'));
        localDeps = pkgs.dependencies || {};
        localDevDeps = pkgs.devDependencies || {};
      }

      // template package.json => devDependencies
      if (opts$$1.template) {
        try {
          const _path = _.join(opts$$1.data.templates, opts$$1.template, 'package.json');
          const _dev = require(_path)['devDependencies'];
          tmplDeps = _.merge(_dev, localDevDeps);
          if (Object.keys(tmplDeps).length) {
            let tmplPkgCnt = require(_path);
            tmplPkgCnt['devDependencies'] = tmplDeps;
            _.write(_path, JSON.stringify(tmplPkgCnt, null, 2));
          }
        } catch (e) {}
      } else {
        // task package.json => devDependencies
        try {
          const taskPkg = _.join(opts$$1.data.tasks, 'package.json');
          const taskPkgDev = require(taskPkg).devDependencies;
          taskDeps = _.merge(taskPkgDev, localDevDeps);
          if (Object.keys(taskDeps).length) {
            let taskPkgCnt = require(taskPkg);
            taskPkgCnt['devDependencies'] = taskDeps;
            _.write(taskPkg, JSON.stringify(taskPkgCnt, null, 2));
          }
        } catch (e) {}
      }

      const npms = opts$$1.npm;

      if (Object.keys(localDeps).length) {
        yield _.install(localDeps, _.cwd(''), npms.alias, '--save ' + npms.options)
          .then(s => {
            _.log('Tempaltes dependencies installed.', 1);
          })
          .catch(err => {
            _.log('Tempaltes dependencies installtion error', 0);
            _.log(err, 0);
          });
      }

      if (Object.keys(tmplDeps).length) {
        yield _.install(tmplDeps, _.join(opts$$1.data.templates, opts$$1.template), npms.alias, '--save-dev ' + npms.options)
          .then(s => {
            _.log('Tempaltes devDependencies installed.', 1);
          })
          .catch(err => {
            _.log('Tempaltes devDependencies installtion error', 0);
            _.log(err, 0);
          });
      }

      if (Object.keys(taskDeps).length) {
        yield _.install(taskDeps, opts$$1.data.tasks, npms.alias, '--save-dev ' + npms.options)
          .then(s => {
            _.log('Tasks devDependencies installed.', 1);
          })
          .catch(err => {
            _.log('Tasks devDependencies installtion error', 0);
            _.log(err, 0);
          });
      }
    }
  }.call(this))}

  remove() {return __async(function*(){
    if (!this.next) { return }

    if (this.argvs[0] === 'rm-task' || this.argvs[0] === 'rta') {
      this.next = false;

      let mods = this.argvs.slice(1);
      if (!mods.length) {
        _.log(`Usage: fbi rm-task [name]`, 0);
        process.exit(0);
      }
      let tasksPath = _.join(this.options.data.tasks, this.options.paths.tasks);
      let tmplName;
      if (mods[0].indexOf('-') === 0) {
        tmplName = mods[0].slice(1);
        mods = mods.splice(1, 1);
        if (tmplName !== '') {
          if (mods.length) {
            const tmplExist = yield _.exist(_.join(this.options.data.templates, tmplName));
            if (tmplExist) {
              tasksPath = _.join(this.options.data.templates, tmplName, this.options.paths.tasks);
            } else {
              _.log(`template '${tmplName}' not found`, 0);
              process.exit(0);
            }
          } else {
            _.log(`Usage: fbi rm-task -[template] [task]`, 0);
            process.exit(0);
          }
        } else {
          _.log(`Usage: fbi rm-task -[template] [task]`, 0);
          process.exit(0);
        }
      }
      const tasks = yield _.readDir(tasksPath);
      mods.map(item => __async(function*(){
        item = item + '.js';
        if (tasks.includes(item)) {
          try {
            _.rmfile(_.join(tasksPath, item), err => {
              if (err) {
                _.log(err, 0);
              }
              _.log(`task ${_.basename(item, '.js')} ${tmplName ? 'in ' + tmplName + ' ' : ''}removed`, 1);
            });
          } catch (e) {
            _.log(e, 0);
          }
        } else {
          _.log(`task '${_.basename(item, '.js')}' ${tmplName ? 'in ' + tmplName + ' ' : ''} not found`, 0);
        }
      }()));
    }

    if (this.argvs[0] === 'rm-tmpl' || this.argvs[0] === 'rtm') {
      this.next = false;

      const mods = this.argvs.slice(1);
      if (!mods.length) {
        _.log(`Usage: fbi rm-tmpl [name]`, 0);
        process.exit(0);
      }
      const tmpls = yield _.readDir(this.options.data.templates);
      mods.map(item => __async(function*(){
        if (tmpls.includes(item)) {
          try {
            _.log(`start to remove template '${item}'...`);
            _.rmdir(_.join(this.options.data.templates, item), err => {
              if (err) {
                _.log(err, 0);
              }
              _.log(`template '${item}' removed`, 1);
            });
          } catch (e) {
            _.log(e, 0);
          }
        } else {
          _.log(`template '${item}' not found`, 0);
        }
      }.call(this)));
    }
  }.call(this))}

  cat() {return __async(function*(){
    if (!this.next) { return }

    if (this.argvs[0] === 'cat') {
      this.next = false;

      if (!this.argvs[1]) {
        return _.log(`Usage: fbi cat [task] [-t, -g]`, 0)
      }

      const name$$1 = this.argvs[1];
      let type = 'local';
      if (this.argvs[2] === '-g') {
        type = 'global';
      } else if (this.argvs[2] === '-t') {
        type = 'template';
      }

      const taskObj = yield task.get(name$$1, type, this.options);
      _.log(`file path: ${taskObj.path}`);
      _.log(`${taskObj.type} task ${name$$1}'s content:`, 1);
      _.flatLog(taskObj.cnt);
    }
  }.call(this))}

  list() {return __async(function*(){
    if (!this.next) { return }

    if (this.argvs[0] === 'ls' ||
      this.argvs[0] === 'list') {
      this.next = false;

      let helps = _.genTaskHelpTxt(yield task.all(this.options, true, false));

      helps += _.genTmplHelpTxt(yield template.all(this.options),
        this.options.template, this.options.templateDescription);

      if (yield _.exist(_.cwd('package.json'))) {
        const usrpkg = require(_.cwd('package.json'));
        if (usrpkg.scripts && Object.keys(usrpkg.scripts).length > 0) {
          helps += _.genNpmscriptsHelpTxt(usrpkg.scripts);
        }
      }

      helps += `
      `;

      console.log(helps);
    }
  }.call(this))}

  add() {return __async(function*(){
    if (!this.next) { return }

    // add template
    if (this.argvs[0] === 'add-tmpl' || this.argvs[0] === 'atm') {
      this.next = false;

      try {
        // add template
        const name$$1 = this.options.template;
        const isExist = yield _.exist(_.join(this.options.data.templates, name$$1));

        if (isExist) {
          _.log(`Tempalte '${name$$1}' already exist, input 'y' to update, or change the field 'template' value in './fbi/config.js' to create a new one.`, 'yellow');

          const answer = yield _.prompt('update');
          if (answer['update'] === 'y') {
            _.log(`Start to update template '${name$$1}' ...`);
            yield copy(_.cwd(), _.join(this.options.data.templates, name$$1), this.options.TEMPLATE_ADD_IGNORE);
            _.log(`Template '${name$$1}' updated successfully`, 1);
          } else {
            process.exit(0);
          }
        } else {
          _.log(`Start to add template '${name$$1}' ...`);
          yield copy(_.cwd(), _.join(this.options.data.templates, name$$1), this.options.TEMPLATE_ADD_IGNORE);
          _.log(`Template '${name$$1}' added successfully`, 1);
        }
      } catch (err) {
        _.log('add template fail.', 0);
      }
    }

    const tasksPath = this.options.paths.tasks;
    function addTaskFile(file, to) {return __async(function*(){
      const name$$1 = file.replace(_.extname(file), '');
      const taskExist = yield _.exist(_.cwd(tasksPath, file));
      yield _.copyFile(_.cwd(tasksPath, file), _.join(to, file), 'quiet');
      _.log(`Task '${name$$1}' ${taskExist ? 'updated' : 'added'} successfully`, 1);
    }())}

    // add tasks
    if (this.argvs[0] === 'add-task' || this.argvs[0] === 'ata') {
      this.next = false;

      const localTasksFolderExist = yield _.exist(_.cwd(tasksPath));
      if (!localTasksFolderExist) {
        _.log(`Local tasks folder '${tasksPath}' not found.`, 0);
      } else {
        let name$$1 = this.argvs[1];
        const taskdir = _.join(this.options.data.tasks);
        const taskdirExist = yield _.exist(taskdir);
        if (!taskdirExist) {
          yield _.mkdir(taskdir);
          yield _.mkdir(_.join(taskdir, this.options.paths.tasks));
        }
        // copy node_modules
        const nodeModulesExist = yield _.exist('node_modules');
        if (nodeModulesExist) {
          copy(_.cwd('node_modules'), _.join(taskdir, 'node_modules'));
        }

        // merge package.json
        let usrPkg = {};

        try {
          usrPkg = require(_.cwd('package.json')).devDependencies;
        } catch (e) {

        }
        let tskPkg = require(_.join(this.options.data.tasks, 'package.json'));
        _.merge(tskPkg.devDependencies, usrPkg);
        yield _.write(_.join(this.options.data.tasks, 'package.json'), JSON.stringify(tskPkg, null, 2));

        if (name$$1) {
          const file = _.extname(name$$1) ? name$$1 : name$$1 + '.js';
          yield addTaskFile(file, _.join(taskdir, this.options.paths.tasks));
        } else {
          const files = yield _.readDir(_.cwd(tasksPath));
            // copy task files
          Promise.all(files.map(item => __async(function*(){
            try {
              yield addTaskFile(item, _.join(taskdir, this.options.paths.tasks));
            } catch (e) {
              _.log(e, 0);
            }
          }.call(this))));
        }
      }
    }
  }.call(this))}

  update() {return __async(function*(){
    if (!this.next) { return }

    // update local project from template
    if (this.argvs[0] === 'update') {
      this.next = false;

      const opts$$1 = this.options;
      if (opts$$1.template) {
        try {
          // update fbi folder
          yield copy(_.join(opts$$1.data.templates, opts$$1.template, 'fbi'), _.cwd('fbi'));

          // update package.json devDependencies
          if (yield _.exist(_.cwd('package.json'))) {
            const localPkgPath = _.cwd('package.json');
            const localPkg = require(localPkgPath);
            const localDevDeps = localPkg['devDependencies'] || {};
            const tmplDevDeps = require(_.join(opts$$1.data.templates, opts$$1.template, 'package.json'))['devDependencies'] || {};
            const newDevDeps = _.merge(localDevDeps, tmplDevDeps);
            localPkg.devDependencies = newDevDeps;
            _.write(localPkgPath, JSON.stringify(localPkg, null, 2));
          }

          _.log('local folder "./fbi/" and file "package.json" updated successfully.', 1);
        } catch (err) {
          _.log(err, 0);
        }
      } else {
        _.log('this is not a fbi template.', 0);
      }
    }
  }.call(this))}

  run() {return __async(function*(){
    if (!this.next) { return }

    let cmds = this.argvs;
    if (this.argvs.length > 0) {
      let ret;
      const prefix = this.options.task_param_prefix;
      try {
        ret = _.parseArgvs(cmds, prefix);
      } catch (e) {
        _.log(`task params parsed error`, 0);
        _.log(e);
      }

      if (Object.keys(ret).length) {
        const module = new Module(this.options);
        Object.keys(ret).map(item => __async(function*(){
          try {
            let taskType = 'local';
            let itemParams = ret[item]['params'];
            if (itemParams) {
              switch (itemParams[0]) {
                case 't':
                  taskType = 'template';
                  itemParams.splice(0, 1);
                  break
                case 'g':
                  taskType = 'global';
                  itemParams.splice(0, 1);
                  break
              }
            }
            const taskObj = yield task.get(item, taskType, this.options);
            if (taskObj.cnt) {
              taskObj['params'] = (itemParams && itemParams.length)
              ? ' ' + prefix + itemParams.join(' ' + prefix)
              : '';
              this['taskParams'] = (itemParams && itemParams.length)
              ? itemParams
              : null;
              task.run(item, this, taskObj, module);
            } else {
              _.log(`Task not found: '${item}`, 0);
            }
          } catch (e) {
            _.log(e, 0);
          }
        }.call(this)));
      }
    }
  }.call(this))}
}

module.exports = Cli;
