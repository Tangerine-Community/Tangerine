var cell, gridValueMap, surveyValueMap, translatedGridValue, translatedSurveyValue;

gridValueMap = {
  "correct": "1",
  "incorrect": "0",
  "missing": ".",
  "skipped": "999",
  "logicSkipped": "999"
};

surveyValueMap = {
  "checked": "1",
  "unchecked": "0",
  "not asked": ".",
  "skipped": "999",
  "logicSkipped": "999"
};

translatedGridValue = function(databaseValue) {
  if (databaseValue == null) {
    databaseValue = "no_record";
  }
  return gridValueMap[databaseValue] || String(databaseValue);
};

translatedSurveyValue = function(databaseValue) {
  if (databaseValue == null) {
    databaseValue = "no_record";
  }
  return surveyValueMap[databaseValue] || String(databaseValue);
};

cell = function(subtest, key, value) {
  var idValue, machineName;
  idValue = subtest.subtestId || String(subtest);
  machineName = idValue + "-" + key;
  return {
    k: key,
    v: value,
    m: machineName
  };
};

exports.cell = cell;

exports.translatedSurveyValue = translatedSurveyValue;

exports.translatedGridValue = translatedGridValue;
