var MasteryCheckView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MasteryCheckView = (function(superClass) {
  extend(MasteryCheckView, superClass);

  function MasteryCheckView() {
    return MasteryCheckView.__super__.constructor.apply(this, arguments);
  }

  MasteryCheckView.prototype.className = "MasteryCheckView";

  MasteryCheckView.prototype.events = {
    "click .back": "goBack"
  };

  MasteryCheckView.prototype.goBack = function() {
    return history.back();
  };

  MasteryCheckView.prototype.initialize = function(options) {
    this.subtests = options.subtests;
    this.results = options.results;
    this.student = options.student;
    this.klass = options.klass;
    this.resultsByPart = this.results.indexBy("part");
    this.lastPart = Math.max.apply(this, this.results.pluck("part"));
    if (!isFinite(this.lastPart)) {
      return this.lastPart = 0;
    }
  };

  MasteryCheckView.prototype.render = function() {
    var html, htmlWarning, i, j, len, part, ref, ref1, result, subtestName;
    html = "<h1>Mastery check report</h1> <h2>Student " + (this.student.get("name")) + "</h2>";
    htmlWarning = "<p>No test data for this type of report. Return to the <a href='#class'>class menu</a> and click the <img src='images/icon_run.png'> icon to collect data.</p>";
    if (this.results.length === 0) {
      this.$el.html(html + " " + htmlWarning);
      this.trigger("rendered");
      return;
    }
    html += "<table>";
    for (part = i = 1, ref = this.lastPart; 1 <= ref ? i <= ref : i >= ref; part = 1 <= ref ? ++i : --i) {
      if (this.resultsByPart[part] == null) {
        continue;
      }
      html += "<tr><th>Assessment " + part + "</th></tr> <tr>";
      ref1 = this.resultsByPart[part];
      for (j = 0, len = ref1.length; j < len; j++) {
        result = ref1[j];
        subtestName = this.subtests.get(result.get('subtestId')).get('name');
        html += "<td> " + (result.get("itemType").titleize()) + " correct<br> " + subtestName + " </td> <td>" + (result.get("correct")) + "/" + (result.get("total")) + "</td>";
      }
    }
    html += "</table> <button class='navigation back'>" + (t('back')) + "</button>";
    this.$el.html(html);
    return this.trigger("rendered");
  };

  return MasteryCheckView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlcG9ydC9NYXN0ZXJ5Q2hlY2tWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGdCQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzZCQUVKLFNBQUEsR0FBWTs7NkJBRVosTUFBQSxHQUNFO0lBQUEsYUFBQSxFQUFnQixRQUFoQjs7OzZCQUVGLE1BQUEsR0FBUSxTQUFBO1dBQUcsT0FBTyxDQUFDLElBQVIsQ0FBQTtFQUFIOzs2QkFFUixVQUFBLEdBQVksU0FBQyxPQUFEO0lBRVYsSUFBQyxDQUFBLFFBQUQsR0FBWSxPQUFPLENBQUM7SUFDcEIsSUFBQyxDQUFBLE9BQUQsR0FBWSxPQUFPLENBQUM7SUFDcEIsSUFBQyxDQUFBLE9BQUQsR0FBWSxPQUFPLENBQUM7SUFDcEIsSUFBQyxDQUFBLEtBQUQsR0FBWSxPQUFPLENBQUM7SUFFcEIsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQWlCLE1BQWpCO0lBRWpCLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFULENBQWUsSUFBZixFQUFrQixJQUFDLENBQUEsT0FBTyxDQUFDLEtBQVQsQ0FBZSxNQUFmLENBQWxCO0lBQ1osSUFBaUIsQ0FBSSxRQUFBLENBQVMsSUFBQyxDQUFBLFFBQVYsQ0FBckI7YUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLEVBQVo7O0VBVlU7OzZCQVlaLE1BQUEsR0FBUSxTQUFBO0FBRU4sUUFBQTtJQUFBLElBQUEsR0FBTyw0Q0FBQSxHQUVRLENBQUMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsTUFBYixDQUFELENBRlIsR0FFOEI7SUFNckMsV0FBQSxHQUFjO0lBRWQsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsS0FBbUIsQ0FBdEI7TUFDRSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FDSSxJQUFELEdBQU0sR0FBTixHQUNDLFdBRko7TUFJQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7QUFDQSxhQU5GOztJQVVBLElBQUEsSUFBUTtBQUNSLFNBQVksOEZBQVo7TUFFRSxJQUFPLGdDQUFQO0FBQWtDLGlCQUFsQzs7TUFDQSxJQUFBLElBQVEscUJBQUEsR0FDZSxJQURmLEdBQ29CO0FBRzVCO0FBQUEsV0FBQSxzQ0FBQTs7UUFDRSxXQUFBLEdBQWMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsTUFBTSxDQUFDLEdBQVAsQ0FBVyxXQUFYLENBQWQsQ0FBc0MsQ0FBQyxHQUF2QyxDQUEyQyxNQUEzQztRQUNkLElBQUEsSUFBUSxPQUFBLEdBRUgsQ0FBQyxNQUFNLENBQUMsR0FBUCxDQUFXLFVBQVgsQ0FBc0IsQ0FBQyxRQUF2QixDQUFBLENBQUQsQ0FGRyxHQUVnQyxlQUZoQyxHQUdGLFdBSEUsR0FHVSxhQUhWLEdBS0QsQ0FBQyxNQUFNLENBQUMsR0FBUCxDQUFXLFNBQVgsQ0FBRCxDQUxDLEdBS3NCLEdBTHRCLEdBS3dCLENBQUMsTUFBTSxDQUFDLEdBQVAsQ0FBVyxPQUFYLENBQUQsQ0FMeEIsR0FLNkM7QUFQdkQ7QUFQRjtJQWdCQSxJQUFBLElBQVEsMkNBQUEsR0FFeUIsQ0FBQyxDQUFBLENBQUUsTUFBRixDQUFELENBRnpCLEdBRW9DO0lBRTVDLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLElBQVY7V0FFQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUE3Q007Ozs7R0FyQnFCLFFBQVEsQ0FBQyIsImZpbGUiOiJyZXBvcnQvTWFzdGVyeUNoZWNrVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIE1hc3RlcnlDaGVja1ZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJNYXN0ZXJ5Q2hlY2tWaWV3XCJcblxuICBldmVudHMgOlxuICAgIFwiY2xpY2sgLmJhY2tcIiA6IFwiZ29CYWNrXCJcbiAgICBcbiAgZ29CYWNrOiAtPiBoaXN0b3J5LmJhY2soKVxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQHN1YnRlc3RzID0gb3B0aW9ucy5zdWJ0ZXN0c1xuICAgIEByZXN1bHRzICA9IG9wdGlvbnMucmVzdWx0c1xuICAgIEBzdHVkZW50ICA9IG9wdGlvbnMuc3R1ZGVudFxuICAgIEBrbGFzcyAgICA9IG9wdGlvbnMua2xhc3NcblxuICAgIEByZXN1bHRzQnlQYXJ0ID0gQHJlc3VsdHMuaW5kZXhCeSBcInBhcnRcIlxuXG4gICAgQGxhc3RQYXJ0ID0gTWF0aC5tYXguYXBwbHkoQCwgQHJlc3VsdHMucGx1Y2soXCJwYXJ0XCIpKVxuICAgIEBsYXN0UGFydCA9IDAgaWYgbm90IGlzRmluaXRlKEBsYXN0UGFydClcblxuICByZW5kZXI6IC0+XG5cbiAgICBodG1sID0gXCJcbiAgICAgIDxoMT5NYXN0ZXJ5IGNoZWNrIHJlcG9ydDwvaDE+XG4gICAgICA8aDI+U3R1ZGVudCAje0BzdHVkZW50LmdldChcIm5hbWVcIil9PC9oMj5cbiAgICBcIlxuXG4gICAgI1xuICAgICMgRW1wdHkgd2FybmluZ1xuICAgICNcbiAgICBodG1sV2FybmluZyA9IFwiPHA+Tm8gdGVzdCBkYXRhIGZvciB0aGlzIHR5cGUgb2YgcmVwb3J0LiBSZXR1cm4gdG8gdGhlIDxhIGhyZWY9JyNjbGFzcyc+Y2xhc3MgbWVudTwvYT4gYW5kIGNsaWNrIHRoZSA8aW1nIHNyYz0naW1hZ2VzL2ljb25fcnVuLnBuZyc+IGljb24gdG8gY29sbGVjdCBkYXRhLjwvcD5cIlxuXG4gICAgaWYgQHJlc3VsdHMubGVuZ3RoID09IDBcbiAgICAgIEAkZWwuaHRtbCBcIlxuICAgICAgICAje2h0bWx9XG4gICAgICAgICN7aHRtbFdhcm5pbmd9XG4gICAgICBcIlxuICAgICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4gICAgICByZXR1cm5cblxuXG5cbiAgICBodG1sICs9IFwiPHRhYmxlPlwiXG4gICAgZm9yIHBhcnQgaW4gWzEuLkBsYXN0UGFydF1cblxuICAgICAgaWYgbm90IEByZXN1bHRzQnlQYXJ0W3BhcnRdPyB0aGVuIGNvbnRpbnVlXG4gICAgICBodG1sICs9IFwiXG4gICAgICAgIDx0cj48dGg+QXNzZXNzbWVudCAje3BhcnR9PC90aD48L3RyPlxuICAgICAgICA8dHI+XCJcblxuICAgICAgZm9yIHJlc3VsdCBpbiBAcmVzdWx0c0J5UGFydFtwYXJ0XVxuICAgICAgICBzdWJ0ZXN0TmFtZSA9IEBzdWJ0ZXN0cy5nZXQocmVzdWx0LmdldCgnc3VidGVzdElkJykpLmdldCgnbmFtZScpXG4gICAgICAgIGh0bWwgKz0gXCJcbiAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAje3Jlc3VsdC5nZXQoXCJpdGVtVHlwZVwiKS50aXRsZWl6ZSgpfSBjb3JyZWN0PGJyPlxuICAgICAgICAgICAgI3tzdWJ0ZXN0TmFtZX1cbiAgICAgICAgICA8L3RkPlxuICAgICAgICAgIDx0ZD4je3Jlc3VsdC5nZXQoXCJjb3JyZWN0XCIpfS8je3Jlc3VsdC5nZXQoXCJ0b3RhbFwiKX08L3RkPlwiXG4gICAgICBcbiAgICBodG1sICs9IFwiXG4gICAgPC90YWJsZT5cbiAgICA8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIGJhY2snPiN7dCgnYmFjaycpfTwvYnV0dG9uPlxuICAgIFwiXG4gICAgQCRlbC5odG1sIGh0bWxcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuIl19
