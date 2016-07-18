class Foo {
  static classMethod () {
    return 'hello'
  }
}

class Bar extends Foo {
  static classMethod () {
    return super.classMethod() + ', too'
  }
}
console.log(Bar.classMethod())
