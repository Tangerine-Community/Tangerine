class ResultsView extends Backbone.View

  className : "ResultsView"

  events:
    'click .cloud'    : 'cloud'
    'click .tablets'  : 'tablets'
    'click .detect'   : 'detectOptions'
    'click .details'  : 'showResultSumView'
    'click .refresh'  : 'refresh'
    'click .show_advanced' : 'toggleAdvanced'

    'change #limit' : "setLimit"
    'change #page' : "setOffset"

  toggleAdvanced: ->
    @$el.find("#advanced").toggleClass("confirmation")

  refresh: ->
    Utils.restartTangerine("Please wait...")

  showResultSumView: (event) ->
    targetId = $(event.target).attr("data-result-id")
    $details = @$el.find("#details_#{targetId}")
    if not _.isEmpty($details.html())
      $details.empty()
      return

    result = new Result "_id" : targetId
    result.fetch
      success: ->
        view = new ResultSumView
          model       : result
          finishCheck : true
        view.render()
        $details.html "<div class='info_box'>" + $(view.el).html() + "</div>"
        view.close()



  cloud: ->
    if @available.cloud.ok
      $.couch.replicate(
        Tangerine.settings.urlDB("local"),
        Tangerine.settings.urlDB("group"),
          success:      =>
            @$el.find(".status").find(".info_box").html "Results synced to cloud successfully"
          error: (a, b) =>
            @$el.find(".status").find(".info_box").html "<div>Sync error</div><div>#{a} #{b}</div>"
        ,
          doc_ids: @docList
      )
    else
      Utils.midAlert "Cannot detect cloud"
    return false


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
      dataType: "jsonp"
      url: Tangerine.settings.urlHost("group")
      success: (a, b) =>
        @available.cloud.ok = true
      error: (a, b) =>
        @available.cloud.ok = false
      complete: =>
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
      perPage     : t("ResultsView.label.per_page")
      advanced    : t("ResultsView.label.advanced")

      noResults   : t("ResultsView.message.no_results")

      refresh     : t("ResultsView.button.refresh")
      detect      : t("ResultsView.button.detect")

  initialize: ( options ) ->

    @i18n()

    @resultLimit  = 100
    @resultOffset = 0

    @subViews = []
    @results = options.results
    @assessment = options.assessment
    @docList = []
    for result in @results
      @docList.push result.get "id"
    @initDetectOptions()
    @detectCloud()

  render: ->

    @clearSubViews()

    html = "
      <h1>#{@assessment.getEscapedString('name')} #{@text.results}</h1>
      <h2>#{@text.saveOptions}</h2>
      <div class='menu_box'>

        <form action='/generate_csv/#{@assessment.id}' method='post'>
          <input type='hidden' name='result_db' value='#{Tangerine.db_name}'>
          <button type='submit' class='csv command'>#{@text.csv}</button>
          <!-- <a href='/brockman/assessment/#{Tangerine.db_name}/#{@assessment.id}'></a> -->
        </form>

        <!--div class='small_grey clickable show_advanced'>#{@text.advanced}</div-->
        <div id='advanced' class='confirmation'>
          <div class='menu_box'>
            <table class='class_table'>
              <tr>
                <td><label for='excludes' title='Space delimited, accepts string literals or regular expressions wrapped in / characters.'>Exclude variables</label></td>
                <td><input id='excludes'></td>
              </tr>
              <tr>
                <td><label for='includes' title='Space delimited, accepts string literals or regular expressions wrapped in / characters. Overrides exclusions.'>Include variables</label></td>
                <td><input id='includes'></td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    "

    html += "
      <h2 id='results_header'>#{@text.results} (<span id='result_position'>loading...</span>)</h2>
      <div class='confirmation' id='controls'>
        <label for='page' class='small_grey'>#{@text.page}</label><input id='page' type='number' value='0'>
        <label for='limit' class='small_grey'>#{@text.perPage}</label><input id='limit' type='number' value='0'>
      </div>
      <section id='results_container'></section>
      <br>
      <button class='command refresh'>#{@text.refresh}</button>
    "

    @$el.html html

    @updateResults()

    @trigger "rendered"

  setLimit: (event) ->
    # @resultOffset
    # @resultLimit

    @resultLimit = parseInt($("#limit").val()) || 100 # default 100
    @updateResults()

  setOffset: (event) ->
    # @resultOffset
    # @resultLimit

    val           = parseInt($("#page").val()) || 1
    calculated    = (val - 1) * @resultLimit
    maxPage       = Math.floor(@results.length / @resultLimit )
    @resultOffset = Math.limit(0, calculated, maxPage * @resultLimit) # default page 1 == 0_offset

    @updateResults()

  updateResults: (focus) =>
    if @results?.length == 0
      @$el.find('#results_header').html @text.noResults
      return

    $.ajax
      url: Tangerine.settings.urlView('group', "resultSummaryByAssessmentId")+"?descending=true&limit=#{@resultLimit}&skip=#{@resultOffset}"
      type: "POST"
      dataType: "json"
      contentType: "application/json"
      data: JSON.stringify(
        keys : [@assessment.id]
      )
      success: ( data ) =>

        rows  = data.rows
        count = rows.length

        maxResults  = 100
        currentPage = Math.floor( @resultOffset / @resultLimit ) + 1

        if @results.length > maxResults
          @$el.find("#controls").removeClass("confirmation")
          @$el.find("#page").val(currentPage)
          @$el.find("#limit").val(@resultLimit)

        start = @resultOffset + 1
        end   = Math.min(@resultOffset+@resultLimit,@results.length)
        total = @results.length

        @$el.find('#result_position').html t("ResultsView.label.pagination", {start:start, end:end, total:total} )

        htmlRows = ""
        for row in rows

          id      = row.value?.participant_id || "No ID"
          endTime = row.value.end_time
          if endTime?
            long    = moment(endTime).format('YYYY-MMM-DD HH:mm')
            fromNow = moment(endTime).fromNow()
          else
            startTime = row.value.start_time
            long    = "<b>#{@text.started}</b> " + moment(startTime).format('YYYY-MMM-DD HH:mm')
            fromNow = moment(startTime).fromNow()

          time    = "#{long} (#{fromNow})"
          htmlRows += "
            <div>
              #{ id } -
              #{ time }
              <button data-result-id='#{row.id}' class='details command'>#{@text.details}</button>
              <div id='details_#{row.id}'></div>
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
