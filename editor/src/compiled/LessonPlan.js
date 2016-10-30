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
    return this.elements = new Elements;
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
        var allElements;
        allElements = new Elements;
        return allElements.fetch({
          key: "e" + _this.id,
          success: function(collection) {
            _this.elements = collection;
            _this.elements.ensureOrder();
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
    var clonedAttributes, elements, getElements, getQuestions, modelsToSave, newId, newModel, oldModel, processDocs, questions;
    questions = new Questions;
    elements = new Elements;
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
          return getElements();
        }
      });
    };
    getElements = function() {
      return elements.fetch({
        key: "s" + oldModel.id,
        success: function() {
          return processDocs();
        }
      });
    };
    processDocs = function() {
      var i, j, k, len, len1, len2, newAttributes, newSubtestId, oldSubtestId, question, ref, ref1, requestData, subtest, subtestIdMap;
      subtestIdMap = {};
      ref = elements.models;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlc3NvblBsYW4vTGVzc29uUGxhbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxVQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7Ozs7O3VCQUVKLEdBQUEsR0FBSzs7dUJBRUwsY0FBQSxHQUFpQixFQUFBLEdBQUs7O3VCQUV0QixVQUFBLEdBQVksU0FBRSxPQUFGOztNQUFFLFVBQVE7O1dBR3BCLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSTtFQUhOOzt1QkFNWixRQUFBLEdBQVUsU0FBQTtXQUFHLElBQUMsQ0FBQSxFQUFFLENBQUMsTUFBSixDQUFXLENBQUMsQ0FBWixFQUFlLENBQWY7RUFBSDs7dUJBR1YsZ0JBQUEsR0FBa0IsU0FBRSxTQUFGOztNQUFFLFlBQVk7O0lBQzlCLE9BQU8sQ0FBQyxHQUFSLENBQVksUUFBWjtJQUNBLElBQXlELHVCQUF6RDtNQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsVUFBQSxDQUFXLFNBQVMsQ0FBQyxLQUFyQixFQUE0QixJQUFDLENBQUEsY0FBN0IsRUFBVDs7V0FDQSxDQUFDLENBQUMsSUFBRixDQUNFO01BQUEsR0FBQSxFQUFLLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBbkIsQ0FBMkIsT0FBM0IsRUFBb0MsUUFBcEMsQ0FBTDtNQUNBLFFBQUEsRUFBVSxPQURWO01BRUEsSUFBQSxFQUFNO1FBQUEsSUFBQSxFQUFNLENBQUMsVUFBRCxDQUFOO09BRk47TUFHQSxPQUFBLEVBQVMsSUFBQyxDQUFBLGNBSFY7TUFJQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ1AsWUFBQSxDQUFhLEtBQUMsQ0FBQSxLQUFkOzJEQUNBLFNBQVMsQ0FBQztRQUZIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUpUO0tBREY7RUFIZ0I7O3VCQVlsQixjQUFBLEdBQWdCLFNBQUE7V0FDZCxDQUFDLENBQUMsSUFBRixDQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBbkIsQ0FBMkIs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U0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFkLENBQWlCLDRCQUFqQixFQUE4QyxJQUFJLENBQUMsU0FBTCxDQUFlLFNBQWYsQ0FBOUM7WUFBdEMsQ0FMUDtZQU1BLE9BQUEsRUFBUyxTQUFDLFNBQUQ7QUFDUCxrQkFBQTtjQUFBLE9BQUEsR0FBVTtBQUNWLG1CQUFBLDJDQUFBOztnQkFBQyxJQUFhLGVBQWI7a0JBQUEsT0FBQSxHQUFBOztBQUFEO2NBQ0EsSUFBRyxPQUFBLEtBQVcsU0FBUyxDQUFDLE1BQXhCO2dCQUNFLEtBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFtQixLQUFDLENBQUEsRUFBcEI7dUJBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBQSxFQUZGO2VBQUEsTUFBQTtnQkFJRSxLQUFLLENBQUMsUUFBTixDQUFlLGtCQUFmO3VCQUFtQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQWQsQ0FBaUIsNEJBQWpCLEVBQThDLElBQUksQ0FBQyxTQUFMLENBQWUsU0FBZixDQUE5QyxFQUpyQzs7WUFITyxDQU5UO1dBREY7UUFSTztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FSVDtLQURGO0VBSE87O3VCQW9DVCxRQUFBLEdBQVUsU0FBQTtBQUFHLFdBQU8sQ0FBSSxJQUFDLENBQUEsVUFBRCxDQUFBO0VBQWQ7O3VCQUVWLFVBQUEsR0FBWSxTQUFBO0FBQ1YsUUFBQTtJQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsR0FBRCxDQUFLLFVBQUw7QUFDWCxXQUFPLFFBQUEsS0FBWSxNQUFaLElBQXNCLFFBQUEsS0FBWTtFQUYvQjs7OztHQTFVVyxRQUFRLENBQUMiLCJmaWxlIjoibGVzc29uUGxhbi9MZXNzb25QbGFuLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTGVzc29uUGxhbiBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cbiAgdXJsOiAnbGVzc29uUGxhbidcblxuICBWRVJJRllfVElNRU9VVCA6IDIwICogMTAwMFxuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucz17fSApIC0+XG4jIHRoaXMgY29sbGVjdGlvbiBkb2Vzbid0IGdldCBzYXZlZFxuIyBjaGFuZ2VzIHVwZGF0ZSB0aGUgc3VidGVzdCB2aWV3LCBpdCBrZWVwcyBvcmRlclxuICAgIEBlbGVtZW50cyA9IG5ldyBFbGVtZW50c1xuIyBAZ2V0UmVzdWx0Q291bnQoKVxuXG4gIGNhbGNES2V5OiA9PiBAaWQuc3Vic3RyKC01LCA1KVxuXG4jIHJlZmFjdG9yIHRvIGV2ZW50c1xuICB2ZXJpZnlDb25uZWN0aW9uOiAoIGNhbGxiYWNrcyA9IHt9ICkgPT5cbiAgICBjb25zb2xlLmxvZyBcImNhbGxlZFwiXG4gICAgQHRpbWVyID0gc2V0VGltZW91dChjYWxsYmFja3MuZXJyb3IsIEBWRVJJRllfVElNRU9VVCkgaWYgY2FsbGJhY2tzLmVycm9yP1xuICAgICQuYWpheFxuICAgICAgdXJsOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyhcImdyb3VwXCIsIFwiYnlES2V5XCIpXG4gICAgICBkYXRhVHlwZTogXCJqc29ucFwiXG4gICAgICBkYXRhOiBrZXlzOiBbXCJ0ZXN0dGVzdFwiXVxuICAgICAgdGltZW91dDogQFZFUklGWV9USU1FT1VUXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBjbGVhclRpbWVvdXQgQHRpbWVyXG4gICAgICAgIGNhbGxiYWNrcy5zdWNjZXNzPygpXG5cbiAgZ2V0UmVzdWx0Q291bnQ6ID0+XG4gICAgJC5hamF4IFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3KFwibG9jYWxcIiwgXCJyZXN1bHRDb3VudFwiKVxuICAgICAgdHlwZTogXCJQT1NUXCJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIGdyb3VwICAgICAgIDogdHJ1ZVxuICAgICAgICBncm91cF9sZXZlbCA6IDFcbiAgICAgICAga2V5ICAgICAgICAgOiBAaWRcbiAgICAgIClcbiAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICBAcmVzdWx0Q291bnQgPSBpZiBkYXRhLnJvd3MubGVuZ3RoICE9IDAgdGhlbiBkYXRhLnJvd3NbMF0udmFsdWUgZWxzZSAwXG4gICAgICAgIEB0cmlnZ2VyIFwicmVzdWx0Q291bnRcIlxuXG5cbiMgSGlqYWNrZWQgc3VjY2VzcygpIGZvciBsYXRlclxuIyBmZXRjaHMgYWxsIGVsZW1lbnRzIGZvciB0aGUgbGVzc29uUGxhblxuICBmZXRjaDogKG9wdGlvbnMpID0+XG4gICAgb2xkU3VjY2VzcyA9IG9wdGlvbnMuc3VjY2Vzc1xuICAgIG9wdGlvbnMuc3VjY2VzcyA9IChtb2RlbCkgPT5cbiAgICAgIGFsbEVsZW1lbnRzID0gbmV3IEVsZW1lbnRzXG4gICAgICBhbGxFbGVtZW50cy5mZXRjaFxuICAgICAgICBrZXk6IFwiZVwiICsgQGlkXG4gICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSA9PlxuICAgICAgICAgIEBlbGVtZW50cyA9IGNvbGxlY3Rpb25cbiAgICAgICAgICBAZWxlbWVudHMuZW5zdXJlT3JkZXIoKVxuICAgICAgICAgIG9sZFN1Y2Nlc3M/IEBcblxuICAgIEFzc2Vzc21lbnQuX19zdXBlcl9fLmZldGNoLmNhbGwgQCwgb3B0aW9uc1xuXG5cblxuICBzcGxpdERLZXlzOiAoIGRLZXkgPSBcIlwiICkgLT5cbiMgc3BsaXQgdG8gaGFuZGxlIG11bHRpcGxlIGRrZXlzXG4gICAgZEtleS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1tnLXpdL2csJycpLnJlcGxhY2UoL1teYS1mMC05XS9nLFwiIFwiKS5zcGxpdCgvXFxzKy8pXG5cbiAgdXBkYXRlRnJvbVNlcnZlcjogKCBkS2V5ID0gQGNhbGNES2V5KCksIGdyb3VwICkgPT5cblxuICAgIEBsYXN0REtleSA9IGRLZXlcblxuICAgIGRLZXlzID0gQHNwbGl0REtleXMoZEtleSlcblxuICAgIEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGxvb2t1cFwiXG5cbiAgICBzb3VyY2VEQiA9IFwiZ3JvdXAtXCIgKyBncm91cFxuICAgIHRhcmdldERCID0gVGFuZ2VyaW5lLnNldHRpbmdzLmdyb3VwREJcblxuICAgIGxvY2FsREtleSA9IFRhbmdlcmluZS5zZXR0aW5ncy5sb2NhdGlvbi5ncm91cC5kYitUYW5nZXJpbmUuc2V0dGluZ3MuY291Y2gudmlldyArIFwiYnlES2V5XCJcblxuICAgIHNvdXJjZURLZXkgPSBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiZ3JvdXBIb3N0XCIpICsgXCIvXCIrc291cmNlREIrXCIvXCIrVGFuZ2VyaW5lLnNldHRpbmdzLmNvdWNoLnZpZXcgKyBcImJ5REtleVwiXG5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogc291cmNlREtleSxcbiAgICAgIHR5cGU6IFwiR0VUXCJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgZGF0YToga2V5czogSlNPTi5zdHJpbmdpZnkoZEtleXMpXG4gICAgICBlcnJvcjogKGEsIGIpID0+IEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGVycm9yXCIsIFwiI3thfSAje2J9XCJcbiAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICBkb2NMaXN0ID0gW11cbiAgICAgICAgZm9yIGRhdHVtIGluIGRhdGEucm93c1xuICAgICAgICAgIGRvY0xpc3QucHVzaCBkYXR1bS5pZFxuXG4gICAgICAgICQuYWpheFxuICAgICAgICAgIHVybDogbG9jYWxES2V5LFxuICAgICAgICAgIHR5cGU6IFwiUE9TVFwiXG4gICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoa2V5czpkS2V5cylcbiAgICAgICAgICBlcnJvcjogKGEsIGIpID0+IEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGVycm9yXCIsIFwiI3thfSAje2J9XCJcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT5cbiAgICAgICAgICAgIGZvciBkYXR1bSBpbiBkYXRhLnJvd3NcbiAgICAgICAgICAgICAgZG9jTGlzdC5wdXNoIGRhdHVtLmlkXG5cbiAgICAgICAgICAgIGRvY0xpc3QgPSBfLnVuaXEoZG9jTGlzdClcblxuICAgICAgICAgICAgJC5jb3VjaC5yZXBsaWNhdGUoXG4gICAgICAgICAgICAgIHNvdXJjZURCLFxuICAgICAgICAgICAgICB0YXJnZXREQixcbiAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKT0+XG4gICAgICAgICAgICAgICAgQGNoZWNrQ29uZmxpY3RzIGRvY0xpc3RcbiAgICAgICAgICAgICAgICBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBzdWNjZXNzXCIsIHJlc3BvbnNlXG4gICAgICAgICAgICAgIGVycm9yOiAoYSwgYikgICAgICA9PiBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBlcnJvclwiLCBcIiN7YX0gI3tifVwiXG4gICAgICAgICAgICAsXG4gICAgICAgICAgICAgIGRvY19pZHM6IGRvY0xpc3RcbiAgICAgICAgICAgIClcblxuICAgIGZhbHNlXG5cbiMgdGhpcyBpcyBwcmV0dHkgc3RyYW5nZSwgYnV0IGl0IGJhc2ljYWxseSB1bmRlbGV0ZXMsIHRyaWVzIHRvIHJlcGxpY2F0ZSBhZ2FpbiwgYW5kIHRoZW4gZGVsZXRlcyB0aGUgY29uZmxpY3RpbmcgKGxvY2FsKSB2ZXJzaW9uIGFzIG1hcmtlZCBieSB0aGUgZmlyc3QgdGltZSBhcm91bmQuXG4gIGNoZWNrQ29uZmxpY3RzOiAoZG9jTGlzdD1bXSwgb3B0aW9ucz17fSkgPT5cblxuICAgIEBkb2NzID0ge30gdW5sZXNzIGRvY3M/XG5cbiAgICBmb3IgZG9jIGluIGRvY0xpc3RcbiAgICAgIGRvIChkb2MpID0+XG4gICAgICAgIFRhbmdlcmluZS4kZGIub3BlbkRvYyBkb2MsXG4gICAgICAgICAgb3Blbl9yZXZzIDogXCJhbGxcIlxuICAgICAgICAgIGNvbmZsaWN0cyA6IHRydWVcbiAgICAgICAgICBlcnJvcjogLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIFwiZXJyb3Igd2l0aCAje2RvY31cIlxuICAgICAgICAgIHN1Y2Nlc3M6IChkb2MpID0+XG4gICAgICAgICAgICBpZiBkb2MubGVuZ3RoID09IDFcbiAgICAgICAgICAgICAgZG9jID0gZG9jWzBdLm9rICMgY291Y2ggaXMgd2VpcmRcbiAgICAgICAgICAgICAgaWYgZG9jLmRlbGV0ZWRBdCA9PSBcIm1vYmlsZVwiXG4gICAgICAgICAgICAgICAgJC5hamF4XG4gICAgICAgICAgICAgICAgICB0eXBlOiBcIlBVVFwiXG4gICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgICAgICAgICAgICAgIHVybDogXCJodHRwOi8vbG9jYWxob3N0OjU5ODQvXCIrVGFuZ2VyaW5lLnNldHRpbmdzLnVybERCKFwibG9jYWxcIikgKyBcIi9cIiArZG9jLl9pZFxuICAgICAgICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgICAgICAgICAgICAgIFwiX3JldlwiICAgICAgOiBkb2MuX3JldlxuICAgICAgICAgICAgICAgICAgICBcImRlbGV0ZWRBdFwiIDogZG9jLmRlbGV0ZWRBdFxuICAgICAgICAgICAgICAgICAgICBcIl9kZWxldGVkXCIgIDogZmFsc2VcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIGVycm9yOiA9PlxuI2NvbnNvbGUubG9nIFwic2F2ZSBuZXcgZG9jIGVycm9yXCJcbiAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgICAgICAgICBAZG9jcy5jaGVja2VkID0gMCB1bmxlc3MgQGRvY3MuY2hlY2tlZD9cbiAgICAgICAgICAgICAgICAgICAgQGRvY3MuY2hlY2tlZCsrXG4gICAgICAgICAgICAgICAgICAgIGlmIEBkb2NzLmNoZWNrZWQgPT0gZG9jTGlzdC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICBAZG9jcy5jaGVja2VkID0gMFxuICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCBfLmlzRW1wdHkgQGxhc3RES2V5XG4gICAgICAgICAgICAgICAgICAgICAgICBAdXBkYXRlRnJvbVNlcnZlciBAbGFzdERLZXlcbiAgICAgICAgICAgICAgICAgICAgICAgIEBsYXN0REtleSA9IFwiXCJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgZG9jcyA9IGRvY1xuICAgICAgICAgICAgICBmb3IgZG9jIGluIGRvY3NcbiAgICAgICAgICAgICAgICBkb2MgPSBkb2Mub2tcbiAgICAgICAgICAgICAgICBkbyAoZG9jLCBkb2NzKSA9PlxuICAgICAgICAgICAgICAgICAgaWYgZG9jLmRlbGV0ZWRBdCA9PSBcIm1vYmlsZVwiXG4gICAgICAgICAgICAgICAgICAgICQuYWpheFxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiUFVUXCJcbiAgICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cDovL2xvY2FsaG9zdDo1OTg0L1wiK1RhbmdlcmluZS5zZXR0aW5ncy51cmxEQihcImxvY2FsXCIpICsgXCIvXCIgK2RvYy5faWRcbiAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiX3JldlwiICAgICAgOiBkb2MuX3JldlxuICAgICAgICAgICAgICAgICAgICAgICAgXCJfZGVsZXRlZFwiICA6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgZXJyb3I6ID0+XG4jY29uc29sZS5sb2cgXCJDb3VsZCBub3QgZGVsZXRlIGNvbmZsaWN0aW5nIHZlcnNpb25cIlxuICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgQGRvY3MuY2hlY2tlZCA9IDAgdW5sZXNzIEBkb2NzLmNoZWNrZWQ/XG4gICAgICAgICAgICAgICAgICAgICAgICBAZG9jcy5jaGVja2VkKytcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIEBkb2NzLmNoZWNrZWQgPT0gZG9jTGlzdC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgQGRvY3MuY2hlY2tlZCA9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgbm90IF8uaXNFbXB0eSBAbGFzdERLZXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAdXBkYXRlRnJvbVNlcnZlciBAbGFzdERLZXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAbGFzdERLZXkgPSBcIlwiXG5cbiAgdXBkYXRlRnJvbUlyaXNDb3VjaDogKCBkS2V5ID0gQGNhbGNES2V5KCkgKSA9PlxuXG4jIHNwbGl0IHRvIGhhbmRsZSBtdWx0aXBsZSBka2V5c1xuICAgIGRLZXlzID0gZEtleS5yZXBsYWNlKC9bXmEtZjAtOV0vZyxcIiBcIikuc3BsaXQoL1xccysvKVxuXG4gICAgQHRyaWdnZXIgXCJzdGF0dXNcIiwgXCJpbXBvcnQgbG9va3VwXCJcbiAgICAkLmFqYXhcbiAgICAgIHVybDogXCJodHRwOi8vdGFuZ2VyaW5lLmlyaXNjb3VjaC5jb20vdGFuZ2VyaW5lL19kZXNpZ24vb2phaS9fdmlldy9ieURLZXlcIlxuICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcbiAgICAgIHR5cGU6IFwiR0VUXCJcbiAgICAgIGRhdGE6XG4gICAgICAgIGtleXMgOiBKU09OLnN0cmluZ2lmeShkS2V5cylcbiAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICBkb2NMaXN0ID0gW11cbiAgICAgICAgZm9yIGRhdHVtIGluIGRhdGEucm93c1xuICAgICAgICAgIGRvY0xpc3QucHVzaCBkYXR1bS5pZFxuICAgICAgICAkLmNvdWNoLnJlcGxpY2F0ZShcbiAgICAgICAgICBcImh0dHA6Ly90YW5nZXJpbmUuaXJpc2NvdWNoLmNvbS90YW5nZXJpbmVcIixcbiAgICAgICAgICBUYW5nZXJpbmUuc2V0dGluZ3MuZ3JvdXBEQixcbiAgICAgICAgICBzdWNjZXNzOihyZXNwb25zZSkgPT4gQHRyaWdnZXIgXCJzdGF0dXNcIiwgXCJpbXBvcnQgc3VjY2Vzc1wiLCByZXNwb25zZVxuICAgICAgICAgIGVycm9yOiAoYSwgYikgICAgICA9PiBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBlcnJvclwiLCBcIiN7YX0gI3tifVwiXG4gICAgICAgICxcbiAgICAgICAgICBkb2NfaWRzOiBkb2NMaXN0XG4gICAgICAgIClcblxuICAgIGZhbHNlXG5cblxuIyBGZXRjaGVzIGFsbCBhc3Nlc3NtZW50IHJlbGF0ZWQgZG9jdW1lbnRzLCBwdXRzIHRoZW0gdG9nZXRoZXIgaW4gYSBkb2N1bWVudFxuIyBhcnJheSBmb3IgdXBsb2FkaW5nIHRvIGJ1bGtkb2NzLlxuICBkdXBsaWNhdGU6IC0+XG5cbiAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zXG4gICAgZWxlbWVudHMgID0gbmV3IEVsZW1lbnRzXG5cbiAgICBtb2RlbHNUb1NhdmUgPSBbXVxuXG4gICAgb2xkTW9kZWwgPSBAXG5cbiAgICAjIGdlbmVyYWwgcGF0dGVybjogY2xvbmUgYXR0cmlidXRlcywgbW9kaWZ5IHRoZW0sIHN0YW1wIHRoZW0sIHB1dCBhdHRyaWJ1dGVzIGluIGFycmF5XG5cbiAgICAkLmV4dGVuZCh0cnVlLCBjbG9uZWRBdHRyaWJ1dGVzID0ge30sIEBhdHRyaWJ1dGVzKVxuXG4gICAgbmV3SWQgPSBVdGlscy5ndWlkKClcblxuICAgIGNsb25lZEF0dHJpYnV0ZXMuX2lkICAgICAgICAgID0gbmV3SWRcbiAgICBjbG9uZWRBdHRyaWJ1dGVzLm5hbWUgICAgICAgICA9IFwiQ29weSBvZiAje2Nsb25lZEF0dHJpYnV0ZXMubmFtZX1cIlxuICAgIGNsb25lZEF0dHJpYnV0ZXMuYXNzZXNzbWVudElkID0gbmV3SWRcblxuICAgIG5ld01vZGVsID0gbmV3IEFzc2Vzc21lbnQoY2xvbmVkQXR0cmlidXRlcylcblxuICAgIG1vZGVsc1RvU2F2ZS5wdXNoIChuZXdNb2RlbCkuc3RhbXAoKS5hdHRyaWJ1dGVzXG5cblxuICAgIGdldFF1ZXN0aW9ucyA9IC0+XG4gICAgICBxdWVzdGlvbnMuZmV0Y2hcbiAgICAgICAga2V5OiBcInFcIiArIG9sZE1vZGVsLmlkXG4gICAgICAgIHN1Y2Nlc3M6IC0+IGdldEVsZW1lbnRzKClcblxuICAgIGdldEVsZW1lbnRzID0gLT5cbiAgICAgIGVsZW1lbnRzLmZldGNoXG4gICAgICAgIGtleTogXCJzXCIgKyBvbGRNb2RlbC5pZFxuICAgICAgICBzdWNjZXNzOiAtPiBwcm9jZXNzRG9jcygpXG5cbiAgICBwcm9jZXNzRG9jcyA9IC0+XG5cbiAgICAgIHN1YnRlc3RJZE1hcCA9IHt9XG5cbiAgICAgICMgbGluayBuZXcgZWxlbWVudHMgdG8gbmV3IGFzc2Vzc21lbnRcbiAgICAgIGZvciBzdWJ0ZXN0IGluIGVsZW1lbnRzLm1vZGVsc1xuXG4gICAgICAgIG9sZFN1YnRlc3RJZCA9IHN1YnRlc3QuaWRcbiAgICAgICAgbmV3U3VidGVzdElkID0gVXRpbHMuZ3VpZCgpXG5cbiAgICAgICAgc3VidGVzdElkTWFwW29sZFN1YnRlc3RJZF0gPSBuZXdTdWJ0ZXN0SWRcblxuICAgICAgICAkLmV4dGVuZCh0cnVlLCBuZXdBdHRyaWJ1dGVzID0ge30sIHN1YnRlc3QuYXR0cmlidXRlcylcblxuICAgICAgICBuZXdBdHRyaWJ1dGVzLl9pZCAgICAgICAgICA9IG5ld1N1YnRlc3RJZFxuICAgICAgICBuZXdBdHRyaWJ1dGVzLmFzc2Vzc21lbnRJZCA9IG5ld0lkXG5cbiAgICAgICAgbW9kZWxzVG9TYXZlLnB1c2ggKG5ldyBTdWJ0ZXN0KG5ld0F0dHJpYnV0ZXMpKS5zdGFtcCgpLmF0dHJpYnV0ZXNcblxuICAgICAgIyB1cGRhdGUgdGhlIGxpbmtzIHRvIG90aGVyIGVsZW1lbnRzXG4gICAgICBmb3Igc3VidGVzdCBpbiBtb2RlbHNUb1NhdmVcbiAgICAgICAgaWYgc3VidGVzdC5ncmlkTGlua0lkPyBhbmQgc3VidGVzdC5ncmlkTGlua0lkICE9IFwiXCJcbiAgICAgICAgICBzdWJ0ZXN0LmdyaWRMaW5rSWQgPSBzdWJ0ZXN0SWRNYXBbc3VidGVzdC5ncmlkTGlua0lkXVxuXG4gICAgICAjIGxpbmsgcXVlc3Rpb25zIHRvIG5ldyBlbGVtZW50c1xuICAgICAgZm9yIHF1ZXN0aW9uIGluIHF1ZXN0aW9ucy5tb2RlbHNcblxuICAgICAgICAkLmV4dGVuZCh0cnVlLCBuZXdBdHRyaWJ1dGVzID0ge30sIHF1ZXN0aW9uLmF0dHJpYnV0ZXMpXG5cbiAgICAgICAgb2xkU3VidGVzdElkID0gbmV3QXR0cmlidXRlcy5zdWJ0ZXN0SWRcblxuICAgICAgICBuZXdBdHRyaWJ1dGVzLl9pZCAgICAgICAgICA9IFV0aWxzLmd1aWQoKVxuICAgICAgICBuZXdBdHRyaWJ1dGVzLnN1YnRlc3RJZCAgICA9IHN1YnRlc3RJZE1hcFtvbGRTdWJ0ZXN0SWRdXG4gICAgICAgIG5ld0F0dHJpYnV0ZXMuYXNzZXNzbWVudElkID0gbmV3SWRcblxuICAgICAgICBtb2RlbHNUb1NhdmUucHVzaCAobmV3IFF1ZXN0aW9uKG5ld0F0dHJpYnV0ZXMpKS5zdGFtcCgpLmF0dHJpYnV0ZXNcblxuICAgICAgcmVxdWVzdERhdGEgPSBcImRvY3NcIiA6IG1vZGVsc1RvU2F2ZVxuXG4gICAgICAkLmFqYXhcbiAgICAgICAgdHlwZSA6IFwiUE9TVFwiXG4gICAgICAgIGNvbnRlbnRUeXBlIDogXCJhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PVVURi04XCJcbiAgICAgICAgZGF0YVR5cGUgOiBcImpzb25cIlxuICAgICAgICB1cmwgOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsQnVsa0RvY3MoKVxuICAgICAgICBkYXRhIDogSlNPTi5zdHJpbmdpZnkocmVxdWVzdERhdGEpXG4gICAgICAgIHN1Y2Nlc3MgOiAocmVzcG9uc2VzKSA9PiBvbGRNb2RlbC50cmlnZ2VyIFwibmV3XCIsIG5ld01vZGVsXG4gICAgICAgIGVycm9yIDogLT4gVXRpbHMubWlkQWxlcnQgXCJEdXBsaWNhdGlvbiBlcnJvclwiXG5cbiAgICAjIGtpY2sgaXQgb2ZmXG4gICAgZ2V0UXVlc3Rpb25zKClcblxuXG5cbiAgZGVzdHJveTogPT5cblxuIyBnZXQgYWxsIGRvY3MgdGhhdCBiZWxvbmcgdG8gdGhpcyBhc3Nlc3NzbWVudCBleGNlcHQgcmVzdWx0c1xuICAgICQuYWpheFxuICAgICAgdHlwZTogXCJQT1NUXCJcbiAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9VVRGLThcIlxuICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICB1cmw6IFwiL2RiLyN7VGFuZ2VyaW5lLmRiX25hbWV9L19kZXNpZ24vI3tUYW5nZXJpbmUuZGVzaWduX2RvY30vX3ZpZXcvYnlQYXJlbnRJZFwiXG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh7IGtleXMgOiBbXCJzI3tAaWR9XCIsXCJxI3tAaWR9XCIsXCJhI3tAaWR9XCJdIH0pXG4gICAgICBlcnJvcjogKHhociwgc3RhdHVzLCBlcnIpIC0+XG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiRGVsZXRlIGVycm9yOiAwMVwiO1xuICAgICAgICBUYW5nZXJpbmUubG9nLmRiKFwiYXNzZXNzbWVudC1kZWxldGUtZXJyb3ItMDFcIixcIkVycm9yOiAje2Vycn0sIFN0YXR1czogI3tzdGF0dXN9LCB4aHI6I3t4aHIucmVzcG9uc2VUZXh0fHwnbm9uZSd9LiBoZWFkZXJzOiAje3hoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKX1cIilcbiAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgPT5cblxuICAgICAgICByZXF1ZXN0RGF0YSA9XG4gICAgICAgICAgZG9jcyA6IHJlc3BvbnNlLnJvd3MubWFwIChyb3cpIC0+XG4gICAgICAgICAgICBcIl9pZFwiICA6IHJvdy5pZFxuICAgICAgICAgICAgXCJfcmV2XCIgOiByb3cudmFsdWUuclxuICAgICAgICAgICAgXCJfZGVsZXRlZFwiIDogdHJ1ZVxuXG4gICAgICAgICQuYWpheFxuICAgICAgICAgIHR5cGU6IFwiUE9TVFwiXG4gICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD1VVEYtOFwiXG4gICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICAgICAgdXJsOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsQnVsa0RvY3MoKVxuICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHJlcXVlc3REYXRhKVxuICAgICAgICAgIGVycm9yOiAtPiBVdGlscy5taWRBbGVydCBcIkRlbGV0ZSBlcnJvcjogMDJcIjsgVGFuZ2VyaW5lLmxvZy5kYihcImFzc2Vzc21lbnQtZGVsZXRlLWVycm9yLTAyXCIsSlNPTi5zdHJpbmdpZnkoYXJndW1lbnRzKSlcbiAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2VzKSA9PlxuICAgICAgICAgICAgb2tDb3VudCA9IDBcbiAgICAgICAgICAgIChva0NvdW50KysgaWYgcmVzcC5vaz8pIGZvciByZXNwIGluIHJlc3BvbnNlc1xuICAgICAgICAgICAgaWYgb2tDb3VudCA9PSByZXNwb25zZXMubGVuZ3RoXG4gICAgICAgICAgICAgIEBjb2xsZWN0aW9uLnJlbW92ZSBAaWRcbiAgICAgICAgICAgICAgQGNsZWFyKClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJEZWxldGUgZXJyb3I6IDAzXCI7IFRhbmdlcmluZS5sb2cuZGIoXCJhc3Nlc3NtZW50LWRlbGV0ZS1lcnJvci0wM1wiLEpTT04uc3RyaW5naWZ5KGFyZ3VtZW50cykpXG5cbiAgaXNBY3RpdmU6IC0+IHJldHVybiBub3QgQGlzQXJjaGl2ZWQoKVxuXG4gIGlzQXJjaGl2ZWQ6IC0+XG4gICAgYXJjaGl2ZWQgPSBAZ2V0KFwiYXJjaGl2ZWRcIilcbiAgICByZXR1cm4gYXJjaGl2ZWQgPT0gXCJ0cnVlXCIgb3IgYXJjaGl2ZWQgPT0gdHJ1ZVxuIl19
