class Log extends Backbone.Model

  url: "log"

  #
  # Log using these four functions
  #

  # larger application functions
  app: ( code = "", details = "" ) ->
    return if !~Tangerine.settings.get("log").indexOf("app")
    @add
      "type"      : "app"
      "code"      : code
      "details"   : details
      "timestamp" : (new Date()).getTime()

  # communications with databases
  db: ( code = "", details = "" ) ->
    return if !~Tangerine.settings.get("log").indexOf("db")
    @add
      "type"      : "db"
      "code"      : code
      "details"   : details
      "timestamp" : (new Date()).getTime()

  # specific UI interactions
  ui: ( code = "", details = "" ) ->
    return if !~Tangerine.settings.get("log").indexOf("ui")
    @add
      "type"      : "ui"
      "code"      : code
      "details"   : details
      "timestamp" : (new Date()).getTime()

  # errors, handled or otherwise
  err: ( code = "", details = "" ) ->
    return !~Tangerine.settings.get("log").indexOf("err")
    @add
      "type"      : "err"
      "code"      : code
      "details"   : details
      "timestamp" : (new Date()).getTime()

  # requires that THIS, @, is up to date. 
  # has a side effect, it saves
  add: ( logEvent ) ->
    d = new Date()
    name = "not-signed-in"
    name = Tangerine.user.name() if Tangerine.user.name()?
    @unset "_rev"
    @save 
      "_id"       : @calcName()
      "year"      : d.getFullYear()
      "month"     : d.getMonth()
      "date"      : d.getDate()
      "timestamp" : d.getTime()
      "user"      : name
      "event"     : logEvent

  calcName: ->
    d = new Date()
    user = "not-signed-in"
    user = Tangerine.user.name() if Tangerine.user.name()?
    return hex_sha1 "#{user}_#{d.getTime()}"

class Logs extends Backbone.Collection
  url: "log"
  model: Log
  comparator: (model) -> return model.get("timestamp")

class LogView extends Backbone.View

  className : "LogView"
  events :
    "change #user_selector" : "update"

  initialize: (options) ->
    @logs = options.logs
    @logsByUser  = @logs.indexBy "user"
    @selectedUser = _.first _.keys @logsByUser

  render: =>

    htmlOptions = ("<option data-user='#{user}' #{("selected='selected'" if @selectedUser == user) || ""}>#{user}</option>" for user in _.keys(@logsByUser)).join ""
    @$el.html "
      <h1>Logs</h1>

      <select id='user_selector'>#{htmlOptions}</select>
      <div class='log_container'></div>
    "
    @update()
    @trigger "rendered"

  update: ->

    @selectedUser = @$el.find("#user_selector option:selected").attr("data-user")

    logs = @logsByUser[@selectedUser]

    htmlTable = "
    <h2>User #{@selectedUser}</h2>

      <table>
        <tr>
          <th>Code</th>
          <th>Details</th>
          <th>Time</th>
        </tr>
    "


    for log in logs
      return if not log.get("event")? 

      ev      = log.get "event"
      name    = log.get("user")
      code    = ev.code
      details = ev.details
      time    = (new Date(parseInt(ev.timestamp))).toString()

      htmlTable += "
        <tr>
          <td>#{code}</td>
          <td>#{details}</td>
          <td>#{time}</td>
        </tr>
      "

    htmlTable += "</table>"

    @$el.find(".log_container").html htmlTable
