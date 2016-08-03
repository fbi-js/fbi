const pm2 = require('pm2')
const wpConfig = require('./webpack.config')
const ruConfig = require('../config/rollup-config')

pm2.disconnect();

// process.stdin.resume();//so the program will not close instantly

// function processHandler(options, err) {
//   if (options.cleanup) ctx.log(options.msg, 1);
//   if (err) ctx.log(err.stack);
//   if (options.exit) process.exit();
// }

// //do something when app is closing
// process.on('exit', processHandler.bind(null, { msg: 'pm2 started' }));

// //catches ctrl+c event
// process.on('SIGINT', processHandler.bind(null, { exit: true }));

// //catches uncaught exceptions
// process.on('uncaughtException', processHandler.bind(null, { exit: true }));


// pm2.connect(function (err) {
//   if (err) {
//     ctx.log(err, 0);
//     process.exit(2);
//   }

//   pm2.start({
//     name: 'pm2-demo',
//     script: 'server/app.js',         // Script to be run
//     watch: true,
//     output: 'log/out.log',
//     error: 'log/err.log',
//     pid: 'log/id.pid',
//     exec_mode: 'fork',        // Allow your app to be clustered
//     instances: 4,                // Optional: Scale your app by 4
//     max_memory_restart: '100M'   // Optional: Restart your app if it reaches 100Mo
//   }, function (err, apps) {
//     // pm2.disconnect();   // Disconnect from PM2

//     if (err) {
//       ctx.log(err, 0)
//       return
//     }

//     pm2.streamLogs('pm2-demo', 0)
//     pm2.disconnect();
//   });
// });



// test
// ctx.log('fm local serve.js')

// ctx.log(wpConfig.name)

// ctx.log(ruConfig.entry)