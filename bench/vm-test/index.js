'use strict';
const util = require('util');
const vm = require('vm');
// const Module = require('module').Module;

// process.config.target_defaults.include_dirs.push('../../data/templates/basic')


// console.log(JSON.stringify(process.config.target_defaults, null ,2))

// const Koa = require('koa')

// console.log(Module)
// console.log(Module._nodeModulePaths)

// {
//   "target_defaults": {
//     "cflags": [],
//     "default_configuration": "Release",
//     "defines": [],
//     "include_dirs": [],
//     "libraries": []
//   },
//   "variables": {
//     "asan": 0,
//     "host_arch": "x64",
//     "icu_data_file": "icudt57l.dat",
//     "icu_data_in": "../../deps/icu-small/source/data/in/icudt57l.dat",
//     "icu_endianness": "l",
//     "icu_gyp_path": "tools/icu/icu-generic.gyp",
//     "icu_locales": "en,root",
//     "icu_path": "deps/icu-small",
//     "icu_small": true,
//     "icu_ver_major": "57",
//     "llvm_version": 0,
//     "node_byteorder": "little",
//     "node_enable_v8_vtunejit": false,
//     "node_install_npm": true,
//     "node_no_browser_globals": false,
//     "node_prefix": "/",
//     "node_release_urlbase": "https://nodejs.org/download/release/",
//     "node_shared_cares": false,
//     "node_shared_http_parser": false,
//     "node_shared_libuv": false,
//     "node_shared_openssl": false,
//     "node_shared_zlib": false,
//     "node_tag": "",
//     "node_use_dtrace": true,
//     "node_use_etw": false,
//     "node_use_lttng": false,
//     "node_use_openssl": true,
//     "node_use_perfctr": false,
//     "openssl_fips": "",
//     "openssl_no_asm": 0,
//     "target_arch": "x64",
//     "uv_parent_path": "/deps/uv/",
//     "uv_use_dtrace": true,
//     "v8_enable_gdbjit": 0,
//     "v8_enable_i18n_support": 1,
//     "v8_no_strict_aliasing": 1,
//     "v8_optimized_debug": 0,
//     "v8_random_seed": 0,
//     "v8_use_snapshot": true,
//     "want_separate_host_toolset": 0,
//     "xcode_version": "7.0"
//   }
// }


var Module = require('module');
var path = require('path');

const sandbox = {
  animal: 'cat',
  count: 2,
  koa: 'a',
  console: console,
  this: 'custom this',
  require: function (mod, uncached) {

    return require(path.join(__dirname, '../../data/templates/basic/node_modules', mod))

    // var parentModule = new Module(mod);
    // // parentModule.filename = mod;
    // parentModule.paths = Module._nodeModulePaths(path.join(__dirname, '../../data/templates/basic'));
    // // parentModule.paths = Module._nodeModulePaths(dirname(path));
    // console.log(parentModule)


    // return Module._load(mod, parentModule)

    // function requireLike(file) {
    //   var cache = Module._cache;
    //   if (uncached) {
    //     Module._cache = {};
    //   }

    //   var exports = Module._load(file, parentModule);
    //   Module._cache = cache;

    //   return exports;
    // };


    // requireLike.resolve = function (request) {
    //   var resolved = Module._resolveFilename(request, parentModule);
    //   // Module._resolveFilename returns a string since node v0.6.10,
    //   // it used to return an array prior to that
    //   return (resolved instanceof Array) ? resolved[1] : resolved;
    // }

    // try {
    //   requireLike.paths = require.paths;
    // } catch (e) {
    //   //require.paths was deprecated in node v0.5.x
    //   //it now throws an exception when called
    // }
    // requireLike.main = process.mainModule;
    // requireLike.extensions = require.extensions;
    // requireLike.cache = require.cache;

    // return requireLike;
  }
};

const requireRelative = function (mod) {
  return require(path.join(__dirname, '../../data/templates/basic/node_modules', mod))
}

let code = `
(function(require) {

  const Koa = require('koa')

  console.log(Koa)
  console.log(process.cwd())

})
 `

// vm.createContext(sandbox);
// vm.runInContext(code, sandbox, { displayErrors: true })

vm.runInThisContext(code)(requireRelative);

// console.log(util.inspect(sandbox));



// paths:
//    [ '/Users/inmanshaw/work/git/github/neikvon/fbi/bench/vm-test/node_modules',
//      '/Users/inmanshaw/work/git/github/neikvon/fbi/bench/node_modules',
//      '/Users/inmanshaw/work/git/github/neikvon/fbi/node_modules',
//      '/Users/inmanshaw/work/git/github/neikvon/node_modules',
//      '/Users/inmanshaw/work/git/github/node_modules',
//      '/Users/inmanshaw/work/git/node_modules',
//      '/Users/inmanshaw/work/node_modules',
//      '/Users/inmanshaw/node_modules',
//      '/Users/node_modules' ]





// vm.runInThisContext(code)(require);


// const script = new vm.Script(code);
// script.runInContext(context);

// const context = new vm.createContext(sandbox);

// let code =
//   `(function(require) {

//     console.log(animal)

//    const http = require('http');
//    const Koa = require('koa');

//    http.createServer( (request, response) => {
//      response.writeHead(200, {'Content-Type': 'text/plain'});
//      response.end('Hello World\\n');
//    }).listen(8124);

//    console.log('Server running at http://127.0.0.1:8124/');
//  })`;