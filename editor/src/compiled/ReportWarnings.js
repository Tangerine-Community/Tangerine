Tangerine.ReportWarnings = {
  KlassToDateView: function(rawData) {
    var bucketKey, html, percentages, ref, result;
    result = [];
    ref = rawData.percentages;
    for (bucketKey in ref) {
      percentages = ref[bucketKey];
      html = "";
      if (this.nUnderX(0.2, 0.75, percentages)) {
        html += "<p>More than 20% of students got less than 75% on the " + bucketKey + " assessment. Re-teach the " + bucketKey + " component of the lesson during the next lesson.</p>";
      }
      result.push({
        "html": html
      });
    }
    return result;
  },
  StudentToDateView: function(rawData) {
    var bucketKey, html, percentage, ref, result;
    result = [];
    ref = rawData.percentages;
    for (bucketKey in ref) {
      percentage = ref[bucketKey];
      html = "";
      if ((_.flatten(percentage) / 100) < .75) {
        html += "<p>" + rawData.studentName + " got less than 75% on the " + bucketKey + " assessment. Re-teach the " + bucketKey + " component from applicable lessons during the next lesson.</p>";
      }
      result.push({
        "html": html
      });
    }
    return result;
  },
  nUnderX: function(n, x, percentages) {
    var i, len, percentage, totalCount, underCount;
    underCount = 0;
    totalCount = 0;
    for (i = 0, len = percentages.length; i < len; i++) {
      percentage = percentages[i];
      totalCount++;
      if (percentage / 100 < x) {
        underCount++;
      }
    }
    return (underCount / totalCount) > n;
  }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlcG9ydC9SZXBvcnRXYXJuaW5ncy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxDQUFDLGNBQVYsR0FFRTtFQUFBLGVBQUEsRUFBa0IsU0FBQyxPQUFEO0FBQ2hCLFFBQUE7SUFBQSxNQUFBLEdBQVM7QUFDVDtBQUFBLFNBQUEsZ0JBQUE7O01BQ0UsSUFBQSxHQUFPO01BQ1AsSUFBRyxJQUFDLENBQUEsT0FBRCxDQUFTLEdBQVQsRUFBYyxJQUFkLEVBQW9CLFdBQXBCLENBQUg7UUFDRSxJQUFBLElBQVEsd0RBQUEsR0FBeUQsU0FBekQsR0FBbUUsNEJBQW5FLEdBQStGLFNBQS9GLEdBQXlHLHVEQURuSDs7TUFFQSxNQUFNLENBQUMsSUFBUCxDQUNFO1FBQUEsTUFBQSxFQUFTLElBQVQ7T0FERjtBQUpGO0FBTUEsV0FBTztFQVJTLENBQWxCO0VBVUEsaUJBQUEsRUFBb0IsU0FBQyxPQUFEO0FBQ2xCLFFBQUE7SUFBQSxNQUFBLEdBQVM7QUFDVDtBQUFBLFNBQUEsZ0JBQUE7O01BQ0UsSUFBQSxHQUFPO01BQ1AsSUFBRyxDQUFDLENBQUMsQ0FBQyxPQUFGLENBQVUsVUFBVixDQUFBLEdBQXNCLEdBQXZCLENBQUEsR0FBOEIsR0FBakM7UUFDRSxJQUFBLElBQVEsS0FBQSxHQUFNLE9BQU8sQ0FBQyxXQUFkLEdBQTBCLDRCQUExQixHQUFzRCxTQUF0RCxHQUFnRSw0QkFBaEUsR0FBNEYsU0FBNUYsR0FBc0csaUVBRGhIOztNQUVBLE1BQU0sQ0FBQyxJQUFQLENBQ0U7UUFBQSxNQUFBLEVBQVMsSUFBVDtPQURGO0FBSkY7QUFNQSxXQUFPO0VBUlcsQ0FWcEI7RUFvQkEsT0FBQSxFQUFVLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxXQUFQO0FBQ1IsUUFBQTtJQUFBLFVBQUEsR0FBYTtJQUNiLFVBQUEsR0FBYTtBQUNiLFNBQUEsNkNBQUE7O01BQ0UsVUFBQTtNQUNBLElBQWdCLFVBQUEsR0FBYSxHQUFiLEdBQW1CLENBQW5DO1FBQUEsVUFBQSxHQUFBOztBQUZGO0FBR0EsV0FBTyxDQUFDLFVBQUEsR0FBYSxVQUFkLENBQUEsR0FBNEI7RUFOM0IsQ0FwQlYiLCJmaWxlIjoicmVwb3J0L1JlcG9ydFdhcm5pbmdzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiVGFuZ2VyaW5lLlJlcG9ydFdhcm5pbmdzID1cblxuICBLbGFzc1RvRGF0ZVZpZXcgOiAocmF3RGF0YSkgLT5cbiAgICByZXN1bHQgPSBbXVxuICAgIGZvciBidWNrZXRLZXksIHBlcmNlbnRhZ2VzIG9mIHJhd0RhdGEucGVyY2VudGFnZXNcbiAgICAgIGh0bWwgPSBcIlwiXG4gICAgICBpZiBAblVuZGVyWCAwLjIsIDAuNzUsIHBlcmNlbnRhZ2VzXG4gICAgICAgIGh0bWwgKz0gXCI8cD5Nb3JlIHRoYW4gMjAlIG9mIHN0dWRlbnRzIGdvdCBsZXNzIHRoYW4gNzUlIG9uIHRoZSAje2J1Y2tldEtleX0gYXNzZXNzbWVudC4gUmUtdGVhY2ggdGhlICN7YnVja2V0S2V5fSBjb21wb25lbnQgb2YgdGhlIGxlc3NvbiBkdXJpbmcgdGhlIG5leHQgbGVzc29uLjwvcD5cIlxuICAgICAgcmVzdWx0LnB1c2hcbiAgICAgICAgXCJodG1sXCIgOiBodG1sXG4gICAgcmV0dXJuIHJlc3VsdFxuXG4gIFN0dWRlbnRUb0RhdGVWaWV3IDogKHJhd0RhdGEpIC0+XG4gICAgcmVzdWx0ID0gW11cbiAgICBmb3IgYnVja2V0S2V5LCBwZXJjZW50YWdlIG9mIHJhd0RhdGEucGVyY2VudGFnZXNcbiAgICAgIGh0bWwgPSBcIlwiXG4gICAgICBpZiAoXy5mbGF0dGVuKHBlcmNlbnRhZ2UpLzEwMCkgPCAuNzVcbiAgICAgICAgaHRtbCArPSBcIjxwPiN7cmF3RGF0YS5zdHVkZW50TmFtZX0gZ290IGxlc3MgdGhhbiA3NSUgb24gdGhlICN7YnVja2V0S2V5fSBhc3Nlc3NtZW50LiBSZS10ZWFjaCB0aGUgI3tidWNrZXRLZXl9IGNvbXBvbmVudCBmcm9tIGFwcGxpY2FibGUgbGVzc29ucyBkdXJpbmcgdGhlIG5leHQgbGVzc29uLjwvcD5cIlxuICAgICAgcmVzdWx0LnB1c2hcbiAgICAgICAgXCJodG1sXCIgOiBodG1sXG4gICAgcmV0dXJuIHJlc3VsdFxuXG4gIG5VbmRlclggOiAobiwgeCwgcGVyY2VudGFnZXMpIC0+XG4gICAgdW5kZXJDb3VudCA9IDBcbiAgICB0b3RhbENvdW50ID0gMFxuICAgIGZvciBwZXJjZW50YWdlIGluIHBlcmNlbnRhZ2VzXG4gICAgICB0b3RhbENvdW50KytcbiAgICAgIHVuZGVyQ291bnQrKyBpZiBwZXJjZW50YWdlIC8gMTAwIDwgeFxuICAgIHJldHVybiAodW5kZXJDb3VudCAvIHRvdGFsQ291bnQpID4gblxuICAgICJdfQ==
