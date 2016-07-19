var CurriculumView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CurriculumView = (function(superClass) {
  extend(CurriculumView, superClass);

  function CurriculumView() {
    return CurriculumView.__super__.constructor.apply(this, arguments);
  }

  CurriculumView.prototype.className = "CurriculumView";

  CurriculumView.prototype.events = {
    "click .back": "goBack",
    "click .delete": "deleteCurriculum",
    "click .delete_subtest": "deleteSubtest",
    "click .edit_in_place": "editInPlace",
    'click .new_subtest': "newSubtest",
    "focusout .editing": "editing",
    "keyup    .editing": "editing",
    "keydown  .editing": "editing"
  };

  CurriculumView.prototype.initialize = function(options) {
    this.curriculum = options.curriculum;
    this.subtests = options.subtests;
    this.questions = options.questions;
    this.questionsBySubtestId = this.questions.indexBy("subtestId");
    this.totalAssessments = Math.max.apply(Math, this.subtests.pluck("part"));
    this.subtestsByPart = this.subtests.indexArrayBy("part");
    return this.subtestProperties = {
      "grid": [
        {
          "key": "part",
          "label": "Assessment",
          "editable": true
        }, {
          "key": "name",
          "label": "Name",
          "editable": true,
          "escaped": true
        }, {
          "key": "timer",
          "label": "Time<br>allowed",
          "editable": true
        }, {
          "key": "reportType",
          "label": "Report",
          "editable": true
        }, {
          "key": "items",
          "label": "Items",
          "count": true,
          "editable": true
        }
      ],
      "survey": [
        {
          "key": "part",
          "label": "Assessment",
          "editable": true
        }, {
          "key": "name",
          "label": "Name",
          "editable": true
        }, {
          "key": "reportType",
          "label": "Report",
          "editable": true
        }
      ]
    };
  };

  CurriculumView.prototype.render = function() {
    var deleteButton, html, newButtons, subtestTable;
    subtestTable = this.getSubtestTable();
    deleteButton = "<button class='command_red delete'>Delete</button>";
    newButtons = "<button class='command new_subtest' data-prototype='grid'>New Grid Subtest</button><br> <button class='command new_subtest' data-prototype='survey'>New Survey Subtest</button>";
    html = "<button class='navigation back'>" + (t('back')) + "</button> <h1>" + (this.curriculum.get('name')) + "</h1> <div class='small_grey'>Download key <b>" + (this.curriculum.id.substr(-5, 5)) + "</b></div> <div id='subtest_table_container'> " + subtestTable + " </div> " + (newButtons || "") + " <br><br> " + deleteButton;
    this.$el.html(html);
    return this.trigger("rendered");
  };

  CurriculumView.prototype.updateTable = function() {
    return this.$el.find("#subtest_table_container").html(this.getSubtestTable());
  };

  CurriculumView.prototype.getSubtestTable = function() {
    var bodyHtml, headerHtml, html, i, items, j, len, len1, part, prompts, prop, question, ref, ref1, subtest, subtests;
    html = "<table class='subtests'>";
    html += "<tbody>";
    this.subtestsByPart = this.subtests.indexArrayBy("part");
    ref = this.subtestsByPart;
    for (part in ref) {
      subtests = ref[part];
      html += "<tr><td>&nbsp;</td></tr>";
      for (i = 0, len = subtests.length; i < len; i++) {
        subtest = subtests[i];
        headerHtml = bodyHtml = "";
        ref1 = this.subtestProperties[subtest.get("prototype")];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          prop = ref1[j];
          headerHtml += "<th>" + prop.label + "</th>";
          bodyHtml += this.propCook(prop, subtest);
        }
        html += "<tr>" + headerHtml + "</tr>";
        html += "<tr>" + bodyHtml;
        html += "<td> <a href='#class/subtest/" + subtest.id + "'><img class='link_icon edit' title='Edit' src='images/icon_edit.png'></a> <img class='link_icon delete_subtest' title='Delete' data-subtestId='" + subtest.id + "' src='images/icon_delete.png'> <a href='#class/run/test/" + subtest.id + "'><img class='link_icon testRun' title='Test run' src='images/icon_run.png'></a> </td> </tr>";
        if (subtest.get("prototype") === "grid") {
          items = subtest.get("items").join(" ");
          html += "<tr><td colspan='" + this.subtestProperties['grid'].length + "'>" + items + "</td></tr>";
        }
        if (subtest.get("prototype") === "survey" && (this.questionsBySubtestId[subtest.id] != null)) {
          prompts = ((function() {
            var k, len2, ref2, results;
            ref2 = this.questionsBySubtestId[subtest.id];
            results = [];
            for (k = 0, len2 = ref2.length; k < len2; k++) {
              question = ref2[k];
              results.push(question.get("prompt"));
            }
            return results;
          }).call(this)).join(", ");
          html += "<tr><td colspan='" + this.subtestProperties['survey'].length + "'>" + prompts + "</td></tr>";
        }
      }
    }
    html += "</tbody> </table>";
    return html;
  };

  CurriculumView.prototype.propCook = function(prop, subtest) {
    var editOrNot, numberOrNot, value;
    value = prop.key != null ? subtest.get(prop.key) : "&nbsp;";
    value = prop.escape ? subtest.escape(prop.key) : value;
    if (prop.count != null) {
      value = value.length;
    }
    if (value == null) {
      value = "";
    }
    editOrNot = prop.editable ? "class='edit_in_place'" : "";
    numberOrNot = _.isNumber(value) ? "data-isNumber='true'" : "data-isNumber='false'";
    return "<td class='edit_in_place'><span data-subtestId='" + subtest.id + "' data-key='" + prop.key + "' data-value='" + value + "' " + editOrNot + " " + numberOrNot + ">" + value + "</div></td>";
  };

  CurriculumView.prototype.editInPlace = function(event) {
    var $span, $target, $td, $textarea, classes, guid, isNumber, key, margins, oldValue, subtest, subtestId, transferVariables;
    if (this.alreadyEditing) {
      return;
    }
    this.alreadyEditing = true;
    $span = $(event.target);
    if ($span.prop("tagName") === "TD") {
      $span = $span.find("span");
      if ($span.length === 0) {
        return;
      }
    }
    $td = $span.parent();
    this.$oldSpan = $span.clone();
    if ($span.prop("tagName") === "TEXTAREA") {
      return;
    }
    guid = Utils.guid();
    key = $span.attr("data-key");
    isNumber = $span.attr("data-isNumber") === "true";
    subtestId = $span.attr("data-subtestId");
    subtest = this.subtests.get(subtestId);
    oldValue = subtest.get(key);
    $target = $(event.target);
    classes = ($target.attr("class") || "").replace("settings", "");
    margins = $target.css("margin");
    if (key === 'items') {
      oldValue = oldValue.join(" ");
    }
    transferVariables = "data-isNumber='" + isNumber + "' data-key='" + key + "' data-subtestId='" + subtestId + "' ";
    $td.html("<textarea id='" + guid + "' " + transferVariables + " class='editing " + classes + "' style='margin:" + margins + "'>" + oldValue + "</textarea>");
    $textarea = $("#" + guid);
    return $textarea.focus();
  };

  CurriculumView.prototype.editing = function(event) {
    var $target, $td, attributes, isNumber, key, newValue, oldValue, subtest, subtestId;
    $target = $(event.target);
    $td = $target.parent();
    if (event.which === 27 || event.type === "focusout") {
      $target.remove();
      $td.html(this.$oldSpan);
      this.alreadyEditing = false;
      return;
    }
    if (!(event.which === 13 && event.type === "keydown")) {
      return true;
    }
    this.alreadyEditing = false;
    key = $target.attr("data-key");
    isNumber = $target.attr("data-isNumber") === "true";
    subtestId = $target.attr("data-subtestId");
    subtest = this.subtests.get(subtestId);
    oldValue = subtest.get(key);
    newValue = $target.val();
    newValue = isNumber ? parseInt(newValue) : newValue;
    if (key === "items") {
      newValue = newValue.replace(/\s+/g, ' ');
      if (/\t|,/.test(newValue)) {
        alert("Please remember\n\nGrid items are space \" \" delimited");
      }
      newValue = _.compact(newValue.split(" "));
    }
    if (String(newValue) !== String(oldValue)) {
      attributes = {};
      attributes[key] = newValue;
      subtest.save(attributes, {
        success: (function(_this) {
          return function() {
            Utils.midAlert("Subtest saved");
            return subtest.fetch({
              success: function() {
                return _this.updateTable();
              }
            });
          };
        })(this),
        error: (function(_this) {
          return function() {
            return subtest.fetch({
              success: function() {
                _this.updateTable();
                return alert("Please try to save again, it didn't work that time.");
              }
            });
          };
        })(this)
      });
    }
    return false;
  };

  CurriculumView.prototype.goBack = function() {
    return Tangerine.router.navigate("assessments", true);
  };

  CurriculumView.prototype.deleteCurriculum = function() {
    if (confirm("Delete curriculum\n" + (this.curriculum.get('name')) + "?")) {
      return this.curriculum.destroy((function(_this) {
        return function() {
          return Tangerine.router.navigate("assessments", true);
        };
      })(this));
    }
  };

  CurriculumView.prototype.newSubtest = function(event) {
    var guid, protoTemps, prototype, subtest, subtestAttributes;
    prototype = $(event.target).attr("data-prototype");
    guid = Utils.guid();
    subtestAttributes = {
      "_id": guid,
      "curriculumId": this.curriculum.id,
      "prototype": prototype,
      "captureLastAttempted": false,
      "endOfLine": false
    };
    protoTemps = Tangerine.templates.get("prototypes");
    subtestAttributes = $.extend(protoTemps[prototype], subtestAttributes);
    subtest = new Subtest(subtestAttributes);
    return subtest.save(null, {
      success: function() {
        return Tangerine.router.navigate("class/subtest/" + guid, true);
      },
      error: function() {
        return alert("Please try again. There was a problem creating the new subtest.");
      }
    });
  };

  CurriculumView.prototype.deleteSubtest = function(event) {
    var subtest, subtestId;
    subtestId = $(event.target).attr("data-subtestId");
    subtest = this.subtests.get(subtestId);
    if (confirm("Delete subtest\n" + (subtest.get('name')) + "?")) {
      return subtest.destroy({
        success: (function(_this) {
          return function() {
            _this.subtests.remove(subtestId);
            return _this.updateTable();
          };
        })(this),
        error: (function(_this) {
          return function() {
            return alert("Please try again, could not delete subtest.");
          };
        })(this)
      });
    }
  };

  return CurriculumView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImN1cnJpY3VsdW0vQ3VycmljdWx1bVZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLElBQUEsY0FBQTtFQUFBOzs7QUFBTTs7Ozs7OzsyQkFFSixTQUFBLEdBQVc7OzJCQUVYLE1BQUEsR0FDRTtJQUFBLGFBQUEsRUFBMEIsUUFBMUI7SUFDQSxlQUFBLEVBQTBCLGtCQUQxQjtJQUVBLHVCQUFBLEVBQTBCLGVBRjFCO0lBR0Esc0JBQUEsRUFBMEIsYUFIMUI7SUFJQSxvQkFBQSxFQUEwQixZQUoxQjtJQU1BLG1CQUFBLEVBQXNCLFNBTnRCO0lBT0EsbUJBQUEsRUFBc0IsU0FQdEI7SUFRQSxtQkFBQSxFQUFzQixTQVJ0Qjs7OzJCQVVGLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFHVixJQUFDLENBQUEsVUFBRCxHQUFjLE9BQU8sQ0FBQztJQUN0QixJQUFDLENBQUEsUUFBRCxHQUFjLE9BQU8sQ0FBQztJQUN0QixJQUFDLENBQUEsU0FBRCxHQUFjLE9BQU8sQ0FBQztJQUN0QixJQUFDLENBQUEsb0JBQUQsR0FBd0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFYLENBQW1CLFdBQW5CO0lBR3hCLElBQUMsQ0FBQSxnQkFBRCxHQUFxQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQVQsQ0FBZSxJQUFmLEVBQXFCLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBVixDQUFnQixNQUFoQixDQUFyQjtJQUNyQixJQUFDLENBQUEsY0FBRCxHQUFxQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsTUFBdkI7V0FDckIsSUFBQyxDQUFBLGlCQUFELEdBQ0U7TUFBQSxNQUFBLEVBQVM7UUFDUDtVQUNFLEtBQUEsRUFBYSxNQURmO1VBRUUsT0FBQSxFQUFhLFlBRmY7VUFHRSxVQUFBLEVBQWEsSUFIZjtTQURPLEVBTVA7VUFDRSxLQUFBLEVBQWEsTUFEZjtVQUVFLE9BQUEsRUFBYSxNQUZmO1VBR0UsVUFBQSxFQUFhLElBSGY7VUFJRSxTQUFBLEVBQWEs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T0FBQSxDQUFRLGlCQUFSO1dBQ2QsT0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFiLEVBQ0U7TUFBQSxPQUFBLEVBQVMsU0FBQTtlQUNQLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBakIsQ0FBMEIsZ0JBQUEsR0FBaUIsSUFBM0MsRUFBbUQsSUFBbkQ7TUFETyxDQUFUO01BRUEsS0FBQSxFQUFPLFNBQUE7ZUFDTCxLQUFBLENBQU0saUVBQU47TUFESyxDQUZQO0tBREY7RUFmVTs7MkJBcUJaLGFBQUEsR0FBZSxTQUFDLEtBQUQ7QUFDYixRQUFBO0lBQUEsU0FBQSxHQUFZLENBQUEsQ0FBRSxLQUFLLENBQUMsTUFBUixDQUFlLENBQUMsSUFBaEIsQ0FBcUIsZ0JBQXJCO0lBQ1osT0FBQSxHQUFVLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLFNBQWQ7SUFDVixJQUFHLE9BQUEsQ0FBUSxrQkFBQSxHQUFrQixDQUFDLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBWixDQUFELENBQWxCLEdBQXVDLEdBQS9DLENBQUg7YUFDRSxPQUFPLENBQUMsT0FBUixDQUNFO1FBQUEsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7WUFDUCxLQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsU0FBakI7bUJBQ0EsS0FBQyxDQUFBLFdBQUQsQ0FBQTtVQUZPO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFUO1FBR0EsS0FBQSxFQUFPLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ0wsS0FBQSxDQUFNLDZDQUFOO1VBREs7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSFA7T0FERixFQURGOztFQUhhOzs7O0dBL1NZLFFBQVEsQ0FBQyIsImZpbGUiOiJjdXJyaWN1bHVtL0N1cnJpY3VsdW1WaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiIyBIYXJyeSBQb3R0ZXJcbmNsYXNzIEN1cnJpY3VsdW1WaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJDdXJyaWN1bHVtVmlld1wiXG5cbiAgZXZlbnRzOlxuICAgIFwiY2xpY2sgLmJhY2tcIiAgICAgICAgICAgOiBcImdvQmFja1wiXG4gICAgXCJjbGljayAuZGVsZXRlXCIgICAgICAgICA6IFwiZGVsZXRlQ3VycmljdWx1bVwiXG4gICAgXCJjbGljayAuZGVsZXRlX3N1YnRlc3RcIiA6IFwiZGVsZXRlU3VidGVzdFwiXG4gICAgXCJjbGljayAuZWRpdF9pbl9wbGFjZVwiICA6IFwiZWRpdEluUGxhY2VcIlxuICAgICdjbGljayAubmV3X3N1YnRlc3QnICAgIDogXCJuZXdTdWJ0ZXN0XCJcblxuICAgIFwiZm9jdXNvdXQgLmVkaXRpbmdcIiA6IFwiZWRpdGluZ1wiXG4gICAgXCJrZXl1cCAgICAuZWRpdGluZ1wiIDogXCJlZGl0aW5nXCJcbiAgICBcImtleWRvd24gIC5lZGl0aW5nXCIgOiBcImVkaXRpbmdcIlxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgIyBhcmd1bWVudHNcbiAgICBAY3VycmljdWx1bSA9IG9wdGlvbnMuY3VycmljdWx1bVxuICAgIEBzdWJ0ZXN0cyAgID0gb3B0aW9ucy5zdWJ0ZXN0c1xuICAgIEBxdWVzdGlvbnMgID0gb3B0aW9ucy5xdWVzdGlvbnNcbiAgICBAcXVlc3Rpb25zQnlTdWJ0ZXN0SWQgPSBAcXVlc3Rpb25zLmluZGV4QnkgXCJzdWJ0ZXN0SWRcIlxuXG4gICAgIyBwcmltYXJpZXNcbiAgICBAdG90YWxBc3Nlc3NtZW50cyAgPSBNYXRoLm1heC5hcHBseSBNYXRoLCBAc3VidGVzdHMucGx1Y2soXCJwYXJ0XCIpXG4gICAgQHN1YnRlc3RzQnlQYXJ0ICAgID0gQHN1YnRlc3RzLmluZGV4QXJyYXlCeSBcInBhcnRcIlxuICAgIEBzdWJ0ZXN0UHJvcGVydGllcyA9IFxuICAgICAgXCJncmlkXCIgOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcImtleVwiICAgICAgOiBcInBhcnRcIlxuICAgICAgICAgIFwibGFiZWxcIiAgICA6IFwiQXNzZXNzbWVudFwiXG4gICAgICAgICAgXCJlZGl0YWJsZVwiIDogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJrZXlcIiAgICAgIDogXCJuYW1lXCJcbiAgICAgICAgICBcImxhYmVsXCIgICAgOiBcIk5hbWVcIlxuICAgICAgICAgIFwiZWRpdGFibGVcIiA6IHRydWVcbiAgICAgICAgICBcImVzY2FwZWRcIiAgOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImtleVwiICAgICAgOiBcInRpbWVyXCJcbiAgICAgICAgICBcImxhYmVsXCIgICAgOiBcIlRpbWU8YnI+YWxsb3dlZFwiXG4gICAgICAgICAgXCJlZGl0YWJsZVwiIDogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJrZXlcIiAgICAgIDogXCJyZXBvcnRUeXBlXCJcbiAgICAgICAgICBcImxhYmVsXCIgICAgOiBcIlJlcG9ydFwiXG4gICAgICAgICAgXCJlZGl0YWJsZVwiIDogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJrZXlcIiAgICAgIDogXCJpdGVtc1wiXG4gICAgICAgICAgXCJsYWJlbFwiICAgIDogXCJJdGVtc1wiXG4gICAgICAgICAgXCJjb3VudFwiICAgIDogdHJ1ZVxuICAgICAgICAgIFwiZWRpdGFibGVcIiA6IHRydWVcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIFwic3VydmV5XCIgOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcImtleVwiIDogXCJwYXJ0XCJcbiAgICAgICAgICBcImxhYmVsXCIgOiBcIkFzc2Vzc21lbnRcIlxuICAgICAgICAgIFwiZWRpdGFibGVcIiA6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwia2V5XCIgOiBcIm5hbWVcIlxuICAgICAgICAgIFwibGFiZWxcIiA6IFwiTmFtZVwiXG4gICAgICAgICAgXCJlZGl0YWJsZVwiIDogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJrZXlcIiAgICAgIDogXCJyZXBvcnRUeXBlXCJcbiAgICAgICAgICBcImxhYmVsXCIgICAgOiBcIlJlcG9ydFwiXG4gICAgICAgICAgXCJlZGl0YWJsZVwiIDogdHJ1ZVxuICAgICAgICB9XG4gICAgICBdXG5cblxuICByZW5kZXI6IC0+XG5cbiAgICBzdWJ0ZXN0VGFibGUgPSBAZ2V0U3VidGVzdFRhYmxlKClcblxuICAgIGRlbGV0ZUJ1dHRvbiA9IFwiPGJ1dHRvbiBjbGFzcz0nY29tbWFuZF9yZWQgZGVsZXRlJz5EZWxldGU8L2J1dHRvbj5cIlxuXG4gICAgbmV3QnV0dG9ucyA9IFwiXG4gICAgICAgIDxidXR0b24gY2xhc3M9J2NvbW1hbmQgbmV3X3N1YnRlc3QnIGRhdGEtcHJvdG90eXBlPSdncmlkJz5OZXcgR3JpZCBTdWJ0ZXN0PC9idXR0b24+PGJyPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPSdjb21tYW5kIG5ld19zdWJ0ZXN0JyBkYXRhLXByb3RvdHlwZT0nc3VydmV5Jz5OZXcgU3VydmV5IFN1YnRlc3Q8L2J1dHRvbj5cbiAgICBcIlxuXG4gICAgaHRtbCA9IFwiXG5cbiAgICAgIDxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gYmFjayc+I3t0KCdiYWNrJyl9PC9idXR0b24+XG4gICAgICA8aDE+I3tAY3VycmljdWx1bS5nZXQoJ25hbWUnKX08L2gxPlxuXG4gICAgICA8ZGl2IGNsYXNzPSdzbWFsbF9ncmV5Jz5Eb3dubG9hZCBrZXkgPGI+I3tAY3VycmljdWx1bS5pZC5zdWJzdHIoLTUsNSl9PC9iPjwvZGl2PlxuICAgICAgXG4gICAgICA8ZGl2IGlkPSdzdWJ0ZXN0X3RhYmxlX2NvbnRhaW5lcic+XG4gICAgICAgICN7c3VidGVzdFRhYmxlfVxuICAgICAgPC9kaXY+XG5cbiAgICAgICN7bmV3QnV0dG9ucyB8fCBcIlwifVxuICAgICAgPGJyPjxicj5cblxuICAgICAgI3tkZWxldGVCdXR0b259XG5cbiAgICBcIlxuXG4gICAgQCRlbC5odG1sIGh0bWxcbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICB1cGRhdGVUYWJsZTogLT4gQCRlbC5maW5kKFwiI3N1YnRlc3RfdGFibGVfY29udGFpbmVyXCIpLmh0bWwgQGdldFN1YnRlc3RUYWJsZSgpXG5cbiAgZ2V0U3VidGVzdFRhYmxlOiAtPlxuXG4gICAgaHRtbCA9IFwiPHRhYmxlIGNsYXNzPSdzdWJ0ZXN0cyc+XCJcblxuICAgIGh0bWwgKz0gXCJcbiAgICAgIDx0Ym9keT5cbiAgICBcIlxuICAgIEBzdWJ0ZXN0c0J5UGFydCA9IEBzdWJ0ZXN0cy5pbmRleEFycmF5QnkgXCJwYXJ0XCJcbiAgICBmb3IgcGFydCwgc3VidGVzdHMgb2YgQHN1YnRlc3RzQnlQYXJ0XG4gICAgICBodG1sICs9IFwiPHRyPjx0ZD4mbmJzcDs8L3RkPjwvdHI+XCJcbiAgICAgIGZvciBzdWJ0ZXN0IGluIHN1YnRlc3RzXG4gICAgICAgIGhlYWRlckh0bWwgPSBib2R5SHRtbCA9IFwiXCJcblxuICAgICAgICBmb3IgcHJvcCBpbiBAc3VidGVzdFByb3BlcnRpZXNbc3VidGVzdC5nZXQoXCJwcm90b3R5cGVcIildXG4gICAgICAgICAgaGVhZGVySHRtbCArPSBcIjx0aD4je3Byb3AubGFiZWx9PC90aD5cIlxuICAgICAgICAgIGJvZHlIdG1sICs9IEBwcm9wQ29vayhwcm9wLCBzdWJ0ZXN0KVxuXG4gICAgICAgIGh0bWwgKz0gXCI8dHI+I3toZWFkZXJIdG1sfTwvdHI+XCJcbiAgICAgICAgaHRtbCArPSBcIjx0cj4je2JvZHlIdG1sfVwiXG5cblxuICAgICAgICAjIGFkZCBidXR0b25zIGZvciBzZXJ2ZXJzaWRlIGVkaXRpbmdcbiAgICAgICAgaHRtbCArPSBcIlxuICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgIDxhIGhyZWY9JyNjbGFzcy9zdWJ0ZXN0LyN7c3VidGVzdC5pZH0nPjxpbWcgY2xhc3M9J2xpbmtfaWNvbiBlZGl0JyB0aXRsZT0nRWRpdCcgc3JjPSdpbWFnZXMvaWNvbl9lZGl0LnBuZyc+PC9hPlxuICAgICAgICAgICAgPGltZyBjbGFzcz0nbGlua19pY29uIGRlbGV0ZV9zdWJ0ZXN0JyB0aXRsZT0nRGVsZXRlJyBkYXRhLXN1YnRlc3RJZD0nI3tzdWJ0ZXN0LmlkfScgc3JjPSdpbWFnZXMvaWNvbl9kZWxldGUucG5nJz5cbiAgICAgICAgICAgIDxhIGhyZWY9JyNjbGFzcy9ydW4vdGVzdC8je3N1YnRlc3QuaWR9Jz48aW1nIGNsYXNzPSdsaW5rX2ljb24gdGVzdFJ1bicgdGl0bGU9J1Rlc3QgcnVuJyBzcmM9J2ltYWdlcy9pY29uX3J1bi5wbmcnPjwvYT5cbiAgICAgICAgICA8L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICBcIlxuXG4gICAgICAgICMgcXVpY2sgcHJldmlld3Mgb2Ygc3VidGVzdCBjb250ZW50c1xuICAgICAgICBpZiBzdWJ0ZXN0LmdldChcInByb3RvdHlwZVwiKSA9PSBcImdyaWRcIlxuICAgICAgICAgIGl0ZW1zID0gc3VidGVzdC5nZXQoXCJpdGVtc1wiKS5qb2luIFwiIFwiXG4gICAgICAgICAgaHRtbCArPSBcIjx0cj48dGQgY29sc3Bhbj0nI3tAc3VidGVzdFByb3BlcnRpZXNbJ2dyaWQnXS5sZW5ndGh9Jz4je2l0ZW1zfTwvdGQ+PC90cj5cIlxuICAgICAgICBcbiAgICAgICAgaWYgc3VidGVzdC5nZXQoXCJwcm90b3R5cGVcIikgPT0gXCJzdXJ2ZXlcIiAmJiBAcXVlc3Rpb25zQnlTdWJ0ZXN0SWRbc3VidGVzdC5pZF0/XG4gICAgICAgICAgcHJvbXB0cyA9IChxdWVzdGlvbi5nZXQoXCJwcm9tcHRcIikgZm9yIHF1ZXN0aW9uIGluIEBxdWVzdGlvbnNCeVN1YnRlc3RJZFtzdWJ0ZXN0LmlkXSkuam9pbihcIiwgXCIpXG4gICAgICAgICAgaHRtbCArPSBcIjx0cj48dGQgY29sc3Bhbj0nI3tAc3VidGVzdFByb3BlcnRpZXNbJ3N1cnZleSddLmxlbmd0aH0nPiN7cHJvbXB0c308L3RkPjwvdHI+XCJcblxuXG4gICAgaHRtbCArPSBcIlxuICAgICAgPC90Ym9keT5cbiAgICA8L3RhYmxlPlxuICAgIFwiXG5cbiAgICByZXR1cm4gaHRtbFxuXG4gIHByb3BDb29rOiAocHJvcCwgc3VidGVzdCktPlxuXG4gICAgIyBjb29rIHRoZSB2YWx1ZVxuICAgIHZhbHVlID0gaWYgcHJvcC5rZXk/ICAgdGhlbiBzdWJ0ZXN0LmdldChwcm9wLmtleSkgICAgZWxzZSBcIiZuYnNwO1wiXG4gICAgdmFsdWUgPSBpZiBwcm9wLmVzY2FwZSB0aGVuIHN1YnRlc3QuZXNjYXBlKHByb3Aua2V5KSBlbHNlIHZhbHVlXG4gICAgdmFsdWUgPSB2YWx1ZS5sZW5ndGggaWYgcHJvcC5jb3VudD9cbiAgICB2YWx1ZSA9IFwiXCIgaWYgbm90IHZhbHVlP1xuXG4gICAgIyB3aGF0IGlzIGl0XG4gICAgZWRpdE9yTm90ICAgPSBpZiBwcm9wLmVkaXRhYmxlIHRoZW4gXCJjbGFzcz0nZWRpdF9pbl9wbGFjZSdcIiBlbHNlIFwiXCJcblxuICAgIG51bWJlck9yTm90ID0gaWYgXy5pc051bWJlcih2YWx1ZSkgdGhlbiBcImRhdGEtaXNOdW1iZXI9J3RydWUnXCIgZWxzZSBcImRhdGEtaXNOdW1iZXI9J2ZhbHNlJ1wiIFxuXG4gICAgcmV0dXJuIFwiPHRkIGNsYXNzPSdlZGl0X2luX3BsYWNlJz48c3BhbiBkYXRhLXN1YnRlc3RJZD0nI3tzdWJ0ZXN0LmlkfScgZGF0YS1rZXk9JyN7cHJvcC5rZXl9JyBkYXRhLXZhbHVlPScje3ZhbHVlfScgI3tlZGl0T3JOb3R9ICN7bnVtYmVyT3JOb3R9PiN7dmFsdWV9PC9kaXY+PC90ZD5cIlxuXG5cbiAgZWRpdEluUGxhY2U6IChldmVudCkgLT5cblxuICAgIHJldHVybiBpZiBAYWxyZWFkeUVkaXRpbmdcbiAgICBAYWxyZWFkeUVkaXRpbmcgPSB0cnVlXG5cbiAgICAjIHNhdmUgc3RhdGVcbiAgICAjIHJlcGxhY2Ugd2l0aCB0ZXh0IGFyZWFcbiAgICAjIG9uIHNhdmUsIHNhdmUgYW5kIHJlLXJlcGxhY2VcbiAgICAkc3BhbiA9ICQoZXZlbnQudGFyZ2V0KVxuXG4gICAgaWYgJHNwYW4ucHJvcChcInRhZ05hbWVcIikgPT0gXCJURFwiXG4gICAgICAkc3BhbiA9ICRzcGFuLmZpbmQoXCJzcGFuXCIpXG4gICAgICByZXR1cm4gaWYgJHNwYW4ubGVuZ3RoID09IDBcbiAgICAkdGQgID0gJHNwYW4ucGFyZW50KClcblxuICAgIEAkb2xkU3BhbiA9ICRzcGFuLmNsb25lKClcblxuICAgIHJldHVybiBpZiAkc3Bhbi5wcm9wKFwidGFnTmFtZVwiKSA9PSBcIlRFWFRBUkVBXCJcblxuICAgIGd1aWQgICAgICAgICA9IFV0aWxzLmd1aWQoKVxuXG4gICAga2V5ICAgICAgICAgID0gJHNwYW4uYXR0cihcImRhdGEta2V5XCIpXG4gICAgaXNOdW1iZXIgICAgID0gJHNwYW4uYXR0cihcImRhdGEtaXNOdW1iZXJcIikgPT0gXCJ0cnVlXCJcblxuICAgIHN1YnRlc3RJZCAgICA9ICRzcGFuLmF0dHIoXCJkYXRhLXN1YnRlc3RJZFwiKVxuICAgIHN1YnRlc3QgICAgICA9IEBzdWJ0ZXN0cy5nZXQoc3VidGVzdElkKVxuICAgIG9sZFZhbHVlICAgICA9IHN1YnRlc3QuZ2V0KGtleSlcblxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICBjbGFzc2VzID0gKCR0YXJnZXQuYXR0cihcImNsYXNzXCIpIHx8IFwiXCIpLnJlcGxhY2UoXCJzZXR0aW5nc1wiLFwiXCIpXG4gICAgbWFyZ2lucyA9ICR0YXJnZXQuY3NzKFwibWFyZ2luXCIpXG5cbiAgICAjc3BlY2lhbCBjYXNlXG4gICAgb2xkVmFsdWUgPSBvbGRWYWx1ZS5qb2luIFwiIFwiIGlmIGtleSA9PSAnaXRlbXMnXG5cbiAgICB0cmFuc2ZlclZhcmlhYmxlcyA9IFwiZGF0YS1pc051bWJlcj0nI3tpc051bWJlcn0nIGRhdGEta2V5PScje2tleX0nIGRhdGEtc3VidGVzdElkPScje3N1YnRlc3RJZH0nIFwiXG5cbiAgICAjIHNldHMgd2lkdGgvaGVpZ2h0IHdpdGggc3R5bGUgYXR0cmlidXRlXG4gICAgJHRkLmh0bWwoXCI8dGV4dGFyZWEgaWQ9JyN7Z3VpZH0nICN7dHJhbnNmZXJWYXJpYWJsZXN9IGNsYXNzPSdlZGl0aW5nICN7Y2xhc3Nlc30nIHN0eWxlPSdtYXJnaW46I3ttYXJnaW5zfSc+I3tvbGRWYWx1ZX08L3RleHRhcmVhPlwiKVxuICAgICMgc3R5bGU9J3dpZHRoOiN7b2xkV2lkdGh9cHg7IGhlaWdodDogI3tvbGRIZWlnaHR9cHg7J1xuICAgICR0ZXh0YXJlYSA9ICQoXCIjI3tndWlkfVwiKVxuICAgICR0ZXh0YXJlYS5mb2N1cygpXG5cbiAgZWRpdGluZzogKGV2ZW50KSAtPlxuXG4gICAgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KVxuICAgICR0ZCA9ICR0YXJnZXQucGFyZW50KClcblxuICAgIGlmIGV2ZW50LndoaWNoID09IDI3IG9yIGV2ZW50LnR5cGUgPT0gXCJmb2N1c291dFwiXG4gICAgICAkdGFyZ2V0LnJlbW92ZSgpXG4gICAgICAkdGQuaHRtbChAJG9sZFNwYW4pXG4gICAgICBAYWxyZWFkeUVkaXRpbmcgPSBmYWxzZVxuICAgICAgcmV0dXJuXG5cbiAgICAjIGFjdCBub3JtYWwsIHVubGVzcyBpdCdzIGFuIGVudGVyIGtleSBvbiBrZXlkb3duXG4gICAgcmV0dXJuIHRydWUgdW5sZXNzIGV2ZW50LndoaWNoID09IDEzIGFuZCBldmVudC50eXBlID09IFwia2V5ZG93blwiXG5cbiAgICBAYWxyZWFkeUVkaXRpbmcgPSBmYWxzZVxuXG4gICAga2V5ICAgICAgICAgID0gJHRhcmdldC5hdHRyKFwiZGF0YS1rZXlcIilcbiAgICBpc051bWJlciAgICAgPSAkdGFyZ2V0LmF0dHIoXCJkYXRhLWlzTnVtYmVyXCIpID09IFwidHJ1ZVwiXG5cbiAgICBzdWJ0ZXN0SWQgICAgPSAkdGFyZ2V0LmF0dHIoXCJkYXRhLXN1YnRlc3RJZFwiKVxuICAgIHN1YnRlc3QgICAgICA9IEBzdWJ0ZXN0cy5nZXQoc3VidGVzdElkKVxuICAgIG9sZFZhbHVlICAgICA9IHN1YnRlc3QuZ2V0KGtleSlcblxuICAgIG5ld1ZhbHVlID0gJHRhcmdldC52YWwoKVxuICAgIG5ld1ZhbHVlID0gaWYgaXNOdW1iZXIgdGhlbiBwYXJzZUludChuZXdWYWx1ZSkgZWxzZSBuZXdWYWx1ZVxuXG4gICAgI3NwZWNpYWwgY2FzZVxuXG4gICAgIyB0aGlzIGlzIG5vdCBEUlkuIHJlcGVhdGVkIGluIGdyaWQgcHJvdG90eXBlLlxuICAgIGlmIGtleSA9PSBcIml0ZW1zXCJcbiAgICAgICMgY2xlYW4gd2hpdGVzcGFjZSwgZ2l2ZSByZW1pbmRlciBpZiB0YWJzIG9yIGNvbW1hcyBmb3VuZCwgY29udmVydCBiYWNrIHRvIGFycmF5XG4gICAgICBuZXdWYWx1ZSA9IG5ld1ZhbHVlLnJlcGxhY2UoL1xccysvZywgJyAnKVxuICAgICAgaWYgL1xcdHwsLy50ZXN0KG5ld1ZhbHVlKSB0aGVuIGFsZXJ0IFwiUGxlYXNlIHJlbWVtYmVyXFxuXFxuR3JpZCBpdGVtcyBhcmUgc3BhY2UgXFxcIiBcXFwiIGRlbGltaXRlZFwiXG4gICAgICBuZXdWYWx1ZSA9IF8uY29tcGFjdCBuZXdWYWx1ZS5zcGxpdChcIiBcIilcblxuICAgICMgSWYgdGhlcmUgd2FzIGEgY2hhbmdlLCBzYXZlIGl0XG4gICAgaWYgU3RyaW5nKG5ld1ZhbHVlKSAhPSBTdHJpbmcob2xkVmFsdWUpXG4gICAgICBhdHRyaWJ1dGVzID0ge31cbiAgICAgIGF0dHJpYnV0ZXNba2V5XSA9IG5ld1ZhbHVlXG4gICAgICBzdWJ0ZXN0LnNhdmUgYXR0cmlidXRlcyxcbiAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICBVdGlscy5taWRBbGVydCBcIlN1YnRlc3Qgc2F2ZWRcIlxuICAgICAgICAgIHN1YnRlc3QuZmV0Y2ggXG4gICAgICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgICAgICBAdXBkYXRlVGFibGUoKVxuICAgICAgICBlcnJvcjogPT5cbiAgICAgICAgICBzdWJ0ZXN0LmZldGNoIFxuICAgICAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICAgICAgQHVwZGF0ZVRhYmxlKClcbiAgICAgICAgICAgICAgIyBpZGVhbGx5IHdlIHdvdWxkbid0IGhhdmUgdG8gc2F2ZSB0aGlzIGJ1dCBjb25mbGljdHMgaGFwcGVuIHNvbWV0aW1lc1xuICAgICAgICAgICAgICAjIEBUT0RPIG1ha2UgdGhlIG1vZGVsIHRyeSBhZ2FpbiB3aGVuIHVuc3VjY2Vzc2Z1bC5cbiAgICAgICAgICAgICAgYWxlcnQgXCJQbGVhc2UgdHJ5IHRvIHNhdmUgYWdhaW4sIGl0IGRpZG4ndCB3b3JrIHRoYXQgdGltZS5cIlxuICAgIFxuICAgICMgdGhpcyBlbnN1cmVzIHdlIGRvIG5vdCBpbnNlcnQgYSBuZXdsaW5lIGNoYXJhY3RlciB3aGVuIHdlIHByZXNzIGVudGVyXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgZ29CYWNrOiAtPiBcbiAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiYXNzZXNzbWVudHNcIiwgdHJ1ZVxuXG4gIGRlbGV0ZUN1cnJpY3VsdW06IC0+XG4gICAgaWYgY29uZmlybShcIkRlbGV0ZSBjdXJyaWN1bHVtXFxuI3tAY3VycmljdWx1bS5nZXQoJ25hbWUnKX0/XCIpXG4gICAgICBAY3VycmljdWx1bS5kZXN0cm95ID0+IFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJhc3Nlc3NtZW50c1wiLCB0cnVlXG5cbiAgI1xuICAjIFN1YnRlc3QgbmV3IGFuZCBkZXN0cm95XG4gICNcbiAgbmV3U3VidGVzdDogKGV2ZW50KSAtPlxuICAgIHByb3RvdHlwZSA9ICQoZXZlbnQudGFyZ2V0KS5hdHRyKFwiZGF0YS1wcm90b3R5cGVcIilcbiAgICBndWlkID0gVXRpbHMuZ3VpZCgpXG5cbiAgICBzdWJ0ZXN0QXR0cmlidXRlcyA9IFxuICAgICAgXCJfaWRcIiAgICAgICAgICA6IGd1aWRcbiAgICAgIFwiY3VycmljdWx1bUlkXCIgOiBAY3VycmljdWx1bS5pZFxuICAgICAgXCJwcm90b3R5cGVcIiAgICA6IHByb3RvdHlwZVxuICAgICAgXCJjYXB0dXJlTGFzdEF0dGVtcHRlZFwiIDogZmFsc2VcbiAgICAgIFwiZW5kT2ZMaW5lXCIgOiBmYWxzZVxuXG4gICAgcHJvdG9UZW1wcyA9IFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0IFwicHJvdG90eXBlc1wiXG4gICAgc3VidGVzdEF0dHJpYnV0ZXMgPSAkLmV4dGVuZChwcm90b1RlbXBzW3Byb3RvdHlwZV0sIHN1YnRlc3RBdHRyaWJ1dGVzKVxuXG4gICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0IHN1YnRlc3RBdHRyaWJ1dGVzXG4gICAgc3VidGVzdC5zYXZlIG51bGwsXG4gICAgICBzdWNjZXNzOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiY2xhc3Mvc3VidGVzdC8je2d1aWR9XCIsIHRydWVcbiAgICAgIGVycm9yOiAtPlxuICAgICAgICBhbGVydCBcIlBsZWFzZSB0cnkgYWdhaW4uIFRoZXJlIHdhcyBhIHByb2JsZW0gY3JlYXRpbmcgdGhlIG5ldyBzdWJ0ZXN0LlwiXG5cbiAgZGVsZXRlU3VidGVzdDogKGV2ZW50KSAtPlxuICAgIHN1YnRlc3RJZCA9ICQoZXZlbnQudGFyZ2V0KS5hdHRyKFwiZGF0YS1zdWJ0ZXN0SWRcIilcbiAgICBzdWJ0ZXN0ID0gQHN1YnRlc3RzLmdldChzdWJ0ZXN0SWQpXG4gICAgaWYgY29uZmlybShcIkRlbGV0ZSBzdWJ0ZXN0XFxuI3tzdWJ0ZXN0LmdldCgnbmFtZScpfT9cIilcbiAgICAgIHN1YnRlc3QuZGVzdHJveVxuICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgIEBzdWJ0ZXN0cy5yZW1vdmUoc3VidGVzdElkKVxuICAgICAgICAgIEB1cGRhdGVUYWJsZSgpXG4gICAgICAgIGVycm9yOiA9PlxuICAgICAgICAgIGFsZXJ0IFwiUGxlYXNlIHRyeSBhZ2FpbiwgY291bGQgbm90IGRlbGV0ZSBzdWJ0ZXN0LlwiXG4iXX0=
