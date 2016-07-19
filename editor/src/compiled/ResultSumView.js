var ResultSumView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ResultSumView = (function(superClass) {
  extend(ResultSumView, superClass);

  function ResultSumView() {
    return ResultSumView.__super__.constructor.apply(this, arguments);
  }

  ResultSumView.prototype.className = "info_box";

  ResultSumView.prototype.events = {
    'click .details': 'toggleDetails'
  };

  ResultSumView.prototype.toggleDetails = function() {
    return this.$el.find('.detail_box').toggle(250);
  };

  ResultSumView.prototype.i18n = function() {
    return this.text = {
      resume: t("ResultSumView.button.resume"),
      noResults: t("ResultSumView.message.no_results")
    };
  };

  ResultSumView.prototype.initialize = function(options) {
    var j, len, prototype, ref, ref1, results, subtest;
    this.i18n();
    this.result = options.model;
    this.finishCheck = options.finishCheck;
    this.finished = ((ref = _.last(this.result.attributes.subtestData)) != null ? ref.data.end_time : void 0) != null ? true : false;
    this.studentId = "";
    ref1 = this.result.attributes.subtestData;
    results = [];
    for (j = 0, len = ref1.length; j < len; j++) {
      subtest = ref1[j];
      prototype = subtest.prototype;
      if (prototype === "id") {
        this.studentId = subtest.data.participant_id;
        break;
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  ResultSumView.prototype.render = function() {
    var datum, html, i, j, len, ref, ref1, sum;
    html = "<div class='detail_box'>";
    if (!(this.finished || !this.finishCheck)) {
      html += "<div><a href='#resume/" + (this.result.get('assessmentId')) + "/" + this.result.id + "'><button class='command'>" + this.text.resume + "</button></a></div>";
    }
    ref = this.result.get("subtestData");
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      datum = ref[i];
      sum = ((ref1 = datum.data.items) != null ? ref1.length : void 0) || Object.keys(datum.data).length;
      html += "<div>" + datum.name + " - items " + sum + "</div>";
    }
    html += "</div>";
    this.$el.html(html);
    return this.trigger("rendered");
  };

  return ResultSumView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc3VsdC9SZXN1bHRTdW1WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGFBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7MEJBRUosU0FBQSxHQUFZOzswQkFFWixNQUFBLEdBQ0U7SUFBQSxnQkFBQSxFQUFtQixlQUFuQjs7OzBCQUVGLGFBQUEsR0FBZSxTQUFBO1dBQ2IsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsYUFBVixDQUF3QixDQUFDLE1BQXpCLENBQWdDLEdBQWhDO0VBRGE7OzBCQUlmLElBQUEsR0FBTSxTQUFBO1dBQ0osSUFBQyxDQUFBLElBQUQsR0FDRTtNQUFBLE1BQUEsRUFBWSxDQUFBLENBQUUsNkJBQUYsQ0FBWjtNQUNBLFNBQUEsRUFBWSxDQUFBLENBQUUsa0NBQUYsQ0FEWjs7RUFGRTs7MEJBS04sVUFBQSxHQUFZLFNBQUUsT0FBRjtBQUVWLFFBQUE7SUFBQSxJQUFDLENBQUEsSUFBRCxDQUFBO0lBRUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxPQUFPLENBQUM7SUFDbEIsSUFBQyxDQUFBLFdBQUQsR0FBZSxPQUFPLENBQUM7SUFDdkIsSUFBQyxDQUFBLFFBQUQsR0FBZSxpR0FBSCxHQUErRCxJQUEvRCxHQUF5RTtJQUVyRixJQUFDLENBQUEsU0FBRCxHQUFhO0FBQ2I7QUFBQTtTQUFBLHNDQUFBOztNQUNFLFNBQUEsR0FBWSxPQUFPLENBQUM7TUFDcEIsSUFBRyxTQUFBLEtBQWEsSUFBaEI7UUFDRSxJQUFDLENBQUEsU0FBRCxHQUFhLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFDMUIsY0FGRjtPQUFBLE1BQUE7NkJBQUE7O0FBRkY7O0VBVFU7OzBCQWVaLE1BQUEsR0FBUSxTQUFBO0FBQ04sUUFBQTtJQUFBLElBQUEsR0FBTztJQUNQLElBQUEsQ0FBQSxDQUFnSixJQUFDLENBQUEsUUFBRCxJQUFhLENBQUMsSUFBQyxDQUFBLFdBQS9KLENBQUE7TUFBQSxJQUFBLElBQVEsd0JBQUEsR0FBd0IsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxjQUFaLENBQUQsQ0FBeEIsR0FBcUQsR0FBckQsR0FBd0QsSUFBQyxDQUFBLE1BQU0sQ0FBQyxFQUFoRSxHQUFtRSw0QkFBbkUsR0FBK0YsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFyRyxHQUE0RyxzQkFBcEg7O0FBQ0E7QUFBQSxTQUFBLDZDQUFBOztNQUNFLEdBQUEsNENBQXNCLENBQUUsZ0JBQWxCLElBQTRCLE1BQU0sQ0FBQyxJQUFQLENBQVksS0FBSyxDQUFDLElBQWxCLENBQXVCLENBQUM7TUFDMUQsSUFBQSxJQUFRLE9BQUEsR0FBUSxLQUFLLENBQUMsSUFBZCxHQUFtQixXQUFuQixHQUE4QixHQUE5QixHQUFrQztBQUY1QztJQUdBLElBQUEsSUFBUTtJQUlSLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLElBQVY7V0FFQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUFaTTs7OztHQS9Ca0IsUUFBUSxDQUFDIiwiZmlsZSI6InJlc3VsdC9SZXN1bHRTdW1WaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUmVzdWx0U3VtVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiBcImluZm9fYm94XCJcblxuICBldmVudHM6XG4gICAgJ2NsaWNrIC5kZXRhaWxzJyA6ICd0b2dnbGVEZXRhaWxzJ1xuXG4gIHRvZ2dsZURldGFpbHM6IC0+XG4gICAgQCRlbC5maW5kKCcuZGV0YWlsX2JveCcpLnRvZ2dsZSgyNTApXG5cblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID1cbiAgICAgIHJlc3VtZSAgICA6IHQoXCJSZXN1bHRTdW1WaWV3LmJ1dHRvbi5yZXN1bWVcIilcbiAgICAgIG5vUmVzdWx0cyA6IHQoXCJSZXN1bHRTdW1WaWV3Lm1lc3NhZ2Uubm9fcmVzdWx0c1wiKVxuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApIC0+XG5cbiAgICBAaTE4bigpXG5cbiAgICBAcmVzdWx0ID0gb3B0aW9ucy5tb2RlbFxuICAgIEBmaW5pc2hDaGVjayA9IG9wdGlvbnMuZmluaXNoQ2hlY2tcbiAgICBAZmluaXNoZWQgPSBpZiBfLmxhc3QoQHJlc3VsdC5hdHRyaWJ1dGVzLnN1YnRlc3REYXRhKT8uZGF0YS5lbmRfdGltZT8gdGhlbiB0cnVlIGVsc2UgZmFsc2VcblxuICAgIEBzdHVkZW50SWQgPSBcIlwiXG4gICAgZm9yIHN1YnRlc3QgaW4gQHJlc3VsdC5hdHRyaWJ1dGVzLnN1YnRlc3REYXRhXG4gICAgICBwcm90b3R5cGUgPSBzdWJ0ZXN0LnByb3RvdHlwZVxuICAgICAgaWYgcHJvdG90eXBlID09IFwiaWRcIlxuICAgICAgICBAc3R1ZGVudElkID0gc3VidGVzdC5kYXRhLnBhcnRpY2lwYW50X2lkXG4gICAgICAgIGJyZWFrXG5cbiAgcmVuZGVyOiAtPlxuICAgIGh0bWwgPSBcIjxkaXYgY2xhc3M9J2RldGFpbF9ib3gnPlwiXG4gICAgaHRtbCArPSBcIjxkaXY+PGEgaHJlZj0nI3Jlc3VtZS8je0ByZXN1bHQuZ2V0KCdhc3Nlc3NtZW50SWQnKX0vI3tAcmVzdWx0LmlkfSc+PGJ1dHRvbiBjbGFzcz0nY29tbWFuZCc+I3tAdGV4dC5yZXN1bWV9PC9idXR0b24+PC9hPjwvZGl2PlwiIHVubGVzcyBAZmluaXNoZWQgfHwgIUBmaW5pc2hDaGVja1xuICAgIGZvciBkYXR1bSwgaSBpbiBAcmVzdWx0LmdldChcInN1YnRlc3REYXRhXCIpXG4gICAgICBzdW0gPSBkYXR1bS5kYXRhLml0ZW1zPy5sZW5ndGggb3IgT2JqZWN0LmtleXMoZGF0dW0uZGF0YSkubGVuZ3RoXG4gICAgICBodG1sICs9IFwiPGRpdj4je2RhdHVtLm5hbWV9IC0gaXRlbXMgI3tzdW19PC9kaXY+XCJcbiAgICBodG1sICs9IFwiXG4gICAgICA8L2Rpdj5cbiAgICBcIlxuXG4gICAgQCRlbC5odG1sIGh0bWxcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4iXX0=
