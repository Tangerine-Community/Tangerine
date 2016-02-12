class Assessment extends Backbone.Model

  url: 'assessment'

  initialize: ( options={} ) ->
    # this collection doesn't get saved
    # changes update the subtest view, it keeps order
    @subtests = new Subtests
    # @getResultCount()

  calcDKey: => @id.substr(-5, 5)

  verifyConnection: ( callbacks ) =>
    @timer = setTimeout callbacks.error, 20 * 1000
    $.ajax 
      url: Tangerine.settings.urlView("group", "byDKey")
      dataType: "jsonp"
      data: keys: ["testtest"]
      timeout: 5000
      success: =>
        clearTimeout @timer
        callbacks.success()

  getResultCount: =>
    $.ajax Tangerine.settings.urlView("local", "resultCount")
      type: "POST"
      dataType: "json"
      data: JSON.stringify(
        group       : true
        group_level : 1
        key         : @id
      )
      success: (data) =>
        @resultCount = if data.rows.length != 0 then data.rows[0].value else 0
        @trigger "resultCount"


  # Hijacked success() for later
  # fetchs all subtests for the assessment
  fetch: (options) =>
    oldSuccess = options.success
    options.success = (model) =>
        allSubtests = new Subtests
        allSubtests.fetch
          key: @id
          success: (collection) =>
            @subtests = collection
            @subtests.maintainOrder()
            oldSuccess? @
    Assessment.__super__.fetch.call @, options

  updateFromServer: ( dKey = @calcDKey(), group ) =>

    console.log "trying to update from server"

    @lastDKey = dKey
    
    # split to handle multiple dkeys
    dKeys = dKey.replace(/[^a-f0-9]/g," ").split(/\s+/)

    @trigger "status", "import lookup"

    if Tangerine.settings.get("context") == "server"
      sourceDB = "group-" + group
      targetDB = Tangerine.settings.groupDB
    else
      sourceDB = Tangerine.settings.urlDB("group")
      targetDB = Tangerine.settings.urlDB("local")

    localDKey = 
      if Tangerine.settings.get("context") != "server"
        Tangerine.settings.urlView("local", "byDKey")
      else
        Tangerine.settings.location.group.db+Tangerine.settings.couch.view + "byDKey"

    sourceDKey =
      if Tangerine.settings.get("context") != "server"
        Tangerine.settings.urlView("group", "byDKey")
      else
        "/"+sourceDB+"/"+Tangerine.settings.couch.view + "byDKey"

    $.ajax 
      url: sourceDKey,
      type: "GET"
      dataType: "jsonp"
      data: keys: JSON.stringify(dKeys)
      error: (a, b) => @trigger "status", "import error", "#{a} #{b}"
      success: (data) =>
        docList = []
        for datum in data.rows
          docList.push datum.id

        $.ajax 
          url: localDKey,
          type: "POST"
          contentType: "application/json"
          dataType: "json"
          data: JSON.stringify(keys:dKeys)
          error: (a, b) => @trigger "status", "import error", "#{a} #{b}"
          success: (data) =>
            for datum in data.rows
              docList.push datum.id

            docList = _.uniq(docList)

            $.couch.replicate( 
              sourceDB,
              targetDB,
                success: (response)=> 
                  @checkConflicts docList 
                  @trigger "status", "import success", response
                error: (a, b)      => @trigger "status", "import error", "#{a} #{b}"
              ,
                doc_ids: docList
            )

    false

  # this is pretty strange, but it basically undeletes, tries to replicate again, and then deletes the conflicting (local) version as marked by the first time around.
  checkConflicts: (docList=[], options={}) =>

    @docs = {} unless docs?

    for doc in docList
      do (doc) =>
        Tangerine.$db.openDoc doc,
          open_revs : "all"
          conflicts : true
          error: ->
            console.log "error with #{doc}"
          success: (doc) =>
            if doc.length == 1
              doc = doc[0].ok # couch is weird
              if doc.deletedAt == "mobile"
                $.ajax
                  type: "PUT"
                  dataType: "json"
                  url: "http://localhost:5984/"+Tangerine.settings.urlDB("local") + "/" +doc._id
                  data: JSON.stringify( 
                    "_rev"      : doc._rev
                    "deletedAt" : doc.deletedAt
                    "_deleted"  : false
                  )
                  error: =>
                    #console.log "save new doc error"
                  complete: =>
                    @docs.checked = 0 unless @docs.checked?
                    @docs.checked++
                    if @docs.checked == docList.length
                      @docs.checked = 0
                      if not _.isEmpty @lastDKey
                        @updateFromServer @lastDKey
                        @lastDKey = ""
            else
              docs = doc
              for doc in docs
                doc = doc.ok
                do (doc, docs) =>
                  if doc.deletedAt == "mobile"
                    $.ajax
                      type: "PUT"
                      dataType: "json"
                      url: "http://localhost:5984/"+Tangerine.settings.urlDB("local") + "/" +doc._id
                      data: JSON.stringify( 
                        "_rev"      : doc._rev
                        "_deleted"  : true
                      )
                      error: =>
                        #console.log "Could not delete conflicting version"
                      complete: =>
                        @docs.checked = 0 unless @docs.checked?
                        @docs.checked++
                        if @docs.checked == docList.length
                          @docs.checked = 0
                          if not _.isEmpty @lastDKey
                            @updateFromServer @lastDKey
                            @lastDKey = ""






  updateFromTrunk: ( dKey = @calcDKey() ) =>

    # split to handle multiple dkeys
    dKeys = dKey.replace(/[^a-f0-9]/g," ").split(/\s+/)

    @trigger "status", "import lookup"
    $.ajax 
      url: Tangerine.settings.urlView("trunk", "byDKey")
      dataType: "json"
      contentType: "application/json"
      type: "GET"
      data: 
        keys : JSON.stringify(dKeys)
      success: (data) =>
        docList = []
        for datum in data.rows
          docList.push datum.id
        $.couch.replicate( 
          Tangerine.settings.trunkDB, 
          Tangerine.settings.groupDB,
            success:      => @trigger "status", "import success"
            error: (a, b) => @trigger "status", "import error", "#{a} #{b}"
          ,
            doc_ids: docList
        )

    false

  duplicate: (assessmentAttributes, subtestAttributes, questionAttributes, callback) ->

    originalId = @id

    newModel = @clone()
    newModel.set assessmentAttributes
    newId = Utils.guid()

    newModel.save
      "_id"          : newId
      "assessmentId" : newId
    ,
      success: =>
        questions = new Questions
        questions.fetch
          key: originalId
          success: ( questions ) =>
            subtests = new Subtests
            subtests.fetch
              key: originalId
              success: ( subtests ) =>
                filteredSubtests = subtests.models
                subtestIdMap = {}
                newSubtests = []
                # link new subtests to new assessment
                for model, i in filteredSubtests
                  newSubtest = model.clone()
                  newSubtest.set "assessmentId", newModel.id
                  newSubtestId = Utils.guid()
                  subtestIdMap[newSubtest.id] = newSubtestId
                  newSubtest.set "_id", newSubtestId
                  newSubtests.push newSubtest


                # update the links to other subtests
                for model, i in newSubtests
                  gridId = model.get( "gridLinkId" )
                  if ( gridId || "" ) != ""
                    model.set "gridLinkId", subtestIdMap[gridId]
                  model.save()

                newQuestions = []
                # link questions to new subtest
                for question in questions.models
                  newQuestion = question.clone()
                  oldId = newQuestion.get "subtestId"
                  newQuestion.set "assessmentId", newModel.id
                  newQuestion.set "_id", Utils.guid() 
                  newQuestion.set "subtestId", subtestIdMap[oldId]
                  newQuestions.push newQuestion
                  newQuestion.save()
                callback newModel

  destroy: =>

    # get all docs that belong to this assesssment except results
    Tangerine.$db.view Tangerine.design_doc + "/revByAssessmentId",
      keys:[ @id ]
      success: (response) =>
        docs = []
        for row in response.rows
          # only absolutely necessary properties are sent back, _id, _rev, _deleted
          row.value["_deleted"] = true
          row.value["deletedAt"] = Tangerine.settings.get("context")
          docs.push row.value

        requestData = 
          "docs" : docs

        $.ajax
          type: "POST"
          contentType: "application/json; charset=UTF-8"
          dataType: "json"
          url: Tangerine.settings.urlBulkDocs()
          data: JSON.stringify(requestData)
          success: (responses) =>
            okCount = 0
            (okCount++ if resp.ok?) for resp in responses
            if okCount == responses.length
              @collection.remove @id
              @clear()
            else
              Utils.midAlert "Delete error."
          error: ->
            Utils.midAlert "Delete error."
      error: ->
        Utils.midAlert "Delete error."

  isActive: -> return not @isArchived()

  isArchived: ->
    archived = @get("archived")
    return archived == "true" or archived == true

