/*
 * fbi
 *
 * Copyright (c) 2015 Inman <neikvon@icloud.com>
 * Licensed under the MIT license.
 */

var updateNotifier = require('update-notifier'),
  pkg = require('../package.json');

function checkMain() {
  // check main process update
  updateNotifier({
    pkg: pkg,
    // updateCheckInterval: 1000 * 60 * 60 * 24 * 7 // 1 week
    updateCheckInterval: 1000 * 2
  }).notify();
}

// function checkMission() {
//   var mpkg = require('../mission/package.json');
//   updateNotifier({
//     pkg: mpkg,
//     // updateCheckInterval: 1000 * 60 * 60 * 24 * 7 // 1 week
//     updateCheckInterval: 1000 * 2
//   }).notify();
// }
//
// function checkTemplate() {
//
// }

module.exports = {
  checkMain: checkMain
  // checkMission: checkMission
};
