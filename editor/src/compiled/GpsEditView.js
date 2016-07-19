var GpsEditView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

GpsEditView = (function(superClass) {
  extend(GpsEditView, superClass);

  function GpsEditView() {
    return GpsEditView.__super__.constructor.apply(this, arguments);
  }

  GpsEditView.prototype.className = "GpsEditView";

  GpsEditView.prototype.initialize = function(options) {
    this.model = options.model;
    return this.parent = options.parent;
  };

  GpsEditView.prototype.render = function() {};

  GpsEditView.prototype.save = function() {};

  GpsEditView.prototype.isValid = function() {
    return true;
  };

  return GpsEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9HcHNFZGl0Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxXQUFBO0VBQUE7OztBQUFNOzs7Ozs7O3dCQUVKLFNBQUEsR0FBWTs7d0JBRVosVUFBQSxHQUFZLFNBQUUsT0FBRjtJQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO1dBQ2pCLElBQUMsQ0FBQSxNQUFELEdBQVUsT0FBTyxDQUFDO0VBRlI7O3dCQUlaLE1BQUEsR0FBUSxTQUFBLEdBQUE7O3dCQUVSLElBQUEsR0FBTSxTQUFBLEdBQUE7O3dCQUVOLE9BQUEsR0FBUyxTQUFBO1dBQUc7RUFBSDs7OztHQVplLFFBQVEsQ0FBQyIsImZpbGUiOiJzdWJ0ZXN0L3Byb3RvdHlwZXMvR3BzRWRpdFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBHcHNFZGl0VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiBcIkdwc0VkaXRWaWV3XCJcblxuICBpbml0aWFsaXplOiAoIG9wdGlvbnMgKSAtPlxuICAgIEBtb2RlbCA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ID0gb3B0aW9ucy5wYXJlbnRcblxuICByZW5kZXI6IC0+ICMgZG8gbm90aGluZ1xuXG4gIHNhdmU6IC0+ICMgZG8gbm90aGluZ1xuICBcbiAgaXNWYWxpZDogLT4gdHJ1ZVxuIl19
