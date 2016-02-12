class NavigationView extends Backbone.View

  el : '#navigation'

  events: if Modernizr.touch then {
    'touchstart div#logout_link'  : 'logout'
    'touchstart button'            : 'submenuHandler'
    'touchstart #corner_logo'      : 'logoClick'
    'touchstart #enumerator'       : 'enumeratorClick'
  } else {
    'click div#logout_link'  : 'logout'
    'click button'            : 'submenuHandler'
    'click #corner_logo'      : 'logoClick'
    'click #enumerator'       : 'enumeratorClick'
  }

  calcWhoAmI: =>
    # who am I
    @whoAmI = Tangerine.settings.contextualize
      mobile: @text.enumerator
      klass : @text.teacher
      allElse : @text.user

  enumeratorClick: ->
    if @user.isAdmin()
        Tangerine.router.navigate "account", true

  logoClick: -> 
    if @user.isAdmin()
      Tangerine.activity = ""
      @router.navigate '', true
    else
      if Tangerine.activity == "assessment run"
        if confirm @text.incomplete_main
          Tangerine.activity = ""
          @router.navigate '', true
      else
          @router.navigate '', true

  logout: ->
    if @user.isAdmin() || Tangerine.settings.get("context") == "server"
      Tangerine.activity = ""
      Tangerine.user.logout()
    else
      if Tangerine.activity == "assessment run"
        if confirm @text.incomplete_logout
          Tangerine.activity = ""
          Tangerine.user.logout()
      else
        if confirm @text.confirm_logout
          Tangerine.activity = ""
          Tangerine.user.logout()

  onClose: -> # do nothing

  initialize: (options) =>

    @i18n()
    @render()

    @user   = options.user
    @router = options.router

    @calcWhoAmI()

    @router.on 'all', @handleMenu
    @user.on   'login logout', @handleMenu

  i18n: ->
    @text =
      "logout"            : t('NavigationView.button.logout')
      "user"              : t('NavigationView.label.user')
      "teacher"           : t('NavigationView.label.teacher')
      "enumerator"        : t('NavigationView.label.enumerator')
      "student_id"        : t('NavigationView.label.student_id')
      "version"           : t('NavigationView.label.version')
      "account"           : t('NavigationView.help.account')
      "logo"              : t('NavigationView.help.logo')
      "incomplete_logout" : t("NavigationView.message.incomplete_logout")
      "confirm_logout"    : t("NavigationView.message.logout_confirm")
      "incomplete_main"   : t("NavigationView.message.incomplete_main_screen")

  submenuHandler: (event) ->
    vm.currentView.submenuHandler? event

  closeSubmenu: ->
    @$el.find("main_nav").empty()

  render: ->
    @$el.html "
    <img id='corner_logo' src='images/corner_logo.png' title='#{@text.logo}'>
    <div id='logout_link'>#{@text.logout}</div>
    <div id='enumerator_box'>
      <span id='enumerator_label' title='#{@text.account}'>#{@whoAmI}</span>
      <div id='enumerator'>#{Tangerine.user.name || ""}</div>
    </div>

    <div id='current_student'>
      #{@text.student_id}
      <div id='current_student_id'></div>
    </div>
    <div id='version'>
      #{@text.version} <br>
      <span id='version-uuid'>#{Tangerine.version}-#{Tangerine.buildVersion}</span><br>
    </div>
    "

    # Spin the logo on ajax calls
    $("body").ajaxStart -> $("#corner_logo").attr "src", "images/spin_orange.gif"
    $("body").ajaxStop ->  $("#corner_logo").attr "src", "images/corner_logo.png"

  setStudent: ( id ) ->
    if id == ""
      @$el.find('#current_student_id').fadeOut(250, (a) -> $(a).html(""))
      @$el.find("#current_student").fadeOut(250)
    else
      @$el.find('#current_student_id').html(id).parent().fadeIn(250)


  # Admins get a manage button 
  # triggered on user changes
  handleMenu: (event) =>
    @calcWhoAmI()

    $("#enumerator_label").html @whoAmI

    $('#enumerator').html @user.name

    # @TODO This needs fixing
    if ~window.location.toString().indexOf("name=") then @$el.find("#logout_link").hide() else  @$el.find("#logout_link").show()

    @user.verify
      isRegistered: =>
        @render()
        $( '#navigation' ).fadeIn(250)
      isUnregistered: =>
        @render()
        $( '#navigation' ).fadeOut(250)


