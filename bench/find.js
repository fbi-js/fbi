var fs = require('fs')

var search = function (dir, needle) {
  if (!fs.existsSync(dir)) {
    return console.log('Directory ' + dir + ' does not exist.')
  }

  var haystack = fs.readdirSync(dir), path, stats
  for (var s = 0; s < haystack.length; s++) {
    path = dir + '/' + haystack[s]
    stats = fs.statSync(path)

    if (stats.isDirectory()) {
      search(path, needle)
    } else if (path.indexOf(needle) >= 0) {
      console.log(path)
    }
  }
}

search(process.argv[2], process.argv[3]);

// $ node bench/find.js ./src index.js

// ret:
// ./src/config/index.js
// ./src/index.js
// ./src/utils/index.js
