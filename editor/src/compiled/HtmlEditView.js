var HtmlEditView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

HtmlEditView = (function(superClass) {
  extend(HtmlEditView, superClass);

  function HtmlEditView() {
    return HtmlEditView.__super__.constructor.apply(this, arguments);
  }

  HtmlEditView.prototype.className = "HtmlEditView";

  HtmlEditView.prototype.initialize = function(options) {
    this.model = options.model;
    return this.parent = options.parent;
  };

  HtmlEditView.prototype.isValid = function() {
    return true;
  };

  HtmlEditView.prototype.save = function() {
    return this.model.set({
      "html": this.$el.find("#html").val()
    });
  };

  HtmlEditView.prototype.render = function() {
    var html;
    html = this.model.get("html") || "";
    return this.$el.html("<div class='label_value'> <label for='html'>Html</label> <textarea id='html'>" + html + "</textarea> </div>");
  };

  return HtmlEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVsZW1lbnQvdHlwZXMvSHRtbEVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFlBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7eUJBRUosU0FBQSxHQUFZOzt5QkFFWixVQUFBLEdBQVksU0FBRSxPQUFGO0lBQ1YsSUFBQyxDQUFBLEtBQUQsR0FBUyxPQUFPLENBQUM7V0FDakIsSUFBQyxDQUFBLE1BQUQsR0FBVSxPQUFPLENBQUM7RUFGUjs7eUJBSVosT0FBQSxHQUFTLFNBQUE7V0FBRztFQUFIOzt5QkFFVCxJQUFBLEdBQU0sU0FBQTtXQUNKLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUNFO01BQUEsTUFBQSxFQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLE9BQVYsQ0FBa0IsQ0FBQyxHQUFuQixDQUFBLENBQVQ7S0FERjtFQURJOzt5QkFJTixNQUFBLEdBQVEsU0FBQTtBQUNOLFFBQUE7SUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsTUFBWCxDQUFBLElBQXNCO1dBQzdCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLCtFQUFBLEdBR2dCLElBSGhCLEdBR3FCLG9CQUgvQjtFQUZNOzs7O0dBZGlCLFFBQVEsQ0FBQyIsImZpbGUiOiJlbGVtZW50L3R5cGVzL0h0bWxFZGl0Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEh0bWxFZGl0VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiBcIkh0bWxFZGl0Vmlld1wiXG5cbiAgaW5pdGlhbGl6ZTogKCBvcHRpb25zICkgLT5cbiAgICBAbW9kZWwgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCA9IG9wdGlvbnMucGFyZW50XG5cbiAgaXNWYWxpZDogLT4gdHJ1ZVxuXG4gIHNhdmU6IC0+XG4gICAgQG1vZGVsLnNldFxuICAgICAgXCJodG1sXCIgOiBAJGVsLmZpbmQoXCIjaHRtbFwiKS52YWwoKVxuXG4gIHJlbmRlcjogLT5cbiAgICBodG1sID0gQG1vZGVsLmdldChcImh0bWxcIikgfHwgXCJcIlxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdodG1sJz5IdG1sPC9sYWJlbD5cbiAgICAgICAgPHRleHRhcmVhIGlkPSdodG1sJz4je2h0bWx9PC90ZXh0YXJlYT5cbiAgICAgIDwvZGl2PlxuICAgIFwiXG4iXX0=
