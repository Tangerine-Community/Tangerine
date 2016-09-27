Tangerine.loadViews = (doneLoadingViews) ->
  console.log 'Loading views'
  Tangerine.db.get '_design/tangerine', (err, doc) ->
    ddoc =
      _id: '_design/tangerine'
      views: Tangerine.views
    if doc
      console.log "Design Doc detected. Updating it."
      ddoc._rev = doc._rev
    else
      console.log "Loading in a fresh _desing/tangerine doc"
    Tangerine.db.put(ddoc)
      .then (doc) ->
        doneLoadingViews()
      .catch (error) ->
        console.log error
        doneLoadingViews(error)

Tangerine.views =
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

  results :
    map: ( ( doc ) ->
      return unless doc.collection is 'result'
      if doc.klassId?
        type = "klass"
        id   = doc.klassId
      else
        type = "assessment"
        id   = doc.assessmentId
      emit id, type
    ).toString()

  spirtRotut:
    map : ( (doc) ->

      return unless doc.collection is "result"
      return unless doc.tripId

      result = {}

      #
      # validation
      #

      updated = doc.updated #"Thu Mar 06 2014 11:00:00 GMT+0300 (EAT)"
      docTime = new Date(updated)
      sMin = updated.substr(0,16) + "07:00:00" + updated.substr(-15)
      sMax = updated.substr(0,16) + "15:10:00" + updated.substr(-15)
      min = new Date(sMin)
      max = new Date(sMax)

      validTime = min < docTime < max

      result.validTime = validTime

      #
      # by month
      #

      year  = docTime.getFullYear()
      month = docTime.getMonth() + 1
      result.month = month

      #
      # by Zone, County, subject, class, gps
      #

      result.minTime = doc.startTime || doc.start_time || doc.subtestData.start_time
      result.maxTime = doc.startTime || doc.start_time || doc.subtestData.start_time

      for subtest in doc.subtestData

        result.minTime = if subtest.timestamp < result.minTime then subtest.timestamp else result.minTime
        result.maxTime = if subtest.timestamp > result.maxTime then subtest.timestamp else result.maxTime

        if subtest.prototype is "location"

          for label, i in subtest.data.labels
            zoneIndex   = i if label is "zone"
            countyIndex = i if label is "county"
            schoolIndex = i if label is "school"

          zoneKey   = subtest.data.location[zoneIndex]
          countyKey = subtest.data.location[countyIndex]
          schoolKey = subtest.data.location[schoolIndex]

          result.zone   = zoneKey   if subtest.data.location[zoneIndex]?
          result.county = countyKey if subtest.data.location[countyIndex]?
          result.school = schoolKey if subtest.data.location[schoolIndex]?

          result.school = subtest.data.schoolId if subtest.data.schoolId?

        else if subtest.prototype is "survey"

          result.subject = subtest.data.subject if subtest.data.subject?
          result.class   = subtest.data.class   if subtest.data.class?
          result.week    = subtest.data.lesson_week    if subtest.data.lesson_week?
          result.day     = subtest.data.lesson_day     if subtest.data.lesson_day?

        else if subtest.prototype is "gps" and subtest.data.long? and subtest.data.lat?

          result.gpsData = 
            type : 'Feature'
            properties : []
            geometry :
              type : 'Point'
              coordinates : [ subtest.data.long, subtest.data.lat ]

      #
      # items per minute
      #

      # handle a class result
      if doc.subtestData.items?

        totalItems   = doc.subtestData.items.length
        correctItems = 0
        for item in doc.subtestData.items
          correctItems++ if item.itemResult is "correct"

        totalTime    = doc.timeAllowed
        timeLeft     = doc.subtestData.time_remain
        result.itemsPerMinute = [( totalItems - ( totalItems - correctItems ) ) / ( ( totalTime - timeLeft ) / ( totalTime ) )]

      #
      # by enumerator
      #

      result.user = doc.enumerator || doc.editedBy

      #
      # number of subtests
      #

      result.subtests = doc.subtestData.length || 1 # could be a class result


      #
      # WorkflowId
      #
      result.workflowId = doc.workflowId

      #
      # _id
      #

      result.ids = [doc._id]

      emit doc.tripId, result
      ).toString()

    reduce: (

      ( keys, values, rereduce ) ->

        result =
          subtests       : 0
          didntMeet      : 0
          metBenchmark   : 0
          benchmarked    : 0
          itemsPerMinute : []
          ids            : []

        for value in values
          for k, v of value

            if k is "validTime"
              if v is true
                result.validTime = true
              else
                return { validTime : false }

            else if k is "subtests"
              result.subtests += v

            else if k is "ids"
              unless rereduce
                result.ids.push v

            else if k is "itemsPerMinute"

              unless rereduce
                for ipm in v
                  continue if ipm >= 120
                  result.itemsPerMinute.push ipm
                  result.benchmarked++

            else if k is "minTime"
              if result.minTime
                result.minTime = if result.minTime < v then result.minTime else v
              else
                result.minTime = v

            else if k is "maxTime"
              if result.maxTime
                result.maxTime = if result.maxTime > v then result.maxTime else v
              else
                result.maxTime = v

            else
              # this only works if none of the other values have the same key
              result[k] = v

        #
        # benchmark
        #

        if result.subject and result.class and result.itemsPerMinute

          english = result.subject is "english_word"
          swahili = result.subject is "word"
          class1  = result.class   is "1"
          class2  = result.class   is "2"

          for ipm in result.itemsPerMinute

            result.metBenchmark++ if swahili and class1 and ipm >= 17
            result.metBenchmark++ if swahili and class2 and ipm >= 45
            result.metBenchmark++ if english and class1 and ipm >= 30
            result.metBenchmark++ if english and class2 and ipm >= 65

        return result

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


