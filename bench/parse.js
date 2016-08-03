const walk = require('estree-walker').walk;
const acorn = require('acorn');

const comments = [], tokens = [];

const source = `
const fs = require('fs')
const path = require('path')
import demo from 'demo'
`

// const source = `
// import fs from 'fs'
// import path from 'path'
// import {walk} from 'estree-walker'
// `

// const source = `
// function Demo(){
//   console.log('a')
// }
// `

const ast = acorn.parse(source, {
  sourceType: 'module'
});
// ast = acorn.parse(sourceCode, options); // https://github.com/marijnh/acorn

let modules = []

walk(ast, {
  enter: function (node, parent) {
    // some code happens
    // console.log('========================> enter')
    // console.log(node)
    // console.log(parent)
    //

    // import
    if (node.type === 'ImportDeclaration') {
      modules.push(node.source.value)
    }

    // require
    if (node.type === 'CallExpression' && node.callee.name === 'require') {
      modules.push(node.arguments[0].value)
    }
  },
  leave: function (node, parent) {
    // some code happens
    // console.log('========================> leave')
    // console.log(node)
    // console.log(parent)
  }
})

console.log(modules.join('\n'))