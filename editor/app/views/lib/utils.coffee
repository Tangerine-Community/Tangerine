gridValueMap =
    "correct" : "1"   # correct
    "incorrect" : "0"   # incorrect
    "missing" : "."   # missing
    "skipped" : "999" # skipped

surveyValueMap =
    "checked" : "1"   # checked
    "unchecked" : "0"   # unchecked
    "not asked" : "."   # not asked
    "skipped" : "999" # skipped


translatedGridValue = ( databaseValue = "no_record" ) ->
  return gridValueMap[databaseValue] || String(databaseValue)

translatedSurveyValue = ( databaseValue = "no_record" ) ->
  return surveyValueMap[databaseValue] || String(databaseValue)

# Makes an object that descrbes a csv value
cell = ( subtest, key, value ) ->
  idValue = subtest.subtestId || String(subtest)
  machineName = "#{idValue}-#{key}"

  return {
    k : key
    v : value
    m : machineName
  }

exports.cell        = cell

exports.translatedSurveyValue = translatedSurveyValue
exports.translatedGridValue = translatedGridValue
