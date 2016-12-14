class KlassSubtestRunView extends Backbone.Marionette.ItemView

  className : "KlassSubtestRunView"

  events:
    'click .done'         : 'done'
    'click .cancel'       : 'cancel'
    'click .subtest_help' : 'toggleHelp'

  toggleHelp: -> @$el.find(".enumerator_help").fadeToggle(250)

  initialize: (options) ->
    @linkedResult = options.linkedResult
    @student      = options.student
    @subtest      = options.subtest
    @questions    = options.questions
    @subtest.questions     = @questions

    @prototype = @subtest.get("prototype")

    @protoViews = Tangerine.config.get("prototypeViews")

    @prototypeRendered = false

    Tangerine.progress = {}
    Tangerine.progress.currentSubview = @

    if @prototype == "grid"
      @result = new KlassResult
        prototype    : "grid"
        startTime    : (new Date()).getTime()
        itemType     : @subtest.get("itemType")
        reportType   : @subtest.get("reportType")
        studentId    : @student.id
        subtestId    : @subtest.id
        part         : @subtest.get("part")
        klassId      : @student.get("klassId")
        timeAllowed  : @subtest.get("timer")
        blank        : true
    else if @prototype == "survey"
      @result = new KlassResult
        prototype    : "survey"
        startTime    : (new Date()).getTime()
        studentId    : @student.id
        subtestId    : @subtest.id
        part         : @subtest.get("part")
        klassId      : @student.get("klassId")
        itemType     : @subtest.get("itemType")
        reportType   : @subtest.get("reportType")
        blank        : true
      @questions.sort()
      @render()


  render: ->
    enumeratorHelp = if (@subtest.get("enumeratorHelp") || "") != "" then "<button class='subtest_help command'>help</button><div class='enumerator_help'>#{@subtest.get 'enumeratorHelp'}</div>" else ""
    studentDialog  = if (@subtest.get("studentDialog")  || "") != "" then "<div class='student_dialog'>#{@subtest.get 'studentDialog'}</div>" else ""

    @$el.html "
      <h2>#{@subtest.get 'name'}</h2>
      #{enumeratorHelp}
      #{studentDialog}
    "

    @subtest.parent = @

    # Use prototype specific views here
    @prototypeView = new window[@protoViews[@subtest.get 'prototype']['run']]
      model: @subtest
#      parent: @
    @prototypeView.on "rendered", @onPrototypeRendered
    @prototypeView.render()
    @$el.append @prototypeView.el
    @prototypeRendered = true

    @$el.append "<button class='done navigation'>Done</button> <button class='cancel navigation'>Cancel</button>"

    @trigger "rendered"

  onPrototypeRendered: =>
    @trigger "rendered"

  getGridScore: -> 
    return false if not @linkedResult.get("subtestData")? # no result found
    result = @linkedResult.get("subtestData")['attempted'] || 0 
    return result

  gridWasAutostopped: -> @linkedResult.get("subtestData")?['auto_stop'] || 0

  onClose: ->
    @prototypeView?.close?()

  isValid: ->
    if not @prototypeRendered then return false
    if @prototypeView.isValid?
      return @prototypeView.isValid()
    else
      return false
    true

  getSkipped: ->
    if @prototypeView.getSkipped?
      return @prototypeView.getSkipped()
    else
      throw "Prototype skipping not implemented"

  cancel: ->
    if @student.id == "test"
      history.back()
      return

    Tangerine.router.navigate "class/#{@student.get('klassId')}/#{@subtest.get('part')}", true

  done: ->
    if @student.id == "test"
      history.back()
      return

    if @isValid()
      # Guarantee single "new" result
#      Tangerine.$db.view "#{Tangerine.design_doc}/resultsByStudentSubtest",
      Tangerine.db.query('tangerine/resultsByStudentSubtest', {key: [@student.id,@subtest.id]}).then((res) =>
#        key : [@student.id,@subtest.id]
#        success: (data) =>
        rows = res.rows
        for datum in rows
          Tangerine.db.saveDoc $.extend(datum.value, "old":true)
        # save this result
        @result.add @prototypeView.getResult(), =>
          Tangerine.router.navigate "class/#{@student.get('klassId')}/#{@subtest.get('part')}", true
      ).catch( (err) ->
        console.log('Error: ' + err)
      )
    else
      @prototypeView.showErrors()

# @todo Documentation
  displaySkip: (skippable)->
    if skippable
      $( ".skip" ).show();
    else
      $( ".skip" ).hide();

# @todo Documentation
  displayBack: (backable)->
    if backable
      $( ".subtest-back" ).removeClass("hidden");
    else
      $( ".subtest-back" ).addClass("hidden");