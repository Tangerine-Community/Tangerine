var Elements,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Elements = (function(superClass) {
  extend(Elements, superClass);

  function Elements() {
    return Elements.__super__.constructor.apply(this, arguments);
  }

  Elements.prototype.model = Element;

  Elements.prototype.url = "element";

  Elements.prototype.db = {
    view: "byParentId"
  };

  Elements.prototype.comparator = function(model) {
    return parseInt(model.get("order"));
  };

  Elements.prototype.initialize = function(options) {};

  Elements.prototype.fetch = function(options) {
    return Elements.__super__.fetch.call(this, options);
  };

  Elements.prototype.ensureOrder = function() {
    var element, i, j, len, model, ordered, ref, results, test;
    test = ((function() {
      var j, len, ref, results;
      ref = this.models;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        model = ref[j];
        results.push(model.get("order"));
      }
      return results;
    }).call(this)).join("");
    ordered = ((function() {
      var j, len, ref, results;
      ref = this.models;
      results = [];
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        model = ref[i];
        results.push(i);
      }
      return results;
    }).call(this)).join("");
    if (test !== ordered) {
      ref = this.models;
      results = [];
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        element = ref[i];
        element.set("order", i);
        results.push(element.save());
      }
      return results;
    }
  };

  return Elements;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVsZW1lbnQvRWxlbWVudHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsUUFBQTtFQUFBOzs7QUFBTTs7Ozs7OztxQkFFSixLQUFBLEdBQVE7O3FCQUNSLEdBQUEsR0FBTTs7cUJBQ04sRUFBQSxHQUNFO0lBQUEsSUFBQSxFQUFNLFlBQU47OztxQkFFRixVQUFBLEdBQWEsU0FBQyxLQUFEO1dBQ1gsUUFBQSxDQUFTLEtBQUssQ0FBQyxHQUFOLENBQVUsT0FBVixDQUFUO0VBRFc7O3FCQUdiLFVBQUEsR0FBWSxTQUFDLE9BQUQsR0FBQTs7cUJBRVosS0FBQSxHQUFPLFNBQUMsT0FBRDtXQUNMLG9DQUFNLE9BQU47RUFESzs7cUJBSVAsV0FBQSxHQUFhLFNBQUE7QUFDWCxRQUFBO0lBQUEsSUFBQSxHQUFPOztBQUFDO0FBQUE7V0FBQSxxQ0FBQTs7cUJBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxPQUFWO0FBQUE7O2lCQUFELENBQXlDLENBQUMsSUFBMUMsQ0FBK0MsRUFBL0M7SUFDUCxPQUFBLEdBQVU7O0FBQUM7QUFBQTtXQUFBLDZDQUFBOztxQkFBQTtBQUFBOztpQkFBRCxDQUEwQixDQUFDLElBQTNCLENBQWdDLEVBQWhDO0lBQ1YsSUFBRyxJQUFBLEtBQVEsT0FBWDtBQUNFO0FBQUE7V0FBQSw2Q0FBQTs7UUFDRSxPQUFPLENBQUMsR0FBUixDQUFZLE9BQVosRUFBcUIsQ0FBckI7cUJBQ0EsT0FBTyxDQUFDLElBQVIsQ0FBQTtBQUZGO3FCQURGOztFQUhXOzs7O0dBaEJRLFFBQVEsQ0FBQyIsImZpbGUiOiJlbGVtZW50L0VsZW1lbnRzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgRWxlbWVudHMgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cbiAgbW9kZWwgOiBFbGVtZW50XG4gIHVybCA6IFwiZWxlbWVudFwiXG4gIGRiOlxuICAgIHZpZXc6IFwiYnlQYXJlbnRJZFwiXG5cbiAgY29tcGFyYXRvciA6IChtb2RlbCkgLT5cbiAgICBwYXJzZUludChtb2RlbC5nZXQoXCJvcmRlclwiKSlcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICBmZXRjaDogKG9wdGlvbnMpIC0+XG4gICAgc3VwZXIgb3B0aW9uc1xuXG4jIGNhbGwgdGhpcyBhZnRlciB5b3UgbG9hZCB0aGUgY29sbGVjdGlvbiB5b3UncmUgZ29pbmcgdG8gYmUgd29ya2luZyB3aXRoXG4gIGVuc3VyZU9yZGVyOiAtPlxuICAgIHRlc3QgPSAobW9kZWwuZ2V0KFwib3JkZXJcIikgZm9yIG1vZGVsIGluIEBtb2RlbHMpLmpvaW4oXCJcIilcbiAgICBvcmRlcmVkID0gKGkgZm9yIG1vZGVsLGkgaW4gQG1vZGVscykuam9pbihcIlwiKVxuICAgIGlmIHRlc3QgIT0gb3JkZXJlZFxuICAgICAgZm9yIGVsZW1lbnQsIGkgaW4gQG1vZGVsc1xuICAgICAgICBlbGVtZW50LnNldCBcIm9yZGVyXCIsIGlcbiAgICAgICAgZWxlbWVudC5zYXZlKClcbiJdfQ==
