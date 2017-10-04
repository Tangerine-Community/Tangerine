(function(doc) {
  var i, len, ref, result, subtest;
  if (doc.collection !== 'result') {
    return;
  }
  result = {};
  if (doc.timestamp != null) {
    result.timestamp = doc.timestamp;
  }
  ref = doc.subtestData;
  for (i = 0, len = ref.length; i < len; i++) {
    subtest = ref[i];
    if (subtest.prototype === "id") {
      result.participant_id = subtest.data.participant_id;
    }
    if (subtest.prototype === "complete") {
      result.end_time = subtest.data.end_time;
    }
  }
  result.start_time = doc.start_time;
  return emit(doc.assessmentId, result);
});
