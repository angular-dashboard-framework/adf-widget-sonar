'use strict';

const gulp = require('gulp');
const connect = require('gulp-connect');
const wiredep = require('wiredep').stream;
const $ = require('gulp-load-plugins')();
const del = require('del');
const jsReporter = require('jshint-stylish');
const annotateAdfPlugin = require('ng-annotate-adf-plugin');
const pkg = require('./package.json');

var annotateOptions = {
  plugin: [
    annotateAdfPlugin
  ]
};

const templateOptions = {
  root: '{widgetsPath}/sonar/src',
  module: 'adf.widget.sonar'
};

/** lint **/

gulp.task('csslint', (done) => {
  gulp.src('src/**/*.css')
    .pipe($.csslint())
    .pipe($.csslint.reporter());
  done();
});

gulp.task('jslint', (done) => {
  gulp.src('src/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter(jsReporter));
  done();
});

gulp.task('lint', gulp.series('csslint', 'jslint'));

/** serve **/

gulp.task('templates', () => {
  return gulp.src('src/**/*.html')
    .pipe($.angularTemplatecache('templates.tpl.js', templateOptions))
    .pipe(gulp.dest('.tmp/dist'));
});

gulp.task('sample', gulp.series('templates', function (done) {
  const files = gulp.src(['src/**/*.js', 'src/**/*.css', 'src/**/*.less', '.tmp/dist/*.js'])
    .pipe($.if('*.js', $.angularFilesort()));

  gulp.src('sample/index.html')
    .pipe(wiredep({
      directory: './components/',
      bowerJson: require('./bower.json'),
      devDependencies: true,
      dependencies: true
    }))
    .pipe($.inject(files))
    .pipe(gulp.dest('.tmp/dist'));
  //.pipe(connect.reload());
  done();
}));

gulp.task('watch', (done) => {
  gulp.watch(['src/**'], gulp.series('sample'));
  done();
});

gulp.task('serve', gulp.series('sample', 'watch', function () {
  connect.server({
    root: ['.tmp/dist', '.'],
    livereload: true,
    port: 9002
  });
}));

/** build **/

gulp.task('css', function () {
  return gulp.src(['src/**/*.css', 'src/**/*.less'])
    .pipe($.if('*.less', $.less()))
    .pipe($.concat(pkg.name + '.css'))
    .pipe(gulp.dest('dist'))
    .pipe($.rename(pkg.name + '.min.css'))
    .pipe($.minifyCss())
    .pipe(gulp.dest('dist'));
});

gulp.task('js', function () {
  return gulp.src(['src/**/*.js', 'src/**/*.html'])
    .pipe($.if('*.html', $.minifyHtml()))
    .pipe($.if('*.html', $.angularTemplatecache(pkg.name + '.tpl.js', templateOptions)))
    .pipe($.angularFilesort())
    .pipe($.if('*.js', $.replace(/'use strict';/g, '')))
    .pipe($.concat(pkg.name + '.js'))
    .pipe($.headerfooter('(function(window, undefined) {\'use strict\';\n', '})(window);'))
    .pipe($.ngAnnotate(annotateOptions))
    .pipe(gulp.dest('dist'))
    .pipe($.rename(pkg.name + '.min.js'))
    .pipe($.uglify())
    .pipe(gulp.dest('dist'));
});

/** clean **/

gulp.task('clean', function (cb) {
  del(['dist', '.tmp'], cb);
});

gulp.task('default', gulp.series('css', 'js'));
