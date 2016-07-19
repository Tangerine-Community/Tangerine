var Students,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Students = (function(superClass) {
  extend(Students, superClass);

  function Students() {
    return Students.__super__.constructor.apply(this, arguments);
  }

  Students.prototype.model = Student;

  Students.prototype.url = "student";

  Students.prototype.comparator = function(model) {
    return model.get("name").toLowerCase();
  };

  return Students;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0dWRlbnQvU3R1ZGVudHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsUUFBQTtFQUFBOzs7QUFBTTs7Ozs7OztxQkFFSixLQUFBLEdBQU87O3FCQUNQLEdBQUEsR0FBSzs7cUJBRUwsVUFBQSxHQUFZLFNBQUMsS0FBRDtXQUNWLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBVixDQUFpQixDQUFDLFdBQWxCLENBQUE7RUFEVTs7OztHQUxTLFFBQVEsQ0FBQyIsImZpbGUiOiJzdHVkZW50L1N0dWRlbnRzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgU3R1ZGVudHMgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cbiAgbW9kZWw6IFN0dWRlbnRcbiAgdXJsOiBcInN0dWRlbnRcIlxuXG4gIGNvbXBhcmF0b3I6IChtb2RlbCkgLT5cbiAgICBtb2RlbC5nZXQoXCJuYW1lXCIpLnRvTG93ZXJDYXNlKClcbiJdfQ==
