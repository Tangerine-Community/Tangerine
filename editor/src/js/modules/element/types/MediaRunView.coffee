class MediaRunView extends Backbone.View

  className : "MediaRunView"




  initialize: (options) ->

    @model  = options.model
    @parent = options.parent
    @dataEntry = options.dataEntry

  render: ->

    @$el.html "
      <div class='question'>
        #{@model.get('media')}
      </div>
    "

    unless @dataEntry

      previous = @parent.parent.result.getByHash(@model.get('hash'))
      answer = previous.consent if previous

#    @consentButton = new ButtonView
#      options : [
#        { label : @text.yes, value : "yes" }
#        { label : @text.no,  value : "no" }
#      ]
#      mode      : "single"
#      dataEntry : false
#      answer    : answer or ""
#
#    @consentButton.setElement @$el.find(".consent-button")
#    @consentButton.on "change", @onConsentChange
#    @consentButton.render()

    @trigger "rendered"
    @trigger "ready"
  
#  isValid: ->
#    if @confirmedNonConsent is false
#      if @consentButton.answer is "yes"
#        true
#      else
#        false
#    else
#      true

  getResult: ->
    return "consent" : @consentButton.answer

