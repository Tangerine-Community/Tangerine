class GridRunView extends Backbone.View

  className: "grid_prototype"

  events: if Modernizr.touch then {
    'touchstart .grid_element' : 'gridClick'
    'touchstart .end_of_grid_line' : 'endOfGridLineClick'
    'click .grid_mode'   : 'updateMode'
    'click .start_time'  : 'startTimer'
    'click .stop_time'   : 'stopTimer'
    'click .restart'     : 'restartTimer'
  } else {
    'click .end_of_grid_line' : 'endOfGridLineClick'
    'click .grid_element'     : 'gridClick'
    'click .grid_mode'        : 'updateMode'
    'click .start_time'       : 'startTimer'
    'click .stop_time'        : 'stopTimer'
    'click .restart'          : 'restartTimer'
  }
  
  restartTimer: ->
    @stopTimer(simpleStop:true) if @timeRunning

    @resetVariables()

    @$el.find(".element_wrong").removeClass "element_wrong"

  gridClick: (event) =>
    @modeHandlers[@mode]?(event)

  markHandler: (event) =>
    $target = $(event.target)
    index = $target.attr('data-index')

    return if parseInt(@lastAttempted) != 0 && parseInt(index) > parseInt(@lastAttempted)
      
    @markElement(index)
    @checkAutostop() if @autostop != 0


  intermediateItemHandler: (event) =>
    @timeIntermediateCaptured = @getTime() - @startTime
    $target = $(event.target)
    index = $target.attr('data-index')
    @itemAtTime = index
    $target.addClass "element_minute"
    @updateMode null, "mark"
    

  checkAutostop: ->
    if @timeRunning
      autoCount = 0
      for i in [0..@autostop-1]
        if @gridOutput[i] == "correct" then break
        autoCount++
      if @autostopped == false
        if autoCount == @autostop then @autostopTest()
      if @autostopped == true && autoCount < @autostop && @undoable == true then @unAutostopTest()

  markElement: (index, value = null) ->
    # if last attempted has been set, and the click is above it, then cancel
    return if parseInt(@lastAttempted) != 0 && parseInt(index) > parseInt(@lastAttempted)

    $target = @$el.find(".grid_element[data-index=#{index}]")
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

  lastHandler: (event) =>
    $target = $(event.target)
    index = $target.attr('data-index')
    if index - 1 >= @gridOutput.lastIndexOf("incorrect")
      @$el.find(".element_last").removeClass "element_last"
      $target.addClass "element_last"
      @lastAttempted = index

  startTimer: ->
    if @timerStopped == false && @timeRunning == false
      @interval = setInterval( @updateCountdown,1000 )
      @startTime = @getTime()
      @timeRunning = true
      @updateMode null, "mark"
      @enableGrid()
      @updateCountdown()

  enableGrid: ->
    @$el.find("table.disabled, div.disabled").removeClass("disabled")

  stopTimer: (event, message = false) ->

    return if @timeRunning != true # stop only if needed

    # do these always
    clearInterval @interval
    @stopTime = @getTime()
    @timeRunning = false
    @timerStopped = true
    @updateCountdown()

    # do these if it's not a simple stop
    if not event?.simpleStop
      Utils.flash()
      @updateMode null, "last" if @captureLastAttempted
      if message
        Utils.topAlert message
      else
        Utils.midAlert t('Please mark last item attempted') if @captureLastAttempted

  autostopTest: ->
    Utils.flash()
    clearInterval @interval
    @stopTime = @getTime()
    @autostopped = true
    @timerStopped = true
    @timeRunning = false
    @$el.find(".grid_element").slice(@autostop-1,@autostop).addClass "element_last" #jquery is weird sometimes
    @lastAttempted = @autostop
    @timeout = setTimeout(@removeUndo, 3000) # give them 3 seconds to undo
    Utils.topAlert t("autostop activated discontinue test")

  removeUndo: =>
    @undoable = false
    @updateMode null, "disabled"
    clearTimeout(@timeout)

  unAutostopTest: ->
    @interval = setInterval(@updateCountdown,1000 )
    @updateCountdown()
    @autostopped = false
    @lastAttempted = 0
    @$el.find(".grid_element").slice(@autostop-1,@autostop).removeClass "element_last"
    @timeRunning = true
    @updateMode null, "mark"
    Utils.topAlert t("autostop removed continue")

  updateCountdown: =>
    # sometimes the "tick" doesn't happen within a second
    @timeElapsed = Math.min(@getTime() - @startTime, @timer)
    
    @timeRemaining = @timer - @timeElapsed
    
    @$el.find(".timer").html @timeRemaining
    if @timeRemaining <= 0 && @timeRunning == true && @captureLastAttempted then @stopTimer null, t("time please mark last item attempted")
    if @captureItemAtTime && !@gotIntermediate && !@minuteMessage && @timeElapsed >= @captureAfterSeconds
      Utils.flash "yellow"
      Utils.midAlert t("please select the item the child is currently attempting")
      @minuteMessage = true
      @mode = "minuteItem"


  updateMode: (event, mode = null) =>
    # dont' change the mode if the time has never been started
    if (mode==null && @timeElapsed == 0) || mode == "disabled"
      @$el.find("#grid_mode :radio").removeAttr("checked")
      @$el.find("#grid_mode").buttonset("refresh")
      return
    if mode?
      @mode = mode
      @$el.find("#grid_mode :radio[value=#{mode}]").attr("checked", "checked")
      @$el.find("#grid_mode").buttonset("refresh").click @updateMode
      return
    @mode = $(event.target).val() unless @autostopped

  getTime: ->
    Math.round((new Date()).getTime() / 1000)

  resetVariables: ->

    @timer    = parseInt(@model.get("timer")) || 0
    @untimed  = @timer == 0

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
      for item, i in @items
        @itemMap[i] = i
      for item, i in @items
        temp = Math.floor(Math.random() * @items.length)
        tempValue = @itemMap[temp]
        @itemMap[temp] = @itemMap[i]
        @itemMap[i] = tempValue

      for item, i in @itemMap
        @mapItem[@itemMap[i]] = i
    else
      for item, i in @items
        @itemMap[i] = i
        @mapItem[i] = i

    if !@captureLastAttempted && !@captureItemAtTime
      @mode = "mark"
    else
      @mode = "disabled"


    @gridOutput = []
    for item, i in @items
      @gridOutput[i] = 'correct'
    @columns  = parseInt(@model.get("columns")) || 3
    
    @autostop = if @untimed then 0 else (parseInt(@model.get("autostop")) || 0)
    @autostopped = false

    @$el.find(".grid_element").removeClass("element_wrong").removeClass("element_last").addClass("disabled")
    @$el.find("table").addClass("disabled")
    
    @$el.find(".timer").html @timer
    
    @updateMode( null, @mode )

  initialize: (options) ->

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

    @totalTime = @model.get("timer") || 0

    @modeHandlers =
      "mark"       : @markHandler
      "last"       : @lastHandler
      "minuteItem" : @intermediateItemHandler
      disabled : $.noop

    @model  = @options.model
    @parent = @options.parent

    @resetVariables()

    @gridElement         = _.template "<td><div data-label='{{label}}' data-index='{{i}}' class='grid_element #{fontSizeClass}' #{@fontStyle || ""}>{{label}}</div></td>"
    @variableGridElement = _.template "<span data-label='{{label}}' data-index='{{i}}' class='grid_element #{fontSizeClass}' #{@fontStyle || ""}>{{label}}</span>"
    
    if @layoutMode == "fixed"
      @endOfGridLine = _.template "<td><div data-index='{{i}}' class='end_of_grid_line'>*</div></td>"
    else
      @endOfGridLine = _.template ""

  render: ->
    done = 0

    startTimerHTML = "<div class='timer_wrapper'><button class='start_time time'>#{t('start')}</button><div class='timer'>#{@timer}</div></div>"

    disabling = if @untimed then "" else "disabled"

    html = if not @untimed then startTimerHTML else ""
    
    gridHTML = ""
    
    if @layoutMode == "fixed"
      gridHTML += "<table class='grid #{disabling}'>"
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
      gridHTML += "<div class='grid #{disabling}'>"
      for item, i in @items
        gridHTML += @variableGridElement
          "label" : _.escape(@items[@itemMap[i]])
          "i"     : i+1
      gridHTML += "</div>"
    html += gridHTML
    stopTimerHTML = "<div class='timer_wrapper'><button class='stop_time time'>#{t('stop')}</button><div class='timer'>#{@timer}</div></div>"

    resetButton = "
    <div>
      <button class='restart command'>#{t('restart')}</button>
      <br>
    </div>"


    #
    # Mode selector
    #

    modeSelector = ""
    # if any other option is avaialbe other than mark, then show the selector
    if @captureLastAttempted || @captureItemAtTime

      minuteItemButton =  ""
      if @captureItemAtTime
        labelText = t('item at __seconds__ seconds', seconds : @captureAfterSeconds)
        minuteItemButton = "
          <label for='minute_item'>#{labelText}</label>
          <input class='grid_mode' name='grid_mode' id='minute_item' type='radio' value='minuteItem'>
        "

      captureLastButton = ""
      if @captureLastAttempted
        captureLastButton = "
          <label for='last_attempted'>#{t('last attempted')}</label>
          <input class='grid_mode' name='grid_mode' id='last_attempted' type='radio' value='last'>
        "


      modeSelector = "
        <div id='grid_mode' class='question buttonset clearfix'>
          <label>#{t('input mode')}</label><br>
          <label for='mark'>#{t('mark')}</label>
          <input class='grid_mode' name='grid_mode' id='mark' type='radio' value='mark'>
          #{minuteItemButton}
          #{captureLastButton}
        </div>
      "


    html += "
      #{if not @untimed then stopTimerHTML else ""}
      #{if not @untimed then resetButton else ""}
      #{modeSelector}
    "
    


    @$el.html html



    @trigger "rendered"
    @trigger "ready"

  isValid: ->
    # Stop timer if still running. Issue #240
    @stopTimer() if @timeRunning

    return false if @captureLastAttempted && @lastAttempted == 0
    # might need to let it know if it's timed or untimed too ::shrug::
    return false if @timeRunning == true
    return false if @timer != 0 && @timeRemaining == @timer
    true

  showErrors: ->
    messages = []

    timerHasntRun    = @timer != 0 && @timeRemaining == @timer
    noLastItem       = @captureLastAttempted && @lastAttempted == 0
    timeStillRunning = @timeRuning == true

    if timerHasntRun
      messages.push "Subtest not completed."

    if noLastItem && not timerHasntRun
      messages.push t("please touch last item read")
      @updateMode null, "last"

    if timeStillRunning
      messages.push t("time still running")

    Utils.midAlert messages.join("<br>"), 3000

  getResult: ->
    completeResults = []
    itemResults = []
    @lastAttempted = @items.length if not @captureLastAttempted

    for item, i in @items
      
      if @mapItem[i] < @lastAttempted
        itemResults[i] =
          itemResult : @gridOutput[@mapItem[i]]
          itemLabel  : item
      else
        itemResults[i] =
          itemResult : "missing"
          itemLabel : @items[@mapItem[i]]

    @lastAttempted = false if not @captureLastAttempted

    result =
      "capture_last_attempted"     : @captureLastAttempted
      "item_at_time"               : @itemAtTime
      "time_intermediate_captured" : @timeIntermediateCaptured
      "capture_item_at_time"       : @captureItemAtTime
      "auto_stop"     : @autostopped
      "attempted"     : @lastAttempted
      "items"         : itemResults
      "time_remain"   : @timeRemaining
      "mark_record"   : @markRecord
      "variable_name" : @model.get("variableName")

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
    counts =
      correct   : 0
      incorrect : 0
      missing   : @items.length - @lastAttempted
      total     : @items.length
 

    for i in @gridOutput
      counts['correct']   += 1 if i == "correct"
      counts['incorrect'] += 1 if i == "incorrect"
      
    return {
      correct   : counts['correct']
      incorrect : counts['incorrect']
      missing   : counts['missing']
      total     : counts['total']
      correct_per_minute : (counts['correct'] * (60 / @timeElapsed))
    }

