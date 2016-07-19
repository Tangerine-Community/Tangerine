var DatetimeEditView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

DatetimeEditView = (function(superClass) {
  extend(DatetimeEditView, superClass);

  function DatetimeEditView() {
    return DatetimeEditView.__super__.constructor.apply(this, arguments);
  }

  DatetimeEditView.prototype.className = "DatetimeEditView";

  DatetimeEditView.prototype.initialize = function(options) {
    this.model = options.model;
    return this.parent = options.parent;
  };

  DatetimeEditView.prototype.save = function() {};

  DatetimeEditView.prototype.isValid = function() {
    return true;
  };

  return DatetimeEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9EYXRldGltZUVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGdCQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzZCQUVKLFNBQUEsR0FBWTs7NkJBRVosVUFBQSxHQUFZLFNBQUUsT0FBRjtJQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO1dBQ2pCLElBQUMsQ0FBQSxNQUFELEdBQVUsT0FBTyxDQUFDO0VBRlI7OzZCQUlaLElBQUEsR0FBTSxTQUFBLEdBQUE7OzZCQUVOLE9BQUEsR0FBUyxTQUFBO1dBQUc7RUFBSDs7OztHQVZvQixRQUFRLENBQUMiLCJmaWxlIjoic3VidGVzdC9wcm90b3R5cGVzL0RhdGV0aW1lRWRpdFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBEYXRldGltZUVkaXRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiRGF0ZXRpbWVFZGl0Vmlld1wiXG5cbiAgaW5pdGlhbGl6ZTogKCBvcHRpb25zICkgLT5cbiAgICBAbW9kZWwgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCA9IG9wdGlvbnMucGFyZW50XG5cbiAgc2F2ZTogLT4gI2RvIG5vdGhpbmdcbiAgXG4gIGlzVmFsaWQ6IC0+IHRydWUiXX0=
