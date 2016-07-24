export default class Module {
  constructor(mod) {
    this.modules = new Map()

    if (mod !== undefined && mod !== '') {
      this.mod = new Map()
      this.mod.set(mod, this.modules)
      // this.set(mod, this.modules)
    }
  }

  get(name) {
    return this.modules.get(name)
  }

  set(name, value) {
    this.modules.set(name, value)
  }

  del(name) {
    this.modules.delete(name)
  }

  delAll() {
    this.modules.clear()
  }

  has(name) {
    return this.modules.has(name)
  }

  getAll() {
    let modules = {}
    modules[this.mod] = {}
    for (let [key, value] of this.modules) {
      modules[this.mod][key] = value
    }
    return modules
  }

  sync() {

  }

}