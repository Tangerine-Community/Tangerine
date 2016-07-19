var GpsPrintView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

GpsPrintView = (function(superClass) {
  extend(GpsPrintView, superClass);

  function GpsPrintView() {
    return GpsPrintView.__super__.constructor.apply(this, arguments);
  }

  GpsPrintView.prototype.className = "Gps";

  GpsPrintView.prototype.initialize = function(options) {
    this.model = options.model;
    return this.parent = options.parent;
  };

  GpsPrintView.prototype.render = function() {
    if (this.format === "stimuli" || this.format === "backup") {
      return;
    }
    if (this.format === "content") {
      this.$el.html("Capture Gps location");
    }
    return this.trigger("rendered");
  };

  return GpsPrintView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9HcHNQcmludFZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsWUFBQTtFQUFBOzs7QUFBTTs7Ozs7Ozt5QkFFSixTQUFBLEdBQVc7O3lCQUVYLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFDVixJQUFDLENBQUEsS0FBRCxHQUFVLE9BQU8sQ0FBQztXQUNsQixJQUFDLENBQUEsTUFBRCxHQUFVLE9BQU8sQ0FBQztFQUZSOzt5QkFJWixNQUFBLEdBQVEsU0FBQTtJQUNOLElBQVUsSUFBQyxDQUFBLE1BQUQsS0FBVyxTQUFYLElBQXdCLElBQUMsQ0FBQSxNQUFELEtBQVcsUUFBN0M7QUFBQSxhQUFBOztJQUVBLElBQUcsSUFBQyxDQUFBLE1BQUQsS0FBVyxTQUFkO01BQ0UsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsc0JBQVYsRUFERjs7V0FHQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUFOTTs7OztHQVJpQixRQUFRLENBQUMiLCJmaWxlIjoic3VidGVzdC9wcm90b3R5cGVzL0dwc1ByaW50Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEdwc1ByaW50VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiR3BzXCJcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBAbW9kZWwgID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgPSBvcHRpb25zLnBhcmVudFxuICBcbiAgcmVuZGVyOiAtPlxuICAgIHJldHVybiBpZiBAZm9ybWF0IGlzIFwic3RpbXVsaVwiIG9yIEBmb3JtYXQgaXMgXCJiYWNrdXBcIlxuXG4gICAgaWYgQGZvcm1hdCBpcyBcImNvbnRlbnRcIlxuICAgICAgQCRlbC5odG1sIFwiQ2FwdHVyZSBHcHMgbG9jYXRpb25cIlxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4iXX0=
