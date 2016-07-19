var AssessmentDataEntryView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AssessmentDataEntryView = (function(superClass) {
  extend(AssessmentDataEntryView, superClass);

  function AssessmentDataEntryView() {
    this.saveResult = bind(this.saveResult, this);
    this.updateCurrent = bind(this.updateCurrent, this);
    return AssessmentDataEntryView.__super__.constructor.apply(this, arguments);
  }

  AssessmentDataEntryView.prototype.events = {
    "change #subtest_select": "updateCurrent",
    'click .prev_subtest': 'prevSubtest',
    'click .next_subtest': 'nextSubtest',
    'click .save': 'saveResult'
  };

  AssessmentDataEntryView.prototype.prevSubtest = function() {
    var select;
    select = document.getElementById("subtest_select");
    if (select.selectedIndex === 0) {
      return;
    }
    select.selectedIndex = select.selectedIndex - 1;
    return this.updateCurrent();
  };

  AssessmentDataEntryView.prototype.nextSubtest = function() {
    var select;
    select = document.getElementById("subtest_select");
    if (select.selectedIndex === $("#subtest_select option").length - 1) {
      return;
    }
    select.selectedIndex = select.selectedIndex + 1;
    return this.updateCurrent();
  };

  AssessmentDataEntryView.prototype.initialize = function(options) {
    var key, value;
    this.savedOn = {};
    for (key in options) {
      value = options[key];
      this[key] = value;
    }
    this.result = new Result({
      assessmentId: this.assessment.id,
      dataEntry: true,
      blank: true
    });
    this.views = [];
    return this.viewsBySubtestId = {};
  };

  AssessmentDataEntryView.prototype.render = function() {
    var i, j, len, prototype, ref, selector, subtest, subtests, view;
    selector = "<button class='prev_subtest'>&lt;</button> <select id='subtest_select'> " + (((function() {
      var j, len, ref, results;
      ref = this.assessment.subtests.models;
      results = [];
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        subtest = ref[i];
        results.push("<option data-subtestId='" + subtest.id + "' " + (i === 0 ? "selected='selected'" : '') + ">" + (subtest.get("name")) + "</option>");
      }
      return results;
    }).call(this)).join('')) + " </select> <button class='next_subtest'>&gt;</button> <br>";
    subtests = "<section id='current_subtest'> " + (((function() {
      var j, len, ref, results;
      ref = this.assessment.subtests.models;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        subtest = ref[j];
        results.push("<div id='" + subtest.id + "' class='confirmation subtest_container'></div>");
      }
      return results;
    }).call(this)).join('')) + " </section>";
    this.$el.html("<a href='#assessments'><button class='navigation'>Back</button></a><br> <h1>" + (this.assessment.escape("name")) + "</h1> " + selector + " <button class='command save'>Save</button> <small class='small_grey last_saved'></small> " + subtests);
    ref = this.assessment.subtests.models;
    for (j = 0, len = ref.length; j < len; j++) {
      subtest = ref[j];
      prototype = subtest.get("prototype");
      this[prototype + "Init"](subtest);
    }
    this.$subEl = this.$el.find("#current_subtest");
    this.updateCurrent();
    this.result.set("subtestData", (function() {
      var k, len1, ref1, results;
      ref1 = this.views;
      results = [];
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        view = ref1[k];
        results.push(this.subtestDataObject(view.model));
      }
      return results;
    }).call(this));
    this.result.add({
      name: "Assessment complete",
      prototype: "complete",
      data: {
        "comment": "Data entry feature",
        "end_time": (new Date()).getTime()
      },
      subtestId: "result"
    });
    return this.trigger("rendered");
  };

  AssessmentDataEntryView.prototype.updateCurrent = function() {
    Utils.working(true);
    return this.saveResult({
      error: (function(_this) {
        return function() {
          Utils.midAlert("Result save error");
          return Utils.working(false);
        };
      })(this),
      success: (function(_this) {
        return function() {
          Utils.working(false);
          _this.subtestId = _this.$el.find("#subtest_select option:selected").attr("data-subtestId");
          _this.$subEl.find(".subtest_container").hide();
          _this.$subEl.find("#" + _this.subtestId).show();
          _this.subtest = _this.assessment.subtests.get(_this.subtestId);
          _this.trigger("rendered");
          return _this.savedOn[_this.subtestId] = true;
        };
      })(this)
    });
  };

  AssessmentDataEntryView.prototype.saveResult = function(callbacks) {
    if (callbacks == null) {
      callbacks = {};
    }
    if (this.subtest == null) {
      return callbacks.success();
    }
    this.result.insert(this.subtestDataObject(this.subtest));
    return this.result.save(null, {
      success: (function(_this) {
        return function(model) {
          _this.$el.find(".last_saved").html("Last saved: " + moment(new Date(_this.result.get('updated'))).format('MMM DD HH:mm'));
          return typeof callbacks.success === "function" ? callbacks.success(model) : void 0;
        };
      })(this),
      error: (function(_this) {
        return function(error, msg) {
          console.log("save error");
          console.log(arguments);
          return typeof callbacks.error === "function" ? callbacks.error(error, msg) : void 0;
        };
      })(this)
    });
  };

  AssessmentDataEntryView.prototype.updateCompletedResult = function() {
    var result;
    if (_.keys(this.savedOn).length === this.views.length) {
      result = {
        name: "Assessment complete",
        prototype: "complete",
        data: {
          "comment": this.$el.find('#additional_comments').val() || "",
          "end_time": (new Date()).getTime()
        },
        subtestId: "result"
      };
      if (!this.completedAlready) {
        this.result.add(result);
        return this.completedAlready = true;
      } else {
        this.result.insert(result);
        return this.resultSave();
      }
    }
  };

  AssessmentDataEntryView.prototype.subtestDataObject = function(subtest) {
    var view;
    view = this.viewsBySubtestId[subtest.id];
    return {
      name: subtest.get("name"),
      data: view.getResult(),
      subtestHash: subtest.get("hash"),
      subtestId: subtest.id,
      prototype: subtest.get("prototype")
    };
  };

  AssessmentDataEntryView.prototype.gridInit = function(subtest) {
    var view;
    view = new GridRunView({
      model: subtest,
      dataEntry: true
    });
    return this.addRenderView(view, subtest);
  };

  AssessmentDataEntryView.prototype.surveyInit = function(subtest) {
    var view;
    view = new SurveyRunView({
      model: subtest,
      dataEntry: true,
      parent: {
        gridWasAutostopped: function() {
          return false;
        }
      }
    });
    return this.addRenderView(view, subtest);
  };

  AssessmentDataEntryView.prototype.locationInit = function(subtest) {
    var view;
    view = new LocationRunView({
      model: subtest,
      dataEntry: true
    });
    return this.addRenderView(view, subtest);
  };

  AssessmentDataEntryView.prototype.datetimeInit = function(subtest) {
    var view;
    view = new DatetimeRunView({
      model: subtest,
      dataEntry: true
    });
    return this.addRenderView(view, subtest);
  };

  AssessmentDataEntryView.prototype.idInit = function(subtest) {
    var view;
    view = new IdRunView({
      model: subtest,
      dataEntry: true
    });
    return this.addRenderView(view, subtest);
  };

  AssessmentDataEntryView.prototype.consentInit = function(subtest) {
    var view;
    view = new ConsentRunView({
      model: subtest,
      dataEntry: true
    });
    return this.addRenderView(view, subtest);
  };

  AssessmentDataEntryView.prototype.addRenderView = function(view, subtest) {
    var $element;
    $element = this.$el.find("#" + subtest.id);
    view.setElement($element);
    view.render();
    this.viewsBySubtestId[subtest.id] = view;
    return this.views.push(view);
  };

  return AssessmentDataEntryView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2Vzc21lbnQvQXNzZXNzbWVudERhdGFFbnRyeVZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsdUJBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs7b0NBRUosTUFBQSxHQUNFO0lBQUEsd0JBQUEsRUFBMkIsZUFBM0I7SUFDQSxxQkFBQSxFQUEyQixhQUQzQjtJQUVBLHFCQUFBLEVBQTJCLGFBRjNCO0lBR0EsYUFBQSxFQUFnQixZQUhoQjs7O29DQUtGLFdBQUEsR0FBYSxTQUFBO0FBQ1gsUUFBQTtJQUFBLE1BQUEsR0FBUyxRQUFRLENBQUMsY0FBVCxDQUF3QixnQkFBeEI7SUFDVCxJQUFVLE1BQU0sQ0FBQyxhQUFQLEtBQXdCLENBQWxDO0FBQUEsYUFBQTs7SUFDQSxNQUFNLENBQUMsYUFBUCxHQUF1QixNQUFNLENBQUMsYUFBUCxHQUF1QjtXQUM5QyxJQUFDLENBQUEsYUFBRCxDQUFBO0VBSlc7O29DQU9iLFdBQUEsR0FBYSxTQUFBO0FBQ1gsUUFBQTtJQUFBLE1BQUEsR0FBUyxRQUFRLENBQUMsY0FBVCxDQUF3QixnQkFBeEI7SUFDVCxJQUFVLE1BQU0sQ0FBQyxhQUFQLEtBQXdCLENBQUEsQ0FBRSx3QkFBRixDQUEyQixDQUFDLE1BQTVCLEdBQXFDLENBQXZFO0FBQUEsYUFBQTs7SUFDQSxNQUFNLENBQUMsYUFBUCxHQUF1QixNQUFNLENBQUMsYUFBUCxHQUF1QjtXQUU5QyxJQUFDLENBQUEsYUFBRCxDQUFBO0VBTFc7O29DQU9iLFVBQUEsR0FBWSxTQUFDLE9BQUQ7QUFDVixRQUFBO0lBQUEsSUFBQyxDQUFBLE9BQUQsR0FBVztBQUVYLFNBQUEsY0FBQTs7TUFBQSxJQUFFLENBQUEsR0FBQSxDQUFGLEdBQVM7QUFBVDtJQUNBLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxNQUFBLENBQ1o7TUFBQSxZQUFBLEVBQWUsSUFBQyxDQUFBLFVBQVUsQ0FBQyxFQUEzQjtNQUNBLFNBQUEsRUFBZSxJQURmO01BRUEsS0FB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O01BQ0EsU0FBQSxFQUFZLElBRFo7S0FEUztXQUdYLElBQUMsQ0FBQSxhQUFELENBQWUsSUFBZixFQUFxQixPQUFyQjtFQUpXOztvQ0FNYixhQUFBLEdBQWUsU0FBQyxJQUFELEVBQU8sT0FBUDtBQUNiLFFBQUE7SUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsR0FBQSxHQUFJLE9BQU8sQ0FBQyxFQUF0QjtJQUNYLElBQUksQ0FBQyxVQUFMLENBQWdCLFFBQWhCO0lBQ0EsSUFBSSxDQUFDLE1BQUwsQ0FBQTtJQUNBLElBQUMsQ0FBQSxnQkFBaUIsQ0FBQSxPQUFPLENBQUMsRUFBUixDQUFsQixHQUFnQztXQUVoQyxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxJQUFaO0VBTmE7Ozs7R0F2THFCLFFBQVEsQ0FBQyIsImZpbGUiOiJhc3Nlc3NtZW50L0Fzc2Vzc21lbnREYXRhRW50cnlWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQXNzZXNzbWVudERhdGFFbnRyeVZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgZXZlbnRzOiBcbiAgICBcImNoYW5nZSAjc3VidGVzdF9zZWxlY3RcIiA6IFwidXBkYXRlQ3VycmVudFwiXG4gICAgJ2NsaWNrIC5wcmV2X3N1YnRlc3QnICAgIDogJ3ByZXZTdWJ0ZXN0J1xuICAgICdjbGljayAubmV4dF9zdWJ0ZXN0JyAgICA6ICduZXh0U3VidGVzdCdcbiAgICAnY2xpY2sgLnNhdmUnIDogJ3NhdmVSZXN1bHQnXG5cbiAgcHJldlN1YnRlc3Q6IC0+XG4gICAgc2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdWJ0ZXN0X3NlbGVjdFwiKVxuICAgIHJldHVybiBpZiBzZWxlY3Quc2VsZWN0ZWRJbmRleCA9PSAwXG4gICAgc2VsZWN0LnNlbGVjdGVkSW5kZXggPSBzZWxlY3Quc2VsZWN0ZWRJbmRleCAtIDFcbiAgICBAdXBkYXRlQ3VycmVudCgpXG4gICAgXG5cbiAgbmV4dFN1YnRlc3Q6IC0+XG4gICAgc2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdWJ0ZXN0X3NlbGVjdFwiKVxuICAgIHJldHVybiBpZiBzZWxlY3Quc2VsZWN0ZWRJbmRleCA9PSAkKFwiI3N1YnRlc3Rfc2VsZWN0IG9wdGlvblwiKS5sZW5ndGggLSAxXG4gICAgc2VsZWN0LnNlbGVjdGVkSW5kZXggPSBzZWxlY3Quc2VsZWN0ZWRJbmRleCArIDFcblxuICAgIEB1cGRhdGVDdXJyZW50KClcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBAc2F2ZWRPbiA9IHt9XG4gICAgIyBhc3Nlc3NtZW50XG4gICAgQFtrZXldID0gdmFsdWUgZm9yIGtleSwgdmFsdWUgb2Ygb3B0aW9uc1xuICAgIEByZXN1bHQgPSBuZXcgUmVzdWx0XG4gICAgICBhc3Nlc3NtZW50SWQgOiBAYXNzZXNzbWVudC5pZFxuICAgICAgZGF0YUVudHJ5ICAgIDogdHJ1ZVxuICAgICAgYmxhbmsgICAgICAgIDogdHJ1ZVxuICAgIEB2aWV3cyA9IFtdXG4gICAgQHZpZXdzQnlTdWJ0ZXN0SWQgPSB7fVxuXG4gIHJlbmRlcjogLT5cblxuICAgIHNlbGVjdG9yID0gXCJcbiAgICAgIDxidXR0b24gY2xhc3M9J3ByZXZfc3VidGVzdCc+Jmx0OzwvYnV0dG9uPlxuICAgICAgPHNlbGVjdCBpZD0nc3VidGVzdF9zZWxlY3QnPlxuICAgICAgICAjeyhcIjxvcHRpb24gZGF0YS1zdWJ0ZXN0SWQ9JyN7c3VidGVzdC5pZH0nICN7aWYgaSBpcyAwIHRoZW4gXCJzZWxlY3RlZD0nc2VsZWN0ZWQnXCIgZWxzZSAnJ30+I3tzdWJ0ZXN0LmdldChcIm5hbWVcIil9PC9vcHRpb24+XCIgZm9yIHN1YnRlc3QsIGkgaW4gQGFzc2Vzc21lbnQuc3VidGVzdHMubW9kZWxzKS5qb2luKCcnKX1cbiAgICAgIDwvc2VsZWN0PiBcbiAgICAgIDxidXR0b24gY2xhc3M9J25leHRfc3VidGVzdCc+Jmd0OzwvYnV0dG9uPlxuICAgICAgPGJyPlxuICAgIFwiXG5cbiAgICBzdWJ0ZXN0cyA9IFwiXG4gICAgICA8c2VjdGlvbiBpZD0nY3VycmVudF9zdWJ0ZXN0Jz5cbiAgICAgICAgI3soXCI8ZGl2IGlkPScje3N1YnRlc3QuaWR9JyBjbGFzcz0nY29uZmlybWF0aW9uIHN1YnRlc3RfY29udGFpbmVyJz48L2Rpdj5cIiBmb3Igc3VidGVzdCBpbiBAYXNzZXNzbWVudC5zdWJ0ZXN0cy5tb2RlbHMpLmpvaW4oJycpfVxuICAgICAgPC9zZWN0aW9uPlxuICAgIFwiXG5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICAgIDxhIGhyZWY9JyNhc3Nlc3NtZW50cyc+PGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbic+QmFjazwvYnV0dG9uPjwvYT48YnI+XG5cbiAgICAgIDxoMT4je0Bhc3Nlc3NtZW50LmVzY2FwZShcIm5hbWVcIil9PC9oMT5cblxuICAgICAgI3tzZWxlY3Rvcn1cbiAgICAgIDxidXR0b24gY2xhc3M9J2NvbW1hbmQgc2F2ZSc+U2F2ZTwvYnV0dG9uPiA8c21hbGwgY2xhc3M9J3NtYWxsX2dyZXkgbGFzdF9zYXZlZCc+PC9zbWFsbD5cbiAgICAgICN7c3VidGVzdHN9XG4gICAgXCJcblxuICAgIGZvciBzdWJ0ZXN0IGluIEBhc3Nlc3NtZW50LnN1YnRlc3RzLm1vZGVsc1xuICAgICAgcHJvdG90eXBlID0gc3VidGVzdC5nZXQoXCJwcm90b3R5cGVcIilcbiAgICAgIEBbXCIje3Byb3RvdHlwZX1Jbml0XCJdKHN1YnRlc3QpXG5cbiAgICBAJHN1YkVsID0gQCRlbC5maW5kKFwiI2N1cnJlbnRfc3VidGVzdFwiKVxuXG4gICAgQHVwZGF0ZUN1cnJlbnQoKVxuXG4gICAgQHJlc3VsdC5zZXQgXCJzdWJ0ZXN0RGF0YVwiLCAoQHN1YnRlc3REYXRhT2JqZWN0KHZpZXcubW9kZWwpIGZvciB2aWV3IGluIEB2aWV3cylcblxuICAgIEByZXN1bHQuYWRkXG4gICAgICBuYW1lIDogXCJBc3Nlc3NtZW50IGNvbXBsZXRlXCJcbiAgICAgIHByb3RvdHlwZTogXCJjb21wbGV0ZVwiXG4gICAgICBkYXRhIDpcbiAgICAgICAgXCJjb21tZW50XCIgOiBcIkRhdGEgZW50cnkgZmVhdHVyZVwiXG4gICAgICAgIFwiZW5kX3RpbWVcIiA6IChuZXcgRGF0ZSgpKS5nZXRUaW1lKClcbiAgICAgIHN1YnRlc3RJZCA6IFwicmVzdWx0XCJcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4gIHVwZGF0ZUN1cnJlbnQ6ID0+XG5cbiAgICBVdGlscy53b3JraW5nIHRydWVcblxuICAgIEBzYXZlUmVzdWx0XG4gICAgICBlcnJvcjogPT5cbiAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJSZXN1bHQgc2F2ZSBlcnJvclwiXG4gICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgICAgQHN1YnRlc3RJZCA9IEAkZWwuZmluZChcIiNzdWJ0ZXN0X3NlbGVjdCBvcHRpb246c2VsZWN0ZWRcIikuYXR0cihcImRhdGEtc3VidGVzdElkXCIpXG4gICAgICAgIEAkc3ViRWwuZmluZChcIi5zdWJ0ZXN0X2NvbnRhaW5lclwiKS5oaWRlKClcbiAgICAgICAgQCRzdWJFbC5maW5kKFwiIyN7QHN1YnRlc3RJZH1cIikuc2hvdygpXG4gICAgICAgIEBzdWJ0ZXN0ID0gQGFzc2Vzc21lbnQuc3VidGVzdHMuZ2V0KEBzdWJ0ZXN0SWQpXG4gICAgICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuICAgICAgICBAc2F2ZWRPbltAc3VidGVzdElkXSA9IHRydWVcblxuICBzYXZlUmVzdWx0OiAoY2FsbGJhY2tzID0ge30pID0+XG5cbiAgICByZXR1cm4gY2FsbGJhY2tzLnN1Y2Nlc3MoKSB1bmxlc3MgQHN1YnRlc3Q/XG5cbiAgICBAcmVzdWx0Lmluc2VydCBAc3VidGVzdERhdGFPYmplY3QoQHN1YnRlc3QpXG5cbiAgICBAcmVzdWx0LnNhdmUgbnVsbCxcbiAgICAgIHN1Y2Nlc3M6IChtb2RlbCkgPT5cbiAgICAgICAgQCRlbC5maW5kKFwiLmxhc3Rfc2F2ZWRcIikuaHRtbCBcIkxhc3Qgc2F2ZWQ6IFwiICsgbW9tZW50KG5ldyBEYXRlKEByZXN1bHQuZ2V0KCd1cGRhdGVkJykpKS5mb3JtYXQoJ01NTSBERCBISDptbScpXG4gICAgICAgIGNhbGxiYWNrcy5zdWNjZXNzPyhtb2RlbClcbiAgICAgIGVycm9yOiAoZXJyb3IsIG1zZykgPT5cbiAgICAgICAgY29uc29sZS5sb2cgXCJzYXZlIGVycm9yXCJcbiAgICAgICAgY29uc29sZS5sb2cgYXJndW1lbnRzXG4gICAgICAgIGNhbGxiYWNrcy5lcnJvcj8oZXJyb3IsIG1zZylcblxuXG4gIHVwZGF0ZUNvbXBsZXRlZFJlc3VsdDogLT5cbiAgICBpZiBfLmtleXMoQHNhdmVkT24pLmxlbmd0aCA9PSBAdmlld3MubGVuZ3RoXG5cbiAgICAgIHJlc3VsdCA9IFxuICAgICAgICBuYW1lIDogXCJBc3Nlc3NtZW50IGNvbXBsZXRlXCJcbiAgICAgICAgcHJvdG90eXBlOiBcImNvbXBsZXRlXCJcbiAgICAgICAgZGF0YSA6XG4gICAgICAgICAgXCJjb21tZW50XCIgOiBAJGVsLmZpbmQoJyNhZGRpdGlvbmFsX2NvbW1lbnRzJykudmFsKCkgfHwgXCJcIlxuICAgICAgICAgIFwiZW5kX3RpbWVcIiA6IChuZXcgRGF0ZSgpKS5nZXRUaW1lKClcbiAgICAgICAgc3VidGVzdElkIDogXCJyZXN1bHRcIlxuXG4gICAgICBpZiBub3QgQGNvbXBsZXRlZEFscmVhZHlcbiAgICAgICAgQHJlc3VsdC5hZGQgcmVzdWx0XG4gICAgICAgIEBjb21wbGV0ZWRBbHJlYWR5ID0gdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICBAcmVzdWx0Lmluc2VydCByZXN1bHRcbiAgICAgICAgQHJlc3VsdFNhdmUoKVxuXG5cbiAgc3VidGVzdERhdGFPYmplY3Q6IChzdWJ0ZXN0KSAtPlxuXG4gICAgdmlldyA9IEB2aWV3c0J5U3VidGVzdElkW3N1YnRlc3QuaWRdXG5cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZSAgICAgICAgOiBzdWJ0ZXN0LmdldCBcIm5hbWVcIlxuICAgICAgZGF0YSAgICAgICAgOiB2aWV3LmdldFJlc3VsdCgpXG4gICAgICBzdWJ0ZXN0SGFzaCA6IHN1YnRlc3QuZ2V0IFwiaGFzaFwiXG4gICAgICBzdWJ0ZXN0SWQgICA6IHN1YnRlc3QuaWRcbiAgICAgIHByb3RvdHlwZSAgIDogc3VidGVzdC5nZXQgXCJwcm90b3R5cGVcIlxuICAgIH1cblxuICBncmlkSW5pdDogKHN1YnRlc3QpIC0+XG4gICAgdmlldyA9IG5ldyBHcmlkUnVuVmlldyBcbiAgICAgIG1vZGVsICAgICA6IHN1YnRlc3RcbiAgICAgIGRhdGFFbnRyeSA6IHRydWVcbiAgICBAYWRkUmVuZGVyVmlldyB2aWV3LCBzdWJ0ZXN0XG5cbiAgc3VydmV5SW5pdDogKHN1YnRlc3QpIC0+XG4gICAgdmlldyA9IG5ldyBTdXJ2ZXlSdW5WaWV3IFxuICAgICAgbW9kZWw6IHN1YnRlc3RcbiAgICAgIGRhdGFFbnRyeSA6IHRydWVcbiAgICAgIHBhcmVudDpcbiAgICAgICAgZ3JpZFdhc0F1dG9zdG9wcGVkOiAtPiByZXR1cm4gZmFsc2VcbiAgICBAYWRkUmVuZGVyVmlldyB2aWV3LCBzdWJ0ZXN0XG5cbiAgbG9jYXRpb25Jbml0OiAoc3VidGVzdCkgLT5cbiAgICB2aWV3ID0gbmV3IExvY2F0aW9uUnVuVmlldyBcbiAgICAgIG1vZGVsOiBzdWJ0ZXN0XG4gICAgICBkYXRhRW50cnkgOiB0cnVlXG5cbiAgICBAYWRkUmVuZGVyVmlldyB2aWV3LCBzdWJ0ZXN0XG5cbiAgZGF0ZXRpbWVJbml0OiAoc3VidGVzdCkgLT5cbiAgICB2aWV3ID0gbmV3IERhdGV0aW1lUnVuVmlldyBcbiAgICAgIG1vZGVsOiBzdWJ0ZXN0XG4gICAgICBkYXRhRW50cnkgOiB0cnVlXG4gICAgQGFkZFJlbmRlclZpZXcgdmlldywgc3VidGVzdFxuXG4gIGlkSW5pdDogKHN1YnRlc3QpIC0+XG4gICAgdmlldyA9IG5ldyBJZFJ1blZpZXcgXG4gICAgICBtb2RlbDogc3VidGVzdFxuICAgICAgZGF0YUVudHJ5IDogdHJ1ZVxuICAgIEBhZGRSZW5kZXJWaWV3IHZpZXcsIHN1YnRlc3RcblxuICBjb25zZW50SW5pdDogKHN1YnRlc3QpIC0+XG4gICAgdmlldyA9IG5ldyBDb25zZW50UnVuVmlldyBcbiAgICAgIG1vZGVsOiBzdWJ0ZXN0XG4gICAgICBkYXRhRW50cnkgOiB0cnVlXG4gICAgQGFkZFJlbmRlclZpZXcgdmlldywgc3VidGVzdFxuXG4gIGFkZFJlbmRlclZpZXc6ICh2aWV3LCBzdWJ0ZXN0KSAtPlxuICAgICRlbGVtZW50ID0gQCRlbC5maW5kKFwiIyN7c3VidGVzdC5pZH1cIilcbiAgICB2aWV3LnNldEVsZW1lbnQgJGVsZW1lbnRcbiAgICB2aWV3LnJlbmRlcigpXG4gICAgQHZpZXdzQnlTdWJ0ZXN0SWRbc3VidGVzdC5pZF0gPSB2aWV3XG4gICAgXG4gICAgQHZpZXdzLnB1c2ggdmlld1xuIl19
