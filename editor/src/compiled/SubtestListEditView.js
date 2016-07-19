var SubtestListEditView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SubtestListEditView = (function(superClass) {
  extend(SubtestListEditView, superClass);

  function SubtestListEditView() {
    this.deleteSubtest = bind(this.deleteSubtest, this);
    this.copySubtest = bind(this.copySubtest, this);
    this.render = bind(this.render, this);
    return SubtestListEditView.__super__.constructor.apply(this, arguments);
  }

  SubtestListEditView.prototype.className = "SubtestListEditView";

  SubtestListEditView.prototype.tagName = "ul";

  SubtestListEditView.prototype.initialize = function(options) {
    this.assessment = options.assessment;
    return this.views = [];
  };

  SubtestListEditView.prototype.render = function() {
    this.closeViews();
    this.assessment.subtests.sort();
    return this.assessment.subtests.each((function(_this) {
      return function(subtest) {
        var oneView;
        oneView = new SubtestListElementView({
          "subtest": subtest
        });
        _this.views.push(oneView);
        oneView.render();
        oneView.on("subtest:delete", _this.deleteSubtest);
        oneView.on("subtest:copy", _this.copySubtest);
        return _this.$el.append(oneView.el);
      };
    })(this));
  };

  SubtestListEditView.prototype.copySubtest = function(targetAssessmentId, subtestId) {
    var subtests, targetSubtestCount;
    Utils.midAlert("Copying...");
    subtests = this.views.filter(function(view) {
      return view.selected === true;
    }).map(function(view) {
      return view.model;
    });
    if (subtests.length === 0) {
      subtests = [this.assessment.subtests.get(subtestId)];
    }
    targetSubtestCount = 0;
    return (new Subtests).fetch({
      key: "s" + targetAssessmentId,
      success: (function(_this) {
        return function(collection) {
          var doOne, newSubtestCount;
          targetSubtestCount = collection.length;
          newSubtestCount = 0;
          doOne = function() {
            var subtest;
            if (subtests.length) {
              subtest = subtests.shift();
              newSubtestCount++;
              return subtest.copyTo({
                assessmentId: targetAssessmentId,
                order: targetSubtestCount + newSubtestCount,
                callback: function() {
                  return doOne();
                }
              });
            } else {
              return Tangerine.router.navigate("edit/" + targetAssessmentId, true);
            }
          };
          return doOne();
        };
      })(this)
    });
  };

  SubtestListEditView.prototype.deleteSubtest = function(subtest) {
    this.assessment.subtests.remove(subtest);
    return subtest.destroy();
  };

  SubtestListEditView.prototype.closeViews = function() {
    var i, len, ref, view;
    ref = this.views;
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      view.close();
    }
    return this.views = [];
  };

  return SubtestListEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvU3VidGVzdExpc3RFZGl0Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxtQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7Z0NBRUosU0FBQSxHQUFXOztnQ0FFWCxPQUFBLEdBQVU7O2dDQUVWLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFDVixJQUFDLENBQUEsVUFBRCxHQUFjLE9BQU8sQ0FBQztXQUN0QixJQUFDLENBQUEsS0FBRCxHQUFTO0VBRkM7O2dDQUlaLE1BQUEsR0FBUSxTQUFBO0lBQ04sSUFBQyxDQUFBLFVBQUQsQ0FBQTtJQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBUSxDQUFDLElBQXJCLENBQUE7V0FDQSxJQUFDLENBQUEsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFyQixDQUEwQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsT0FBRDtBQUN4QixZQUFBO1FBQUEsT0FBQSxHQUFjLElBQUEsc0JBQUEsQ0FDWjtVQUFBLFNBQUEsRUFBWSxPQUFaO1NBRFk7UUFFZCxLQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxPQUFaO1FBQ0EsT0FBTyxDQUFDLE1BQVIsQ0FBQTtRQUNBLE9BQU8sQ0FBQyxFQUFSLENBQVcsZ0JBQVgsRUFBNkIsS0FBQyxDQUFBLGFBQTlCO1FBQ0EsT0FBTyxDQUFDLEVBQVIsQ0FBVyxjQUFYLEVBQTJCLEtBQUMsQ0FBQSxXQUE1QjtlQUNBLEtBQUMsQ0FBQSxHQUFHLENBQUMsTUFBTCxDQUFZLE9BQU8sQ0FBQyxFQUFwQjtNQVB3QjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUI7RUFITTs7Z0NBWVIsV0FBQSxHQUFhLFNBQUMsa0JBQUQsRUFBcUIsU0FBckI7QUFDWCxRQUFBO0lBQUEsS0FBSyxDQUFDLFFBQU4sQ0FBZSxZQUFmO0lBQ0EsUUFBQSxHQUFXLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFlLFNBQUMsSUFBRDthQUFVLElBQUksQ0FBQyxRQUFMLEtBQWlCO0lBQTNCLENBQWYsQ0FBZ0QsQ0FBQyxHQUFqRCxDQUFzRCxTQUFDLElBQUQ7YUFBVSxJQUFJLENBQUM7SUFBZixDQUF0RDtJQUVYLElBQUcsUUFBUSxDQUFDLE1BQVQsS0FBbUIsQ0FBdEI7TUFDRSxRQUFBLEdBQVcsQ0FBQyxJQUFDLENBQUEsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFyQixDQUF5QixTQUF6QixDQUFELEVBRGI7O0lBR0Esa0JBQUEsR0FBcUI7V0FDckIsQ0FBQyxJQUFJLFFBQUwsQ0FBYyxDQUFDLEtBQWYsQ0FDRTtNQUFBLEdBQUEsRUFBSyxHQUFBLEdBQU0sa0JBQVg7TUFDQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFVBQUQ7QUFFUCxjQUFBO1VBQUEsa0JBQUEsR0FBcUIsVUFBVSxDQUFDO1VBQ2hDLGVBQUEsR0FBa0I7VUFDbEIsS0FBQSxHQUFRLFNBQUE7QUFDTixnQkFBQTtZQUFBLElBQUcsUUFBUSxDQUFDLE1BQVo7Y0FDRSxPQUFBLEdBQVUsUUFBUSxDQUFDLEtBQVQsQ0FBQTtjQUNWLGVBQUE7cUJBQ0EsT0FBTyxDQUFDLE1BQVIsQ0FDRTtnQkFBQSxZQUFBLEVBQWUsa0JBQWY7Z0JBQ0EsS0FBQSxFQUFPLGtCQUFBLEdBQXFCLGVBRDVCO2dCQUVBLFFBQUEsRUFBVSxTQUFBO3lCQUFHLEtBQUEsQ0FBQTtnQkFBSCxDQUZWO2VBREYsRUFIRjthQUFBLE1BQUE7cUJBUUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFqQixDQUEwQixPQUFBLEdBQVEsa0JBQWxDLEVBQXdELElBQXhELEVBUkY7O1VBRE07aUJBVVIsS0FBQSxDQUFBO1FBZE87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRFQ7S0FERjtFQVJXOztnQ0EwQmIsYUFBQSxHQUFlLFNBQUMsT0FBRDtJQUNiLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBUSxDQUFDLE1BQXJCLENBQTRCLE9BQTVCO1dBQ0EsT0FBTyxDQUFDLE9BQVIsQ0FBQTtFQUZhOztnQ0FJZixVQUFBLEdBQVksU0FBQTtBQUNWLFFBQUE7QUFBQTtBQUFBLFNBQUEscUNBQUE7O01BQ0UsSUFBSSxDQUFDLEtBQUwsQ0FBQTtBQURGO1dBRUEsSUFBQyxDQUFBLEtBQUQsR0FBUztFQUhDOzs7O0dBcERvQixRQUFRLENBQUMiLCJmaWxlIjoic3VidGVzdC9TdWJ0ZXN0TGlzdEVkaXRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgU3VidGVzdExpc3RFZGl0VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiU3VidGVzdExpc3RFZGl0Vmlld1wiXG5cbiAgdGFnTmFtZSA6IFwidWxcIlxuICBcbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQGFzc2Vzc21lbnQgPSBvcHRpb25zLmFzc2Vzc21lbnRcbiAgICBAdmlld3MgPSBbXVxuXG4gIHJlbmRlcjogPT5cbiAgICBAY2xvc2VWaWV3cygpXG4gICAgQGFzc2Vzc21lbnQuc3VidGVzdHMuc29ydCgpXG4gICAgQGFzc2Vzc21lbnQuc3VidGVzdHMuZWFjaCAoc3VidGVzdCkgPT5cbiAgICAgIG9uZVZpZXcgPSBuZXcgU3VidGVzdExpc3RFbGVtZW50Vmlld1xuICAgICAgICBcInN1YnRlc3RcIiA6IHN1YnRlc3RcbiAgICAgIEB2aWV3cy5wdXNoIG9uZVZpZXdcbiAgICAgIG9uZVZpZXcucmVuZGVyKClcbiAgICAgIG9uZVZpZXcub24gXCJzdWJ0ZXN0OmRlbGV0ZVwiLCBAZGVsZXRlU3VidGVzdFxuICAgICAgb25lVmlldy5vbiBcInN1YnRlc3Q6Y29weVwiLCBAY29weVN1YnRlc3RcbiAgICAgIEAkZWwuYXBwZW5kIG9uZVZpZXcuZWxcblxuICBjb3B5U3VidGVzdDogKHRhcmdldEFzc2Vzc21lbnRJZCwgc3VidGVzdElkKSA9PlxuICAgIFV0aWxzLm1pZEFsZXJ0IFwiQ29weWluZy4uLlwiXG4gICAgc3VidGVzdHMgPSBAdmlld3MuZmlsdGVyKCAodmlldykgLT4gdmlldy5zZWxlY3RlZCA9PSB0cnVlICkubWFwKCAodmlldykgLT4gdmlldy5tb2RlbCApXG5cbiAgICBpZiBzdWJ0ZXN0cy5sZW5ndGggaXMgMCBcbiAgICAgIHN1YnRlc3RzID0gW0Bhc3Nlc3NtZW50LnN1YnRlc3RzLmdldChzdWJ0ZXN0SWQpXVxuICAgIFxuICAgIHRhcmdldFN1YnRlc3RDb3VudCA9IDBcbiAgICAobmV3IFN1YnRlc3RzKS5mZXRjaFxuICAgICAga2V5OiBcInNcIiArIHRhcmdldEFzc2Vzc21lbnRJZFxuICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pID0+XG5cbiAgICAgICAgdGFyZ2V0U3VidGVzdENvdW50ID0gY29sbGVjdGlvbi5sZW5ndGhcbiAgICAgICAgbmV3U3VidGVzdENvdW50ID0gMFxuICAgICAgICBkb09uZSA9IC0+XG4gICAgICAgICAgaWYgc3VidGVzdHMubGVuZ3RoXG4gICAgICAgICAgICBzdWJ0ZXN0ID0gc3VidGVzdHMuc2hpZnQoKVxuICAgICAgICAgICAgbmV3U3VidGVzdENvdW50KytcbiAgICAgICAgICAgIHN1YnRlc3QuY29weVRvIFxuICAgICAgICAgICAgICBhc3Nlc3NtZW50SWQgOiB0YXJnZXRBc3Nlc3NtZW50SWRcbiAgICAgICAgICAgICAgb3JkZXI6IHRhcmdldFN1YnRlc3RDb3VudCArIG5ld1N1YnRlc3RDb3VudFxuICAgICAgICAgICAgICBjYWxsYmFjazogLT4gZG9PbmUoKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUoXCJlZGl0LyN7dGFyZ2V0QXNzZXNzbWVudElkfVwiLCB0cnVlKVxuICAgICAgICBkb09uZSgpXG5cbiAgZGVsZXRlU3VidGVzdDogKHN1YnRlc3QpID0+XG4gICAgQGFzc2Vzc21lbnQuc3VidGVzdHMucmVtb3ZlIHN1YnRlc3RcbiAgICBzdWJ0ZXN0LmRlc3Ryb3koKVxuICAgIFxuICBjbG9zZVZpZXdzOiAtPlxuICAgIGZvciB2aWV3IGluIEB2aWV3c1xuICAgICAgdmlldy5jbG9zZSgpXG4gICAgQHZpZXdzID0gW11cbiJdfQ==
