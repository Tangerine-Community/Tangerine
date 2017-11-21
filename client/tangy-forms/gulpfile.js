var gulp = require('gulp');
var babel = require("gulp-babel");

// gulp.task("default", function () {
//   return watch('src/polydemo-app.js', { ignoreInitial: false })
//     // .pipe(babel())
//     // .pipe(gulp.dest('build'));
//   // gulp.start('build');
//     .pipe(gulp.start('build'))
// });

gulp.task("init", function () {
  gulp.src('../tangy-forms/**/*')
    .pipe(gulp.dest('../tangy-forms-build/'));
})

gulp.task("build", function () {
  return gulp.src(['../tangy-forms/src/tangy-form/tangy-form.js', '../tangy-forms/src/tangy-form/tangy-form-item.js'])
    .pipe(babel())
    .pipe(gulp.dest('../tangy-forms-build/src/tangy-form/'));
});

gulp.task("build2", function () {
  return gulp.src(['../tangy-forms/src/tangy-input/tangy-input.js'])
    .pipe(babel())
    .pipe(gulp.dest('../tangy-forms-build/src/tangy-input/'));
});

gulp.task('default', ['init', 'build', 'build2'], function() {
  gulp.watch(['../tangy-forms/src/tangy-form/tangy-form.js', '../tangy-forms/src/tangy-input/tangy-input.js','../tangy-forms/src/tangy-input/tangy-input.js'], ['build']);
  gulp.watch(['.babelrc'], ['build']);
});