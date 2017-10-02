class TripsByUserIdCollection extends Backbone.Collection

  model: Trip

  params:
    userId: undefined

  fetch: ->
    @models = []
    Tangerine.db.query('tangerine/tripsByUserId',
      key: @params.userId
      include_docs: true
    ).then((result) =>
      result.rows.forEach( (row) =>
        @models.push(new Trip(row.doc))
      )
      @trigger 'sync'
    )
