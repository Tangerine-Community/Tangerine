var QuestionsEditView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

QuestionsEditView = (function(superClass) {
  extend(QuestionsEditView, superClass);

  function QuestionsEditView() {
    this.render = bind(this.render, this);
    return QuestionsEditView.__super__.constructor.apply(this, arguments);
  }

  QuestionsEditView.prototype.className = "questions_edit_view";

  QuestionsEditView.prototype.tagName = "ul";

  QuestionsEditView.prototype.initialize = function(options) {
    this.views = [];
    return this.questions = options.questions;
  };

  QuestionsEditView.prototype.onClose = function() {
    return this.closeViews();
  };

  QuestionsEditView.prototype.closeViews = function() {
    var j, len, ref, results, view;
    ref = this.views;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      view = ref[j];
      results.push(view.close());
    }
    return results;
  };

  QuestionsEditView.prototype.render = function() {
    var i, j, len, question, ref, view;
    this.closeViews();
    ref = this.questions.models;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      question = ref[i];
      view = new QuestionsEditListElementView({
        "question": question
      });
      this.views.push(view);
      view.on("deleted", this.render);
      view.on("duplicate", (function(_this) {
        return function() {
          return _this.refetchAndRender();
        };
      })(this));
      view.on("question-edit", (function(_this) {
        return function(questionId) {
          return _this.trigger("question-edit", questionId);
        };
      })(this));
      view.render();
      this.$el.append(view.el);
    }
    return this.$el.sortable({
      forceHelperSize: true,
      forcePlaceholderSize: true,
      handle: '.sortable_handle',
      start: function(event, ui) {
        return ui.item.addClass("drag_shadow");
      },
      stop: function(event, ui) {
        return ui.item.removeClass("drag_shadow");
      },
      update: (function(_this) {
        return function(event, ui) {
          var id, idList, index, k, len1, li, newDoc, newDocs, requestData;
          idList = (function() {
            var k, len1, ref1, results;
            ref1 = this.$el.find("li.question_list_element");
            results = [];
            for (k = 0, len1 = ref1.length; k < len1; k++) {
              li = ref1[k];
              results.push($(li).attr("data-id"));
            }
            return results;
          }).call(_this);
          index = 0;
          newDocs = [];
          for (index = k = 0, len1 = idList.length; k < len1; index = ++k) {
            id = idList[index];
            newDoc = _this.questions.get(id).attributes;
            newDoc['order'] = index;
            newDocs.push(newDoc);
          }
          requestData = {
            "docs": newDocs
          };
          return $.ajax({
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            dataType: "json",
            url: Tangerine.settings.urlBulkDocs(),
            data: JSON.stringify(requestData),
            success: function(responses) {
              return _this.refetchAndRender();
            },
            error: function() {
              return Utils.midAlert("Duplication error");
            }
          });
        };
      })(this)
    });
  };

  QuestionsEditView.prototype.refetchAndRender = function() {
    var anyQuestion;
    anyQuestion = this.questions.models[0];
    return this.questions.fetch({
      key: "q" + anyQuestion.get("assessmentId"),
      success: (function(_this) {
        return function() {
          _this.questions = new Questions(_this.questions.where({
            subtestId: anyQuestion.get("subtestId")
          }));
          return _this.render(true);
        };
      })(this)
    });
  };

  return QuestionsEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInF1ZXN0aW9uL1F1ZXN0aW9uc0VkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGlCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7OEJBRUosU0FBQSxHQUFZOzs4QkFDWixPQUFBLEdBQVU7OzhCQUVWLFVBQUEsR0FBWSxTQUFFLE9BQUY7SUFDVixJQUFDLENBQUEsS0FBRCxHQUFTO1dBQ1QsSUFBQyxDQUFBLFNBQUQsR0FBYSxPQUFPLENBQUM7RUFGWDs7OEJBS1osT0FBQSxHQUFTLFNBQUE7V0FDUCxJQUFDLENBQUEsVUFBRCxDQUFBO0VBRE87OzhCQUdULFVBQUEsR0FBWSxTQUFBO0FBQ1YsUUFBQTtBQUFBO0FBQUE7U0FBQSxxQ0FBQTs7bUJBQ0UsSUFBSSxDQUFDLEtBQUwsQ0FBQTtBQURGOztFQURVOzs4QkFJWixNQUFBLEdBQVEsU0FBQTtBQUVOLFFBQUE7SUFBQSxJQUFDLENBQUEsVUFBRCxDQUFBO0FBQ0E7QUFBQSxTQUFBLDZDQUFBOztNQUNFLElBQUEsR0FBVyxJQUFBLDRCQUFBLENBQ1Q7UUFBQSxVQUFBLEVBQWEsUUFBYjtPQURTO01BRVgsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksSUFBWjtNQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsU0FBUixFQUFtQixJQUFDLENBQUEsTUFBcEI7TUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLFdBQVIsRUFBcUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNuQixLQUFDLENBQUEsZ0JBQUQsQ0FBQTtRQURtQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckI7TUFFQSxJQUFJLENBQUMsRUFBTCxDQUFRLGVBQVIsRUFBeUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFVBQUQ7aUJBQWdCLEtBQUMsQ0FBQSxPQUFELENBQVMsZUFBVCxFQUEwQixVQUExQjtRQUFoQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekI7TUFDQSxJQUFJLENBQUMsTUFBTCxDQUFBO01BQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLENBQVksSUFBSSxDQUFDLEVBQWpCO0FBVEY7V0FZQSxJQUFDLENBQUEsR0FBRyxDQUFDLFFBQUwsQ0FDRTtNQUFBLGVBQUEsRUFBaUIsSUFBakI7TUFDQSxvQkFBQSxFQUFzQixJQUR0QjtNQUVBLE1BQUEsRUFBUyxrQkFGVDtNQUdBLEtBQUEsRUFBTyxTQUFDLEtBQUQsRUFBUSxFQUFSO2VBQWUsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFSLENBQWlCLGFBQWpCO01BQWYsQ0FIUDtNQUlBLElBQUEsRUFBTyxTQUFDLEtBQUQsRUFBUSxFQUFSO2VBQWUsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFSLENBQW9CLGFBQXBCO01BQWYsQ0FKUDtNQU1BLE1BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRCxFQUFRLEVBQVI7QUFDUCxjQUFBO1VBQUEsTUFBQTs7QUFBVTtBQUFBO2lCQUFBLHdDQUFBOzsyQkFBQSxDQUFBLENBQUUsRUFBRixDQUFLLENBQUMsSUFBTixDQUFXLFNBQVg7QUFBQTs7O1VBQ1YsS0FBQSxHQUFRO1VBQ1IsT0FBQSxHQUFVO0FBQ1YsZUFBQSwwREFBQTs7WUFDRSxNQUFBLEdBQVMsS0FBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUsRUFBZixDQUFrQixDQUFDO1lBQzVCLE1BQU8sQ0FBQSxPQUFBLENBQVAsR0FBa0I7WUFDbEIsT0FBTyxDQUFDLElBQVIsQ0FBYSxNQUFiO0FBSEY7VUFJQSxXQUFBLEdBQWM7WUFBQSxNQUFBLEVBQVMsT0FBVDs7aUJBQ2QsQ0FBQyxDQUFDLElBQUYsQ0FDRTtZQUFBLElBQUEsRUFBTyxNQUFQO1lBQ0EsV0FBQSxFQUFjLGlDQURkO1lBRUEsUUFBQSxFQUFXLE1BRlg7WUFHQSxHQUFBLEVBQU0sU0FBUyxDQUFDLFFBQVEsQ0FBQyxXQUFuQixDQUFBLENBSE47WUFJQSxJQUFBLEVBQU8sSUFBSSxDQUFDLFNBQUwsQ0FBZSxXQUFmLENBSlA7WUFLQSxPQUFBLEVBQVUsU0FBQyxTQUFEO3FCQUFlLEtBQUMsQ0FBQSxnQkFBRCxDQUFBO1lBQWYsQ0FMVjtZQU1BLEtBQUEsRUFBUSxTQUFBO3FCQUFHLEtBQUssQ0FBQyxRQUFOLENBQWUsbUJBQWY7WUFBSCxDQU5SO1dBREY7UUFUTztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FOVDtLQURGO0VBZk07OzhCQXdDUixnQkFBQSxHQUFrQixTQUFBO0FBQ2hCLFFBQUE7SUFBQSxXQUFBLEdBQWMsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFPLENBQUEsQ0FBQTtXQUNoQyxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FDRTtNQUFBLEdBQUEsRUFBSyxHQUFBLEdBQU0sV0FBVyxDQUFDLEdBQVosQ0FBZ0IsY0FBaEIsQ0FBWDtNQUNBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDUCxLQUFDLENBQUEsU0FBRCxHQUFpQixJQUFBLFNBQUEsQ0FBVSxLQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBaUI7WUFBQyxTQUFBLEVBQVksV0FBVyxDQUFDLEdBQVosQ0FBZ0IsV0FBaEIsQ0FBYjtXQUFqQixDQUFWO2lCQUNqQixLQUFDLENBQUEsTUFBRCxDQUFRLElBQVI7UUFGTztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEVDtLQURGO0VBRmdCOzs7O0dBekRZLFFBQVEsQ0FBQyIsImZpbGUiOiJxdWVzdGlvbi9RdWVzdGlvbnNFZGl0Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFF1ZXN0aW9uc0VkaXRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwicXVlc3Rpb25zX2VkaXRfdmlld1wiXG4gIHRhZ05hbWUgOiBcInVsXCJcblxuICBpbml0aWFsaXplOiAoIG9wdGlvbnMgKSAtPlxuICAgIEB2aWV3cyA9IFtdXG4gICAgQHF1ZXN0aW9ucyA9IG9wdGlvbnMucXVlc3Rpb25zXG5cblxuICBvbkNsb3NlOiAtPlxuICAgIEBjbG9zZVZpZXdzKClcblxuICBjbG9zZVZpZXdzOiAtPlxuICAgIGZvciB2aWV3IGluIEB2aWV3c1xuICAgICAgdmlldy5jbG9zZSgpXG5cbiAgcmVuZGVyOiA9PlxuXG4gICAgQGNsb3NlVmlld3MoKVxuICAgIGZvciBxdWVzdGlvbiwgaSBpbiBAcXVlc3Rpb25zLm1vZGVsc1xuICAgICAgdmlldyA9IG5ldyBRdWVzdGlvbnNFZGl0TGlzdEVsZW1lbnRWaWV3XG4gICAgICAgIFwicXVlc3Rpb25cIiA6IHF1ZXN0aW9uXG4gICAgICBAdmlld3MucHVzaCB2aWV3XG4gICAgICB2aWV3Lm9uIFwiZGVsZXRlZFwiLCBAcmVuZGVyXG4gICAgICB2aWV3Lm9uIFwiZHVwbGljYXRlXCIsID0+XG4gICAgICAgIEByZWZldGNoQW5kUmVuZGVyKClcbiAgICAgIHZpZXcub24gXCJxdWVzdGlvbi1lZGl0XCIsIChxdWVzdGlvbklkKSA9PiBAdHJpZ2dlciBcInF1ZXN0aW9uLWVkaXRcIiwgcXVlc3Rpb25JZFxuICAgICAgdmlldy5yZW5kZXIoKVxuICAgICAgQCRlbC5hcHBlbmQgdmlldy5lbFxuXG4gICAgIyBtYWtlIGl0IHNvcnRhYmxlXG4gICAgQCRlbC5zb3J0YWJsZVxuICAgICAgZm9yY2VIZWxwZXJTaXplOiB0cnVlXG4gICAgICBmb3JjZVBsYWNlaG9sZGVyU2l6ZTogdHJ1ZVxuICAgICAgaGFuZGxlIDogJy5zb3J0YWJsZV9oYW5kbGUnXG4gICAgICBzdGFydDogKGV2ZW50LCB1aSkgLT4gdWkuaXRlbS5hZGRDbGFzcyBcImRyYWdfc2hhZG93XCJcbiAgICAgIHN0b3A6ICAoZXZlbnQsIHVpKSAtPiB1aS5pdGVtLnJlbW92ZUNsYXNzIFwiZHJhZ19zaGFkb3dcIlxuXG4gICAgICB1cGRhdGUgOiAoZXZlbnQsIHVpKSA9PlxuICAgICAgICBpZExpc3QgPSAoJChsaSkuYXR0cihcImRhdGEtaWRcIikgZm9yIGxpIGluIEAkZWwuZmluZChcImxpLnF1ZXN0aW9uX2xpc3RfZWxlbWVudFwiKSlcbiAgICAgICAgaW5kZXggPSAwXG4gICAgICAgIG5ld0RvY3MgPSBbXVxuICAgICAgICBmb3IgaWQsIGluZGV4IGluIGlkTGlzdFxuICAgICAgICAgIG5ld0RvYyA9IEBxdWVzdGlvbnMuZ2V0KGlkKS5hdHRyaWJ1dGVzXG4gICAgICAgICAgbmV3RG9jWydvcmRlciddID0gaW5kZXhcbiAgICAgICAgICBuZXdEb2NzLnB1c2ggbmV3RG9jXG4gICAgICAgIHJlcXVlc3REYXRhID0gXCJkb2NzXCIgOiBuZXdEb2NzXG4gICAgICAgICQuYWpheFxuICAgICAgICAgIHR5cGUgOiBcIlBPU1RcIlxuICAgICAgICAgIGNvbnRlbnRUeXBlIDogXCJhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PVVURi04XCJcbiAgICAgICAgICBkYXRhVHlwZSA6IFwianNvblwiXG4gICAgICAgICAgdXJsIDogVGFuZ2VyaW5lLnNldHRpbmdzLnVybEJ1bGtEb2NzKClcbiAgICAgICAgICBkYXRhIDogSlNPTi5zdHJpbmdpZnkocmVxdWVzdERhdGEpXG4gICAgICAgICAgc3VjY2VzcyA6IChyZXNwb25zZXMpID0+IEByZWZldGNoQW5kUmVuZGVyKClcbiAgICAgICAgICBlcnJvciA6IC0+IFV0aWxzLm1pZEFsZXJ0IFwiRHVwbGljYXRpb24gZXJyb3JcIlxuXG4gIHJlZmV0Y2hBbmRSZW5kZXI6IC0+XG4gICAgYW55UXVlc3Rpb24gPSBAcXVlc3Rpb25zLm1vZGVsc1swXVxuICAgIEBxdWVzdGlvbnMuZmV0Y2ggXG4gICAgICBrZXk6IFwicVwiICsgYW55UXVlc3Rpb24uZ2V0KFwiYXNzZXNzbWVudElkXCIpXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBAcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9ucyhAcXVlc3Rpb25zLndoZXJlIHtzdWJ0ZXN0SWQgOiBhbnlRdWVzdGlvbi5nZXQoXCJzdWJ0ZXN0SWRcIikgfSlcbiAgICAgICAgQHJlbmRlciB0cnVlXG5cbiJdfQ==
