/* jshint undef: true, unused: true, node: true, quotmark: single */

'use strict';

/*
 * Requires
 */

var fs  = require('fs'); // for writing files
var del = require('del'); // for deleting files

// gulp
var gulp = require('gulp');

var connect = require('gulp-connect');  // nice little webserver for testing
var notify  = require('gulp-notify');   // OS notifications
var coffee  = require('gulp-coffee');   // For coffeescript compilation
var uglify  = require('gulp-uglify');   // For minification of Javascript
var concat  = require('gulp-concat');   // Concating files
var flatten = require('gulp-flatten');  // For removing directory strcuture
var cache   = require('gulp-cached');   // For speedy redos

var sourcemaps = require('gulp-sourcemaps'); // for debugging
//var inject = require('gulp-inject');  // to create index-dev.html
var inject = require('gulp-inject-string');  // to create index-dev.html
var rename = require('gulp-rename');  // to create index-dev.html

var less = require('gulp-less'); // for compiling less files

var git = require('gulp-git'); // for versioning

// For handlebars
var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');

// debugging gulp
var debug = require('gulp-debug');

// cause i don't like mondays
var wait = require('gulp-wait')
var mapStream = require('map-stream');

var mochaPhantomJS = require('gulp-mocha-phantomjs');

var exec = require('child_process').exec;

/*
 * configuration
 */

// (more at EOF)
var conf = {
  coffeeGlob     : './src/js/**/*.coffee',
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
  handlebarsGlob : './src/templates/*.handlebars',
  testGlob : './test/spec/*.coffee',
  testDir : './test/spec/'
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


// start the webserver
gulp.task('webserver', function() {
  connect.server({
    livereload: true, // sets up socket based reloading
    root: 'www'       // host from this dir
  });
});

// start the webserver for testing
gulp.task('test-webserver', function() {
  connect.server({
    livereload: false, // sets up socket based reloading
    root: '.'       // host from this dir
  });
});


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
      .pipe(gulp.dest('./www/compiled')); // also put result in this location
});

// Minify Javascript
gulp.task('minify:js', ['build:js', 'handlebars'], function() {

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
      .pipe(gulp.dest(conf.srcDir))            // put everything here
      .pipe(connect.reload());                 // reload anyone watching

});

// Build the libraries
// just concat all the required library files
gulp.task('build:lib.js', function() {
  return gulp.src(conf.libFiles)
      .pipe(cache('lib'))// cache files
      .pipe(sourcemaps.init())        // start sourcemapping
      .pipe(concat(conf.libFile))     // concat libraries
      //.pipe(uglify())                 // make'em small
      .pipe(sourcemaps.write())       // append sourcemaps
      .pipe(gulp.dest(conf.srcDir))   // write to dir
      .pipe(connect.reload());        // reload anyone watching
});


// Update version.js
gulp.task('version', function(cb) {
  git.exec({ args: 'describe --tags' }, function(err, version) {
    version = version.replace(/\n/, '');
    git.exec({ args: 'rev-parse --short HEAD' }, function(err, build) {
      build = build.replace(/\n/, '');
      var body = 'window.TangerineVersion = ' + JSON.stringify({
            buildVersion : build,
            version      : version
          });
      var filename = conf.tmpMinDir + '/version.js';
      fs.writeFile( filename, body,
          function(err) {
            if (err !== null) { console.log(err); }
            cb();
          });
      gulp.src([conf.tmpMinDir + '/version.js']).pipe(gulp.dest('./www/compiled'));
    });
  });

});


// Handle less files
gulp.task('build:less', function () {
  return gulp.src(conf.lessFile)
      .pipe(less())                      // compile less
      .pipe(gulp.dest(conf.cssDir))      // output directory
      .pipe(connect.reload());           // reload anyone watching

});


// Compile translations
gulp.task('build:locales', function(){

  var c = coffee({bare: true}); // get a coffeescript stream
  c.on('error', function(err) { // on error
    log(err);                   // log
    c.end();                    // end stream so we don't freeze the program
  });

  gulp.src('./src/locales/*.coffee')  // handle translation documents
      .pipe(c)                          // compile coffeescript
      .pipe(uglify())                   // make it small
      .pipe(concat('locales.js'))       // turn it into one file
      .pipe(gulp.dest(conf.tmpMinDir))  // send it here
      .pipe(gulp.dest('./www/compiled'))  // send it here
      .pipe(connect.reload());          // reload anyone watching

});

// Compile coffeescript in test
gulp.task('coffee:test', function(){

  var c = coffee({bare: true}); // get a coffeescript stream
  c.on('error', function(err) { // on error
    log(err);                   // log
    c.end();                    // end stream so we don't freeze the program
  });

  gulp.src('./test/spec/*.coffee')  // handle translation documents
      .pipe(c)                          // compile coffeescript
      .pipe(gulp.dest(conf.testDir))  // send it here
      .pipe(connect.reload());          // reload anyone watching

});

// Pre compile handlebars template
gulp.task('handlebars', function(){

  gulp.src(conf.handlebarsGlob)
      .pipe(handlebars({
        handlebars: require('handlebars') // Do this to specify out version 4.0.4
      }))
      .pipe(wrap('Handlebars.template(<%= contents %>)'))
      .pipe(declare({
        namespace: 'JST',
        noRedeclare: true, // Avoid duplicate declarations
      }))
      .pipe(concat('templates.js'))
      .pipe(gulp.dest(conf.tmpMinDir))
      .pipe(gulp.dest('./www/compiled')); // also put result in this location


  // automatically refreshing is commented out
  // because with our dependencies it's causing
  // the reload to happen twice, once here and then
  // once when the build:app.js is done
  //.pipe(connect.reload());          // reload anyone watching

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
  gulp.watch(conf.handlebarsGlob, ['build:app.js']); // for handlebars templates
  gulp.watch(conf.testGlob, ['coffee:test']); // for test scripts
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
      //console.log(file);
      gulp.src(['*.js'], {base: conf.tmpJsDir}).pipe(gulp.dest('./www/compiled'));
      gulp.src(['./tmp/min/templates.js']).pipe(gulp.dest('./www/compiled'));
      // gulp.src([conf.tmpMinDir + '/version.js'])
      //     //.pipe(debug({title: 'unicorn:', minimal: false}))
      //     .pipe(gulp.dest('./www/compiled'));
      // gulp.src([conf.tmpMinDir + '/locales.js'])
      //     //.pipe(debug({minimal: false}))
      //     .pipe(gulp.dest('./www/compiled'));
      var template = gulp.src('./www/index-dev-template.html');
      //var target = gulp.src('./www/index-dev.html');
      // It's not necessary to read the files (will speed up things), we're only after their paths:
      //var JsSources = gulp.src(conf.fileOrder, {read: false});
      var JsSources = conf.fileOrder;
      //var libSources = gulp.src(conf.libFiles, {read: false});
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
          .pipe(gulp.dest('./www')).on('error', function(err) { // on error
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

gulp.task('compile_packs', function(done){
  exec('./scripts/compilepacks.js', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    done(err);
  });
});

gulp.task('run_tests', function(done){
  // gulp.src('test/index.html').pipe(mochaPhantomJS({ 'webSecurityEnabled': false, "outputEncoding": "utf8", "localToRemoteUrlAccessEnabled": true }),
      gulp.src('test/index.html').pipe(mochaPhantomJS({phantomjs: {webSecurityEnabled: false, localToRemoteUrlAccessEnabled:true}})
  ).on('error', handleError);
});

function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

gulp.task('init', ['clean', 'handlebars', 'version', 'build:locales', 'build:app.js', 'build:lib.js']);

gulp.task('default', ['webserver', 'init', 'watch']);
gulp.task('test-default', ['test-webserver', 'init', 'watch']);
gulp.task('index-dev', ['prepare-index-dev']);
gulp.task('test', ['compile_packs', 'coffee:test', 'run_tests']);
gulp.task('testWatch', ['compile_packs', 'coffee:test', 'run_tests', 'watch']);
gulp.task('coffeeW', ['coffee:test', 'watch']);

conf.fileOrder = [

  'globals',

  'version',

  'helpers',

  'templates',

  'Button',
  'ButtonView',
  'ButtonItemView',

  'Assessment',
  'Assessments',
  'AssessmentsView',
  'AssessmentListElementView',
  'AssessmentsMenuView',
  'AssessmentRunView',
  'AssessmentEditView',
  'AssessmentSyncView',
  'AssessmentDataEntryView',
  'AssessmentsViewController',

  'BandwidthCheckView',
  'TabView',

  'Subtest',
  'Subtests',
  'SubtestRunView',
  'SubtestRunItemView',
  'SubtestEditView',
  'SubtestListEditView',
  'SubtestListElementView',
  'SubtestPrintView',

  'Question',
  'Questions',
  'QuestionRunView',
  'QuestionRunItemView',
  'QuestionEditView',
  'QuestionsEditView',
  'QuestionsEditListElementView',

  'WorkflowStep',
  'WorkflowSteps',
  'Workflow',
  'Workflows',
  'SchoolListView',
  'WorkflowMenuView',
  'WorkflowMenuViewController',
  'ValidObservationView',
  'WorkflowEditView',
  'WorkflowRunView',
  'WorkflowSelectView',
  'Trip',
  'TripsByUserIdCollection',
  'TripsByUserIdYearMonthCollection',
  'TripResult',
  'TripResults',


  'SurveyRunItemView',
  'SurveyEditView',

  'ConsentRunView',
  'ConsentRunItemView',

  'DatetimeRunView',
  'DatetimeRunItemView',
  
  'Loc',
  'LocView',
  'LocationRunView',
  'LocationEditView',
  'LocationRunItemView',
  'LocationElement',

  'SurveyRunView',

  'IdRunView',
  'IdRunItemView',

  'GridRunView',
  'GridRunItemView',

  'ObservationRunView',

  'GpsRunView',
  'GpsRunItemView',

  'Result',
  'Results',
  'ResultView',
  'ResultsView',
  'ResultItemView',
  'TabletManagerView',
  'ResultSumView',
  'DashboardView',
  'ResultPreview',
  'ResultPreviews',
  'ResultsSaveAsFileView',
  'UniversalUploadView',
  'SyncManager',

  'AdminView',

  'Klass',
  'KlassView',
  'KlassEditView',
  'Klasses',
  'KlassListElementView',
  'KlassesView',
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

  'Critique',
  'Critiques',
  'Feedback',
  'FeedbackEditView',
  'FeedbackRunView',
  'FeedbackTripsView',

  'User',
  'Users',
  'TabletUser',
  'TabletUserView',
  'TabletUsers',

  'LoginView',
  'AccountView',
  'GroupsView',
  'UsersMenuView',

  'AssessmentDashboardView',
  'HomeRecordItemView',
  'AssessmentCompositeView',
  'AssessmentControlsView',
  'DashboardLayout',

  'Config',

  'Log',

  'Settings',
  'SettingsView',

  'ViewManager',

  'NavigationView',

  'Template',

  'router',

  'configuration',

  'displayCode_migrations',

  'locales',

  'views',
  'boot'


];

conf.minFileOrder = conf.fileOrder.map(function(el) {
  return conf.tmpMinDir + '/' + el + '.js';
});

conf.jsFileOrder = conf.fileOrder.map(function(el) {
  return conf.tmpJsDir + '/' + el + '.js';
});

conf.libFiles = [
  './src/js/lib/modernizr.js',
  './src/js/lib/jquery.js',
  './src/js/lib/jquery.cookie.js',
  './src/js/lib/bower_components/jquery-ui/jquery-ui.min.js',
  './src/js/lib/underscore.js',
  './src/js/lib/backbone.js',
  './src/js/lib/backbone.marionette.js',
  './src/js/lib/bower_components/backbone-forms/distribution/backbone-forms.js',
  './src/js/lib/handlebars.runtime.js',
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
  './src/js/lib/moment.js',
  './src/js/lib/pouchdb.js',
  './src/js/lib/backbone-pouchdb.js',
  './src/js/lib/transcriptionCheckdigit.js',
  './src/js/lib/table2CSV.js',
  './src/js/lib/base64.js',
  './src/js/lib/jstz.js',
  './src/js/lib/lz-string.js',
  './src/js/lib/ckeditor.js',
  './src/js/lib/boomerang.js',
  './src/js/lib/boomerang-plugin-bw-custom.js',
  './src/js/lib/string.startsWith.js',
  './src/js/lib/coffee-script.js' // This file tends to like to be last
];
