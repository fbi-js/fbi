/*
 * fbi
 *
 * Copyright (c) 2015 Inman <neikvon@icloud.com>
 * Licensed under the MIT license.
 */

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var respawn = require('respawn');
var chalk = require('chalk');
var Download = require('download');
var file = require('./file');
var pkg = require('../package.json');
var missionDest = path.join(__dirname, '../mission');
var templateDest = path.join(__dirname, '../template');
var missionsJson = require(path.join(__dirname, '../config/mission.json')).missions;
var templatesJson = require(path.join(__dirname, '../config/template.json')).templates;
var isWindows = process.platform === 'win32';
var helper = require('./helper');
var projectPath = path.normalize(process.cwd());

function bowerInstall(destPath) {
  if (destPath) {
    console.log(chalk.dim('bower installing···'));

    var installTool = spawn('node', [path.join(__dirname, '../node_modules/.bin/bower'), 'install'], {
      cwd: destPath,
      stdio: [0, 1, 2] // 设置子进程 log颜色
    });

    installTool.on('data', function(data) {
      console.log(chalk.dim(data.toString()));
    });

    installTool.on('close', function() {
      console.log(chalk.green('install complete.'));
    });
  }
}

// get mission links
function getUrl(name, obj) {
  var _url = '';
  for (var i = 0, len = obj.length; i < len; i++) {
    if (obj[i].name === name) {
      _url = obj[i].link;
      break;
    }
  }
  return _url;
}

// dl mission
function downloadMission(name, cb) {
  name = 'default';
  var url = getUrl(name, missionsJson);
  if (url === '') {
    console.log(chalk.red('mission `' + name + '` is not available.'));
  } else {
    console.log(chalk.dim('download mission `' + name + '`···'));
    new Download({
        mode: '755',
        extract: true,
        strip: 1
      })
      .get(url)
      .dest(missionDest)
      .run(function(err) {
        if (err) {
          console.log(chalk.red('download mission `' + name + '` ERROR'));
          return;
        } else {
          console.log(chalk.green('mission download success!'));
          if (cb && typeof(cb) === 'function') {
            cb();
          }
        }
      });
  }
}

function downloadTemplate(name, destPath, cb) {
  var url = getUrl(name, templatesJson);

  if (url === '') {
    console.log(chalk.red('template `' + name + '` is not available.'));
  } else {
    console.log(chalk.dim('download template `' + name + '`···'));
    new Download({
        mode: '755',
        extract: true,
        strip: 1
      })
      .get(url)
      .dest(templateDest + '/' + name)
      .run(function(err) {
        if (err) {
          console.log(chalk.red('download template `' + name + '` ERROR'));
          return;
        }
        console.log(chalk.green('template `' + name + '` download success!'));
        file.copy(templateDest + '/' + name, destPath, name, cb);
        // if (cb && typeof(cb) === 'function') {
        //   cb();
        // }
      });
  }
}

function updateTemplate(cb) {
  for (var i = 0, len = templatesJson.length; i < len; i++) {
    var url = templatesJson[i].link;
    var name = templatesJson[i].name;
    if (url === '') {
      console.log(chalk.red('template `' + name + '` is not available.'));
    } else {
      console.log(chalk.dim('download template `' + name + '`···'));
      new Download({
          mode: '755',
          extract: true,
          strip: 1
        })
        .get(url)
        .dest(templateDest + '/' + name)
        .run(function(err) {
          if (err) {
            console.log(chalk.red('template install ERROR'));
            return;
          }
          console.log(chalk.green('template install success!'));
          if (cb && typeof(cb) === 'function') {
            cb();
          }
        });
    }
  }
}

/**
 * [download description]
 * @param  {[type]} templateName [description]
 * @param  {[type]} destPath     [description]
 * @param  {[type]} customConfig [description]
 * @return {[type]}              [description]
 */
function download(templateName, destPath, customConfig, cb) {
  // mission
  fs.access(missionDest + '/gulpfile.js', fs.R_OK, function(err) {
    if (err) {
      downloadMission(templateName);
    }
  });

  // template
  fs.access(templateDest + '/' + templateName, fs.R_OK, function(err) {
    if (err) {
      downloadTemplate(templateName, destPath, cb);
    } else {
      file.copy(templateDest + '/' + templateName, destPath, templateName, cb);
    }

  });
}

function npmInstall() {
  console.log(chalk.dim('npm install ···'));
  // Set process options
  var options = {
    cwd: missionDest,
    kill: 5000, // kill after 5 seconds
    stdio: 'inherit'
  };

  // Create process monitor
  var monitor = respawn(['npm', 'install'], options);
  monitor.maxRestarts = 0;

  // If on Windows and gulp fails, try to replace it with gulp.cmd
  monitor.on('warn', function(err) {
    if (err.code === 'ENOENT') {
      if (isWindows) {
        monitor = respawn(['npm.cmd', 'install'], options);
        monitor.maxRestarts = 0;
        monitor.on('warn', function(err) {
          if (err.code === 'ENOENT') {
            console.log('Error, can\'t find nmp.cmd command in $PATH');
            process.exit(1);
          }
        });
        monitor.start();
      } else {
        console.log('Error, can\'t find nmp command in $PATH');
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

// only update mission
function update(flag, cb) {
  downloadMission('default', cb, flag);
  updateTemplate(cb);
}

function init(flag, cb) {
  update(flag, cb);
}

function installModules_mod() {
  var mis_pkg_path = path.join(__dirname, '../mission/package.json'),
    mis_pkg = require(mis_pkg_path),
    platform,
    common_pkgs;

  common_pkgs = require(path.join(__dirname, '../mission/config/package_common.json'));

  // os
  if (isWindows) {
    platform = require(path.join(__dirname, '../mission/config/package_win.json'));
  } else {
    platform = require(path.join(__dirname, '../mission/config/package_osx.json'));
  }

  mis_pkg.devDependencies = helper.extendJson(common_pkgs.devDependencies, platform.devDependencies);

  // check custom package config
  if (helper.isExist(path.join(projectPath + '/' + pkg.name + '.json'))) {
    var custom_config = require(projectPath + '/' + pkg.name + '.json');

    // webpack loaders
    if (custom_config.webpack_loaders && !helper.isJsonEmpty(custom_config.webpack_loaders)) {
      mis_pkg.devDependencies = helper.extendJson(mis_pkg.devDependencies, custom_config.webpack_loaders);
    }

    // recat devDependencies
    if (custom_config.template && custom_config.template === 'react') {
      var react_devDependencies = require(path.join(__dirname, '../mission/config/package_react.json'));
      mis_pkg.devDependencies = helper.extendJson(mis_pkg.devDependencies, react_devDependencies.devDependencies);
    }

    // proxy middleware
    if (custom_config.browserSync.cors && custom_config.browserSync.cors !== '') {
      var middleware_devDependencies = require(path.join(__dirname, '../mission/config/package_middleware.json'));
      mis_pkg.devDependencies = helper.extendJson(mis_pkg.devDependencies, middleware_devDependencies.devDependencies);
    }

    // console.log(mis_pkg.devDependencies);
  }

  // console.log(mis_pkg);

  fs.writeFile(mis_pkg_path, JSON.stringify(mis_pkg), function(err) {
    if (err) {
      console.log(chalk.red('write mission package.json fail!'));
    } else {

      // write success
      npmInstall();
    }
  });
}

function installModules() {

  fs.access(path.join(__dirname, '../mission'), fs.R_OK, function(err) {
    if (err) {
      // mission
      downloadMission('default', function() {
        installModules_mod();
      });
    } else {
      // module
      installModules_mod();
    }
  });
}

module.exports = {
  bowerInstall: bowerInstall,
  init: init,
  update: update,
  download: download,
  installModules: installModules
};