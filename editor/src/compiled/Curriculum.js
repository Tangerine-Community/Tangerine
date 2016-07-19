var Curriculum,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Curriculum = (function(superClass) {
  extend(Curriculum, superClass);

  function Curriculum() {
    this.destroy = bind(this.destroy, this);
    this.updateFromServer = bind(this.updateFromServer, this);
    return Curriculum.__super__.constructor.apply(this, arguments);
  }

  Curriculum.prototype.url = "curriculum";

  Curriculum.prototype.isArchived = function() {
    return false;
  };

  Curriculum.prototype.updateFromServer = function(dKey) {
    var dKeys;
    if (dKey == null) {
      dKey = this.id.substr(-5, 5);
    }
    dKeys = JSON.stringify(dKey.replace(/[^a-f0-9]/g, " ").split(/\s+/));
    this.trigger("status", "import lookup");
    $.ajax(Tangerine.settings.urlView("group", "byDKey"), {
      type: "POST",
      dataType: "jsonp",
      data: {
        keys: dKeys
      },
      success: (function(_this) {
        return function(data) {
          var datum, docList, j, len, ref;
          docList = [];
          ref = data.rows;
          for (j = 0, len = ref.length; j < len; j++) {
            datum = ref[j];
            docList.push(datum.id);
          }
          return $.couch.replicate(Tangerine.settings.urlDB("group"), Tangerine.settings.urlDB("local"), {
            success: function() {
              return _this.trigger("status", "import success");
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

  Curriculum.prototype.duplicate = function(assessmentAttributes, subtestAttributes, questionAttributes, callback) {
    var newId, newModel, originalId;
    originalId = this.id;
    newModel = this.clone();
    newModel.set(assessmentAttributes);
    newId = Utils.guid();
    return newModel.save({
      "_id": newId,
      "curriculumId": newId
    }, {
      success: (function(_this) {
        return function() {
          var questions;
          questions = new Questions;
          return questions.fetch({
            key: "q" + originalId,
            success: function(questions) {
              var subtests;
              subtests = new Subtests;
              return subtests.fetch({
                key: "s" + originalId,
                success: function(subtests) {
                  var filteredSubtests, gridId, i, j, k, l, len, len1, len2, model, newQuestion, newQuestions, newSubtest, newSubtestId, newSubtests, oldId, question, ref, subtestIdMap;
                  filteredSubtests = subtests.models;
                  subtestIdMap = {};
                  newSubtests = [];
                  for (i = j = 0, len = filteredSubtests.length; j < len; i = ++j) {
                    model = filteredSubtests[i];
                    newSubtest = model.clone();
                    newSubtest.set("curriculumId", newModel.id);
                    newSubtestId = Utils.guid();
                    subtestIdMap[newSubtest.id] = newSubtestId;
                    newSubtest.set("_id", newSubtestId);
                    newSubtests.push(newSubtest);
                  }
                  for (i = k = 0, len1 = newSubtests.length; k < len1; i = ++k) {
                    model = newSubtests[i];
                    gridId = model.get("gridLinkId");
                    if ((gridId || "") !== "") {
                      model.set("gridLinkId", subtestIdMap[gridId]);
                    }
                    model.save();
                  }
                  newQuestions = [];
                  ref = questions.models;
                  for (l = 0, len2 = ref.length; l < len2; l++) {
                    question = ref[l];
                    newQuestion = question.clone();
                    oldId = newQuestion.get("subtestId");
                    newQuestion.set("curriculumId", newModel.id);
                    newQuestion.set("_id", Utils.guid());
                    newQuestion.set("subtestId", subtestIdMap[oldId]);
                    newQuestions.push(newQuestion);
                    newQuestion.save();
                  }
                  return callback(newModel);
                }
              });
            }
          });
        };
      })(this)
    });
  };

  Curriculum.prototype.destroy = function(callback) {
    var curriculumId, subtests;
    curriculumId = this.id;
    subtests = new Subtests;
    subtests.fetch({
      key: curriculumId,
      success: function(collection) {
        var results;
        results = [];
        while (collection.length !== 0) {
          results.push(collection.pop().destroy());
        }
        return results;
      }
    });
    return Curriculum.__super__.destroy.call(this, {
      success: function() {
        return callback();
      }
    });
  };

  Curriculum.prototype.destroy = function() {
    return Tangerine.$db.view(Tangerine.design_doc + "/revByAssessmentId", {
      keys: [this.id],
      error: function() {
        return Utils.midAlert("Delete error.");
      },
      success: (function(_this) {
        return function(response) {
          var docs, j, len, ref, requestData, row;
          docs = [];
          ref = response.rows;
          for (j = 0, len = ref.length; j < len; j++) {
            row = ref[j];
            row.value["_deleted"] = true;
            docs.push(row.value);
          }
          requestData = {
            "docs": docs
          };
          return $.ajax({
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            dataType: "json",
            url: Tangerine.settings.urlBulkDocs(),
            data: JSON.stringify(requestData),
            error: function() {
              return Utils.midAlert("Delete error.");
            },
            success: function(responses) {
              var k, len1, okCount, resp;
              okCount = 0;
              for (k = 0, len1 = responses.length; k < len1; k++) {
                resp = responses[k];
                if (resp.ok != null) {
                  okCount++;
                }
              }
              if (okCount === responses.length) {
                _this.collection.remove(_this.id);
                return _this.clear();
              } else {
                return Utils.midAlert("Delete error.");
              }
            }
          });
        };
      })(this)
    });
  };

  return Curriculum;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImN1cnJpY3VsdW0vQ3VycmljdWx1bS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxVQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7O3VCQUVKLEdBQUEsR0FBTTs7dUJBRU4sVUFBQSxHQUFZLFNBQUE7V0FBRztFQUFIOzt1QkFFWixnQkFBQSxHQUFrQixTQUFFLElBQUY7QUFHaEIsUUFBQTs7TUFIa0IsT0FBTyxJQUFDLENBQUEsRUFBRSxDQUFDLE1BQUosQ0FBVyxDQUFDLENBQVosRUFBYyxDQUFkOztJQUd6QixLQUFBLEdBQVEsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFJLENBQUMsT0FBTCxDQUFhLFlBQWIsRUFBMEIsR0FBMUIsQ0FBOEIsQ0FBQyxLQUEvQixDQUFxQyxLQUFyQyxDQUFmO0lBRVIsSUFBQyxDQUFBLE9BQUQsQ0FBUyxRQUFULEVBQW1CLGVBQW5CO0lBRUEsQ0FBQyxDQUFDLElBQUYsQ0FBTyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQW5CLENBQTJCLE9BQTNCLEVBQW9DLFFBQXBDLENBQVAsRUFDRTtNQUFBLElBQUEsRUFBTSxNQUFOO01BQ0EsUUFBQSxFQUFVLE9BRFY7TUFFQSxJQUFBLEVBQU07UUFBQSxJQUFBLEVBQU0sS0FBTjtPQUZOO01BR0EsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO0FBQ1AsY0FBQTtVQUFBLE9BQUEsR0FBVTtBQUNWO0FBQUEsZUFBQSxxQ0FBQTs7WUFDRSxPQUFPLENBQUMsSUFBUixDQUFhLEtBQUssQ0FBQyxFQUFuQjtBQURGO2lCQUVBLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUixDQUNFLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBbkIsQ0FBeUIsT0FBekIsQ0FERixFQUVFLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBbkIsQ0FBeUIsT0FBekIsQ0FGRixFQUdJO1lBQUEsT0FBQSxFQUFjLFNBQUE7cUJBQUcsS0FBQyxDQUFBLE9BQUQsQ0FBUyxRQUFU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TCxDQUFlLFdBQWYsQ0FKTjtZQUtBLEtBQUEsRUFBTyxTQUFBO3FCQUNMLEtBQUssQ0FBQyxRQUFOLENBQWUsZUFBZjtZQURLLENBTFA7WUFPQSxPQUFBLEVBQVMsU0FBQyxTQUFEO0FBQ1Asa0JBQUE7Y0FBQSxPQUFBLEdBQVU7QUFDVixtQkFBQSw2Q0FBQTs7Z0JBQUMsSUFBYSxlQUFiO2tCQUFBLE9BQUEsR0FBQTs7QUFBRDtjQUNBLElBQUcsT0FBQSxLQUFXLFNBQVMsQ0FBQyxNQUF4QjtnQkFDRSxLQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBbUIsS0FBQyxDQUFBLEVBQXBCO3VCQUNBLEtBQUMsQ0FBQSxLQUFELENBQUEsRUFGRjtlQUFBLE1BQUE7dUJBSUUsS0FBSyxDQUFDLFFBQU4sQ0FBZSxlQUFmLEVBSkY7O1lBSE8sQ0FQVDtXQURGO1FBVk87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSFQ7S0FERjtFQUhPOzs7O0dBdEdjLFFBQVEsQ0FBQyIsImZpbGUiOiJjdXJyaWN1bHVtL0N1cnJpY3VsdW0uanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBDdXJyaWN1bHVtIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuICB1cmwgOiBcImN1cnJpY3VsdW1cIlxuXG4gIGlzQXJjaGl2ZWQ6IC0+IGZhbHNlXG5cbiAgdXBkYXRlRnJvbVNlcnZlcjogKCBkS2V5ID0gQGlkLnN1YnN0cigtNSw1KSkgPT5cblxuICAgICMgc3BsaXQgdG8gaGFuZGxlIG11bHRpcGxlIGRrZXlzXG4gICAgZEtleXMgPSBKU09OLnN0cmluZ2lmeShkS2V5LnJlcGxhY2UoL1teYS1mMC05XS9nLFwiIFwiKS5zcGxpdCgvXFxzKy8pKVxuXG4gICAgQHRyaWdnZXIgXCJzdGF0dXNcIiwgXCJpbXBvcnQgbG9va3VwXCJcblxuICAgICQuYWpheCBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyhcImdyb3VwXCIsIFwiYnlES2V5XCIpLFxuICAgICAgdHlwZTogXCJQT1NUXCJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25wXCJcbiAgICAgIGRhdGE6IGtleXM6IGRLZXlzXG4gICAgICBzdWNjZXNzOiAoZGF0YSkgPT5cbiAgICAgICAgZG9jTGlzdCA9IFtdXG4gICAgICAgIGZvciBkYXR1bSBpbiBkYXRhLnJvd3NcbiAgICAgICAgICBkb2NMaXN0LnB1c2ggZGF0dW0uaWRcbiAgICAgICAgJC5jb3VjaC5yZXBsaWNhdGUoXG4gICAgICAgICAgVGFuZ2VyaW5lLnNldHRpbmdzLnVybERCKFwiZ3JvdXBcIiksXG4gICAgICAgICAgVGFuZ2VyaW5lLnNldHRpbmdzLnVybERCKFwibG9jYWxcIiksXG4gICAgICAgICAgICBzdWNjZXNzOiAgICAgID0+IEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IHN1Y2Nlc3NcIlxuICAgICAgICAgICAgZXJyb3I6IChhLCBiKSA9PiBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBlcnJvclwiLCBcIiN7YX0gI3tifVwiXG4gICAgICAgICAgLFxuICAgICAgICAgICAgZG9jX2lkczogZG9jTGlzdFxuICAgICAgICApXG5cbiAgICBmYWxzZVxuXG5cbiAgZHVwbGljYXRlOiAoYXNzZXNzbWVudEF0dHJpYnV0ZXMsIHN1YnRlc3RBdHRyaWJ1dGVzLCBxdWVzdGlvbkF0dHJpYnV0ZXMsIGNhbGxiYWNrKSAtPlxuXG4gICAgb3JpZ2luYWxJZCA9IEBpZFxuXG4gICAgbmV3TW9kZWwgPSBAY2xvbmUoKVxuICAgIG5ld01vZGVsLnNldCBhc3Nlc3NtZW50QXR0cmlidXRlc1xuICAgIG5ld0lkID0gVXRpbHMuZ3VpZCgpXG5cbiAgICBuZXdNb2RlbC5zYXZlXG4gICAgICBcIl9pZFwiICAgICAgICAgIDogbmV3SWRcbiAgICAgIFwiY3VycmljdWx1bUlkXCIgOiBuZXdJZFxuICAgICxcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnNcbiAgICAgICAgcXVlc3Rpb25zLmZldGNoXG4gICAgICAgICAga2V5OiBcInFcIiArIG9yaWdpbmFsSWRcbiAgICAgICAgICBzdWNjZXNzOiAoIHF1ZXN0aW9ucyApID0+XG4gICAgICAgICAgICBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgc3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICAgICAga2V5OiBcInNcIiArIG9yaWdpbmFsSWRcbiAgICAgICAgICAgICAgc3VjY2VzczogKCBzdWJ0ZXN0cyApID0+XG4gICAgICAgICAgICAgICAgZmlsdGVyZWRTdWJ0ZXN0cyA9IHN1YnRlc3RzLm1vZGVsc1xuICAgICAgICAgICAgICAgIHN1YnRlc3RJZE1hcCA9IHt9XG4gICAgICAgICAgICAgICAgbmV3U3VidGVzdHMgPSBbXVxuICAgICAgICAgICAgICAgICMgbGluayBuZXcgc3VidGVzdHMgdG8gbmV3IGFzc2Vzc21lbnRcbiAgICAgICAgICAgICAgICBmb3IgbW9kZWwsIGkgaW4gZmlsdGVyZWRTdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgbmV3U3VidGVzdCA9IG1vZGVsLmNsb25lKClcbiAgICAgICAgICAgICAgICAgIG5ld1N1YnRlc3Quc2V0IFwiY3VycmljdWx1bUlkXCIsIG5ld01vZGVsLmlkXG4gICAgICAgICAgICAgICAgICBuZXdTdWJ0ZXN0SWQgPSBVdGlscy5ndWlkKClcbiAgICAgICAgICAgICAgICAgIHN1YnRlc3RJZE1hcFtuZXdTdWJ0ZXN0LmlkXSA9IG5ld1N1YnRlc3RJZFxuICAgICAgICAgICAgICAgICAgbmV3U3VidGVzdC5zZXQgXCJfaWRcIiwgbmV3U3VidGVzdElkXG4gICAgICAgICAgICAgICAgICBuZXdTdWJ0ZXN0cy5wdXNoIG5ld1N1YnRlc3RcblxuXG4gICAgICAgICAgICAgICAgIyB1cGRhdGUgdGhlIGxpbmtzIHRvIG90aGVyIHN1YnRlc3RzXG4gICAgICAgICAgICAgICAgZm9yIG1vZGVsLCBpIGluIG5ld1N1YnRlc3RzXG4gICAgICAgICAgICAgICAgICBncmlkSWQgPSBtb2RlbC5nZXQoIFwiZ3JpZExpbmtJZFwiIClcbiAgICAgICAgICAgICAgICAgIGlmICggZ3JpZElkIHx8IFwiXCIgKSAhPSBcIlwiXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsLnNldCBcImdyaWRMaW5rSWRcIiwgc3VidGVzdElkTWFwW2dyaWRJZF1cbiAgICAgICAgICAgICAgICAgIG1vZGVsLnNhdmUoKVxuXG4gICAgICAgICAgICAgICAgbmV3UXVlc3Rpb25zID0gW11cbiAgICAgICAgICAgICAgICAjIGxpbmsgcXVlc3Rpb25zIHRvIG5ldyBzdWJ0ZXN0XG4gICAgICAgICAgICAgICAgZm9yIHF1ZXN0aW9uIGluIHF1ZXN0aW9ucy5tb2RlbHNcbiAgICAgICAgICAgICAgICAgIG5ld1F1ZXN0aW9uID0gcXVlc3Rpb24uY2xvbmUoKVxuICAgICAgICAgICAgICAgICAgb2xkSWQgPSBuZXdRdWVzdGlvbi5nZXQgXCJzdWJ0ZXN0SWRcIlxuICAgICAgICAgICAgICAgICAgbmV3UXVlc3Rpb24uc2V0IFwiY3VycmljdWx1bUlkXCIsIG5ld01vZGVsLmlkXG4gICAgICAgICAgICAgICAgICBuZXdRdWVzdGlvbi5zZXQgXCJfaWRcIiwgVXRpbHMuZ3VpZCgpIFxuICAgICAgICAgICAgICAgICAgbmV3UXVlc3Rpb24uc2V0IFwic3VidGVzdElkXCIsIHN1YnRlc3RJZE1hcFtvbGRJZF1cbiAgICAgICAgICAgICAgICAgIG5ld1F1ZXN0aW9ucy5wdXNoIG5ld1F1ZXN0aW9uXG4gICAgICAgICAgICAgICAgICBuZXdRdWVzdGlvbi5zYXZlKClcbiAgICAgICAgICAgICAgICBjYWxsYmFjayBuZXdNb2RlbFxuXG5cbiAgZGVzdHJveTogKGNhbGxiYWNrKSAtPlxuXG4gICAgIyByZW1vdmUgY2hpbGRyZW5cbiAgICBjdXJyaWN1bHVtSWQgPSBAaWRcbiAgICBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgIHN1YnRlc3RzLmZldGNoXG4gICAgICBrZXk6IGN1cnJpY3VsdW1JZFxuICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pIC0+IGNvbGxlY3Rpb24ucG9wKCkuZGVzdHJveSgpIHdoaWxlIGNvbGxlY3Rpb24ubGVuZ3RoICE9IDBcblxuICAgICMgcmVtb3ZlIG1vZGVsXG4gICAgc3VwZXJcbiAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgIGNhbGxiYWNrKClcblxuXG4gIGRlc3Ryb3k6ID0+XG5cbiAgICAjIGdldCBhbGwgZG9jcyB0aGF0IGJlbG9uZyB0byB0aGlzIGFzc2Vzc3NtZW50IGV4Y2VwdCByZXN1bHRzXG4gICAgVGFuZ2VyaW5lLiRkYi52aWV3IFRhbmdlcmluZS5kZXNpZ25fZG9jICsgXCIvcmV2QnlBc3Nlc3NtZW50SWRcIixcbiAgICAgIGtleXM6WyBAaWQgXVxuICAgICAgZXJyb3I6IC0+XG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiRGVsZXRlIGVycm9yLlwiXG4gICAgICBzdWNjZXNzOiAocmVzcG9uc2UpID0+XG4gICAgICAgIGRvY3MgPSBbXVxuICAgICAgICBmb3Igcm93IGluIHJlc3BvbnNlLnJvd3NcbiAgICAgICAgICAjIG9ubHkgYWJzb2x1dGVseSBuZWNlc3NhcnkgcHJvcGVydGllcyBhcmUgc2VudCBiYWNrLCBfaWQsIF9yZXYsIF9kZWxldGVkXG4gICAgICAgICAgcm93LnZhbHVlW1wiX2RlbGV0ZWRcIl0gPSB0cnVlXG4gICAgICAgICAgZG9jcy5wdXNoIHJvdy52YWx1ZVxuXG4gICAgICAgIHJlcXVlc3REYXRhID0gXG4gICAgICAgICAgXCJkb2NzXCIgOiBkb2NzXG5cbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgdHlwZTogXCJQT1NUXCJcbiAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PVVURi04XCJcbiAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgICAgICB1cmw6IFRhbmdlcmluZS5zZXR0aW5ncy51cmxCdWxrRG9jcygpXG4gICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkocmVxdWVzdERhdGEpXG4gICAgICAgICAgZXJyb3I6IC0+XG4gICAgICAgICAgICBVdGlscy5taWRBbGVydCBcIkRlbGV0ZSBlcnJvci5cIlxuICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZXMpID0+XG4gICAgICAgICAgICBva0NvdW50ID0gMFxuICAgICAgICAgICAgKG9rQ291bnQrKyBpZiByZXNwLm9rPykgZm9yIHJlc3AgaW4gcmVzcG9uc2VzXG4gICAgICAgICAgICBpZiBva0NvdW50ID09IHJlc3BvbnNlcy5sZW5ndGhcbiAgICAgICAgICAgICAgQGNvbGxlY3Rpb24ucmVtb3ZlIEBpZFxuICAgICAgICAgICAgICBAY2xlYXIoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBVdGlscy5taWRBbGVydCBcIkRlbGV0ZSBlcnJvci5cIlxuXG4iXX0=
