/* jshint undef: true, unused: true, node: true, quotmark: single */

'use strict';

/*
 * Requires
 */

var fs  = require('fs'); // for writing files
var del = require('del'); // for deleting files

// gulp
var gulp = require('gulp');

var notify  = require('gulp-notify');   // OS notifications
var coffee  = require('gulp-coffee');   // For coffeescript compilation
var uglify  = require('gulp-uglify');   // For minification of Javascript
var concat  = require('gulp-concat');   // Concating files
var flatten = require('gulp-flatten');  // For removing directory strcuture
var cache   = require('gulp-cached');   // For speedy redos

var sourcemaps = require('gulp-sourcemaps'); // for debugging

var less = require('gulp-less'); // for compiling less files

var git = require('gulp-git'); // for versioning


/*
 * configuration
 */

// (more at EOF)
var conf = {
  coffeeGlob     : './app/_attachments/js/modules/**/*.coffee',
  localeGlob     : './app/_attachments/locales/*.coffee',
  jsGlob         : './tmp/js/*.js',
  tmpMinDir      : './tmp/min',
  tmpJsDir       : './tmp/js',
  srcDir         : './app/_attachments/js',
  appFile        : 'app.js',
  libFile        : 'lib.js',
  libGlob        : './app/_attachments/js/lib/**/*.js',
  lessFile       : './app/_attachments/css/tangerine.less',
  cssDir         : './app/_attachments/css',
  viewGlob       : './app/views/**/*.coffee'
};

// Helper function helps display logs
function log(err) {

  if (typeof err.location === 'undefined' || typeof err.location.first_line === 'undefined') {
    return console.log(err);
  }

  var line_number = err.location.first_line;
  var line        = err.code.split('\n')[err.location.first_line];

  var message = '' +
    err.name     + ': ' + err.message + '\n' +
    err.filename + ': ' + line_number + '\n' +
    line;

  notify(message);
  console.log(message);

}

/*
 * Tasks
 */

// compile coffeescript into js files
gulp.task('build:js', ['version'], function() {

  var c = coffee({bare: true}); // get a coffeescript stream
  c.on('error', function(err) { // on error
    log(err);                   // log
    c.end();                    // end stream so we don't freeze the program
  });

  return gulp.src(conf.coffeeGlob)
    .pipe(cache('coffee'))        // cache files
    .pipe(sourcemaps.init())      // start making maps
    .pipe(c)                      // compile
    .pipe(sourcemaps.write())     // append the maps to the file
    .pipe(flatten())              // flatten nested subdirectories
    .pipe(gulp.dest(conf.tmpJsDir)); // put result in this location

});


// Minify Javascript
gulp.task('minify:js', ['build:js', 'version'], function() {

  return gulp.src(conf.jsGlob)
    .pipe(sourcemaps.init({loadMaps: true})) // pass along old sourcemaps
      .pipe(cache('min'))                    // cache files
      .pipe(uglify())                        // uglify
    .pipe(sourcemaps.write())                // append sourcemaps
    .pipe(gulp.dest(conf.tmpMinDir));        // output to this directory

});


// Build the main application file
gulp.task('build:app.js', ['minify:js'], function() {

  return gulp.src(conf.minFileOrder)
    .pipe(sourcemaps.init({loadMaps: true})) // pass in old sourcemaps
    .pipe(concat(conf.appFile))              // concat all minified files
    .pipe(sourcemaps.write())                // append sourcemaps
    .pipe(gulp.dest(conf.srcDir))           // put everything here
      .on('end', function() {
        push();
      });

});



function push() {
  require('child_process').exec('cd app && couchapp push',
    function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    }
  );
}

// Build the libraries
// just concat all the required library files
gulp.task('build:lib.js', function() {
  return gulp.src(conf.libFiles)
    .pipe(sourcemaps.init())        // start sourcemapping
    .pipe(concat(conf.libFile))     // concat libraries
    //.pipe(uglify())                 // make'em small
    .pipe(sourcemaps.write())       // append sourcemaps
    .pipe(gulp.dest(conf.srcDir))   // write to dir
      .on('end', function() {
        push();
      });
});


// Build views
gulp.task('build:views', function() {
  return gulp.src(conf.viewGlob, {base:'./'})
    .pipe(cache('views')) // cache files
    .pipe(coffee({bare: true}))       // transpile coffee
    .pipe(gulp.dest('./'))
      .on('end', function() {
        push();
      });

});

// Update version.js
gulp.task('version', function(cb) {
  git.exec({ args: 'describe --tags' }, function(err, version) {
    version = version.replace(/\n/, '');
    git.exec({ args: 'rev-parse --short HEAD' }, function(err, build) {
      build = build.replace(/\n/, '');
      var body = '' +
        'Tangerine.version = ' + JSON.stringify(version) + ';' +
        'Tangerine.build = ' + JSON.stringify(build) + ';';
      var filename = conf.tmpMinDir + '/version.js';
      fs.writeFile( filename, body,
        function(err) {
          if (err !== null) { console.log(err); }
          cb();
        });
    });
  });

});


// Handle less files
gulp.task('build:less', function () {
  return gulp.src(conf.lessFile)
    .pipe(less())                      // compile less
    .pipe(gulp.dest(conf.cssDir));     // output directory

});


// Compile translations
gulp.task('build:locales', function(){

  var c = coffee({bare: true}); // get a coffeescript stream
  c.on('error', function(err) { // on error
    log(err);                   // log
    c.end();                    // end stream so we don't freeze the program
  });

  gulp.src(conf.localeGlob)  // handle translation documents
    .pipe(c)                          // compile coffeescript
    .pipe(uglify())                   // make it small
    .pipe(concat('locales.js'))       // turn it into one file
    .pipe(gulp.dest(conf.tmpMinDir)); // send it here

});


/*
 * Basic helper tasks
 */

// Start watching for changes
gulp.task('watch', function() {
  gulp.watch(conf.coffeeGlob,   ['build:app.js']);    // for our app
  gulp.watch(conf.libGlob,      ['build:lib.js']);    // for libraries/vendor stuff
  gulp.watch(conf.lessFile,     ['build:less']);      // for less
  gulp.watch(conf.localeGlob,   ['build:locales']);   // for i18n
  gulp.watch(conf.viewGlob,     ['build:views']);     // for our CouchDB views

});


// Clean old files
gulp.task('clean', function(done){
  del([
    conf.appFile,
    conf.libFile,
    conf.tmpJsDir + '/*.js',
    conf.tmpMinDir + '/*.js'
  ],{force:true}).then(function(){done(null);});

});



gulp.task('init', ['clean', 'version', 'build:locales', 'build:views', 'build:app.js', 'build:lib.js']);

gulp.task('default', ['init', 'watch']);


conf.fileOrder = [

  'globals',

  'version',

  'helpers',

  'ButtonView',

  'Assessment',
  'Assessments',
  'AssessmentsView',
  'AssessmentListElementView',
  'AssessmentsMenuView',
  'AssessmentEditView',
  'AssessmentRunView',
  'AssessmentImportView',
  'AssessmentSyncView',
  'AssessmentDataEntryView',


  'Subtest',
  'Subtests',
  'SubtestListEditView',
  'SubtestListElementView',
  'SubtestEditView',
  'SubtestRunView',

  'ConsentRunView',
  'ConsentEditView',

  'DatetimeRunView',
  'DatetimeEditView',

  'LocationRunView',
  'LocationEditView',

  'SurveyRunView',
  'SurveyEditView',

  'IdRunView',
  'IdEditView',

  'GridRunView',
  'GridEditView',

  'ObservationRunView',
  'ObservationEditView',

  'GpsRunView',
  'GpsEditView',
  'GpsPrintView',

  'Result',
  'Results',
  'ResultView',
  'ResultsView',
  'TabletManagerView',
  'ResultSumView',
  'DashboardView',

  'AdminView',

  'Question',
  'Questions',
  'QuestionRunView',
  'QuestionEditView',
  'QuestionsEditView',
  'QuestionsEditListElementView',

  'Klass',
  'KlassView',
  'KlassEditView',
  'Klasses',
  'KlassesView',
  'KlassListElementView',
  'KlassSubtestRunView',
  'KlassSubtestResultView',
  'KlassMenuView',
  'KlassPartlyView',
  'KlassResult',
  'KlassResults',

  'KlassSubtestEditView',

  'KlassGroupingView',
  'KlassGroupingMenuView',
  'MasteryCheckView',
  'MasteryCheckMenuView',
  'ProgressView',
  'ProgressMenuView',
  'CsvMenuView',

  'Curriculum',
  'CurriculumView',
  'Curricula',
  'CurriculaView',
  'CurriculaListView',
  'CurriculumListElementView',
  'CurriculaView',

  'Teacher',
  'Teachers',
  'TeachersView',
  'RegisterTeacherView',

  'Student',
  'Students',
  'StudentListElementView',
  'StudentEditView',

  'User',
  'Users',
  'TabletUser',
  'TabletUsers',

  'LoginView',
  'AccountView',
  'GroupsView',
  'UsersMenuView',

  'AssessmentPrintView',
  'QuestionPrintView',
  'GridPrintView',
  'ConsentPrintView',
  'DatetimePrintView',
  'IdPrintView',
  'LocationPrintView',
  'SurveyPrintView',
  'ObservationPrintView',
  'SubtestPrintView',

  'Config',

  'Log',

  'Template',
  'Settings',
  'SettingsView',

  'ViewManager',

  'NavigationView',

  'router',

  'locales',

  'boot',

];

conf.minFileOrder = conf.fileOrder.map(function(el) {
  return conf.tmpMinDir + '/' + el + '.js';
});

conf.libFiles = [
  './app/_attachments/js/lib/modernizr.js',
  './app/_attachments/js/lib/jquery.js',
  './app/_attachments/js/lib/underscore.js',
  './app/_attachments/js/lib/sha1.js',
  './app/_attachments/js/lib/i18next.js',
  './app/_attachments/js/lib/jquery.couch.js',
  './app/_attachments/js/lib/jquery.cookie.js',
  './app/_attachments/js/lib/jquery.tablesorter.js',
  './app/_attachments/js/lib/jquery.flot.js',
  './app/_attachments/js/lib/excanvas.js',
  './app/_attachments/js/lib/jquery.ui.core.js',
  './app/_attachments/js/lib/jquery.ui.widget.js',
  './app/_attachments/js/lib/jquery.ui.position.js',
  './app/_attachments/js/lib/jquery.ui.menu.js',
  './app/_attachments/js/lib/jquery.ui.autocomplete.js',
  './app/_attachments/js/lib/jquery.ui.mouse.js',
  './app/_attachments/js/lib/jquery.ui.sortable.js',
  './app/_attachments/js/lib/jquery.ui.accordion.js',
  './app/_attachments/js/lib/jquery.ui.button.js',
  './app/_attachments/js/lib/jquery.ui.progressbar.js',
  './app/_attachments/js/lib/inflection.js',
  './app/_attachments/js/lib/backbone.js',
  './app/_attachments/js/lib/moment.js',
  './app/_attachments/js/lib/backbone-couchdb.js',
  './app/_attachments/js/lib/transcriptionCheckdigit.js',
  './app/_attachments/js/lib/base64.js',
  './app/_attachments/js/lib/jstz.js',
  './app/_attachments/js/lib/ckeditor.js',
  './app/_attachments/js/lib/coffee-script.js' // This file tends to like to be last
];
