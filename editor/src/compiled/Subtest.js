var Subtest,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Subtest = (function(superClass) {
  extend(Subtest, superClass);

  function Subtest() {
    return Subtest.__super__.constructor.apply(this, arguments);
  }

  Subtest.prototype.url = "subtest";

  Subtest.prototype.initialize = function(options) {
    this.templates = Tangerine.templates.get("prototypeTemplates");
    if (this.has("surveyAttributes")) {
      if (this.get("assessmentId") !== this.get("surveyAttributes").assessmentId) {
        return this.save("surveyAttributes", {
          "_id": this.id,
          "assessmentId": this.get("assessmentId")
        });
      }
    }
  };

  Subtest.prototype.loadPrototypeTemplate = function(prototype) {
    var key, ref, value;
    ref = this.templates[prototype];
    for (key in ref) {
      value = ref[key];
      this.set(key, value);
    }
    return this.save();
  };

  Subtest.prototype.copyTo = function(options) {
    var assessmentId, callback, newId, newSubtest, order;
    assessmentId = options.assessmentId;
    callback = options.callback;
    order = options.order || 0;
    newSubtest = this.clone();
    newId = Utils.guid();
    if (newSubtest.has("surveyAttributes")) {
      newSubtest.set("surveyAttributes", {
        "_id": newId,
        "assessmentId": assessmentId
      });
    }
    return newSubtest.save({
      "_id": newId,
      "assessmentId": assessmentId,
      "order": order,
      "gridLinkId": ""
    }, {
      success: (function(_this) {
        return function() {
          var questions;
          questions = new Questions;
          return questions.fetch({
            key: "q" + _this.get("assessmentId"),
            error: function() {
              return Utils.sticky("There was an error copying.");
            },
            success: function(questionCollection) {
              var doOne, subtestQuestions;
              subtestQuestions = questionCollection.where({
                "subtestId": _this.id
              });
              doOne = function() {
                var newQuestion, question;
                question = subtestQuestions.pop();
                if (question) {
                  newQuestion = question.clone();
                  return newQuestion.save({
                    "assessmentId": assessmentId,
                    "_id": Utils.guid(),
                    "subtestId": newId
                  }, {
                    success: function() {
                      return doOne();
                    },
                    error: function() {
                      return Utils.sticky("There was an error copying.");
                    }
                  });
                } else {
                  Utils.midAlert("Subtest copied");
                  return callback();
                }
              };
              return doOne();
            }
          });
        };
      })(this)
    });
  };

  return Subtest;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvU3VidGVzdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxPQUFBO0VBQUE7OztBQUFNOzs7Ozs7O29CQUVKLEdBQUEsR0FBSzs7b0JBRUwsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxTQUFELEdBQWEsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFwQixDQUF3QixvQkFBeEI7SUFHYixJQUFHLElBQUMsQ0FBQSxHQUFELENBQUssa0JBQUwsQ0FBSDtNQUNFLElBQUcsSUFBQyxDQUFBLEdBQUQsQ0FBSyxjQUFMLENBQUEsS0FBd0IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxrQkFBTCxDQUF3QixDQUFDLFlBQXBEO2VBQ0UsSUFBQyxDQUFBLElBQUQsQ0FBTSxrQkFBTixFQUNFO1VBQUEsS0FBQSxFQUFRLElBQUMsQ0FBQSxFQUFUO1VBQ0EsY0FBQSxFQUFpQixJQUFDLENBQUEsR0FBRCxDQUFLLGNBQUwsQ0FEakI7U0FERixFQURGO09BREY7O0VBSlU7O29CQVVaLHFCQUFBLEdBQXVCLFNBQUMsU0FBRDtBQUNyQixRQUFBO0FBQUE7QUFBQSxTQUFBLFVBQUE7O01BQ0UsSUFBQyxDQUFBLEdBQUQsQ0FBSyxHQUFMLEVBQVUsS0FBVjtBQURGO1dBRUEsSUFBQyxDQUFBLElBQUQsQ0FBQTtFQUhxQjs7b0JBS3ZCLE1BQUEsR0FBUSxTQUFDLE9BQUQ7QUFFTixRQUFBO0lBQUEsWUFBQSxHQUFlLE9BQU8sQ0FBQztJQUN2QixRQUFBLEdBQWUsT0FBTyxDQUFDO0lBQ3ZCLEtBQUEsR0FBZSxPQUFPLENBQUMsS0FBUixJQUFpQjtJQUVoQyxVQUFBLEdBQWEsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQUNiLEtBQUEsR0FBUSxLQUFLLENBQUMsSUFBTixDQUFBO0lBR1IsSUFBRyxVQUFVLENBQUMsR0FBWCxDQUFlLGtCQUFmLENBQUg7TUFDRSxVQUFVLENBQUMsR0FBWCxDQUFlLGtCQUFmLEVBQ0U7UUFBQSxLQUFBLEVBQVEsS0FBUjtRQUNBLGNBQUEsRUFBaUIsWUFEakI7T0FERixFQURGOztXQUtBLFVBQVUsQ0FBQyxJQUFYLENBQ0U7TUFBQSxLQUFBLEVBQWlCLEtBQWpCO01BQ0EsY0FBQSxFQUFpQixZQURqQjtNQUVBLE9BQUEsRUFBaUIsS0FGakI7TUFHQSxZQUFBLEVBQWlCLEVBSGpCO0tBREYsRUFNRTtNQUFBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFFUCxjQUFBO1VBQUEsU0FBQSxHQUFZLElBQUk7aUJBQ2hCLFNBQVMsQ0FBQyxLQUFWLENBQ0U7WUFBQSxHQUFBLEVBQUssR0FBQSxHQUFNLEtBQUMsQ0FBQSxHQUFELENBQUssY0FBTCxDQUFYO1lBQ0EsS0FBQSxFQUFPLFNBQUE7cUJBQUcsS0FBSyxDQUFDLE1BQU4sQ0FBYSw2QkFBYjtZQUFILENBRFA7WUFFQSxPQUFBLEVBQVMsU0FBQyxrQkFBRDtBQUNQLGtCQUFBO2NBQUEsZ0JBQUEsR0FBbUIsa0JBQWtCLENBQUMsS0FBbkIsQ0FBeUI7Z0JBQUEsV0FBQSxFQUFjLEtBQUMsQ0FBQSxFQUFmO2VBQXpCO2NBRW5CLEtBQUEsR0FBUSxTQUFBO0FBQ04sb0JBQUE7Z0JBQUEsUUFBQSxHQUFXLGdCQUFnQixDQUFDLEdBQWpCLENBQUE7Z0JBQ1gsSUFBRyxRQUFIO2tCQUNFLFdBQUEsR0FBYyxRQUFRLENBQUMsS0FBVCxDQUFBO3lCQUNkLFdBQVcsQ0FBQyxJQUFaLENBQ0U7b0JBQUEsY0FBQSxFQUFpQixZQUFqQjtvQkFDQSxLQUFBLEVBQWlCLEtBQUssQ0FBQyxJQUFOLENBQUEsQ0FEakI7b0JBRUEsV0FBQSxFQUFpQixLQUZqQjttQkFERixFQUtFO29CQUFBLE9BQUEsRUFBUyxTQUFBOzZCQUNQLEtBQUEsQ0FBQTtvQkFETyxDQUFUO29CQUVBLEtBQUEsRUFBTyxTQUFBOzZCQUFHLEtBQUssQ0FBQyxNQUFOLENBQWEsNkJBQWI7b0JBQUgsQ0FGUDttQkFMRixFQUZGO2lCQUFBLE1BQUE7a0JBWUUsS0FBSyxDQUFDLFFBQU4sQ0FBZSxnQkFBZjt5QkFDQSxRQUFBLENBQUEsRUFiRjs7Y0FGTTtxQkFpQlIsS0FBQSxDQUFBO1lBcEJPLENBRlQ7V0FERjtRQUhPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFUO0tBTkY7RUFmTTs7OztHQW5CWSxRQUFRLENBQUMiLCJmaWxlIjoic3VidGVzdC9TdWJ0ZXN0LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgU3VidGVzdCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cbiAgdXJsOiBcInN1YnRlc3RcIlxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEB0ZW1wbGF0ZXMgPSBUYW5nZXJpbmUudGVtcGxhdGVzLmdldChcInByb3RvdHlwZVRlbXBsYXRlc1wiKVxuXG4gICAgIyBndWFyZW50ZWUgc3VydmV5IHBzZXVkbyBtb2RlbCBmb3Igb2JzZXJ2YXRpb25zXG4gICAgaWYgQGhhcyhcInN1cnZleUF0dHJpYnV0ZXNcIilcbiAgICAgIGlmIEBnZXQoXCJhc3Nlc3NtZW50SWRcIikgIT0gQGdldChcInN1cnZleUF0dHJpYnV0ZXNcIikuYXNzZXNzbWVudElkXG4gICAgICAgIEBzYXZlIFwic3VydmV5QXR0cmlidXRlc1wiLFxuICAgICAgICAgIFwiX2lkXCIgOiBAaWRcbiAgICAgICAgICBcImFzc2Vzc21lbnRJZFwiIDogQGdldChcImFzc2Vzc21lbnRJZFwiKVxuXG4gIGxvYWRQcm90b3R5cGVUZW1wbGF0ZTogKHByb3RvdHlwZSkgLT5cbiAgICBmb3Iga2V5LCB2YWx1ZSBvZiBAdGVtcGxhdGVzW3Byb3RvdHlwZV1cbiAgICAgIEBzZXQga2V5LCB2YWx1ZVxuICAgIEBzYXZlKClcblxuICBjb3B5VG86IChvcHRpb25zKSAtPlxuXG4gICAgYXNzZXNzbWVudElkID0gb3B0aW9ucy5hc3Nlc3NtZW50SWRcbiAgICBjYWxsYmFjayAgICAgPSBvcHRpb25zLmNhbGxiYWNrXG4gICAgb3JkZXIgICAgICAgID0gb3B0aW9ucy5vcmRlciB8fCAwXG4gICAgXG4gICAgbmV3U3VidGVzdCA9IEBjbG9uZSgpXG4gICAgbmV3SWQgPSBVdGlscy5ndWlkKClcblxuXG4gICAgaWYgbmV3U3VidGVzdC5oYXMoXCJzdXJ2ZXlBdHRyaWJ1dGVzXCIpXG4gICAgICBuZXdTdWJ0ZXN0LnNldCBcInN1cnZleUF0dHJpYnV0ZXNcIixcbiAgICAgICAgXCJfaWRcIiA6IG5ld0lkXG4gICAgICAgIFwiYXNzZXNzbWVudElkXCIgOiBhc3Nlc3NtZW50SWRcblxuICAgIG5ld1N1YnRlc3Quc2F2ZVxuICAgICAgXCJfaWRcIiAgICAgICAgICA6IG5ld0lkXG4gICAgICBcImFzc2Vzc21lbnRJZFwiIDogYXNzZXNzbWVudElkXG4gICAgICBcIm9yZGVyXCIgICAgICAgIDogb3JkZXJcbiAgICAgIFwiZ3JpZExpbmtJZFwiICAgOiBcIlwiXG4gICAgLFxuICAgICAgc3VjY2VzczogPT5cblxuICAgICAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zXG4gICAgICAgIHF1ZXN0aW9ucy5mZXRjaFxuICAgICAgICAgIGtleTogXCJxXCIgKyBAZ2V0KFwiYXNzZXNzbWVudElkXCIpXG4gICAgICAgICAgZXJyb3I6IC0+IFV0aWxzLnN0aWNreSBcIlRoZXJlIHdhcyBhbiBlcnJvciBjb3B5aW5nLlwiXG4gICAgICAgICAgc3VjY2VzczogKHF1ZXN0aW9uQ29sbGVjdGlvbikgPT5cbiAgICAgICAgICAgIHN1YnRlc3RRdWVzdGlvbnMgPSBxdWVzdGlvbkNvbGxlY3Rpb24ud2hlcmUgXCJzdWJ0ZXN0SWRcIiA6IEBpZFxuXG4gICAgICAgICAgICBkb09uZSA9IC0+IFxuICAgICAgICAgICAgICBxdWVzdGlvbiA9IHN1YnRlc3RRdWVzdGlvbnMucG9wKClcbiAgICAgICAgICAgICAgaWYgcXVlc3Rpb25cbiAgICAgICAgICAgICAgICBuZXdRdWVzdGlvbiA9IHF1ZXN0aW9uLmNsb25lKClcbiAgICAgICAgICAgICAgICBuZXdRdWVzdGlvbi5zYXZlXG4gICAgICAgICAgICAgICAgICBcImFzc2Vzc21lbnRJZFwiIDogYXNzZXNzbWVudElkXG4gICAgICAgICAgICAgICAgICBcIl9pZFwiICAgICAgICAgIDogVXRpbHMuZ3VpZCgpIFxuICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0SWRcIiAgICA6IG5ld0lkXG4gICAgICAgICAgICAgICAgLFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgZG9PbmUoKVxuICAgICAgICAgICAgICAgICAgZXJyb3I6IC0+IFV0aWxzLnN0aWNreSBcIlRoZXJlIHdhcyBhbiBlcnJvciBjb3B5aW5nLlwiXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAjIHNlbmQgdXNlciB0byBlZGl0IHBhZ2UgZm9yIHJlb3JkZXJpbmcgc3VidGVzdHNcbiAgICAgICAgICAgICAgICBVdGlscy5taWRBbGVydCBcIlN1YnRlc3QgY29waWVkXCJcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpXG5cbiAgICAgICAgICAgIGRvT25lKClcbiJdfQ==
