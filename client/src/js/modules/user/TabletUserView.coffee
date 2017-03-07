class TabletUserView extends Backbone.View

  className: "UserView"

  events:
    'click button#save': 'save' 
    'click .account': 'account'
    'click .settings': 'settings'

  initialize: ( options ) ->
    @i18n()

  i18n: ->
    @text =
      "account_button"    : t('NavigationView.button.account')
      "settings_button"   : t('NavigationView.button.settings')


  render: ->

    @buttons = "<p><button class='command account'>#{@text.account_button}</button></li>
        <button class='command settings'>#{@text.settings_button}</button></li></p>"



    @form = new Backbone.Form
      model: @model
    .render()
    @$el.html(@form.el)
    @$el.append('<button class="subtest-next navigation" id="save">save</button>')
    @$el.prepend(@buttons)

  account: ->
    Tangerine.router.navigate("account", true);

  settings: ->
    Tangerine.router.navigate("settings", true);

  save: ->
    @form.commit()
    @model.on 'sync', ->
      alert 'Profile saved'
    @model.save()
