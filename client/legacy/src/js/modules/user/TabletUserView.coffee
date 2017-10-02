class TabletUserView extends Backbone.View

  className: "UserView"

  events:
    'click button#save': 'save' 

  initialize: ( options ) ->


  render: ->
    @form = new Backbone.Form
      model: @model
    .render()
    @$el.html(@form.el)
    @$el.append('<button class="subtest-next navigation" id="save">save</button>')

  save: ->
    @form.commit()
    @model.on 'sync', ->
      alert 'Profile saved'
    @model.save()
