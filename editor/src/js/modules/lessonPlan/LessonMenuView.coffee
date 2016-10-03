#
# Classes
#

class LessonMenuView extends Backbone.View

  className : "LessonMenuView"

  events :
    "change #week"    : "onWeekChange"
    "change #day"     : "onDayChange"

  update: ->


  initialize: ( options = {} )->
    @available = options.available
    @render()

  render: ->

    @$el.html "

      <label for='week'>Week</label>
      <select id='week'><option disabled='disable' selected='true'>Select</option></select>

      <label for='day'>Day</label>
      <select id='day' disabled><option disabled='disable' selected='true'>Select</option></select>
    "

#    @$subject = @$el.find("#subject")
#    @$grade   = @$el.find("#grade")
    @$week    = @$el.find("#week")
    @$day     = @$el.find("#day")

    @updateWeek()

  updateWeek: =>

    html = ""
    alreadyDone = []
    for element in @available
      week = element[0]
      unless ~alreadyDone.indexOf(week)
        alreadyDone.push week
        html += "<option value='#{week}'>#{week}</option>"
    html = "<option disabled='disabled' selected='true'>Select</option>" + html
    @$week.html html

  onWeekChange: ->

#    selectedSubject = @$subject.val()
#    selectedGrade   = @$grade.val()
    selectedWeek    = @$week.val()

    rows = []
    alreadyDone = []
    for element in @available
      day = element[1]
      id = element[2]
      if element[0] is selectedWeek and !~alreadyDone.indexOf(day)
        rows.push order:day, html: "<option value='#{day}_#{id}'>#{day}</option>"

    html = rows.sort((a, b)->a.order-b.order).map((e)->e.html).join('')
    html = "<option disabled='disabled' selected='true'>Select</option>" + html

    @$day.removeAttr("disabled")
    @$day.html html

  onDayChange: ->
#    subject = @$subject.val()
#    grade   = @$grade.val()
    week    = @$week.val()
    day     = @$day.val()
    dayArr = day.split("_")
    id = dayArr[1]

#    Tangerine.router.navigate "lesson/#{subject}/#{grade}/#{week}/#{day}", false
    Tangerine.router.navigate "run/#{id}", false
    window.location.reload()




