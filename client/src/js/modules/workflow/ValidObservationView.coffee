class ValidObservationView extends Backbone.View

  initialize: ->

    @validCount = {
      thisMonth : 0
      lastMonth : 0
    }

    @tripIds = {}

    @fetchTripIds()

  fetchTripIds: (callback = $.noop) ->
    d = new Date()
    year  = d.getFullYear()
    month = d.getMonth()+1

    Utils.execute [
      (callback = $.noop) ->
        Tangerine.db.query "tangerine/tutorTrips",
          key     : "year#{year}month#{month}"
          reduce  : false
        .then (response) =>
          @tripIds.thisMonth = _(response.rows.map (el) -> el.value).uniq()
          callback?()

      , (callback = $.noop) ->
        Tangerine.db.query "tangerine/tutorTrips",
          key     : "year#{year}month#{month-1}"
          reduce  : false
        .then (response) =>
          @tripIds.lastMonth = _(response.rows.map (el) -> el.value).uniq()
          callback?()

      , (callback = $.noop) ->
        users = [Tangerine.user.get("name")].concat(Tangerine.user.getArray("previousUsers"))
        Tangerine.db.query "tangerine/tripsAndUsers",
          keys    : users
          reduce  : false
        .then (response) =>
          @tripIds.thisUser = _(response.rows.map (el) -> el.value).uniq()
          callback?()

      , (callback = $.noop) ->
        bestPractices = "00b0a09a-2a9f-baca-2acb-c6264d4247cb"
        fullPrimr     = "c835fc38-de99-d064-59d3-e772ccefcf7d"
        workflowKeys = [bestPractices, fullPrimr].map (el) -> "workflow-#{el}"
        Tangerine.db.query "tangerine/tutorTrips",
          keys    : workflowKeys
          reduce  : false
        .then(response) =>
          @tripIds.theseWorkflows = _(response.rows.map (el) -> el.value).uniq()
          callback?()

      , (callback = $.noop) ->
        @tripIds.final = {
          thisMonth : _.intersection(@tripIds.thisMonth, @tripIds.theseWorkflows, @tripIds.thisUser)
          lastMonth : _.intersection(@tripIds.lastMonth, @tripIds.theseWorkflows, @tripIds.thisUser)
        }

        callback?()

      , (callback = $.noop) ->
        Tangerine.db.query "tangerine/spirtRotut",
          group   : true
          keys    : @tripIds.final.thisMonth
        .then (response) =>
          validTrips = response.rows.filter (row) ->
            minutes = (parseInt(row.value.maxTime) - parseInt(row['value']['minTime'])) / 1000 / 60
            result = minutes >= 20
            return result

          @validTrips = validTrips.map (el) -> el.key
          @trigger "valid-update"
          @validCount.thisMonth = validTrips.length
          callback?()

      , (callback = $.noop) ->
        Tangerine.db.query "tangerine/spirtRotut",
          group   : true
          keys    : @tripIds.final.lastMonth
        .then (response) =>
          validTrips = response.rows.filter (row) ->
            minutes = (parseInt(row.value.maxTime) - parseInt(row['value']['minTime'])) / 1000 / 60
            result = minutes >= 20
            return result
          @validCount.lastMonth = validTrips.length
          callback?()
      , @render
      ], @

  render: (status) ->
    if status is "loading"
      @$el.html "<h2>Valid Observations</h2><p>Loading...</p>"
      return

    @$el.html "
      <h2>Valid Observations</h2>
      <table class='class_table'><tr><th></th><th>Observations</th></tr>
        <tr><th>This month</th><td>#{@validCount.thisMonth} </td></tr>
        <tr><th>Previous month</th><td>#{@validCount.lastMonth} </td></tr>
      </table>
    "

