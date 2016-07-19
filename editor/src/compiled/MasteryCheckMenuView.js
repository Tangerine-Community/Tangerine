var MasteryCheckMenuView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MasteryCheckMenuView = (function(superClass) {
  extend(MasteryCheckMenuView, superClass);

  function MasteryCheckMenuView() {
    return MasteryCheckMenuView.__super__.constructor.apply(this, arguments);
  }

  MasteryCheckMenuView.prototype.className = "MasteryCheckMenuView";

  MasteryCheckMenuView.prototype.events = {
    'change .student_selector': 'gotoMasteryCheckReport'
  };

  MasteryCheckMenuView.prototype.gotoMasteryCheckReport = function(event) {
    return Tangerine.router.navigate("report/masteryCheck/" + this.$el.find(event.target).find(":selected").attr("data-studentId"), true);
  };

  MasteryCheckMenuView.prototype.initialize = function(options) {
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

  MasteryCheckMenuView.prototype.render = function() {
    var html, i, len, ref, student;
    if (this.ready) {
      if (this.students.length === 0) {
        this.$el.html("Please add students to this class.");
        return;
      }
      html = "<select class='student_selector'> <option disabled='disabled' selected='selected'>" + (t('select a student')) + "</option>";
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

  return MasteryCheckMenuView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlcG9ydC9NYXN0ZXJ5Q2hlY2tNZW51Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxvQkFBQTtFQUFBOzs7QUFBTTs7Ozs7OztpQ0FFSixTQUFBLEdBQVk7O2lDQUVaLE1BQUEsR0FDRTtJQUFBLDBCQUFBLEVBQTZCLHdCQUE3Qjs7O2lDQUVGLHNCQUFBLEdBQXdCLFNBQUMsS0FBRDtXQUN0QixTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLHNCQUFBLEdBQXlCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLEtBQUssQ0FBQyxNQUFoQixDQUF1QixDQUFDLElBQXhCLENBQTZCLFdBQTdCLENBQXlDLENBQUMsSUFBMUMsQ0FBK0MsZ0JBQS9DLENBQW5ELEVBQXFILElBQXJIO0VBRHNCOztpQ0FHeEIsVUFBQSxHQUFZLFNBQUMsT0FBRDtBQUNWLFFBQUE7SUFBQSxJQUFDLENBQUEsTUFBRCxHQUFhLE9BQU8sQ0FBQztJQUNyQixJQUFDLENBQUEsS0FBRCxHQUFhLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQzdCLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDN0IsV0FBQSxHQUFjLElBQUk7V0FDbEIsV0FBVyxDQUFDLEtBQVosQ0FDRTtNQUFBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsVUFBRDtVQUNQLEtBQUMsQ0FBQSxRQUFELEdBQVksVUFBVSxDQUFDLEtBQVgsQ0FDVjtZQUFBLE9BQUEsRUFBVSxLQUFDLENBQUEsS0FBSyxDQUFDLEVBQWpCO1dBRFU7VUFFWixLQUFDLENBQUEsS0FBRCxHQUFTO2lCQUNULEtBQUMsQ0FBQSxNQUFELENBQUE7UUFKTztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVDtLQURGO0VBTFU7O2lDQVlaLE1BQUEsR0FBUSxTQUFBO0FBRU4sUUFBQTtJQUFBLElBQUcsSUFBQyxDQUFBLEtBQUo7TUFHRSxJQUFHLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixLQUFvQixDQUF2QjtRQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLG9DQUFWO0FBQ0EsZUFGRjs7TUFJQSxJQUFBLEdBQU8sb0ZBQUEsR0FFOEMsQ0FBQyxDQUFBLENBQUUsa0JBQUYsQ0FBRCxDQUY5QyxHQUVxRTtBQUU1RTtBQUFBLFdBQUEscUNBQUE7O1FBQ0UsSUFBQSxJQUFRLDBCQUFBLEdBQTJCLE9BQU8sQ0FBQyxFQUFuQyxHQUFzQyxJQUF0QyxHQUF5QyxDQUFDLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBWixDQUFELENBQXpDLEdBQThEO0FBRHhFO01BRUEsSUFBQSxJQUFRO2FBRVIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsSUFBVixFQWZGO0tBQUEsTUFBQTthQWlCRSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxnREFBVixFQWpCRjs7RUFGTTs7OztHQXRCeUIsUUFBUSxDQUFDIiwiZmlsZSI6InJlcG9ydC9NYXN0ZXJ5Q2hlY2tNZW51Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIE1hc3RlcnlDaGVja01lbnVWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiTWFzdGVyeUNoZWNrTWVudVZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICAnY2hhbmdlIC5zdHVkZW50X3NlbGVjdG9yJyA6ICdnb3RvTWFzdGVyeUNoZWNrUmVwb3J0J1xuXG4gIGdvdG9NYXN0ZXJ5Q2hlY2tSZXBvcnQ6IChldmVudCkgLT5cbiAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwicmVwb3J0L21hc3RlcnlDaGVjay9cIiArIEAkZWwuZmluZChldmVudC50YXJnZXQpLmZpbmQoXCI6c2VsZWN0ZWRcIikuYXR0cihcImRhdGEtc3R1ZGVudElkXCIpLCB0cnVlXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQHBhcmVudCAgICA9IG9wdGlvbnMucGFyZW50XG4gICAgQGtsYXNzICAgICA9IEBwYXJlbnQub3B0aW9ucy5rbGFzc1xuICAgIEBjdXJyaWN1bGEgPSBAcGFyZW50Lm9wdGlvbnMuY3VycmljdWxhXG4gICAgYWxsU3R1ZGVudHMgPSBuZXcgU3R1ZGVudHNcbiAgICBhbGxTdHVkZW50cy5mZXRjaFxuICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pID0+XG4gICAgICAgIEBzdHVkZW50cyA9IGNvbGxlY3Rpb24ud2hlcmUgXG4gICAgICAgICAga2xhc3NJZCA6IEBrbGFzcy5pZFxuICAgICAgICBAcmVhZHkgPSB0cnVlXG4gICAgICAgIEByZW5kZXIoKVxuXG4gIHJlbmRlcjogLT5cblxuICAgIGlmIEByZWFkeVxuXG4gICAgICAjIHF1aWNrIGRhdGEgY2hlY2tcbiAgICAgIGlmIEBzdHVkZW50cy5sZW5ndGggPT0gMFxuICAgICAgICBAJGVsLmh0bWwgXCJQbGVhc2UgYWRkIHN0dWRlbnRzIHRvIHRoaXMgY2xhc3MuXCJcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGh0bWwgPSBcIlxuICAgICAgICA8c2VsZWN0IGNsYXNzPSdzdHVkZW50X3NlbGVjdG9yJz5cbiAgICAgICAgICA8b3B0aW9uIGRpc2FibGVkPSdkaXNhYmxlZCcgc2VsZWN0ZWQ9J3NlbGVjdGVkJz4je3QoJ3NlbGVjdCBhIHN0dWRlbnQnKX08L29wdGlvbj5cbiAgICAgICAgICBcIlxuICAgICAgZm9yIHN0dWRlbnQgaW4gQHN0dWRlbnRzXG4gICAgICAgIGh0bWwgKz0gXCI8b3B0aW9uIGRhdGEtc3R1ZGVudElkPScje3N0dWRlbnQuaWR9Jz4je3N0dWRlbnQuZ2V0KCduYW1lJyl9PC9vcHRpb24+XCJcbiAgICAgIGh0bWwgKz0gXCI8L3NlbGVjdD5cIlxuICAgICAgICAgIFxuICAgICAgQCRlbC5odG1sIGh0bWxcbiAgICBlbHNlXG4gICAgICBAJGVsLmh0bWwgXCI8aW1nIHNyYz0naW1hZ2VzL2xvYWRpbmcuZ2lmJyBjbGFzcz0nbG9hZGluZyc+XCIiXX0=
