class MediaEditView extends Backbone.View

  className : "MediaEditView"

  initialize: ( options ) ->
    @model = options.model
    @parent = options.parent

  isValid: -> true

  save: ->
    @model.set
      "media" : @$el.find("#media").val()

  render: ->
    media = @model.get("media") || ""
    @$el.html "
      <div class='label_value'>
        <label for='media'>Media</label>
        <textarea id='media'>#{media}</textarea>
      </div>
    "
