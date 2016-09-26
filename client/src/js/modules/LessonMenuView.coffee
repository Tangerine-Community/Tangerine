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

    Mmlp.$db.view "mmlp/lesson",
      include_docs: true
      key: [ @subject, @grade, @week, @day ]
      success: (response) =>
        return error?() if response.rows.length is 0
        attributes = _(response.rows).first().doc
        @set attributes
        callback?()
      error: =>
        error?()

class LessonView extends Backbone.View

  className : "LessonView"
  
  initialize: () ->
    @lesson = new Lesson

  render : =>

    # nothing to render. render tripped early
    return unless @lesson.get("grade")?

    unless @lesson.has("subject")
    
      return @$el.html "
        <div class='lesson-language'>#{@lesson.subject}</div>
        <div class='lesson-info'>
          class #{@lesson.grade}<br>
          week #{@lesson.week} day #{@lesson.day}
        </div>
        <p>No lesson plan available.</p>
      "

    subject    = Mmlp.enum.subjects[@lesson.get("subject")]

    grade      = @lesson.get("grade")

    day        = @lesson.get("day")
    week       = @lesson.get("week")

    lessonText = @lesson.get("lessonText")


    replaces = [
      { # remove font size css
        from : [/font\-size(.+?);/g]
        to   : ''
      },
      { # fix audio links
        from : [/src="lessons/g]
        to   : "src=\"%2Fmmlp%2F_design%2Flessons"
      },
      { # fix audio links
        from : [/src='lessons/g]
        to   : "src=\'%2Fmmlp%2F_design%2Flessons"
      },
      { # fix urls
        from : [/%2F/g]
        to   : "/"
      },
      {
        from: ["▄"]
        to:'<img src="/mmlp/_design/mmlp/img/rectangle.png">'
      },
      {
        from: ["▲"]
        to:'<img src="/mmlp/_design/mmlp/img/triangle.png">'
      },
      {
        from: ["⬬"]
        to: '<img src="/mmlp/_design/mmlp/img/ellipse.png">'
      }
    ]


    for element in replaces
      for oneFrom in element.from
        lessonText = lessonText.replace oneFrom, element.to


    $lesson = $(lessonText)

    $lesson.find("audio").each ( i, a ) ->
      $a = $(a)
      $a.attr "controls", false
      $a.after "<button onClick='$(this).prev().prev()[0].pause();'>Pause</button>"
      $a.after "<button onClick='$(this).prev()[0].play();'>Play</button>"


    $specialSpans = $lesson.find("span[style]").filter (i, a) ->
        style = $(a).attr('style')
        ~style.indexOf("Webdings") or 
        ~style.indexOf("Wingdings")

    $specialSpans.each (i, a) ->
      $a = $(a)

      char = $.trim($a.html()).replace('&nbsp;','')

      if      char is ""
        $a.replaceWith('<img src="/mmlp/_design/mmlp/img/home.png">')
      else if char is "?"
        $a.replaceWith('<img src="/mmlp/_design/mmlp/img/hand.png">')
      else if char is "&acute;" or char is "´" or char is ""
        $a.replaceWith('<img src="/mmlp/_design/mmlp/img/question.png">')
      else if char is"" or char is ""
        $a.replaceWith('<img src="/mmlp/_design/mmlp/img/speak.png">')
      else if char is '&amp;' or char is ""
        $a.replaceWith('<img src="/mmlp/_design/mmlp/img/book.png">')
      else if char is "" or char is "p" or char is "" or char is "▲"
        $a.replaceWith('<img src="/mmlp/_design/mmlp/img/triangle.png">')
      else if char is ""
        $a.replaceWith('<img src="/mmlp/_design/mmlp/img/star.png">')
      else if char is ""
        $a.replaceWith('<img src="/mmlp/_design/mmlp/img/circle.png">')
      else if char is "" or char is ""
        $a.replaceWith('<img src="/mmlp/_design/mmlp/img/square.png">')
      else if char is ""
        $a.replaceWith('<img src="/mmlp/_design/mmlp/img/diamond.png">')
      else if char is "" or char is "$"
        $a.replaceWith('<img src="/mmlp/_design/mmlp/img/glasses.png">')
      else if char is "C"
        $a.replaceWith('<img src="/mmlp/_design/mmlp/img/thumbs-up.png">')
      else if char is ""
        $a.replaceWith('<img src="/mmlp/_design/mmlp/img/listen.png">')
      else if char is ""
        $a.replaceWith('<img src="/mmlp/_design/mmlp/img/music.png">')
      else if char is ""
        $a.replaceWith('<img src="/mmlp/_design/mmlp/img/lips.png">')
      else if char is "" or char is ""
        $a.replaceWith('<img src="/mmlp/_design/mmlp/img/hollow.png">')


    imageUrls  = @lesson.get("image")

    imageHtml = ("<img src='/mmlp/_design/#{decodeURIComponent(url)}'>" for url in imageUrls).join('')

    @$el.html "
      <div class='clearfix'>
        <div class='lesson-language'>#{subject}</div>
        <div class='lesson-info'>
          class #{grade}<br>
          week #{week} day #{day}
        </div>
      </div>
      <div class='image-container'>#{imageHtml}</div>
      <div class='lesson-text'></div>
    "

    @$el.find(".lesson-text").append $lesson


  select: (subjectName, grade, week, day) ->

    subject = Mmlp.enum.iSubjects[subjectName]

    menu = Mmlp.MenuView
    menu.updateSubject()
    menu.$subject.val(subjectName)
    menu.onSubjectChange()
    menu.$grade.val(grade)
    menu.onGradeChange()
    menu.$week.val(week)
    menu.onWeekChange()
    menu.$day.val(day)

    @lesson.fetch subject, grade, week, day, => 
      @render()


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
      if element[0] is selectedSubject and 
         element[1] is selectedGrade and 
         element[2] is selectedWeek and
         !~alreadyDone.indexOf(day)

        rows.push order:day, html: "<option value='#{day}'>#{day}</option>"

    html = rows.sort((a, b)->a.order-b.order).map((e)->e.html).join('')
    html = "<option disabled='disabled' selected='true'>Select</option>" + html

    @$day.removeAttr("disabled")
    @$day.html html

  onDayChange: ->
    subject = @$subject.val()
    grade   = @$grade.val()
    week    = @$week.val()
    day     = @$day.val()

    Mmlp.router.navigate "lesson/#{subject}/#{grade}/#{week}/#{day}", false
    window.location.reload()

class MmlpRouter extends Backbone.Router

  routes: 
    'lesson/:subject/:grade/:week/:day' : 'lesson'

  lesson: (options...) ->

    subject = options[0]
    grade   = options[1]
    week    = options[2]
    day     = options[3]

    Mmlp.LessonView.select subject, grade, week, day



