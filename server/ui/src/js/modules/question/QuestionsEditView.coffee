class QuestionsEditView extends Backbone.View

  className : "questions_edit_view"
  tagName : "ul"

  initialize: ( options ) ->
    @views = []
    @questions = options.questions


  onClose: ->
    @closeViews()

  closeViews: ->
    for view in @views
      view.close()

  render: =>

    @closeViews()
    for question, i in @questions.models
      view = new QuestionsEditListElementView
        "question" : question
      @views.push view
      view.on "deleted", @render
      view.on "duplicate", =>
        @refetchAndRender()
      view.on "question-edit", (questionId) => @trigger "question-edit", questionId
      view.render()
      @$el.append view.el

    # make it sortable
    @$el.sortable
      forceHelperSize: true
      forcePlaceholderSize: true
      handle : '.sortable_handle'
      start: (event, ui) -> ui.item.addClass "drag_shadow"
      stop:  (event, ui) -> ui.item.removeClass "drag_shadow"

      update : (event, ui) =>
        idList = ($(li).attr("data-id") for li in @$el.find("li.question_list_element"))
        index = 0
        newDocs = []
        for id, index in idList
          newDoc = @questions.get(id).attributes
          newDoc['order'] = index
          newDocs.push newDoc
        requestData = "docs" : newDocs
        $.ajax
          type : "POST"
          contentType : "application/json; charset=UTF-8"
          dataType : "json"
          url : Tangerine.settings.urlBulkDocs()
          data : JSON.stringify(requestData)
          success : (responses) => @refetchAndRender()
          error : -> Utils.midAlert "Duplication error"

  refetchAndRender: ->
    anyQuestion = @questions.models[0]
    @questions.fetch 
      key: "q" + anyQuestion.get("assessmentId")
      success: =>
        @questions = new Questions(@questions.where {subtestId : anyQuestion.get("subtestId") })
        @render true

