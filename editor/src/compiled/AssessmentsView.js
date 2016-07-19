var AssessmentsView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AssessmentsView = (function(superClass) {
  extend(AssessmentsView, superClass);

  function AssessmentsView() {
    this.render = bind(this.render, this);
    return AssessmentsView.__super__.constructor.apply(this, arguments);
  }

  AssessmentsView.prototype.className = "AssessmentsView";

  AssessmentsView.prototype.tagName = "section";

  AssessmentsView.prototype.events = {
    "click .toggle_archived": "toggleArchived"
  };

  AssessmentsView.prototype.toggleArchived = function(event) {
    var $container;
    if (this.archivedIsVisible) {
      this.archivedIsVisible = false;
      $container = this.$el.find(".archived_list").addClass("confirmation");
      return this.$el.find(".toggle_archived").html("Show");
    } else {
      this.archivedIsVisible = true;
      $container = this.$el.find(".archived_list").removeClass("confirmation");
      return this.$el.find(".toggle_archived").html("Hide");
    }
  };

  AssessmentsView.prototype.initialize = function(options) {
    options.assessments.on("add destroy remove update", this.render);
    this.parent = options.parent;
    this.assessments = options.assessments;
    this.subviews = [];
    return this.archivedIsVisible = false;
  };

  AssessmentsView.prototype.render = function(event) {
    var $ul, activeViews, archivedContainer, archivedViews, assessment, assessments, i, j, k, len, len1, len2, newView, showArchived, view;
    this.closeViews();
    assessments = this.assessments.models;
    activeViews = [];
    archivedViews = [];
    for (i = 0, len = assessments.length; i < len; i++) {
      assessment = assessments[i];
      newView = new AssessmentListElementView({
        "model": assessment,
        "showAll": this.showAll
      });
      if (assessment.isArchived()) {
        archivedViews.push(newView);
      } else {
        activeViews.push(newView);
      }
    }
    this.subviews = archivedViews.concat(activeViews);
    if (this.subviews.length === 0) {
      this.$el.html("<p class='grey'>No assessments yet. Click <b>new</b> to get started.</p>");
      return this.trigger("rendered");
    }
    archivedContainer = "<div class='archived_container'> <h2>Archived (" + archivedViews.length + ") <button class='command toggle_archived'>Show</button></h2> <ul class='archived_list assessment_list confirmation'></ul> </div>";
    showArchived = archivedViews.length !== 0;
    this.$el.html("<ul class='active_list assessment_list'></ul> " + (showArchived ? archivedContainer : ""));
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

  AssessmentsView.prototype.closeViews = function() {
    var i, len, ref, view;
    ref = this.subviews;
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      view.close();
    }
    return this.subviews = [];
  };

  AssessmentsView.prototype.onClose = function() {
    return this.closeViews();
  };

  return AssessmentsView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2Vzc21lbnQvQXNzZXNzbWVudHNWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxJQUFBLGVBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs0QkFFSixTQUFBLEdBQVk7OzRCQUNaLE9BQUEsR0FBVTs7NEJBRVYsTUFBQSxHQUNFO0lBQUEsd0JBQUEsRUFBMkIsZ0JBQTNCOzs7NEJBRUYsY0FBQSxHQUFnQixTQUFDLEtBQUQ7QUFFZCxRQUFBO0lBQUEsSUFBRyxJQUFDLENBQUEsaUJBQUo7TUFDRSxJQUFDLENBQUEsaUJBQUQsR0FBcUI7TUFDckIsVUFBQSxHQUFhLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGdCQUFWLENBQTJCLENBQUMsUUFBNUIsQ0FBcUMsY0FBckM7YUFDYixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxrQkFBVixDQUE2QixDQUFDLElBQTlCLENBQW1DLE1BQW5DLEVBSEY7S0FBQSxNQUFBO01BS0UsSUFBQyxDQUFBLGlCQUFELEdBQXFCO01BQ3JCLFVBQUEsR0FBYSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxnQkFBVixDQUEyQixDQUFDLFdBQTVCLENBQXdDLGNBQXhDO2FBQ2IsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsa0JBQVYsQ0FBNkIsQ0FBQyxJQUE5QixDQUFtQyxNQUFuQyxFQVBGOztFQUZjOzs0QkFXaEIsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUVWLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBcEIsQ0FBdUIsMkJBQXZCLEVBQW9ELElBQUMsQ0FBQSxNQUFyRDtJQUVBLElBQUMsQ0FBQSxNQUFELEdBQWUsT0FBTyxDQUFDO0lBQ3ZCLElBQUMsQ0FBQSxXQUFELEdBQWUsT0FBTyxDQUFDO0lBRXZCLElBQUMsQ0FBQSxRQUFELEdBQXFCO1dBQ3JCLElBQUMsQ0FBQSxpQkFBRCxHQUFxQjtFQVJYOzs0QkFXWixNQUFBLEdBQVEsU0FBQyxLQUFEO0FBRU4sUUFBQTtJQUFBLElBQUMsQ0FBQSxVQUFELENBQUE7SUFFQSxXQUFBLEdBQWMsSUFBQyxDQUFBLFdBQVcsQ0FBQztJQUczQixXQUFBLEdBQWdCO0lBQ2hCLGFBQUEsR0FBZ0I7QUFDaEIsU0FBQSw2Q0FBQTs7TUFFRSxPQUFBLEdBQWMsSUFBQSx5QkFBQSxDQUNaO1FBQUEsT0FBQSxFQUFjLFVBQWQ7UUFDQSxTQUFBLEVBQWMsSUFBQyxDQUFBLE9BRGY7T0FEWTtNQUtkLElBQUcsVUFBVSxDQUFDLFVBQVgsQ0FBQSxDQUFIO1FBQ0UsYUFBYSxDQUFDLElBQWQsQ0FBbUIsT0FBbkIsRUFERjtPQUFBLE1BQUE7UUFHRSxXQUFXLENBQUMsSUFBWixDQUFpQixPQUFqQixFQUhGOztBQVBGO0lBWUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxhQUFhLENBQUMsTUFBZCxDQUFxQixXQUFyQjtJQUdaLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLEtBQW9CLENBQXZCO01BQ0UsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsMEVBQVY7QUFDQSxhQUFPLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVCxFQUZUOztJQU9BLGlCQUFBLEdBQW9CLGlEQUFBLEdBRUEsYUFBYSxDQUFDLE1BRmQsR0FFcUI7SUFLekMsWUFBQSxHQUFlLGFBQWEsQ0FBQyxNQUFkLEtBQXdCO0lBRXZDLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGdEQUFBLEdBRVAsQ0FBSyxZQUFILEdBQXFCLGlCQUFyQixHQUE0QyxFQUE5QyxDQUZIO0lBTUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGNBQVY7QUFDTixTQUFBLCtDQUFBOztNQUNFLElBQUksQ0FBQyxNQUFMLENBQUE7TUFDQSxHQUFHLENBQUMsTUFBSixDQUFXLElBQUksQ0FBQyxFQUFoQjtBQUZGO0lBSUEsSUFBRyxZQUFIO01BQ0UsR0FBQSxHQUFNLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGdCQUFWO0FBQ04sV0FBQSxpREFBQTs7UUFDRSxJQUFJLENBQUMsTUFBTCxDQUFBO1FBQ0EsR0FBRyxDQUFDLE1BQUosQ0FBVyxJQUFJLENBQUMsRUFBaEI7QUFGRixPQUZGOztXQU9BLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQTFETTs7NEJBNERSLFVBQUEsR0FBWSxTQUFBO0FBQ1YsUUFBQTtBQUFBO0FBQUEsU0FBQSxxQ0FBQTs7TUFDRSxJQUFJLENBQUMsS0FBTCxDQUFBO0FBREY7V0FFQSxJQUFDLENBQUEsUUFBRCxHQUFZO0VBSEY7OzRCQUtaLE9BQUEsR0FBUyxTQUFBO1dBQ1AsSUFBQyxDQUFBLFVBQUQsQ0FBQTtFQURPOzs7O0dBL0ZtQixRQUFRLENBQUMiLCJmaWxlIjoiYXNzZXNzbWVudC9Bc3Nlc3NtZW50c1ZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIjIERpc3BsYXlzIGEgZ3JvdXAgaGVhZGVyIGFuZCBhIGxpc3Qgb2YgYXNzZXNzbWVudHNcbiMgZXZlbnRzXG4jIHJlLXJlbmRlcnMgb24gQGFzc2Vzc21lbnRzIFwiYWRkIGRlc3Ryb3lcIlxuI1xuY2xhc3MgQXNzZXNzbWVudHNWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiQXNzZXNzbWVudHNWaWV3XCJcbiAgdGFnTmFtZSA6IFwic2VjdGlvblwiXG5cbiAgZXZlbnRzIDpcbiAgICBcImNsaWNrIC50b2dnbGVfYXJjaGl2ZWRcIiA6IFwidG9nZ2xlQXJjaGl2ZWRcIlxuXG4gIHRvZ2dsZUFyY2hpdmVkOiAoZXZlbnQpIC0+XG5cbiAgICBpZiBAYXJjaGl2ZWRJc1Zpc2libGVcbiAgICAgIEBhcmNoaXZlZElzVmlzaWJsZSA9IGZhbHNlXG4gICAgICAkY29udGFpbmVyID0gQCRlbC5maW5kKFwiLmFyY2hpdmVkX2xpc3RcIikuYWRkQ2xhc3MgXCJjb25maXJtYXRpb25cIlxuICAgICAgQCRlbC5maW5kKFwiLnRvZ2dsZV9hcmNoaXZlZFwiKS5odG1sIFwiU2hvd1wiXG4gICAgZWxzZVxuICAgICAgQGFyY2hpdmVkSXNWaXNpYmxlID0gdHJ1ZVxuICAgICAgJGNvbnRhaW5lciA9IEAkZWwuZmluZChcIi5hcmNoaXZlZF9saXN0XCIpLnJlbW92ZUNsYXNzIFwiY29uZmlybWF0aW9uXCJcbiAgICAgIEAkZWwuZmluZChcIi50b2dnbGVfYXJjaGl2ZWRcIikuaHRtbCBcIkhpZGVcIlxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgb3B0aW9ucy5hc3Nlc3NtZW50cy5vbiBcImFkZCBkZXN0cm95IHJlbW92ZSB1cGRhdGVcIiwgQHJlbmRlclxuXG4gICAgQHBhcmVudCAgICAgID0gb3B0aW9ucy5wYXJlbnRcbiAgICBAYXNzZXNzbWVudHMgPSBvcHRpb25zLmFzc2Vzc21lbnRzXG5cbiAgICBAc3Vidmlld3MgICAgICAgICAgPSBbXSAjIHVzZWQgdG8ga2VlcCB0cmFjayBvZiB2aWV3cyB0byBjbG9zZVxuICAgIEBhcmNoaXZlZElzVmlzaWJsZSA9IGZhbHNlICMgdG9nZ2xlZFxuXG5cbiAgcmVuZGVyOiAoZXZlbnQpID0+XG5cbiAgICBAY2xvc2VWaWV3cygpXG5cbiAgICBhc3Nlc3NtZW50cyA9IEBhc3Nlc3NtZW50cy5tb2RlbHNcblxuICAgICMgY3JlYXRlIGFyY2hpdmVkIGFuZCBhY3RpdmUgYXJyYXlzIG9mIDxsaT5cbiAgICBhY3RpdmVWaWV3cyAgID0gW11cbiAgICBhcmNoaXZlZFZpZXdzID0gW11cbiAgICBmb3IgYXNzZXNzbWVudCBpbiBhc3Nlc3NtZW50c1xuXG4gICAgICBuZXdWaWV3ID0gbmV3IEFzc2Vzc21lbnRMaXN0RWxlbWVudFZpZXdcbiAgICAgICAgXCJtb2RlbFwiICAgICA6IGFzc2Vzc21lbnRcbiAgICAgICAgXCJzaG93QWxsXCIgICA6IEBzaG93QWxsXG5cblxuICAgICAgaWYgYXNzZXNzbWVudC5pc0FyY2hpdmVkKClcbiAgICAgICAgYXJjaGl2ZWRWaWV3cy5wdXNoIG5ld1ZpZXdcbiAgICAgIGVsc2VcbiAgICAgICAgYWN0aXZlVmlld3MucHVzaCBuZXdWaWV3XG5cbiAgICBAc3Vidmlld3MgPSBhcmNoaXZlZFZpZXdzLmNvbmNhdCBhY3RpdmVWaWV3c1xuXG4gICAgIyBlc2NhcGUgaWYgbm8gYXNzZXNzbWVudHMgaW4gbm9uLXB1YmxpYyBsaXN0XG4gICAgaWYgQHN1YnZpZXdzLmxlbmd0aCA9PSAwXG4gICAgICBAJGVsLmh0bWwgXCI8cCBjbGFzcz0nZ3JleSc+Tm8gYXNzZXNzbWVudHMgeWV0LiBDbGljayA8Yj5uZXc8L2I+IHRvIGdldCBzdGFydGVkLjwvcD5cIlxuICAgICAgcmV0dXJuIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG5cbiAgICAjIHRlbXBsYXRpbmcgYW5kIGNvbXBvbmVudHNcblxuICAgIGFyY2hpdmVkQ29udGFpbmVyID0gXCJcbiAgICAgIDxkaXYgY2xhc3M9J2FyY2hpdmVkX2NvbnRhaW5lcic+XG4gICAgICAgIDxoMj5BcmNoaXZlZCAoI3thcmNoaXZlZFZpZXdzLmxlbmd0aH0pIDxidXR0b24gY2xhc3M9J2NvbW1hbmQgdG9nZ2xlX2FyY2hpdmVkJz5TaG93PC9idXR0b24+PC9oMj5cbiAgICAgICAgPHVsIGNsYXNzPSdhcmNoaXZlZF9saXN0IGFzc2Vzc21lbnRfbGlzdCBjb25maXJtYXRpb24nPjwvdWw+XG4gICAgICA8L2Rpdj5cbiAgICBcIlxuXG4gICAgc2hvd0FyY2hpdmVkID0gYXJjaGl2ZWRWaWV3cy5sZW5ndGggIT0gMFxuXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8dWwgY2xhc3M9J2FjdGl2ZV9saXN0IGFzc2Vzc21lbnRfbGlzdCc+PC91bD5cbiAgICAgICN7IGlmIHNob3dBcmNoaXZlZCB0aGVuIGFyY2hpdmVkQ29udGFpbmVyIGVsc2UgXCJcIiB9XG4gICAgXCJcblxuICAgICMgZmlsbCBjb250YWluZXJzXG4gICAgJHVsID0gQCRlbC5maW5kKFwiLmFjdGl2ZV9saXN0XCIpXG4gICAgZm9yIHZpZXcgaW4gYWN0aXZlVmlld3NcbiAgICAgIHZpZXcucmVuZGVyKClcbiAgICAgICR1bC5hcHBlbmQgdmlldy5lbFxuXG4gICAgaWYgc2hvd0FyY2hpdmVkXG4gICAgICAkdWwgPSBAJGVsLmZpbmQoXCIuYXJjaGl2ZWRfbGlzdFwiKVxuICAgICAgZm9yIHZpZXcgaW4gYXJjaGl2ZWRWaWV3c1xuICAgICAgICB2aWV3LnJlbmRlcigpXG4gICAgICAgICR1bC5hcHBlbmQgdmlldy5lbFxuXG4gICAgIyBhbGwgZG9uZVxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4gIGNsb3NlVmlld3M6IC0+XG4gICAgZm9yIHZpZXcgaW4gQHN1YnZpZXdzXG4gICAgICB2aWV3LmNsb3NlKClcbiAgICBAc3Vidmlld3MgPSBbXVxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgQGNsb3NlVmlld3MoKSJdfQ==
