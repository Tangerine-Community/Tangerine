var SurveyPrintView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SurveyPrintView = (function(superClass) {
  extend(SurveyPrintView, superClass);

  function SurveyPrintView() {
    this.onQuestionRendered = bind(this.onQuestionRendered, this);
    return SurveyPrintView.__super__.constructor.apply(this, arguments);
  }

  SurveyPrintView.prototype.className = "SurveyPrintView";

  SurveyPrintView.prototype.initialize = function(options) {
    this.model = options.model;
    this.parent = options.parent;
    this.isObservation = options.isObservation;
    this.questionViews = [];
    this.answered = [];
    this.questions = new Questions;
    this.questions.db.view = "questionsBySubtestId";
    return this.questions.fetch({
      key: "q" + this.model.id,
      success: (function(_this) {
        return function(collection) {
          _this.questions = collection;
          _this.questions.sort();
          _this.ready = true;
          return _this.render();
        };
      })(this)
    });
  };

  SurveyPrintView.prototype.render = function() {
    var base, i, j, len, notAskedCount, oneView, question, ref;
    if (this.format === "metadata") {
      this.$el.html("<table class='print-metadata'> <thead> " + (["name", "prompt", "type", "hint", "linkedGridScore"].map((function(_this) {
        return function(attribute) {
          return "<th>" + (attribute.underscore().humanize()) + "</th>";
        };
      })(this)).join("")) + " <th>Options</th> </thead> <tbody class='survey-questions'> </tbody> </table>");
    } else {
      this.$el.html("<div id='" + (this.model.get("_id")) + "' class='print-page " + this.format + "'> <div class='survey-questions'></div> </div> <style> .survey-questions .stimuli-question{ padding-bottom: 3%; } </style>");
    }
    notAskedCount = 0;
    this.questions.sort();
    if (this.questions.models != null) {
      ref = this.questions.models;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        question = ref[i];
        oneView = new QuestionPrintView({
          model: question,
          parent: this,
          isObservation: this.isObservation
        });
        oneView.on("rendered", this.onQuestionRendered);
        oneView.render();
        this.questionViews[i] = oneView;
        if (this.format === "metadata") {
          this.$el.find('.survey-questions').append($(oneView.el).html());
        } else {
          this.$el.find('.survey-questions').append(oneView.el);
        }
      }
    }
    if (this.questions.length === notAskedCount) {
      if (typeof (base = this.parent).next === "function") {
        base.next();
      }
    }
    if (this.format === "stimuli") {
      _.delay((function(_this) {
        return function() {
          return _this.increaseFontUntilOverflow($("#" + (_this.model.get("_id")))[0], $("#" + (_this.model.get("_id")) + " .survey-questions"));
        };
      })(this), 1000);
    }
    return this.trigger("rendered");
  };

  SurveyPrintView.prototype.increaseFontUntilOverflow = function(outerDiv, innerDiv) {
    var currentPercentage, incrementAmount, overflow;
    overflow = 100;
    incrementAmount = 3;
    currentPercentage = 100;
    while (outerDiv.scrollWidth - 1 <= $(outerDiv).innerWidth() && outerDiv.scrollHeight - 1 <= $(outerDiv).innerHeight()) {
      if ((overflow -= 1) === 0) {
        break;
      }
      currentPercentage += incrementAmount;
      innerDiv.css("font-size", currentPercentage + "%");
    }
    return innerDiv.css("font-size", currentPercentage - (2 * incrementAmount) + "%");
  };

  SurveyPrintView.prototype.onQuestionRendered = function() {
    return this.trigger("subRendered");
  };

  return SurveyPrintView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9TdXJ2ZXlQcmludFZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsZUFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7OzRCQUVKLFNBQUEsR0FBVzs7NEJBRVgsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxLQUFELEdBQWlCLE9BQU8sQ0FBQztJQUN6QixJQUFDLENBQUEsTUFBRCxHQUFpQixPQUFPLENBQUM7SUFDekIsSUFBQyxDQUFBLGFBQUQsR0FBaUIsT0FBTyxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxhQUFELEdBQWlCO0lBQ2pCLElBQUMsQ0FBQSxRQUFELEdBQWlCO0lBQ2pCLElBQUMsQ0FBQSxTQUFELEdBQWlCLElBQUk7SUFDckIsSUFBQyxDQUFBLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBZCxHQUFxQjtXQUNyQixJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FDRTtNQUFBLEdBQUEsRUFBSyxHQUFBLEdBQU0sSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFsQjtNQUNBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsVUFBRDtVQUNQLEtBQUMsQ0FBQSxTQUFELEdBQWE7VUFDYixLQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBQTtVQUNBLEtBQUMsQ0FBQSxLQUFELEdBQVM7aUJBQ1QsS0FBQyxDQUFBLE1BQUQsQ0FBQTtRQUpPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURUO0tBREY7RUFSVTs7NEJBZ0JaLE1BQUEsR0FBUSxTQUFBO0FBQ04sUUFBQTtJQUFBLElBQUcsSUFBQyxDQUFBLE1BQUQsS0FBVyxVQUFkO01BQ0UsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUseUNBQUEsR0FHSCxDQUNDLENBQUMsTUFBRCxFQUFTLFFBQVQsRUFBbUIsTUFBbkIsRUFBMkIsTUFBM0IsRUFBbUMsaUJBQW5DLENBQXFELENBQUMsR0FBdEQsQ0FBMkQs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SUEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxXQUFiLEVBQTBCLGlCQUFBLEdBQW9CLENBQUMsQ0FBQSxHQUFFLGVBQUgsQ0FBcEIsR0FBMEMsR0FBcEU7RUFSeUI7OzRCQVUzQixrQkFBQSxHQUFvQixTQUFBO1dBQ2xCLElBQUMsQ0FBQSxPQUFELENBQVMsYUFBVDtFQURrQjs7OztHQXRGUSxRQUFRLENBQUMiLCJmaWxlIjoic3VidGVzdC9wcm90b3R5cGVzL1N1cnZleVByaW50Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFN1cnZleVByaW50VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiU3VydmV5UHJpbnRWaWV3XCJcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBAbW9kZWwgICAgICAgICA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ICAgICAgICA9IG9wdGlvbnMucGFyZW50XG4gICAgQGlzT2JzZXJ2YXRpb24gPSBvcHRpb25zLmlzT2JzZXJ2YXRpb25cbiAgICBAcXVlc3Rpb25WaWV3cyA9IFtdXG4gICAgQGFuc3dlcmVkICAgICAgPSBbXVxuICAgIEBxdWVzdGlvbnMgICAgID0gbmV3IFF1ZXN0aW9uc1xuICAgIEBxdWVzdGlvbnMuZGIudmlldyA9IFwicXVlc3Rpb25zQnlTdWJ0ZXN0SWRcIlxuICAgIEBxdWVzdGlvbnMuZmV0Y2hcbiAgICAgIGtleTogXCJxXCIgKyBAbW9kZWwuaWRcbiAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSA9PlxuICAgICAgICBAcXVlc3Rpb25zID0gY29sbGVjdGlvblxuICAgICAgICBAcXVlc3Rpb25zLnNvcnQoKVxuICAgICAgICBAcmVhZHkgPSB0cnVlXG4gICAgICAgIEByZW5kZXIoKVxuXG4gIHJlbmRlcjogLT5cbiAgICBpZiBAZm9ybWF0IGlzIFwibWV0YWRhdGFcIlxuICAgICAgQCRlbC5odG1sIFwiXG4gICAgICAgIDx0YWJsZSBjbGFzcz0ncHJpbnQtbWV0YWRhdGEnPlxuICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICN7XG4gICAgICAgICAgICAgIFtcIm5hbWVcIiwgXCJwcm9tcHRcIiwgXCJ0eXBlXCIsIFwiaGludFwiLCBcImxpbmtlZEdyaWRTY29yZVwiXS5tYXAoIChhdHRyaWJ1dGUpID0+XG4gICAgICAgICAgICAgICAgXCI8dGg+I3thdHRyaWJ1dGUudW5kZXJzY29yZSgpLmh1bWFuaXplKCl9PC90aD5cIlxuICAgICAgICAgICAgICApLmpvaW4oXCJcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDx0aD5PcHRpb25zPC90aD5cbiAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgIDx0Ym9keSBjbGFzcz0nc3VydmV5LXF1ZXN0aW9ucyc+XG4gICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgPC90YWJsZT5cbiAgICAgIFwiXG5cbiAgICBlbHNlXG4gICAgICBAJGVsLmh0bWwgXCJcbiAgICAgICAgPGRpdiBpZD0nI3tAbW9kZWwuZ2V0IFwiX2lkXCJ9JyBjbGFzcz0ncHJpbnQtcGFnZSAje0Bmb3JtYXR9Jz5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdzdXJ2ZXktcXVlc3Rpb25zJz48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxzdHlsZT5cbiAgICAgICAgICAuc3VydmV5LXF1ZXN0aW9ucyAuc3RpbXVsaS1xdWVzdGlvbntcbiAgICAgICAgICAgIHBhZGRpbmctYm90dG9tOiAzJTtcbiAgICAgICAgICB9XG4gICAgICAgIDwvc3R5bGU+XG4gICAgICBcIlxuXG4gICAgbm90QXNrZWRDb3VudCA9IDBcbiAgICBAcXVlc3Rpb25zLnNvcnQoKVxuICAgIGlmIEBxdWVzdGlvbnMubW9kZWxzP1xuICAgICAgZm9yIHF1ZXN0aW9uLCBpIGluIEBxdWVzdGlvbnMubW9kZWxzXG5cbiAgICAgICAgb25lVmlldyA9IG5ldyBRdWVzdGlvblByaW50Vmlld1xuICAgICAgICAgIG1vZGVsICAgICAgICAgOiBxdWVzdGlvblxuICAgICAgICAgIHBhcmVudCAgICAgICAgOiBAXG4gICAgICAgICAgaXNPYnNlcnZhdGlvbiA6IEBpc09ic2VydmF0aW9uXG4gICAgICAgIG9uZVZpZXcub24gXCJyZW5kZXJlZFwiLCBAb25RdWVzdGlvblJlbmRlcmVkXG5cbiAgICAgICAgb25lVmlldy5yZW5kZXIoKVxuICAgICAgICBAcXVlc3Rpb25WaWV3c1tpXSA9IG9uZVZpZXdcbiAgICAgICAgaWYgQGZvcm1hdCBpcyBcIm1ldGFkYXRhXCJcbiAgICAgICAgICBAJGVsLmZpbmQoJy5zdXJ2ZXktcXVlc3Rpb25zJykuYXBwZW5kICQob25lVmlldy5lbCkuaHRtbCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAJGVsLmZpbmQoJy5zdXJ2ZXktcXVlc3Rpb25zJykuYXBwZW5kIG9uZVZpZXcuZWxcblxuICAgIGlmIEBxdWVzdGlvbnMubGVuZ3RoID09IG5vdEFza2VkQ291bnQgdGhlbiBAcGFyZW50Lm5leHQ/KClcbiAgICBcbiAgICBpZiBAZm9ybWF0IGlzIFwic3RpbXVsaVwiXG4gICAgICBfLmRlbGF5ID0+XG4gICAgICAgIEBpbmNyZWFzZUZvbnRVbnRpbE92ZXJmbG93ICQoXCIjI3tAbW9kZWwuZ2V0IFwiX2lkXCJ9XCIpWzBdLCAkKFwiIyN7QG1vZGVsLmdldCBcIl9pZFwifSAuc3VydmV5LXF1ZXN0aW9uc1wiKVxuICAgICAgLDEwMDBcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4gIGluY3JlYXNlRm9udFVudGlsT3ZlcmZsb3c6IChvdXRlckRpdixpbm5lckRpdikgLT5cbiAgICBvdmVyZmxvdyA9IDEwMFxuICAgIGluY3JlbWVudEFtb3VudCA9IDNcbiAgICBjdXJyZW50UGVyY2VudGFnZSA9IDEwMFxuICAgIHdoaWxlIG91dGVyRGl2LnNjcm9sbFdpZHRoLTEgPD0gJChvdXRlckRpdikuaW5uZXJXaWR0aCgpIGFuZCBvdXRlckRpdi5zY3JvbGxIZWlnaHQtMSA8PSAkKG91dGVyRGl2KS5pbm5lckhlaWdodCgpXG4gICAgICBicmVhayBpZiAob3ZlcmZsb3ctPTEpIGlzIDBcbiAgICAgIGN1cnJlbnRQZXJjZW50YWdlICs9IGluY3JlbWVudEFtb3VudFxuICAgICAgaW5uZXJEaXYuY3NzKFwiZm9udC1zaXplXCIsIGN1cnJlbnRQZXJjZW50YWdlICsgXCIlXCIpXG4gICAgaW5uZXJEaXYuY3NzKFwiZm9udC1zaXplXCIsIGN1cnJlbnRQZXJjZW50YWdlIC0gKDIqaW5jcmVtZW50QW1vdW50KSArIFwiJVwiKVxuXG4gIG9uUXVlc3Rpb25SZW5kZXJlZDogPT5cbiAgICBAdHJpZ2dlciBcInN1YlJlbmRlcmVkXCJcbiJdfQ==
