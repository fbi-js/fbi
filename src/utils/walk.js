import fs from 'fs'
import path from 'path'

const scan = (dir, alias) => {
  return {
    name: alias,
    type: 'folder',
    path: alias,
    items: walk(dir, alias)
  }
}

function walk (dir, prefix) {
  prefix = prefix || ''

  if (!fs.existsSync(dir)) {
    return []
  }

  return fs.readdirSync(dir).filter(function (f) {
    return f && f[0] != '.' // Ignore hidden files

  }).map(function (f) {
    var p = path.join(dir, f),
      stat = fs.statSync(p)

    if (stat.isDirectory()) {
      return {
        name: f,
        type: 'folder',
        path: path.join(prefix, p),
        items: walk(p, prefix)
      }
    }

    return {
      name: f,
      type: 'file',
      path: path.join(prefix, p),
      size: stat.size
    }
  })
}

let tree = scan('./bench')

fs.writeFile('./bench/tree.json', JSON.stringify(tree), err => {
  if (err) {
    console.log(err)
  }
})
// console.log(JSON.stringify(tree))
