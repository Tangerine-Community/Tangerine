class Assessment extends Backbone.Model

  url: 'assessment'

  VERIFY_TIMEOUT : 20 * 1000

  initialize: ( options={} ) ->
    # this collection doesn't get saved
    # changes update the subtest view, it keeps order
    @subtests = new Subtests
    # @getResultCount()

  calcDKey: => @id.substr(-5, 5)

  # refactor to events
  verifyConnection: ( callbacks = {} ) =>
    console.log "called"
    @timer = setTimeout(callbacks.error, @VERIFY_TIMEOUT) if callbacks.error?
    $.ajax
      url: Tangerine.settings.urlView("group", "byDKey")
      dataType: "jsonp"
      data: keys: ["testtest"]
      timeout: @VERIFY_TIMEOUT
      success: =>
        clearTimeout @timer
        callbacks.success?()

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
          key: "s" + @id
          success: (collection) =>
            @subtests = collection
            @subtests.ensureOrder()
            oldSuccess? @

    Assessment.__super__.fetch.call @, options

  splitDKeys: ( dKey = "" ) ->
    # split to handle multiple dkeys
    dKey.toLowerCase().replace(/[g-z]/g,'').replace(/[^a-f0-9]/g," ").split(/\s+/)

  updateFromServer: ( dKey = @calcDKey(), group ) =>

    @lastDKey = dKey

    dKeys = @splitDKeys(dKey)

    @trigger "status", "import lookup"

    sourceDB = "group-" + group
    targetDB = Tangerine.settings.groupDB

    localDKey = Tangerine.settings.location.group.db+Tangerine.settings.couch.view + "byDKey"

    sourceDKey = Tangerine.settings.get("groupHost") + "/"+sourceDB+"/"+Tangerine.settings.couch.view + "byDKey"

    $.ajax
      url: sourceDKey,
      type: "GET"
      dataType: "json"
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

  updateFromIrisCouch: ( dKey = @calcDKey() ) =>

    # split to handle multiple dkeys
    dKeys = dKey.replace(/[^a-f0-9]/g," ").split(/\s+/)

    @trigger "status", "import lookup"
    $.ajax
      url: "http://tangerine.iriscouch.com/tangerine/_design/ojai/_view/byDKey"
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
          "http://tangerine.iriscouch.com/tangerine",
          Tangerine.settings.groupDB,
            success:(response) => @trigger "status", "import success", response
            error: (a, b)      => @trigger "status", "import error", "#{a} #{b}"
          ,
            doc_ids: docList
        )

    false


  # Fetches all assessment related documents, puts them together in a document
  # array for uploading to bulkdocs.
  duplicate: ->

    questions = new Questions
    subtests  = new Subtests

    modelsToSave = []

    oldModel = @

    # general pattern: clone attributes, modify them, stamp them, put attributes in array

    $.extend(true, clonedAttributes = {}, @attributes)

    newId = Utils.guid()

    clonedAttributes._id          = newId
    clonedAttributes.name         = "Copy of #{clonedAttributes.name}"
    clonedAttributes.assessmentId = newId

    newModel = new Assessment(clonedAttributes)

    modelsToSave.push (newModel).stamp().attributes


    getQuestions = ->
      questions.fetch
        key: "q" + oldModel.id
        success: -> getSubtests()

    getSubtests = ->
      subtests.fetch
        key: "s" + oldModel.id
        success: -> processDocs()

    processDocs = ->

      subtestIdMap = {}

      # link new subtests to new assessment
      for subtest in subtests.models

        oldSubtestId = subtest.id
        newSubtestId = Utils.guid()

        subtestIdMap[oldSubtestId] = newSubtestId

        $.extend(true, newAttributes = {}, subtest.attributes)

        newAttributes._id          = newSubtestId
        newAttributes.assessmentId = newId

        modelsToSave.push (new Subtest(newAttributes)).stamp().attributes

      # update the links to other subtests
      for subtest in modelsToSave
        if subtest.gridLinkId? and subtest.gridLinkId != ""
          subtest.gridLinkId = subtestIdMap[subtest.gridLinkId]

      # link questions to new subtests
      for question in questions.models

        $.extend(true, newAttributes = {}, question.attributes)

        oldSubtestId = newAttributes.subtestId

        newAttributes._id          = Utils.guid()
        newAttributes.subtestId    = subtestIdMap[oldSubtestId]
        newAttributes.assessmentId = newId

        modelsToSave.push (new Question(newAttributes)).stamp().attributes

      requestData = "docs" : modelsToSave

      $.ajax
        type : "POST"
        contentType : "application/json; charset=UTF-8"
        dataType : "json"
        url : Tangerine.settings.urlBulkDocs()
        data : JSON.stringify(requestData)
        success : (responses) => oldModel.trigger "new", newModel
        error : -> Utils.midAlert "Duplication error"

    # kick it off
    getQuestions()



  destroy: =>

    # get all docs that belong to this assesssment except results
    $.ajax
      type: "POST"
      contentType: "application/json; charset=UTF-8"
      dataType: "json"
      url: "/db/#{Tangerine.db_name}/_design/#{Tangerine.design_doc}/_view/byParentId"
      data: JSON.stringify({ keys : ["s#{@id}","q#{@id}","a#{@id}"] })
      error: (xhr, status, err) ->
        Utils.midAlert "Delete error: 01";
        Tangerine.log.db("assessment-delete-error-01","Error: #{err}, Status: #{status}, xhr:#{xhr.responseText||'none'}. headers: #{xhr.getAllResponseHeaders()}")
      success: (response) =>

        requestData =
          docs : response.rows.map (row) ->
            "_id"  : row.id
            "_rev" : row.value.r
            "_deleted" : true

        $.ajax
          type: "POST"
          contentType: "application/json; charset=UTF-8"
          dataType: "json"
          url: Tangerine.settings.urlBulkDocs()
          data: JSON.stringify(requestData)
          error: -> Utils.midAlert "Delete error: 02"; Tangerine.log.db("assessment-delete-error-02",JSON.stringify(arguments))
          success: (responses) =>
            okCount = 0
            (okCount++ if resp.ok?) for resp in responses
            if okCount == responses.length
              @collection.remove @id
              @clear()
            else
              Utils.midAlert "Delete error: 03"; Tangerine.log.db("assessment-delete-error-03",JSON.stringify(arguments))

  isActive: -> return not @isArchived()

  isArchived: ->
    archived = @get("archived")
    return archived == "true" or archived == true

