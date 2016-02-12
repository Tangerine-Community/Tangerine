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
        @questions.fetch 
          key: question.get("assessmentId")
          success: =>
            @questions = new Questions(@questions.where {subtestId : question.get("subtestId") })
            @render true
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
        for id, i in idList
          @questions.get(id).save( { "order" : i }, { silent : true } )
        @questions.sort()
        @render()
