var Teacher,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Teacher = (function(superClass) {
  extend(Teacher, superClass);

  function Teacher() {
    return Teacher.__super__.constructor.apply(this, arguments);
  }

  Teacher.prototype.url = "teacher";

  return Teacher;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlYWNoZXIvVGVhY2hlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxPQUFBO0VBQUE7OztBQUFNOzs7Ozs7O29CQUNKLEdBQUEsR0FBTTs7OztHQURjLFFBQVEsQ0FBQyIsImZpbGUiOiJ0ZWFjaGVyL1RlYWNoZXIuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBUZWFjaGVyIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcbiAgdXJsIDogXCJ0ZWFjaGVyXCIiXX0=
