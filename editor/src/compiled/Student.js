var Student,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Student = (function(superClass) {
  extend(Student, superClass);

  function Student() {
    return Student.__super__.constructor.apply(this, arguments);
  }

  Student.prototype.url = "student";

  Student.prototype.defaults = {
    gender: "Not entered",
    age: "Not entered",
    name: "Not entered",
    klassId: null
  };

  Student.prototype.initialize = function() {};

  return Student;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0dWRlbnQvU3R1ZGVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxPQUFBO0VBQUE7OztBQUFNOzs7Ozs7O29CQUVKLEdBQUEsR0FBTTs7b0JBRU4sUUFBQSxHQUNFO0lBQUEsTUFBQSxFQUFVLGFBQVY7SUFDQSxHQUFBLEVBQVUsYUFEVjtJQUVBLElBQUEsRUFBVSxhQUZWO0lBR0EsT0FBQSxFQUFVLElBSFY7OztvQkFLRixVQUFBLEdBQVksU0FBQSxHQUFBOzs7O0dBVlEsUUFBUSxDQUFDIiwiZmlsZSI6InN0dWRlbnQvU3R1ZGVudC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFN0dWRlbnQgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG4gIHVybCA6IFwic3R1ZGVudFwiXG5cbiAgZGVmYXVsdHMgOlxuICAgIGdlbmRlciAgOiBcIk5vdCBlbnRlcmVkXCJcbiAgICBhZ2UgICAgIDogXCJOb3QgZW50ZXJlZFwiXG4gICAgbmFtZSAgICA6IFwiTm90IGVudGVyZWRcIlxuICAgIGtsYXNzSWQgOiBudWxsXG5cbiAgaW5pdGlhbGl6ZTogLT4iXX0=
