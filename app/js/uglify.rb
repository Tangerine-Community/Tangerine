#! /usr/bin/ruby

require 'uglifier'
require 'pathname'

$options = {
  :make_lib       => ARGV.delete("lib") != nil,
  :make_app       => ARGV.delete("app") != nil,
  :make_index_dev => ARGV.delete("dev") != nil
}


ARGV.each { |arg|
  if /\.js/.match(arg) then
    $options[:compile] = [] if not $options[:compile]
    $options[:compile] << arg
  end
}


# TODO test to see if we can use a glob for modules/* to make this automatic
# I don't think we have any code that needs to be run in order, but don't do 
# make this change until we can do regression tests
jsFiles = [ 
  'helpers.js',

  'modules/button/ButtonView.js',

  'modules/assessment/Assessment.js',
  'modules/assessment/Assessments.js',
  'modules/assessment/AssessmentsView.js',
  'modules/assessment/AssessmentListElementView.js',
  'modules/assessment/AssessmentsMenuView.js',
  'modules/assessment/AssessmentEditView.js',
  'modules/assessment/AssessmentRunView.js',
  'modules/assessment/AssessmentImportView.js',
  'modules/assessment/AssessmentSyncView.js',

  'modules/subtest/Subtest.js',
  'modules/subtest/Subtests.js',
  'modules/subtest/SubtestListEditView.js',
  'modules/subtest/SubtestListElementView.js',
  'modules/subtest/SubtestEditView.js',
  'modules/subtest/SubtestRunView.js',

  'modules/subtest/prototypes/ConsentRunView.js',
  'modules/subtest/prototypes/ConsentEditView.js',

  'modules/subtest/prototypes/DatetimeRunView.js',
  'modules/subtest/prototypes/DatetimeEditView.js',

  'modules/subtest/prototypes/LocationRunView.js',
  'modules/subtest/prototypes/LocationEditView.js',

  'modules/subtest/prototypes/SurveyRunView.js',
  'modules/subtest/prototypes/SurveyEditView.js',

  'modules/subtest/prototypes/IdRunView.js',
  'modules/subtest/prototypes/IdEditView.js',

  'modules/subtest/prototypes/GridRunView.js',
  'modules/subtest/prototypes/GridEditView.js',

  'modules/subtest/prototypes/ObservationRunView.js',
  'modules/subtest/prototypes/ObservationEditView.js',

  'modules/subtest/prototypes/GpsRunView.js',
  'modules/subtest/prototypes/GpsEditView.js',
  'modules/subtest/prototypes/GpsPrintView.js',

  'modules/result/Result.js',
  'modules/result/Results.js',
  'modules/result/ResultView.js',
  'modules/result/ResultsView.js',
  'modules/result/TabletManagerView.js',
  'modules/result/ResultSumView.js',
  'modules/result/CSVView.js',
  'modules/result/DashboardView.js',

  'modules/admin/AdminView.js',

  'modules/question/Question.js',
  'modules/question/Questions.js',
  'modules/question/QuestionRunView.js',
  'modules/question/QuestionEditView.js',
  'modules/question/QuestionsEditView.js',
  'modules/question/QuestionsEditListElementView.js',

  'modules/klass/Klass.js',
  'modules/klass/KlassView.js',
  'modules/klass/KlassEditView.js',
  'modules/klass/Klasses.js',
  'modules/klass/KlassesView.js',
  'modules/klass/KlassListElementView.js',
  'modules/klass/KlassSubtestRunView.js',
  'modules/klass/KlassSubtestResultView.js',
  'modules/klass/KlassMenuView.js',
  'modules/klass/KlassPartlyView.js',
  'modules/klass/KlassResult.js',
  'modules/klass/KlassResults.js',
  'modules/klass/RegisterTeacherView.js',

  'modules/subtest/KlassSubtestEditView.js',

  'modules/report/KlassGroupingView.js',
  'modules/report/KlassGroupingMenuView.js',
  'modules/report/MasteryCheckView.js',
  'modules/report/MasteryCheckMenuView.js',
  'modules/report/ProgressView.js',
  'modules/report/ProgressMenuView.js',

  'modules/klass/Curriculum.js',
  'modules/klass/CurriculumView.js',
  'modules/klass/Curricula.js',
  'modules/klass/CurriculaView.js',
  'modules/klass/CurriculaListView.js',
  'modules/klass/CurriculumListElementView.js',
  'modules/klass/CurriculaView.js',

  'modules/klass/Teacher.js',

  'modules/student/Student.js',
  'modules/student/Students.js',
  'modules/student/StudentListElementView.js',
  'modules/student/StudentEditView.js',

  'modules/user/User.js',
  'modules/user/LoginView.js',
  'modules/user/AccountView.js',
  'modules/user/GroupsView.js',
  'modules/user/UsersMenuView.js',

  'modules/error/ErrorView.js',

  'modules/breadcrumb/breadcrumb.js',

  'modules/assessment/AssessmentPrintView.js',
  'modules/question/QuestionPrintView.js',
  'modules/subtest/prototypes/GridPrintView.js',
  'modules/subtest/prototypes/ConsentPrintView.js',
  'modules/subtest/prototypes/DatetimePrintView.js',
  'modules/subtest/prototypes/IdPrintView.js',
  'modules/subtest/prototypes/LocationPrintView.js',
  'modules/subtest/prototypes/SurveyPrintView.js',
  'modules/subtest/prototypes/ObservationPrintView.js',
  'modules/subtest/SubtestPrintView.js',

  'modules/log/Log.js',

  'modules/template/Template.js',
  'modules/config/Config.js',
  'modules/settings/Settings.js',
  'modules/settings/SettingsView.js',

  'modules/viewManager/ViewManager.js',

  'modules/navigation/NavigationView.js',

  'router.js',

  'boot.js',

  'version.js'
]

libFiles = [
  'lib/phonegap.js',
  'lib/jquery.js',
  'lib/underscore.js',
  'lib/sha1.js',
  'lib/jquery.couch.js',
  'lib/jquery.cookie.js',
  'lib/jquery.tablesorter.js',
  'lib/jquery.flot.js',
  'lib/jquery.i18next.js',
  'lib/excanvas.js',
  'lib/jquery.ui.core.js',
  'lib/jquery.ui.widget.js',
  'lib/jquery.ui.mouse.js',
  'lib/jquery.ui.sortable.js',
  'lib/jquery.ui.accordion.js',
  'lib/jquery.ui.button.js',
  'lib/jquery.ui.progressbar.js',
  'lib/inflection.js',
  'lib/backbone.js',
  'lib/moment.js',
  'lib/backbone-couchdb.js',
  'lib/transcriptionCheckdigit.js',
  'lib/table2CSV.js',
  'lib/base64.js',
  'lib/jstz.js',
  'lib/ckeditor.js',
  'lib/coffee-script.js' # This file tends to like to be last
]

def replace(file_path, contents)
  startString = "<!-- START -->"
  endString = "<!-- END -->"
  regExp = Regexp.new("#{startString}(.*)#{endString}", Regexp::MULTILINE)
  replacedResult = IO.read(file_path).gsub(regExp, "#{startString}\n#{contents}\n#{endString}")
  File.open(file_path, 'w') { |f| f.write(replacedResult) }
end

if $options[:make_index_dev]
  replace("../index-dev.html", (libFiles + jsFiles).map{|file|
    "<script src='js/#{file}'></script>"
  }.join("\n"))
end

if $options[:make_app]
  app = ''
  for path in jsFiles
    puts "reading #{path}"
    path = File.join(Dir.pwd, "min", Pathname.new(path).basename.to_s.gsub(".js",".min.js"))
    app += File.read path 

  end

  File.open( "app.js", 'w' ) { |f| 
    puts "writing app.js"
    f.write( app )
  }
end

if $options[:compile]
  for file in $options[:compile]
    oldFile = File.read file
    File.open( File.join(Dir.pwd, "min", Pathname.new(file).basename.to_s.gsub(".js",".min.js")), "w" ) { |f|
      puts "\nUglifying\t\t#{file}"
      f.write Uglifier.new.compile(oldFile)
    }
  end
end

if $options[:make_lib]
  lib = ''
  for path in libFiles
    puts "reading #{path}"
    lib += File.read(path)
  end

  File.open( "lib.js", 'w' ) { |f| 
    puts "writing lib.js"
    f.write lib 
  }
end
