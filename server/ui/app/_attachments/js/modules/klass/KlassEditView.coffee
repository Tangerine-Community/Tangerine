class KlassEditView extends Backbone.View

  className : "KlassEditView"

  events: 
    'click .back'                    : 'back'
    'click .save'                    : 'basicInfoSave'
    'click .basic_info_edit'         : 'basicInfoToggle'
    'click .basic_info_cancel'       : 'basicInfoToggle'

    'change #teacher_select'         : 'teacherSelect'
    
    'click .add_student'             : 'addStudentToggle'
    'click .add_student_cancel'      : 'addStudentToggle'
    'click .add_student_add'         : 'addStudent'
    'click .register_student'        : 'registerStudentToggle'
    'click .register_student_cancel' : 'registerStudentToggle'
    'click .register_student_save'   : 'registerStudent'


  teacherSelect: (event) ->
    teacherId = @$el.find("#teacher_select option:selected").attr("data-teacherId")
    @klass.set "teacherId", teacherId

  addStudentToggle: -> 
    @$el.find(".register_student_form input").val("")
    @$el.find(".add_student_form, .add_student").toggle()

  registerStudentToggle: -> 
    @$el.find(".register_student_form, .register_student").toggle()
    # scroll to new form if it's vissible
    if @$el.find(".register_student_form").is(":visible") then @$el.find(".register_student_form").scrollTo()
    @$el.find("#register_student_name ,#register_student_gender, #register_student_age").val("")

  addStudent: ->
    if @$el.find("#add_student_select option:selected").val() == "_none"
      alert ("Please select a student, or cancel.")
    else
      studentId = @$el.find("#add_student_select option:selected").attr("data-id")
      newStudent = @allStudents.get studentId
      newStudent.save
        klassId : @klass.id
      ,
        success: =>
          @students.add newStudent
          @addStudentToggle()

  registerStudent: =>
    student = new Student
    student.save
      name    : @$el.find("#register_student_name").val()
      gender  : @$el.find("#register_student_gender").val()
      age     : @$el.find("#register_student_age").val()
      klassId : @klass.id
    , 
      success: =>
        @students.add student
        @registerStudentToggle()
        
    

  basicInfoToggle: ->
    @$el.find(".basic_info").toggle()
    
    $basicInfo = $(@$el.find(".basic_info")[1])
    
    if $basicInfo.is(":visible")
      $basicInfo.scrollTo()
      @$el.find("#year").focus()

    @$el.find("#school_name").val @klass.getString("schoolName")
    @$el.find("#year").val        @klass.getString("year")
    @$el.find("#grade").val       @klass.getString("grade")
    @$el.find("#stream").val      @klass.getString("stream")
  
  basicInfoSave: ->
    inputs = @$el.find("#start_date").val().split("/")
    newDate = new Date()
    newDate.setFullYear(parseInt(inputs[0]))
    newDate.setMonth(parseInt(inputs[1]) - 1)
    newDate.setDate(parseInt(inputs[2]))

    
    @klass.save
      schoolName : @$el.find("#school_name").val()
      year       : @$el.find("#year").val()
      grade      : @$el.find("#grade").val()
      stream     : @$el.find("#stream").val()
      startDate  : newDate.getTime()
    ,
      success: =>
        @render()
      error: =>
        Utils.midAlert "Save error<br>Please try again."

  back: ->
    window.history.back()
    
  initialize: ( options ) ->
    @klass       = options.klass
    @students    = options.students
    @allStudents = options.allStudents
    @teachers    = options.teachers

    @students.on "add remove change", @renderStudents

    @views = []


  closeViews: ->
    for view in @views
      view.close()
    @views = []

  onSubviewRendered: =>
    @trigger "subRendered"

  renderStudents: =>
    $ul = $("<ul>").addClass("student_list")

    @closeViews()
    for student in @students.models
      view = new StudentListElementView
        student : student
        students : @students
      @views.push view
      view.on "rendered", @onSubviewRendered
      view.render()
      view.on "change", @renderStudents
      $ul.append view.el

    @$el.find("#student_list_wrapper").html $ul
    
    ###
    # Add student feature
    studentOptionList = "<option value='_none' disabled='disabled' selected='selected'>(#{$.t('name')}) - (#{$.t('age')})</option>"
    for student in @allStudents.models
      isInClass = false
      for double in @students.models
        if double.id == student.id then isInClass = true
      if not isInClass
        studentOptionList += "<option data-id='#{student.id}'>#{student.get 'name'} - #{student.get 'age'}</option>"

    @$el.find("#add_student_select").html studentOptionList
    ###

  render: ->

    schoolName = @klass.getString "schoolName"
    year       = @klass.getString "year"
    grade      = @klass.getString "grade"
    stream     = @klass.getString "stream"

    startDate  = new Date @klass.getNumber "startDate"

    if @klass.get("teacherId") == "admin"
      teacherName = "admin"
    else 
      teacherName = 
        if @teachers.get(@klass.get('teacherId')) && @teachers.get(@klass.get('teacherId')).has('name')
          @teachers.get(@klass.get('teacherId')).get('name')
        else
          "unknown"

    htmlInfoTeacher = "
      <tr><td><label>Teacher</label></td><td>#{teacherName}</td></tr>
    " if Tangerine.user.isAdmin()

    htmlTeacherSelect = "
      <label>Teacher</label><br>
      <select id='teacher_select'>
      #{("<option #{if teacher.id == @klass.get('teacherId') then "selected='selected' " else ""} data-teacherId='#{teacher.id}'>#{teacher.get('name')}</option>") for teacher in @teachers.models}
      </select>
    " if Tangerine.user.isAdmin()

    @$el.html "
    <button class='back navigation'>#{t('back')}</button>
    <h1>#{t('class editor')}</h1>
    <h2>#{t('basic info')}</h2>
    <table class='info_box basic_info'>
      <tr><td><label>School name</label></td><td>#{schoolName}</td></tr>
      #{htmlInfoTeacher || ""}
      <tr><td><label>School year</label></td><td>#{year}</td></tr>
      <tr><td><label>#{t('grade')}</label></td><td>#{grade}</td></tr>
      <tr><td><label>#{t('stream')}</label></td><td>#{stream}</td></tr>
      <tr><td><label>#{t('starting date')}</label></td><td>#{startDate.getFullYear()+"/"+(startDate.getMonth()+1)+"/"+startDate.getDate()}</td></tr>
      <tr><td colspan='2'><button class='basic_info_edit command'>#{t('edit')}</button></td></tr>
    </table>
    <div class='basic_info confirmation'>
      <div class='menu_box'>

        <div class='label_value'>
          <label for='school_name'>School name</label>
          <input id='school_name' value='#{schoolName}'>
        </div>
        <div class='label_value'>
          #{htmlTeacherSelect || ""}
        </div>
        <div class='label_value'>
          <label for='year'>School year</label>
          <input id='year' value='#{year}'>
        </div>
        <div class='label_value'>
          <label for='grade'>#{t('grade')}</label>
          <input id='grade' value='#{grade}'>
        </div>
        <div class='label_value'>
          <label for='stream'>#{t('stream')}</label>
          <input id='stream' value='#{stream}'>
        </div>
        <div class='label_value'>
          <label for='start_date'>#{t('starting date')}</label>
          <input id='start_date' value='#{startDate.getFullYear()+"/"+(startDate.getMonth()+1)+"/"+startDate.getDate()}'>
        </div>
      
        <button class='save command'>#{t('save')}</button> <button class='basic_info_cancel command'>#{t('cancel')}</button>
      </div>
    </div>
    
    <h2>#{t('students').capitalize()}</h2>
    <div id='student_list_wrapper'></div>
    <!-- add student feature -->
    <!--button class='add_student command'>Add student</button>
    <div class='add_student_form menu_box confirmation'>
      <div class='label_value'>
        <label for='add_student_select'>#{t('add student')}</label><br>
        <select id='add_student_select'>
        </select>
      </div>      
      <button class='add_student_add command'>#{t('add')}</button><button class='add_student_cancel command'>#{t('cancel')}</button>
    </div-->


    <button class='register_student command'>#{$.t("register student")}</button>
    <div class='register_student_form menu_box confirmation'>
      <h2>#{t('register student')}</h2>
      <div class='label_value'>
        <label for='register_student_name'>Full name</label>
        <input id='register_student_name' value=''>
      </div>
      <div class='label_value'>
        <label for='register_student_gender'>#{t('gender')}</label>
        <input id='register_student_gender' value=''>
      </div>
      <div class='label_value'>
        <label for='register_student_age'>#{t('age')}</label>
        <input id='register_student_age' value=''>
      </div>
      <button class='register_student_save command'>#{t('save')}</button>
      <button class='register_student_cancel command'>#{t('cancel')}</button>
    </div>
    "

    @trigger "rendered"

    @renderStudents()
