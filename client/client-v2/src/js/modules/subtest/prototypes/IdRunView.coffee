class IdRunView extends Backbone.View

  className: "id"
  
  events:
    'click #generate'        : 'generate'
    'change #participant_id' : 'setValidator'
  
  i18n: ->
    @text =
      identifier : t("IdRunView.label.identifier")
      generate   : t("IdRunView.button.generate")

  initialize: (options) ->

    console.log options

    @i18n()

    @model  = options.model
    @parent = options.parent
    @dataEntry = options.dataEntry

    @validator = new CheckDigit

  render: ->

    unless @dataEntry
      previous = @parent.parent.result.getByHash(@model.get('hash'))
      if previous
        participantId = previous.participant_id

    @$el.html "
    <form>
      <label for='participant_id'>#{@text.identifier}</label>
      <input id='participant_id' name='participant_id' value='#{participantId||''}'>
      <button id='generate' class='command'>#{@text.generate}</button>
      <div class='messages'></div>
    </form>"
    @trigger "rendered"
    @trigger "ready"

  getResult: ->
    return { 'participant_id' : @$el.find("#participant_id").val() }

  getSkipped: ->
    return { 'participant_id' : "skipped" }

  setValidator: ->
    @validator.set @getResult()['participant_id']

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
    Tangerine.nav.setStudent @getResult()['participant_id']
