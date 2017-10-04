(function(doc) {
  var i, len, ref, results, subtest;
  if (doc.collection !== 'result') {
    return;
  }
  ref = doc.subtestData;
  results = [];
  for (i = 0, len = ref.length; i < len; i++) {
    subtest = ref[i];
    if (subtest.prototype === "complete") {
      results.push(emit(subtest.data.end_time, null));
    } else {
      results.push(void 0);
    }
  }
  return results;
});
