class KlassGroupingMenuView extends Backbone.View

  className: "KlassGroupingMenuView"

  events:
    'change .part_selector' : 'gotoKlassGroupingReport'

  gotoKlassGroupingReport: (event) ->
    Tangerine.router.navigate "report/klassGrouping/#{@klass.id}/" + @$el.find(event.target).find(":selected").attr("data-part"), true

  initialize: (options) ->
    @parent    = options.parent
    @klass     = @parent.options.klass
    @curricula = @parent.options.curricula
    @currentPart = @klass.calcCurrentPart()

    @students = new Students
    @students.fetch
      klassId : @klass.id
      success: =>
        allSubtests = new Subtests
        allSubtests.fetch
          success: (collection) =>
            subtests = collection.where 
              curriculaId : @curricula.id
            @parts = []
            for subtest in subtests
              
              part = subtest.get('part')

              @parts[part]         = {} if not @parts[part]?
              @parts[part]["id"]   = subtest.id
              
              if @parts[part]["name"]? 
                @parts[part]["name"] += " " + subtest.get("name")
              else
                @parts[part]["name"] = subtest.get("name")
              @parts[part]["reportType"] = subtest.get("reportType")

            @ready = true
            @render()

  render: ->

    if @ready

      # quick data check
      if not @students? or @students.length == 0
        @$el.html "Please add students to this class."
        return

      html = "
        <select class='part_selector'>
          <option disabled='disabled' selected='selected'>Select an assessment</option>
          "
      for subtest, part in @parts
        if subtest?.id?
          flagForCurrent = if @currentPart == part then "**" else ''
          html += "<option data-part='#{part}' data-subtestId='#{subtest.id}'>#{flagForCurrent} #{part} #{subtest.name}</option>"
      html += "</select>"
          
      @$el.html html
    else
      @$el.html "<img src='images/loading.gif' class='loading'>"