'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var plumber = require('gulp-plumber');
var jscs = require('gulp-jscs');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');
var bump = require('gulp-bump');
var util = require('gulp-util');

var paths = {
  lint: ['./gulpfile.js', './lib/**/*.js', './template/**/*.js'],
  watch: ['./gulpfile.js', './lib/**'],
  // tests: ['./test/**/*.js', '!test/{temp,temp/**}'],
  source: ['./lib/*.js']
};

var plumberConf = {};

if (process.env.CI) {
  plumberConf.errorHandler = function(err) {
    throw err;
  };
}

// code check
gulp.task('lint', function() {
  return gulp.src(paths.lint)
    .pipe(jshint('.jshintrc'))
    .pipe(plumber(plumberConf))
    .pipe(jscs())
    .pipe(jshint.reporter('jshint-stylish'));
});

// test
gulp.task('istanbul', function(cb) {
  gulp.src(paths.source)
    .pipe(istanbul()) // Covering files
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on('finish', function() {
      gulp.src(paths.tests)
        .pipe(plumber(plumberConf))
        .pipe(mocha())
        .pipe(istanbul.writeReports()) // Creating the reports after tests runned
        .on('finish', function() {
          process.chdir(__dirname);
          cb();
        });
    });
});

// fbi npm version change
gulp.task('bump', ['test'], function() {
  var bumpType = util.env.type || 'patch'; // major.minor.patch

  return gulp.src(['./package.json'])
    .pipe(bump({
      type: bumpType
    }))
    .pipe(gulp.dest('./'));
});

// fbi-mission npm version change
gulp.task('bump-mission', ['test'], function() {
  var bumpType = util.env.type || 'patch'; // major.minor.patch

  return gulp.src(['./mission/package.json'])
    .pipe(bump({
      type: bumpType
    }))
    .pipe(gulp.dest('./mission/'));
});

// fbi-template npm version change
gulp.task('bump-template', ['test'], function() {
  var bumpType = util.env.type || 'patch'; // major.minor.patch

  return gulp.src(['./template/**/package.json'])
    .pipe(bump({
      type: bumpType
    }))
    .pipe(gulp.dest('./template/'));
});

// watch
gulp.task('watch', ['test'], function() {
  gulp.watch(paths.watch, ['test']);
});

gulp.task('test', ['lint', 'istanbul']);

gulp.task('release', ['bump']);

gulp.task('default', ['test']);

gulp.task('bump-all', ['bump', 'bump-mission', 'bump-template']);
