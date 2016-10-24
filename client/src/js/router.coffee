class Router extends Backbone.Router


  # Set Router.navigateAwayMessage to a string to confirm when a user is navigating
  # away from their current route. Set it to false to turn off the confirmation.
  navigateAwayMessage: false

  # Override Backbone.Router.execute
  execute: (callback, args, name) ->
    # Implement support for Router.navigateAwayMessage
#    if this.navigateAwayMessage isnt false
#      if !confirm this.navigateAwayMessage
#        return false
#      else
#        this.navigateAwayMessage = false
#        Tangerine.router.landing(true)
    if (callback)
      callback.apply(this, args);

  routes:
    'widget'   : 'widgetLoad'
    'widget-play/:id' : 'widgetPlay'
    'widget-play/:type/:id' : 'widgetPlay'
    'login'    : 'login'
    'register' : 'register'
    'logout'   : 'logout'
    'account'  : 'account'

    'transfer' : 'transfer'

    'settings' : 'settings'
    'update' : 'update'

    '' : 'landing'

    'logs' : 'logs'

    # Class
    'class'          : 'klass'
    'class/edit/:id' : 'klassEdit'
    'class/student/:studentId'        : 'studentEdit'
    'class/student/report/:studentId' : 'studentReport'
    'class/subtest/:id' : 'editKlassSubtest'
    'class/question/:id' : "editKlassQuestion"

    'class/:id/:part' : 'klassPartly'
    'class/:id'       : 'klassPartly'

    'class/run/:studentId/:subtestId' : 'runSubtest'

    'class/result/student/subtest/:studentId/:subtestId' : 'studentSubtest'

    'curricula'         : 'curricula'
    'curriculum/:id'    : 'curriculum'
    'curriculumImport'  : 'curriculumImport'

    'report/klassGrouping/:klassId/:part' : 'klassGrouping'
    'report/masteryCheck/:studentId'      : 'masteryCheck'
    'report/progress/:studentId/:klassId' : 'progressReport'

    'teachers' : 'teachers'


    # server / mobile
    'groups' : 'groups'

    'assessments'        : 'assessments'

    'run/:id'       : 'run'
    'runMar/:id'       : 'runMar'
    'lesson/:subject/:grade/:week/:day' : 'lesson'
    'print/:id/:format'       : 'print'
    'dataEntry/:id' : 'dataEntry'

    'resume/:assessmentId/:resultId'    : 'resume'

    'restart/:id'   : 'restart'
    'edit/:id'      : 'edit'
    'results/:id'   : 'results'
    'import'        : 'import'

    'subtest/:id'       : 'editSubtest'

    'question/:id' : 'editQuestion'
    'dashboard' : 'dashboard'
    'dashboard/*options' : 'dashboard'
    'admin' : 'admin'

    'sync/:id'      : 'sync'


  admin: (options) ->
    Tangerine.user.verify
      isAdmin: ->
        $.couch.allDbs
          success: (databases) =>
            groups = databases.filter (database) -> database.indexOf("group-") == 0
            view = new AdminView
              groups : groups
            vm.show view

  dashboard: (options) ->
    options = options?.split(/\//)
    #default view options
    reportViewOptions =
      assessment: "All"
      groupBy: "enumerator"

    # Allows us to get name/value pairs from URL
    _.each options, (option,index) ->
      unless index % 2
        reportViewOptions[option] = options[index+1]

    view = new DashboardView()
    view.options = reportViewOptions
    vm.show view

  landing: (refresh = false) ->

    callFunction = not refresh

    Tangerine.router.navigate "assessments", callFunction

    document.location.reload() if refresh # this is for the stupid click bug


  groups: ->
    Tangerine.user.verify
      isAuthenticated: ->
        view = new GroupsView
        vm.show view

  #
  # Class
  #
  curricula: ->
    Tangerine.user.verify
      isAuthenticated: ->
        curricula = new Curricula
        curricula.fetch
          success: (collection) ->
            view = new CurriculaView
              "curricula" : collection
            vm.show view

  curriculum: (curriculumId) ->
    Tangerine.user.verify
      isAuthenticated: ->
        curriculum = new Curriculum "_id" : curriculumId
        curriculum.fetch
          success: ->
            allSubtests = new Subtests
            allSubtests.fetch
              success: ->
                subtests = new Subtests allSubtests.where "curriculumId" : curriculumId
                allQuestions = new Questions
                allQuestions.fetch
                  success: ->
                    questions = []
                    subtests.each (subtest) -> questions = questions.concat(allQuestions.where "subtestId" : subtest.id )
                    questions = new Questions questions
                    view = new CurriculumView
                      "curriculum" : curriculum
                      "subtests"   : subtests
                      "questions"  : questions

                    vm.show view


  curriculumEdit: (curriculumId) ->
    Tangerine.user.verify
      isAuthenticated: ->
        curriculum = new Curriculum "_id" : curriculumId
        curriculum.fetch
          success: ->
            allSubtests = new Subtests
            allSubtests.fetch
              success: ->
                subtests = allSubtests.where "curriculumId" : curriculumId
                allParts = (subtest.get("part") for subtest in subtests)
                partCount = Math.max.apply Math, allParts
                view = new CurriculumView
                  "curriculum" : curriculum
                  "subtests" : subtests
                  "parts" : partCount
                vm.show view


  curriculumImport: ->
    Tangerine.user.verify
      isAuthenticated: ->
        view = new AssessmentImportView
          noun : "curriculum"
        vm.show view

  klass: ->
    Tangerine.user.verify
      isAuthenticated: ->
        allKlasses = new Klasses
        allKlasses.fetch
          success: ( klassCollection ) ->
            teachers = new Teachers
            teachers.fetch
              success: ->
                allCurricula = new Curricula
                allCurricula.fetch
                  success: ( curriculaCollection ) ->
                    if not Tangerine.user.isAdmin()
                      klassCollection = new Klasses klassCollection.where("teacherId" : Tangerine.user.get("teacherId"))
                    view = new KlassesView
                      klasses   : klassCollection
                      curricula : curriculaCollection
                      teachers  : teachers
                    vm.show view

  klassEdit: (id) ->
    Tangerine.user.verify
      isAuthenticated: ->
        klass = new Klass _id : id
        klass.fetch
          success: ( model ) ->
            teachers = new Teachers
            teachers.fetch
              success: ->
                allStudents = new Students
                allStudents.fetch
                  success: (allStudents) ->
                    klassStudents = new Students allStudents.where {klassId : id}
                    view = new KlassEditView
                      klass       : model
                      students    : klassStudents
                      allStudents : allStudents
                      teachers    : teachers
                    vm.show view

  klassPartly: (klassId, part=null) ->
    Tangerine.user.verify
      isAuthenticated: ->
        klass = new Klass "_id" : klassId
        klass.fetch
          success: ->
            curriculum = new Curriculum "_id" : klass.get("curriculumId")
            curriculum.fetch
              success: ->
                allStudents = new Students
                allStudents.fetch
                  success: (collection) ->
                    students = new Students ( collection.where( "klassId" : klassId ) )

                    allResults = new KlassResults
                    allResults.fetch
                      success: (collection) ->
                        results = new KlassResults ( collection.where( "klassId" : klassId ) )

                        allSubtests = new Subtests
                        allSubtests.fetch
                          success: (collection ) ->
                            subtests = new Subtests ( collection.where( "curriculumId" : klass.get("curriculumId") ) )
                            view = new KlassPartlyView
                              "part"       : part
                              "subtests"   : subtests
                              "results"    : results
                              "students"   : students
                              "curriculum" : curriculum
                              "klass"      : klass
                            vm.show view


  studentSubtest: (studentId, subtestId) ->
    Tangerine.user.verify
      isAuthenticated: ->
        student = new Student "_id" : studentId
        student.fetch
          success: ->
            subtest = new Subtest "_id" : subtestId
            subtest.fetch
              success: ->
                Tangerine.$db.view "#{Tangerine.design_doc}/resultsByStudentSubtest",
                  key : [studentId,subtestId]
                  success: (response) ->
                    allResults = new KlassResults
                    allResults.fetch
                      success: (collection) ->
                        results = collection.where
                          "subtestId" : subtestId
                          "studentId" : studentId
                          "klassId"   : student.get("klassId")
                        view = new KlassSubtestResultView
                          "allResults" : allResults
                          "results"  : results
                          "subtest"  : subtest
                          "student"  : student
                          "previous" : response.rows.length
                        vm.show view

  runSubtest: (studentId, subtestId) ->
    Tangerine.user.verify
      isAuthenticated: ->
        subtest = new Subtest "_id" : subtestId
        subtest.fetch
          success: ->
            student = new Student "_id" : studentId

            # this function for later, real code below
            onStudentReady = (student, subtest) ->
              student.fetch
                success: ->

                  # this function for later, real code below
                  onSuccess = (student, subtest, question=null, linkedResult={}) ->
                    view = new KlassSubtestRunView
                      "student"      : student
                      "subtest"      : subtest
                      "questions"    : questions
                      "linkedResult" : linkedResult
                    vm.show view

                  questions = null
                  if subtest.get("prototype") == "survey"
                    Tangerine.$db.view "#{Tangerine.design_doc}/resultsByStudentSubtest",
                      key : [studentId,subtest.get("gridLinkId")]
                      success: (response) =>
                        if response.rows != 0
                          linkedResult = new KlassResult _.last(response.rows)?.value
                        questions = new Questions
                        questions.fetch
                          viewOptions:
                            key: "question-#{subtest.get("curriculumId")}"
                          success: ->
                            questions = new Questions(questions.where {subtestId : subtestId })
                            onSuccess(student, subtest, questions, linkedResult)
                  else
                    onSuccess(student, subtest)
              # end of onStudentReady

            if studentId == "test"
              student.fetch
                success: -> onStudentReady( student, subtest)
                error: ->
                  student.save null,
                    success: -> onStudentReady( student, subtest)
            else
              student.fetch
                success: ->
                  onStudentReady(student, subtest)

  register: ->
    Tangerine.user.verify
      isUnregistered: ->
        view = new RegisterTeacherView
          user : new User
        vm.show view
      isAuthenticated: ->
        Tangerine.router.landing()

  studentEdit: ( studentId ) ->
    Tangerine.user.verify
      isAuthenticated: ->
        student = new Student _id : studentId
        student.fetch
          success: (model) ->
            allKlasses = new Klasses
            allKlasses.fetch
              success: ( klassCollection )->
                view = new StudentEditView
                  student : model
                  klasses : klassCollection
                vm.show view


  #
  # Assessment
  #


  dataEntry: ( assessmentId ) ->
    Tangerine.user.verify
      isAdmin: ->
        assessment = new Assessment "_id" : assessmentId
        assessment.fetch
          success: ->
            questions = new Questions
            questions.fetch
              viewOptions:
                key: "question-#{assessmentId}"
              success: ->
                questionsBySubtestId = questions.indexBy("subtestId")
                for subtestId, questions of questionsBySubtestId
                  assessment.subtests.get(subtestId).questions = new Questions questions
                vm.show new AssessmentDataEntryView assessment: assessment



  sync: ( assessmentId ) ->
    Tangerine.user.verify
      isAdmin: ->
        assessment = new Assessment "_id" : assessmentId
        assessment.fetch
          success: ->
            vm.show new AssessmentSyncView "assessment": assessment

  assessments: ->
    Tangerine.user.verify
      isAuthenticated: ->
        lessonPlans = new LessonPlans
        lessonPlans.fetch
          success: ->
            Tangerine.available = []
            lessonPlans.each((lessonPlan) ->
#              subject = Tangerine.enum.subjects[lessonPlan.get("lessonPlan_subject")]
#              grade   = lessonPlan.get("lessonPlan_grade")
              week    = lessonPlan.get("lessonPlan_week")
              day     = lessonPlan.get("lessonPlan_day")
              id      = lessonPlan.get("_id")
              console.log("Lessons available: " + [week, day, id])
              Tangerine.available.push [week, day, id]
            )
            Tangerine.LessonMenuView   = new LessonMenuView available: Tangerine.available
            dashboardLayout = new DashboardLayout();
            Tangerine.app.rm.get('mainRegion').show dashboardLayout
            dashboardLayout.contentRegion.reset()
            dashboardLayout.headerRegion.reset();
            dashboardLayout.headerRegion.show(Tangerine.LessonMenuView)
            # Tangerine.app.rm.get('headerRegion').show Tangerine.LessonMenuView
            assessmentsView = new AssessmentsMenuView
              lessonPlans : lessonPlans
            # Tangerine.app.rm.get('mainRegion').show assessmentsView
            dashboardLayout.contentRegion.show(assessmentsView)


  restart: (name) ->
    Tangerine.router.navigate "run/#{name}", true

  run: (id) ->
    Tangerine.user.verify
      isAuthenticated: ->
        assessment = new Assessment "_id" : id
        assessment.deepFetch
          success : ->
            vm.show new AssessmentRunView model: assessment

  widgetLoad: () ->
    console.log("widgetLoad");
    if typeof Tangerine.widgetLoaded == 'undefined'
      assessmentDocs = JSON.parse(window.frameElement.getAttribute('data-assessment'))
      groupName = window.frameElement.getAttribute('groupName')
      if Tangerine.settings.get("groupName") == ""
        Tangerine.settings.set("groupName", groupName)
      assessmentId = ''
      resultId = ''
      i = 0
      type = null
      insertRecord = ->
#        console.log("i: " + i + " assessmentDocs[i]: " + JSON.stringify(assessmentDocs[i]))
        Tangerine.db
          .put(assessmentDocs[i])
          .then( (response) ->
              # Catch the Assessment ID that will be passing by here.
            if assessmentDocs[i].collection == 'assessment' || assessmentDocs[i].collection == 'lessonPlan'
              type = assessmentDocs[i].collection
              console.log("type:" + type)
  #          if typeof(assessmentDocs[i].assessmentId) != 'undefined'
              assessmentId = assessmentDocs[i]._id
            i++
            if assessmentDocs[i]
              insertRecord()
            else
              Tangerine.widgetLoaded = true
              Tangerine.bootSequence.loadTangerineAvailable()
#              Tangerine.bootSequence.initMenu()
              Backbone.history.navigate('#widget-play/' + type + '/' + assessmentId, {trigger: true})
          )
          .catch( (error) ->
            console.log("error: " + error)
            console.log("stack: " + error.stack)
            alert("Oops. Something went wrong \n\n" + error)
          )
      insertRecord()
    else
#      User hit the back button, go to the main listing.
      Tangerine.router.landing()
#      rootPath = window.location.origin
#      pathname = window.location.pathname
#      window.location = rootPath + pathname + "#assessments"

  widgetPlay: (type, id) ->
    console.log("type:" + type)
    router = this
    router.navigateAwayMessage = t("Router.message.quit_assessment")
    if type == 'assessment'
      assessment = new Assessment "_id" : id
      assessment.deepFetch
        success : ->
          dashboardLayout = new DashboardLayout();
          Tangerine.app.rm.get('mainRegion').show dashboardLayout
          dashboardLayout.contentRegion.reset()
          view = new AssessmentCompositeView
            assessment: assessment
          view.on('result:saved', () =>
            window.frameElement.setAttribute('data-result', JSON.stringify(view.result.toJSON()))
            evt = document.createEvent("Event");
            evt.initEvent("result:save:widget", true, false);
            window.frameElement.dispatchEvent(evt)
          )
          view.on('result:another', () =>
            evt = document.createEvent("Event");
            evt.initEvent("result:another:widget", true, false);
            window.frameElement.dispatchEvent(evt)
          )
          dashboardLayout.contentRegion.show(view)
    else if type == 'lessonPlan'
      lessonPlan = new LessonPlan "_id" : id
      lessonPlan.deepFetch
        success : ->
          dashboardLayout = new DashboardLayout();
          Tangerine.app.rm.get('mainRegion').show dashboardLayout
          dashboardLayout.contentRegion.reset()
          lessonPlan.set("elements",lessonPlan.elements)
          view = new LessonPlanItemView
            model: lessonPlan
          dashboardLayout.contentRegion.show(view)
          Tangerine.LessonMenuView   = new LessonMenuView available: Tangerine.available
          dashboardLayout.headerRegion.reset();
          dashboardLayout.headerRegion.show(Tangerine.LessonMenuView)
        error: (model, err, cb) ->
          console.log JSON.stringify err

  runMar: (id) ->
    router = this
    Tangerine.user.verify
      isAuthenticated: ->
        router.navigateAwayMessage = t("Router.message.quit_assessment")
        lessonPlan = new LessonPlan "_id" : id
        lessonPlan.deepFetch
          success : ->
            Tangerine.available = []
            lessonPlans = new LessonPlans
            lessonPlans.fetch
              success: ->
                lessonPlans.each((lessonPlan) ->
    #              subject = Tangerine.enum.subjects[lessonPlan.get("lessonPlan_subject")]
    #              grade   = lessonPlan.get("lessonPlan_grade")
                  week    = lessonPlan.get("lessonPlan_week")
                  day     = lessonPlan.get("lessonPlan_day")
                  id      = lessonPlan.get("_id")
#                  console.log("Lessons available: " + [week, day, id])
                  Tangerine.available.push [week, day, id]
                )
                dashboardLayout = new DashboardLayout();
                Tangerine.app.rm.get('mainRegion').show dashboardLayout
                dashboardLayout.contentRegion.reset()
                Tangerine.LessonMenuView   = new LessonMenuView available: Tangerine.available
                dashboardLayout.headerRegion.reset();
                dashboardLayout.headerRegion.show(Tangerine.LessonMenuView)
                lessonPlan.set("elements",lessonPlan.elements)
                lessonPlanItemView = new LessonPlanItemView
                  model: lessonPlan
                dashboardLayout.contentRegion.show(lessonPlanItemView)
                $('.mediaClick').on('play',lessonPlanItemView.mediaClick)
                $('#connection').on('click',lessonPlanItemView.universalUpload);
              error: (model, err, cb) ->
                console.log JSON.stringify err

          error: (model, err, cb) ->
            console.log JSON.stringify err

  lesson: (options...) ->
    console.log("lesson route")
    subject = options[0]
    grade   = options[1]
    week    = options[2]
    day     = options[3]

#    Tangerine.LessonPlanItemView.select subject, grade, week, day
    subject = Tangerine.enum.iSubjects[subject]

#    menu = Tangerine.MenuView
#    menu.updateSubject()
#    menu.$subject.val(subjectName)
#    menu.onSubjectChange()
#    menu.$grade.val(grade)
#    menu.onGradeChange()
#    menu.$week.val(week)
#    menu.onWeekChange()
#    menu.$day.val(day)

    lesson = new Lesson
    lesson.fetch subject, grade, week, day, =>
      console.log("got the lesson. TBD - now run runMar")
      id = lesson.get(id)
      @runMar(id)

  resume: (assessmentId, resultId) ->
    router = this
    Tangerine.user.verify
      isAuthenticated: ->
        router.navigateAwayMessage = t("Router.message.quit_assessment")
        assessment = new Assessment "_id" : assessmentId
        assessment.deepFetch
          success : ->
            result = new Result "_id" : resultId
            result.fetch
              success: ->

                # Build an AssessmentCompositeView.
                assessmentCompositeView = new AssessmentCompositeView
                  assessment: assessment
                  result: result

                # @todo RJ: Remove. I've seen this required by something...
                result.parent = assessmentCompositeView

                # Set participant info in the Tangerine Nav.
                for subtest in result.get("subtestData")
                  if subtest.data? && subtest.data.participant_id?
                    Tangerine.nav.setStudent subtest.data.participant_id

                # Add assessmentCompositeView to the mainRegion.
                Tangerine.app.rm.get('mainRegion').show assessmentCompositeView



  results: (assessmentId) ->
    Tangerine.user.verify
      isAuthenticated: ->
        assessment = new Assessment
          "_id" : assessmentId
        assessment.fetch
          success :  ->
            allResults = new Results
            allResults.fetch
              options:
                key: "result-#{assessmentId}"
              success: ->
                view = new ResultsView
                  "assessment" : assessment
                  "results"    : allResults
#                vm.show view
                Tangerine.app.rm.get('mainRegion').show view


  csv: (id) ->
    Tangerine.user.verify
      isAdmin: ->
        view = new CSVView
          assessmentId : id
        vm.show view

  csv_alpha: (id) ->
    Tangerine.user.verify
      isAdmin: ->
        assessment = new Assessment
          "_id" : id
        assessment.fetch
          success :  ->
            filename = assessment.get("name") + "-" + moment().format("YYYY-MMM-DD HH:mm")
            document.location = "/" + Tangerine.dbName + "/_design/" + Tangerine.designDoc + "/_list/csv/csvRowByResult?key=\"#{id}\"&filename=#{filename}"

      isUser: ->
        errView = new ErrorView
          message : "You're not an admin user"
          details : "How did you get here?"
        vm.show errView

  #
  # Reports
  #
  klassGrouping: (klassId, part) ->
    part = parseInt(part)
    Tangerine.user.verify
      isAuthenticated: ->
          allSubtests = new Subtests
          allSubtests.fetch
            success: ( collection ) ->
              subtests = new Subtests collection.where "part" : part
              allResults = new KlassResults
              allResults.fetch
                success: ( results ) ->
                  results = new KlassResults results.where "klassId" : klassId
                  students = new Students
                  students.fetch
                    success: ->

                      # filter `Results` by `Klass`'s current `Students`
                      students = new Students students.where "klassId" : klassId
                      studentIds = students.pluck("_id")
                      resultsFromCurrentStudents = []
                      for result in results.models
                        resultsFromCurrentStudents.push(result) if result.get("studentId") in studentIds
                      filteredResults = new KlassResults resultsFromCurrentStudents

                      view = new KlassGroupingView
                        "students" : students
                        "subtests" : subtests
                        "results"  : filteredResults
                      vm.show view

  masteryCheck: (studentId) ->
    Tangerine.user.verify
      isAuthenticated: ->
        student = new Student "_id" : studentId
        student.fetch
          success: (student) ->
            klassId = student.get "klassId"
            klass = new Klass "_id" : student.get "klassId"
            klass.fetch
              success: (klass) ->
                allResults = new KlassResults
                allResults.fetch
                  success: ( collection ) ->
                    results = new KlassResults collection.where "studentId" : studentId, "reportType" : "mastery", "klassId" : klassId
                    # get a list of subtests involved
                    subtestIdList = {}
                    subtestIdList[result.get("subtestId")] = true for result in results.models
                    subtestIdList = _.keys(subtestIdList)

                    # make a collection and fetch
                    subtestCollection = new Subtests
                    subtestCollection.add new Subtest("_id" : subtestId) for subtestId in subtestIdList
                    subtestCollection.fetch
                      success: ->
                        view = new MasteryCheckView
                          "student"  : student
                          "results"  : results
                          "klass"    : klass
                          "subtests" : subtestCollection
                        vm.show view

  progressReport: (studentId, klassId) ->
    Tangerine.user.verify
      isAuthenticated: ->
        # save this crazy function for later
        # studentId can have the value "all", in which case student should == null
        afterFetch = ( student, students ) ->
          klass = new Klass "_id" : klassId
          klass.fetch
            success: (klass) ->
              allSubtests = new Subtests
              allSubtests.fetch
                success: ( allSubtests ) ->
                  subtests = new Subtests allSubtests.where
                    "curriculumId" : klass.get("curriculumId")
                    "reportType"   : "progress"
                  allResults = new KlassResults
                  allResults.fetch
                    success: ( collection ) ->
                      results = new KlassResults collection.where "klassId" : klassId, "reportType" : "progress"

                      console.log students
                      if students?
                        # filter `Results` by `Klass`'s current `Students`
                        studentIds = students.pluck("_id")
                        resultsFromCurrentStudents = []
                        for result in results.models
                          resultsFromCurrentStudents.push(result) if result.get("studentId") in studentIds
                        results = new KlassResults resultsFromCurrentStudents

                      view = new ProgressView
                        "subtests" : subtests
                        "student"  : student
                        "results"  : results
                        "klass"    : klass
                      vm.show view

        if studentId != "all"
          student = new Student "_id" : studentId
          student.fetch
            success: -> afterFetch student
        else
          students = new Students
          students.fetch
            success: -> afterFetch null, students

  #
  # Subtests
  #
  editSubtest: (id) ->
    Tangerine.user.verify
      isAdmin: ->
        id = Utils.cleanURL id
        subtest = new Subtest _id : id
        subtest.fetch
          success: (model, response) ->
            assessment = new Assessment
              "_id" : subtest.get("assessmentId")
            assessment.fetch
              success: ->
                view = new SubtestEditView
                  model      : model
                  assessment : assessment
                vm.show view
      isUser: ->
        Tangerine.router.landing()

  editKlassSubtest: (id) ->

    onSuccess = (subtest, curriculum, questions=null) ->
      view = new KlassSubtestEditView
        model      : subtest
        curriculum : curriculum
        questions  : questions
      vm.show view

    Tangerine.user.verify
      isAdmin: ->
        id = Utils.cleanURL id
        subtest = new Subtest _id : id
        subtest.fetch
          success: ->
            curriculum = new Curriculum
              "_id" : subtest.get("curriculumId")
            curriculum.fetch
              success: ->
                if subtest.get("prototype") == "survey"
                  questions = new Questions
                  questions.fetch
                    viewOptions:
                      key: "question-#{curriculum.id}"
                    success: ->
                      questions = new Questions questions.where("subtestId":subtest.id)
                      onSuccess subtest, curriculum, questions
                else
                  onSuccess subtest, curriculum
      isUser: ->
        Tangerine.router.landing()


  #
  # Question
  #
  editQuestion: (id) ->
    Tangerine.user.verify
      isAdmin: ->
        id = Utils.cleanURL id
        question = new Question _id : id
        question.fetch
          success: (question, response) ->
            assessment = new Assessment
              "_id" : question.get("assessmentId")
            assessment.fetch
              success: ->
                subtest = new Subtest
                  "_id" : question.get("subtestId")
                subtest.fetch
                  success: ->
                    view = new QuestionEditView
                      "question"   : question
                      "subtest"    : subtest
                      "assessment" : assessment
                    vm.show view
      isUser: ->
        Tangerine.router.landing()


  editKlassQuestion: (id) ->
    Tangerine.user.verify
      isAdmin: ->
        id = Utils.cleanURL id
        question = new Question "_id" : id
        question.fetch
          success: (question, response) ->
            curriculum = new Curriculum
              "_id" : question.get("curriculumId")
            curriculum.fetch
              success: ->
                subtest = new Subtest
                  "_id" : question.get("subtestId")
                subtest.fetch
                  success: ->
                    view = new QuestionEditView
                      "question"   : question
                      "subtest"    : subtest
                      "assessment" : curriculum
                    vm.show view


  #
  # User
  #
  login: ->
    Tangerine.user.verify
      isAuthenticated: ->
        Tangerine.router.landing()
      isUnregistered: ->

        users = new TabletUsers
        users.fetch
          success: ->
#            vm.show new LoginView
#              users: users
            loginView = new LoginView
              users: users
#            dashboardLayout = new DashboardLayout();
            Tangerine.app.rm.get('mainRegion').show loginView
            loginView.afterRender()
#            dashboardLayout.contentRegion.show(loginView)

  logout: ->
    Tangerine.user.logout()

  account: ->
    Tangerine.user.verify
      isAuthenticated: ->
        showView = (teacher) ->
          view = new AccountView
            user : Tangerine.user
            teacher: teacher
          vm.show view

        if "class" is Tangerine.settings.get("context")
          if Tangerine.user.has("teacherId")
            teacher = new Teacher "_id": Tangerine.user.get("teacherId")
            teacher.fetch
              success: ->
                showView(teacher)
          else
            teacher = new Teacher "_id": Utils.humanGUID()
            teacher.save null,
              success: ->
                showView(teacher)

        else
          showView()

  settings: ->
    Tangerine.user.verify
      isAuthenticated: ->
        view = new SettingsView
        vm.show view


  logs: ->
    Tangerine.user.verify
      isAuthenticated: ->
        logs = new Logs
        logs.fetch
          success: =>
            view = new LogView
              logs: logs
            vm.show view


  teachers: ->
    Tangerine.user.verify
      isAuthenticated: ->
        users = new TabletUsers
        users.fetch
          success: ->
            teachers = new Teachers
            teachers.fetch
              success: =>
                view = new TeachersView
                  teachers: teachers
                  users: users
                vm.show view


  # Transfer a new user from tangerine-central into tangerine
  transfer: ->
    getVars = Utils.$_GET()
    name = getVars.name
    $.couch.logout
      success: =>
        $.cookie "AuthSession", null
        $.couch.login
          "name"     : name
          "password" : name
          success: ->
            Tangerine.router.landing()
            window.location.reload()
          error: ->
            $.couch.signup
              "name" :  name
              "roles" : ["_admin"]
            , name,
            success: ->
              user = new User
              user.save
                "name"  : name
                "id"    : "tangerine.user:"+name
                "roles" : []
                "from"  : "tc"
              ,
                wait: true
                success: ->
                  $.couch.login
                    "name"     : name
                    "password" : name
                    success : ->
                      Tangerine.router.landing()
                      window.location.reload()
                    error: ->
                      Utils.sticky "Error transfering user."
