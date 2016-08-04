class HtmlEditView extends Backbone.View

  className : "HtmlEditView"

  initialize: ( options ) ->
    @model = options.model
    @parent = options.parent

  isValid: -> true

  save: ->
    @model.set
      "html" : CKEDITOR.instances.html.getData()

  render: ->
    html = @model.get("html") || ""
    @$el.html "
      <div class='label_value'>
        <label for='html'>Html</label>
        <textarea id='html'>#{html}</textarea>
      </div>
    "
