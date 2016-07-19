var QuestionRunView, SurveyReviewView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

QuestionRunView = (function(superClass) {
  extend(QuestionRunView, superClass);

  function QuestionRunView() {
    this.getName = bind(this.getName, this);
    this.setName = bind(this.setName, this);
    this.setHint = bind(this.setHint, this);
    this.setPrompt = bind(this.setPrompt, this);
    this.setMessage = bind(this.setMessage, this);
    this.setAnswer = bind(this.setAnswer, this);
    this.setOptions = bind(this.setOptions, this);
    this.updateResult = bind(this.updateResult, this);
    this.update = bind(this.update, this);
    this.onShow = bind(this.onShow, this);
    this.previousAnswer = bind(this.previousAnswer, this);
    return QuestionRunView.__super__.constructor.apply(this, arguments);
  }

  QuestionRunView.prototype.className = "question";

  QuestionRunView.prototype.events = {
    'change input': 'update',
    'change textarea': 'update',
    'click .autoscroll_icon': 'scroll'
  };

  QuestionRunView.prototype.scroll = function(event) {
    return this.trigger("scroll", event, this.model.get("order"));
  };

  QuestionRunView.prototype.initialize = function(options) {
    this.on("show", (function(_this) {
      return function() {
        return _this.onShow();
      };
    })(this));
    this.model = options.model;
    this.parent = options.parent;
    this.dataEntry = options.dataEntry;
    this.fontFamily = this.parent.model.get('fontFamily');
    if (this.parent.model.get("fontFamily") !== "") {
      this.fontStyle = "style=\"font-family: " + (this.parent.model.get('fontFamily')) + " !important;\"";
    }
    if (!this.dataEntry) {
      this.answer = options.answer;
    } else {
      this.answer = {};
    }
    this.name = this.model.escape("name").replace(/[^A-Za-z0-9_]/g, "-");
    this.type = this.model.get("type");
    this.options = this.model.get("options");
    this.notAsked = options.notAsked;
    this.isObservation = options.isObservation;
    this.defineSpecialCaseResults();
    if (this.model.getBoolean("skippable")) {
      this.isValid = true;
      this.skipped = true;
    } else {
      this.isValid = false;
      this.skipped = false;
    }
    if (this.notAsked === true) {
      this.isValid = true;
      this.updateResult();
    }
    if (this.type === "single" || this.type === "multiple") {
      this.button = new ButtonView({
        options: this.options,
        mode: this.type,
        dataEntry: this.dataEntry,
        answer: this.answer,
        fontFamily: this.fontFamily
      });
      return this.button.on("change rendered", (function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    }
  };

  QuestionRunView.prototype.previousAnswer = function() {
    if (this.parent.questionIndex >= 0) {
      return this.parent.questionViews[this.parent.questionIndex - 1].answer;
    }
  };

  QuestionRunView.prototype.onShow = function() {
    var error, error1, message, name, showCode;
    showCode = this.model.getString("displayCode");
    if (_.isEmptyString(showCode)) {
      return;
    }
    try {
      return CoffeeScript["eval"].apply(this, [showCode]);
    } catch (error1) {
      error = error1;
      name = (/function (.{1,})\(/.exec(error.constructor.toString())[1]);
      message = error.message;
      return alert("Display code error\n\n" + name + "\n\n" + message);
    }
  };

  QuestionRunView.prototype.update = function(event) {
    this.updateResult();
    this.updateValidity();
    return this.trigger("answer", event, this.model.get("order"));
  };

  QuestionRunView.prototype.updateResult = function() {
    var i, j, len, option, ref, results;
    if (this.notAsked === true) {
      if (this.type === "multiple") {
        ref = this.options;
        results = [];
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          option = ref[i];
          results.push(this.answer[this.options[i].value] = "not_asked");
        }
        return results;
      } else {
        return this.answer = "not_asked";
      }
    } else {
      if (this.type === "open") {
        return this.answer = this.$el.find("#" + this.cid + "_" + this.name).val();
      } else {
        return this.answer = this.button.answer;
      }
    }
  };

  QuestionRunView.prototype.updateValidity = function() {
    var customValidationCode, e, error1, isAutostopped, isLogicSkipped, isSkippable;
    isSkippable = this.model.getBoolean("skippable");
    isAutostopped = this.$el.hasClass("disabled_autostop");
    isLogicSkipped = this.$el.hasClass("disabled_skipped");
    if (isSkippable || (isLogicSkipped || isAutostopped)) {
      this.isValid = true;
      return this.skipped = _.isEmptyString(this.answer) ? true : false;
    } else {
      customValidationCode = this.model.get("customValidationCode");
      if (!this.answer) {
        this.answer = "";
      }
      if (!_.isEmptyString(customValidationCode)) {
        try {
          return this.isValid = CoffeeScript["eval"].apply(this, [customValidationCode]);
        } catch (error1) {
          e = error1;
          return alert("Custom Validation error\n\n" + e);
        }
      } else {
        return this.isValid = (function() {
          switch (this.type) {
            case "open":
              if (_.isEmptyString(this.answer) || (_.isEmpty(this.answer) && _.isObject(this.answer))) {
                return false;
              } else {
                return true;
              }
              break;
            case "multiple":
              if (~_.values(this.answer).indexOf("checked")) {
                return true;
              } else {
                return false;
              }
              break;
            case "single":
              if (_.isEmptyString(this.answer) || (_.isEmpty(this.answer) && _.isObject(this.answer))) {
                return false;
              } else {
                return true;
              }
          }
        }).call(this);
      }
    }
  };

  QuestionRunView.prototype.setOptions = function(options) {
    this.button.options = options;
    return this.button.render();
  };

  QuestionRunView.prototype.setAnswer = function(answer) {
    if (_.isString(answer) && this.type === "multiple") {
      alert("setAnswer Error\nTried to set " + this.type + " type " + this.name + " question to string answer.");
    }
    if (!_.isObject(answer) && this.type === "multiple") {
      alert("setAnswer Error\n" + this.name + " question requires an object");
    }
    if (this.type === "multiple") {
      this.button.answer = $.extend(this.button.answer, answer);
    } else if (this.type === "single") {
      this.button.answer = answer;
    } else {
      this.answer = answer;
    }
    this.updateValidity();
    return this.button.render();
  };

  QuestionRunView.prototype.setMessage = function(message) {
    return this.$el.find(".error_message").html(message);
  };

  QuestionRunView.prototype.setPrompt = function(prompt) {
    return this.$el.find(".prompt").html(prompt);
  };

  QuestionRunView.prototype.setHint = function(hint) {
    return this.$el.find(".hint").html(hint);
  };

  QuestionRunView.prototype.setName = function(newName) {
    if (newName == null) {
      newName = this.model.get('name');
    }
    this.model.set("name", newName);
    return this.name = this.model.escape("name").replace(/[^A-Za-z0-9_]/g, "-");
  };

  QuestionRunView.prototype.getName = function() {
    return this.model.get("name");
  };

  QuestionRunView.prototype.render = function() {
    var answerValue, html;
    this.$el.attr("id", "question-" + this.name);
    if (!this.notAsked) {
      html = "<div class='error_message'></div><div class='prompt' " + (this.fontStyle || "") + ">" + (this.model.get('prompt')) + "</div> <div class='hint' " + (this.fontStyle || "") + ">" + (this.model.get('hint') || "") + "</div>";
      if (this.type === "open") {
        if (_.isString(this.answer) && !_.isEmpty(this.answer)) {
          answerValue = this.answer;
        }
        if (this.model.get("multiline")) {
          html += "<div><textarea id='" + this.cid + "_" + this.name + "' data-cid='" + this.cid + "' value='" + (answerValue || '') + "'></textarea></div>";
        } else {
          html += "<div><input id='" + this.cid + "_" + this.name + "' data-cid='" + this.cid + "' value='" + (answerValue || '') + "'></div>";
        }
      } else {
        html += "<div class='button_container'></div>";
      }
      if (this.isObservation) {
        html += "<img src='images/icon_scroll.png' class='icon autoscroll_icon' data-cid='" + this.cid + "'>";
      }
      this.$el.html(html);
      if (this.type === "single" || this.type === "multiple") {
        this.button.setElement(this.$el.find(".button_container"));
        this.button.on("rendered", (function(_this) {
          return function() {
            return _this.trigger("rendered");
          };
        })(this));
        return this.button.render();
      } else {
        return this.trigger("rendered");
      }
    } else {
      this.$el.hide();
      return this.trigger("rendered");
    }
  };

  QuestionRunView.prototype.defineSpecialCaseResults = function() {
    var element, i, j, k, len, len1, list, option, ref;
    list = ["missing", "notAsked", "skipped", "logicSkipped", "notAskedAutostop"];
    for (j = 0, len = list.length; j < len; j++) {
      element = list[j];
      if (this.type === "single" || this.type === "open") {
        this[element + "Result"] = element;
      }
      if (this.type === "multiple") {
        this[element + "Result"] = {};
        ref = this.options;
        for (i = k = 0, len1 = ref.length; k < len1; i = ++k) {
          option = ref[i];
          this[element + "Result"][this.options[i].value] = element;
        }
      }
    }
  };

  return QuestionRunView;

})(Backbone.View);

SurveyReviewView = (function(superClass) {
  extend(SurveyReviewView, superClass);

  function SurveyReviewView() {
    return SurveyReviewView.__super__.constructor.apply(this, arguments);
  }

  SurveyReviewView.prototype.className = "QuestionReviewView";

  SurveyReviewView.prototype.initialize = function(options) {
    return this.views = options.views;
  };

  SurveyReviewView.prototype.render = function() {
    var answers, view;
    answers = ((function() {
      var j, len, ref, results;
      ref = this.views;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        view = ref[j];
        results.push("<div class='label_value'> <h3></h3> </div>");
      }
      return results;
    }).call(this)).join("");
    return this.$el.html("<h2>Please review your answers and press next when ready.</h2> " + answers);
  };

  return SurveyReviewView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInF1ZXN0aW9uL1F1ZXN0aW9uUnVuVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxpQ0FBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFFSixTQUFBLEdBQVc7OzRCQUVYLE1BQUEsR0FDRTtJQUFBLGNBQUEsRUFBMkIsUUFBM0I7SUFDQSxpQkFBQSxFQUEyQixRQUQzQjtJQUVBLHdCQUFBLEVBQTJCLFFBRjNCOzs7NEJBSUYsTUFBQSxHQUFRLFNBQUMsS0FBRDtXQUNOLElBQUMsQ0FBQSxPQUFELENBQVMsUUFBVCxFQUFtQixLQUFuQixFQUEwQixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxPQUFYLENBQTFCO0VBRE07OzRCQUdSLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFDVixJQUFDLENBQUEsRUFBRCxDQUFJLE1BQUosRUFBWSxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7ZUFBRyxLQUFDLENBQUEsTUFBRCxDQUFBO01BQUg7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVo7SUFDQSxJQUFDLENBQUEsS0FBRCxHQUFhLE9BQU8sQ0FBQztJQUNyQixJQUFDLENBQUEsTUFBRCxHQUFhLE9BQU8sQ0FBQztJQUNyQixJQUFDLENBQUEsU0FBRCxHQUFhLE9BQU8sQ0FBQztJQUNyQixJQUFDLENBQUEsVUFBRCxHQUFjLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQWQsQ0FBa0IsWUFBbEI7SUFDZCxJQUF3RixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFkLENBQWtCLFlBQWxCLENBQUEsS0FBbUMsRUFBM0g7TUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLHVCQUFBLEdBQXVCLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBZCxDQUFrQixZQUFsQixDQUFELENBQXZCLEdBQXdELGlCQUFyRTs7SUFFQSxJQUFBLENBQU8sSUFBQyxDQUFBLFNBQVI7TUFD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QSxLQUFELEdBQVMsT0FBTyxDQUFDO0VBRFA7OzZCQUdaLE1BQUEsR0FBUSxTQUFBO0FBRU4sUUFBQTtJQUFBLE9BQUEsR0FBVTs7QUFBQztBQUFBO1dBQUEscUNBQUE7O3FCQUFBO0FBQUE7O2lCQUFELENBS1csQ0FBQyxJQUxaLENBS2lCLEVBTGpCO1dBT1YsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsaUVBQUEsR0FJTixPQUpKO0VBVE07Ozs7R0FQcUIsUUFBUSxDQUFDIiwiZmlsZSI6InF1ZXN0aW9uL1F1ZXN0aW9uUnVuVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFF1ZXN0aW9uUnVuVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwicXVlc3Rpb25cIlxuXG4gIGV2ZW50czpcbiAgICAnY2hhbmdlIGlucHV0JyAgICAgICAgICAgOiAndXBkYXRlJ1xuICAgICdjaGFuZ2UgdGV4dGFyZWEnICAgICAgICA6ICd1cGRhdGUnXG4gICAgJ2NsaWNrIC5hdXRvc2Nyb2xsX2ljb24nIDogJ3Njcm9sbCdcblxuICBzY3JvbGw6IChldmVudCkgLT5cbiAgICBAdHJpZ2dlciBcInNjcm9sbFwiLCBldmVudCwgQG1vZGVsLmdldChcIm9yZGVyXCIpXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQG9uIFwic2hvd1wiLCA9PiBAb25TaG93KClcbiAgICBAbW9kZWwgICAgID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgICAgPSBvcHRpb25zLnBhcmVudFxuICAgIEBkYXRhRW50cnkgPSBvcHRpb25zLmRhdGFFbnRyeVxuICAgIEBmb250RmFtaWx5ID0gQHBhcmVudC5tb2RlbC5nZXQoJ2ZvbnRGYW1pbHknKVxuICAgIEBmb250U3R5bGUgPSBcInN0eWxlPVxcXCJmb250LWZhbWlseTogI3tAcGFyZW50Lm1vZGVsLmdldCgnZm9udEZhbWlseScpfSAhaW1wb3J0YW50O1xcXCJcIiBpZiBAcGFyZW50Lm1vZGVsLmdldChcImZvbnRGYW1pbHlcIikgIT0gXCJcIiBcblxuICAgIHVubGVzcyBAZGF0YUVudHJ5XG4gICAgICBAYW5zd2VyID0gb3B0aW9ucy5hbnN3ZXJcbiAgICBlbHNlXG4gICAgICBAYW5zd2VyID0ge31cblxuICAgIEBuYW1lICAgICA9IEBtb2RlbC5lc2NhcGUoXCJuYW1lXCIpLnJlcGxhY2UgL1teQS1aYS16MC05X10vZywgXCItXCJcbiAgICBAdHlwZSAgICAgPSBAbW9kZWwuZ2V0IFwidHlwZVwiXG4gICAgQG9wdGlvbnMgID0gQG1vZGVsLmdldCBcIm9wdGlvbnNcIlxuICAgIEBub3RBc2tlZCA9IG9wdGlvbnMubm90QXNrZWRcbiAgICBAaXNPYnNlcnZhdGlvbiA9IG9wdGlvbnMuaXNPYnNlcnZhdGlvblxuXG4gICAgQGRlZmluZVNwZWNpYWxDYXNlUmVzdWx0cygpXG5cbiAgICBpZiBAbW9kZWwuZ2V0Qm9vbGVhbihcInNraXBwYWJsZVwiKVxuICAgICAgQGlzVmFsaWQgPSB0cnVlXG4gICAgICBAc2tpcHBlZCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBAaXNWYWxpZCA9IGZhbHNlXG4gICAgICBAc2tpcHBlZCA9IGZhbHNlXG4gICAgXG4gICAgaWYgQG5vdEFza2VkID09IHRydWVcbiAgICAgIEBpc1ZhbGlkID0gdHJ1ZVxuICAgICAgQHVwZGF0ZVJlc3VsdCgpXG5cbiAgICBpZiBAdHlwZSA9PSBcInNpbmdsZVwiIG9yIEB0eXBlID09IFwibXVsdGlwbGVcIlxuICAgICAgQGJ1dHRvbiA9IG5ldyBCdXR0b25WaWV3XG4gICAgICAgIG9wdGlvbnMgOiBAb3B0aW9uc1xuICAgICAgICBtb2RlICAgIDogQHR5cGVcbiAgICAgICAgZGF0YUVudHJ5ICA6IEBkYXRhRW50cnlcbiAgICAgICAgYW5zd2VyICAgICA6IEBhbnN3ZXJcbiAgICAgICAgZm9udEZhbWlseSA6IEBmb250RmFtaWx5XG5cbiAgICAgIEBidXR0b24ub24gXCJjaGFuZ2UgcmVuZGVyZWRcIiwgPT4gQHVwZGF0ZSgpXG5cbiAgcHJldmlvdXNBbnN3ZXI6ID0+XG4gICAgQHBhcmVudC5xdWVzdGlvblZpZXdzW0BwYXJlbnQucXVlc3Rpb25JbmRleCAtIDFdLmFuc3dlciBpZiBAcGFyZW50LnF1ZXN0aW9uSW5kZXggPj0gMFxuXG4gIG9uU2hvdzogPT5cblxuICAgIHNob3dDb2RlID0gQG1vZGVsLmdldFN0cmluZyhcImRpc3BsYXlDb2RlXCIpXG5cbiAgICByZXR1cm4gaWYgXy5pc0VtcHR5U3RyaW5nKHNob3dDb2RlKVxuXG4gICAgdHJ5XG4gICAgICBDb2ZmZWVTY3JpcHQuZXZhbC5hcHBseShALCBbc2hvd0NvZGVdKVxuICAgIGNhdGNoIGVycm9yXG4gICAgICBuYW1lID0gKCgvZnVuY3Rpb24gKC57MSx9KVxcKC8pLmV4ZWMoZXJyb3IuY29uc3RydWN0b3IudG9TdHJpbmcoKSlbMV0pXG4gICAgICBtZXNzYWdlID0gZXJyb3IubWVzc2FnZVxuICAgICAgYWxlcnQgXCJEaXNwbGF5IGNvZGUgZXJyb3JcXG5cXG4je25hbWV9XFxuXFxuI3ttZXNzYWdlfVwiXG5cbiAgdXBkYXRlOiAoZXZlbnQpID0+XG4gICAgQHVwZGF0ZVJlc3VsdCgpXG4gICAgQHVwZGF0ZVZhbGlkaXR5KClcbiAgICBAdHJpZ2dlciBcImFuc3dlclwiLCBldmVudCwgQG1vZGVsLmdldChcIm9yZGVyXCIpXG5cbiAgdXBkYXRlUmVzdWx0OiA9PlxuICAgIGlmIEBub3RBc2tlZCA9PSB0cnVlXG4gICAgICBpZiBAdHlwZSA9PSBcIm11bHRpcGxlXCJcbiAgICAgICAgZm9yIG9wdGlvbiwgaSBpbiBAb3B0aW9uc1xuICAgICAgICAgIEBhbnN3ZXJbQG9wdGlvbnNbaV0udmFsdWVdID0gXCJub3RfYXNrZWRcIlxuICAgICAgZWxzZVxuICAgICAgICBAYW5zd2VyID0gXCJub3RfYXNrZWRcIlxuICAgIGVsc2VcbiAgICAgIGlmIEB0eXBlID09IFwib3BlblwiXG4gICAgICAgIEBhbnN3ZXIgPSBAJGVsLmZpbmQoXCIjI3tAY2lkfV8je0BuYW1lfVwiKS52YWwoKVxuICAgICAgZWxzZVxuICAgICAgICBAYW5zd2VyID0gQGJ1dHRvbi5hbnN3ZXJcblxuICB1cGRhdGVWYWxpZGl0eTogLT5cblxuICAgIGlzU2tpcHBhYmxlICAgID0gQG1vZGVsLmdldEJvb2xlYW4oXCJza2lwcGFibGVcIilcbiAgICBpc0F1dG9zdG9wcGVkICA9IEAkZWwuaGFzQ2xhc3MoXCJkaXNhYmxlZF9hdXRvc3RvcFwiKVxuICAgIGlzTG9naWNTa2lwcGVkID0gQCRlbC5oYXNDbGFzcyhcImRpc2FibGVkX3NraXBwZWRcIilcblxuICAgICMgaGF2ZSB3ZSBvciBjYW4gd2UgYmUgc2tpcHBlZD9cbiAgICBpZiBpc1NraXBwYWJsZSBvciAoIGlzTG9naWNTa2lwcGVkIG9yIGlzQXV0b3N0b3BwZWQgKVxuICAgICAgIyBZRVMsIG9rLCBJIGd1ZXNzIHdlJ3JlIHZhbGlkXG4gICAgICBAaXNWYWxpZCA9IHRydWVcbiAgICAgIEBza2lwcGVkID0gaWYgXy5pc0VtcHR5U3RyaW5nKEBhbnN3ZXIpIHRoZW4gdHJ1ZSBlbHNlIGZhbHNlXG4gICAgZWxzZVxuICAgICAgIyBOTywgc29tZSBraW5kIG9mIHZhbGlkYXRpb24gbXVzdCBvY2N1ciBub3dcbiAgICAgIGN1c3RvbVZhbGlkYXRpb25Db2RlID0gQG1vZGVsLmdldChcImN1c3RvbVZhbGlkYXRpb25Db2RlXCIpXG5cbiAgICAgIEBhbnN3ZXIgPSBcIlwiIHVubGVzcyBAYW5zd2VyXG5cbiAgICAgIGlmIG5vdCBfLmlzRW1wdHlTdHJpbmcoY3VzdG9tVmFsaWRhdGlvbkNvZGUpXG4gICAgICAgIHRyeVxuICAgICAgICAgIEBpc1ZhbGlkID0gQ29mZmVlU2NyaXB0LmV2YWwuYXBwbHkoQCwgW2N1c3RvbVZhbGlkYXRpb25Db2RlXSlcbiAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgIGFsZXJ0IFwiQ3VzdG9tIFZhbGlkYXRpb24gZXJyb3JcXG5cXG4je2V9XCJcbiAgICAgIGVsc2VcbiAgICAgICAgQGlzVmFsaWQgPSBcbiAgICAgICAgICBzd2l0Y2ggQHR5cGVcbiAgICAgICAgICAgIHdoZW4gXCJvcGVuXCJcbiAgICAgICAgICAgICAgaWYgXy5pc0VtcHR5U3RyaW5nKEBhbnN3ZXIpIHx8IChfLmlzRW1wdHkoQGFuc3dlcikgJiYgXy5pc09iamVjdChAYW5zd2VyKSkgdGhlbiBmYWxzZSBlbHNlIHRydWUgIyBkb24ndCB1c2UgaXNFbXB0eSBoZXJlXG4gICAgICAgICAgICB3aGVuIFwibXVsdGlwbGVcIlxuICAgICAgICAgICAgICBpZiB+Xy52YWx1ZXMoQGFuc3dlcikuaW5kZXhPZihcImNoZWNrZWRcIikgdGhlbiB0cnVlICBlbHNlIGZhbHNlXG4gICAgICAgICAgICB3aGVuIFwic2luZ2xlXCJcbiAgICAgICAgICAgICAgaWYgXy5pc0VtcHR5U3RyaW5nKEBhbnN3ZXIpIHx8IChfLmlzRW1wdHkoQGFuc3dlcikgJiYgXy5pc09iamVjdChAYW5zd2VyKSkgdGhlbiBmYWxzZSBlbHNlIHRydWVcblxuXG4gIHNldE9wdGlvbnM6IChvcHRpb25zKSA9PlxuICAgIEBidXR0b24ub3B0aW9ucyA9IG9wdGlvbnNcbiAgICBAYnV0dG9uLnJlbmRlcigpXG5cbiAgc2V0QW5zd2VyOiAoYW5zd2VyKSA9PlxuICAgIGFsZXJ0IFwic2V0QW5zd2VyIEVycm9yXFxuVHJpZWQgdG8gc2V0ICN7QHR5cGV9IHR5cGUgI3tAbmFtZX0gcXVlc3Rpb24gdG8gc3RyaW5nIGFuc3dlci5cIiBpZiBfLmlzU3RyaW5nKGFuc3dlcikgJiYgQHR5cGUgPT0gXCJtdWx0aXBsZVwiXG4gICAgYWxlcnQgXCJzZXRBbnN3ZXIgRXJyb3JcXG4je0BuYW1lfSBxdWVzdGlvbiByZXF1aXJlcyBhbiBvYmplY3RcIiBpZiBub3QgXy5pc09iamVjdChhbnN3ZXIpICYmIEB0eXBlID09IFwibXVsdGlwbGVcIlxuXG4gICAgaWYgQHR5cGUgPT0gXCJtdWx0aXBsZVwiXG4gICAgICBAYnV0dG9uLmFuc3dlciA9ICQuZXh0ZW5kKEBidXR0b24uYW5zd2VyLCBhbnN3ZXIpXG4gICAgZWxzZSBpZiBAdHlwZSA9PSBcInNpbmdsZVwiXG4gICAgICBAYnV0dG9uLmFuc3dlciA9IGFuc3dlclxuICAgIGVsc2VcbiAgICAgIEBhbnN3ZXIgPSBhbnN3ZXJcblxuICAgIEB1cGRhdGVWYWxpZGl0eSgpXG4gICAgQGJ1dHRvbi5yZW5kZXIoKVxuXG4gIHNldE1lc3NhZ2U6IChtZXNzYWdlKSA9PlxuICAgIEAkZWwuZmluZChcIi5lcnJvcl9tZXNzYWdlXCIpLmh0bWwgbWVzc2FnZVxuXG4gIHNldFByb21wdDogKHByb21wdCkgPT5cbiAgICBAJGVsLmZpbmQoXCIucHJvbXB0XCIpLmh0bWwgcHJvbXB0XG5cbiAgc2V0SGludDogKGhpbnQpID0+XG4gICAgQCRlbC5maW5kKFwiLmhpbnRcIikuaHRtbCBoaW50XG5cbiAgc2V0TmFtZTogKCBuZXdOYW1lID0gQG1vZGVsLmdldCgnbmFtZScpICkgPT5cbiAgICBAbW9kZWwuc2V0KFwibmFtZVwiLCBuZXdOYW1lKVxuICAgIEBuYW1lID0gQG1vZGVsLmVzY2FwZShcIm5hbWVcIikucmVwbGFjZSAvW15BLVphLXowLTlfXS9nLCBcIi1cIlxuXG4gIGdldE5hbWU6ID0+XG4gICAgQG1vZGVsLmdldChcIm5hbWVcIilcblxuICByZW5kZXI6IC0+XG4gICAgQCRlbC5hdHRyIFwiaWRcIiwgXCJxdWVzdGlvbi0je0BuYW1lfVwiXG5cbiAgICBpZiBub3QgQG5vdEFza2VkXG5cbiAgICAgIGh0bWwgPSBcIjxkaXYgY2xhc3M9J2Vycm9yX21lc3NhZ2UnPjwvZGl2PjxkaXYgY2xhc3M9J3Byb21wdCcgI3tAZm9udFN0eWxlIHx8IFwiXCJ9PiN7QG1vZGVsLmdldCAncHJvbXB0J308L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9J2hpbnQnICN7QGZvbnRTdHlsZSB8fCBcIlwifT4jeyhAbW9kZWwuZ2V0KCdoaW50JykgfHwgXCJcIil9PC9kaXY+XCJcblxuICAgICAgaWYgQHR5cGUgPT0gXCJvcGVuXCJcbiAgICAgICAgaWYgXy5pc1N0cmluZyhAYW5zd2VyKSAmJiBub3QgXy5pc0VtcHR5KEBhbnN3ZXIpXG4gICAgICAgICAgYW5zd2VyVmFsdWUgPSBAYW5zd2VyXG4gICAgICAgIGlmIEBtb2RlbC5nZXQoXCJtdWx0aWxpbmVcIilcbiAgICAgICAgICBodG1sICs9IFwiPGRpdj48dGV4dGFyZWEgaWQ9JyN7QGNpZH1fI3tAbmFtZX0nIGRhdGEtY2lkPScje0BjaWR9JyB2YWx1ZT0nI3thbnN3ZXJWYWx1ZSB8fCAnJ30nPjwvdGV4dGFyZWE+PC9kaXY+XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGh0bWwgKz0gXCI8ZGl2PjxpbnB1dCBpZD0nI3tAY2lkfV8je0BuYW1lfScgZGF0YS1jaWQ9JyN7QGNpZH0nIHZhbHVlPScje2Fuc3dlclZhbHVlIHx8ICcnfSc+PC9kaXY+XCJcblxuICAgICAgZWxzZVxuICAgICAgICBodG1sICs9IFwiPGRpdiBjbGFzcz0nYnV0dG9uX2NvbnRhaW5lcic+PC9kaXY+XCJcblxuICAgICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvaWNvbl9zY3JvbGwucG5nJyBjbGFzcz0naWNvbiBhdXRvc2Nyb2xsX2ljb24nIGRhdGEtY2lkPScje0BjaWR9Jz5cIiBpZiBAaXNPYnNlcnZhdGlvblxuICAgICAgQCRlbC5odG1sIGh0bWxcblxuICAgICAgaWYgQHR5cGUgPT0gXCJzaW5nbGVcIiBvciBAdHlwZSA9PSBcIm11bHRpcGxlXCJcbiAgICAgICAgQGJ1dHRvbi5zZXRFbGVtZW50KEAkZWwuZmluZChcIi5idXR0b25fY29udGFpbmVyXCIpKVxuICAgICAgICBAYnV0dG9uLm9uIFwicmVuZGVyZWRcIiwgPT4gQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4gICAgICAgIEBidXR0b24ucmVuZGVyKClcbiAgICAgIGVsc2VcbiAgICAgICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgICBlbHNlXG4gICAgICBAJGVsLmhpZGUoKVxuICAgICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4gIFxuICBkZWZpbmVTcGVjaWFsQ2FzZVJlc3VsdHM6IC0+XG4gICAgbGlzdCA9IFtcIm1pc3NpbmdcIiwgXCJub3RBc2tlZFwiLCBcInNraXBwZWRcIiwgXCJsb2dpY1NraXBwZWRcIiwgXCJub3RBc2tlZEF1dG9zdG9wXCJdXG4gICAgZm9yIGVsZW1lbnQgaW4gbGlzdFxuICAgICAgaWYgQHR5cGUgPT0gXCJzaW5nbGVcIiB8fCBAdHlwZSA9PSBcIm9wZW5cIlxuICAgICAgICBAW2VsZW1lbnQrXCJSZXN1bHRcIl0gPSBlbGVtZW50XG4gICAgICBpZiBAdHlwZSA9PSBcIm11bHRpcGxlXCJcbiAgICAgICAgQFtlbGVtZW50K1wiUmVzdWx0XCJdID0ge31cbiAgICAgICAgQFtlbGVtZW50K1wiUmVzdWx0XCJdW0BvcHRpb25zW2ldLnZhbHVlXSA9IGVsZW1lbnQgZm9yIG9wdGlvbiwgaSBpbiBAb3B0aW9uc1xuICAgIHJldHVyblxuXG5cbmNsYXNzIFN1cnZleVJldmlld1ZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lOiBcIlF1ZXN0aW9uUmV2aWV3Vmlld1wiXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQHZpZXdzID0gb3B0aW9ucy52aWV3c1xuXG4gIHJlbmRlcjogLT5cblxuICAgIGFuc3dlcnMgPSAoXCJcbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGgzPjwvaDM+XG4gICAgICA8L2Rpdj5cblxuICAgIFwiIGZvciB2aWV3IGluIEB2aWV3cykuam9pbihcIlwiKVxuXG4gICAgQCRlbC5odG1sIFwiXG5cbiAgICAgIDxoMj5QbGVhc2UgcmV2aWV3IHlvdXIgYW5zd2VycyBhbmQgcHJlc3MgbmV4dCB3aGVuIHJlYWR5LjwvaDI+XG5cbiAgICAgICN7YW5zd2Vyc31cbiAgICBcIlxuIl19
