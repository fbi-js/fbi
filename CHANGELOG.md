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
