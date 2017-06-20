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
      key: this.model.get("assessmentId"),
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
    var error, j, len, message, name, question, questionView, ref, result, results, skipLogicCode;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VidGVzdC9wcm90b3R5cGVzL1N1cnZleVJ1blZpZXcuanMiLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9TdXJ2ZXlSdW5WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGFBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs7Ozs7MEJBRUosU0FBQSxHQUFXOzswQkFFWCxNQUFBLEdBQ0U7SUFBQSxzQkFBQSxFQUF5QixjQUF6QjtJQUNBLHNCQUFBLEVBQXlCLGNBRHpCOzs7MEJBR0YsWUFBQSxHQUFjLFNBQUE7QUFFWixRQUFBO0lBQUEsbUJBQUEsR0FBc0IsSUFBQyxDQUFBLGFBQWMsQ0FBQSxJQUFDLENBQUEsYUFBRDtJQUdyQyxJQUFBLENBQStDLElBQUMsQ0FBQSxPQUFELENBQVMsbUJBQVQsQ0FBL0M7QUFBQSxhQUFPLElBQUMsQ0FBQSxVQUFELENBQVksbUJBQVosRUFBUDs7SUFHQSxXQUFBLEdBQWM7QUFDZDtBQUFBLFNBQUEsNkNBQUE7O01BQ0UsYUFBQSxHQUFpQixRQUFRLENBQUMsR0FBRyxDQUFDLFFBQWIsQ0FBc0IsbUJBQXRCO01BQ2pCLGNBQUEsR0FBaUIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFiLENBQXNCLGtCQUF0QjtNQUNqQixJQUFzQixDQUFJLENBQUMsYUFBQSxJQUFpQixjQUFsQixDQUExQjtRQUFBLFdBQVcsQ0FBQyxJQUFaLENBQWlCLENBQWpCLEVBQUE7O0FBSEY7SUFJQSxXQUFBLEdBQWUsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxXQUFULEVBQXNCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxDQUFEO2VBQU8sQ0FBQSxHQUFJLEtBQUMsQ0FBQTtNQUFaO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QjtJQUdmLElBQUcsV0FBVyxDQUFDLE1BQVosS0FBc0IsQ0FBekI7TUFDRSxZQUFBLEdBQWUsSUFBQyxDQUFBLGNBRGxCO0tBQUEsTUFBQTtNQUdFLFlBQUEsR0FBZSxJQUFJLENB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LENBQUEsU0FBUyxDQUFDLE1BQTlCO01BQ0UsSUFBQyxDQUFBLE9BQUQsQ0FBUyxPQUFUO01BQ0EsSUFBQyxDQUFBLGVBQUQsQ0FBQSxFQUZGOztXQUdBLElBQUMsQ0FBQSxPQUFELENBQVMsYUFBVDtFQUxrQjs7MEJBT3BCLE9BQUEsR0FBUSxTQUFBO0FBQ04sUUFBQTtBQUFBO0FBQUEsU0FBQSxxQ0FBQTs7O1FBQ0UsRUFBRSxDQUFDOztBQURMO1dBRUEsSUFBQyxDQUFBLGFBQUQsR0FBaUI7RUFIWDs7OztHQWhXa0IsUUFBUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgU3VydmV5UnVuVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiU3VydmV5UnVuVmlld1wiXG5cbiAgZXZlbnRzOlxuICAgICdjbGljayAubmV4dF9xdWVzdGlvbicgOiAnbmV4dFF1ZXN0aW9uJ1xuICAgICdjbGljayAucHJldl9xdWVzdGlvbicgOiAncHJldlF1ZXN0aW9uJ1xuXG4gIG5leHRRdWVzdGlvbjogLT5cblxuICAgIGN1cnJlbnRRdWVzdGlvblZpZXcgPSBAcXVlc3Rpb25WaWV3c1tAcXVlc3Rpb25JbmRleF1cblxuICAgICMgc2hvdyBlcnJvcnMgYmVmb3JlIGRvaW5nIGFueXRoaW5nIGlmIHRoZXJlIGFyZSBhbnlcbiAgICByZXR1cm4gQHNob3dFcnJvcnMoY3VycmVudFF1ZXN0aW9uVmlldykgdW5sZXNzIEBpc1ZhbGlkKGN1cnJlbnRRdWVzdGlvblZpZXcpXG5cbiAgICAjIGZpbmQgdGhlIG5vbi1za2lwcGVkIHF1ZXN0aW9uc1xuICAgIGlzQXZhaWxhYmxlID0gW11cbiAgICBmb3IgcXVlc3Rpb24sIGkgaW4gQHF1ZXN0aW9uVmlld3NcbiAgICAgIGlzQXV0b3N0b3BwZWQgID0gcXVlc3Rpb24uJGVsLmhhc0NsYXNzKFwiZGlzYWJsZWRfYXV0b3N0b3BcIilcbiAgICAgIGlzTG9naWNTa2lwcGVkID0gcXVlc3Rpb24uJGVsLmhhc0NsYXNzKFwiZGlzYWJsZWRfc2tpcHBlZFwiKVxuICAgICAgaXNBdmFpbGFibGUucHVzaCBpIGlmIG5vdCAoaXNBdXRvc3RvcHBlZCBvciBpc0xvZ2ljU2tpcHBlZClcbiAgICBpc0F2YWlsYWJsZSAgPSBfLmZpbHRlciBpc0F2YWlsYWJsZSwgKGUpID0+IGUgPiBAcXVlc3Rpb25JbmRleFxuXG4gICAgIyBkb24ndCBnbyBhbnl3aGVyZSB1bmxlc3Mgd2UgaGF2ZSBzb21ld2hlcmUgdG8gZ29cbiAgICBpZiBpc0F2YWlsYWJsZS5sZW5ndGggPT0gMFxuICAgICAgcGxhbm5lZEluZGV4ID0gQHF1ZXN0aW9uSW5kZXhcbiAgICBlbHNlXG4gICAgICBwbGFubmVkSW5kZXggPSBNYXRoLm1pbi5hcHBseShwbGFubmVkSW5kZXgsIGlzQXZhaWxhYmxlKVxuXG4gICAgaWYgQHF1ZXN0aW9uSW5kZXggIT0gcGxhbm5lZEluZGV4XG4gICAgICBAcXVlc3Rpb25JbmRleCA9IHBsYW5uZWRJbmRleFxuICAgICAgQHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eSgpXG4gICAgICBAdXBkYXRlUHJvZ3Jlc3NCdXR0b25zKClcblxuICBwcmV2UXVlc3Rpb246IC0+XG5cbiAgICBjdXJyZW50UXVlc3Rpb25WaWV3ID0gQHF1ZXN0aW9uVmlld3NbQHF1ZXN0aW9uSW5kZXhdXG5cbiAgICAjIHNob3cgZXJyb3JzIGJlZm9yZSBkb2luZyBhbnl0aGluZyBpZiB0aGVyZSBhcmUgYW55XG4gICAgcmV0dXJuIEBzaG93RXJyb3JzKGN1cnJlbnRRdWVzdGlvblZpZXcpIHVubGVzcyBAaXNWYWxpZChjdXJyZW50UXVlc3Rpb25WaWV3KVxuXG4gICAgIyBmaW5kIHRoZSBub24tc2tpcHBlZCBxdWVzdGlvbnNcbiAgICBpc0F2YWlsYWJsZSA9IFtdXG4gICAgZm9yIHF1ZXN0aW9uLCBpIGluIEBxdWVzdGlvblZpZXdzXG4gICAgICBpc0F1dG9zdG9wcGVkICA9IHF1ZXN0aW9uLiRlbC5oYXNDbGFzcyhcImRpc2FibGVkX2F1dG9zdG9wXCIpXG4gICAgICBpc0xvZ2ljU2tpcHBlZCA9IHF1ZXN0aW9uLiRlbC5oYXNDbGFzcyhcImRpc2FibGVkX3NraXBwZWRcIilcbiAgICAgIGlzQXZhaWxhYmxlLnB1c2ggaSBpZiBub3QgKGlzQXV0b3N0b3BwZWQgb3IgaXNMb2dpY1NraXBwZWQpXG4gICAgaXNBdmFpbGFibGUgID0gXy5maWx0ZXIgaXNBdmFpbGFibGUsIChlKSA9PiBlIDwgQHF1ZXN0aW9uSW5kZXhcblxuICAgICMgZG9uJ3QgZ28gYW55d2hlcmUgdW5sZXNzIHdlIGhhdmUgc29tZXdoZXJlIHRvIGdvXG4gICAgaWYgaXNBdmFpbGFibGUubGVuZ3RoID09IDBcbiAgICAgIHBsYW5uZWRJbmRleCA9IEBxdWVzdGlvbkluZGV4XG4gICAgZWxzZVxuICAgICAgcGxhbm5lZEluZGV4ID0gTWF0aC5tYXguYXBwbHkocGxhbm5lZEluZGV4LCBpc0F2YWlsYWJsZSlcblxuICAgIGlmIEBxdWVzdGlvbkluZGV4ICE9IHBsYW5uZWRJbmRleFxuICAgICAgQHF1ZXN0aW9uSW5kZXggPSBwbGFubmVkSW5kZXhcbiAgICAgIEB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHkoKVxuICAgICAgQHVwZGF0ZVByb2dyZXNzQnV0dG9ucygpXG5cbiAgdXBkYXRlUHJvZ3Jlc3NCdXR0b25zOiAtPlxuXG4gICAgaXNBdmFpbGFibGUgPSBbXVxuICAgIGZvciBxdWVzdGlvbiwgaSBpbiBAcXVlc3Rpb25WaWV3c1xuICAgICAgaXNBdXRvc3RvcHBlZCAgPSBxdWVzdGlvbi4kZWwuaGFzQ2xhc3MoXCJkaXNhYmxlZF9hdXRvc3RvcFwiKVxuICAgICAgaXNMb2dpY1NraXBwZWQgPSBxdWVzdGlvbi4kZWwuaGFzQ2xhc3MoXCJkaXNhYmxlZF9za2lwcGVkXCIpXG4gICAgICBpc0F2YWlsYWJsZS5wdXNoIGkgaWYgbm90IChpc0F1dG9zdG9wcGVkIG9yIGlzTG9naWNTa2lwcGVkKVxuICAgIGlzQXZhaWxhYmxlLnB1c2ggQHF1ZXN0aW9uSW5kZXhcblxuICAgICRwcmV2ID0gQCRlbC5maW5kKFwiLnByZXZfcXVlc3Rpb25cIilcbiAgICAkbmV4dCA9IEAkZWwuZmluZChcIi5uZXh0X3F1ZXN0aW9uXCIpXG5cbiAgICBtaW5pbXVtID0gTWF0aC5taW4uYXBwbHkoIG1pbmltdW0sIGlzQXZhaWxhYmxlIClcbiAgICBtYXhpbXVtID0gTWF0aC5tYXguYXBwbHkoIG1heGltdW0sIGlzQXZhaWxhYmxlIClcblxuICAgIGlmIEBxdWVzdGlvbkluZGV4ID09IG1pbmltdW1cbiAgICAgICRwcmV2LmhpZGUoKVxuICAgIGVsc2VcbiAgICAgICRwcmV2LnNob3coKVxuXG4gICAgaWYgQHF1ZXN0aW9uSW5kZXggPT0gbWF4aW11bVxuICAgICAgJG5leHQuaGlkZSgpXG4gICAgZWxzZVxuICAgICAgJG5leHQuc2hvdygpXG5cbiAgdXBkYXRlRXhlY3V0ZVJlYWR5OiAocmVhZHkpID0+XG5cbiAgICBAZXhlY3V0ZVJlYWR5ID0gcmVhZHlcblxuICAgIHJldHVybiBpZiBub3QgQHRyaWdnZXJTaG93TGlzdD9cblxuICAgIGlmIEB0cmlnZ2VyU2hvd0xpc3QubGVuZ3RoID4gMFxuICAgICAgZm9yIGluZGV4IGluIEB0cmlnZ2VyU2hvd0xpc3RcbiAgICAgICAgQHF1ZXN0aW9uVmlld3NbaW5kZXhdPy50cmlnZ2VyIFwic2hvd1wiXG4gICAgICBAdHJpZ2dlclNob3dMaXN0ID0gW11cblxuICAgIEB1cGRhdGVTa2lwTG9naWMoKSBpZiBAZXhlY3V0ZVJlYWR5XG5cblxuICB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHk6IC0+XG5cbiAgICByZXR1cm4gdW5sZXNzIEBtb2RlbC5nZXQoXCJmb2N1c01vZGVcIilcblxuICAgIGlmIEBxdWVzdGlvbkluZGV4ID09IEBxdWVzdGlvblZpZXdzLmxlbmd0aFxuICAgICAgQCRlbC5maW5kKFwiI3N1bW1hcnlfY29udGFpbmVyXCIpLmh0bWwgXCJcbiAgICAgICAgbGFzdCBwYWdlIGhlcmVcbiAgICAgIFwiXG4gICAgICBAJGVsLmZpbmQoXCIjbmV4dF9xdWVzdGlvblwiKS5oaWRlKClcbiAgICBlbHNlXG4gICAgICBAJGVsLmZpbmQoXCIjc3VtbWFyeV9jb250YWluZXJcIikuZW1wdHkoKVxuICAgICAgQCRlbC5maW5kKFwiI25leHRfcXVlc3Rpb25cIikuc2hvdygpXG5cbiAgICAkcXVlc3Rpb25zID0gQCRlbC5maW5kKFwiLnF1ZXN0aW9uXCIpXG4gICAgJHF1ZXN0aW9ucy5oaWRlKClcbiAgICAkcXVlc3Rpb25zLmVxKEBxdWVzdGlvbkluZGV4KS5zaG93KClcblxuICAgICMgdHJpZ2dlciB0aGUgcXVlc3Rpb24gdG8gcnVuIGl0J3MgZGlzcGxheSBjb2RlIGlmIHRoZSBzdWJ0ZXN0J3MgZGlzcGxheWNvZGUgaGFzIGFscmVhZHkgcmFuXG4gICAgIyBpZiBub3QsIGFkZCBpdCB0byBhIGxpc3QgdG8gcnVuIGxhdGVyLlxuICAgIGlmIEBleGVjdXRlUmVhZHkgXG4gICAgICBAcXVlc3Rpb25WaWV3c1tAcXVlc3Rpb25JbmRleF0udHJpZ2dlciBcInNob3dcIlxuICAgIGVsc2VcbiAgICAgIEB0cmlnZ2VyU2hvd0xpc3QgPSBbXSBpZiBub3QgQHRyaWdnZXJTaG93TGlzdFxuICAgICAgQHRyaWdnZXJTaG93TGlzdC5wdXNoIEBxdWVzdGlvbkluZGV4XG5cbiAgc2hvd1F1ZXN0aW9uOiAoaW5kZXgpIC0+XG4gICAgQHF1ZXN0aW9uSW5kZXggPSBpbmRleCBpZiBfLmlzTnVtYmVyKGluZGV4KSAmJiBpbmRleCA8IEBxdWVzdGlvblZpZXdzLmxlbmd0aCAmJiBpbmRleCA+IDBcbiAgICBAdXBkYXRlUXVlc3Rpb25WaXNpYmlsaXR5KClcbiAgICBAdXBkYXRlUHJvZ3Jlc3NCdXR0b25zKClcblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID0gXG4gICAgICBwbGVhc2VBbnN3ZXIgOiB0KFwiU3VydmV5UnVuVmlldy5tZXNzYWdlLnBsZWFzZV9hbnN3ZXJcIilcbiAgICAgIGNvcnJlY3RFcnJvcnMgOiB0KFwiU3VydmV5UnVuVmlldy5tZXNzYWdlLmNvcnJlY3RfZXJyb3JzXCIpXG4gICAgICBub3RFbm91Z2ggOiBfKHQoXCJTdXJ2ZXlSdW5WaWV3Lm1lc3NhZ2Uubm90X2Vub3VnaFwiKSkuZXNjYXBlKClcbiAgICAgIFxuICAgICAgcHJldmlvdXNRdWVzdGlvbiA6IHQoXCJTdXJ2ZXlSdW5WaWV3LmJ1dHRvbi5wcmV2aW91c19xdWVzdGlvblwiKVxuICAgICAgbmV4dFF1ZXN0aW9uIDogdChcIlN1cnZleVJ1blZpZXcuYnV0dG9uLm5leHRfcXVlc3Rpb25cIilcblxuXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQG1vZGVsICAgICAgICAgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCAgICAgICAgPSBvcHRpb25zLnBhcmVudFxuICAgIEBkYXRhRW50cnkgICAgID0gb3B0aW9ucy5kYXRhRW50cnlcbiAgICBAaXNPYnNlcnZhdGlvbiA9IG9wdGlvbnMuaXNPYnNlcnZhdGlvblxuICAgIEBmb2N1c01vZGUgICAgID0gQG1vZGVsLmdldEJvb2xlYW4oXCJmb2N1c01vZGVcIilcbiAgICBAcXVlc3Rpb25JbmRleCA9IDAgaWYgQGZvY3VzTW9kZVxuICAgIEBxdWVzdGlvblZpZXdzID0gW11cbiAgICBAYW5zd2VyZWQgICAgICA9IFtdXG4gICAgQHJlbmRlckNvdW50ICAgPSAwXG5cbiAgICBAaTE4bigpXG5cbiAgICBAcXVlc3Rpb25zICAgICA9IG5ldyBRdWVzdGlvbnMoKVxuICAgICMgQHF1ZXN0aW9ucy5kYi52aWV3ID0gXCJxdWVzdGlvbnNCeVN1YnRlc3RJZFwiIEJyaW5nIHRoaXMgYmFjayB3aGVuIHByb3RvdHlwZXMgbWFrZSBzZW5zZSBhZ2FpblxuICAgIEBxdWVzdGlvbnMuZmV0Y2hcbiAgICAgIGtleTogXCJxXCIgKyBAbW9kZWwuZ2V0KFwiYXNzZXNzbWVudElkXCIpXG4gICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgPT5cbiAgICAgICAgQHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnMgY29sbGVjdGlvbi53aGVyZSB7XCJzdWJ0ZXN0SWRcIjpAbW9kZWwuaWR9IFxuICAgICAgICBAcXVlc3Rpb25zLnNvcnQoKVxuICAgICAgICBAcmVhZHkgPSB0cnVlXG4gICAgICAgIEByZW5kZXIoKVxuXG4gICMgd2hlbiBhIHF1ZXN0aW9uIGlzIGFuc3dlcmVkXG4gIG9uUXVlc3Rpb25BbnN3ZXI6IChlbGVtZW50KSA9PlxuXG4gICAgcmV0dXJuIHVubGVzcyBAcmVuZGVyQ291bnQgPT0gQHF1ZXN0aW9ucy5sZW5ndGhcblxuICAgIGlmIEBpc09ic2VydmF0aW9uXG5cbiAgICAgICMgZmluZCB0aGUgdmlldyBvZiB0aGUgcXVlc3Rpb25cbiAgICAgIGNpZCA9ICQoZWxlbWVudCkuYXR0cihcImRhdGEtY2lkXCIpXG4gICAgICBmb3IgdmlldyBpbiBAcXVlc3Rpb25WaWV3c1xuICAgICAgICBpZiB2aWV3LmNpZCA9PSBjaWQgJiYgdmlldy50eXBlICE9IFwibXVsdGlwbGVcIiAjIGlmIGl0J3MgbXVsdGlwbGUgZG9uJ3QgZ28gc2Nyb2xsaW5cblxuICAgICAgICAgICMgZmluZCBsYXN0IG9yIG5leHQgbm90IHNraXBwZWRcbiAgICAgICAgICBuZXh0ID0gJCh2aWV3LmVsKS5uZXh0KClcbiAgICAgICAgICB3aGlsZSBuZXh0Lmxlbmd0aCAhPSAwICYmIG5leHQuaGFzQ2xhc3MoXCJkaXNhYmxlZF9za2lwcGVkXCIpXG4gICAgICAgICAgICBuZXh0ID0gJChuZXh0KS5uZXh0KClcbiAgICAgICAgICBcbiAgICAgICAgICAjIGlmIGl0J3Mgbm90IHRoZSBsYXN0LCBzY3JvbGwgdG8gaXRcbiAgICAgICAgICBpZiBuZXh0Lmxlbmd0aCAhPSAwXG4gICAgICAgICAgICBuZXh0LnNjcm9sbFRvKClcblxuICAgICMgYXV0byBzdG9wIGFmdGVyIGxpbWl0XG4gICAgQGF1dG9zdG9wcGVkICAgID0gZmFsc2VcbiAgICBhdXRvc3RvcExpbWl0ICAgPSBwYXJzZUludChAbW9kZWwuZ2V0KFwiYXV0b3N0b3BMaW1pdFwiKSkgfHwgMFxuICAgIGxvbmdlc3RTZXF1ZW5jZSA9IDBcbiAgICBhdXRvc3RvcENvdW50ICAgPSAwXG5cbiAgICBpZiBhdXRvc3RvcExpbWl0ID4gMFxuICAgICAgZm9yIGkgaW4gWzEuLkBxdWVzdGlvblZpZXdzLmxlbmd0aF0gIyBqdXN0IGluIGNhc2UgdGhleSBjYW4ndCBjb3VudFxuICAgICAgICBjdXJyZW50QW5zd2VyID0gQHF1ZXN0aW9uVmlld3NbaS0xXS5hbnN3ZXJcbiAgICAgICAgaWYgY3VycmVudEFuc3dlciA9PSBcIjBcIiBvciBjdXJyZW50QW5zd2VyID09IFwiOVwiXG4gICAgICAgICAgYXV0b3N0b3BDb3VudCsrXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBhdXRvc3RvcENvdW50ID0gMFxuICAgICAgICBsb25nZXN0U2VxdWVuY2UgPSBNYXRoLm1heChsb25nZXN0U2VxdWVuY2UsIGF1dG9zdG9wQ291bnQpXG4gICAgICAgICMgaWYgdGhlIHZhbHVlIGlzIHNldCwgd2UndmUgZ290IGEgdGhyZXNob2xkIGV4Y2VlZGluZyBydW4sIGFuZCBpdCdzIG5vdCBhbHJlYWR5IGF1dG9zdG9wcGVkXG4gICAgICAgIGlmIGF1dG9zdG9wTGltaXQgIT0gMCAmJiBsb25nZXN0U2VxdWVuY2UgPj0gYXV0b3N0b3BMaW1pdCAmJiBub3QgQGF1dG9zdG9wcGVkXG4gICAgICAgICAgQGF1dG9zdG9wcGVkID0gdHJ1ZVxuICAgICAgICAgIEBhdXRvc3RvcEluZGV4ID0gaVxuICAgIEB1cGRhdGVBdXRvc3RvcCgpXG4gICAgQHVwZGF0ZVNraXBMb2dpYygpXG4gIFxuICB1cGRhdGVBdXRvc3RvcDogLT5cbiAgICBhdXRvc3RvcExpbWl0ID0gcGFyc2VJbnQoQG1vZGVsLmdldChcImF1dG9zdG9wTGltaXRcIikpIHx8IDBcbiAgICBmb3IgdmlldywgaSBpbiBAcXVlc3Rpb25WaWV3c1xuICAgICAgaWYgaSA+IChAYXV0b3N0b3BJbmRleCAtIDEpXG4gICAgICAgIHZpZXcuJGVsLmFkZENsYXNzICAgIFwiZGlzYWJsZWRfYXV0b3N0b3BcIiBpZiAgICAgQGF1dG9zdG9wcGVkXG4gICAgICAgIHZpZXcuJGVsLnJlbW92ZUNsYXNzIFwiZGlzYWJsZWRfYXV0b3N0b3BcIiBpZiBub3QgQGF1dG9zdG9wcGVkXG5cbiAgdXBkYXRlU2tpcExvZ2ljOiA9PlxuICAgIGZvciBxdWVzdGlvblZpZXcgaW4gQHF1ZXN0aW9uVmlld3NcbiAgICAgIHF1ZXN0aW9uID0gcXVlc3Rpb25WaWV3Lm1vZGVsXG4gICAgICBza2lwTG9naWNDb2RlID0gcXVlc3Rpb24uZ2V0IFwic2tpcExvZ2ljXCJcbiAgICAgIGlmIG5vdCBfLmlzRW1wdHlTdHJpbmcoc2tpcExvZ2ljQ29kZSlcbiAgICAgICAgdHJ5XG4gICAgICAgICAgcmVzdWx0ID0gQ29mZmVlU2NyaXB0LmV2YWwuYXBwbHkoQCwgW3NraXBMb2dpY0NvZGVdKVxuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgIG5hbWUgPSAoKC9mdW5jdGlvbiAoLnsxLH0pXFwoLykuZXhlYyhlcnJvci5jb25zdHJ1Y3Rvci50b1N0cmluZygpKVsxXSlcbiAgICAgICAgICBtZXNzYWdlID0gZXJyb3IubWVzc2FnZVxuICAgICAgICAgIGFsZXJ0IFwiU2tpcCBsb2dpYyBlcnJvciBpbiBxdWVzdGlvbiAje3F1ZXN0aW9uLmdldCgnbmFtZScpfVxcblxcbiN7bmFtZX1cXG5cXG4je21lc3NhZ2V9XCJcblxuICAgICAgICBpZiByZXN1bHRcbiAgICAgICAgICBxdWVzdGlvblZpZXcuJGVsLmFkZENsYXNzIFwiZGlzYWJsZWRfc2tpcHBlZFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBxdWVzdGlvblZpZXcuJGVsLnJlbW92ZUNsYXNzIFwiZGlzYWJsZWRfc2tpcHBlZFwiXG4gICAgICBxdWVzdGlvblZpZXcudXBkYXRlVmFsaWRpdHkoKVxuXG4gIGlzVmFsaWQ6ICh2aWV3cyA9IEBxdWVzdGlvblZpZXdzKSAtPlxuICAgIHJldHVybiB0cnVlIGlmIG5vdCB2aWV3cz8gIyBpZiB0aGVyZSdzIG5vdGhpbmcgdG8gY2hlY2ssIGl0IG11c3QgYmUgZ29vZFxuICAgIHZpZXdzID0gW3ZpZXdzXSBpZiBub3QgXy5pc0FycmF5KHZpZXdzKVxuICAgIGZvciBxdiwgaSBpbiB2aWV3c1xuICAgICAgcXYudXBkYXRlVmFsaWRpdHkoKVxuICAgICAgIyBjYW4gd2Ugc2tpcCBpdD9cbiAgICAgIGlmIG5vdCBxdi5tb2RlbC5nZXRCb29sZWFuKFwic2tpcHBhYmxlXCIpXG4gICAgICAgICMgaXMgaXQgdmFsaWRcbiAgICAgICAgaWYgbm90IHF2LmlzVmFsaWRcbiAgICAgICAgICAjIHJlZCBhbGVydCEhXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIHRydWVcblxuICBnZXRTa2lwcGVkOiAtPlxuICAgIHJlc3VsdCA9IHt9XG4gICAgcmVzdWx0W0BxdWVzdGlvbnMubW9kZWxzW2ldLmdldChcIm5hbWVcIildID0gXCJza2lwcGVkXCIgZm9yIHF2LCBpIGluIEBxdWVzdGlvblZpZXdzXG4gICAgcmV0dXJuIHJlc3VsdFxuXG4gIGdldFJlc3VsdDogPT5cbiAgICByZXN1bHQgPSB7fVxuICAgIGZvciBxdiwgaSBpbiBAcXVlc3Rpb25WaWV3c1xuICAgICAgcmVzdWx0W0BxdWVzdGlvbnMubW9kZWxzW2ldLmdldChcIm5hbWVcIildID1cbiAgICAgICAgaWYgcXYubm90QXNrZWQgIyBiZWNhdXNlIG9mIGdyaWQgc2NvcmVcbiAgICAgICAgICBxdi5ub3RBc2tlZFJlc3VsdFxuICAgICAgICBlbHNlIGlmIG5vdCBfLmlzRW1wdHkocXYuYW5zd2VyKSAjIHVzZSBhbnN3ZXJcbiAgICAgICAgICBxdi5hbnN3ZXJcbiAgICAgICAgZWxzZSBpZiBxdi5za2lwcGVkIFxuICAgICAgICAgIHF2LnNraXBwZWRSZXN1bHRcbiAgICAgICAgZWxzZSBpZiBxdi4kZWwuaGFzQ2xhc3MoXCJkaXNhYmxlZF9za2lwcGVkXCIpXG4gICAgICAgICAgcXYubG9naWNTa2lwcGVkUmVzdWx0XG4gICAgICAgIGVsc2UgaWYgcXYuJGVsLmhhc0NsYXNzKFwiZGlzYWJsZWRfYXV0b3N0b3BcIilcbiAgICAgICAgICBxdi5ub3RBc2tlZEF1dG9zdG9wUmVzdWx0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBxdi5hbnN3ZXJcbiAgICByZXR1cm4gcmVzdWx0XG5cbiAgc2hvd0Vycm9yczogKHZpZXdzID0gQHF1ZXN0aW9uVmlld3MpIC0+XG4gICAgQCRlbC5maW5kKCcubWVzc2FnZScpLnJlbW92ZSgpXG4gICAgZmlyc3QgPSB0cnVlXG4gICAgdmlld3MgPSBbdmlld3NdIGlmIG5vdCBfLmlzQXJyYXkodmlld3MpXG4gICAgZm9yIHF2LCBpIGluIHZpZXdzXG4gICAgICBpZiBub3QgXy5pc1N0cmluZyhxdilcbiAgICAgICAgbWVzc2FnZSA9IFwiXCJcbiAgICAgICAgaWYgbm90IHF2LmlzVmFsaWRcblxuICAgICAgICAgICMgaGFuZGxlIGN1c3RvbSB2YWxpZGF0aW9uIGVycm9yIG1lc3NhZ2VzXG4gICAgICAgICAgY3VzdG9tTWVzc2FnZSA9IHF2Lm1vZGVsLmdldChcImN1c3RvbVZhbGlkYXRpb25NZXNzYWdlXCIpXG4gICAgICAgICAgaWYgbm90IF8uaXNFbXB0eShjdXN0b21NZXNzYWdlKVxuICAgICAgICAgICAgbWVzc2FnZSA9IGN1c3RvbU1lc3NhZ2VcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBtZXNzYWdlID0gQHRleHQucGxlYXNlQW5zd2VyXG5cbiAgICAgICAgICBpZiBmaXJzdCA9PSB0cnVlXG4gICAgICAgICAgICBAc2hvd1F1ZXN0aW9uKGkpIGlmIHZpZXdzID09IEBxdWVzdGlvblZpZXdzXG4gICAgICAgICAgICBxdi4kZWwuc2Nyb2xsVG8oKVxuICAgICAgICAgICAgVXRpbHMubWlkQWxlcnQgQHRleHQuY29ycmVjdEVycm9yc1xuICAgICAgICAgICAgZmlyc3QgPSBmYWxzZVxuICAgICAgICBxdi5zZXRNZXNzYWdlIG1lc3NhZ2VcblxuICByZW5kZXI6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAcmVhZHlcbiAgICBAJGVsLmVtcHR5KClcblxuICAgIHVubGVzcyBAZGF0YUVudHJ5XG4gICAgICAjIGNsYXNzIGRvZXNuJ3QgaGF2ZSB0aGlzIGhlaXJhcmNoeVxuICAgICAgaWYgQHBhcmVudD8gYW5kIEBwYXJlbnQucGFyZW50PyBhbmQgQHBhcmVudC5wYXJlbnQucmVzdWx0P1xuICAgICAgICBwcmV2aW91cyA9IEBwYXJlbnQucGFyZW50LnJlc3VsdC5nZXRCeUhhc2goQG1vZGVsLmdldCgnaGFzaCcpKVxuXG4gICAgbm90QXNrZWRDb3VudCA9IDBcbiAgICBAcXVlc3Rpb25zLnNvcnQoKVxuICAgIGlmIEBxdWVzdGlvbnMubW9kZWxzP1xuICAgICAgZm9yIHF1ZXN0aW9uLCBpIGluIEBxdWVzdGlvbnMubW9kZWxzXG4gICAgICAgICMgc2tpcCB0aGUgcmVzdCBpZiBzY29yZSBub3QgaGlnaCBlbm91Z2hcblxuICAgICAgICByZXF1aXJlZCA9IHBhcnNlSW50KHF1ZXN0aW9uLmdldChcImxpbmtlZEdyaWRTY29yZVwiKSkgfHwgMFxuXG4gICAgICAgIGlzTm90QXNrZWQgPSAoICggcmVxdWlyZWQgIT0gMCAmJiBAcGFyZW50LmdldEdyaWRTY29yZSgpIDwgcmVxdWlyZWQgKSB8fCBAcGFyZW50LmdyaWRXYXNBdXRvc3RvcHBlZCgpICkgJiYgQHBhcmVudC5nZXRHcmlkU2NvcmUoKSAhPSBmYWxzZVxuXG4gICAgICAgIGlmIGlzTm90QXNrZWQgdGhlbiBub3RBc2tlZENvdW50KytcblxuICAgICAgICBuYW1lICAgPSBxdWVzdGlvbi5lc2NhcGUoXCJuYW1lXCIpLnJlcGxhY2UgL1teQS1aYS16MC05X10vZywgXCItXCJcbiAgICAgICAgYW5zd2VyID0gcHJldmlvdXNbbmFtZV0gaWYgcHJldmlvdXNcbiAgICAgICAgXG4gICAgICAgIG9uZVZpZXcgPSBuZXcgUXVlc3Rpb25SdW5WaWV3IFxuICAgICAgICAgIG1vZGVsICAgICAgICAgOiBxdWVzdGlvblxuICAgICAgICAgIHBhcmVudCAgICAgICAgOiBAXG4gICAgICAgICAgZGF0YUVudHJ5ICAgICA6IEBkYXRhRW50cnlcbiAgICAgICAgICBub3RBc2tlZCAgICAgIDogaXNOb3RBc2tlZFxuICAgICAgICAgIGlzT2JzZXJ2YXRpb24gOiBAaXNPYnNlcnZhdGlvblxuICAgICAgICAgIGFuc3dlciAgICAgICAgOiBhbnN3ZXJcblxuICAgICAgICBvbmVWaWV3Lm9uIFwicmVuZGVyZWRcIiwgQG9uUXVlc3Rpb25SZW5kZXJlZFxuICAgICAgICBvbmVWaWV3Lm9uIFwiYW5zd2VyIHNjcm9sbFwiLCBAb25RdWVzdGlvbkFuc3dlclxuXG4gICAgICAgIEBxdWVzdGlvblZpZXdzW2ldID0gb25lVmlld1xuICAgICAgICBAJGVsLmFwcGVuZCBvbmVWaWV3LmVsXG5cbiAgICAgIGZvciBxdWVzdGlvblZpZXcgaW4gQHF1ZXN0aW9uVmlld3NcbiAgICAgICAgcXVlc3Rpb25WaWV3LnJlbmRlcigpXG5cblxuICAgICAgaWYgQGZvY3VzTW9kZVxuICAgICAgICBAdXBkYXRlUXVlc3Rpb25WaXNpYmlsaXR5KClcbiAgICAgICAgQCRlbC5hcHBlbmQgXCJcbiAgICAgICAgICA8ZGl2IGlkPSdzdW1tYXJ5X2NvbnRhaW5lcic+PC9kaXY+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiBwcmV2X3F1ZXN0aW9uJz4je0B0ZXh0LnByZXZpb3VzUXVlc3Rpb259PC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbiBuZXh0X3F1ZXN0aW9uJz4je0B0ZXh0Lm5leHRRdWVzdGlvbn08L2J1dHRvbj5cbiAgICAgICAgXCJcbiAgICAgICAgQHVwZGF0ZVByb2dyZXNzQnV0dG9ucygpXG5cbiAgICBpZiBAcXVlc3Rpb25zLmxlbmd0aCA9PSBub3RBc2tlZENvdW50XG4gICAgICBAcGFyZW50Lm5leHQ/KClcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4gIG9uUXVlc3Rpb25SZW5kZXJlZDogPT5cbiAgICBAcmVuZGVyQ291bnQrK1xuICAgIGlmIEByZW5kZXJDb3VudCA9PSBAcXVlc3Rpb25zLmxlbmd0aFxuICAgICAgQHRyaWdnZXIgXCJyZWFkeVwiXG4gICAgICBAdXBkYXRlU2tpcExvZ2ljKClcbiAgICBAdHJpZ2dlciBcInN1YlJlbmRlcmVkXCJcblxuICBvbkNsb3NlOi0+XG4gICAgZm9yIHF2IGluIEBxdWVzdGlvblZpZXdzXG4gICAgICBxdi5jbG9zZT8oKVxuICAgIEBxdWVzdGlvblZpZXdzID0gW11cbiJdfQ==
