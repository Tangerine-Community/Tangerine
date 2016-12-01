class UsersMenuView extends Backbone.View

  className: "UsersMenuView"

  events:
    "click .admin" : "selectAdmin"
    "click .reader" : "selectReader"
    "click #add-admin"     : "addAdmin"
    "click #remove-admin"  : "removeAdmin"
    "click #add-member"    : "addMember"
    "click #remove-member" : "removeMember"

  selectAdmin: ( event ) ->
    @$el.find("#selected-admin").val $(event.target).attr("data-name")

  selectReader: ( event ) ->
    @$el.find("#selected-member").val $(event.target).attr("data-name")

  addAdmin: ->
    user = @$el.find('#selected-admin').val()
    Robbert.addAdmin user, @refreshUsers

  removeAdmin: ->
    user = @$el.find('#selected-admin').val()
    Robbert.removeAdmin user, @refreshUsers

  addMember: ->
    user = @$el.find('#selected-member').val()
    Robbert.addMember user, @refreshUsers

  removeMember: ->
    user = @$el.find('#selected-member').val()
    Robbert.removeMember user, @refreshUsers

  refreshUsers: =>
    Robbert.fetchUsers Tangerine.settings.get('groupName'), (users) => @renderUsers(users)

  renderUsers: (users) ->

    adminHtml = users.admin?.map( (admin) ->
      "<li data-name='#{_.escape(admin)}' class='admin icon'>#{_.escape(admin)}</li>"
    ).join('')
    if users.member?.length == 0
      memberHtml = "<span class='grey'>No members yet.</span>"
    else
      memberHtml = users.member?.map( (member) ->
        "<li data-name='#{_.escape(member)}' class='member icon'>#{_.escape(member)}</li>"
      ).join('')

    @$el.find('#users-row').html "
      <td><ul id='admin-container' multiple='multiple' size='5'>#{adminHtml}</ul></td>
      <td><ul id='member-container' multiple='multiple' size='5'>#{memberHtml}</ul></td>
    "

  render: ->

    @$el.html "
      <h1>Users</h1>
      <table>
      <tr>
        <th>Admins</th>
        <th>Members</th>
      </tr>
      <tr>
        <td>
          <input id='selected-admin'  value=''>
          <button id='add-admin' class='command'>+</button>
          <button id='remove-admin' class='command'>-</button>
        </td>
        <td>
          <input id='selected-member' value=''>
          <button id='add-member' class='command'>+</button>
          <button id='remove-member' class='command'>-</button>
        </td>
      </tr>
      <tr id='users-row'>
      </tr>
    "

    @refreshUsers()

