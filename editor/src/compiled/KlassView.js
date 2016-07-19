var KlassView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassView = (function(superClass) {
  extend(KlassView, superClass);

  function KlassView() {
    return KlassView.__super__.constructor.apply(this, arguments);
  }

  KlassView.prototype.className = "KlassView";

  KlassView.prototype.initialize = function(options) {
    var allAssessments;
    this.klass = options.klass;
    this.assessments = this.klass.assessments;
    this.results = [];
    allAssessments = new KlassAssessments;
    return allAssessments.fetch({
      success: (function(_this) {
        return function(assessmentCollection) {
          var results;
          _this.assessments = assessmentCollection.where({
            klassId: _this.klass.id
          });
          results = new Results;
          return results.fetch({
            success: function(resultCollection) {
              var assessment, i, len, ref;
              ref = _this.assessments;
              for (i = 0, len = ref.length; i < len; i++) {
                assessment = ref[i];
                assessment.results = resultCollection.where({
                  assessmentId: assessment.id
                });
              }
              return _this.render();
            }
          });
        };
      })(this)
    });
  };

  KlassView.prototype.render = function() {
    var assessment, grade, html, i, len, ref, ref1, stream, year;
    year = this.klass.get("year") || "";
    grade = this.klass.get("grade") || "";
    stream = this.klass.get("stream") || "";
    html = "<h1>" + (t('class')) + " " + stream + "</h1> <table> <tr><td>School year</td><td>" + year + "</td></tr> <tr><td>" + (t('grade')) + "</td><tr>" + grade + "</td></tr> </table> </div> <ul class='assessment_list'>";
    ref = this.assessments;
    for (i = 0, len = ref.length; i < len; i++) {
      assessment = ref[i];
      html += "<li data-id='" + assessment.id + "'>" + (assessment.get('name')) + " - " + ((ref1 = assessment.get('results')) != null ? ref1.length : void 0) + "</li>";
    }
    html += "</ul>";
    this.$el.html(html);
    return this.trigger("rendered");
  };

  return KlassView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtsYXNzL0tsYXNzVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxTQUFBO0VBQUE7OztBQUFNOzs7Ozs7O3NCQUVKLFNBQUEsR0FBWTs7c0JBRVosVUFBQSxHQUFZLFNBQUUsT0FBRjtBQUNWLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLE9BQU8sQ0FBQztJQUNqQixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxLQUFLLENBQUM7SUFDdEIsSUFBQyxDQUFBLE9BQUQsR0FBZTtJQUNmLGNBQUEsR0FBaUIsSUFBSTtXQUNyQixjQUFjLENBQUMsS0FBZixDQUNFO01BQUEsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxvQkFBRDtBQUNQLGNBQUE7VUFBQSxLQUFDLENBQUEsV0FBRCxHQUFlLG9CQUFvQixDQUFDLEtBQXJCLENBQTJCO1lBQUUsT0FBQSxFQUFVLEtBQUMsQ0FBQSxLQUFLLENBQUMsRUFBbkI7V0FBM0I7VUFDZixPQUFBLEdBQVUsSUFBSTtpQkFDZCxPQUFPLENBQUMsS0FBUixDQUNFO1lBQUEsT0FBQSxFQUFTLFNBQUMsZ0JBQUQ7QUFDUCxrQkFBQTtBQUFBO0FBQUEsbUJBQUEscUNBQUE7O2dCQUNFLFVBQVUsQ0FBQyxPQUFYLEdBQXFCLGdCQUFnQixDQUFDLEtBQWpCLENBQXVCO2tCQUFFLFlBQUEsRUFBZSxVQUFVLENBQUMsRUFBNUI7aUJBQXZCO0FBRHZCO3FCQUVBLEtBQUMsQ0FBQSxNQUFELENBQUE7WUFITyxDQUFUO1dBREY7UUFITztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVDtLQURGO0VBTFU7O3NCQWVaLE1BQUEsR0FBUSxTQUFBO0FBQ04sUUFBQTtJQUFBLElBQUEsR0FBUyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFYLENBQUEsSUFBd0I7SUFDakMsS0FBQSxHQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE9BQVgsQ0FBQSxJQUF3QjtJQUNqQyxNQUFBLEdBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsUUFBWCxDQUFBLElBQXdCO0lBQ2pDLElBQUEsR0FBTyxNQUFBLEdBQ0YsQ0FBQyxDQUFBLENBQUUsT0FBRixDQUFELENBREUsR0FDVSxHQURWLEdBQ2EsTUFEYixHQUNvQiw0Q0FEcEIsR0FHeUIsSUFIekIsR0FHOEIscUJBSDlCLEdBSUksQ0FBQyxDQUFBLENBQUUsT0FBRixDQUFELENBSkosR0FJZ0IsV0FKaEIsR0FJMkIsS0FKM0IsR0FJaUM7QUFJeEM7QUFBQSxTQUFBLHFDQUFBOztNQUNFLElBQUEsSUFBUSxlQUFBLEdBQWdCLFVBQVUsQ0FBQyxFQUEzQixHQUE4QixJQUE5QixHQUFpQyxDQUFDLFVBQVUsQ0FBQyxHQUFYLENBQWUsTUFBZixDQUFELENBQWpDLEdBQXdELEtBQXhELEdBQTRELGtEQUEwQixDQUFFLGVBQTVCLENBQTVELEdBQStGO0FBRHpHO0lBRUEsSUFBQSxJQUFRO0lBRVIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsSUFBVjtXQUNBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQWpCTTs7OztHQW5CYyxRQUFRLENBQUMiLCJmaWxlIjoia2xhc3MvS2xhc3NWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgS2xhc3NWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiS2xhc3NWaWV3XCJcblxuICBpbml0aWFsaXplOiAoIG9wdGlvbnMgKSAtPlxuICAgIEBrbGFzcyA9IG9wdGlvbnMua2xhc3NcbiAgICBAYXNzZXNzbWVudHMgPSBAa2xhc3MuYXNzZXNzbWVudHNcbiAgICBAcmVzdWx0cyAgICAgPSBbXVxuICAgIGFsbEFzc2Vzc21lbnRzID0gbmV3IEtsYXNzQXNzZXNzbWVudHNcbiAgICBhbGxBc3Nlc3NtZW50cy5mZXRjaFxuICAgICAgc3VjY2VzczogKGFzc2Vzc21lbnRDb2xsZWN0aW9uKSA9PlxuICAgICAgICBAYXNzZXNzbWVudHMgPSBhc3Nlc3NtZW50Q29sbGVjdGlvbi53aGVyZSB7IGtsYXNzSWQgOiBAa2xhc3MuaWQgfVxuICAgICAgICByZXN1bHRzID0gbmV3IFJlc3VsdHNcbiAgICAgICAgcmVzdWx0cy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChyZXN1bHRDb2xsZWN0aW9uKSA9PlxuICAgICAgICAgICAgZm9yIGFzc2Vzc21lbnQgaW4gQGFzc2Vzc21lbnRzXG4gICAgICAgICAgICAgIGFzc2Vzc21lbnQucmVzdWx0cyA9IHJlc3VsdENvbGxlY3Rpb24ud2hlcmUgeyBhc3Nlc3NtZW50SWQgOiBhc3Nlc3NtZW50LmlkIH1cbiAgICAgICAgICAgIEByZW5kZXIoKVxuXG4gIHJlbmRlcjogLT5cbiAgICB5ZWFyICAgPSBAa2xhc3MuZ2V0KFwieWVhclwiKSAgIHx8IFwiXCJcbiAgICBncmFkZSAgPSBAa2xhc3MuZ2V0KFwiZ3JhZGVcIikgIHx8IFwiXCJcbiAgICBzdHJlYW0gPSBAa2xhc3MuZ2V0KFwic3RyZWFtXCIpIHx8IFwiXCJcbiAgICBodG1sID0gXCJcbiAgICA8aDE+I3t0KCdjbGFzcycpfSAje3N0cmVhbX08L2gxPlxuICAgIDx0YWJsZT5cbiAgICAgIDx0cj48dGQ+U2Nob29sIHllYXI8L3RkPjx0ZD4je3llYXJ9PC90ZD48L3RyPlxuICAgICAgPHRyPjx0ZD4je3QoJ2dyYWRlJyl9PC90ZD48dHI+I3tncmFkZX08L3RkPjwvdHI+XG4gICAgPC90YWJsZT5cbiAgICA8L2Rpdj5cbiAgICA8dWwgY2xhc3M9J2Fzc2Vzc21lbnRfbGlzdCc+XCJcbiAgICBmb3IgYXNzZXNzbWVudCBpbiBAYXNzZXNzbWVudHNcbiAgICAgIGh0bWwgKz0gXCI8bGkgZGF0YS1pZD0nI3thc3Nlc3NtZW50LmlkfSc+I3thc3Nlc3NtZW50LmdldCAnbmFtZSd9IC0gI3thc3Nlc3NtZW50LmdldCgncmVzdWx0cycpPy5sZW5ndGh9PC9saT5cIlxuICAgIGh0bWwgKz0gXCI8L3VsPlwiXG5cbiAgICBAJGVsLmh0bWwgaHRtbFxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuIl19
