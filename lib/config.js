/*
 * fbi
 *
 * Copyright (c) 2015 Inman <neikvon@icloud.com>
 * Licensed under the MIT license.
 */

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var chalk = require('chalk');
var helper = require('./helper');
var pkg = require('../package.json');

// install project packages
function installProjectPackage(_path){
  var myPkg = require(path.join(_path, 'package.json'));
  if(!helper.isJsonEmpty(myPkg.dependencies)){
    console.log(chalk.dim('npm installing in your project folder'));

    var installTool = spawn('node', [path.join(__dirname, '../node_modules/.bin/npm'), 'install'], {
      cwd: _path,
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

function writeProjectConfig(_path, _data) {
  console.log(chalk.dim('update project config ···'));
  fs.writeFile(_path + '/' + pkg.name + '.json', JSON.stringify(_data), function(err) {
    if (err) {
      console.log(chalk.red('project config update fail!'));
    } else {
      console.log(chalk.green('project config updated!'));

      installProjectPackage(_path);
    }
  });
}

function updateTemplateConfig(_path, _config) {
  var def_config, new_config;
  fs.access(_path + '/' + pkg.name + '.json', fs.R_OK, function(err) {
    if (err) {
      console.log(chalk.dim(pkg.name + '.json is not in your project, copy from the library now ···'));
      try {
        def_config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/fbi-' + _config.template + '.json')));
      } catch (e) {
        console.log(chalk.red('ops...not found in the library. plz start a new project.'));
        return;
      }

      if (def_config) {
        new_config = helper.extendJson(def_config, _config);
        delete new_config.useBower;
        writeProjectConfig(_path, new_config);
      }
    } else {
      try {
        def_config = JSON.parse(fs.readFileSync(path.join(_path, '/' + pkg.name + '.json')));
      } catch (e) {
        console.log(chalk.red('ops...can\'t read the config file in your project root. plz start a new project.'));
        return;
      }
      if (def_config) {
        new_config = helper.extendJson(def_config, _config);
        delete new_config.useBower;
        writeProjectConfig(_path, new_config);
      }
    }
  });
}

module.exports = {
  updateTemplateConfig: updateTemplateConfig
};
