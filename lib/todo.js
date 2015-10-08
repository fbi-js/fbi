/*
 * fbi
 *
 * Copyright (c) 2015 Inman <neikvon@icloud.com>
 * Licensed under the MIT license.
 */

var chalk = require('chalk');
var todoJson = require('../config/todo');

// var todoList = [{
//   type: 'list',
//   name: 'list',
//   message: 'TODO:',
//   filter: function(val) {
//     return val.toLowerCase();
//   }
// }];

function show() {
  var todos = todoJson.todos,
    txtTodo = '  TODO: \n',
    txtDone = '  DONE: \n',
    idxTodo = 0,
    idxDone = 0;
  for (var i = 0, len = todos.length; i < len; i++) {
    if (todos[i].checked) {
      idxDone++;
      txtDone += chalk.gray('  ' + idxDone + '. ' + todos[i].message + '\n');
    } else {
      idxTodo++;
      txtTodo += chalk.yellow('  ' + idxTodo + '. ' + todos[i].message + '\n');
    }
  }

  console.log('\n' + txtTodo);
  console.log(txtDone);

  // inquirer.prompt(todoJson.todos, function(answers) {
  //   console.log(JSON.stringify(answers, null, "  "));
  // });
}

module.exports = {
  show: show
};
