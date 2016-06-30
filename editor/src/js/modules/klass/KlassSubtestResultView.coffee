class KlassSubtestResultView extends Backbone.View

  className: "KlassSubtestResultView"

  events: 
    "click .run"           : "checkRun"
    "click .back"          : "back"
    "click .show_itemized" : "showItemized"

  initialize: (options) ->
    @allResults = options.allResults
    @results = options.results
    @result = @results[0]
    @previous = options.previous
    @subtest = options.subtest
    @student = options.student

  gotoRun: ->
    Tangerine.router.navigate "class/run/#{@options.student.id}/#{@options.subtest.id}", true

  checkRun: ->
    hasGridLink = @subtest.has("gridLinkId") && @subtest.get("gridLinkId") != ""
    if not hasGridLink
      @gotoRun()
      return

    gridLinkId = @subtest.get("gridLinkId")

    result = @allResults.where 
      "subtestId" : gridLinkId
      "studentId" : @student.id

    if result.length == 0
      subtest = new Subtest "_id" : gridLinkId
      subtest.fetch
        success: =>
          Utils.midAlert "Please complete<br><b>#{subtest.escape("name")}</b><br>for<br><b>#{@student.escape('name')}</b><br>before this test.", 5000
      return

    @gotoRun()

  showItemized: -> @$el.find(".itemized").fadeToggle()

  back: -> Tangerine.router.navigate "class/#{@options.student.get("klassId")}/#{@options.subtest.get("part")}", true

  render: ->

    if @result?
      @results = @results[0]

      resultHTML = "<button class='command show_itemized'>#{t('itemized results')}</button><table class='itemized confirmation'><tbody><tr><th>Item</th><th>Result</th></tr>"
      if @subtest.get("prototype") == "grid"
        for datum, i in @result.get("subtestData").items
          resultHTML += "<tr><td>#{datum.itemLabel}</td><td>#{t(datum.itemResult)}</td></tr>"
      else if @subtest.get("prototype") == "survey"
        for key, value of @result.get("subtestData")
          resultHTML += "<tr><td>#{key}</td><td>#{t(value)}</td></tr>"
      resultHTML += "</tbody></table><br>"

      timestamp = new Date(@result.get("startTime"))

      taken = "
        <tr>
          <td><label>Taken last</label></td><td>#{timestamp.getFullYear()}/#{timestamp.getMonth()+1}/#{timestamp.getDate()}</td>
        </tr>
        <tr>
          <td><label>Previous attempts</label></td><td>#{@previous}</td>
        </tr>
      " if @previous > 0

    runButton = "
      <div class='menu_box'>
        <img src='images/icon_run.png' class='run clickable'>
      </div><br>
    " if not @result? || @result.get?("reportType") != "progress"

    @$el.html "
      <h1>Result</h1>
      <table><tbody>
        <tr>
          <td><label>Assessment</label></td>
          <td>#{@subtest.get("part")}</td>
        </tr>
        <tr>
          <td><label>Student</label></td>
          <td>#{@student.escape("name")}</td>
        </tr>
        <tr>
          <td><label>Subtest</label></td>
          <td>#{@subtest.escape("name")}</td>
        </tr>
        #{taken || ""}
      </tbody></table>
      #{resultHTML || ""}
      #{runButton || ""}
      <button class='navigation back'>Back</button>
    "

    @trigger "rendered"