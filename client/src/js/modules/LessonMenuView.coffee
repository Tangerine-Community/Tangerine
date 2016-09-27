#
# Classes
#

class Lesson extends Backbone.Model

  url: 'lesson'

  fetch: (splat...) =>
    @subject  = splat[0]
    @grade    = splat[1]
    @week     = splat[2]
    @day      = splat[3]
    callback = splat[4]
    error    = splat[5]

#    Tangerine.$db.view "mmlp/lesson",
#    $.couch.db(Tangerine.db_name).view "#{Tangerine.design_doc}/byLesson",
#    $.couch.db(Tangerine.db_name).view "byLesson",
#    Tangerine.db.query("byLesson",
    Tangerine.db.query("_design/byLesson/byLesson",
      include_docs: true
      key: [ @subject, @grade, @week, @day ]
      success: (response) =>
        return error?() if response.rows.length is 0
        attributes = _(response.rows).first().doc
        @set attributes
        callback?()
      error: (err) =>
        console.log("Error: " + JSON.stringify(err))
    ).then (response) ->
#      return error?() if response.rows.length is 0
      console.log("response: " + JSON.stringify(response))
      attributes = _(response.rows).first().doc
      @set attributes
      callback?()

class LessonMenuView extends Backbone.View

  className : "LessonMenuView"

  events :
    "change #subject" : "onSubjectChange"
    "change #grade"   : "onGradeChange"
    "change #week"    : "onWeekChange"
    "change #day"     : "onDayChange"

  update: ->


  initialize: ( options = {} )->
    @available = options.available
    @render()

  render: ->

    @$el.html "
      <label for='subject'>Subject</label>
      <select id='subject'><option disabled='disable' selected='true'>Select</option></select>

      <label for='grade'>Class</label>
      <select id='grade' disabled><option disabled='disable' selected='true'>Select</option></select>

      <label for='week'>Week</label>
      <select id='week' disabled><option disabled='disable' selected='true'>Select</option></select>

      <label for='day'>Day</label>
      <select id='day' disabled><option disabled='disable' selected='true'>Select</option></select>
    "

    @$subject = @$el.find("#subject")
    @$grade   = @$el.find("#grade")
    @$week    = @$el.find("#week")
    @$day     = @$el.find("#day")

    @updateSubject()

  updateSubject: =>

    html = ""
    alreadyDone = []
    for element in @available
      subject = element[0]
      unless ~alreadyDone.indexOf(subject)
        alreadyDone.push subject
        html += "<option value='#{subject}'>#{subject}</option>"
    html = "<option disabled='disabled' selected='true'>Select</option>" + html
    @$subject.html html


  onSubjectChange: (selectedSubject) ->
    selectedSubject = @$subject.val()

    alreadyDone = []
    rows = []
    for element in @available

      grade = element[1]
      if element[0] is selectedSubject and 
         !~alreadyDone.indexOf(grade)
        alreadyDone.push grade

        rows.push order: grade, html : "<option value='#{grade}'>#{grade}</option>"

    html = rows.sort((a, b)->a.order-b.order).map((e)->e.html).join('')
    html = "<option disabled='disabled' selected='true'>Select</option>" + html

    @$grade.removeAttr("disabled")
    @$grade.html html


  onGradeChange:  ->
    selectedSubject = @$subject.val()
    selectedGrade   = @$grade.val()

    alreadyDone = []
    rows = []
    for element in @available

      week = element[2]
      if element[0] is selectedSubject and 
         element[1] is selectedGrade and
         !~alreadyDone.indexOf(week)
        alreadyDone.push week

        rows.push order : week, html: "<option value='#{week}'>#{week}</option>"

    html = rows.sort((a, b)->a.order-b.order).map((e)->e.html).join('')

    html = "<option disabled='disabled' selected='true'>Select</option>" + html


    @$week.removeAttr("disabled")
    @$week.html html


  onWeekChange: ->

    selectedSubject = @$subject.val()
    selectedGrade   = @$grade.val()
    selectedWeek    = @$week.val()

    rows = []
    alreadyDone = []
    for element in @available
      day = element[3]
      id = element[4]
      if element[0] is selectedSubject and
         element[1] is selectedGrade and 
         element[2] is selectedWeek and
         !~alreadyDone.indexOf(day)

        rows.push order:day, html: "<option value='#{day}_#{id}'>#{day}</option>"

    html = rows.sort((a, b)->a.order-b.order).map((e)->e.html).join('')
    html = "<option disabled='disabled' selected='true'>Select</option>" + html

    @$day.removeAttr("disabled")
    @$day.html html

  onDayChange: ->
    subject = @$subject.val()
    grade   = @$grade.val()
    week    = @$week.val()
    day     = @$day.val()
    dayArr = day.split("_")
    id = dayArr[1]

#    Tangerine.router.navigate "lesson/#{subject}/#{grade}/#{week}/#{day}", false
    Tangerine.router.navigate "runMar/#{id}", false
    window.location.reload()




