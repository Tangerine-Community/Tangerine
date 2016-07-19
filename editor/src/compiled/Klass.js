var Klass,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Klass = (function(superClass) {
  extend(Klass, superClass);

  function Klass() {
    return Klass.__super__.constructor.apply(this, arguments);
  }

  Klass.prototype.url = "klass";

  Klass.prototype.initialize = function() {};

  Klass.prototype.destroy = function() {
    var allResults, allStudents, klassId;
    klassId = this.id;
    allStudents = new Students;
    allStudents.fetch({
      success: function(studentCollection) {
        var i, len, results1, student, students;
        students = studentCollection.where({
          "klassId": klassId
        });
        results1 = [];
        for (i = 0, len = students.length; i < len; i++) {
          student = students[i];
          results1.push(student.save({
            "klassId": ""
          }));
        }
        return results1;
      }
    });
    allResults = new Results;
    allResults.fetch({
      success: function(resultCollection) {
        var i, len, result, results, results1;
        results = resultCollection.where({
          "klassId": klassId
        });
        results1 = [];
        for (i = 0, len = results.length; i < len; i++) {
          result = results[i];
          results1.push(result.destroy());
        }
        return results1;
      }
    });
    return Klass.__super__.destroy.call(this);
  };

  Klass.prototype.calcCurrentPart = function() {
    var milliseconds, millisecondsPerDay, millisecondsPerHour, millisecondsPerMinute, millisecondsPerWeek;
    milliseconds = 1000;
    millisecondsPerMinute = 60 * milliseconds;
    millisecondsPerHour = 60 * millisecondsPerMinute;
    millisecondsPerDay = 24 * millisecondsPerHour;
    millisecondsPerWeek = 7 * millisecondsPerDay;
    return Math.round(((new Date()).getTime() - this.get("startDate")) / millisecondsPerWeek);
  };

  return Klass;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtsYXNzL0tsYXNzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLEtBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7a0JBQ0osR0FBQSxHQUFNOztrQkFFTixVQUFBLEdBQVksU0FBQSxHQUFBOztrQkFLWixPQUFBLEdBQVMsU0FBQTtBQUVQLFFBQUE7SUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBO0lBR1gsV0FBQSxHQUFjLElBQUk7SUFDbEIsV0FBVyxDQUFDLEtBQVosQ0FDRTtNQUFBLE9BQUEsRUFBUyxTQUFDLGlCQUFEO0FBQ1AsWUFBQTtRQUFBLFFBQUEsR0FBVyxpQkFBaUIsQ0FBQyxLQUFsQixDQUF3QjtVQUFBLFNBQUEsRUFBWSxPQUFaO1NBQXhCO0FBQ1g7YUFBQSwwQ0FBQTs7d0JBQ0UsT0FBTyxDQUFDLElBQVIsQ0FDRTtZQUFBLFNBQUEsRUFBWSxFQUFaO1dBREY7QUFERjs7TUFGTyxDQUFUO0tBREY7SUFPQSxVQUFBLEdBQWEsSUFBSTtJQUNqQixVQUFVLENBQUMsS0FBWCxDQUNFO01BQUEsT0FBQSxFQUFTLFNBQUMsZ0JBQUQ7QUFDUCxZQUFBO1FBQUEsT0FBQSxHQUFVLGdCQUFnQixDQUFDLEtBQWpCLENBQXVCO1VBQUEsU0FBQSxFQUFZLE9BQVo7U0FBdkI7QUFDVjthQUFBLHlDQUFBOzt3QkFDRSxNQUFNLENBQUMsT0FBUCxDQUFBO0FBREY7O01BRk8sQ0FBVDtLQURGO1dBTUEsaUNBQUE7RUFwQk87O2tCQXNCVCxlQUFBLEdBQWlCLFNBQUE7QUFDZixRQUFBO0lBQUEsWUFBQSxHQUF3QjtJQUN4QixxQkFBQSxHQUF3QixFQUFBLEdBQUs7SUFDN0IsbUJBQUEsR0FBd0IsRUFBQSxHQUFLO0lBQzdCLGtCQUFBLEdBQXdCLEVBQUEsR0FBSztJQUM3QixtQkFBQSxHQUF3QixDQUFBLEdBQUs7QUFDN0IsV0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLENBQUMsQ0FBSyxJQUFBLElBQUEsQ0FBQSxDQUFMLENBQVksQ0FBQyxPQUFiLENBQUEsQ0FBQSxHQUF5QixJQUFDLENBQUEsR0FBRCxDQUFLLFdBQUwsQ0FBMUIsQ0FBQSxHQUErQyxtQkFBMUQ7RUFOUTs7OztHQTlCQyxRQUFRLENBQUMiLCJmaWxlIjoia2xhc3MvS2xhc3MuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBLbGFzcyBleHRlbmRzIEJhY2tib25lLk1vZGVsXG4gIHVybCA6IFwia2xhc3NcIlxuICBcbiAgaW5pdGlhbGl6ZTogLT5cbiAgICAjIGdldCBzdHVkZW50c1xuICAgICMgZ2V0IGFzc2Vzc21lbnQgY29sbGVjdGlvblxuXG5cbiAgZGVzdHJveTogLT5cblxuICAgIGtsYXNzSWQgPSBAaWRcblxuICAgICMgdW5saW5rIGFsbCBzdHVkZW50c1xuICAgIGFsbFN0dWRlbnRzID0gbmV3IFN0dWRlbnRzXG4gICAgYWxsU3R1ZGVudHMuZmV0Y2hcbiAgICAgIHN1Y2Nlc3M6IChzdHVkZW50Q29sbGVjdGlvbikgLT5cbiAgICAgICAgc3R1ZGVudHMgPSBzdHVkZW50Q29sbGVjdGlvbi53aGVyZSBcImtsYXNzSWRcIiA6IGtsYXNzSWRcbiAgICAgICAgZm9yIHN0dWRlbnQgaW4gc3R1ZGVudHNcbiAgICAgICAgICBzdHVkZW50LnNhdmVcbiAgICAgICAgICAgIFwia2xhc3NJZFwiIDogXCJcIlxuXG4gICAgYWxsUmVzdWx0cyA9IG5ldyBSZXN1bHRzXG4gICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgc3VjY2VzczogKHJlc3VsdENvbGxlY3Rpb24pIC0+XG4gICAgICAgIHJlc3VsdHMgPSByZXN1bHRDb2xsZWN0aW9uLndoZXJlIFwia2xhc3NJZFwiIDoga2xhc3NJZFxuICAgICAgICBmb3IgcmVzdWx0IGluIHJlc3VsdHNcbiAgICAgICAgICByZXN1bHQuZGVzdHJveSgpXG5cbiAgICBzdXBlcigpXG5cbiAgY2FsY0N1cnJlbnRQYXJ0OiAtPlxuICAgIG1pbGxpc2Vjb25kcyAgICAgICAgICA9IDEwMDBcbiAgICBtaWxsaXNlY29uZHNQZXJNaW51dGUgPSA2MCAqIG1pbGxpc2Vjb25kc1xuICAgIG1pbGxpc2Vjb25kc1BlckhvdXIgICA9IDYwICogbWlsbGlzZWNvbmRzUGVyTWludXRlXG4gICAgbWlsbGlzZWNvbmRzUGVyRGF5ICAgID0gMjQgKiBtaWxsaXNlY29uZHNQZXJIb3VyXG4gICAgbWlsbGlzZWNvbmRzUGVyV2VlayAgID0gNyAgKiBtaWxsaXNlY29uZHNQZXJEYXlcbiAgICByZXR1cm4gTWF0aC5yb3VuZCgoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAtIEBnZXQoXCJzdGFydERhdGVcIikpIC8gbWlsbGlzZWNvbmRzUGVyV2VlaylcbiJdfQ==
