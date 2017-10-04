(function(keys, values, rereduce) {
  var class1, class2, english, i, ipm, j, k, l, len, len1, len2, ref, result, swahili, v, value;
  result = {
    subtests: 0,
    didntMeet: 0,
    metBenchmark: 0,
    benchmarked: 0,
    itemsPerMinute: [],
    ids: []
  };
  for (i = 0, len = values.length; i < len; i++) {
    value = values[i];
    for (k in value) {
      v = value[k];
      if (k === "validTime") {
        if (v === true) {
          result.validTime = true;
        } else {
          return {
            validTime: false
          };
        }
      } else if (k === "subtests") {
        result.subtests += v;
      } else if (k === "ids") {
        if (!rereduce) {
          result.ids.push(v);
        }
      } else if (k === "itemsPerMinute") {
        if (!rereduce) {
          for (j = 0, len1 = v.length; j < len1; j++) {
            ipm = v[j];
            if (ipm >= 120) {
              continue;
            }
            result.itemsPerMinute.push(ipm);
            result.benchmarked++;
          }
        }
      } else if (k === "minTime") {
        if (result.minTime) {
          result.minTime = result.minTime < v ? result.minTime : v;
        } else {
          result.minTime = v;
        }
      } else if (k === "maxTime") {
        if (result.maxTime) {
          result.maxTime = result.maxTime > v ? result.maxTime : v;
        } else {
          result.maxTime = v;
        }
      } else {
        result[k] = v;
      }
    }
  }
  if (result.subject && result["class"] && result.itemsPerMinute) {
    english = result.subject === "english_word";
    swahili = result.subject === "word";
    class1 = result["class"] === "1";
    class2 = result["class"] === "2";
    ref = result.itemsPerMinute;
    for (l = 0, len2 = ref.length; l < len2; l++) {
      ipm = ref[l];
      if (swahili && class1 && ipm >= 17) {
        result.metBenchmark++;
      }
      if (swahili && class2 && ipm >= 45) {
        result.metBenchmark++;
      }
      if (english && class1 && ipm >= 30) {
        result.metBenchmark++;
      }
      if (english && class2 && ipm >= 65) {
        result.metBenchmark++;
      }
    }
  }
  return result;
});
