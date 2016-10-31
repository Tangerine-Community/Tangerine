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
#      .catch (error) ->
#        console.log error
#        doneLoadingViews(error)

Tangerine.viewLibs =
  utils:
    exportValueMap :
      "correct" : 1
      "checked" : 1

      "incorrect" : "0"
      "unchecked" : "0"

      "missing"   : "."
      "not_asked" : "."
      
      "skipped"   : 999

    exportValue : ( databaseValue = "no_record" ) ->
      if Tangerine.viewLibs.utils.exportValueMap[databaseValue]?
        return Tangerine.viewLibs.utils.exportValueMap[databaseValue]
      else
        return String(databaseValue)

    # returns an object {key: value}
    pair : (key, value) ->
      value = "no_record" if value == undefined
      o = {}
      o[key] = value
      return o

    # Makes an object that descrbes a csv value
    cell : ( subtest, key, value ) ->
      if typeof subtest is "string"
        machineName = "#{subtest}-#{key}"
      else
        machineName = "#{subtest.subtestId}-#{key}"
      return {
        key         : key
        value       : value
        machineName : machineName
      }

    unpair : (pair) ->
      for key, value of pair
        return [key, value]
      "object not found" # coffeescript return weirdness

  prototypes:

    pairsLocation : ( subtest ) ->
      row = []
      for label, i in subtest.data.labels
        row.push Tangerine.viewLibs.utils.cell subtest, label, subtest.data.location[i]
        zoneIndex   = subtest.data.location[i] if label is "zone"
        countyIndex = subtest.data.location[i] if label is "county"
        schoolIndex = subtest.data.location[i] if label is "school"

      if countyIndex? and zoneIndex? and schoolIndex?
        row = []
        row.push Tangerine.viewLibs.utils.cell subtest, 'locationIndex', 'county-' + countyIndex + '-zone-' + zoneIndex + '-school-' + schoolIndex

      return row

    pairsDatetime : ( subtest, datetimeSuffix ) ->
      row = []
      months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]

      if ~months.indexOf(subtest.data.month.toLowerCase())
        monthData = months.indexOf(subtest.data.month.toLowerCase()) + 1
      else
        monthData = subtest.data.month

      row.push Tangerine.viewLibs.utils.cell( subtest, "year#{datetimeSuffix}",        subtest.data.year)
      row.push Tangerine.viewLibs.utils.cell( subtest, "month#{datetimeSuffix}",       monthData)
      row.push Tangerine.viewLibs.utils.cell( subtest, "date#{datetimeSuffix}",        subtest.data.day)
      row.push Tangerine.viewLibs.utils.cell( subtest, "assess_time#{datetimeSuffix}", subtest.data.time)
      return row

    pairsObservation : ( subtest ) ->
      row = []
      for observations, i in subtest.data.surveys
        observationData = observations.data
        for surveyVariable, surveyValue of observationData
          if surveyValue is Object(surveyValue) # multiple type question
            for optionKey, optionValue of surveyValue
              row.push Tangerine.viewLibs.utils.cell( subtest, "#{surveyVariable}_#{optionKey}_#{i+1}", Tangerine.viewLibs.utils.exportValue(optionValue))
          else # single type question or open
            row.push Tangerine.viewLibs.utils.cell( subtest, "#{surveyVariable}_#{i+1}", Tangerine.viewLibs.utils.exportValue(surveyValue))
      return row

    pairsGrid : ( subtest, isClass ) ->
      row = []

      variableName = subtest.data.variable_name
      row.push Tangerine.viewLibs.utils.cell( subtest, "#{variableName}_auto_stop",                  subtest.data.auto_stop)
      row.push Tangerine.viewLibs.utils.cell( subtest, "#{variableName}_time_remain",                subtest.data.time_remain)
      row.push Tangerine.viewLibs.utils.cell( subtest, "#{variableName}_attempted",                  subtest.data.attempted)
      row.push Tangerine.viewLibs.utils.cell( subtest, "#{variableName}_item_at_time",               subtest.data.item_at_time)
      row.push Tangerine.viewLibs.utils.cell( subtest, "#{variableName}_time_intermediate_captured", subtest.data.time_intermediate_captured)

      correct = 0
      for item, i in subtest.data.items
        correct++ if item.itemResult is "correct"
        if isClass == true
          letterLabel = "#{i+1}_#{item.itemLabel}"
        else
          letterLabel = "#{variableName}#{i+1}"

        row.push Tangerine.viewLibs.utils.cell( subtest, letterLabel, Tangerine.viewLibs.utils.exportValue( item.itemResult ) )

      itemsPerMinute = correct / ( 1 - ( subtest.data.time_remain / subtest.data.time_allowed ) )

      row.push Tangerine.viewLibs.utils.cell( subtest, "#{variableName}_time_allowed",     Tangerine.viewLibs.utils.exportValue( subtest.data.time_allowed ) )
      row.push Tangerine.viewLibs.utils.cell( subtest, "#{variableName}_items_per_minute", Tangerine.viewLibs.utils.exportValue( itemsPerMinute ) )



      return row

    pairsSurvey : ( subtest ) ->
      row = []
      for surveyVariable, surveyValue of subtest.data
        if surveyValue is Object(surveyValue) # multiple type question
          for optionKey, optionValue of surveyValue
            row.push Tangerine.viewLibs.utils.cell( subtest, "#{surveyVariable}_#{optionKey}", Tangerine.viewLibs.utils.exportValue(optionValue))
        else # single type question or open
          row.push Tangerine.viewLibs.utils.cell( subtest, surveyVariable, Tangerine.viewLibs.utils.exportValue(surveyValue)) # if open just show result, otherwise translate not_asked
      return row


    pairsGps : (subtest) ->
      row = []
      row.push Tangerine.viewLibs.utils.cell( subtest, "latitude",         subtest.data.lat )
      row.push Tangerine.viewLibs.utils.cell( subtest, "longitude",        subtest.data.long )
      row.push Tangerine.viewLibs.utils.cell( subtest, "accuracy",         subtest.data.acc )
      row.push Tangerine.viewLibs.utils.cell( subtest, "altitude",         subtest.data.alt )
      row.push Tangerine.viewLibs.utils.cell( subtest, "altitudeAccuracy", subtest.data.altAcc )
      row.push Tangerine.viewLibs.utils.cell( subtest, "heading",          subtest.data.heading )
      row.push Tangerine.viewLibs.utils.cell( subtest, "speed",            subtest.data.speed )
      row.push Tangerine.viewLibs.utils.cell( subtest, "timestamp",        subtest.data.timestamp )
      return row

    pairsCamera : (subtest, cameraSuffix, resultId) ->
      row = []
      row.push Tangerine.viewLibs.utils.cell( subtest, "photo_captured#{cameraSuffix}",   Tangerine.viewLibs.utils.exportValue(if subtest.data.imageBase64 != "" then "Yes" else "No"))
      row.push(Tangerine.viewLibs.utils.cell( subtest, "photo_url#{cameraSuffix}",        Tangerine.viewLibs.utils.exportValue(if subtest.data.imageBase64 != "" then "" + (subtest.data.imageBaseUrl.replace /_design\/tangerine/, "_design\/t") + resultId else "")))
      #The following line was commected out to handle a hack situation in NET Tutor for Kenya with the design doc title
      #row.push(Tangerine.viewLibs.utils.cell( subtest, "photo_url#{cameraSuffix}",        Tangerine.viewLibs.utils.exportValue(if subtest.data.imageBase64 != "" then ""+subtest.data.imageBaseUrl+resultId else "")))
      return row


Tangerine.views =

  tutorTrips:

    map: ( (doc) ->
      return unless doc.collection is "result"
      return unless doc.tripId
      #
      # by month
      #
      docTime = new Date(doc.startTime || doc.start_time || doc.subtestData.start_time)
      year  = docTime.getFullYear()
      month = docTime.getMonth() + 1
      emit "year#{year}month#{month}", doc.tripId
      #
      # by workflow
      #
      emit "workflow-" + doc.workflowId, doc.tripId
    ).toString()

    reduce: ( ( keys, values, rereduce ) ->
      if rereduce
        return sum(values)
      else
        return values.length
    ).toString()

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
        # TODO: In the future, no distinction between curriculum and assessment.
        if doc.hasOwnProperty('curriculumId')
          emit "subtest-#{doc.curriculumId}"
        else
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

  csvRows:
    map : ( (doc) ->

      return unless doc.collection is "result"

      clone = `function (item) { if (!item) { return item; } var types = [ Number, String, Boolean ], result; types.forEach(function(type) { if (item instanceof type) { result = type( item ); } }); if (typeof result == "undefined") { if (Object.prototype.toString.call( item ) === "[object Array]") { result = []; item.forEach(function(child, index, array) { result[index] = clone( child ); }); } else if (typeof item == "object") { if (item.nodeType && typeof item.cloneNode == "function") { var result = item.cloneNode( true ); } else if (!item.prototype) { if (item instanceof Date) { result = new Date(item); } else { result = {}; for (var i in item) { result[i] = clone( item[i] ); } } } else { if (false && item.constructor) { result = new item.constructor(); } else { result = item; } } } else { result = item; } } return result; }`

      utils = Tangerine.viewLibs.utils

      exportValue = utils.exportValue
      cell        = utils.cell

      prototypes  = Tangerine.viewLibs.prototypes

      pairsGrid        = prototypes.pairsGrid
      pairsSurvey      = prototypes.pairsSurvey
      pairsDatetime    = prototypes.pairsDatetime
      pairsObservation = prototypes.pairsObservation
      pairsGps         = prototypes.pairsGps
      pairsCamera      = prototypes.pairsCamera
      pairsLocation    = prototypes.pairsLocation

      subtestData = doc.subtestData

      isClassResult = typeof doc.klassId isnt "undefined" 

      isWorkflowResult = doc.workflowId?

      # turn class results into regular results
      if isClassResult

        newData               = clone(doc.subtestData)
        newData.subtestId     = doc.subtestId
        
        if isWorkflowResult
          newData.variable_name = doc.itemType
        else
          newData.variable_name = doc.itemType + "_" + doc.reportType + "_" + doc.part + "_"

        newData.time_allowed  = doc.timeAllowed

        subtestData = [ {
          data      : newData
          prototype : doc.prototype
          subtestId : doc.subtestId
        } ]

        log "klass Result: #{doc._id}"


      ###
      Fix doubles (temporary)
      ###

      doublesIncluded = clone(subtestData)

      subtestData = []
      subtestIds  = []

      for subtest in doublesIncluded
        #log subtest.subtestId + " " + subtestIds.indexOf(subtest.subtestId)
        if subtestIds.indexOf(subtest.subtestId) == -1
          subtestData.push(subtest)
          subtestIds.push(subtest.subtestId)

      result = []

      ###
      Handle universal fields first
      ###

      if isClassResult
        result.push Tangerine.viewLibs.utils.cell "universal", "studentId", doc['studentId']
      else
        result.push Tangerine.viewLibs.utils.cell "universal", "enumerator",   doc['enumerator']
        result.push Tangerine.viewLibs.utils.cell "universal", "start_time", ( doc['starttime'] || doc['start_time'] )
        result.push Tangerine.viewLibs.utils.cell "universal", "order_map",  (if doc['order_map']? then doc['order_map'].join(",") else "no_record")

      #
      # Subtest loop
      #
      datetimeCount = 0
      cameraCount = 0
      linearOrder = [0..subtestData.length-1]
      orderMap = if doc["order_map"]? then doc["order_map"] else if doc["orderMap"] then doc["orderMap"] else linearOrder

      timestamps = []

      # go through each subtest in this result
      for rawIndex, linearIndex in linearOrder 

        row = []

        # use the order map for randomized subtests
        subtestIndex = orderMap.indexOf(rawIndex)
        subtest = subtestData[subtestIndex]

        # skip subtests with no data in unfinished assessments
        unless subtest?
          log "[CSV-DEBUG] skipped empty subtest"
          log doc
          continue 

        unless subtest.data?
          log "[CSV-DEBUG] skipped subtest with null data"
          log doc
          continue 

        prototype = subtest['prototype']

        # simple prototypes
        if prototype == "id"
          result.push Tangerine.viewLibs.utils.cell subtest, "id", subtest.data.participant_id
        else if prototype == "consent"
          result.push Tangerine.viewLibs.utils.cell subtest, "consent", subtest.data.consent

        else if prototype == "complete"
          result = result.concat [
            Tangerine.viewLibs.utils.cell subtest, "additional_comments", subtest.data.comment
            Tangerine.viewLibs.utils.cell subtest, "end_time"           , subtest.data.end_time
          ]

        else if prototype == "datetime"
          datetimeSuffix = if datetimeCount > 0 then "_#{datetimeCount}" else ""
          result = result.concat( pairsDatetime( subtest, datetimeSuffix ) )
          datetimeCount++

        else if prototype == "location"
          result = result.concat pairsLocation subtest

        else if prototype == "grid"
          result = result.concat pairsGrid subtest, isClassResult

        else if prototype == "survey"
          result = result.concat pairsSurvey subtest

        else if prototype == "observation"
          result = result.concat pairsObservation subtest

        else if prototype == "gps"
          result = result.concat pairsGps subtest

        else if prototype == "camera"
          cameraSuffix = if cameraCount > 0 then "_#{cameraCount}" else ""
          result = result.concat pairsCamera subtest, cameraSuffix, doc._id
          cameraCount++

        result.push Tangerine.viewLibs.utils.cell subtest, "timestamp_#{linearIndex}", subtest.timestamp

      keyId =
        if isWorkflowResult
          doc._id
        else if isClassResult
          doc.klassId
        else
          doc.assessmentId

      emit keyId, result

    ).toString()
