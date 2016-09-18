'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();
var cp = require('child_process');
var config = require('./gulp/config');

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src([
      config.resource_dir + '/**/*.js',
      '!' + config.resource_dir + '/common/js/vendor/*'
    ])
    .pipe($.jshint())
    .pipe($.jscs())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

gulp.task('scripts', ['jshint'], function () {
  return gulp.src([
      config.resource_dir + '/**/*.js'
    ])
    .pipe(gulp.dest(config.dest_dir))
    .pipe($.size({title: 'scripts'}))
    .pipe($.if(config.dev, browserSync.stream()));
});

// Optimize Images
gulp.task('imagemin', function () {
  return gulp.src([config.resource_dir + '/**/*.{jpg,png,gif}'])
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(config.dest_dir))
    .pipe($.size({title: 'images'}));
});

gulp.task('copy:gif', function() {
  return gulp.src([
      config.resource_dir + '/common/images/*.gif'
    ])
    .pipe(gulp.dest(config.dest_dir + '/common/images'))
    .pipe($.if(config.dev, browserSync.stream()));
});

gulp.task('images', ['copy:gif', 'imagemin']);


gulp.task('styles:main', function () {
  return gulp.src([
      config.resource_dir + '/**/*.scss'
    ])
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.autoprefixer({'browsers': config.autoprefixer_browsers}))
    .pipe($.if('*.css', $.csscomb()))
    .pipe(gulp.dest(config.dest_dir))
    .pipe($.size({title: 'css'}))
    .pipe($.if(config.dev, browserSync.stream()));
});

gulp.task('styles', ['styles:main']);


gulp.task('metalsmith-build', function (done) {
  return cp.spawn('npm', ['run','metalsmith'], {stdio: 'inherit'})
    .on('close', done);
});

gulp.task('html', ['metalsmith-build'], function () {
  return gulp.src([config.tmp + '/**/*.html'])
    .pipe(gulp.dest(config.open_dir))
    .pipe($.size({title: 'html'}))
    .pipe($.if(config.dev, browserSync.stream()));
});

gulp.task('clean', function (cb) {
  del([config.tmp], {
    dots: true,
    force: true
  }).then(function() {
    return $.cache.clearAll(cb);
  });
});

gulp.task('server', ['scripts', 'html', 'images', 'styles'], function () {
  browserSync.init({
    notify: false,
    open: "external",
    host: "127.0.0.1",
    startPath: "",
    server: {
      baseDir: config.open_dir
    }
  });

  gulp.watch([
    config.resource_dir + '/**/*.html',
    '!' + config.resource_dir + '/common/js/**/*'
  ], ['html']);
  gulp.watch([config.resource_dir + '/**/*.{scss,css}'], ['styles:main']);
  gulp.watch([config.resource_dir + '/**/*.js'], ['scripts']);
  gulp.watch([config.resource_dir + '/**/*.{jpg,png}'], ['imagemin', browserSync.reload]);
  gulp.watch([config.resource_dir + '/**/*.gif'], ['copy:gif', browserSync.reload]);
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
  config.dev = false;
  runSequence('styles',  ['scripts', 'html', 'images', 'styles:main', 'copy:gif'], cb);
});
