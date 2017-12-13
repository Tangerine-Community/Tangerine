class UsersMenuView extends Backbone.View

  className: "UsersMenuView"

  events:
    "click .admin" : "selectAdmin"
    "click .reader" : "selectReader"
    "click #add_admin"     : "addAdmin"
    "click #remove_admin"  : "removeAdmin"
    "click #add_reader"    : "addReader"
    "click #remove_reader" : "removeReader"

  selectAdmin: ( event ) ->
    @$el.find("#selected_admin").val $(event.target).attr("data-name")

  selectReader: ( event ) ->
    @$el.find("#selected_reader").val $(event.target).attr("data-name")

  addAdmin: ->
    user = @$el.find("#selected_admin").val()
    @useRobbert "add_admin", user

  removeAdmin: ->
    user = @$el.find("#selected_admin").val()
    @useRobbert "remove_admin", user

  addReader: ->
    user = @$el.find("#selected_reader").val()
    @useRobbert "add_reader", user

  removeReader: ->
    user = @$el.find("#selected_reader").val()
    @useRobbert "remove_reader", user

  useRobbert : (action, user) ->
    Utils.passwordPrompt ( auth_p ) =>
        Robbert.request
          "action" : action
          "user"   : user
          "group"  : Tangerine.settings.get("groupName") # without group prefix
          "auth_u" : Tangerine.user.get("name")
          "auth_p" : auth_p
          success : ( response ) =>
            Utils.midAlert response.message
            Tangerine.user.fetch success: =>
              @render()
          error : (error) =>
            Utils.midAlert "Server error\n\n#{error[1]}\n#{error[2]}"

  initialize: ->

  render: ->
    admins  = Tangerine.user.dbAdmins
    readers = Tangerine.user.dbReaders

    adminOptions  = ("<li data-name='#{_.escape(admin)}' class='admin icon'>#{_.escape(admin)}</li>" for admin in admins).join("")
    readerOptions = if readers.length > 0 then ("<li data-name='#{_.escape(reader)}' class='reader icon'>#{_.escape(reader)}</li>" for reader in readers).join("") else "<span class='grey'>No members yet.</span>"

    html = "
      <h1>Users</h1>
      <table>
      <tr>
        <th>Admins</th>
        <th>Members</th>
      </tr>
      <tr>
        <td>
          <input id='selected_admin'  value=''>
          <button id='add_admin' class='command'>+</button>
          <button id='remove_admin' class='command'>-</button>
        </td>
        <td>
          <input id='selected_reader' value=''>
          <button id='add_reader' class='command'>+</button>
          <button id='remove_reader' class='command'>-</button>
        </td>
      </tr>
      <tr>
        <td>
          <ul id='member_select' multiple='multiple' size='5'>
            #{adminOptions}
          </ul>
        </td>
        <td>
          <ul id='reader_select' multiple='multiple' size='5'>
            #{readerOptions}
          </ul>
        </td>
      </tr>
    "

    @$el.html html
