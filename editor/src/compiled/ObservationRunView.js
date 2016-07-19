var ObservationRunView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ObservationRunView = (function(superClass) {
  extend(ObservationRunView, superClass);

  function ObservationRunView() {
    this.saveCurrentSurvey = bind(this.saveCurrentSurvey, this);
    this.updateObservationIndex = bind(this.updateObservationIndex, this);
    this.checkSurveyDisplay = bind(this.checkSurveyDisplay, this);
    this.checkIfOver = bind(this.checkIfOver, this);
    this.checkWarning = bind(this.checkWarning, this);
    this.checkObservationPace = bind(this.checkObservationPace, this);
    this.tick = bind(this.tick, this);
    return ObservationRunView.__super__.constructor.apply(this, arguments);
  }

  ObservationRunView.prototype.className = "ObservationRunView";

  ObservationRunView.prototype.events = {
    "click .start_time": "startObservations",
    "click .stop_time": "stopObservations",
    "click .done": "completeObservation"
  };

  ObservationRunView.FORCE = 1;

  ObservationRunView.prototype.initialize = function(options) {
    this.model = options.model;
    this.parent = options.parent;
    this.warningSeconds = 5;
    this.initializeFlags();
    return this.initializeSurvey();
  };

  ObservationRunView.prototype.initializeSurvey = function() {
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

  ObservationRunView.prototype.initializeFlags = function() {
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

  ObservationRunView.prototype.startObservations = function() {
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

  ObservationRunView.prototype.stopObservations = function(e) {
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
      Utils.midAlert(t("observations finished"));
    }
    this.$el.find(".next_display").addClass("confirmation");
    this.iHave.finished = true;
    return this.iHave.runOnce = true;
  };

  ObservationRunView.prototype.tick = function() {
    this.my.time.elapsed = this.getTime() - this.my.time.start;
    this.checkIfOver();
    this.updateObservationIndex();
    this.updateProgressDisplay();
    this.checkSurveyDisplay();
    this.checkObservationPace();
    return this.checkWarning();
  };

  ObservationRunView.prototype.checkObservationPace = function() {
    if (this.iAm.recording && this.my.observation.completed < (this.my.observation.index - 1) && this.my.observation.index !== 0) {
      this.iHave.forcedProgression = true;
      this.resetObservationFlags();
      this.saveCurrentSurvey();
      return this.renderSurvey();
    }
  };

  ObservationRunView.prototype.checkWarning = function() {
    var iShouldWarn, projectedIndex;
    projectedIndex = Math.floor((this.my.time.elapsed + this.warningSeconds) / this.model.get('intervalLength'));
    iShouldWarn = this.my.observation.index < projectedIndex && !this.iHave.finished;
    if (this.iAm.recording && this.iHavent.warned && iShouldWarn && this.my.observation.index !== 0) {
      Utils.midAlert(t("observation ending soon"));
      return this.iHavent.warned = false;
    }
  };

  ObservationRunView.prototype.gridWasAutostopped = function() {
    return false;
  };

  ObservationRunView.prototype.checkIfOver = function() {
    if (this.my.time.elapsed >= this.model.get("totalSeconds")) {
      return this.stopObservations();
    }
  };

  ObservationRunView.prototype.checkSurveyDisplay = function() {
    if (this.my.observation.oldIndex !== this.my.observation.index && !this.iHave.finished && !this.iAm.recording) {
      this.renderSurvey();
      return this.my.observation.oldIndex = this.my.observation.index;
    }
  };

  ObservationRunView.prototype.updateObservationIndex = function() {
    this.my.observation.index = Math.floor(this.my.time.elapsed / this.model.get('intervalLength'));
    if (this.my.observation.index > this.survey.models.length - 1) {
      return this.my.observation.index = this.survey.models.length - 1;
    }
  };

  ObservationRunView.prototype.updateProgressDisplay = function() {
    var timeTillNext;
    this.$el.find(".current_observation").html(this.my.observation.index);
    this.$el.find(".completed_count").html(this.my.observation.completed);
    timeTillNext = Math.max(((this.my.observation.index + 1) * this.model.get('intervalLength')) - this.my.time.elapsed, 0);
    this.$el.find(".time_till_next").html(timeTillNext);
    if (!this.iAm.recording && !this.iHave.finished) {
      return this.$el.find(".next_display, .completed_display").removeClass("confirmation");
    }
  };

  ObservationRunView.prototype.resetObservationFlags = function() {
    this.iAm.recording = false;
    return this.iHavent.warned = true;
  };

  ObservationRunView.prototype.getTime = function() {
    return parseInt((new Date()).getTime() / 1000);
  };

  ObservationRunView.prototype.completeObservation = function(option) {
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

  ObservationRunView.prototype.saveCurrentSurvey = function() {
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

  ObservationRunView.prototype.render = function() {
    var totalSeconds;
    this.trigger("hideNext");
    totalSeconds = this.model.get("totalSeconds");
    this.$el.html("<div class='timer_wrapper'> <div class='progress clearfix'> <span class='completed_display confirmation'>" + (t('completed')) + " <div class='info_box completed_count'>" + this.my.observation.completed + "</div></span> <span class='next_display confirmation'>" + (t('next observation')) + " <div class='info_box time_till_next'>" + (this.model.get('intervalLength')) + "</div></span> </div> <div> <div class='start_button_wrapper'><button class='start_time command'>" + (t('start')) + "</button></div> <div class='stop_button_wrapper confirmation'><button class='stop_time command'>" + (t('abort all observations')) + "</button></div> </div> </div> <div id='current_survey'></div>");
    this.trigger("rendered");
    return this.trigger("ready");
  };

  ObservationRunView.prototype.renderSurvey = function(e) {
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
    this.$el.find("#current_survey").html("<span class='observation_display confirmation'>" + (t('observation')) + " <div class='info_box current_observation'>" + this.my.observation.index + "</div></span>");
    this.$el.find("#current_survey").append(this.survey.view.el);
    this.$el.find("#current_survey").append("<button class='command done'>" + (t('done with this observation')) + "</button>");
    return this.$el.find("#current_survey").scrollTo(250, (function(_this) {
      return function() {
        if (_this.iHave.forcedProgression) {
          Utils.midAlert(t("please continue with the next observation"));
          return _this.iHave.forcedProgression = false;
        } else if (_this.iHave.finished) {
          return Utils.midAlert(t("please enter last observation"));
        }
      };
    })(this));
  };

  ObservationRunView.prototype.onClose = function() {
    var ref;
    if ((ref = this.survey.view) != null) {
      ref.close();
    }
    return this.skippableView.close();
  };

  ObservationRunView.prototype.getResult = function() {
    return {
      "surveys": this.survey.results,
      "variableName": this.model.get("variableName"),
      "totalTime": this.model.get("totalTime"),
      "intervalLength": this.model.get("intervalTime"),
      "completedObservations": this.my.observation.completed
    };
  };

  ObservationRunView.prototype.getSum = function() {
    return {
      "total": this.my.observation.completed
    };
  };

  ObservationRunView.prototype.getSkipped = function() {
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

  ObservationRunView.prototype.isValid = function() {
    return this.iHave.finished;
  };

  ObservationRunView.prototype.showErrors = function() {
    return this.$el.find("messages").html(this.validator.getErrors().join(", "));
  };

  ObservationRunView.prototype.updateNavigation = function() {
    return Tangerine.nav.setStudent(this.$el.find('#participant_id').val());
  };

  return ObservationRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9PYnNlcnZhdGlvblJ1blZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsa0JBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs7Ozs7OzsrQkFFSixTQUFBLEdBQVc7OytCQUVYLE1BQUEsR0FDRTtJQUFBLG1CQUFBLEVBQXNCLG1CQUF0QjtJQUNBLGtCQUFBLEVBQXNCLGtCQUR0QjtJQUVBLGFBQUEsRUFBZ0IscUJBRmhCOzs7RUFJRixrQkFBQyxDQUFBLEtBQUQsR0FBUzs7K0JBRVQsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUVWLElBQUMsQ0FBQSxLQUFELEdBQVUsT0FBTyxDQUFDO0lBQ2xCLElBQUMsQ0FBQSxNQUFELEdBQVUsT0FBTyxDQUFDO0lBRWxCLElBQUMsQ0FBQSxjQUFELEdBQWtCO0lBRWxCLElBQUMsQ0FBQSxlQUFELENBQUE7V0FDQSxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtFQVJVOzsrQkFXWixnQkFBQSxHQUFrQixTQUFBO0FBQ2hCLFFBQUE7SUFBQSxJQUFjLG1CQUFkO01BQUEsSUFBQyxDQUFBLE9BQUQsQ0FBQSxFQUFBOztJQUVBLFVBQUEsR0FBYSxDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLGtCQUFYLENBQVQsRUFBeUM7TUFBRSxLQUFBLEVBQVEsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFqQjtLQUF6QztJQUliLE1BQUE7O0FBQVU7V0FBdUMsc0pBQXZDO3FCQUFJLElBQUEsUUFBUSxDQUFDLEtBQVQsQ0FBZSxVQUFmO0FBQUo7OztJQUNWLE1BQU0sQ0FBQyxPQUFQLENBQWUsRUFBZjtJQUVBLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsYUFBQSxDQUNuQjtNQUFBLE9BQUEsRUFBa0IsTUFBTyxDQUFBLENBQUEsQ0FBekI7TUFDQSxRQUFBLEVBQWtCLElBRGxCO01BRUEsZUFBQSxFQUFrQixJQUZsQjtLQURtQjtXQU1yQixJ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RUFEQTs7K0JBR1QsVUFBQSxHQUFZLFNBQUE7V0FDVixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxVQUFWLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsSUFBQyxDQUFBLFNBQVMsQ0FBQyxTQUFYLENBQUEsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixJQUE1QixDQUEzQjtFQURVOzsrQkFHWixnQkFBQSxHQUFrQixTQUFBO1dBQ2hCLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBZCxDQUF5QixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxpQkFBVixDQUE0QixDQUFDLEdBQTdCLENBQUEsQ0FBekI7RUFEZ0I7Ozs7R0E1UWEsUUFBUSxDQUFDIiwiZmlsZSI6InN1YnRlc3QvcHJvdG90eXBlcy9PYnNlcnZhdGlvblJ1blZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBPYnNlcnZhdGlvblJ1blZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lOiBcIk9ic2VydmF0aW9uUnVuVmlld1wiXG5cbiAgZXZlbnRzOlxuICAgIFwiY2xpY2sgLnN0YXJ0X3RpbWVcIiA6IFwic3RhcnRPYnNlcnZhdGlvbnNcIlxuICAgIFwiY2xpY2sgLnN0b3BfdGltZVwiICA6IFwic3RvcE9ic2VydmF0aW9uc1wiXG4gICAgXCJjbGljayAuZG9uZVwiIDogXCJjb21wbGV0ZU9ic2VydmF0aW9uXCJcblxuICBARk9SQ0UgPSAxXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICBAbW9kZWwgID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgPSBvcHRpb25zLnBhcmVudFxuXG4gICAgQHdhcm5pbmdTZWNvbmRzID0gNVxuXG4gICAgQGluaXRpYWxpemVGbGFncygpXG4gICAgQGluaXRpYWxpemVTdXJ2ZXkoKVxuXG5cbiAgaW5pdGlhbGl6ZVN1cnZleTogLT5cbiAgICBAb25DbG9zZSgpIGlmIEBzdXJ2ZXk/ICMgaWYgd2UncmUgUkVpbml0aWFsaXppbmcgY2xvc2UgdGhlIG9sZCB2aWV3cyBmaXJzdFxuICAgIFxuICAgIGF0dHJpYnV0ZXMgPSAkLmV4dGVuZChAbW9kZWwuZ2V0KCdzdXJ2ZXlBdHRyaWJ1dGVzJyksIHsgXCJfaWRcIiA6IEBtb2RlbC5pZCB9KVxuXG4gICAgIyAxLWluZGV4ZWQgYXJyYXksIGNvbnZlbmllbnQgYmVjYXVzZSB0aGUgMHRoIG9ic2VydmF0aW9uIGRvZXNuJ3QgdGFrZSBwbGFjZSwgYnV0IHRoZSBudGggZG9lcy5cbiAgICAjIG1ha2VzIGFuIGFycmF5IG9mIGlkZW50aWNhbCBtb2RlbHMgYmFzZWQgb24gdGhlIGFib3ZlIGF0dHJpYnV0ZXNcbiAgICBtb2RlbHMgPSAobmV3IEJhY2tib25lLk1vZGVsIGF0dHJpYnV0ZXMgZm9yIGkgaW4gWzEuLnBhcnNlSW50KEBtb2RlbC5nZXQoJ3RvdGFsU2Vjb25kcycpL0Btb2RlbC5nZXQoJ2ludGVydmFsTGVuZ3RoJykpXSlcbiAgICBtb2RlbHMudW5zaGlmdChcIlwiKVxuICAgIFxuICAgIEBza2lwcGFibGVWaWV3ID0gbmV3IFN1cnZleVJ1blZpZXdcbiAgICAgIFwibW9kZWxcIiAgICAgICAgIDogbW9kZWxzWzFdXG4gICAgICBcInBhcmVudFwiICAgICAgICA6IEBcbiAgICAgIFwiaXNPYnNlcnZhdGlvblwiIDogdHJ1ZVxuXG4gICAgXG4gICAgQHN1cnZleSA9XG4gICAgICBcIm1vZGVsc1wiICAgIDogbW9kZWxzXG4gICAgICBcInJlc3VsdHNcIiAgIDogW11cblxuICBpbml0aWFsaXplRmxhZ3M6IC0+XG4gICAgQGlBbSA9XG4gICAgICBcImNvdW50aW5nXCIgOiBmYWxzZVxuICAgICAgXCJyZWNvcmRpbmdcIiA6IGZhbHNlXG4gICAgQGlIYXZlbnQgPVxuICAgICAgXCJ3YXJuZWRcIiA6IHRydWVcbiAgICBAaUhhdmUgPVxuICAgICAgXCJydW5PbmNlXCIgOiBmYWxzZVxuICAgICAgXCJmaW5pc2hlZFwiIDogZmFsc2VcbiAgICBAbXkgPVxuICAgICAgXCJ0aW1lXCIgOlxuICAgICAgICBcInN0YXJ0XCIgICA6IDBcbiAgICAgICAgXCJlbGFwc2VkXCIgOiAwXG4gICAgICBcIm9ic2VydmF0aW9uXCIgOlxuICAgICAgICBcImluZGV4XCIgICAgIDogMFxuICAgICAgICBcIm9sZEluZGV4XCIgIDogMFxuICAgICAgICBcImNvbXBsZXRlZFwiIDogMFxuICAgICAgICBcInRvdGFsXCIgICAgIDogcGFyc2VJbnQoIEBtb2RlbC5nZXQoJ3RvdGFsU2Vjb25kcycpIC8gQG1vZGVsLmdldCgnaW50ZXJ2YWxMZW5ndGgnKSApXG5cblxuICBzdGFydE9ic2VydmF0aW9uczogLT5cbiAgICAjIGRvbid0IHJlc3BvbmQgZm9yIHRoZXNlIHJlYXNvbnNcbiAgICBpZiBAaUFtLmNvdW50aW5nIHx8IEBpSGF2ZS5ydW5PbmNlIHRoZW4gcmV0dXJuXG5cbiAgICBAJGVsLmZpbmQoXCIuc3RvcF9idXR0b25fd3JhcHBlciwgLm5leHRfZGlzcGxheSwgLmNvbXBsZXRlZF9kaXNwbGF5XCIpLnJlbW92ZUNsYXNzKFwiY29uZmlybWF0aW9uXCIpXG4gICAgQCRlbC5maW5kKFwiLnN0YXJ0X2J1dHRvbl93cmFwcGVyXCIpLmFkZENsYXNzKFwiY29uZmlybWF0aW9uXCIpXG4gICAgQHRpbWVySW50ZXJ2YWwgICA9IHNldEludGVydmFsIEB0aWNrLCAxMDAwXG4gICAgQGlBbS5jb3VudGluZyAgICA9IHRydWVcbiAgICBAbXkudGltZS5zdGFydCAgID0gQGdldFRpbWUoKVxuICAgIEBteS50aW1lLmVsYXBzZWQgPSAwXG5cbiAgc3RvcE9ic2VydmF0aW9uczogKGUpIC0+XG4gICAgY2xlYXJJbnRlcnZhbCBAdGltZXJJbnRlcnZhbFxuICAgIGZyb21DbGljayA9IGU/XG4gICAgaXNudFByZW1hdHVyZVN0b3AgPSAhIGU/XG4gICAgaWYgZT8gXG4gICAgICBAdHJpZ2dlciBcInNob3dOZXh0XCJcblxuICAgIGlmIGlzbnRQcmVtYXR1cmVTdG9wICYmIG5vdCBAaUhhdmUuZmluaXNoZWRcbiAgICAgIGlmIEBpQW0ucmVjb3JkaW5nXG4gICAgICAgIEByZXNldE9ic2VydmF0aW9uRmxhZ3MoKVxuICAgICAgICBAc2F2ZUN1cnJlbnRTdXJ2ZXkoKVxuICAgICAgQG15Lm9ic2VydmF0aW9uLmluZGV4KytcbiAgICAgIEByZW5kZXJTdXJ2ZXkoKVxuICAgIGVsc2VcbiAgICAgIEAkZWwuZmluZChcIi5zdG9wX2J1dHRvbl93cmFwcGVyXCIpLmFkZENsYXNzKFwiY29uZmlybWF0aW9uXCIpXG4gICAgICBVdGlscy5taWRBbGVydCB0KFwib2JzZXJ2YXRpb25zIGZpbmlzaGVkXCIpXG4gICAgQCRlbC5maW5kKFwiLm5leHRfZGlzcGxheVwiKS5hZGRDbGFzcyhcImNvbmZpcm1hdGlvblwiKVxuICAgIEBpSGF2ZS5maW5pc2hlZCA9IHRydWVcbiAgICBAaUhhdmUucnVuT25jZSA9IHRydWVcbiAgICBcblxuICAjIHJ1bnMgZXZlcnkgc2Vjb25kIHRoZSB0aW1lciBpcyBydW5uaW5nXG4gIHRpY2s6ID0+XG4gICAgQG15LnRpbWUuZWxhcHNlZCA9IEBnZXRUaW1lKCkgLSBAbXkudGltZS5zdGFydFxuICAgIEBjaGVja0lmT3ZlcigpXG4gICAgQHVwZGF0ZU9ic2VydmF0aW9uSW5kZXgoKVxuICAgIEB1cGRhdGVQcm9ncmVzc0Rpc3BsYXkoKVxuICAgIEBjaGVja1N1cnZleURpc3BsYXkoKVxuICAgIEBjaGVja09ic2VydmF0aW9uUGFjZSgpXG4gICAgQGNoZWNrV2FybmluZygpXG5cbiAgY2hlY2tPYnNlcnZhdGlvblBhY2U6ID0+XG4gICAgIyBpZiB3ZSdyZSBzdGlsbCBlbnRlcmluZyBvYnNlcnZhdGlvbnMgYW5kIGl0J3MgdGltZSBmb3IgdGhlIG5leHQgb25lXG4gICAgaWYgQGlBbS5yZWNvcmRpbmcgJiYgQG15Lm9ic2VydmF0aW9uLmNvbXBsZXRlZCA8IChAbXkub2JzZXJ2YXRpb24uaW5kZXgtMSkgJiYgQG15Lm9ic2VydmF0aW9uLmluZGV4ICE9IDAgIyBzdGFydHMgYXQgMCwgdGhlbiBnb2VzIHRvIDFcbiAgICAgIEBpSGF2ZS5mb3JjZWRQcm9ncmVzc2lvbiA9IHRydWVcbiAgICAgIEByZXNldE9ic2VydmF0aW9uRmxhZ3MoKVxuICAgICAgQHNhdmVDdXJyZW50U3VydmV5KClcbiAgICAgIEByZW5kZXJTdXJ2ZXkoKVxuXG4gIGNoZWNrV2FybmluZzogPT5cbiAgICBwcm9qZWN0ZWRJbmRleCA9IE1hdGguZmxvb3IoIChAbXkudGltZS5lbGFwc2VkICsgQHdhcm5pbmdTZWNvbmRzKSAvIEBtb2RlbC5nZXQoJ2ludGVydmFsTGVuZ3RoJykgKVxuICAgIGlTaG91bGRXYXJuID0gQG15Lm9ic2VydmF0aW9uLmluZGV4IDwgcHJvamVjdGVkSW5kZXggJiYgISBAaUhhdmUuZmluaXNoZWRcbiAgICAjIGlmIHdlJ3JlIHN0aWxsIGVudGVyaW5nIG9ic2VydmF0aW9ucywgd2FybiB0aGUgdXNlclxuICAgIGlmIEBpQW0ucmVjb3JkaW5nICYmIEBpSGF2ZW50Lndhcm5lZCAmJiBpU2hvdWxkV2FybiAmJiBAbXkub2JzZXJ2YXRpb24uaW5kZXggIT0gMCAjIGZpcnN0IG9uZSBkb2Vzbid0IGNvdW50XG4gICAgICBVdGlscy5taWRBbGVydCB0KFwib2JzZXJ2YXRpb24gZW5kaW5nIHNvb25cIilcbiAgICAgIEBpSGF2ZW50Lndhcm5lZCA9IGZhbHNlXG4gIFxuICBncmlkV2FzQXV0b3N0b3BwZWQ6IC0+XG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgY2hlY2tJZk92ZXI6ID0+XG4gICAgaWYgQG15LnRpbWUuZWxhcHNlZCA+PSBAbW9kZWwuZ2V0KFwidG90YWxTZWNvbmRzXCIpXG4gICAgICBAc3RvcE9ic2VydmF0aW9ucygpXG5cbiAgY2hlY2tTdXJ2ZXlEaXNwbGF5OiA9PlxuICAgICMgY2hhbmdlLCBuZWVkcyB0byBkaXNwbGF5IG5ldyBzdXJ2ZXlcbiAgICBpZiBAbXkub2JzZXJ2YXRpb24ub2xkSW5kZXggIT0gQG15Lm9ic2VydmF0aW9uLmluZGV4ICYmICFAaUhhdmUuZmluaXNoZWQgJiYgIUBpQW0ucmVjb3JkaW5nXG4gICAgICBAcmVuZGVyU3VydmV5KClcbiAgICAgIEBteS5vYnNlcnZhdGlvbi5vbGRJbmRleCA9IEBteS5vYnNlcnZhdGlvbi5pbmRleFxuXG4gIHVwZGF0ZU9ic2VydmF0aW9uSW5kZXg6ID0+XG4gICAgQG15Lm9ic2VydmF0aW9uLmluZGV4ID0gTWF0aC5mbG9vciggKCBAbXkudGltZS5lbGFwc2VkICkgLyBAbW9kZWwuZ2V0KCdpbnRlcnZhbExlbmd0aCcpIClcbiAgICBpZiBAbXkub2JzZXJ2YXRpb24uaW5kZXggPiBAc3VydmV5Lm1vZGVscy5sZW5ndGggLSAxXG4gICAgICBAbXkub2JzZXJ2YXRpb24uaW5kZXggPSBAc3VydmV5Lm1vZGVscy5sZW5ndGggLSAxXG5cbiAgdXBkYXRlUHJvZ3Jlc3NEaXNwbGF5OiAtPlxuICAgICMgYmFja2JvbmUuanMsIHkgdSBubyBoYXZlIGRhdGEgYmluZGluZ3M/IGFic3RyYWN0IG1vcmVcbiAgICBAJGVsLmZpbmQoXCIuY3VycmVudF9vYnNlcnZhdGlvblwiKS5odG1sIEBteS5vYnNlcnZhdGlvbi5pbmRleFxuICAgIEAkZWwuZmluZChcIi5jb21wbGV0ZWRfY291bnRcIikuaHRtbCAgICAgQG15Lm9ic2VydmF0aW9uLmNvbXBsZXRlZFxuXG4gICAgdGltZVRpbGxOZXh0ID0gTWF0aC5tYXgoKChAbXkub2JzZXJ2YXRpb24uaW5kZXggKyAxKSAqIEBtb2RlbC5nZXQoJ2ludGVydmFsTGVuZ3RoJykpIC0gQG15LnRpbWUuZWxhcHNlZCwgMClcbiAgICBAJGVsLmZpbmQoXCIudGltZV90aWxsX25leHRcIikuaHRtbCB0aW1lVGlsbE5leHRcblxuICAgIGlmIG5vdCBAaUFtLnJlY29yZGluZyAmJiBub3QgQGlIYXZlLmZpbmlzaGVkXG4gICAgICBAJGVsLmZpbmQoXCIubmV4dF9kaXNwbGF5LCAuY29tcGxldGVkX2Rpc3BsYXlcIikucmVtb3ZlQ2xhc3MgXCJjb25maXJtYXRpb25cIiBcblxuICByZXNldE9ic2VydmF0aW9uRmxhZ3M6IC0+XG4gICAgQGlBbS5yZWNvcmRpbmcgID0gZmFsc2VcbiAgICBAaUhhdmVudC53YXJuZWQgPSB0cnVlXG5cbiAgZ2V0VGltZTogLT4gcGFyc2VJbnQoICggbmV3IERhdGUoKSApLmdldFRpbWUoKSAvIDEwMDAgKVxuXG4gIGNvbXBsZXRlT2JzZXJ2YXRpb246IChvcHRpb24pIC0+XG5cbiAgICBpZiBAc3VydmV5LnZpZXcuaXNWYWxpZCgpXG4gICAgICBAc2F2ZUN1cnJlbnRTdXJ2ZXkoKVxuICAgICAgQHRyaWdnZXIgXCJzaG93TmV4dFwiIGlmIEBpSGF2ZS5maW5pc2hlZFxuICAgIGVsc2VcbiAgICAgIEBzdXJ2ZXkudmlldy5zaG93RXJyb3JzKClcblxuICAgIEB0aWNrKCkgIyB1cGRhdGUgZGlzcGxheXNcblxuXG5cblxuICBzYXZlQ3VycmVudFN1cnZleTogPT5cbiAgICBAcmVzZXRPYnNlcnZhdGlvbkZsYWdzKClcbiAgICBAbXkub2JzZXJ2YXRpb24uY29tcGxldGVkKytcbiAgICBAc3VydmV5LnJlc3VsdHMucHVzaFxuICAgICAgb2JzZXJ2YXRpb25OdW1iZXIgOiBAc3VydmV5LnZpZXcuaW5kZXggIyB2aWV3J3MgaW5kZXhcbiAgICAgIGRhdGEgICAgICAgICAgICAgIDogQHN1cnZleS52aWV3LmdldFJlc3VsdCgpXG4gICAgICBzYXZlVGltZSAgICAgICAgICA6IEBteS50aW1lLmVsYXBzZWRcbiAgICBAc3VydmV5LnZpZXcuY2xvc2UoKVxuICAgIEAkZWwuZmluZChcIi5kb25lXCIpLnJlbW92ZSgpXG5cblxuICByZW5kZXI6IC0+XG4gICAgQHRyaWdnZXIgXCJoaWRlTmV4dFwiXG4gICAgdG90YWxTZWNvbmRzID0gQG1vZGVsLmdldChcInRvdGFsU2Vjb25kc1wiKVxuXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8ZGl2IGNsYXNzPSd0aW1lcl93cmFwcGVyJz5cbiAgICAgICAgPGRpdiBjbGFzcz0ncHJvZ3Jlc3MgY2xlYXJmaXgnPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPSdjb21wbGV0ZWRfZGlzcGxheSBjb25maXJtYXRpb24nPiN7dCgnY29tcGxldGVkJyl9IDxkaXYgY2xhc3M9J2luZm9fYm94IGNvbXBsZXRlZF9jb3VudCc+I3tAbXkub2JzZXJ2YXRpb24uY29tcGxldGVkfTwvZGl2Pjwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzcz0nbmV4dF9kaXNwbGF5IGNvbmZpcm1hdGlvbic+I3t0KCduZXh0IG9ic2VydmF0aW9uJyl9IDxkaXYgY2xhc3M9J2luZm9fYm94IHRpbWVfdGlsbF9uZXh0Jz4je0Btb2RlbC5nZXQoJ2ludGVydmFsTGVuZ3RoJyl9PC9kaXY+PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdzdGFydF9idXR0b25fd3JhcHBlcic+PGJ1dHRvbiBjbGFzcz0nc3RhcnRfdGltZSBjb21tYW5kJz4je3QoJ3N0YXJ0Jyl9PC9idXR0b24+PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz0nc3RvcF9idXR0b25fd3JhcHBlciBjb25maXJtYXRpb24nPjxidXR0b24gY2xhc3M9J3N0b3BfdGltZSBjb21tYW5kJz4je3QoJ2Fib3J0IGFsbCBvYnNlcnZhdGlvbnMnKX08L2J1dHRvbj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgaWQ9J2N1cnJlbnRfc3VydmV5Jz48L2Rpdj5cbiAgICBcIlxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4gICAgQHRyaWdnZXIgXCJyZWFkeVwiXG5cbiAgcmVuZGVyU3VydmV5OiAoZSkgLT5cbiAgICBpZiBub3QgQGlBbS5jb3VudGluZyB0aGVuIHJldHVyblxuICAgIEBpQW0ucmVjb3JkaW5nID0gdHJ1ZVxuICAgIFxuICAgIEBzdXJ2ZXkudmlldyAgPSBuZXcgU3VydmV5UnVuVmlld1xuICAgICAgXCJtb2RlbFwiICAgICAgICAgOiBAc3VydmV5Lm1vZGVsc1tAbXkub2JzZXJ2YXRpb24uaW5kZXhdXG4gICAgICBcInBhcmVudFwiICAgICAgICA6IEBcbiAgICAgIFwiaXNPYnNlcnZhdGlvblwiIDogdHJ1ZVxuICAgIEBzdXJ2ZXkudmlldy5pbmRleCA9IGRvID0+IEBteS5vYnNlcnZhdGlvbi5pbmRleCAjIGFkZCBhbiBpbmRleCBmb3IgcmVmZXJlbmNlXG5cbiAgICAjIGxpc3RlbiBmb3IgcmVuZGVyIGV2ZW50cywgcGFzcyB0aGVtIHVwXG4gICAgQHN1cnZleS52aWV3Lm9uIFwicmVuZGVyZWQgc3ViUmVuZGVyZWRcIiwgPT4gQHRyaWdnZXIgXCJzdWJSZW5kZXJlZFwiXG5cbiAgICBAc3VydmV5LnZpZXcucmVuZGVyKClcblxuICAgIEAkZWwuZmluZChcIiNjdXJyZW50X3N1cnZleVwiKS5odG1sKFwiPHNwYW4gY2xhc3M9J29ic2VydmF0aW9uX2Rpc3BsYXkgY29uZmlybWF0aW9uJz4je3QoJ29ic2VydmF0aW9uJyl9IDxkaXYgY2xhc3M9J2luZm9fYm94IGN1cnJlbnRfb2JzZXJ2YXRpb24nPiN7QG15Lm9ic2VydmF0aW9uLmluZGV4fTwvZGl2Pjwvc3Bhbj5cIilcbiAgICBAJGVsLmZpbmQoXCIjY3VycmVudF9zdXJ2ZXlcIikuYXBwZW5kIEBzdXJ2ZXkudmlldy5lbFxuICAgIEAkZWwuZmluZChcIiNjdXJyZW50X3N1cnZleVwiKS5hcHBlbmQgXCI8YnV0dG9uIGNsYXNzPSdjb21tYW5kIGRvbmUnPiN7dCgnZG9uZSB3aXRoIHRoaXMgb2JzZXJ2YXRpb24nKX08L2J1dHRvbj5cIlxuICAgIFxuICAgIEAkZWwuZmluZChcIiNjdXJyZW50X3N1cnZleVwiKS5zY3JvbGxUbyAyNTAsID0+IFxuICAgICAgaWYgQGlIYXZlLmZvcmNlZFByb2dyZXNzaW9uXG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IHQoXCJwbGVhc2UgY29udGludWUgd2l0aCB0aGUgbmV4dCBvYnNlcnZhdGlvblwiKVxuICAgICAgICBAaUhhdmUuZm9yY2VkUHJvZ3Jlc3Npb24gPSBmYWxzZVxuICAgICAgZWxzZSBpZiBAaUhhdmUuZmluaXNoZWRcbiAgICAgICAgVXRpbHMubWlkQWxlcnQgdChcInBsZWFzZSBlbnRlciBsYXN0IG9ic2VydmF0aW9uXCIpXG5cblxuICBvbkNsb3NlOiAtPlxuICAgIEBzdXJ2ZXkudmlldz8uY2xvc2UoKVxuICAgIEBza2lwcGFibGVWaWV3LmNsb3NlKClcblxuICBnZXRSZXN1bHQ6IC0+XG4gICAge1xuICAgICAgXCJzdXJ2ZXlzXCIgICAgICAgICAgICAgICA6IEBzdXJ2ZXkucmVzdWx0c1xuICAgICAgXCJ2YXJpYWJsZU5hbWVcIiAgICAgICAgICA6IEBtb2RlbC5nZXQoXCJ2YXJpYWJsZU5hbWVcIilcbiAgICAgIFwidG90YWxUaW1lXCIgICAgICAgICAgICAgOiBAbW9kZWwuZ2V0KFwidG90YWxUaW1lXCIpXG4gICAgICBcImludGVydmFsTGVuZ3RoXCIgICAgICAgIDogQG1vZGVsLmdldChcImludGVydmFsVGltZVwiKVxuICAgICAgXCJjb21wbGV0ZWRPYnNlcnZhdGlvbnNcIiA6IEBteS5vYnNlcnZhdGlvbi5jb21wbGV0ZWRcbiAgICB9XG5cbiAgZ2V0U3VtOiAtPlxuICAgIHtcbiAgICAgIFwidG90YWxcIiA6IEBteS5vYnNlcnZhdGlvbi5jb21wbGV0ZWQgXG4gICAgfVxuXG4gIGdldFNraXBwZWQ6IC0+XG4gICAgdmlld1Jlc3VsdCA9IEBza2lwcGFibGVWaWV3LmdldFNraXBwZWQoKVxuICAgIHNraXBwZWRSZXN1bHRzID0gW11cbiAgICBmb3IgaSBpbiBbMS4uKEBzdXJ2ZXkubW9kZWxzLmxlbmd0aC0xKV1cbiAgICAgIHNraXBwZWRSZXN1bHRzLnB1c2hcbiAgICAgICAgb2JzZXJ2YXRpb25OdW1iZXIgOiBpICMgdmlldydzIGluZGV4XG4gICAgICAgIGRhdGEgICAgICAgICAgICAgIDogdmlld1Jlc3VsdFxuICAgICAgICBzYXZlVGltZSAgICAgICAgICA6IFwic2tpcHBlZFwiXG5cbiAgICByZXR1cm4ge1xuICAgICAgXCJzdXJ2ZXlzXCIgICAgICAgICAgICAgICA6IHNraXBwZWRSZXN1bHRzXG4gICAgICBcInZhcmlhYmxlTmFtZVwiICAgICAgICAgIDogXCJza2lwcGVkXCJcbiAgICAgIFwidG90YWxUaW1lXCIgICAgICAgICAgICAgOiBcInNraXBwZWRcIlxuICAgICAgXCJpbnRlcnZhbExlbmd0aFwiICAgICAgICA6IFwic2tpcHBlZFwiXG4gICAgICBcImNvbXBsZXRlZE9ic2VydmF0aW9uc1wiIDogXCJza2lwcGVkXCJcbiAgICB9XG5cbiAgaXNWYWxpZDogLT5cbiAgICBAaUhhdmUuZmluaXNoZWRcblxuICBzaG93RXJyb3JzOiAtPlxuICAgIEAkZWwuZmluZChcIm1lc3NhZ2VzXCIpLmh0bWwgQHZhbGlkYXRvci5nZXRFcnJvcnMoKS5qb2luKFwiLCBcIilcblxuICB1cGRhdGVOYXZpZ2F0aW9uOiAtPlxuICAgIFRhbmdlcmluZS5uYXYuc2V0U3R1ZGVudCBAJGVsLmZpbmQoJyNwYXJ0aWNpcGFudF9pZCcpLnZhbCgpIl19
