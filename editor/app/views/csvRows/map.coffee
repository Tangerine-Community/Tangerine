###

This returns an array of objects that describe a CSV
The only real behavior worth mentioning here is

###

(doc) ->

  return unless doc.collection is "result"

  clone = `function (item) { if (!item) { return item; } var types = [ Number, String, Boolean ], result; types.forEach(function(type) { if (item instanceof type) { result = type( item ); } }); if (typeof result == "undefined") { if (Object.prototype.toString.call( item ) === "[object Array]") { result = []; item.forEach(function(child, index, array) { result[index] = clone( child ); }); } else if (typeof item == "object") { if (item.nodeType && typeof item.cloneNode == "function") { var result = item.cloneNode( true ); } else if (!item.prototype) { if (item instanceof Date) { result = new Date(item); } else { result = {}; for (var i in item) { result[i] = clone( item[i] ); } } } else { if (false && item.constructor) { result = new item.constructor(); } else { result = item; } } } else { result = item; } } return result; }`

  utils = require("views/lib/utils")

  cell        = utils.cell

  prototypes  = require("views/lib/prototypes")

  cellsGrid        = prototypes.cellsGrid
  cellsSurvey      = prototypes.cellsSurvey
  cellsDatetime    = prototypes.cellsDatetime
  cellsGps         = prototypes.cellsGps
  cellsLocation    = prototypes.cellsLocation

  subtestData = doc.subtestData

  isClassResult = typeof doc.klassId isnt "undefined"

  # turn class results into regular results
  if isClassResult

    newData               = clone(doc.subtestData)
    newData.subtestId     = doc.subtestId

    newData.time_allowed  = doc.timeAllowed

    subtestData = [ {
      data      : newData
      prototype : doc.prototype
      subtestId : doc.subtestId
    } ]


  result = []

  ###
  Handle universal fields first
  ###

  if isClassResult
    result.push cell "universal", "studentId",  doc.studentId
  else
    result.push cell "universal", "enumerator", doc.enumerator
    result.push cell "universal", "start_time", doc.startTime || ''
    result.push cell "universal", "order_map",  (doc.order_map || []).join(",")


  datetimeCount = 0;
  linearOrder = subtestData.map (el, i) -> return i

  orderMap = doc.orderMap

  # delete this when standardized
  if typeof orderMap == "undefined" then orderMap = doc.order_map
  if typeof orderMap == "undefined"
    orderMap = linearOrder
  # end delete

  timestamps = []


  # Do this in case the number of subtests isn't always the total number
  orderedSubtests = orderMap.map (index) ->
    tmp = subtestData[index]
    subtestData[index] = null
    return tmp

  orderedSubtests = orderedSubtests.concat(subtestData);

  subtests = []

  for subtest in orderedSubtests
    subtests.push(subtest) if subtest?

  orderedSubtests = subtests

  # go through each subtest in this result
  for subtest in orderedSubtests

    continue if subtest is null # not quite sure how this happens

    prototype = subtest['prototype']

    # simple prototypes
    if prototype == "id"
      result.push cell subtest, "id", subtest.data.participant_id
    else if prototype == "consent"
      result.push cell subtest, "consent", subtest.data.consent

    else if prototype == "complete"
      result = result.concat [
        cell subtest, "additional_comments", subtest.data.comment
        cell subtest, "end_time"           , subtest.data.endTime
      ]

    else if prototype == "datetime"
      datetimeSuffix = if datetimeCount > 0 then "_#{datetimeCount}" else ""
      result = result.concat( cellsDatetime( subtest, datetimeSuffix ) )
      datetimeCount++

    else if prototype == "location"
      result = result.concat cellsLocation subtest

    else if prototype == "grid"
      result = result.concat cellsGrid subtest, isClassResult

    else if prototype == "survey"
      result = result.concat cellsSurvey subtest

    else if prototype == "observation"
      result = result.concat cellsObservation subtest

    else if prototype == "gps"
      result = result.concat cellsGps subtest

    timestamps.push subtest.timestamp

  timestamps.sort()
  for timestamp, i in timestamps
    result.push cell("timestamp_" + i, "timestamp_" + i, timestamp)

  keyId =
    if isClassResult
      doc.klassId
    else
      doc._id

  emit keyId, result
