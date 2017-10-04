(function(doc) {
  var i, j, k, label, len, len1, prototype, ref, ref1, result, subtest;
  if (doc.collection !== "result") {
    return;
  }
  result = {
    resultId: doc._id,
    enumerator: doc.enumerator,
    assessmentName: doc.assessmentName,
    startTime: doc.start_time,
    tangerineVersion: doc.tangerine_version,
    numberOfSubtests: doc.subtestData.length,
    subtests: []
  };
  ref = doc.subtestData;
  for (j = 0, len = ref.length; j < len; j++) {
    subtest = ref[j];
    if (subtest.name) {
      result.subtests.push(subtest.name);
    }
    prototype = subtest.prototype;
    if (prototype === "id") {
      result.id = subtest.data.participant_id;
    }
    if (prototype === "location") {
      ref1 = subtest.data.labels;
      for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
        label = ref1[i];
        result["Location: " + label] = subtest.data.location[i];
      }
    }
  }
  return emit(doc.assessmentId, result);
});
