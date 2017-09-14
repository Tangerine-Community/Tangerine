class GroupsView extends Backbone.View


  className: "GroupsView"

  events:
    'click .account' : 'gotoAccount'
    'click .goto'    : 'gotoGroup'
    'click .newProject'    : 'newProject'
    'click .viewProject'    : 'viewProject'
    'contextmenu .viewProject'    : 'showTooltip'
#    'mouseleave .viewProject'    : 'leaveTooltip'

  initialize: ->
    Robbert.fetchUsers
    $.ajax
      url: "/editor/project/listAll",
      type: "GET"
      dataType: "json"
      contentType: "application/json"
      success: ( data ) =>
#        console.log("Projects" + JSON.stringify(data))
        @projects = data
        console.log("Projects: " + JSON.stringify(@projects))
        @renderGroups("")
      error: ( err ) =>
        alert("Error: " + err)

  gotoAccount: ->
    Tangerine.router.navigate "account", true

  gotoGroup: (event) ->
    group = $(event.target).attr("data-group")
    window.location = Tangerine.settings.urlIndex(group, "assessments")

  viewProject: (event) ->
    group = $(event.target).attr("data-group")
    console.log("take me to there: " + group)
    window.location = "/editor/projects/" + group + "/" + "content/"

#     kudos: http://jsfiddle.net/ostapische/4GHGF/
  showTooltip: (event) ->
    group = $(event.target).attr("data-group")
    title = $(event.target).attr("title")
#    tooltipId = "#" + group + "tooltip"
#    tooltip = document.querySelector(tooltipId);
#    text = tooltip.innerHTML
    console.log("text: " + title)
#    tooltip.style.display = "inline";

    window.prompt("Copy to clipboard: Ctrl+C, Enter", title);
#    console.log("stuff");
#    tooltip.select;

#    try
#      successful = document.execCommand('copy');
#      msg = successful ? 'successful' : 'unsuccessful';
#      console.log('Copying text command was ' + msg);
#    catch err
#      console.log('Oops, unable to copy');

    return

  leaveTooltip: (event) ->
    group = $(event.target).attr("data-group")
    tooltipId = "#" + group + "tooltip"
    tooltip = $(tooltipId);
    tooltip[0].style.display = "none";

  newProject: (event) ->
    projectName = $('#projectName').val()
    console.log("projectName: " + projectName)
    $.ajax
      url: "/editor/project/create",
      type: "POST"
      dataType: "json"
      contentType: "application/json"
      data: JSON.stringify(
        projectName : projectName
      )
      success: ( data ) =>
        console.log("Project created: " + JSON.stringify(data.dirs))
        @projects = data.dirs
        @$el.find('#group-list-container').html ""
        @renderGroups("")
      error: ( data ) =>
        console.log("Project creation error: " + JSON.stringify(data))
        alert("Project creation error: " + JSON.stringify(data))

#        <div class='tooltip' id='#{group.projectName}tooltip'>#{group.datKey}</div><br/>
  renderGroups: (message) ->
    @$el.find('#group-list-container').html "
      <h2>v3 Projects</h2>#{message}
        <p>Create new project: <input type='text' id='projectName' style='width: 200px;'> <button class='command newProject'>Create</button></p>\n
        <p>Right-click on the project name to view its dat id.</p>
        <p>#{@projects.map( (group) -> "<button class='command viewProject' data-group='#{_.escape(group.projectName)}' title='#{group.datKey}'>#{group.projectName}</button>").join('')}</p>
      <h2>v2 Groups</h2>
      <h3>Admin</h3>
        <p>#{Tangerine.user.groups().admin.map( (group) -> "<button class='command goto' data-group='#{_.escape(group)}'>#{group}</button>").join('')}</p>
      <h3>Member</h3>
        #{Tangerine.user.groups().member.map( (group) -> "<button class='command goto' data-group='#{_.escape(group)}'>#{group}</button>").join('')}
    "

  render: ->
    @$el.html "
      <button class='account navigation'>Account</button>
      <h1>Groups</h1>
      <div id='group-adder'></div>
      <div id='group-list-container'><img src='images/loading.gif' class='loading'></div>
    "

    @trigger "rendered"

