class DashboardView extends Backbone.View

  className : "DashboardView"

  events:
    "change #groupBy": "update"
    "change #assessment": "update"
    "change #shiftHours": "update"
    "click .result": "showResult"

  showResult: (event) =>
    resultDetails = $("#resultDetails")
    if resultDetails.is(":visible")
      resultDetails.hide()
    else
      resultId = $(event.target).text()
      $.couch.db(document.location.pathname.match(/^\/(.*?)\//).pop()).openDoc resultId,
        success: (result) =>
          resultDetails.html "<pre>#{@syntaxHighlight(result)}</pre>"
          resultDetails.css
            top: $(event.target).position().top + 30
            width: 400
            left: 50
          resultDetails.show()

  syntaxHighlight: (json) =>
    window.json = json
    if (typeof json != 'string')
       json = JSON.stringify(json, undefined, 2)
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return json.replace /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) ->
      cls = 'number'
      if (/^"/.test(match))
        if (/:$/.test(match))
          cls = 'key'
        else
          cls = 'string'
      else if (/true|false/.test(match))
        cls = 'boolean'
      else if (/null/.test(match))
        cls = 'null'
      return '<span class="' + cls + '">' + match + '</span>'

  update: =>
    Tangerine.router.navigate("dashboard/groupBy/#{$("#groupBy").val()}/assessment/#{$("#assessment").val()}/shiftHours/#{$("#shiftHours").val()}", true)

  render: =>
    options = @options
    @groupBy = options.groupBy
    @key = options.assessment
    @shiftHours = options.shiftHours || 0

    if @key is "All"
      $.couch.db(Tangerine.db_name).view "#{Tangerine.design_doc}/dashboardResults",
        reduce: false
        success: @renderResults
    else
      $.couch.db(Tangerine.db_name).view "#{Tangerine.design_doc}/dashboardResults",
        key: @key
        reduce: false
        success: @renderResults

  renderResults: (result) =>
    tableRows = {}
    dates = {}
    propertiesToGroupBy = {}

    # Find the first possible grouping variable and use it if not defined
    @groupBy = _.keys(result.rows[0].value)[0] unless @groupBy?

    _.each result.rows, (row) =>
      leftColumn = row.value[@groupBy]
      sortingDate = if row.value.startTime then moment(row.value.startTime).add("h",@shiftHours).format("YYYYMMDD") else "Unknown"
      displayDate = if row.value.startTime then moment(row.value.startTime).add("h",@shiftHours).format("Do MMM") else "Unknown"
      dates[sortingDate] = displayDate
      tableRows[leftColumn] = {} unless tableRows[leftColumn]?
      tableRows[leftColumn][sortingDate] = [] unless tableRows[leftColumn][sortingDate]?
      tableRows[leftColumn][sortingDate].push "
        <div style='padding-top:10px;'>
          <table>
          #{
            _.map(row.value, (value,key) =>
              propertiesToGroupBy[key] = true
              value = moment(value).add("h",@shiftHours).format("YYYY-MM-DD HH:mm") if key is "startTime"
              value = "<button class='result'>#{value}</button>" if key is "resultId"
              "<tr><td>#{key}</td><td>#{value}</td></tr>"
            ).join("")
          }
          </table>
        </div>
        <hr/>
      "
    @$el.html "
      <h1>#{Tangerine.db_name}</h1>
      Assessment:
      <select id='assessment'>
      </select>
      <br/>
      Value used for grouping:
      <select id='groupBy'>
        #{
          _.map propertiesToGroupBy, (value,key) =>
            "<option #{if key is @groupBy then "selected='true'" else ''}>
              #{key}
            </option>"
        }
      </select>
      <br/>
      <br/>
      <button onClick='$(\"#advancedOptions\").toggle()'>Advanced Options</button>
      <div style='display:none' id='advancedOptions'>
      Current time in your timezone (#{jstz.determine().name()}) is #{ moment().format("YYYY-MM-DD HH:mm") }<br/>
      Shift time values by <input id='shiftHours' type='number' value='#{@shiftHours}'></input> hours to handle correct timezone.<br/>
      Shifted time: #{ moment().add("h",@shiftHours).format("YYYY-MM-DD HH:mm")}
      <br/>
      </div>

      <table id='results' class='tablesorter'>
        <thead>
          <th>#{@groupBy}</th>
          #{
            _(dates).keys().sort().map( (sortingDate) ->
              "<th class='#{sortingDate}'>#{dates[sortingDate]}</th>"
            ).join("")
          }
        </thead>
        <tbody>
          #{
            _.map(tableRows, (dataForDates, leftColumn) ->
              "<tr>
                <td>#{leftColumn}</td>
                #{
                  _(dates).keys().sort().map( (sortingDate) ->
                    "<td class='#{sortingDate}'>
                      #{
                        if dataForDates[sortingDate]
                          "
                            <button class='sort-value' onClick='$(this).siblings().toggle()'>#{dataForDates[sortingDate].length}</button>
                            <div style='display:none'>
                              #{dataForDates[sortingDate].join("")}
                            </div>
                          "
                        else
                          ""
                      }
                    </td>"
                  ).join("")
                }
              </tr>"
            ).join("")
          }
        </tbody>
      </table>
      <div id='resultDetails'>
      </div>
      <style>
        #resultDetails{
          position:absolute;
          background-color:black;
          display:none;
        }
        pre {
          font-size: 75%;
          outline: 1px solid #ccc; 
          padding: 5px; 
          margin: 5px; 
          text-shadow: none;
          overflow-wrap:break-word;
        }
        .string { color: green; }
        .number { color: darkorange; }
        .boolean { color: blue; }
        .null { color: magenta; }
        .key { color: red; }
      </style>
    "

    @$el.find("table#results").tablesorter
      widgets: ['zebra']
      sortList: [[0,0]]
      textExtraction: (node) ->
        sortValue = $(node).find(".sort-value").text()
        if sortValue != ""
          sortValue
        else
          $(node).text()

    @$el.find("#advancedOptions").append "Select which dates to show<br/>"
    _(dates).keys().sort().map( (sortingDate) =>
      displayDate = dates[sortingDate]
      dateCheckbox = $("<label for='#{sortingDate}'>#{displayDate}</label><input name='#{sortingDate}' id='#{sortingDate}' type='checkbox' checked='true'/>")
      dateCheckbox.click ->
        $(".#{sortingDate}").toggle()
      @$el.find("#advancedOptions").append dateCheckbox
    )

    $.couch.db(Tangerine.db_name).view "#{Tangerine.design_doc}/dashboardResults",
      group: true
      success: (result) =>
        $("select#assessment").html "<option>All</option>" +
        _.map(result.rows, (row) =>
          "<option value='#{row.key}' #{if row.key is @key then "selected='true'" else ""}>#{row.key}</option>"
        ).join("")
        _.each result.rows, (row) =>
          return unless row.key?
          $.couch.db(Tangerine.db_name).openDoc row.key,
            success: (result) =>
              $("option[value=#{row.key}]").html result.name
            error: (result) =>
              $("option[value=#{row.key}]").html "Unknown assessment"


    @trigger "rendered"
