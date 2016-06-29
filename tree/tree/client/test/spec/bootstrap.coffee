# Check for new database, initialize with packs if none exists
checkDatabase = (pouchDb,callback, done) ->

  # Local tangerine database handle
  db = pouchDb

  db.get "initialized", (error, doc) ->

    return callback() unless error

    console.log "initializing database"

    # Save views
    db.put(
      _id: "_design/tangerine"
      views:
        ##
        #        Used for replication.
        #        Will give one key for all documents associated with an assessment or curriculum.
        ##
        byDKey:
          map: ((doc) ->
            return if doc.collection is "result"

            if doc.curriculumId
              id = doc.curriculumId
              # Do not replicate klasses
              return if doc.collection is "klass"
            else
              id = doc.assessmentId

            emit id.substr(-5,5), null
          ).toString()

        byCollection:
          map : ( (doc) ->

            return unless doc.collection

            emit doc.collection, null

            # Belongs to relationship
            if doc.collection is 'subtest'
              emit "subtest-#{doc.assessmentId}"

            # Belongs to relationship
            else if doc.collection is 'question'
              emit "question-#{doc.subtestId}"

            else if doc.collection is 'result'
              result = _id : doc._id
              doc.subtestData.forEach (subtest) ->
                if subtest.prototype is "id" then result.participantId = subtest.data.participant_id
                if subtest.prototype is "complete" then result.endTime = subtest.data.end_time
              result.startTime = doc.start_time
              emit "result-#{doc.assessmentId}", result

          ).toString()
    ).then ->

      packNumber = 0

      doOne = ->

        paddedPackNumber = ("0000" + packNumber).slice(-4)
        console.log("paddedPackNumber: " + paddedPackNumber)
        $.ajax
          dataType: "json"
          url: "../src/js/init/pack#{paddedPackNumber}.json"
          error: (res) ->
            #            console.log("loading init files. Received: " + JSON.stringify res)
            console.log("We're done. No more files to process. res.status: " + res.status)
          success: (res) ->
            packNumber++
            console.log("yes! uploaded paddedPackNumber: " + paddedPackNumber)

            db.bulkDocs res.docs, (error, doc) ->
              if error
                return alert "could not save initialization document: #{error}"
              doOne()

      doOne() # kick it off
