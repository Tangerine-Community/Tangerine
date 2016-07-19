var QuestionsEditListElementView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

QuestionsEditListElementView = (function(superClass) {
  extend(QuestionsEditListElementView, superClass);

  function QuestionsEditListElementView() {
    this.copy = bind(this.copy, this);
    this.getSurveys = bind(this.getSurveys, this);
    return QuestionsEditListElementView.__super__.constructor.apply(this, arguments);
  }

  QuestionsEditListElementView.prototype.className = "question_list_element";

  QuestionsEditListElementView.prototype.tagName = "li";

  QuestionsEditListElementView.prototype.events = {
    'click .edit': 'edit',
    'click .show_copy': 'showCopy',
    'change .copy_select': 'copy',
    'click .delete': 'toggleDelete',
    'click .delete_cancel': 'toggleDelete',
    'click .delete_delete': 'delete'
  };

  QuestionsEditListElementView.prototype.showCopy = function(event) {
    var $copy;
    $copy = this.$el.find(".copy_container");
    $copy.html("Copy to <select class='copy_select'><option disabled='disabled' selected='selected'>Loading...</option></select>");
    return this.getSurveys();
  };

  QuestionsEditListElementView.prototype.getSurveys = function() {
    var url;
    url = Tangerine.settings.urlView("group", "subtestsByAssessmentId");
    return $.ajax({
      "url": url,
      "type": "POST",
      "dataType": "json",
      "contentType": "application/json",
      "data": JSON.stringify({
        keys: [this.question.get("assessmentId")]
      }),
      "success": (function(_this) {
        return function(data) {
          var row, subtests;
          subtests = _.compact((function() {
            var i, len, ref, results;
            ref = data.rows;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              row = ref[i];
              results.push(row.value.prototype === "survey" ? row.value : void 0);
            }
            return results;
          })());
          console.log(subtests);
          return _this.populateSurveySelect(subtests);
        };
      })(this)
    });
  };

  QuestionsEditListElementView.prototype.populateSurveySelect = function(subtests) {
    var htmlOptions, subtest;
    subtests.push({
      _id: 'cancel',
      name: this.text.cancel_button
    });
    subtests.unshift({
      _id: '',
      name: this.text.select
    });
    htmlOptions = ((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = subtests.length; i < len; i++) {
        subtest = subtests[i];
        results.push("<option data-subtestId='" + subtest._id + "' " + (subtest.attrs || "") + ">" + subtest.name + "</option>");
      }
      return results;
    })()).join("");
    return this.$el.find(".copy_select").html(htmlOptions);
  };

  QuestionsEditListElementView.prototype.copy = function(event) {
    var $target, newQuestion, subtestId;
    $target = $(event.target).find("option:selected");
    subtestId = $target.attr("data-subtestId");
    if (subtestId === "cancel") {
      this.$el.find(".copy_container").empty();
      return;
    }
    newQuestion = this.question.clone();
    return newQuestion.save({
      "_id": Utils.guid(),
      "subtestId": subtestId
    }, {
      success: (function(_this) {
        return function() {
          if (subtestId === _this.question.get("subtestId")) {
            Utils.midAlert("Question duplicated");
            return _this.trigger("duplicate");
          } else {
            Tangerine.router.navigate("subtest/" + subtestId, true);
            return Utils.midAlert("Question copied to " + ($target.html()));
          }
        };
      })(this),
      error: function() {
        return Utils.midAlert("Copy error");
      }
    });
  };

  QuestionsEditListElementView.prototype.edit = function(event) {
    this.trigger("question-edit", this.question.id);
    return false;
  };

  QuestionsEditListElementView.prototype.toggleDelete = function() {
    return this.$el.find(".delete_confirm").fadeToggle(250);
  };

  QuestionsEditListElementView.prototype["delete"] = function(event) {
    this.question.collection.remove(this.question.id);
    this.question.destroy();
    this.trigger("deleted");
    return false;
  };

  QuestionsEditListElementView.prototype.initialize = function(options) {
    this.text = {
      "edit": t("QuestionsEditListElementView.help.edit"),
      "delete": t("QuestionsEditListElementView.help.delete"),
      "copy": t("QuestionsEditListElementView.help.copy_to"),
      "cancel_button": t("QuestionsEditListElementView.button.cancel"),
      "delete_button": t("QuestionsEditListElementView.button.delete"),
      "select": t("QuestionsEditListElementView.label.select"),
      "loading": t("QuestionsEditListElementView.label.loading"),
      "delete_confirm": t("QuestionsEditListElementView.label.delete_confirm")
    };
    this.question = options.question;
    return this.$el.attr("data-id", this.question.id);
  };

  QuestionsEditListElementView.prototype.render = function() {
    this.$el.html("<table> <tr> <td> <img src='images/icon_drag.png' width='36' height='36' class='sortable_handle'> </td> <td> <span>" + (this.question.get('prompt')) + "</span> <span>[<small>" + (this.question.get('name')) + ", " + (this.question.get('type')) + "</small>]</span> <img src='images/icon_edit.png' width='36' height='36' class='link_icon edit' title='" + this.text.edit + "'> <img src='images/icon_copy_to.png' width='36' height='36' class='link_icon show_copy' title='" + this.text.copy + "'> <span class='copy_container'></span> <img src='images/icon_delete.png' width='36' height='36' class='link_icon delete' title='" + this.text["delete"] + "'><br> <div class='confirmation delete_confirm'> <div class='menu_box'>" + this.text.delete_confirm + "<br><button class='delete_delete command_red'>Delete</button><button class='delete_cancel command'>" + this.text.cancel_button + "</button> </div> </td> </tr> </table>");
    return this.trigger("rendered");
  };

  return QuestionsEditListElementView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInF1ZXN0aW9uL1F1ZXN0aW9uc0VkaXRMaXN0RWxlbWVudFZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLElBQUEsNEJBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs7eUNBRUosU0FBQSxHQUFZOzt5Q0FDWixPQUFBLEdBQVU7O3lDQUVWLE1BQUEsR0FDRTtJQUFBLGFBQUEsRUFBdUIsTUFBdkI7SUFDQSxrQkFBQSxFQUF1QixVQUR2QjtJQUVBLHFCQUFBLEVBQXdCLE1BRnhCO0lBSUEsZUFBQSxFQUF5QixjQUp6QjtJQUtBLHNCQUFBLEVBQXlCLGNBTHpCO0lBTUEsc0JBQUEsRUFBeUIsUUFOekI7Ozt5Q0FTRixRQUFBLEdBQVUsU0FBQyxLQUFEO0FBQ1IsUUFBQTtJQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxpQkFBVjtJQUNSLEtBQUssQ0FBQyxJQUFOLENBQVcsa0hBQVg7V0FHQSxJQUFDLENBQUEsVUFBRCxDQUFBO0VBTFE7O3lDQU9WLFVBQUEsR0FBWSxTQUFBO0FBRVYsUUFBQTtJQUFBLEdBQUEsR0FDRSxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQW5CLENBQTJCLE9BQTNCLEVBQW9DLHdCQUFwQztXQUVGLENBQUMsQ0FBQyxJQUFGLENBQ0U7TUFBQSxLQUFBLEVBQWdCLEdBQWhCO01BQ0EsTUFBQSxFQUFnQixNQURoQjtNQUVBLFVBQUEsRUFBZ0IsTUFGaEI7TUFHQSxhQUFBLEVBQWdCLGtCQUhoQjtNQUlBLE1BQUEsRUFBZ0IsSUFBSSxDQUFDLFNBQUwsQ0FDZDtRQUFBLElBQUEsRUFBTyxDQUFDLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLGNBQWQsQ0FBRCxDQUFQO09BRGMsQ0FKaEI7TUFNQSxTQUFBLEVBQVksQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7QUFDVixjQUFBO1VBQUEsUUFBQSxHQUFXLENBQUMsQ0FBQyxPQUFGOztBQUFVO0FBQUE7aUJBQUEscUNBQUE7OzJCQUFjLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBVixLQUF1QixRQUFwQyxHQUFBLEdBQUcsQ0FBQyxLQUFKLEdBQUE7QUFBRDs7Y0FBVjtVQUNYLE9BQU8sQ0FBQyxHQUFSLENBQVksUUFBWjtpQkFDQSxLQUFDLENBQUEsb0JBQUQsQ0FBc0IsUUFBdEI7UUFIVTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FOWjtLQURGO0VBTFU7O3lDQWlCWixvQkFBQSxHQUF1QixTQUFDLFFBQUQ7QUFFckIsUUFBQTtJQUFBLFFBQVEsQ0FBQyxJQUFULENBQWlCO01BQUEsR0FBQSxFQUFNLFFBQU47TUFBZ0IsSUFBQSxFQUFPLElBQUMsQ0FBQSxJQUFJLENBQUMsYUFBN0I7S0FBakI7SUFDQSxRQUFRLENBQUMsT0FBVCxDQUFpQjtNQUFBLEdBQUEsRUFBTSxFQUFOO01BQWdCLElBQUEsRUFBTyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQTdCO0tBQWpCO0lBRUEsV0FBQSxHQUFjOztBQUFDO1dBQUEsMENBQUE7O3FCQUFBLDBCQUFBLEdBQTJCLE9BQU8sQ0FBQyxHQUFuQyxHQUF1QyxJQUF2QyxHQUEwQyxDQUFDLE9BQU8sQ0FBQyxLQUFSLElBQWlCLEVBQWxCLENBQTFDLEdBQStELEdBQS9ELEdBQWtFLE9BQU8sQ0FBQyxJQUExRSxHQUErRTtBQUEvRTs7UUFBRCxDQUFtSCxDQUFDLElBQXBILENBQXlILEVBQXpIO1dBQ2QsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsY0FBVixDQUF5QixDQUFDLElBQTFCLENBQStCLFdBQS9CO0VBTnFCOzt5Q0FRdkIsSUFBQSxHQUFNLFNBQUMsS0FBRDtBQUNKLFFBQUE7SUFBQSxPQUFBLEdBQVUsQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxJQUFoQixDQUFxQixpQkFBckI7SUFDVixTQUFBLEdBQVksT0FBTyxDQUFDLElBQVIsQ0FBYSxnQkFBYjtJQUNaLElBQUcsU0FBQSxLQUFhLFFBQWhCO01BQ0UsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsaUJBQVYsQ0FBNEIsQ0FBQyxLQUE3QixDQUFBO0FBQ0EsYUFGRjs7SUFHQSxXQUFBLEdBQWMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQUE7V0FDZCxXQUFXLENBQUMsSUFBWixDQUNFO01BQUEsS0FBQSxFQUFjLEtBQUssQ0FBQyxJQUFOLENBQUEsQ0FBZDtNQUNBLFdBQUEsRUFBYyxTQURkO0tBREYsRUFJRTtNQUFBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDUCxJQUFHLFNBQUEsS0FBYSxLQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxXQUFkLENBQWhCO1lBQ0UsS0FBSyxDQUFDLFFBQU4sQ0FBZSxxQkFBZjttQkFDQSxLQUFDLENBQUEsT0FBRCxDQUFTLFdBQVQsRUFGRjtXQUFBLE1BQUE7WUFJRSxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLFVBQUEsR0FBVyxTQUFyQyxFQUFrRCxJQUFsRDttQkFDQSxLQUFLLENBQUMsUUFBTixDQUFlLHFCQUFBLEdBQXFCLENBQUMsT0FBTyxDQUFDLElBQVIsQ0FBQSxDQUFELENBQXBDLEVBTEY7O1FBRE87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7TUFPQSxLQUFBLEVBQU8sU0FBQTtlQUNMLEtBQUssQ0FBQyxRQUFOLENBQWUsWUFBZjtNQURLLENBUFA7S0FKRjtFQVBJOzt5Q0FxQk4sSUFBQSxHQUFNLFNBQUMsS0FBRDtJQUNKLElBQUMsQ0FBQSxPQUFELENBQVMsZUFBVCxFQUEwQixJQUFDLENBQUEsUUFBUSxDQUFDLEVBQXBDO0FBQ0EsV0FBTztFQUZIOzt5Q0FJTixZQUFBLEdBQWMsU0FBQTtXQUNaLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlCQUFWLENBQTRCLENBQUMsVUFBN0IsQ0FBd0MsR0FBeEM7RUFEWTs7eUNBR2QsU0FBQSxHQUFRLFNBQUMsS0FBRDtJQUNOLElBQUMsQ0FBQSxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQXJCLENBQTRCLElBQUMsQ0FBQSxRQUFRLENBQUMsRUFBdEM7SUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVYsQ0FBQTtJQUNBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBVDtBQUNBLFdBQU87RUFKRDs7eUNBTVIsVUFBQSxHQUFZLFNBQUUsT0FBRjtJQUNWLElBQUMsQ0FBQSxJQUFELEdBQ0U7TUFBQSxNQUFBLEVBQWtCLENBQUEsQ0FBRSx3Q0FBRixDQUFsQjtNQUNBLFFBQUEsRUFBa0IsQ0FBQSxDQUFFLDBDQUFGLENBRGxCO01BRUEsTUFBQSxFQUFrQixDQUFBLENBQUUsMkNBQUYsQ0FGbEI7TUFHQSxlQUFBLEVBQWtCLENBQUEsQ0FBRSw0Q0FBRixDQUhsQjtNQUlBLGVBQUEsRUFBa0IsQ0FBQSxDQUFFLDRDQUFGLENBSmxCO01BS0EsUUFBQSxFQUFrQixDQUFBLENBQUUsMkNBQUYsQ0FMbEI7TUFNQSxTQUFBLEVBQWtCLENBQUEsQ0FBRSw0Q0FBRixDQU5sQjtNQU9BLGdCQUFBLEVBQW1CLENBQUEsQ0FBRSxtREFBRixDQVBuQjs7SUFTRixJQUFDLENBQUEsUUFBRCxHQUFZLE9BQU8sQ0FBQztXQUNwQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLElBQUMsQ0FBQSxRQUFRLENBQUMsRUFBL0I7RUFaVTs7eUNBY1osTUFBQSxHQUFRLFNBQUE7SUFDTixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxxSEFBQSxHQU9LLENBQUMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsUUFBZCxDQUFELENBUEwsR0FPNkIsd0JBUDdCLEdBT29ELENBQUMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsTUFBZCxDQUFELENBUHBELEdBTzBFLElBUDFFLEdBTzZFLENBQUMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsTUFBZCxDQUFELENBUDdFLEdBT21HLHdHQVBuRyxHQVNxRixJQUFDLENBQUEsSUFBSSxDQUFDLElBVDNGLEdBU2dHLGtHQVRoRyxHQVU2RixJQUFDLENBQUEsSUFBSSxDQUFDLElBVm5HLEdBVXdHLG1JQVZ4RyxHQVl5RixJQUFDLENBQUEsSUFBSSxDQUFDLFFBQUQsQ0FaOUYsR0FZc0cseUVBWnRHLEdBY3dCLElBQUMsQ0FBQSxJQUFJLENBQUMsY0FkOUIsR0FjNkMscUdBZDdDLEdBY2tKLElBQUMsQ0FBQSxJQUFJLENBQUMsYUFkeEosR0Fjc0ssdUNBZGhMO1dBb0JBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQXJCTTs7OztHQS9GaUMsUUFBUSxDQUFDIiwiZmlsZSI6InF1ZXN0aW9uL1F1ZXN0aW9uc0VkaXRMaXN0RWxlbWVudFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIjIFByb3ZpZGVzIGFuIFwibGlcIiB0YWcgZm9yIHRoZSBxdWVzdGlvbnMgZWRpdCB2aWV3XG5jbGFzcyBRdWVzdGlvbnNFZGl0TGlzdEVsZW1lbnRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwicXVlc3Rpb25fbGlzdF9lbGVtZW50XCJcbiAgdGFnTmFtZSA6IFwibGlcIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLmVkaXQnICAgICAgICA6ICdlZGl0J1xuICAgICdjbGljayAuc2hvd19jb3B5JyAgIDogJ3Nob3dDb3B5J1xuICAgICdjaGFuZ2UgLmNvcHlfc2VsZWN0JyA6ICdjb3B5J1xuXG4gICAgJ2NsaWNrIC5kZWxldGUnICAgICAgICA6ICd0b2dnbGVEZWxldGUnXG4gICAgJ2NsaWNrIC5kZWxldGVfY2FuY2VsJyA6ICd0b2dnbGVEZWxldGUnXG4gICAgJ2NsaWNrIC5kZWxldGVfZGVsZXRlJyA6ICdkZWxldGUnXG5cblxuICBzaG93Q29weTogKGV2ZW50KSAtPlxuICAgICRjb3B5ID0gQCRlbC5maW5kKFwiLmNvcHlfY29udGFpbmVyXCIpXG4gICAgJGNvcHkuaHRtbCBcIlxuICAgICAgQ29weSB0byA8c2VsZWN0IGNsYXNzPSdjb3B5X3NlbGVjdCc+PG9wdGlvbiBkaXNhYmxlZD0nZGlzYWJsZWQnIHNlbGVjdGVkPSdzZWxlY3RlZCc+TG9hZGluZy4uLjwvb3B0aW9uPjwvc2VsZWN0PlxuICAgIFwiXG4gICAgQGdldFN1cnZleXMoKVxuXG4gIGdldFN1cnZleXM6ID0+XG5cbiAgICB1cmwgPSBcbiAgICAgIFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3KFwiZ3JvdXBcIiwgXCJzdWJ0ZXN0c0J5QXNzZXNzbWVudElkXCIpXG5cbiAgICAkLmFqYXhcbiAgICAgIFwidXJsXCIgICAgICAgICA6IHVybFxuICAgICAgXCJ0eXBlXCIgICAgICAgIDogXCJQT1NUXCJcbiAgICAgIFwiZGF0YVR5cGVcIiAgICA6IFwianNvblwiXG4gICAgICBcImNvbnRlbnRUeXBlXCIgOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgXCJkYXRhXCIgICAgICAgIDogSlNPTi5zdHJpbmdpZnlcbiAgICAgICAga2V5cyA6IFtAcXVlc3Rpb24uZ2V0KFwiYXNzZXNzbWVudElkXCIpXVxuICAgICAgXCJzdWNjZXNzXCIgOiAoZGF0YSkgPT5cbiAgICAgICAgc3VidGVzdHMgPSBfLmNvbXBhY3QoKHJvdy52YWx1ZSBpZiByb3cudmFsdWUucHJvdG90eXBlID09IFwic3VydmV5XCIpIGZvciByb3cgaW4gZGF0YS5yb3dzKVxuICAgICAgICBjb25zb2xlLmxvZyBzdWJ0ZXN0c1xuICAgICAgICBAcG9wdWxhdGVTdXJ2ZXlTZWxlY3Qgc3VidGVzdHNcblxuICBwb3B1bGF0ZVN1cnZleVNlbGVjdCA6IChzdWJ0ZXN0cykgLT5cbiAgICBcbiAgICBzdWJ0ZXN0cy5wdXNoICAgIF9pZCA6ICdjYW5jZWwnLCBuYW1lIDogQHRleHQuY2FuY2VsX2J1dHRvblxuICAgIHN1YnRlc3RzLnVuc2hpZnQgX2lkIDogJycsICAgICAgIG5hbWUgOiBAdGV4dC5zZWxlY3RcblxuICAgIGh0bWxPcHRpb25zID0gKFwiPG9wdGlvbiBkYXRhLXN1YnRlc3RJZD0nI3tzdWJ0ZXN0Ll9pZH0nICN7c3VidGVzdC5hdHRycyB8fCBcIlwifT4je3N1YnRlc3QubmFtZX08L29wdGlvbj5cIiBmb3Igc3VidGVzdCBpbiBzdWJ0ZXN0cykuam9pbihcIlwiKVxuICAgIEAkZWwuZmluZChcIi5jb3B5X3NlbGVjdFwiKS5odG1sIGh0bWxPcHRpb25zXG5cbiAgY29weTogKGV2ZW50KSA9PlxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldCkuZmluZChcIm9wdGlvbjpzZWxlY3RlZFwiKVxuICAgIHN1YnRlc3RJZCA9ICR0YXJnZXQuYXR0cihcImRhdGEtc3VidGVzdElkXCIpXG4gICAgaWYgc3VidGVzdElkID09IFwiY2FuY2VsXCJcbiAgICAgIEAkZWwuZmluZChcIi5jb3B5X2NvbnRhaW5lclwiKS5lbXB0eSgpXG4gICAgICByZXR1cm5cbiAgICBuZXdRdWVzdGlvbiA9IEBxdWVzdGlvbi5jbG9uZSgpXG4gICAgbmV3UXVlc3Rpb24uc2F2ZVxuICAgICAgXCJfaWRcIiAgICAgICA6IFV0aWxzLmd1aWQoKVxuICAgICAgXCJzdWJ0ZXN0SWRcIiA6IHN1YnRlc3RJZFxuICAgICxcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgIGlmIHN1YnRlc3RJZCA9PSBAcXVlc3Rpb24uZ2V0KFwic3VidGVzdElkXCIpXG4gICAgICAgICAgVXRpbHMubWlkQWxlcnQoXCJRdWVzdGlvbiBkdXBsaWNhdGVkXCIpXG4gICAgICAgICAgQHRyaWdnZXIgXCJkdXBsaWNhdGVcIiBcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJzdWJ0ZXN0LyN7c3VidGVzdElkfVwiLCB0cnVlICMgdGhpcyB3aWxsIGd1YXJhbnRlZSB0aGF0IGl0IGFzc3VyZXMgdGhlIG9yZGVyIG9mIHRoZSB0YXJnZXQgc3VidGVzdFxuICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0KFwiUXVlc3Rpb24gY29waWVkIHRvICN7JHRhcmdldC5odG1sKCl9XCIpXG4gICAgICBlcnJvcjogLT5cbiAgICAgICAgVXRpbHMubWlkQWxlcnQoXCJDb3B5IGVycm9yXCIpXG5cbiAgZWRpdDogKGV2ZW50KSAtPlxuICAgIEB0cmlnZ2VyIFwicXVlc3Rpb24tZWRpdFwiLCBAcXVlc3Rpb24uaWRcbiAgICByZXR1cm4gZmFsc2VcblxuICB0b2dnbGVEZWxldGU6IC0+XG4gICAgQCRlbC5maW5kKFwiLmRlbGV0ZV9jb25maXJtXCIpLmZhZGVUb2dnbGUoMjUwKVxuXG4gIGRlbGV0ZTogKGV2ZW50KSAtPlxuICAgIEBxdWVzdGlvbi5jb2xsZWN0aW9uLnJlbW92ZShAcXVlc3Rpb24uaWQpXG4gICAgQHF1ZXN0aW9uLmRlc3Ryb3koKVxuICAgIEB0cmlnZ2VyIFwiZGVsZXRlZFwiXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgaW5pdGlhbGl6ZTogKCBvcHRpb25zICkgLT5cbiAgICBAdGV4dCA9IFxuICAgICAgXCJlZGl0XCIgICAgICAgICAgOiB0KFwiUXVlc3Rpb25zRWRpdExpc3RFbGVtZW50Vmlldy5oZWxwLmVkaXRcIilcbiAgICAgIFwiZGVsZXRlXCIgICAgICAgIDogdChcIlF1ZXN0aW9uc0VkaXRMaXN0RWxlbWVudFZpZXcuaGVscC5kZWxldGVcIilcbiAgICAgIFwiY29weVwiICAgICAgICAgIDogdChcIlF1ZXN0aW9uc0VkaXRMaXN0RWxlbWVudFZpZXcuaGVscC5jb3B5X3RvXCIpXG4gICAgICBcImNhbmNlbF9idXR0b25cIiA6IHQoXCJRdWVzdGlvbnNFZGl0TGlzdEVsZW1lbnRWaWV3LmJ1dHRvbi5jYW5jZWxcIilcbiAgICAgIFwiZGVsZXRlX2J1dHRvblwiIDogdChcIlF1ZXN0aW9uc0VkaXRMaXN0RWxlbWVudFZpZXcuYnV0dG9uLmRlbGV0ZVwiKVxuICAgICAgXCJzZWxlY3RcIiAgICAgICAgOiB0KFwiUXVlc3Rpb25zRWRpdExpc3RFbGVtZW50Vmlldy5sYWJlbC5zZWxlY3RcIilcbiAgICAgIFwibG9hZGluZ1wiICAgICAgIDogdChcIlF1ZXN0aW9uc0VkaXRMaXN0RWxlbWVudFZpZXcubGFiZWwubG9hZGluZ1wiKVxuICAgICAgXCJkZWxldGVfY29uZmlybVwiIDogdChcIlF1ZXN0aW9uc0VkaXRMaXN0RWxlbWVudFZpZXcubGFiZWwuZGVsZXRlX2NvbmZpcm1cIilcblxuICAgIEBxdWVzdGlvbiA9IG9wdGlvbnMucXVlc3Rpb25cbiAgICBAJGVsLmF0dHIoXCJkYXRhLWlkXCIsIEBxdWVzdGlvbi5pZClcblxuICByZW5kZXI6IC0+XG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8dGFibGU+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICA8aW1nIHNyYz0naW1hZ2VzL2ljb25fZHJhZy5wbmcnIHdpZHRoPSczNicgaGVpZ2h0PSczNicgY2xhc3M9J3NvcnRhYmxlX2hhbmRsZSc+XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICA8c3Bhbj4je0BxdWVzdGlvbi5nZXQgJ3Byb21wdCd9PC9zcGFuPiA8c3Bhbj5bPHNtYWxsPiN7QHF1ZXN0aW9uLmdldCAnbmFtZSd9LCAje0BxdWVzdGlvbi5nZXQgJ3R5cGUnfTwvc21hbGw+XTwvc3Bhbj5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgPGltZyBzcmM9J2ltYWdlcy9pY29uX2VkaXQucG5nJyB3aWR0aD0nMzYnIGhlaWdodD0nMzYnIGNsYXNzPSdsaW5rX2ljb24gZWRpdCcgdGl0bGU9JyN7QHRleHQuZWRpdH0nPlxuICAgICAgICAgICAgPGltZyBzcmM9J2ltYWdlcy9pY29uX2NvcHlfdG8ucG5nJyB3aWR0aD0nMzYnIGhlaWdodD0nMzYnIGNsYXNzPSdsaW5rX2ljb24gc2hvd19jb3B5JyB0aXRsZT0nI3tAdGV4dC5jb3B5fSc+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz0nY29weV9jb250YWluZXInPjwvc3Bhbj5cbiAgICAgICAgICAgIDxpbWcgc3JjPSdpbWFnZXMvaWNvbl9kZWxldGUucG5nJyB3aWR0aD0nMzYnIGhlaWdodD0nMzYnIGNsYXNzPSdsaW5rX2ljb24gZGVsZXRlJyB0aXRsZT0nI3tAdGV4dC5kZWxldGV9Jz48YnI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPSdjb25maXJtYXRpb24gZGVsZXRlX2NvbmZpcm0nPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+I3tAdGV4dC5kZWxldGVfY29uZmlybX08YnI+PGJ1dHRvbiBjbGFzcz0nZGVsZXRlX2RlbGV0ZSBjb21tYW5kX3JlZCc+RGVsZXRlPC9idXR0b24+PGJ1dHRvbiBjbGFzcz0nZGVsZXRlX2NhbmNlbCBjb21tYW5kJz4je0B0ZXh0LmNhbmNlbF9idXR0b259PC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgPC90YWJsZT5cbiAgICAgIFwiXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4iXX0=
