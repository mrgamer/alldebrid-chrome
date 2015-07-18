'use strict';

let path = require('path');

let // gulp deps
  gulp = require('gulp'),
  less = require('gulp-less'),
  tmpl = require('gulp-angular-templatecache');

let // external deps
  del = require('del');

let tasks = require('./tasks');

const destDir = 'build';
const staticList = [
  'index.html'
];

function buildLess (done) {
  return gulp.src('css/*.less').pipe(less({
    paths: [
      path.join(__dirname, 'node_modules')
    ]
  })).pipe(gulp.dest(destDir));
}

gulp.task('copy-libs', tasks.copyLibs(destDir));

gulp.task('copy-static', function () {
  return gulp.src(staticList).pipe(gulp.dest(destDir));
});

gulp.task('copy-fonts', function () {
  return gulp.src([
    'node_modules/bootstrap/fonts/glyphicons-halflings-regular.woff',
    'node_modules/bootstrap/fonts/glyphicons-halflings-regular.woff2',
    'node_modules/bootstrap/fonts/glyphicons-halflings-regular.ttf'
  ]).pipe(gulp.dest(path.join(destDir, 'fonts')));
});

gulp.task('templates', function () {
  return gulp.src('src/**/*.tpl.html')
    .pipe(tmpl({
      standalone: true
    }))
    .pipe(gulp.dest(destDir));
});

gulp.task('watch', function (done) {
  gulp.watch(staticList, gulp.series('copy-static'));
  gulp.watch('src/**/*.tpl.html', gulp.series('templates'));
  done();
});

gulp.task('code-build', tasks.browserify.build(destDir));
gulp.task('code-watch', tasks.browserify.watch(destDir));
gulp.task('clean', del.bind(null, destDir));
gulp.task('less', buildLess);

// build only task
gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('copy-static', 'copy-fonts', 'copy-libs', 'less', 'templates', 'code-build')
));

// watch
gulp.task('default', gulp.series(
  'clean',
  gulp.parallel('copy-static', 'copy-fonts', 'copy-libs', 'less', 'templates', 'code-watch'),
  'watch')
);
