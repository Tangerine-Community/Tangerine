var Assessments,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Assessments = (function(superClass) {
  extend(Assessments, superClass);

  function Assessments() {
    return Assessments.__super__.constructor.apply(this, arguments);
  }

  Assessments.prototype.model = Assessment;

  Assessments.prototype.url = 'assessment';

  Assessments.prototype.comparator = function(model) {
    return model.get("name");
  };

  return Assessments;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2Vzc21lbnQvQXNzZXNzbWVudHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsV0FBQTtFQUFBOzs7QUFBTTs7Ozs7Ozt3QkFDSixLQUFBLEdBQU87O3dCQUNQLEdBQUEsR0FBSzs7d0JBRUwsVUFBQSxHQUFhLFNBQUMsS0FBRDtXQUNYLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBVjtFQURXOzs7O0dBSlcsUUFBUSxDQUFDIiwiZmlsZSI6ImFzc2Vzc21lbnQvQXNzZXNzbWVudHMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBBc3Nlc3NtZW50cyBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cbiAgbW9kZWw6IEFzc2Vzc21lbnRcbiAgdXJsOiAnYXNzZXNzbWVudCdcblxuICBjb21wYXJhdG9yIDogKG1vZGVsKSAtPlxuICAgIG1vZGVsLmdldCBcIm5hbWVcIlxuIl19
