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
    this.$el.html("<h1>Lesson Plans</h1>");
    this.closeViews;
    if (this.lessonPlans.length === 0) {
      this.$el.html("<p class='grey'>No Lesson Plans yet. Click <b>new</b> to get started.</p>");
      return this.trigger("rendered");
    }
    this.lessonPlans.each((function(_this) {
      return function(lessonPlan) {
        var view;
        view = new LessonPlanListElementView({
          "lessonPlan": lessonPlan
        });
        view.render();
        _this.$el.append(view.el);
        return _this.views.push(view);
      };
    })(this));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlc3NvblBsYW4vTGVzc29uUGxhbnNMaXN0Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxtQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7O2dDQUVKLFNBQUEsR0FBVzs7Z0NBQ1gsT0FBQSxHQUFTOztnQ0FFVCxVQUFBLEdBQVksU0FBQyxPQUFEO0FBQ1YsUUFBQTtJQUFBLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFDVCxJQUFDLENBQUEsV0FBRCxHQUFlLE9BQU8sQ0FBQztvRUFDWCxDQUFDLEdBQUksT0FBTyxJQUFDLENBQUE7RUFIZjs7Z0NBTVosTUFBQSxHQUFRLFNBQUE7SUFFTixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSx1QkFBVjtJQUNBLElBQUMsQ0FBQTtJQUVELElBQUcsSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUFiLEtBQXVCLENBQTFCO01BQ0UsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsMkVBQVY7QUFDQSxhQUFPLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVCxFQUZUOztJQUdBLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFrQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsVUFBRDtBQUNoQixZQUFBO1FBQUEsSUFBQSxHQUFXLElBQUEseUJBQUEsQ0FDVDtVQUFBLFlBQUEsRUFBZSxVQUFmO1NBRFM7UUFFWCxJQUFJLENBQUMsTUFBTCxDQUFBO1FBQ0EsS0FBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLENBQVksSUFBSSxDQUFDLEVBQWpCO2VBQ0EsS0FBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksSUFBWjtNQUxnQjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEI7V0FPQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUFmTTs7Z0NBaUJSLE9BQUEsR0FBUyxTQUFBO1dBQ1AsSUFBQyxDQUFBLFVBQUQsQ0FBQTtFQURPOztnQ0FHVCxVQUFBLEdBQVksU0FBQTtBQUNWLFFBQUE7QUFBQTtBQUFBO1NBQUEscUNBQUE7O3NEQUNFLElBQUksQ0FBQztBQURQOztFQURVOzs7O0dBL0JvQixRQUFRLENBQUMiLCJmaWxlIjoibGVzc29uUGxhbi9MZXNzb25QbGFuc0xpc3RWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTGVzc29uUGxhbnNMaXN0VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiTGVzc29uUGxhbnNMaXN0Vmlld1wiXG4gIHRhZ05hbWU6IFwidWxcIlxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEB2aWV3cyA9IFtdXG4gICAgQGxlc3NvblBsYW5zID0gb3B0aW9ucy5sZXNzb25QbGFuc1xuICAgIEBsZXNzb25QbGFucy5vbj8gXCJhbGxcIiwgQHJlbmRlclxuXG5cbiAgcmVuZGVyOiA9PlxuIyAgICByZXR1cm4gaWYgQGxlc3NvblBsYW5zLmxlbmd0aCA9PSAwXG4gICAgQCRlbC5odG1sIFwiPGgxPkxlc3NvbiBQbGFuczwvaDE+XCJcbiAgICBAY2xvc2VWaWV3c1xuICAgICMgZXNjYXBlIGlmIG5vIGFzc2Vzc21lbnRzIGluIG5vbi1wdWJsaWMgbGlzdFxuICAgIGlmIEBsZXNzb25QbGFucy5sZW5ndGggPT0gMFxuICAgICAgQCRlbC5odG1sIFwiPHAgY2xhc3M9J2dyZXknPk5vIExlc3NvbiBQbGFucyB5ZXQuIENsaWNrIDxiPm5ldzwvYj4gdG8gZ2V0IHN0YXJ0ZWQuPC9wPlwiXG4gICAgICByZXR1cm4gQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4gICAgQGxlc3NvblBsYW5zLmVhY2ggKGxlc3NvblBsYW4pID0+XG4gICAgICB2aWV3ID0gbmV3IExlc3NvblBsYW5MaXN0RWxlbWVudFZpZXdcbiAgICAgICAgXCJsZXNzb25QbGFuXCIgOiBsZXNzb25QbGFuXG4gICAgICB2aWV3LnJlbmRlcigpXG4gICAgICBAJGVsLmFwcGVuZCB2aWV3LmVsXG4gICAgICBAdmlld3MucHVzaCB2aWV3XG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiAgXG4gIG9uQ2xvc2U6IC0+XG4gICAgQGNsb3NlVmlld3MoKVxuICBcbiAgY2xvc2VWaWV3czogLT5cbiAgICBmb3IgdmlldyBpbiBAdmlld3NcbiAgICAgIHZpZXcuY2xvc2U/KClcbiAgIl19
