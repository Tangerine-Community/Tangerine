var AdminView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AdminView = (function(superClass) {
  extend(AdminView, superClass);

  function AdminView() {
    this.render = bind(this.render, this);
    return AdminView.__super__.constructor.apply(this, arguments);
  }

  AdminView.prototype.className = "AdminView";

  AdminView.prototype.events = {
    "click .update ": "update"
  };

  AdminView.prototype.update = function(event) {
    var $target, group;
    $target = $(event.target);
    group = $target.attr("data-group");
    return Utils.updateTangerine(null, {
      targetDB: group
    });
  };

  AdminView.prototype.getVersionNumber = function(group) {
    return $.ajax("/" + group + "/_design/" + Tangerine.design_doc + "/js/version.js", {
      dataType: "text",
      success: (function(_this) {
        return function(result) {
          console.log(result);
          return _this.$el.find("#" + group + "-version").html(result.match(/"(.*)"/)[1]);
        };
      })(this)
    });
  };

  AdminView.prototype.initialize = function(options) {
    return this.groups = options.groups;
  };

  AdminView.prototype.render = function() {
    var group, sortTable;
    sortTable = _.after(this.groups.length, function() {
      return $("table#active-groups").tablesorter({
        widgets: ['zebra'],
        sortList: [[5, 1]]
      });
    });
    this.$el.html("<h2>Group Activity</h2> <table id='active-groups' class='class_table'> <thead> " + (_(["Name", "Last Complete Result", "Total Assessments", "Total Results", "Version", "Last Result"]).map(function(header) {
      return "<th>" + header + "</th>";
    }).join("")) + " </thead> <tbody> " + (((function() {
      var i, len, ref, results;
      ref = this.groups;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        group = ref[i];
        results.push("<tr id='" + group + "'> <td> " + group + "<br> </td> <td class='last-result'>...</td> <td class='total-assessments'>...</td> <td class='total-results'>...</td> <td class='version'><div>...</div><button class='update command' data-group='" + group + "'>Update</button></td> <td class='last-timestamp'>...</td> </tr>");
      }
      return results;
    }).call(this)).join('')) + " </tbody> </table>");
    $("table#active-groups").tablesorter({
      widgets: ['zebra'],
      sortList: [[5, 1]]
    });
    _(this.groups).each((function(_this) {
      return function(group) {
        var $group;
        $group = _this.$el.find("#" + group);
        return $.ajax("/" + group + "/_design/" + Tangerine.design_doc + "/js/version.js", {
          dataType: "text",
          success: function(result) {
            $group.find(".version div").html(result.match(/"(.*)"/)[1]);
            return $.couch.db(group).view(Tangerine.design_doc + "/resultCount", {
              group: true,
              success: (function(_this) {
                return function(resultCounts) {
                  var groupTotalResults, resultCount;
                  $group.find(".total-assessments").html(resultCounts.rows.length);
                  groupTotalResults = 0;
                  while ((resultCount = resultCounts.rows.pop())) {
                    groupTotalResults += parseInt(resultCount.value);
                  }
                  $group.find(".total-results").html("<button class='results navigation'><a href='/" + group + "/_design/" + Tangerine.design_doc + "/index.html#dashboard'>" + groupTotalResults + "</a></button>");
                  return ($.couch.db(group).view(Tangerine.design_doc + "/completedResultsByEndTime", {
                    limit: 1,
                    descending: true,
                    success: function(result) {
                      if (result.rows[0] && result.rows[0].key) {
                        $group.find(".last-timestamp").html(moment(new Date(result.rows[0].key)).format("YYYY-MMM-DD HH:mm"));
                        return $group.find(".last-result").html(moment(result.rows[0].key).fromNow());
                      }
                    },
                    error: function() {
                      return console.log("Could not retrieve view 'completedResultsByEndTime' for " + group);
                    }
                  })).complete(function() {
                    return sortTable();
                  });
                };
              })(this)
            });
          }
        });
      };
    })(this));
    return this.trigger("rendered");
  };

  return AdminView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFkbWluL0FkbWluVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxTQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7c0JBRUosU0FBQSxHQUFZOztzQkFFWixNQUFBLEdBRUU7SUFBQSxnQkFBQSxFQUFtQixRQUFuQjs7O3NCQUVGLE1BQUEsR0FBUSxTQUFDLEtBQUQ7QUFDTixRQUFBO0lBQUEsT0FBQSxHQUFVLENBQUEsQ0FBRSxLQUFLLENBQUMsTUFBUjtJQUNWLEtBQUEsR0FBUSxPQUFPLENBQUMsSUFBUixDQUFhLFlBQWI7V0FDUixLQUFLLENBQUMsZUFBTixDQUFzQixJQUF0QixFQUNFO01BQUEsUUFBQSxFQUFXLEtBQVg7S0FERjtFQUhNOztzQkFNUixnQkFBQSxHQUFrQixTQUFDLEtBQUQ7V0FDaEIsQ0FBQyxDQUFDLElBQUYsQ0FBTyxHQUFBLEdBQUksS0FBSixHQUFVLFdBQVYsR0FBcUIsU0FBUyxDQUFDLFVBQS9CLEdBQTBDLGdCQUFqRCxFQUNFO01BQUEsUUFBQSxFQUFVLE1BQVY7TUFDQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7VUFDUCxPQUFPLENBQUMsR0FBUixDQUFZLE1BQVo7aUJBQ0EsS0FBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsR0FBQSxHQUFJLEtBQUosR0FBVSxVQUFwQixDQUE4QixDQUFDLElBQS9CLENBQW9DLE1BQU0sQ0FBQyxLQUFQLENBQWEsUUFBYixDQUF1QixDQUFBLENBQUEsQ0FBM0Q7UUFGTztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEVDtLQURGO0VBRGdCOztzQkFRbEIsVUFBQSxHQUFZLFNBQUUsT0FBRjtXQUNWLElBQUMsQ0FBQSxNQUFELEdBQVUsT0FBTyxDQUFDO0VBRFI7O3NCQUdaLE1BQUEsR0FBUSxTQUFBO0FBRU4sUUFBQTtJQUFBLFNBQUEsR0FBWSxDQUFDLENBQUMsS0FBRixDQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFB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UCxJQUFHLE1BQU0sQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFaLElBQW1CLE1BQU0sQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsR0FBckM7d0JBQ0UsTUFBTSxDQUFDLElBQVAsQ0FBWSxpQkFBWixDQUE4QixDQUFDLElBQS9CLENBQW9DLE1BQUEsQ0FBVyxJQUFBLElBQUEsQ0FBSyxNQUFNLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLEdBQXBCLENBQVgsQ0FBb0MsQ0FBQyxNQUFyQyxDQUE0QyxtQkFBNUMsQ0FBcEM7K0JBQ0EsTUFBTSxDQUFDLElBQVAsQ0FBWSxjQUFaLENBQTJCLENBQUMsSUFBNUIsQ0FBaUMsTUFBQSxDQUFPLE1BQU0sQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsR0FBdEIsQ0FBMEIsQ0FBQyxPQUEzQixDQUFBLENBQWpDLEVBRkY7O29CQURPLENBRlQ7b0JBT0EsS0FBQSxFQUFPLFNBQUE7NkJBQ0wsT0FBTyxDQUFDLEdBQVIsQ0FBWSwwREFBQSxHQUEyRCxLQUF2RTtvQkFESyxDQVBQO21CQURELENBQUQsQ0FXQyxDQUFDLFFBWEYsQ0FXVyxTQUFBOzJCQUFHLFNBQUEsQ0FBQTtrQkFBSCxDQVhYO2dCQVJPO2NBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURUO2FBREY7VUFKTyxDQURUO1NBREY7TUFIYztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEI7V0FpQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO0VBeEVNOzs7O0dBekJjLFFBQVEsQ0FBQyIsImZpbGUiOiJhZG1pbi9BZG1pblZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBBZG1pblZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJBZG1pblZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICAjXCJjaGFuZ2UgI2dyb3VwQnlcIjogXCJ1cGRhdGVcIlxuICAgIFwiY2xpY2sgLnVwZGF0ZSBcIiA6IFwidXBkYXRlXCIgXG5cbiAgdXBkYXRlOiAoZXZlbnQpIC0+XG4gICAgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KVxuICAgIGdyb3VwID0gJHRhcmdldC5hdHRyKFwiZGF0YS1ncm91cFwiKVxuICAgIFV0aWxzLnVwZGF0ZVRhbmdlcmluZSBudWxsLFxuICAgICAgdGFyZ2V0REIgOiBncm91cFxuXG4gIGdldFZlcnNpb25OdW1iZXI6IChncm91cCkgLT5cbiAgICAkLmFqYXggXCIvI3tncm91cH0vX2Rlc2lnbi8je1RhbmdlcmluZS5kZXNpZ25fZG9jfS9qcy92ZXJzaW9uLmpzXCIsXG4gICAgICBkYXRhVHlwZTogXCJ0ZXh0XCJcbiAgICAgIHN1Y2Nlc3M6IChyZXN1bHQpID0+XG4gICAgICAgIGNvbnNvbGUubG9nIHJlc3VsdFxuICAgICAgICBAJGVsLmZpbmQoXCIjI3tncm91cH0tdmVyc2lvblwiKS5odG1sIHJlc3VsdC5tYXRjaCgvXCIoLiopXCIvKVsxXVxuXG5cbiAgaW5pdGlhbGl6ZTogKCBvcHRpb25zICkgLT5cbiAgICBAZ3JvdXBzID0gb3B0aW9ucy5ncm91cHNcblxuICByZW5kZXI6ID0+XG5cbiAgICBzb3J0VGFibGUgPSBfLmFmdGVyIEBncm91cHMubGVuZ3RoLCAtPlxuICAgICAgJChcInRhYmxlI2FjdGl2ZS1ncm91cHNcIikudGFibGVzb3J0ZXJcbiAgICAgICAgd2lkZ2V0czogWyd6ZWJyYSddXG4gICAgICAgIHNvcnRMaXN0OiBbWzUsMV1dXG5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICAgIDxoMj5Hcm91cCBBY3Rpdml0eTwvaDI+XG4gICAgICA8dGFibGUgaWQ9J2FjdGl2ZS1ncm91cHMnIGNsYXNzPSdjbGFzc190YWJsZSc+XG4gICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAje18oW1xuICAgICAgICAgICAgXCJOYW1lXCJcbiAgICAgICAgICAgIFwiTGFzdCBDb21wbGV0ZSBSZXN1bHRcIlxuICAgICAgICAgICAgXCJUb3RhbCBBc3Nlc3NtZW50c1wiXG4gICAgICAgICAgICBcIlRvdGFsIFJlc3VsdHNcIlxuICAgICAgICAgICAgXCJWZXJzaW9uXCJcbiAgICAgICAgICAgIFwiTGFzdCBSZXN1bHRcIlxuICAgICAgICAgIF0pLm1hcCggKGhlYWRlcikgLT4gXCI8dGg+I3toZWFkZXJ9PC90aD5cIikuam9pbihcIlwiKX1cbiAgICAgICAgPC90aGVhZD5cbiAgICAgICAgPHRib2R5PlxuICAgICAgICAgICN7KFwiPHRyIGlkPScje2dyb3VwfSc+XG4gICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAje2dyb3VwfTxicj5cbiAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgPHRkIGNsYXNzPSdsYXN0LXJlc3VsdCc+Li4uPC90ZD5cbiAgICAgICAgICAgICAgPHRkIGNsYXNzPSd0b3RhbC1hc3Nlc3NtZW50cyc+Li4uPC90ZD5cbiAgICAgICAgICAgICAgPHRkIGNsYXNzPSd0b3RhbC1yZXN1bHRzJz4uLi48L3RkPlxuICAgICAgICAgICAgICA8dGQgY2xhc3M9J3ZlcnNpb24nPjxkaXY+Li4uPC9kaXY+PGJ1dHRvbiBjbGFzcz0ndXBkYXRlIGNvbW1hbmQnIGRhdGEtZ3JvdXA9JyN7Z3JvdXB9Jz5VcGRhdGU8L2J1dHRvbj48L3RkPlxuICAgICAgICAgICAgICA8dGQgY2xhc3M9J2xhc3QtdGltZXN0YW1wJz4uLi48L3RkPlxuICAgICAgICAgICAgPC90cj5cIiBmb3IgZ3JvdXAgaW4gQGdyb3Vwcykuam9pbignJyl9XG4gICAgICAgIDwvdGJvZHk+XG4gICAgICA8L3RhYmxlPlxuICAgIFwiXG5cbiAgICAkKFwidGFibGUjYWN0aXZlLWdyb3Vwc1wiKS50YWJsZXNvcnRlclxuICAgICAgICB3aWRnZXRzOiBbJ3plYnJhJ11cbiAgICAgICAgc29ydExpc3Q6IFtbNSwxXV1cblxuICAgIF8oQGdyb3VwcykuZWFjaCAoZ3JvdXApID0+XG5cbiAgICAgICRncm91cCA9IEAkZWwuZmluZChcIiMje2dyb3VwfVwiKVxuICAgICAgJC5hamF4IFwiLyN7Z3JvdXB9L19kZXNpZ24vI3tUYW5nZXJpbmUuZGVzaWduX2RvY30vanMvdmVyc2lvbi5qc1wiLFxuICAgICAgICBkYXRhVHlwZTogXCJ0ZXh0XCJcbiAgICAgICAgc3VjY2VzczogKHJlc3VsdCkgLT5cbiAgICAgICAgICAkZ3JvdXAuZmluZChcIi52ZXJzaW9uIGRpdlwiKS5odG1sIHJlc3VsdC5tYXRjaCgvXCIoLiopXCIvKVsxXVxuXG5cbiAgICAgICAgICAkLmNvdWNoLmRiKGdyb3VwKS52aWV3IFRhbmdlcmluZS5kZXNpZ25fZG9jICsgXCIvcmVzdWx0Q291bnRcIixcbiAgICAgICAgICAgIGdyb3VwOiB0cnVlXG4gICAgICAgICAgICBzdWNjZXNzOiAocmVzdWx0Q291bnRzKSA9PlxuXG4gICAgICAgICAgICAgICRncm91cC5maW5kKFwiLnRvdGFsLWFzc2Vzc21lbnRzXCIpLmh0bWwgcmVzdWx0Q291bnRzLnJvd3MubGVuZ3RoXG5cbiAgICAgICAgICAgICAgZ3JvdXBUb3RhbFJlc3VsdHMgPSAwXG4gICAgICAgICAgICAgIGdyb3VwVG90YWxSZXN1bHRzICs9IHBhcnNlSW50KHJlc3VsdENvdW50LnZhbHVlKSB3aGlsZSAocmVzdWx0Q291bnQgPSByZXN1bHRDb3VudHMucm93cy5wb3AoKSlcbiAgICAgICAgICAgICAgJGdyb3VwLmZpbmQoXCIudG90YWwtcmVzdWx0c1wiKS5odG1sIFwiPGJ1dHRvbiBjbGFzcz0ncmVzdWx0cyBuYXZpZ2F0aW9uJz48YSBocmVmPScvI3tncm91cH0vX2Rlc2lnbi8je1RhbmdlcmluZS5kZXNpZ25fZG9jfS9pbmRleC5odG1sI2Rhc2hib2FyZCc+I3tncm91cFRvdGFsUmVzdWx0c308L2E+PC9idXR0b24+XCJcblxuICAgICAgICAgICAgICAoJC5jb3VjaC5kYihncm91cCkudmlldyBUYW5nZXJpbmUuZGVzaWduX2RvYyArIFwiL2NvbXBsZXRlZFJlc3VsdHNCeUVuZFRpbWVcIixcbiAgICAgICAgICAgICAgICBsaW1pdDogMVxuICAgICAgICAgICAgICAgIGRlc2NlbmRpbmc6IHRydWVcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzdWx0KSA9PlxuICAgICAgICAgICAgICAgICAgaWYgcmVzdWx0LnJvd3NbMF0gYW5kIHJlc3VsdC5yb3dzWzBdLmtleVxuICAgICAgICAgICAgICAgICAgICAkZ3JvdXAuZmluZChcIi5sYXN0LXRpbWVzdGFtcFwiKS5odG1sIG1vbWVudChuZXcgRGF0ZShyZXN1bHQucm93c1swXS5rZXkpKS5mb3JtYXQoXCJZWVlZLU1NTS1ERCBISDptbVwiKVxuICAgICAgICAgICAgICAgICAgICAkZ3JvdXAuZmluZChcIi5sYXN0LXJlc3VsdFwiKS5odG1sIG1vbWVudChyZXN1bHQucm93c1swXS5rZXkpLmZyb21Ob3coKVxuXG4gICAgICAgICAgICAgICAgZXJyb3I6ICgpID0+XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBcIkNvdWxkIG5vdCByZXRyaWV2ZSB2aWV3ICdjb21wbGV0ZWRSZXN1bHRzQnlFbmRUaW1lJyBmb3IgI3tncm91cH1cIlxuXG4gICAgICAgICAgICAgICkuY29tcGxldGUgPT4gc29ydFRhYmxlKClcblxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4iXX0=
