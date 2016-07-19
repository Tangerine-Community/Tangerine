var Users,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Users = (function(superClass) {
  extend(Users, superClass);

  function Users() {
    return Users.__super__.constructor.apply(this, arguments);
  }

  Users.prototype.url = "user";

  Users.prototype.model = User;

  return Users;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVzZXIvVXNlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsS0FBQTtFQUFBOzs7QUFBTTs7Ozs7OztrQkFDSixHQUFBLEdBQVE7O2tCQUNSLEtBQUEsR0FBUTs7OztHQUZVLFFBQVEsQ0FBQyIsImZpbGUiOiJ1c2VyL1VzZXJzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgVXNlcnMgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG4gIHVybCAgIDogXCJ1c2VyXCJcbiAgbW9kZWwgOiBVc2VyIl19
