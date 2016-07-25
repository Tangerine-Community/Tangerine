var LessonPlan,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LessonPlan = (function(superClass) {
  extend(LessonPlan, superClass);

  function LessonPlan() {
    this.fetch = bind(this.fetch, this);
    return LessonPlan.__super__.constructor.apply(this, arguments);
  }

  LessonPlan.prototype.url = 'lessonPlan';

  LessonPlan.prototype.fetch = function(options) {
    var oldSuccess;
    console.log("Fetching LessonPlans");
    oldSuccess = options.success;
    options.success = (function(_this) {
      return function(model) {
        var allSubtests;
        allSubtests = new Subtests;
        return allSubtests.fetch({
          key: "s" + _this.id,
          success: function(collection) {
            _this.subtests = collection;
            _this.subtests.ensureOrder();
            return typeof oldSuccess === "function" ? oldSuccess(_this) : void 0;
          }
        });
      };
    })(this);
    return Assessment.__super__.fetch.call(this, options);
  };

  LessonPlan.prototype.isActive = function() {
    return !this.isArchived();
  };

  LessonPlan.prototype.isArchived = function() {
    var archived;
    archived = this.get("archived");
    return archived === "true" || archived === true;
  };

  return LessonPlan;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlc3NvblBsYW4vTGVzc29uUGxhbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxVQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7dUJBRUosR0FBQSxHQUFLOzt1QkFLTCxLQUFBLEdBQU8sU0FBQyxPQUFEO0FBQ0wsUUFBQTtJQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksc0JBQVo7SUFDQSxVQUFBLEdBQWEsT0FBTyxDQUFDO0lBQ3JCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxLQUFEO0FBQ2hCLFlBQUE7UUFBQSxXQUFBLEdBQWMsSUFBSTtlQUNsQixXQUFXLENBQUMsS0FBWixDQUNFO1VBQUEsR0FBQSxFQUFLLEdBQUEsR0FBTSxLQUFDLENBQUEsRUFBWjtVQUNBLE9BQUEsRUFBUyxTQUFDLFVBQUQ7WUFDUCxLQUFDLENBQUEsUUFBRCxHQUFZO1lBQ1osS0FBQyxDQUFBLFFBQVEsQ0FBQyxXQUFWLENBQUE7c0RBQ0EsV0FBWTtVQUhMLENBRFQ7U0FERjtNQUZnQjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7V0FTbEIsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBM0IsQ0FBZ0MsSUFBaEMsRUFBbUMsT0FBbkM7RUFaSzs7dUJBY1AsUUFBQSxHQUFVLFNBQUE7QUFBRyxXQUFPLENBQUksSUFBQyxDQUFBLFVBQUQsQ0FBQTtFQUFkOzt1QkFFVixVQUFBLEdBQVksU0FBQTtBQUNWLFFBQUE7SUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLEdBQUQsQ0FBSyxVQUFMO0FBQ1gsV0FBTyxRQUFBLEtBQVksTUFBWixJQUFzQixRQUFBLEtBQVk7RUFGL0I7Ozs7R0F2QlcsUUFBUSxDQUFDIiwiZmlsZSI6Imxlc3NvblBsYW4vTGVzc29uUGxhbi5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIExlc3NvblBsYW4gZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG4gIHVybDogJ2xlc3NvblBsYW4nXG5cblxuIyBIaWphY2tlZCBzdWNjZXNzKCkgZm9yIGxhdGVyXG4jIGZldGNocyBhbGwgc3VidGVzdHMgZm9yIHRoZSBhc3Nlc3NtZW50XG4gIGZldGNoOiAob3B0aW9ucykgPT5cbiAgICBjb25zb2xlLmxvZyhcIkZldGNoaW5nIExlc3NvblBsYW5zXCIgIClcbiAgICBvbGRTdWNjZXNzID0gb3B0aW9ucy5zdWNjZXNzXG4gICAgb3B0aW9ucy5zdWNjZXNzID0gKG1vZGVsKSA9PlxuICAgICAgYWxsU3VidGVzdHMgPSBuZXcgU3VidGVzdHNcbiAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgIGtleTogXCJzXCIgKyBAaWRcbiAgICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pID0+XG4gICAgICAgICAgQHN1YnRlc3RzID0gY29sbGVjdGlvblxuICAgICAgICAgIEBzdWJ0ZXN0cy5lbnN1cmVPcmRlcigpXG4gICAgICAgICAgb2xkU3VjY2Vzcz8gQFxuXG4gICAgQXNzZXNzbWVudC5fX3N1cGVyX18uZmV0Y2guY2FsbCBALCBvcHRpb25zXG5cbiAgaXNBY3RpdmU6IC0+IHJldHVybiBub3QgQGlzQXJjaGl2ZWQoKVxuXG4gIGlzQXJjaGl2ZWQ6IC0+XG4gICAgYXJjaGl2ZWQgPSBAZ2V0KFwiYXJjaGl2ZWRcIilcbiAgICByZXR1cm4gYXJjaGl2ZWQgPT0gXCJ0cnVlXCIgb3IgYXJjaGl2ZWQgPT0gdHJ1ZVxuIl19
