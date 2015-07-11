var browserify = require('browserify');
var reactify = require('reactify');
var browserSync = require('browser-sync').create();

var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    source = require('vinyl-source-stream'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    streamify = require('gulp-streamify'),
    del = require('del'),
    react = require('gulp-react');

gulp.task('css', function() {
  return sass('src/css/', { style: 'expanded' })
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('public/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('public/css'))
    .pipe(notify({ message: 'Sass task complete' }));
});

gulp.task('js', ['js-hint'], function() {
  var b = browserify();
  b.transform(reactify);
  b.add('src/js/main.js')
  return b.bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('public/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('public/js'))
    .pipe(notify({ message: 'JavaScript task complete', onLast: true }));
});

gulp.task('js-hint', function() {
  return gulp.src('src/**/*.js')
    .pipe(react())
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'));
});

gulp.task('img', function() {
  return gulp.src('src/img/**/*')
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('public/img'))
    .pipe(notify({ message: 'Images task complete', onLast: true }));
});

gulp.task('csv', function() {
  return gulp.src('src/csv/**/*')
    .pipe(gulp.dest('public/csv'))
    .pipe(notify({ message: 'CSV task complete', onLast: true }));
});

gulp.task('thirdparty-img', function() {
  return gulp.src('thirdparty/**/*')
    .pipe(gulp.dest('public/img/thirdparty'))
    .pipe(notify({ message: 'Test images task complete', onLast: true }));
});

gulp.task('html', function() {
  return gulp.src('src/*.html')
    .pipe(gulp.dest('public'))
    .pipe(notify({ message: 'HTML task complete', onLast: true }));
});

gulp.task('clean', function(cb) {
    del(['public/css', 'public/js', 'public/img', 'public'], cb)
});

gulp.task('default', ['clean'], function() {
    gulp.start('css', 'js', 'img', 'csv', 'thirdparty-img', 'html');
});

gulp.task('build', ['clean'], function() {
    gulp.start('css', 'js', 'img', 'csv', 'html');
});

gulp.task('watch', function() {

  // Watch .html files
  gulp.watch('src/*.html', ['html']);

  // Watch .scss files
  gulp.watch('src/css/**/*.scss', ['css']);

  // Watch .js files
  gulp.watch('src/js/**/*.js', ['js']);
  gulp.watch('lib/**/*.js', ['js']);

  // Watch image files
  gulp.watch('src/img/**/*', ['img']);
  gulp.watch('thirdparty/**/*', ['thirdparty-img']);

  // Watch .csv files
  gulp.watch('src/csv/**/*', ['csv']);

  // Create browserSync server
  browserSync.init({
    server: {
      baseDir: "./public/"
    }
  });

  // Watch any files in public/, reload on change
  gulp.watch(['public/**']).on('change', browserSync.reload);
});
