class WorkflowStep extends Backbone.ChildModel

  getName: ->
    switch @getType()
      when "assessment", "curriculum", "message"
        return @getString("name")
      else
        return @get("_id")

  getType: -> @getString("type")

  getView: ( argOptions = {} ) ->
    viewOptions    = @getViewOptions()
    defaultOptions = 
      inWorkflow : true

    $.extend(viewOptions, defaultOptions)
    $.extend(argOptions, viewOptions)
    return new window["New#{@get('className')}View"](argOptions)

  getCoffeeMessage: -> @getString("message")
  
  getContent: -> @getString("content")

  getViewOptions: -> eval(@get("classOptions-cooked"))

  getTypeModel: -> @model if @model?

  getTypesId:  -> @getString("typesId")
  getUserType: -> @getString("userType")

  getCurriculumItemType: -> @getString("curriculumItemType")
  getCurriculumWeek:     -> @getString("curriculumWeek")
  getCurriculumGrade:    -> @getString("curriculumGrade")

  getShowLesson: -> @getString("showLesson-cooked")

  fetch: ( options = {} ) ->
    options.error   = $.noop unless options.error?
    options.success = $.noop unless options.success?
    if @get("type") is "assessment"
      @model = new Assessment "_id" : @get("typesId")
      @model.fetch
        error   : -> console.log "Had trouble fetching #{@get("typesId")}"; options.error()
        success : ->
          options.success()
    else if @get("type") is "curriculum"
      @model = new Curriculum "_id" : @get("typesId")
      @model.fetch
        error   : -> console.log "Had trouble fetching #{@get("typesId")}"; options.error()
        success : ->
          options.success()
