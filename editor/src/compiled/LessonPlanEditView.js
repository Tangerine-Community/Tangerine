var LessonPlanEditView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LessonPlanEditView = (function(superClass) {
  extend(LessonPlanEditView, superClass);

  function LessonPlanEditView() {
    return LessonPlanEditView.__super__.constructor.apply(this, arguments);
  }

  LessonPlanEditView.prototype.className = "LessonPlanEditView";

  LessonPlanEditView.prototype.initialize = function(options) {
    this.model = options.model;
    return this.parent = options.parent;
  };

  LessonPlanEditView.prototype.isValid = function() {
    return true;
  };

  LessonPlanEditView.prototype.save = function() {};

  return LessonPlanEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9MZXNzb25QbGFuRWRpdFZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsa0JBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7K0JBRUosU0FBQSxHQUFXOzsrQkFFWCxVQUFBLEdBQVksU0FBRSxPQUFGO0lBQ1YsSUFBQyxDQUFBLEtBQUQsR0FBUyxPQUFPLENBQUM7V0FDakIsSUFBQyxDQUFBLE1BQUQsR0FBVSxPQUFPLENBQUM7RUFGUjs7K0JBSVosT0FBQSxHQUFTLFNBQUE7V0FBRztFQUFIOzsrQkFFVCxJQUFBLEdBQU0sU0FBQSxHQUFBOzs7O0dBVnlCLFFBQVEsQ0FBQyIsImZpbGUiOiJzdWJ0ZXN0L3Byb3RvdHlwZXMvTGVzc29uUGxhbkVkaXRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTGVzc29uUGxhbkVkaXRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJMZXNzb25QbGFuRWRpdFZpZXdcIlxuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApIC0+XG4gICAgQG1vZGVsID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgPSBvcHRpb25zLnBhcmVudFxuXG4gIGlzVmFsaWQ6IC0+IHRydWVcblxuICBzYXZlOiAtPiAjIGRvIG5vdGhpbmciXX0=
