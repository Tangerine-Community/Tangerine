var IdPrintView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

IdPrintView = (function(superClass) {
  extend(IdPrintView, superClass);

  function IdPrintView() {
    return IdPrintView.__super__.constructor.apply(this, arguments);
  }

  IdPrintView.prototype.className = "id";

  IdPrintView.prototype.initialize = function(options) {};

  IdPrintView.prototype.render = function() {
    if (this.format === "stimuli") {
      return;
    }
    if (this.format === "backup" || this.format === "content") {
      this.$el.html("<table class='marking-table'> <tr> <td style='vertical-align:middle'>" + (this.model.get("name")) + "</td><td class='marking-area'></td> </tr> </table>");
    }
    return this.trigger("rendered");
  };

  return IdPrintView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9JZFByaW50Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxXQUFBO0VBQUE7OztBQUFNOzs7Ozs7O3dCQUVKLFNBQUEsR0FBVzs7d0JBRVgsVUFBQSxHQUFZLFNBQUMsT0FBRCxHQUFBOzt3QkFFWixNQUFBLEdBQVEsU0FBQTtJQUNOLElBQVUsSUFBQyxDQUFBLE1BQUQsS0FBVyxTQUFyQjtBQUFBLGFBQUE7O0lBQ0EsSUFBRyxJQUFDLENBQUEsTUFBRCxLQUFXLFFBQVgsSUFBdUIsSUFBQyxDQUFBLE1BQUQsS0FBVyxTQUFyQztNQUVFLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLHVFQUFBLEdBR2lDLENBQUMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsTUFBWCxDQUFELENBSGpDLEdBR29ELG9EQUg5RCxFQUZGOztXQVNBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQVhNOzs7O0dBTmdCLFFBQVEsQ0FBQyIsImZpbGUiOiJzdWJ0ZXN0L3Byb3RvdHlwZXMvSWRQcmludFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBJZFByaW50VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiaWRcIlxuICBcbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgcmVuZGVyOiAtPlxuICAgIHJldHVybiBpZiBAZm9ybWF0IGlzIFwic3RpbXVsaVwiXG4gICAgaWYgQGZvcm1hdCBpcyBcImJhY2t1cFwiIG9yIEBmb3JtYXQgaXMgXCJjb250ZW50XCJcblxuICAgICAgQCRlbC5odG1sIFwiXG4gICAgICAgICAgPHRhYmxlIGNsYXNzPSdtYXJraW5nLXRhYmxlJz5cbiAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgPHRkIHN0eWxlPSd2ZXJ0aWNhbC1hbGlnbjptaWRkbGUnPiN7QG1vZGVsLmdldCBcIm5hbWVcIn08L3RkPjx0ZCBjbGFzcz0nbWFya2luZy1hcmVhJz48L3RkPlxuICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICA8L3RhYmxlPlxuICAgICAgXCJcbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuIl19
