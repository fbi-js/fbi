# FBI coming

## features
* start a project in a flash
* global tasks between mulriple projects, keep your project folder clean
* local server, auto reload, version control, module compiler, zip and gzip compress, etc.

## install

```bash
$	npm install -g fbi
```

## useage

```bash
Usage:
  fbi n       New project
  fbi r       Serve project or copy dist files to nginx folder
  fbi p       Make production files
  fbi t       Deploy via sftp
  fbi w       Local server and Watch files change
  fbi c       Clean dist files
  fbi z       Zip dist files, separate to static and html package
  fbi g       Gzip the static files
  fbi ng      Copy dist files to `nginx`
  fbi i       Install missions & templates
  fbi ni      Install node dependencies
  fbi bi      Install bower dependencies
  fbi f       Open project via finder
  fbi o       Open project via editor
  fbi h       Show help
  fbi v       Show version

Also:
  fbi server      Start server
  fbi vendor      Copy vendor files, config from fbi.json `vendor`
  fbi check       Jshint Eslint
  fbi clean-dist
  fbi clean-zip
  fbi clean-gzip
  fbi image
  fbi replace
  fbi revision
  fbi script
  fbi style
  fbi template
  fbi zip-all
  fbi zip-static
  fbi zip-html
```

## quick start

create a new project in current path

```bash
$ fbi n
```

run the new project

```bash
$ cd your_project
$ fbi r
```

production
```bash
$ fbi p
```

deploy
```bash
$ fbi t
```

## changelog

**v 1.3.0**

2015-11-7 03:00:00

upgrade node to v5.0.0 and npm to 3.3.6


**v 1.2.5**

2015-10-9 10:50:00

add api CORS support.

fbi.json:
"browserSync": {
  ...
  "cors": "http://yousite.com/api"
}


**v 1.2.3**

2015-10-8 16:50:00

add react template.

add react mission supports:

eslint, common.js (react and react-router)

...

**v 1.2.1**

2015-8-7 10:05:00

added:

fbi.json：  webpack_loaders

useage:

    "webpack_loaders": {
      "file-loader": "*",
      "style-loader": "*",
      "url-loader": "*"
    }

    $ cd path/to/your/project
    $ fbi ni

**v 1.2.0**

2015-8-6 19:40:00

big update:

webpack.config.js, handlebars_config.js, run missions in current path...

update steps:

$ npm install -g fbi

$ fbi i

$ fbi ni


**v 1.1.11**

2015-8-2 15:50:00

missions update:

use UglifyJsPlugin.

optimization on vendor misssion.

check js code style every time you run `run` `build` ``prod.

templates update:

fixed ftp bugs.


**v 1.1.10**

2015-7-30 17:15:00

fixed bug in handlebars & webpack path.


**v 1.1.9**

2015-7-30 10:51:00

fixed bug in 'open path'.


**v 1.1.8**

2015-7-29 16:06:00

fixed bug when don't choose bower package.


**v 1.1.6**

2015-7-28 01:50:00

bower supports.

custom vendor build path in fbi.json ` vendor `.


**v 1.1.2**

2015-7-23 18:06:00

change access


**v 1.1.0**

2015-7-23 14:19:00

fixed bugs in Windows.

missions update.


**v 1.0.11**

2015-7-22 01:10:00

add two missions:

open, o         -- open project in editor
find, f         -- open project in finder

fixd bug in gulp mission - replace


**v 1.0.9**

2015-7-21 14:51:00

main missions and gulp missions.

plz update the missions and template : ` $ fbi update `


**v 1.0.8**

2015-7-21 02:05:00

template update:

add 'simple' type.


mission update:

add 'jshint';

custom 'ftp' settings;

'gzip' js,css,img files;

fixed bug in 'browserSync'.


**v 1.0.7**

2015-7-20 00:56:11

Separate templates mission from the package, it will download automatically,
or you can just run `fbi install`
and run `fbi update` at any time.


**v 1.0.6**

2015-7-19 20:58:00

add v command, and show current version.


**v 1.0.5**

2015-7-19 20:47:00

fixed bug in bower install.
fixed bug in set current project path.


**v 1.0.4**

2015-7-19 20:21:00

README.md updated.


**v 1.0.3**

2015-7-19 20:00:00

use the config file in current project root.

some optimization...


## license

[MIT](http://opensource.org/licenses/MIT)
