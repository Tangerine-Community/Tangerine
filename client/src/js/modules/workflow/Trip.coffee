# When instantiating a new Trip, options is required to have a Workflow in the workflow option and a User in the user option.
Trip = Backbone.Model.extend

  url: "trip"

  defaults:
    collection: 'trip'
    workflowId: null
    userId: null
    startTime: null
    endTime: null
    stepLog: []
    authenticity: false
    authenticityParameters: {}
  
  # If this is a new Trip, options is required to have a Workflow in the workflow option and a User in the user option.
  initialize: (options) ->
    if options.hasOwnProperty('workflow')
      @set('workflowId', options.workflow.id)
      # Authenticity parameters are saved on the Trip itself. This is important for later understanding to what the authenticity
      # boolean represents. If Authenticity Parameters in the Workflow are later changed, the program can tell this Trip was evaulated
      # to a different set of authenticity parameters. 
      @set('authenticityParameters', options.workflow.get('authenticityParameters')) 
      @unset('workflow')
    if options.hasOwnProperty('user')
      @set('userId', options.user.id)
      @unset('user')

  markStepComplete: (step) ->
    # Add this result to the Trip.
    stepLog = @get('stepLog')
    if step.model.get('type') == 'assessment' || step.model.get('type') == 'curriculum'
      result = step.view.result
      stepLog[step.model.id] = {"status": "completed", "result": result.toJSON()}
      # If there was a Location Subtest in this, add it to the Trip metadata. 
      result.attributes.subtestData.forEach (subtestData) =>
        if subtestData.prototype == 'location'
          @set('locationData', subtestData.data)
      # TODO: Phase out saving individual results.
      result.set 'tripId', @id
      result.set 'workflowId', @get('workflowId')
      result.save()
    else
      stepLog[step.model.id] = {"status": "completed"}
    @set('stepLog', stepLog)

  validate: ->
    # Determine authenticity if conditions are met.
    authenticityParameters = @get('authenticityParameters')
    if authenticityParameters != undefined && authenticityParameters.enabled == true && @get('endTime') != null
      # Start with valid being true, then prove us wrong.
      authenticity = true
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
