/* jshint undef: true, unused: true, node: true */

"use strict";

/*
 * Requires
 */

var fs  = require('fs'); // for writing files
var del = require('del'); // for deleting files

// gulp
var gulp = require("gulp");

var connect = require("gulp-connect");  // nice little webserver for testing
var notify  = require("gulp-notify");   // OS notifications
var coffee  = require("gulp-coffee");   // For coffeescript compilation
var uglify  = require("gulp-uglify");   // For minification of Javascript
var concat  = require("gulp-concat");   // Concating files
var flatten = require("gulp-flatten");  // For removing directory strcuture
var cache   = require("gulp-cached");   // For speedy redos

var sourcemaps = require('gulp-sourcemaps'); // for debugging

var less = require('gulp-less'); // for compiling less files

var git = require('gulp-git'); // for versioning



/*
 * configuration
 */

// (more at EOF)
var conf = {
  coffeeGlob : "./src/js/**/*.coffee",
  localeGlob : "./src/locales/*.coffee",
  jsGlob     : "./tmp/js/*.js",
  tmpMinDir  : "./tmp/min",
  tmpJsDir   : "./tmp/js",
  srcDir     : "./src/js",
  appFile    : "app.js",
  libFile    : "lib.js",
  libGlob    : "./src/js/lib/**/*.js",
  lessFile   : "./src/css/tangerine.less",
  cssDir     : "./src/css"
};

// Helper function helps display logs
var log = function(err) {

  if (typeof err.location === "undefined" || typeof err.location.first_line === "undefined") {
    return console.log(err);
  }

  var line_number = err.location.first_line;
  var line        = err.code.split("\n")[err.location.first_line];

  var message = "" +
    err.name     + ": " + err.message + "\n" +
    err.filename + ": " + line_number + "\n" +
    line;

  notify(message);
  console.log(message);
};


/*
 * Tasks
 */


// Handle less files
gulp.task('build:less', function () {
  return gulp.src(conf.lessFile)
    .pipe(less())                      // compile less
    .pipe(gulp.dest(conf.cssDir))      // output directory
    .pipe(connect.reload());           // reload anyone watching

});




// start the webserver
gulp.task("webserver", function() {
  connect.server({
    livereload: true, // sets up socket based reloading
    root: "www"       // host from this dir
  });
});

// compile coffeescript into js files
gulp.task("build:js",["version"], function() {

  var c = coffee({bare: true}); // get a coffeescript stream
  c.on("error", function(err) { // on error
    log(err);                   // log
    c.end();                    // end stream so we don't freeze the program
  });


  return gulp.src(conf.coffeeGlob)
    .pipe(cache("coffee"))        // cache files
    .pipe(sourcemaps.init())      // start making maps
    .pipe(c)                      // compile
    .pipe(sourcemaps.write())     // append the maps to the file
    .pipe(flatten())              // flatten nested subdirectories
    .pipe(gulp.dest(conf.tmpJsDir)); // put result in this location


});


// Minify Javascript
gulp.task("minify:js", ["build:js"], function() {

  return gulp.src(conf.jsGlob)
    .pipe(sourcemaps.init({loadMaps: true})) // pass along old sourcemaps
      .pipe(cache("min"))                    // cache files
      .pipe(uglify())                        // uglify
    .pipe(sourcemaps.write())                // append sourcemaps
    .pipe(gulp.dest(conf.tmpMinDir));        // output to this directory

});


// Build the main application file
gulp.task("build:app.js", ["minify:js"], function() {

  return gulp.src(conf.minFileOrder)
    .pipe(sourcemaps.init({loadMaps: true})) // pass in old sourcemaps
    .pipe(concat(conf.appFile))              // concat all minified files
    .pipe(sourcemaps.write())                // append sourcemaps
    .pipe(gulp.dest(conf.srcDir))            // put everything here
    .pipe(connect.reload());                 // reload anyone watching

});

// Build the libraries
// just concat all the required library files
gulp.task("build:lib.js", function() {
  return gulp.src(conf.libFiles)
    .pipe(sourcemaps.init())        // start sourcemapping
    .pipe(concat(conf.libFile))     // concat libraries
    .pipe(uglify())                 // make'em small
    .pipe(sourcemaps.write())       // append sourcemaps
    .pipe(gulp.dest(conf.srcDir))   // write to dir
    .pipe(connect.reload());        // reload anyone watching
});

// Start watching for changes
gulp.task("watch", function() {
  gulp.watch(conf.coffeeGlob, ['build:app.js']);  // for our app
  gulp.watch(conf.libGlob,    ['build:lib.js']);  // for libraries/vendor stuff
  gulp.watch(conf.lessFile,   ['build:less']);    // for less
  gulp.watch(conf.localeGlob, ["build:locales"]); // for i18n

});


// Clean old files
gulp.task("clean", function(done){
  del([
    conf.appFile,
    conf.libFile,
    conf.tmpJsDir + "/*.js",
    conf.tmpMinDir + "/*.js"
  ],{force:true}).then(function(){done(null);});

});

// Update version.js
gulp.task('version', function(cb) {
  git.exec({ args: 'describe --tags' }, function(err, version) {
    version = version.replace(/\n/, '');
    git.exec({ args: 'rev-parse --short HEAD' }, function(err, build) {
      build = build.replace(/\n/, '');
      var body = 'window.Tangerine = ' + JSON.stringify({
        buildVersion : build,
        version      : version
      });
      var filename = conf.tmpMinDir + "/version.js";
      fs.writeFile( filename, body,
        function(err) {
          if (err !== null) { console.log(err); }
          cb();
        });
    });
  });

});


// Compile translations
gulp.task("build:locales", function(){


  var c = coffee({bare: true}); // get a coffeescript stream
  c.on("error", function(err) { // on error
    log(err);                   // log
    c.end();                    // end stream so we don't freeze the program
  });



  gulp.src("./src/locales/*.coffee")  // handle translation documents
    .pipe(c)                          // compile coffeescript
    .pipe(uglify())                   // make it small
    .pipe(concat('locales.js'))       // turn it into one file
    .pipe(gulp.dest(conf.tmpMinDir))  // send it here
    .pipe(connect.reload());          // reload anyone watching

});


gulp.task("init", ["clean", "version", "build:locales", "build:app.js", "build:lib.js"]);

gulp.task("default", ["webserver", "init", "watch"]);


conf.fileOrder = [

  'version',

  'helpers',

  'ButtonView',

  'Assessment',
  'Assessments',
  'AssessmentsView',
  'AssessmentListElementView',
  'AssessmentsMenuView',
  'AssessmentRunView',
  'AssessmentSyncView',
  'AssessmentDataEntryView',


  'Subtest',
  'Subtests',
  'SubtestRunView',

  'ConsentRunView',

  'DatetimeRunView',

  'LocationRunView',

  'SurveyRunView',

  'IdRunView',

  'GridRunView',

  'ObservationRunView',

  'GpsRunView',

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

  'Config',

  'Log',

  'Settings',
  'SettingsView',

  'ViewManager',

  'NavigationView',

  'router',

  'configuration',

  'locales',

  'boot',

];

conf.minFileOrder = conf.fileOrder.map(function(el) {
  return conf.tmpMinDir + "/" + el + ".js";
});

conf.libFiles = [
  './src/js/lib/phonegap.js',
  './src/js/lib/modernizr.js',
  './src/js/lib/jquery.js',
  './src/js/lib/underscore.js',
  './src/js/lib/sha1.js',
  './src/js/lib/jquery.couch.js',
  './src/js/lib/js-cookie.js',
  './src/js/lib/jquery.tablesorter.js',
  './src/js/lib/jquery.flot.js',
  './src/js/lib/jquery.i18next.js',
  './src/js/lib/excanvas.js',
  './src/js/lib/jquery.ui.core.js',
  './src/js/lib/jquery.ui.widget.js',
  './src/js/lib/jquery.ui.position.js',
  './src/js/lib/jquery.ui.menu.js',
  './src/js/lib/jquery.ui.autocomplete.js',
  './src/js/lib/jquery.ui.mouse.js',
  './src/js/lib/jquery.ui.sortable.js',
  './src/js/lib/jquery.ui.accordion.js',
  './src/js/lib/jquery.ui.button.js',
  './src/js/lib/jquery.ui.progressbar.js',
  './src/js/lib/inflection.js',
  './src/js/lib/backbone.js',
  './src/js/lib/moment.js',
  './src/js/lib/pouchdb.js',
  './src/js/lib/backbone-pouchdb.js',
  './src/js/lib/transcriptionCheckdigit.js',
  './src/js/lib/table2CSV.js',
  './src/js/lib/base64.js',
  './src/js/lib/jstz.js',
  './src/js/lib/lz-string.js',
  './src/js/lib/ckeditor.js',
  './src/js/lib/coffee-script.js' // This file tends to like to be last
];