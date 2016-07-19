var ConsentPrintView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ConsentPrintView = (function(superClass) {
  extend(ConsentPrintView, superClass);

  function ConsentPrintView() {
    return ConsentPrintView.__super__.constructor.apply(this, arguments);
  }

  ConsentPrintView.prototype.className = "ConsentPrintView";

  ConsentPrintView.prototype.initialize = function(options) {
    this.confirmedNonConsent = false;
    this.model = options.model;
    return this.parent = options.parent;
  };

  ConsentPrintView.prototype.render = function() {
    var markingArea, spanClass;
    if (this.format === "stimuli") {
      return;
    }
    if (this.format === "content" || this.format === "backup") {
      spanClass = "print-question-option";
      markingArea = "☐";
      this.$el.html("<span class='" + spanClass + "'>" + (this.model.get('prompt') || 'Does the child consent?') + " " + markingArea + "</span>");
    }
    return this.trigger("rendered");
  };

  return ConsentPrintView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9Db25zZW50UHJpbnRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGdCQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzZCQUVKLFNBQUEsR0FBWTs7NkJBRVosVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxtQkFBRCxHQUF1QjtJQUN2QixJQUFDLENBQUEsS0FBRCxHQUFVLE9BQU8sQ0FBQztXQUNsQixJQUFDLENBQUEsTUFBRCxHQUFVLE9BQU8sQ0FBQztFQUhSOzs2QkFLWixNQUFBLEdBQVEsU0FBQTtBQUNOLFFBQUE7SUFBQSxJQUFVLElBQUMsQ0FBQSxNQUFELEtBQVcsU0FBckI7QUFBQSxhQUFBOztJQUNBLElBQUcsSUFBQyxDQUFBLE1BQUQsS0FBVyxTQUFYLElBQXdCLElBQUMsQ0FBQSxNQUFELEtBQVcsUUFBdEM7TUFDRSxTQUFBLEdBQVk7TUFDWixXQUFBLEdBQWM7TUFDZCxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxlQUFBLEdBQ08sU0FEUCxHQUNpQixJQURqQixHQUNvQixDQUFDLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFFBQVgsQ0FBQSxJQUF3Qix5QkFBekIsQ0FEcEIsR0FDdUUsR0FEdkUsR0FDMEUsV0FEMUUsR0FDc0YsU0FEaEcsRUFIRjs7V0FPQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUFUTTs7OztHQVRxQixRQUFRLENBQUMiLCJmaWxlIjoic3VidGVzdC9wcm90b3R5cGVzL0NvbnNlbnRQcmludFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBDb25zZW50UHJpbnRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiQ29uc2VudFByaW50Vmlld1wiXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQGNvbmZpcm1lZE5vbkNvbnNlbnQgPSBmYWxzZVxuICAgIEBtb2RlbCAgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCA9IG9wdGlvbnMucGFyZW50XG4gIFxuICByZW5kZXI6IC0+XG4gICAgcmV0dXJuIGlmIEBmb3JtYXQgaXMgXCJzdGltdWxpXCJcbiAgICBpZiBAZm9ybWF0IGlzIFwiY29udGVudFwiIG9yIEBmb3JtYXQgaXMgXCJiYWNrdXBcIlxuICAgICAgc3BhbkNsYXNzID0gXCJwcmludC1xdWVzdGlvbi1vcHRpb25cIlxuICAgICAgbWFya2luZ0FyZWEgPSBcIuKYkFwiXG4gICAgICBAJGVsLmh0bWwgXCJcbiAgICAgICAgPHNwYW4gY2xhc3M9JyN7c3BhbkNsYXNzfSc+I3tAbW9kZWwuZ2V0KCdwcm9tcHQnKSB8fCAnRG9lcyB0aGUgY2hpbGQgY29uc2VudD8nfSAje21hcmtpbmdBcmVhfTwvc3Bhbj5cbiAgICAgIFwiXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiJdfQ==
