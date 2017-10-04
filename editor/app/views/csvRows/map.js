
/*

This returns an array of objects that describe a CSV
The only real behavior worth mentioning here is
 */
(function(doc) {
  var cell, cellsDatetime, cellsGps, cellsGrid, cellsLocation, cellsSurvey, clone, datetimeCount, datetimeSuffix, i, isClassResult, j, k, keyId, l, len, len1, len2, linearOrder, newData, orderMap, orderedSubtests, prototype, prototypes, result, subtest, subtestData, subtests, timestamp, timestamps, utils;
  if (doc.collection !== "result") {
    return;
  }
  clone = function (item) { if (!item) { return item; } var types = [ Number, String, Boolean ], result; types.forEach(function(type) { if (item instanceof type) { result = type( item ); } }); if (typeof result == "undefined") { if (Object.prototype.toString.call( item ) === "[object Array]") { result = []; item.forEach(function(child, index, array) { result[index] = clone( child ); }); } else if (typeof item == "object") { if (item.nodeType && typeof item.cloneNode == "function") { var result = item.cloneNode( true ); } else if (!item.prototype) { if (item instanceof Date) { result = new Date(item); } else { result = {}; for (var i in item) { result[i] = clone( item[i] ); } } } else { if (false && item.constructor) { result = new item.constructor(); } else { result = item; } } } else { result = item; } } return result; };
  utils = require("views/lib/utils");
  cell = utils.cell;
  prototypes = require("views/lib/prototypes");
  cellsGrid = prototypes.cellsGrid;
  cellsSurvey = prototypes.cellsSurvey;
  cellsDatetime = prototypes.cellsDatetime;
  cellsGps = prototypes.cellsGps;
  cellsLocation = prototypes.cellsLocation;
  subtestData = doc.subtestData;
  isClassResult = typeof doc.klassId !== "undefined";
  if (isClassResult) {
    newData = clone(doc.subtestData);
    newData.subtestId = doc.subtestId;
    newData.time_allowed = doc.timeAllowed;
    subtestData = [
      {
        data: newData,
        prototype: doc.prototype,
        subtestId: doc.subtestId
      }
    ];
  }
  result = [];

  /*
  Handle universal fields first
   */
  if (isClassResult) {
    result.push(cell("universal", "studentId", doc.studentId));
  } else {
    result.push(cell("universal", "enumerator", doc.enumerator));
    result.push(cell("universal", "start_time", doc.start_time || ''));
    result.push(cell("universal", "order_map", (doc.order_map || []).join(",")));
  }
  datetimeCount = 0;
  linearOrder = subtestData.map(function(el, i) {
    return i;
  });
  orderMap = doc.orderMap;
  if (typeof orderMap === "undefined") {
    orderMap = doc.order_map;
  }
  if (typeof orderMap === "undefined") {
    orderMap = linearOrder;
  }
  timestamps = [];
  orderedSubtests = orderMap.map(function(index) {
    var tmp;
    tmp = subtestData[index];
    subtestData[index] = null;
    return tmp;
  });
  orderedSubtests = orderedSubtests.concat(subtestData);
  subtests = [];
  for (j = 0, len = orderedSubtests.length; j < len; j++) {
    subtest = orderedSubtests[j];
    if (subtest != null) {
      subtests.push(subtest);
    }
  }
  orderedSubtests = subtests;
  for (k = 0, len1 = orderedSubtests.length; k < len1; k++) {
    subtest = orderedSubtests[k];
    if (subtest === null) {
      continue;
    }
    prototype = subtest['prototype'];
    if (prototype === "id") {
      result.push(cell(subtest, "id", subtest.data.participant_id));
    } else if (prototype === "consent") {
      result.push(cell(subtest, "consent", subtest.data.consent));
    } else if (prototype === "complete") {
      result = result.concat([cell(subtest, "additional_comments", subtest.data.comment), cell(subtest, "end_time", subtest.data.end_time)]);
    } else if (prototype === "datetime") {
      datetimeSuffix = datetimeCount > 0 ? "_" + datetimeCount : "";
      result = result.concat(cellsDatetime(subtest, datetimeSuffix));
      datetimeCount++;
    } else if (prototype === "location") {
      result = result.concat(cellsLocation(subtest));
    } else if (prototype === "grid") {
      result = result.concat(cellsGrid(subtest, isClassResult));
    } else if (prototype === "survey") {
      result = result.concat(cellsSurvey(subtest));
    } else if (prototype === "observation") {
      result = result.concat(cellsObservation(subtest));
    } else if (prototype === "gps") {
      result = result.concat(cellsGps(subtest));
    }
    timestamps.push(subtest.timestamp);
  }
  timestamps.sort();
  for (i = l = 0, len2 = timestamps.length; l < len2; i = ++l) {
    timestamp = timestamps[i];
    result.push(cell("timestamp_" + i, "timestamp_" + i, timestamp));
  }
  keyId = isClassResult ? doc.klassId : doc._id;
  return emit(keyId, result);
});
