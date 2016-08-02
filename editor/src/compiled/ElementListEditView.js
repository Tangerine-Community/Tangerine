var ElementListEditView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ElementListEditView = (function(superClass) {
  extend(ElementListEditView, superClass);

  function ElementListEditView() {
    this.deleteElement = bind(this.deleteElement, this);
    this.copyElement = bind(this.copyElement, this);
    this.render = bind(this.render, this);
    return ElementListEditView.__super__.constructor.apply(this, arguments);
  }

  ElementListEditView.prototype.className = "ElementListEditView";

  ElementListEditView.prototype.tagName = "ul";

  ElementListEditView.prototype.initialize = function(options) {
    this.assessment = options.assessment;
    return this.views = [];
  };

  ElementListEditView.prototype.render = function() {
    this.closeViews();
    this.assessment.elements.sort();
    return this.assessment.elements.each((function(_this) {
      return function(element) {
        var oneView;
        oneView = new ElementListElementView({
          "element": element
        });
        _this.views.push(oneView);
        oneView.render();
        oneView.on("element:delete", _this.deleteElement);
        oneView.on("element:copy", _this.copyElement);
        return _this.$el.append(oneView.el);
      };
    })(this));
  };

  ElementListEditView.prototype.copyElement = function(targetAssessmentId, elementId) {
    var elements, targetElementCount;
    Utils.midAlert("Copying...");
    elements = this.views.filter(function(view) {
      return view.selected === true;
    }).map(function(view) {
      return view.model;
    });
    if (elements.length === 0) {
      elements = [this.assessment.elements.get(elementId)];
    }
    targetElementCount = 0;
    return (new Elements).fetch({
      key: "s" + targetAssessmentId,
      success: (function(_this) {
        return function(collection) {
          var doOne, newElementCount;
          targetElementCount = collection.length;
          newElementCount = 0;
          doOne = function() {
            var element;
            if (elements.length) {
              element = elements.shift();
              newElementCount++;
              return element.copyTo({
                assessmentId: targetAssessmentId,
                order: targetElementCount + newElementCount,
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

  ElementListEditView.prototype.deleteElement = function(element) {
    this.assessment.elements.remove(element);
    return element.destroy();
  };

  ElementListEditView.prototype.closeViews = function() {
    var i, len, ref, view;
    ref = this.views;
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      view.close();
    }
    return this.views = [];
  };

  return ElementListEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVsZW1lbnQvRWxlbWVudExpc3RFZGl0Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxtQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7Z0NBRUosU0FBQSxHQUFXOztnQ0FFWCxPQUFBLEdBQVU7O2dDQUVWLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFDVixJQUFDLENBQUEsVUFBRCxHQUFjLE9BQU8sQ0FBQztXQUN0QixJQUFDLENBQUEsS0FBRCxHQUFTO0VBRkM7O2dDQUlaLE1BQUEsR0FBUSxTQUFBO0lBQ04sSUFBQyxDQUFBLFVBQUQsQ0FBQTtJQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBUSxDQUFDLElBQXJCLENBQUE7V0FDQSxJQUFDLENBQUEsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFyQixDQUEwQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsT0FBRDtBQUN4QixZQUFBO1FBQUEsT0FBQSxHQUFjLElBQUEsc0JBQUEsQ0FDWjtVQUFBLFNBQUEsRUFBWSxPQUFaO1NBRFk7UUFFZCxLQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxPQUFaO1FBQ0EsT0FBTyxDQUFDLE1BQVIsQ0FBQTtRQUNBLE9BQU8sQ0FBQyxFQUFSLENBQVcsZ0JBQVgsRUFBNkIsS0FBQyxDQUFBLGFBQTlCO1FBQ0EsT0FBTyxDQUFDLEVBQVIsQ0FBVyxjQUFYLEVBQTJCLEtBQUMsQ0FBQSxXQUE1QjtlQUNBLEtBQUMsQ0FBQSxHQUFHLENBQUMsTUFBTCxDQUFZLE9BQU8sQ0FBQyxFQUFwQjtNQVB3QjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUI7RUFITTs7Z0NBWVIsV0FBQSxHQUFhLFNBQUMsa0JBQUQsRUFBcUIsU0FBckI7QUFDWCxRQUFBO0lBQUEsS0FBSyxDQUFDLFFBQU4sQ0FBZSxZQUFmO0lBQ0EsUUFBQSxHQUFXLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFlLFNBQUMsSUFBRDthQUFVLElBQUksQ0FBQyxRQUFMLEtBQWlCO0lBQTNCLENBQWYsQ0FBZ0QsQ0FBQyxHQUFqRCxDQUFzRCxTQUFDLElBQUQ7YUFBVSxJQUFJLENBQUM7SUFBZixDQUF0RDtJQUVYLElBQUcsUUFBUSxDQUFDLE1BQVQsS0FBbUIsQ0FBdEI7TUFDRSxRQUFBLEdBQVcsQ0FBQyxJQUFDLENBQUEsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFyQixDQUF5QixTQUF6QixDQUFELEVBRGI7O0lBR0Esa0JBQUEsR0FBcUI7V0FDckIsQ0FBQyxJQUFJLFFBQUwsQ0FBYyxDQUFDLEtBQWYsQ0FDRTtNQUFBLEdBQUEsRUFBSyxHQUFBLEdBQU0sa0JBQVg7TUFDQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFVBQUQ7QUFFUCxjQUFBO1VBQUEsa0JBQUEsR0FBcUIsVUFBVSxDQUFDO1VBQ2hDLGVBQUEsR0FBa0I7VUFDbEIsS0FBQSxHQUFRLFNBQUE7QUFDTixnQkFBQTtZQUFBLElBQUcsUUFBUSxDQUFDLE1BQVo7Y0FDRSxPQUFBLEdBQVUsUUFBUSxDQUFDLEtBQVQsQ0FBQTtjQUNWLGVBQUE7cUJBQ0EsT0FBTyxDQUFDLE1BQVIsQ0FDRTtnQkFBQSxZQUFBLEVBQWUsa0JBQWY7Z0JBQ0EsS0FBQSxFQUFPLGtCQUFBLEdBQXFCLGVBRDVCO2dCQUVBLFFBQUEsRUFBVSxTQUFBO3lCQUFHLEtBQUEsQ0FBQTtnQkFBSCxDQUZWO2VBREYsRUFIRjthQUFBLE1BQUE7cUJBUUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFqQixDQUEwQixPQUFBLEdBQVEsa0JBQWxDLEVBQXdELElBQXhELEVBUkY7O1VBRE07aUJBVVIsS0FBQSxDQUFBO1FBZE87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRFQ7S0FERjtFQVJXOztnQ0EwQmIsYUFBQSxHQUFlLFNBQUMsT0FBRDtJQUNiLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBUSxDQUFDLE1BQXJCLENBQTRCLE9BQTVCO1dBQ0EsT0FBTyxDQUFDLE9BQVIsQ0FBQTtFQUZhOztnQ0FJZixVQUFBLEdBQVksU0FBQTtBQUNWLFFBQUE7QUFBQTtBQUFBLFNBQUEscUNBQUE7O01BQ0UsSUFBSSxDQUFDLEtBQUwsQ0FBQTtBQURGO1dBRUEsSUFBQyxDQUFBLEtBQUQsR0FBUztFQUhDOzs7O0dBcERvQixRQUFRLENBQUMiLCJmaWxlIjoiZWxlbWVudC9FbGVtZW50TGlzdEVkaXRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgRWxlbWVudExpc3RFZGl0VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiRWxlbWVudExpc3RFZGl0Vmlld1wiXG5cbiAgdGFnTmFtZSA6IFwidWxcIlxuICBcbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQGFzc2Vzc21lbnQgPSBvcHRpb25zLmFzc2Vzc21lbnRcbiAgICBAdmlld3MgPSBbXVxuXG4gIHJlbmRlcjogPT5cbiAgICBAY2xvc2VWaWV3cygpXG4gICAgQGFzc2Vzc21lbnQuZWxlbWVudHMuc29ydCgpXG4gICAgQGFzc2Vzc21lbnQuZWxlbWVudHMuZWFjaCAoZWxlbWVudCkgPT5cbiAgICAgIG9uZVZpZXcgPSBuZXcgRWxlbWVudExpc3RFbGVtZW50Vmlld1xuICAgICAgICBcImVsZW1lbnRcIiA6IGVsZW1lbnRcbiAgICAgIEB2aWV3cy5wdXNoIG9uZVZpZXdcbiAgICAgIG9uZVZpZXcucmVuZGVyKClcbiAgICAgIG9uZVZpZXcub24gXCJlbGVtZW50OmRlbGV0ZVwiLCBAZGVsZXRlRWxlbWVudFxuICAgICAgb25lVmlldy5vbiBcImVsZW1lbnQ6Y29weVwiLCBAY29weUVsZW1lbnRcbiAgICAgIEAkZWwuYXBwZW5kIG9uZVZpZXcuZWxcblxuICBjb3B5RWxlbWVudDogKHRhcmdldEFzc2Vzc21lbnRJZCwgZWxlbWVudElkKSA9PlxuICAgIFV0aWxzLm1pZEFsZXJ0IFwiQ29weWluZy4uLlwiXG4gICAgZWxlbWVudHMgPSBAdmlld3MuZmlsdGVyKCAodmlldykgLT4gdmlldy5zZWxlY3RlZCA9PSB0cnVlICkubWFwKCAodmlldykgLT4gdmlldy5tb2RlbCApXG5cbiAgICBpZiBlbGVtZW50cy5sZW5ndGggaXMgMFxuICAgICAgZWxlbWVudHMgPSBbQGFzc2Vzc21lbnQuZWxlbWVudHMuZ2V0KGVsZW1lbnRJZCldXG4gICAgXG4gICAgdGFyZ2V0RWxlbWVudENvdW50ID0gMFxuICAgIChuZXcgRWxlbWVudHMpLmZldGNoXG4gICAgICBrZXk6IFwic1wiICsgdGFyZ2V0QXNzZXNzbWVudElkXG4gICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgPT5cblxuICAgICAgICB0YXJnZXRFbGVtZW50Q291bnQgPSBjb2xsZWN0aW9uLmxlbmd0aFxuICAgICAgICBuZXdFbGVtZW50Q291bnQgPSAwXG4gICAgICAgIGRvT25lID0gLT5cbiAgICAgICAgICBpZiBlbGVtZW50cy5sZW5ndGhcbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50cy5zaGlmdCgpXG4gICAgICAgICAgICBuZXdFbGVtZW50Q291bnQrK1xuICAgICAgICAgICAgZWxlbWVudC5jb3B5VG9cbiAgICAgICAgICAgICAgYXNzZXNzbWVudElkIDogdGFyZ2V0QXNzZXNzbWVudElkXG4gICAgICAgICAgICAgIG9yZGVyOiB0YXJnZXRFbGVtZW50Q291bnQgKyBuZXdFbGVtZW50Q291bnRcbiAgICAgICAgICAgICAgY2FsbGJhY2s6IC0+IGRvT25lKClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlKFwiZWRpdC8je3RhcmdldEFzc2Vzc21lbnRJZH1cIiwgdHJ1ZSlcbiAgICAgICAgZG9PbmUoKVxuXG4gIGRlbGV0ZUVsZW1lbnQ6IChlbGVtZW50KSA9PlxuICAgIEBhc3Nlc3NtZW50LmVsZW1lbnRzLnJlbW92ZSBlbGVtZW50XG4gICAgZWxlbWVudC5kZXN0cm95KClcbiAgICBcbiAgY2xvc2VWaWV3czogLT5cbiAgICBmb3IgdmlldyBpbiBAdmlld3NcbiAgICAgIHZpZXcuY2xvc2UoKVxuICAgIEB2aWV3cyA9IFtdXG4iXX0=
