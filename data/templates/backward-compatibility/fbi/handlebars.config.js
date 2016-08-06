module.exports = (requireReslove, ctx) => {
  return {
    ignorePartials: true,
    batch: [ctx._.cwd('./src/template/partials')],
    helpers: {
      if: function (conditional, options) {
        if (conditional) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      },
      compare: function (v1, v2, options) {
        if (v1 === v2) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      },
      isNotEmpty: function (param, options) {
        if (param && param !== '') {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      }
    },
    data: {
      staticRoot: ctx.isProduction ? '/' : '..'
    }
  }
}