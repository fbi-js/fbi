/*
 * fbi
 *
 * Copyright (c) 2015 Inman <neikvon@icloud.com>
 * Licensed under the MIT license.
 */

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var inquirer = require('inquirer');
var chalk = require('chalk');
var helper = require('./helper');
var blogJson = require('../config/blog');
var blogJsonFile = path.join(__dirname, '../config/blog.json');
var open = require('open');

function start(params) {
  var data = params ? params : blogJson;

  // server
  if (data.local) {
    exec('hexo server', {
      // cwd: path.join(__dirname, data.path)
      cwd: data.path
    });
  }

  // open
  setTimeout(function() {
    open(data.url, 'safari');
  }, 2000);
}

function setLocation(flag) {
  inquirer.prompt({
    type: 'input',
    name: 'blogLocaltion',
    message: 'absolute path:',
    validate: function(answer) {
      if (answer === '') {
        return 'You must set the localtion of your blog.';
      } else {
        if (answer.toString().indexOf('.') === 0) {
          // if(!helper.isExist(path.join(__dirname, answer))){
          if (!helper.isExist(answer)) {
            return 'localtion not exist.';
          }
        }
      }
      return true;
    }
  }, function(answers) {

    if (answers.blogLocaltion.indexOf('http') === 0) {
      blogJson.url = answers.blogLocaltion;
      blogJson.path = '';
      blogJson.local = false;
    } else {
      blogJson.url = 'http://localhost:4000';
      blogJson.path = answers.blogLocaltion;
      blogJson.local = true;
    }

    fs.writeFile(blogJsonFile, JSON.stringify(blogJson), 'utf-8', function(err) {
      if (err) {
        console.log(chalk.red('Error.'));
      }

      if (flag) {
        start(blogJson);
      }
    });
  });
}

function init() {
  if (blogJson.url === '') {
    setLocation(true);
  } else {
    start();
  }
}

module.exports = {
  init: init,
  setLocation: setLocation
};
