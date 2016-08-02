class Element extends Backbone.Model

  url: "element"

  initialize: (options) ->
    @templates = Tangerine.templates.get("prototypeTemplates")

    # guarentee survey pseudo model for observations
    if @has("surveyAttributes")
      if @get("assessmentId") != @get("surveyAttributes").assessmentId
        @save "surveyAttributes",
          "_id" : @id
          "assessmentId" : @get("assessmentId")

  loadPrototypeTemplate: (prototype) ->
    for key, value of @templates[prototype]
      @set key, value
    @save()

  copyTo: (options) ->

    assessmentId = options.assessmentId
    callback     = options.callback
    order        = options.order || 0
    
    newElement = @clone()
    newId = Utils.guid()


    if newElement.has("surveyAttributes")
      newElement.set "surveyAttributes",
        "_id" : newId
        "assessmentId" : assessmentId

    newElement.save
      "_id"          : newId
      "assessmentId" : assessmentId
      "order"        : order
      "gridLinkId"   : ""
    ,
      success: =>
        console.log("saved element")


