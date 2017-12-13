var checkDatabase;

checkDatabase = function(pouchDb, callback, done) {
  var db;
  db = pouchDb;
  return db.get("initialized", function(error, doc) {
    if (!error) {
      return callback();
    }
    console.log("initializing database");
    return db.put({
      _id: "_design/tangerine",
      views: {
        byDKey: {
          map: (function(doc) {
            var id;
            if (doc.collection === "result") {
              return;
            }
            if (doc.curriculumId) {
              id = doc.curriculumId;
              if (doc.collection === "klass") {
                return;
              }
            } else {
              id = doc.assessmentId;
            }
            return emit(id.substr(-5, 5), null);
          }).toString()
        },
        byCollection: {
          map: (function(doc) {
            var result;
            if (!doc.collection) {
              return;
            }
            emit(doc.collection, null);
            if (doc.collection === 'subtest') {
              return emit("subtest-" + doc.assessmentId);
            } else if (doc.collection === 'question') {
              return emit("question-" + doc.subtestId);
            } else if (doc.collection === 'result') {
              result = {
                _id: doc._id
              };
              doc.subtestData.forEach(function(subtest) {
                if (subtest.prototype === "id") {
                  result.participantId = subtest.data.participant_id;
                }
                if (subtest.prototype === "complete") {
                  return result.endTime = subtest.data.end_time;
                }
              });
              result.startTime = doc.start_time;
              return emit("result-" + doc.assessmentId, result);
            }
          }).toString()
        }
      }
    }).then(function() {
      var doOne, packNumber;
      packNumber = 0;
      doOne = function() {
        var paddedPackNumber;
        paddedPackNumber = ("0000" + packNumber).slice(-4);
        console.log("paddedPackNumber: " + paddedPackNumber);
        return $.ajax({
          dataType: "json",
          url: "../src/js/init/pack" + paddedPackNumber + ".json",
          error: function(res) {
            return console.log("We're done. No more files to process. res.status: " + res.status);
          },
          success: function(res) {
            packNumber++;
            console.log("yes! uploaded paddedPackNumber: " + paddedPackNumber);
            return db.bulkDocs(res.docs, function(error, doc) {
              if (error) {
                return alert("could not save initialization document: " + error);
              }
              return doOne();
            });
          }
        });
      };
      return doOne();
    });
  });
};
