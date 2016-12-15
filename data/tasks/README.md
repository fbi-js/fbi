# fbi-tasks-demo
Tasks demos for [fbi-v2.x](https://github.com/neikvon/fbi)

## Introduction:

- `./fbi/serve.js` Serve static files - `fbi serve`
- `./fbi/run.js` Run npm scripts - `fbi run [npm script name]`

Note: `fbi ls` to see available `npm scripts`

## Usage:

### First
```bash
$ npm i -g fbi
```

### Clone
```bash
$ git clone git@github.com:neikvon/fbi-tasks-demo.git
```

### Install dependencies locally
```bash
$ npm install
```

### Add
```bash
$ fbi ata *

# output:
# FBI => task 'run' added
# FBI => task 'serve' added

# or

$ fbi ata serve
```
(update: v2.0.5+, the `ata` action will also copy the `node_modules` folder.)

**Now you can use tasks you just added everywhere.**


### Check
```bash
$ fbi ls

# output:
# Tasks:

#   run             -g
#   serve           -g
```

### Test
```bash
$ fbi serve

# output:
# FBI => Running global task "serve"...
# FBI => Server runing at http://localhost:8888
# FBI => Server root: ./
```

### Update
```bash
$ fbi ata serve

# output:
# FBI => task 'serve' updated
```



