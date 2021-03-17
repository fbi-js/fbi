# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.1.10](https://github.com/fbi-js/fbi/compare/v2.1.9...v2.1.10) (2021-03-17)


### Bug Fixes

* add checkNodeVersion method ([bef465e](https://github.com/fbi-js/fbi/commit/bef465eb8e761e8d1b71c00e98d6b594d0001cce))

### 2.1.9 (2021-03-17)


### Bug Fixes

* colors(...).grey is not function in node v14 ([1e89687](https://github.com/fbi-js/fbi/commit/1e89687bfab6cc7f5e38281e1cee252ad2c1388c))


### Reverts

* Revert "task new" ([b028699](https://github.com/fbi-js/fbi/commit/b0286990a30af964f6eb5b650bb2d4de232854ff))

### v2.1.6
2017-05-16
- Update readme

### v2.1.5
2016-11-28
- fixed fbi data path bug

### v2.1.2
2016-11-27
- use fbi build source files
- add `fbi update` command

### v2.1.1
2016-08-19 19:25
- fixed `fbi i` bugs on windows. Passing tests on win8 & win10

### v2.0.9
2016-08-18 21:00
- keep default task 'clone', usage: fbi clone path/to/git/repo.git

### v2.0.8
2016-08-18 20:40
- change `data/tasks/task.js` to `data/tasks/fbi/task.js`

You can host tasks and tempaltes in one git repository, see [fbi-tasks-demo](https://github.com/neikvon/fbi-tasks-demo) `clone.js` & `pull.js`

### v2.0.7
2016-08-17 20:00
- `fbi i`: install `dependencies` locally, install `devDependencies` in fbi global tempaltes folder.

### v2.0.6
2016-08-07 22:20
- fixed `fbi i` bugs
- remove redundant logs

### v2.0.5
2016-08-07 17:34
- make fbi work with node v4.x (require npm v3.0+)
- add 'node_modules' when add tasks or templates, after that you don't need to run `fbi i`
- make fbi work in windows
