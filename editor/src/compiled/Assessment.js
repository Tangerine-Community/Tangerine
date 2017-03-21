var Assessment,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Assessment = (function(superClass) {
  extend(Assessment, superClass);

  function Assessment() {
    this.destroy = bind(this.destroy, this);
    this.updateFromIrisCouch = bind(this.updateFromIrisCouch, this);
    this.checkConflicts = bind(this.checkConflicts, this);
    this.updateFromServer = bind(this.updateFromServer, this);
    this.fetch = bind(this.fetch, this);
    this.getResultCount = bind(this.getResultCount, this);
    this.verifyConnection = bind(this.verifyConnection, this);
    this.calcDKey = bind(this.calcDKey, this);
    return Assessment.__super__.constructor.apply(this, arguments);
  }

  Assessment.prototype.url = 'assessment';

  Assessment.prototype.VERIFY_TIMEOUT = 20 * 1000;

  Assessment.prototype.initialize = function(options) {
    if (options == null) {
      options = {};
    }
    return this.subtests = new Subtests;
  };

  Assessment.prototype.calcDKey = function() {
    return this.id.substr(-5, 5);
  };

  Assessment.prototype.verifyConnection = function(callbacks) {
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

  Assessment.prototype.getResultCount = function() {
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

  Assessment.prototype.fetch = function(options) {
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

  Assessment.prototype.splitDKeys = function(dKey) {
    if (dKey == null) {
      dKey = "";
    }
    return dKey.toLowerCase().replace(/[g-z]/g, '').replace(/[^a-f0-9]/g, " ").split(/\s+/);
  };

  Assessment.prototype.updateFromServer = function(dKey, group) {
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
    sourceDKey = Tangerine.settings.get("groupHost") + "/db/" + sourceDB + "/" + Tangerine.settings.couch.view + "byDKey";
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

  Assessment.prototype.checkConflicts = function(docList, options) {
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

  Assessment.prototype.updateFromIrisCouch = function(dKey) {
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

  Assessment.prototype.duplicate = function() {
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

  Assessment.prototype.destroy = function() {
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

  Assessment.prototype.isActive = function() {
    return !this.isArchived();
  };

  Assessment.prototype.isArchived = function() {
    var archived;
    archived = this.get("archived");
    return archived === "true" || archived === true;
  };

  return Assessment;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXNzbWVudC9Bc3Nlc3NtZW50LmpzIiwic291cmNlcyI6WyJhc3Nlc3NtZW50L0Fzc2Vzc21lbnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsVUFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7Ozs7Ozt1QkFFSixHQUFBLEdBQUs7O3VCQUVMLGNBQUEsR0FBaUIsRUFBQSxHQUFLOzt1QkFFdEIsVUFBQSxHQUFZLFNBQUUsT0FBRjs7TUFBRSxVQUFROztXQUdwQixJQUFDLENBQUEsUUFBRCxHQUFZLElBQUk7RUFITjs7dUJBTVosUUFBQSxHQUFVLFNBQUE7V0FBRyxJQUFDLENBQUEsRUFBRSxDQUFDLE1BQUosQ0FBVyxDQUFDLENBQVosRUFBZSxDQUFmO0VBQUg7O3VCQUdWLGdCQUFBLEdBQWtCLFNBQUUsU0FBRjs7TUFBRSxZQUFZOztJQUM5QixPQUFPLENBQUMsR0FBUixDQUFZLFFBQVo7SUFDQSxJQUF5RCx1QkFBekQ7TUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLFVBQUEsQ0FBVyxTQUFTLENBQUMsS0FBckIsRUFBNEIsSUFBQyxDQUFBLGNBQTdCLEVBQVQ7O1dBQ0EsQ0FBQyxDQUFDLElBQUYsQ0FDRTtNQUFBLEdBQUEsRUFBSyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQW5CLENBQTJCLE9BQTNCLEVBQW9DLFFBQXBDLENBQUw7TUFDQSxRQUFBLEVBQVUsT0FEVjtNQUVBLElBQUEsRUFBTTtRQUFBLElBQUEsRUFBTSxDQUFDLFVBQUQsQ0FBTjtPQUZOO01BR0EsT0FBQSxFQUFTLElBQUMsQ0FBQSxjQUhWO01BSUEsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNQLFlBQUEsQ0FBYSxLQUFDLENBQUEsS0FBZDsyREFDQSxTQUFTLENBQUM7UUFGSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FKVDtLQURGO0VBSGdCOzt1QkFZbEIsY0FBQSxHQUFnQixTQUFBO1dBQ2QsQ0FBQyxDQUFDLElBQUYsQ0FB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QUFLLENBQUMsUUFBTixDQUFlLGtCQUFmO3FCQUFtQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQWQsQ0FBaUIsNEJBQWpCLEVBQThDLElBQUksQ0FBQyxTQUFMLENBQWUsU0FBZixDQUE5QztZQUF0QyxDQUxQO1lBTUEsT0FBQSxFQUFTLFNBQUMsU0FBRDtBQUNQLGtCQUFBO2NBQUEsT0FBQSxHQUFVO0FBQ1YsbUJBQUEsMkNBQUE7O2dCQUFDLElBQWEsZUFBYjtrQkFBQSxPQUFBLEdBQUE7O0FBQUQ7Y0FDQSxJQUFHLE9BQUEsS0FBVyxTQUFTLENBQUMsTUFBeEI7Z0JBQ0UsS0FBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW1CLEtBQUMsQ0FBQSxFQUFwQjt1QkFDQSxLQUFDLENBQUEsS0FBRCxDQUFBLEVBRkY7ZUFBQSxNQUFBO2dCQUlFLEtBQUssQ0FBQyxRQUFOLENBQWUsa0JBQWY7dUJBQW1DLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBZCxDQUFpQiw0QkFBakIsRUFBOEMsSUFBSSxDQUFDLFNBQUwsQ0FBZSxTQUFmLENBQTlDLEVBSnJDOztZQUhPLENBTlQ7V0FERjtRQVJPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVJUO0tBREY7RUFITzs7dUJBb0NULFFBQUEsR0FBVSxTQUFBO0FBQUcsV0FBTyxDQUFJLElBQUMsQ0FBQSxVQUFELENBQUE7RUFBZDs7dUJBRVYsVUFBQSxHQUFZLFNBQUE7QUFDVixRQUFBO0lBQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxHQUFELENBQUssVUFBTDtBQUNYLFdBQU8sUUFBQSxLQUFZLE1BQVosSUFBc0IsUUFBQSxLQUFZO0VBRi9COzs7O0dBeFVXLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEFzc2Vzc21lbnQgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG4gIHVybDogJ2Fzc2Vzc21lbnQnXG5cbiAgVkVSSUZZX1RJTUVPVVQgOiAyMCAqIDEwMDBcblxuICBpbml0aWFsaXplOiAoIG9wdGlvbnM9e30gKSAtPlxuICAgICMgdGhpcyBjb2xsZWN0aW9uIGRvZXNuJ3QgZ2V0IHNhdmVkXG4gICAgIyBjaGFuZ2VzIHVwZGF0ZSB0aGUgc3VidGVzdCB2aWV3LCBpdCBrZWVwcyBvcmRlclxuICAgIEBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICMgQGdldFJlc3VsdENvdW50KClcblxuICBjYWxjREtleTogPT4gQGlkLnN1YnN0cigtNSwgNSlcblxuICAjIHJlZmFjdG9yIHRvIGV2ZW50c1xuICB2ZXJpZnlDb25uZWN0aW9uOiAoIGNhbGxiYWNrcyA9IHt9ICkgPT5cbiAgICBjb25zb2xlLmxvZyBcImNhbGxlZFwiXG4gICAgQHRpbWVyID0gc2V0VGltZW91dChjYWxsYmFja3MuZXJyb3IsIEBWRVJJRllfVElNRU9VVCkgaWYgY2FsbGJhY2tzLmVycm9yP1xuICAgICQuYWpheFxuICAgICAgdXJsOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyhcImdyb3VwXCIsIFwiYnlES2V5XCIpXG4gICAgICBkYXRhVHlwZTogXCJqc29ucFwiXG4gICAgICBkYXRhOiBrZXlzOiBbXCJ0ZXN0dGVzdFwiXVxuICAgICAgdGltZW91dDogQFZFUklGWV9USU1FT1VUXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBjbGVhclRpbWVvdXQgQHRpbWVyXG4gICAgICAgIGNhbGxiYWNrcy5zdWNjZXNzPygpXG5cbiAgZ2V0UmVzdWx0Q291bnQ6ID0+XG4gICAgJC5hamF4IFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3KFwibG9jYWxcIiwgXCJyZXN1bHRDb3VudFwiKVxuICAgICAgdHlwZTogXCJQT1NUXCJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIGdyb3VwICAgICAgIDogdHJ1ZVxuICAgICAgICBncm91cF9sZXZlbCA6IDFcbiAgICAgICAga2V5ICAgICAgICAgOiBAaWRcbiAgICAgIClcbiAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICBAcmVzdWx0Q291bnQgPSBpZiBkYXRhLnJvd3MubGVuZ3RoICE9IDAgdGhlbiBkYXRhLnJvd3NbMF0udmFsdWUgZWxzZSAwXG4gICAgICAgIEB0cmlnZ2VyIFwicmVzdWx0Q291bnRcIlxuXG5cbiAgIyBIaWphY2tlZCBzdWNjZXNzKCkgZm9yIGxhdGVyXG4gICMgZmV0Y2hzIGFsbCBzdWJ0ZXN0cyBmb3IgdGhlIGFzc2Vzc21lbnRcbiAgZmV0Y2g6IChvcHRpb25zKSA9PlxuICAgIG9sZFN1Y2Nlc3MgPSBvcHRpb25zLnN1Y2Nlc3NcbiAgICBvcHRpb25zLnN1Y2Nlc3MgPSAobW9kZWwpID0+XG4gICAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgICAga2V5OiBcInNcIiArIEBpZFxuICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSA9PlxuICAgICAgICAgICAgQHN1YnRlc3RzID0gY29sbGVjdGlvblxuICAgICAgICAgICAgQHN1YnRlc3RzLmVuc3VyZU9yZGVyKClcbiAgICAgICAgICAgIG9sZFN1Y2Nlc3M/IEBcblxuICAgIEFzc2Vzc21lbnQuX19zdXBlcl9fLmZldGNoLmNhbGwgQCwgb3B0aW9uc1xuXG4gIHNwbGl0REtleXM6ICggZEtleSA9IFwiXCIgKSAtPlxuICAgICMgc3BsaXQgdG8gaGFuZGxlIG11bHRpcGxlIGRrZXlzXG4gICAgZEtleS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1tnLXpdL2csJycpLnJlcGxhY2UoL1teYS1mMC05XS9nLFwiIFwiKS5zcGxpdCgvXFxzKy8pXG5cbiAgdXBkYXRlRnJvbVNlcnZlcjogKCBkS2V5ID0gQGNhbGNES2V5KCksIGdyb3VwICkgPT5cblxuICAgIEBsYXN0REtleSA9IGRLZXlcblxuICAgIGRLZXlzID0gQHNwbGl0REtleXMoZEtleSlcblxuICAgIEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGxvb2t1cFwiXG5cbiAgICBzb3VyY2VEQiA9IFwiZ3JvdXAtXCIgKyBncm91cFxuICAgIHRhcmdldERCID0gVGFuZ2VyaW5lLnNldHRpbmdzLmdyb3VwREJcblxuICAgIGxvY2FsREtleSA9IFRhbmdlcmluZS5zZXR0aW5ncy5sb2NhdGlvbi5ncm91cC5kYitUYW5nZXJpbmUuc2V0dGluZ3MuY291Y2gudmlldyArIFwiYnlES2V5XCJcblxuICAgIHNvdXJjZURLZXkgPSBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiZ3JvdXBIb3N0XCIpICsgXCIvZGIvXCIrc291cmNlREIrXCIvXCIrVGFuZ2VyaW5lLnNldHRpbmdzLmNvdWNoLnZpZXcgKyBcImJ5REtleVwiXG5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogc291cmNlREtleSxcbiAgICAgIHR5cGU6IFwiR0VUXCJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgZGF0YToga2V5czogSlNPTi5zdHJpbmdpZnkoZEtleXMpXG4gICAgICBlcnJvcjogKGEsIGIpID0+IEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGVycm9yXCIsIFwiI3thfSAje2J9XCJcbiAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICBkb2NMaXN0ID0gW11cbiAgICAgICAgZm9yIGRhdHVtIGluIGRhdGEucm93c1xuICAgICAgICAgIGRvY0xpc3QucHVzaCBkYXR1bS5pZFxuXG4gICAgICAgICQuYWpheFxuICAgICAgICAgIHVybDogbG9jYWxES2V5LFxuICAgICAgICAgIHR5cGU6IFwiUE9TVFwiXG4gICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoa2V5czpkS2V5cylcbiAgICAgICAgICBlcnJvcjogKGEsIGIpID0+IEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGVycm9yXCIsIFwiI3thfSAje2J9XCJcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT5cbiAgICAgICAgICAgIGZvciBkYXR1bSBpbiBkYXRhLnJvd3NcbiAgICAgICAgICAgICAgZG9jTGlzdC5wdXNoIGRhdHVtLmlkXG5cbiAgICAgICAgICAgIGRvY0xpc3QgPSBfLnVuaXEoZG9jTGlzdClcblxuICAgICAgICAgICAgJC5jb3VjaC5yZXBsaWNhdGUoXG4gICAgICAgICAgICAgIHNvdXJjZURCLFxuICAgICAgICAgICAgICB0YXJnZXREQixcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpPT5cbiAgICAgICAgICAgICAgICAgIEBjaGVja0NvbmZsaWN0cyBkb2NMaXN0XG4gICAgICAgICAgICAgICAgICBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBzdWNjZXNzXCIsIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgZXJyb3I6IChhLCBiKSAgICAgID0+IEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGVycm9yXCIsIFwiI3thfSAje2J9XCJcbiAgICAgICAgICAgICAgLFxuICAgICAgICAgICAgICAgIGRvY19pZHM6IGRvY0xpc3RcbiAgICAgICAgICAgIClcblxuICAgIGZhbHNlXG5cbiAgIyB0aGlzIGlzIHByZXR0eSBzdHJhbmdlLCBidXQgaXQgYmFzaWNhbGx5IHVuZGVsZXRlcywgdHJpZXMgdG8gcmVwbGljYXRlIGFnYWluLCBhbmQgdGhlbiBkZWxldGVzIHRoZSBjb25mbGljdGluZyAobG9jYWwpIHZlcnNpb24gYXMgbWFya2VkIGJ5IHRoZSBmaXJzdCB0aW1lIGFyb3VuZC5cbiAgY2hlY2tDb25mbGljdHM6IChkb2NMaXN0PVtdLCBvcHRpb25zPXt9KSA9PlxuXG4gICAgQGRvY3MgPSB7fSB1bmxlc3MgZG9jcz9cblxuICAgIGZvciBkb2MgaW4gZG9jTGlzdFxuICAgICAgZG8gKGRvYykgPT5cbiAgICAgICAgVGFuZ2VyaW5lLiRkYi5vcGVuRG9jIGRvYyxcbiAgICAgICAgICBvcGVuX3JldnMgOiBcImFsbFwiXG4gICAgICAgICAgY29uZmxpY3RzIDogdHJ1ZVxuICAgICAgICAgIGVycm9yOiAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgXCJlcnJvciB3aXRoICN7ZG9jfVwiXG4gICAgICAgICAgc3VjY2VzczogKGRvYykgPT5cbiAgICAgICAgICAgIGlmIGRvYy5sZW5ndGggPT0gMVxuICAgICAgICAgICAgICBkb2MgPSBkb2NbMF0ub2sgIyBjb3VjaCBpcyB3ZWlyZFxuICAgICAgICAgICAgICBpZiBkb2MuZGVsZXRlZEF0ID09IFwibW9iaWxlXCJcbiAgICAgICAgICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgICAgICAgIHR5cGU6IFwiUFVUXCJcbiAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9sb2NhbGhvc3Q6NTk4NC9cIitUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoXCJsb2NhbFwiKSArIFwiL1wiICtkb2MuX2lkXG4gICAgICAgICAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgICAgICAgICAgICAgXCJfcmV2XCIgICAgICA6IGRvYy5fcmV2XG4gICAgICAgICAgICAgICAgICAgIFwiZGVsZXRlZEF0XCIgOiBkb2MuZGVsZXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIFwiX2RlbGV0ZWRcIiAgOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgZXJyb3I6ID0+XG4gICAgICAgICAgICAgICAgICAgICNjb25zb2xlLmxvZyBcInNhdmUgbmV3IGRvYyBlcnJvclwiXG4gICAgICAgICAgICAgICAgICBjb21wbGV0ZTogPT5cbiAgICAgICAgICAgICAgICAgICAgQGRvY3MuY2hlY2tlZCA9IDAgdW5sZXNzIEBkb2NzLmNoZWNrZWQ/XG4gICAgICAgICAgICAgICAgICAgIEBkb2NzLmNoZWNrZWQrK1xuICAgICAgICAgICAgICAgICAgICBpZiBAZG9jcy5jaGVja2VkID09IGRvY0xpc3QubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgQGRvY3MuY2hlY2tlZCA9IDBcbiAgICAgICAgICAgICAgICAgICAgICBpZiBub3QgXy5pc0VtcHR5IEBsYXN0REtleVxuICAgICAgICAgICAgICAgICAgICAgICAgQHVwZGF0ZUZyb21TZXJ2ZXIgQGxhc3RES2V5XG4gICAgICAgICAgICAgICAgICAgICAgICBAbGFzdERLZXkgPSBcIlwiXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIGRvY3MgPSBkb2NcbiAgICAgICAgICAgICAgZm9yIGRvYyBpbiBkb2NzXG4gICAgICAgICAgICAgICAgZG9jID0gZG9jLm9rXG4gICAgICAgICAgICAgICAgZG8gKGRvYywgZG9jcykgPT5cbiAgICAgICAgICAgICAgICAgIGlmIGRvYy5kZWxldGVkQXQgPT0gXCJtb2JpbGVcIlxuICAgICAgICAgICAgICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIlBVVFwiXG4gICAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9sb2NhbGhvc3Q6NTk4NC9cIitUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoXCJsb2NhbFwiKSArIFwiL1wiICtkb2MuX2lkXG4gICAgICAgICAgICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIl9yZXZcIiAgICAgIDogZG9jLl9yZXZcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiX2RlbGV0ZWRcIiAgOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgI2NvbnNvbGUubG9nIFwiQ291bGQgbm90IGRlbGV0ZSBjb25mbGljdGluZyB2ZXJzaW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIEBkb2NzLmNoZWNrZWQgPSAwIHVubGVzcyBAZG9jcy5jaGVja2VkP1xuICAgICAgICAgICAgICAgICAgICAgICAgQGRvY3MuY2hlY2tlZCsrXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBAZG9jcy5jaGVja2VkID09IGRvY0xpc3QubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIEBkb2NzLmNoZWNrZWQgPSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCBfLmlzRW1wdHkgQGxhc3RES2V5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQHVwZGF0ZUZyb21TZXJ2ZXIgQGxhc3RES2V5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGxhc3RES2V5ID0gXCJcIlxuXG4gIHVwZGF0ZUZyb21JcmlzQ291Y2g6ICggZEtleSA9IEBjYWxjREtleSgpICkgPT5cblxuICAgICMgc3BsaXQgdG8gaGFuZGxlIG11bHRpcGxlIGRrZXlzXG4gICAgZEtleXMgPSBkS2V5LnJlcGxhY2UoL1teYS1mMC05XS9nLFwiIFwiKS5zcGxpdCgvXFxzKy8pXG5cbiAgICBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBsb29rdXBcIlxuICAgICQuYWpheFxuICAgICAgdXJsOiBcImh0dHA6Ly90YW5nZXJpbmUuaXJpc2NvdWNoLmNvbS90YW5nZXJpbmUvX2Rlc2lnbi9vamFpL192aWV3L2J5REtleVwiXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgdHlwZTogXCJHRVRcIlxuICAgICAgZGF0YTpcbiAgICAgICAga2V5cyA6IEpTT04uc3RyaW5naWZ5KGRLZXlzKVxuICAgICAgc3VjY2VzczogKGRhdGEpID0+XG4gICAgICAgIGRvY0xpc3QgPSBbXVxuICAgICAgICBmb3IgZGF0dW0gaW4gZGF0YS5yb3dzXG4gICAgICAgICAgZG9jTGlzdC5wdXNoIGRhdHVtLmlkXG4gICAgICAgICQuY291Y2gucmVwbGljYXRlKFxuICAgICAgICAgIFwiaHR0cDovL3RhbmdlcmluZS5pcmlzY291Y2guY29tL3RhbmdlcmluZVwiLFxuICAgICAgICAgIFRhbmdlcmluZS5zZXR0aW5ncy5ncm91cERCLFxuICAgICAgICAgICAgc3VjY2VzczoocmVzcG9uc2UpID0+IEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IHN1Y2Nlc3NcIiwgcmVzcG9uc2VcbiAgICAgICAgICAgIGVycm9yOiAoYSwgYikgICAgICA9PiBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBlcnJvclwiLCBcIiN7YX0gI3tifVwiXG4gICAgICAgICAgLFxuICAgICAgICAgICAgZG9jX2lkczogZG9jTGlzdFxuICAgICAgICApXG5cbiAgICBmYWxzZVxuXG5cbiAgIyBGZXRjaGVzIGFsbCBhc3Nlc3NtZW50IHJlbGF0ZWQgZG9jdW1lbnRzLCBwdXRzIHRoZW0gdG9nZXRoZXIgaW4gYSBkb2N1bWVudFxuICAjIGFycmF5IGZvciB1cGxvYWRpbmcgdG8gYnVsa2RvY3MuXG4gIGR1cGxpY2F0ZTogLT5cblxuICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnNcbiAgICBzdWJ0ZXN0cyAgPSBuZXcgU3VidGVzdHNcblxuICAgIG1vZGVsc1RvU2F2ZSA9IFtdXG5cbiAgICBvbGRNb2RlbCA9IEBcblxuICAgICMgZ2VuZXJhbCBwYXR0ZXJuOiBjbG9uZSBhdHRyaWJ1dGVzLCBtb2RpZnkgdGhlbSwgc3RhbXAgdGhlbSwgcHV0IGF0dHJpYnV0ZXMgaW4gYXJyYXlcblxuICAgICQuZXh0ZW5kKHRydWUsIGNsb25lZEF0dHJpYnV0ZXMgPSB7fSwgQGF0dHJpYnV0ZXMpXG5cbiAgICBuZXdJZCA9IFV0aWxzLmd1aWQoKVxuXG4gICAgY2xvbmVkQXR0cmlidXRlcy5faWQgICAgICAgICAgPSBuZXdJZFxuICAgIGNsb25lZEF0dHJpYnV0ZXMubmFtZSAgICAgICAgID0gXCJDb3B5IG9mICN7Y2xvbmVkQXR0cmlidXRlcy5uYW1lfVwiXG4gICAgY2xvbmVkQXR0cmlidXRlcy5hc3Nlc3NtZW50SWQgPSBuZXdJZFxuXG4gICAgbmV3TW9kZWwgPSBuZXcgQXNzZXNzbWVudChjbG9uZWRBdHRyaWJ1dGVzKVxuXG4gICAgbW9kZWxzVG9TYXZlLnB1c2ggKG5ld01vZGVsKS5zdGFtcCgpLmF0dHJpYnV0ZXNcblxuXG4gICAgZ2V0UXVlc3Rpb25zID0gLT5cbiAgICAgIHF1ZXN0aW9ucy5mZXRjaFxuICAgICAgICBrZXk6IFwicVwiICsgb2xkTW9kZWwuaWRcbiAgICAgICAgc3VjY2VzczogLT4gZ2V0U3VidGVzdHMoKVxuXG4gICAgZ2V0U3VidGVzdHMgPSAtPlxuICAgICAgc3VidGVzdHMuZmV0Y2hcbiAgICAgICAga2V5OiBcInNcIiArIG9sZE1vZGVsLmlkXG4gICAgICAgIHN1Y2Nlc3M6IC0+IHByb2Nlc3NEb2NzKClcblxuICAgIHByb2Nlc3NEb2NzID0gLT5cblxuICAgICAgc3VidGVzdElkTWFwID0ge31cblxuICAgICAgIyBsaW5rIG5ldyBzdWJ0ZXN0cyB0byBuZXcgYXNzZXNzbWVudFxuICAgICAgZm9yIHN1YnRlc3QgaW4gc3VidGVzdHMubW9kZWxzXG5cbiAgICAgICAgb2xkU3VidGVzdElkID0gc3VidGVzdC5pZFxuICAgICAgICBuZXdTdWJ0ZXN0SWQgPSBVdGlscy5ndWlkKClcblxuICAgICAgICBzdWJ0ZXN0SWRNYXBbb2xkU3VidGVzdElkXSA9IG5ld1N1YnRlc3RJZFxuXG4gICAgICAgICQuZXh0ZW5kKHRydWUsIG5ld0F0dHJpYnV0ZXMgPSB7fSwgc3VidGVzdC5hdHRyaWJ1dGVzKVxuXG4gICAgICAgIG5ld0F0dHJpYnV0ZXMuX2lkICAgICAgICAgID0gbmV3U3VidGVzdElkXG4gICAgICAgIG5ld0F0dHJpYnV0ZXMuYXNzZXNzbWVudElkID0gbmV3SWRcblxuICAgICAgICBtb2RlbHNUb1NhdmUucHVzaCAobmV3IFN1YnRlc3QobmV3QXR0cmlidXRlcykpLnN0YW1wKCkuYXR0cmlidXRlc1xuXG4gICAgICAjIHVwZGF0ZSB0aGUgbGlua3MgdG8gb3RoZXIgc3VidGVzdHNcbiAgICAgIGZvciBzdWJ0ZXN0IGluIG1vZGVsc1RvU2F2ZVxuICAgICAgICBpZiBzdWJ0ZXN0LmdyaWRMaW5rSWQ/IGFuZCBzdWJ0ZXN0LmdyaWRMaW5rSWQgIT0gXCJcIlxuICAgICAgICAgIHN1YnRlc3QuZ3JpZExpbmtJZCA9IHN1YnRlc3RJZE1hcFtzdWJ0ZXN0LmdyaWRMaW5rSWRdXG5cbiAgICAgICMgbGluayBxdWVzdGlvbnMgdG8gbmV3IHN1YnRlc3RzXG4gICAgICBmb3IgcXVlc3Rpb24gaW4gcXVlc3Rpb25zLm1vZGVsc1xuXG4gICAgICAgICQuZXh0ZW5kKHRydWUsIG5ld0F0dHJpYnV0ZXMgPSB7fSwgcXVlc3Rpb24uYXR0cmlidXRlcylcblxuICAgICAgICBvbGRTdWJ0ZXN0SWQgPSBuZXdBdHRyaWJ1dGVzLnN1YnRlc3RJZFxuXG4gICAgICAgIG5ld0F0dHJpYnV0ZXMuX2lkICAgICAgICAgID0gVXRpbHMuZ3VpZCgpXG4gICAgICAgIG5ld0F0dHJpYnV0ZXMuc3VidGVzdElkICAgID0gc3VidGVzdElkTWFwW29sZFN1YnRlc3RJZF1cbiAgICAgICAgbmV3QXR0cmlidXRlcy5hc3Nlc3NtZW50SWQgPSBuZXdJZFxuXG4gICAgICAgIG1vZGVsc1RvU2F2ZS5wdXNoIChuZXcgUXVlc3Rpb24obmV3QXR0cmlidXRlcykpLnN0YW1wKCkuYXR0cmlidXRlc1xuXG4gICAgICByZXF1ZXN0RGF0YSA9IFwiZG9jc1wiIDogbW9kZWxzVG9TYXZlXG5cbiAgICAgICQuYWpheFxuICAgICAgICB0eXBlIDogXCJQT1NUXCJcbiAgICAgICAgY29udGVudFR5cGUgOiBcImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9VVRGLThcIlxuICAgICAgICBkYXRhVHlwZSA6IFwianNvblwiXG4gICAgICAgIHVybCA6IFRhbmdlcmluZS5zZXR0aW5ncy51cmxCdWxrRG9jcygpXG4gICAgICAgIGRhdGEgOiBKU09OLnN0cmluZ2lmeShyZXF1ZXN0RGF0YSlcbiAgICAgICAgc3VjY2VzcyA6IChyZXNwb25zZXMpID0+IG9sZE1vZGVsLnRyaWdnZXIgXCJuZXdcIiwgbmV3TW9kZWxcbiAgICAgICAgZXJyb3IgOiAtPiBVdGlscy5taWRBbGVydCBcIkR1cGxpY2F0aW9uIGVycm9yXCJcblxuICAgICMga2ljayBpdCBvZmZcbiAgICBnZXRRdWVzdGlvbnMoKVxuXG5cblxuICBkZXN0cm95OiA9PlxuXG4gICAgIyBnZXQgYWxsIGRvY3MgdGhhdCBiZWxvbmcgdG8gdGhpcyBhc3Nlc3NzbWVudCBleGNlcHQgcmVzdWx0c1xuICAgICQuYWpheFxuICAgICAgdHlwZTogXCJQT1NUXCJcbiAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9VVRGLThcIlxuICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICB1cmw6IFwiL2RiLyN7VGFuZ2VyaW5lLmRiX25hbWV9L19kZXNpZ24vI3tUYW5nZXJpbmUuZGVzaWduX2RvY30vX3ZpZXcvYnlQYXJlbnRJZFwiXG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh7IGtleXMgOiBbXCJzI3tAaWR9XCIsXCJxI3tAaWR9XCIsXCJhI3tAaWR9XCJdIH0pXG4gICAgICBlcnJvcjogKHhociwgc3RhdHVzLCBlcnIpIC0+XG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiRGVsZXRlIGVycm9yOiAwMVwiO1xuICAgICAgICBUYW5nZXJpbmUubG9nLmRiKFwiYXNzZXNzbWVudC1kZWxldGUtZXJyb3ItMDFcIixcIkVycm9yOiAje2Vycn0sIFN0YXR1czogI3tzdGF0dXN9LCB4aHI6I3t4aHIucmVzcG9uc2VUZXh0fHwnbm9uZSd9LiBoZWFkZXJzOiAje3hoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKX1cIilcbiAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgPT5cblxuICAgICAgICByZXF1ZXN0RGF0YSA9XG4gICAgICAgICAgZG9jcyA6IHJlc3BvbnNlLnJvd3MubWFwIChyb3cpIC0+XG4gICAgICAgICAgICBcIl9pZFwiICA6IHJvdy5pZFxuICAgICAgICAgICAgXCJfcmV2XCIgOiByb3cudmFsdWUuclxuICAgICAgICAgICAgXCJfZGVsZXRlZFwiIDogdHJ1ZVxuXG4gICAgICAgICQuYWpheFxuICAgICAgICAgIHR5cGU6IFwiUE9TVFwiXG4gICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD1VVEYtOFwiXG4gICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICAgICAgdXJsOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsQnVsa0RvY3MoKVxuICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHJlcXVlc3REYXRhKVxuICAgICAgICAgIGVycm9yOiAtPiBVdGlscy5taWRBbGVydCBcIkRlbGV0ZSBlcnJvcjogMDJcIjsgVGFuZ2VyaW5lLmxvZy5kYihcImFzc2Vzc21lbnQtZGVsZXRlLWVycm9yLTAyXCIsSlNPTi5zdHJpbmdpZnkoYXJndW1lbnRzKSlcbiAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2VzKSA9PlxuICAgICAgICAgICAgb2tDb3VudCA9IDBcbiAgICAgICAgICAgIChva0NvdW50KysgaWYgcmVzcC5vaz8pIGZvciByZXNwIGluIHJlc3BvbnNlc1xuICAgICAgICAgICAgaWYgb2tDb3VudCA9PSByZXNwb25zZXMubGVuZ3RoXG4gICAgICAgICAgICAgIEBjb2xsZWN0aW9uLnJlbW92ZSBAaWRcbiAgICAgICAgICAgICAgQGNsZWFyKClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJEZWxldGUgZXJyb3I6IDAzXCI7IFRhbmdlcmluZS5sb2cuZGIoXCJhc3Nlc3NtZW50LWRlbGV0ZS1lcnJvci0wM1wiLEpTT04uc3RyaW5naWZ5KGFyZ3VtZW50cykpXG5cbiAgaXNBY3RpdmU6IC0+IHJldHVybiBub3QgQGlzQXJjaGl2ZWQoKVxuXG4gIGlzQXJjaGl2ZWQ6IC0+XG4gICAgYXJjaGl2ZWQgPSBAZ2V0KFwiYXJjaGl2ZWRcIilcbiAgICByZXR1cm4gYXJjaGl2ZWQgPT0gXCJ0cnVlXCIgb3IgYXJjaGl2ZWQgPT0gdHJ1ZVxuXG4iXX0=
