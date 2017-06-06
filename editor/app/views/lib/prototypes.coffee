utils = require("views/lib/utils")
cell  = utils.cell

exportValue           = utils.exportValue
translatedGridValue   = utils.translatedGridValue
translatedSurveyValue = utils.translatedSurveyValue

cGrid =
  CORRECT : "C"
  INCORRECT : "I"
  MISSING : "M"
  SKIPPED : "S"

cellsLocation = ( subtest ) ->
  row = []
  for label, i in subtest.data.labels
    row.push cell subtest, label, subtest.data.location[i]
  return row

cellsDatetime = ( subtest, datetimeSuffix ) ->
  row = []
  months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]

  if ~months.indexOf(subtest.data.month.toLowerCase())
    monthData = months.indexOf(subtest.data.month.toLowerCase()) + 1
  else
    monthData = subtest.data.month

  row.push cell( subtest, "year#{datetimeSuffix}",        subtest.data.year)
  row.push cell( subtest, "month#{datetimeSuffix}",       monthData)
  row.push cell( subtest, "date#{datetimeSuffix}",        subtest.data.day)
  row.push cell( subtest, "assess_time#{datetimeSuffix}", subtest.data.time)
  return row

cellsGrid = ( subtest, isClass ) ->
  row = []

  variableName = subtest.data.variable_name

  if variableName is ""
    variableName = subtest.name.toLowerCase().replace(/\s/g, "_")

  row.push cell( subtest, "#{variableName}_auto_stop",                  subtest.data.auto_stop)
  row.push cell( subtest, "#{variableName}_time_remain",                subtest.data.time_remain)
  row.push cell( subtest, "#{variableName}_attempted",                  subtest.data.attempted)
  row.push cell( subtest, "#{variableName}_item_at_time",               subtest.data.item_at_time)
  row.push cell( subtest, "#{variableName}_time_intermediate_captured", subtest.data.time_intermediate_captured)

  for item, i in subtest.data.items
    if isClass == true
      letterLabel = "#{i+1}_#{item.itemLabel}"
    else
      letterLabel = "#{variableName}_#{i+1}"

    row.push cell( subtest, letterLabel, translatedGridValue( item.itemResult ) )

  row.push cell( subtest, "#{variableName}_time_allowed",     subtest.data.time_allowed )




  return row

cellsSurvey = ( subtest ) ->
  row = []
  for surveyVariable, surveyValue of subtest.data
    if surveyValue is Object(surveyValue) # multiple type question
      for optionKey, optionValue of surveyValue
        row.push cell( subtest, "#{surveyVariable}_#{optionKey}", translatedSurveyValue(optionValue))
    else # single type question or open
      row.push cell( subtest, surveyVariable, translatedSurveyValue(surveyValue)) # if open just show result, otherwise translate not_asked
  return row

cellsGps = (subtest) ->
  row = []
  row.push cell( subtest, "latitude",         subtest.data.lat )
  row.push cell( subtest, "longitude",        subtest.data.long )
  row.push cell( subtest, "accuracy",         subtest.data.acc )
  row.push cell( subtest, "altitude",         subtest.data.alt )
  row.push cell( subtest, "altitudeAccuracy", subtest.data.altAcc )
  row.push cell( subtest, "heading",          subtest.data.heading )
  row.push cell( subtest, "speed",            subtest.data.speed )
  row.push cell( subtest, "timestamp",        subtest.data.timestamp )
  return row

cellsCamera = (subtest, cameraSuffix, resultId) ->
  variableName = subtest.data.variableName
  subtestId    = subtest.subtestId
  row = []
  row.push cell( subtest, "#{variableName}_photo_captured#{cameraSuffix}",   exportValue(if subtest.data.imageBase64 != "" then "Yes" else "No"))
  row.push cell( subtest, "#{variableName}_photo_url#{cameraSuffix}",        exportValue(if subtest.data.imageBase64 != "" then "" + "URL_REPLACE/#{resultId}/#{subtestId}" else ""))  
  return row

exports.cellsCamera      = cellsCamera
exports.cellsGrid        = cellsGrid
exports.cellsGps         = cellsGps
exports.cellsSurvey      = cellsSurvey
exports.cellsDatetime    = cellsDatetime
exports.cellsLocation    = cellsLocation

