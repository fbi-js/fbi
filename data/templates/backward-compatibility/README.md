# fbi-template-backward-compatibility
Template for fbi v1.x

### Clone
```bash
$ git clone git@github.com:neikvon/fbi-template-backward-compatibility.git
```

### Install dependencies locally
```bash
$ npm install
```

### Test
```bash
$ fbi b            # build
```
```bash
$ fbi b -p         # build in production
```
```bash
$ fbi c            # clean
```

### Add to fbi templates
```bash
$ fbi atm backward-compatibility
```

### Install dependencies globally

```bash
$ fbi i
```

### work on old fbi project
1. copy `./fbi` folder to the old project's root
2. correct config in ` ./fbi/config.js `   `  ./fbi/handlebars.config.js`   ` ./fbi/webpack.config.js `
3. remove old config: ` ./fbi.json `   `  ./handlebars.config.js`   ` ./webpack.config.js `
5. done