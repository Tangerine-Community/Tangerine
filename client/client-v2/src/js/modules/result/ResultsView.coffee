class ResultsView extends Backbone.View

  className : "ResultsView"

  events:
    'click .cloud'    : 'cloud'
    'click .tablets'  : 'tablets'
    'click .detect'   : 'detectOptions'
    'click .details'  : 'showResultSumView'

    'change #limit' : "setLimit"
    'change #page' : "setOffset"

  showResultSumView: (event) ->
    targetId = $(event.target).attr("data-result-id")
    $details = @$el.find("#details_#{targetId}")

    return $details.empty() if $details.html() isnt ''
    result = new Result "_id" : targetId
    result.fetch
      success: ->
        view = new ResultSumView
          model       : result
          finishCheck : true
        view.render()
        $details.html "<div class='info_box'>" + $(view.el).html() + "</div>"
        view.close()

  oldCloud: ->
    if @available.cloud.ok
      PouchDB.replicate(Tangerine.conf.db_name, Tangerine.settings.urlDB("group"), { doc_ids: @docList }
      ).on( 'error', (err) ->
        @$el.find(".status").find(".info_box").html "<div>Sync error</div><div>#{err}</div>"
      ).on( 'complete', (info) ->
        if info.docs.doc_write_failures is 0
          @$el.find(".status").find(".info_box").html "Results synced to cloud successfully"
        else
          @$el.find(".status").find(".info_box").html "<div>Sync error</div><div>#{err}</div>"
      )
    else
      Utils.midAlert "Cannot detect cloud"
    return false


  cloud: ->
    Utils.uploadCompressed @docList


  tablets: ->
    if @available.tablets.okCount > 0
      for ip in @available.tablets.ips
        do (ip) =>
          $.couch.replicate(
            Tangerine.settings.urlDB("local"),
            Tangerine.settings.urlSubnet(ip),
              success:      =>
                @$el.find(".status").find(".info_box").html "Results synced to #{@available.tablets.okCount} successfully"
              error: (a, b) =>
                @$el.find(".status").find(".info_box").html "<div>Sync error</div><div>#{a} #{b}</div>"
            ,
              doc_ids: @docList
          )
    else
      Utils.midAlert "Cannot detect tablets"
    return false

  initDetectOptions: ->
    @available =
      cloud :
        ok : false
        checked : false
      tablets :
        ips : []
        okCount  : 0
        checked  : 0
        total : 256

  detectOptions: ->
    $("button.cloud, button.tablets").attr("disabled", "disabled")
    @detectCloud()
    @detectTablets()

  detectCloud: ->
    # Detect Cloud
    $.ajax
      type: "GET"
      dataType: "json"
      url: Tangerine.settings.urlHost("group")
      success: (a, b) =>
        console.log "cloudy"
        @available.cloud.ok = true
      error: (a, b) =>
        console.log "error man"
        @available.cloud.ok = false
      complete: =>
        console.log "complete at least"
        @available.cloud.checked = true
        @updateOptions()

  detectTablets: =>
    for local in [0..255]
      do (local) =>
        ip = Tangerine.settings.subnetIP(local)
        $.ajax
          url: Tangerine.settings.urlSubnet(ip)
          dataType: "jsonp"
          contentType: "application/json;charset=utf-8",
          timeout: 30000
          complete:  (xhr, error) =>
            @available.tablets.checked++
            if xhr.status == 200
              @available.tablets.okCount++
              @available.tablets.ips.push ip
            @updateOptions()

  updateOptions: =>
    percentage = Math.decimals((@available.tablets.checked / @available.tablets.total) * 100, 2)
    if percentage == 100
      message = "finished"
    else
      message = "#{percentage}%"
    tabletMessage = "Searching for tablets: #{message}"

    @$el.find(".checking_status").html "#{tabletMessage}" if @available.tablets.checked > 0

    if @available.cloud.checked && @available.tablets.checked == @available.tablets.total
      @$el.find(".status .info_box").html "Done detecting options"
      @$el.find(".checking_status").hide()

    if @available.cloud.ok
      @$el.find('button.cloud').removeAttr('disabled')
    if @available.tablets.okCount > 0 && percentage == 100
      @$el.find('button.tablets').removeAttr('disabled')


  i18n: ->
    @text =
      saveOptions : t("ResultsView.label.save_options")
      cloud       : t("ResultsView.label.cloud")
      tablets     : t("ResultsView.label.tablets")
      csv         : t("ResultsView.label.csv")
      started     : t("ResultsView.label.started")
      results     : t("ResultsView.label.results")
      details     : t("ResultsView.label.details")
      page        : t("ResultsView.label.page")
      status      : t("ResultsView.label.status")

      perPage     : t("ResultsView.label.par_page")

      noResults   : t("ResultsView.message.no_results")

      detect      : t("ResultsView.button.detect")

  initialize: ( options ) ->

    @i18n()

    @resultLimit  = 100
    @resultOffset = 0

    @subViews = []
    @results    = options.results
    @assessment = options.assessment
    @docList = @results.pluck("_id")
    @initDetectOptions()
    @detectCloud()

  render: ->

    @clearSubViews()

    html = "
      <h1>#{@assessment.getEscapedString('name')} #{@text.results}</h1>
      <h2>#{@text.saveOptions}</h2>
      <div class='menu_box'>
        <button class='cloud command' disabled='disabled'>#{@text.cloud}</button>
        <button class='tablets command' disabled='disabled'>#{@text.tablets}</button>
      </div>

      <button class='detect command'>#{@text.detect}</button>
      <div class='status'>
        <h2>#{@text.status}</h2>
        <div class='info_box'></div>
        <div class='checking_status'></div>

      </div>

      <h2 id='results_header'>#{@text.results} (<span id='result_position'>loading...</span>)</h2>
      <div class='confirmation' id='controls'>
        <label for='page' class='small_grey'>#{@text.page}</label><input id='page' type='number' value='0'>
        <label for='limit' class='small_grey'>#{@text.perPage}</label><input id='limit' type='number' value='0'>
      </div>
      <section id='results_container'></section>
    "

    @$el.html html

    @updateResults()

    @trigger "rendered"

  setLimit: (event) ->
    # @resultOffset
    # @resultLimit

    @resultLimit = +$("#limit").val() || 100 # default 100
    @updateResults()

  setOffset: (event) ->

    val           = +$("#page").val() || 1
    calculated    = (val - 1) * @resultLimit
    maxPage       = Math.floor(@results.length / @resultLimit )
    @resultOffset = Math.limit(0, calculated, maxPage * @resultLimit) # default page 1 == 0_offset

    @updateResults()

  updateResults: (focus) =>
    if @results?.length == 0
      @$el.find('#results_header').html @text.noResults
      return

    previews = new ResultPreviews
    previews.fetch
      viewOptions:
        key: "result-#{@assessment.id}"
      success: =>

        previews.sort()

        count = previews.labelngth

        maxResults  = 100
        currentPage = Math.floor( @resultOffset / @resultLimit ) + 1

        if @results.length > maxResults
          @$el.find("#controls").removeClass("confirmation")
          @$el.find("#page").val(currentPage)
          @$el.find("#limit").val(@resultLimit)

        start = @resultOffset + 1
        end   = Math.min @resultOffset + @resultLimit, @results.length
        total = @results.length

        @$el.find('#result_position').html t("ResultsView.label.pagination", {start:start, end:end, total:total} )

        htmlRows = ""

        previews.sort((a,b)->)

        previews.each (preview) =>

          id      = preview.getString("participantId", "No ID")
          endTime = preview.get("endTime")
          if endTime?
            long    = moment(endTime).format('YYYY-MMM-DD HH:mm')
            fromNow = moment(endTime).fromNow()
          else
            startTime = preview.get("startTime")
            long    = "<b>#{@text.started}</b> " + moment(startTime).format('YYYY-MMM-DD HH:mm')
            fromNow = moment(startTime).fromNow()

          time    = "#{long} (#{fromNow})"
          htmlRows += "
            <div>
              #{ id } -
              #{ time }
              <button data-result-id='#{preview.id}' class='details command'>#{@text.details}</button>
              <div id='details_#{preview.id}'></div>
            </div>
          "

        @$el.find("#results_container").html htmlRows

        @$el.find(focus).focus()

  afterRender: =>
    for view in @subViews
      view.afterRender?()

  clearSubViews:->
    for view in @subViews
      view.close()
    @subViews = []
