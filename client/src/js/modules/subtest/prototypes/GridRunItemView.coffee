class GridRunItemView extends Backbone.Marionette.ItemView
  className: "gridItem"
  template: JST["Grid"],

  events: if Modernizr.touch then {
    'click .grid_element'     : 'gridClick' #click
    'click .end_of_grid_line' : 'endOfGridLineClick' #click
    'click .start_time'  : 'startTimer'
    'click .stop_time'   : 'stopTimer'
    'click .restart'     : 'restartTimer'
  } else {
    'click .end_of_grid_line' : 'endOfGridLineClick'
    'click .grid_element'     : 'gridClick'
    'click .start_time'       : 'startTimer'
    'click .stop_time'        : 'stopTimer'
    'click .restart'          : 'restartTimer'
  }

  i18n: ->

    @text =
      autostop           : t("GridRunView.message.autostop")
      touchLastItem      : t("GridRunView.message.touch_last_item")
      subtestNotComplete : t("GridRunView.message.subtest_not_complete")

      inputMode     : t("GridRunView.label.input_mode")
      timeRemaining  : t("GridRunView.label.time_remaining")
      wasAutostopped : t("GridRunView.label.was_autostopped")

      mark          : t("GridRunView.button.mark")
      start         : t("GridRunView.button.start")
      stop          : t("GridRunView.button.stop")
      restart       : t("GridRunView.button.restart")
      lastAttempted : t("GridRunView.button.last_attempted")
      "help" : t("SubtestRunView.button.help")


  initialize: (options) ->

    Tangerine.progress.currentSubview = @
    @i18n()

    @fontStyle = "style=\"font-family: #{@model.get('fontFamily')} !important;\"" if @model.get("fontFamily") != ""

    @captureAfterSeconds  = if @model.has("captureAfterSeconds")  then @model.get("captureAfterSeconds")  else 0
    @captureItemAtTime    = if @model.has("captureItemAtTime")    then @model.get("captureItemAtTime")    else false
    @captureLastAttempted = if @model.has("captureLastAttempted") then @model.get("captureLastAttempted") else true
    @endOfLine            = if @model.has("endOfLine")            then @model.get("endOfLine")            else true

    @layoutMode = if @model.has("layoutMode") then @model.get("layoutMode") else "fixed"
    @fontSize   = if @model.has("fontSize")   then @model.get("fontSize")   else "normal"

    if @fontSize == "small"
      fontSizeClass = "font_size_small"
    else
      fontSizeClass = ""

    @rtl = @model.getBoolean "rtl"
    @$el.addClass "rtl-grid" if @rtl

    @totalTime = @model.get("timer") || 0

    @modeHandlers =
      "mark"       : @markHandler
      "last"       : @lastHandler
      "minuteItem" : @intermediateItemHandler
      disabled     : $.noop

    @dataEntry = false unless options.dataEntry

    @model  = options.model
    @parent = @model.parent

    @resetVariables()

    @gridElement         = _.template "<td><button data-label='{{label}}' data-index='{{i}}' class='grid_element #{fontSizeClass}' #{@fontStyle || ""}>{{label}}</button></td>"
    @variableGridElement = _.template "<button data-label='{{label}}' data-index='{{i}}' class='grid_element #{fontSizeClass}' #{@fontStyle || ""}>{{label}}</button>"

    if @layoutMode == "fixed"
      @endOfGridLine = _.template "<td><button data-index='{{i}}' class='end_of_grid_line'>*</button></td>"
    else
      @endOfGridLine = _.template ""

    labels = {}
    labels.text = @text
    @model.set('labels', labels)

    @skippable = @model.get("skippable") == true || @model.get("skippable") == "true"
    @backable = ( @model.get("backButton") == true || @model.get("backButton") == "true" ) and @parent.index isnt 0

#    if @skippable == true
#    console.log("change:skippable")
#      @trigger 'skippable:changed'
    @parent.displaySkip(@skippable)


#    if @backable == true
#    console.log("change:backable")
#      @trigger 'backable:changed'
    @parent.displayBack(@backable)

#    ui = {}
#    ui.skipButton = "<button class='skip navigation'>#{@text.skip}</button>" if skippable
#    ui.backButton = "<button class='subtest-back navigation'>#{@text.back}</button>" if backable
#    ui.text = @text
#    @model.set('ui', ui)

  ui:
    modeButton: ".mode-button"

  onBeforeRender: ->

    done = 0

    displayRtl = "rtl_mode" if @rtl

    startTimerHTML = "<div class='timer_wrapper  #{displayRtl||''}'><button class='start_time time'>#{@text.start}</button><div class='timer'>#{@timer}</div></div>"

    disabling = "disabled" unless @untimed

    html = if not @untimed then startTimerHTML else ""

    gridHTML = ""

    if @layoutMode == "fixed"
      gridHTML += "<table class='grid #{disabling} #{displayRtl||''}'>"
      firstRow = true
      loop
        break if done > @items.length
        gridHTML += "<tr>"
        for i in [1..@columns]
          if done < @items.length
            gridHTML += @gridElement { label : _.escape(@items[@itemMap[done]]), i: done+1 }
          done++
        # don't show the skip row button for the first row
        if firstRow
          gridHTML += "<td></td>" if done < ( @items.length + 1 ) && @endOfLine
          firstRow = false
        else
          gridHTML += @endOfGridLine({i:done}) if done < ( @items.length + 1 ) && @endOfLine

        gridHTML += "</tr>"
      gridHTML += "</table>"
    else
      gridHTML += "<div class='grid #{disabling} #{displayRtl||''}'>"
      for item, i in @items
        gridHTML += @variableGridElement
          "label" : _.escape(@items[@itemMap[i]])
          "i"     : i+1
      gridHTML += "</div>"
    html += gridHTML
    stopTimerHTML = "<div class='timer_wrapper'><button class='stop_time time'>#{@text.stop}</button></div>"

    restartButton = "
      <div>
        <button class='restart command'>#{@text.restart}</button>
        <br>
      </div>
    "

    #
    # Mode selector
    #

    # if any other option is avaialbe other than mark, then show the selector
    if @captureLastAttempted || @captureItemAtTime

      @modeButton?.close()

      model = new Button()

      buttonConfig =
        options : []
        mode    : "single"
        model   : model
        answer  : "last"

      buttonConfig.options.push {
        label : @text.mark
        value : "mark"
      }

      buttonConfig.options.push {
        label : t( "item at __seconds__ seconds", seconds : @captureAfterSeconds )
        value : "minuteItem"
      } if @captureItemAtTime

      buttonConfig.options.push {
        label : @text.lastAttempted
        value : "last"
      } if @captureLastAttempted

      @modeButton = new ButtonItemView buttonConfig

      @listenTo @modeButton, "change click", @updateMode
      modeSelector = "
        <div class='grid_mode_wrapper question clearfix'>
          <label>#{@text.inputMode}</label><br>
          <div class='mode-button'></div>
        </div>
      "

    dataEntry = "
      <table class='class_table'>

        <tr>
          <td>#{@text.wasAutostopped}</td><td><input type='checkbox' class='data_autostopped'></td>
        </tr>

        <tr>
          <td>#{@text.timeRemaining}</td><td><input type='number' class='data_time_remain'></td>
        </tr>
      </table>
    "

    html += "
      #{if not @untimed then stopTimerHTML else ""}
      #{if not @untimed then restartButton else ""}
      #{modeSelector || ''}
      #{(dataEntry if @dataEntry) || ''}
    "
    @model.set('grid', html)

#    @$el.html html

#    @modeButton.setElement @$el.find ".mode-button"
#    @modeButton.render()



  onRender: =>

    @modeButton?.setElement @$el.find ".mode-button"
    @modeButton?.render()

    @trigger "rendered"
    @trigger "ready"

    unless @dataEntry

      previous = @model.parent.result.getByHash(@model.get('hash'))
      if previous
        @markRecord = previous.mark_record

        for item, i in @markRecord
          @markElement item, null, 'populate'

        @itemAtTime = previous.item_at_time
        $target = @$el.find(".grid_element[data-index=#{@itemAtTime}]")
        $target.addClass "element_minute"

        @lastAttempted = previous.attempted
        $target = @$el.find(".grid_element[data-index=#{@lastAttempted}]")
        $target.addClass "element_last"

  onShow: ->
    displayCode = @model.getString("displayCode")

    if not _.isEmptyString(displayCode)
#      displaycodeFixed = displayCode.replace("vm.currentView.subtestViews[vm.currentView.index].prototypeView","Tangerine.progress.currentSubview")
#      displaycodeFixed = displaycodeFixed.replace("@prototypeView","Tangerine.progress.currentSubview")
      displaycodeFixed = displayCode
      if _.size(Tangerine.displayCode_migrations) > 0
        for k,v of Tangerine.displayCode_migrations
          displaycodeFixed = displaycodeFixed.replace(k,v)
      try
        CoffeeScript.eval.apply(@, [displaycodeFixed])
      catch error
        name = ((/function (.{1,})\(/).exec(error.constructor.toString())[1])
        message = error.message
        alert "#{name}\n\n#{message}"
        console.log "displaycodeFixed Error: " + message

    @prototypeView?.updateExecuteReady?(true)

# @todo Documentation
  skip: =>
    currentView = Tangerine.progress.currentSubview
    @parent.result.add
      name      : currentView.model.get "name"
      data      : currentView.getSkipped()
      subtestId : currentView.model.id
      skipped   : true
      prototype : currentView.model.get "prototype"
    ,
      success: =>
        @parent.reset 1

  restartTimer: ->
    @stopTimer(simpleStop:true) if @timeRunning

    @resetVariables()

    @$el.find(".element_wrong").removeClass "element_wrong"

  gridClick: (event) =>
    event.preventDefault()
    @modeHandlers[@mode]?(event)

  markHandler: (event) =>
    $target = $(event.target)
    index = $target.attr('data-index')

    indexIsntBelowLastAttempted = parseInt(index) > parseInt(@lastAttempted)
    lastAttemptedIsntZero       = parseInt(@lastAttempted) != 0
    correctionsDisabled         = @dataEntry is false and @parent?.enableCorrections is false

    return if correctionsDisabled && lastAttemptedIsntZero && indexIsntBelowLastAttempted

    @markElement(index)
    @checkAutostop() if @autostop != 0


  intermediateItemHandler: (event) =>
    @timeIntermediateCaptured = @getTime() - @startTime
    $target = $(event.target)
    index = $target.attr('data-index')
    @itemAtTime = index
    $target.addClass "element_minute"
    @updateMode "mark"

  checkAutostop: ->
    if @timeRunning
      autoCount = 0
      for i in [0..@autostop-1]
        if @gridOutput[i] == "correct" then break
        autoCount++
      if @autostopped == false
        if autoCount == @autostop then @autostopTest()
      if @autostopped == true && autoCount < @autostop && @undoable == true then @unAutostopTest()

# mode is used for operations like pre-populating the grid when doing corrections.
  markElement: (index, value = null, mode) ->
# if last attempted has been set, and the click is above it, then cancel

    correctionsDisabled         = @dataEntry is false and @parent?.enableCorrections? and @parent?.enableCorrections is false
    lastAttemptedIsntZero       = parseInt(@lastAttempted) != 0
    indexIsntBelowLastAttempted = parseInt(index) > parseInt(@lastAttempted)

    return if correctionsDisabled and lastAttemptedIsntZero and indexIsntBelowLastAttempted

    $target = @$el.find(".grid_element[data-index=#{index}]")
    if mode != 'populate'
      @markRecord.push index

    if not @autostopped
      if value == null # not specifying the value, just toggle
        @gridOutput[index-1] = if (@gridOutput[index-1] == "correct") then "incorrect" else "correct"
        $target.toggleClass "element_wrong"
      else # value specified
        @gridOutput[index-1] = value
        if value == "incorrect"
          $target.addClass "element_wrong"
        else if value == "correct"
          $target.removeClass "element_wrong"

  endOfGridLineClick: (event) ->
    event.preventDefault()
    if @mode == "mark"
      $target = $(event.target)

      # if what we clicked is already marked wrong
      if $target.hasClass("element_wrong")
# YES, mark it right
        $target.removeClass "element_wrong"
        index = $target.attr('data-index')
        for i in [index..(index-(@columns-1))]
          @markElement i, "correct"
      else if !$target.hasClass("element_wrong") && !@autostopped
# NO, mark it wrong
        $target.addClass "element_wrong"
        index = $target.attr('data-index')
        for i in [index..(index-(@columns-1))]
          @markElement i, "incorrect"

      @checkAutostop() if @autostop != 0

  lastHandler: (event, index) =>
    if index?
      $target = @$el.find(".grid_element[data-index=#{index}]")
    else
      $target = $(event.target)
      index   = $target.attr('data-index')

    if index - 1 >= @gridOutput.lastIndexOf("incorrect")
      @$el.find(".element_last").removeClass "element_last"
      $target.addClass "element_last"
      @lastAttempted = index

  floatOn: ->
    timer = @$el.find('.timer')
    timerPos = timer.offset()
    $(window).on 'scroll', ->
      scrollPos = $(window).scrollTop()
      if scrollPos >= timerPos.top
        timer.css
          position: "fixed"
          top: "10%"
          left: "80%"
      else
        timer.css
          position: "initial"
          top: "initial"
          left: "initial"

  floatOff: ->
    $(window).off 'scroll'
    timer = @$el.find('.timer')
    timer.css
      position: "initial"
      top: "initial"
      left: "initial"


  startTimer: ->
    if @timerStopped == false && @timeRunning == false
      @interval = setInterval( @updateCountdown, 1000 ) # magic number
      @startTime = @getTime()
      @timeRunning = true
      @updateMode "mark"
      @enableGrid()
      @updateCountdown()
      @floatOn()

  enableGrid: ->
    @$el.find("table.disabled, div.disabled").removeClass("disabled")

  stopTimer: (event, message = false) ->

    return if @timeRunning != true # stop only if needed

    if event?.target
      @lastHandler(null, @items.length)

    # do these always
    clearInterval @interval
    @stopTime = @getTime()
    @timeRunning = false
    @timerStopped = true
    @floatOff()

    @updateCountdown()

# do these if it's not a simple stop
#if not event?.simpleStop
#Utils.flash()


  autostopTest: ->
    Utils.flash()
    clearInterval @interval
    @stopTime = @getTime()
    @autostopped = true
    @timerStopped = true
    @timeRunning = false
    @$el.find(".grid_element").slice(@autostop-1,@autostop).addClass "element_last" #jquery is weird sometimes
    @lastAttempted = @autostop
    @timeout = setTimeout(@removeUndo, 3000) # give them 3 seconds to undo. magic number
    Utils.topAlert @text.autostop

  removeUndo: =>
    @undoable = false
    @updateMode "disabled"
    clearTimeout(@timeout)

  unAutostopTest: ->
    @interval = setInterval(@updateCountdown, 1000 ) # magic number
    @updateCountdown()
    @autostopped = false
    @lastAttempted = 0
    @$el.find(".grid_element").slice(@autostop-1,@autostop).removeClass "element_last"
    @timeRunning = true
    @updateMode "mark"
    Utils.topAlert t("GridRunView.message.autostop_cancel")

  updateCountdown: =>
# sometimes the "tick" doesn't happen within a second
    @timeElapsed = Math.min(@getTime() - @startTime, @timer)

    @timeRemaining = @timer - @timeElapsed

    @$el.find(".timer").html @timeRemaining

    if @timeRunning is true and @captureLastAttempted and @timeRemaining <= 0
      @stopTimer(simpleStop:true)
      Utils.background "red"
      _.delay(
        =>
          alert @text.touchLastItem
          Utils.background ""
      , 1e3) # magic number

      @updateMode "last"

#    Dealing with browser compat issues
    captureItemAtTime = @captureItemAtTime == true || @captureItemAtTime == "true"
    gotIntermediate = @gotIntermediate == true || @gotIntermediate == "true"
    minuteMessage = @minuteMessage == true || @minuteMessage == "true"
    timeElapsed = (@timeElapsed >= parseInt(@captureAfterSeconds))
#    console.log("FALS captureItemAtTime: " + captureItemAtTime + " !gotIntermediate: " + !gotIntermediate + " !minuteMessage: " + !minuteMessage + " timeElapsed: " + timeElapsed)
    if (captureItemAtTime && !gotIntermediate && !minuteMessage && timeElapsed) == true
#      console.log("TRUE captureItemAtTime: " + captureItemAtTime + " !gotIntermediate: " + !gotIntermediate + " !minuteMessage: " + !minuteMessage + " timeElapsed: " + timeElapsed)
      Utils.flash "yellow"
      Utils.midAlert t("please select the item the child is currently attempting")
      @minuteMessage = true
      @mode = "minuteItem"

  updateMode: ( mode = null ) =>
# dont' change the mode if the time has never been started
    if (mode==null && @timeElapsed == 0 && not @dataEntry) || mode == "disabled"
      @modeButton?.setValue null
    else if mode? # manually change the mode
      @mode = mode
      @modeButton?.setValue @mode
    else # handle a click event
      @mode = @modeButton?.getValue()

  getTime: ->
    Math.round((new Date()).getTime() / 1000)

  resetVariables: ->

    @timer    = parseInt(@model.get("timer")) || 0
    @untimed  = @timer == 0 || @dataEntry # Do not show the timer if it's disasbled or data entry mode

    @gotMinuteItem = false
    @minuteMessage = false
    @itemAtTime = null

    @timeIntermediateCaptured = null

    @markRecord = []

    @timerStopped = false

    @startTime = 0
    @stopTime  = 0
    @timeElapsed = 0
    @timeRemaining = @timer
    @lastAttempted = 0

    @interval = null

    @undoable = true

    @timeRunning = false


    @items    = _.compact(@model.get("items")) # mild sanitization, happens at save too

    @itemMap = []
    @mapItem = []

    if @model.has("randomize") && @model.get("randomize")
      @itemMap = @items.map (value, i) -> i

      @items.forEach (item, i) ->
        temp = Math.floor(Math.random() * @items.length)
        tempValue = @itemMap[temp]
        @itemMap[temp] = @itemMap[i]
        @itemMap[i] = tempValue
      , @

      @itemMap.forEach (item, i) ->
        @mapItem[@itemMap[i]] = i
      , @
    else
      @items.forEach (item, i) ->
        @itemMap[i] = i
        @mapItem[i] = i
      , @

    if !@captureLastAttempted && !@captureItemAtTime
      @mode = "mark"
    else
      @mode = "disabled"

    @mode = "mark" if @dataEntry

    @gridOutput = @items.map -> 'correct'
    @columns  = parseInt(@model.get("columns")) || 3

    @autostop = if @untimed then 0 else (parseInt(@model.get("autostop")) || 0)
    @autostopped = false

    @$el.find(".grid_element").removeClass("element_wrong").removeClass("element_last").addClass("disabled")
    @$el.find("table").addClass("disabled")

    @$el.find(".timer").html @timer

    unless @dataEntry

      previous = @model.parent.result.getByHash(@model.get('hash'))
      if previous

        @captureLastAttempted     = previous.capture_last_attempted
        @itemAtTime               = previous.item_at_time
        @timeIntermediateCaptured = previous.time_intermediate_captured
        @captureItemAtTime        = previous.capture_item_at_time
        @autostop                 = previous.auto_stop
        @lastAttempted            = previous.attempted
        @timeRemaining            = previous.time_remain
        @markRecord               = previous.mark_record

    @updateMode @mode if @modeButton?

  isValid: ->
    # Stop timer if still running. Issue #240
    @stopTimer() if @timeRunning

    if parseInt(@lastAttempted) is @items.length and @timeRemaining is 0

      item = @items[@items.length-1]
      if confirm(t("GridRunView.message.last_item_confirm", item:item))
        @updateMode
        return true
      else
        @messages = if @messages?.push then @messages.concat([msg]) else [msg]
        @updateMode "last"
        return false

    return false if @captureLastAttempted && @lastAttempted == 0
    # might need to let it know if it's timed or untimed too ::shrug::
    return false if @timeRunning == true
    return false if @timer != 0 && @timeRemaining == @timer
    true

  testValid: ->
#    console.log("GridRunItemView testValid.")
    #    if not @prototypeRendered then return false
    #    currentView = Tangerine.progress.currentSubview
    if @isValid?
      return @isValid()
    else
      return false
    true

  showErrors: ->
    messages = @messages || []
    @messages = []

    timerHasntRun    = @timer != 0 && @timeRemaining == @timer
    noLastItem       = @captureLastAttempted && @lastAttempted == 0
    timeStillRunning = @timeRuning == true

    if timerHasntRun
      messages.push @text.subtestNotComplete

    if noLastItem && not timerHasntRun
      messages.push @text.touchLastItem
      @updateMode "last"

    if timeStillRunning
      messages.push @text.timeStillRunning

    Utils.midAlert messages.join("<br>"), 3000 # magic number

  getResult: ->
    completeResults = []
    itemResults = []
    @lastAttempted = @items.length if not @captureLastAttempted
#    console.log("@lastAttempted: " + @lastAttempted)

    for item, i in @items

      if @mapItem[i] < @lastAttempted
        itemResults[i] =
          itemResult : @gridOutput[@mapItem[i]]
          itemLabel  : item
      else
        itemResults[i] =
          itemResult : "missing"
          itemLabel : @items[@mapItem[i]]

#    @lastAttempted = false if not @captureLastAttempted

    if @dataEntry
      autostopped = @$el.find(".data_autostopped").is(":checked")
      timeRemaining = parseInt(@$el.find(".data_time_remain").val())
    else
      autostopped   = @autostopped
      timeRemaining = @timeRemaining

    result =
      "capture_last_attempted"     : @captureLastAttempted
      "item_at_time"               : @itemAtTime
      "time_intermediate_captured" : @timeIntermediateCaptured
      "capture_item_at_time"       : @captureItemAtTime
      "auto_stop"     : autostopped
      "attempted"     : @lastAttempted
      "items"         : itemResults
      "time_remain"   : timeRemaining
      "mark_record"   : @markRecord
      "time_allowed"  : @model.get("timer")
      "variable_name" : @model.get("variableName")
    hash = @model.get("hash") if @model.has("hash")
    subtestResult =
      'body' : result
      'meta' :
        'hash' : hash
#    return result
    return subtestResult

  getSkipped: ->
    itemResults = []

    for item, i in @items
      itemResults[i] =
        itemResult : "skipped"
        itemLabel  : item

    result =
      "capture_last_attempted"     : "skipped"
      "item_at_time"               : "skipped"
      "time_intermediate_captured" : "skipped"
      "capture_item_at_time"       : "skipped"
      "auto_stop"     : "skipped"
      "attempted"     : "skipped"
      "items"         : itemResults
      "time_remain"   : "skipped"
      "mark_record"   : "skipped"
      "variable_name" : @model.get("variableName")

  onClose: ->
    clearInterval(@interval)

  getSum: ->
#    if @prototypeView.getSum?
#      return @prototypeView.getSum()
#    else
# maybe a better fallback
#    console.log("This view does not return a sum, correct?")
    return {correct:0,incorrect:0,missing:0,total:0}

