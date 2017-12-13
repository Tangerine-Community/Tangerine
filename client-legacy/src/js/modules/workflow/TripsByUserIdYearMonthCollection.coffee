class TripsByUserIdYearMonthCollection extends Backbone.Collection

  model: Trip

  params:
    userId: undefined
    year: undefined
    month: undefined

  fetch: ->
    @models = []
    Tangerine.db.query 'tangerine/tripsByUserIdYearMonth',
      key: @params.userId + '-' + @params.year + '-' + @params.month
      include_docs: true
    .then (result) =>
      result.rows.forEach (row) =>
        @models.push(new Trip(row.doc))
      @trigger 'sync'
