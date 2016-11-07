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

    @assessment = new Assessment "_id" : @get("typesId") 
    # For potential legacy reasons.
    @model = @assessment

    @subtests = new Subtests
        "assessmentId": @get("typesId")
    # For potential legacy reasons.
    @assessment.subtests = @subtests

    @assessment.fetch
      error   : -> console.log "Had trouble fetching #{@get("typesId")}"; options.error()
      success : =>
        @subtests.fetch
          viewOptions:
            key: "subtest-#{@get("typesId")}"
          error: ->
            console.log "deepFetch of Assessment failed"
          success: (subtests) =>
 
            # Filter subtests of curriculum.
            if @has('curriculumItemType') && @has('curriculumWeek') && @has('curriculumGrade')
              filters =
                "itemType" : (CoffeeScript.eval.apply(@workflow, [@get('curriculumItemType')]))
                "part" : (CoffeeScript.eval.apply(@workflow, [@get('curriculumWeek')]))
                "grade" : (CoffeeScript.eval.apply(@workflow, [@get('curriculumGrade')]))
              filteredModels = []
              @subtests.forEach (subtest) ->
                if subtest.has("itemType") && subtest.has("part") && subtest.has("grade")
                  if ((subtest.get("itemType")).toString() == (filters.itemType).toString() && (subtest.get("part")).toString() == (filters.part).toString() && (subtest.get("grade")).toString() == (filters.grade).toString()) 
                    filteredModels.push(subtest)
              if filteredModels.length == 0
                return Utils.midAlert "
                  Curriculum filters found no Subtest for <br>
                  #{JSON.stringify(filters)} 
                "
              @subtests.models = filteredModels

            @subtests.ensureOrder()
            options.success()

