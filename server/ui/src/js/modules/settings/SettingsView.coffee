class SettingsView extends Backbone.View

  className : "SettingsView"

  events: 
    'click .save' : 'save'
    'click .back' : 'goBack'

  goBack: ->
    window.history.back()

  i18n: ->
    @text = 

      save : t("Tangerine.actions.button.save")
        
      back : t("Tangerine.navigation.button.back")

      saved : t("Tangerine.message.saved")
      saveError : t("Tangerine.message.save_error")

      settings: t("SettingsView.label.settings")

      warning: t("SettingsView.message.warning")

      contextHelp: t("SettingsView.help.context")
      languageHelp : t("SettingsView.help.language")
      groupHandleHelp : t("SettingsView.help.group_handle")
      groupNameHelp : t("SettingsView.help.group_name")
      groupHostHelp : t("SettingsView.help.group_host")
      uploadPasswordHelp : t("SettingsView.help.upload_password")
      logEventsHelp : t("SettingsView.help.log_events")

      context: t("SettingsView.label.context")
      language: t("SettingsView.label.language")
      groupHandle: t("SettingsView.label.group_handle")
      groupName: t("SettingsView.label.group_name")
      groupHost: t("SettingsView.label.group_host")
      uploadPassword: t("SettingsView.label.upload_password")
      logEvents : t("SettingsView.label.log_events")
      
  initialize: (options) ->

    @i18n()

    @settings = Tangerine.settings

  save: ->
    @settings.save
      groupHandle : @$el.find('#group_handle').val()
      context     : @$el.find('#context').val()
      language    : @$el.find('#language').val()
      groupName   : @$el.find("#group_name").val()
      groupHost   : @$el.find("#group_host").val()
      upPass      : @$el.find("#up_pass").val()
      log         : @$el.find("#log").val().split(/[\s,]+/)
    ,
      success: =>
        Utils.midAlert @text.saved
      error: ->
        Utils.midAlert @text.saveError

  render: ->
    context     = @settings.getEscapedString "context"
    language    = @settings.getEscapedString "language"
    groupName   = @settings.getEscapedString "groupName"
    groupHandle = @settings.getEscapedString "groupHandle"
    groupHost   = @settings.getEscapedString "groupHost"
    upPass      = @settings.getEscapedString "upPass"
    log         = _.escape( @settings.getArray("log").join(", ") )

    @$el.html "
      <button class='back navigation'>#{@text.back}</button>
      <h1>#{@text.settings}</h1>
      <p><img src='images/icon_warn.png' title='Warning'>#{@text.warning}</p>
      <div class='menu_box'>
        <div class='label_value'>
          <label for='context' title='#{@text.contextHelp}'>#{@text.context}</label><br>
          <input id='context' type='text' value='#{context}'>
        </div>
        <div class='label_value'>
          <label for='language' title='#{@text.languageHelp}'>#{@text.language}</label><br>
          <input id='language' type='text' value='#{language}'>
        </div>
        <div class='label_value'>
          <label for='group_handle' title='#{@text.groupHandleHelp}'>#{@text.groupHandle}</label><br>
          <input id='group_handle' type='text' value='#{groupHandle}'>
        </div>
        <div class='label_value'>
          <label for='group_name' title='#{@text.groupNameHelp}'>#{@text.groupName}</label><br>
          <input id='group_name' type='text' value='#{groupName}'>
        </div>
        <div class='label_value'>
          <label for='group_host' title='#{@text.groupHostHelp}'>#{@text.groupHost}</label><br>
          <input id='group_host' type='text' value='#{groupHost}'>
        </div>
        <div class='label_value'>
          <label for='up_pass' title='#{@text.uploadPasswordHelp}'>#{@text.uploadPassword}</label><br>
          <input id='up_pass' type='text' value='#{upPass}'>
        </div>
        <div class='label_value'>
          <label for='log' title='#{@text.logEventsHelp}'>#{@text.logEvents}</label><br>
          <input id='log' value='#{log}'>
        </div>
      </div><br>

      <button class='command save'>#{@text.save}</button>
    "
    
    @trigger "rendered"