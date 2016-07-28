var LessonPlan,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LessonPlan = (function(superClass) {
  extend(LessonPlan, superClass);

  function LessonPlan() {
    this.destroy = bind(this.destroy, this);
    this.updateFromIrisCouch = bind(this.updateFromIrisCouch, this);
    this.checkConflicts = bind(this.checkConflicts, this);
    this.updateFromServer = bind(this.updateFromServer, this);
    this.fetch = bind(this.fetch, this);
    this.getResultCount = bind(this.getResultCount, this);
    this.verifyConnection = bind(this.verifyConnection, this);
    this.calcDKey = bind(this.calcDKey, this);
    return LessonPlan.__super__.constructor.apply(this, arguments);
  }

  LessonPlan.prototype.url = 'lessonPlan';

  LessonPlan.prototype.VERIFY_TIMEOUT = 20 * 1000;

  LessonPlan.prototype.initialize = function(options) {
    if (options == null) {
      options = {};
    }
    return this.subtests = new Subtests;
  };

  LessonPlan.prototype.calcDKey = function() {
    return this.id.substr(-5, 5);
  };

  LessonPlan.prototype.verifyConnection = function(callbacks) {
    if (callbacks == null) {
      callbacks = {};
    }
    console.log("called");
    if (callbacks.error != null) {
      this.timer = setTimeout(callbacks.error, this.VERIFY_TIMEOUT);
    }
    return $.ajax({
      url: Tangerine.settings.urlView("group", "byDKey"),
      dataType: "jsonp",
      data: {
        keys: ["testtest"]
      },
      timeout: this.VERIFY_TIMEOUT,
      success: (function(_this) {
        return function() {
          clearTimeout(_this.timer);
          return typeof callbacks.success === "function" ? callbacks.success() : void 0;
        };
      })(this)
    });
  };

  LessonPlan.prototype.getResultCount = function() {
    return $.ajax(Tangerine.settings.urlView("local", "resultCount")({
      type: "POST",
      dataType: "json",
      data: JSON.stringify({
        group: true,
        group_level: 1,
        key: this.id
      }),
      success: (function(_this) {
        return function(data) {
          _this.resultCount = data.rows.length !== 0 ? data.rows[0].value : 0;
          return _this.trigger("resultCount");
        };
      })(this)
    }));
  };

  LessonPlan.prototype.fetch = function(options) {
    var oldSuccess;
    oldSuccess = options.success;
    options.success = (function(_this) {
      return function(model) {
        var allSubtests;
        allSubtests = new Subtests;
        return allSubtests.fetch({
          key: "s" + _this.id,
          success: function(collection) {
            _this.subtests = collection;
            _this.subtests.ensureOrder();
            return typeof oldSuccess === "function" ? oldSuccess(_this) : void 0;
          }
        });
      };
    })(this);
    return Assessment.__super__.fetch.call(this, options);
  };

  LessonPlan.prototype.splitDKeys = function(dKey) {
    if (dKey == null) {
      dKey = "";
    }
    return dKey.toLowerCase().replace(/[g-z]/g, '').replace(/[^a-f0-9]/g, " ").split(/\s+/);
  };

  LessonPlan.prototype.updateFromServer = function(dKey, group) {
    var dKeys, localDKey, sourceDB, sourceDKey, targetDB;
    if (dKey == null) {
      dKey = this.calcDKey();
    }
    this.lastDKey = dKey;
    dKeys = this.splitDKeys(dKey);
    this.trigger("status", "import lookup");
    sourceDB = "group-" + group;
    targetDB = Tangerine.settings.groupDB;
    localDKey = Tangerine.settings.location.group.db + Tangerine.settings.couch.view + "byDKey";
    sourceDKey = Tangerine.settings.get("groupHost") + "/" + sourceDB + "/" + Tangerine.settings.couch.view + "byDKey";
    $.ajax({
      url: sourceDKey,
      type: "GET",
      dataType: "json",
      data: {
        keys: JSON.stringify(dKeys)
      },
      error: (function(_this) {
        return function(a, b) {
          return _this.trigger("status", "import error", a + " " + b);
        };
      })(this),
      success: (function(_this) {
        return function(data) {
          var datum, docList, i, len, ref;
          docList = [];
          ref = data.rows;
          for (i = 0, len = ref.length; i < len; i++) {
            datum = ref[i];
            docList.push(datum.id);
          }
          return $.ajax({
            url: localDKey,
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
              keys: dKeys
            }),
            error: function(a, b) {
              return _this.trigger("status", "import error", a + " " + b);
            },
            success: function(data) {
              var j, len1, ref1;
              ref1 = data.rows;
              for (j = 0, len1 = ref1.length; j < len1; j++) {
                datum = ref1[j];
                docList.push(datum.id);
              }
              docList = _.uniq(docList);
              return $.couch.replicate(sourceDB, targetDB, {
                success: function(response) {
                  _this.checkConflicts(docList);
                  return _this.trigger("status", "import success", response);
                },
                error: function(a, b) {
                  return _this.trigger("status", "import error", a + " " + b);
                }
              }, {
                doc_ids: docList
              });
            }
          });
        };
      })(this)
    });
    return false;
  };

  LessonPlan.prototype.checkConflicts = function(docList, options) {
    var doc, i, len, results;
    if (docList == null) {
      docList = [];
    }
    if (options == null) {
      options = {};
    }
    if (typeof docs === "undefined" || docs === null) {
      this.docs = {};
    }
    results = [];
    for (i = 0, len = docList.length; i < len; i++) {
      doc = docList[i];
      results.push((function(_this) {
        return function(doc) {
          return Tangerine.$db.openDoc(doc, {
            open_revs: "all",
            conflicts: true,
            error: function() {
              return console.log("error with " + doc);
            },
            success: function(doc) {
              var docs, j, len1, results1;
              if (doc.length === 1) {
                doc = doc[0].ok;
                if (doc.deletedAt === "mobile") {
                  return $.ajax({
                    type: "PUT",
                    dataType: "json",
                    url: "http://localhost:5984/" + Tangerine.settings.urlDB("local") + "/" + doc._id,
                    data: JSON.stringify({
                      "_rev": doc._rev,
                      "deletedAt": doc.deletedAt,
                      "_deleted": false
                    }),
                    error: function() {},
                    complete: function() {
                      if (_this.docs.checked == null) {
                        _this.docs.checked = 0;
                      }
                      _this.docs.checked++;
                      if (_this.docs.checked === docList.length) {
                        _this.docs.checked = 0;
                        if (!_.isEmpty(_this.lastDKey)) {
                          _this.updateFromServer(_this.lastDKey);
                          return _this.lastDKey = "";
                        }
                      }
                    }
                  });
                }
              } else {
                docs = doc;
                results1 = [];
                for (j = 0, len1 = docs.length; j < len1; j++) {
                  doc = docs[j];
                  doc = doc.ok;
                  results1.push((function(doc, docs) {
                    if (doc.deletedAt === "mobile") {
                      return $.ajax({
                        type: "PUT",
                        dataType: "json",
                        url: "http://localhost:5984/" + Tangerine.settings.urlDB("local") + "/" + doc._id,
                        data: JSON.stringify({
                          "_rev": doc._rev,
                          "_deleted": true
                        }),
                        error: function() {},
                        complete: function() {
                          if (_this.docs.checked == null) {
                            _this.docs.checked = 0;
                          }
                          _this.docs.checked++;
                          if (_this.docs.checked === docList.length) {
                            _this.docs.checked = 0;
                            if (!_.isEmpty(_this.lastDKey)) {
                              _this.updateFromServer(_this.lastDKey);
                              return _this.lastDKey = "";
                            }
                          }
                        }
                      });
                    }
                  })(doc, docs));
                }
                return results1;
              }
            }
          });
        };
      })(this)(doc));
    }
    return results;
  };

  LessonPlan.prototype.updateFromIrisCouch = function(dKey) {
    var dKeys;
    if (dKey == null) {
      dKey = this.calcDKey();
    }
    dKeys = dKey.replace(/[^a-f0-9]/g, " ").split(/\s+/);
    this.trigger("status", "import lookup");
    $.ajax({
      url: "http://tangerine.iriscouch.com/tangerine/_design/ojai/_view/byDKey",
      dataType: "json",
      contentType: "application/json",
      type: "GET",
      data: {
        keys: JSON.stringify(dKeys)
      },
      success: (function(_this) {
        return function(data) {
          var datum, docList, i, len, ref;
          docList = [];
          ref = data.rows;
          for (i = 0, len = ref.length; i < len; i++) {
            datum = ref[i];
            docList.push(datum.id);
          }
          return $.couch.replicate("http://tangerine.iriscouch.com/tangerine", Tangerine.settings.groupDB, {
            success: function(response) {
              return _this.trigger("status", "import success", response);
            },
            error: function(a, b) {
              return _this.trigger("status", "import error", a + " " + b);
            }
          }, {
            doc_ids: docList
          });
        };
      })(this)
    });
    return false;
  };

  LessonPlan.prototype.duplicate = function() {
    var clonedAttributes, getQuestions, getSubtests, modelsToSave, newId, newModel, oldModel, processDocs, questions, subtests;
    questions = new Questions;
    subtests = new Subtests;
    modelsToSave = [];
    oldModel = this;
    $.extend(true, clonedAttributes = {}, this.attributes);
    newId = Utils.guid();
    clonedAttributes._id = newId;
    clonedAttributes.name = "Copy of " + clonedAttributes.name;
    clonedAttributes.assessmentId = newId;
    newModel = new Assessment(clonedAttributes);
    modelsToSave.push(newModel.stamp().attributes);
    getQuestions = function() {
      return questions.fetch({
        key: "q" + oldModel.id,
        success: function() {
          return getSubtests();
        }
      });
    };
    getSubtests = function() {
      return subtests.fetch({
        key: "s" + oldModel.id,
        success: function() {
          return processDocs();
        }
      });
    };
    processDocs = function() {
      var i, j, k, len, len1, len2, newAttributes, newSubtestId, oldSubtestId, question, ref, ref1, requestData, subtest, subtestIdMap;
      subtestIdMap = {};
      ref = subtests.models;
      for (i = 0, len = ref.length; i < len; i++) {
        subtest = ref[i];
        oldSubtestId = subtest.id;
        newSubtestId = Utils.guid();
        subtestIdMap[oldSubtestId] = newSubtestId;
        $.extend(true, newAttributes = {}, subtest.attributes);
        newAttributes._id = newSubtestId;
        newAttributes.assessmentId = newId;
        modelsToSave.push((new Subtest(newAttributes)).stamp().attributes);
      }
      for (j = 0, len1 = modelsToSave.length; j < len1; j++) {
        subtest = modelsToSave[j];
        if ((subtest.gridLinkId != null) && subtest.gridLinkId !== "") {
          subtest.gridLinkId = subtestIdMap[subtest.gridLinkId];
        }
      }
      ref1 = questions.models;
      for (k = 0, len2 = ref1.length; k < len2; k++) {
        question = ref1[k];
        $.extend(true, newAttributes = {}, question.attributes);
        oldSubtestId = newAttributes.subtestId;
        newAttributes._id = Utils.guid();
        newAttributes.subtestId = subtestIdMap[oldSubtestId];
        newAttributes.assessmentId = newId;
        modelsToSave.push((new Question(newAttributes)).stamp().attributes);
      }
      requestData = {
        "docs": modelsToSave
      };
      return $.ajax({
        type: "POST",
        contentType: "application/json; charset=UTF-8",
        dataType: "json",
        url: Tangerine.settings.urlBulkDocs(),
        data: JSON.stringify(requestData),
        success: (function(_this) {
          return function(responses) {
            return oldModel.trigger("new", newModel);
          };
        })(this),
        error: function() {
          return Utils.midAlert("Duplication error");
        }
      });
    };
    return getQuestions();
  };

  LessonPlan.prototype.destroy = function() {
    return $.ajax({
      type: "POST",
      contentType: "application/json; charset=UTF-8",
      dataType: "json",
      url: "/db/" + Tangerine.db_name + "/_design/" + Tangerine.design_doc + "/_view/byParentId",
      data: JSON.stringify({
        keys: ["s" + this.id, "q" + this.id, "a" + this.id]
      }),
      error: function(xhr, status, err) {
        Utils.midAlert("Delete error: 01");
        return Tangerine.log.db("assessment-delete-error-01", "Error: " + err + ", Status: " + status + ", xhr:" + (xhr.responseText || 'none') + ". headers: " + (xhr.getAllResponseHeaders()));
      },
      success: (function(_this) {
        return function(response) {
          var requestData;
          requestData = {
            docs: response.rows.map(function(row) {
              return {
                "_id": row.id,
                "_rev": row.value.r,
                "_deleted": true
              };
            })
          };
          return $.ajax({
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            dataType: "json",
            url: Tangerine.settings.urlBulkDocs(),
            data: JSON.stringify(requestData),
            error: function() {
              Utils.midAlert("Delete error: 02");
              return Tangerine.log.db("assessment-delete-error-02", JSON.stringify(arguments));
            },
            success: function(responses) {
              var i, len, okCount, resp;
              okCount = 0;
              for (i = 0, len = responses.length; i < len; i++) {
                resp = responses[i];
                if (resp.ok != null) {
                  okCount++;
                }
              }
              if (okCount === responses.length) {
                _this.collection.remove(_this.id);
                return _this.clear();
              } else {
                Utils.midAlert("Delete error: 03");
                return Tangerine.log.db("assessment-delete-error-03", JSON.stringify(arguments));
              }
            }
          });
        };
      })(this)
    });
  };

  LessonPlan.prototype.isActive = function() {
    return !this.isArchived();
  };

  LessonPlan.prototype.isArchived = function() {
    var archived;
    archived = this.get("archived");
    return archived === "true" || archived === true;
  };

  return LessonPlan;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlc3NvblBsYW4vTGVzc29uUGxhbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxVQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7Ozs7O3VCQUVKLEdBQUEsR0FBSzs7dUJBRUwsY0FBQSxHQUFpQixFQUFBLEdBQUs7O3VCQUV0QixVQUFBLEdBQVksU0FBRSxPQUFGOztNQUFFLFVBQVE7O1dBR3BCLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSTtFQUhOOzt1QkFNWixRQUFBLEdBQVUsU0FBQTtXQUFHLElBQUMsQ0FBQSxFQUFFLENBQUMsTUFBSixDQUFXLENBQUMsQ0FBWixFQUFlLENBQWY7RUFBSDs7dUJBR1YsZ0JBQUEsR0FBa0IsU0FBRSxTQUFGOztNQUFFLFlBQVk7O0lBQzlCLE9BQU8sQ0FBQyxHQUFSLENBQVksUUFBWjtJQUNBLElBQXlELHVCQUF6RDtNQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsVUFBQSxDQUFXLFNBQVMsQ0FBQyxLQUFyQixFQUE0QixJQUFDLENBQUEsY0FBN0IsRUFBVDs7V0FDQSxDQUFDLENBQUMsSUFBRixDQUNFO01BQUEsR0FBQSxFQUFLLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBbkIsQ0FBMkIsT0FBM0IsRUFBb0MsUUFBcEMsQ0FBTDtNQUNBLFFBQUEsRUFBVSxPQURWO01BRUEsSUFBQSxFQUFNO1FBQUEsSUFBQSxFQUFNLENBQUMsVUFBRCxDQUFOO09BRk47TUFHQSxPQUFBLEVBQVMsSUFBQyxDQUFBLGNBSFY7TUFJQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ1AsWUFBQSxDQUFhLEtBQUMsQ0FBQSxLQUFkOzJEQUNBLFNBQVMsQ0FBQztRQUZIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUpUO0tBREY7RUFIZ0I7O3VCQVlsQixjQUFBLEdBQWdCLFNBQUE7V0FDZCxDQUFDLENBQUMsSUFBRixDQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBbkIsQ0FBMkIs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U0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFkLENBQWlCLDRCQUFqQixFQUE4QyxJQUFJLENBQUMsU0FBTCxDQUFlLFNBQWYsQ0FBOUM7WUFBdEMsQ0FMUDtZQU1BLE9BQUEsRUFBUyxTQUFDLFNBQUQ7QUFDUCxrQkFBQTtjQUFBLE9BQUEsR0FBVTtBQUNWLG1CQUFBLDJDQUFBOztnQkFBQyxJQUFhLGVBQWI7a0JBQUEsT0FBQSxHQUFBOztBQUFEO2NBQ0EsSUFBRyxPQUFBLEtBQVcsU0FBUyxDQUFDLE1BQXhCO2dCQUNFLEtBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFtQixLQUFDLENBQUEsRUFBcEI7dUJBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBQSxFQUZGO2VBQUEsTUFBQTtnQkFJRSxLQUFLLENBQUMsUUFBTixDQUFlLGtCQUFmO3VCQUFtQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQWQsQ0FBaUIsNEJBQWpCLEVBQThDLElBQUksQ0FBQyxTQUFMLENBQWUsU0FBZixDQUE5QyxFQUpyQzs7WUFITyxDQU5UO1dBREY7UUFSTztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FSVDtLQURGO0VBSE87O3VCQW9DVCxRQUFBLEdBQVUsU0FBQTtBQUFHLFdBQU8sQ0FBSSxJQUFDLENBQUEsVUFBRCxDQUFBO0VBQWQ7O3VCQUVWLFVBQUEsR0FBWSxTQUFBO0FBQ1YsUUFBQTtJQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsR0FBRCxDQUFLLFVBQUw7QUFDWCxXQUFPLFFBQUEsS0FBWSxNQUFaLElBQXNCLFFBQUEsS0FBWTtFQUYvQjs7OztHQXhVVyxRQUFRLENBQUMiLCJmaWxlIjoibGVzc29uUGxhbi9MZXNzb25QbGFuLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTGVzc29uUGxhbiBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cbiAgdXJsOiAnbGVzc29uUGxhbidcblxuICBWRVJJRllfVElNRU9VVCA6IDIwICogMTAwMFxuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucz17fSApIC0+XG4jIHRoaXMgY29sbGVjdGlvbiBkb2Vzbid0IGdldCBzYXZlZFxuIyBjaGFuZ2VzIHVwZGF0ZSB0aGUgc3VidGVzdCB2aWV3LCBpdCBrZWVwcyBvcmRlclxuICAgIEBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuIyBAZ2V0UmVzdWx0Q291bnQoKVxuXG4gIGNhbGNES2V5OiA9PiBAaWQuc3Vic3RyKC01LCA1KVxuXG4jIHJlZmFjdG9yIHRvIGV2ZW50c1xuICB2ZXJpZnlDb25uZWN0aW9uOiAoIGNhbGxiYWNrcyA9IHt9ICkgPT5cbiAgICBjb25zb2xlLmxvZyBcImNhbGxlZFwiXG4gICAgQHRpbWVyID0gc2V0VGltZW91dChjYWxsYmFja3MuZXJyb3IsIEBWRVJJRllfVElNRU9VVCkgaWYgY2FsbGJhY2tzLmVycm9yP1xuICAgICQuYWpheFxuICAgICAgdXJsOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyhcImdyb3VwXCIsIFwiYnlES2V5XCIpXG4gICAgICBkYXRhVHlwZTogXCJqc29ucFwiXG4gICAgICBkYXRhOiBrZXlzOiBbXCJ0ZXN0dGVzdFwiXVxuICAgICAgdGltZW91dDogQFZFUklGWV9USU1FT1VUXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBjbGVhclRpbWVvdXQgQHRpbWVyXG4gICAgICAgIGNhbGxiYWNrcy5zdWNjZXNzPygpXG5cbiAgZ2V0UmVzdWx0Q291bnQ6ID0+XG4gICAgJC5hamF4IFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3KFwibG9jYWxcIiwgXCJyZXN1bHRDb3VudFwiKVxuICAgICAgdHlwZTogXCJQT1NUXCJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIGdyb3VwICAgICAgIDogdHJ1ZVxuICAgICAgICBncm91cF9sZXZlbCA6IDFcbiAgICAgICAga2V5ICAgICAgICAgOiBAaWRcbiAgICAgIClcbiAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICBAcmVzdWx0Q291bnQgPSBpZiBkYXRhLnJvd3MubGVuZ3RoICE9IDAgdGhlbiBkYXRhLnJvd3NbMF0udmFsdWUgZWxzZSAwXG4gICAgICAgIEB0cmlnZ2VyIFwicmVzdWx0Q291bnRcIlxuXG5cbiMgSGlqYWNrZWQgc3VjY2VzcygpIGZvciBsYXRlclxuIyBmZXRjaHMgYWxsIHN1YnRlc3RzIGZvciB0aGUgYXNzZXNzbWVudFxuICBmZXRjaDogKG9wdGlvbnMpID0+XG4gICAgb2xkU3VjY2VzcyA9IG9wdGlvbnMuc3VjY2Vzc1xuICAgIG9wdGlvbnMuc3VjY2VzcyA9IChtb2RlbCkgPT5cbiAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICBhbGxTdWJ0ZXN0cy5mZXRjaFxuICAgICAgICBrZXk6IFwic1wiICsgQGlkXG4gICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSA9PlxuICAgICAgICAgIEBzdWJ0ZXN0cyA9IGNvbGxlY3Rpb25cbiAgICAgICAgICBAc3VidGVzdHMuZW5zdXJlT3JkZXIoKVxuICAgICAgICAgIG9sZFN1Y2Nlc3M/IEBcblxuICAgIEFzc2Vzc21lbnQuX19zdXBlcl9fLmZldGNoLmNhbGwgQCwgb3B0aW9uc1xuXG4gIHNwbGl0REtleXM6ICggZEtleSA9IFwiXCIgKSAtPlxuIyBzcGxpdCB0byBoYW5kbGUgbXVsdGlwbGUgZGtleXNcbiAgICBkS2V5LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW2ctel0vZywnJykucmVwbGFjZSgvW15hLWYwLTldL2csXCIgXCIpLnNwbGl0KC9cXHMrLylcblxuICB1cGRhdGVGcm9tU2VydmVyOiAoIGRLZXkgPSBAY2FsY0RLZXkoKSwgZ3JvdXAgKSA9PlxuXG4gICAgQGxhc3RES2V5ID0gZEtleVxuXG4gICAgZEtleXMgPSBAc3BsaXRES2V5cyhkS2V5KVxuXG4gICAgQHRyaWdnZXIgXCJzdGF0dXNcIiwgXCJpbXBvcnQgbG9va3VwXCJcblxuICAgIHNvdXJjZURCID0gXCJncm91cC1cIiArIGdyb3VwXG4gICAgdGFyZ2V0REIgPSBUYW5nZXJpbmUuc2V0dGluZ3MuZ3JvdXBEQlxuXG4gICAgbG9jYWxES2V5ID0gVGFuZ2VyaW5lLnNldHRpbmdzLmxvY2F0aW9uLmdyb3VwLmRiK1RhbmdlcmluZS5zZXR0aW5ncy5jb3VjaC52aWV3ICsgXCJieURLZXlcIlxuXG4gICAgc291cmNlREtleSA9IFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJncm91cEhvc3RcIikgKyBcIi9cIitzb3VyY2VEQitcIi9cIitUYW5nZXJpbmUuc2V0dGluZ3MuY291Y2gudmlldyArIFwiYnlES2V5XCJcblxuICAgICQuYWpheFxuICAgICAgdXJsOiBzb3VyY2VES2V5LFxuICAgICAgdHlwZTogXCJHRVRcIlxuICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICBkYXRhOiBrZXlzOiBKU09OLnN0cmluZ2lmeShkS2V5cylcbiAgICAgIGVycm9yOiAoYSwgYikgPT4gQHRyaWdnZXIgXCJzdGF0dXNcIiwgXCJpbXBvcnQgZXJyb3JcIiwgXCIje2F9ICN7Yn1cIlxuICAgICAgc3VjY2VzczogKGRhdGEpID0+XG4gICAgICAgIGRvY0xpc3QgPSBbXVxuICAgICAgICBmb3IgZGF0dW0gaW4gZGF0YS5yb3dzXG4gICAgICAgICAgZG9jTGlzdC5wdXNoIGRhdHVtLmlkXG5cbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgdXJsOiBsb2NhbERLZXksXG4gICAgICAgICAgdHlwZTogXCJQT1NUXCJcbiAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcbiAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShrZXlzOmRLZXlzKVxuICAgICAgICAgIGVycm9yOiAoYSwgYikgPT4gQHRyaWdnZXIgXCJzdGF0dXNcIiwgXCJpbXBvcnQgZXJyb3JcIiwgXCIje2F9ICN7Yn1cIlxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICAgICAgZm9yIGRhdHVtIGluIGRhdGEucm93c1xuICAgICAgICAgICAgICBkb2NMaXN0LnB1c2ggZGF0dW0uaWRcblxuICAgICAgICAgICAgZG9jTGlzdCA9IF8udW5pcShkb2NMaXN0KVxuXG4gICAgICAgICAgICAkLmNvdWNoLnJlcGxpY2F0ZShcbiAgICAgICAgICAgICAgc291cmNlREIsXG4gICAgICAgICAgICAgIHRhcmdldERCLFxuICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpPT5cbiAgICAgICAgICAgICAgICBAY2hlY2tDb25mbGljdHMgZG9jTGlzdFxuICAgICAgICAgICAgICAgIEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IHN1Y2Nlc3NcIiwgcmVzcG9uc2VcbiAgICAgICAgICAgICAgZXJyb3I6IChhLCBiKSAgICAgID0+IEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGVycm9yXCIsIFwiI3thfSAje2J9XCJcbiAgICAgICAgICAgICxcbiAgICAgICAgICAgICAgZG9jX2lkczogZG9jTGlzdFxuICAgICAgICAgICAgKVxuXG4gICAgZmFsc2VcblxuIyB0aGlzIGlzIHByZXR0eSBzdHJhbmdlLCBidXQgaXQgYmFzaWNhbGx5IHVuZGVsZXRlcywgdHJpZXMgdG8gcmVwbGljYXRlIGFnYWluLCBhbmQgdGhlbiBkZWxldGVzIHRoZSBjb25mbGljdGluZyAobG9jYWwpIHZlcnNpb24gYXMgbWFya2VkIGJ5IHRoZSBmaXJzdCB0aW1lIGFyb3VuZC5cbiAgY2hlY2tDb25mbGljdHM6IChkb2NMaXN0PVtdLCBvcHRpb25zPXt9KSA9PlxuXG4gICAgQGRvY3MgPSB7fSB1bmxlc3MgZG9jcz9cblxuICAgIGZvciBkb2MgaW4gZG9jTGlzdFxuICAgICAgZG8gKGRvYykgPT5cbiAgICAgICAgVGFuZ2VyaW5lLiRkYi5vcGVuRG9jIGRvYyxcbiAgICAgICAgICBvcGVuX3JldnMgOiBcImFsbFwiXG4gICAgICAgICAgY29uZmxpY3RzIDogdHJ1ZVxuICAgICAgICAgIGVycm9yOiAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgXCJlcnJvciB3aXRoICN7ZG9jfVwiXG4gICAgICAgICAgc3VjY2VzczogKGRvYykgPT5cbiAgICAgICAgICAgIGlmIGRvYy5sZW5ndGggPT0gMVxuICAgICAgICAgICAgICBkb2MgPSBkb2NbMF0ub2sgIyBjb3VjaCBpcyB3ZWlyZFxuICAgICAgICAgICAgICBpZiBkb2MuZGVsZXRlZEF0ID09IFwibW9iaWxlXCJcbiAgICAgICAgICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgICAgICAgIHR5cGU6IFwiUFVUXCJcbiAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9sb2NhbGhvc3Q6NTk4NC9cIitUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoXCJsb2NhbFwiKSArIFwiL1wiICtkb2MuX2lkXG4gICAgICAgICAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgICAgICAgICAgICAgXCJfcmV2XCIgICAgICA6IGRvYy5fcmV2XG4gICAgICAgICAgICAgICAgICAgIFwiZGVsZXRlZEF0XCIgOiBkb2MuZGVsZXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIFwiX2RlbGV0ZWRcIiAgOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgZXJyb3I6ID0+XG4jY29uc29sZS5sb2cgXCJzYXZlIG5ldyBkb2MgZXJyb3JcIlxuICAgICAgICAgICAgICAgICAgY29tcGxldGU6ID0+XG4gICAgICAgICAgICAgICAgICAgIEBkb2NzLmNoZWNrZWQgPSAwIHVubGVzcyBAZG9jcy5jaGVja2VkP1xuICAgICAgICAgICAgICAgICAgICBAZG9jcy5jaGVja2VkKytcbiAgICAgICAgICAgICAgICAgICAgaWYgQGRvY3MuY2hlY2tlZCA9PSBkb2NMaXN0Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgIEBkb2NzLmNoZWNrZWQgPSAwXG4gICAgICAgICAgICAgICAgICAgICAgaWYgbm90IF8uaXNFbXB0eSBAbGFzdERLZXlcbiAgICAgICAgICAgICAgICAgICAgICAgIEB1cGRhdGVGcm9tU2VydmVyIEBsYXN0REtleVxuICAgICAgICAgICAgICAgICAgICAgICAgQGxhc3RES2V5ID0gXCJcIlxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBkb2NzID0gZG9jXG4gICAgICAgICAgICAgIGZvciBkb2MgaW4gZG9jc1xuICAgICAgICAgICAgICAgIGRvYyA9IGRvYy5va1xuICAgICAgICAgICAgICAgIGRvIChkb2MsIGRvY3MpID0+XG4gICAgICAgICAgICAgICAgICBpZiBkb2MuZGVsZXRlZEF0ID09IFwibW9iaWxlXCJcbiAgICAgICAgICAgICAgICAgICAgJC5hamF4XG4gICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJQVVRcIlxuICAgICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgICAgICAgICAgICAgIHVybDogXCJodHRwOi8vbG9jYWxob3N0OjU5ODQvXCIrVGFuZ2VyaW5lLnNldHRpbmdzLnVybERCKFwibG9jYWxcIikgKyBcIi9cIiArZG9jLl9pZFxuICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJfcmV2XCIgICAgICA6IGRvYy5fcmV2XG4gICAgICAgICAgICAgICAgICAgICAgICBcIl9kZWxldGVkXCIgIDogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogPT5cbiNjb25zb2xlLmxvZyBcIkNvdWxkIG5vdCBkZWxldGUgY29uZmxpY3RpbmcgdmVyc2lvblwiXG4gICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6ID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBAZG9jcy5jaGVja2VkID0gMCB1bmxlc3MgQGRvY3MuY2hlY2tlZD9cbiAgICAgICAgICAgICAgICAgICAgICAgIEBkb2NzLmNoZWNrZWQrK1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgQGRvY3MuY2hlY2tlZCA9PSBkb2NMaXN0Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICBAZG9jcy5jaGVja2VkID0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBub3QgXy5pc0VtcHR5IEBsYXN0REtleVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEB1cGRhdGVGcm9tU2VydmVyIEBsYXN0REtleVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBsYXN0REtleSA9IFwiXCJcblxuICB1cGRhdGVGcm9tSXJpc0NvdWNoOiAoIGRLZXkgPSBAY2FsY0RLZXkoKSApID0+XG5cbiMgc3BsaXQgdG8gaGFuZGxlIG11bHRpcGxlIGRrZXlzXG4gICAgZEtleXMgPSBkS2V5LnJlcGxhY2UoL1teYS1mMC05XS9nLFwiIFwiKS5zcGxpdCgvXFxzKy8pXG5cbiAgICBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBsb29rdXBcIlxuICAgICQuYWpheFxuICAgICAgdXJsOiBcImh0dHA6Ly90YW5nZXJpbmUuaXJpc2NvdWNoLmNvbS90YW5nZXJpbmUvX2Rlc2lnbi9vamFpL192aWV3L2J5REtleVwiXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgdHlwZTogXCJHRVRcIlxuICAgICAgZGF0YTpcbiAgICAgICAga2V5cyA6IEpTT04uc3RyaW5naWZ5KGRLZXlzKVxuICAgICAgc3VjY2VzczogKGRhdGEpID0+XG4gICAgICAgIGRvY0xpc3QgPSBbXVxuICAgICAgICBmb3IgZGF0dW0gaW4gZGF0YS5yb3dzXG4gICAgICAgICAgZG9jTGlzdC5wdXNoIGRhdHVtLmlkXG4gICAgICAgICQuY291Y2gucmVwbGljYXRlKFxuICAgICAgICAgIFwiaHR0cDovL3RhbmdlcmluZS5pcmlzY291Y2guY29tL3RhbmdlcmluZVwiLFxuICAgICAgICAgIFRhbmdlcmluZS5zZXR0aW5ncy5ncm91cERCLFxuICAgICAgICAgIHN1Y2Nlc3M6KHJlc3BvbnNlKSA9PiBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBzdWNjZXNzXCIsIHJlc3BvbnNlXG4gICAgICAgICAgZXJyb3I6IChhLCBiKSAgICAgID0+IEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGVycm9yXCIsIFwiI3thfSAje2J9XCJcbiAgICAgICAgLFxuICAgICAgICAgIGRvY19pZHM6IGRvY0xpc3RcbiAgICAgICAgKVxuXG4gICAgZmFsc2VcblxuXG4jIEZldGNoZXMgYWxsIGFzc2Vzc21lbnQgcmVsYXRlZCBkb2N1bWVudHMsIHB1dHMgdGhlbSB0b2dldGhlciBpbiBhIGRvY3VtZW50XG4jIGFycmF5IGZvciB1cGxvYWRpbmcgdG8gYnVsa2RvY3MuXG4gIGR1cGxpY2F0ZTogLT5cblxuICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnNcbiAgICBzdWJ0ZXN0cyAgPSBuZXcgU3VidGVzdHNcblxuICAgIG1vZGVsc1RvU2F2ZSA9IFtdXG5cbiAgICBvbGRNb2RlbCA9IEBcblxuICAgICMgZ2VuZXJhbCBwYXR0ZXJuOiBjbG9uZSBhdHRyaWJ1dGVzLCBtb2RpZnkgdGhlbSwgc3RhbXAgdGhlbSwgcHV0IGF0dHJpYnV0ZXMgaW4gYXJyYXlcblxuICAgICQuZXh0ZW5kKHRydWUsIGNsb25lZEF0dHJpYnV0ZXMgPSB7fSwgQGF0dHJpYnV0ZXMpXG5cbiAgICBuZXdJZCA9IFV0aWxzLmd1aWQoKVxuXG4gICAgY2xvbmVkQXR0cmlidXRlcy5faWQgICAgICAgICAgPSBuZXdJZFxuICAgIGNsb25lZEF0dHJpYnV0ZXMubmFtZSAgICAgICAgID0gXCJDb3B5IG9mICN7Y2xvbmVkQXR0cmlidXRlcy5uYW1lfVwiXG4gICAgY2xvbmVkQXR0cmlidXRlcy5hc3Nlc3NtZW50SWQgPSBuZXdJZFxuXG4gICAgbmV3TW9kZWwgPSBuZXcgQXNzZXNzbWVudChjbG9uZWRBdHRyaWJ1dGVzKVxuXG4gICAgbW9kZWxzVG9TYXZlLnB1c2ggKG5ld01vZGVsKS5zdGFtcCgpLmF0dHJpYnV0ZXNcblxuXG4gICAgZ2V0UXVlc3Rpb25zID0gLT5cbiAgICAgIHF1ZXN0aW9ucy5mZXRjaFxuICAgICAgICBrZXk6IFwicVwiICsgb2xkTW9kZWwuaWRcbiAgICAgICAgc3VjY2VzczogLT4gZ2V0U3VidGVzdHMoKVxuXG4gICAgZ2V0U3VidGVzdHMgPSAtPlxuICAgICAgc3VidGVzdHMuZmV0Y2hcbiAgICAgICAga2V5OiBcInNcIiArIG9sZE1vZGVsLmlkXG4gICAgICAgIHN1Y2Nlc3M6IC0+IHByb2Nlc3NEb2NzKClcblxuICAgIHByb2Nlc3NEb2NzID0gLT5cblxuICAgICAgc3VidGVzdElkTWFwID0ge31cblxuICAgICAgIyBsaW5rIG5ldyBzdWJ0ZXN0cyB0byBuZXcgYXNzZXNzbWVudFxuICAgICAgZm9yIHN1YnRlc3QgaW4gc3VidGVzdHMubW9kZWxzXG5cbiAgICAgICAgb2xkU3VidGVzdElkID0gc3VidGVzdC5pZFxuICAgICAgICBuZXdTdWJ0ZXN0SWQgPSBVdGlscy5ndWlkKClcblxuICAgICAgICBzdWJ0ZXN0SWRNYXBbb2xkU3VidGVzdElkXSA9IG5ld1N1YnRlc3RJZFxuXG4gICAgICAgICQuZXh0ZW5kKHRydWUsIG5ld0F0dHJpYnV0ZXMgPSB7fSwgc3VidGVzdC5hdHRyaWJ1dGVzKVxuXG4gICAgICAgIG5ld0F0dHJpYnV0ZXMuX2lkICAgICAgICAgID0gbmV3U3VidGVzdElkXG4gICAgICAgIG5ld0F0dHJpYnV0ZXMuYXNzZXNzbWVudElkID0gbmV3SWRcblxuICAgICAgICBtb2RlbHNUb1NhdmUucHVzaCAobmV3IFN1YnRlc3QobmV3QXR0cmlidXRlcykpLnN0YW1wKCkuYXR0cmlidXRlc1xuXG4gICAgICAjIHVwZGF0ZSB0aGUgbGlua3MgdG8gb3RoZXIgc3VidGVzdHNcbiAgICAgIGZvciBzdWJ0ZXN0IGluIG1vZGVsc1RvU2F2ZVxuICAgICAgICBpZiBzdWJ0ZXN0LmdyaWRMaW5rSWQ/IGFuZCBzdWJ0ZXN0LmdyaWRMaW5rSWQgIT0gXCJcIlxuICAgICAgICAgIHN1YnRlc3QuZ3JpZExpbmtJZCA9IHN1YnRlc3RJZE1hcFtzdWJ0ZXN0LmdyaWRMaW5rSWRdXG5cbiAgICAgICMgbGluayBxdWVzdGlvbnMgdG8gbmV3IHN1YnRlc3RzXG4gICAgICBmb3IgcXVlc3Rpb24gaW4gcXVlc3Rpb25zLm1vZGVsc1xuXG4gICAgICAgICQuZXh0ZW5kKHRydWUsIG5ld0F0dHJpYnV0ZXMgPSB7fSwgcXVlc3Rpb24uYXR0cmlidXRlcylcblxuICAgICAgICBvbGRTdWJ0ZXN0SWQgPSBuZXdBdHRyaWJ1dGVzLnN1YnRlc3RJZFxuXG4gICAgICAgIG5ld0F0dHJpYnV0ZXMuX2lkICAgICAgICAgID0gVXRpbHMuZ3VpZCgpXG4gICAgICAgIG5ld0F0dHJpYnV0ZXMuc3VidGVzdElkICAgID0gc3VidGVzdElkTWFwW29sZFN1YnRlc3RJZF1cbiAgICAgICAgbmV3QXR0cmlidXRlcy5hc3Nlc3NtZW50SWQgPSBuZXdJZFxuXG4gICAgICAgIG1vZGVsc1RvU2F2ZS5wdXNoIChuZXcgUXVlc3Rpb24obmV3QXR0cmlidXRlcykpLnN0YW1wKCkuYXR0cmlidXRlc1xuXG4gICAgICByZXF1ZXN0RGF0YSA9IFwiZG9jc1wiIDogbW9kZWxzVG9TYXZlXG5cbiAgICAgICQuYWpheFxuICAgICAgICB0eXBlIDogXCJQT1NUXCJcbiAgICAgICAgY29udGVudFR5cGUgOiBcImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9VVRGLThcIlxuICAgICAgICBkYXRhVHlwZSA6IFwianNvblwiXG4gICAgICAgIHVybCA6IFRhbmdlcmluZS5zZXR0aW5ncy51cmxCdWxrRG9jcygpXG4gICAgICAgIGRhdGEgOiBKU09OLnN0cmluZ2lmeShyZXF1ZXN0RGF0YSlcbiAgICAgICAgc3VjY2VzcyA6IChyZXNwb25zZXMpID0+IG9sZE1vZGVsLnRyaWdnZXIgXCJuZXdcIiwgbmV3TW9kZWxcbiAgICAgICAgZXJyb3IgOiAtPiBVdGlscy5taWRBbGVydCBcIkR1cGxpY2F0aW9uIGVycm9yXCJcblxuICAgICMga2ljayBpdCBvZmZcbiAgICBnZXRRdWVzdGlvbnMoKVxuXG5cblxuICBkZXN0cm95OiA9PlxuXG4jIGdldCBhbGwgZG9jcyB0aGF0IGJlbG9uZyB0byB0aGlzIGFzc2Vzc3NtZW50IGV4Y2VwdCByZXN1bHRzXG4gICAgJC5hamF4XG4gICAgICB0eXBlOiBcIlBPU1RcIlxuICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD1VVEYtOFwiXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgIHVybDogXCIvZGIvI3tUYW5nZXJpbmUuZGJfbmFtZX0vX2Rlc2lnbi8je1RhbmdlcmluZS5kZXNpZ25fZG9jfS9fdmlldy9ieVBhcmVudElkXCJcbiAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHsga2V5cyA6IFtcInMje0BpZH1cIixcInEje0BpZH1cIixcImEje0BpZH1cIl0gfSlcbiAgICAgIGVycm9yOiAoeGhyLCBzdGF0dXMsIGVycikgLT5cbiAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJEZWxldGUgZXJyb3I6IDAxXCI7XG4gICAgICAgIFRhbmdlcmluZS5sb2cuZGIoXCJhc3Nlc3NtZW50LWRlbGV0ZS1lcnJvci0wMVwiLFwiRXJyb3I6ICN7ZXJyfSwgU3RhdHVzOiAje3N0YXR1c30sIHhocjoje3hoci5yZXNwb25zZVRleHR8fCdub25lJ30uIGhlYWRlcnM6ICN7eGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpfVwiKVxuICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSA9PlxuXG4gICAgICAgIHJlcXVlc3REYXRhID1cbiAgICAgICAgICBkb2NzIDogcmVzcG9uc2Uucm93cy5tYXAgKHJvdykgLT5cbiAgICAgICAgICAgIFwiX2lkXCIgIDogcm93LmlkXG4gICAgICAgICAgICBcIl9yZXZcIiA6IHJvdy52YWx1ZS5yXG4gICAgICAgICAgICBcIl9kZWxldGVkXCIgOiB0cnVlXG5cbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgdHlwZTogXCJQT1NUXCJcbiAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PVVURi04XCJcbiAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgICAgICB1cmw6IFRhbmdlcmluZS5zZXR0aW5ncy51cmxCdWxrRG9jcygpXG4gICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkocmVxdWVzdERhdGEpXG4gICAgICAgICAgZXJyb3I6IC0+IFV0aWxzLm1pZEFsZXJ0IFwiRGVsZXRlIGVycm9yOiAwMlwiOyBUYW5nZXJpbmUubG9nLmRiKFwiYXNzZXNzbWVudC1kZWxldGUtZXJyb3ItMDJcIixKU09OLnN0cmluZ2lmeShhcmd1bWVudHMpKVxuICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZXMpID0+XG4gICAgICAgICAgICBva0NvdW50ID0gMFxuICAgICAgICAgICAgKG9rQ291bnQrKyBpZiByZXNwLm9rPykgZm9yIHJlc3AgaW4gcmVzcG9uc2VzXG4gICAgICAgICAgICBpZiBva0NvdW50ID09IHJlc3BvbnNlcy5sZW5ndGhcbiAgICAgICAgICAgICAgQGNvbGxlY3Rpb24ucmVtb3ZlIEBpZFxuICAgICAgICAgICAgICBAY2xlYXIoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBVdGlscy5taWRBbGVydCBcIkRlbGV0ZSBlcnJvcjogMDNcIjsgVGFuZ2VyaW5lLmxvZy5kYihcImFzc2Vzc21lbnQtZGVsZXRlLWVycm9yLTAzXCIsSlNPTi5zdHJpbmdpZnkoYXJndW1lbnRzKSlcblxuICBpc0FjdGl2ZTogLT4gcmV0dXJuIG5vdCBAaXNBcmNoaXZlZCgpXG5cbiAgaXNBcmNoaXZlZDogLT5cbiAgICBhcmNoaXZlZCA9IEBnZXQoXCJhcmNoaXZlZFwiKVxuICAgIHJldHVybiBhcmNoaXZlZCA9PSBcInRydWVcIiBvciBhcmNoaXZlZCA9PSB0cnVlXG4iXX0=
