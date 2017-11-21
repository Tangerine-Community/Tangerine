var gulp = require('gulp');
var babel = require("gulp-babel");


// gulp.task("default", function () {
//   return watch('src/polydemo-app.js', { ignoreInitial: false })
//     // .pipe(babel())
//     // .pipe(gulp.dest('build'));
//   // gulp.start('build');
//     .pipe(gulp.start('build'))
// });


gulp.task("build", function () {
  return gulp.src(['src/tangy-form/tangy-form.js', 'src/tangy-form/tangy-form-item.js', 'src/tangy-input/tangy-input.js'])
    .pipe(babel())
    .pipe(gulp.dest('build'));
});

gulp.task('default', ['build'], function(){
  gulp.watch(['**/*.js','!**/foo.js'], ['build']);
  gulp.watch(['.babelrc'], ['build']);
});