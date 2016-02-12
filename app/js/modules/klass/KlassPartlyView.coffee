class KlassPartlyView extends Backbone.View

  className : "KlassPartlyView"

  events:
    "click .next_part"                : "nextPart"
    "click .prev_part"                : "prevPart"
    "click .back"                     : "back"
    "click .student_subtest"          : "gotoStudentSubtest"
    "keyup #current_part"             : "gotoAssessment"
    "keyup #search_student_name"      : "filterStudents"
    "focus #search_student_name"      : "scrollToName"

  scrollToName: ->
    @$el.find("#search_student_name").scrollTo()

  filterStudents: ->
    val = @$el.find("#search_student_name").val()
    @search = val
    @updateGridPage()

  gotoAssessment: ->
    val = @$el.find("#current_part").val()
    if val == "" then return
    @currentPart = parseInt(val)
    @updateGridPage()

  update: ->
    @render()
    Tangerine.router.navigate "class/#{@options.klass.id}/#{@currentPart}"

  back: ->
    Tangerine.router.navigate "class", true

  gotoStudentSubtest: (event) ->
    studentId = $(event.target).attr("data-studentId")
    subtestId = $(event.target).attr("data-subtestId")
    Tangerine.router.navigate "class/result/student/subtest/#{studentId}/#{subtestId}", true

  nextPart: ->
    if @currentPart < @lastPart
      @currentPart++
      @update()

  prevPart: -> 
    if @currentPart > 1
      @currentPart-- 
      @update()

  initialize: (options) ->
    @search = ""
    @currentPart = options.part || 1
    @subtestsByPart = []

    @subtestsByPart = options.subtests.indexBy "part"

    @lastPart = Math.max.apply(@, _.compact(options.subtests.pluck("part"))) || 1

  updateGridPage:->
    @$el.find("#grid_container").html @getGridPage()

  getGridPage: ->
    table = []
    subtestsThisPart = @subtestsByPart[@currentPart]
    return "No subtests for this assessment." if not subtestsThisPart?

    for student, i in @options.students.models
      table[i] = []

      resultsForThisStudent = new KlassResults @options.results.where "studentId" : student.id

      for subtest, j in subtestsThisPart
        studentResult = resultsForThisStudent.where "subtestId" : subtest.id
        taken = studentResult.length != 0
        if ~student.get("name").toLowerCase().indexOf(@search.toLowerCase()) || @search == ""

          # count back to forward to get recency of last result for color coding
          for k in [6..0]
            partTest = @currentPart - k
            search = resultsForThisStudent.where("part" : partTest, "itemType" : subtest.get("itemType"))
            recency = k if search.length

          background =
            if recency <= 2
              ""
            else if recency <= 4
              "rgb(229, 208, 149)"
            else
              "rgb(222, 156, 117)"

          table[i].push
            "content"   : if taken then "&#x2714;" else "?"
            "taken"     : taken
            "studentId" : student.id
            "studentName" : student.get("name")
            "subtestId" : subtest.id
            "background" : background


    # make headers
    gridPage = "<table class='info_box_wide'><tbody><tr><th></th>"
    for subtest in subtestsThisPart
      gridPage += "<th><div class='part_subtest_report' data-id='#{subtest.id}'>#{subtest.get('name')}</div></th>"
    gridPage += "</tr>"
    for row in table
      if row? && row.length
        gridPage += "<tr><td><div class='student' data-studentId='#{row[0].studentId}'>#{row[0].studentName}</div></td>"
        for cell, column in row
          takenClass = if cell.taken then " subtest_taken" else ""
          gridPage += "<td><div class='student_subtest command #{takenClass}' data-taken='#{cell.taken}' data-studentId='#{cell.studentId}' data-subtestId='#{cell.subtestId}' style='background-color:#{cell.background} !important;'>#{cell.content}</div></td>"
        gridPage += "</tr>"
    gridPage += "</tbody></table>"

    if _.flatten(table).length == 0
      gridPage = "<p class='grey'>No students found.</p>"

    return gridPage


  render: ->
    
    gridPage = @getGridPage()
    
    @$el.html "
      <h1>#{t('assessment status')}</h1>
      <input id='search_student_name' style='width: 92% !important' placeholder='#{t('search student name')}' type='text'>

      <div id='grid_container'>#{gridPage}</div><br>
      <h2>#{t('current assessment')} </h2>
      
      <button class='prev_part command'>&lt;</button> <input type='number' value='#{@currentPart}' id='current_part'> <button class='next_part command'>&gt;</button><br><br>
      <button class='back navigation'>#{t('back')}</button> 
      "

    @trigger "rendered"