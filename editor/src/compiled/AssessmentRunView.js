var AssessmentRunView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AssessmentRunView = (function(superClass) {
  extend(AssessmentRunView, superClass);

  function AssessmentRunView() {
    this.saveResult = bind(this.saveResult, this);
    this.reset = bind(this.reset, this);
    this.step = bind(this.step, this);
    this.skip = bind(this.skip, this);
    return AssessmentRunView.__super__.constructor.apply(this, arguments);
  }

  AssessmentRunView.prototype.className = "AssessmentRunView";

  AssessmentRunView.prototype.initialize = function(options) {
    var hasSequences, i, j, places, ref, resultView, sequences;
    this.abortAssessment = false;
    this.index = 0;
    this.model = options.model;
    this.orderMap = [];
    this.enableCorrections = false;
    Tangerine.tempData = {};
    this.rendered = {
      "assessment": false,
      "subtest": false
    };
    Tangerine.activity = "assessment run";
    this.subtestViews = [];
    this.model.subtests.sort();
    this.model.subtests.each((function(_this) {
      return function(model) {
        return _this.subtestViews.push(new SubtestRunView({
          model: model,
          parent: _this
        }));
      };
    })(this));
    hasSequences = this.model.has("sequences") && !_.isEmpty(_.compact(_.flatten(this.model.get("sequences"))));
    if (hasSequences) {
      sequences = this.model.get("sequences");
      places = Tangerine.settings.get("sequencePlaces");
      if (places == null) {
        places = {};
      }
      if (places[this.model.id] == null) {
        places[this.model.id] = 0;
      }
      if (places[this.model.id] < sequences.length - 1) {
        places[this.model.id]++;
      } else {
        places[this.model.id] = 0;
      }
      Tangerine.settings.save("sequencePlaces", places);
      this.orderMap = sequences[places[this.model.id]];
      this.orderMap[this.orderMap.length] = this.subtestViews.length;
    } else {
      for (i = j = 0, ref = this.subtestViews.length; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        this.orderMap[i] = i;
      }
    }
    this.result = new Result({
      assessmentId: this.model.id,
      assessmentName: this.model.get("name"),
      blank: true
    });
    if (hasSequences) {
      this.result.set({
        "order_map": this.orderMap
      });
    }
    resultView = new ResultView({
      model: this.result,
      assessment: this.model,
      assessmentView: this
    });
    return this.subtestViews.push(resultView);
  };

  AssessmentRunView.prototype.render = function() {
    var currentView;
    currentView = this.subtestViews[this.orderMap[this.index]];
    if (this.model.subtests.length === 0) {
      this.$el.html("<h1>Oops...</h1><p>\"" + (this.model.get('name')) + "\" is blank. Perhaps you meant to add some subtests.</p>");
      this.trigger("rendered");
    } else {
      this.$el.html("<h1>" + (this.model.get('name')) + "</h1> <div id='progress'></div>");
      this.$el.find('#progress').progressbar({
        value: (this.index + 1) / (this.model.subtests.length + 1) * 100
      });
      currentView.on("rendered", (function(_this) {
        return function() {
          return _this.flagRender("subtest");
        };
      })(this));
      currentView.on("subRendered", (function(_this) {
        return function() {
          return _this.trigger("subRendered");
        };
      })(this));
      currentView.on("next", (function(_this) {
        return function() {
          return _this.step(1);
        };
      })(this));
      currentView.on("back", (function(_this) {
        return function() {
          return _this.step(-1);
        };
      })(this));
      currentView.render();
      this.$el.append(currentView.el);
    }
    return this.flagRender("assessment");
  };

  AssessmentRunView.prototype.flagRender = function(object) {
    this.rendered[object] = true;
    if (this.rendered.assessment && this.rendered.subtest) {
      return this.trigger("rendered");
    }
  };

  AssessmentRunView.prototype.afterRender = function() {
    var ref;
    return (ref = this.subtestViews[this.orderMap[this.index]]) != null ? typeof ref.afterRender === "function" ? ref.afterRender() : void 0 : void 0;
  };

  AssessmentRunView.prototype.onClose = function() {
    var j, len, ref, view;
    ref = this.subtestViews;
    for (j = 0, len = ref.length; j < len; j++) {
      view = ref[j];
      view.close();
    }
    this.result.clear();
    return Tangerine.nav.setStudent("");
  };

  AssessmentRunView.prototype.abort = function() {
    this.abortAssessment = true;
    return this.step(1);
  };

  AssessmentRunView.prototype.skip = function() {
    var currentView;
    currentView = this.subtestViews[this.orderMap[this.index]];
    return this.result.add({
      name: currentView.model.get("name"),
      data: currentView.getSkipped(),
      subtestId: currentView.model.id,
      skipped: true,
      prototype: currentView.model.get("prototype")
    }, {
      success: (function(_this) {
        return function() {
          return _this.reset(1);
        };
      })(this)
    });
  };

  AssessmentRunView.prototype.step = function(increment) {
    var currentView;
    if (this.abortAssessment) {
      currentView = this.subtestViews[this.orderMap[this.index]];
      this.saveResult(currentView);
      return;
    }
    currentView = this.subtestViews[this.orderMap[this.index]];
    if (currentView.isValid()) {
      return this.saveResult(currentView, increment);
    } else {
      return currentView.showErrors();
    }
  };

  AssessmentRunView.prototype.reset = function(increment) {
    var currentView;
    this.rendered.subtest = false;
    this.rendered.assessment = false;
    currentView = this.subtestViews[this.orderMap[this.index]];
    currentView.close();
    this.index = this.abortAssessment === true ? this.subtestViews.length - 1 : this.index + increment;
    this.render();
    return window.scrollTo(0, 0);
  };

  AssessmentRunView.prototype.saveResult = function(currentView, increment) {
    var i, j, len, prototype, ref, result, subtestId, subtestReplace, subtestResult;
    subtestResult = currentView.getResult();
    subtestId = currentView.model.id;
    prototype = currentView.model.get("prototype");
    subtestReplace = null;
    ref = this.result.get('subtestData');
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      result = ref[i];
      if (subtestId === result.subtestId) {
        subtestReplace = i;
      }
    }
    if (subtestReplace !== null) {
      if (prototype !== 'gps') {
        this.result.insert({
          name: currentView.model.get("name"),
          data: subtestResult.body,
          subtestHash: subtestResult.meta.hash,
          subtestId: currentView.model.id,
          prototype: currentView.model.get("prototype")
        });
      }
      return this.reset(increment);
    } else {
      return this.result.add({
        name: currentView.model.get("name"),
        data: subtestResult.body,
        subtestHash: subtestResult.meta.hash,
        subtestId: currentView.model.id,
        prototype: currentView.model.get("prototype")
      }, {
        success: (function(_this) {
          return function() {
            return _this.reset(increment);
          };
        })(this)
      });
    }
  };

  return AssessmentRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2Vzc21lbnQvQXNzZXNzbWVudFJ1blZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsaUJBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs7Ozs4QkFFSixTQUFBLEdBQVk7OzhCQUVaLFVBQUEsR0FBWSxTQUFDLE9BQUQ7QUFFVixRQUFBO0lBQUEsSUFBQyxDQUFBLGVBQUQsR0FBbUI7SUFDbkIsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUNULElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO0lBQ2pCLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFDWixJQUFDLENBQUEsaUJBQUQsR0FBcUI7SUFFckIsU0FBUyxDQUFDLFFBQVYsR0FBcUI7SUFFckIsSUFBQyxDQUFBLFFBQUQsR0FBWTtNQUNWLFlBQUEsRUFBZSxLQURMO01BRVYsU0FBQSxFQUFZLEtBRkY7O0lBS1osU0FBUyxDQUFDLFFBQVYsR0FBcUI7SUFDckIsSUFBQyxDQUFBLFlBQUQsR0FBZ0I7SUFDaEIsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBaEIsQ0FBQTtJQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsUUFBUSxDQUFDLElBQWhCLENBQXFCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxLQUFEO2VBQ25CLEtBQUMsQ0FBQSxZQUFZLENBQUMsSUFBZCxDQUF1QixJQUFBLGNBQUEsQ0FDckI7VUFBQSxLQUFBLEVBQVMsS0FBVDtVQUNBLE1BQUEsRUFBUyxLQURUO1NBRHFCLENBQXZCO01BRG1CO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQjtJQUtBLFlBQUEsR0FBZSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxXQUFYLENBQUEsSUFBMkIsQ0FBSSxDQUFDLENBQUMsT0FBRixDQUFVLENBQUMsQ0FBQyxPQUFGLENBQVUsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxXQUFYLENBQVYsQ0FB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RyxTQUFBLEtBQWEsS0FBaEI7UUFDRSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FDRTtVQUFBLElBQUEsRUFBYyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQWxCLENBQXNCLE1BQXRCLENBQWQ7VUFDQSxJQUFBLEVBQWMsYUFBYSxDQUFDLElBRDVCO1VBRUEsV0FBQSxFQUFjLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFGakM7VUFHQSxTQUFBLEVBQWMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUhoQztVQUlBLFNBQUEsRUFBYyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQWxCLENBQXNCLFdBQXRCLENBSmQ7U0FERixFQURGOzthQU9BLElBQUMsQ0FBQSxLQUFELENBQU8sU0FBUCxFQVRGO0tBQUEsTUFBQTthQVlFLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUNFO1FBQUEsSUFBQSxFQUFjLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBbEIsQ0FBc0IsTUFBdEIsQ0FBZDtRQUNBLElBQUEsRUFBYyxhQUFhLENBQUMsSUFENUI7UUFFQSxXQUFBLEVBQWMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUZqQztRQUdBLFNBQUEsRUFBYyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBSGhDO1FBSUEsU0FBQSxFQUFjLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBbEIsQ0FBc0IsV0FBdEIsQ0FKZDtPQURGLEVBT0U7UUFBQSxPQUFBLEVBQVUsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDUixLQUFDLENBQUEsS0FBRCxDQUFPLFNBQVA7VUFEUTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVjtPQVBGLEVBWkY7O0VBWFU7Ozs7R0FsSmtCLFFBQVEsQ0FBQyIsImZpbGUiOiJhc3Nlc3NtZW50L0Fzc2Vzc21lbnRSdW5WaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQXNzZXNzbWVudFJ1blZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJBc3Nlc3NtZW50UnVuVmlld1wiXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICBAYWJvcnRBc3Nlc3NtZW50ID0gZmFsc2VcbiAgICBAaW5kZXggPSAwXG4gICAgQG1vZGVsID0gb3B0aW9ucy5tb2RlbFxuICAgIEBvcmRlck1hcCA9IFtdXG4gICAgQGVuYWJsZUNvcnJlY3Rpb25zID0gZmFsc2UgICMgdG9nZ2xlZCBpZiB1c2VyIGhpdHMgdGhlIGJhY2sgYnV0dG9uLlxuXG4gICAgVGFuZ2VyaW5lLnRlbXBEYXRhID0ge31cblxuICAgIEByZW5kZXJlZCA9IHtcbiAgICAgIFwiYXNzZXNzbWVudFwiIDogZmFsc2VcbiAgICAgIFwic3VidGVzdFwiIDogZmFsc2VcbiAgICB9XG5cbiAgICBUYW5nZXJpbmUuYWN0aXZpdHkgPSBcImFzc2Vzc21lbnQgcnVuXCJcbiAgICBAc3VidGVzdFZpZXdzID0gW11cbiAgICBAbW9kZWwuc3VidGVzdHMuc29ydCgpXG4gICAgQG1vZGVsLnN1YnRlc3RzLmVhY2ggKG1vZGVsKSA9PlxuICAgICAgQHN1YnRlc3RWaWV3cy5wdXNoIG5ldyBTdWJ0ZXN0UnVuVmlldyBcbiAgICAgICAgbW9kZWwgIDogbW9kZWxcbiAgICAgICAgcGFyZW50IDogQFxuXG4gICAgaGFzU2VxdWVuY2VzID0gQG1vZGVsLmhhcyhcInNlcXVlbmNlc1wiKSAmJiBub3QgXy5pc0VtcHR5KF8uY29tcGFjdChfLmZsYXR0ZW4oQG1vZGVsLmdldChcInNlcXVlbmNlc1wiKSkpKVxuXG4gICAgaWYgaGFzU2VxdWVuY2VzXG4gICAgICBzZXF1ZW5jZXMgPSBAbW9kZWwuZ2V0KFwic2VxdWVuY2VzXCIpXG5cbiAgICAgICMgZ2V0IG9yIGluaXRpYWxpemUgc2VxdWVuY2UgcGxhY2VzXG4gICAgICBwbGFjZXMgPSBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwic2VxdWVuY2VQbGFjZXNcIilcbiAgICAgIHBsYWNlcyA9IHt9IHVubGVzcyBwbGFjZXM/XG4gICAgICBwbGFjZXNbQG1vZGVsLmlkXSA9IDAgdW5sZXNzIHBsYWNlc1tAbW9kZWwuaWRdP1xuICAgICAgXG4gICAgICBpZiBwbGFjZXNbQG1vZGVsLmlkXSA8IHNlcXVlbmNlcy5sZW5ndGggLSAxXG4gICAgICAgIHBsYWNlc1tAbW9kZWwuaWRdKytcbiAgICAgIGVsc2VcbiAgICAgICAgcGxhY2VzW0Btb2RlbC5pZF0gPSAwXG5cbiAgICAgIFRhbmdlcmluZS5zZXR0aW5ncy5zYXZlKFwic2VxdWVuY2VQbGFjZXNcIiwgcGxhY2VzKVxuXG4gICAgICBAb3JkZXJNYXAgPSBzZXF1ZW5jZXNbcGxhY2VzW0Btb2RlbC5pZF1dXG4gICAgICBAb3JkZXJNYXBbQG9yZGVyTWFwLmxlbmd0aF0gPSBAc3VidGVzdFZpZXdzLmxlbmd0aFxuICAgIGVsc2VcbiAgICAgIGZvciBpIGluIFswLi5Ac3VidGVzdFZpZXdzLmxlbmd0aF1cbiAgICAgICAgQG9yZGVyTWFwW2ldID0gaVxuXG4gICAgQHJlc3VsdCA9IG5ldyBSZXN1bHRcbiAgICAgIGFzc2Vzc21lbnRJZCAgIDogQG1vZGVsLmlkXG4gICAgICBhc3Nlc3NtZW50TmFtZSA6IEBtb2RlbC5nZXQgXCJuYW1lXCJcbiAgICAgIGJsYW5rICAgICAgICAgIDogdHJ1ZVxuXG4gICAgaWYgaGFzU2VxdWVuY2VzIHRoZW4gQHJlc3VsdC5zZXQoXCJvcmRlcl9tYXBcIiA6IEBvcmRlck1hcClcblxuICAgIHJlc3VsdFZpZXcgPSBuZXcgUmVzdWx0Vmlld1xuICAgICAgbW9kZWwgICAgICAgICAgOiBAcmVzdWx0XG4gICAgICBhc3Nlc3NtZW50ICAgICA6IEBtb2RlbFxuICAgICAgYXNzZXNzbWVudFZpZXcgOiBAXG4gICAgQHN1YnRlc3RWaWV3cy5wdXNoIHJlc3VsdFZpZXdcblxuICByZW5kZXI6IC0+XG4gICAgY3VycmVudFZpZXcgPSBAc3VidGVzdFZpZXdzW0BvcmRlck1hcFtAaW5kZXhdXVxuICAgIFxuICAgIGlmIEBtb2RlbC5zdWJ0ZXN0cy5sZW5ndGggPT0gMFxuICAgICAgQCRlbC5odG1sIFwiPGgxPk9vcHMuLi48L2gxPjxwPlxcXCIje0Btb2RlbC5nZXQgJ25hbWUnfVxcXCIgaXMgYmxhbmsuIFBlcmhhcHMgeW91IG1lYW50IHRvIGFkZCBzb21lIHN1YnRlc3RzLjwvcD5cIlxuICAgICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4gICAgZWxzZVxuICAgICAgQCRlbC5odG1sIFwiXG4gICAgICAgIDxoMT4je0Btb2RlbC5nZXQgJ25hbWUnfTwvaDE+XG4gICAgICAgIDxkaXYgaWQ9J3Byb2dyZXNzJz48L2Rpdj5cbiAgICAgIFwiXG4gICAgICBAJGVsLmZpbmQoJyNwcm9ncmVzcycpLnByb2dyZXNzYmFyIHZhbHVlIDogKCAoIEBpbmRleCArIDEgKSAvICggQG1vZGVsLnN1YnRlc3RzLmxlbmd0aCArIDEgKSAqIDEwMCApXG5cbiAgICAgIGN1cnJlbnRWaWV3Lm9uIFwicmVuZGVyZWRcIiwgICAgPT4gQGZsYWdSZW5kZXIgXCJzdWJ0ZXN0XCIgIFxuICAgICAgY3VycmVudFZpZXcub24gXCJzdWJSZW5kZXJlZFwiLCA9PiBAdHJpZ2dlciBcInN1YlJlbmRlcmVkXCJcblxuICAgICAgY3VycmVudFZpZXcub24gXCJuZXh0XCIsICAgID0+IEBzdGVwIDFcbiAgICAgIGN1cnJlbnRWaWV3Lm9uIFwiYmFja1wiLCAgICA9PiBAc3RlcCAtMVxuXG4gICAgICBjdXJyZW50Vmlldy5yZW5kZXIoKVxuICAgICAgQCRlbC5hcHBlbmQgY3VycmVudFZpZXcuZWxcblxuICAgIEBmbGFnUmVuZGVyIFwiYXNzZXNzbWVudFwiXG5cbiAgZmxhZ1JlbmRlcjogKG9iamVjdCkgLT5cbiAgICBAcmVuZGVyZWRbb2JqZWN0XSA9IHRydWVcblxuICAgIGlmIEByZW5kZXJlZC5hc3Nlc3NtZW50ICYmIEByZW5kZXJlZC5zdWJ0ZXN0XG4gICAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuXG4gIGFmdGVyUmVuZGVyOiAtPlxuICAgIEBzdWJ0ZXN0Vmlld3NbQG9yZGVyTWFwW0BpbmRleF1dPy5hZnRlclJlbmRlcj8oKVxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgZm9yIHZpZXcgaW4gQHN1YnRlc3RWaWV3c1xuICAgICAgdmlldy5jbG9zZSgpXG4gICAgQHJlc3VsdC5jbGVhcigpXG4gICAgVGFuZ2VyaW5lLm5hdi5zZXRTdHVkZW50IFwiXCJcbiAgICBcbiAgYWJvcnQ6IC0+XG4gICAgQGFib3J0QXNzZXNzbWVudCA9IHRydWVcbiAgICBAc3RlcCAxXG5cbiAgc2tpcDogPT5cbiAgICBjdXJyZW50VmlldyA9IEBzdWJ0ZXN0Vmlld3NbQG9yZGVyTWFwW0BpbmRleF1dXG4gICAgQHJlc3VsdC5hZGRcbiAgICAgIG5hbWUgICAgICA6IGN1cnJlbnRWaWV3Lm1vZGVsLmdldCBcIm5hbWVcIlxuICAgICAgZGF0YSAgICAgIDogY3VycmVudFZpZXcuZ2V0U2tpcHBlZCgpXG4gICAgICBzdWJ0ZXN0SWQgOiBjdXJyZW50Vmlldy5tb2RlbC5pZFxuICAgICAgc2tpcHBlZCAgIDogdHJ1ZVxuICAgICAgcHJvdG90eXBlIDogY3VycmVudFZpZXcubW9kZWwuZ2V0IFwicHJvdG90eXBlXCJcbiAgICAsXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBAcmVzZXQgMVxuXG4gIHN0ZXA6IChpbmNyZW1lbnQpID0+XG5cbiAgICBpZiBAYWJvcnRBc3Nlc3NtZW50XG4gICAgICBjdXJyZW50VmlldyA9IEBzdWJ0ZXN0Vmlld3NbQG9yZGVyTWFwW0BpbmRleF1dXG4gICAgICBAc2F2ZVJlc3VsdCggY3VycmVudFZpZXcgKVxuICAgICAgcmV0dXJuIFxuXG4gICAgY3VycmVudFZpZXcgPSBAc3VidGVzdFZpZXdzW0BvcmRlck1hcFtAaW5kZXhdXVxuICAgIGlmIGN1cnJlbnRWaWV3LmlzVmFsaWQoKVxuICAgICAgQHNhdmVSZXN1bHQoIGN1cnJlbnRWaWV3LCBpbmNyZW1lbnQgKVxuICAgIGVsc2VcbiAgICAgIGN1cnJlbnRWaWV3LnNob3dFcnJvcnMoKVxuXG4gIHJlc2V0OiAoaW5jcmVtZW50KSA9PlxuICAgIEByZW5kZXJlZC5zdWJ0ZXN0ID0gZmFsc2VcbiAgICBAcmVuZGVyZWQuYXNzZXNzbWVudCA9IGZhbHNlXG4gICAgY3VycmVudFZpZXcgPSBAc3VidGVzdFZpZXdzW0BvcmRlck1hcFtAaW5kZXhdXVxuICAgIGN1cnJlbnRWaWV3LmNsb3NlKClcbiAgICBAaW5kZXggPSBcbiAgICAgIGlmIEBhYm9ydEFzc2Vzc21lbnQgPT0gdHJ1ZVxuICAgICAgICBAc3VidGVzdFZpZXdzLmxlbmd0aC0xXG4gICAgICBlbHNlXG4gICAgICAgIEBpbmRleCArIGluY3JlbWVudFxuICAgIEByZW5kZXIoKVxuICAgIHdpbmRvdy5zY3JvbGxUbyAwLCAwXG5cblxuICBzYXZlUmVzdWx0OiAoIGN1cnJlbnRWaWV3LCBpbmNyZW1lbnQgKSA9PlxuXG4gICAgc3VidGVzdFJlc3VsdCA9IGN1cnJlbnRWaWV3LmdldFJlc3VsdCgpXG4gICAgc3VidGVzdElkID0gY3VycmVudFZpZXcubW9kZWwuaWRcbiAgICBwcm90b3R5cGUgPSBjdXJyZW50Vmlldy5tb2RlbC5nZXQgXCJwcm90b3R5cGVcIlxuICAgIHN1YnRlc3RSZXBsYWNlID0gbnVsbFxuXG4gICAgZm9yIHJlc3VsdCwgaSBpbiBAcmVzdWx0LmdldCgnc3VidGVzdERhdGEnKVxuICAgICAgaWYgc3VidGVzdElkID09IHJlc3VsdC5zdWJ0ZXN0SWRcbiAgICAgICAgc3VidGVzdFJlcGxhY2UgPSBpXG5cbiAgICBpZiBzdWJ0ZXN0UmVwbGFjZSAhPSBudWxsXG4gICAgICAjIERvbid0IHVwZGF0ZSB0aGUgZ3BzIHN1YnRlc3QuXG4gICAgICBpZiBwcm90b3R5cGUgIT0gJ2dwcydcbiAgICAgICAgQHJlc3VsdC5pbnNlcnRcbiAgICAgICAgICBuYW1lICAgICAgICA6IGN1cnJlbnRWaWV3Lm1vZGVsLmdldCBcIm5hbWVcIlxuICAgICAgICAgIGRhdGEgICAgICAgIDogc3VidGVzdFJlc3VsdC5ib2R5XG4gICAgICAgICAgc3VidGVzdEhhc2ggOiBzdWJ0ZXN0UmVzdWx0Lm1ldGEuaGFzaFxuICAgICAgICAgIHN1YnRlc3RJZCAgIDogY3VycmVudFZpZXcubW9kZWwuaWRcbiAgICAgICAgICBwcm90b3R5cGUgICA6IGN1cnJlbnRWaWV3Lm1vZGVsLmdldCBcInByb3RvdHlwZVwiXG4gICAgICBAcmVzZXQgaW5jcmVtZW50XG5cbiAgICBlbHNlXG4gICAgICBAcmVzdWx0LmFkZFxuICAgICAgICBuYW1lICAgICAgICA6IGN1cnJlbnRWaWV3Lm1vZGVsLmdldCBcIm5hbWVcIlxuICAgICAgICBkYXRhICAgICAgICA6IHN1YnRlc3RSZXN1bHQuYm9keVxuICAgICAgICBzdWJ0ZXN0SGFzaCA6IHN1YnRlc3RSZXN1bHQubWV0YS5oYXNoXG4gICAgICAgIHN1YnRlc3RJZCAgIDogY3VycmVudFZpZXcubW9kZWwuaWRcbiAgICAgICAgcHJvdG90eXBlICAgOiBjdXJyZW50Vmlldy5tb2RlbC5nZXQgXCJwcm90b3R5cGVcIlxuICAgICAgLFxuICAgICAgICBzdWNjZXNzIDogPT5cbiAgICAgICAgICBAcmVzZXQgaW5jcmVtZW50Il19
