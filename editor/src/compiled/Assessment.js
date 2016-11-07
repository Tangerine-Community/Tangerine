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
          key: _this.id,
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
        key: oldModel.id,
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2Vzc21lbnQvQXNzZXNzbWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxVQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7Ozs7O3VCQUVKLEdBQUEsR0FBSzs7dUJBRUwsY0FBQSxHQUFpQixFQUFBLEdBQUs7O3VCQUV0QixVQUFBLEdBQVksU0FBRSxPQUFGOztNQUFFLFVBQVE7O1dBR3BCLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSTtFQUhOOzt1QkFNWixRQUFBLEdBQVUsU0FBQTtXQUFHLElBQUMsQ0FBQSxFQUFFLENBQUMsTUFBSixDQUFXLENBQUMsQ0FBWixFQUFlLENBQWY7RUFBSDs7dUJBR1YsZ0JBQUEsR0FBa0IsU0FBRSxTQUFGOztNQUFFLFlBQVk7O0lBQzlCLE9BQU8sQ0FBQyxHQUFSLENBQVksUUFBWjtJQUNBLElBQXlELHVCQUF6RDtNQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsVUFBQSxDQUFXLFNBQVMsQ0FBQyxLQUFyQixFQUE0QixJQUFDLENBQUEsY0FBN0IsRUFBVDs7V0FDQSxDQUFDLENBQUMsSUFBRixDQUNFO01BQUEsR0FBQSxFQUFLLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBbkIsQ0FBMkIsT0FBM0IsRUFBb0MsUUFBcEMsQ0FBTDtNQUNBLFFBQUEsRUFBVSxPQURWO01BRUEsSUFBQSxFQUFNO1FBQUEsSUFBQSxFQUFNLENBQUMsVUFBRCxDQUFOO09BRk47TUFHQSxPQUFBLEVBQVMsSUFBQyxDQUFBLGNBSFY7TUFJQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ1AsWUFBQSxDQUFhLEtBQUMsQ0FBQSxLQUFkOzJEQUNBLFNBQVMsQ0FBQztRQUZIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUpUO0tBREY7RUFIZ0I7O3VCQVlsQixjQUFBLEdBQWdCLFNBQUE7V0FDZCxDQUFDLENBQUMsSUFBRixDQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBbkIsQ0FBMkIsT0FBM0IsRUFBb0MsYUFBcEMsQ0FBQSxDQUNMO01BQUEsSUFBQSxFQUFNLE1BQU47TUFDQSxRQUFBLEVBQVUsTUFEVjtNQUVBLElBQUEsRUFBTSxJQUFJLENBQUMsU0FBTCxDQUNKO1FBQUEsS0FBQSxFQUFjLElBQWQ7UUFDQSxXQUFBLEVBQWMsQ0FEZDtRQUVBLEdBQUEsRUFBYyxJQUFDLENBQUEsRUFGZjtPQURJLENBRk47TUFPQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7VUFDUCxLQUFDLENBQUEsV0FBRCxHQUFrQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQVYsS0FBb0IsQ0FBdkIsR0FBOEIsSUFBSSxDQUFDLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUEzQyxHQUFzRDtpQkFDckUsS0FBQyxDQUFBLE9BQUQsQ0FBUyxhQUFUO1FBRk87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBUFQ7S0FESyxDQUFQO0VBRGM7O3VCQWdCaEIsS0FBQSxHQUFPLFNBQUMsT0FBRDtBQUNMLFFBQUE7SUFBQSxVQUFBLEdBQWEsT0FBTyxDQUFDO0lBQ3JCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxLQUFEO0FBQ2QsWUFBQTtRQUFBLFdBQUEsR0FBYyxJQUFJO2VBQ2xCLFdBQVcsQ0FBQyxLQUFaLENBQ0U7VUFBQSxHQUFBLEVBQUssS0FBQyxDQUFBLEVBQU47VUFDQSxPQUFBLEVBQVMsU0FBQyxVQUFEO1lBQ1AsS0FBQyxDQUFBLFFBQUQsR0FBWTtZQUNaLEtBQUMsQ0FBQSxRQUFRLENBQUMsV0FBVixDQUFBO3NEQUNBLFdBQVk7VUFITCxDQURUO1NBREY7TUFGYztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7V0FTbEIsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBM0IsQ0FBZ0MsSUFBaEMsRUFBbUMsT0FBbkM7RUFYSzs7dUJBYVAsVUFBQSxHQUFZLFNBQUUsSUFBRjs7TUFBRSxPQUFPOztXQUVuQixJQUFJLENBQUMsV0FBTCxDQUFBLENBQWtCLENBQUMsT0FBbkIsQ0FBMkIsUUFBM0IsRUFBb0MsRUFBcEMsQ0FBdUMsQ0FBQyxPQUF4QyxDQUFnRCxZQUFoRCxFQUE2RCxHQUE3RCxDQUFpRSxDQUFDLEtBQWxFLENBQXdFLEtBQXhFO0VBRlU7O3VCQUlaLGdCQUFBLEdBQWtCLFNBQUUsSUFBRixFQUFzQixLQUF0QjtBQUVoQixRQUFBOztNQUZrQixPQUFPLElBQUMsQ0FBQSxRQUFELENBQUE7O0lBRXpCLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFFWixLQUFBLEdBQVEsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFaO0lBRVIsSUFBQyxDQUFBLE9BQUQsQ0FBUyxRQUFULEVBQW1CLGVBQW5CO0lBRUEsUUFBQSxHQUFXLFFBQUEsR0FBVztJQUN0QixRQUFBLEdBQVcsU0FBUyxDQUFDLFFBQVEsQ0FBQztJQUU5QixTQUFBLEdBQVksU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQWxDLEdBQXFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQTlELEdBQXFFO0lBRWpGLFVBQUEsR0FBYSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQW5CLENBQXVCLFdBQXZCLENBQUEsR0FBc0MsTUFBdEMsR0FBNkMsUUFBN0MsR0FBc0QsR0FBdEQsR0FBMEQsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBbkYsR0FBMEY7SUFFdkcsQ0FBQyxDQUFDLElBQUYsQ0FDRTtNQUFBLEdBQUEsRUFBSyxVQUFMO01BQ0EsSUFBQSxFQUFNLEtBRE47TUFFQSxRQUFBLEVBQVUsTUFGVjtNQUdBLElBQUEsRUFBTTtRQUFBLElBQUEsRUFBTSxJQUFJLENBQUMsU0FBTCxDQUFlLEtBQWYsQ0FBTjtPQUhOO01BSUEsS0FBQSxFQUFPLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFELEVBQUksQ0FBSjtpQkFBVSxLQUFDLENBQUEsT0FBRCxDQUFTLFFBQVQsRUFBbUIsY0FBbkIsRUFBc0MsQ0FBRCxHQUFHLEdBQUgsR0FBTSxDQUEzQztRQUFWO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUpQO01BS0EsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO0FBQ1AsY0FBQTtVQUFBLE9BQUEsR0FBVTtBQUNWO0FBQUEsZUFBQSxxQ0FBQTs7WUFDRSxPQUFPLENBQUMsSUFBUixDQUFhLEtBQUssQ0FBQyxFQUFuQjtBQURGO2lCQUdBLENBQUMsQ0FBQyxJQUFGLENBQ0U7WUFBQSxHQUFBLEVBQUssU0FBTDtZQUNBLElBQUEsRUFBTSxNQUROO1lBRUEsV0FBQSxFQUFhLGtCQUZiO1lBR0EsUUFBQSxFQUFVLE1BSFY7WUFJQSxJQUFBLEVBQU0sSUFBSSxDQUFDLFNBQUwsQ0FBZTtjQUFBLElBQUEsRUFBSyxLQUFMO2FBQWYsQ0FKTjtZQUtBLEtBQUEsRUFBTyxTQUFDLENBQUQsRUFBSSxDQUFKO3FCQUFVLEtBQUMsQ0FBQSxPQUFELENBQVMsUUFBVCxFQUFtQixjQUFuQixFQUFzQyxDQUFELEdBQUcsR0FBSCxHQUFNLENBQTNDO1lBQVYsQ0FMUDtZQU1BLE9BQUEsRUFBUyxTQUFDLElBQUQ7QUFDUCxrQkFBQTtBQUFBO0FBQUEsbUJBQUEsd0NBQUE7O2dCQUNFLE9BQU8sQ0FBQyxJQUFSLENBQWEsS0FBSyxDQUFDLEVBQW5CO0FBREY7Y0FHQSxPQUFBLEdBQVUsQ0FBQyxDQUFDLElBQUYsQ0FBTyxPQUFQO3FCQUVWLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUixDQUNFLFFBREYsRUFFRSxRQUZGLEVBR0k7Z0JBQUEsT0FBQSxFQUFTLFNBQUMsUUFBRDtrQkFDUCxLQUFDLENBQUEsY0FBRCxDQUFnQixPQUFoQjt5QkFDQSxLQUFDLENBQUEsT0FBRCxDQUFTLFFBQVQsRUFBbUIsZ0JBQW5CLEVBQXFDLFFBQXJDO2dCQUZPLENBQVQ7Z0JBR0EsS0FBQSxFQUFPLFNBQUMsQ0FBRCxFQUFJLENBQUo7eUJBQWUsS0FBQyxDQUFBLE9BQUQsQ0FBUyxRQUFULEVBQW1CLGNBQW5CLEVBQXNDLENBQUQsR0FBRyxHQUFILEdBQU0sQ0FBM0M7Z0JBQWYsQ0FIUDtlQUhKLEVBUUk7Z0JBQUEsT0FBQSxFQUFTLE9BQVQ7ZUFSSjtZQU5PLENBTlQ7V0FERjtRQUxPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUxUO0tBREY7V0FtQ0E7RUFsRGdCOzt1QkFxRGxCLGNBQUEsR0FBZ0IsU0FBQyxPQUFELEVBQWEsT0FBYjtBQUVkLFFBQUE7O01BRmUsVUFBUTs7O01BQUksVUFBUTs7SUFFbkMsSUFBa0IsNENBQWxCO01BQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxHQUFSOztBQUVBO1NBQUEseUNBQUE7O21CQUNLLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO2lCQUNELFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBZCxDQUFzQixHQUF0QixFQUNFO1lBQUEsU0FBQSxFQUFZLEtBQVo7WUFDQSxTQUFBLEVBQVksSUFEWjtZQUVBLEtBQUEsRUFBTyxTQUFBO3FCQUNMLE9BQU8sQ0FBQyxHQUFSLENBQVksYUFBQSxHQUFjLEdBQTFCO1lBREssQ0FGUDtZQUlBLE9BQUEsRUFBUyxTQUFDLEdBQUQ7QUFDUCxrQkFBQTtjQUFBLElBQUcsR0FBRyxDQUFDLE1BQUosS0FBYyxDQUFqQjtnQkFDRSxHQUFBLEdBQU0sR0FBSSxDQUFBLENBQUEsQ0FBRSxDQUFDO2dCQUNiLElBQUcsR0FBRyxDQUFDLFNBQUosS0FBaUIsUUFBcEI7eUJBQ0UsQ0FBQyxDQUFDLElBQUYsQ0FDRTtvQkFBQSxJQUFBLEVBQU0sS0FBTjtvQkFDQSxRQUFBLEVBQVUsTUFEVjtvQkFFQSxHQUFBLEVBQUssd0JBQUEsR0FBeUIsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFuQixDQUF5QixPQUF6QixDQUF6QixHQUE2RCxHQUE3RCxHQUFrRSxHQUFHLENBQUMsR0FGM0U7b0JBR0EsSUFBQSxFQUFNLElBQUksQ0FBQyxTQUFMLENBQ0o7c0JBQUEsTUFBQSxFQUFjLEdBQUcsQ0FBQyxJQUFsQjtzQkFDQSxXQUFBLEVBQWMsR0FBRyxDQUFDLFNBRGxCO3NCQUVBLFVBQUEsRUFBYyxLQUZkO3FCQURJLENBSE47b0JBUUEsS0FBQSxFQUFPLFNBQUEsR0FBQSxDQVJQO29CQVVBLFFBQUEsRUFBVSxTQUFBO3NCQUNSLElBQXlCLDBCQUF6Qjt3QkFBQSxLQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sR0FBZ0IsRUFBaEI7O3NCQUNBLEtBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTjtzQkFDQSxJQUFHLEtBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixLQUFpQixPQUFPLENBQUMsTUFBNUI7d0JBQ0UsS0FBQyxDQUFBLElBQUksQ0FBQyxPQUFOLEdBQWdCO3dCQUNoQixJQUFHLENBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFDLENBQUEsUUFBWCxDQUFQOzBCQUNFLEtBQUMsQ0FBQSxnQkFBRCxDQUFrQixLQUFDLENBQUEsUUFBbkI7aUNBQ0EsS0FBQyxDQUFBLFFBQUQsR0FBWSxHQUZkO3lCQUZGOztvQkFIUSxDQVZWO21CQURGLEVBREY7aUJBRkY7ZUFBQSxNQUFBO2dCQXVCRSxJQUFBLEdBQU87QUFDUDtxQkFBQSx3Q0FBQTs7a0JBQ0UsR0FBQSxHQUFNLEdBQUcsQ0FBQztnQ0FDUCxDQUFBLFNBQUMsR0FBRCxFQUFNLElBQU47b0JBQ0QsSUFBRyxHQUFHLENBQUMsU0FBSixLQUFpQixRQUFwQjs2QkFDRSxDQUFDLENBQUMsSUFBRixDQUNFO3dCQUFBLElBQUEsRUFBTSxLQUFOO3dCQUNBLFFBQUEsRUFBVSxNQURWO3dCQUVBLEdBQUEsRUFBSyx3QkFBQSxHQUF5QixTQUFTLENBQUMsUUFBUSxDQUFDLEtBQW5CLENBQXlCLE9BQXpCLENBQXpCLEdBQTZELEdBQTdELEdBQWtFLEdBQUcsQ0FBQyxHQUYzRTt3QkFHQSxJQUFBLEVBQU0sSUFBSSxDQUFDLFNBQUwsQ0FDSjswQkFBQSxNQUFBLEVBQWMsR0FBRyxDQUFDLElBQWxCOzBCQUNBLFVBQUEsRUFBYyxJQURkO3lCQURJLENBSE47d0JBT0EsS0FBQSxFQUFPLFNBQUEsR0FBQSxDQVBQO3dCQVNBLFFBQUEsRUFBVSxTQUFBOzBCQUNSLElBQXlCLDBCQUF6Qjs0QkFBQSxLQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sR0FBZ0IsRUFBaEI7OzBCQUNBLEtBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTjswQkFDQSxJQUFHLEtBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixLQUFpQixPQUFPLENBQUMsTUFBNUI7NEJBQ0UsS0FBQyxDQUFBLElBQUksQ0FBQyxPQUFOLEdBQWdCOzRCQUNoQixJQUFHLENBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFDLENBQUEsUUFBWCxDQUFQOzhCQUNFLEtBQUMsQ0FBQSxnQkFBRCxDQUFrQixLQUFDLENBQUEsUUFBbkI7cUNBQ0EsS0FBQyxDQUFBLFFBQUQsR0FBWSxHQUZkOzZCQUZGOzt3QkFIUSxDQVRWO3VCQURGLEVBREY7O2tCQURDLENBQUEsQ0FBSCxDQUFJLEdBQUosRUFBUyxJQUFUO0FBRkY7Z0NBeEJGOztZQURPLENBSlQ7V0FERjtRQURDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFILENBQUksR0FBSjtBQURGOztFQUpjOzt1QkEyRGhCLG1CQUFBLEdBQXFCLFNBQUUsSUFBRjtBQUduQixRQUFBOztNQUhxQixPQUFPLElBQUMsQ0FBQSxRQUFELENBQUE7O0lBRzVCLEtBQUEsR0FBUSxJQUFJLENBQUMsT0FBTCxDQUFhLFlBQWIsRUFBMEIsR0FBMUIsQ0FBOEIsQ0FBQyxLQUEvQixDQUFxQyxLQUFyQztJQUVSLElBQUMsQ0FBQSxPQUFELENBQVMsUUFBVCxFQUFtQixlQUFuQjtJQUNBLENBQUMsQ0FBQyxJQUFGLENBQ0U7TUFBQSxHQUFBLEVBQUssb0VBQUw7TUFDQSxRQUFBLEVBQVUsTUFEVjtNQUVBLFdBQUEsRUFBYSxrQkFGYjtNQUdBLElBQUEsRUFBTSxLQUhOO01BSUEsSUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFPLElBQUksQ0FBQyxTQUFMLENBQWUsS0FBZixDQUFQO09BTEY7TUFNQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7QUFDUCxjQUFBO1VBQUEsT0FBQSxHQUFVO0FBQ1Y7QUFBQSxlQUFBLHFDQUFBOztZQUNFLE9BQU8sQ0FBQyxJQUFSLENBQWEsS0FBSyxDQUFDLEVBQW5CO0FBREY7aUJBRUEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFSLENBQ0UsMENBREYsRUFFRSxTQUFTLENBQUMsUUFBUSxDQUFDLE9BRnJCLEVBR0k7WUFBQSxPQUFBLEVBQVEsU0FBQyxRQUFEO3FCQUFjLEtBQUMsQ0FBQSxPQUFELENBQVMsUUFBVCxFQUFtQixnQkFBbkIsRUFBcUMsUUFBckM7WUFBZCxDQUFSO1lBQ0EsS0FBQSxFQUFPLFNBQUMsQ0FBRCxFQUFJLENBQUo7cUJBQWUsS0FBQyxDQUFBLE9BQUQsQ0FBUyxRQUFULEVBQW1CLGNBQW5CLEVBQXNDLENBQUQsR0FBRyxHQUFILEdBQU0sQ0FBM0M7WUFBZixDQURQO1dBSEosRUFNSTtZQUFBLE9BQUEsRUFBUyxPQUFUO1dBTko7UUFKTztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FOVDtLQURGO1dBb0JBO0VBMUJtQjs7dUJBK0JyQixTQUFBLEdBQVcsU0FBQTtBQUVULFFBQUE7SUFBQSxTQUFBLEdBQVksSUFBSTtJQUNoQixRQUFBLEdBQVksSUFBSTtJQUVoQixZQUFBLEdBQWU7SUFFZixRQUFBLEdBQVc7SUFJWCxDQUFDLENBQUMsTUFBRixDQUFTLElBQVQsRUFBZSxnQkFBQSxHQUFtQixFQUFsQyxFQUFzQyxJQUFDLENBQUEsVUFBdkM7SUFFQSxLQUFBLEdBQVEsS0FBSyxDQUFDLElBQU4sQ0FBQTtJQUVSLGdCQUFnQixDQUFDLEdBQWpCLEdBQWdDO0lBQ2hDLGdCQUFnQixDQUFDLElBQWpCLEdBQWdDLFVBQUEsR0FBVyxnQkFBZ0IsQ0FBQztJQUM1RCxnQkFBZ0IsQ0FBQyxZQUFqQixHQUFnQztJQUVoQyxRQUFBLEdBQWUsSUFBQSxVQUFBLENBQVcsZ0JBQVg7SUFFZixZQUFZLENBQUMsSUFBYixDQUFtQixRQUFTLENBQUMsS0FBWCxDQUFBLENBQWtCLENBQUMsVUFBckM7SUFHQSxZQUFBLEdBQWUsU0FBQTthQUNiLFNBQVMsQ0FBQyxLQUFWLENBQ0U7UUFBQSxHQUFBLEVBQUssR0FBQSxHQUFNLFFBQVEsQ0FBQyxFQUFwQjtRQUNBLE9BQUEsRUFBUyxTQUFBO2lCQUFHLFdBQUEsQ0FBQTtRQUFILENBRFQ7T0FERjtJQURhO0lBS2YsV0FBQSxHQUFjLFNBQUE7YUFDWixRQUFRLENBQUMsS0FBVCxDQUNFO1FBQUEsR0FBQSxFQUFLLFFBQVEsQ0FBQyxFQUFkO1FBQ0EsT0FBQSxFQUFTLFNBQUE7aUJBQUcsV0FBQSxDQUFBO1FBQUgsQ0FEVDtPQURGO0lBRFk7SUFLZCxXQUFBLEdBQWMsU0FBQTtBQUVaLFVBQUE7TUFBQSxZQUFBLEdBQWU7QUFHZjtBQUFBLFdBQUEscUNBQUE7O1FBRUUsWUFBQSxHQUFlLE9BQU8sQ0FBQztRQUN2QixZQUFBLEdBQWUsS0FBSyxDQUFDLElBQU4sQ0FBQTtRQUVmLFlBQWEsQ0FBQSxZQUFBLENBQWIsR0FBNkI7UUFFN0IsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQWUsYUFBQSxHQUFnQixFQUEvQixFQUFtQyxPQUFPLENBQUMsVUFBM0M7UUFFQSxhQUFhLENBQUMsR0FBZCxHQUE2QjtRQUM3QixhQUFhLENBQUMsWUFBZCxHQUE2QjtRQUU3QixZQUFZLENBQUMsSUFBYixDQUFrQixDQUFLLElBQUEsT0FBQSxDQUFRLGFBQVIsQ0FBTCxDQUE0QixDQUFDLEtBQTdCLENBQUEsQ0FBb0MsQ0FBQyxVQUF2RDtBQVpGO0FBZUEsV0FBQSxnREFBQTs7UUFDRSxJQUFHLDRCQUFBLElBQXdCLE9BQU8sQ0FBQyxVQUFSLEtBQXNCLEVBQWpEO1VBQ0UsT0FBTyxDQUFDLFVBQVIsR0FBcUIsWUFBYSxDQUFBLE9BQU8sQ0FBQyxVQUFSLEVBRHBDOztBQURGO0FBS0E7QUFBQSxXQUFBLHdDQUFBOztRQUVFLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUFlLGFBQUEsR0FBZ0IsRUFBL0IsRUFBbUMsUUFBUSxDQUFDLFVBQTVDO1FBRUEsWUFBQSxHQUFlLGFBQWEsQ0FBQztRQUU3QixhQUFhLENBQUMsR0FBZCxHQUE2QixLQUFLLENBQUMsSUFBTixDQUFBO1FBQzdCLGFBQWEsQ0FBQyxTQUFkLEdBQTZCLFlBQWEsQ0FBQSxZQUFBO1FBQzFDLGFBQWEsQ0FBQyxZQUFkLEdBQTZCO1FBRTdCLFlBQVksQ0FBQyxJQUFiLENBQWtCLENBQUssSUFBQSxRQUFBLENBQVMsYUFBVCxDQUFMLENBQTZCLENBQUMsS0FBOUIsQ0FBQSxDQUFxQyxDQUFDLFVBQXhEO0FBVkY7TUFZQSxXQUFBLEdBQWM7UUFBQSxNQUFBLEVBQVMsWUFBVDs7YUFFZCxDQUFDLENBQUMsSUFBRixDQUNFO1FBQUEsSUFBQSxFQUFPLE1BQVA7UUFDQSxXQUFBLEVBQWMsaUNBRGQ7UUFFQSxRQUFBLEVBQVcsTUFGWDtRQUdBLEdBQUEsRUFBTSxTQUFTLENBQUMsUUFBUSxDQUFDLFdBQW5CLENBQUEsQ0FITjtRQUlBLElBQUEsRUFBTyxJQUFJLENBQUMsU0FBTCxDQUFlLFdBQWYsQ0FKUDtRQUtBLE9BQUEsRUFBVSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLFNBQUQ7bUJBQWUsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsS0FBakIsRUFBd0IsUUFBeEI7VUFBZjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FMVjtRQU1BLEtBQUEsRUFBUSxTQUFBO2lCQUFHLEtBQUssQ0FBQyxRQUFOLENBQWUsbUJBQWY7UUFBSCxDQU5SO09BREY7SUF2Q1k7V0FpRGQsWUFBQSxDQUFBO0VBbkZTOzt1QkF1RlgsT0FBQSxHQUFTLFNBQUE7V0FHUCxDQUFDLENBQUMsSUFBRixDQUNFO01BQUEsSUFBQSxFQUFNLE1BQU47TUFDQSxXQUFBLEVBQWEsaUNBRGI7TUFFQSxRQUFBLEVBQVUsTUFGVjtNQUdBLEdBQUEsRUFBSyxNQUFBLEdBQU8sU0FBUyxDQUFDLE9BQWpCLEdBQXlCLFdBQXpCLEdBQW9DLFNBQVMsQ0FBQyxVQUE5QyxHQUF5RCxtQkFIOUQ7TUFJQSxJQUFBLEVBQU0sSUFBSSxDQUFDLFNBQUwsQ0FBZTtRQUFFLElBQUEsRUFBTyxDQUFDLEdBQUEsR0FBSSxJQUFDLENBQUEsRUFBTixFQUFXLEdBQUEsR0FBSSxJQUFDLENBQUEsRUFBaEIsRUFBcUIsR0FBQSxHQUFJLElBQUMsQ0FBQSxFQUExQixDQUFUO09BQWYsQ0FKTjtNQUtBLEtBQUEsRUFBTyxTQUFDLEdBQUQsRUFBTSxNQUFOLEVBQWMsR0FBZDtRQUNMLEtBQUssQ0FBQyxRQUFOLENBQWUsa0JBQWY7ZUFDQSxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQWQsQ0FBaUIsNEJBQWpCLEVBQThDLFNBQUEsR0FBVSxHQUFWLEdBQWMsWUFBZCxHQUEwQixNQUExQixHQUFpQyxRQUFqQyxHQUF3QyxDQUFDLEdBQUcsQ0FBQyxZQUFKLElBQWtCLE1BQW5CLENBQXhDLEdBQWtFLGFBQWxFLEdBQThFLENBQUMsR0FBRyxDQUFDLHFCQUFKLENBQUEsQ0FBRCxDQUE1SDtNQUZLLENBTFA7TUFRQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFFBQUQ7QUFFUCxjQUFBO1VBQUEsV0FBQSxHQUNFO1lBQUEsSUFBQSxFQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBZCxDQUFrQixTQUFDLEdBQUQ7cUJBQ3ZCO2dCQUFBLEtBQUEsRUFBUyxHQUFHLENBQUMsRUFBYjtnQkFDQSxNQUFBLEVBQVMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQURuQjtnQkFFQSxVQUFBLEVBQWEsSUFGYjs7WUFEdUIsQ0FBbEIsQ0FBUDs7aUJBS0YsQ0FBQyxDQUFDLElBQUYsQ0FDRTtZQUFBLElBQUEsRUFBTSxNQUFOO1lBQ0EsV0FBQSxFQUFhLGlDQURiO1lBRUEsUUFBQSxFQUFVLE1BRlY7WUFHQSxHQUFBLEVBQUssU0FBUyxDQUFDLFFBQVEsQ0FBQyxXQUFuQixDQUFBLENBSEw7WUFJQSxJQUFBLEVBQU0sSUFBSSxDQUFDLFNBQUwsQ0FBZSxXQUFmLENBSk47WUFLQSxLQUFBLEVBQU8sU0FBQTtjQUFHLEtBQUssQ0FBQyxRQUFOLENBQWUsa0JBQWY7cUJBQW1DLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBZCxDQUFpQiw0QkFBakIsRUFBOEMsSUFBSSxDQUFDLFNBQUwsQ0FBZSxTQUFmLENBQTlDO1lBQXRDLENBTFA7WUFNQSxPQUFBLEVBQVMsU0FBQyxTQUFEO0FBQ1Asa0JBQUE7Y0FBQSxPQUFBLEdBQVU7QUFDVixtQkFBQSwyQ0FBQTs7Z0JBQUMsSUFBYSxlQUFiO2tCQUFBLE9BQUEsR0FBQTs7QUFBRDtjQUNBLElBQUcsT0FBQSxLQUFXLFNBQVMsQ0FBQyxNQUF4QjtnQkFDRSxLQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBbUIsS0FBQyxDQUFBLEVBQXBCO3VCQUNBLEtBQUMsQ0FBQSxLQUFELENBQUEsRUFGRjtlQUFBLE1BQUE7Z0JBSUUsS0FBSyxDQUFDLFFBQU4sQ0FBZSxrQkFBZjt1QkFBbUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFkLENBQWlCLDRCQUFqQixFQUE4QyxJQUFJLENBQUMsU0FBTCxDQUFlLFNBQWYsQ0FBOUMsRUFKckM7O1lBSE8sQ0FOVDtXQURGO1FBUk87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBUlQ7S0FERjtFQUhPOzt1QkFvQ1QsUUFBQSxHQUFVLFNBQUE7QUFBRyxXQUFPLENBQUksSUFBQyxDQUFBLFVBQUQsQ0FBQTtFQUFkOzt1QkFFVixVQUFBLEdBQVksU0FBQTtBQUNWLFFBQUE7SUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLEdBQUQsQ0FBSyxVQUFMO0FBQ1gsV0FBTyxRQUFBLEtBQVksTUFBWixJQUFzQixRQUFBLEtBQVk7RUFGL0I7Ozs7R0F4VVcsUUFBUSxDQUFDIiwiZmlsZSI6ImFzc2Vzc21lbnQvQXNzZXNzbWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEFzc2Vzc21lbnQgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG4gIHVybDogJ2Fzc2Vzc21lbnQnXG5cbiAgVkVSSUZZX1RJTUVPVVQgOiAyMCAqIDEwMDBcblxuICBpbml0aWFsaXplOiAoIG9wdGlvbnM9e30gKSAtPlxuICAgICMgdGhpcyBjb2xsZWN0aW9uIGRvZXNuJ3QgZ2V0IHNhdmVkXG4gICAgIyBjaGFuZ2VzIHVwZGF0ZSB0aGUgc3VidGVzdCB2aWV3LCBpdCBrZWVwcyBvcmRlclxuICAgIEBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICMgQGdldFJlc3VsdENvdW50KClcblxuICBjYWxjREtleTogPT4gQGlkLnN1YnN0cigtNSwgNSlcblxuICAjIHJlZmFjdG9yIHRvIGV2ZW50c1xuICB2ZXJpZnlDb25uZWN0aW9uOiAoIGNhbGxiYWNrcyA9IHt9ICkgPT5cbiAgICBjb25zb2xlLmxvZyBcImNhbGxlZFwiXG4gICAgQHRpbWVyID0gc2V0VGltZW91dChjYWxsYmFja3MuZXJyb3IsIEBWRVJJRllfVElNRU9VVCkgaWYgY2FsbGJhY2tzLmVycm9yP1xuICAgICQuYWpheFxuICAgICAgdXJsOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyhcImdyb3VwXCIsIFwiYnlES2V5XCIpXG4gICAgICBkYXRhVHlwZTogXCJqc29ucFwiXG4gICAgICBkYXRhOiBrZXlzOiBbXCJ0ZXN0dGVzdFwiXVxuICAgICAgdGltZW91dDogQFZFUklGWV9USU1FT1VUXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBjbGVhclRpbWVvdXQgQHRpbWVyXG4gICAgICAgIGNhbGxiYWNrcy5zdWNjZXNzPygpXG5cbiAgZ2V0UmVzdWx0Q291bnQ6ID0+XG4gICAgJC5hamF4IFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3KFwibG9jYWxcIiwgXCJyZXN1bHRDb3VudFwiKVxuICAgICAgdHlwZTogXCJQT1NUXCJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIGdyb3VwICAgICAgIDogdHJ1ZVxuICAgICAgICBncm91cF9sZXZlbCA6IDFcbiAgICAgICAga2V5ICAgICAgICAgOiBAaWRcbiAgICAgIClcbiAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICBAcmVzdWx0Q291bnQgPSBpZiBkYXRhLnJvd3MubGVuZ3RoICE9IDAgdGhlbiBkYXRhLnJvd3NbMF0udmFsdWUgZWxzZSAwXG4gICAgICAgIEB0cmlnZ2VyIFwicmVzdWx0Q291bnRcIlxuXG5cbiAgIyBIaWphY2tlZCBzdWNjZXNzKCkgZm9yIGxhdGVyXG4gICMgZmV0Y2hzIGFsbCBzdWJ0ZXN0cyBmb3IgdGhlIGFzc2Vzc21lbnRcbiAgZmV0Y2g6IChvcHRpb25zKSA9PlxuICAgIG9sZFN1Y2Nlc3MgPSBvcHRpb25zLnN1Y2Nlc3NcbiAgICBvcHRpb25zLnN1Y2Nlc3MgPSAobW9kZWwpID0+XG4gICAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgICAga2V5OiBAaWRcbiAgICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgPT5cbiAgICAgICAgICAgIEBzdWJ0ZXN0cyA9IGNvbGxlY3Rpb25cbiAgICAgICAgICAgIEBzdWJ0ZXN0cy5lbnN1cmVPcmRlcigpXG4gICAgICAgICAgICBvbGRTdWNjZXNzPyBAXG5cbiAgICBBc3Nlc3NtZW50Ll9fc3VwZXJfXy5mZXRjaC5jYWxsIEAsIG9wdGlvbnNcblxuICBzcGxpdERLZXlzOiAoIGRLZXkgPSBcIlwiICkgLT5cbiAgICAjIHNwbGl0IHRvIGhhbmRsZSBtdWx0aXBsZSBka2V5c1xuICAgIGRLZXkudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bZy16XS9nLCcnKS5yZXBsYWNlKC9bXmEtZjAtOV0vZyxcIiBcIikuc3BsaXQoL1xccysvKVxuXG4gIHVwZGF0ZUZyb21TZXJ2ZXI6ICggZEtleSA9IEBjYWxjREtleSgpLCBncm91cCApID0+XG5cbiAgICBAbGFzdERLZXkgPSBkS2V5XG5cbiAgICBkS2V5cyA9IEBzcGxpdERLZXlzKGRLZXkpXG5cbiAgICBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBsb29rdXBcIlxuXG4gICAgc291cmNlREIgPSBcImdyb3VwLVwiICsgZ3JvdXBcbiAgICB0YXJnZXREQiA9IFRhbmdlcmluZS5zZXR0aW5ncy5ncm91cERCXG5cbiAgICBsb2NhbERLZXkgPSBUYW5nZXJpbmUuc2V0dGluZ3MubG9jYXRpb24uZ3JvdXAuZGIrVGFuZ2VyaW5lLnNldHRpbmdzLmNvdWNoLnZpZXcgKyBcImJ5REtleVwiXG5cbiAgICBzb3VyY2VES2V5ID0gVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImdyb3VwSG9zdFwiKSArIFwiL2RiL1wiK3NvdXJjZURCK1wiL1wiK1RhbmdlcmluZS5zZXR0aW5ncy5jb3VjaC52aWV3ICsgXCJieURLZXlcIlxuXG4gICAgJC5hamF4XG4gICAgICB1cmw6IHNvdXJjZURLZXksXG4gICAgICB0eXBlOiBcIkdFVFwiXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgIGRhdGE6IGtleXM6IEpTT04uc3RyaW5naWZ5KGRLZXlzKVxuICAgICAgZXJyb3I6IChhLCBiKSA9PiBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBlcnJvclwiLCBcIiN7YX0gI3tifVwiXG4gICAgICBzdWNjZXNzOiAoZGF0YSkgPT5cbiAgICAgICAgZG9jTGlzdCA9IFtdXG4gICAgICAgIGZvciBkYXR1bSBpbiBkYXRhLnJvd3NcbiAgICAgICAgICBkb2NMaXN0LnB1c2ggZGF0dW0uaWRcblxuICAgICAgICAkLmFqYXhcbiAgICAgICAgICB1cmw6IGxvY2FsREtleSxcbiAgICAgICAgICB0eXBlOiBcIlBPU1RcIlxuICAgICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGtleXM6ZEtleXMpXG4gICAgICAgICAgZXJyb3I6IChhLCBiKSA9PiBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBlcnJvclwiLCBcIiN7YX0gI3tifVwiXG4gICAgICAgICAgc3VjY2VzczogKGRhdGEpID0+XG4gICAgICAgICAgICBmb3IgZGF0dW0gaW4gZGF0YS5yb3dzXG4gICAgICAgICAgICAgIGRvY0xpc3QucHVzaCBkYXR1bS5pZFxuXG4gICAgICAgICAgICBkb2NMaXN0ID0gXy51bmlxKGRvY0xpc3QpXG5cbiAgICAgICAgICAgICQuY291Y2gucmVwbGljYXRlKFxuICAgICAgICAgICAgICBzb3VyY2VEQixcbiAgICAgICAgICAgICAgdGFyZ2V0REIsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKT0+XG4gICAgICAgICAgICAgICAgICBAY2hlY2tDb25mbGljdHMgZG9jTGlzdFxuICAgICAgICAgICAgICAgICAgQHRyaWdnZXIgXCJzdGF0dXNcIiwgXCJpbXBvcnQgc3VjY2Vzc1wiLCByZXNwb25zZVxuICAgICAgICAgICAgICAgIGVycm9yOiAoYSwgYikgICAgICA9PiBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBlcnJvclwiLCBcIiN7YX0gI3tifVwiXG4gICAgICAgICAgICAgICxcbiAgICAgICAgICAgICAgICBkb2NfaWRzOiBkb2NMaXN0XG4gICAgICAgICAgICApXG5cbiAgICBmYWxzZVxuXG4gICMgdGhpcyBpcyBwcmV0dHkgc3RyYW5nZSwgYnV0IGl0IGJhc2ljYWxseSB1bmRlbGV0ZXMsIHRyaWVzIHRvIHJlcGxpY2F0ZSBhZ2FpbiwgYW5kIHRoZW4gZGVsZXRlcyB0aGUgY29uZmxpY3RpbmcgKGxvY2FsKSB2ZXJzaW9uIGFzIG1hcmtlZCBieSB0aGUgZmlyc3QgdGltZSBhcm91bmQuXG4gIGNoZWNrQ29uZmxpY3RzOiAoZG9jTGlzdD1bXSwgb3B0aW9ucz17fSkgPT5cblxuICAgIEBkb2NzID0ge30gdW5sZXNzIGRvY3M/XG5cbiAgICBmb3IgZG9jIGluIGRvY0xpc3RcbiAgICAgIGRvIChkb2MpID0+XG4gICAgICAgIFRhbmdlcmluZS4kZGIub3BlbkRvYyBkb2MsXG4gICAgICAgICAgb3Blbl9yZXZzIDogXCJhbGxcIlxuICAgICAgICAgIGNvbmZsaWN0cyA6IHRydWVcbiAgICAgICAgICBlcnJvcjogLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIFwiZXJyb3Igd2l0aCAje2RvY31cIlxuICAgICAgICAgIHN1Y2Nlc3M6IChkb2MpID0+XG4gICAgICAgICAgICBpZiBkb2MubGVuZ3RoID09IDFcbiAgICAgICAgICAgICAgZG9jID0gZG9jWzBdLm9rICMgY291Y2ggaXMgd2VpcmRcbiAgICAgICAgICAgICAgaWYgZG9jLmRlbGV0ZWRBdCA9PSBcIm1vYmlsZVwiXG4gICAgICAgICAgICAgICAgJC5hamF4XG4gICAgICAgICAgICAgICAgICB0eXBlOiBcIlBVVFwiXG4gICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgICAgICAgICAgICAgIHVybDogXCJodHRwOi8vbG9jYWxob3N0OjU5ODQvXCIrVGFuZ2VyaW5lLnNldHRpbmdzLnVybERCKFwibG9jYWxcIikgKyBcIi9cIiArZG9jLl9pZFxuICAgICAgICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgICAgICAgICAgICAgIFwiX3JldlwiICAgICAgOiBkb2MuX3JldlxuICAgICAgICAgICAgICAgICAgICBcImRlbGV0ZWRBdFwiIDogZG9jLmRlbGV0ZWRBdFxuICAgICAgICAgICAgICAgICAgICBcIl9kZWxldGVkXCIgIDogZmFsc2VcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIGVycm9yOiA9PlxuICAgICAgICAgICAgICAgICAgICAjY29uc29sZS5sb2cgXCJzYXZlIG5ldyBkb2MgZXJyb3JcIlxuICAgICAgICAgICAgICAgICAgY29tcGxldGU6ID0+XG4gICAgICAgICAgICAgICAgICAgIEBkb2NzLmNoZWNrZWQgPSAwIHVubGVzcyBAZG9jcy5jaGVja2VkP1xuICAgICAgICAgICAgICAgICAgICBAZG9jcy5jaGVja2VkKytcbiAgICAgICAgICAgICAgICAgICAgaWYgQGRvY3MuY2hlY2tlZCA9PSBkb2NMaXN0Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgIEBkb2NzLmNoZWNrZWQgPSAwXG4gICAgICAgICAgICAgICAgICAgICAgaWYgbm90IF8uaXNFbXB0eSBAbGFzdERLZXlcbiAgICAgICAgICAgICAgICAgICAgICAgIEB1cGRhdGVGcm9tU2VydmVyIEBsYXN0REtleVxuICAgICAgICAgICAgICAgICAgICAgICAgQGxhc3RES2V5ID0gXCJcIlxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBkb2NzID0gZG9jXG4gICAgICAgICAgICAgIGZvciBkb2MgaW4gZG9jc1xuICAgICAgICAgICAgICAgIGRvYyA9IGRvYy5va1xuICAgICAgICAgICAgICAgIGRvIChkb2MsIGRvY3MpID0+XG4gICAgICAgICAgICAgICAgICBpZiBkb2MuZGVsZXRlZEF0ID09IFwibW9iaWxlXCJcbiAgICAgICAgICAgICAgICAgICAgJC5hamF4XG4gICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJQVVRcIlxuICAgICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgICAgICAgICAgICAgIHVybDogXCJodHRwOi8vbG9jYWxob3N0OjU5ODQvXCIrVGFuZ2VyaW5lLnNldHRpbmdzLnVybERCKFwibG9jYWxcIikgKyBcIi9cIiArZG9jLl9pZFxuICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJfcmV2XCIgICAgICA6IGRvYy5fcmV2XG4gICAgICAgICAgICAgICAgICAgICAgICBcIl9kZWxldGVkXCIgIDogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICNjb25zb2xlLmxvZyBcIkNvdWxkIG5vdCBkZWxldGUgY29uZmxpY3RpbmcgdmVyc2lvblwiXG4gICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6ID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBAZG9jcy5jaGVja2VkID0gMCB1bmxlc3MgQGRvY3MuY2hlY2tlZD9cbiAgICAgICAgICAgICAgICAgICAgICAgIEBkb2NzLmNoZWNrZWQrK1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgQGRvY3MuY2hlY2tlZCA9PSBkb2NMaXN0Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICBAZG9jcy5jaGVja2VkID0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBub3QgXy5pc0VtcHR5IEBsYXN0REtleVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEB1cGRhdGVGcm9tU2VydmVyIEBsYXN0REtleVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBsYXN0REtleSA9IFwiXCJcblxuICB1cGRhdGVGcm9tSXJpc0NvdWNoOiAoIGRLZXkgPSBAY2FsY0RLZXkoKSApID0+XG5cbiAgICAjIHNwbGl0IHRvIGhhbmRsZSBtdWx0aXBsZSBka2V5c1xuICAgIGRLZXlzID0gZEtleS5yZXBsYWNlKC9bXmEtZjAtOV0vZyxcIiBcIikuc3BsaXQoL1xccysvKVxuXG4gICAgQHRyaWdnZXIgXCJzdGF0dXNcIiwgXCJpbXBvcnQgbG9va3VwXCJcbiAgICAkLmFqYXhcbiAgICAgIHVybDogXCJodHRwOi8vdGFuZ2VyaW5lLmlyaXNjb3VjaC5jb20vdGFuZ2VyaW5lL19kZXNpZ24vb2phaS9fdmlldy9ieURLZXlcIlxuICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcbiAgICAgIHR5cGU6IFwiR0VUXCJcbiAgICAgIGRhdGE6XG4gICAgICAgIGtleXMgOiBKU09OLnN0cmluZ2lmeShkS2V5cylcbiAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICBkb2NMaXN0ID0gW11cbiAgICAgICAgZm9yIGRhdHVtIGluIGRhdGEucm93c1xuICAgICAgICAgIGRvY0xpc3QucHVzaCBkYXR1bS5pZFxuICAgICAgICAkLmNvdWNoLnJlcGxpY2F0ZShcbiAgICAgICAgICBcImh0dHA6Ly90YW5nZXJpbmUuaXJpc2NvdWNoLmNvbS90YW5nZXJpbmVcIixcbiAgICAgICAgICBUYW5nZXJpbmUuc2V0dGluZ3MuZ3JvdXBEQixcbiAgICAgICAgICAgIHN1Y2Nlc3M6KHJlc3BvbnNlKSA9PiBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBzdWNjZXNzXCIsIHJlc3BvbnNlXG4gICAgICAgICAgICBlcnJvcjogKGEsIGIpICAgICAgPT4gQHRyaWdnZXIgXCJzdGF0dXNcIiwgXCJpbXBvcnQgZXJyb3JcIiwgXCIje2F9ICN7Yn1cIlxuICAgICAgICAgICxcbiAgICAgICAgICAgIGRvY19pZHM6IGRvY0xpc3RcbiAgICAgICAgKVxuXG4gICAgZmFsc2VcblxuXG4gICMgRmV0Y2hlcyBhbGwgYXNzZXNzbWVudCByZWxhdGVkIGRvY3VtZW50cywgcHV0cyB0aGVtIHRvZ2V0aGVyIGluIGEgZG9jdW1lbnRcbiAgIyBhcnJheSBmb3IgdXBsb2FkaW5nIHRvIGJ1bGtkb2NzLlxuICBkdXBsaWNhdGU6IC0+XG5cbiAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zXG4gICAgc3VidGVzdHMgID0gbmV3IFN1YnRlc3RzXG5cbiAgICBtb2RlbHNUb1NhdmUgPSBbXVxuXG4gICAgb2xkTW9kZWwgPSBAXG5cbiAgICAjIGdlbmVyYWwgcGF0dGVybjogY2xvbmUgYXR0cmlidXRlcywgbW9kaWZ5IHRoZW0sIHN0YW1wIHRoZW0sIHB1dCBhdHRyaWJ1dGVzIGluIGFycmF5XG5cbiAgICAkLmV4dGVuZCh0cnVlLCBjbG9uZWRBdHRyaWJ1dGVzID0ge30sIEBhdHRyaWJ1dGVzKVxuXG4gICAgbmV3SWQgPSBVdGlscy5ndWlkKClcblxuICAgIGNsb25lZEF0dHJpYnV0ZXMuX2lkICAgICAgICAgID0gbmV3SWRcbiAgICBjbG9uZWRBdHRyaWJ1dGVzLm5hbWUgICAgICAgICA9IFwiQ29weSBvZiAje2Nsb25lZEF0dHJpYnV0ZXMubmFtZX1cIlxuICAgIGNsb25lZEF0dHJpYnV0ZXMuYXNzZXNzbWVudElkID0gbmV3SWRcblxuICAgIG5ld01vZGVsID0gbmV3IEFzc2Vzc21lbnQoY2xvbmVkQXR0cmlidXRlcylcblxuICAgIG1vZGVsc1RvU2F2ZS5wdXNoIChuZXdNb2RlbCkuc3RhbXAoKS5hdHRyaWJ1dGVzXG5cblxuICAgIGdldFF1ZXN0aW9ucyA9IC0+XG4gICAgICBxdWVzdGlvbnMuZmV0Y2hcbiAgICAgICAga2V5OiBcInFcIiArIG9sZE1vZGVsLmlkXG4gICAgICAgIHN1Y2Nlc3M6IC0+IGdldFN1YnRlc3RzKClcblxuICAgIGdldFN1YnRlc3RzID0gLT5cbiAgICAgIHN1YnRlc3RzLmZldGNoXG4gICAgICAgIGtleTogb2xkTW9kZWwuaWRcbiAgICAgICAgc3VjY2VzczogLT4gcHJvY2Vzc0RvY3MoKVxuXG4gICAgcHJvY2Vzc0RvY3MgPSAtPlxuXG4gICAgICBzdWJ0ZXN0SWRNYXAgPSB7fVxuXG4gICAgICAjIGxpbmsgbmV3IHN1YnRlc3RzIHRvIG5ldyBhc3Nlc3NtZW50XG4gICAgICBmb3Igc3VidGVzdCBpbiBzdWJ0ZXN0cy5tb2RlbHNcblxuICAgICAgICBvbGRTdWJ0ZXN0SWQgPSBzdWJ0ZXN0LmlkXG4gICAgICAgIG5ld1N1YnRlc3RJZCA9IFV0aWxzLmd1aWQoKVxuXG4gICAgICAgIHN1YnRlc3RJZE1hcFtvbGRTdWJ0ZXN0SWRdID0gbmV3U3VidGVzdElkXG5cbiAgICAgICAgJC5leHRlbmQodHJ1ZSwgbmV3QXR0cmlidXRlcyA9IHt9LCBzdWJ0ZXN0LmF0dHJpYnV0ZXMpXG5cbiAgICAgICAgbmV3QXR0cmlidXRlcy5faWQgICAgICAgICAgPSBuZXdTdWJ0ZXN0SWRcbiAgICAgICAgbmV3QXR0cmlidXRlcy5hc3Nlc3NtZW50SWQgPSBuZXdJZFxuXG4gICAgICAgIG1vZGVsc1RvU2F2ZS5wdXNoIChuZXcgU3VidGVzdChuZXdBdHRyaWJ1dGVzKSkuc3RhbXAoKS5hdHRyaWJ1dGVzXG5cbiAgICAgICMgdXBkYXRlIHRoZSBsaW5rcyB0byBvdGhlciBzdWJ0ZXN0c1xuICAgICAgZm9yIHN1YnRlc3QgaW4gbW9kZWxzVG9TYXZlXG4gICAgICAgIGlmIHN1YnRlc3QuZ3JpZExpbmtJZD8gYW5kIHN1YnRlc3QuZ3JpZExpbmtJZCAhPSBcIlwiXG4gICAgICAgICAgc3VidGVzdC5ncmlkTGlua0lkID0gc3VidGVzdElkTWFwW3N1YnRlc3QuZ3JpZExpbmtJZF1cblxuICAgICAgIyBsaW5rIHF1ZXN0aW9ucyB0byBuZXcgc3VidGVzdHNcbiAgICAgIGZvciBxdWVzdGlvbiBpbiBxdWVzdGlvbnMubW9kZWxzXG5cbiAgICAgICAgJC5leHRlbmQodHJ1ZSwgbmV3QXR0cmlidXRlcyA9IHt9LCBxdWVzdGlvbi5hdHRyaWJ1dGVzKVxuXG4gICAgICAgIG9sZFN1YnRlc3RJZCA9IG5ld0F0dHJpYnV0ZXMuc3VidGVzdElkXG5cbiAgICAgICAgbmV3QXR0cmlidXRlcy5faWQgICAgICAgICAgPSBVdGlscy5ndWlkKClcbiAgICAgICAgbmV3QXR0cmlidXRlcy5zdWJ0ZXN0SWQgICAgPSBzdWJ0ZXN0SWRNYXBbb2xkU3VidGVzdElkXVxuICAgICAgICBuZXdBdHRyaWJ1dGVzLmFzc2Vzc21lbnRJZCA9IG5ld0lkXG5cbiAgICAgICAgbW9kZWxzVG9TYXZlLnB1c2ggKG5ldyBRdWVzdGlvbihuZXdBdHRyaWJ1dGVzKSkuc3RhbXAoKS5hdHRyaWJ1dGVzXG5cbiAgICAgIHJlcXVlc3REYXRhID0gXCJkb2NzXCIgOiBtb2RlbHNUb1NhdmVcblxuICAgICAgJC5hamF4XG4gICAgICAgIHR5cGUgOiBcIlBPU1RcIlxuICAgICAgICBjb250ZW50VHlwZSA6IFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD1VVEYtOFwiXG4gICAgICAgIGRhdGFUeXBlIDogXCJqc29uXCJcbiAgICAgICAgdXJsIDogVGFuZ2VyaW5lLnNldHRpbmdzLnVybEJ1bGtEb2NzKClcbiAgICAgICAgZGF0YSA6IEpTT04uc3RyaW5naWZ5KHJlcXVlc3REYXRhKVxuICAgICAgICBzdWNjZXNzIDogKHJlc3BvbnNlcykgPT4gb2xkTW9kZWwudHJpZ2dlciBcIm5ld1wiLCBuZXdNb2RlbFxuICAgICAgICBlcnJvciA6IC0+IFV0aWxzLm1pZEFsZXJ0IFwiRHVwbGljYXRpb24gZXJyb3JcIlxuXG4gICAgIyBraWNrIGl0IG9mZlxuICAgIGdldFF1ZXN0aW9ucygpXG5cblxuXG4gIGRlc3Ryb3k6ID0+XG5cbiAgICAjIGdldCBhbGwgZG9jcyB0aGF0IGJlbG9uZyB0byB0aGlzIGFzc2Vzc3NtZW50IGV4Y2VwdCByZXN1bHRzXG4gICAgJC5hamF4XG4gICAgICB0eXBlOiBcIlBPU1RcIlxuICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD1VVEYtOFwiXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgIHVybDogXCIvZGIvI3tUYW5nZXJpbmUuZGJfbmFtZX0vX2Rlc2lnbi8je1RhbmdlcmluZS5kZXNpZ25fZG9jfS9fdmlldy9ieVBhcmVudElkXCJcbiAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHsga2V5cyA6IFtcInMje0BpZH1cIixcInEje0BpZH1cIixcImEje0BpZH1cIl0gfSlcbiAgICAgIGVycm9yOiAoeGhyLCBzdGF0dXMsIGVycikgLT5cbiAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJEZWxldGUgZXJyb3I6IDAxXCI7XG4gICAgICAgIFRhbmdlcmluZS5sb2cuZGIoXCJhc3Nlc3NtZW50LWRlbGV0ZS1lcnJvci0wMVwiLFwiRXJyb3I6ICN7ZXJyfSwgU3RhdHVzOiAje3N0YXR1c30sIHhocjoje3hoci5yZXNwb25zZVRleHR8fCdub25lJ30uIGhlYWRlcnM6ICN7eGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpfVwiKVxuICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSA9PlxuXG4gICAgICAgIHJlcXVlc3REYXRhID1cbiAgICAgICAgICBkb2NzIDogcmVzcG9uc2Uucm93cy5tYXAgKHJvdykgLT5cbiAgICAgICAgICAgIFwiX2lkXCIgIDogcm93LmlkXG4gICAgICAgICAgICBcIl9yZXZcIiA6IHJvdy52YWx1ZS5yXG4gICAgICAgICAgICBcIl9kZWxldGVkXCIgOiB0cnVlXG5cbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgdHlwZTogXCJQT1NUXCJcbiAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PVVURi04XCJcbiAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgICAgICB1cmw6IFRhbmdlcmluZS5zZXR0aW5ncy51cmxCdWxrRG9jcygpXG4gICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkocmVxdWVzdERhdGEpXG4gICAgICAgICAgZXJyb3I6IC0+IFV0aWxzLm1pZEFsZXJ0IFwiRGVsZXRlIGVycm9yOiAwMlwiOyBUYW5nZXJpbmUubG9nLmRiKFwiYXNzZXNzbWVudC1kZWxldGUtZXJyb3ItMDJcIixKU09OLnN0cmluZ2lmeShhcmd1bWVudHMpKVxuICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZXMpID0+XG4gICAgICAgICAgICBva0NvdW50ID0gMFxuICAgICAgICAgICAgKG9rQ291bnQrKyBpZiByZXNwLm9rPykgZm9yIHJlc3AgaW4gcmVzcG9uc2VzXG4gICAgICAgICAgICBpZiBva0NvdW50ID09IHJlc3BvbnNlcy5sZW5ndGhcbiAgICAgICAgICAgICAgQGNvbGxlY3Rpb24ucmVtb3ZlIEBpZFxuICAgICAgICAgICAgICBAY2xlYXIoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBVdGlscy5taWRBbGVydCBcIkRlbGV0ZSBlcnJvcjogMDNcIjsgVGFuZ2VyaW5lLmxvZy5kYihcImFzc2Vzc21lbnQtZGVsZXRlLWVycm9yLTAzXCIsSlNPTi5zdHJpbmdpZnkoYXJndW1lbnRzKSlcblxuICBpc0FjdGl2ZTogLT4gcmV0dXJuIG5vdCBAaXNBcmNoaXZlZCgpXG5cbiAgaXNBcmNoaXZlZDogLT5cbiAgICBhcmNoaXZlZCA9IEBnZXQoXCJhcmNoaXZlZFwiKVxuICAgIHJldHVybiBhcmNoaXZlZCA9PSBcInRydWVcIiBvciBhcmNoaXZlZCA9PSB0cnVlXG5cbiJdfQ==
