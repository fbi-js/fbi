/*
 * fbi
 *
 * Copyright (c) 2015 Inman <neikvon@icloud.com>
 * Licensed under the MIT license.
 */

var path = require('path');
var respawn = require('respawn');
var chalk = require('chalk');
var helper = require('./helper');
var pkg = require('../package.json');
var create = require('./create');
var install = require('./install');
var todo = require('./todo');
var blog = require('./blog');
var taskPath = path.join(__dirname, '../mission');
var tasksJson = require(path.join(__dirname, '../config/tasks'));
var open = require('open');
var isWindows = process.platform === 'win32';
var projectPath = path.normalize(process.cwd());

function getProjectConfig() {
  if (!helper.isExist(path.join(projectPath + '/' + pkg.name + '.json'))) {
    console.log(chalk.red('this is not a ' + pkg.name + ' project'));
    return false;
  }
  var conf = require(projectPath + '/' + pkg.name + '.json');
  return conf;
}

// run gulp tasks
function runGulp(cmd) {
  if (!getProjectConfig()) {
    return false;
  }

  var node_modules_path = path.join(__dirname, '..', 'mission', 'node_modules');

  // Set process options
  var options = {
    cwd: taskPath,
    kill: 5000, // kill after 5 seconds
    stdio: 'inherit',
    env: {
      FBI_TASK_NAME: cmd,
      FBI_RUN_PATH: projectPath,
      FBI_NODEMODULES_PATH: node_modules_path,
    }
  };

  // Create process monitor
  var monitor = respawn(['gulp'], options);
  monitor.maxRestarts = 0;

  // If on Windows and gulp fails, try to replace it with gulp.cmd
  monitor.on('warn', function(err) {
    if (err.code === 'ENOENT') {
      if (isWindows) {
        monitor = respawn(['gulp.cmd'], options);
        monitor.maxRestarts = 0;
        monitor.on('warn', function(err) {
          if (err.code === 'ENOENT') {
            console.log('Error, can\'t find ' + chalk.magenta('gulp') + ' or ' + chalk.magenta('gulp.cmd') + ' command in $PATH, try running: ' + 'npm install -g gulp');
            process.exit(1);
          }
        });
        monitor.start();
      } else {
        console.log('Error, can\'t find ' + chalk.magenta('gulp') + ' command in $PATH, ' + 'try running: npm install -g gulp');
        process.exit(1);
      }
    }
  });

  process.on('SIGINT', function() {
    monitor.stop(function() {
      process.exit();
    });
  });

  monitor.start();
}

// showVersion
function showVersion() {
  console.log(chalk.green(pkg.version));
}

// help
function help() {
  var gulpTasksJson = require(path.join(__dirname, '../mission/config/tasks'));
  var txt = '    Available Missions:';
  var prefix = '\n    ';
  var line = '-----------------------------';
  var minLen = 18;

  txt += prefix + line + ' main missions ' + line;

  for (var i = 0, len = tasksJson.missions.length; i < len; i++) {
    if (!tasksJson.missions[i]['private']) {
      var short = tasksJson.missions[i].short !== '' ? ', ' + tasksJson.missions[i].short : '';
      var name = tasksJson.missions[i].value + short;
      var desc = tasksJson.missions[i].name ? ' -- ' + tasksJson.missions[i].name : '';
      var gap = minLen - name.length;
      name += helper.createBlank(gap);
      txt += prefix + chalk.green(name) + chalk.dim(desc);
    }
  }

  txt += prefix + line + ' gulp missions ' + line;

  for (var j = 0, jLen = gulpTasksJson.tasks.length; j < jLen; j++) {
    var short2 = gulpTasksJson.tasks[j].short !== '' ? ', ' + gulpTasksJson.tasks[j].short : '';
    var name2 = gulpTasksJson.tasks[j].value + short2;
    var desc2 = gulpTasksJson.tasks[j].name ? ' -- ' + gulpTasksJson.tasks[j].name : '';
    var gap2 = minLen - name2.length;
    name2 += helper.createBlank(gap2);
    txt += prefix + chalk.green(name2) + chalk.dim(desc2);
  }
  console.log(txt);
}

// editor
function openProjectWithEditor() {
  var user_conf = getProjectConfig();
  if (user_conf && user_conf.editor) {
    open(projectPath, user_conf.editor);
  } else {
    console.log(chalk.yellow('this is not a ' + pkg.name + 'project, or you should check `editor` option in  ' + pkg.name + '.json'));
  }
}

// finder
function openProjectInFinder() {
  var user_conf = getProjectConfig();
  if (!user_conf) {
    console.log(chalk.yellow('but will open for you.'));
  }
  open(projectPath);
}

function runTask(cmd) {
  var gulpTasksJson;
  try {
    gulpTasksJson = require(path.join(__dirname, '../mission/config/tasks'));
  } catch (e) {
    // console.log(chalk.red('bad mission: ' + cmd));
  }

  var data = tasksJson.missions;
  var found1 = false;
  var found2 = false;

  for (var i = 0, len = data.length; i < len; i++) {
    if (data[i].value === cmd || data[i].short === cmd) {
      cmd = data[i].value;
      found1 = true;
      break;
    }
  }

  if (!found1 && gulpTasksJson) {
    var gulpData = gulpTasksJson.tasks;
    for (var j = 0, jLen = gulpData.length; j < jLen; j++) {
      if (gulpData[j].value === cmd || gulpData[j].short === cmd) {
        cmd = gulpData[j].value;
        found2 = true;
        break;
      }
    }

    if (!found2) {
      console.log(chalk.red('bad mission: ' + cmd));
      return;
    }
  }

  switch (cmd) {
    case 'new':
      create();
      break;
    case 'version':
      showVersion();
      break;
    case 'help':
      help();
      break;
    case 'install':
      install.init();
      break;
    case 'update':
      install.update();
      break;
    case 'open':
      openProjectWithEditor();
      break;
    case 'find':
      openProjectInFinder();
      break;
    case 'todo':
      todo.show();
      break;
    case 'blog':
      blog.init();
      break;
    case 'chblog':
      blog.setLocation();
      break;
    case 'npminstall':
      install.installModules();
      break;
    case 'bowerinstall':
      install.bowerInstall(projectPath);
      break;
    default:
      runGulp(cmd);
      break;
  }
}

function installModules() {
  install.installModules();
}

module.exports = {
  runTask: runTask,
  help: help,
  installModules: installModules
};
