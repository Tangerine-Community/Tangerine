var cGrid, cell, cellsDatetime, cellsGps, cellsGrid, cellsLocation, cellsSurvey, translatedGridValue, translatedSurveyValue, utils;

utils = require("views/lib/utils");

cell = utils.cell;

translatedGridValue = utils.translatedGridValue;

translatedSurveyValue = utils.translatedSurveyValue;

cGrid = {
  CORRECT: "C",
  INCORRECT: "I",
  MISSING: "M",
  SKIPPED: "S"
};

cellsLocation = function(subtest) {
  var i, j, label, len, ref, row;
  row = [];
  ref = subtest.data.labels;
  for (i = j = 0, len = ref.length; j < len; i = ++j) {
    label = ref[i];
    row.push(cell(subtest, label, subtest.data.location[i]));
  }
  return row;
};

cellsDatetime = function(subtest, datetimeSuffix) {
  var monthData, months, row;
  row = [];
  months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  if (~months.indexOf(subtest.data.month.toLowerCase())) {
    monthData = months.indexOf(subtest.data.month.toLowerCase()) + 1;
  } else {
    monthData = subtest.data.month;
  }
  row.push(cell(subtest, "year" + datetimeSuffix, subtest.data.year));
  row.push(cell(subtest, "month" + datetimeSuffix, monthData));
  row.push(cell(subtest, "date" + datetimeSuffix, subtest.data.day));
  row.push(cell(subtest, "assess_time" + datetimeSuffix, subtest.data.time));
  return row;
};

cellsGrid = function(subtest, isClass) {
  var i, item, j, len, letterLabel, ref, row, variableName;
  row = [];
  variableName = subtest.data.variable_name;
  if (variableName === "") {
    variableName = subtest.name.toLowerCase().replace(/\s/g, "_");
  }
  row.push(cell(subtest, variableName + "_auto_stop", subtest.data.auto_stop));
  row.push(cell(subtest, variableName + "_time_remain", subtest.data.time_remain));
  row.push(cell(subtest, variableName + "_attempted", subtest.data.attempted));
  row.push(cell(subtest, variableName + "_item_at_time", subtest.data.item_at_time));
  row.push(cell(subtest, variableName + "_time_intermediate_captured", subtest.data.time_intermediate_captured));
  ref = subtest.data.items;
  for (i = j = 0, len = ref.length; j < len; i = ++j) {
    item = ref[i];
    if (isClass === true) {
      letterLabel = (i + 1) + "_" + item.itemLabel;
    } else {
      letterLabel = variableName + "_" + (i + 1);
    }
    row.push(cell(subtest, letterLabel, translatedGridValue(item.itemResult)));
  }
  row.push(cell(subtest, variableName + "_time_allowed", subtest.data.time_allowed));
  return row;
};

cellsSurvey = function(subtest) {
  var optionKey, optionValue, ref, row, surveyValue, surveyVariable;
  row = [];
  ref = subtest.data;
  for (surveyVariable in ref) {
    surveyValue = ref[surveyVariable];
    if (surveyValue === Object(surveyValue)) {
      for (optionKey in surveyValue) {
        optionValue = surveyValue[optionKey];
        row.push(cell(subtest, surveyVariable + "_" + optionKey, translatedSurveyValue(optionValue)));
      }
    } else {
      row.push(cell(subtest, surveyVariable, translatedSurveyValue(surveyValue)));
    }
  }
  return row;
};

cellsGps = function(subtest) {
  var row;
  row = [];
  row.push(cell(subtest, "latitude", subtest.data.lat));
  row.push(cell(subtest, "longitude", subtest.data.long));
  row.push(cell(subtest, "accuracy", subtest.data.acc));
  row.push(cell(subtest, "altitude", subtest.data.alt));
  row.push(cell(subtest, "altitudeAccuracy", subtest.data.altAcc));
  row.push(cell(subtest, "heading", subtest.data.heading));
  row.push(cell(subtest, "speed", subtest.data.speed));
  row.push(cell(subtest, "timestamp", subtest.data.timestamp));
  return row;
};

exports.cellsGrid = cellsGrid;

exports.cellsGps = cellsGps;

exports.cellsSurvey = cellsSurvey;

exports.cellsDatetime = cellsDatetime;

exports.cellsLocation = cellsLocation;
