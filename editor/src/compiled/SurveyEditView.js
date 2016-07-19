var SurveyEditView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SurveyEditView = (function(superClass) {
  extend(SurveyEditView, superClass);

  function SurveyEditView() {
    this.renderQuestions = bind(this.renderQuestions, this);
    this.toggleAddQuestion = bind(this.toggleAddQuestion, this);
    return SurveyEditView.__super__.constructor.apply(this, arguments);
  }

  SurveyEditView.prototype.className = "SurveyEditView";

  SurveyEditView.prototype.events = {
    'click .add_question': 'toggleAddQuestion',
    'click .add_question_cancel': 'toggleAddQuestion',
    'click .add_question_add': 'addQuestion',
    'keypress #question_name': 'addQuestion'
  };

  SurveyEditView.prototype.initialize = function(options) {
    this.model = options.model;
    this.parent = options.parent;
    this.model.questions = new Questions;
    this.questionsEditView = new QuestionsEditView({
      questions: this.model.questions
    });
    Utils.working(true);
    return this.model.questions.fetch({
      key: "q" + this.model.get("assessmentId"),
      success: (function(_this) {
        return function() {
          Utils.working(false);
          _this.questionsEditView.questions = new Questions(_this.model.questions.where({
            subtestId: _this.model.id
          }));
          _this.questionsEditView.questions.ensureOrder();
          _this.questionsEditView.on("question-edit", function(questionId) {
            return _this.trigger("question-edit", questionId);
          });
          _this.questionsEditView.questions.on("change", _this.renderQuestions);
          return _this.renderQuestions();
        };
      })(this),
      erorr: (function(_this) {
        return function(a, b) {
          Utils.working(false);
          return Utils.midAlert("Error<br>Could not load questions<br>" + a + ", " + b, 5000);
        };
      })(this)
    });
  };

  SurveyEditView.prototype.toggleAddQuestion = function() {
    this.$el.find("#add_question_form, .add_question").fadeToggle(250, (function(_this) {
      return function() {
        if (_this.$el.find("#add_question_form").is(":visible")) {
          return _this.$el.find("#question_prompt").focus();
        }
      };
    })(this));
    return false;
  };

  SurveyEditView.prototype.addQuestion = function(event) {
    var newAttributes, nq;
    if (event.type !== "click" && event.which !== 13) {
      return true;
    }
    newAttributes = $.extend(Tangerine.templates.get("questionTemplate"), {
      subtestId: this.model.id,
      assessmentId: this.model.get("assessmentId"),
      id: Utils.guid(),
      order: this.questionsEditView.questions.length,
      prompt: this.$el.find('#question_prompt').val(),
      name: this.$el.find('#question_name').val().safetyDance()
    });
    nq = this.questionsEditView.questions.create(newAttributes);
    this.renderQuestions();
    this.$el.find("#add_question_form input").val('');
    this.$el.find("#question_prompt").focus();
    return false;
  };

  SurveyEditView.prototype.isValid = function() {
    return true;
  };

  SurveyEditView.prototype.save = function(options) {
    var _has, _question, _require, aWarnings, applicable, count, duplicateVariables, emptyOptions, i, j, k, len, len1, linkedQuestions, name, notSaved, plural, question, ref, ref1, ref2, requiresGrid, tWarnings, variableNames;
    options.questionSave = options.questionSave != null ? options.questionSave : true;
    this.model.set({
      "gridLinkId": this.$el.find("#link_select option:selected").val(),
      "autostopLimit": parseInt(this.$el.find("#autostop_limit").val()) || 0,
      "focusMode": this.$el.find("#focus_mode input:checked").val() === "true"
    });
    if (this.model.get("gridLinkId") !== "" && (this.model.questions != null)) {
      linkedQuestions = [];
      ref = this.model.questions.where({
        "subtestId": this.model.id
      });
      for (j = 0, len = ref.length; j < len; j++) {
        question = ref[j];
        applicable = question.getNumber("linkedGridScore") !== 0 && (this.itemNumberByLinkId[this.model.get("gridLinkId")] != null);
        if (applicable && question.get("linkedGridScore") > this.itemNumberByLinkId[this.model.get("gridLinkId")]) {
          linkedQuestions.push(question.get("name"));
        }
      }
      if (linkedQuestions.length > 0) {
        alert("Unreachable question warning\n\nThe linked grid contains fewer items than question" + ((linkedQuestions.length > 1 ? "s" : void 0) || "") + ": " + (linkedQuestions.join(", ")) + " demand" + ((!linkedQuestions.length > 1 ? "s" : void 0) || "") + ".");
      }
    }
    notSaved = [];
    emptyOptions = [];
    requiresGrid = [];
    duplicateVariables = [];
    variableNames = {};
    ref1 = this.questionsEditView.questions.models;
    for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
      question = ref1[i];
      if (question.get("name") !== "") {
        if (!_.isNumber(variableNames[question.get("name")])) {
          variableNames[question.get("name")] = 0;
        }
        variableNames[question.get("name")]++;
      }
      if (question.get("type") !== "open" && ((ref2 = question.get("options")) != null ? ref2.length : void 0) === 0 && !~question.getString('displayCode').indexOf('setOptions')) {
        emptyOptions.push(i + 1);
        if (options.questionSave) {
          if (!question.save()) {
            notSaved.push(i);
          }
          if (question.has("linkedGridScore") && question.get("linkedGridScore") !== "" && question.get("linkedGridScore") !== 0 && this.model.has("gridLinkId") === "" && this.model.get("gridLinkId") === "") {
            requiresGrid.push(i);
          }
        }
      }
    }
    for (name in variableNames) {
      count = variableNames[name];
      if (count !== 1) {
        duplicateVariables.push(name);
      }
    }
    aWarnings = [];
    if (notSaved.length !== 0) {
      Utils.midAlert("Error<br><br>Questions: <br>" + (notSaved.join(', ')) + "<br>not saved");
    }
    if (options.questionSave && emptyOptions.length !== 0) {
      plural = emptyOptions.length > 1;
      _question = plural ? "Questions" : "Question";
      _has = plural ? "have" : "has";
      aWarnings.push("- " + _question + " " + (emptyOptions.join(' ,')) + " " + _has + " no options.");
    }
    if (requiresGrid.length !== 0) {
      plural = emptyOptions.length > 1;
      _question = plural ? "Questions" : "Question";
      _require = plural ? "require" : "requires";
      aWarnings.push("- " + _question + " " + (requiresGrid.join(' ,')) + " " + _require + " a grid to be linked to this test.");
    }
    if (duplicateVariables.length !== 0) {
      aWarnings.push("- The following variables are duplicates\n " + (duplicateVariables.join(', ')));
    }
    if (aWarnings.length !== 0) {
      tWarnings = aWarnings.join("\n\n");
      return alert("Warning\n\n" + tWarnings);
    }
  };

  SurveyEditView.prototype.onClose = function() {
    var ref;
    return (ref = this.questionsListEdit) != null ? ref.close() : void 0;
  };

  SurveyEditView.prototype.renderQuestions = function() {
    var ref;
    return (ref = this.questionsEditView) != null ? ref.render() : void 0;
  };

  SurveyEditView.prototype.render = function() {
    var autostopLimit, focusMode, gridLinkId, subtests;
    gridLinkId = this.model.get("gridLinkId") || "";
    autostopLimit = parseInt(this.model.get("autostopLimit")) || 0;
    focusMode = this.model.getBoolean("focusMode");
    this.$el.html("<div class='label_value'> <label for='autostop_limit' title='The survey will discontinue after any N consecutive questions have been answered with a &quot;0&quot; value option.'>Autostop after N incorrect</label><br> <input id='autostop_limit' type='number' value='" + autostopLimit + "'> </div> <div class='label_value'> <label title='Displays one question at a time with next and previous buttons.'>Focus mode</label> <div id='focus_mode' class='buttonset'> <label for='focus_true'>Yes</label> <input name='focus_mode' type='radio' value='true' id='focus_true' " + (focusMode ? 'checked' : void 0) + "> <label for='focus_false'>No</label> <input name='focus_mode' type='radio' value='false' id='focus_false' " + (!focusMode ? 'checked' : void 0) + "> </div> </div> <div id='grid_link'></div> <div id='questions'> <h2>Questions</h2> <div class='menu_box'> <div id='question_list_wrapper'><img class='loading' src='images/loading.gif'><ul></ul></div> <button class='add_question command'>Add Question</button> <div id='add_question_form' class='confirmation'> <div class='menu_box'> <h2>New Question</h2> <label for='question_prompt'>Prompt</label> <input id='question_prompt'> <label for='question_name'>Variable name</label> <input id='question_name' title='Allowed characters: A-Z, a-z, 0-9, and underscores.'><br> <button class='add_question_add command'>Add</button><button class='add_question_cancel command'>Cancel</button> </div> </div> </div> </div>");
    this.$el.find("#question_list_wrapper .loading").remove();
    this.questionsEditView.setElement(this.$el.find("#question_list_wrapper ul"));
    this.renderQuestions();
    subtests = new Subtests;
    return subtests.fetch({
      key: "s" + this.model.get("assessmentId"),
      success: (function(_this) {
        return function(collection) {
          var j, len, linkSelect, subtest;
          collection = collection.where({
            prototype: 'grid'
          });
          linkSelect = "<div class='label_value'> <label for='link_select'>Linked to grid</label><br> <div class='menu_box'> <select id='link_select'> <option value=''>None</option>";
          for (j = 0, len = collection.length; j < len; j++) {
            subtest = collection[j];
            if (_this.itemNumberByLinkId == null) {
              _this.itemNumberByLinkId = {};
            }
            _this.itemNumberByLinkId[subtest.id] = subtest.get("items").length;
            linkSelect += "<option value='" + subtest.id + "' " + (gridLinkId === subtest.id ? 'selected' : '') + ">" + (subtest.get('name')) + "</option>";
          }
          linkSelect += "</select></div></div>";
          return _this.$el.find('#grid_link').html(linkSelect);
        };
      })(this)
    });
  };

  return SurveyEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9TdXJ2ZXlFZGl0Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxjQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7OzJCQUVKLFNBQUEsR0FBVzs7MkJBRVgsTUFBQSxHQUNFO0lBQUEscUJBQUEsRUFBK0IsbUJBQS9CO0lBQ0EsNEJBQUEsRUFBK0IsbUJBRC9CO0lBRUEseUJBQUEsRUFBK0IsYUFGL0I7SUFHQSx5QkFBQSxFQUErQixhQUgvQjs7OzJCQUtGLFVBQUEsR0FBWSxTQUFFLE9BQUY7SUFDVixJQUFDLENBQUEsS0FBRCxHQUFTLE9BQU8sQ0FBQztJQUNqQixJQUFDLENBQUEsTUFBRCxHQUFVLE9BQU8sQ0FBQztJQUNsQixJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsR0FBbUIsSUFBSTtJQUN2QixJQUFDLENBQUEsaUJBQUQsR0FBeUIsSUFBQSxpQkFBQSxDQUN2QjtNQUFBLFNBQUEsRUFBWSxJQUFDLENBQUEsS0FBSyxDQUFDLFNBQW5CO0tBRHVCO0lBR3pCLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZDtXQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQWpCLENBQ0U7TUFBQSxHQUFBLEVBQUssR0FBQSxHQUFNLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLGNBQVgsQ0FBWDtNQUNBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDUCxLQUFLLENBQUMsT0FBTixDQUFjLEtBQWQ7VUFDQSxLQUFDLENBQUEsaUJBQWlCLENBQUMsU0FBbkIsR0FBbUMsSUFBQSxTQUFBLENBQVUsS0FBQyxDQUFBLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBakIsQ0FBdUI7WUFBQyxTQUFBLEVBQVksS0FBQyxDQUFBLEtBQUssQ0FBQyxFQUFwQjtXQUF2QixDQUFWO1VBQ25DLEtBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsV0FBN0IsQ0FBQTtVQUVB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ZXMvU3VydmV5RWRpdFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTdXJ2ZXlFZGl0VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiU3VydmV5RWRpdFZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLmFkZF9xdWVzdGlvbicgICAgICAgIDogJ3RvZ2dsZUFkZFF1ZXN0aW9uJ1xuICAgICdjbGljayAuYWRkX3F1ZXN0aW9uX2NhbmNlbCcgOiAndG9nZ2xlQWRkUXVlc3Rpb24nXG4gICAgJ2NsaWNrIC5hZGRfcXVlc3Rpb25fYWRkJyAgICA6ICdhZGRRdWVzdGlvbidcbiAgICAna2V5cHJlc3MgI3F1ZXN0aW9uX25hbWUnICAgIDogJ2FkZFF1ZXN0aW9uJ1xuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApIC0+XG4gICAgQG1vZGVsID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgPSBvcHRpb25zLnBhcmVudFxuICAgIEBtb2RlbC5xdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zXG4gICAgQHF1ZXN0aW9uc0VkaXRWaWV3ID0gbmV3IFF1ZXN0aW9uc0VkaXRWaWV3XG4gICAgICBxdWVzdGlvbnMgOiBAbW9kZWwucXVlc3Rpb25zXG5cbiAgICBVdGlscy53b3JraW5nIHRydWVcbiAgICBAbW9kZWwucXVlc3Rpb25zLmZldGNoXG4gICAgICBrZXk6IFwicVwiICsgQG1vZGVsLmdldCBcImFzc2Vzc21lbnRJZFwiXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBVdGlscy53b3JraW5nIGZhbHNlXG4gICAgICAgIEBxdWVzdGlvbnNFZGl0Vmlldy5xdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zKEBtb2RlbC5xdWVzdGlvbnMud2hlcmUge3N1YnRlc3RJZCA6IEBtb2RlbC5pZCAgfSlcbiAgICAgICAgQHF1ZXN0aW9uc0VkaXRWaWV3LnF1ZXN0aW9ucy5lbnN1cmVPcmRlcigpXG5cbiAgICAgICAgQHF1ZXN0aW9uc0VkaXRWaWV3Lm9uIFwicXVlc3Rpb24tZWRpdFwiLCAocXVlc3Rpb25JZCkgPT4gQHRyaWdnZXIgXCJxdWVzdGlvbi1lZGl0XCIsIHF1ZXN0aW9uSWRcbiAgICAgICAgQHF1ZXN0aW9uc0VkaXRWaWV3LnF1ZXN0aW9ucy5vbiBcImNoYW5nZVwiLCBAcmVuZGVyUXVlc3Rpb25zXG4gICAgICAgIEByZW5kZXJRdWVzdGlvbnMoKVxuICAgICAgZXJvcnI6IChhLCBiKSA9PlxuICAgICAgICBVdGlscy53b3JraW5nIGZhbHNlXG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiRXJyb3I8YnI+Q291bGQgbm90IGxvYWQgcXVlc3Rpb25zPGJyPiN7YX0sICN7Yn1cIiwgNTAwMFxuXG4gIHRvZ2dsZUFkZFF1ZXN0aW9uOiA9PlxuICAgIEAkZWwuZmluZChcIiNhZGRfcXVlc3Rpb25fZm9ybSwgLmFkZF9xdWVzdGlvblwiKS5mYWRlVG9nZ2xlIDI1MCwgPT5cbiAgICAgIGlmIEAkZWwuZmluZChcIiNhZGRfcXVlc3Rpb25fZm9ybVwiKS5pcyhcIjp2aXNpYmxlXCIpXG4gICAgICAgIEAkZWwuZmluZChcIiNxdWVzdGlvbl9wcm9tcHRcIikuZm9jdXMoKVxuICAgIHJldHVybiBmYWxzZVxuXG4gIGFkZFF1ZXN0aW9uOiAoZXZlbnQpIC0+XG4gICAgXG4gICAgaWYgZXZlbnQudHlwZSAhPSBcImNsaWNrXCIgJiYgZXZlbnQud2hpY2ggIT0gMTNcbiAgICAgIHJldHVybiB0cnVlXG4gICAgXG4gICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwicXVlc3Rpb25UZW1wbGF0ZVwiKSxcbiAgICAgIHN1YnRlc3RJZCAgICA6IEBtb2RlbC5pZFxuICAgICAgYXNzZXNzbWVudElkIDogQG1vZGVsLmdldCBcImFzc2Vzc21lbnRJZFwiXG4gICAgICBpZCAgICAgICAgICAgOiBVdGlscy5ndWlkKClcbiAgICAgIG9yZGVyICAgICAgICA6IEBxdWVzdGlvbnNFZGl0Vmlldy5xdWVzdGlvbnMubGVuZ3RoXG4gICAgICBwcm9tcHQgICAgICAgOiBAJGVsLmZpbmQoJyNxdWVzdGlvbl9wcm9tcHQnKS52YWwoKVxuICAgICAgbmFtZSAgICAgICAgIDogQCRlbC5maW5kKCcjcXVlc3Rpb25fbmFtZScpLnZhbCgpLnNhZmV0eURhbmNlKClcblxuICAgIG5xID0gQHF1ZXN0aW9uc0VkaXRWaWV3LnF1ZXN0aW9ucy5jcmVhdGUgbmV3QXR0cmlidXRlc1xuICAgIEByZW5kZXJRdWVzdGlvbnMoKVxuICAgIEAkZWwuZmluZChcIiNhZGRfcXVlc3Rpb25fZm9ybSBpbnB1dFwiKS52YWwgJydcbiAgICBAJGVsLmZpbmQoXCIjcXVlc3Rpb25fcHJvbXB0XCIpLmZvY3VzKClcblxuICAgIHJldHVybiBmYWxzZVxuXG4gIGlzVmFsaWQ6IC0+IHRydWVcblxuICBzYXZlOiAob3B0aW9ucykgLT5cblxuICAgIG9wdGlvbnMucXVlc3Rpb25TYXZlID0gaWYgb3B0aW9ucy5xdWVzdGlvblNhdmU/IHRoZW4gb3B0aW9ucy5xdWVzdGlvblNhdmUgZWxzZSB0cnVlXG5cbiAgICBAbW9kZWwuc2V0XG4gICAgICBcImdyaWRMaW5rSWRcIiAgICA6IEAkZWwuZmluZChcIiNsaW5rX3NlbGVjdCBvcHRpb246c2VsZWN0ZWRcIikudmFsKClcbiAgICAgIFwiYXV0b3N0b3BMaW1pdFwiIDogcGFyc2VJbnQoQCRlbC5maW5kKFwiI2F1dG9zdG9wX2xpbWl0XCIpLnZhbCgpKSB8fCAwXG4gICAgICBcImZvY3VzTW9kZVwiICAgICA6IEAkZWwuZmluZChcIiNmb2N1c19tb2RlIGlucHV0OmNoZWNrZWRcIikudmFsKCkgPT0gXCJ0cnVlXCJcblxuICAgIGlmIEBtb2RlbC5nZXQoXCJncmlkTGlua0lkXCIpICE9IFwiXCIgJiYgQG1vZGVsLnF1ZXN0aW9ucz9cbiAgICAgIGxpbmtlZFF1ZXN0aW9ucyA9IFtdXG4gICAgICBmb3IgcXVlc3Rpb24gaW4gQG1vZGVsLnF1ZXN0aW9ucy53aGVyZSB7XCJzdWJ0ZXN0SWRcIiA6IEBtb2RlbC5pZH1cbiAgICAgICAgYXBwbGljYWJsZSA9IHF1ZXN0aW9uLmdldE51bWJlcihcImxpbmtlZEdyaWRTY29yZVwiKSAhPSAwICYmIEBpdGVtTnVtYmVyQnlMaW5rSWRbQG1vZGVsLmdldChcImdyaWRMaW5rSWRcIildP1xuICAgICAgICBpZiBhcHBsaWNhYmxlICYmIHF1ZXN0aW9uLmdldChcImxpbmtlZEdyaWRTY29yZVwiKSA+IEBpdGVtTnVtYmVyQnlMaW5rSWRbQG1vZGVsLmdldChcImdyaWRMaW5rSWRcIildXG4gICAgICAgICAgbGlua2VkUXVlc3Rpb25zLnB1c2ggcXVlc3Rpb24uZ2V0KFwibmFtZVwiKVxuXG4gICAgICBpZiBsaW5rZWRRdWVzdGlvbnMubGVuZ3RoID4gMFxuICAgICAgICBhbGVydCBcIlVucmVhY2hhYmxlIHF1ZXN0aW9uIHdhcm5pbmdcXG5cXG5UaGUgbGlua2VkIGdyaWQgY29udGFpbnMgZmV3ZXIgaXRlbXMgdGhhbiBxdWVzdGlvbiN7KFwic1wiIGlmIGxpbmtlZFF1ZXN0aW9ucy5sZW5ndGg+MSl8fFwiXCJ9OiAje2xpbmtlZFF1ZXN0aW9ucy5qb2luKFwiLCBcIil9IGRlbWFuZCN7KFwic1wiIGlmIG5vdCBsaW5rZWRRdWVzdGlvbnMubGVuZ3RoPjEpfHxcIlwifS5cIlxuXG4gICAgIyBibGFuayBvdXQgb3VyIGVycm9yIHF1ZXVlc1xuICAgIG5vdFNhdmVkID0gW11cbiAgICBlbXB0eU9wdGlvbnMgPSBbXVxuICAgIHJlcXVpcmVzR3JpZCA9IFtdXG4gICAgZHVwbGljYXRlVmFyaWFibGVzID0gW11cblxuICAgIHZhcmlhYmxlTmFtZXMgPSB7fVxuXG4gICAgIyBjaGVjayBmb3IgXCJlcnJvcnNcIlxuICAgIGZvciBxdWVzdGlvbiwgaSBpbiBAcXVlc3Rpb25zRWRpdFZpZXcucXVlc3Rpb25zLm1vZGVsc1xuXG4gICAgICBpZiBxdWVzdGlvbi5nZXQoXCJuYW1lXCIpICE9IFwiXCJcbiAgICAgICAgdmFyaWFibGVOYW1lc1txdWVzdGlvbi5nZXQoXCJuYW1lXCIpXSA9IDAgaWYgbm90IF8uaXNOdW1iZXIodmFyaWFibGVOYW1lc1txdWVzdGlvbi5nZXQoXCJuYW1lXCIpXSlcbiAgICAgICAgdmFyaWFibGVOYW1lc1txdWVzdGlvbi5nZXQoXCJuYW1lXCIpXSsrXG5cbiAgICAgIGlmIHF1ZXN0aW9uLmdldChcInR5cGVcIikgIT0gXCJvcGVuXCIgJiYgcXVlc3Rpb24uZ2V0KFwib3B0aW9uc1wiKT8ubGVuZ3RoID09IDAgJiYgIX5xdWVzdGlvbi5nZXRTdHJpbmcoJ2Rpc3BsYXlDb2RlJykuaW5kZXhPZignc2V0T3B0aW9ucycpXG4gICAgICAgIGVtcHR5T3B0aW9ucy5wdXNoIGkgKyAxXG4gICAgICBcbiAgICAgICAgaWYgb3B0aW9ucy5xdWVzdGlvblNhdmVcbiAgICAgICAgICBpZiBub3QgcXVlc3Rpb24uc2F2ZSgpXG4gICAgICAgICAgICBub3RTYXZlZC5wdXNoIGlcbiAgICAgICAgICBpZiBxdWVzdGlvbi5oYXMoXCJsaW5rZWRHcmlkU2NvcmVcIikgJiYgcXVlc3Rpb24uZ2V0KFwibGlua2VkR3JpZFNjb3JlXCIpICE9IFwiXCIgJiYgcXVlc3Rpb24uZ2V0KFwibGlua2VkR3JpZFNjb3JlXCIpICE9IDAgJiYgQG1vZGVsLmhhcyhcImdyaWRMaW5rSWRcIikgPT0gXCJcIiAmJiBAbW9kZWwuZ2V0KFwiZ3JpZExpbmtJZFwiKSA9PSBcIlwiXG4gICAgICAgICAgICByZXF1aXJlc0dyaWQucHVzaCBpXG4gICAgICAgIFxuICAgIGZvciBuYW1lLCBjb3VudCBvZiB2YXJpYWJsZU5hbWVzXG4gICAgICBkdXBsaWNhdGVWYXJpYWJsZXMucHVzaCBuYW1lIGlmIGNvdW50ICE9IDFcblxuICAgICMgZGlzcGxheSBlcnJvcnNcbiAgICBhV2FybmluZ3MgPSBbXVxuICAgIGlmIG5vdFNhdmVkLmxlbmd0aCAhPSAwXG4gICAgICBVdGlscy5taWRBbGVydCBcIkVycm9yPGJyPjxicj5RdWVzdGlvbnM6IDxicj4je25vdFNhdmVkLmpvaW4oJywgJyl9PGJyPm5vdCBzYXZlZFwiXG4gICAgaWYgb3B0aW9ucy5xdWVzdGlvblNhdmUgJiYgZW1wdHlPcHRpb25zLmxlbmd0aCAhPSAwXG4gICAgICBwbHVyYWwgPSBlbXB0eU9wdGlvbnMubGVuZ3RoID4gMVxuICAgICAgX3F1ZXN0aW9uID0gaWYgcGx1cmFsIHRoZW4gXCJRdWVzdGlvbnNcIiBlbHNlIFwiUXVlc3Rpb25cIlxuICAgICAgX2hhcyAgICAgID0gaWYgcGx1cmFsIHRoZW4gXCJoYXZlXCIgZWxzZSBcImhhc1wiXG4gICAgICBhV2FybmluZ3MucHVzaCBcIi0gI3tfcXVlc3Rpb259ICN7ZW1wdHlPcHRpb25zLmpvaW4oJyAsJyl9ICN7IF9oYXMgfSBubyBvcHRpb25zLlwiXG4gICAgaWYgcmVxdWlyZXNHcmlkLmxlbmd0aCAhPSAwXG4gICAgICBwbHVyYWwgPSBlbXB0eU9wdGlvbnMubGVuZ3RoID4gMVxuICAgICAgX3F1ZXN0aW9uID0gaWYgcGx1cmFsIHRoZW4gXCJRdWVzdGlvbnNcIiBlbHNlIFwiUXVlc3Rpb25cIlxuICAgICAgX3JlcXVpcmUgID0gaWYgcGx1cmFsIHRoZW4gXCJyZXF1aXJlXCIgZWxzZSBcInJlcXVpcmVzXCJcbiAgICAgIGFXYXJuaW5ncy5wdXNoIFwiLSAjeyBfcXVlc3Rpb24gfSAje3JlcXVpcmVzR3JpZC5qb2luKCcgLCcpfSAjeyBfcmVxdWlyZSB9IGEgZ3JpZCB0byBiZSBsaW5rZWQgdG8gdGhpcyB0ZXN0LlwiXG4gICAgaWYgZHVwbGljYXRlVmFyaWFibGVzLmxlbmd0aCAhPSAwXG4gICAgICBhV2FybmluZ3MucHVzaCBcIi0gVGhlIGZvbGxvd2luZyB2YXJpYWJsZXMgYXJlIGR1cGxpY2F0ZXNcXG4gI3tkdXBsaWNhdGVWYXJpYWJsZXMuam9pbignLCAnKX1cIlxuXG4gICAgaWYgYVdhcm5pbmdzLmxlbmd0aCAhPSAwXG4gICAgICB0V2FybmluZ3MgPSBhV2FybmluZ3Muam9pbihcIlxcblxcblwiKVxuICAgICAgYWxlcnQgXCJXYXJuaW5nXFxuXFxuI3t0V2FybmluZ3N9XCJcblxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgQHF1ZXN0aW9uc0xpc3RFZGl0Py5jbG9zZSgpXG5cbiAgcmVuZGVyUXVlc3Rpb25zOiA9PlxuICAgIEBxdWVzdGlvbnNFZGl0Vmlldz8ucmVuZGVyKClcblxuICByZW5kZXI6IC0+XG4gICAgICBcbiMgICAgYWRkUXVlc3Rpb25TZWxlY3QgPSBcIjxzZWxlY3QgaWQ9J2FkZF9xdWVzdGlvbl9zZWxlY3QnPlwiXG4jICAgIGZvciB0ZW1wbGF0ZSBpbiBUYW5nZXJpbmUudGVtcGxhdGVzLm9wdGlvblRlbXBsYXRlc1xuIyAgICAgIGFkZFF1ZXN0aW9uU2VsZWN0ICs9IFwiPG9wdGlvbiB2YWx1ZT0nI3t0ZW1wbGF0ZS5uYW1lfSc+I3t0ZW1wbGF0ZS5uYW1lfTwvb3B0aW9uPlwiXG4jICAgIGFkZFF1ZXN0aW9uU2VsZWN0ICs9IFwiPC9zZWxlY3Q+XCJcblxuICAgIGdyaWRMaW5rSWQgPSBAbW9kZWwuZ2V0KFwiZ3JpZExpbmtJZFwiKSB8fCBcIlwiXG4gICAgYXV0b3N0b3BMaW1pdCA9IHBhcnNlSW50KEBtb2RlbC5nZXQoXCJhdXRvc3RvcExpbWl0XCIpKSB8fCAwXG4gICAgZm9jdXNNb2RlID0gQG1vZGVsLmdldEJvb2xlYW4oXCJmb2N1c01vZGVcIilcblxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdhdXRvc3RvcF9saW1pdCcgdGl0bGU9J1RoZSBzdXJ2ZXkgd2lsbCBkaXNjb250aW51ZSBhZnRlciBhbnkgTiBjb25zZWN1dGl2ZSBxdWVzdGlvbnMgaGF2ZSBiZWVuIGFuc3dlcmVkIHdpdGggYSAmcXVvdDswJnF1b3Q7IHZhbHVlIG9wdGlvbi4nPkF1dG9zdG9wIGFmdGVyIE4gaW5jb3JyZWN0PC9sYWJlbD48YnI+XG4gICAgICAgIDxpbnB1dCBpZD0nYXV0b3N0b3BfbGltaXQnIHR5cGU9J251bWJlcicgdmFsdWU9JyN7YXV0b3N0b3BMaW1pdH0nPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIHRpdGxlPSdEaXNwbGF5cyBvbmUgcXVlc3Rpb24gYXQgYSB0aW1lIHdpdGggbmV4dCBhbmQgcHJldmlvdXMgYnV0dG9ucy4nPkZvY3VzIG1vZGU8L2xhYmVsPlxuICAgICAgICAgIDxkaXYgaWQ9J2ZvY3VzX21vZGUnIGNsYXNzPSdidXR0b25zZXQnPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0nZm9jdXNfdHJ1ZSc+WWVzPC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dCBuYW1lPSdmb2N1c19tb2RlJyB0eXBlPSdyYWRpbycgdmFsdWU9J3RydWUnIGlkPSdmb2N1c190cnVlJyAjeydjaGVja2VkJyBpZiBmb2N1c01vZGV9PlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0nZm9jdXNfZmFsc2UnPk5vPC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dCBuYW1lPSdmb2N1c19tb2RlJyB0eXBlPSdyYWRpbycgdmFsdWU9J2ZhbHNlJyBpZD0nZm9jdXNfZmFsc2UnICN7J2NoZWNrZWQnIGlmIG5vdCBmb2N1c01vZGV9PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgaWQ9J2dyaWRfbGluayc+PC9kaXY+XG4gICAgICA8ZGl2IGlkPSdxdWVzdGlvbnMnPlxuICAgICAgICA8aDI+UXVlc3Rpb25zPC9oMj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgIDxkaXYgaWQ9J3F1ZXN0aW9uX2xpc3Rfd3JhcHBlcic+PGltZyBjbGFzcz0nbG9hZGluZycgc3JjPSdpbWFnZXMvbG9hZGluZy5naWYnPjx1bD48L3VsPjwvZGl2PlxuICAgICAgICAgIDxidXR0b24gY2xhc3M9J2FkZF9xdWVzdGlvbiBjb21tYW5kJz5BZGQgUXVlc3Rpb248L2J1dHRvbj5cbiAgICAgICAgICA8ZGl2IGlkPSdhZGRfcXVlc3Rpb25fZm9ybScgY2xhc3M9J2NvbmZpcm1hdGlvbic+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgICAgICAgIDxoMj5OZXcgUXVlc3Rpb248L2gyPlxuICAgICAgICAgICAgICA8bGFiZWwgZm9yPSdxdWVzdGlvbl9wcm9tcHQnPlByb21wdDwvbGFiZWw+XG4gICAgICAgICAgICAgIDxpbnB1dCBpZD0ncXVlc3Rpb25fcHJvbXB0Jz5cbiAgICAgICAgICAgICAgPGxhYmVsIGZvcj0ncXVlc3Rpb25fbmFtZSc+VmFyaWFibGUgbmFtZTwvbGFiZWw+XG4gICAgICAgICAgICAgIDxpbnB1dCBpZD0ncXVlc3Rpb25fbmFtZScgdGl0bGU9J0FsbG93ZWQgY2hhcmFjdGVyczogQS1aLCBhLXosIDAtOSwgYW5kIHVuZGVyc2NvcmVzLic+PGJyPlxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdhZGRfcXVlc3Rpb25fYWRkIGNvbW1hbmQnPkFkZDwvYnV0dG9uPjxidXR0b24gY2xhc3M9J2FkZF9xdWVzdGlvbl9jYW5jZWwgY29tbWFuZCc+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj4gXG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XCJcblxuICAgIEAkZWwuZmluZChcIiNxdWVzdGlvbl9saXN0X3dyYXBwZXIgLmxvYWRpbmdcIikucmVtb3ZlKClcbiAgICBAcXVlc3Rpb25zRWRpdFZpZXcuc2V0RWxlbWVudCBAJGVsLmZpbmQoXCIjcXVlc3Rpb25fbGlzdF93cmFwcGVyIHVsXCIpXG5cbiAgICBAcmVuZGVyUXVlc3Rpb25zKClcblxuICAgICMgZ2V0IGxpbmtlZCBncmlkIG9wdGlvbnNcbiAgICBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgIHN1YnRlc3RzLmZldGNoXG4gICAgICBrZXk6IFwic1wiICsgQG1vZGVsLmdldCBcImFzc2Vzc21lbnRJZFwiXG4gICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgPT5cbiAgICAgICAgY29sbGVjdGlvbiA9IGNvbGxlY3Rpb24ud2hlcmVcbiAgICAgICAgICBwcm90b3R5cGUgICAgOiAnZ3JpZCcgIyBvbmx5IGdyaWRzIGNhbiBwcm92aWRlIHNjb3Jlc1xuXG4gICAgICAgIGxpbmtTZWxlY3QgPSBcIlxuICAgICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J2xpbmtfc2VsZWN0Jz5MaW5rZWQgdG8gZ3JpZDwvbGFiZWw+PGJyPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgICAgICA8c2VsZWN0IGlkPSdsaW5rX3NlbGVjdCc+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9Jyc+Tm9uZTwvb3B0aW9uPlwiXG4gICAgICAgIGZvciBzdWJ0ZXN0IGluIGNvbGxlY3Rpb25cbiAgICAgICAgICBAaXRlbU51bWJlckJ5TGlua0lkID0ge30gaWYgbm90IEBpdGVtTnVtYmVyQnlMaW5rSWQ/XG4gICAgICAgICAgQGl0ZW1OdW1iZXJCeUxpbmtJZFtzdWJ0ZXN0LmlkXSA9IHN1YnRlc3QuZ2V0KFwiaXRlbXNcIikubGVuZ3RoXG4gICAgICAgICAgbGlua1NlbGVjdCArPSBcIjxvcHRpb24gdmFsdWU9JyN7c3VidGVzdC5pZH0nICN7aWYgKGdyaWRMaW5rSWQgPT0gc3VidGVzdC5pZCkgdGhlbiAnc2VsZWN0ZWQnIGVsc2UgJyd9PiN7c3VidGVzdC5nZXQgJ25hbWUnfTwvb3B0aW9uPlwiXG4gICAgICAgIGxpbmtTZWxlY3QgKz0gXCI8L3NlbGVjdD48L2Rpdj48L2Rpdj5cIlxuICAgICAgICBAJGVsLmZpbmQoJyNncmlkX2xpbmsnKS5odG1sIGxpbmtTZWxlY3RcblxuIl19
