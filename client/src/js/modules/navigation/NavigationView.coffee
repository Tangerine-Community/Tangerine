class NavigationView extends Backbone.View

  el : '#navigation'

  events: if Modernizr.touch then {
    'click #logout'  : 'logout'
    'click #navigation-logo'      : 'logoClick'
    'click #username'       : 'gotoAccount'
  } else {
    'click #logout'   : 'logout'
    'click #navigation-logo'      : 'logoClick'
    'click #username'       : 'gotoAccount'
  }

  calcWhoAmI: =>
    # who am I
    @whoAmI = "User"

  refreshDropDownPosition: ->
    userPosistion = @$el.find("#username-container").position()
    $ul = @$el.find("#username-dropdown")
    $ul.css
      left : Math.min(userPosistion.left, $(window).width() - $ul.width())

  userMenuIn: =>  @refreshDropDownPosition(); @$el.find("#username-dropdown").show()

  userMenuOut: => @refreshDropDownPosition(); @$el.find("#username-dropdown").hide()

  gotoAccount: ->
    Tangerine.router.navigate "user/" + Tangerine.user.id, true

  logoClick: -> 
    if @user.isAdmin()
      Tangerine.activity = ""
      @router.landing(true)
    else
      if Tangerine.activity == "assessment run"
        if confirm @text.incomplete_main
          @router.landing(true)
      else
          @router.landing(true)

  logout: ->
    if @user.isAdmin()
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

    @$el.addClass "NavigationView"

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

      "account_button"    : t('NavigationView.button.account')
      "settings_button"   : t('NavigationView.button.settings')

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

  render: ->

    @$el.html "
      <img id='navigation-logo' src='images/navigation-logo.png' title='#{@text.logo}'>

      <paper-menu-button dynamic-align='true' style='color: white; background: #f49b00; margin-left: 15px; float:right;'>
        <paper-icon-button class='dropdown-trigger' noink icon='menu' title='find'></paper-icon-button>
        <paper-menu class='dropdown-content'>
          <paper-item><a href='#user/#{Tangerine.user.id}'>Profile</a></paper-item>
          <paper-item><a href='#logout'>Logout</a></paper-item>
        </paper-menu>
      </paper-menu-button>
      
      <ul>
        <li id='student-container' class='hidden'>
          <label>#{@text.student_id}</label>
          <div id='student-id'></div>
        </li>
        <li id='username-container' style='margin-top: 5px'>
          <label title='#{@text.account}'>#{@whoAmI}</label>
          <div id='username'>#{Tangerine.user.name() || ""}</div>
          <ul id='username-dropdown'>
            <li><a href='#account'>#{@text.account_button}</a></li>
            <li><a href='#settings'>#{@text.settings_button}</a></li>
          </ul>

        </li>
      </ul>
      
    "

    # set up user menu
    if @user?.isAdmin?()
      @$el.find("#username-container").hover @userMenuIn, @userMenuOut

    # Spin the logo on ajax calls
    $(document).ajaxStart -> 
      if $("#navigation-logo").attr("src") isnt "images/navigation-logo-spin.gif"
        $("#navigation-logo").attr "src", "images/navigation-logo-spin.gif"
    $(document).ajaxStop ->
      if $("#navigation-logo").attr("src") isnt "images/navigation-logo.png"
        $("#navigation-logo").attr "src", "images/navigation-logo.png"

  setStudent: ( id ) ->
    if id == ""
      @$el.find("#student-container").addClass("hidden")
      @$el.find('#student-id').html("")
    else
      @$el.find("#student-container").removeClass("hidden")
      @$el.find('#student-id').html(id)


  # Admins get a manage button 
  # triggered on user changes
  handleMenu: (event) =>
    @calcWhoAmI()

    $("#username_label").html @whoAmI

    $('#username').html @user.name()

    # @TODO This needs fixing
    if ~window.location.toString().indexOf("name=") then @$el.find("#logout_link").hide() else  @$el.find("#logout_link").show()

    @user.verify
      isAuthenticated: =>
        @render()
        $( '#navigation' ).fadeIn(250)
      isUnregistered: =>
        @render()
        $( '#navigation' ).fadeOut(250)


