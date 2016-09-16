class InstrumentSyncView extends Backbone.View

  className : "InstrumentSyncView"

  events:
    'click .instruments' : "syncInstruments"
    'click .cancel-instruments' : "cancelSyncInstruments"
    'click .activate' : 'activate'


  initialize: ->
    @ensureServerAuth
      error: -> console.log 'ensureServerAuth failed'
      success: =>
        $.ajax
          url: "#{Tangerine.settings.get("groupHost")}/#{Tangerine.settings.groupDB}/_design/#{Tangerine.settings.get('groupDDoc')}/_view/byDKey"
          dataType: "jsonp"
          data: keys: ["testtest"]
          timeout: 5000
          success: =>
            @$el.find(".activate, .instruments").toggle()

  activate: ->
    Tangerine.user.ghostLogin Tangerine.settings.upUser, Tangerine.settings.upPass

  cancelSyncInstruments: =>
    @$el.find('#sync-status').html "Cancelling"

    @newAssessment.cancelSync = true
    @newAssessment.cancelReplication()

  ensureServerAuth: (callbacks = {}) ->
    sessionUrl = Tangerine.settings.urlSession "group"
    sessionUrl = "http://" + sessionUrl.replace(/http(.*)\@/, '')


    $.ajax
      url: sessionUrl
      dataType: "jsonp"
      error: -> callbacks.error?()
      success: (response) ->

        unless response.userCtx.name isnt null
          alert "Logging in to server. Please sync again."
          Tangerine.user.ghostLogin "uploader-"+Tangerine.settings.get("groupName"), Tangerine.settings.get("upPass")
          return
          
        callbacks.success?()

  syncInstruments: =>
    return if @alreadySyncing

    @ensureServerAuth
      error: -> console.log 'ensureServerAuth failed'
      success: =>
        @$el.find(".instruments, .cancel-instruments").toggle()

        @alreadySyncing = true
        @$el.find('#sync-status').html "Syncing"

        $.ajax 
          url: Tangerine.settings.urlView("local", "byDKey"),
          type: "POST"
          contentType: "application/json"
          dataType: "json"
          data: "{}"
          success: (data) =>
            keyList = []
            for datum in data.rows
              keyList.push datum.key
            keyList = _.uniq(keyList)

            $.ajax
              url: Tangerine.settings.urlView "group", "assessmentsNotArchived"
              dataType: "jsonp"
              success: (data) =>
                dKeys = _.compact(doc.id.substr(-5, 5) for doc in data.rows).concat(keyList).join(" ")
                @newAssessment = new Assessment
                @listenTo @newAssessment, "complete", (done, total) => 
                  @newAssessment.off()
                  @$el.find('#sync-progress').replaceWith("<div id='sync-progress'></div>")
                  @$el.find('#sync-status').html "Sync'd #{(Math.round(done/total*100))}%"
                  @$el.find(".instruments, .cancel-instruments").toggle()
                  @trigger "complete-sync"

                  @alreadySyncing = false

                @listenTo @newAssessment, "progress", (done, total) =>
                  if done < total
                    @$el.find('#sync-progress').progressbar value : ( done / total ) * 100
                @newAssessment.updateFromServer dKeys
              error: (a, b) ->
                Utils.midAlert "Import error"


  render: ->
    @$el.html "
      <h1>Sync Instruments</h1>
      <button class='activate command'>Activate sync</button>
      <button class='instruments command' style='display: none;'>Sync all</button>
      <br><label for='sync-app'>Update application</label><input type='checkbox' id='sync-app'>
      <button class='cancel-instruments command' style='display:none;'>Cancel sync</button>

      <div id='sync-status'></div>
      <div id='sync-progress'></div>
    "
    @trigger "rendered"