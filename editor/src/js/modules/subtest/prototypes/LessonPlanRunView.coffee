class LessonPlanRunView extends Backbone.View

  className: "id"
  
#  events:
#    'click #generate'        : 'generate'
#    'change #participant_id' : 'setValidator'
  
  i18n: ->
    @text = 
      title : t("LessonPlanRunView.label.title")
      lesson_text   : t("LessonPlanRunView.label.lesson_text")

  initialize: (options) ->

    @i18n()

    @model     = options.model
    @parent    = options.parent
    @dataEntry = options.dataEntry

    @validator = new CheckDigit

  render: ->

    unless @dataEntry
      previous = @parent.parent.result.getByHash(@model.get('hash'))
      if previous
        participantId = previous.participant_id

    @$el.html "
    <form>
      <label for='title'>#{@text.title}</label>
      <input id='title' name='title' value='#{title||''}'>
      <label for='lesson_text'>#{@text.lesson_text}</label>
      <input id='lesson_text' name='lesson_text' value='#{lesson_text||''}'>
      <div class='messages'></div>
    </form>"
    @trigger "rendered"
    @trigger "ready"

  getResult: ->
    return {
    'title' : @$el.find("#title").val()
    'lesson_text' : @$el.find("#lesson_text").val()
    }

  getSkipped: ->
    return {
    'title' : "skipped"
    }

  setValidator: ->
#    @validator.set @getResult()['participant_id']

  isValid: ->
#    @setValidator()
#    return false if not @validator.isValid()
#    @updateNavigation()
    
  showErrors: ->
    @$el.find(".messages").html @validator.getErrors().join(", ")

#  generate: ->
#    @$el.find(".messages").empty()
#    @$el.find('#participant_id').val @validator.generate()
#    false

#  updateNavigation: ->
#    Tangerine.nav.setStudent @getResult()['participant_id']
