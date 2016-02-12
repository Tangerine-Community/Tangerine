class Subtest extends Backbone.Model

  url: "subtest"

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

  copyTo: (assessmentId) ->
    newSubtest = @clone()
    newId = Utils.guid()

    if newSubtest.has("surveyAttributes")
      newSubtest.set "surveyAttributes",
        "_id" : newId
        "assessmentId" : assessmentId

    newSubtest.save
      "_id"          : newId
      "assessmentId" : assessmentId
      "order"        : 0
      "gridLinkId"   : ""

    questions = new Questions
    questions.fetch
      key: @.get("assessmentId")
      success: (questionCollection) =>
        subtestQuestions = questionCollection.where "subtestId" : @id
        for question in subtestQuestions
          newQuestion = question.clone()
          newQuestion.save
            "assessmentId" : assessmentId
            "_id"          : Utils.guid() 
            "subtestId"    : newId
        # send user to edit page for reordering subtests
        Tangerine.router.navigate "edit/#{assessmentId}", true
        Utils.midAlert "Subtest copied"
