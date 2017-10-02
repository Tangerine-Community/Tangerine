class ConsentEditView extends Backbone.View

  className : "ConsentEditView"

  initialize: ( options ) ->
    @model = options.model
    @parent = options.parent

  isValid: -> true

  save: ->
    @model.set
      "prompt" : @$el.find("#consent_prompt").val()

  render: ->
    prompt = @model.get("prompt") || ""
    @$el.html "
      <div class='label_value'>
        <label for='consent_prompt'>Consent prompt</label>
        <input id='consent_prompt' value='#{prompt}'>
      </div>
    "
