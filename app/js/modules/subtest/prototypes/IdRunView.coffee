class IdRunView extends Backbone.View

  className: "id"
  
  events:
    'click #generate' : 'generate'
    'change #participant_id' : 'setValidator'
  
  initialize: (options) ->
    @model  = @options.model
    @parent = @options.parent
    @validator = new CheckDigit

  render: ->
    @$el.html "
    <form>
      <label for='participant_id'>#{t('random identifier')}</label>
      <input id='participant_id' name='participant_id'>
      <button id='generate' class='command'>#{t('generate')}</button>
      <div class='messages'></div>
    </form>"
    @trigger "rendered"
    @trigger "ready"

  getResult: ->
    return { 'participant_id' : @$el.find("#participant_id").val() }

  getSkipped: ->
    return { 'participant_id' : "skipped" }

  getSum: ->
    correct   : 1
    incorrect : 0
    missing   : 0
    total     : 1

  setValidator: ->
    @validator.set @$el.find('#participant_id').val()

  isValid: ->
    @setValidator()
    return false if not @validator.isValid()
    @updateNavigation()
    
  showErrors: ->
    @$el.find(".messages").html @validator.getErrors().join(", ")

  generate: ->
    @$el.find(".messages").empty()
    @$el.find('#participant_id').val @validator.generate()
    false

  updateNavigation: ->
    Tangerine.nav.setStudent @$el.find('#participant_id').val()
