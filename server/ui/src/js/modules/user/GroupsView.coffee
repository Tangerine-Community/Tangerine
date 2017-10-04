class GroupsView extends Backbone.View

  className: "GroupsView"

  events:
    'click .account' : 'gotoAccount'
    'click .goto'    : 'gotoGroup'

  initialize: ->
    Robbert.fetchUsers

  gotoAccount: ->
    Tangerine.router.navigate "account", true

  gotoGroup: (event) ->
    group = $(event.target).attr("data-group")
    window.location = Tangerine.settings.urlIndex(group, "assessments")

  renderGroups: ->
    @$el.find('#group-list-container').html "
      <h2>Admin</h2>
        #{Tangerine.user.groups().admin.map( (group) -> "<button class='command goto' data-group='#{_.escape(group)}'>#{group}</button>").join('')}
      <h2>Member</h2>
        #{Tangerine.user.groups().member.map( (group) -> "<button class='command goto' data-group='#{_.escape(group)}'>#{group}</button>").join('')}
    "

  render: ->
    @$el.html "
      <button class='account navigation'>Account</button>
      <h1>Groups</h1>
      <div id='group-adder'></div>
      <div id='group-list-container'><img src='images/loading.gif' class='loading'></div>
    "

    @renderGroups()
    @trigger "rendered"
