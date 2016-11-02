class TripsByUserIdCollection extends Backbone.Collection

  model: Trip

  initialize: (options) ->
    if options.hasOwnProperty('userId')
      @params.userId = options.userId


  params:
    userId: undefined

  fetch: ->
    Tangerine.db.query('tangerine/tripsByUserId',
      key: @params.userId
      include_docs: true
    ).then((result) =>
      result.rows.forEach( (row) =>
        @models.push(new Trip(row.doc))
      )
      @trigger 'sync'
    )
