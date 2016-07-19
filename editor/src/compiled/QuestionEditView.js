var QuestionEditView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

QuestionEditView = (function(superClass) {
  extend(QuestionEditView, superClass);

  function QuestionEditView() {
    this.updateModel = bind(this.updateModel, this);
    this.goBack = bind(this.goBack, this);
    return QuestionEditView.__super__.constructor.apply(this, arguments);
  }

  QuestionEditView.prototype.className = "question_list_element";

  QuestionEditView.prototype.events = {
    'click .back': 'goBack',
    'click .done': 'done',
    'click .add_option': 'addOption',
    'click .delete_option': 'showDeleteConfirm',
    'click .delete_cancel': 'hideDeleteConfirm',
    'click .delete_delete': 'deleteOption',
    'click #question_type input:radio': 'changeQuestionType',
    'change .option_select': 'templateFill',
    'keypress .option_value': 'quickAddWithEnter',
    'keypress .option_label': 'quickFocusValue',
    'change #custom_validation_code': 'validateSyntax',
    'change #display_code': 'validateSyntax',
    'change #skip_logic': 'validateSyntax'
  };

  QuestionEditView.prototype.initialize = function(options) {
    this.activity = null;
    this.timer = 0;
    this.question = options.question;
    this.subtest = options.subtest;
    return this.assessment = options.assessment;
  };

  QuestionEditView.prototype.validateSyntax = function(event) {
    var $target, code, error, error1, message, name, oldAnswer, where;
    $target = $(event.target);
    code = $target.val();
    if (!_.isEmpty(code)) {
      try {
        oldAnswer = this.answer;
        this.answer = {};
        this.isValid = CoffeeScript.compile.apply(this, [code]);
        if (oldAnswer != null) {
          return this.answer = oldAnswer;
        } else {
          return delete this["answer"];
        }
      } catch (error1) {
        error = error1;
        name = (/function (.{1,})\(/.exec(error.constructor.toString())[1]);
        where = $target.attr('id').humanize();
        message = error.message;
        return alert("Error in " + where + "\n\n" + name + "\n\n" + message);
      }
    }
  };

  QuestionEditView.prototype.quickAddWithEnter = function(event) {
    if ((event.keyCode != null) && event.keyCode !== 13) {
      return true;
    }
    return this.addOption();
  };

  QuestionEditView.prototype.quickFocusValue = function(event) {
    if ((event.keyCode != null) && event.keyCode !== 13) {
      return true;
    }
    return $(event.target).parent().find(".option_value").focus();
  };

  QuestionEditView.prototype.templateFill = function(event) {
    var index, optionTemplates;
    index = $(event.target).find("option:selected").attr('data-index');
    optionTemplates = Tangerine.templates.get("optionTemplates");
    if (optionTemplates[index] != null) {
      this.question.set("options", optionTemplates[index].options);
      this.$el.find('#option_list_wrapper').html(this.getOptionList());
    }
    return false;
  };

  QuestionEditView.prototype.getOptionList = function() {
    var html, i, j, len, option, options;
    options = this.question.get("options");
    html = "<h2>Options</h2> <div class='menu_box'> <ul id='option_list'>";
    for (i = j = 0, len = options.length; j < len; i = ++j) {
      option = options[i];
      html += "<li class='question'> <table><tr><td> <img src='images/icon_drag.png' class='sortable_handle'> </td> <td> <div style='display: block;'> <div class='option_label_value'> <label class='edit' for='options." + i + ".label'>Label</label> <input id='options." + i + ".label' value='" + (_.escape(option.label)) + "' placeholder='Option label' class='option_label'><br> <label class='edit' for='options." + i + ".value' title='Allowed characters&#58; A-Z, a-z, 0-9, and underscores.'>Value</label> <input id='options." + i + ".value' value='" + (_.escape(option.value)) + "' placeholder='Option value' class='option_value'><br> </div> <img src='images/icon_delete.png' class='delete_option' data-index='" + i + "'> <div class='confirmation delete_confirm_" + i + "'> <button class='delete_delete command_red' data-index='" + i + "'>Delete</button> <button data-index='" + i + "' class='delete_cancel command'>Cancel</button> </div> </div> </td></tr></table> </li>";
    }
    return html += "</ul> <button class='add_option command'>Add option</button> </div>";
  };

  QuestionEditView.prototype.addOption = function() {
    var optionListElements, options;
    this.updateModel();
    options = this.question.get("options");
    options.push({
      label: "",
      value: ""
    });
    this.question.set("options", options);
    this.refreshOptionList();
    optionListElements = this.$el.find("#option_list_wrapper li");
    if (optionListElements.length !== 0) {
      return $(optionListElements.last()).scrollTo().find("input:first").focus();
    }
  };

  QuestionEditView.prototype.render = function() {
    var assessmentName, checkOrRadio, customValidationCode, customValidationMessage, displayCode, hint, i, j, len, linkedGridScore, name, option, optionHTML, optionTemplates, options, prompt, skipLogic, skippable, subtestName, type;
    assessmentName = this.assessment.escape("name");
    subtestName = this.subtest.escape("name");
    name = this.question.getEscapedString("name");
    prompt = this.question.getEscapedString("prompt");
    hint = this.question.getEscapedString("hint");
    skipLogic = this.question.getEscapedString("skipLogic");
    customValidationCode = this.question.getEscapedString("customValidationCode");
    customValidationMessage = this.question.getEscapedString("customValidationMessage");
    displayCode = this.question.getString("displayCode");
    type = this.question.get("type");
    options = this.question.get("options");
    linkedGridScore = this.question.getNumber("linkedGridScore");
    skippable = this.question.getBoolean("skippable");
    checkOrRadio = type === "multiple" ? "checkbox" : "radio";
    this.$el.html("<button class='back navigation'>Back</button> <h1>Question Editor</h1> <table class='basic_info'> <tr> <th>Subtest</th> <td>" + subtestName + "</td> </tr> <tr> <th>Assessment</th> <td>" + assessmentName + "</td> </tr> </table> <button class='done command'>Done</button> <div class='edit_form'> <div class='label_value'> <label for='name'>Variable name</label> <input id='name' type='text' value='" + name + "'> </div> <div class='label_value'> <label for='prompt'>Prompt</label> <input id='prompt' type='text' value='" + prompt + "'> </div> <div class='label_value'> <label for='hint'>Note to enumerator</label> <input id='hint' type='text' value='" + hint + "'> </div> <div class='label_value'> <label for='skip_logic' title='This statement will be skiped if it evaluates to true. example: ResultOfQuestion(\"maze1\") isnt \"2\" Example 2: \"red\" in ResultOfMultiple(\"fave_colors\")'>Skip if</label> <textarea rows='2' id='skip_logic'>" + skipLogic + "</textarea> </div> <div class='menu_box'> <label>Custom validation</label> <div class='label_value'> <label for='custom_validation_code' title='Intended for open questions. This code should evaluate to true or false. False will trigger an error message for this question. E.g. @answer == \"1\" will evaluate to false for any value other than 1.'>Valid when</label> <input id='custom_validation_code' type='text' value='" + customValidationCode + "'> </div> <div class='label_value'> <label for='custom_validation_message'>Error message</label> <input id='custom_validation_message' type='text' value='" + customValidationMessage + "'> </div> </div><br> <div class='menu_box'> <div class='label_value'> <label for='display_code' title='This CoffeeScript code will be executed when this question is shown. This option may only be used when Focus Mode is on.'>Action on display</label> <textarea id='display_code' rows='2'>" + displayCode + "</textarea> </div> </div> <div class='label_value'> <label>Skippable</label> <div id='skip_radio' class='buttonset'> <label for='skip_true'>Yes</label><input name='skippable' type='radio' value='true' id='skip_true' " + (skippable ? 'checked' : void 0) + "> <label for='skip_false'>No</label><input name='skippable' type='radio' value='false' id='skip_false' " + (!skippable ? 'checked' : void 0) + "> </div> </div> <div class='label_value'> <label for='linked_grid_score'>Items attempted required on linked grid</label> <input id='linked_grid_score' type='number' value='" + linkedGridScore + "'> </div> <div class='label_value' id='question_type' class='question_type'> <label>Question Type</label> <div class='buttonset'> <label for='single'>single</label> <input id='single' name='type' type='radio' value='single' " + (type === 'single' ? 'checked' : void 0) + "> <label for='multiple'>multiple</label> <input id='multiple' name='type'  type='radio' value='multiple' " + (type === 'multiple' ? 'checked' : void 0) + "> <label for='open'>open</label> <input id='open' name='type'  type='radio' value='open' " + (type === 'open' ? 'checked' : void 0) + "> </div> </div>");
    if (type !== "open") {
      optionHTML = "<div class='label_value'> <label for='question_template_select'>Fill from template</label><br> <div class='menu_box'> <select id='question_template_select' class='option_select'> <option selected='selected'>Select template</option>";
      optionTemplates = Tangerine.templates.get("optionTemplates");
      for (i = j = 0, len = optionTemplates.length; j < len; i = ++j) {
        option = optionTemplates[i];
        optionHTML += "<option data-index='" + i + "' class='template_option'>" + option.name + "</option>";
      }
      optionHTML += "</select> </div> <div id='option_list_wrapper'>" + (this.getOptionList()) + "</div>";
      this.$el.append(optionHTML);
      this.refreshSortable();
    }
    this.$el.append("<button class='done command'>Done</button> </div>");
    return this.trigger("rendered");
  };

  QuestionEditView.prototype.refreshOptionList = function() {
    this.$el.find("#option_list_wrapper").html(this.getOptionList());
    return this.refreshSortable();
  };

  QuestionEditView.prototype.refreshSortable = function() {
    return this.$el.find("#option_list").sortable({
      handle: '.sortable_handle',
      start: function(event, ui) {
        return ui.item.addClass("drag_shadow");
      },
      stop: function(event, ui) {
        return ui.item.removeClass("drag_shadow");
      },
      update: (function(_this) {
        return function(event, ui) {
          return _this.updateModel();
        };
      })(this)
    });
  };

  QuestionEditView.prototype.hijackEnter = function(event) {
    if (event.which === 13) {
      this.$el.find(event.target).blur();
      return false;
    }
  };

  QuestionEditView.prototype.changeQuestionType = function(event) {
    var $target;
    $target = $(event.target);
    if (($target.val() !== "open" && this.question.get("type") === "open") || ($target.val() === "open" && this.question.get("type") !== "open")) {
      this.updateModel();
      this.question.set("type", $target.val());
      this.question.set("options", []);
      return this.render();
    }
  };

  QuestionEditView.prototype.done = function() {
    if (this.activity !== null) {
      return false;
    }
    this.activity = "saving";
    this.updateModel();
    this.question.save(null, {
      success: (function(_this) {
        return function() {
          _this.activity = null;
          Utils.midAlert("Question Saved");
          clearTimeout(_this.timer);
          return _this.timer = setTimeout(_this.goBack, 500);
        };
      })(this),
      error: (function(_this) {
        return function() {
          _this.activity = null;
          return Utils.midAlert("Save error");
        };
      })(this)
    });
    return false;
  };

  QuestionEditView.prototype.goBack = function() {
    var classOrNot;
    if (this.question.has("curriculumId")) {
      classOrNot = 'class/';
    }
    Tangerine.router.navigate((classOrNot || "") + "subtest/" + (this.question.get('subtestId')), true);
    return false;
  };

  QuestionEditView.prototype.updateModel = function() {
    var i, j, label, last, len, li, optionListElements, options, value;
    this.question.set({
      "prompt": this.$el.find("#prompt").val(),
      "name": this.$el.find("#name").val().safetyDance(),
      "hint": this.$el.find("#hint").val(),
      "skipLogic": this.$el.find("#skip_logic").val(),
      "linkedGridScore": parseInt(this.$el.find("#linked_grid_score").val()),
      "type": this.$el.find("#question_type input:checked").val(),
      "skippable": this.$el.find("#skip_radio input:radio[name=skippable]:checked").val() === "true",
      "customValidationCode": this.$el.find("#custom_validation_code").val(),
      "customValidationMessage": this.$el.find("#custom_validation_message").val(),
      "displayCode": this.$el.find("#display_code").val()
    });
    options = [];
    i = 0;
    optionListElements = this.$el.find("#option_list li");
    for (j = 0, len = optionListElements.length; j < len; j++) {
      li = optionListElements[j];
      label = $(li).find(".option_label").val();
      value = $(li).find(".option_value").val().safetyDance();
      if ((label != null) || (value != null)) {
        options[i] = {
          label: label,
          value: value
        };
        i++;
      }
    }
    if (options.length !== 0) {
      last = options.pop();
      if (last.label !== "" && last.value !== "") {
        options.push(last);
      }
    }
    return this.question.set("options", options);
  };

  QuestionEditView.prototype.showDeleteConfirm = function(event) {
    return this.$el.find(".delete_confirm_" + (this.$el.find(event.target).attr('data-index'))).fadeIn(250);
  };

  QuestionEditView.prototype.hideDeleteConfirm = function(event) {
    return this.$el.find(".delete_confirm_" + (this.$el.find(event.target).attr('data-index'))).fadeOut(250);
  };

  QuestionEditView.prototype.deleteOption = function(event) {
    var options;
    this.updateModel();
    options = this.question.get("options");
    options.splice(this.$el.find(event.target).attr('data-index'), 1);
    this.question.set("options", options);
    this.refreshOptionList();
    return false;
  };

  return QuestionEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInF1ZXN0aW9uL1F1ZXN0aW9uRWRpdFZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsZ0JBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs7NkJBRUosU0FBQSxHQUFZOzs2QkFFWixNQUFBLEdBQ0U7SUFBQSxhQUFBLEVBQTRCLFFBQTVCO0lBQ0EsYUFBQSxFQUE0QixNQUQ1QjtJQUVBLG1CQUFBLEVBQTRCLFdBRjVCO0lBR0Esc0JBQUEsRUFBNEIsbUJBSDVCO0lBSUEsc0JBQUEsRUFBNEIsbUJBSjVCO0lBS0Esc0JBQUEsRUFBNEIsY0FMNUI7SUFNQSxrQ0FBQSxFQUEyQyxvQkFOM0M7SUFPQSx1QkFBQSxFQUE0QixjQVA1QjtJQVFBLHdCQUFBLEVBQTRCLG1CQVI1QjtJQVNBLHdCQUFBLEVBQTRCLGlCQVQ1QjtJQVVBLGdDQUFBLEVBQW1DLGdCQVZuQztJQVdBLHNCQUFBLEVBQW1DLGdCQVhuQztJQVlBLG9CQUFBLEVBQW1DLGdCQVpuQzs7OzZCQWNGLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFFVixJQUFDLENBQUEsUUFBRCxHQUFjO0lBQ2QsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUVULElBQUMsQ0FBQSxRQUFELEdBQWMsT0FBTyxDQUFDO0lBQ3RCLElBQUMsQ0FBQSxPQUFELEdBQWMsT0FBTyxDQUFDO1dBQ3RCLElBQUMsQ0FBQSxVQUFELEdBQWMsT0FBTyxDQUFDO0VBUFo7OzZCQVVaLGNBQUEsR0FBZ0IsU0FBQyxLQUFEO0FBQ2QsUUFBQTtJQUFBLE9BQUEsR0FBVSxDQUFBLENBQUUsS0FBSyxDQUFDLE1BQVI7SUFDVixJQUFBLEdBQU8sT0FBTyxDQUFDLEdBQVIsQ0FBQTtJQUNQLElBQUcsQ0FBSSxDQUFDLENBQUMsT0FBRixDQUFVLElBQVYsQ0FBUDtBQUNFO1FBQ0UsU0FBQSxHQUFZLElBQUMsQ0FBQTtRQUNiLElBQUMsQ0FBQSxNQUFELEdBQVU7UUFDVixJQUFDLENBQUEsT0FBRCxHQUFXLFlBQVksQ0FBQyxPQUFPLENBQUMsS0FBckIsQ0FBMkIsSUFBM0IsRUFBOEIsQ0FBQyxJQUFELENBQTlCO1FBQ1gsSUFBRyxpQkFBSDtpQkFBbUIsSUFBQyxDQUFBLE1BQUQsR0FBVSxVQUE3QjtTQUFBLE1BQUE7aUJBQTRDLE9BQU8sSUFBSyxDQUFBLFFBQUEsRUFBeEQ7U0FKRjtPQUFBLGNBQUE7UUFLTTtRQUNKLElBQUEsR0FBTyxDQUFFLG9CQUFxQixDQUFDLElBQXZCLENBQTRCLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBbEIsQ0FBQSxDQUE1QixDQUEwRCxDQUFBLENBQUEsQ0FBM0Q7UUFDUCxLQUFBLEdBQVEsT0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFiLENBQWtCLENBQUMsUUFBbkIsQ0FBQTtRQUNSLE9BQUEsR0FBVSxLQUFLLENBQUM7ZUFDaEIsS0FBQSxDQUFNLFdBQUEsR0FBWSxLQUFaLEdBQWtCLE1BQWxCLEdBQXdCLElBQXhCLEdBQTZCLE1BQTdCLEdBQW1DLE9BQXpDLEVBVEY7T0FERjs7RUFIYzs7NkJBZWhCLGlCQUFBLEdBQW1CLFNBQUMsS0FBRDtJQUNqQixJQUFHLHVCQUFBLElBQWtCLEtBQUssQ0FBQyxPQUFOLEtBQWlCLEVBQXRDO0FBQThDLGFBQU8sS0FBckQ7O1dBQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBQTtFQUZpQjs7NkJBSW5CLGVBQUEsR0FBaUIsU0FBQyxLQUFEO0lBQ2YsSUFBRyx1QkFBQSxJQUFrQixLQUFLLENBQUMsT0FBTixLQUFpQixFQUF0QztBQUE4QyxhQUFPLEtBQXJEOztXQUNBLENBQUEsQ0FBRSxLQUFLLENBQUMsTUFBUixDQUFlLENBQUMsTUFBaEIsQ0FBQSxDQUF3QixDQUFDLElBQXpCLENBQThCLGVBQTlCLENBQThDLENBQUMsS0FBL0MsQ0FBQTtFQUZlOzs2QkFJakIsWUFBQSxHQUFjLFNBQUMsS0FBRDtBQUNaLFFBQUE7SUFBQSxLQUFBLEdBQVEsQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxJQUFoQixDQUFxQixpQkFBckIsQ0FBdUMsQ0FBQyxJQUF4QyxDQUE2QyxZQUE3QztJQUNSLGVBQUEsR0FBa0IsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFwQixDQUF3QixpQkFBeEI7SUFDbEIsSUFBRyw4QkFBSDtNQUNFLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLFNBQWQsRUFBeUIsZUFBZ0IsQ0FBQSxLQUFBLENBQU0sQ0FBQyxPQUFoRDtNQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLHNCQUFWLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUF2QyxFQUZGOztBQUdBLFdBQU87RUFOSzs7NkJBUWQsYUFBQSxHQUFlLFNBQUE7QUFDYixRQUFBO0lBQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLFNBQWQ7SUFDVixJQUFBLEdBQU87QUFLUCxTQUFBLGlEQUFBOztNQUVFLElBQUEsSUFBUSw0TUFBQSxHQVFtQyxDQVJuQyxHQVFxQywyQ0FSckMsR0FTcUIsQ0FUckIsR0FTdUIsaUJBVHZCLEdBU3VDLENBQUMsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxNQUFNLENBQUMsS0FBaEIsQ0FBRCxDQVR2QyxHQVMrRCwwRkFUL0QsR0FVbUMsQ0FWbkMsR0FVcUMsMkdBVnJDLEdBV3FCLENBWHJCLEdBV3VCLGlCQVh2QixHQVd1QyxDQUFDLENBQUMsQ0FBQyxNQUFGLENBQVMsTUFBTSxDQUFDLEtBQWhCLENBQUQsQ0FYdkMsR0FXK0Qsb0lBWC9ELEdBYW9FLENBYnBFLEdBYXNFLDZDQWJ0RSxHQWN3QyxDQWR4QyxHQWMwQywyREFkMUMsR0Fld0QsQ0FmeEQsR0FlMEQsd0NBZjFELEdBZ0JzQixDQWhCdEIsR0FnQndCO0FBbEJsQztXQXdCQSxJQUFBLElBQVE7RUEvQks7OzZCQXdDZixTQUFBLEdBQVcsU0FBQTtBQUVULFFBQUE7SUFBQSxJQUFDLENBQUEsV0FBRCxDQUFBO0lBRUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLFNBQWQ7SUFDVixPQUFPLENBQUMsSUFBUixDQUNFO01BQUEsS0FBQSxFQUFRLEVBQVI7TUFDQSxLQUFBLEVBQVEsRUFEUjtLQURGO0lBR0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsU0FBZCxFQUF5QixPQUF6QjtJQUVBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0lBR0Esa0JBQUEsR0FBcUIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUseUJBQVY7SUFDckIsSUFBRyxrQkFBa0IsQ0FBQyxNQUFuQixLQUE2QixDQUFoQzthQUNFLENBQUEsQ0FBRSxrQkFBa0IsQ0FBQyxJQUFuQixDQUFBLENBQUYsQ0FBNEIsQ0FBQyxRQUE3QixDQUFBLENBQXVDLENBQUMsSUFBeEMsQ0FBNkMsYUFBN0MsQ0FBMkQsQ0FBQyxLQUE1RCxDQUFBLEVBREY7O0VBZFM7OzZCQWlCWCxNQUFBLEdBQVEsU0FBQTtBQUVOLFFBQUE7SUFBQSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFtQixNQUFuQjtJQUNqQixXQUFBLEdBQWlCLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixNQUFoQjtJQUVqQixJQUFBLEdBQWlCLElBQUMsQ0FBQSxRQUFRLENBQUMsZ0JBQVYsQ0FBMkIsTUFBM0I7SUFDakIsTUFBQSxHQUFpQixJQUFDLENBQUEsUUFBUSxDQUFDLGdCQUFWLENBQTJCLFFBQTNCO0lBQ2pCLElBQUEsR0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxnQkFBVixDQUEyQixNQUEzQjtJQUNqQixTQUFBLEdBQWlCLElBQUMsQ0FBQSxRQUFRLENBQUMsZ0JBQVYsQ0FBMkIsV0FBM0I7SUFFakIsb0JBQUEsR0FBMEIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxnQkFBVixDQUEyQixzQkFBM0I7SUFDMUIsdUJBQUEsR0FBMEIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxnQkFBVixDQUEyQix5QkFBM0I7SUFDMUIsV0FBQSxHQUEwQixJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVYsQ0FBb0IsYUFBcEI7SUFFMUIsSUFBQSxHQUFrQixJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxNQUFkO0lBQ2xCLE9BQUEsR0FBa0IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsU0FBZDtJQUNsQixlQUFBLEdBQWtCLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFvQixpQkFBcEI7SUFDbEIsU0FBQSxHQUFrQixJQUFDLENBQUEsUUFBUSxDQUFDLFVBQVYsQ0FBcUIsV0FBckI7SUFFbEIsWUFBQSxHQUFrQixJQUFBLEtBQVEsVUFBWCxHQUEyQixVQUEzQixHQUEyQztJQUUxRCxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSw4SEFBQSxHQU1FLFdBTkYsR0FNYywyQ0FOZCxHQVVFLGNBVkYsR0FVaUIsZ01BVmpCLEdBaUJrQyxJQWpCbEMsR0FpQnVDLCtHQWpCdkMsR0FxQm9DLE1BckJwQyxHQXFCMkMsdUhBckIzQyxHQXlCa0MsSUF6QmxDLEdBeUJ1Qyx3UkF6QnZDLEdBNkJpQyxTQTdCakMsR0E2QjJDLHFhQTdCM0MsR0FvQ3NELG9CQXBDdEQsR0FvQzJFLDRKQXBDM0UsR0F3Q3lELHVCQXhDekQsR0F3Q2lGLGtTQXhDakYsR0ErQ3FDLFdBL0NyQyxHQStDaUQsME5BL0NqRCxHQXVEa0csQ0FBYyxTQUFiLEdBQUEsU0FBQSxHQUFBLE1BQUQsQ0F2RGxHLEdBdUQwSCx5R0F2RDFILEdBd0RvRyxDQUFjLENBQUksU0FBakIsR0FBQSxTQUFBLEdBQUEsTUFBRCxDQXhEcEcsR0F3RGdJLDhLQXhEaEksR0E2RGlELGVBN0RqRCxHQTZEaUUsa09BN0RqRSxHQW1FMEQsQ0FBYyxJQUFBLEtBQVEsUUFBckIsR0FBQSxTQUFBLEdBQUEsTUFBRCxDQW5FMUQsR0FtRXlGLDJHQW5FekYsR0FxRStELENBQWMsSUFBQSxLQUFRLFVBQXJCLEdBQUEsU0FBQSxHQUFBLE1BQUQsQ0FyRS9ELEdBcUVnRywyRkFyRWhHLEdBdUV1RCxDQUFjLElBQUEsS0FBUSxNQUFyQixHQUFBLFNBQUEsR0FBQSxNQUFELENBdkV2RCxHQXVFb0YsaUJBdkU5RjtJQTRFQSxJQUFHLElBQUEsS0FBUSxNQUFYO01BQ0UsVUFBQSxHQUFhO01BUWIsZUFBQSxHQUFrQixTQUFTLENBQUMsU0FBUyxDQUFDLEdBQXBCLENBQXdCLGlCQUF4QjtBQUNsQixXQUFBLHlEQUFBOztRQUNFLFVBQUEsSUFBYyxzQkFBQSxHQUF1QixDQUF2QixHQUF5Qiw0QkFBekIsR0FBcUQsTUFBTSxDQUFDLElBQTVELEdBQWlFO0FBRGpGO01BR0EsVUFBQSxJQUFjLGlEQUFBLEdBRW1CLENBQUMsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFELENBRm5CLEdBRXFDO01BRW5ELElBQUMsQ0FBQSxHQUFHLENBQUMsTUFBTCxDQUFZLFVBQVo7TUFFQSxJQUFDLENBQUEsZUFBRCxDQUFBLEVBbkJGOztJQXFCQSxJQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsQ0FBWSxtREFBWjtXQUdBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQXpITTs7NkJBMkhSLGlCQUFBLEdBQW1CLFNBQUE7SUFDakIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsc0JBQVYsQ0FBaUMsQ0FBQyxJQUFsQyxDQUF1QyxJQUFDLENBQUEsYUFBRCxDQUFBLENBQXZDO1dBQ0EsSUFBQyxDQUFBLGVBQUQsQ0FBQTtFQUZpQjs7NkJBSW5CLGVBQUEsR0FBaUIsU0FBQTtXQUNmLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGNBQVYsQ0FBeUIsQ0FBQyxRQUExQixDQUNFO01BQUEsTUFBQSxFQUFTLGtCQUFUO01BQ0EsS0FBQSxFQUFPLFNBQUMsS0FBRCxFQUFRLEVBQVI7ZUFBZSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVIsQ0FBaUIsYUFBakI7TUFBZixDQURQO01BRUEsSUFBQSxFQUFPLFNBQUMsS0FBRCxFQUFRLEVBQVI7ZUFBZSxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVIsQ0FBb0IsYUFBcEI7TUFBZixDQUZQO01BR0EsTUFBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFELEVBQVEsRUFBUjtpQkFDUCxLQUFDLENBQUEsV0FBRCxDQUFBO1FBRE87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSFQ7S0FERjtFQURlOzs2QkFTakIsV0FBQSxHQUFhLFNBQUMsS0FBRDtJQUNYLElBQUcsS0FBSyxDQUFDLEtBQU4sS0FBZSxFQUFsQjtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLEtBQUssQ0FBQyxNQUFoQixDQUF1QixDQUFDLElBQXhCLENBQUE7QUFDQSxhQUFPLE1BRlQ7O0VBRFc7OzZCQUtiLGtCQUFBLEdBQW9CLFNBQUMsS0FBRDtBQUNsQixRQUFBO0lBQUEsT0FBQSxHQUFVLENBQUEsQ0FBRSxLQUFLLENBQUMsTUFBUjtJQUVWLElBQUcsQ0FBQyxPQUFPLENBQUMsR0FBUixDQUFBLENBQUEsS0FBaUIsTUFBakIsSUFBMkIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsTUFBZCxDQUFBLEtBQXlCLE1BQXJELENBQUEsSUFBZ0UsQ0FBQyxPQUFPLENBQUMsR0FBUixDQUFBLENBQUEsS0FBaUIsTUFBakIsSUFBMkIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsTUFBZCxDQUFBLEtBQXlCLE1BQXJELENBQW5FO01BQ0UsSUFBQyxDQUFBLFdBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLE1BQWQsRUFBc0IsT0FBTyxDQUFDLEdBQVIsQ0FBQSxDQUF0QjtNQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLFNBQWQsRUFBeUIsRUFBekI7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBSkY7O0VBSGtCOzs2QkFZcEIsSUFBQSxHQUFNLFNBQUE7SUFDSixJQUFvQixJQUFDLENBQUEsUUFBRCxLQUFhLElBQWpDO0FBQUEsYUFBTyxNQUFQOztJQUNBLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFFWixJQUFDLENBQUEsV0FBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsSUFBZixFQUNFO01BQUEsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNQLEtBQUMsQ0FBQSxRQUFELEdBQVk7VUFDWixLQUFLLENBQUMsUUFBTixDQUFlLGdCQUFmO1VBQ0EsWUFBQSxDQUFhLEtBQUMsQ0FBQSxLQUFkO2lCQUNBLEtBQUMsQ0FBQSxLQUFELEdBQVMsVUFBQSxDQUFXLEtBQUMsQ0FBQSxNQUFaLEVBQW9CLEdBQXBCO1FBSkY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7TUFLQSxLQUFBLEVBQU8sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ0wsS0FBQyxDQUFBLFFBQUQsR0FBWTtpQkFDWixLQUFLLENBQUMsUUFBTixDQUFlLFlBQWY7UUFGSztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FMUDtLQURGO0FBU0EsV0FBTztFQWRIOzs2QkFnQk4sTUFBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0lBQUEsSUFBeUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsY0FBZCxDQUF6QjtNQUFBLFVBQUEsR0FBYSxTQUFiOztJQUNBLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBakIsQ0FBNEIsQ0FBQyxVQUFBLElBQVksRUFBYixDQUFBLEdBQWdCLFVBQWhCLEdBQXlCLENBQUMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsV0FBZCxDQUFELENBQXJELEVBQW9GLElBQXBGO0FBQ0EsV0FBTztFQUhEOzs2QkFLUixXQUFBLEdBQWEsU0FBQTtBQUVYLFFBQUE7SUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FDRTtNQUFBLFFBQUEsRUFBb0IsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsU0FBVixDQUFvQixDQUFDLEdBQXJCLENBQUEsQ0FBcEI7TUFDQSxNQUFBLEVBQW9CLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLE9BQVYsQ0FBa0IsQ0FBQyxHQUFuQixDQUFBLENBQXdCLENBQUMsV0FBekIsQ0FBQSxDQURwQjtNQUVBLE1BQUEsRUFBb0IsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsT0FBVixDQUFrQixDQUFDLEdBQW5CLENBQUEsQ0FGcEI7TUFHQSxXQUFBLEVBQW9CLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGFBQVYsQ0FBd0IsQ0FBQyxHQUF6QixDQUFBLENBSHBCO01BSUEsaUJBQUEsRUFBb0IsUUFBQSxDQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLG9CQUFWLENBQStCLENBQUMsR0FBaEMsQ0FBQSxDQUFULENBSnBCO01BS0EsTUFBQSxFQUFvQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSw4QkFBVixDQUF5QyxDQUFDLEdBQTFDLENBQUEsQ0FMcEI7TUFNQSxXQUFBLEVBQW9CLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlEQUFWLENBQTRELENBQUMsR0FBN0QsQ0FBQSxDQUFBLEtBQXNFLE1BTjFGO01BT0Esc0JBQUEsRUFBNEIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUseUJBQVYsQ0FBb0MsQ0FBQyxHQUFyQyxDQUFBLENBUDVCO01BUUEseUJBQUEsRUFBNEIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsNEJBQVYsQ0FBdUMsQ0FBQyxHQUF4QyxDQUFBLENBUjVCO01BU0EsYUFBQSxFQUE0QixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxlQUFWLENBQTBCLENBQUMsR0FBM0IsQ0FBQSxDQVQ1QjtLQURGO0lBYUEsT0FBQSxHQUFVO0lBQ1YsQ0FBQSxHQUFJO0lBQ0osa0JBQUEsR0FBcUIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsaUJBQVY7QUFDckIsU0FBQSxvREFBQTs7TUFDRSxLQUFBLEdBQVEsQ0FBQSxDQUFFLEVBQUYsQ0FBSyxDQUFDLElBQU4sQ0FBVyxlQUFYLENBQTJCLENBQUMsR0FBNUIsQ0FBQTtNQUNSLEtBQUEsR0FBUSxDQUFBLENBQUUsRUFBRixDQUFLLENBQUMsSUFBTixDQUFXLGVBQVgsQ0FBMkIsQ0FBQyxHQUE1QixDQUFBLENBQWlDLENBQUMsV0FBbEMsQ0FBQTtNQUVSLElBQUcsZUFBQSxJQUFVLGVBQWI7UUFDRSxPQUFRLENBQUEsQ0FBQSxDQUFSLEdBQ0U7VUFBQSxLQUFBLEVBQVEsS0FBUjtVQUNBLEtBQUEsRUFBUSxLQURSOztRQUVGLENBQUEsR0FKRjs7QUFKRjtJQVdBLElBQUcsT0FBTyxDQUFDLE1BQVIsS0FBa0IsQ0FBckI7TUFDRSxJQUFBLEdBQU8sT0FBTyxDQUFDLEdBQVIsQ0FBQTtNQUNQLElBQUcsSUFBSSxDQUFDLEtBQUwsS0FBYyxFQUFkLElBQW9CLElBQUksQ0FBQyxLQUFMLEtBQWMsRUFBckM7UUFBNkMsT0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFiLEVBQTdDO09BRkY7O1dBSUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsU0FBZCxFQUF5QixPQUF6QjtFQWpDVzs7NkJBc0NiLGlCQUFBLEdBQW1CLFNBQUMsS0FBRDtXQUFXLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGtCQUFBLEdBQWtCLENBQUMsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsS0FBSyxDQUFDLE1BQWhCLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsWUFBN0IsQ0FBRCxDQUE1QixDQUEwRSxDQUFDLE1BQTNFLENBQWtGLEdBQWxGO0VBQVg7OzZCQUNuQixpQkFBQSxHQUFtQixTQUFDLEtBQUQ7V0FBVyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxrQkFBQSxHQUFrQixDQUFDLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLEtBQUssQ0FBQyxNQUFoQixDQUF1QixDQUFDLElBQXhCLENBQTZCLFlBQTdCLENBQUQsQ0FBNUIsQ0FBMEUsQ0FBQyxPQUEzRSxDQUFtRixHQUFuRjtFQUFYOzs2QkFDbkIsWUFBQSxHQUFjLFNBQUMsS0FBRDtBQUNaLFFBQUE7SUFBQSxJQUFDLENBQUEsV0FBRCxDQUFBO0lBQ0EsT0FBQSxHQUFVLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLFNBQWQ7SUFDVixPQUFPLENBQUMsTUFBUixDQUFlLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLEtBQUssQ0FBQyxNQUFoQixDQUF1QixDQUFDLElBQXhCLENBQTZCLFlBQTdCLENBQWYsRUFBMkQsQ0FBM0Q7SUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxTQUFkLEVBQXlCLE9BQXpCO0lBQ0EsSUFBQyxDQUFBLGlCQUFELENBQUE7QUFDQSxXQUFPO0VBTks7Ozs7R0EzVWUsUUFBUSxDQUFDIiwiZmlsZSI6InF1ZXN0aW9uL1F1ZXN0aW9uRWRpdFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBRdWVzdGlvbkVkaXRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwicXVlc3Rpb25fbGlzdF9lbGVtZW50XCJcblxuICBldmVudHMgOlxuICAgICdjbGljayAuYmFjaycgICAgICAgICAgICAgOiAnZ29CYWNrJ1xuICAgICdjbGljayAuZG9uZScgICAgICAgICAgICAgOiAnZG9uZSdcbiAgICAnY2xpY2sgLmFkZF9vcHRpb24nICAgICAgIDogJ2FkZE9wdGlvbidcbiAgICAnY2xpY2sgLmRlbGV0ZV9vcHRpb24nICAgIDogJ3Nob3dEZWxldGVDb25maXJtJ1xuICAgICdjbGljayAuZGVsZXRlX2NhbmNlbCcgICAgOiAnaGlkZURlbGV0ZUNvbmZpcm0nXG4gICAgJ2NsaWNrIC5kZWxldGVfZGVsZXRlJyAgICA6ICdkZWxldGVPcHRpb24nXG4gICAgJ2NsaWNrICNxdWVzdGlvbl90eXBlIGlucHV0OnJhZGlvJyAgICAgICA6ICdjaGFuZ2VRdWVzdGlvblR5cGUnXG4gICAgJ2NoYW5nZSAub3B0aW9uX3NlbGVjdCcgICA6ICd0ZW1wbGF0ZUZpbGwnXG4gICAgJ2tleXByZXNzIC5vcHRpb25fdmFsdWUnICA6ICdxdWlja0FkZFdpdGhFbnRlcidcbiAgICAna2V5cHJlc3MgLm9wdGlvbl9sYWJlbCcgIDogJ3F1aWNrRm9jdXNWYWx1ZSdcbiAgICAnY2hhbmdlICNjdXN0b21fdmFsaWRhdGlvbl9jb2RlJyA6ICd2YWxpZGF0ZVN5bnRheCdcbiAgICAnY2hhbmdlICNkaXNwbGF5X2NvZGUnICAgICAgICAgICA6ICd2YWxpZGF0ZVN5bnRheCdcbiAgICAnY2hhbmdlICNza2lwX2xvZ2ljJyAgICAgICAgICAgICA6ICd2YWxpZGF0ZVN5bnRheCdcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgIEBhY3Rpdml0eSAgID0gbnVsbFxuICAgIEB0aW1lciA9IDBcblxuICAgIEBxdWVzdGlvbiAgID0gb3B0aW9ucy5xdWVzdGlvblxuICAgIEBzdWJ0ZXN0ICAgID0gb3B0aW9ucy5zdWJ0ZXN0XG4gICAgQGFzc2Vzc21lbnQgPSBvcHRpb25zLmFzc2Vzc21lbnRcblxuXG4gIHZhbGlkYXRlU3ludGF4OiAoZXZlbnQpIC0+XG4gICAgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KVxuICAgIGNvZGUgPSAkdGFyZ2V0LnZhbCgpXG4gICAgaWYgbm90IF8uaXNFbXB0eShjb2RlKVxuICAgICAgdHJ5XG4gICAgICAgIG9sZEFuc3dlciA9IEBhbnN3ZXJcbiAgICAgICAgQGFuc3dlciA9IHt9XG4gICAgICAgIEBpc1ZhbGlkID0gQ29mZmVlU2NyaXB0LmNvbXBpbGUuYXBwbHkoQCwgW2NvZGVdKVxuICAgICAgICBpZiBvbGRBbnN3ZXI/IHRoZW4gQGFuc3dlciA9IG9sZEFuc3dlciBlbHNlIGRlbGV0ZSB0aGlzW1wiYW5zd2VyXCJdXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICBuYW1lID0gKCgvZnVuY3Rpb24gKC57MSx9KVxcKC8pLmV4ZWMoZXJyb3IuY29uc3RydWN0b3IudG9TdHJpbmcoKSlbMV0pXG4gICAgICAgIHdoZXJlID0gJHRhcmdldC5hdHRyKCdpZCcpLmh1bWFuaXplKClcbiAgICAgICAgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2VcbiAgICAgICAgYWxlcnQgXCJFcnJvciBpbiAje3doZXJlfVxcblxcbiN7bmFtZX1cXG5cXG4je21lc3NhZ2V9XCJcblxuICBxdWlja0FkZFdpdGhFbnRlcjogKGV2ZW50KSAtPlxuICAgIGlmIGV2ZW50LmtleUNvZGU/ICYmIGV2ZW50LmtleUNvZGUgIT0gMTMgdGhlbiByZXR1cm4gdHJ1ZVxuICAgIEBhZGRPcHRpb24oKVxuXG4gIHF1aWNrRm9jdXNWYWx1ZTogKGV2ZW50KSAtPlxuICAgIGlmIGV2ZW50LmtleUNvZGU/ICYmIGV2ZW50LmtleUNvZGUgIT0gMTMgdGhlbiByZXR1cm4gdHJ1ZVxuICAgICQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5maW5kKFwiLm9wdGlvbl92YWx1ZVwiKS5mb2N1cygpXG5cbiAgdGVtcGxhdGVGaWxsOiAoZXZlbnQpIC0+XG4gICAgaW5kZXggPSAkKGV2ZW50LnRhcmdldCkuZmluZChcIm9wdGlvbjpzZWxlY3RlZFwiKS5hdHRyKCdkYXRhLWluZGV4JylcbiAgICBvcHRpb25UZW1wbGF0ZXMgPSBUYW5nZXJpbmUudGVtcGxhdGVzLmdldChcIm9wdGlvblRlbXBsYXRlc1wiKVxuICAgIGlmIG9wdGlvblRlbXBsYXRlc1tpbmRleF0/XG4gICAgICBAcXVlc3Rpb24uc2V0IFwib3B0aW9uc1wiLCBvcHRpb25UZW1wbGF0ZXNbaW5kZXhdLm9wdGlvbnNcbiAgICAgIEAkZWwuZmluZCgnI29wdGlvbl9saXN0X3dyYXBwZXInKS5odG1sIEBnZXRPcHRpb25MaXN0KClcbiAgICByZXR1cm4gZmFsc2VcblxuICBnZXRPcHRpb25MaXN0OiAtPlxuICAgIG9wdGlvbnMgPSBAcXVlc3Rpb24uZ2V0IFwib3B0aW9uc1wiXG4gICAgaHRtbCA9IFwiPGgyPk9wdGlvbnM8L2gyPlxuICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICA8dWwgaWQ9J29wdGlvbl9saXN0Jz5cbiAgICBcIlxuXG4gICAgZm9yIG9wdGlvbiwgaSBpbiBvcHRpb25zXG4gICAgICBcbiAgICAgIGh0bWwgKz0gXCJcbiAgICAgIDxsaSBjbGFzcz0ncXVlc3Rpb24nPlxuICAgICAgICA8dGFibGU+PHRyPjx0ZD5cbiAgICAgICAgICA8aW1nIHNyYz0naW1hZ2VzL2ljb25fZHJhZy5wbmcnIGNsYXNzPSdzb3J0YWJsZV9oYW5kbGUnPlxuICAgICAgICA8L3RkPlxuICAgICAgICA8dGQ+XG4gICAgICAgICAgPGRpdiBzdHlsZT0nZGlzcGxheTogYmxvY2s7Jz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9J29wdGlvbl9sYWJlbF92YWx1ZSc+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0nZWRpdCcgZm9yPSdvcHRpb25zLiN7aX0ubGFiZWwnPkxhYmVsPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGlucHV0IGlkPSdvcHRpb25zLiN7aX0ubGFiZWwnIHZhbHVlPScje18uZXNjYXBlKG9wdGlvbi5sYWJlbCl9JyBwbGFjZWhvbGRlcj0nT3B0aW9uIGxhYmVsJyBjbGFzcz0nb3B0aW9uX2xhYmVsJz48YnI+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0nZWRpdCcgZm9yPSdvcHRpb25zLiN7aX0udmFsdWUnIHRpdGxlPSdBbGxvd2VkIGNoYXJhY3RlcnMmIzU4OyBBLVosIGEteiwgMC05LCBhbmQgdW5kZXJzY29yZXMuJz5WYWx1ZTwvbGFiZWw+XG4gICAgICAgICAgICAgIDxpbnB1dCBpZD0nb3B0aW9ucy4je2l9LnZhbHVlJyB2YWx1ZT0nI3tfLmVzY2FwZShvcHRpb24udmFsdWUpfScgcGxhY2Vob2xkZXI9J09wdGlvbiB2YWx1ZScgY2xhc3M9J29wdGlvbl92YWx1ZSc+PGJyPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8aW1nIHNyYz0naW1hZ2VzL2ljb25fZGVsZXRlLnBuZycgY2xhc3M9J2RlbGV0ZV9vcHRpb24nIGRhdGEtaW5kZXg9JyN7aX0nPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz0nY29uZmlybWF0aW9uIGRlbGV0ZV9jb25maXJtXyN7aX0nPlxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdkZWxldGVfZGVsZXRlIGNvbW1hbmRfcmVkJyBkYXRhLWluZGV4PScje2l9Jz5EZWxldGU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBkYXRhLWluZGV4PScje2l9JyBjbGFzcz0nZGVsZXRlX2NhbmNlbCBjb21tYW5kJz5DYW5jZWw8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3RkPjwvdHI+PC90YWJsZT5cbiAgICAgIDwvbGk+XG4gICAgICBcIlxuICAgIGh0bWwgKz0gXCI8L3VsPlxuXG4gICAgICA8YnV0dG9uIGNsYXNzPSdhZGRfb3B0aW9uIGNvbW1hbmQnPkFkZCBvcHRpb248L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgICBcIlxuXG4gICNcbiAgIyBBZGRpbmcgYW4gb3B0aW9uXG4gICNcbiAgYWRkT3B0aW9uOiAtPlxuXG4gICAgQHVwZGF0ZU1vZGVsKClcblxuICAgIG9wdGlvbnMgPSBAcXVlc3Rpb24uZ2V0IFwib3B0aW9uc1wiXG4gICAgb3B0aW9ucy5wdXNoXG4gICAgICBsYWJlbCA6IFwiXCJcbiAgICAgIHZhbHVlIDogXCJcIlxuICAgIEBxdWVzdGlvbi5zZXQgXCJvcHRpb25zXCIsIG9wdGlvbnNcblxuICAgIEByZWZyZXNoT3B0aW9uTGlzdCgpXG5cbiAgICAjIGZvY3VzIG9uIG5leHRcbiAgICBvcHRpb25MaXN0RWxlbWVudHMgPSBAJGVsLmZpbmQoXCIjb3B0aW9uX2xpc3Rfd3JhcHBlciBsaVwiKVxuICAgIGlmIG9wdGlvbkxpc3RFbGVtZW50cy5sZW5ndGggIT0gMFxuICAgICAgJChvcHRpb25MaXN0RWxlbWVudHMubGFzdCgpKS5zY3JvbGxUbygpLmZpbmQoXCJpbnB1dDpmaXJzdFwiKS5mb2N1cygpXG5cbiAgcmVuZGVyOiAtPlxuXG4gICAgYXNzZXNzbWVudE5hbWUgPSBAYXNzZXNzbWVudC5lc2NhcGUoXCJuYW1lXCIpXG4gICAgc3VidGVzdE5hbWUgICAgPSBAc3VidGVzdC5lc2NhcGUoXCJuYW1lXCIpXG5cbiAgICBuYW1lICAgICAgICAgICA9IEBxdWVzdGlvbi5nZXRFc2NhcGVkU3RyaW5nKFwibmFtZVwiKVxuICAgIHByb21wdCAgICAgICAgID0gQHF1ZXN0aW9uLmdldEVzY2FwZWRTdHJpbmcoXCJwcm9tcHRcIilcbiAgICBoaW50ICAgICAgICAgICA9IEBxdWVzdGlvbi5nZXRFc2NhcGVkU3RyaW5nKFwiaGludFwiKVxuICAgIHNraXBMb2dpYyAgICAgID0gQHF1ZXN0aW9uLmdldEVzY2FwZWRTdHJpbmcoXCJza2lwTG9naWNcIilcblxuICAgIGN1c3RvbVZhbGlkYXRpb25Db2RlICAgID0gQHF1ZXN0aW9uLmdldEVzY2FwZWRTdHJpbmcoXCJjdXN0b21WYWxpZGF0aW9uQ29kZVwiKVxuICAgIGN1c3RvbVZhbGlkYXRpb25NZXNzYWdlID0gQHF1ZXN0aW9uLmdldEVzY2FwZWRTdHJpbmcoXCJjdXN0b21WYWxpZGF0aW9uTWVzc2FnZVwiKVxuICAgIGRpc3BsYXlDb2RlICAgICAgICAgICAgID0gQHF1ZXN0aW9uLmdldFN0cmluZyhcImRpc3BsYXlDb2RlXCIpXG5cbiAgICB0eXBlICAgICAgICAgICAgPSBAcXVlc3Rpb24uZ2V0IFwidHlwZVwiXG4gICAgb3B0aW9ucyAgICAgICAgID0gQHF1ZXN0aW9uLmdldCBcIm9wdGlvbnNcIlxuICAgIGxpbmtlZEdyaWRTY29yZSA9IEBxdWVzdGlvbi5nZXROdW1iZXIoXCJsaW5rZWRHcmlkU2NvcmVcIilcbiAgICBza2lwcGFibGUgICAgICAgPSBAcXVlc3Rpb24uZ2V0Qm9vbGVhbihcInNraXBwYWJsZVwiKVxuXG4gICAgY2hlY2tPclJhZGlvID0gaWYgdHlwZSA9PSBcIm11bHRpcGxlXCIgdGhlbiBcImNoZWNrYm94XCIgZWxzZSBcInJhZGlvXCJcblxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGJ1dHRvbiBjbGFzcz0nYmFjayBuYXZpZ2F0aW9uJz5CYWNrPC9idXR0b24+XG4gICAgICA8aDE+UXVlc3Rpb24gRWRpdG9yPC9oMT5cbiAgICAgIDx0YWJsZSBjbGFzcz0nYmFzaWNfaW5mbyc+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+U3VidGVzdDwvdGg+XG4gICAgICAgICAgPHRkPiN7c3VidGVzdE5hbWV9PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0aD5Bc3Nlc3NtZW50PC90aD5cbiAgICAgICAgICA8dGQ+I3thc3Nlc3NtZW50TmFtZX08L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgPC90YWJsZT5cbiAgICAgIDxidXR0b24gY2xhc3M9J2RvbmUgY29tbWFuZCc+RG9uZTwvYnV0dG9uPlxuICAgICAgPGRpdiBjbGFzcz0nZWRpdF9mb3JtJz5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgIDxsYWJlbCBmb3I9J25hbWUnPlZhcmlhYmxlIG5hbWU8L2xhYmVsPlxuICAgICAgICAgIDxpbnB1dCBpZD0nbmFtZScgdHlwZT0ndGV4dCcgdmFsdWU9JyN7bmFtZX0nPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgIDxsYWJlbCBmb3I9J3Byb21wdCc+UHJvbXB0PC9sYWJlbD5cbiAgICAgICAgICA8aW5wdXQgaWQ9J3Byb21wdCcgdHlwZT0ndGV4dCcgdmFsdWU9JyN7cHJvbXB0fSc+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0naGludCc+Tm90ZSB0byBlbnVtZXJhdG9yPC9sYWJlbD5cbiAgICAgICAgICA8aW5wdXQgaWQ9J2hpbnQnIHR5cGU9J3RleHQnIHZhbHVlPScje2hpbnR9Jz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICA8bGFiZWwgZm9yPSdza2lwX2xvZ2ljJyB0aXRsZT0nVGhpcyBzdGF0ZW1lbnQgd2lsbCBiZSBza2lwZWQgaWYgaXQgZXZhbHVhdGVzIHRvIHRydWUuIGV4YW1wbGU6IFJlc3VsdE9mUXVlc3Rpb24oXFxcIm1hemUxXFxcIikgaXNudCBcXFwiMlxcXCIgRXhhbXBsZSAyOiBcXFwicmVkXFxcIiBpbiBSZXN1bHRPZk11bHRpcGxlKFxcXCJmYXZlX2NvbG9yc1xcXCIpJz5Ta2lwIGlmPC9sYWJlbD5cbiAgICAgICAgICA8dGV4dGFyZWEgcm93cz0nMicgaWQ9J3NraXBfbG9naWMnPiN7c2tpcExvZ2ljfTwvdGV4dGFyZWE+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICA8bGFiZWw+Q3VzdG9tIHZhbGlkYXRpb248L2xhYmVsPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J2N1c3RvbV92YWxpZGF0aW9uX2NvZGUnIHRpdGxlPSdJbnRlbmRlZCBmb3Igb3BlbiBxdWVzdGlvbnMuIFRoaXMgY29kZSBzaG91bGQgZXZhbHVhdGUgdG8gdHJ1ZSBvciBmYWxzZS4gRmFsc2Ugd2lsbCB0cmlnZ2VyIGFuIGVycm9yIG1lc3NhZ2UgZm9yIHRoaXMgcXVlc3Rpb24uIEUuZy4gQGFuc3dlciA9PSBcXFwiMVxcXCIgd2lsbCBldmFsdWF0ZSB0byBmYWxzZSBmb3IgYW55IHZhbHVlIG90aGVyIHRoYW4gMS4nPlZhbGlkIHdoZW48L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0IGlkPSdjdXN0b21fdmFsaWRhdGlvbl9jb2RlJyB0eXBlPSd0ZXh0JyB2YWx1ZT0nI3tjdXN0b21WYWxpZGF0aW9uQ29kZX0nPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J2N1c3RvbV92YWxpZGF0aW9uX21lc3NhZ2UnPkVycm9yIG1lc3NhZ2U8L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0IGlkPSdjdXN0b21fdmFsaWRhdGlvbl9tZXNzYWdlJyB0eXBlPSd0ZXh0JyB2YWx1ZT0nI3tjdXN0b21WYWxpZGF0aW9uTWVzc2FnZX0nPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj48YnI+XG5cbiAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J2Rpc3BsYXlfY29kZScgdGl0bGU9J1RoaXMgQ29mZmVlU2NyaXB0IGNvZGUgd2lsbCBiZSBleGVjdXRlZCB3aGVuIHRoaXMgcXVlc3Rpb24gaXMgc2hvd24uIFRoaXMgb3B0aW9uIG1heSBvbmx5IGJlIHVzZWQgd2hlbiBGb2N1cyBNb2RlIGlzIG9uLic+QWN0aW9uIG9uIGRpc3BsYXk8L2xhYmVsPlxuICAgICAgICAgICAgPHRleHRhcmVhIGlkPSdkaXNwbGF5X2NvZGUnIHJvd3M9JzInPiN7ZGlzcGxheUNvZGV9PC90ZXh0YXJlYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG5cblxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsPlNraXBwYWJsZTwvbGFiZWw+XG4gICAgICAgICAgPGRpdiBpZD0nc2tpcF9yYWRpbycgY2xhc3M9J2J1dHRvbnNldCc+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdza2lwX3RydWUnPlllczwvbGFiZWw+PGlucHV0IG5hbWU9J3NraXBwYWJsZScgdHlwZT0ncmFkaW8nIHZhbHVlPSd0cnVlJyBpZD0nc2tpcF90cnVlJyAjeydjaGVja2VkJyBpZiBza2lwcGFibGV9PlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0nc2tpcF9mYWxzZSc+Tm88L2xhYmVsPjxpbnB1dCBuYW1lPSdza2lwcGFibGUnIHR5cGU9J3JhZGlvJyB2YWx1ZT0nZmFsc2UnIGlkPSdza2lwX2ZhbHNlJyAjeydjaGVja2VkJyBpZiBub3Qgc2tpcHBhYmxlfT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICA8bGFiZWwgZm9yPSdsaW5rZWRfZ3JpZF9zY29yZSc+SXRlbXMgYXR0ZW1wdGVkIHJlcXVpcmVkIG9uIGxpbmtlZCBncmlkPC9sYWJlbD5cbiAgICAgICAgICA8aW5wdXQgaWQ9J2xpbmtlZF9ncmlkX3Njb3JlJyB0eXBlPSdudW1iZXInIHZhbHVlPScje2xpbmtlZEdyaWRTY29yZX0nPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnIGlkPSdxdWVzdGlvbl90eXBlJyBjbGFzcz0ncXVlc3Rpb25fdHlwZSc+XG4gICAgICAgICAgPGxhYmVsPlF1ZXN0aW9uIFR5cGU8L2xhYmVsPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J2J1dHRvbnNldCc+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdzaW5nbGUnPnNpbmdsZTwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgaWQ9J3NpbmdsZScgbmFtZT0ndHlwZScgdHlwZT0ncmFkaW8nIHZhbHVlPSdzaW5nbGUnICN7J2NoZWNrZWQnIGlmIHR5cGUgPT0gJ3NpbmdsZSd9PlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0nbXVsdGlwbGUnPm11bHRpcGxlPC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dCBpZD0nbXVsdGlwbGUnIG5hbWU9J3R5cGUnICB0eXBlPSdyYWRpbycgdmFsdWU9J211bHRpcGxlJyAjeydjaGVja2VkJyBpZiB0eXBlID09ICdtdWx0aXBsZSd9PlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0nb3Blbic+b3BlbjwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgaWQ9J29wZW4nIG5hbWU9J3R5cGUnICB0eXBlPSdyYWRpbycgdmFsdWU9J29wZW4nICN7J2NoZWNrZWQnIGlmIHR5cGUgPT0gJ29wZW4nfT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIFwiXG5cbiAgICBpZiB0eXBlICE9IFwib3BlblwiXG4gICAgICBvcHRpb25IVE1MID0gXCJcbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdxdWVzdGlvbl90ZW1wbGF0ZV9zZWxlY3QnPkZpbGwgZnJvbSB0ZW1wbGF0ZTwvbGFiZWw+PGJyPlxuICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgICAgPHNlbGVjdCBpZD0ncXVlc3Rpb25fdGVtcGxhdGVfc2VsZWN0JyBjbGFzcz0nb3B0aW9uX3NlbGVjdCc+XG4gICAgICAgICAgICA8b3B0aW9uIHNlbGVjdGVkPSdzZWxlY3RlZCc+U2VsZWN0IHRlbXBsYXRlPC9vcHRpb24+XG4gICAgICAgIFwiXG4gICAgICAjIG9rIHRvIHJlZmVybmNlIHRoaW5ncyBieSBpbmRleCBpZiBub3QgYW4gb2JqZWN0XG4gICAgICBvcHRpb25UZW1wbGF0ZXMgPSBUYW5nZXJpbmUudGVtcGxhdGVzLmdldChcIm9wdGlvblRlbXBsYXRlc1wiKVxuICAgICAgZm9yIG9wdGlvbiwgaSBpbiBvcHRpb25UZW1wbGF0ZXNcbiAgICAgICAgb3B0aW9uSFRNTCArPSBcIjxvcHRpb24gZGF0YS1pbmRleD0nI3tpfScgY2xhc3M9J3RlbXBsYXRlX29wdGlvbic+I3tvcHRpb24ubmFtZX08L29wdGlvbj5cIlxuXG4gICAgICBvcHRpb25IVE1MICs9IFwiPC9zZWxlY3Q+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGlkPSdvcHRpb25fbGlzdF93cmFwcGVyJz4je0BnZXRPcHRpb25MaXN0KCl9PC9kaXY+XG4gICAgICAgIFwiXG4gICAgICBAJGVsLmFwcGVuZCBvcHRpb25IVE1MXG5cbiAgICAgIEByZWZyZXNoU29ydGFibGUoKVxuICAgICAgXG4gICAgQCRlbC5hcHBlbmQgXCI8YnV0dG9uIGNsYXNzPSdkb25lIGNvbW1hbmQnPkRvbmU8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgICAgXCJcbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICByZWZyZXNoT3B0aW9uTGlzdDogLT5cbiAgICBAJGVsLmZpbmQoXCIjb3B0aW9uX2xpc3Rfd3JhcHBlclwiKS5odG1sIEBnZXRPcHRpb25MaXN0KClcbiAgICBAcmVmcmVzaFNvcnRhYmxlKClcblxuICByZWZyZXNoU29ydGFibGU6IC0+XG4gICAgQCRlbC5maW5kKFwiI29wdGlvbl9saXN0XCIpLnNvcnRhYmxlXG4gICAgICBoYW5kbGUgOiAnLnNvcnRhYmxlX2hhbmRsZSdcbiAgICAgIHN0YXJ0OiAoZXZlbnQsIHVpKSAtPiB1aS5pdGVtLmFkZENsYXNzIFwiZHJhZ19zaGFkb3dcIlxuICAgICAgc3RvcDogIChldmVudCwgdWkpIC0+IHVpLml0ZW0ucmVtb3ZlQ2xhc3MgXCJkcmFnX3NoYWRvd1wiXG4gICAgICB1cGRhdGUgOiAoZXZlbnQsIHVpKSA9PlxuICAgICAgICBAdXBkYXRlTW9kZWwoKVxuXG5cbiAgaGlqYWNrRW50ZXI6IChldmVudCkgLT5cbiAgICBpZiBldmVudC53aGljaCA9PSAxM1xuICAgICAgQCRlbC5maW5kKGV2ZW50LnRhcmdldCkuYmx1cigpXG4gICAgICByZXR1cm4gZmFsc2VcblxuICBjaGFuZ2VRdWVzdGlvblR5cGU6IChldmVudCkgLT5cbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgIyBpZiBpdCBjaGFuZ2VzLCByZWRvIHRoZSByZW5kZXJpbmdcbiAgICBpZiAoJHRhcmdldC52YWwoKSAhPSBcIm9wZW5cIiAmJiBAcXVlc3Rpb24uZ2V0KFwidHlwZVwiKSA9PSBcIm9wZW5cIikgfHwgKCR0YXJnZXQudmFsKCkgPT0gXCJvcGVuXCIgJiYgQHF1ZXN0aW9uLmdldChcInR5cGVcIikgIT0gXCJvcGVuXCIpXG4gICAgICBAdXBkYXRlTW9kZWwoKVxuICAgICAgQHF1ZXN0aW9uLnNldCBcInR5cGVcIiwgJHRhcmdldC52YWwoKVxuICAgICAgQHF1ZXN0aW9uLnNldCBcIm9wdGlvbnNcIiwgW11cbiAgICAgIEByZW5kZXIoKVxuXG4gICNcbiAgIyBTYXZpbmdcbiAgI1xuICBkb25lOiAtPlxuICAgIHJldHVybiBmYWxzZSB1bmxlc3MgQGFjdGl2aXR5ID09IG51bGxcbiAgICBAYWN0aXZpdHkgPSBcInNhdmluZ1wiXG5cbiAgICBAdXBkYXRlTW9kZWwoKVxuICAgIEBxdWVzdGlvbi5zYXZlIG51bGwsXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBAYWN0aXZpdHkgPSBudWxsXG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiUXVlc3Rpb24gU2F2ZWRcIlxuICAgICAgICBjbGVhclRpbWVvdXQgQHRpbWVyICMgZ28gd2l0aCB0aGUgbGFzdCB0aW1lb3V0XG4gICAgICAgIEB0aW1lciA9IHNldFRpbWVvdXQgQGdvQmFjaywgNTAwXG4gICAgICBlcnJvcjogPT5cbiAgICAgICAgQGFjdGl2aXR5ID0gbnVsbFxuICAgICAgICBVdGlscy5taWRBbGVydCBcIlNhdmUgZXJyb3JcIlxuICAgIHJldHVybiBmYWxzZVxuXG4gIGdvQmFjazogPT5cbiAgICBjbGFzc09yTm90ID0gJ2NsYXNzLycgaWYgQHF1ZXN0aW9uLmhhcyhcImN1cnJpY3VsdW1JZFwiKVxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCIje2NsYXNzT3JOb3R8fFwiXCJ9c3VidGVzdC8je0BxdWVzdGlvbi5nZXQoJ3N1YnRlc3RJZCcpfVwiLCB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgdXBkYXRlTW9kZWw6ID0+XG4gICAgIyBiYXNpY3NcbiAgICBAcXVlc3Rpb24uc2V0XG4gICAgICBcInByb21wdFwiICAgICAgICAgIDogQCRlbC5maW5kKFwiI3Byb21wdFwiKS52YWwoKVxuICAgICAgXCJuYW1lXCIgICAgICAgICAgICA6IEAkZWwuZmluZChcIiNuYW1lXCIpLnZhbCgpLnNhZmV0eURhbmNlKClcbiAgICAgIFwiaGludFwiICAgICAgICAgICAgOiBAJGVsLmZpbmQoXCIjaGludFwiKS52YWwoKVxuICAgICAgXCJza2lwTG9naWNcIiAgICAgICA6IEAkZWwuZmluZChcIiNza2lwX2xvZ2ljXCIpLnZhbCgpXG4gICAgICBcImxpbmtlZEdyaWRTY29yZVwiIDogcGFyc2VJbnQoQCRlbC5maW5kKFwiI2xpbmtlZF9ncmlkX3Njb3JlXCIpLnZhbCgpKVxuICAgICAgXCJ0eXBlXCIgICAgICAgICAgICA6IEAkZWwuZmluZChcIiNxdWVzdGlvbl90eXBlIGlucHV0OmNoZWNrZWRcIikudmFsKClcbiAgICAgIFwic2tpcHBhYmxlXCIgICAgICAgOiBAJGVsLmZpbmQoXCIjc2tpcF9yYWRpbyBpbnB1dDpyYWRpb1tuYW1lPXNraXBwYWJsZV06Y2hlY2tlZFwiKS52YWwoKSA9PSBcInRydWVcIlxuICAgICAgXCJjdXN0b21WYWxpZGF0aW9uQ29kZVwiICAgIDogQCRlbC5maW5kKFwiI2N1c3RvbV92YWxpZGF0aW9uX2NvZGVcIikudmFsKClcbiAgICAgIFwiY3VzdG9tVmFsaWRhdGlvbk1lc3NhZ2VcIiA6IEAkZWwuZmluZChcIiNjdXN0b21fdmFsaWRhdGlvbl9tZXNzYWdlXCIpLnZhbCgpXG4gICAgICBcImRpc3BsYXlDb2RlXCIgICAgICAgICAgICAgOiBAJGVsLmZpbmQoXCIjZGlzcGxheV9jb2RlXCIpLnZhbCgpXG4gICAgICBcbiAgICAjIG9wdGlvbnNcbiAgICBvcHRpb25zID0gW11cbiAgICBpID0gMFxuICAgIG9wdGlvbkxpc3RFbGVtZW50cyA9IEAkZWwuZmluZChcIiNvcHRpb25fbGlzdCBsaVwiKVxuICAgIGZvciBsaSBpbiBvcHRpb25MaXN0RWxlbWVudHNcbiAgICAgIGxhYmVsID0gJChsaSkuZmluZChcIi5vcHRpb25fbGFiZWxcIikudmFsKClcbiAgICAgIHZhbHVlID0gJChsaSkuZmluZChcIi5vcHRpb25fdmFsdWVcIikudmFsKCkuc2FmZXR5RGFuY2UoKVxuXG4gICAgICBpZiBsYWJlbD8gfHwgdmFsdWU/XG4gICAgICAgIG9wdGlvbnNbaV0gPVxuICAgICAgICAgIGxhYmVsIDogbGFiZWxcbiAgICAgICAgICB2YWx1ZSA6IHZhbHVlXG4gICAgICAgIGkrK1xuICAgIFxuICAgICMgdmFsaWRhdGUgbm90IGVtcHR5XG4gICAgaWYgb3B0aW9ucy5sZW5ndGggIT0gMCBcbiAgICAgIGxhc3QgPSBvcHRpb25zLnBvcCgpXG4gICAgICBpZiBsYXN0LmxhYmVsICE9IFwiXCIgJiYgbGFzdC52YWx1ZSAhPSBcIlwiIHRoZW4gb3B0aW9ucy5wdXNoIGxhc3RcblxuICAgIEBxdWVzdGlvbi5zZXQgXCJvcHRpb25zXCIsIG9wdGlvbnNcblxuICAjXG4gICMgRGVsZXRpbmcgYW4gb3B0aW9uXG4gICNcbiAgc2hvd0RlbGV0ZUNvbmZpcm06IChldmVudCkgLT4gQCRlbC5maW5kKFwiLmRlbGV0ZV9jb25maXJtXyN7QCRlbC5maW5kKGV2ZW50LnRhcmdldCkuYXR0cignZGF0YS1pbmRleCcpfVwiKS5mYWRlSW4oMjUwKVxuICBoaWRlRGVsZXRlQ29uZmlybTogKGV2ZW50KSAtPiBAJGVsLmZpbmQoXCIuZGVsZXRlX2NvbmZpcm1fI3tAJGVsLmZpbmQoZXZlbnQudGFyZ2V0KS5hdHRyKCdkYXRhLWluZGV4Jyl9XCIpLmZhZGVPdXQoMjUwKVxuICBkZWxldGVPcHRpb246IChldmVudCkgLT5cbiAgICBAdXBkYXRlTW9kZWwoKVxuICAgIG9wdGlvbnMgPSBAcXVlc3Rpb24uZ2V0IFwib3B0aW9uc1wiXG4gICAgb3B0aW9ucy5zcGxpY2UgQCRlbC5maW5kKGV2ZW50LnRhcmdldCkuYXR0cignZGF0YS1pbmRleCcpLCAxXG4gICAgQHF1ZXN0aW9uLnNldCBcIm9wdGlvbnNcIiwgb3B0aW9uc1xuICAgIEByZWZyZXNoT3B0aW9uTGlzdCgpXG4gICAgcmV0dXJuIGZhbHNlXG4iXX0=
