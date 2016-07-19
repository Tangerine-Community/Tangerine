var Results,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Results = (function(superClass) {
  extend(Results, superClass);

  function Results() {
    return Results.__super__.constructor.apply(this, arguments);
  }

  Results.prototype.url = "result";

  Results.prototype.model = Result;

  Results.prototype.db = {
    view: "byParentId"
  };

  Results.prototype.comparator = function(model) {
    return model.get('start_time') || 0;
  };

  Results.prototype.fetch = function(options) {
    if (options == null) {
      options = {};
    }
    if (options.include_docs == null) {
      options.include_docs = true;
    }
    return Results.__super__.fetch.call(this, options);
  };

  return Results;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc3VsdC9SZXN1bHRzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLE9BQUE7RUFBQTs7O0FBQU07Ozs7Ozs7b0JBRUosR0FBQSxHQUFNOztvQkFDTixLQUFBLEdBQVE7O29CQUNSLEVBQUEsR0FDRTtJQUFBLElBQUEsRUFBTSxZQUFOOzs7b0JBRUYsVUFBQSxHQUFZLFNBQUMsS0FBRDtXQUNWLEtBQUssQ0FBQyxHQUFOLENBQVUsWUFBVixDQUFBLElBQTJCO0VBRGpCOztvQkFJWixLQUFBLEdBQU8sU0FBQyxPQUFEO0lBQ0wsSUFBb0IsZUFBcEI7TUFBQSxPQUFBLEdBQVUsR0FBVjs7SUFDQSxJQUFtQyw0QkFBbkM7TUFBQSxPQUFPLENBQUMsWUFBUixHQUF1QixLQUF2Qjs7V0FDQSxtQ0FBTSxPQUFOO0VBSEs7Ozs7R0FYYSxRQUFRLENBQUMiLCJmaWxlIjoicmVzdWx0L1Jlc3VsdHMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBSZXN1bHRzIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXG4gIHVybCA6IFwicmVzdWx0XCJcbiAgbW9kZWwgOiBSZXN1bHRcbiAgZGI6XG4gICAgdmlldzogXCJieVBhcmVudElkXCJcblxuICBjb21wYXJhdG9yOiAobW9kZWwpIC0+XG4gICAgbW9kZWwuZ2V0KCdzdGFydF90aW1lJykgfHwgMFxuXG4gICMgQnkgZGVmYXVsdCBpbmNsdWRlIHRoZSBkb2NzXG4gIGZldGNoOiAob3B0aW9ucykgLT5cbiAgICBvcHRpb25zID0ge30gdW5sZXNzIG9wdGlvbnM/XG4gICAgb3B0aW9ucy5pbmNsdWRlX2RvY3MgPSB0cnVlIHVubGVzcyBvcHRpb25zLmluY2x1ZGVfZG9jcz9cbiAgICBzdXBlcihvcHRpb25zKVxuIl19
