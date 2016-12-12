#
# Classes
#

class LessonMenuView extends Backbone.View

  className : "LessonMenuView"

  events :
    "change #week"    : "onWeekChange"
    "change #day"     : "onDayChange"
#    "click #day"     : "onDayChange"

  update: ->


  initialize: ( options = {} )->
    @available = options.available
    @render()

  render: ->

    @$el.html "

      <label for='week'>Week</label>
      <select id='week'><option selected='true'>Select</option></select>

      <label for='day'>Day</label>
      <select id='day' disabled><option selected='true'>Select</option></select>
    "

    @$week    = @$el.find("#week")
    @$day     = @$el.find("#day")

    @updateWeek()
    @onWeekChange()

  updateWeek: =>

    html = ""
    alreadyDone = []
#    We must first identify which one must be selected.
    preSelectedWeek = null
    for element in @available
      week = element[0]
      selected = element[3]
      if selected?
        preSelectedWeek = week
    console.log("preSelectedWeek: " + preSelectedWeek)
    for element in @available
      week = element[0]
      selected = element[3]
      if !~alreadyDone.indexOf(week)
        if selected?
  #          html += "<option value='#{week}'>#{week}</option>"
          html += "<option value='#{week}' selected='true'>#{week}</option>"
        else
          if week == preSelectedWeek
            html += "<option value='#{week}'selected='true'>#{week}</option>"
          else
            html += "<option value='#{week}'>#{week}</option>"
      unless ~alreadyDone.indexOf(week)
        alreadyDone.push week
#    html = "<option disabled='disabled'>Select</option>" + html
    html = "<option>Select</option>" + html
    @$week.html html

  onWeekChange: ->

    selectedWeek    = @$week.val()
    rows = []
#    alreadyDone = []
    for element in @available
      day = element[1]
      id = element[2]
      selected = element[3]
#      if element[0] is selectedWeek and !~alreadyDone.indexOf(day)
      if element[0] is selectedWeek
        if selected?
          rows.push order:day, html: "<option value='#{day}_#{id}'  selected='true'>#{day}</option>"
        else
          rows.push order:day, html: "<option value='#{day}_#{id}'>#{day}</option>"
    html = rows.sort((a, b)->a.order-b.order).map((e)->e.html).join('')
    html = "<option>Select</option>" + html

    @$day.removeAttr("disabled")
    @$day.html html

  onDayChange: ->
#    subject = @$subject.val()
#    grade   = @$grade.val()
    week    = @$week.val()
    day     = @$day.val()
    if (day == "Select")
      return
    dayArr = day.split("_")
    id = dayArr[1]

    #    Tangerine.router.navigate "lesson/#{subject}/#{grade}/#{week}/#{day}", false
    Tangerine.router.navigate "runMar/#{id}", false
    window.location.reload()




