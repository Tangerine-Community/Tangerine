var IdEditView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

IdEditView = (function(superClass) {
  extend(IdEditView, superClass);

  function IdEditView() {
    return IdEditView.__super__.constructor.apply(this, arguments);
  }

  IdEditView.prototype.className = "IdEditView";

  IdEditView.prototype.initialize = function(options) {
    this.model = options.model;
    return this.parent = options.parent;
  };

  IdEditView.prototype.isValid = function() {
    return true;
  };

  IdEditView.prototype.save = function() {};

  return IdEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9JZEVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFVBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7dUJBRUosU0FBQSxHQUFXOzt1QkFFWCxVQUFBLEdBQVksU0FBRSxPQUFGO0lBQ1YsSUFBQyxDQUFBLEtBQUQsR0FBUyxPQUFPLENBQUM7V0FDakIsSUFBQyxDQUFBLE1BQUQsR0FBVSxPQUFPLENBQUM7RUFGUjs7dUJBSVosT0FBQSxHQUFTLFNBQUE7V0FBRztFQUFIOzt1QkFFVCxJQUFBLEdBQU0sU0FBQSxHQUFBOzs7O0dBVmlCLFFBQVEsQ0FBQyIsImZpbGUiOiJzdWJ0ZXN0L3Byb3RvdHlwZXMvSWRFZGl0Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIElkRWRpdFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lOiBcIklkRWRpdFZpZXdcIlxuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApIC0+XG4gICAgQG1vZGVsID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgPSBvcHRpb25zLnBhcmVudFxuXG4gIGlzVmFsaWQ6IC0+IHRydWVcblxuICBzYXZlOiAtPiAjIGRvIG5vdGhpbmciXX0=
