var Teachers,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Teachers = (function(superClass) {
  extend(Teachers, superClass);

  function Teachers() {
    return Teachers.__super__.constructor.apply(this, arguments);
  }

  Teachers.prototype.model = Teacher;

  Teachers.prototype.url = "teacher";

  return Teachers;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlYWNoZXIvVGVhY2hlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsUUFBQTtFQUFBOzs7QUFBTTs7Ozs7OztxQkFDSixLQUFBLEdBQVE7O3FCQUNSLEdBQUEsR0FBTTs7OztHQUZlLFFBQVEsQ0FBQyIsImZpbGUiOiJ0ZWFjaGVyL1RlYWNoZXJzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgVGVhY2hlcnMgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG4gIG1vZGVsIDogVGVhY2hlclxuICB1cmwgOiBcInRlYWNoZXJcIiJdfQ==
