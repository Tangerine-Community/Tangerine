var Subtests,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Subtests = (function(superClass) {
  extend(Subtests, superClass);

  function Subtests() {
    return Subtests.__super__.constructor.apply(this, arguments);
  }

  Subtests.prototype.url = "subtest";

  Subtests.prototype.model = Subtest;

  Subtests.prototype.db = {
    view: "byParentId"
  };

  Subtests.prototype.comparator = function(subtest) {
    if (subtest.has("curriculumId")) {
      return (parseInt(subtest.get("part")) * 100) + parseInt(subtest.get("order"));
    } else {
      return parseInt(subtest.get("order"));
    }
  };

  Subtests.prototype.initialize = function(options) {};

  Subtests.prototype.fetch = function(options) {
    return Subtests.__super__.fetch.call(this, options);
  };

  Subtests.prototype.ensureOrder = function() {
    var i, j, len, model, ordered, ref, results, subtest, test;
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
        subtest = ref[i];
        subtest.set("order", i);
        results.push(subtest.save());
      }
      return results;
    }
  };

  return Subtests;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvU3VidGVzdHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsUUFBQTtFQUFBOzs7QUFBTTs7Ozs7OztxQkFFSixHQUFBLEdBQUs7O3FCQUNMLEtBQUEsR0FBTzs7cUJBQ1AsRUFBQSxHQUNFO0lBQUEsSUFBQSxFQUFNLFlBQU47OztxQkFFRixVQUFBLEdBQVksU0FBQyxPQUFEO0lBQ1IsSUFBRyxPQUFPLENBQUMsR0FBUixDQUFZLGNBQVosQ0FBSDtBQUNFLGFBQU8sQ0FBQyxRQUFBLENBQVMsT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLENBQVQsQ0FBQSxHQUE4QixHQUEvQixDQUFBLEdBQXNDLFFBQUEsQ0FBUyxPQUFPLENBQUMsR0FBUixDQUFZLE9BQVosQ0FBVCxFQUQvQztLQUFBLE1BQUE7QUFHRSxhQUFPLFFBQUEsQ0FBUyxPQUFPLENBQUMsR0FBUixDQUFZLE9BQVosQ0FBVCxFQUhUOztFQURROztxQkFNWixVQUFBLEdBQVksU0FBQyxPQUFELEdBQUE7O3FCQUVaLEtBQUEsR0FBTyxTQUFDLE9BQUQ7V0FDTCxvQ0FBTSxPQUFOO0VBREs7O3FCQUlQLFdBQUEsR0FBYSxTQUFBO0FBQ1gsUUFBQTtJQUFBLElBQUEsR0FBTzs7QUFBQztBQUFBO1dBQUEscUNBQUE7O3FCQUFBLEtBQUssQ0FBQyxHQUFOLENBQVUsT0FBVjtBQUFBOztpQkFBRCxDQUF5QyxDQUFDLElBQTFDLENBQStDLEVBQS9DO0lBQ1AsT0FBQSxHQUFVOztBQUFDO0FBQUE7V0FBQSw2Q0FBQTs7cUJBQUE7QUFBQTs7aUJBQUQsQ0FBMEIsQ0FBQyxJQUEzQixDQUFnQyxFQUFoQztJQUNWLElBQUcsSUFBQSxLQUFRLE9BQVg7QUFDRTtBQUFBO1dBQUEsNkNBQUE7O1FBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaLEVBQXFCLENBQXJCO3FCQUNBLE9BQU8sQ0FBQyxJQUFSLENBQUE7QUFGRjtxQkFERjs7RUFIVzs7OztHQW5CUSxRQUFRLENBQUMiLCJmaWxlIjoic3VidGVzdC9TdWJ0ZXN0cy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFN1YnRlc3RzIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuICBcbiAgdXJsOiBcInN1YnRlc3RcIlxuICBtb2RlbDogU3VidGVzdFxuICBkYjpcbiAgICB2aWV3OiBcImJ5UGFyZW50SWRcIlxuXG4gIGNvbXBhcmF0b3I6IChzdWJ0ZXN0KSAtPlxuICAgICAgaWYgc3VidGVzdC5oYXMoXCJjdXJyaWN1bHVtSWRcIilcbiAgICAgICAgcmV0dXJuIChwYXJzZUludChzdWJ0ZXN0LmdldChcInBhcnRcIikpKjEwMCkgKyBwYXJzZUludChzdWJ0ZXN0LmdldChcIm9yZGVyXCIpKVxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gcGFyc2VJbnQoc3VidGVzdC5nZXQoXCJvcmRlclwiKSlcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICBmZXRjaDogKG9wdGlvbnMpIC0+XG4gICAgc3VwZXIgb3B0aW9uc1xuXG4gICMgY2FsbCB0aGlzIGFmdGVyIHlvdSBsb2FkIHRoZSBjb2xsZWN0aW9uIHlvdSdyZSBnb2luZyB0byBiZSB3b3JraW5nIHdpdGhcbiAgZW5zdXJlT3JkZXI6IC0+XG4gICAgdGVzdCA9IChtb2RlbC5nZXQoXCJvcmRlclwiKSBmb3IgbW9kZWwgaW4gQG1vZGVscykuam9pbihcIlwiKVxuICAgIG9yZGVyZWQgPSAoaSBmb3IgbW9kZWwsaSBpbiBAbW9kZWxzKS5qb2luKFwiXCIpXG4gICAgaWYgdGVzdCAhPSBvcmRlcmVkXG4gICAgICBmb3Igc3VidGVzdCwgaSBpbiBAbW9kZWxzXG4gICAgICAgIHN1YnRlc3Quc2V0IFwib3JkZXJcIiwgaVxuICAgICAgICBzdWJ0ZXN0LnNhdmUoKVxuICBcbiJdfQ==
