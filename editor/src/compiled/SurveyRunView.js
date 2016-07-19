var SurveyRunView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SurveyRunView = (function(superClass) {
  extend(SurveyRunView, superClass);

  function SurveyRunView() {
    this.onQuestionRendered = bind(this.onQuestionRendered, this);
    this.getResult = bind(this.getResult, this);
    this.updateSkipLogic = bind(this.updateSkipLogic, this);
    this.onQuestionAnswer = bind(this.onQuestionAnswer, this);
    this.updateExecuteReady = bind(this.updateExecuteReady, this);
    return SurveyRunView.__super__.constructor.apply(this, arguments);
  }

  SurveyRunView.prototype.className = "SurveyRunView";

  SurveyRunView.prototype.events = {
    'click .next_question': 'nextQuestion',
    'click .prev_question': 'prevQuestion'
  };

  SurveyRunView.prototype.nextQuestion = function() {
    var currentQuestionView, i, isAutostopped, isAvailable, isLogicSkipped, j, len, plannedIndex, question, ref;
    currentQuestionView = this.questionViews[this.questionIndex];
    if (!this.isValid(currentQuestionView)) {
      return this.showErrors(currentQuestionView);
    }
    isAvailable = [];
    ref = this.questionViews;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      question = ref[i];
      isAutostopped = question.$el.hasClass("disabled_autostop");
      isLogicSkipped = question.$el.hasClass("disabled_skipped");
      if (!(isAutostopped || isLogicSkipped)) {
        isAvailable.push(i);
      }
    }
    isAvailable = _.filter(isAvailable, (function(_this) {
      return function(e) {
        return e > _this.questionIndex;
      };
    })(this));
    if (isAvailable.length === 0) {
      plannedIndex = this.questionIndex;
    } else {
      plannedIndex = Math.min.apply(plannedIndex, isAvailable);
    }
    if (this.questionIndex !== plannedIndex) {
      this.questionIndex = plannedIndex;
      this.updateQuestionVisibility();
      return this.updateProgressButtons();
    }
  };

  SurveyRunView.prototype.prevQuestion = function() {
    var currentQuestionView, i, isAutostopped, isAvailable, isLogicSkipped, j, len, plannedIndex, question, ref;
    currentQuestionView = this.questionViews[this.questionIndex];
    if (!this.isValid(currentQuestionView)) {
      return this.showErrors(currentQuestionView);
    }
    isAvailable = [];
    ref = this.questionViews;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      question = ref[i];
      isAutostopped = question.$el.hasClass("disabled_autostop");
      isLogicSkipped = question.$el.hasClass("disabled_skipped");
      if (!(isAutostopped || isLogicSkipped)) {
        isAvailable.push(i);
      }
    }
    isAvailable = _.filter(isAvailable, (function(_this) {
      return function(e) {
        return e < _this.questionIndex;
      };
    })(this));
    if (isAvailable.length === 0) {
      plannedIndex = this.questionIndex;
    } else {
      plannedIndex = Math.max.apply(plannedIndex, isAvailable);
    }
    if (this.questionIndex !== plannedIndex) {
      this.questionIndex = plannedIndex;
      this.updateQuestionVisibility();
      return this.updateProgressButtons();
    }
  };

  SurveyRunView.prototype.updateProgressButtons = function() {
    var $next, $prev, i, isAutostopped, isAvailable, isLogicSkipped, j, len, maximum, minimum, question, ref;
    isAvailable = [];
    ref = this.questionViews;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      question = ref[i];
      isAutostopped = question.$el.hasClass("disabled_autostop");
      isLogicSkipped = question.$el.hasClass("disabled_skipped");
      if (!(isAutostopped || isLogicSkipped)) {
        isAvailable.push(i);
      }
    }
    isAvailable.push(this.questionIndex);
    $prev = this.$el.find(".prev_question");
    $next = this.$el.find(".next_question");
    minimum = Math.min.apply(minimum, isAvailable);
    maximum = Math.max.apply(maximum, isAvailable);
    if (this.questionIndex === minimum) {
      $prev.hide();
    } else {
      $prev.show();
    }
    if (this.questionIndex === maximum) {
      return $next.hide();
    } else {
      return $next.show();
    }
  };

  SurveyRunView.prototype.updateExecuteReady = function(ready) {
    var index, j, len, ref, ref1;
    this.executeReady = ready;
    if (this.triggerShowList == null) {
      return;
    }
    if (this.triggerShowList.length > 0) {
      ref = this.triggerShowList;
      for (j = 0, len = ref.length; j < len; j++) {
        index = ref[j];
        if ((ref1 = this.questionViews[index]) != null) {
          ref1.trigger("show");
        }
      }
      this.triggerShowList = [];
    }
    if (this.executeReady) {
      return this.updateSkipLogic();
    }
  };

  SurveyRunView.prototype.updateQuestionVisibility = function() {
    var $questions;
    if (!this.model.get("focusMode")) {
      return;
    }
    if (this.questionIndex === this.questionViews.length) {
      this.$el.find("#summary_container").html("last page here");
      this.$el.find("#next_question").hide();
    } else {
      this.$el.find("#summary_container").empty();
      this.$el.find("#next_question").show();
    }
    $questions = this.$el.find(".question");
    $questions.hide();
    $questions.eq(this.questionIndex).show();
    if (this.executeReady) {
      return this.questionViews[this.questionIndex].trigger("show");
    } else {
      if (!this.triggerShowList) {
        this.triggerShowList = [];
      }
      return this.triggerShowList.push(this.questionIndex);
    }
  };

  SurveyRunView.prototype.showQuestion = function(index) {
    if (_.isNumber(index) && index < this.questionViews.length && index > 0) {
      this.questionIndex = index;
    }
    this.updateQuestionVisibility();
    return this.updateProgressButtons();
  };

  SurveyRunView.prototype.i18n = function() {
    return this.text = {
      pleaseAnswer: t("SurveyRunView.message.please_answer"),
      correctErrors: t("SurveyRunView.message.correct_errors"),
      notEnough: _(t("SurveyRunView.message.not_enough")).escape(),
      previousQuestion: t("SurveyRunView.button.previous_question"),
      nextQuestion: t("SurveyRunView.button.next_question")
    };
  };

  SurveyRunView.prototype.initialize = function(options) {
    this.model = options.model;
    this.parent = options.parent;
    this.dataEntry = options.dataEntry;
    this.isObservation = options.isObservation;
    this.focusMode = this.model.getBoolean("focusMode");
    if (this.focusMode) {
      this.questionIndex = 0;
    }
    this.questionViews = [];
    this.answered = [];
    this.renderCount = 0;
    this.i18n();
    this.questions = new Questions();
    return this.questions.fetch({
      key: "q" + this.model.get("assessmentId"),
      success: (function(_this) {
        return function(collection) {
          _this.questions = new Questions(collection.where({
            "subtestId": _this.model.id
          }));
          _this.questions.sort();
          _this.ready = true;
          return _this.render();
        };
      })(this)
    });
  };

  SurveyRunView.prototype.onQuestionAnswer = function(element) {
    var autostopCount, autostopLimit, cid, currentAnswer, i, j, k, len, longestSequence, next, ref, ref1, view;
    if (this.renderCount !== this.questions.length) {
      return;
    }
    if (this.isObservation) {
      cid = $(element).attr("data-cid");
      ref = this.questionViews;
      for (j = 0, len = ref.length; j < len; j++) {
        view = ref[j];
        if (view.cid === cid && view.type !== "multiple") {
          next = $(view.el).next();
          while (next.length !== 0 && next.hasClass("disabled_skipped")) {
            next = $(next).next();
          }
          if (next.length !== 0) {
            next.scrollTo();
          }
        }
      }
    }
    this.autostopped = false;
    autostopLimit = parseInt(this.model.get("autostopLimit")) || 0;
    longestSequence = 0;
    autostopCount = 0;
    if (autostopLimit > 0) {
      for (i = k = 1, ref1 = this.questionViews.length; 1 <= ref1 ? k <= ref1 : k >= ref1; i = 1 <= ref1 ? ++k : --k) {
        currentAnswer = this.questionViews[i - 1].answer;
        if (currentAnswer === "0" || currentAnswer === "9") {
          autostopCount++;
        } else {
          autostopCount = 0;
        }
        longestSequence = Math.max(longestSequence, autostopCount);
        if (autostopLimit !== 0 && longestSequence >= autostopLimit && !this.autostopped) {
          this.autostopped = true;
          this.autostopIndex = i;
        }
      }
    }
    this.updateAutostop();
    return this.updateSkipLogic();
  };

  SurveyRunView.prototype.updateAutostop = function() {
    var autostopLimit, i, j, len, ref, results, view;
    autostopLimit = parseInt(this.model.get("autostopLimit")) || 0;
    ref = this.questionViews;
    results = [];
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      view = ref[i];
      if (i > (this.autostopIndex - 1)) {
        if (this.autostopped) {
          view.$el.addClass("disabled_autostop");
        }
        if (!this.autostopped) {
          results.push(view.$el.removeClass("disabled_autostop"));
        } else {
          results.push(void 0);
        }
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  SurveyRunView.prototype.updateSkipLogic = function() {
    var error, error1, j, len, message, name, question, questionView, ref, result, results, skipLogicCode;
    ref = this.questionViews;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      questionView = ref[j];
      question = questionView.model;
      skipLogicCode = question.get("skipLogic");
      if (!_.isEmptyString(skipLogicCode)) {
        try {
          result = CoffeeScript["eval"].apply(this, [skipLogicCode]);
        } catch (error1) {
          error = error1;
          name = (/function (.{1,})\(/.exec(error.constructor.toString())[1]);
          message = error.message;
          alert("Skip logic error in question " + (question.get('name')) + "\n\n" + name + "\n\n" + message);
        }
        if (result) {
          questionView.$el.addClass("disabled_skipped");
        } else {
          questionView.$el.removeClass("disabled_skipped");
        }
      }
      results.push(questionView.updateValidity());
    }
    return results;
  };

  SurveyRunView.prototype.isValid = function(views) {
    var i, j, len, qv;
    if (views == null) {
      views = this.questionViews;
    }
    if (views == null) {
      return true;
    }
    if (!_.isArray(views)) {
      views = [views];
    }
    for (i = j = 0, len = views.length; j < len; i = ++j) {
      qv = views[i];
      qv.updateValidity();
      if (!qv.model.getBoolean("skippable")) {
        if (!qv.isValid) {
          return false;
        }
      }
    }
    return true;
  };

  SurveyRunView.prototype.getSkipped = function() {
    var i, j, len, qv, ref, result;
    result = {};
    ref = this.questionViews;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      qv = ref[i];
      result[this.questions.models[i].get("name")] = "skipped";
    }
    return result;
  };

  SurveyRunView.prototype.getResult = function() {
    var i, j, len, qv, ref, result;
    result = {};
    ref = this.questionViews;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      qv = ref[i];
      result[this.questions.models[i].get("name")] = qv.notAsked ? qv.notAskedResult : !_.isEmpty(qv.answer) ? qv.answer : qv.skipped ? qv.skippedResult : qv.$el.hasClass("disabled_skipped") ? qv.logicSkippedResult : qv.$el.hasClass("disabled_autostop") ? qv.notAskedAutostopResult : qv.answer;
    }
    return result;
  };

  SurveyRunView.prototype.showErrors = function(views) {
    var customMessage, first, i, j, len, message, qv, results;
    if (views == null) {
      views = this.questionViews;
    }
    this.$el.find('.message').remove();
    first = true;
    if (!_.isArray(views)) {
      views = [views];
    }
    results = [];
    for (i = j = 0, len = views.length; j < len; i = ++j) {
      qv = views[i];
      if (!_.isString(qv)) {
        message = "";
        if (!qv.isValid) {
          customMessage = qv.model.get("customValidationMessage");
          if (!_.isEmpty(customMessage)) {
            message = customMessage;
          } else {
            message = this.text.pleaseAnswer;
          }
          if (first === true) {
            if (views === this.questionViews) {
              this.showQuestion(i);
            }
            qv.$el.scrollTo();
            Utils.midAlert(this.text.correctErrors);
            first = false;
          }
        }
        results.push(qv.setMessage(message));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  SurveyRunView.prototype.render = function() {
    var answer, base, i, isNotAsked, j, k, len, len1, name, notAskedCount, oneView, previous, question, questionView, ref, ref1, required;
    if (!this.ready) {
      return;
    }
    this.$el.empty();
    if (!this.dataEntry) {
      if ((this.parent != null) && (this.parent.parent != null) && (this.parent.parent.result != null)) {
        previous = this.parent.parent.result.getByHash(this.model.get('hash'));
      }
    }
    notAskedCount = 0;
    this.questions.sort();
    if (this.questions.models != null) {
      ref = this.questions.models;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        question = ref[i];
        required = parseInt(question.get("linkedGridScore")) || 0;
        isNotAsked = ((required !== 0 && this.parent.getGridScore() < required) || this.parent.gridWasAutostopped()) && this.parent.getGridScore() !== false;
        if (isNotAsked) {
          notAskedCount++;
        }
        name = question.escape("name").replace(/[^A-Za-z0-9_]/g, "-");
        if (previous) {
          answer = previous[name];
        }
        oneView = new QuestionRunView({
          model: question,
          parent: this,
          dataEntry: this.dataEntry,
          notAsked: isNotAsked,
          isObservation: this.isObservation,
          answer: answer
        });
        oneView.on("rendered", this.onQuestionRendered);
        oneView.on("answer scroll", this.onQuestionAnswer);
        this.questionViews[i] = oneView;
        this.$el.append(oneView.el);
      }
      ref1 = this.questionViews;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        questionView = ref1[k];
        questionView.render();
      }
      if (this.focusMode) {
        this.updateQuestionVisibility();
        this.$el.append("<div id='summary_container'></div> <button class='navigation prev_question'>" + this.text.previousQuestion + "</button> <button class='navigation next_question'>" + this.text.nextQuestion + "</button>");
        this.updateProgressButtons();
      }
    }
    if (this.questions.length === notAskedCount) {
      if (typeof (base = this.parent).next === "function") {
        base.next();
      }
    }
    return this.trigger("rendered");
  };

  SurveyRunView.prototype.onQuestionRendered = function() {
    this.renderCount++;
    if (this.renderCount === this.questions.length) {
      this.trigger("ready");
      this.updateSkipLogic();
    }
    return this.trigger("subRendered");
  };

  SurveyRunView.prototype.onClose = function() {
    var j, len, qv, ref;
    ref = this.questionViews;
    for (j = 0, len = ref.length; j < len; j++) {
      qv = ref[j];
      if (typeof qv.close === "function") {
        qv.close();
      }
    }
    return this.questionViews = [];
  };

  return SurveyRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9TdXJ2ZXlSdW5WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGFBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs7Ozs7MEJBRUosU0FBQSxHQUFXOzswQkFFWCxNQUFBLEdBQ0U7SUFBQSxzQkFBQSxFQUF5QixjQUF6QjtJQUNBLHNCQUFBLEVBQXlCLGNBRHpCOzs7MEJBR0YsWUFBQSxHQUFjLFNBQUE7QUFFWixRQUFBO0lBQUEsbUJBQUEsR0FBc0IsSUFBQyxDQUFBLGFBQWMsQ0FBQSxJQUFDLENBQUEsYUFBRDtJQUdyQyxJQUFBLENBQStDLElBQUMsQ0FBQSxPQUFELENBQVMsbUJBQVQsQ0FBL0M7QUFBQSxhQUFPLElBQUMsQ0FBQSxVQUFELENBQVksbUJBQVosRUFBUDs7SUFHQSxXQUFBLEdBQWM7QUFDZDtBQUFBLFNBQUEsNkNBQUE7O01BQ0UsYUFBQSxHQUFpQixRQUFRLENBQUMsR0FBRyxDQUFDLFFBQWIsQ0FBc0IsbUJBQXRCO01BQ2pCLGNBQUEsR0FBaUIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFiLENBQXNCLGtCQUF0QjtNQUNqQixJQUFzQixDQUFJLENBQUMsYUFBQSxJQUFpQixjQUFsQixDQUExQjtRQUFBLFdBQVcsQ0FBQyxJQUFaLENBQWlCLENBQWpCLEVBQUE7O0FBSEY7SUFJQSxXQUFBLEdBQWUsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxXQUFULEVBQXNCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxDQUFEO2VBQU8sQ0FBQSxHQUFJLEtBQUMsQ0FBQTtNQUFaO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QjtJQUdmLElBQUcsV0FBVyxDQUFDLE1BQVosS0FBc0IsQ0FBekI7TUFDRSxZQUFBLEdBQWUsSUFBQyxDQUFBLGNBRGxCO0tBQUEsTUFBQTtNQUdFLFlBQUEsR0FBZSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQVQsQ0FBZSxZQUFmLEVBQTZCLFdBQTdCLEVBSGpC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QUFTLE9BQVQ7TUFDQSxJQUFDLENBQUEsZUFBRCxDQUFBLEVBRkY7O1dBR0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxhQUFUO0VBTGtCOzswQkFPcEIsT0FBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0FBQUE7QUFBQSxTQUFBLHFDQUFBOzs7UUFDRSxFQUFFLENBQUM7O0FBREw7V0FFQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtFQUhYOzs7O0dBaFdrQixRQUFRLENBQUMiLCJmaWxlIjoic3VidGVzdC9wcm90b3R5cGVzL1N1cnZleVJ1blZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTdXJ2ZXlSdW5WaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJTdXJ2ZXlSdW5WaWV3XCJcblxuICBldmVudHM6XG4gICAgJ2NsaWNrIC5uZXh0X3F1ZXN0aW9uJyA6ICduZXh0UXVlc3Rpb24nXG4gICAgJ2NsaWNrIC5wcmV2X3F1ZXN0aW9uJyA6ICdwcmV2UXVlc3Rpb24nXG5cbiAgbmV4dFF1ZXN0aW9uOiAtPlxuXG4gICAgY3VycmVudFF1ZXN0aW9uVmlldyA9IEBxdWVzdGlvblZpZXdzW0BxdWVzdGlvbkluZGV4XVxuXG4gICAgIyBzaG93IGVycm9ycyBiZWZvcmUgZG9pbmcgYW55dGhpbmcgaWYgdGhlcmUgYXJlIGFueVxuICAgIHJldHVybiBAc2hvd0Vycm9ycyhjdXJyZW50UXVlc3Rpb25WaWV3KSB1bmxlc3MgQGlzVmFsaWQoY3VycmVudFF1ZXN0aW9uVmlldylcblxuICAgICMgZmluZCB0aGUgbm9uLXNraXBwZWQgcXVlc3Rpb25zXG4gICAgaXNBdmFpbGFibGUgPSBbXVxuICAgIGZvciBxdWVzdGlvbiwgaSBpbiBAcXVlc3Rpb25WaWV3c1xuICAgICAgaXNBdXRvc3RvcHBlZCAgPSBxdWVzdGlvbi4kZWwuaGFzQ2xhc3MoXCJkaXNhYmxlZF9hdXRvc3RvcFwiKVxuICAgICAgaXNMb2dpY1NraXBwZWQgPSBxdWVzdGlvbi4kZWwuaGFzQ2xhc3MoXCJkaXNhYmxlZF9za2lwcGVkXCIpXG4gICAgICBpc0F2YWlsYWJsZS5wdXNoIGkgaWYgbm90IChpc0F1dG9zdG9wcGVkIG9yIGlzTG9naWNTa2lwcGVkKVxuICAgIGlzQXZhaWxhYmxlICA9IF8uZmlsdGVyIGlzQXZhaWxhYmxlLCAoZSkgPT4gZSA+IEBxdWVzdGlvbkluZGV4XG5cbiAgICAjIGRvbid0IGdvIGFueXdoZXJlIHVubGVzcyB3ZSBoYXZlIHNvbWV3aGVyZSB0byBnb1xuICAgIGlmIGlzQXZhaWxhYmxlLmxlbmd0aCA9PSAwXG4gICAgICBwbGFubmVkSW5kZXggPSBAcXVlc3Rpb25JbmRleFxuICAgIGVsc2VcbiAgICAgIHBsYW5uZWRJbmRleCA9IE1hdGgubWluLmFwcGx5KHBsYW5uZWRJbmRleCwgaXNBdmFpbGFibGUpXG5cbiAgICBpZiBAcXVlc3Rpb25JbmRleCAhPSBwbGFubmVkSW5kZXhcbiAgICAgIEBxdWVzdGlvbkluZGV4ID0gcGxhbm5lZEluZGV4XG4gICAgICBAdXBkYXRlUXVlc3Rpb25WaXNpYmlsaXR5KClcbiAgICAgIEB1cGRhdGVQcm9ncmVzc0J1dHRvbnMoKVxuXG4gIHByZXZRdWVzdGlvbjogLT5cblxuICAgIGN1cnJlbnRRdWVzdGlvblZpZXcgPSBAcXVlc3Rpb25WaWV3c1tAcXVlc3Rpb25JbmRleF1cblxuICAgICMgc2hvdyBlcnJvcnMgYmVmb3JlIGRvaW5nIGFueXRoaW5nIGlmIHRoZXJlIGFyZSBhbnlcbiAgICByZXR1cm4gQHNob3dFcnJvcnMoY3VycmVudFF1ZXN0aW9uVmlldykgdW5sZXNzIEBpc1ZhbGlkKGN1cnJlbnRRdWVzdGlvblZpZXcpXG5cbiAgICAjIGZpbmQgdGhlIG5vbi1za2lwcGVkIHF1ZXN0aW9uc1xuICAgIGlzQXZhaWxhYmxlID0gW11cbiAgICBmb3IgcXVlc3Rpb24sIGkgaW4gQHF1ZXN0aW9uVmlld3NcbiAgICAgIGlzQXV0b3N0b3BwZWQgID0gcXVlc3Rpb24uJGVsLmhhc0NsYXNzKFwiZGlzYWJsZWRfYXV0b3N0b3BcIilcbiAgICAgIGlzTG9naWNTa2lwcGVkID0gcXVlc3Rpb24uJGVsLmhhc0NsYXNzKFwiZGlzYWJsZWRfc2tpcHBlZFwiKVxuICAgICAgaXNBdmFpbGFibGUucHVzaCBpIGlmIG5vdCAoaXNBdXRvc3RvcHBlZCBvciBpc0xvZ2ljU2tpcHBlZClcbiAgICBpc0F2YWlsYWJsZSAgPSBfLmZpbHRlciBpc0F2YWlsYWJsZSwgKGUpID0+IGUgPCBAcXVlc3Rpb25JbmRleFxuXG4gICAgIyBkb24ndCBnbyBhbnl3aGVyZSB1bmxlc3Mgd2UgaGF2ZSBzb21ld2hlcmUgdG8gZ29cbiAgICBpZiBpc0F2YWlsYWJsZS5sZW5ndGggPT0gMFxuICAgICAgcGxhbm5lZEluZGV4ID0gQHF1ZXN0aW9uSW5kZXhcbiAgICBlbHNlXG4gICAgICBwbGFubmVkSW5kZXggPSBNYXRoLm1heC5hcHBseShwbGFubmVkSW5kZXgsIGlzQXZhaWxhYmxlKVxuXG4gICAgaWYgQHF1ZXN0aW9uSW5kZXggIT0gcGxhbm5lZEluZGV4XG4gICAgICBAcXVlc3Rpb25JbmRleCA9IHBsYW5uZWRJbmRleFxuICAgICAgQHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eSgpXG4gICAgICBAdXBkYXRlUHJvZ3Jlc3NCdXR0b25zKClcblxuICB1cGRhdGVQcm9ncmVzc0J1dHRvbnM6IC0+XG5cbiAgICBpc0F2YWlsYWJsZSA9IFtdXG4gICAgZm9yIHF1ZXN0aW9uLCBpIGluIEBxdWVzdGlvblZpZXdzXG4gICAgICBpc0F1dG9zdG9wcGVkICA9IHF1ZXN0aW9uLiRlbC5oYXNDbGFzcyhcImRpc2FibGVkX2F1dG9zdG9wXCIpXG4gICAgICBpc0xvZ2ljU2tpcHBlZCA9IHF1ZXN0aW9uLiRlbC5oYXNDbGFzcyhcImRpc2FibGVkX3NraXBwZWRcIilcbiAgICAgIGlzQXZhaWxhYmxlLnB1c2ggaSBpZiBub3QgKGlzQXV0b3N0b3BwZWQgb3IgaXNMb2dpY1NraXBwZWQpXG4gICAgaXNBdmFpbGFibGUucHVzaCBAcXVlc3Rpb25JbmRleFxuXG4gICAgJHByZXYgPSBAJGVsLmZpbmQoXCIucHJldl9xdWVzdGlvblwiKVxuICAgICRuZXh0ID0gQCRlbC5maW5kKFwiLm5leHRfcXVlc3Rpb25cIilcblxuICAgIG1pbmltdW0gPSBNYXRoLm1pbi5hcHBseSggbWluaW11bSwgaXNBdmFpbGFibGUgKVxuICAgIG1heGltdW0gPSBNYXRoLm1heC5hcHBseSggbWF4aW11bSwgaXNBdmFpbGFibGUgKVxuXG4gICAgaWYgQHF1ZXN0aW9uSW5kZXggPT0gbWluaW11bVxuICAgICAgJHByZXYuaGlkZSgpXG4gICAgZWxzZVxuICAgICAgJHByZXYuc2hvdygpXG5cbiAgICBpZiBAcXVlc3Rpb25JbmRleCA9PSBtYXhpbXVtXG4gICAgICAkbmV4dC5oaWRlKClcbiAgICBlbHNlXG4gICAgICAkbmV4dC5zaG93KClcblxuICB1cGRhdGVFeGVjdXRlUmVhZHk6IChyZWFkeSkgPT5cblxuICAgIEBleGVjdXRlUmVhZHkgPSByZWFkeVxuXG4gICAgcmV0dXJuIGlmIG5vdCBAdHJpZ2dlclNob3dMaXN0P1xuXG4gICAgaWYgQHRyaWdnZXJTaG93TGlzdC5sZW5ndGggPiAwXG4gICAgICBmb3IgaW5kZXggaW4gQHRyaWdnZXJTaG93TGlzdFxuICAgICAgICBAcXVlc3Rpb25WaWV3c1tpbmRleF0/LnRyaWdnZXIgXCJzaG93XCJcbiAgICAgIEB0cmlnZ2VyU2hvd0xpc3QgPSBbXVxuXG4gICAgQHVwZGF0ZVNraXBMb2dpYygpIGlmIEBleGVjdXRlUmVhZHlcblxuXG4gIHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eTogLT5cblxuICAgIHJldHVybiB1bmxlc3MgQG1vZGVsLmdldChcImZvY3VzTW9kZVwiKVxuXG4gICAgaWYgQHF1ZXN0aW9uSW5kZXggPT0gQHF1ZXN0aW9uVmlld3MubGVuZ3RoXG4gICAgICBAJGVsLmZpbmQoXCIjc3VtbWFyeV9jb250YWluZXJcIikuaHRtbCBcIlxuICAgICAgICBsYXN0IHBhZ2UgaGVyZVxuICAgICAgXCJcbiAgICAgIEAkZWwuZmluZChcIiNuZXh0X3F1ZXN0aW9uXCIpLmhpZGUoKVxuICAgIGVsc2VcbiAgICAgIEAkZWwuZmluZChcIiNzdW1tYXJ5X2NvbnRhaW5lclwiKS5lbXB0eSgpXG4gICAgICBAJGVsLmZpbmQoXCIjbmV4dF9xdWVzdGlvblwiKS5zaG93KClcblxuICAgICRxdWVzdGlvbnMgPSBAJGVsLmZpbmQoXCIucXVlc3Rpb25cIilcbiAgICAkcXVlc3Rpb25zLmhpZGUoKVxuICAgICRxdWVzdGlvbnMuZXEoQHF1ZXN0aW9uSW5kZXgpLnNob3coKVxuXG4gICAgIyB0cmlnZ2VyIHRoZSBxdWVzdGlvbiB0byBydW4gaXQncyBkaXNwbGF5IGNvZGUgaWYgdGhlIHN1YnRlc3QncyBkaXNwbGF5Y29kZSBoYXMgYWxyZWFkeSByYW5cbiAgICAjIGlmIG5vdCwgYWRkIGl0IHRvIGEgbGlzdCB0byBydW4gbGF0ZXIuXG4gICAgaWYgQGV4ZWN1dGVSZWFkeSBcbiAgICAgIEBxdWVzdGlvblZpZXdzW0BxdWVzdGlvbkluZGV4XS50cmlnZ2VyIFwic2hvd1wiXG4gICAgZWxzZVxuICAgICAgQHRyaWdnZXJTaG93TGlzdCA9IFtdIGlmIG5vdCBAdHJpZ2dlclNob3dMaXN0XG4gICAgICBAdHJpZ2dlclNob3dMaXN0LnB1c2ggQHF1ZXN0aW9uSW5kZXhcblxuICBzaG93UXVlc3Rpb246IChpbmRleCkgLT5cbiAgICBAcXVlc3Rpb25JbmRleCA9IGluZGV4IGlmIF8uaXNOdW1iZXIoaW5kZXgpICYmIGluZGV4IDwgQHF1ZXN0aW9uVmlld3MubGVuZ3RoICYmIGluZGV4ID4gMFxuICAgIEB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHkoKVxuICAgIEB1cGRhdGVQcm9ncmVzc0J1dHRvbnMoKVxuXG4gIGkxOG46IC0+XG4gICAgQHRleHQgPSBcbiAgICAgIHBsZWFzZUFuc3dlciA6IHQoXCJTdXJ2ZXlSdW5WaWV3Lm1lc3NhZ2UucGxlYXNlX2Fuc3dlclwiKVxuICAgICAgY29ycmVjdEVycm9ycyA6IHQoXCJTdXJ2ZXlSdW5WaWV3Lm1lc3NhZ2UuY29ycmVjdF9lcnJvcnNcIilcbiAgICAgIG5vdEVub3VnaCA6IF8odChcIlN1cnZleVJ1blZpZXcubWVzc2FnZS5ub3RfZW5vdWdoXCIpKS5lc2NhcGUoKVxuICAgICAgXG4gICAgICBwcmV2aW91c1F1ZXN0aW9uIDogdChcIlN1cnZleVJ1blZpZXcuYnV0dG9uLnByZXZpb3VzX3F1ZXN0aW9uXCIpXG4gICAgICBuZXh0UXVlc3Rpb24gOiB0KFwiU3VydmV5UnVuVmlldy5idXR0b24ubmV4dF9xdWVzdGlvblwiKVxuXG5cblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBAbW9kZWwgICAgICAgICA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ICAgICAgICA9IG9wdGlvbnMucGFyZW50XG4gICAgQGRhdGFFbnRyeSAgICAgPSBvcHRpb25zLmRhdGFFbnRyeVxuICAgIEBpc09ic2VydmF0aW9uID0gb3B0aW9ucy5pc09ic2VydmF0aW9uXG4gICAgQGZvY3VzTW9kZSAgICAgPSBAbW9kZWwuZ2V0Qm9vbGVhbihcImZvY3VzTW9kZVwiKVxuICAgIEBxdWVzdGlvbkluZGV4ID0gMCBpZiBAZm9jdXNNb2RlXG4gICAgQHF1ZXN0aW9uVmlld3MgPSBbXVxuICAgIEBhbnN3ZXJlZCAgICAgID0gW11cbiAgICBAcmVuZGVyQ291bnQgICA9IDBcblxuICAgIEBpMThuKClcblxuICAgIEBxdWVzdGlvbnMgICAgID0gbmV3IFF1ZXN0aW9ucygpXG4gICAgIyBAcXVlc3Rpb25zLmRiLnZpZXcgPSBcInF1ZXN0aW9uc0J5U3VidGVzdElkXCIgQnJpbmcgdGhpcyBiYWNrIHdoZW4gcHJvdG90eXBlcyBtYWtlIHNlbnNlIGFnYWluXG4gICAgQHF1ZXN0aW9ucy5mZXRjaFxuICAgICAga2V5OiBcInFcIiArIEBtb2RlbC5nZXQoXCJhc3Nlc3NtZW50SWRcIilcbiAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSA9PlxuICAgICAgICBAcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9ucyBjb2xsZWN0aW9uLndoZXJlIHtcInN1YnRlc3RJZFwiOkBtb2RlbC5pZH0gXG4gICAgICAgIEBxdWVzdGlvbnMuc29ydCgpXG4gICAgICAgIEByZWFkeSA9IHRydWVcbiAgICAgICAgQHJlbmRlcigpXG5cbiAgIyB3aGVuIGEgcXVlc3Rpb24gaXMgYW5zd2VyZWRcbiAgb25RdWVzdGlvbkFuc3dlcjogKGVsZW1lbnQpID0+XG5cbiAgICByZXR1cm4gdW5sZXNzIEByZW5kZXJDb3VudCA9PSBAcXVlc3Rpb25zLmxlbmd0aFxuXG4gICAgaWYgQGlzT2JzZXJ2YXRpb25cblxuICAgICAgIyBmaW5kIHRoZSB2aWV3IG9mIHRoZSBxdWVzdGlvblxuICAgICAgY2lkID0gJChlbGVtZW50KS5hdHRyKFwiZGF0YS1jaWRcIilcbiAgICAgIGZvciB2aWV3IGluIEBxdWVzdGlvblZpZXdzXG4gICAgICAgIGlmIHZpZXcuY2lkID09IGNpZCAmJiB2aWV3LnR5cGUgIT0gXCJtdWx0aXBsZVwiICMgaWYgaXQncyBtdWx0aXBsZSBkb24ndCBnbyBzY3JvbGxpblxuXG4gICAgICAgICAgIyBmaW5kIGxhc3Qgb3IgbmV4dCBub3Qgc2tpcHBlZFxuICAgICAgICAgIG5leHQgPSAkKHZpZXcuZWwpLm5leHQoKVxuICAgICAgICAgIHdoaWxlIG5leHQubGVuZ3RoICE9IDAgJiYgbmV4dC5oYXNDbGFzcyhcImRpc2FibGVkX3NraXBwZWRcIilcbiAgICAgICAgICAgIG5leHQgPSAkKG5leHQpLm5leHQoKVxuICAgICAgICAgIFxuICAgICAgICAgICMgaWYgaXQncyBub3QgdGhlIGxhc3QsIHNjcm9sbCB0byBpdFxuICAgICAgICAgIGlmIG5leHQubGVuZ3RoICE9IDBcbiAgICAgICAgICAgIG5leHQuc2Nyb2xsVG8oKVxuXG4gICAgIyBhdXRvIHN0b3AgYWZ0ZXIgbGltaXRcbiAgICBAYXV0b3N0b3BwZWQgICAgPSBmYWxzZVxuICAgIGF1dG9zdG9wTGltaXQgICA9IHBhcnNlSW50KEBtb2RlbC5nZXQoXCJhdXRvc3RvcExpbWl0XCIpKSB8fCAwXG4gICAgbG9uZ2VzdFNlcXVlbmNlID0gMFxuICAgIGF1dG9zdG9wQ291bnQgICA9IDBcblxuICAgIGlmIGF1dG9zdG9wTGltaXQgPiAwXG4gICAgICBmb3IgaSBpbiBbMS4uQHF1ZXN0aW9uVmlld3MubGVuZ3RoXSAjIGp1c3QgaW4gY2FzZSB0aGV5IGNhbid0IGNvdW50XG4gICAgICAgIGN1cnJlbnRBbnN3ZXIgPSBAcXVlc3Rpb25WaWV3c1tpLTFdLmFuc3dlclxuICAgICAgICBpZiBjdXJyZW50QW5zd2VyID09IFwiMFwiIG9yIGN1cnJlbnRBbnN3ZXIgPT0gXCI5XCJcbiAgICAgICAgICBhdXRvc3RvcENvdW50KytcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGF1dG9zdG9wQ291bnQgPSAwXG4gICAgICAgIGxvbmdlc3RTZXF1ZW5jZSA9IE1hdGgubWF4KGxvbmdlc3RTZXF1ZW5jZSwgYXV0b3N0b3BDb3VudClcbiAgICAgICAgIyBpZiB0aGUgdmFsdWUgaXMgc2V0LCB3ZSd2ZSBnb3QgYSB0aHJlc2hvbGQgZXhjZWVkaW5nIHJ1biwgYW5kIGl0J3Mgbm90IGFscmVhZHkgYXV0b3N0b3BwZWRcbiAgICAgICAgaWYgYXV0b3N0b3BMaW1pdCAhPSAwICYmIGxvbmdlc3RTZXF1ZW5jZSA+PSBhdXRvc3RvcExpbWl0ICYmIG5vdCBAYXV0b3N0b3BwZWRcbiAgICAgICAgICBAYXV0b3N0b3BwZWQgPSB0cnVlXG4gICAgICAgICAgQGF1dG9zdG9wSW5kZXggPSBpXG4gICAgQHVwZGF0ZUF1dG9zdG9wKClcbiAgICBAdXBkYXRlU2tpcExvZ2ljKClcbiAgXG4gIHVwZGF0ZUF1dG9zdG9wOiAtPlxuICAgIGF1dG9zdG9wTGltaXQgPSBwYXJzZUludChAbW9kZWwuZ2V0KFwiYXV0b3N0b3BMaW1pdFwiKSkgfHwgMFxuICAgIGZvciB2aWV3LCBpIGluIEBxdWVzdGlvblZpZXdzXG4gICAgICBpZiBpID4gKEBhdXRvc3RvcEluZGV4IC0gMSlcbiAgICAgICAgdmlldy4kZWwuYWRkQ2xhc3MgICAgXCJkaXNhYmxlZF9hdXRvc3RvcFwiIGlmICAgICBAYXV0b3N0b3BwZWRcbiAgICAgICAgdmlldy4kZWwucmVtb3ZlQ2xhc3MgXCJkaXNhYmxlZF9hdXRvc3RvcFwiIGlmIG5vdCBAYXV0b3N0b3BwZWRcblxuICB1cGRhdGVTa2lwTG9naWM6ID0+XG4gICAgZm9yIHF1ZXN0aW9uVmlldyBpbiBAcXVlc3Rpb25WaWV3c1xuICAgICAgcXVlc3Rpb24gPSBxdWVzdGlvblZpZXcubW9kZWxcbiAgICAgIHNraXBMb2dpY0NvZGUgPSBxdWVzdGlvbi5nZXQgXCJza2lwTG9naWNcIlxuICAgICAgaWYgbm90IF8uaXNFbXB0eVN0cmluZyhza2lwTG9naWNDb2RlKVxuICAgICAgICB0cnlcbiAgICAgICAgICByZXN1bHQgPSBDb2ZmZWVTY3JpcHQuZXZhbC5hcHBseShALCBbc2tpcExvZ2ljQ29kZV0pXG4gICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgbmFtZSA9ICgoL2Z1bmN0aW9uICguezEsfSlcXCgvKS5leGVjKGVycm9yLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkpWzFdKVxuICAgICAgICAgIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlXG4gICAgICAgICAgYWxlcnQgXCJTa2lwIGxvZ2ljIGVycm9yIGluIHF1ZXN0aW9uICN7cXVlc3Rpb24uZ2V0KCduYW1lJyl9XFxuXFxuI3tuYW1lfVxcblxcbiN7bWVzc2FnZX1cIlxuXG4gICAgICAgIGlmIHJlc3VsdFxuICAgICAgICAgIHF1ZXN0aW9uVmlldy4kZWwuYWRkQ2xhc3MgXCJkaXNhYmxlZF9za2lwcGVkXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHF1ZXN0aW9uVmlldy4kZWwucmVtb3ZlQ2xhc3MgXCJkaXNhYmxlZF9za2lwcGVkXCJcbiAgICAgIHF1ZXN0aW9uVmlldy51cGRhdGVWYWxpZGl0eSgpXG5cbiAgaXNWYWxpZDogKHZpZXdzID0gQHF1ZXN0aW9uVmlld3MpIC0+XG4gICAgcmV0dXJuIHRydWUgaWYgbm90IHZpZXdzPyAjIGlmIHRoZXJlJ3Mgbm90aGluZyB0byBjaGVjaywgaXQgbXVzdCBiZSBnb29kXG4gICAgdmlld3MgPSBbdmlld3NdIGlmIG5vdCBfLmlzQXJyYXkodmlld3MpXG4gICAgZm9yIHF2LCBpIGluIHZpZXdzXG4gICAgICBxdi51cGRhdGVWYWxpZGl0eSgpXG4gICAgICAjIGNhbiB3ZSBza2lwIGl0P1xuICAgICAgaWYgbm90IHF2Lm1vZGVsLmdldEJvb2xlYW4oXCJza2lwcGFibGVcIilcbiAgICAgICAgIyBpcyBpdCB2YWxpZFxuICAgICAgICBpZiBub3QgcXYuaXNWYWxpZFxuICAgICAgICAgICMgcmVkIGFsZXJ0ISFcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIGdldFNraXBwZWQ6IC0+XG4gICAgcmVzdWx0ID0ge31cbiAgICByZXN1bHRbQHF1ZXN0aW9ucy5tb2RlbHNbaV0uZ2V0KFwibmFtZVwiKV0gPSBcInNraXBwZWRcIiBmb3IgcXYsIGkgaW4gQHF1ZXN0aW9uVmlld3NcbiAgICByZXR1cm4gcmVzdWx0XG5cbiAgZ2V0UmVzdWx0OiA9PlxuICAgIHJlc3VsdCA9IHt9XG4gICAgZm9yIHF2LCBpIGluIEBxdWVzdGlvblZpZXdzXG4gICAgICByZXN1bHRbQHF1ZXN0aW9ucy5tb2RlbHNbaV0uZ2V0KFwibmFtZVwiKV0gPVxuICAgICAgICBpZiBxdi5ub3RBc2tlZCAjIGJlY2F1c2Ugb2YgZ3JpZCBzY29yZVxuICAgICAgICAgIHF2Lm5vdEFza2VkUmVzdWx0XG4gICAgICAgIGVsc2UgaWYgbm90IF8uaXNFbXB0eShxdi5hbnN3ZXIpICMgdXNlIGFuc3dlclxuICAgICAgICAgIHF2LmFuc3dlclxuICAgICAgICBlbHNlIGlmIHF2LnNraXBwZWQgXG4gICAgICAgICAgcXYuc2tpcHBlZFJlc3VsdFxuICAgICAgICBlbHNlIGlmIHF2LiRlbC5oYXNDbGFzcyhcImRpc2FibGVkX3NraXBwZWRcIilcbiAgICAgICAgICBxdi5sb2dpY1NraXBwZWRSZXN1bHRcbiAgICAgICAgZWxzZSBpZiBxdi4kZWwuaGFzQ2xhc3MoXCJkaXNhYmxlZF9hdXRvc3RvcFwiKVxuICAgICAgICAgIHF2Lm5vdEFza2VkQXV0b3N0b3BSZXN1bHRcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHF2LmFuc3dlclxuICAgIHJldHVybiByZXN1bHRcblxuICBzaG93RXJyb3JzOiAodmlld3MgPSBAcXVlc3Rpb25WaWV3cykgLT5cbiAgICBAJGVsLmZpbmQoJy5tZXNzYWdlJykucmVtb3ZlKClcbiAgICBmaXJzdCA9IHRydWVcbiAgICB2aWV3cyA9IFt2aWV3c10gaWYgbm90IF8uaXNBcnJheSh2aWV3cylcbiAgICBmb3IgcXYsIGkgaW4gdmlld3NcbiAgICAgIGlmIG5vdCBfLmlzU3RyaW5nKHF2KVxuICAgICAgICBtZXNzYWdlID0gXCJcIlxuICAgICAgICBpZiBub3QgcXYuaXNWYWxpZFxuXG4gICAgICAgICAgIyBoYW5kbGUgY3VzdG9tIHZhbGlkYXRpb24gZXJyb3IgbWVzc2FnZXNcbiAgICAgICAgICBjdXN0b21NZXNzYWdlID0gcXYubW9kZWwuZ2V0KFwiY3VzdG9tVmFsaWRhdGlvbk1lc3NhZ2VcIilcbiAgICAgICAgICBpZiBub3QgXy5pc0VtcHR5KGN1c3RvbU1lc3NhZ2UpXG4gICAgICAgICAgICBtZXNzYWdlID0gY3VzdG9tTWVzc2FnZVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBAdGV4dC5wbGVhc2VBbnN3ZXJcblxuICAgICAgICAgIGlmIGZpcnN0ID09IHRydWVcbiAgICAgICAgICAgIEBzaG93UXVlc3Rpb24oaSkgaWYgdmlld3MgPT0gQHF1ZXN0aW9uVmlld3NcbiAgICAgICAgICAgIHF2LiRlbC5zY3JvbGxUbygpXG4gICAgICAgICAgICBVdGlscy5taWRBbGVydCBAdGV4dC5jb3JyZWN0RXJyb3JzXG4gICAgICAgICAgICBmaXJzdCA9IGZhbHNlXG4gICAgICAgIHF2LnNldE1lc3NhZ2UgbWVzc2FnZVxuXG4gIHJlbmRlcjogLT5cbiAgICByZXR1cm4gdW5sZXNzIEByZWFkeVxuICAgIEAkZWwuZW1wdHkoKVxuXG4gICAgdW5sZXNzIEBkYXRhRW50cnlcbiAgICAgICMgY2xhc3MgZG9lc24ndCBoYXZlIHRoaXMgaGVpcmFyY2h5XG4gICAgICBpZiBAcGFyZW50PyBhbmQgQHBhcmVudC5wYXJlbnQ/IGFuZCBAcGFyZW50LnBhcmVudC5yZXN1bHQ/XG4gICAgICAgIHByZXZpb3VzID0gQHBhcmVudC5wYXJlbnQucmVzdWx0LmdldEJ5SGFzaChAbW9kZWwuZ2V0KCdoYXNoJykpXG5cbiAgICBub3RBc2tlZENvdW50ID0gMFxuICAgIEBxdWVzdGlvbnMuc29ydCgpXG4gICAgaWYgQHF1ZXN0aW9ucy5tb2RlbHM/XG4gICAgICBmb3IgcXVlc3Rpb24sIGkgaW4gQHF1ZXN0aW9ucy5tb2RlbHNcbiAgICAgICAgIyBza2lwIHRoZSByZXN0IGlmIHNjb3JlIG5vdCBoaWdoIGVub3VnaFxuXG4gICAgICAgIHJlcXVpcmVkID0gcGFyc2VJbnQocXVlc3Rpb24uZ2V0KFwibGlua2VkR3JpZFNjb3JlXCIpKSB8fCAwXG5cbiAgICAgICAgaXNOb3RBc2tlZCA9ICggKCByZXF1aXJlZCAhPSAwICYmIEBwYXJlbnQuZ2V0R3JpZFNjb3JlKCkgPCByZXF1aXJlZCApIHx8IEBwYXJlbnQuZ3JpZFdhc0F1dG9zdG9wcGVkKCkgKSAmJiBAcGFyZW50LmdldEdyaWRTY29yZSgpICE9IGZhbHNlXG5cbiAgICAgICAgaWYgaXNOb3RBc2tlZCB0aGVuIG5vdEFza2VkQ291bnQrK1xuXG4gICAgICAgIG5hbWUgICA9IHF1ZXN0aW9uLmVzY2FwZShcIm5hbWVcIikucmVwbGFjZSAvW15BLVphLXowLTlfXS9nLCBcIi1cIlxuICAgICAgICBhbnN3ZXIgPSBwcmV2aW91c1tuYW1lXSBpZiBwcmV2aW91c1xuICAgICAgICBcbiAgICAgICAgb25lVmlldyA9IG5ldyBRdWVzdGlvblJ1blZpZXcgXG4gICAgICAgICAgbW9kZWwgICAgICAgICA6IHF1ZXN0aW9uXG4gICAgICAgICAgcGFyZW50ICAgICAgICA6IEBcbiAgICAgICAgICBkYXRhRW50cnkgICAgIDogQGRhdGFFbnRyeVxuICAgICAgICAgIG5vdEFza2VkICAgICAgOiBpc05vdEFza2VkXG4gICAgICAgICAgaXNPYnNlcnZhdGlvbiA6IEBpc09ic2VydmF0aW9uXG4gICAgICAgICAgYW5zd2VyICAgICAgICA6IGFuc3dlclxuXG4gICAgICAgIG9uZVZpZXcub24gXCJyZW5kZXJlZFwiLCBAb25RdWVzdGlvblJlbmRlcmVkXG4gICAgICAgIG9uZVZpZXcub24gXCJhbnN3ZXIgc2Nyb2xsXCIsIEBvblF1ZXN0aW9uQW5zd2VyXG5cbiAgICAgICAgQHF1ZXN0aW9uVmlld3NbaV0gPSBvbmVWaWV3XG4gICAgICAgIEAkZWwuYXBwZW5kIG9uZVZpZXcuZWxcblxuICAgICAgZm9yIHF1ZXN0aW9uVmlldyBpbiBAcXVlc3Rpb25WaWV3c1xuICAgICAgICBxdWVzdGlvblZpZXcucmVuZGVyKClcblxuXG4gICAgICBpZiBAZm9jdXNNb2RlXG4gICAgICAgIEB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHkoKVxuICAgICAgICBAJGVsLmFwcGVuZCBcIlxuICAgICAgICAgIDxkaXYgaWQ9J3N1bW1hcnlfY29udGFpbmVyJz48L2Rpdj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIHByZXZfcXVlc3Rpb24nPiN7QHRleHQucHJldmlvdXNRdWVzdGlvbn08L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIG5leHRfcXVlc3Rpb24nPiN7QHRleHQubmV4dFF1ZXN0aW9ufTwvYnV0dG9uPlxuICAgICAgICBcIlxuICAgICAgICBAdXBkYXRlUHJvZ3Jlc3NCdXR0b25zKClcblxuICAgIGlmIEBxdWVzdGlvbnMubGVuZ3RoID09IG5vdEFza2VkQ291bnRcbiAgICAgIEBwYXJlbnQubmV4dD8oKVxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgb25RdWVzdGlvblJlbmRlcmVkOiA9PlxuICAgIEByZW5kZXJDb3VudCsrXG4gICAgaWYgQHJlbmRlckNvdW50ID09IEBxdWVzdGlvbnMubGVuZ3RoXG4gICAgICBAdHJpZ2dlciBcInJlYWR5XCJcbiAgICAgIEB1cGRhdGVTa2lwTG9naWMoKVxuICAgIEB0cmlnZ2VyIFwic3ViUmVuZGVyZWRcIlxuXG4gIG9uQ2xvc2U6LT5cbiAgICBmb3IgcXYgaW4gQHF1ZXN0aW9uVmlld3NcbiAgICAgIHF2LmNsb3NlPygpXG4gICAgQHF1ZXN0aW9uVmlld3MgPSBbXVxuIl19
