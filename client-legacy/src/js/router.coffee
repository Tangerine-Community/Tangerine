class Router extends Backbone.Router


  # Set Router.navigateAwayMessage to a string to confirm when a user is navigating
  # away from their current route. Set it to false to turn off the confirmation.
  navigateAwayMessage: false

  # Override Backbone.Router.execute
  execute: (callback, args, name) ->
    # Implement support for Router.navigateAwayMessage
    if this.navigateAwayMessage isnt false
      if !confirm this.navigateAwayMessage
        return false
      else
        this.navigateAwayMessage = false
        Tangerine.router.landing(true)
    if (callback)
      callback.apply(this, args);

  routes:
    'workflow/run/:workflowId'  : 'workflowRun'
    'workflow/edit/:workflowId'  : 'workflowEdit'
    'workflow/resume/:workflowId/:tripId'  : 'workflowResume'
    'workflows': 'workflows'
    'widget'   : 'widgetLoad'
    'widget-play/:id' : 'widgetPlay'
    'feedback/edit/:workflowId' : 'feedbackEdit'
    'feedback/:workflowId'      : 'feedback'
    'login'    : 'login'
    'register' : 'register'
    'user/:userId' : 'user'
    'logout'   : 'logout'
    'account'  : 'account'
    'bandwidth' : 'bandwidth' 
    'tabs' :'tabs' 

    'transfer' : 'transfer'

    'settings' : 'settings'
    'update' : 'update'

    '' : 'landing'

    'logs' : 'logs'
    'reload' : 'reload'

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
    '_':'_'

  reload: ->
    @navigate '', false
    window.location.reload()

  edit: (id) ->
    Tangerine.user.verify
      isAuthenticated: ->
        assessment = new Assessment
          "_id" : id
        assessment.deepFetch
          success : ( res ) ->
            view = new AssessmentEditView model: assessment 
            vm.show view


  admin: (options) ->
    Tangerine.user.verify
      isAdmin: ->
        $.couch.allDbs
          success: (databases) =>
            groups = databases.filter (database) -> database.indexOf("group-") == 0
            view = new AdminView
              groups : groups
            vm.show view

  bandwidth: ->
    Tangerine.user.verify
      isAuthenticated: ->
        view = new BandwidthCheckView
        vm.show view

  tabs: ->
    Tangerine.user.verify
      isAuthenticated: ->
        view = new TabView
        vm.show view

  _: ->
    Tangerine.user.verify
      isAuthenticated: ->
        view = new TabView
        if Tangerine.settings.has 'tabs'
          view.tabs = Tangerine.settings.get 'tabs'
        Tangerine.app.rm.get('mainRegion').show view 


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
    Tangerine.router.navigate "_", callFunction

    document.location.reload() if refresh # this is for the stupid click bug


  groups: ->
    Tangerine.user.verify
      isAuthenticated: ->
        view = new GroupsView
        vm.show view
  #
  # Workflow
  #

  feedback: ( workflowId ) ->
    Tangerine.user.verify
      isAuthenticated: ->
        loadingView = new Backbone.View
        loadingView.$el.html('Loading...')
        Tangerine.app.rm.get('mainRegion').show loadingView
        workflow = new Workflow "_id" : workflowId
        workflow.fetch
          success: ->
            feedbackId = "#{workflowId}-feedback"
            feedback = new Feedback "_id" : feedbackId
            feedback.fetch
              error: -> Utils.midAlert "No feedback defined"
              success: ->
                feedback.updateCollection()
                tripsByWorkflowIdCollection = new TripsByWorkflowIdCollection
                tripsByWorkflowIdCollection.params.workflowId = workflow.id
                tripsByWorkflowIdCollection.on 'sync', ->
                  view = new FeedbackTripsView
                    feedback : feedback
                    workflow : workflow
                    tripsByWorkflowIdCollection : tripsByWorkflowIdCollection
                  Tangerine.app.rm.get('mainRegion').show view
                tripsByWorkflowIdCollection.fetch()

  feedbackEdit: ( workflowId ) ->
      Tangerine.user.verify
        isAuthenticated: ->

          showFeedbackEditor = ( feedback, workflow ) ->
            feedback.updateCollection()
            view = new FeedbackEditView
              feedback: feedback
              workflow: workflow
            vm.show view

          workflow = new Workflow "_id" : workflowId
          workflow.fetch
            success: ->
              feedbackId = "#{workflowId}-feedback"
              feedback   = new Feedback "_id" : feedbackId
              feedback.fetch
                error:   -> feedback.save null, success: -> showFeedbackEditor(feedback, workflow)
                success: -> showFeedbackEditor(feedback, workflow)




  workflowEdit: ( workflowId ) ->
    Tangerine.user.verify
      isAuthenticated: ->

        workflow = new Workflow "_id" : workflowId
        workflow.fetch
          success: ->
            view = new WorkflowEditView workflow : workflow
            vm.show view



  workflowRun: ( workflowId ) ->
    Tangerine.user.verify
      isAuthenticated: ->

        workflow = new Workflow "_id" : workflowId
        workflow.fetch
          success: ->
            workflow.updateCollection()
            view = new WorkflowRunView
              workflow: workflow
            Tangerine.app.rm.get('mainRegion').show view

  workflowResume: ( workflowId, tripId ) ->
    Tangerine.user.verify
      isAuthenticated: ->

        workflow = new Workflow "_id" : workflowId
        workflow.fetch
          success: ->
            Tangerine.$db.view Tangerine.design_doc+"/tripsAndUsers",
              key: tripId
              include_docs: true
              success: (data) ->
                index = Math.max(data.rows.length - 1, 0)

                # add old results
                steps = []
                for j in [0..index]
                  steps.push {result : new Result data.rows[j].doc}

                assessmentResumeIndex = data.rows[index]?.doc?.subtestData?.length || 0

                ###
                  if data.rows[index]?.doc?.order_map?
                  # save the order map of previous randomization
                  orderMap = result.get("order_map").slice() # clone array
                  # restore the previous ordermap
                  view.orderMap = orderMap

                ###

                workflow = new Workflow "_id" : workflowId
                workflow.fetch
                  success: ->

                    incomplete = Tangerine.user.getPreferences("tutor-workflows", "incomplete")

                    incomplete[workflowId] = _(incomplete[workflowId]).without tripId

                    Tangerine.user.getPreferences("tutor-workflows", "incomplete", incomplete)

                    workflow.updateCollection()
                    view = new WorkflowRunView
                      assessmentResumeIndex : assessmentResumeIndex
                      workflow: workflow
                      tripId  : tripId
                      index   : index
                      steps   : steps
                    Tangerine.app.rm.get('mainRegion').show view


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

  workflows: ->
    Tangerine.user.verify
      isAuthenticated: ->

        (workflows = new Workflows).fetch
          success: ->
            feedbacks = new Feedbacks feedbacks
            feedbacks.fetch
              success: ->
                view = new WorkflowMenuView
                  workflows : workflows
                  feedbacks : feedbacks
                Tangerine.app.rm.get('mainRegion').show view

  assessments: ->
    Tangerine.user.verify
      isAuthenticated: ->
        assessments = new Assessments
        assessments.fetch
          success: ->
            assessmentsView = new AssessmentsMenuView
              assessments : assessments
            Tangerine.app.rm.get('mainRegion').show assessmentsView

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
    assessmentDocs = JSON.parse(window.frameElement.getAttribute('data-assessment'))
    assessmentId = ''
    resultId = ''
    i = 0
    insertRecord = ->
#      console.log("i: " + i + " assessmentDocs[i]: " + JSON.stringify(assessmentDocs[i]))
      Tangerine.db
        .put(assessmentDocs[i])
        .then( (response) ->
          # Catch the Assessment ID that will be passing by here.
          if assessmentDocs[i].collection == 'assessment'
            assessmentId = assessmentDocs[i]._id
          i++
          if assessmentDocs[i]
            insertRecord()
          else
            Backbone.history.navigate('#widget-play/' + assessmentId, {trigger: true})
            return
        )
        .catch( (error) ->
          console.log("error: " + error)
          console.log("stack: " + error.stack)
          alert("Oops. Something went wrong \n\n" + error)
        )
    insertRecord()

  widgetPlay: (id) ->
    router = this
    router.navigateAwayMessage = t("Router.message.quit_assessment")
    assessment = new Assessment "_id" : id
    assessment.deepFetch
      success : ->
        dashboardLayout = new DashboardLayout();
        Tangerine.app.rm.get('mainRegion').show dashboardLayout
        dashboardLayout.contentRegion.reset()
        assessmentCompositeView = new AssessmentCompositeView
          assessment: assessment
        assessmentCompositeView.on('result:saved', () =>
          window.frameElement.setAttribute('data-result', JSON.stringify(assessmentCompositeView.result.toJSON()))
          evt = document.createEvent("Event");
          evt.initEvent("result:save:widget", true, false);
          window.frameElement.dispatchEvent(evt)
        )
        assessmentCompositeView.on('result:another', () =>
          evt = document.createEvent("Event");
          evt.initEvent("result:another:widget", true, false);
          window.frameElement.dispatchEvent(evt)
        )
        dashboardLayout.contentRegion.show(assessmentCompositeView)
      error: (model, err, cb) ->
        console.log JSON.stringify err

  runMar: (id) ->
    router = this
    Tangerine.user.verify
      isAuthenticated: ->
        router.navigateAwayMessage = t("Router.message.quit_assessment")
        assessment = new Assessment "_id" : id
        assessment.deepFetch
          success : ->
            dashboardLayout = new DashboardLayout();
            Tangerine.app.rm.get('mainRegion').show dashboardLayout
            dashboardLayout.contentRegion.reset()
            assessmentCompositeView = new AssessmentCompositeView
              assessment: assessment
            dashboardLayout.contentRegion.show(assessmentCompositeView)
          error: (model, err, cb) ->
            console.log JSON.stringify err

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
      isAuthenticated: ->
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
      isAuthenticated: ->
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

            viewOptions = {}
            viewOptions.users = users
            if Tangerine.settings.has 'user'
              viewOptions.userSettings = Tangerine.settings.get 'user'
            loginView = new LoginView viewOptions

            Tangerine.app.rm.get('mainRegion').show loginView
            loginView.afterRender()

  logout: ->
    Tangerine.user.logout()

  user: (userId) ->
    Tangerine.user.verify
      isAuthenticated: ->
        tabletUserModel = new TabletUser({id: userId})
        tabletUserModel.set('_id', userId)
        tabletUserModel.on 'sync', ->
          tabletUserView = new TabletUserView
            model : tabletUserModel
          Tangerine.app.rm.get('mainRegion').show tabletUserView
        tabletUserModel.fetch()


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
