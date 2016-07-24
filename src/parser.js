import {walk} from 'estree-walker'
import acorn from 'acorn'
import {merge} from './helpers/utils'

export default class Parser {
  constructor(source, options) {
    this.dependencies = []
    this.localDependencies = []
    this.globalDependencies = []
    this.options = merge({ sourceType: 'module' }, options || {})

    this.ast = acorn.parse(source, this.options)
  }

  getDependencies() {
    walk(this.ast, {
      enter: (node, parent) => {
        // import
        if (node.type === 'ImportDeclaration') {
          this.dependencies.push(node.source.value)
        }

        // require
        if (node.type === 'CallExpression' && node.callee.name === 'require') {
          this.dependencies.push(node.arguments[0].value)
        }
      }
    })

    return this.dependencies
  }

  splitDependencies() {
    if (!this.dependencies.length) {
      this.getDependencies()
    }

    this.dependencies.map(item => {
      if (/^\.?\.\//.test(item)) { // local
        this.localDependencies.push(item)
      } else {
        this.globalDependencies.push(item)
      }
    })

    return {
      locals: this.localDependencies,
      globals: this.globalDependencies
    }
  }

  getLocalDependencies() {
    if (!this.dependencies.length) {
      this.splitDependencies()
    }
    return this.localDependencies
  }

  getGlobalDependencies() {
    if (!this.dependencies.length) {
      this.splitDependencies()
    }
    return this.globalDependencies
  }

}