var KlassSubtestResultView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassSubtestResultView = (function(superClass) {
  extend(KlassSubtestResultView, superClass);

  function KlassSubtestResultView() {
    return KlassSubtestResultView.__super__.constructor.apply(this, arguments);
  }

  KlassSubtestResultView.prototype.className = "KlassSubtestResultView";

  KlassSubtestResultView.prototype.events = {
    "click .run": "checkRun",
    "click .back": "back",
    "click .show_itemized": "showItemized"
  };

  KlassSubtestResultView.prototype.initialize = function(options) {
    this.allResults = options.allResults;
    this.results = options.results;
    this.result = this.results[0];
    this.previous = options.previous;
    this.subtest = options.subtest;
    return this.student = options.student;
  };

  KlassSubtestResultView.prototype.gotoRun = function() {
    return Tangerine.router.navigate("class/run/" + this.options.student.id + "/" + this.options.subtest.id, true);
  };

  KlassSubtestResultView.prototype.checkRun = function() {
    var gridLinkId, hasGridLink, result, subtest;
    hasGridLink = this.subtest.has("gridLinkId") && this.subtest.get("gridLinkId") !== "";
    if (!hasGridLink) {
      this.gotoRun();
      return;
    }
    gridLinkId = this.subtest.get("gridLinkId");
    result = this.allResults.where({
      "subtestId": gridLinkId,
      "studentId": this.student.id
    });
    if (result.length === 0) {
      subtest = new Subtest({
        "_id": gridLinkId
      });
      subtest.fetch({
        success: (function(_this) {
          return function() {
            return Utils.midAlert("Please complete<br><b>" + (subtest.escape("name")) + "</b><br>for<br><b>" + (_this.student.escape('name')) + "</b><br>before this test.", 5000);
          };
        })(this)
      });
      return;
    }
    return this.gotoRun();
  };

  KlassSubtestResultView.prototype.showItemized = function() {
    return this.$el.find(".itemized").fadeToggle();
  };

  KlassSubtestResultView.prototype.back = function() {
    return Tangerine.router.navigate("class/" + (this.options.student.get("klassId")) + "/" + (this.options.subtest.get("part")), true);
  };

  KlassSubtestResultView.prototype.render = function() {
    var base, datum, i, j, key, len, ref, ref1, resultHTML, runButton, taken, timestamp, value;
    if (this.result != null) {
      this.results = this.results[0];
      resultHTML = "<button class='command show_itemized'>" + (t('itemized results')) + "</button><table class='itemized confirmation'><tbody><tr><th>Item</th><th>Result</th></tr>";
      if (this.subtest.get("prototype") === "grid") {
        ref = this.result.get("subtestData").items;
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          datum = ref[i];
          resultHTML += "<tr><td>" + datum.itemLabel + "</td><td>" + (t(datum.itemResult)) + "</td></tr>";
        }
      } else if (this.subtest.get("prototype") === "survey") {
        ref1 = this.result.get("subtestData");
        for (key in ref1) {
          value = ref1[key];
          resultHTML += "<tr><td>" + key + "</td><td>" + (t(value)) + "</td></tr>";
        }
      }
      resultHTML += "</tbody></table><br>";
      timestamp = new Date(this.result.get("startTime"));
      if (this.previous > 0) {
        taken = "<tr> <td><label>Taken last</label></td><td>" + (timestamp.getFullYear()) + "/" + (timestamp.getMonth() + 1) + "/" + (timestamp.getDate()) + "</td> </tr> <tr> <td><label>Previous attempts</label></td><td>" + this.previous + "</td> </tr>";
      }
    }
    if ((this.result == null) || (typeof (base = this.result).get === "function" ? base.get("reportType") : void 0) !== "progress") {
      runButton = "<div class='menu_box'> <img src='images/icon_run.png' class='run clickable'> </div><br>";
    }
    this.$el.html("<h1>Result</h1> <table><tbody> <tr> <td><label>Assessment</label></td> <td>" + (this.subtest.get("part")) + "</td> </tr> <tr> <td><label>Student</label></td> <td>" + (this.student.escape("name")) + "</td> </tr> <tr> <td><label>Subtest</label></td> <td>" + (this.subtest.escape("name")) + "</td> </tr> " + (taken || "") + " </tbody></table> " + (resultHTML || "") + " " + (runButton || "") + " <button class='navigation back'>Back</button>");
    return this.trigger("rendered");
  };

  return KlassSubtestResultView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtsYXNzL0tsYXNzU3VidGVzdFJlc3VsdFZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsc0JBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7bUNBRUosU0FBQSxHQUFXOzttQ0FFWCxNQUFBLEdBQ0U7SUFBQSxZQUFBLEVBQXlCLFVBQXpCO0lBQ0EsYUFBQSxFQUF5QixNQUR6QjtJQUVBLHNCQUFBLEVBQXlCLGNBRnpCOzs7bUNBSUYsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxVQUFELEdBQWMsT0FBTyxDQUFDO0lBQ3RCLElBQUMsQ0FBQSxPQUFELEdBQVcsT0FBTyxDQUFDO0lBQ25CLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBO0lBQ25CLElBQUMsQ0FBQSxRQUFELEdBQVksT0FBTyxDQUFDO0lBQ3BCLElBQUMsQ0FBQSxPQUFELEdBQVcsT0FBTyxDQUFDO1dBQ25CLElBQUMsQ0FBQSxPQUFELEdBQVcsT0FBTyxDQUFDO0VBTlQ7O21DQVFaLE9BQUEsR0FBUyxTQUFBO1dBQ1AsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFqQixDQUEwQixZQUFBLEdBQWEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBOUIsR0FBaUMsR0FBakMsR0FBb0MsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBL0UsRUFBcUYsSUFBckY7RUFETzs7bUNBR1QsUUFBQSxHQUFVLFNBQUE7QUFDUixRQUFBO0lBQUEsV0FBQSxHQUFjLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLFlBQWIsQ0FBQSxJQUE4QixJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxZQUFiLENBQUEsS0FBOEI7SUFDMUUsSUFBRyxDQUFJLFdBQVA7TUFDRSxJQUFDLENBQUEsT0FBRCxDQUFBO0FBQ0EsYUFGRjs7SUFJQSxVQUFBLEdBQWEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEs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LEtBQThCLFVBSm5EO01BQUEsU0FBQSxHQUFZLDBGQUFaOztJQU1BLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLDZFQUFBLEdBS0MsQ0FBQyxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxNQUFiLENBQUQsQ0FMRCxHQUt1Qix1REFMdkIsR0FTQyxDQUFDLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixNQUFoQixDQUFELENBVEQsR0FTMEIsdURBVDFCLEdBYUMsQ0FBQyxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsTUFBaEIsQ0FBRCxDQWJELEdBYTBCLGNBYjFCLEdBZUwsQ0FBQyxLQUFBLElBQVMsRUFBVixDQWZLLEdBZVEsb0JBZlIsR0FpQlAsQ0FBQyxVQUFBLElBQWMsRUFBZixDQWpCTyxHQWlCVyxHQWpCWCxHQWtCUCxDQUFDLFNBQUEsSUFBYSxFQUFkLENBbEJPLEdBa0JVLGdEQWxCcEI7V0FzQkEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO0VBckRNOzs7O0dBN0MyQixRQUFRLENBQUMiLCJmaWxlIjoia2xhc3MvS2xhc3NTdWJ0ZXN0UmVzdWx0Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEtsYXNzU3VidGVzdFJlc3VsdFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lOiBcIktsYXNzU3VidGVzdFJlc3VsdFZpZXdcIlxuXG4gIGV2ZW50czogXG4gICAgXCJjbGljayAucnVuXCIgICAgICAgICAgIDogXCJjaGVja1J1blwiXG4gICAgXCJjbGljayAuYmFja1wiICAgICAgICAgIDogXCJiYWNrXCJcbiAgICBcImNsaWNrIC5zaG93X2l0ZW1pemVkXCIgOiBcInNob3dJdGVtaXplZFwiXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQGFsbFJlc3VsdHMgPSBvcHRpb25zLmFsbFJlc3VsdHNcbiAgICBAcmVzdWx0cyA9IG9wdGlvbnMucmVzdWx0c1xuICAgIEByZXN1bHQgPSBAcmVzdWx0c1swXVxuICAgIEBwcmV2aW91cyA9IG9wdGlvbnMucHJldmlvdXNcbiAgICBAc3VidGVzdCA9IG9wdGlvbnMuc3VidGVzdFxuICAgIEBzdHVkZW50ID0gb3B0aW9ucy5zdHVkZW50XG5cbiAgZ290b1J1bjogLT5cbiAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiY2xhc3MvcnVuLyN7QG9wdGlvbnMuc3R1ZGVudC5pZH0vI3tAb3B0aW9ucy5zdWJ0ZXN0LmlkfVwiLCB0cnVlXG5cbiAgY2hlY2tSdW46IC0+XG4gICAgaGFzR3JpZExpbmsgPSBAc3VidGVzdC5oYXMoXCJncmlkTGlua0lkXCIpICYmIEBzdWJ0ZXN0LmdldChcImdyaWRMaW5rSWRcIikgIT0gXCJcIlxuICAgIGlmIG5vdCBoYXNHcmlkTGlua1xuICAgICAgQGdvdG9SdW4oKVxuICAgICAgcmV0dXJuXG5cbiAgICBncmlkTGlua0lkID0gQHN1YnRlc3QuZ2V0KFwiZ3JpZExpbmtJZFwiKVxuXG4gICAgcmVzdWx0ID0gQGFsbFJlc3VsdHMud2hlcmUgXG4gICAgICBcInN1YnRlc3RJZFwiIDogZ3JpZExpbmtJZFxuICAgICAgXCJzdHVkZW50SWRcIiA6IEBzdHVkZW50LmlkXG5cbiAgICBpZiByZXN1bHQubGVuZ3RoID09IDBcbiAgICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdCBcIl9pZFwiIDogZ3JpZExpbmtJZFxuICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiUGxlYXNlIGNvbXBsZXRlPGJyPjxiPiN7c3VidGVzdC5lc2NhcGUoXCJuYW1lXCIpfTwvYj48YnI+Zm9yPGJyPjxiPiN7QHN0dWRlbnQuZXNjYXBlKCduYW1lJyl9PC9iPjxicj5iZWZvcmUgdGhpcyB0ZXN0LlwiLCA1MDAwXG4gICAgICByZXR1cm5cblxuICAgIEBnb3RvUnVuKClcblxuICBzaG93SXRlbWl6ZWQ6IC0+IEAkZWwuZmluZChcIi5pdGVtaXplZFwiKS5mYWRlVG9nZ2xlKClcblxuICBiYWNrOiAtPiBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiY2xhc3MvI3tAb3B0aW9ucy5zdHVkZW50LmdldChcImtsYXNzSWRcIil9LyN7QG9wdGlvbnMuc3VidGVzdC5nZXQoXCJwYXJ0XCIpfVwiLCB0cnVlXG5cbiAgcmVuZGVyOiAtPlxuXG4gICAgaWYgQHJlc3VsdD9cbiAgICAgIEByZXN1bHRzID0gQHJlc3VsdHNbMF1cblxuICAgICAgcmVzdWx0SFRNTCA9IFwiPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBzaG93X2l0ZW1pemVkJz4je3QoJ2l0ZW1pemVkIHJlc3VsdHMnKX08L2J1dHRvbj48dGFibGUgY2xhc3M9J2l0ZW1pemVkIGNvbmZpcm1hdGlvbic+PHRib2R5Pjx0cj48dGg+SXRlbTwvdGg+PHRoPlJlc3VsdDwvdGg+PC90cj5cIlxuICAgICAgaWYgQHN1YnRlc3QuZ2V0KFwicHJvdG90eXBlXCIpID09IFwiZ3JpZFwiXG4gICAgICAgIGZvciBkYXR1bSwgaSBpbiBAcmVzdWx0LmdldChcInN1YnRlc3REYXRhXCIpLml0ZW1zXG4gICAgICAgICAgcmVzdWx0SFRNTCArPSBcIjx0cj48dGQ+I3tkYXR1bS5pdGVtTGFiZWx9PC90ZD48dGQ+I3t0KGRhdHVtLml0ZW1SZXN1bHQpfTwvdGQ+PC90cj5cIlxuICAgICAgZWxzZSBpZiBAc3VidGVzdC5nZXQoXCJwcm90b3R5cGVcIikgPT0gXCJzdXJ2ZXlcIlxuICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBAcmVzdWx0LmdldChcInN1YnRlc3REYXRhXCIpXG4gICAgICAgICAgcmVzdWx0SFRNTCArPSBcIjx0cj48dGQ+I3trZXl9PC90ZD48dGQ+I3t0KHZhbHVlKX08L3RkPjwvdHI+XCJcbiAgICAgIHJlc3VsdEhUTUwgKz0gXCI8L3Rib2R5PjwvdGFibGU+PGJyPlwiXG5cbiAgICAgIHRpbWVzdGFtcCA9IG5ldyBEYXRlKEByZXN1bHQuZ2V0KFwic3RhcnRUaW1lXCIpKVxuXG4gICAgICB0YWtlbiA9IFwiXG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQ+PGxhYmVsPlRha2VuIGxhc3Q8L2xhYmVsPjwvdGQ+PHRkPiN7dGltZXN0YW1wLmdldEZ1bGxZZWFyKCl9LyN7dGltZXN0YW1wLmdldE1vbnRoKCkrMX0vI3t0aW1lc3RhbXAuZ2V0RGF0ZSgpfTwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQ+PGxhYmVsPlByZXZpb3VzIGF0dGVtcHRzPC9sYWJlbD48L3RkPjx0ZD4je0BwcmV2aW91c308L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgXCIgaWYgQHByZXZpb3VzID4gMFxuXG4gICAgcnVuQnV0dG9uID0gXCJcbiAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgPGltZyBzcmM9J2ltYWdlcy9pY29uX3J1bi5wbmcnIGNsYXNzPSdydW4gY2xpY2thYmxlJz5cbiAgICAgIDwvZGl2Pjxicj5cbiAgICBcIiBpZiBub3QgQHJlc3VsdD8gfHwgQHJlc3VsdC5nZXQ/KFwicmVwb3J0VHlwZVwiKSAhPSBcInByb2dyZXNzXCJcblxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGgxPlJlc3VsdDwvaDE+XG4gICAgICA8dGFibGU+PHRib2R5PlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRkPjxsYWJlbD5Bc3Nlc3NtZW50PC9sYWJlbD48L3RkPlxuICAgICAgICAgIDx0ZD4je0BzdWJ0ZXN0LmdldChcInBhcnRcIil9PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0ZD48bGFiZWw+U3R1ZGVudDwvbGFiZWw+PC90ZD5cbiAgICAgICAgICA8dGQ+I3tAc3R1ZGVudC5lc2NhcGUoXCJuYW1lXCIpfTwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQ+PGxhYmVsPlN1YnRlc3Q8L2xhYmVsPjwvdGQ+XG4gICAgICAgICAgPHRkPiN7QHN1YnRlc3QuZXNjYXBlKFwibmFtZVwiKX08L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICAje3Rha2VuIHx8IFwiXCJ9XG4gICAgICA8L3Rib2R5PjwvdGFibGU+XG4gICAgICAje3Jlc3VsdEhUTUwgfHwgXCJcIn1cbiAgICAgICN7cnVuQnV0dG9uIHx8IFwiXCJ9XG4gICAgICA8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIGJhY2snPkJhY2s8L2J1dHRvbj5cbiAgICBcIlxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiIl19
