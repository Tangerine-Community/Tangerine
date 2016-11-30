# When instantiating a new Trip, options is required to have a Workflow in the workflow option and a User in the user option.
Trip = Backbone.Model.extend

  idAttribute: "_id"

  url: "trip"

  defaults:
    collection: 'trip'
    workflowId: null
    userId: null
    startTime: null
    endTime: null
    log: []
    authenticity: false
    authenticityParameters: {}
  
  # If this is a new Trip, options is required to have a Workflow in the `workflow` option and a User in the `user` option.
  initialize: (options) ->

    # Option checking.
    if !options.hasOwnProperty('_id') && (!options.hasOwnProperty('workflow') || !options.hasOwnProperty('user'))
      throw Error 'You must pass in a workflow and user when starting a trip'
    
    # Set some starting values on a new Trip.
    if !options.hasOwnProperty('_id')
      # Set up some 
      @set('startTime', Date.now())
      @set('workflowId', options.workflow.id)
      @set('authenticityParameters', options.workflow.get('authenticityParameters')) 
      @set('userId', options.user.id)
      # Clean up.
      @unset('workflow')
      @unset('user')

  # Logs the completion of a step onto `Trip.attributes.log`. For now this also involves saving a Result document.
  markStepComplete: (step) ->
    log = @get('log')
    message =
      stepId: step.model.id
      status: "completed"
      time: Date.now()
    if step.model.get('type') == 'assessment' || step.model.get('type') == 'curriculum'
      result = step.view.result
      message.result = result.toJSON()
      # If there was a Location Subtest in this, add it to the Trip metadata. 
      result.attributes.subtestData.forEach (subtestData) =>
        if subtestData.prototype == 'location'
          @set('locationData', subtestData.data)
      # TODO: Phase out saving individual results.
      @on 'sync', =>
        result.set 'tripId', @id
        result.set 'workflowId', @get('workflowId')
        result.save()
    log.push(message)
    @set('log', log)
    @save()

  # When the Trip in the Workflow is all done, use this method to mark it as complete.
  markTripComplete: ->
    @set('endTime', Date.now())
    # Determine authenticity if conditions are met.
    authenticityParameters = @get('authenticityParameters')
    authenticity = true
    if authenticityParameters != undefined && authenticityParameters.enabled == true
      # Start with valid being true, then prove us wrong.
      if authenticityParameters.constraints.duration?
          minutes = (@get('endTime') - @get('startTime')) / 1000 / 60
          if minutes < authenticityParameters.constraints.duration.minutes
            authenticity = false
      if authenticityParameters.constraints.timeOfDay?
        tripTime = moment(parseInt(@get('startTime')))
        tripTime.zone(Tangerine.settings.get("timeZone")) if Tangerine.settings.get("timeZone")?
        if tripTime.hours() < authenticityParameters.constraints.timeOfDay.startTime.hour or tripTime.hours() > authenticityParameters.constraints.timeOfDay.endTime.hour
          authenticity = false
    @set('authenticity', authenticity)
    return
