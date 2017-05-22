### v3.0.0-beta.2
2017.05.22

Rewrite `fbi i` method:

Usage: `fbi i [package, package, ...] [-t, -g, -a] [-cnpm, -npm]`

Dependencies can be installed to the specified directory.

Examples:

  - `fbi i` : Install local dependencies
  - `fbi i vue` : Install `vue` to local as dependencies
  - `fbi i -t` :  Install global template dependencies (you need to implement this in a template project)
  - `fbi i webpack -t` :  Install `webpack` to global template as devDependencies (you need to implement this in a template project)
  - `fbi i -g` : Install global tasks dependencies
  - `fbi i koa -g` : Install `koa` to global tasks as dependencies
  - `fbi i -cnpm` : Use `cnpm` to install packages



### v3.0.0-alpha.7
2017.05.18
- remove build


### v3.0.0-alpha.6
2016.12.20
- add `compile` task


### v3.0.0-alpha.3
2016.12.14

- change runInNewContext to runInContext

### v3.0.0-alpha.2
2016.12.12

`package.json`

```
"fbi": {
  "template": "mod",
  "PATHS": {
    "local": {
      "tasks": "build/",
      "config": "build/config.js"
    }
  }
}
```

```
"fbi": {
  "template": "mod"
}
```

### v3.0.0-alpha.1
2016.12.12
- Breaking change:
    1. global 'require' rewrite
    1. global 'ctx' injection
    1. with or without FBI
- GLobal options change

### v3.0.0-alpha.0
2016.12.12
- init

