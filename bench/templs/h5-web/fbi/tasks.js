module.exports = {
  build: {
    desc: 'build for me',
    fn: function () {
      // this == fbi
      this.log(this.tasks)
    }
  },
  serve: {
    desc: 'serve file for me',
    fn: function () {
      this.log('')
    }
  }
}
