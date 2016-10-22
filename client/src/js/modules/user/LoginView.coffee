class LoginView extends Backbone.Marionette.View

  className: 'LoginView'

  events:
    if Modernizr.touch
      'keypress input'     : 'keyHandler'
      'change input'       : 'onInputChange'
      'change select#name' : 'onSelectChange'
      'click .mode'   : 'updateMode'
      'click button'  : 'action'
      'click .recent' : 'showRecent'
      'blur .recent'       : 'blurRecent'
      'keyup #new_name'    : 'checkNewName'
    else
      'keypress input'     : 'keyHandler'
      'change input'       : 'onInputChange'
      'change select#name' : 'onSelectChange'
      'click .mode'        : 'updateMode'
      'click button'       : 'action'
      'click .recent'      : 'showRecent'
      'blur .recent'       : 'blurRecent'
      'keyup #new_name'    : 'checkNewName'

  initialize: (options) ->
    $(window).on('orientationchange scroll resize', @recenter)
    @mode = "login"
    @i18n()
    @users = options.users
    @user = Tangerine.user
    
    @listenTo @user, "login", @goOn
    @listenTo @user, "pass-error", @passError
    @listenTo @user, "name-error", @nameError
    
    @oldBackground = $("body").css("background")
    $("body").css("background", "white")
    $("#footer").hide()

  checkNewName: (event) ->
    $target = $(event.target)
    name = ( $target.val().toLowerCase() || '' )
    if name.length > 4 and name in @users.pluck("name")
      @nameError(@text['error_name_taken'])
    else
      @clearErrors()


  onInputChange: (event) ->
    $target = $(event.target)
    type = $target.attr("type")
    return unless type is 'text' or not type?

    $target.val($target.val().toLowerCase())

  showRecent: ->
    @$el.find("#name").autocomplete(
      source: @user.recentUsers()
      minLength: 0
    ).autocomplete("search", "")

  blurRecent: ->
    @$el.find("#name").autocomplete("close")
    @initAutocomplete()

  initAutocomplete: ->
    @$el.find("#name").autocomplete
      source: @users.pluck("name")

  recenter: =>
    @$el.middleCenter()

  i18n: ->
    @text =
      "login"      : t('LoginView.button.login')
      "sign_up"    : t('LoginView.button.sign_up')

      "login_tab"  : t('LoginView.label.login')
      "sign_up_tab"  : t('LoginView.label.sign_up')

      "user"       : _(t('LoginView.label.user')).escape()
      "teacher"    : _(t('LoginView.label.teacher')).escape()
      "enumerator" : _(t('LoginView.label.enumerator')).escape()
      "password"   : t('LoginView.label.password')
      "password_confirm" : t('LoginView.label.password_confirm')
      "error_name" : t('LoginView.message.error_name_empty')
      "error_pass" : t('LoginView.message.error_password_empty')
      "error_name_taken" : t('LoginView.message.error_name_taken')


  onSelectChange: (event) ->
    $target = $(event.target)
    if $target.val() == "*new"
      @updateMode "signup"
    else
      @$el.find("#pass").focus()

  goOn: -> Tangerine.router.navigate "", true

  updateMode: (event) ->
    $target = $(event.target)
    @mode = $target.attr('data-mode')
    $target.parent().find(".selected").removeClass("selected")
    $target.addClass("selected")
    $login  = @$el.find(".login")
    $signup = @$el.find(".signup")

    switch @mode
      when "login"
        $login.show()
        $signup.hide()
      when "signup"
        $login.hide()
        $signup.show()

    @$el.find("input")[0].focus()

  render: =>

    nameName =  @text.user

    nameName = nameName.titleize()

    html = "
      <img src='images/login_logo.png' id='login_logo'>

      <div class='tab_container'>
        <div class='tab mode selected first' data-mode='login'>#{@text.login_tab}</div><div class='tab mode last' data-mode='signup'>#{@text.sign_up_tab}</div>
      </div>

      <div class='login'>
        <section>

          <div class='messages name_message'></div>
          <table><tr>
            <td><input id='name' class='tablet-name' placeholder='#{nameName}'></td>
            <td><img src='images/icon_recent.png' class='recent clickable'></td>
          </tr></table>

          <div class='messages pass_message'></div>
          <input id='pass' type='password' placeholder='#{@text.password}'>

          <button class='login'>#{@text.login}</button>

        </section>
      </div>

      <div class='signup' style='display:none;'>
        <section>
          <div class='signup-form'>
            <input id='new_name' class='tablet-name' type='text' placeholder='#{nameName}'>

            <div class='messages pass_message'></div>
            <input id='new_pass_1' type='password' placeholder='#{@text.password}'>

            <input id='new_pass_2' type='password' placeholder='#{@text.password_confirm}'>
          </div>
          <button class='sign_up'>#{@text.sign_up}</button>
        </section>
      </div>
    "

    @$el.html html

    # Attach registration form.
    # TODO: We should feed in the Tangerine.user Model that already exists but we have to do this
    # the hard way and feed in a new placeholder Model that can be used to pass attributes to 
    # Tangerine.user cleanly on signup. Otherwise on pouch save of the Backbone.Forms model we 
    # get an error of `DataCloneError: An object could not be cloned`.
    # Issue in PouchDB described here: https://pouchdb.com/errors.html#could_not_be_cloned
    formModel = new Backbone.Model()
    if (Tangerine.settings.has('customProfile'))
      formModel.schema = Tangerine.settings.get('customProfile')
    else 
      formModel.schema =
        "name": "Text"
        "password": "Password"
        "confirmPassword": "Password"
    @registrationForm = new Backbone.Form({
        model: formModel
    }).render()
    $(@$el.find('.signup-form')[0]).html(@registrationForm.el)

    @initAutocomplete()

    @nameMsg = @$el.find(".name_message")
    @passMsg = @$el.find(".pass_message")

    @trigger "rendered"

  afterRender: =>
    @recenter()

  onBeforeDestroy: =>
    $("#footer").show()
    $("body").css("background", @oldBackground)
    $(window).off('orientationchange scroll resize', @recenter)

  action: ->
    @login()  if @mode is "login"
    @signup() if @mode is "signup"
    return false

  signup: ->
    errors = @registrationForm.commit()
    if (errors)
      alert('Cannot proceed because of errors in your form.')
      return alert(JSON.stringify(errors))
    else if (@registrationForm.model.get('password') !== @registrationForm.model.get('confirmPassword'))
      return @passError(@text.pass_mismatch)
    # Separate out name and pass properties because they will be modified and set in @user.singup().
    name  = @registrationForm.model.get('name')
    pass  = @registrationForm.model.get('password')
    otherAttributes = @registrationForm.model.toJSON()
    delete otherAttributes.name
    delete otherAttributes.password
    delete otherAttributes.confirmPassword
    @user.set(otherAttributes)
    @user.signup(name, pass)


  login: ->
    name = ($name = @$el.find("#name")).val()
    pass = ($pass = @$el.find("#pass")).val()

    @clearErrors()

    @nameError(@text.error_name) if name == ""
    @passError(@text.error_pass) if pass == ""

    if @errors == 0
      @user.login name, pass


    return false

  passError: (error) ->
    @errors++
    @passMsg.html error
    @$el.find("#pass").focus()

  nameError: (error) ->
    @errors++
    @nameMsg.html error
    @$el.find("#name").focus()

  clearErrors: ->
    @nameMsg.html ""
    @passMsg.html ""
    @errors = 0
