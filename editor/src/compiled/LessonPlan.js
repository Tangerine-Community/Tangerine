var LessonPlan,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LessonPlan = (function(superClass) {
  extend(LessonPlan, superClass);

  function LessonPlan() {
    this.destroyLessonPlan = bind(this.destroyLessonPlan, this);
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
            model.set("elements", _this.elements);
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

  LessonPlan.prototype.destroyLessonPlan = function(options) {
    var lessonPlan;
    lessonPlan = new LessonPlan({
      "_id": this.id
    });
    return lessonPlan.fetch({
      success: (function(_this) {
        return function(lessonPlan) {
          var elements;
          elements = lessonPlan.get("elements").models;
          _.each(_this.elements, function(ele) {
            return ele.destroy();
          });
          return lessonPlan.destroy(options);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlc3NvblBsYW4vTGVzc29uUGxhbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxVQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7Ozs7O3VCQUVKLEdBQUEsR0FBSzs7dUJBRUwsY0FBQSxHQUFpQixFQUFBLEdBQUs7O3VCQUV0QixVQUFBLEdBQVksU0FBRSxPQUFGOztNQUFFLFVBQVE7O1dBR3BCLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSTtFQUhOOzt1QkFNWixRQUFBLEdBQVUsU0FBQTtXQUFHLElBQUMsQ0FBQSxFQUFFLENBQUMsTUFBSixDQUFXLENBQUMsQ0FBWixFQUFlLENBQWY7RUFBSDs7dUJBR1YsZ0JBQUEsR0FBa0IsU0FBRSxTQUFGOztNQUFFLFlBQVk7O0lBQzlCLE9BQU8sQ0FBQyxHQUFSLENBQVksUUFBWjtJQUNBLElBQXlELHVCQUF6RDtNQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsVUFBQSxDQUFXLFNBQVMsQ0FBQyxLQUFyQixFQUE0QixJQUFDLENBQUEsY0FBN0IsRUFBVDs7V0FDQSxDQUFDLENBQUMsSUFBRixDQUNFO01BQUEsR0FBQSxFQUFLLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBbkIsQ0FBMkIsT0FBM0IsRUFBb0MsUUFBcEMsQ0FBTDtNQUNBLFFBQUEsRUFBVSxPQURWO01BRUEsSUFBQSxFQUFNO1FBQUEsSUFBQSxFQUFNLENBQUMsVUFBRCxDQUFOO09BRk47TUFHQSxPQUFBLEVBQVMsSUFBQyxDQUFBLGNBSFY7TUFJQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ1AsWUFBQSxDQUFhLEtBQUMsQ0FBQSxLQUFkOzJEQUNBLFNBQVMsQ0FBQztRQUZIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUpUO0tBREY7RUFIZ0I7O3VCQVlsQixjQUFBLEdBQWdCLFNBQUE7V0FDZCxDQUFDLENBQUMsSUFBRixDQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBbkIsQ0FBMkIs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LFVBQUQ7QUFFUCxjQUFBO1VBQUEsUUFBQSxHQUFXLFVBQVUsQ0FBQyxHQUFYLENBQWUsVUFBZixDQUEwQixDQUFDO1VBQ3RDLENBQUMsQ0FBQyxJQUFGLENBQU8sS0FBQyxDQUFBLFFBQVIsRUFBa0IsU0FBQyxHQUFEO21CQUNoQixHQUFHLENBQUMsT0FBSixDQUFBO1VBRGdCLENBQWxCO2lCQUVBLFVBQVUsQ0FBQyxPQUFYLENBQW1CLE9BQW5CO1FBTE87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7S0FERjtFQUxpQjs7dUJBYW5CLFFBQUEsR0FBVSxTQUFBO0FBQUcsV0FBTyxDQUFJLElBQUMsQ0FBQSxVQUFELENBQUE7RUFBZDs7dUJBRVYsVUFBQSxHQUFZLFNBQUE7QUFDVixRQUFBO0lBQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxHQUFELENBQUssVUFBTDtBQUNYLFdBQU8sUUFBQSxLQUFZLE1BQVosSUFBc0IsUUFBQSxLQUFZO0VBRi9COzs7O0dBcFRXLFFBQVEsQ0FBQyIsImZpbGUiOiJsZXNzb25QbGFuL0xlc3NvblBsYW4uanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBMZXNzb25QbGFuIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuICB1cmw6ICdsZXNzb25QbGFuJ1xuXG4gIFZFUklGWV9USU1FT1VUIDogMjAgKiAxMDAwXG5cbiAgaW5pdGlhbGl6ZTogKCBvcHRpb25zPXt9ICkgLT5cbiMgdGhpcyBjb2xsZWN0aW9uIGRvZXNuJ3QgZ2V0IHNhdmVkXG4jIGNoYW5nZXMgdXBkYXRlIHRoZSBzdWJ0ZXN0IHZpZXcsIGl0IGtlZXBzIG9yZGVyXG4gICAgQGVsZW1lbnRzID0gbmV3IEVsZW1lbnRzXG4jIEBnZXRSZXN1bHRDb3VudCgpXG5cbiAgY2FsY0RLZXk6ID0+IEBpZC5zdWJzdHIoLTUsIDUpXG5cbiMgcmVmYWN0b3IgdG8gZXZlbnRzXG4gIHZlcmlmeUNvbm5lY3Rpb246ICggY2FsbGJhY2tzID0ge30gKSA9PlxuICAgIGNvbnNvbGUubG9nIFwiY2FsbGVkXCJcbiAgICBAdGltZXIgPSBzZXRUaW1lb3V0KGNhbGxiYWNrcy5lcnJvciwgQFZFUklGWV9USU1FT1VUKSBpZiBjYWxsYmFja3MuZXJyb3I/XG4gICAgJC5hamF4XG4gICAgICB1cmw6IFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3KFwiZ3JvdXBcIiwgXCJieURLZXlcIilcbiAgICAgIGRhdGFUeXBlOiBcImpzb25wXCJcbiAgICAgIGRhdGE6IGtleXM6IFtcInRlc3R0ZXN0XCJdXG4gICAgICB0aW1lb3V0OiBAVkVSSUZZX1RJTUVPVVRcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgIGNsZWFyVGltZW91dCBAdGltZXJcbiAgICAgICAgY2FsbGJhY2tzLnN1Y2Nlc3M/KClcblxuICBnZXRSZXN1bHRDb3VudDogPT5cbiAgICAkLmFqYXggVGFuZ2VyaW5lLnNldHRpbmdzLnVybFZpZXcoXCJsb2NhbFwiLCBcInJlc3VsdENvdW50XCIpXG4gICAgICB0eXBlOiBcIlBPU1RcIlxuICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgZ3JvdXAgICAgICAgOiB0cnVlXG4gICAgICAgIGdyb3VwX2xldmVsIDogMVxuICAgICAgICBrZXkgICAgICAgICA6IEBpZFxuICAgICAgKVxuICAgICAgc3VjY2VzczogKGRhdGEpID0+XG4gICAgICAgIEByZXN1bHRDb3VudCA9IGlmIGRhdGEucm93cy5sZW5ndGggIT0gMCB0aGVuIGRhdGEucm93c1swXS52YWx1ZSBlbHNlIDBcbiAgICAgICAgQHRyaWdnZXIgXCJyZXN1bHRDb3VudFwiXG5cblxuIyBIaWphY2tlZCBzdWNjZXNzKCkgZm9yIGxhdGVyXG4jIGZldGNocyBhbGwgZWxlbWVudHMgZm9yIHRoZSBsZXNzb25QbGFuXG4gIGZldGNoOiAob3B0aW9ucykgPT5cbiAgICBvbGRTdWNjZXNzID0gb3B0aW9ucy5zdWNjZXNzXG4gICAgb3B0aW9ucy5zdWNjZXNzID0gKG1vZGVsKSA9PlxuICAgICAgYWxsRWxlbWVudHMgPSBuZXcgRWxlbWVudHNcbiAgICAgIGFsbEVsZW1lbnRzLmZldGNoXG4gICAgICAgIGtleTogXCJlXCIgKyBAaWRcbiAgICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pID0+XG4gICAgICAgICAgQGVsZW1lbnRzID0gY29sbGVjdGlvblxuICAgICAgICAgIEBlbGVtZW50cy5lbnN1cmVPcmRlcigpXG4gICAgICAgICAgbW9kZWwuc2V0KFwiZWxlbWVudHNcIiwgQGVsZW1lbnRzKVxuICAgICAgICAgIG9sZFN1Y2Nlc3M/IEBcblxuICAgIEFzc2Vzc21lbnQuX19zdXBlcl9fLmZldGNoLmNhbGwgQCwgb3B0aW9uc1xuXG5cblxuICBzcGxpdERLZXlzOiAoIGRLZXkgPSBcIlwiICkgLT5cbiMgc3BsaXQgdG8gaGFuZGxlIG11bHRpcGxlIGRrZXlzXG4gICAgZEtleS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1tnLXpdL2csJycpLnJlcGxhY2UoL1teYS1mMC05XS9nLFwiIFwiKS5zcGxpdCgvXFxzKy8pXG5cbiAgdXBkYXRlRnJvbVNlcnZlcjogKCBkS2V5ID0gQGNhbGNES2V5KCksIGdyb3VwICkgPT5cblxuICAgIEBsYXN0REtleSA9IGRLZXlcblxuICAgIGRLZXlzID0gQHNwbGl0REtleXMoZEtleSlcblxuICAgIEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGxvb2t1cFwiXG5cbiAgICBzb3VyY2VEQiA9IFwiZ3JvdXAtXCIgKyBncm91cFxuICAgIHRhcmdldERCID0gVGFuZ2VyaW5lLnNldHRpbmdzLmdyb3VwREJcblxuICAgIGxvY2FsREtleSA9IFRhbmdlcmluZS5zZXR0aW5ncy5sb2NhdGlvbi5ncm91cC5kYitUYW5nZXJpbmUuc2V0dGluZ3MuY291Y2gudmlldyArIFwiYnlES2V5XCJcblxuICAgIHNvdXJjZURLZXkgPSBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiZ3JvdXBIb3N0XCIpICsgXCIvXCIrc291cmNlREIrXCIvXCIrVGFuZ2VyaW5lLnNldHRpbmdzLmNvdWNoLnZpZXcgKyBcImJ5REtleVwiXG5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogc291cmNlREtleSxcbiAgICAgIHR5cGU6IFwiR0VUXCJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgZGF0YToga2V5czogSlNPTi5zdHJpbmdpZnkoZEtleXMpXG4gICAgICBlcnJvcjogKGEsIGIpID0+IEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGVycm9yXCIsIFwiI3thfSAje2J9XCJcbiAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICBkb2NMaXN0ID0gW11cbiAgICAgICAgZm9yIGRhdHVtIGluIGRhdGEucm93c1xuICAgICAgICAgIGRvY0xpc3QucHVzaCBkYXR1bS5pZFxuXG4gICAgICAgICQuYWpheFxuICAgICAgICAgIHVybDogbG9jYWxES2V5LFxuICAgICAgICAgIHR5cGU6IFwiUE9TVFwiXG4gICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoa2V5czpkS2V5cylcbiAgICAgICAgICBlcnJvcjogKGEsIGIpID0+IEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGVycm9yXCIsIFwiI3thfSAje2J9XCJcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT5cbiAgICAgICAgICAgIGZvciBkYXR1bSBpbiBkYXRhLnJvd3NcbiAgICAgICAgICAgICAgZG9jTGlzdC5wdXNoIGRhdHVtLmlkXG5cbiAgICAgICAgICAgIGRvY0xpc3QgPSBfLnVuaXEoZG9jTGlzdClcblxuICAgICAgICAgICAgJC5jb3VjaC5yZXBsaWNhdGUoXG4gICAgICAgICAgICAgIHNvdXJjZURCLFxuICAgICAgICAgICAgICB0YXJnZXREQixcbiAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKT0+XG4gICAgICAgICAgICAgICAgQGNoZWNrQ29uZmxpY3RzIGRvY0xpc3RcbiAgICAgICAgICAgICAgICBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBzdWNjZXNzXCIsIHJlc3BvbnNlXG4gICAgICAgICAgICAgIGVycm9yOiAoYSwgYikgICAgICA9PiBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBlcnJvclwiLCBcIiN7YX0gI3tifVwiXG4gICAgICAgICAgICAsXG4gICAgICAgICAgICAgIGRvY19pZHM6IGRvY0xpc3RcbiAgICAgICAgICAgIClcblxuICAgIGZhbHNlXG5cbiMgdGhpcyBpcyBwcmV0dHkgc3RyYW5nZSwgYnV0IGl0IGJhc2ljYWxseSB1bmRlbGV0ZXMsIHRyaWVzIHRvIHJlcGxpY2F0ZSBhZ2FpbiwgYW5kIHRoZW4gZGVsZXRlcyB0aGUgY29uZmxpY3RpbmcgKGxvY2FsKSB2ZXJzaW9uIGFzIG1hcmtlZCBieSB0aGUgZmlyc3QgdGltZSBhcm91bmQuXG4gIGNoZWNrQ29uZmxpY3RzOiAoZG9jTGlzdD1bXSwgb3B0aW9ucz17fSkgPT5cblxuICAgIEBkb2NzID0ge30gdW5sZXNzIGRvY3M/XG5cbiAgICBmb3IgZG9jIGluIGRvY0xpc3RcbiAgICAgIGRvIChkb2MpID0+XG4gICAgICAgIFRhbmdlcmluZS4kZGIub3BlbkRvYyBkb2MsXG4gICAgICAgICAgb3Blbl9yZXZzIDogXCJhbGxcIlxuICAgICAgICAgIGNvbmZsaWN0cyA6IHRydWVcbiAgICAgICAgICBlcnJvcjogLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIFwiZXJyb3Igd2l0aCAje2RvY31cIlxuICAgICAgICAgIHN1Y2Nlc3M6IChkb2MpID0+XG4gICAgICAgICAgICBpZiBkb2MubGVuZ3RoID09IDFcbiAgICAgICAgICAgICAgZG9jID0gZG9jWzBdLm9rICMgY291Y2ggaXMgd2VpcmRcbiAgICAgICAgICAgICAgaWYgZG9jLmRlbGV0ZWRBdCA9PSBcIm1vYmlsZVwiXG4gICAgICAgICAgICAgICAgJC5hamF4XG4gICAgICAgICAgICAgICAgICB0eXBlOiBcIlBVVFwiXG4gICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgICAgICAgICAgICAgIHVybDogXCJodHRwOi8vbG9jYWxob3N0OjU5ODQvXCIrVGFuZ2VyaW5lLnNldHRpbmdzLnVybERCKFwibG9jYWxcIikgKyBcIi9cIiArZG9jLl9pZFxuICAgICAgICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgICAgICAgICAgICAgIFwiX3JldlwiICAgICAgOiBkb2MuX3JldlxuICAgICAgICAgICAgICAgICAgICBcImRlbGV0ZWRBdFwiIDogZG9jLmRlbGV0ZWRBdFxuICAgICAgICAgICAgICAgICAgICBcIl9kZWxldGVkXCIgIDogZmFsc2VcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIGVycm9yOiA9PlxuI2NvbnNvbGUubG9nIFwic2F2ZSBuZXcgZG9jIGVycm9yXCJcbiAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgICAgICAgICBAZG9jcy5jaGVja2VkID0gMCB1bmxlc3MgQGRvY3MuY2hlY2tlZD9cbiAgICAgICAgICAgICAgICAgICAgQGRvY3MuY2hlY2tlZCsrXG4gICAgICAgICAgICAgICAgICAgIGlmIEBkb2NzLmNoZWNrZWQgPT0gZG9jTGlzdC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICBAZG9jcy5jaGVja2VkID0gMFxuICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCBfLmlzRW1wdHkgQGxhc3RES2V5XG4gICAgICAgICAgICAgICAgICAgICAgICBAdXBkYXRlRnJvbVNlcnZlciBAbGFzdERLZXlcbiAgICAgICAgICAgICAgICAgICAgICAgIEBsYXN0REtleSA9IFwiXCJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgZG9jcyA9IGRvY1xuICAgICAgICAgICAgICBmb3IgZG9jIGluIGRvY3NcbiAgICAgICAgICAgICAgICBkb2MgPSBkb2Mub2tcbiAgICAgICAgICAgICAgICBkbyAoZG9jLCBkb2NzKSA9PlxuICAgICAgICAgICAgICAgICAgaWYgZG9jLmRlbGV0ZWRBdCA9PSBcIm1vYmlsZVwiXG4gICAgICAgICAgICAgICAgICAgICQuYWpheFxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiUFVUXCJcbiAgICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cDovL2xvY2FsaG9zdDo1OTg0L1wiK1RhbmdlcmluZS5zZXR0aW5ncy51cmxEQihcImxvY2FsXCIpICsgXCIvXCIgK2RvYy5faWRcbiAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiX3JldlwiICAgICAgOiBkb2MuX3JldlxuICAgICAgICAgICAgICAgICAgICAgICAgXCJfZGVsZXRlZFwiICA6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgZXJyb3I6ID0+XG4jY29uc29sZS5sb2cgXCJDb3VsZCBub3QgZGVsZXRlIGNvbmZsaWN0aW5nIHZlcnNpb25cIlxuICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgQGRvY3MuY2hlY2tlZCA9IDAgdW5sZXNzIEBkb2NzLmNoZWNrZWQ/XG4gICAgICAgICAgICAgICAgICAgICAgICBAZG9jcy5jaGVja2VkKytcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIEBkb2NzLmNoZWNrZWQgPT0gZG9jTGlzdC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgQGRvY3MuY2hlY2tlZCA9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgbm90IF8uaXNFbXB0eSBAbGFzdERLZXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAdXBkYXRlRnJvbVNlcnZlciBAbGFzdERLZXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAbGFzdERLZXkgPSBcIlwiXG5cbiAgdXBkYXRlRnJvbUlyaXNDb3VjaDogKCBkS2V5ID0gQGNhbGNES2V5KCkgKSA9PlxuXG4jIHNwbGl0IHRvIGhhbmRsZSBtdWx0aXBsZSBka2V5c1xuICAgIGRLZXlzID0gZEtleS5yZXBsYWNlKC9bXmEtZjAtOV0vZyxcIiBcIikuc3BsaXQoL1xccysvKVxuXG4gICAgQHRyaWdnZXIgXCJzdGF0dXNcIiwgXCJpbXBvcnQgbG9va3VwXCJcbiAgICAkLmFqYXhcbiAgICAgIHVybDogXCJodHRwOi8vdGFuZ2VyaW5lLmlyaXNjb3VjaC5jb20vdGFuZ2VyaW5lL19kZXNpZ24vb2phaS9fdmlldy9ieURLZXlcIlxuICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcbiAgICAgIHR5cGU6IFwiR0VUXCJcbiAgICAgIGRhdGE6XG4gICAgICAgIGtleXMgOiBKU09OLnN0cmluZ2lmeShkS2V5cylcbiAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICBkb2NMaXN0ID0gW11cbiAgICAgICAgZm9yIGRhdHVtIGluIGRhdGEucm93c1xuICAgICAgICAgIGRvY0xpc3QucHVzaCBkYXR1bS5pZFxuICAgICAgICAkLmNvdWNoLnJlcGxpY2F0ZShcbiAgICAgICAgICBcImh0dHA6Ly90YW5nZXJpbmUuaXJpc2NvdWNoLmNvbS90YW5nZXJpbmVcIixcbiAgICAgICAgICBUYW5nZXJpbmUuc2V0dGluZ3MuZ3JvdXBEQixcbiAgICAgICAgICBzdWNjZXNzOihyZXNwb25zZSkgPT4gQHRyaWdnZXIgXCJzdGF0dXNcIiwgXCJpbXBvcnQgc3VjY2Vzc1wiLCByZXNwb25zZVxuICAgICAgICAgIGVycm9yOiAoYSwgYikgICAgICA9PiBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBlcnJvclwiLCBcIiN7YX0gI3tifVwiXG4gICAgICAgICxcbiAgICAgICAgICBkb2NfaWRzOiBkb2NMaXN0XG4gICAgICAgIClcblxuICAgIGZhbHNlXG5cblxuIyBGZXRjaGVzIGFsbCBhc3Nlc3NtZW50IHJlbGF0ZWQgZG9jdW1lbnRzLCBwdXRzIHRoZW0gdG9nZXRoZXIgaW4gYSBkb2N1bWVudFxuIyBhcnJheSBmb3IgdXBsb2FkaW5nIHRvIGJ1bGtkb2NzLlxuICBkdXBsaWNhdGU6IC0+XG5cbiAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zXG4gICAgZWxlbWVudHMgID0gbmV3IEVsZW1lbnRzXG5cbiAgICBtb2RlbHNUb1NhdmUgPSBbXVxuXG4gICAgb2xkTW9kZWwgPSBAXG5cbiAgICAjIGdlbmVyYWwgcGF0dGVybjogY2xvbmUgYXR0cmlidXRlcywgbW9kaWZ5IHRoZW0sIHN0YW1wIHRoZW0sIHB1dCBhdHRyaWJ1dGVzIGluIGFycmF5XG5cbiAgICAkLmV4dGVuZCh0cnVlLCBjbG9uZWRBdHRyaWJ1dGVzID0ge30sIEBhdHRyaWJ1dGVzKVxuXG4gICAgbmV3SWQgPSBVdGlscy5ndWlkKClcblxuICAgIGNsb25lZEF0dHJpYnV0ZXMuX2lkICAgICAgICAgID0gbmV3SWRcbiAgICBjbG9uZWRBdHRyaWJ1dGVzLm5hbWUgICAgICAgICA9IFwiQ29weSBvZiAje2Nsb25lZEF0dHJpYnV0ZXMubmFtZX1cIlxuICAgIGNsb25lZEF0dHJpYnV0ZXMuYXNzZXNzbWVudElkID0gbmV3SWRcblxuICAgIG5ld01vZGVsID0gbmV3IEFzc2Vzc21lbnQoY2xvbmVkQXR0cmlidXRlcylcblxuICAgIG1vZGVsc1RvU2F2ZS5wdXNoIChuZXdNb2RlbCkuc3RhbXAoKS5hdHRyaWJ1dGVzXG5cblxuICAgIGdldFF1ZXN0aW9ucyA9IC0+XG4gICAgICBxdWVzdGlvbnMuZmV0Y2hcbiAgICAgICAga2V5OiBcInFcIiArIG9sZE1vZGVsLmlkXG4gICAgICAgIHN1Y2Nlc3M6IC0+IGdldEVsZW1lbnRzKClcblxuICAgIGdldEVsZW1lbnRzID0gLT5cbiAgICAgIGVsZW1lbnRzLmZldGNoXG4gICAgICAgIGtleTogXCJzXCIgKyBvbGRNb2RlbC5pZFxuICAgICAgICBzdWNjZXNzOiAtPiBwcm9jZXNzRG9jcygpXG5cbiAgICBwcm9jZXNzRG9jcyA9IC0+XG5cbiAgICAgIHN1YnRlc3RJZE1hcCA9IHt9XG5cbiAgICAgICMgbGluayBuZXcgZWxlbWVudHMgdG8gbmV3IGFzc2Vzc21lbnRcbiAgICAgIGZvciBzdWJ0ZXN0IGluIGVsZW1lbnRzLm1vZGVsc1xuXG4gICAgICAgIG9sZFN1YnRlc3RJZCA9IHN1YnRlc3QuaWRcbiAgICAgICAgbmV3U3VidGVzdElkID0gVXRpbHMuZ3VpZCgpXG5cbiAgICAgICAgc3VidGVzdElkTWFwW29sZFN1YnRlc3RJZF0gPSBuZXdTdWJ0ZXN0SWRcblxuICAgICAgICAkLmV4dGVuZCh0cnVlLCBuZXdBdHRyaWJ1dGVzID0ge30sIHN1YnRlc3QuYXR0cmlidXRlcylcblxuICAgICAgICBuZXdBdHRyaWJ1dGVzLl9pZCAgICAgICAgICA9IG5ld1N1YnRlc3RJZFxuICAgICAgICBuZXdBdHRyaWJ1dGVzLmFzc2Vzc21lbnRJZCA9IG5ld0lkXG5cbiAgICAgICAgbW9kZWxzVG9TYXZlLnB1c2ggKG5ldyBTdWJ0ZXN0KG5ld0F0dHJpYnV0ZXMpKS5zdGFtcCgpLmF0dHJpYnV0ZXNcblxuICAgICAgIyB1cGRhdGUgdGhlIGxpbmtzIHRvIG90aGVyIGVsZW1lbnRzXG4gICAgICBmb3Igc3VidGVzdCBpbiBtb2RlbHNUb1NhdmVcbiAgICAgICAgaWYgc3VidGVzdC5ncmlkTGlua0lkPyBhbmQgc3VidGVzdC5ncmlkTGlua0lkICE9IFwiXCJcbiAgICAgICAgICBzdWJ0ZXN0LmdyaWRMaW5rSWQgPSBzdWJ0ZXN0SWRNYXBbc3VidGVzdC5ncmlkTGlua0lkXVxuXG4gICAgICAjIGxpbmsgcXVlc3Rpb25zIHRvIG5ldyBlbGVtZW50c1xuICAgICAgZm9yIHF1ZXN0aW9uIGluIHF1ZXN0aW9ucy5tb2RlbHNcblxuICAgICAgICAkLmV4dGVuZCh0cnVlLCBuZXdBdHRyaWJ1dGVzID0ge30sIHF1ZXN0aW9uLmF0dHJpYnV0ZXMpXG5cbiAgICAgICAgb2xkU3VidGVzdElkID0gbmV3QXR0cmlidXRlcy5zdWJ0ZXN0SWRcblxuICAgICAgICBuZXdBdHRyaWJ1dGVzLl9pZCAgICAgICAgICA9IFV0aWxzLmd1aWQoKVxuICAgICAgICBuZXdBdHRyaWJ1dGVzLnN1YnRlc3RJZCAgICA9IHN1YnRlc3RJZE1hcFtvbGRTdWJ0ZXN0SWRdXG4gICAgICAgIG5ld0F0dHJpYnV0ZXMuYXNzZXNzbWVudElkID0gbmV3SWRcblxuICAgICAgICBtb2RlbHNUb1NhdmUucHVzaCAobmV3IFF1ZXN0aW9uKG5ld0F0dHJpYnV0ZXMpKS5zdGFtcCgpLmF0dHJpYnV0ZXNcblxuICAgICAgcmVxdWVzdERhdGEgPSBcImRvY3NcIiA6IG1vZGVsc1RvU2F2ZVxuXG4gICAgICAkLmFqYXhcbiAgICAgICAgdHlwZSA6IFwiUE9TVFwiXG4gICAgICAgIGNvbnRlbnRUeXBlIDogXCJhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PVVURi04XCJcbiAgICAgICAgZGF0YVR5cGUgOiBcImpzb25cIlxuICAgICAgICB1cmwgOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsQnVsa0RvY3MoKVxuICAgICAgICBkYXRhIDogSlNPTi5zdHJpbmdpZnkocmVxdWVzdERhdGEpXG4gICAgICAgIHN1Y2Nlc3MgOiAocmVzcG9uc2VzKSA9PiBvbGRNb2RlbC50cmlnZ2VyIFwibmV3XCIsIG5ld01vZGVsXG4gICAgICAgIGVycm9yIDogLT4gVXRpbHMubWlkQWxlcnQgXCJEdXBsaWNhdGlvbiBlcnJvclwiXG5cbiAgICAjIGtpY2sgaXQgb2ZmXG4gICAgZ2V0UXVlc3Rpb25zKClcblxuXG5cbiAgZGVzdHJveUxlc3NvblBsYW46IChvcHRpb25zKSA9PlxuXG4jIGdldCBhbGwgZG9jcyB0aGF0IGJlbG9uZyB0byB0aGlzIGFzc2Vzc3NtZW50IGV4Y2VwdCByZXN1bHRzXG4gICAgbGVzc29uUGxhbiA9IG5ldyBMZXNzb25QbGFuXG4gICAgICBcIl9pZFwiIDogQGlkXG4gICAgbGVzc29uUGxhbi5mZXRjaFxuICAgICAgc3VjY2VzczogKGxlc3NvblBsYW4pID0+XG4gICAgICAgICMgbG9vcCB0aHJvdWdoIHRoZSBsZXNzb25QbGFuIGVsZW1lbnRzXG4gICAgICAgIGVsZW1lbnRzID0gbGVzc29uUGxhbi5nZXQoXCJlbGVtZW50c1wiKS5tb2RlbHNcbiAgICAgICAgXy5lYWNoIEBlbGVtZW50cywgKGVsZSk9PlxuICAgICAgICAgIGVsZS5kZXN0cm95KClcbiAgICAgICAgbGVzc29uUGxhbi5kZXN0cm95KG9wdGlvbnMpXG5cbiAgaXNBY3RpdmU6IC0+IHJldHVybiBub3QgQGlzQXJjaGl2ZWQoKVxuXG4gIGlzQXJjaGl2ZWQ6IC0+XG4gICAgYXJjaGl2ZWQgPSBAZ2V0KFwiYXJjaGl2ZWRcIilcbiAgICByZXR1cm4gYXJjaGl2ZWQgPT0gXCJ0cnVlXCIgb3IgYXJjaGl2ZWQgPT0gdHJ1ZVxuIl19
