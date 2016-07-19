var DatetimePrintView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

DatetimePrintView = (function(superClass) {
  extend(DatetimePrintView, superClass);

  function DatetimePrintView() {
    return DatetimePrintView.__super__.constructor.apply(this, arguments);
  }

  DatetimePrintView.prototype.className = "datetime";

  DatetimePrintView.prototype.initialize = function(options) {
    this.model = options.model;
    return this.parent = options.parent;
  };

  DatetimePrintView.prototype.render = function() {
    if (this.format === "stimuli") {
      return;
    }
    if (this.format === "backup") {
      this.$el.html("<table class='marking-table'> " + (_("Date,Time".split(/,/)).map(function(locationLevel) {
        return "<tr> <td style='vertical-align:middle'>" + locationLevel + "</td><td class='marking-area'></td> </tr>";
      }).join("")) + " </table>");
    }
    if (this.format === "content") {
      this.$el.html("DateTime");
    }
    return this.trigger("rendered");
  };

  return DatetimePrintView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9EYXRldGltZVByaW50Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxpQkFBQTtFQUFBOzs7QUFBTTs7Ozs7Ozs4QkFFSixTQUFBLEdBQVc7OzhCQUVYLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFDVixJQUFDLENBQUEsS0FBRCxHQUFVLE9BQU8sQ0FBQztXQUNsQixJQUFDLENBQUEsTUFBRCxHQUFVLE9BQU8sQ0FBQztFQUZSOzs4QkFJWixNQUFBLEdBQVEsU0FBQTtJQUNOLElBQVUsSUFBQyxDQUFBLE1BQUQsS0FBVyxTQUFyQjtBQUFBLGFBQUE7O0lBRUEsSUFBRyxJQUFDLENBQUEsTUFBRCxLQUFXLFFBQWQ7TUFFRSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxnQ0FBQSxHQUVILENBQ0QsQ0FBQSxDQUFFLFdBQVcsQ0FBQyxLQUFaLENBQWtCLEdBQWxCLENBQUYsQ0FBeUIsQ0FBQyxHQUExQixDQUErQixTQUFDLGFBQUQ7ZUFDN0IseUNBQUEsR0FFd0MsYUFGeEMsR0FFc0Q7TUFIekIsQ0FBL0IsQ0FNQyxDQUFDLElBTkYsQ0FNTyxFQU5QLENBREMsQ0FGRyxHQVVILFdBVlAsRUFGRjs7SUFnQkEsSUFBRyxJQUFDLENBQUEsTUFBRCxLQUFXLFNBQWQ7TUFDRSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxVQUFWLEVBREY7O1dBR0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO0VBdEJNOzs7O0dBUnNCLFFBQVEsQ0FBQyIsImZpbGUiOiJzdWJ0ZXN0L3Byb3RvdHlwZXMvRGF0ZXRpbWVQcmludFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBEYXRldGltZVByaW50VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiZGF0ZXRpbWVcIlxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEBtb2RlbCAgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCA9IG9wdGlvbnMucGFyZW50XG4gIFxuICByZW5kZXI6IC0+XG4gICAgcmV0dXJuIGlmIEBmb3JtYXQgaXMgXCJzdGltdWxpXCJcblxuICAgIGlmIEBmb3JtYXQgaXMgXCJiYWNrdXBcIlxuXG4gICAgICBAJGVsLmh0bWwgXCJcbiAgICAgICAgICA8dGFibGUgY2xhc3M9J21hcmtpbmctdGFibGUnPlxuICAgICAgICAgICAgI3tcbiAgICAgICAgICAgIF8oXCJEYXRlLFRpbWVcIi5zcGxpdCgvLC8pKS5tYXAoIChsb2NhdGlvbkxldmVsKSAtPlxuICAgICAgICAgICAgICBcIlxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT0ndmVydGljYWwtYWxpZ246bWlkZGxlJz4je2xvY2F0aW9uTGV2ZWx9PC90ZD48dGQgY2xhc3M9J21hcmtpbmctYXJlYSc+PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICBcIlxuICAgICAgICAgICAgKS5qb2luKFwiXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgPC90YWJsZT5cbiAgICAgIFwiXG5cbiAgICBpZiBAZm9ybWF0IGlzIFwiY29udGVudFwiXG4gICAgICBAJGVsLmh0bWwgXCJEYXRlVGltZVwiXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiJdfQ==
