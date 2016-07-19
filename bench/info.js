var rl = require('readline').createInterface(
    process.stdin, process.stdout
  ),
  prompts = ['Name', 'Age', 'Eye Color'],
  p = 0,
  data = {}

var get = function () {
  rl.setPrompt(prompts[p] + '> ')
  rl.prompt()

  p++
}

get()

rl.on('line', function (line) {
  data[prompts[p - 1]] = line

  if (p === prompts.length) {
    return rl.close()
  }

  get()
}).on('close', function () {
  require('fs').writeFileSync('./bench/tmp/info.json', JSON.stringify(data))
  console.log('File Saved.')
  process.exit(0)
})
