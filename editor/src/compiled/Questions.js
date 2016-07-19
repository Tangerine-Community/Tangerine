var Questions,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Questions = (function(superClass) {
  extend(Questions, superClass);

  function Questions() {
    return Questions.__super__.constructor.apply(this, arguments);
  }

  Questions.prototype.model = Question;

  Questions.prototype.url = "question";

  Questions.prototype.db = {
    view: "byParentId"
  };

  Questions.prototype.comparator = function(subtest) {
    return subtest.get("order");
  };

  Questions.prototype.ensureOrder = function() {
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

  return Questions;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInF1ZXN0aW9uL1F1ZXN0aW9ucy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxTQUFBO0VBQUE7OztBQUFNOzs7Ozs7O3NCQUVKLEtBQUEsR0FBUTs7c0JBQ1IsR0FBQSxHQUFROztzQkFDUixFQUFBLEdBQ0U7SUFBQSxJQUFBLEVBQU0sWUFBTjs7O3NCQUVGLFVBQUEsR0FBWSxTQUFDLE9BQUQ7V0FDVixPQUFPLENBQUMsR0FBUixDQUFZLE9BQVo7RUFEVTs7c0JBSVosV0FBQSxHQUFhLFNBQUE7QUFDWCxRQUFBO0lBQUEsSUFBQSxHQUFPOztBQUFDO0FBQUE7V0FBQSxxQ0FBQTs7cUJBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxPQUFWO0FBQUE7O2lCQUFELENBQXlDLENBQUMsSUFBMUMsQ0FBK0MsRUFBL0M7SUFDUCxPQUFBLEdBQVU7O0FBQUM7QUFBQTtXQUFBLDZDQUFBOztxQkFBQTtBQUFBOztpQkFBRCxDQUEwQixDQUFDLElBQTNCLENBQWdDLEVBQWhDO0lBQ1YsSUFBRyxJQUFBLEtBQVEsT0FBWDtBQUNFO0FBQUE7V0FBQSw2Q0FBQTs7UUFDRSxPQUFPLENBQUMsR0FBUixDQUFZLE9BQVosRUFBcUIsQ0FBckI7cUJBQ0EsT0FBTyxDQUFDLElBQVIsQ0FBQTtBQUZGO3FCQURGOztFQUhXOzs7O0dBWFMsUUFBUSxDQUFDIiwiZmlsZSI6InF1ZXN0aW9uL1F1ZXN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFF1ZXN0aW9ucyBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuICBtb2RlbCA6IFF1ZXN0aW9uXG4gIHVybCAgIDogXCJxdWVzdGlvblwiXG4gIGRiOlxuICAgIHZpZXc6IFwiYnlQYXJlbnRJZFwiXG5cbiAgY29tcGFyYXRvcjogKHN1YnRlc3QpIC0+XG4gICAgc3VidGVzdC5nZXQgXCJvcmRlclwiXG5cbiAgIyBjYWxsIHRoaXMgYWZ0ZXIgeW91IGxvYWQgdGhlIGNvbGxlY3Rpb24geW91J3JlIGdvaW5nIHRvIGJlIHdvcmtpbmcgd2l0aFxuICBlbnN1cmVPcmRlcjogLT5cbiAgICB0ZXN0ID0gKG1vZGVsLmdldChcIm9yZGVyXCIpIGZvciBtb2RlbCBpbiBAbW9kZWxzKS5qb2luKFwiXCIpXG4gICAgb3JkZXJlZCA9IChpIGZvciBtb2RlbCxpIGluIEBtb2RlbHMpLmpvaW4oXCJcIilcbiAgICBpZiB0ZXN0ICE9IG9yZGVyZWRcbiAgICAgIGZvciBzdWJ0ZXN0LCBpIGluIEBtb2RlbHNcbiAgICAgICAgc3VidGVzdC5zZXQgXCJvcmRlclwiLCBpXG4gICAgICAgIHN1YnRlc3Quc2F2ZSgpXG4iXX0=
