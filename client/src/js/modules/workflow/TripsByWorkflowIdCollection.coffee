class TripsByWorkflowIdCollection extends Backbone.Collection

  model: Trip

  params:
    workflowId: undefined

  fetch: ->
    @models = []
    Tangerine.db.query 'tangerine/tripsByWorkflowIdCollection',
      key: @params.workflowId
      include_docs: true
    .then (result) =>
      result.rows.forEach (row) =>
        @models.push(new Trip(row.doc))
      @trigger 'sync'
