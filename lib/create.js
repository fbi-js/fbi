/*
 * fbi
 *
 * Copyright (c) 2015 Inman <neikvon@icloud.com>
 * Licensed under the MIT license.
 */

var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
var chalk = require('chalk');
var helper = require('./helper');
var config = require('./config');
var install = require('./install');
var templatesJson = require(path.join(__dirname, '../config/template.json')).templates;
var ncp = require('ncp').ncp;
// var templatePath = path.join(__dirname, '../template');
var bowerpkg = require('../config/bowerpackage.json').packages;
var bowerpkfArray = [];

var currentPath = process.cwd(),
  projectPath,
  configJson,
  selectTemplateJson = [];

ncp.limit = 16;

for (var i = 0, len = templatesJson.length; i < len; i++) {
  selectTemplateJson.push(templatesJson[i].name);
}

var createProjectName = [{
  type: 'input',
  name: 'name',
  message: 'Name:',
  validate: function(value) {
    var pass = value.match(/^[^\\/:*?""<>|,]+$/i);
    if (pass) {
      return true;
    } else {
      return chalk.magenta('bad string');
    }
  }
}];

for (var j = 0, len = bowerpkg.length; j < len; j++) {
  var item = {};
  item['name'] = bowerpkg[j].name + ' ' + bowerpkg[j].version;
  bowerpkfArray.push(item);
}

var initOptions = [{
  type: 'input',
  name: 'version',
  message: 'Version:',
  default: '1.0.0'
}, {
  type: 'input',
  name: 'author',
  message: 'Author:',
  default: process.env.LOGNAME || process.env.USERNAME
}, {
  type: 'list',
  name: 'template',
  message: 'Template:',
  choices: selectTemplateJson
}, {
  type: 'confirm',
  name: 'useBower',
  message: 'add some bower package?',
  default: false
}, {
  type: 'checkbox',
  name: 'vendor',
  message: 'select bower packages',
  choices: bowerpkfArray,
  when: function(answers) {
    return answers.useBower;
  }
}];

function createBowerJson(answers, projectPath, cb) {
  // 新建bower.json文件
  var bowerjson = require(path.join(__dirname, '..', '/template', answers.template) + '/bower.json');
  bowerjson.name = answers.name;
  bowerjson.version = answers.version;

  for (var i = 0, len = answers.vendor.length; i < len; i++) {
    var t = answers.vendor[i].split(' '),
      name = t[0],
      version = t[1] || '*';
    bowerjson['dependencies'][name] = version;
  }

  fs.writeFile(projectPath + '/bower.json', JSON.stringify(bowerjson, null, '  '), function(err) {
    if (err) {
      console.log(chalk.red('write bower.json fail!'));
    } else {
      console.log(chalk.green('write bower.json success'));
      if (cb && typeof(cb) === 'function') {
        cb();
      }
    }
  });
}

function init() {

  inquirer.prompt(initOptions, function(answers) {
    var custom_config = helper.extendJson(configJson, answers);

    projectPath = currentPath + '/' + configJson.name;

    // download template and set the config file
    install.download(answers.template, projectPath, custom_config, function() {
      config.updateTemplateConfig(projectPath, custom_config);

      if (custom_config.useBower) {
        createBowerJson(custom_config, projectPath, function() {
          // install bower deps
          install.bowerInstall(projectPath);
        });
      }
    });
  });
}

function create() {
  inquirer.prompt(createProjectName, function(answer) {
    configJson = answer;

    projectPath = currentPath + '/' + answer.name;

    fs.access(projectPath, fs.R_OK, function(err) {
      if (err) {
        init();
      } else {
        console.log(chalk.red.bold('project already exists!'));
      }
    });
  });
}

module.exports = function() {
  create();
};
