const gulp = require('gulp')
const webpack = require('webpack')
const logger = require('gulp-logger')

const isProduction = ctx.taskParams && ctx.taskParams[0] === 'p'
  ? true
  : false // fbi build -p

ctx.isProduction = isProduction

// scripts
const webpackConfig = require('./webpack.config.js')(require, ctx)
const env = isProduction ? 'production' : 'development'
webpack(webpackConfig, (err, stats) => {
  if (err) {
    console.log(err, 0)
  }

  console.log(`
${stats.toString({
      chunks: false,
      colors: true
    })}
    `)
})

// images
const gulpIf = require('gulp-if')
const imagemin = require('gulp-imagemin')
const imageminPngquant = require('imagemin-pngquant')

gulp.src('src/image/**/*.{jpg,png,gif,svg}')
  .pipe(gulpIf(isProduction, imagemin({
    progressive: true,
    svgoPlugins: [{
      removeViewBox: false
    }],
    use: [imageminPngquant()]
  })))
  .pipe(logger({
    before: 'Handling images...',
    after: 'images complete!',
    showChange: true
  }))
  .pipe(gulp.dest('dst/img'))

// styles
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('gulp-autoprefixer')

gulp.src('src/style/**/*.{sass,scss,css}')
  .pipe(logger({
    before: 'Handling styles...',
    after: 'Styles complete!',
    showChange: true
  }))
  // .pipe(gulpReplace(config.vars_reg, varHelper.newString))
  .pipe(gulpIf(!isProduction, sourcemaps.init()))
  .pipe(sass({
    outputStyle: isProduction ? 'compressed' : 'expanded', // nested, expanded, compact, compressed
    imagePath: 'img'
  }))

  .pipe(autoprefixer(ctx.options.autoprefixer))
  .pipe(gulpIf(!isProduction, sourcemaps.write()))
  .pipe(gulp.dest('dst/css'))

// templates
const prettify = require('gulp-prettify')
const compileHandlebars = require('gulp-compile-handlebars')
const handlebarsConfig = require('./handlebars.config.js')(require, ctx)

gulp.src('src/template/**/*.html')
  .pipe(logger({
    before: 'Handling templates...',
    after: 'templates complete!',
    showChange: true
  }))
  .pipe(compileHandlebars(handlebarsConfig.data, handlebarsConfig))
  .pipe(prettify({
    indent_size: 2
  }))
  .pipe(gulp.dest('dst/html'))


// copy extra
gulp.src('src/extra/**')
  .pipe(logger({
    before: 'Handling extras...',
    after: 'extras complete!',
    showChange: true
  }))
  .pipe(gulp.dest('dst'))
