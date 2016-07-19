var KlassPartlyView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassPartlyView = (function(superClass) {
  extend(KlassPartlyView, superClass);

  function KlassPartlyView() {
    return KlassPartlyView.__super__.constructor.apply(this, arguments);
  }

  KlassPartlyView.prototype.className = "KlassPartlyView";

  KlassPartlyView.prototype.events = {
    "click .next_part": "nextPart",
    "click .prev_part": "prevPart",
    "click .back": "back",
    "click .student_subtest": "gotoStudentSubtest",
    "keyup #current_part": "gotoAssessment",
    "keyup #search_student_name": "filterStudents",
    "focus #search_student_name": "scrollToName"
  };

  KlassPartlyView.prototype.scrollToName = function() {
    return this.$el.find("#search_student_name").scrollTo();
  };

  KlassPartlyView.prototype.filterStudents = function() {
    var val;
    val = this.$el.find("#search_student_name").val();
    this.search = val;
    return this.updateGridPage();
  };

  KlassPartlyView.prototype.gotoAssessment = function() {
    var val;
    val = this.$el.find("#current_part").val();
    if (val === "") {
      return;
    }
    this.currentPart = parseInt(val);
    return this.updateGridPage();
  };

  KlassPartlyView.prototype.update = function() {
    this.render();
    return Tangerine.router.navigate("class/" + this.klass.id + "/" + this.currentPart);
  };

  KlassPartlyView.prototype.back = function() {
    return Tangerine.router.navigate("class", true);
  };

  KlassPartlyView.prototype.gotoStudentSubtest = function(event) {
    var studentId, subtestId;
    studentId = $(event.target).attr("data-studentId");
    subtestId = $(event.target).attr("data-subtestId");
    return Tangerine.router.navigate("class/result/student/subtest/" + studentId + "/" + subtestId, true);
  };

  KlassPartlyView.prototype.nextPart = function() {
    if (this.currentPart < this.lastPart) {
      this.currentPart++;
      return this.update();
    }
  };

  KlassPartlyView.prototype.prevPart = function() {
    if (this.currentPart > 1) {
      this.currentPart--;
      return this.update();
    }
  };

  KlassPartlyView.prototype.initialize = function(options) {
    this.klass = options.klass;
    this.students = options.students;
    this.results = options.results;
    this.search = "";
    this.currentPart = options.part || 1;
    this.subtestsByPart = [];
    this.subtestsByPart = options.subtests.indexBy("part");
    return this.lastPart = Math.max.apply(this, _.compact(options.subtests.pluck("part"))) || 1;
  };

  KlassPartlyView.prototype.updateGridPage = function() {
    return this.$el.find("#grid_container").html(this.getGridPage());
  };

  KlassPartlyView.prototype.getGridPage = function() {
    var background, cell, column, gridPage, i, j, k, l, len, len1, len2, len3, len4, m, n, o, p, partTest, q, recency, ref, resultsForThisStudent, row, search, student, studentResult, subtest, subtestsThisPart, table, taken, takenClass;
    table = [];
    subtestsThisPart = this.subtestsByPart[this.currentPart];
    if (subtestsThisPart == null) {
      return "No subtests for this assessment.";
    }
    ref = this.students.models;
    for (i = l = 0, len = ref.length; l < len; i = ++l) {
      student = ref[i];
      table[i] = [];
      resultsForThisStudent = new KlassResults(this.results.where({
        "studentId": student.id
      }));
      for (j = m = 0, len1 = subtestsThisPart.length; m < len1; j = ++m) {
        subtest = subtestsThisPart[j];
        studentResult = resultsForThisStudent.where({
          "subtestId": subtest.id
        });
        taken = studentResult.length !== 0;
        if (~student.get("name").toLowerCase().indexOf(this.search.toLowerCase()) || this.search === "") {
          for (k = n = 6; n >= 0; k = --n) {
            partTest = this.currentPart - k;
            search = resultsForThisStudent.where({
              "part": partTest,
              "itemType": subtest.get("itemType")
            });
            if (search.length) {
              recency = k;
            }
          }
          background = recency <= 2 ? "" : recency <= 4 ? "rgb(229, 208, 149)" : "rgb(222, 156, 117)";
          table[i].push({
            "content": taken ? "&#x2714;" : "?",
            "taken": taken,
            "studentId": student.id,
            "studentName": student.get("name"),
            "subtestId": subtest.id,
            "background": background
          });
        }
      }
    }
    gridPage = "<table class='info_box_wide'><tbody><tr><th></th>";
    for (o = 0, len2 = subtestsThisPart.length; o < len2; o++) {
      subtest = subtestsThisPart[o];
      gridPage += "<th><div class='part_subtest_report' data-id='" + subtest.id + "'>" + (subtest.get('name')) + "</div></th>";
    }
    gridPage += "</tr>";
    for (p = 0, len3 = table.length; p < len3; p++) {
      row = table[p];
      if ((row != null) && row.length) {
        gridPage += "<tr><td><div class='student' data-studentId='" + row[0].studentId + "'>" + row[0].studentName + "</div></td>";
        for (column = q = 0, len4 = row.length; q < len4; column = ++q) {
          cell = row[column];
          takenClass = cell.taken ? " subtest_taken" : "";
          gridPage += "<td><div class='student_subtest command " + takenClass + "' data-taken='" + cell.taken + "' data-studentId='" + cell.studentId + "' data-subtestId='" + cell.subtestId + "' style='background-color:" + cell.background + " !important;'>" + cell.content + "</div></td>";
        }
        gridPage += "</tr>";
      }
    }
    gridPage += "</tbody></table>";
    if (_.flatten(table).length === 0) {
      gridPage = "<p class='grey'>No students found.</p>";
    }
    return gridPage;
  };

  KlassPartlyView.prototype.render = function() {
    var gridPage;
    gridPage = this.getGridPage();
    this.$el.html("<h1>" + (t('assessment status')) + "</h1> <input id='search_student_name' style='width: 92% !important' placeholder='" + (t('search student name')) + "' type='text'> <div id='grid_container'>" + gridPage + "</div><br> <h2>" + (t('current assessment')) + " </h2> <button class='prev_part command'>&lt;</button> <input type='number' value='" + this.currentPart + "' id='current_part'> <button class='next_part command'>&gt;</button><br><br> <button class='back navigation'>" + (t('back')) + "</button>");
    return this.trigger("rendered");
  };

  return KlassPartlyView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtsYXNzL0tsYXNzUGFydGx5Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxlQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzRCQUVKLFNBQUEsR0FBWTs7NEJBRVosTUFBQSxHQUNFO0lBQUEsa0JBQUEsRUFBb0MsVUFBcEM7SUFDQSxrQkFBQSxFQUFvQyxVQURwQztJQUVBLGFBQUEsRUFBb0MsTUFGcEM7SUFHQSx3QkFBQSxFQUFvQyxvQkFIcEM7SUFJQSxxQkFBQSxFQUFvQyxnQkFKcEM7SUFLQSw0QkFBQSxFQUFvQyxnQkFMcEM7SUFNQSw0QkFBQSxFQUFvQyxjQU5wQzs7OzRCQVFGLFlBQUEsR0FBYyxTQUFBO1dBQ1osSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsc0JBQVYsQ0FBaUMsQ0FBQyxRQUFsQyxDQUFBO0VBRFk7OzRCQUdkLGNBQUEsR0FBZ0IsU0FBQTtBQUNkLFFBQUE7SUFBQSxHQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsc0JBQVYsQ0FBaUMsQ0FBQyxHQUFsQyxDQUFBO0lBQ04sSUFBQyxDQUFBLE1BQUQsR0FBVTtXQUNWLElBQUMsQ0FBQSxjQUFELENBQUE7RUFIYzs7NEJBS2hCLGNBQUEsR0FBZ0IsU0FBQTtBQUNkLFFBQUE7SUFBQSxHQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsZUFBVixDQUEwQixDQUFDLEdBQTNCLENBQUE7SUFDTixJQUFHLEdBQUEsS0FBTyxFQUFWO0FBQWtCLGFBQWxCOztJQUNBLElBQUMsQ0FBQSxXQUFELEdBQWUsUUFBQSxDQUFTLEdBQVQ7V0FDZixJQUFDLENBQUEsY0FBRCxDQUFBO0VBSmM7OzRCQU1oQixNQUFBLEdBQVEsU0FBQTtJQUNOLElBQUMsQ0FBQSxNQUFELENBQUE7V0FDQSxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLFFBQUEsR0FBUyxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQWhCLEdBQW1CLEdBQW5CLEdBQXNCLElBQUMsQ0FBQSxXQUFqRDtFQUZNOzs0QkFJUixJQUFBLEdBQU0sU0FBQTtXQUNKLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBakIsQ0FBMEIsT0FBMUIsRUFBbUMsSUFBbkM7RUFESTs7NEJBR04sa0JBQUEsR0FBb0IsU0FBQyxLQUFEO0FBQ2xCLFFBQUE7SUFBQSxTQUFBLEdBQVksQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxJQUFoQixDQUFxQixnQkFBckI7SUFDWixTQUFBLEdBQVksQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxJQUFoQixDQUFxQixnQkFBckI7V0FDWixTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLCtCQUFBLEdBQWdDLFNBQWhDLEdBQTBDLEdBQTFDLEdBQTZDLFNBQXZFLEVBQW9GLElBQXBGO0VBSGtCOzs0QkFLcEIsUUFBQSxHQUFVLFNBQUE7SUFDUixJQUFHLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLFFBQW5CO01BQ0UsSUFBQyxDQUFBLFdBQUQ7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBRkY7O0VBRFE7OzRCQUtWLFFBQUEsR0FBVSxTQUFBO0lBQ1IsSUFBRyxJQUFDLENBQUEsV0FBRCxHQUFlLENBQWxCO01BQ0UsSUFBQyxDQUFBLFdBQUQ7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBRkY7O0VBRFE7OzRCQUtWLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFFVixJQUFDLENBQUEsS0FBRCxHQUFTLE9BQU8sQ0FBQztJQUNqQixJQUFDLENBQUEsUUFBRCxHQUFZLE9BQU8sQ0FBQztJQUNwQixJQUFDLENBQUEsT0FBRCxHQUFXLE9BQU8sQ0FBQztJQUduQixJQUFDLENBQUEsTUFBRCxHQUFVO0lBQ1YsSUFBQyxDQUFBLFdBQUQsR0FBZSxPQUFPLENBQUMsSUFBUixJQUFnQjtJQUMvQixJQUFDLENBQUEsY0FBRCxHQUFrQjtJQUVsQixJQUFDLENBQUEsY0FBRCxHQUFrQixPQUFPLENBQUMsUUFBUSxDQUFDLE9BQWpCLENBQXlCLE1BQXpCO1dBRWxCLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFULENBQWUsSUFBZixFQUFrQixDQUFDLENBQUMsT0FBRixDQUFVLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBakIsQ0FBdUIsTUFBdkIsQ0FBVixDQUFsQixDQUFBLElBQWdFO0VBYmxFOzs0QkFlWixjQUFBLEdBQWUsU0FBQTtXQUNiLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlCQUFWLENBQTRCLENBQUMsSUFBN0IsQ0FBa0MsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFsQztFQURhOzs0QkFHZixXQUFBLEdBQWEsU0FBQTtBQUNYLFFBQUE7SUFBQSxLQUFBLEdBQVE7SUFDUixnQkFBQSxHQUFtQixJQUFDLENBQUEsY0FBZSxDQUFBLElBQUMsQ0FBQSxXQUFEO0lBQ25DLElBQWlELHdCQUFqRDtBQUFBLGFBQU8sbUNBQVA7O0FBRUE7QUFBQSxTQUFBLDZDQUFBOztNQUNFLEtBQU0sQ0FBQSxDQUFBLENBQU4sR0FBVztNQUVYLHFCQUFBLEdBQTRCLElBQUEsWUFBQSxDQUFhLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBVCxDQUFlO1FBQUEsV0FBQSxFQUFjLE9BQU8sQ0FBQyxFQUF0QjtPQUFmLENBQWI7QUFFNUIsV0FBQSw0REFBQTs7UUFDRSxhQUFBLEdBQWdCLHFCQUFxQixDQUFDLEtBQXRCLENBQTRCO1VBQUEsV0FBQSxFQUFjLE9BQU8sQ0FBQyxFQUF0QjtTQUE1QjtRQUNoQixLQUFBLEdBQVEsYUFBYSxDQUFDLE1BQWQsS0FBd0I7UUFDaEMsSUFBRyxDQUFDLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBWixDQUFtQixDQUFDLFdBQXBCLENBQUEsQ0FBaUMsQ0FBQyxPQUFsQyxDQUEwQyxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsQ0FBQSxDQUExQyxDQUFELElBQXFFLElBQUMsQ0FBQSxNQUFELEtBQVcsRUFBbkY7QUFHRSxlQUFTLDBCQUFUO1lBQ0UsUUFBQSxHQUFXLElBQUMsQ0FBQSxXQUFELEdBQWU7WUFDMUIsTUFBQSxHQUFTLHFCQUFxQixDQUFDLEtBQXRCLENBQTRCO2NBQUEsTUFBQSxFQUFTLFFBQVQ7Y0FBbUIsVUFBQSxFQUFhLE9BQU8sQ0FBQyxHQUFSLENBQVksVUFBWixDQUFoQzthQUE1QjtZQUNULElBQWUsTUFBTSxDQUFDLE1BQXRCO2NBQUEsT0FBQSxHQUFVLEVBQVY7O0FBSEY7VUFLQSxVQUFBLEdBQ0ssT0FBQSxJQUFXLENBQWQsR0FDRSxFQURGLEdBRVEsT0FBQSxJQUFXLENBQWQsR0FDSCxvQkFERyxHQUdIO1VBRUosS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQVQsQ0FDRTtZQUFBLFNBQUEsRUFBaUIsS0FBSCxHQUFjLFVBQWQsR0FBOEIsR0FBNUM7WUFDQSxPQUFBLEVBQWMsS0FEZDtZQUVBLFdBQUEsRUFBYyxPQUFPLENBQUMsRUFGdEI7WUFHQSxhQUFBLEVBQWdCLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBWixDQUhoQjtZQUlBLFdBQUEsRUFBYyxPQUFPLENBQUMsRUFKdEI7WUFLQSxZQUFBLEVBQWUsVUFMZjtXQURGLEVBaEJGOztBQUhGO0FBTEY7SUFrQ0EsUUFBQSxHQUFXO0FBQ1gsU0FBQSxvREFBQTs7TUFDRSxRQUFBLElBQVksZ0RBQUEsR0FBaUQsT0FBTyxDQUFDLEVBQXpELEdBQTRELElBQTVELEdBQStELENBQUMsT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLENBQUQsQ0FBL0QsR0FBb0Y7QUFEbEc7SUFFQSxRQUFBLElBQVk7QUFDWixTQUFBLHlDQUFBOztNQUNFLElBQUcsYUFBQSxJQUFRLEdBQUcsQ0FBQyxNQUFmO1FBQ0UsUUFBQSxJQUFZLCtDQUFBLEdBQWdELEdBQUksQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUF2RCxHQUFpRSxJQUFqRSxHQUFxRSxHQUFJLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBNUUsR0FBd0Y7QUFDcEcsYUFBQSx5REFBQTs7VUFDRSxVQUFBLEdBQWdCLElBQUksQ0FBQyxLQUFSLEdBQW1CLGdCQUFuQixHQUF5QztVQUN0RCxRQUFBLElBQVksMENBQUEsR0FBMkMsVUFBM0MsR0FBc0QsZ0JBQXRELEdBQXNFLElBQUksQ0FBQyxLQUEzRSxHQUFpRixvQkFBakYsR0FBcUcsSUFBSSxDQUFDLFNBQTFHLEdBQW9ILG9CQUFwSCxHQUF3SSxJQUFJLENBQUMsU0FBN0ksR0FBdUosNEJBQXZKLEdBQW1MLElBQUksQ0FBQyxVQUF4TCxHQUFtTSxnQkFBbk0sR0FBbU4sSUFBSSxDQUFDLE9BQXhOLEdBQWdPO0FBRjlPO1FBR0EsUUFBQSxJQUFZLFFBTGQ7O0FBREY7SUFPQSxRQUFBLElBQVk7SUFFWixJQUFHLENBQUMsQ0FBQyxPQUFGLENBQVUsS0FBVixDQUFnQixDQUFDLE1BQWpCLEtBQTJCLENBQTlCO01BQ0UsUUFBQSxHQUFXLHlDQURiOztBQUdBLFdBQU87RUF2REk7OzRCQTBEYixNQUFBLEdBQVEsU0FBQTtBQUVOLFFBQUE7SUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLFdBQUQsQ0FBQTtJQUVYLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLE1BQUEsR0FDSCxDQUFDLENBQUEsQ0FBRSxtQkFBRixDQUFELENBREcsR0FDcUIsbUZBRHJCLEdBRW9FLENBQUMsQ0FBQSxDQUFFLHFCQUFGLENBQUQsQ0FGcEUsR0FFOEYsMENBRjlGLEdBSW1CLFFBSm5CLEdBSTRCLGlCQUo1QixHQUtILENBQUMsQ0FBQSxDQUFFLG9CQUFGLENBQUQsQ0FMRyxHQUtzQixxRkFMdEIsR0FPc0UsSUFBQyxDQUFBLFdBUHZFLEdBT21GLCtHQVBuRixHQVF5QixDQUFDLENBQUEsQ0FBRSxNQUFGLENBQUQsQ0FSekIsR0FRb0MsV0FSOUM7V0FXQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUFmTTs7OztHQTdIb0IsUUFBUSxDQUFDIiwiZmlsZSI6ImtsYXNzL0tsYXNzUGFydGx5Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEtsYXNzUGFydGx5VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiBcIktsYXNzUGFydGx5Vmlld1wiXG5cbiAgZXZlbnRzOlxuICAgIFwiY2xpY2sgLm5leHRfcGFydFwiICAgICAgICAgICAgICAgIDogXCJuZXh0UGFydFwiXG4gICAgXCJjbGljayAucHJldl9wYXJ0XCIgICAgICAgICAgICAgICAgOiBcInByZXZQYXJ0XCJcbiAgICBcImNsaWNrIC5iYWNrXCIgICAgICAgICAgICAgICAgICAgICA6IFwiYmFja1wiXG4gICAgXCJjbGljayAuc3R1ZGVudF9zdWJ0ZXN0XCIgICAgICAgICAgOiBcImdvdG9TdHVkZW50U3VidGVzdFwiXG4gICAgXCJrZXl1cCAjY3VycmVudF9wYXJ0XCIgICAgICAgICAgICAgOiBcImdvdG9Bc3Nlc3NtZW50XCJcbiAgICBcImtleXVwICNzZWFyY2hfc3R1ZGVudF9uYW1lXCIgICAgICA6IFwiZmlsdGVyU3R1ZGVudHNcIlxuICAgIFwiZm9jdXMgI3NlYXJjaF9zdHVkZW50X25hbWVcIiAgICAgIDogXCJzY3JvbGxUb05hbWVcIlxuXG4gIHNjcm9sbFRvTmFtZTogLT5cbiAgICBAJGVsLmZpbmQoXCIjc2VhcmNoX3N0dWRlbnRfbmFtZVwiKS5zY3JvbGxUbygpXG5cbiAgZmlsdGVyU3R1ZGVudHM6IC0+XG4gICAgdmFsID0gQCRlbC5maW5kKFwiI3NlYXJjaF9zdHVkZW50X25hbWVcIikudmFsKClcbiAgICBAc2VhcmNoID0gdmFsXG4gICAgQHVwZGF0ZUdyaWRQYWdlKClcblxuICBnb3RvQXNzZXNzbWVudDogLT5cbiAgICB2YWwgPSBAJGVsLmZpbmQoXCIjY3VycmVudF9wYXJ0XCIpLnZhbCgpXG4gICAgaWYgdmFsID09IFwiXCIgdGhlbiByZXR1cm5cbiAgICBAY3VycmVudFBhcnQgPSBwYXJzZUludCh2YWwpXG4gICAgQHVwZGF0ZUdyaWRQYWdlKClcblxuICB1cGRhdGU6IC0+XG4gICAgQHJlbmRlcigpXG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImNsYXNzLyN7QGtsYXNzLmlkfS8je0BjdXJyZW50UGFydH1cIlxuXG4gIGJhY2s6IC0+XG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImNsYXNzXCIsIHRydWVcblxuICBnb3RvU3R1ZGVudFN1YnRlc3Q6IChldmVudCkgLT5cbiAgICBzdHVkZW50SWQgPSAkKGV2ZW50LnRhcmdldCkuYXR0cihcImRhdGEtc3R1ZGVudElkXCIpXG4gICAgc3VidGVzdElkID0gJChldmVudC50YXJnZXQpLmF0dHIoXCJkYXRhLXN1YnRlc3RJZFwiKVxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJjbGFzcy9yZXN1bHQvc3R1ZGVudC9zdWJ0ZXN0LyN7c3R1ZGVudElkfS8je3N1YnRlc3RJZH1cIiwgdHJ1ZVxuXG4gIG5leHRQYXJ0OiAtPlxuICAgIGlmIEBjdXJyZW50UGFydCA8IEBsYXN0UGFydFxuICAgICAgQGN1cnJlbnRQYXJ0KytcbiAgICAgIEB1cGRhdGUoKVxuXG4gIHByZXZQYXJ0OiAtPiBcbiAgICBpZiBAY3VycmVudFBhcnQgPiAxXG4gICAgICBAY3VycmVudFBhcnQtLSBcbiAgICAgIEB1cGRhdGUoKVxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQGtsYXNzID0gb3B0aW9ucy5rbGFzc1xuICAgIEBzdHVkZW50cyA9IG9wdGlvbnMuc3R1ZGVudHNcbiAgICBAcmVzdWx0cyA9IG9wdGlvbnMucmVzdWx0c1xuXG5cbiAgICBAc2VhcmNoID0gXCJcIlxuICAgIEBjdXJyZW50UGFydCA9IG9wdGlvbnMucGFydCB8fCAxXG4gICAgQHN1YnRlc3RzQnlQYXJ0ID0gW11cblxuICAgIEBzdWJ0ZXN0c0J5UGFydCA9IG9wdGlvbnMuc3VidGVzdHMuaW5kZXhCeSBcInBhcnRcIlxuXG4gICAgQGxhc3RQYXJ0ID0gTWF0aC5tYXguYXBwbHkoQCwgXy5jb21wYWN0KG9wdGlvbnMuc3VidGVzdHMucGx1Y2soXCJwYXJ0XCIpKSkgfHwgMVxuXG4gIHVwZGF0ZUdyaWRQYWdlOi0+XG4gICAgQCRlbC5maW5kKFwiI2dyaWRfY29udGFpbmVyXCIpLmh0bWwgQGdldEdyaWRQYWdlKClcblxuICBnZXRHcmlkUGFnZTogLT5cbiAgICB0YWJsZSA9IFtdXG4gICAgc3VidGVzdHNUaGlzUGFydCA9IEBzdWJ0ZXN0c0J5UGFydFtAY3VycmVudFBhcnRdXG4gICAgcmV0dXJuIFwiTm8gc3VidGVzdHMgZm9yIHRoaXMgYXNzZXNzbWVudC5cIiBpZiBub3Qgc3VidGVzdHNUaGlzUGFydD9cblxuICAgIGZvciBzdHVkZW50LCBpIGluIEBzdHVkZW50cy5tb2RlbHNcbiAgICAgIHRhYmxlW2ldID0gW11cblxuICAgICAgcmVzdWx0c0ZvclRoaXNTdHVkZW50ID0gbmV3IEtsYXNzUmVzdWx0cyBAcmVzdWx0cy53aGVyZSBcInN0dWRlbnRJZFwiIDogc3R1ZGVudC5pZFxuXG4gICAgICBmb3Igc3VidGVzdCwgaiBpbiBzdWJ0ZXN0c1RoaXNQYXJ0XG4gICAgICAgIHN0dWRlbnRSZXN1bHQgPSByZXN1bHRzRm9yVGhpc1N0dWRlbnQud2hlcmUgXCJzdWJ0ZXN0SWRcIiA6IHN1YnRlc3QuaWRcbiAgICAgICAgdGFrZW4gPSBzdHVkZW50UmVzdWx0Lmxlbmd0aCAhPSAwXG4gICAgICAgIGlmIH5zdHVkZW50LmdldChcIm5hbWVcIikudG9Mb3dlckNhc2UoKS5pbmRleE9mKEBzZWFyY2gudG9Mb3dlckNhc2UoKSkgfHwgQHNlYXJjaCA9PSBcIlwiXG5cbiAgICAgICAgICAjIGNvdW50IGJhY2sgdG8gZm9yd2FyZCB0byBnZXQgcmVjZW5jeSBvZiBsYXN0IHJlc3VsdCBmb3IgY29sb3IgY29kaW5nXG4gICAgICAgICAgZm9yIGsgaW4gWzYuLjBdXG4gICAgICAgICAgICBwYXJ0VGVzdCA9IEBjdXJyZW50UGFydCAtIGtcbiAgICAgICAgICAgIHNlYXJjaCA9IHJlc3VsdHNGb3JUaGlzU3R1ZGVudC53aGVyZShcInBhcnRcIiA6IHBhcnRUZXN0LCBcIml0ZW1UeXBlXCIgOiBzdWJ0ZXN0LmdldChcIml0ZW1UeXBlXCIpKVxuICAgICAgICAgICAgcmVjZW5jeSA9IGsgaWYgc2VhcmNoLmxlbmd0aFxuXG4gICAgICAgICAgYmFja2dyb3VuZCA9XG4gICAgICAgICAgICBpZiByZWNlbmN5IDw9IDJcbiAgICAgICAgICAgICAgXCJcIlxuICAgICAgICAgICAgZWxzZSBpZiByZWNlbmN5IDw9IDRcbiAgICAgICAgICAgICAgXCJyZ2IoMjI5LCAyMDgsIDE0OSlcIlxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBcInJnYigyMjIsIDE1NiwgMTE3KVwiXG5cbiAgICAgICAgICB0YWJsZVtpXS5wdXNoXG4gICAgICAgICAgICBcImNvbnRlbnRcIiAgIDogaWYgdGFrZW4gdGhlbiBcIiYjeDI3MTQ7XCIgZWxzZSBcIj9cIlxuICAgICAgICAgICAgXCJ0YWtlblwiICAgICA6IHRha2VuXG4gICAgICAgICAgICBcInN0dWRlbnRJZFwiIDogc3R1ZGVudC5pZFxuICAgICAgICAgICAgXCJzdHVkZW50TmFtZVwiIDogc3R1ZGVudC5nZXQoXCJuYW1lXCIpXG4gICAgICAgICAgICBcInN1YnRlc3RJZFwiIDogc3VidGVzdC5pZFxuICAgICAgICAgICAgXCJiYWNrZ3JvdW5kXCIgOiBiYWNrZ3JvdW5kXG5cblxuICAgICMgbWFrZSBoZWFkZXJzXG4gICAgZ3JpZFBhZ2UgPSBcIjx0YWJsZSBjbGFzcz0naW5mb19ib3hfd2lkZSc+PHRib2R5Pjx0cj48dGg+PC90aD5cIlxuICAgIGZvciBzdWJ0ZXN0IGluIHN1YnRlc3RzVGhpc1BhcnRcbiAgICAgIGdyaWRQYWdlICs9IFwiPHRoPjxkaXYgY2xhc3M9J3BhcnRfc3VidGVzdF9yZXBvcnQnIGRhdGEtaWQ9JyN7c3VidGVzdC5pZH0nPiN7c3VidGVzdC5nZXQoJ25hbWUnKX08L2Rpdj48L3RoPlwiXG4gICAgZ3JpZFBhZ2UgKz0gXCI8L3RyPlwiXG4gICAgZm9yIHJvdyBpbiB0YWJsZVxuICAgICAgaWYgcm93PyAmJiByb3cubGVuZ3RoXG4gICAgICAgIGdyaWRQYWdlICs9IFwiPHRyPjx0ZD48ZGl2IGNsYXNzPSdzdHVkZW50JyBkYXRhLXN0dWRlbnRJZD0nI3tyb3dbMF0uc3R1ZGVudElkfSc+I3tyb3dbMF0uc3R1ZGVudE5hbWV9PC9kaXY+PC90ZD5cIlxuICAgICAgICBmb3IgY2VsbCwgY29sdW1uIGluIHJvd1xuICAgICAgICAgIHRha2VuQ2xhc3MgPSBpZiBjZWxsLnRha2VuIHRoZW4gXCIgc3VidGVzdF90YWtlblwiIGVsc2UgXCJcIlxuICAgICAgICAgIGdyaWRQYWdlICs9IFwiPHRkPjxkaXYgY2xhc3M9J3N0dWRlbnRfc3VidGVzdCBjb21tYW5kICN7dGFrZW5DbGFzc30nIGRhdGEtdGFrZW49JyN7Y2VsbC50YWtlbn0nIGRhdGEtc3R1ZGVudElkPScje2NlbGwuc3R1ZGVudElkfScgZGF0YS1zdWJ0ZXN0SWQ9JyN7Y2VsbC5zdWJ0ZXN0SWR9JyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjoje2NlbGwuYmFja2dyb3VuZH0gIWltcG9ydGFudDsnPiN7Y2VsbC5jb250ZW50fTwvZGl2PjwvdGQ+XCJcbiAgICAgICAgZ3JpZFBhZ2UgKz0gXCI8L3RyPlwiXG4gICAgZ3JpZFBhZ2UgKz0gXCI8L3Rib2R5PjwvdGFibGU+XCJcblxuICAgIGlmIF8uZmxhdHRlbih0YWJsZSkubGVuZ3RoID09IDBcbiAgICAgIGdyaWRQYWdlID0gXCI8cCBjbGFzcz0nZ3JleSc+Tm8gc3R1ZGVudHMgZm91bmQuPC9wPlwiXG5cbiAgICByZXR1cm4gZ3JpZFBhZ2VcblxuXG4gIHJlbmRlcjogLT5cbiAgICBcbiAgICBncmlkUGFnZSA9IEBnZXRHcmlkUGFnZSgpXG4gICAgXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8aDE+I3t0KCdhc3Nlc3NtZW50IHN0YXR1cycpfTwvaDE+XG4gICAgICA8aW5wdXQgaWQ9J3NlYXJjaF9zdHVkZW50X25hbWUnIHN0eWxlPSd3aWR0aDogOTIlICFpbXBvcnRhbnQnIHBsYWNlaG9sZGVyPScje3QoJ3NlYXJjaCBzdHVkZW50IG5hbWUnKX0nIHR5cGU9J3RleHQnPlxuXG4gICAgICA8ZGl2IGlkPSdncmlkX2NvbnRhaW5lcic+I3tncmlkUGFnZX08L2Rpdj48YnI+XG4gICAgICA8aDI+I3t0KCdjdXJyZW50IGFzc2Vzc21lbnQnKX0gPC9oMj5cbiAgICAgIFxuICAgICAgPGJ1dHRvbiBjbGFzcz0ncHJldl9wYXJ0IGNvbW1hbmQnPiZsdDs8L2J1dHRvbj4gPGlucHV0IHR5cGU9J251bWJlcicgdmFsdWU9JyN7QGN1cnJlbnRQYXJ0fScgaWQ9J2N1cnJlbnRfcGFydCc+IDxidXR0b24gY2xhc3M9J25leHRfcGFydCBjb21tYW5kJz4mZ3Q7PC9idXR0b24+PGJyPjxicj5cbiAgICAgIDxidXR0b24gY2xhc3M9J2JhY2sgbmF2aWdhdGlvbic+I3t0KCdiYWNrJyl9PC9idXR0b24+IFxuICAgICAgXCJcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIiJdfQ==
