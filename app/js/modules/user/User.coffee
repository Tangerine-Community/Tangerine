# Eventually we'll make Backbone.User based on this.
# $.couch.session needs to be async: false
class User extends Backbone.Model

  url: 'user'

  initialize: (options) ->
    @roles = []
    @dbAdmins = []
    @name = null

  signup: ( name, pass ) =>
    Tangerine.log.app "User-signup", name
    if Tangerine.settings.get("context") == "server"
      $.ajax
        url         : Tangerine.config.get("robbert")
        type        : "POST"
        dataType    : "json"
        data :
          action : "new_user"
          auth_u : name
          auth_p : pass
        success: ( data ) =>
          if @intent == "login"
            @intent = "retry_login"
            @login name, pass
    else
      $.couch.signup name : name, pass,
        success: ( data ) =>

          if @intent == "login" && Tangerine.settings.get("context") == "class" && name != "admin"
            #
            # Register new teacher in class
            #
            $.couch.login
              name     : name
              password : pass
              success: ( user ) =>
                @intent = ""
                @name   = name
                @roles  = user.roles
                view = new RegisterTeacherView
                  name : name
                  pass : pass
                vm.show view
                Tangerine.log.app "User-teacher-register", name
          else if @intent == "login"
            # mobile login
            @intent = "retry_login"
            @login name, pass
        error: =>
          @intent = ""
          @trigger "pass-error", t("LoginView.message.error_password_incorrect")


  login: ( name, pass, callbacks = {}) =>
    Tangerine.log.app "User-login-attempt", name
    $.couch.login
      name     : name
      password : pass
      success: ( user ) =>
        @intent = ""
        @name   = name
        @roles  = user.roles
        Tangerine.log.app "User-login-success", name
        @fetch
          success: =>
            callbacks.success?()
            @trigger "login"
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
          @name  = response.userCtx.name
          @roles = response.userCtx.roles
          @fetch
            success: =>
              @trigger "login"
              callbacks['success'].apply(@, arguments)
              Tangerine.log.app "User-login", "Resumed session"
        else
          callbacks['success'].apply(@, arguments)
      error: ->
        alert "Couch session error.\n\n#{arguments.join("\n")}"

  # @callbacks Supports isAdmin, isUser, isRegistered, isUnregistered
  verify: ( callbacks ) ->
    if @name == null
      if callbacks?.isUnregistered?
        callbacks.isUnregistered()
      else
        Tangerine.router.navigate "login", true
    else
      callbacks?.isRegistered?()
      if @isAdmin()
        callbacks?.isAdmin?()
      else
        callbacks?.isUser?()

  isAdmin: -> @name in @dbAdmins or "_admin" in @roles

  logout: ->
    $.couch.logout
      success: =>
        $.removeCookie "AuthSession"
        @name  = null
        @roles = []
        @clear()
        @trigger "logout"
        if Tangerine.settings.get("context") == "server"
          window.location = Tangerine.settings.urlIndex "trunk"
        else
          Tangerine.router.navigate "login", true
        Tangerine.log.app "User-logout", "logout"

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
      db.openDoc "org.couchdb.user:#{@name}",
        success: ( userDoc ) =>
          Tangerine.$db.openDoc "_security",
            success: (securityDoc) =>
              @dbAdmins  = securityDoc?.admins?.names  || []
              @dbReaders = securityDoc?.members?.names || []
              @dbReaders = _.filter(@dbReaders,(a)=>a.substr(0, 8)!="uploader")
              @set userDoc
              callbacks.success?.apply(@, arguments)
              @trigger 'group-refresh'

        error: =>
          callbacks.error?.apply(@, arguments)



  ###
  
  Groups
  
  ###

  joinGroup: (group, callback = {}) ->
    Utils.working true
    Utils.passwordPrompt (auth_p) =>
        Robbert.request
          action : "new_group"
          group  : group
          auth_u : Tangerine.user.get("name")
          auth_p : auth_p
          success : ( response ) =>
            Utils.working false
            # @TODO
            # We should not have to log back in here.
            # After Robbert creates a group, THIS session ends.
            # Robbert does not interact with the session.
            if response.status == "success"
              @login @get("name"), auth_p, success:callback
              @trigger "group-join" 

            Utils.midAlert response.message
          error : (error) =>
            Utils.working false
            Utils.midAlert "Error creating group\n\n#{error[1]}\n#{error[2]}"
            @fetch success:callback

  leaveGroup: (group, callback = {}) ->
    Utils.working true
    Utils.passwordPrompt ( auth_p ) =>
      Robbert.request
        action : "leave_group" # attempts to leave first, if last person, deletes group
        user   : @get("name")
        group  : group
        auth_u : Tangerine.user.get("name")
        auth_p : auth_p
        success : (response) =>
          Utils.working false
          # @TODO
          # We should not have to log back in here.
          # After Robbert creates a group, THIS session ends.
          # Robbert does not interact with the session.
          @login @get("name"), auth_p, success:callback

          @trigger "group-leave" if response.status == "success"
          Utils.midAlert response.message

        error : (response) =>
          Utils.working false
          Utils.midAlert response.message
          callback.error?( response )

  ghostLogin: (user, pass) ->
    Tangerine.log.db "User", "ghostLogin"
    document.location = Tangerine.settings.location.group.url.replace(/\:\/\/.*@/,'://')+"uploader/_design/uploader/uploader.html?name=#{user}&pass=#{pass}"