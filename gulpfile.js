var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
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

gulp.task('js', function() {
  return gulp.src('src/js/**/*.js')
    .pipe(react())
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('public/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('public/js'))
    .pipe(notify({ message: 'JavaScript task complete' }));
});

gulp.task('lib', function() {
  return gulp.src('lib/**/*.js')
    .pipe(gulp.dest('public/js/lib'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('public/js/lib'))
    .pipe(notify({ message: 'JavaScript libraries task complete' }));
});


gulp.task('img', function() {
  return gulp.src('src/img/**/*')
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('public/img'))
    .pipe(notify({ message: 'Images task complete' }));
});

gulp.task('csv', function() {
  return gulp.src('src/csv/**/*')
    .pipe(gulp.dest('public/csv'))
    .pipe(notify({ message: 'CSV task complete' }));
});

gulp.task('tmp-img', function() {
  return gulp.src('tmp/**/*')
    .pipe(gulp.dest('public/img/tmp'))
    .pipe(notify({ message: 'Test images task complete' }));
});

gulp.task('html', function() {
  return gulp.src('src/*.html')
    .pipe(gulp.dest('public'))
    .pipe(notify({ message: 'HTML task complete' }));
});

gulp.task('clean', function(cb) {
    del(['public/css', 'public/js', 'public/img', 'public'], cb)
});

gulp.task('default', ['clean'], function() {
    gulp.start('css', 'js', 'img', 'csv', 'tmp-img', 'html', 'lib');
});

gulp.task('build', ['clean'], function() {
    gulp.start('css', 'js', 'img', 'csv', 'html', 'lib');
});

gulp.task('watch', function() {

  // Watch .html files
  gulp.watch('src/*.html', ['html']);

  // Watch .scss files
  gulp.watch('src/css/**/*.scss', ['css']);

  // Watch .js files
  gulp.watch('src/js/**/*.js', ['js']);
  gulp.watch('lib/**/*.js', ['lib']);

  // Watch image files
  gulp.watch('src/img/**/*', ['img']);
  gulp.watch('tmp/**/*', ['tmp-img']);

  // Watch .csv files
  gulp.watch('src/csv/**/*', ['csv']);

  // Create LiveReload server
  livereload.listen();

  // Watch any files in public/, reload on change
  gulp.watch(['public/**']).on('change', livereload.changed);

});
