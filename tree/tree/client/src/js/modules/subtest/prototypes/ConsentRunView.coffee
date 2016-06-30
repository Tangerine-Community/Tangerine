class ConsentRunView extends Backbone.View

  className : "ConsentRunView"

  events:
    'click #non_consent_confirm' : 'noConsent'

  onConsentChange: =>
    if @consentButton.answer is "yes"
      @clearMessages()
    else
      @showNonConsent()

  i18n: ->
    @text =
      defaultConsent    : t("ConsentRunView.label.default_consent_prompt")
      confirmNonconsent : t("ConsentRunView.label.confirm_nonconsent")
      confirm           : t("ConsentRunView.button.confirm")
      yes               : t("ConsentRunView.button.yes_continue")
      no                : t("ConsentRunView.button.no_stop")
      select            : t("ConsentRunView.message.select")

  initialize: (options) ->

    @i18n()

    @confirmedNonConsent = false
    @model  = options.model
    @parent = options.parent
    @dataEntry = options.dataEntry

  
  render: ->

    @$el.html "
      <div class='question'>
        <label>#{@model.get('prompt') || @text.defaultConsent}</label>
        <div class='messages'></div>
        <div class='non_consent_form confirmation'>
          <div>#{@text.confirmNonconsent}</div>
          <button id='non_consent_confirm' class='command'>#{@text.confirm}</button>
        </div>
        <div class='consent-button'></div>
      </div>
    "

    unless @dataEntry

      previous = @parent.parent.result.getByHash(@model.get('hash'))
      answer = previous.consent if previous

    @consentButton = new ButtonView
      options : [
        { label : @text.yes, value : "yes" }
        { label : @text.no,  value : "no" }
      ]
      mode      : "single"
      dataEntry : false
      answer    : answer or ""
    
    @consentButton.setElement @$el.find(".consent-button")
    @consentButton.on "change", @onConsentChange
    @consentButton.render()

    @trigger "rendered"
    @trigger "ready"
  
  isValid: ->
    if @confirmedNonConsent is false
      if @consentButton.answer is "yes"
        true
      else
        false
    else
      true

  showNonConsent: ->
    @$el.find(".non_consent_form").show(250)

  clearMessages: ->
    @$el.find(".non_consent_form").hide(250)
    @$el.find(".messages").html ""

  noConsent: ->
    @confirmedNonConsent = true
    @parent.abort()
    return false
  
  getSkipped: ->
    return "consent" : "skipped"
  
  showErrors: ->
    answer = @consentButton.answer 
    if answer == "no"
      Utils.midAlert @text.confirm
      @showNonConsent()
    else if answer == undefined
      $(".messages").html @text.select

  getResult: ->
    return "consent" : @consentButton.answer

  onClose: ->
    @consentButton?.close?()
