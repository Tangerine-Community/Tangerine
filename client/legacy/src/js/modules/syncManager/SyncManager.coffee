class SyncManager extends Backbone.Model

  url : "log"

  initialize: ->
    @set "_id" : "SyncManagerLog"

  setUserKey: ( userKey ) ->
    @userKey = userKey + "-1.6.1" # version where uploading changed, necessitating new log

  getTrips: -> return @getArray(@userKey)
  setTrips: ( trips ) -> @set(@userKey, trips)

  addTrips: ( someTrips, callback ) ->
    myTrips = @getTrips()
    myTrips = myTrips.concat someTrips
    @setTrips _(myTrips).uniq()
    @save null,
      success: callback,
      error: callback



class SyncManagerView extends Backbone.View

  className : "SyncManagerView"

  events:
    'click .upload'   : 'upload'
    'click .sync-old' : 'syncOldSetup'

  TRIPS_PER_CHUNK : 10

  MAX_RETRIES : 2


  ensureServerAuth: (callbacks = {}) ->

    groupHost = Tangerine.settings.get('groupHost')
    protocolAndDomain = groupHost.split(':\/\/')
    sessionUrl = protocolAndDomain[0] + '://uploader-' + Tangerine.settings.get('groupName') + ':' + Tangerine.settings.get('upPass') + '@' + protocolAndDomain[1] + '/db/_session'
    $.ajax
      url: sessionUrl
      type: "GET"
      dataType: "json"
      xhrFields: 
        withCredentials: true
      error: $.noop
      success: (response) ->

        if response.userCtx.name is null
          callbacks.error?() 
        else
          callbacks.success?()

  # download previous trips from server
  # server calls
  #   1. check to see if logged in at server
  #   2. get tripIds and resultIds from associated users
  syncOldSetup: ->

    @updateSyncOldProgress message: "Starting"

    @ensureServerAuth
      error: => console.log 'ensureServerAuth failed'
      success: =>
        @updateSyncOldProgress message: "Fetching result ids"

        # get tripIds and resultIds from associated users
        $.ajax
          url: Tangerine.settings.urlView("group", "tripsAndUsers")
          dataType: "jsonp"
          data:
            keys:
              JSON.stringify([Tangerine.user.get("name")].concat(Tangerine.user.getArray("previousUsers")))

          error: =>

            alert "Error syncing"
            @updateSyncOldProgress message: "Error fetching trip ids"

          success: (data) =>

            @resultsByTripId = {}

            for result in data.rows
              tripId = result.value
              resultId = result.id
              @resultsByTripId[tripId] = [] unless @resultsByTripId[tripId]
              @resultsByTripId[tripId].push resultId

            @updateSyncOldProgress message: "Building replication job"

            @resultChunks = []
            @tripChunks   = []

            index = 0

            for tripId, resultIds of @resultsByTripId

              resultChunk = [] unless resultChunk?
              resultChunk = resultChunk.concat resultIds

              tripChunk = [] unless tripChunk?
              tripChunk.push tripId

              if index is @TRIPS_PER_CHUNK
                @resultChunks.push resultChunk
                @tripChunks.push   tripChunk
                resultChunk = []
                tripChunk   = []

                index = 0
              else
                index += 1

            @resultChunkCount = @resultChunks.length

            @syncOldReplicate()


  syncOldReplicate: ->

    syncError = false

    retries = 0

    doOne = =>

      percentageDone = ((@resultChunkCount - @resultChunks.length) / @resultChunkCount) * 100

      @updateSyncOldProgress percentage: percentageDone

      if @resultChunks.length is 0

        if syncError
          Utils.sticky "There was an error during syncing, please try again." 

        @update => @render()

      else

        docIds  = @resultChunks.pop()
        tripIds = @tripChunks.pop()

        # try to replicate
        # if it works, reset retries and continue
        # if it doesn't work, push data back to queue and try again
        # if we've tried a bunch of times already, give up and go to next chunk

        $.couch.replicate Tangerine.settings.urlDB("group"), Tangerine.db_name,
          {
            success : =>
              retries = 0
              @log.addTrips tripIds, doOne
            error: ->
              if retries < @MAX_RETRIES
                @resultsChunks.push docIds
                @tripChunks.push tripIds
                retries += 1
                doOne()
              else
                retries = 0
                syncError = true
                doOne()
          },
            doc_ids : docIds

    doOne()

  updateSyncOldProgress: ( options ) ->

    if options.message?
      @$el.find('#sync-old-progress').html "
        <tr>
          <th>Status</th><td>#{options.message}</td>
        </tr>
      "
    else if options.percentage?
      @$el.find('#sync-old-progress').html "
        <tr>
          <th>Complete<th><td>#{parseInt(options.percentage)}%</td>
        </tr>
      "

  initialize: () ->
    #@syncUsers()
    @log = new SyncManager
    @log.setUserKey "sunc-#{Tangerine.user.name()}"
    @userLogKey = 
    @messages = []
    @sunc = null
    @toAdd = []
    @toSync = null
    @update => @render()
    incompleteWorkflows = Tangerine.user.getPreferences('tutor-workflows', 'incomplete') || {}
    @incompleteTrips = []
    for workflowIds, tripIds of incompleteWorkflows
      @incompleteTrips = @incompleteTrips.concat(tripIds)

  update: ( callback ) ->
    todoList = [
      @updateSyncable
      @updateSunc
      @updateCounts
      callback
    ]

    doIt = ->
      doNow = todoList.shift()
      doNow => doIt()

    doIt()
  # Counts how many trips are on the tablet from this user and all users previous users
  # removes any trips that are in the incomplete list
  updateSyncable: ( callback ) =>
    Tangerine.db.query "tangerine/tripsAndUsers",
      keys    : [Tangerine.user.name()].concat(Tangerine.user.getArray('previousUsers'))
    .then ( response ) =>
      @syncable = _( _( response.rows ).pluck( "value" ) ).uniq()
      # filter out incomplete trips
      if @incompleteTrips.length isnt 0
        @syncable = @syncable.filter((el) => !~@incompleteTrips.indexOf(el))
      callback()
    .catch ( err ) =>
      console.log err

  # get the log of what trips have been synced already
  # if the log doesn't exist yet, make it exist
  updateSunc: ( callback ) =>
    @log.fetch
      error: => @log.save null, success: => callback()
      success: -> callback()

  # update our counts
  updateCounts: ( callback ) =>
    @sunc = @log.getTrips()
    @toSync = @syncable.length - @sunc.length
    callback()


  upload: =>

    if @uploadingNow
      return alert "Already uploading."

    #@syncUsers()

    @uploadingNow = true
    @uploadStatus "Upload initializing"

    allTrips = _(@syncable).clone().reverse()# all trips, for debugging
    tempTrips = _(_(@syncable).clone()).difference(@sunc) # only unlogged unsunc trips

    doTrip = =>

      @uploadStatus ("Uploading #{100-parseInt((tempTrips.length / allTrips.length) * 100)}% complete")
      currentTrip = tempTrips.shift()
      
      unless currentTrip?
        @uploadingNow = false
        Utils.sticky "Done uploading."
        return 

      Tangerine.db.query "tangerine/tripsAndUsers",
        key     : currentTrip
      .then ( response ) =>
        docIds = _(response.rows).pluck("id")
        allDocs = (Tangerine.settings.location.group.db+"_all_docs").replace('group-', 'db\/group-')
        $.ajax
          url: allDocs+"?keys="+JSON.stringify(docIds)
          dataType: "json"
          error: (err) =>
            @uploadingNow = false
            alert "Error communicating with server.\n" + err
          success: (response) =>

            rows = response.rows
            leftToUpload = []
            for row in rows
              leftToUpload.push(row.key) unless row.id?

            # if it's already fully uploaded
            # make sure it's in the log

            if leftToUpload.length is 0
              @sunc.push currentTrip
              @sunc = _.uniq(@sunc)
              @log.setTrips @sunc
              @log.save null,
                error: => @uploadingNow = false
                success: =>
                  @update =>
                    @render()
                    doTrip()
            else
              Tangerine.db.allDocs
                include_docs: true
                keys: docIds
              .then (response) =>
                docs = {"docs":response.rows.map((el)->el.doc)}
                compressedData = LZString.compressToBase64(JSON.stringify(docs))
                a = document.createElement("a")
                a.href = Tangerine.settings.get("groupHost")
                bulkDocsUrl = "#{a.protocol}//#{a.host}/_corsBulkDocs/#{Tangerine.settings.groupDB}"
                
                $.ajax
                  type : "post"
                  url : bulkDocsUrl
                  data : compressedData
                  error: =>
                    @uploadingNow = false
                    alert "Server bulk docs error"
                  success: =>
                    @sunc.push currentTrip
                    @sunc = _.uniq(@sunc)
                    @log.setTrips @sunc
                    @log.save null,
                      error: => @uploadingNow = false
                      success: =>
                        @update =>
                          @render()
                          doTrip()

    doTrip()


  uploadStatus: (status) ->
    @$el.find(".upload-status").html status

  render: ( statusMessage = '' ) =>

    suncCount = if _(@sunc).isArray()
      @sunc.length
    else
      "Loading..."

    toSyncCount = if _(@toSync).isNumber()
      @toSync
    else
      "Loading..."


    @$el.html "
      <h2>Sync Status</h2>
      <table class='class_table'>
        <tr>
          <th>Synced results</th><td>#{suncCount}</td>
        </tr>
        <tr>
          <th>Left to sync</th><td>#{toSyncCount}</td>
        </tr>
        <tr>
          <th colspan='2'><button class='upload command'>Upload</button></th>
        </tr>
      </table>
      <div style='margin-bottom:12px; padding-bottom: 12px; border-bottom: 1px solid #eee;'></div>
      <h2>Server results</h2>
      <table id='sync-old-progress'></table>
      <button class='sync-old command'>Sync</button>
    "

