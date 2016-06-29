class CurriculaListView extends Backbone.View

  className: "CurriculaListView"
  tagName: "ul"

  initialize: (options) ->
    @views = []
    @curricula = options.curricula
    @curricula.on? "all", @render


  render: =>
    return if @curricula.length == 0 
    @$el.html "<h1>Curricula</h1>"
    @closeViews
    @curricula.each (curriculum) =>
      view = new CurriculumListElementView
        "curriculum" : curriculum
      view.render()
      @$el.append view.el
      @views.push view

    @trigger "rendered"
  
  onClose: ->
    @closeViews()
  
  closeViews: ->
    for view in @views
      view.close?()
  