(function(doc) {
  var correctItems, countyIndex, countyKey, docTime, i, item, j, k, l, label, len, len1, len2, max, min, month, ref, ref1, ref2, result, sMax, sMin, schoolIndex, schoolKey, subtest, timeLeft, totalItems, totalTime, updated, validTime, year, zoneIndex, zoneKey;
  if (doc.collection !== "result") {
    return;
  }
  if (!doc.tripId) {
    return;
  }
  result = {};
  updated = doc.updated;
  docTime = new Date(updated);
  sMin = updated.substr(0, 16) + "07:00:00" + updated.substr(-15);
  sMax = updated.substr(0, 16) + "15:10:00" + updated.substr(-15);
  min = new Date(sMin);
  max = new Date(sMax);
  validTime = (min < docTime && docTime < max);
  result.validTime = validTime;
  year = docTime.getFullYear();
  month = docTime.getMonth() + 1;
  result.month = month;
  result.minTime = doc.startTime || doc.start_time || doc.subtestData.start_time;
  result.maxTime = doc.startTime || doc.start_time || doc.subtestData.start_time;
  ref = doc.subtestData;
  for (j = 0, len = ref.length; j < len; j++) {
    subtest = ref[j];
    result.minTime = subtest.timestamp < result.minTime ? subtest.timestamp : result.minTime;
    result.maxTime = subtest.timestamp > result.maxTime ? subtest.timestamp : result.maxTime;
    if (subtest.prototype === "location") {
      ref1 = subtest.data.labels;
      for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
        label = ref1[i];
        if (label === "zone") {
          zoneIndex = i;
        }
        if (label === "county") {
          countyIndex = i;
        }
        if (label === "school") {
          schoolIndex = i;
        }
      }
      zoneKey = subtest.data.location[zoneIndex];
      countyKey = subtest.data.location[countyIndex];
      schoolKey = subtest.data.location[schoolIndex];
      if (subtest.data.location[zoneIndex] != null) {
        result.zone = zoneKey;
      }
      if (subtest.data.location[countyIndex] != null) {
        result.county = countyKey;
      }
      if (subtest.data.location[schoolIndex] != null) {
        result.school = schoolKey;
      }
      if (subtest.data.schoolId != null) {
        result.school = subtest.data.schoolId;
      }
    } else if (subtest.prototype === "survey") {
      if (subtest.data.subject != null) {
        result.subject = subtest.data.subject;
      }
      if (subtest.data["class"] != null) {
        result["class"] = subtest.data["class"];
      }
      if (subtest.data.lesson_week != null) {
        result.week = subtest.data.lesson_week;
      }
      if (subtest.data.lesson_day != null) {
        result.day = subtest.data.lesson_day;
      }
    } else if (subtest.prototype === "gps" && (subtest.data.long != null) && (subtest.data.lat != null)) {
      result.gpsData = {
        type: 'Feature',
        properties: [],
        geometry: {
          type: 'Point',
          coordinates: [subtest.data.long, subtest.data.lat]
        }
      };
    }
  }
  if (doc.subtestData.items != null) {
    totalItems = doc.subtestData.items.length;
    correctItems = 0;
    ref2 = doc.subtestData.items;
    for (l = 0, len2 = ref2.length; l < len2; l++) {
      item = ref2[l];
      if (item.itemResult === "correct") {
        correctItems++;
      }
    }
    totalTime = doc.timeAllowed;
    timeLeft = doc.subtestData.time_remain;
    result.itemsPerMinute = [(totalItems - (totalItems - correctItems)) / ((totalTime - timeLeft) / totalTime)];
  }
  result.user = doc.enumerator || doc.editedBy;
  result.subtests = doc.subtestData.length || 1;
  result.workflowId = doc.workflowId;
  result.ids = [doc._id];
  return emit(doc.tripId, result);
});
