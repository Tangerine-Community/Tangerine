class TripsByUserIdAndMonthCollection extends Backbone.Collection

  model: Trip

  params:
    userId: undefined
    month: undefined

  fetch: ->
    @models = []
    Tangerine.db.query 'tangerine/tripsByUserIdAndMonth',
      key: @params.userId + '-' + @params.month
      include_docs: true
    .then (result) =>
      result.rows.forEach (row) =>
        @models.push(new Trip(row.doc))
      @trigger 'sync'
