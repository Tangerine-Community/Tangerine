var LessonPlanRunView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LessonPlanRunView = (function(superClass) {
  extend(LessonPlanRunView, superClass);

  function LessonPlanRunView() {
    return LessonPlanRunView.__super__.constructor.apply(this, arguments);
  }

  LessonPlanRunView.prototype.className = "id";

  LessonPlanRunView.prototype.i18n = function() {
    return this.text = {
      title: t("LessonPlanRunView.label.title"),
      lesson_text: t("LessonPlanRunView.label.lesson_text")
    };
  };

  LessonPlanRunView.prototype.initialize = function(options) {
    this.i18n();
    this.model = options.model;
    this.parent = options.parent;
    this.dataEntry = options.dataEntry;
    return this.validator = new CheckDigit;
  };

  LessonPlanRunView.prototype.render = function() {
    var participantId, previous;
    if (!this.dataEntry) {
      previous = this.parent.parent.result.getByHash(this.model.get('hash'));
      if (previous) {
        participantId = previous.participant_id;
      }
    }
    this.$el.html("<form> <label for='title'>" + this.text.title + "</label> <input id='title' name='title' value='" + (title || '') + "'> <label for='lesson_text'>" + this.text.lesson_text + "</label> <input id='lesson_text' name='lesson_text' value='" + (lesson_text || '') + "'> <div class='messages'></div> </form>");
    this.trigger("rendered");
    return this.trigger("ready");
  };

  LessonPlanRunView.prototype.getResult = function() {
    return {
      'title': this.$el.find("#title").val(),
      'lesson_text': this.$el.find("#lesson_text").val()
    };
  };

  LessonPlanRunView.prototype.getSkipped = function() {
    return {
      'title': "skipped"
    };
  };

  LessonPlanRunView.prototype.setValidator = function() {};

  LessonPlanRunView.prototype.isValid = function() {};

  LessonPlanRunView.prototype.showErrors = function() {
    return this.$el.find(".messages").html(this.validator.getErrors().join(", "));
  };

  return LessonPlanRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9MZXNzb25QbGFuUnVuVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxpQkFBQTtFQUFBOzs7QUFBTTs7Ozs7Ozs4QkFFSixTQUFBLEdBQVc7OzhCQU1YLElBQUEsR0FBTSxTQUFBO1dBQ0osSUFBQyxDQUFBLElBQUQsR0FDRTtNQUFBLEtBQUEsRUFBUSxDQUFBLENBQUUsK0JBQUYsQ0FBUjtNQUNBLFdBQUEsRUFBZ0IsQ0FBQSxDQUFFLHFDQUFGLENBRGhCOztFQUZFOzs4QkFLTixVQUFBLEdBQVksU0FBQyxPQUFEO0lBRVYsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUVBLElBQUMsQ0FBQSxLQUFELEdBQWEsT0FBTyxDQUFDO0lBQ3JCLElBQUMsQ0FBQSxNQUFELEdBQWEsT0FBTyxDQUFDO0lBQ3JCLElBQUMsQ0FBQSxTQUFELEdBQWEsT0FBTyxDQUFDO1dBRXJCLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBSTtFQVJQOzs4QkFVWixNQUFBLEdBQVEsU0FBQTtBQUVOLFFBQUE7SUFBQSxJQUFBLENBQU8sSUFBQyxDQUFBLFNBQVI7TUFDRSxRQUFBLEdBQVcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQXRCLENBQWdDLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBaEM7TUFDWCxJQUFHLFFBQUg7UUFDRSxhQUFBLEdBQWdCLFFBQVEsQ0FBQyxlQUQzQjtPQUZGOztJQUtBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLDRCQUFBLEdBRWEsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUZuQixHQUV5QixpREFGekIsR0FHK0IsQ0FBQyxLQUFBLElBQU8sRUFBUixDQUgvQixHQUcwQyw4QkFIMUMsR0FJbUIsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUp6QixHQUlxQyw2REFKckMsR0FLMkMsQ0FBQyxXQUFBLElBQWEsRUFBZCxDQUwzQyxHQUs0RCx5Q0FMdEU7SUFRQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7V0FDQSxJQUFDLENBQUEsT0FBRCxDQUFTLE9BQVQ7RUFoQk07OzhCQWtCUixTQUFBLEdBQVcsU0FBQTtBQUNULFdBQU87TUFDUCxPQUFBLEVBQVUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsUUFBVixDQUFtQixDQUFDLEdBQXBCLENBQUEsQ0FESDtNQUVQLGFBQUEsRUFBZ0IsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsY0FBVixDQUF5QixDQUFDLEdBQTFCLENBQUEsQ0FGVDs7RUFERTs7OEJBTVgsVUFBQSxHQUFZLFNBQUE7QUFDVixXQUFPO01BQ1AsT0FBQSxFQUFVLFNBREg7O0VBREc7OzhCQUtaLFlBQUEsR0FBYyxTQUFBLEdBQUE7OzhCQUdkLE9BQUEsR0FBUyxTQUFBLEdBQUE7OzhCQUtULFVBQUEsR0FBWSxTQUFBO1dBQ1YsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsV0FBVixDQUFzQixDQUFDLElBQXZCLENBQTRCLElBQUMsQ0FBQSxTQUFTLENBQUMsU0FBWCxDQUFBLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsSUFBNUIsQ0FBNUI7RUFEVTs7OztHQTVEa0IsUUFBUSxDQUFDIiwiZmlsZSI6InN1YnRlc3QvcHJvdG90eXBlcy9MZXNzb25QbGFuUnVuVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIExlc3NvblBsYW5SdW5WaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJpZFwiXG4gIFxuIyAgZXZlbnRzOlxuIyAgICAnY2xpY2sgI2dlbmVyYXRlJyAgICAgICAgOiAnZ2VuZXJhdGUnXG4jICAgICdjaGFuZ2UgI3BhcnRpY2lwYW50X2lkJyA6ICdzZXRWYWxpZGF0b3InXG4gIFxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID0gXG4gICAgICB0aXRsZSA6IHQoXCJMZXNzb25QbGFuUnVuVmlldy5sYWJlbC50aXRsZVwiKVxuICAgICAgbGVzc29uX3RleHQgICA6IHQoXCJMZXNzb25QbGFuUnVuVmlldy5sYWJlbC5sZXNzb25fdGV4dFwiKVxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQGkxOG4oKVxuXG4gICAgQG1vZGVsICAgICA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ICAgID0gb3B0aW9ucy5wYXJlbnRcbiAgICBAZGF0YUVudHJ5ID0gb3B0aW9ucy5kYXRhRW50cnlcblxuICAgIEB2YWxpZGF0b3IgPSBuZXcgQ2hlY2tEaWdpdFxuXG4gIHJlbmRlcjogLT5cblxuICAgIHVubGVzcyBAZGF0YUVudHJ5XG4gICAgICBwcmV2aW91cyA9IEBwYXJlbnQucGFyZW50LnJlc3VsdC5nZXRCeUhhc2goQG1vZGVsLmdldCgnaGFzaCcpKVxuICAgICAgaWYgcHJldmlvdXNcbiAgICAgICAgcGFydGljaXBhbnRJZCA9IHByZXZpb3VzLnBhcnRpY2lwYW50X2lkXG5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICA8Zm9ybT5cbiAgICAgIDxsYWJlbCBmb3I9J3RpdGxlJz4je0B0ZXh0LnRpdGxlfTwvbGFiZWw+XG4gICAgICA8aW5wdXQgaWQ9J3RpdGxlJyBuYW1lPSd0aXRsZScgdmFsdWU9JyN7dGl0bGV8fCcnfSc+XG4gICAgICA8bGFiZWwgZm9yPSdsZXNzb25fdGV4dCc+I3tAdGV4dC5sZXNzb25fdGV4dH08L2xhYmVsPlxuICAgICAgPGlucHV0IGlkPSdsZXNzb25fdGV4dCcgbmFtZT0nbGVzc29uX3RleHQnIHZhbHVlPScje2xlc3Nvbl90ZXh0fHwnJ30nPlxuICAgICAgPGRpdiBjbGFzcz0nbWVzc2FnZXMnPjwvZGl2PlxuICAgIDwvZm9ybT5cIlxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuICAgIEB0cmlnZ2VyIFwicmVhZHlcIlxuXG4gIGdldFJlc3VsdDogLT5cbiAgICByZXR1cm4ge1xuICAgICd0aXRsZScgOiBAJGVsLmZpbmQoXCIjdGl0bGVcIikudmFsKClcbiAgICAnbGVzc29uX3RleHQnIDogQCRlbC5maW5kKFwiI2xlc3Nvbl90ZXh0XCIpLnZhbCgpXG4gICAgfVxuXG4gIGdldFNraXBwZWQ6IC0+XG4gICAgcmV0dXJuIHtcbiAgICAndGl0bGUnIDogXCJza2lwcGVkXCJcbiAgICB9XG5cbiAgc2V0VmFsaWRhdG9yOiAtPlxuIyAgICBAdmFsaWRhdG9yLnNldCBAZ2V0UmVzdWx0KClbJ3BhcnRpY2lwYW50X2lkJ11cblxuICBpc1ZhbGlkOiAtPlxuIyAgICBAc2V0VmFsaWRhdG9yKClcbiMgICAgcmV0dXJuIGZhbHNlIGlmIG5vdCBAdmFsaWRhdG9yLmlzVmFsaWQoKVxuIyAgICBAdXBkYXRlTmF2aWdhdGlvbigpXG4gICAgXG4gIHNob3dFcnJvcnM6IC0+XG4gICAgQCRlbC5maW5kKFwiLm1lc3NhZ2VzXCIpLmh0bWwgQHZhbGlkYXRvci5nZXRFcnJvcnMoKS5qb2luKFwiLCBcIilcblxuIyAgZ2VuZXJhdGU6IC0+XG4jICAgIEAkZWwuZmluZChcIi5tZXNzYWdlc1wiKS5lbXB0eSgpXG4jICAgIEAkZWwuZmluZCgnI3BhcnRpY2lwYW50X2lkJykudmFsIEB2YWxpZGF0b3IuZ2VuZXJhdGUoKVxuIyAgICBmYWxzZVxuXG4jICB1cGRhdGVOYXZpZ2F0aW9uOiAtPlxuIyAgICBUYW5nZXJpbmUubmF2LnNldFN0dWRlbnQgQGdldFJlc3VsdCgpWydwYXJ0aWNpcGFudF9pZCddXG4iXX0=
