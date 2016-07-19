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

  return LessonPlan;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlc3NvblBsYW4vTGVzc29uUGxhbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxVQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7dUJBRUosR0FBQSxHQUFLOzt1QkFLTCxLQUFBLEdBQU8sU0FBQyxPQUFEO0FBQ0wsUUFBQTtJQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksc0JBQVo7SUFDQSxVQUFBLEdBQWEsT0FBTyxDQUFDO0lBQ3JCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxLQUFEO0FBQ2hCLFlBQUE7UUFBQSxXQUFBLEdBQWMsSUFBSTtlQUNsQixXQUFXLENBQUMsS0FBWixDQUNFO1VBQUEsR0FBQSxFQUFLLEdBQUEsR0FBTSxLQUFDLENBQUEsRUFBWjtVQUNBLE9BQUEsRUFBUyxTQUFDLFVBQUQ7WUFDUCxLQUFDLENBQUEsUUFBRCxHQUFZO1lBQ1osS0FBQyxDQUFBLFFBQVEsQ0FBQyxXQUFWLENBQUE7c0RBQ0EsV0FBWTtVQUhMLENBRFQ7U0FERjtNQUZnQjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7V0FTbEIsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBM0IsQ0FBZ0MsSUFBaEMsRUFBbUMsT0FBbkM7RUFaSzs7OztHQVBnQixRQUFRLENBQUMiLCJmaWxlIjoibGVzc29uUGxhbi9MZXNzb25QbGFuLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTGVzc29uUGxhbiBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cbiAgdXJsOiAnbGVzc29uUGxhbidcblxuXG4jIEhpamFja2VkIHN1Y2Nlc3MoKSBmb3IgbGF0ZXJcbiMgZmV0Y2hzIGFsbCBzdWJ0ZXN0cyBmb3IgdGhlIGFzc2Vzc21lbnRcbiAgZmV0Y2g6IChvcHRpb25zKSA9PlxuICAgIGNvbnNvbGUubG9nKFwiRmV0Y2hpbmcgTGVzc29uUGxhbnNcIiAgKVxuICAgIG9sZFN1Y2Nlc3MgPSBvcHRpb25zLnN1Y2Nlc3NcbiAgICBvcHRpb25zLnN1Y2Nlc3MgPSAobW9kZWwpID0+XG4gICAgICBhbGxTdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgYWxsU3VidGVzdHMuZmV0Y2hcbiAgICAgICAga2V5OiBcInNcIiArIEBpZFxuICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgPT5cbiAgICAgICAgICBAc3VidGVzdHMgPSBjb2xsZWN0aW9uXG4gICAgICAgICAgQHN1YnRlc3RzLmVuc3VyZU9yZGVyKClcbiAgICAgICAgICBvbGRTdWNjZXNzPyBAXG5cbiAgICBBc3Nlc3NtZW50Ll9fc3VwZXJfXy5mZXRjaC5jYWxsIEAsIG9wdGlvbnMiXX0=
