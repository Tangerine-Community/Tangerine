class Curriculum extends Backbone.Model

  url : "curriculum"

  isArchived: -> false

  updateFromServer: ( dKey = @id.substr(-5,5)) =>

    # split to handle multiple dkeys
    dKeys = JSON.stringify(dKey.replace(/[^a-f0-9]/g," ").split(/\s+/))

    @trigger "status", "import lookup"

    $.ajax Tangerine.settings.urlView("group", "byDKey"),
      type: "POST"
      dataType: "jsonp"
      data: keys: dKeys
      success: (data) =>
        docList = []
        for datum in data.rows
          docList.push datum.id
        $.couch.replicate(
          Tangerine.settings.urlDB("group"),
          Tangerine.settings.urlDB("local"),
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
      "curriculumId" : newId
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
                  newSubtest.set "curriculumId", newModel.id
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
                  newQuestion.set "curriculumId", newModel.id
                  newQuestion.set "_id", Utils.guid() 
                  newQuestion.set "subtestId", subtestIdMap[oldId]
                  newQuestions.push newQuestion
                  newQuestion.save()
                callback newModel


  destroy: (callback) ->

    # remove children
    curriculumId = @id
    subtests = new Subtests
    subtests.fetch
      key: curriculumId
      success: (collection) -> collection.pop().destroy() while collection.length != 0

    # remove model
    super
      success: ->
        callback()


  destroy: =>

    # get all docs that belong to this assesssment except results
    Tangerine.$db.view Tangerine.design_doc + "/revByAssessmentId",
      keys:[ @id ]
      error: ->
        Utils.midAlert "Delete error."
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
          error: ->
            Utils.midAlert "Delete error."
          success: (responses) =>
            okCount = 0
            (okCount++ if resp.ok?) for resp in responses
            if okCount == responses.length
              @collection.remove @id
              @clear()
            else
              Utils.midAlert "Delete error."

