class GpsRunItemView extends Backbone.Marionette.ItemView

  className: "GpsRunItemView"

  events: 'click .clear' : 'clear'

  clear: ->
    @position = null
    @updateDisplay()

  initialize: (options) ->
    Tangerine.progress.currentSubview = @
    @i18n()
    @model   = options.model
    @parent = @model.parent
    @dataEntry = options.dataEntry


    @position = null
    @retryCount = 0

  i18n: ->
    @text =
      "clear" : t('GpsRunView.button.clear')

      "good"           : t('GpsRunView.label.good')
      "ok"             : t('GpsRunView.label.ok')
      "poor"           : t('GpsRunView.label.poor')
      "latitude"       : t('GpsRunView.label.latitude')
      "longitude"      : t('GpsRunView.label.longitude')
      "accuracy"       : t('GpsRunView.label.accuracy')
      "meters"         : t('GpsRunView.label.meters')

      "savedReading"   : t('GpsRunView.label.saved_reading')
      "currentReading" : t('GpsRunView.label.current_reading')
      "bestReading"    : t('GpsRunView.label.best_reading')
      "gpsStatus"      : t('GpsRunView.label.gps_status')

      "gpsOk"        : t('GpsRunView.message.gps_ok')
      "retrying"     : t('GpsRunView.message.retrying')
      "searching"    : t('GpsRunView.message.searching')
      "notSupported" : _(t('GpsRunView.message.not_supported')).escape()

  poll: => # full of magic numbers

    navigator.geolocation.getCurrentPosition(
        (position) =>
          @updateDisplay position
          @updatePosition position
          @updateStatus @text.gpsOk
          @retryCount = 0
          setTimeout(@poll(), 5 * 1000) unless @stopPolling # not recursion, no stackoverflow
      ,
        (positionError) =>
          @updateStatus positionError.message
          setTimeout(@poll(), 5 * 1000)  unless @stopPolling  # not recursion, no stackoverflow
          @retryCount++
      , 
        maximumAge         : 10 * 1000
        timeout            : 30 * 1000
        enableHighAccuracy : true
    )

  easify: ( position ) ->
    return {
      lat       : if position?.coords?.latitude? then position.coords.latitude else "..."
      long      : if position?.coords?.longitude? then position.coords.longitude else "..."
      alt       : if position?.coords?.altitude? then position.coords.altitude else "..."
      acc       : if position?.coords?.accuracy? then position.coords.accuracy else "..."
      altAcc    : if position?.coords?.altitudeAccuracy? then position.coords.altitudeAccuracy else "..."
      heading   : if position?.coords?.heading? then position.coords.heading else "..."
      speed     : if position?.coords?.speed? then position.coords.speed else "..."
      timestamp : if position?.timestamp? then position.timestamp else "..."
    }

  updatePosition: ( newPosition ) ->
    newPosition = @easify(newPosition)
    @position = newPosition unless @position?
    # prefer most accurate result
    if (newPosition?.acc? && @position?.acc?) && newPosition.acc <= @position.acc
      @position = newPosition

  updateDisplay: (position) ->
    position = @easify position
    positions = [
      el   : @$el.find(".gps_current")
      data : position
    ,
      el   : @$el.find(".gps_best")
      data : @position
    ]

    for pos, i in positions

      data = pos.data
      el   = pos.el

      lat  = if data?.lat  then parseFloat(data.lat).toFixed(4)   else "..."
      long = if data?.long then parseFloat(data.long).toFixed(4) else "..."
      acc  = if data?.acc  then parseInt(data.acc) + " #{@text.meters}" 
      else "..."

      acc = acc +
        if parseInt(data?.acc) < 50 # magic number
          "(#{@text.good})"
        else if parseInt(data?.acc) > 100 # magic number
          "(#{@text.poor})"
        else
          "(#{@text.ok})"

      html = "
        <table>
          <tr><td>#{@text.latitude}</td> <td>#{lat}</td></tr>
          <tr><td>#{@text.longitude}</td><td>#{long}</td></tr>
          <tr><td>#{@text.accuracy}</td> <td>#{acc}</td></tr>
        </table>
      "

      el.html html

  updateStatus: (message = '') ->
    retries = if @retryCount > 0 then t('GpsRunView.message.attempt', count: @retryCount+1) else ""
    polling = if not @stopPolling then "<br>#{@text.retrying} #{retries}" else ""
    @$el.find(".status").html message + polling

  render: ->

    if not Modernizr.geolocation
      
      @$el.html @text.notSupported

      @position = @easify(null)

      @trigger "rendered"
      @trigger "ready"

    else
      unless @dataEntry
        previous = @model.parent.result.getByHash(@model.get('hash'))

      if previous
        lat  = previous.lat
        long = previous.long
        acc  = previous.acc
        @$el.html "
          <section>
            <h3>#{@text.savedReading}</h3>
            <div class='gps_saved'>
              <table>
                <tr><td>#{@text.latitude}</td> <td>#{lat}</td></tr>
                <tr><td>#{@text.longitude}</td><td>#{long}</td></tr>
                <tr><td>#{@text.accuracy}</td> <td>#{acc}</td></tr>
              </table>
            </div>
        "
      else
        @$el.html "
          <section>
            <h3>#{@text.bestReading}</h3>
            <div class='gps_best'></div><button class='clear command'>#{@text.clear}</button>
            <h3>#{@text.currentReading}</h3>
            <div class='gps_current'></div>
          </section>
          <section>
            <h2>#{@text.gpsStatus}</h2>
            <div class='status'>#{@text.searching}</div>
          </section>
          "
      @trigger "rendered"
      @trigger "ready"
      @poll()
  
  getResult: ->
    previous = @model.parent.result.getByHash(@model.get('hash'))
    return previous if previous
    result = @position || {}
    hash = @model.get("hash") if @model.has("hash")
    subtestResult =
      'body' : result
      'meta' :
        'hash' : hash
    return subtestResult

    return result

  getSkipped: ->
    return @position || {}

  onClose: ->
    @stopPolling = true

  isValid: ->
    true

  testValid: ->
    if @isValid?
      return @isValid()
    else
      return false
    true

  showErrors: ->
    true