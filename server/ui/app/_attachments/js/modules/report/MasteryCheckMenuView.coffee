class MasteryCheckMenuView extends Backbone.View

  className : "MasteryCheckMenuView"

  events:
    'change .student_selector' : 'gotoMasteryCheckReport'

  gotoMasteryCheckReport: (event) ->
    Tangerine.router.navigate "report/masteryCheck/" + @$el.find(event.target).find(":selected").attr("data-studentId"), true

  initialize: (options) ->
    @parent    = options.parent
    @klass     = @parent.options.klass
    @curricula = @parent.options.curricula
    allStudents = new Students
    allStudents.fetch
      success: (collection) =>
        @students = collection.where 
          klassId : @klass.id
        @ready = true
        @render()

  render: ->

    if @ready

      # quick data check
      if @students.length == 0
        @$el.html "Please add students to this class."
        return

      html = "
        <select class='student_selector'>
          <option disabled='disabled' selected='selected'>#{t('select a student')}</option>
          "
      for student in @students
        html += "<option data-studentId='#{student.id}'>#{student.get('name')}</option>"
      html += "</select>"
          
      @$el.html html
    else
      @$el.html "<img src='images/loading.gif' class='loading'>"