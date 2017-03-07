class CurriculaListView extends Backbone.View

  className: "CurriculaListView"
  tagName: "ul"

  initialize: (options) ->
    @views = []
    @curricula = options.curricula
#    @curricula.on? "all", @render
    @curricula.on "add destroy remove update", @render

  render: =>
    return if @curricula.length == 0

    urlPhrases = '#phrases'
    linkToPhrases = "<p><a href=" + urlPhrases + ">Edit Phrases</a></p>"

    if @curricula.length > 0
      groupName = Tangerine.settings.get('groupName')
      url = '#run/app/' + groupName
      runCurriculaApp = " <ul>
        <li class = 'sp_run'><a href=" + url + ">Demo the Curricula App</a></li>
        <li>Demo the Curricula App</li>
      </ul>"
    else
      runCurriculaApp = ""

    @$el.html "<h1>Curricula</h1>" + linkToPhrases + runCurriculaApp

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