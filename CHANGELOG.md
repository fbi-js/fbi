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

