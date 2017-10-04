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
      success: (result) =>
        console.log result
        @$el.find("##{group}-version").html result.match(/"(.*)"/)[1]


  initialize: ( options ) ->
    @groups = options.groups

  render: =>

    sortTable = _.after @groups.length, ->
      $("table#active-groups").tablesorter
        widgets: ['zebra']
        sortList: [[5,1]]

    @$el.html "
      <h2>Group Activity</h2>
      <table id='active-groups' class='class_table'>
        <thead>
          #{_([
            "Name"
            "Last Complete Result"
            "Total Assessments"
            "Total Results"
            "Version"
            "Last Result"
          ]).map( (header) -> "<th>#{header}</th>").join("")}
        </thead>
        <tbody>
          #{("<tr id='#{group}'>
              <td>
                #{group}<br>
              </td>
              <td class='last-result'>...</td>
              <td class='total-assessments'>...</td>
              <td class='total-results'>...</td>
              <td class='version'><div>...</div><button class='update command' data-group='#{group}'>Update</button></td>
              <td class='last-timestamp'>...</td>
            </tr>" for group in @groups).join('')}
        </tbody>
      </table>
    "

    $("table#active-groups").tablesorter
        widgets: ['zebra']
        sortList: [[5,1]]

    _(@groups).each (group) =>

      $group = @$el.find("##{group}")
      $.ajax "/#{group}/_design/#{Tangerine.design_doc}/js/version.js",
        dataType: "text"
        success: (result) ->
          $group.find(".version div").html result.match(/"(.*)"/)[1]


          $.couch.db(group).view Tangerine.design_doc + "/resultCount",
            group: true
            success: (resultCounts) =>

              $group.find(".total-assessments").html resultCounts.rows.length

              groupTotalResults = 0
              groupTotalResults += parseInt(resultCount.value) while (resultCount = resultCounts.rows.pop())
              $group.find(".total-results").html "<button class='results navigation'><a href='/#{group}/_design/#{Tangerine.design_doc}/index.html#dashboard'>#{groupTotalResults}</a></button>"

              ($.couch.db(group).view Tangerine.design_doc + "/completedResultsByEndTime",
                limit: 1
                descending: true
                success: (result) =>
                  if result.rows[0] and result.rows[0].key
                    $group.find(".last-timestamp").html moment(new Date(result.rows[0].key)).format("YYYY-MMM-DD HH:mm")
                    $group.find(".last-result").html moment(result.rows[0].key).fromNow()

                error: () =>
                  console.log "Could not retrieve view 'completedResultsByEndTime' for #{group}"

              ).complete => sortTable()


    @trigger "rendered"
