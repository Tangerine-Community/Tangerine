var gulp = require('gulp')
var babel = require('gulp-babel')

// gulp.task("default", function () {
//   return watch('src/polydemo-app.js', { ignoreInitial: false })
//     // .pipe(babel())
//     // .pipe(gulp.dest('build'));
//   // gulp.start('build');
//     .pipe(gulp.start('build'))
// });

// gulp.task('init', function () {
//   process.stdout.write("hi:" + process.cwd() + " __dirname:" + __dirname)
//   // gulp.src(__dirname + '/bower.json')
//   // gulp.src('src/**/*', {base:"."})
//   //   .pipe(gulp.dest('../tangy-forms-build/'))
// })

gulp.task('init', function () {
  gulp.src('../tangy-forms/**/*')
    .pipe(gulp.dest('../tangy-forms-build/'))
})

gulp.task('build', function () {
  return gulp.src(['../tangy-forms/src/tangy-form/tangy-form.js', '../tangy-forms/src/tangy-form/tangy-form-item.js', '../tangy-forms/src/tangy-form/tangy-form-service.js'])
    .pipe(babel())
    .pipe(gulp.dest('../tangy-forms-build/src/tangy-form/'))
})

gulp.task('build2', function () {
  return gulp.src(['../tangy-forms/src/tangy-input/tangy-input.js'])
    .pipe(babel())
    .pipe(gulp.dest('../tangy-forms-build/src/tangy-input/'))
})

gulp.task('build3', function () {
  return gulp.src(['../tangy-forms/src/tangy-checkbox/tangy-checkbox.js'])
    .pipe(babel())
    .pipe(gulp.dest('../tangy-forms-build/src/tangy-checkbox/'))
})

gulp.task('build4', function () {
  return gulp.src(['../tangy-forms/src/tangy-foo/tangy-foo.js'])
    .pipe(babel())
    .pipe(gulp.dest('../tangy-forms-build/src/tangy-foo/'))
})

gulp.task('default', ['build', 'build2', 'build3', 'build4'], function () {
  gulp.watch(['../tangy-forms/src/tangy-form/tangy-form.js', '../tangy-forms/src/tangy-form/tangy-form-item.js', '../tangy-forms/src/tangy-input/tangy-input.js', '../tangy-forms/src/tangy-input/tangy-input.js', '../tangy-forms/src/tangy-form/tangy-form-service.js', '../tangy-forms/src/tangy-checkbox/tangy-checkbox.js', '../tangy-forms/src/tangy-foo/tangy-foo.js'], ['build', 'build2', 'build3', 'build4'])
  gulp.watch(['.babelrc'], ['build'])
})
