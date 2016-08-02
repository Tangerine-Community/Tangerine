class ElementListEditView extends Backbone.View

  className: "ElementListEditView"

  tagName : "ul"
  
  initialize: (options) ->
    @assessment = options.assessment
    @views = []

  render: =>
    @closeViews()
    @assessment.elements.sort()
    @assessment.elements.each (element) =>
      oneView = new ElementListElementView
        "element" : element
      @views.push oneView
      oneView.render()
      oneView.on "element:delete", @deleteElement
      oneView.on "element:copy", @copyElement
      @$el.append oneView.el

  copyElement: (targetAssessmentId, elementId) =>
    Utils.midAlert "Copying..."
    elements = @views.filter( (view) -> view.selected == true ).map( (view) -> view.model )

    if elements.length is 0
      elements = [@assessment.elements.get(elementId)]
    
    targetElementCount = 0
    (new Elements).fetch
      key: "s" + targetAssessmentId
      success: (collection) =>

        targetElementCount = collection.length
        newElementCount = 0
        doOne = ->
          if elements.length
            element = elements.shift()
            newElementCount++
            element.copyTo
              assessmentId : targetAssessmentId
              order: targetElementCount + newElementCount
              callback: -> doOne()
          else
            Tangerine.router.navigate("edit/#{targetAssessmentId}", true)
        doOne()

  deleteElement: (element) =>
    @assessment.elements.remove element
    element.destroy()
    
  closeViews: ->
    for view in @views
      view.close()
    @views = []
