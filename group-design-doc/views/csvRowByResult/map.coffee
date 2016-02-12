(doc) ->

  return if doc.collection isnt "result"

  utils = require("views/lib/utils")

  clone       = `function (item) { if (!item) { return item; } var types = [ Number, String, Boolean ], result; types.forEach(function(type) { if (item instanceof type) { result = type( item ); } }); if (typeof result == "undefined") { if (Object.prototype.toString.call( item ) === "[object Array]") { result = []; item.forEach(function(child, index, array) { result[index] = clone( child ); }); } else if (typeof item == "object") { if (item.nodeType && typeof item.cloneNode == "function") { var result = item.cloneNode( true ); } else if (!item.prototype) { if (item instanceof Date) { result = new Date(item); } else { result = {}; for (var i in item) { result[i] = clone( item[i] ); } } } else { if (false && item.constructor) { result = new item.constructor(); } else { result = item; } } } else { result = item; } } return result; }`
  exportValue = utils.exportValue
  pair        = utils.pair

  subtestData = doc.subtestData
  keyId       = doc.assessmentId

  # turn class results into regular results
  if doc.klassId?

    keyId = doc.klassId

    newData = clone(doc.subtestData)
    newData.subtestId = doc.subtestId
    newData["variable_name"] = doc.itemType + "_" + doc.reportType + "_" + doc.part + "_"
    subtestData = [ {
      data      : newData
      prototype : doc.prototype
      subtestId : doc.subtestId

    } ]


  ###
  Fix doubles (temporary)
  ###

  doublesIncluded = clone(subtestData)

  subtestData = []
  subtestIds = []
  log "NEW"
  log JSON.stringify(doublesIncluded)
  for subtest in doublesIncluded
    log subtest.subtestId + " " + subtestIds.indexOf(subtest.subtestId)
    if subtestIds.indexOf(subtest.subtestId) == -1
      subtestData.push(subtest)
      subtestIds.push(subtest.subtestId)

  ###
  Handle universal fields
  ###

  universal = []
  universal.push pair("enumerator", doc['enumerator'])
  universal.push pair("start_time", doc['starttime'] || doc['start_time'])
  universal.push pair("order_map",  if doc['order_map']? then doc['order_map'].join(",") else "no_record")

  # first "subtest" is always universal
  bySubtest = []
  bySubtest.push pair("universal", universal)

  #
  # Subtest loop
  #
  datetimeCount = 0
  linearOrder = [0..subtestData.length-1]
  orderMap = if doc["order_map"]? then doc["order_map"] else if doc["orderMap"] then doc["orderMap"] else linearOrder

  timestamps = []

  # go through each subtest in this result
  for rawIndex in linearOrder 

    row = []

    # use the order map for randomized subtests
    subtestIndex = orderMap.indexOf(rawIndex)
    subtest = subtestData[subtestIndex]

    # skip subtests with no data in unfinished assessments
    unless subtest?
      log "skipped empty subtest"
      log doc
      continue 

    unless subtest.data?
      log "skipped subtest with null data"
      log doc
      continue 

    prototype = subtest['prototype']

    # each prototype provides different data, handle them accordingly
    if prototype == "id"
      row.push pair("id", subtest.data.participant_id)
    else if prototype == "location"
      for label, i in subtest.data.labels
        row.push pair(label, subtest.data.location[i])
    else if prototype == "datetime"
      months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]
      if ~months.indexOf(subtest.data.month.toLowerCase())
        monthData = months.indexOf(subtest.data.month.toLowerCase()) + 1
      else
        monthData = subtest.data.month
      datetimeSuffix = if datetimeCount > 0 then "_#{datetimeCount}" else ""
      row.push pair("year#{datetimeSuffix}",        subtest.data.year)
      row.push pair("month#{datetimeSuffix}",       monthData)
      row.push pair("date#{datetimeSuffix}",        subtest.data.day)
      row.push pair("assess_time#{datetimeSuffix}", subtest.data.time)
      datetimeCount++
    else if prototype == "consent"
      row.push pair("consent", subtest.data.consent)
    
    else if prototype == "grid"
      variableName = subtest.data.variable_name
      row.push pair("#{variableName}_auto_stop",       subtest.data.auto_stop)
      row.push pair("#{variableName}_time_remain",     subtest.data.time_remain)
      row.push pair("#{variableName}_attempted",       subtest.data.attempted)
      row.push pair("#{variableName}_item_at_time",    subtest.data.item_at_time)
      row.push pair("#{variableName}_time_intermediate_captured",    subtest.data.time_intermediate_captured)
      # row.push pair("#{variableName}_correct_per_minute",  subtest.sum.correct_per_minute)

      for item, i in subtest.data.items
        row.push pair("#{variableName}#{i+1}", exportValue(item.itemResult))

    else if prototype == "survey"
      for surveyVariable, surveyValue of subtest.data
        if surveyValue is Object(surveyValue) # multiple type question
          for optionKey, optionValue of surveyValue
            row.push pair("#{surveyVariable}_#{optionKey}", exportValue(optionValue))
        else # single type question or open
          row.push pair(surveyVariable, exportValue(surveyValue)) # if open just show result, otherwise translate not_asked

    else if prototype == "observation"
      for observations, i in subtest.data.surveys
        observationData = observations.data
        for surveyVariable, surveyValue of observationData
          if surveyValue is Object(surveyValue) # multiple type question
            for optionKey, optionValue of surveyValue
              row.push pair("#{surveyVariable}_#{optionKey}_#{i+1}", exportValue(optionValue))
          else # single type question or open
            row.push pair("#{surveyVariable}_#{i+1}", exportValue(surveyValue))

    else if prototype == "gps"
      row.push pair("latitude",         subtest.data.lat )
      row.push pair("longitude",        subtest.data.long )
      row.push pair("accuracy",         subtest.data.acc )
      row.push pair("altitude",         subtest.data.alt )
      row.push pair("altitudeAccuracy", subtest.data.altAcc )
      row.push pair("heading",          subtest.data.heading )
      row.push pair("speed",            subtest.data.speed )
      row.push pair("timestamp",        subtest.data.timestamp )

    else if prototype == "complete"
      row.push pair("additional_comments", subtest.data.comment)
      row.push pair("end_time"           , subtest.data.end_time)

    timestamps.push subtest.timestamp

    bySubtest.push pair(subtest.subtestId, row)

  timestamps = timestamps.sort()

  bySubtest.push pair( "timestamps", [ pair("timestamps",timestamps.join(',') ) ] )

  emit(keyId, bySubtest)
