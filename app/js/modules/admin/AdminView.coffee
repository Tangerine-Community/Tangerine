class AdminView extends Backbone.View

  className : "AdminView"

  events:
    #"change #groupBy": "update"
    "click .update " : "update" 

  update: (event) ->
    $target = $(event.target)
    group = $target.attr("data-group")
    Utils.updateTangerine null,
      targetDB : group

  getVersionNumber: (group) ->
    $.ajax "/#{group}/_design/#{Tangerine.design_doc}/js/version.js",
      dataType: "text"
      success: (result) ->
        $("##{group}-version").html result.match(/"(.*)"/)[1]


  initialize: ->
    $.couch.allDbs
      success: (databases) =>
        @databases = databases
        @render()

  render: =>
    unless @databases?
      @$el.html "Loading..."
      return

    groups = _(@databases).filter (database) -> database.match /^group-/

    sortTable = _.after groups.length, ->
      $("table#active-groups").tablesorter
        widgets: ['zebra']
        sortList: [[5,1]]

    @$el.html "
      <h2>Active Groups</h2>
      <table id='active-groups' class='class_table'>
        <thead>
          #{
            _("Name, Last Complete Result, Total Assessments, Total Results, Version, Last Result".split(/,/)).map( (header) ->
              "<th>#{header}</th>"
            ).join("")
          }
        </thead>
        <tbody>
        </tbody>
      </table>
    "

    _(groups).each (group) =>

      groupName = group.replace(/group-/,"")

      $.couch.db(group).view Tangerine.design_doc + "/resultCount",
        group: true
        success: (resultCounts) =>
          groupTotalResults = 0
          groupTotalAssessments = 0
          _(resultCounts.rows).each (resultCount) ->

            groupTotalAssessments += 1
            groupTotalResults += parseInt(resultCount.value)

          @$el.find("#active-groups tbody").append "
            <tr>
              <td>#{groupName}</td>
              <td id='#{group}-last-result'></td>
              <td id='#{group}-total-assessments'>#{groupTotalAssessments}</td>
              <td id='#{group}-total-results'>#{groupTotalResults}</td>
              <td id='#{group}-version'></td>
              <td style='font-size:50%' id='#{group}-last-timestamp'></td>
              <td><button class='results navigation'><a href='/#{group}/_design/#{Tangerine.design_doc}/index.html#dashboard'>Results</a></button></td>
              <td><button class='update command' data-group='#{group}'>Update</button></td>
            </tr>
          "

          $.couch.db(group).view Tangerine.design_doc + "/completedResultsByEndTime",
            limit: 1
            descending: true
            success: (result) =>
              if result.rows[0] and result.rows[0].key
                @$el.find("##{group}-last-timestamp").html moment(new Date(result.rows[0].key)).format("YYYY-MMM-DD HH:mm")
                @$el.find("##{group}-last-result").html moment(result.rows[0].key).fromNow()
              sortTable()
            error: () =>
              console.log "Could not retrieve view 'completedResultsByEndTime' for #{group}"
              sortTable()

          $.ajax "/#{group}/_design/#{Tangerine.design_doc}/js/version.js",
            dataType: "text"
            success: (result) ->
              $("##{group}-version").html result.match(/"(.*)"/)[1]

    @trigger "rendered"
