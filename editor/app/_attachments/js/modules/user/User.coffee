# Eventually we'll make Backbone.User based on this.
# $.couch.session needs to be async: false
class User extends Backbone.Model

  url: 'user'

  initialize: (options) ->
    @myRoles  = []
    @myName = null
    @myPass = null

  ###
    Accessors
  ###
  name:  -> @myName  || null
  myPass:  -> @myPass  || null
  roles: -> @myRoles || null
  recentUsers: -> ($.cookie("recentUsers")||'').split(",")


  signup: ( name, pass ) =>
    Tangerine.log.app "User-signup", name
    Robbert.signup
      name : name
      pass : pass
      success: =>
        if @intent == "login"
          @intent = "retry_login"
          @login name, pass
      error: (err) =>
        @intent = null
        alert("Signup error\n"+err.toString())

  groups: ->
    @getArray('roles').reduce (result, role) ->
      if role.indexOf('admin-') != -1 # isAdmin
        result.admin.push role.substr(6, role.length) # remove admin-
      else if role.indexOf('member-') != -1 # isMember
        result.member.push role.substr(7, role.length)  # remove member-
      return result
    , { admin : [], member : [] }

  login: ( name, pass, callbacks = {}) =>
#    console.log("User.login: " + pass)
    Tangerine.log.app "User-login-attempt", name
    $.couch.login
      name     : name
      password : pass
      success: ( user ) =>
#        console.log("assigning @myPass:" + pass)
        @intent = ""
        @myName = name
        @pass = pass
        @myPass = pass
        @myRoles  = user.roles
        Tangerine.log.app "User-login-success", name
        @fetch
          success: =>
            callbacks.success?()
            @trigger "login"
            recentUsers = @recentUsers().filter( (a) => !~a.indexOf(@name()))
            recentUsers.unshift(@name())
            recentUsers.pop() if recentUsers.length >= @RECENT_USER_MAX
            $.cookie("recentUsers", recentUsers)

      error: ( status, error, message ) =>
        if @intent == "retry_login"
          @intent = ""
          @trigger "pass-error", t("LoginView.message.error_password_incorrect")
          Tangerine.log.app "User-login-fail", name + " password incorrect"
        else
          @intent = "login"
          @signup name, pass

  # attempt to restore a user's login state from couch session
  sessionRefresh: (callbacks) =>
    $.couch.session
      success: (response) =>
        if response.userCtx.name?
          @myName  = response.userCtx.name
          @myRoles = response.userCtx.roles
          @fetch
            success: =>
              @trigger "login"
              callbacks.success.apply(@, arguments)
              Tangerine.log.app "User-login", "Resumed session"
        else
          callbacks.success.apply(@, arguments)
      error: ->
        alert "Couch session error.\n\n#{arguments.join("\n")}"

  # @callbacks Supports isAdmin, isUser, isAuthenticated, isUnregistered
  verify: ( callbacks ) ->
    if @myName == null
      if callbacks?.isUnregistered?
        callbacks.isUnregistered()
      else
        Tangerine.router.navigate "login", true
    else
      callbacks?.isAuthenticated?()
      if @isAdmin()
        callbacks?.isAdmin?()
      else
        callbacks?.isUser?()

  isAdmin: ->
    amServerAdmin = @getArray('roles').indexOf('_admin') != -1
    amGroupAdmin = @groups().admin.indexOf(Tangerine.settings.get('groupName')) != -1
    return true if amGroupAdmin
    return true if amServerAdmin
    return false

  logout: ->
    $.couch.logout
      success: =>
        $.removeCookie "AuthSession"
        @myName  = null
        @myPass  = null
        @pass = null
        @myRoles = []
        @clear()
        @trigger "logout"
        Tangerine.log.app "User-logout", "logout"
        window.location = Tangerine.settings.urlIndex "trunk"


  ###
    Saves to the `_users` database
    usage: either `@save("key", "value", options)` or `@save({"key":"value"}, options)`
    @override (Backbone.Model.save)
  ###
  save: (keyObject, valueOptions, options ) ->
    attrs = {}
    if _.isObject keyObject
      attrs = $.extend attrs, keyObject
      options = valueOptions
    else
      attrs[keyObject] = value
    # get user DB
    $.couch.userDb (db) =>
      db.saveDoc $.extend(@attributes, attrs),
        success: =>
          options.success?.apply(@, arguments)

  ###
    Fetches user's doc from _users, loads into @attributes
  ###
  fetch: ( callbacks={} ) =>
    $.couch.userDb (db) =>
      db.openDoc "org.couchdb.user:#{@myName}",
        success: ( userDoc ) =>
          @set userDoc
          callbacks.success?(userDoc)
        error: =>
          callbacks.error?(userDoc)



  ###

  Groups

  ###

  joinGroup: (name, callbacks = {}) ->
    Utils.working true
    Robbert.newGroup
      name  : name
      success : ( response ) =>
        Utils.working false
        Utils.midAlert response.message
        @fetch
          success: =>
            callbacks.success?(response)
            @trigger "groups-update"
      error : (response) =>
        Utils.working false
        Utils.midAlert (response.responseJSON||{}).message || 'Error creating group'
        callbacks.error?(response)

  leaveGroup: (group, callbacks = {}) ->
    Utils.working true
    Robbert.leaveGroup
      user   : @get("name")
      group  : group
      success : (response) =>
        @fetch
          success: =>
            Utils.working false
            @trigger "groups-update"
            Utils.midAlert response.message
            callbacks.success?(response)

      error : (response) =>
        Utils.working false
        Utils.midAlert "Error leaving group\n#{response.responseJSON}"
        callbacks.error?(response)

  # probably not needed anymore
  ghostLogin: (user, pass) ->
    Tangerine.log.db "User", "ghostLogin"
    location = encodeURIComponent(window.location.toString())
    document.location = Tangerine.settings.location.group.url.replace(/\:\/\/.*@/,'://')+"_ghost/#{user}/#{pass}/#{location}"
