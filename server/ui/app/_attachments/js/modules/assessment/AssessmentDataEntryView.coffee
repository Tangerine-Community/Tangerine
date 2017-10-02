class AssessmentDataEntryView extends Backbone.View

  events: 
    "change #subtest_select" : "updateCurrent"
    'click .prev_subtest'    : 'prevSubtest'
    'click .next_subtest'    : 'nextSubtest'
    'click .save' : 'saveResult'

  prevSubtest: ->
    select = document.getElementById("subtest_select")
    return if select.selectedIndex == 0
    select.selectedIndex = select.selectedIndex - 1
    @updateCurrent()
    

  nextSubtest: ->
    select = document.getElementById("subtest_select")
    return if select.selectedIndex == $("#subtest_select option").length - 1
    select.selectedIndex = select.selectedIndex + 1

    @updateCurrent()

  initialize: (options) ->
    @savedOn = {}
    # assessment
    @[key] = value for key, value of options
    @result = new Result
      assessmentId : @assessment.id
      dataEntry    : true
      blank        : true
    @views = []
    @viewsBySubtestId = {}

  render: ->

    selector = "
      <button class='prev_subtest'>&lt;</button>
      <select id='subtest_select'>
        #{("<option data-subtestId='#{subtest.id}' #{if i is 0 then "selected='selected'" else ''}>#{subtest.get("name")}</option>" for subtest, i in @assessment.subtests.models).join('')}
      </select> 
      <button class='next_subtest'>&gt;</button>
      <br>
    "

    subtests = "
      <section id='current_subtest'>
        #{("<div id='#{subtest.id}' class='confirmation subtest_container'></div>" for subtest in @assessment.subtests.models).join('')}
      </section>
    "

    @$el.html "
      <a href='#assessments'><button class='navigation'>Back</button></a><br>

      <h1>#{@assessment.escape("name")}</h1>

      #{selector}
      <button class='command save'>Save</button> <small class='small_grey last_saved'></small>
      #{subtests}
    "

    for subtest in @assessment.subtests.models
      prototype = subtest.get("prototype")
      @["#{prototype}Init"](subtest)

    @$subEl = @$el.find("#current_subtest")

    @updateCurrent()

    @result.set "subtestData", (@subtestDataObject(view.model) for view in @views)

    @result.add
      name : "Assessment complete"
      prototype: "complete"
      data :
        "comment" : "Data entry feature"
        "end_time" : (new Date()).getTime()
      subtestId : "result"

    @trigger "rendered"

  updateCurrent: =>

    Utils.working true

    @saveResult
      error: =>
        Utils.midAlert "Result save error"
        Utils.working false
      success: =>
        Utils.working false
        @subtestId = @$el.find("#subtest_select option:selected").attr("data-subtestId")
        @$subEl.find(".subtest_container").hide()
        @$subEl.find("##{@subtestId}").show()
        @subtest = @assessment.subtests.get(@subtestId)
        @trigger "rendered"
        @savedOn[@subtestId] = true

  saveResult: (callbacks = {}) =>

    return callbacks.success() unless @subtest?

    @result.insert @subtestDataObject(@subtest)

    @result.save null,
      success: (model) =>
        @$el.find(".last_saved").html "Last saved: " + moment(new Date(@result.get('updated'))).format('MMM DD HH:mm')
        callbacks.success?(model)
      error: (error, msg) =>
        console.log "save error"
        console.log arguments
        callbacks.error?(error, msg)


  updateCompletedResult: ->
    if _.keys(@savedOn).length == @views.length

      result = 
        name : "Assessment complete"
        prototype: "complete"
        data :
          "comment" : @$el.find('#additional_comments').val() || ""
          "end_time" : (new Date()).getTime()
        subtestId : "result"

      if not @completedAlready
        @result.add result
        @completedAlready = true
      else
        @result.insert result
        @resultSave()


  subtestDataObject: (subtest) ->

    view = @viewsBySubtestId[subtest.id]

    return {
      name        : subtest.get "name"
      data        : view.getResult()
      subtestHash : subtest.get "hash"
      subtestId   : subtest.id
      prototype   : subtest.get "prototype"
    }

  gridInit: (subtest) ->
    view = new GridRunView 
      model     : subtest
      dataEntry : true
    @addRenderView view, subtest

  surveyInit: (subtest) ->
    view = new SurveyRunView 
      model: subtest
      dataEntry : true
      parent:
        gridWasAutostopped: -> return false
    @addRenderView view, subtest

  locationInit: (subtest) ->
    view = new LocationRunView 
      model: subtest
      dataEntry : true

    @addRenderView view, subtest

  datetimeInit: (subtest) ->
    view = new DatetimeRunView 
      model: subtest
      dataEntry : true
    @addRenderView view, subtest

  idInit: (subtest) ->
    view = new IdRunView 
      model: subtest
      dataEntry : true
    @addRenderView view, subtest

  consentInit: (subtest) ->
    view = new ConsentRunView 
      model: subtest
      dataEntry : true
    @addRenderView view, subtest

  addRenderView: (view, subtest) ->
    $element = @$el.find("##{subtest.id}")
    view.setElement $element
    view.render()
    @viewsBySubtestId[subtest.id] = view
    
    @views.push view
