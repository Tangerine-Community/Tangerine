gridValueMap =
    C : "1"   # correct
    I : "0"   # incorrect
    M : "."   # missing
    S : "999" # skipped

surveyValueMap =
    C : "1"   # checked
    U : "0"   # unchecked
    N : "."   # not asked
    S : "999" # skipped


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