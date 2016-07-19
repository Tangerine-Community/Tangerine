var ProgressMenuView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ProgressMenuView = (function(superClass) {
  extend(ProgressMenuView, superClass);

  function ProgressMenuView() {
    return ProgressMenuView.__super__.constructor.apply(this, arguments);
  }

  ProgressMenuView.prototype.className = "ProgressMenuView";

  ProgressMenuView.prototype.events = {
    'change .student_selector': 'gotoProgressTable'
  };

  ProgressMenuView.prototype.gotoProgressTable = function(event) {
    return Tangerine.router.navigate("report/progress/" + this.$el.find(event.target).find(":selected").attr("data-studentId") + ("/" + this.klass.id), true);
  };

  ProgressMenuView.prototype.initialize = function(options) {
    var allStudents;
    this.parent = options.parent;
    this.klass = this.parent.options.klass;
    this.curricula = this.parent.options.curricula;
    allStudents = new Students;
    return allStudents.fetch({
      success: (function(_this) {
        return function(collection) {
          _this.students = collection.where({
            klassId: _this.klass.id
          });
          _this.ready = true;
          return _this.render();
        };
      })(this)
    });
  };

  ProgressMenuView.prototype.render = function() {
    var html, i, len, ref, student;
    if (this.ready) {
      if (this.students.length === 0) {
        this.$el.html("Please add students to this class.");
        return;
      }
      html = "<select class='student_selector'> <option disabled='disabled' selected='selected'>" + (t('select a student')) + "</option> <option data-studentId='all'>" + (t("all students")) + "</option>";
      ref = this.students;
      for (i = 0, len = ref.length; i < len; i++) {
        student = ref[i];
        html += "<option data-studentId='" + student.id + "'>" + (student.get('name')) + "</option>";
      }
      html += "</select>";
      return this.$el.html(html);
    } else {
      return this.$el.html("<img src='images/loading.gif' class='loading'>");
    }
  };

  return ProgressMenuView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlcG9ydC9Qcm9ncmVzc01lbnVWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGdCQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzZCQUVKLFNBQUEsR0FBWTs7NkJBRVosTUFBQSxHQUNFO0lBQUEsMEJBQUEsRUFBNkIsbUJBQTdCOzs7NkJBRUYsaUJBQUEsR0FBbUIsU0FBQyxLQUFEO1dBQ2pCLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBakIsQ0FBMEIsa0JBQUEsR0FBcUIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsS0FBSyxDQUFDLE1BQWhCLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsV0FBN0IsQ0FBeUMsQ0FBQyxJQUExQyxDQUErQyxnQkFBL0MsQ0FBckIsR0FBd0YsQ0FBQSxHQUFBLEdBQUksSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFYLENBQWxILEVBQW1JLElBQW5JO0VBRGlCOzs2QkFHbkIsVUFBQSxHQUFZLFNBQUMsT0FBRDtBQUVWLFFBQUE7SUFBQSxJQUFDLENBQUEsTUFBRCxHQUFhLE9BQU8sQ0FBQztJQUVyQixJQUFDLENBQUEsS0FBRCxHQUFhLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQzdCLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFFN0IsV0FBQSxHQUFjLElBQUk7V0FDbEIsV0FBVyxDQUFDLEtBQVosQ0FDRTtNQUFBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsVUFBRDtVQUNQLEtBQUMsQ0FBQSxRQUFELEdBQVksVUFBVSxDQUFDLEtBQVgsQ0FDVjtZQUFBLE9BQUEsRUFBVSxLQUFDLENBQUEsS0FBSyxDQUFDLEVBQWpCO1dBRFU7VUFFWixLQUFDLENBQUEsS0FBRCxHQUFTO2lCQUNULEtBQUMsQ0FBQSxNQUFELENBQUE7UUFKTztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVDtLQURGO0VBUlU7OzZCQWVaLE1BQUEsR0FBUSxTQUFBO0FBRU4sUUFBQTtJQUFBLElBQUcsSUFBQyxDQUFBLEtBQUo7TUFHRSxJQUFHLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixLQUFvQixDQUF2QjtRQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLG9DQUFWO0FBQ0EsZUFGRjs7TUFJQSxJQUFBLEdBQU8sb0ZBQUEsR0FFOEMsQ0FBQyxDQUFBLENBQUUsa0JBQUYsQ0FBRCxDQUY5QyxHQUVxRSx5Q0FGckUsR0FHMkIsQ0FBQyxDQUFBLENBQUUsY0FBRixDQUFELENBSDNCLEdBRzhDO0FBR3JEO0FBQUEsV0FBQSxxQ0FBQTs7UUFDRSxJQUFBLElBQVEsMEJBQUEsR0FBMkIsT0FBTyxDQUFDLEVBQW5DLEdBQXNDLElBQXRDLEdBQXlDLENBQUMsT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLENBQUQsQ0FBekMsR0FBOEQ7QUFEeEU7TUFFQSxJQUFBLElBQVE7YUFFUixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxJQUFWLEVBakJGO0tBQUEsTUFBQTthQW1CRSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxnREFBVixFQW5CRjs7RUFGTTs7OztHQXpCcUIsUUFBUSxDQUFDIiwiZmlsZSI6InJlcG9ydC9Qcm9ncmVzc01lbnVWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUHJvZ3Jlc3NNZW51VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiBcIlByb2dyZXNzTWVudVZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICAnY2hhbmdlIC5zdHVkZW50X3NlbGVjdG9yJyA6ICdnb3RvUHJvZ3Jlc3NUYWJsZSdcblxuICBnb3RvUHJvZ3Jlc3NUYWJsZTogKGV2ZW50KSAtPlxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJyZXBvcnQvcHJvZ3Jlc3MvXCIgKyBAJGVsLmZpbmQoZXZlbnQudGFyZ2V0KS5maW5kKFwiOnNlbGVjdGVkXCIpLmF0dHIoXCJkYXRhLXN0dWRlbnRJZFwiKSArIFwiLyN7QGtsYXNzLmlkfVwiLCB0cnVlXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICBAcGFyZW50ICAgID0gb3B0aW9ucy5wYXJlbnRcblxuICAgIEBrbGFzcyAgICAgPSBAcGFyZW50Lm9wdGlvbnMua2xhc3NcbiAgICBAY3VycmljdWxhID0gQHBhcmVudC5vcHRpb25zLmN1cnJpY3VsYVxuXG4gICAgYWxsU3R1ZGVudHMgPSBuZXcgU3R1ZGVudHNcbiAgICBhbGxTdHVkZW50cy5mZXRjaFxuICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pID0+XG4gICAgICAgIEBzdHVkZW50cyA9IGNvbGxlY3Rpb24ud2hlcmUgXG4gICAgICAgICAga2xhc3NJZCA6IEBrbGFzcy5pZFxuICAgICAgICBAcmVhZHkgPSB0cnVlXG4gICAgICAgIEByZW5kZXIoKVxuXG4gIHJlbmRlcjogLT5cblxuICAgIGlmIEByZWFkeVxuXG4gICAgICAjIHF1aWNrIGRhdGEgY2hlY2tcbiAgICAgIGlmIEBzdHVkZW50cy5sZW5ndGggPT0gMFxuICAgICAgICBAJGVsLmh0bWwgXCJQbGVhc2UgYWRkIHN0dWRlbnRzIHRvIHRoaXMgY2xhc3MuXCJcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGh0bWwgPSBcIlxuICAgICAgICA8c2VsZWN0IGNsYXNzPSdzdHVkZW50X3NlbGVjdG9yJz5cbiAgICAgICAgICA8b3B0aW9uIGRpc2FibGVkPSdkaXNhYmxlZCcgc2VsZWN0ZWQ9J3NlbGVjdGVkJz4je3QoJ3NlbGVjdCBhIHN0dWRlbnQnKX08L29wdGlvbj5cbiAgICAgICAgICA8b3B0aW9uIGRhdGEtc3R1ZGVudElkPSdhbGwnPiN7dChcImFsbCBzdHVkZW50c1wiKX08L29wdGlvbj5cbiAgICAgIFwiXG5cbiAgICAgIGZvciBzdHVkZW50IGluIEBzdHVkZW50c1xuICAgICAgICBodG1sICs9IFwiPG9wdGlvbiBkYXRhLXN0dWRlbnRJZD0nI3tzdHVkZW50LmlkfSc+I3tzdHVkZW50LmdldCgnbmFtZScpfTwvb3B0aW9uPlwiXG4gICAgICBodG1sICs9IFwiPC9zZWxlY3Q+XCJcbiAgICAgICAgICBcbiAgICAgIEAkZWwuaHRtbCBodG1sXG4gICAgZWxzZVxuICAgICAgQCRlbC5odG1sIFwiPGltZyBzcmM9J2ltYWdlcy9sb2FkaW5nLmdpZicgY2xhc3M9J2xvYWRpbmcnPlwiXG4iXX0=
