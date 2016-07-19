var LocationPrintView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LocationPrintView = (function(superClass) {
  extend(LocationPrintView, superClass);

  function LocationPrintView() {
    return LocationPrintView.__super__.constructor.apply(this, arguments);
  }

  LocationPrintView.prototype.className = "LocationPrintView";

  LocationPrintView.prototype.initialize = function(options) {
    this.model = options.model;
    this.parent = options.parent;
    this.levels = this.model.get("levels") || [];
    this.locations = this.model.get("locations") || [];
    if (this.levels.length === 1 && this.levels[0] === "") {
      this.levels = [];
    }
    if (this.locations.length === 1 && this.locations[0] === "") {
      return this.locations = [];
    }
  };

  LocationPrintView.prototype.render = function() {
    if (this.format === "stimuli") {
      return;
    }
    if (this.format === "content") {
      this.$el.html("School Locations<br/> Levels: " + this.levels + "<br/> Available Locations:<br/> " + (this.locations.join("<br/>")) + "<br/>");
    }
    if (this.format === "backup") {
      this.$el.html("<table class='marking-table'> " + (_(this.levels).map(function(locationLevel) {
        return "<tr> <td style='vertical-align:middle'>" + locationLevel + "</td><td class='marking-area'></td> </tr>";
      }).join("")) + " </table>");
    }
    return this.trigger("rendered");
  };

  return LocationPrintView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9Mb2NhdGlvblByaW50Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxpQkFBQTtFQUFBOzs7QUFBTTs7Ozs7Ozs4QkFFSixTQUFBLEdBQVc7OzhCQUVYLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFFVixJQUFDLENBQUEsS0FBRCxHQUFVLE9BQU8sQ0FBQztJQUNsQixJQUFDLENBQUEsTUFBRCxHQUFVLE9BQU8sQ0FBQztJQUVsQixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFFBQVgsQ0FBQSxJQUE4QjtJQUN4QyxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFdBQVgsQ0FBQSxJQUEyQjtJQUV4QyxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixLQUFrQixDQUFsQixJQUF1QixJQUFDLENBQUEsTUFBTyxDQUFBLENBQUEsQ0FBUixLQUFjLEVBQXhDO01BQ0UsSUFBQyxDQUFBLE1BQUQsR0FBVSxHQURaOztJQUVBLElBQUcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLEtBQXFCLENBQXJCLElBQTBCLElBQUMsQ0FBQSxTQUFVLENBQUEsQ0FBQSxDQUFYLEtBQWlCLEVBQTlDO2FBQ0UsSUFBQyxDQUFBLFNBQUQsR0FBYSxHQURmOztFQVZVOzs4QkFlWixNQUFBLEdBQVEsU0FBQTtJQUNOLElBQVUsSUFBQyxDQUFBLE1BQUQsS0FBVyxTQUFyQjtBQUFBLGFBQUE7O0lBRUEsSUFBRyxJQUFDLENBQUEsTUFBRCxLQUFXLFNBQWQ7TUFFRSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxnQ0FBQSxHQUVFLElBQUMsQ0FBQSxNQUZILEdBRVUsa0NBRlYsR0FJUCxDQUFDLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixPQUFoQixDQUFELENBSk8sR0FJbUIsT0FKN0IsRUFGRjs7SUFTQSxJQUFHLElBQUMsQ0FBQSxNQUFELEtBQVcsUUFBZDtNQUVFLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGdDQUFBLEdBRUgsQ0FDRCxDQUFBLENBQUUsSUFBQyxDQUFBLE1BQUgsQ0FBVSxDQUFDLEdBQVgsQ0FBZ0IsU0FBQyxhQUFEO2VBQ2QseUNBQUEsR0FFd0MsYUFGeEMsR0FFc0Q7TUFIeEMsQ0FBaEIsQ0FNQyxDQUFDLElBTkYsQ0FNTyxFQU5QLENBREMsQ0FGRyxHQVVILFdBVlAsRUFGRjs7V0FnQkEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO0VBNUJNOzs7O0dBbkJzQixRQUFRLENBQUMiLCJmaWxlIjoic3VidGVzdC9wcm90b3R5cGVzL0xvY2F0aW9uUHJpbnRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTG9jYXRpb25QcmludFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lOiBcIkxvY2F0aW9uUHJpbnRWaWV3XCJcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgIEBtb2RlbCAgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCA9IG9wdGlvbnMucGFyZW50XG5cbiAgICBAbGV2ZWxzID0gQG1vZGVsLmdldChcImxldmVsc1wiKSAgICAgICB8fCBbXVxuICAgIEBsb2NhdGlvbnMgPSBAbW9kZWwuZ2V0KFwibG9jYXRpb25zXCIpIHx8IFtdXG5cbiAgICBpZiBAbGV2ZWxzLmxlbmd0aCA9PSAxICYmIEBsZXZlbHNbMF0gPT0gXCJcIlxuICAgICAgQGxldmVscyA9IFtdXG4gICAgaWYgQGxvY2F0aW9ucy5sZW5ndGggPT0gMSAmJiBAbG9jYXRpb25zWzBdID09IFwiXCJcbiAgICAgIEBsb2NhdGlvbnMgPSBbXVxuXG5cblxuICByZW5kZXI6IC0+XG4gICAgcmV0dXJuIGlmIEBmb3JtYXQgaXMgXCJzdGltdWxpXCJcblxuICAgIGlmIEBmb3JtYXQgaXMgXCJjb250ZW50XCJcblxuICAgICAgQCRlbC5odG1sIFwiXG4gICAgICAgIFNjaG9vbCBMb2NhdGlvbnM8YnIvPlxuICAgICAgICBMZXZlbHM6ICN7QGxldmVsc308YnIvPlxuICAgICAgICBBdmFpbGFibGUgTG9jYXRpb25zOjxici8+XG4gICAgICAgICN7QGxvY2F0aW9ucy5qb2luKFwiPGJyLz5cIil9PGJyLz5cbiAgICAgIFwiXG5cbiAgICBpZiBAZm9ybWF0IGlzIFwiYmFja3VwXCJcblxuICAgICAgQCRlbC5odG1sIFwiXG4gICAgICAgICAgPHRhYmxlIGNsYXNzPSdtYXJraW5nLXRhYmxlJz5cbiAgICAgICAgICAgICN7XG4gICAgICAgICAgICBfKEBsZXZlbHMpLm1hcCggKGxvY2F0aW9uTGV2ZWwpIC0+XG4gICAgICAgICAgICAgIFwiXG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPSd2ZXJ0aWNhbC1hbGlnbjptaWRkbGUnPiN7bG9jYXRpb25MZXZlbH08L3RkPjx0ZCBjbGFzcz0nbWFya2luZy1hcmVhJz48L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgIFwiXG4gICAgICAgICAgICApLmpvaW4oXCJcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA8L3RhYmxlPlxuICAgICAgXCJcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4iXX0=
