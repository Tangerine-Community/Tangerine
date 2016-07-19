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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2Vzc21lbnQvQXNzZXNzbWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxVQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7Ozs7O3VCQUVKLEdBQUEsR0FBSzs7dUJBRUwsY0FBQSxHQUFpQixFQUFBLEdBQUs7O3VCQUV0QixVQUFBLEdBQVksU0FBRSxPQUFGOztNQUFFLFVBQVE7O1dBR3BCLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSTtFQUhOOzt1QkFNWixRQUFBLEdBQVUsU0FBQTtXQUFHLElBQUMsQ0FBQSxFQUFFLENBQUMsTUFBSixDQUFXLENBQUMsQ0FBWixFQUFlLENBQWY7RUFBSDs7dUJBR1YsZ0JBQUEsR0FBa0IsU0FBRSxTQUFGOztNQUFFLFlBQVk7O0lBQzlCLE9BQU8sQ0FBQyxHQUFSLENBQVksUUFBWjtJQUNBLElBQXlELHVCQUF6RDtNQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsVUFBQSxDQUFXLFNBQVMsQ0FBQyxLQUFyQixFQUE0QixJQUFDLENBQUEsY0FBN0IsRUFBVDs7V0FDQSxDQUFDLENBQUMsSUFBRixDQUNFO01BQUEsR0FBQSxFQUFLLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBbkIsQ0FBMkIsT0FBM0IsRUFBb0MsUUFBcEMsQ0FBTDtNQUNBLFFBQUEsRUFBVSxPQURWO01BRUEsSUFBQSxFQUFNO1FBQUEsSUFBQSxFQUFNLENBQUMsVUFBRCxDQUFOO09BRk47TUFHQSxPQUFBLEVBQVMsSUFBQyxDQUFBLGNBSFY7TUFJQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ1AsWUFBQSxDQUFhLEtBQUMsQ0FBQSxLQUFkOzJEQUNBLFNBQVMsQ0FBQztRQUZIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUpUO0tBREY7RUFIZ0I7O3VCQVlsQixjQUFBLEdBQWdCLFNBQUE7V0FDZCxDQUFDLENBQUMsSUFBRixDQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBbkIsQ0FBMkIs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QVMsQ0FBQyxHQUFHLENBQUMsRUFBZCxDQUFpQiw0QkFBakIsRUFBOEMsSUFBSSxDQUFDLFNBQUwsQ0FBZSxTQUFmLENBQTlDO1lBQXRDLENBTFA7WUFNQSxPQUFBLEVBQVMsU0FBQyxTQUFEO0FBQ1Asa0JBQUE7Y0FBQSxPQUFBLEdBQVU7QUFDVixtQkFBQSwyQ0FBQTs7Z0JBQUMsSUFBYSxlQUFiO2tCQUFBLE9BQUEsR0FBQTs7QUFBRDtjQUNBLElBQUcsT0FBQSxLQUFXLFNBQVMsQ0FBQyxNQUF4QjtnQkFDRSxLQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBbUIsS0FBQyxDQUFBLEVBQXBCO3VCQUNBLEtBQUMsQ0FBQSxLQUFELENBQUEsRUFGRjtlQUFBLE1BQUE7Z0JBSUUsS0FBSyxDQUFDLFFBQU4sQ0FBZSxrQkFBZjt1QkFBbUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFkLENBQWlCLDRCQUFqQixFQUE4QyxJQUFJLENBQUMsU0FBTCxDQUFlLFNBQWYsQ0FBOUMsRUFKckM7O1lBSE8sQ0FOVDtXQURGO1FBUk87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBUlQ7S0FERjtFQUhPOzt1QkFvQ1QsUUFBQSxHQUFVLFNBQUE7QUFBRyxXQUFPLENBQUksSUFBQyxDQUFBLFVBQUQsQ0FBQTtFQUFkOzt1QkFFVixVQUFBLEdBQVksU0FBQTtBQUNWLFFBQUE7SUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLEdBQUQsQ0FBSyxVQUFMO0FBQ1gsV0FBTyxRQUFBLEtBQVksTUFBWixJQUFzQixRQUFBLEtBQVk7RUFGL0I7Ozs7R0F4VVcsUUFBUSxDQUFDIiwiZmlsZSI6ImFzc2Vzc21lbnQvQXNzZXNzbWVudC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEFzc2Vzc21lbnQgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG4gIHVybDogJ2Fzc2Vzc21lbnQnXG5cbiAgVkVSSUZZX1RJTUVPVVQgOiAyMCAqIDEwMDBcblxuICBpbml0aWFsaXplOiAoIG9wdGlvbnM9e30gKSAtPlxuICAgICMgdGhpcyBjb2xsZWN0aW9uIGRvZXNuJ3QgZ2V0IHNhdmVkXG4gICAgIyBjaGFuZ2VzIHVwZGF0ZSB0aGUgc3VidGVzdCB2aWV3LCBpdCBrZWVwcyBvcmRlclxuICAgIEBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICMgQGdldFJlc3VsdENvdW50KClcblxuICBjYWxjREtleTogPT4gQGlkLnN1YnN0cigtNSwgNSlcblxuICAjIHJlZmFjdG9yIHRvIGV2ZW50c1xuICB2ZXJpZnlDb25uZWN0aW9uOiAoIGNhbGxiYWNrcyA9IHt9ICkgPT5cbiAgICBjb25zb2xlLmxvZyBcImNhbGxlZFwiXG4gICAgQHRpbWVyID0gc2V0VGltZW91dChjYWxsYmFja3MuZXJyb3IsIEBWRVJJRllfVElNRU9VVCkgaWYgY2FsbGJhY2tzLmVycm9yP1xuICAgICQuYWpheFxuICAgICAgdXJsOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyhcImdyb3VwXCIsIFwiYnlES2V5XCIpXG4gICAgICBkYXRhVHlwZTogXCJqc29ucFwiXG4gICAgICBkYXRhOiBrZXlzOiBbXCJ0ZXN0dGVzdFwiXVxuICAgICAgdGltZW91dDogQFZFUklGWV9USU1FT1VUXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBjbGVhclRpbWVvdXQgQHRpbWVyXG4gICAgICAgIGNhbGxiYWNrcy5zdWNjZXNzPygpXG5cbiAgZ2V0UmVzdWx0Q291bnQ6ID0+XG4gICAgJC5hamF4IFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3KFwibG9jYWxcIiwgXCJyZXN1bHRDb3VudFwiKVxuICAgICAgdHlwZTogXCJQT1NUXCJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIGdyb3VwICAgICAgIDogdHJ1ZVxuICAgICAgICBncm91cF9sZXZlbCA6IDFcbiAgICAgICAga2V5ICAgICAgICAgOiBAaWRcbiAgICAgIClcbiAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICBAcmVzdWx0Q291bnQgPSBpZiBkYXRhLnJvd3MubGVuZ3RoICE9IDAgdGhlbiBkYXRhLnJvd3NbMF0udmFsdWUgZWxzZSAwXG4gICAgICAgIEB0cmlnZ2VyIFwicmVzdWx0Q291bnRcIlxuXG5cbiAgIyBIaWphY2tlZCBzdWNjZXNzKCkgZm9yIGxhdGVyXG4gICMgZmV0Y2hzIGFsbCBzdWJ0ZXN0cyBmb3IgdGhlIGFzc2Vzc21lbnRcbiAgZmV0Y2g6IChvcHRpb25zKSA9PlxuICAgIG9sZFN1Y2Nlc3MgPSBvcHRpb25zLnN1Y2Nlc3NcbiAgICBvcHRpb25zLnN1Y2Nlc3MgPSAobW9kZWwpID0+XG4gICAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgICAga2V5OiBcInNcIiArIEBpZFxuICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSA9PlxuICAgICAgICAgICAgQHN1YnRlc3RzID0gY29sbGVjdGlvblxuICAgICAgICAgICAgQHN1YnRlc3RzLmVuc3VyZU9yZGVyKClcbiAgICAgICAgICAgIG9sZFN1Y2Nlc3M/IEBcblxuICAgIEFzc2Vzc21lbnQuX19zdXBlcl9fLmZldGNoLmNhbGwgQCwgb3B0aW9uc1xuXG4gIHNwbGl0REtleXM6ICggZEtleSA9IFwiXCIgKSAtPlxuICAgICMgc3BsaXQgdG8gaGFuZGxlIG11bHRpcGxlIGRrZXlzXG4gICAgZEtleS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1tnLXpdL2csJycpLnJlcGxhY2UoL1teYS1mMC05XS9nLFwiIFwiKS5zcGxpdCgvXFxzKy8pXG5cbiAgdXBkYXRlRnJvbVNlcnZlcjogKCBkS2V5ID0gQGNhbGNES2V5KCksIGdyb3VwICkgPT5cblxuICAgIEBsYXN0REtleSA9IGRLZXlcblxuICAgIGRLZXlzID0gQHNwbGl0REtleXMoZEtleSlcblxuICAgIEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGxvb2t1cFwiXG5cbiAgICBzb3VyY2VEQiA9IFwiZ3JvdXAtXCIgKyBncm91cFxuICAgIHRhcmdldERCID0gVGFuZ2VyaW5lLnNldHRpbmdzLmdyb3VwREJcblxuICAgIGxvY2FsREtleSA9IFRhbmdlcmluZS5zZXR0aW5ncy5sb2NhdGlvbi5ncm91cC5kYitUYW5nZXJpbmUuc2V0dGluZ3MuY291Y2gudmlldyArIFwiYnlES2V5XCJcblxuICAgIHNvdXJjZURLZXkgPSBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiZ3JvdXBIb3N0XCIpICsgXCIvXCIrc291cmNlREIrXCIvXCIrVGFuZ2VyaW5lLnNldHRpbmdzLmNvdWNoLnZpZXcgKyBcImJ5REtleVwiXG5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogc291cmNlREtleSxcbiAgICAgIHR5cGU6IFwiR0VUXCJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgZGF0YToga2V5czogSlNPTi5zdHJpbmdpZnkoZEtleXMpXG4gICAgICBlcnJvcjogKGEsIGIpID0+IEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGVycm9yXCIsIFwiI3thfSAje2J9XCJcbiAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICBkb2NMaXN0ID0gW11cbiAgICAgICAgZm9yIGRhdHVtIGluIGRhdGEucm93c1xuICAgICAgICAgIGRvY0xpc3QucHVzaCBkYXR1bS5pZFxuXG4gICAgICAgICQuYWpheFxuICAgICAgICAgIHVybDogbG9jYWxES2V5LFxuICAgICAgICAgIHR5cGU6IFwiUE9TVFwiXG4gICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoa2V5czpkS2V5cylcbiAgICAgICAgICBlcnJvcjogKGEsIGIpID0+IEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGVycm9yXCIsIFwiI3thfSAje2J9XCJcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT5cbiAgICAgICAgICAgIGZvciBkYXR1bSBpbiBkYXRhLnJvd3NcbiAgICAgICAgICAgICAgZG9jTGlzdC5wdXNoIGRhdHVtLmlkXG5cbiAgICAgICAgICAgIGRvY0xpc3QgPSBfLnVuaXEoZG9jTGlzdClcblxuICAgICAgICAgICAgJC5jb3VjaC5yZXBsaWNhdGUoXG4gICAgICAgICAgICAgIHNvdXJjZURCLFxuICAgICAgICAgICAgICB0YXJnZXREQixcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpPT5cbiAgICAgICAgICAgICAgICAgIEBjaGVja0NvbmZsaWN0cyBkb2NMaXN0XG4gICAgICAgICAgICAgICAgICBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBzdWNjZXNzXCIsIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgZXJyb3I6IChhLCBiKSAgICAgID0+IEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGVycm9yXCIsIFwiI3thfSAje2J9XCJcbiAgICAgICAgICAgICAgLFxuICAgICAgICAgICAgICAgIGRvY19pZHM6IGRvY0xpc3RcbiAgICAgICAgICAgIClcblxuICAgIGZhbHNlXG5cbiAgIyB0aGlzIGlzIHByZXR0eSBzdHJhbmdlLCBidXQgaXQgYmFzaWNhbGx5IHVuZGVsZXRlcywgdHJpZXMgdG8gcmVwbGljYXRlIGFnYWluLCBhbmQgdGhlbiBkZWxldGVzIHRoZSBjb25mbGljdGluZyAobG9jYWwpIHZlcnNpb24gYXMgbWFya2VkIGJ5IHRoZSBmaXJzdCB0aW1lIGFyb3VuZC5cbiAgY2hlY2tDb25mbGljdHM6IChkb2NMaXN0PVtdLCBvcHRpb25zPXt9KSA9PlxuXG4gICAgQGRvY3MgPSB7fSB1bmxlc3MgZG9jcz9cblxuICAgIGZvciBkb2MgaW4gZG9jTGlzdFxuICAgICAgZG8gKGRvYykgPT5cbiAgICAgICAgVGFuZ2VyaW5lLiRkYi5vcGVuRG9jIGRvYyxcbiAgICAgICAgICBvcGVuX3JldnMgOiBcImFsbFwiXG4gICAgICAgICAgY29uZmxpY3RzIDogdHJ1ZVxuICAgICAgICAgIGVycm9yOiAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgXCJlcnJvciB3aXRoICN7ZG9jfVwiXG4gICAgICAgICAgc3VjY2VzczogKGRvYykgPT5cbiAgICAgICAgICAgIGlmIGRvYy5sZW5ndGggPT0gMVxuICAgICAgICAgICAgICBkb2MgPSBkb2NbMF0ub2sgIyBjb3VjaCBpcyB3ZWlyZFxuICAgICAgICAgICAgICBpZiBkb2MuZGVsZXRlZEF0ID09IFwibW9iaWxlXCJcbiAgICAgICAgICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgICAgICAgIHR5cGU6IFwiUFVUXCJcbiAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9sb2NhbGhvc3Q6NTk4NC9cIitUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoXCJsb2NhbFwiKSArIFwiL1wiICtkb2MuX2lkXG4gICAgICAgICAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgICAgICAgICAgICAgXCJfcmV2XCIgICAgICA6IGRvYy5fcmV2XG4gICAgICAgICAgICAgICAgICAgIFwiZGVsZXRlZEF0XCIgOiBkb2MuZGVsZXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIFwiX2RlbGV0ZWRcIiAgOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgZXJyb3I6ID0+XG4gICAgICAgICAgICAgICAgICAgICNjb25zb2xlLmxvZyBcInNhdmUgbmV3IGRvYyBlcnJvclwiXG4gICAgICAgICAgICAgICAgICBjb21wbGV0ZTogPT5cbiAgICAgICAgICAgICAgICAgICAgQGRvY3MuY2hlY2tlZCA9IDAgdW5sZXNzIEBkb2NzLmNoZWNrZWQ/XG4gICAgICAgICAgICAgICAgICAgIEBkb2NzLmNoZWNrZWQrK1xuICAgICAgICAgICAgICAgICAgICBpZiBAZG9jcy5jaGVja2VkID09IGRvY0xpc3QubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgQGRvY3MuY2hlY2tlZCA9IDBcbiAgICAgICAgICAgICAgICAgICAgICBpZiBub3QgXy5pc0VtcHR5IEBsYXN0REtleVxuICAgICAgICAgICAgICAgICAgICAgICAgQHVwZGF0ZUZyb21TZXJ2ZXIgQGxhc3RES2V5XG4gICAgICAgICAgICAgICAgICAgICAgICBAbGFzdERLZXkgPSBcIlwiXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIGRvY3MgPSBkb2NcbiAgICAgICAgICAgICAgZm9yIGRvYyBpbiBkb2NzXG4gICAgICAgICAgICAgICAgZG9jID0gZG9jLm9rXG4gICAgICAgICAgICAgICAgZG8gKGRvYywgZG9jcykgPT5cbiAgICAgICAgICAgICAgICAgIGlmIGRvYy5kZWxldGVkQXQgPT0gXCJtb2JpbGVcIlxuICAgICAgICAgICAgICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIlBVVFwiXG4gICAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9sb2NhbGhvc3Q6NTk4NC9cIitUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoXCJsb2NhbFwiKSArIFwiL1wiICtkb2MuX2lkXG4gICAgICAgICAgICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIl9yZXZcIiAgICAgIDogZG9jLl9yZXZcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiX2RlbGV0ZWRcIiAgOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgI2NvbnNvbGUubG9nIFwiQ291bGQgbm90IGRlbGV0ZSBjb25mbGljdGluZyB2ZXJzaW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIEBkb2NzLmNoZWNrZWQgPSAwIHVubGVzcyBAZG9jcy5jaGVja2VkP1xuICAgICAgICAgICAgICAgICAgICAgICAgQGRvY3MuY2hlY2tlZCsrXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBAZG9jcy5jaGVja2VkID09IGRvY0xpc3QubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIEBkb2NzLmNoZWNrZWQgPSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCBfLmlzRW1wdHkgQGxhc3RES2V5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQHVwZGF0ZUZyb21TZXJ2ZXIgQGxhc3RES2V5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGxhc3RES2V5ID0gXCJcIlxuXG4gIHVwZGF0ZUZyb21JcmlzQ291Y2g6ICggZEtleSA9IEBjYWxjREtleSgpICkgPT5cblxuICAgICMgc3BsaXQgdG8gaGFuZGxlIG11bHRpcGxlIGRrZXlzXG4gICAgZEtleXMgPSBkS2V5LnJlcGxhY2UoL1teYS1mMC05XS9nLFwiIFwiKS5zcGxpdCgvXFxzKy8pXG5cbiAgICBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBsb29rdXBcIlxuICAgICQuYWpheFxuICAgICAgdXJsOiBcImh0dHA6Ly90YW5nZXJpbmUuaXJpc2NvdWNoLmNvbS90YW5nZXJpbmUvX2Rlc2lnbi9vamFpL192aWV3L2J5REtleVwiXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgdHlwZTogXCJHRVRcIlxuICAgICAgZGF0YTpcbiAgICAgICAga2V5cyA6IEpTT04uc3RyaW5naWZ5KGRLZXlzKVxuICAgICAgc3VjY2VzczogKGRhdGEpID0+XG4gICAgICAgIGRvY0xpc3QgPSBbXVxuICAgICAgICBmb3IgZGF0dW0gaW4gZGF0YS5yb3dzXG4gICAgICAgICAgZG9jTGlzdC5wdXNoIGRhdHVtLmlkXG4gICAgICAgICQuY291Y2gucmVwbGljYXRlKFxuICAgICAgICAgIFwiaHR0cDovL3RhbmdlcmluZS5pcmlzY291Y2guY29tL3RhbmdlcmluZVwiLFxuICAgICAgICAgIFRhbmdlcmluZS5zZXR0aW5ncy5ncm91cERCLFxuICAgICAgICAgICAgc3VjY2VzczoocmVzcG9uc2UpID0+IEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IHN1Y2Nlc3NcIiwgcmVzcG9uc2VcbiAgICAgICAgICAgIGVycm9yOiAoYSwgYikgICAgICA9PiBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBlcnJvclwiLCBcIiN7YX0gI3tifVwiXG4gICAgICAgICAgLFxuICAgICAgICAgICAgZG9jX2lkczogZG9jTGlzdFxuICAgICAgICApXG5cbiAgICBmYWxzZVxuXG5cbiAgIyBGZXRjaGVzIGFsbCBhc3Nlc3NtZW50IHJlbGF0ZWQgZG9jdW1lbnRzLCBwdXRzIHRoZW0gdG9nZXRoZXIgaW4gYSBkb2N1bWVudFxuICAjIGFycmF5IGZvciB1cGxvYWRpbmcgdG8gYnVsa2RvY3MuXG4gIGR1cGxpY2F0ZTogLT5cblxuICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnNcbiAgICBzdWJ0ZXN0cyAgPSBuZXcgU3VidGVzdHNcblxuICAgIG1vZGVsc1RvU2F2ZSA9IFtdXG5cbiAgICBvbGRNb2RlbCA9IEBcblxuICAgICMgZ2VuZXJhbCBwYXR0ZXJuOiBjbG9uZSBhdHRyaWJ1dGVzLCBtb2RpZnkgdGhlbSwgc3RhbXAgdGhlbSwgcHV0IGF0dHJpYnV0ZXMgaW4gYXJyYXlcblxuICAgICQuZXh0ZW5kKHRydWUsIGNsb25lZEF0dHJpYnV0ZXMgPSB7fSwgQGF0dHJpYnV0ZXMpXG5cbiAgICBuZXdJZCA9IFV0aWxzLmd1aWQoKVxuXG4gICAgY2xvbmVkQXR0cmlidXRlcy5faWQgICAgICAgICAgPSBuZXdJZFxuICAgIGNsb25lZEF0dHJpYnV0ZXMubmFtZSAgICAgICAgID0gXCJDb3B5IG9mICN7Y2xvbmVkQXR0cmlidXRlcy5uYW1lfVwiXG4gICAgY2xvbmVkQXR0cmlidXRlcy5hc3Nlc3NtZW50SWQgPSBuZXdJZFxuXG4gICAgbmV3TW9kZWwgPSBuZXcgQXNzZXNzbWVudChjbG9uZWRBdHRyaWJ1dGVzKVxuXG4gICAgbW9kZWxzVG9TYXZlLnB1c2ggKG5ld01vZGVsKS5zdGFtcCgpLmF0dHJpYnV0ZXNcblxuXG4gICAgZ2V0UXVlc3Rpb25zID0gLT5cbiAgICAgIHF1ZXN0aW9ucy5mZXRjaFxuICAgICAgICBrZXk6IFwicVwiICsgb2xkTW9kZWwuaWRcbiAgICAgICAgc3VjY2VzczogLT4gZ2V0U3VidGVzdHMoKVxuXG4gICAgZ2V0U3VidGVzdHMgPSAtPlxuICAgICAgc3VidGVzdHMuZmV0Y2hcbiAgICAgICAga2V5OiBcInNcIiArIG9sZE1vZGVsLmlkXG4gICAgICAgIHN1Y2Nlc3M6IC0+IHByb2Nlc3NEb2NzKClcblxuICAgIHByb2Nlc3NEb2NzID0gLT5cblxuICAgICAgc3VidGVzdElkTWFwID0ge31cblxuICAgICAgIyBsaW5rIG5ldyBzdWJ0ZXN0cyB0byBuZXcgYXNzZXNzbWVudFxuICAgICAgZm9yIHN1YnRlc3QgaW4gc3VidGVzdHMubW9kZWxzXG5cbiAgICAgICAgb2xkU3VidGVzdElkID0gc3VidGVzdC5pZFxuICAgICAgICBuZXdTdWJ0ZXN0SWQgPSBVdGlscy5ndWlkKClcblxuICAgICAgICBzdWJ0ZXN0SWRNYXBbb2xkU3VidGVzdElkXSA9IG5ld1N1YnRlc3RJZFxuXG4gICAgICAgICQuZXh0ZW5kKHRydWUsIG5ld0F0dHJpYnV0ZXMgPSB7fSwgc3VidGVzdC5hdHRyaWJ1dGVzKVxuXG4gICAgICAgIG5ld0F0dHJpYnV0ZXMuX2lkICAgICAgICAgID0gbmV3U3VidGVzdElkXG4gICAgICAgIG5ld0F0dHJpYnV0ZXMuYXNzZXNzbWVudElkID0gbmV3SWRcblxuICAgICAgICBtb2RlbHNUb1NhdmUucHVzaCAobmV3IFN1YnRlc3QobmV3QXR0cmlidXRlcykpLnN0YW1wKCkuYXR0cmlidXRlc1xuXG4gICAgICAjIHVwZGF0ZSB0aGUgbGlua3MgdG8gb3RoZXIgc3VidGVzdHNcbiAgICAgIGZvciBzdWJ0ZXN0IGluIG1vZGVsc1RvU2F2ZVxuICAgICAgICBpZiBzdWJ0ZXN0LmdyaWRMaW5rSWQ/IGFuZCBzdWJ0ZXN0LmdyaWRMaW5rSWQgIT0gXCJcIlxuICAgICAgICAgIHN1YnRlc3QuZ3JpZExpbmtJZCA9IHN1YnRlc3RJZE1hcFtzdWJ0ZXN0LmdyaWRMaW5rSWRdXG5cbiAgICAgICMgbGluayBxdWVzdGlvbnMgdG8gbmV3IHN1YnRlc3RzXG4gICAgICBmb3IgcXVlc3Rpb24gaW4gcXVlc3Rpb25zLm1vZGVsc1xuXG4gICAgICAgICQuZXh0ZW5kKHRydWUsIG5ld0F0dHJpYnV0ZXMgPSB7fSwgcXVlc3Rpb24uYXR0cmlidXRlcylcblxuICAgICAgICBvbGRTdWJ0ZXN0SWQgPSBuZXdBdHRyaWJ1dGVzLnN1YnRlc3RJZFxuXG4gICAgICAgIG5ld0F0dHJpYnV0ZXMuX2lkICAgICAgICAgID0gVXRpbHMuZ3VpZCgpXG4gICAgICAgIG5ld0F0dHJpYnV0ZXMuc3VidGVzdElkICAgID0gc3VidGVzdElkTWFwW29sZFN1YnRlc3RJZF1cbiAgICAgICAgbmV3QXR0cmlidXRlcy5hc3Nlc3NtZW50SWQgPSBuZXdJZFxuXG4gICAgICAgIG1vZGVsc1RvU2F2ZS5wdXNoIChuZXcgUXVlc3Rpb24obmV3QXR0cmlidXRlcykpLnN0YW1wKCkuYXR0cmlidXRlc1xuXG4gICAgICByZXF1ZXN0RGF0YSA9IFwiZG9jc1wiIDogbW9kZWxzVG9TYXZlXG5cbiAgICAgICQuYWpheFxuICAgICAgICB0eXBlIDogXCJQT1NUXCJcbiAgICAgICAgY29udGVudFR5cGUgOiBcImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9VVRGLThcIlxuICAgICAgICBkYXRhVHlwZSA6IFwianNvblwiXG4gICAgICAgIHVybCA6IFRhbmdlcmluZS5zZXR0aW5ncy51cmxCdWxrRG9jcygpXG4gICAgICAgIGRhdGEgOiBKU09OLnN0cmluZ2lmeShyZXF1ZXN0RGF0YSlcbiAgICAgICAgc3VjY2VzcyA6IChyZXNwb25zZXMpID0+IG9sZE1vZGVsLnRyaWdnZXIgXCJuZXdcIiwgbmV3TW9kZWxcbiAgICAgICAgZXJyb3IgOiAtPiBVdGlscy5taWRBbGVydCBcIkR1cGxpY2F0aW9uIGVycm9yXCJcblxuICAgICMga2ljayBpdCBvZmZcbiAgICBnZXRRdWVzdGlvbnMoKVxuXG5cblxuICBkZXN0cm95OiA9PlxuXG4gICAgIyBnZXQgYWxsIGRvY3MgdGhhdCBiZWxvbmcgdG8gdGhpcyBhc3Nlc3NzbWVudCBleGNlcHQgcmVzdWx0c1xuICAgICQuYWpheFxuICAgICAgdHlwZTogXCJQT1NUXCJcbiAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9VVRGLThcIlxuICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICB1cmw6IFwiL2RiLyN7VGFuZ2VyaW5lLmRiX25hbWV9L19kZXNpZ24vI3tUYW5nZXJpbmUuZGVzaWduX2RvY30vX3ZpZXcvYnlQYXJlbnRJZFwiXG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh7IGtleXMgOiBbXCJzI3tAaWR9XCIsXCJxI3tAaWR9XCIsXCJhI3tAaWR9XCJdIH0pXG4gICAgICBlcnJvcjogKHhociwgc3RhdHVzLCBlcnIpIC0+XG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiRGVsZXRlIGVycm9yOiAwMVwiO1xuICAgICAgICBUYW5nZXJpbmUubG9nLmRiKFwiYXNzZXNzbWVudC1kZWxldGUtZXJyb3ItMDFcIixcIkVycm9yOiAje2Vycn0sIFN0YXR1czogI3tzdGF0dXN9LCB4aHI6I3t4aHIucmVzcG9uc2VUZXh0fHwnbm9uZSd9LiBoZWFkZXJzOiAje3hoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKX1cIilcbiAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgPT5cblxuICAgICAgICByZXF1ZXN0RGF0YSA9XG4gICAgICAgICAgZG9jcyA6IHJlc3BvbnNlLnJvd3MubWFwIChyb3cpIC0+XG4gICAgICAgICAgICBcIl9pZFwiICA6IHJvdy5pZFxuICAgICAgICAgICAgXCJfcmV2XCIgOiByb3cudmFsdWUuclxuICAgICAgICAgICAgXCJfZGVsZXRlZFwiIDogdHJ1ZVxuXG4gICAgICAgICQuYWpheFxuICAgICAgICAgIHR5cGU6IFwiUE9TVFwiXG4gICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD1VVEYtOFwiXG4gICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICAgICAgdXJsOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsQnVsa0RvY3MoKVxuICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHJlcXVlc3REYXRhKVxuICAgICAgICAgIGVycm9yOiAtPiBVdGlscy5taWRBbGVydCBcIkRlbGV0ZSBlcnJvcjogMDJcIjsgVGFuZ2VyaW5lLmxvZy5kYihcImFzc2Vzc21lbnQtZGVsZXRlLWVycm9yLTAyXCIsSlNPTi5zdHJpbmdpZnkoYXJndW1lbnRzKSlcbiAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2VzKSA9PlxuICAgICAgICAgICAgb2tDb3VudCA9IDBcbiAgICAgICAgICAgIChva0NvdW50KysgaWYgcmVzcC5vaz8pIGZvciByZXNwIGluIHJlc3BvbnNlc1xuICAgICAgICAgICAgaWYgb2tDb3VudCA9PSByZXNwb25zZXMubGVuZ3RoXG4gICAgICAgICAgICAgIEBjb2xsZWN0aW9uLnJlbW92ZSBAaWRcbiAgICAgICAgICAgICAgQGNsZWFyKClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJEZWxldGUgZXJyb3I6IDAzXCI7IFRhbmdlcmluZS5sb2cuZGIoXCJhc3Nlc3NtZW50LWRlbGV0ZS1lcnJvci0wM1wiLEpTT04uc3RyaW5naWZ5KGFyZ3VtZW50cykpXG5cbiAgaXNBY3RpdmU6IC0+IHJldHVybiBub3QgQGlzQXJjaGl2ZWQoKVxuXG4gIGlzQXJjaGl2ZWQ6IC0+XG4gICAgYXJjaGl2ZWQgPSBAZ2V0KFwiYXJjaGl2ZWRcIilcbiAgICByZXR1cm4gYXJjaGl2ZWQgPT0gXCJ0cnVlXCIgb3IgYXJjaGl2ZWQgPT0gdHJ1ZVxuXG4iXX0=
