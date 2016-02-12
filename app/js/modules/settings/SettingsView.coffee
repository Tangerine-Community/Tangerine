class SettingsView extends Backbone.View

  className : "SettingsView"

  events: 
    'click .save' : 'save'
    'click .back' : 'goBack'

  goBack: ->
    window.history.back()

  initialize: (options) ->
    @settings = Tangerine.settings

  save: ->
    @settings.save
      context   : @$el.find('#group_handle').val()
      context   : @$el.find('#context').val()
      language  : @$el.find('#language').val()
      groupName : @$el.find("#group_name").val()
      groupHost : @$el.find("#group_host").val()
      upPass    : @$el.find("#up_pass").val()
      log       : @$el.find("#log").val().split(/[\s,]+/)
    ,
      success: =>
        Utils.midAlert "Settings saved"
      error: ->
        Utils.midAlert "Error. Settings weren't saved"

  render: ->
    context     = @settings.getEscapedString "context"
    language    = @settings.getEscapedString "language"
    groupName   = @settings.getEscapedString "groupName"
    groupHandle = @settings.getEscapedString "groupHandle"
    groupHost   = @settings.getEscapedString "groupHost"
    upPass      = @settings.getEscapedString "upPass"
    log         = _.escape( @settings.getArray("log").join(", ") )

    @$el.html "
    <button class='back navigation'>Back</button>
    <h1>#{t("settings")}</h1>
    <p><img src='images/icon_warn.png' title='Warning'>Please be careful with the following settings.</p>
    <div class='menu_box'>
      <div class='label_value'>
        <label for='context'>Context</label><br>
        <input id='context' type='text' value='#{context}'>
      </div>
      <div class='label_value'>
        <label for='language'>Language code</label><br>
        <input id='language' type='text' value='#{language}'>
      </div>
      <div class='label_value'>
        <label for='group_handle' title='A human readable name. Only for display purposes. Any change here will not affect the address of the group or any internal functionality.'>Group handle</label><br>
        <input id='group_handle' type='text' value='#{groupHandle}'>
      </div>
      <div class='label_value'>
        <label for='group_name'>Group name</label><br>
        <input id='group_name' type='text' value='#{groupName}'>
      </div>
      <div class='label_value'>
        <label for='group_host'>Group host</label><br>
        <input id='group_host' type='text' value='#{groupHost}'>
      </div>
      <div class='label_value'>
        <label for='up_pass'>Upload password</label><br>
        <input id='up_pass' type='text' value='#{upPass}'>
      </div>
      <div class='label_value'>
        <label for='log' title='app, ui, db, err'>Log events</label><br>
        <input id='log' value='#{log}'>
      </div>
    </div><br>
    
    <button class='command save'>Save</button>
    "
    
    @trigger "rendered"