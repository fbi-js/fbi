var fs = require('fs');
var ncp = require('ncp');
var chalk = require('chalk');

function copy(src, dest, name, cb) {
  var tip = name || '';
  console.log(chalk.dim('copy ' + tip + ' ···'));
  ncp(src, dest, function(err) {
    if (err) {
      console.log(chalk.red('cope ' + tip + ' fail!'));
      console.log(err);
      return;
    }
    console.log(chalk.green('copy ' + tip + ' success!'));
    if (cb && typeof(cb) === 'function') {
      cb();
    }
  });
}

function deleteFolderRecursive(path) {
  var files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function(file) {
      var curPath = path + '/' + file;
      if (fs.statSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

module.exports = {
  copy: copy,
  deleteFolderRecursive: deleteFolderRecursive
};
