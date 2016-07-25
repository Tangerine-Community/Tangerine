var LessonPlansListView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LessonPlansListView = (function(superClass) {
  extend(LessonPlansListView, superClass);

  function LessonPlansListView() {
    this.render = bind(this.render, this);
    return LessonPlansListView.__super__.constructor.apply(this, arguments);
  }

  LessonPlansListView.prototype.className = "LessonPlansListView";

  LessonPlansListView.prototype.tagName = "ul";

  LessonPlansListView.prototype.initialize = function(options) {
    var base;
    this.views = [];
    this.lessonPlans = options.lessonPlans;
    return typeof (base = this.lessonPlans).on === "function" ? base.on("all", this.render) : void 0;
  };

  LessonPlansListView.prototype.render = function() {
    var $ul, activeViews, archivedContainer, archivedViews, i, j, k, len, len1, len2, lessonPlan, lessonPlans, newView, showArchived, view;
    this.closeViews();
    lessonPlans = this.lessonPlans.models;
    activeViews = [];
    archivedViews = [];
    for (i = 0, len = lessonPlans.length; i < len; i++) {
      lessonPlan = lessonPlans[i];
      newView = new LessonPlanListElementView({
        "model": lessonPlan,
        "showAll": this.showAll
      });
      if (lessonPlan.isArchived()) {
        archivedViews.push(newView);
      } else {
        activeViews.push(newView);
      }
    }
    this.subviews = archivedViews.concat(activeViews);
    archivedContainer = "<div class='archived_container'> <h2>Archived (" + archivedViews.length + ") <button class='command toggle_archived'>Show</button></h2> <ul class='archived_list assessment_list confirmation'></ul> </div>";
    showArchived = archivedViews.length !== 0;
    this.$el.html("<p>&nbsp;</p></p><h2>Lesson Plans</h2> <ul class='active_list assessment_list'></ul> " + (showArchived ? archivedContainer : ""));
    $ul = this.$el.find(".active_list");
    for (j = 0, len1 = activeViews.length; j < len1; j++) {
      view = activeViews[j];
      view.render();
      $ul.append(view.el);
    }
    if (showArchived) {
      $ul = this.$el.find(".archived_list");
      for (k = 0, len2 = archivedViews.length; k < len2; k++) {
        view = archivedViews[k];
        view.render();
        $ul.append(view.el);
      }
    }
    return this.trigger("rendered");
  };

  LessonPlansListView.prototype.onClose = function() {
    return this.closeViews();
  };

  LessonPlansListView.prototype.closeViews = function() {
    var i, len, ref, results, view;
    ref = this.views;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      results.push(typeof view.close === "function" ? view.close() : void 0);
    }
    return results;
  };

  return LessonPlansListView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlc3NvblBsYW4vTGVzc29uUGxhbnNMaXN0Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxtQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7O2dDQUVKLFNBQUEsR0FBVzs7Z0NBQ1gsT0FBQSxHQUFTOztnQ0FFVCxVQUFBLEdBQVksU0FBQyxPQUFEO0FBQ1YsUUFBQTtJQUFBLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFDVCxJQUFDLENBQUEsV0FBRCxHQUFlLE9BQU8sQ0FBQztvRUFDWCxDQUFDLEdBQUksT0FBTyxJQUFDLENBQUE7RUFIZjs7Z0NBTVosTUFBQSxHQUFRLFNBQUE7QUFrQk4sUUFBQTtJQUFBLElBQUMsQ0FBQSxVQUFELENBQUE7SUFFQSxXQUFBLEdBQWMsSUFBQyxDQUFBLFdBQVcsQ0FBQztJQUczQixXQUFBLEdBQWdCO0lBQ2hCLGFBQUEsR0FBZ0I7QUFDaEIsU0FBQSw2Q0FBQTs7TUFFRSxPQUFBLEdBQWMsSUFBQSx5QkFBQSxDQUNaO1FBQUEsT0FBQSxFQUFjLFVBQWQ7UUFDQSxTQUFBLEVBQWMsSUFBQyxDQUFBLE9BRGY7T0FEWTtNQUtkLElBQUcsVUFBVSxDQUFDLFVBQVgsQ0FBQSxDQUFIO1FBQ0UsYUFBYSxDQUFDLElBQWQsQ0FBbUIsT0FBbkIsRUFERjtPQUFBLE1BQUE7UUFHRSxXQUFXLENBQUMsSUFBWixDQUFpQixPQUFqQixFQUhGOztBQVBGO0lBWUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxhQUFhLENBQUMsTUFBZCxDQUFxQixXQUFyQjtJQVlaLGlCQUFBLEdBQW9CLGlEQUFBLEdBRUUsYUFBYSxDQUFDLE1BRmhCLEdBRXVCO0lBSzNDLFlBQUEsR0FBZSxhQUFhLENBQUMsTUFBZCxLQUF3QjtJQUV2QyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSx1RkFBQSxHQUVMLENBQUssWUFBSCxHQUFxQixpQkFBckIsR0FBNEMsRUFBOUMsQ0FGTDtJQU1BLEdBQUEsR0FBTSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxjQUFWO0FBQ04sU0FBQSwrQ0FBQTs7TUFDRSxJQUFJLENBQUMsTUFBTCxDQUFBO01BQ0EsR0FBRyxDQUFDLE1BQUosQ0FBVyxJQUFJLENBQUMsRUFBaEI7QUFGRjtJQUlBLElBQUcsWUFBSDtNQUNFLEdBQUEsR0FBTSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxnQkFBVjtBQUNOLFdBQUEsaURBQUE7O1FBQ0UsSUFBSSxDQUFDLE1BQUwsQ0FBQTtRQUNBLEdBQUcsQ0FBQyxNQUFKLENBQVcsSUFBSSxDQUFDLEVBQWhCO0FBRkYsT0FGRjs7V0FPQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUE1RU07O2dDQThFUixPQUFBLEdBQVMsU0FBQTtXQUNQLElBQUMsQ0FBQSxVQUFELENBQUE7RUFETzs7Z0NBR1QsVUFBQSxHQUFZLFNBQUE7QUFDVixRQUFBO0FBQUE7QUFBQTtTQUFBLHFDQUFBOztzREFDRSxJQUFJLENBQUM7QUFEUDs7RUFEVTs7OztHQTVGb0IsUUFBUSxDQUFDIiwiZmlsZSI6Imxlc3NvblBsYW4vTGVzc29uUGxhbnNMaXN0Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIExlc3NvblBsYW5zTGlzdFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lOiBcIkxlc3NvblBsYW5zTGlzdFZpZXdcIlxuICB0YWdOYW1lOiBcInVsXCJcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBAdmlld3MgPSBbXVxuICAgIEBsZXNzb25QbGFucyA9IG9wdGlvbnMubGVzc29uUGxhbnNcbiAgICBAbGVzc29uUGxhbnMub24/IFwiYWxsXCIsIEByZW5kZXJcblxuXG4gIHJlbmRlcjogPT5cbiMjICAgIHJldHVybiBpZiBAbGVzc29uUGxhbnMubGVuZ3RoID09IDBcbiMgICAgQCRlbC5odG1sIFwiPGgxPkxlc3NvbiBQbGFuczwvaDE+XCJcbiMgICAgQGNsb3NlVmlld3NcbiMgICAgIyBlc2NhcGUgaWYgbm8gYXNzZXNzbWVudHMgaW4gbm9uLXB1YmxpYyBsaXN0XG4jICAgIGlmIEBsZXNzb25QbGFucy5sZW5ndGggPT0gMFxuIyAgICAgIEAkZWwuaHRtbCBcIjxwIGNsYXNzPSdncmV5Jz5ObyBMZXNzb24gUGxhbnMgeWV0LiBDbGljayA8Yj5uZXc8L2I+IHRvIGdldCBzdGFydGVkLjwvcD5cIlxuIyAgICAgIHJldHVybiBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiMgICAgQGxlc3NvblBsYW5zLmVhY2ggKGxlc3NvblBsYW4pID0+XG4jICAgICAgdmlldyA9IG5ldyBMZXNzb25QbGFuTGlzdEVsZW1lbnRWaWV3XG4jICAgICAgICBcIm1vZGVsXCIgICAgIDogbGVzc29uUGxhblxuIyAgICAgICAgXCJzaG93QWxsXCIgICA6IEBzaG93QWxsXG4jICAgICAgdmlldy5yZW5kZXIoKVxuIyAgICAgIEAkZWwuYXBwZW5kIHZpZXcuZWxcbiMgICAgICBAdmlld3MucHVzaCB2aWV3XG4jXG4jICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4gICAgQGNsb3NlVmlld3MoKVxuXG4gICAgbGVzc29uUGxhbnMgPSBAbGVzc29uUGxhbnMubW9kZWxzXG5cbiAgICAjIGNyZWF0ZSBhcmNoaXZlZCBhbmQgYWN0aXZlIGFycmF5cyBvZiA8bGk+XG4gICAgYWN0aXZlVmlld3MgICA9IFtdXG4gICAgYXJjaGl2ZWRWaWV3cyA9IFtdXG4gICAgZm9yIGxlc3NvblBsYW4gaW4gbGVzc29uUGxhbnNcblxuICAgICAgbmV3VmlldyA9IG5ldyBMZXNzb25QbGFuTGlzdEVsZW1lbnRWaWV3XG4gICAgICAgIFwibW9kZWxcIiAgICAgOiBsZXNzb25QbGFuXG4gICAgICAgIFwic2hvd0FsbFwiICAgOiBAc2hvd0FsbFxuXG5cbiAgICAgIGlmIGxlc3NvblBsYW4uaXNBcmNoaXZlZCgpXG4gICAgICAgIGFyY2hpdmVkVmlld3MucHVzaCBuZXdWaWV3XG4gICAgICBlbHNlXG4gICAgICAgIGFjdGl2ZVZpZXdzLnB1c2ggbmV3Vmlld1xuXG4gICAgQHN1YnZpZXdzID0gYXJjaGl2ZWRWaWV3cy5jb25jYXQgYWN0aXZlVmlld3NcblxuIyAgICBAJGVsLmh0bWwgXCI8aDE+TGVzc29uIFBsYW5zPC9oMT5cIlxuXG4gICAgIyBlc2NhcGUgaWYgbm8gYXNzZXNzbWVudHMgaW4gbm9uLXB1YmxpYyBsaXN0XG4jICAgIGlmIEBzdWJ2aWV3cy5sZW5ndGggPT0gMFxuIyAgICAgIEAkZWwuaHRtbCBcIjxwIGNsYXNzPSdncmV5Jz5ObyBsZXNzb24gcGxhbnMgeWV0LiBDbGljayA8Yj5uZXc8L2I+IHRvIGdldCBzdGFydGVkLjwvcD5cIlxuIyAgICAgIHJldHVybiBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuXG4gICAgIyB0ZW1wbGF0aW5nIGFuZCBjb21wb25lbnRzXG5cbiAgICBhcmNoaXZlZENvbnRhaW5lciA9IFwiXG4gICAgICAgIDxkaXYgY2xhc3M9J2FyY2hpdmVkX2NvbnRhaW5lcic+XG4gICAgICAgICAgPGgyPkFyY2hpdmVkICgje2FyY2hpdmVkVmlld3MubGVuZ3RofSkgPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCB0b2dnbGVfYXJjaGl2ZWQnPlNob3c8L2J1dHRvbj48L2gyPlxuICAgICAgICAgIDx1bCBjbGFzcz0nYXJjaGl2ZWRfbGlzdCBhc3Nlc3NtZW50X2xpc3QgY29uZmlybWF0aW9uJz48L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIFwiXG5cbiAgICBzaG93QXJjaGl2ZWQgPSBhcmNoaXZlZFZpZXdzLmxlbmd0aCAhPSAwXG5cbiAgICBAJGVsLmh0bWwgXCI8cD4mbmJzcDs8L3A+PC9wPjxoMj5MZXNzb24gUGxhbnM8L2gyPlxuICAgICAgICA8dWwgY2xhc3M9J2FjdGl2ZV9saXN0IGFzc2Vzc21lbnRfbGlzdCc+PC91bD5cbiAgICAgICAgI3sgaWYgc2hvd0FyY2hpdmVkIHRoZW4gYXJjaGl2ZWRDb250YWluZXIgZWxzZSBcIlwiIH1cbiAgICAgIFwiXG5cbiAgICAjIGZpbGwgY29udGFpbmVyc1xuICAgICR1bCA9IEAkZWwuZmluZChcIi5hY3RpdmVfbGlzdFwiKVxuICAgIGZvciB2aWV3IGluIGFjdGl2ZVZpZXdzXG4gICAgICB2aWV3LnJlbmRlcigpXG4gICAgICAkdWwuYXBwZW5kIHZpZXcuZWxcblxuICAgIGlmIHNob3dBcmNoaXZlZFxuICAgICAgJHVsID0gQCRlbC5maW5kKFwiLmFyY2hpdmVkX2xpc3RcIilcbiAgICAgIGZvciB2aWV3IGluIGFyY2hpdmVkVmlld3NcbiAgICAgICAgdmlldy5yZW5kZXIoKVxuICAgICAgICAkdWwuYXBwZW5kIHZpZXcuZWxcblxuICAgICMgYWxsIGRvbmVcbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiAgXG4gIG9uQ2xvc2U6IC0+XG4gICAgQGNsb3NlVmlld3MoKVxuICBcbiAgY2xvc2VWaWV3czogLT5cbiAgICBmb3IgdmlldyBpbiBAdmlld3NcbiAgICAgIHZpZXcuY2xvc2U/KClcbiAgIl19
