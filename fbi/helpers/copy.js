const glob = require('glob')
const fs = require('fs-extra')

module.exports = function copyOtherFiles () {
  const otFiles = glob.sync('**', {
    cwd: 'src',
    dot: true,
    nodir: true,
    ignore: ['**/*.js', '.DS_Store']
  })

  // copy package.json
  fs.copy('package.json', ctx.options.dist + 'package.json', function (err) {
    if (err) return console.error(err)
    ctx.log(`copied:    package.json`)
  })

  // copy !js files
  otFiles.map(item => {
    fs.copy('src/' + item, ctx.options.dist + item, function (err) {
      if (err) return console.error(err)
      ctx.log(`copied:    ${ctx.options.dist+ item}`)
    })
  })
}
