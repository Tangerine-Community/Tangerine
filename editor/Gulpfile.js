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
var inject = require('gulp-inject-string');  // to create index-dev.html
var rename = require('gulp-rename');  // to create index-dev.html

var less = require('gulp-less'); // for compiling less files

var git = require('gulp-git'); // for versioning

// cause i don't like mondays
var wait = require('gulp-wait')
var mapStream = require('map-stream');

/*
 * configuration
 */

// (more at EOF)
var conf = {
    coffeeGlob     : './src/js/modules/**/*.coffee',
    localeGlob     : './src/locales/*.coffee',
    jsGlob         : './tmp/js/*.js',
    tmpMinDir      : './tmp/min',
    tmpJsDir       : './tmp/js',
    srcDir         : './src/js',
    appFile        : 'app.js',
    libFile        : 'lib.js',
    libGlob        : './src/js/lib/**/*.js',
    lessFile       : './src/css/tangerine.less',
    cssDir         : './src/css',
    viewGlob       : './app/views/**/*.coffee',
    compiledDir    : './src/compiled'
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
    .pipe(gulp.dest(conf.tmpJsDir)) // put result in this location
    .pipe(gulp.dest(conf.compiledDir)); // also put result in this location
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
      // console.log('stdout: ' + stdout);
      // console.log('stderr: ' + stderr);
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
      gulp.src([conf.tmpMinDir + '/version.js']).pipe(gulp.dest(conf.compiledDir));
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
    .pipe(gulp.dest(conf.tmpMinDir)) // send it here
    .pipe(gulp.dest(conf.compiledDir)); // also put result in this location

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

gulp.task('prepare-index-dev', function () {

  var prepFiles = function () {

    return mapStream(function (file, cb) {
      console.log("running prepFiles")
      // gulp.src(['*.js'], {base: conf.tmpJsDir}).pipe(gulp.dest(conf.compiledDir));
      gulp.src([conf.tmpJsDir + '/*.js']).pipe(gulp.dest(conf.compiledDir));
      var template = gulp.src('./src/index-dev-template.html');
      // It's not necessary to read the files (will speed up things), we're only after their paths:
      var JsSources = conf.fileOrder;
      var libSources = conf.libFiles;
      var JsSourcesString = ""
      var arrayLength = JsSources.length;
      for (var i = 0; i < arrayLength; i++) {
        var prop = JsSources[i];
        // modify the string
        var filename = "compiled/" + prop + ".js";
        var scriptString = "<script src='" + filename + "'></script>\n";
        JsSourcesString += scriptString
      }
      //console.log("JsSourcesString: " + JsSourcesString)
      var libSourcesString = ""
      var arrayLength = libSources.length;
      for (var i = 0; i < arrayLength; i++) {
        var prop = libSources[i];
        // modify the string
        var filename = prop.replace("./src/", "")
        var scriptString = "<script src='" + filename + "'></script>\n";
        libSourcesString += scriptString
      }

      template.pipe(inject.after("<!-- inject:js -->\n", JsSourcesString))
          .pipe(inject.after("<!-- lib:js -->\n", libSourcesString))
          //.pipe(debug({title: 'unicorny:', minimal: false}))
          .pipe(rename('index-dev.html'))
          .pipe(gulp.dest('./src')).on('error', function(err) { // on error
        log(err);                   // log
        //target.end();                    // end stream so we don't freeze the program
      });
      return cb(null, file)
    })
  }

  //var stat = function () {
  fs.stat(conf.tmpMinDir + '/version.js', function(err, stat) {
    gulp.src(conf.tmpMinDir + '/version.js')
        .pipe(wait(2000))
        .pipe(prepFiles());
  });
});

gulp.task('init', ['clean', 'version', 'build:locales', 'build:views', 'build:app.js', 'build:lib.js']);

gulp.task('default', ['init', 'watch']);

gulp.task('index-dev', ['prepare-index-dev']);


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

  'WidgetRunView', 

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

  'Element',
  'Elements',
  'ElementListElementView',
  'ElementListEditView',
  'ElementEditView',

  'HtmlEditView',
  'HtmlRunView',
  'MediaEditView',
  'MediaRunView',

  'LessonPlan',
  'LessonPlans',
  'LessonPlansListView',
  'LessonPlanListElementView',
  'LessonPlanEditView',
  'LessonPlanRunView',
  'LessonMenuView',

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
  './src/js/lib/modernizr.js',
  './src/js/lib/jquery.js',
  './src/js/lib/underscore.js',
  './src/js/lib/sha1.js',
  './src/js/lib/i18next.js',
  './src/js/lib/jquery.couch.js',
  './src/js/lib/jquery.cookie.js',
  './src/js/lib/jquery.tablesorter.js',
  './src/js/lib/jquery.flot.js',
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
  './src/js/lib/backbone-couchdb.js',
  './src/js/lib/transcriptionCheckdigit.js',
  './src/js/lib/base64.js',
  './src/js/lib/jstz.js',
  './src/js/lib/coffee-script.js' // This file tends to like to be last
];
