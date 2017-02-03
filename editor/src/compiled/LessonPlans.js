var LessonPlans,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LessonPlans = (function(superClass) {
  extend(LessonPlans, superClass);

  function LessonPlans() {
    return LessonPlans.__super__.constructor.apply(this, arguments);
  }

  LessonPlans.prototype.model = LessonPlan;

  LessonPlans.prototype.url = "lessonPlan";

  LessonPlans.prototype.comparator = function(model) {
    return model.get("name");
  };

  return LessonPlans;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlc3NvblBsYW4vTGVzc29uUGxhbnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsV0FBQTtFQUFBOzs7QUFBTTs7Ozs7Ozt3QkFFSixLQUFBLEdBQVE7O3dCQUNSLEdBQUEsR0FBTTs7d0JBRU4sVUFBQSxHQUFhLFNBQUMsS0FBRDtXQUNYLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBVjtFQURXOzs7O0dBTFcsUUFBUSxDQUFDIiwiZmlsZSI6Imxlc3NvblBsYW4vTGVzc29uUGxhbnMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBMZXNzb25QbGFucyBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuICBtb2RlbCA6IExlc3NvblBsYW5cbiAgdXJsIDogXCJsZXNzb25QbGFuXCJcblxuICBjb21wYXJhdG9yIDogKG1vZGVsKSAtPlxuICAgIG1vZGVsLmdldCBcIm5hbWVcIlxuXG4iXX0=
