/*
 * fbi
 *
 * Copyright (c) 2015 Inman <neikvon@icloud.com>
 * Licensed under the MIT license.
 */

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var helper = require('./helper');
var pkg = require('../package.json');

function writeProjectConfig(_path, _data) {
  console.log(chalk.dim('update project config ···'));
  fs.writeFile(_path + '/' + pkg.name + '.json', JSON.stringify(_data), function(err) {
    if (err) {
      console.log(chalk.red('project config update fail!'));
    } else {
      console.log(chalk.green('project config updated!'));
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
