var ObservationPrintView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ObservationPrintView = (function(superClass) {
  extend(ObservationPrintView, superClass);

  function ObservationPrintView() {
    this.saveCurrentSurvey = bind(this.saveCurrentSurvey, this);
    this.updateObservationIndex = bind(this.updateObservationIndex, this);
    this.checkSurveyDisplay = bind(this.checkSurveyDisplay, this);
    this.checkIfOver = bind(this.checkIfOver, this);
    this.checkWarning = bind(this.checkWarning, this);
    this.checkObservationPace = bind(this.checkObservationPace, this);
    this.tick = bind(this.tick, this);
    return ObservationPrintView.__super__.constructor.apply(this, arguments);
  }

  ObservationPrintView.prototype.className = "ObservationPrintView";

  ObservationPrintView.prototype.events = {
    "click .start_time": "startObservations",
    "click .stop_time": "stopObservations",
    "click .done": "completeObservation"
  };

  ObservationPrintView.prototype.initialize = function(options) {
    this.model = options.model;
    return this.parent = options.parent;
  };

  ObservationPrintView.prototype.initializeSurvey = function() {
    var attributes, i, models;
    if (this.survey != null) {
      this.onClose();
    }
    attributes = $.extend(this.model.get('surveyAttributes'), {
      "_id": this.model.id
    });
    models = (function() {
      var j, ref, results;
      results = [];
      for (i = j = 1, ref = parseInt(this.model.get('totalSeconds') / this.model.get('intervalLength')); 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
        results.push(new Backbone.Model(attributes));
      }
      return results;
    }).call(this);
    models.unshift("");
    this.skippableView = new SurveyRunView({
      "model": models[1],
      "parent": this,
      "isObservation": true
    });
    return this.survey = {
      "models": models,
      "results": []
    };
  };

  ObservationPrintView.prototype.initializeFlags = function() {
    this.iAm = {
      "counting": false,
      "recording": false
    };
    this.iHavent = {
      "warned": true
    };
    this.iHave = {
      "runOnce": false,
      "finished": false
    };
    return this.my = {
      "time": {
        "start": 0,
        "elapsed": 0
      },
      "observation": {
        "index": 0,
        "oldIndex": 0,
        "completed": 0,
        "total": parseInt(this.model.get('totalSeconds') / this.model.get('intervalLength'))
      }
    };
  };

  ObservationPrintView.prototype.startObservations = function() {
    if (this.iAm.counting || this.iHave.runOnce) {
      return;
    }
    this.$el.find(".stop_button_wrapper, .next_display, .completed_display").removeClass("confirmation");
    this.$el.find(".start_button_wrapper").addClass("confirmation");
    this.timerInterval = setInterval(this.tick, 1000);
    this.iAm.counting = true;
    this.my.time.start = this.getTime();
    return this.my.time.elapsed = 0;
  };

  ObservationPrintView.prototype.stopObservations = function(e) {
    var fromClick, isntPrematureStop;
    clearInterval(this.timerInterval);
    fromClick = e != null;
    isntPrematureStop = e == null;
    if (e != null) {
      this.trigger("showNext");
    }
    if (isntPrematureStop && !this.iHave.finished) {
      if (this.iAm.recording) {
        this.resetObservationFlags();
        this.saveCurrentSurvey();
      }
      this.my.observation.index++;
      this.renderSurvey();
    } else {
      this.$el.find(".stop_button_wrapper").addClass("confirmation");
      Utils.midAlert("Observations finished");
    }
    this.$el.find(".next_display").addClass("confirmation");
    this.iHave.finished = true;
    return this.iHave.runOnce = true;
  };

  ObservationPrintView.prototype.tick = function() {
    this.my.time.elapsed = this.getTime() - this.my.time.start;
    this.checkIfOver();
    this.updateObservationIndex();
    this.updateProgressDisplay();
    this.checkSurveyDisplay();
    this.checkObservationPace();
    return this.checkWarning();
  };

  ObservationPrintView.prototype.checkObservationPace = function() {
    if (this.iAm.recording && this.my.observation.completed < (this.my.observation.index - 1) && this.my.observation.index !== 0) {
      this.iHave.forcedProgression = true;
      this.resetObservationFlags();
      this.saveCurrentSurvey();
      return this.renderSurvey();
    }
  };

  ObservationPrintView.prototype.checkWarning = function() {
    var iShouldWarn, projectedIndex;
    projectedIndex = Math.floor((this.my.time.elapsed + this.warningSeconds) / this.model.get('intervalLength'));
    iShouldWarn = this.my.observation.index < projectedIndex && !this.iHave.finished;
    if (this.iAm.recording && this.iHavent.warned && iShouldWarn && this.my.observation.index !== 0) {
      Utils.midAlert("Observation ending soon");
      return this.iHavent.warned = false;
    }
  };

  ObservationPrintView.prototype.gridWasAutostopped = function() {
    return false;
  };

  ObservationPrintView.prototype.checkIfOver = function() {
    if (this.my.time.elapsed >= this.model.get("totalSeconds")) {
      return this.stopObservations();
    }
  };

  ObservationPrintView.prototype.checkSurveyDisplay = function() {
    if (this.my.observation.oldIndex !== this.my.observation.index && !this.iHave.finished && !this.iAm.recording) {
      this.renderSurvey();
      return this.my.observation.oldIndex = this.my.observation.index;
    }
  };

  ObservationPrintView.prototype.updateObservationIndex = function() {
    this.my.observation.index = Math.floor(this.my.time.elapsed / this.model.get('intervalLength'));
    if (this.my.observation.index > this.survey.models.length - 1) {
      return this.my.observation.index = this.survey.models.length - 1;
    }
  };

  ObservationPrintView.prototype.updateProgressDisplay = function() {
    var timeTillNext;
    this.$el.find(".current_observation").html(this.my.observation.index);
    this.$el.find(".completed_count").html(this.my.observation.completed);
    timeTillNext = Math.max(((this.my.observation.index + 1) * this.model.get('intervalLength')) - this.my.time.elapsed, 0);
    this.$el.find(".time_till_next").html(timeTillNext);
    if (!this.iAm.recording && !this.iHave.finished) {
      return this.$el.find(".next_display, .completed_display").removeClass("confirmation");
    }
  };

  ObservationPrintView.prototype.resetObservationFlags = function() {
    this.iAm.recording = false;
    return this.iHavent.warned = true;
  };

  ObservationPrintView.prototype.getTime = function() {
    return parseInt((new Date()).getTime() / 1000);
  };

  ObservationPrintView.prototype.completeObservation = function(option) {
    if (this.survey.view.isValid()) {
      this.saveCurrentSurvey();
      if (this.iHave.finished) {
        this.trigger("showNext");
      }
    } else {
      this.survey.view.showErrors();
    }
    return this.tick();
  };

  ObservationPrintView.prototype.saveCurrentSurvey = function() {
    this.resetObservationFlags();
    this.my.observation.completed++;
    this.survey.results.push({
      observationNumber: this.survey.view.index,
      data: this.survey.view.getResult(),
      saveTime: this.my.time.elapsed
    });
    this.survey.view.close();
    return this.$el.find(".done").remove();
  };

  ObservationPrintView.prototype.render = function() {
    var totalSeconds;
    if (this.format === "stimuli") {
      return;
    }
    this.trigger("hideNext");
    totalSeconds = this.model.get("totalSeconds");
    this.$el.html("<div class='timer_wrapper'> <div class='progress clearfix'> <span class='completed_display confirmation'>Completed <div class='info_box completed_count'>" + this.my.observation.completed + "</div></span> <span class='next_display confirmation'>Next observation <div class='info_box time_till_next'>" + (this.model.get('intervalLength')) + "</div></span> </div> <div> <div class='start_button_wrapper'><button class='start_time command'>Start</button></div> <div class='stop_button_wrapper confirmation'><button class='stop_time command'>Abort <i>all</i> observations</button></div> </div> </div> <div id='current_survey'></div>");
    return this.trigger("rendered");
  };

  ObservationPrintView.prototype.renderSurvey = function(e) {
    if (!this.iAm.counting) {
      return;
    }
    this.iAm.recording = true;
    this.survey.view = new SurveyRunView({
      "model": this.survey.models[this.my.observation.index],
      "parent": this,
      "isObservation": true
    });
    this.survey.view.index = (function(_this) {
      return function() {
        return _this.my.observation.index;
      };
    })(this)();
    this.survey.view.on("rendered subRendered", (function(_this) {
      return function() {
        return _this.trigger("subRendered");
      };
    })(this));
    this.survey.view.render();
    this.$el.find("#current_survey").html("<span class='observation_display confirmation'>Observation <div class='info_box current_observation'>" + this.my.observation.index + "</div></span>");
    this.$el.find("#current_survey").append(this.survey.view.el);
    this.$el.find("#current_survey").append("<button class='command done'>Done with <i>this</i> observation</button>");
    return this.$el.find("#current_survey").scrollTo(250, (function(_this) {
      return function() {
        if (_this.iHave.forcedProgression) {
          Utils.midAlert("Please continue with the next observation.");
          return _this.iHave.forcedProgression = false;
        } else if (_this.iHave.finished) {
          return Utils.midAlert("Please enter last observation");
        }
      };
    })(this));
  };

  ObservationPrintView.prototype.onClose = function() {
    var ref;
    if ((ref = this.survey.view) != null) {
      ref.close();
    }
    return this.skippableView.close();
  };

  ObservationPrintView.prototype.getResult = function() {
    return {
      "surveys": this.survey.results,
      "variableName": this.model.get("variableName"),
      "totalTime": this.model.get("totalTime"),
      "intervalLength": this.model.get("intervalTime"),
      "completedObservations": this.my.observation.completed
    };
  };

  ObservationPrintView.prototype.getSum = function() {
    return {
      "total": this.my.observation.completed
    };
  };

  ObservationPrintView.prototype.getSkipped = function() {
    var i, j, ref, skippedResults, viewResult;
    viewResult = this.skippableView.getSkipped();
    skippedResults = [];
    for (i = j = 1, ref = this.survey.models.length - 1; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
      skippedResults.push({
        observationNumber: i,
        data: viewResult,
        saveTime: "skipped"
      });
    }
    return {
      "surveys": skippedResults,
      "variableName": "skipped",
      "totalTime": "skipped",
      "intervalLength": "skipped",
      "completedObservations": "skipped"
    };
  };

  ObservationPrintView.prototype.isValid = function() {
    return this.iHave.finished;
  };

  ObservationPrintView.prototype.showErrors = function() {
    return this.$el.find("messages").html(this.validator.getErrors().join(", "));
  };

  ObservationPrintView.prototype.updateNavigation = function() {
    return Tangerine.nav.setStudent(this.$el.find('#participant_id').val());
  };

  return ObservationPrintView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9PYnNlcnZhdGlvblByaW50Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxvQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7Ozs7O2lDQUVKLFNBQUEsR0FBVzs7aUNBRVgsTUFBQSxHQUNFO0lBQUEsbUJBQUEsRUFBc0IsbUJBQXRCO0lBQ0Esa0JBQUEsRUFBc0Isa0JBRHRCO0lBRUEsYUFBQSxFQUFnQixxQkFGaEI7OztpQ0FJRixVQUFBLEdBQVksU0FBQyxPQUFEO0lBRVYsSUFBQyxDQUFBLEtBQUQsR0FBVSxPQUFPLENBQUM7V0FDbEIsSUFBQyxDQUFBLE1BQUQsR0FBVSxPQUFPLENBQUM7RUFIUjs7aUNBT1osZ0JBQUEsR0FBa0IsU0FBQTtBQUNoQixRQUFBO0lBQUEsSUFBYyxtQkFBZDtNQUFBLElBQUMsQ0FBQSxPQUFELENBQUEsRUFBQTs7SUFFQSxVQUFBLEdBQWEsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxrQkFBWCxDQUFULEVBQXlDO01BQUUsS0FBQSxFQUFRLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBakI7S0FBekM7SUFJYixNQUFBOztBQUFVO1dBQXVDLHNKQUF2QztxQkFBSSxJQUFBLFFBQVEsQ0FBQyxLQUFULENBQWUsVUFBZjtBQUFKOzs7SUFDVixNQUFNLENBQUMsT0FBUCxDQUFlLEVBQWY7SUFFQSxJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLGFBQUEsQ0FDbkI7TUFBQSxPQUFBLEVBQWtCLE1BQU8sQ0FBQSxDQUFBLENBQXpCO01BQ0EsUUFBQSxFQUFrQixJQURsQjtNQUVBLGVBQUEsRUFBa0IsSUFGbEI7S0FEbUI7V0FNckIsSUFBQyxDQUFBLE1BQUQsR0FDRTtNQUFBLFFBQUEsRUFBYyxNQUFkO01BQ0EsU0FBQSxFQUFjLEVBRGQ7O0VBakJjOztpQ0FvQmxCLGVBQUEsR0FBaUIsU0FBQTtJQUNmLElBQUMsQ0FB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QTtXQUNOO01BQ0UsT0FBQSxFQUFVLElBQUMsQ0FBQSxFQUFFLENBQUMsV0FBVyxDQUFDLFNBRDVCOztFQURNOztpQ0FLUixVQUFBLEdBQVksU0FBQTtBQUNWLFFBQUE7SUFBQSxVQUFBLEdBQWEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxVQUFmLENBQUE7SUFDYixjQUFBLEdBQWlCO0FBQ2pCLFNBQVMsd0dBQVQ7TUFDRSxjQUFjLENBQUMsSUFBZixDQUNFO1FBQUEsaUJBQUEsRUFBb0IsQ0FBcEI7UUFDQSxJQUFBLEVBQW9CLFVBRHBCO1FBRUEsUUFBQSxFQUFvQixTQUZwQjtPQURGO0FBREY7QUFNQSxXQUFPO01BQ0wsU0FBQSxFQUEwQixjQURyQjtNQUVMLGNBQUEsRUFBMEIsU0FGckI7TUFHTCxXQUFBLEVBQTBCLFNBSHJCO01BSUwsZ0JBQUEsRUFBMEIsU0FKckI7TUFLTCx1QkFBQSxFQUEwQixTQUxyQjs7RUFURzs7aUNBaUJaLE9BQUEsR0FBUyxTQUFBO1dBQ1AsSUFBQyxDQUFBLEtBQUssQ0FBQztFQURBOztpQ0FHVCxVQUFBLEdBQVksU0FBQTtXQUNWLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFVBQVYsQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixJQUFDLENBQUEsU0FBUyxDQUFDLFNBQVgsQ0FBQSxDQUFzQixDQUFDLElBQXZCLENBQTRCLElBQTVCLENBQTNCO0VBRFU7O2lDQUdaLGdCQUFBLEdBQWtCLFNBQUE7V0FDaEIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFkLENBQXlCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlCQUFWLENBQTRCLENBQUMsR0FBN0IsQ0FBQSxDQUF6QjtFQURnQjs7OztHQXZRZSxRQUFRLENBQUMiLCJmaWxlIjoic3VidGVzdC9wcm90b3R5cGVzL09ic2VydmF0aW9uUHJpbnRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgT2JzZXJ2YXRpb25QcmludFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lOiBcIk9ic2VydmF0aW9uUHJpbnRWaWV3XCJcblxuICBldmVudHM6XG4gICAgXCJjbGljayAuc3RhcnRfdGltZVwiIDogXCJzdGFydE9ic2VydmF0aW9uc1wiXG4gICAgXCJjbGljayAuc3RvcF90aW1lXCIgIDogXCJzdG9wT2JzZXJ2YXRpb25zXCJcbiAgICBcImNsaWNrIC5kb25lXCIgOiBcImNvbXBsZXRlT2JzZXJ2YXRpb25cIlxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQG1vZGVsICA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ID0gb3B0aW9ucy5wYXJlbnRcblxuXG5cbiAgaW5pdGlhbGl6ZVN1cnZleTogLT5cbiAgICBAb25DbG9zZSgpIGlmIEBzdXJ2ZXk/ICMgaWYgd2UncmUgUkVpbml0aWFsaXppbmcgY2xvc2UgdGhlIG9sZCB2aWV3cyBmaXJzdFxuICAgIFxuICAgIGF0dHJpYnV0ZXMgPSAkLmV4dGVuZChAbW9kZWwuZ2V0KCdzdXJ2ZXlBdHRyaWJ1dGVzJyksIHsgXCJfaWRcIiA6IEBtb2RlbC5pZCB9KVxuXG4gICAgIyAxLWluZGV4ZWQgYXJyYXksIGNvbnZlbmllbnQgYmVjYXVzZSB0aGUgMHRoIG9ic2VydmF0aW9uIGRvZXNuJ3QgdGFrZSBwbGFjZSwgYnV0IHRoZSBudGggZG9lcy5cbiAgICAjIG1ha2VzIGFuIGFycmF5IG9mIGlkZW50aWNhbCBtb2RlbHMgYmFzZWQgb24gdGhlIGFib3ZlIGF0dHJpYnV0ZXNcbiAgICBtb2RlbHMgPSAobmV3IEJhY2tib25lLk1vZGVsIGF0dHJpYnV0ZXMgZm9yIGkgaW4gWzEuLnBhcnNlSW50KEBtb2RlbC5nZXQoJ3RvdGFsU2Vjb25kcycpL0Btb2RlbC5nZXQoJ2ludGVydmFsTGVuZ3RoJykpXSlcbiAgICBtb2RlbHMudW5zaGlmdChcIlwiKVxuICAgIFxuICAgIEBza2lwcGFibGVWaWV3ID0gbmV3IFN1cnZleVJ1blZpZXdcbiAgICAgIFwibW9kZWxcIiAgICAgICAgIDogbW9kZWxzWzFdXG4gICAgICBcInBhcmVudFwiICAgICAgICA6IEBcbiAgICAgIFwiaXNPYnNlcnZhdGlvblwiIDogdHJ1ZVxuXG4gICAgXG4gICAgQHN1cnZleSA9XG4gICAgICBcIm1vZGVsc1wiICAgIDogbW9kZWxzXG4gICAgICBcInJlc3VsdHNcIiAgIDogW11cblxuICBpbml0aWFsaXplRmxhZ3M6IC0+XG4gICAgQGlBbSA9XG4gICAgICBcImNvdW50aW5nXCIgOiBmYWxzZVxuICAgICAgXCJyZWNvcmRpbmdcIiA6IGZhbHNlXG4gICAgQGlIYXZlbnQgPVxuICAgICAgXCJ3YXJuZWRcIiA6IHRydWVcbiAgICBAaUhhdmUgPVxuICAgICAgXCJydW5PbmNlXCIgOiBmYWxzZVxuICAgICAgXCJmaW5pc2hlZFwiIDogZmFsc2VcbiAgICBAbXkgPVxuICAgICAgXCJ0aW1lXCIgOlxuICAgICAgICBcInN0YXJ0XCIgICA6IDBcbiAgICAgICAgXCJlbGFwc2VkXCIgOiAwXG4gICAgICBcIm9ic2VydmF0aW9uXCIgOlxuICAgICAgICBcImluZGV4XCIgICAgIDogMFxuICAgICAgICBcIm9sZEluZGV4XCIgIDogMFxuICAgICAgICBcImNvbXBsZXRlZFwiIDogMFxuICAgICAgICBcInRvdGFsXCIgICAgIDogcGFyc2VJbnQoIEBtb2RlbC5nZXQoJ3RvdGFsU2Vjb25kcycpIC8gQG1vZGVsLmdldCgnaW50ZXJ2YWxMZW5ndGgnKSApXG5cblxuICBzdGFydE9ic2VydmF0aW9uczogLT5cbiAgICAjIGRvbid0IHJlc3BvbmQgZm9yIHRoZXNlIHJlYXNvbnNcbiAgICBpZiBAaUFtLmNvdW50aW5nIHx8IEBpSGF2ZS5ydW5PbmNlIHRoZW4gcmV0dXJuXG5cbiAgICBAJGVsLmZpbmQoXCIuc3RvcF9idXR0b25fd3JhcHBlciwgLm5leHRfZGlzcGxheSwgLmNvbXBsZXRlZF9kaXNwbGF5XCIpLnJlbW92ZUNsYXNzKFwiY29uZmlybWF0aW9uXCIpXG4gICAgQCRlbC5maW5kKFwiLnN0YXJ0X2J1dHRvbl93cmFwcGVyXCIpLmFkZENsYXNzKFwiY29uZmlybWF0aW9uXCIpXG4gICAgQHRpbWVySW50ZXJ2YWwgICA9IHNldEludGVydmFsIEB0aWNrLCAxMDAwXG4gICAgQGlBbS5jb3VudGluZyAgICA9IHRydWVcbiAgICBAbXkudGltZS5zdGFydCAgID0gQGdldFRpbWUoKVxuICAgIEBteS50aW1lLmVsYXBzZWQgPSAwXG5cbiAgc3RvcE9ic2VydmF0aW9uczogKGUpIC0+XG4gICAgY2xlYXJJbnRlcnZhbCBAdGltZXJJbnRlcnZhbFxuICAgIGZyb21DbGljayA9IGU/XG4gICAgaXNudFByZW1hdHVyZVN0b3AgPSAhIGU/XG4gICAgaWYgZT8gXG4gICAgICBAdHJpZ2dlciBcInNob3dOZXh0XCJcblxuICAgIGlmIGlzbnRQcmVtYXR1cmVTdG9wICYmIG5vdCBAaUhhdmUuZmluaXNoZWRcbiAgICAgIGlmIEBpQW0ucmVjb3JkaW5nXG4gICAgICAgIEByZXNldE9ic2VydmF0aW9uRmxhZ3MoKVxuICAgICAgICBAc2F2ZUN1cnJlbnRTdXJ2ZXkoKVxuICAgICAgQG15Lm9ic2VydmF0aW9uLmluZGV4KytcbiAgICAgIEByZW5kZXJTdXJ2ZXkoKVxuICAgIGVsc2VcbiAgICAgIEAkZWwuZmluZChcIi5zdG9wX2J1dHRvbl93cmFwcGVyXCIpLmFkZENsYXNzKFwiY29uZmlybWF0aW9uXCIpXG4gICAgICBVdGlscy5taWRBbGVydCBcIk9ic2VydmF0aW9ucyBmaW5pc2hlZFwiXG4gICAgQCRlbC5maW5kKFwiLm5leHRfZGlzcGxheVwiKS5hZGRDbGFzcyhcImNvbmZpcm1hdGlvblwiKVxuICAgIEBpSGF2ZS5maW5pc2hlZCA9IHRydWVcbiAgICBAaUhhdmUucnVuT25jZSA9IHRydWVcbiAgICBcblxuICAjIHJ1bnMgZXZlcnkgc2Vjb25kIHRoZSB0aW1lciBpcyBydW5uaW5nXG4gIHRpY2s6ID0+XG4gICAgQG15LnRpbWUuZWxhcHNlZCA9IEBnZXRUaW1lKCkgLSBAbXkudGltZS5zdGFydFxuICAgIEBjaGVja0lmT3ZlcigpXG4gICAgQHVwZGF0ZU9ic2VydmF0aW9uSW5kZXgoKVxuICAgIEB1cGRhdGVQcm9ncmVzc0Rpc3BsYXkoKVxuICAgIEBjaGVja1N1cnZleURpc3BsYXkoKVxuICAgIEBjaGVja09ic2VydmF0aW9uUGFjZSgpXG4gICAgQGNoZWNrV2FybmluZygpXG5cbiAgY2hlY2tPYnNlcnZhdGlvblBhY2U6ID0+XG4gICAgIyBpZiB3ZSdyZSBzdGlsbCBlbnRlcmluZyBvYnNlcnZhdGlvbnMgYW5kIGl0J3MgdGltZSBmb3IgdGhlIG5leHQgb25lXG4gICAgaWYgQGlBbS5yZWNvcmRpbmcgJiYgQG15Lm9ic2VydmF0aW9uLmNvbXBsZXRlZCA8IChAbXkub2JzZXJ2YXRpb24uaW5kZXgtMSkgJiYgQG15Lm9ic2VydmF0aW9uLmluZGV4ICE9IDAgIyBzdGFydHMgYXQgMCwgdGhlbiBnb2VzIHRvIDFcbiAgICAgIEBpSGF2ZS5mb3JjZWRQcm9ncmVzc2lvbiA9IHRydWVcbiAgICAgIEByZXNldE9ic2VydmF0aW9uRmxhZ3MoKVxuICAgICAgQHNhdmVDdXJyZW50U3VydmV5KClcbiAgICAgIEByZW5kZXJTdXJ2ZXkoKVxuXG4gIGNoZWNrV2FybmluZzogPT5cbiAgICBwcm9qZWN0ZWRJbmRleCA9IE1hdGguZmxvb3IoIChAbXkudGltZS5lbGFwc2VkICsgQHdhcm5pbmdTZWNvbmRzKSAvIEBtb2RlbC5nZXQoJ2ludGVydmFsTGVuZ3RoJykgKVxuICAgIGlTaG91bGRXYXJuID0gQG15Lm9ic2VydmF0aW9uLmluZGV4IDwgcHJvamVjdGVkSW5kZXggJiYgISBAaUhhdmUuZmluaXNoZWRcbiAgICAjIGlmIHdlJ3JlIHN0aWxsIGVudGVyaW5nIG9ic2VydmF0aW9ucywgd2FybiB0aGUgdXNlclxuICAgIGlmIEBpQW0ucmVjb3JkaW5nICYmIEBpSGF2ZW50Lndhcm5lZCAmJiBpU2hvdWxkV2FybiAmJiBAbXkub2JzZXJ2YXRpb24uaW5kZXggIT0gMCAjIGZpcnN0IG9uZSBkb2Vzbid0IGNvdW50XG4gICAgICBVdGlscy5taWRBbGVydCBcIk9ic2VydmF0aW9uIGVuZGluZyBzb29uXCJcbiAgICAgIEBpSGF2ZW50Lndhcm5lZCA9IGZhbHNlXG4gIFxuICBncmlkV2FzQXV0b3N0b3BwZWQ6IC0+XG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgY2hlY2tJZk92ZXI6ID0+XG4gICAgaWYgQG15LnRpbWUuZWxhcHNlZCA+PSBAbW9kZWwuZ2V0KFwidG90YWxTZWNvbmRzXCIpXG4gICAgICBAc3RvcE9ic2VydmF0aW9ucygpXG5cbiAgY2hlY2tTdXJ2ZXlEaXNwbGF5OiA9PlxuICAgICMgY2hhbmdlLCBuZWVkcyB0byBkaXNwbGF5IG5ldyBzdXJ2ZXlcbiAgICBpZiBAbXkub2JzZXJ2YXRpb24ub2xkSW5kZXggIT0gQG15Lm9ic2VydmF0aW9uLmluZGV4ICYmICFAaUhhdmUuZmluaXNoZWQgJiYgIUBpQW0ucmVjb3JkaW5nXG4gICAgICBAcmVuZGVyU3VydmV5KClcbiAgICAgIEBteS5vYnNlcnZhdGlvbi5vbGRJbmRleCA9IEBteS5vYnNlcnZhdGlvbi5pbmRleFxuXG4gIHVwZGF0ZU9ic2VydmF0aW9uSW5kZXg6ID0+XG4gICAgQG15Lm9ic2VydmF0aW9uLmluZGV4ID0gTWF0aC5mbG9vciggKCBAbXkudGltZS5lbGFwc2VkICkgLyBAbW9kZWwuZ2V0KCdpbnRlcnZhbExlbmd0aCcpIClcbiAgICBpZiBAbXkub2JzZXJ2YXRpb24uaW5kZXggPiBAc3VydmV5Lm1vZGVscy5sZW5ndGggLSAxXG4gICAgICBAbXkub2JzZXJ2YXRpb24uaW5kZXggPSBAc3VydmV5Lm1vZGVscy5sZW5ndGggLSAxXG5cbiAgdXBkYXRlUHJvZ3Jlc3NEaXNwbGF5OiAtPlxuICAgICMgYmFja2JvbmUuanMsIHkgdSBubyBoYXZlIGRhdGEgYmluZGluZ3M/IGFic3RyYWN0IG1vcmVcbiAgICBAJGVsLmZpbmQoXCIuY3VycmVudF9vYnNlcnZhdGlvblwiKS5odG1sIEBteS5vYnNlcnZhdGlvbi5pbmRleFxuICAgIEAkZWwuZmluZChcIi5jb21wbGV0ZWRfY291bnRcIikuaHRtbCAgICAgQG15Lm9ic2VydmF0aW9uLmNvbXBsZXRlZFxuXG4gICAgdGltZVRpbGxOZXh0ID0gTWF0aC5tYXgoKChAbXkub2JzZXJ2YXRpb24uaW5kZXggKyAxKSAqIEBtb2RlbC5nZXQoJ2ludGVydmFsTGVuZ3RoJykpIC0gQG15LnRpbWUuZWxhcHNlZCwgMClcbiAgICBAJGVsLmZpbmQoXCIudGltZV90aWxsX25leHRcIikuaHRtbCB0aW1lVGlsbE5leHRcblxuICAgIGlmIG5vdCBAaUFtLnJlY29yZGluZyAmJiBub3QgQGlIYXZlLmZpbmlzaGVkXG4gICAgICBAJGVsLmZpbmQoXCIubmV4dF9kaXNwbGF5LCAuY29tcGxldGVkX2Rpc3BsYXlcIikucmVtb3ZlQ2xhc3MgXCJjb25maXJtYXRpb25cIiBcblxuICByZXNldE9ic2VydmF0aW9uRmxhZ3M6IC0+XG4gICAgQGlBbS5yZWNvcmRpbmcgID0gZmFsc2VcbiAgICBAaUhhdmVudC53YXJuZWQgPSB0cnVlXG5cbiAgZ2V0VGltZTogLT4gcGFyc2VJbnQoICggbmV3IERhdGUoKSApLmdldFRpbWUoKSAvIDEwMDAgKVxuXG4gIGNvbXBsZXRlT2JzZXJ2YXRpb246IChvcHRpb24pIC0+XG5cbiAgICBpZiBAc3VydmV5LnZpZXcuaXNWYWxpZCgpXG4gICAgICBAc2F2ZUN1cnJlbnRTdXJ2ZXkoKVxuICAgICAgQHRyaWdnZXIgXCJzaG93TmV4dFwiIGlmIEBpSGF2ZS5maW5pc2hlZFxuICAgIGVsc2VcbiAgICAgIEBzdXJ2ZXkudmlldy5zaG93RXJyb3JzKClcblxuICAgIEB0aWNrKCkgIyB1cGRhdGUgZGlzcGxheXNcblxuXG5cblxuICBzYXZlQ3VycmVudFN1cnZleTogPT5cbiAgICBAcmVzZXRPYnNlcnZhdGlvbkZsYWdzKClcbiAgICBAbXkub2JzZXJ2YXRpb24uY29tcGxldGVkKytcbiAgICBAc3VydmV5LnJlc3VsdHMucHVzaFxuICAgICAgb2JzZXJ2YXRpb25OdW1iZXIgOiBAc3VydmV5LnZpZXcuaW5kZXggIyB2aWV3J3MgaW5kZXhcbiAgICAgIGRhdGEgICAgICAgICAgICAgIDogQHN1cnZleS52aWV3LmdldFJlc3VsdCgpXG4gICAgICBzYXZlVGltZSAgICAgICAgICA6IEBteS50aW1lLmVsYXBzZWRcbiAgICBAc3VydmV5LnZpZXcuY2xvc2UoKVxuICAgIEAkZWwuZmluZChcIi5kb25lXCIpLnJlbW92ZSgpXG5cblxuICByZW5kZXI6IC0+XG4gICAgcmV0dXJuIGlmIEBmb3JtYXQgaXMgXCJzdGltdWxpXCJcblxuICAgIEB0cmlnZ2VyIFwiaGlkZU5leHRcIlxuICAgIHRvdGFsU2Vjb25kcyA9IEBtb2RlbC5nZXQoXCJ0b3RhbFNlY29uZHNcIilcblxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGRpdiBjbGFzcz0ndGltZXJfd3JhcHBlcic+XG4gICAgICAgIDxkaXYgY2xhc3M9J3Byb2dyZXNzIGNsZWFyZml4Jz5cbiAgICAgICAgICA8c3BhbiBjbGFzcz0nY29tcGxldGVkX2Rpc3BsYXkgY29uZmlybWF0aW9uJz5Db21wbGV0ZWQgPGRpdiBjbGFzcz0naW5mb19ib3ggY29tcGxldGVkX2NvdW50Jz4je0BteS5vYnNlcnZhdGlvbi5jb21wbGV0ZWR9PC9kaXY+PC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPSduZXh0X2Rpc3BsYXkgY29uZmlybWF0aW9uJz5OZXh0IG9ic2VydmF0aW9uIDxkaXYgY2xhc3M9J2luZm9fYm94IHRpbWVfdGlsbF9uZXh0Jz4je0Btb2RlbC5nZXQoJ2ludGVydmFsTGVuZ3RoJyl9PC9kaXY+PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdzdGFydF9idXR0b25fd3JhcHBlcic+PGJ1dHRvbiBjbGFzcz0nc3RhcnRfdGltZSBjb21tYW5kJz5TdGFydDwvYnV0dG9uPjwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9J3N0b3BfYnV0dG9uX3dyYXBwZXIgY29uZmlybWF0aW9uJz48YnV0dG9uIGNsYXNzPSdzdG9wX3RpbWUgY29tbWFuZCc+QWJvcnQgPGk+YWxsPC9pPiBvYnNlcnZhdGlvbnM8L2J1dHRvbj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgaWQ9J2N1cnJlbnRfc3VydmV5Jz48L2Rpdj5cbiAgICBcIlxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgcmVuZGVyU3VydmV5OiAoZSkgLT5cbiAgICBpZiBub3QgQGlBbS5jb3VudGluZyB0aGVuIHJldHVyblxuICAgIEBpQW0ucmVjb3JkaW5nID0gdHJ1ZVxuICAgIFxuICAgIEBzdXJ2ZXkudmlldyAgPSBuZXcgU3VydmV5UnVuVmlld1xuICAgICAgXCJtb2RlbFwiICAgICAgICAgOiBAc3VydmV5Lm1vZGVsc1tAbXkub2JzZXJ2YXRpb24uaW5kZXhdXG4gICAgICBcInBhcmVudFwiICAgICAgICA6IEBcbiAgICAgIFwiaXNPYnNlcnZhdGlvblwiIDogdHJ1ZVxuICAgIEBzdXJ2ZXkudmlldy5pbmRleCA9IGRvID0+IEBteS5vYnNlcnZhdGlvbi5pbmRleCAjIGFkZCBhbiBpbmRleCBmb3IgcmVmZXJlbmNlXG5cbiAgICAjIGxpc3RlbiBmb3IgcmVuZGVyIGV2ZW50cywgcGFzcyB0aGVtIHVwXG4gICAgQHN1cnZleS52aWV3Lm9uIFwicmVuZGVyZWQgc3ViUmVuZGVyZWRcIiwgPT4gQHRyaWdnZXIgXCJzdWJSZW5kZXJlZFwiXG5cbiAgICBAc3VydmV5LnZpZXcucmVuZGVyKClcblxuICAgIEAkZWwuZmluZChcIiNjdXJyZW50X3N1cnZleVwiKS5odG1sKFwiPHNwYW4gY2xhc3M9J29ic2VydmF0aW9uX2Rpc3BsYXkgY29uZmlybWF0aW9uJz5PYnNlcnZhdGlvbiA8ZGl2IGNsYXNzPSdpbmZvX2JveCBjdXJyZW50X29ic2VydmF0aW9uJz4je0BteS5vYnNlcnZhdGlvbi5pbmRleH08L2Rpdj48L3NwYW4+XCIpXG4gICAgQCRlbC5maW5kKFwiI2N1cnJlbnRfc3VydmV5XCIpLmFwcGVuZCBAc3VydmV5LnZpZXcuZWxcbiAgICBAJGVsLmZpbmQoXCIjY3VycmVudF9zdXJ2ZXlcIikuYXBwZW5kIFwiPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBkb25lJz5Eb25lIHdpdGggPGk+dGhpczwvaT4gb2JzZXJ2YXRpb248L2J1dHRvbj5cIlxuICAgIFxuICAgIEAkZWwuZmluZChcIiNjdXJyZW50X3N1cnZleVwiKS5zY3JvbGxUbyAyNTAsID0+IFxuICAgICAgaWYgQGlIYXZlLmZvcmNlZFByb2dyZXNzaW9uXG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiUGxlYXNlIGNvbnRpbnVlIHdpdGggdGhlIG5leHQgb2JzZXJ2YXRpb24uXCJcbiAgICAgICAgQGlIYXZlLmZvcmNlZFByb2dyZXNzaW9uID0gZmFsc2VcbiAgICAgIGVsc2UgaWYgQGlIYXZlLmZpbmlzaGVkXG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiUGxlYXNlIGVudGVyIGxhc3Qgb2JzZXJ2YXRpb25cIlxuXG5cbiAgb25DbG9zZTogLT5cbiAgICBAc3VydmV5LnZpZXc/LmNsb3NlKClcbiAgICBAc2tpcHBhYmxlVmlldy5jbG9zZSgpXG5cbiAgZ2V0UmVzdWx0OiAtPlxuICAgIHtcbiAgICAgIFwic3VydmV5c1wiICAgICAgICAgICAgICAgOiBAc3VydmV5LnJlc3VsdHNcbiAgICAgIFwidmFyaWFibGVOYW1lXCIgICAgICAgICAgOiBAbW9kZWwuZ2V0KFwidmFyaWFibGVOYW1lXCIpXG4gICAgICBcInRvdGFsVGltZVwiICAgICAgICAgICAgIDogQG1vZGVsLmdldChcInRvdGFsVGltZVwiKVxuICAgICAgXCJpbnRlcnZhbExlbmd0aFwiICAgICAgICA6IEBtb2RlbC5nZXQoXCJpbnRlcnZhbFRpbWVcIilcbiAgICAgIFwiY29tcGxldGVkT2JzZXJ2YXRpb25zXCIgOiBAbXkub2JzZXJ2YXRpb24uY29tcGxldGVkXG4gICAgfVxuXG4gIGdldFN1bTogLT5cbiAgICB7XG4gICAgICBcInRvdGFsXCIgOiBAbXkub2JzZXJ2YXRpb24uY29tcGxldGVkIFxuICAgIH1cblxuICBnZXRTa2lwcGVkOiAtPlxuICAgIHZpZXdSZXN1bHQgPSBAc2tpcHBhYmxlVmlldy5nZXRTa2lwcGVkKClcbiAgICBza2lwcGVkUmVzdWx0cyA9IFtdXG4gICAgZm9yIGkgaW4gWzEuLihAc3VydmV5Lm1vZGVscy5sZW5ndGgtMSldXG4gICAgICBza2lwcGVkUmVzdWx0cy5wdXNoXG4gICAgICAgIG9ic2VydmF0aW9uTnVtYmVyIDogaSAjIHZpZXcncyBpbmRleFxuICAgICAgICBkYXRhICAgICAgICAgICAgICA6IHZpZXdSZXN1bHRcbiAgICAgICAgc2F2ZVRpbWUgICAgICAgICAgOiBcInNraXBwZWRcIlxuXG4gICAgcmV0dXJuIHtcbiAgICAgIFwic3VydmV5c1wiICAgICAgICAgICAgICAgOiBza2lwcGVkUmVzdWx0c1xuICAgICAgXCJ2YXJpYWJsZU5hbWVcIiAgICAgICAgICA6IFwic2tpcHBlZFwiXG4gICAgICBcInRvdGFsVGltZVwiICAgICAgICAgICAgIDogXCJza2lwcGVkXCJcbiAgICAgIFwiaW50ZXJ2YWxMZW5ndGhcIiAgICAgICAgOiBcInNraXBwZWRcIlxuICAgICAgXCJjb21wbGV0ZWRPYnNlcnZhdGlvbnNcIiA6IFwic2tpcHBlZFwiXG4gICAgfVxuXG4gIGlzVmFsaWQ6IC0+XG4gICAgQGlIYXZlLmZpbmlzaGVkXG5cbiAgc2hvd0Vycm9yczogLT5cbiAgICBAJGVsLmZpbmQoXCJtZXNzYWdlc1wiKS5odG1sIEB2YWxpZGF0b3IuZ2V0RXJyb3JzKCkuam9pbihcIiwgXCIpXG5cbiAgdXBkYXRlTmF2aWdhdGlvbjogLT5cbiAgICBUYW5nZXJpbmUubmF2LnNldFN0dWRlbnQgQCRlbC5maW5kKCcjcGFydGljaXBhbnRfaWQnKS52YWwoKVxuIl19
