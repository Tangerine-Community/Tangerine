class KlassMenuView extends Backbone.View

  className : "KlassMenuView"

  events:
    'click .registration' : 'gotoKlasses'

  gotoKlasses: ->
    Tangerine.router.navigate "class", true

  initialize: ( options ) ->

  render: ->
    @$el.html "
    <h1>Tangerine Class</h1>
    <button class='collect command'>Collect</button>
    <button class='manage command'>Manage</button>
    <button class='reports command'>Reports</button>
    <button class='advice command'>Advice</button>
    <button class='registration command'>Class Registration</button>
    
    "
    @trigger "rendered"
