var SubtestEditView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SubtestEditView = (function(superClass) {
  extend(SubtestEditView, superClass);

  function SubtestEditView() {
    this.save = bind(this.save, this);
    this.goBack = bind(this.goBack, this);
    return SubtestEditView.__super__.constructor.apply(this, arguments);
  }

  SubtestEditView.prototype.className = "subtest_edit";

  SubtestEditView.prototype.events = {
    'click .back_button': 'goBack',
    'click .save_subtest': 'saveSubtest',
    'click .richtext_edit': 'richtextEdit',
    'click .richtext_save': 'richtextSave',
    'click .richtext_cancel': 'richtextCancel',
    'change #display_code': 'validateSyntax'
  };

  SubtestEditView.prototype.richtextConfig = [
    {
      "key": "enumerator",
      "attributeName": "enumeratorHelp"
    }, {
      "key": "dialog",
      "attributeName": "studentDialog"
    }, {
      "key": "transition",
      "attributeName": "transitionComment"
    }
  ];

  SubtestEditView.prototype.initialize = function(options) {
    this.activity = null;
    this.timer = 0;
    this.richtextKeys = _.pluck(this.richtextConfig, "key");
    this.model = options.model;
    this.assessment = options.assessment;
    this.config = Tangerine.config.subtest;
    this.prototypeViews = Tangerine.config.get("prototypeViews");
    console.log("@model.get 'prototype': " + this.model.get('prototype'));
    this.prototypeEditor = new window[this.prototypeViews[this.model.get('prototype')]['edit']]({
      model: this.model,
      parent: this
    });
    return this.prototypeEditor.on("question-edit", (function(_this) {
      return function(questionId) {
        return _this.save({
          questionSave: false,
          success: function() {
            return Tangerine.router.navigate("question/" + questionId, true);
          }
        });
      };
    })(this));
  };

  SubtestEditView.prototype.goBack = function() {
    return Tangerine.router.navigate("edit/" + this.model.get("assessmentId"), true);
  };

  SubtestEditView.prototype.validateSyntax = function(event) {
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

  SubtestEditView.prototype.getRichtextConfig = function(event) {
    var $target, attributeName, dataKey;
    if (_.isString(event)) {
      dataKey = event;
    } else {
      $target = $(event.target);
      dataKey = $target.parent().attr("data-richtextKey") || $target.parent().parent().attr("data-richtextKey");
    }
    attributeName = _.where(this.richtextConfig, {
      "key": dataKey
    })[0].attributeName;
    return {
      "dataKey": dataKey,
      "attributeName": attributeName
    };
  };

  SubtestEditView.prototype.richtextEdit = function(event) {
    var config;
    config = this.getRichtextConfig(event);
    this.$el.find("." + config.dataKey + "_preview, ." + config.dataKey + "_edit, ." + config.dataKey + "_buttons").fadeToggle(250);
    if (this.editor == null) {
      this.editor = {};
    }
    this.$el.find("textarea#" + config.dataKey + "_textarea").html(this.model.escape(config.attributeName) || "");
    return this.editor[config.dataKey] = CKEDITOR.replace(config.dataKey + "_textarea");
  };

  SubtestEditView.prototype.richtextSave = function(event) {
    var config, newAttributes;
    config = this.getRichtextConfig(event);
    newAttributes = {};
    newAttributes[config.attributeName] = this.editor[config.dataKey].getData();
    return this.model.save(newAttributes, {
      success: (function(_this) {
        return function() {
          return _this.richtextCancel(config.dataKey);
        };
      })(this),
      error: (function(_this) {
        return function() {
          return alert("Save error. Please try again.");
        };
      })(this)
    });
  };

  SubtestEditView.prototype.richtextCancel = function(event) {
    var $preview, config;
    config = this.getRichtextConfig(event);
    $preview = $("div." + config.dataKey + "_preview");
    $preview.html(this.model.get(config.attributeName) || "");
    $preview.fadeIn(250);
    this.$el.find("button." + config.dataKey + "_edit, ." + config.dataKey + "_buttons").fadeToggle(250);
    return this.editor[config.dataKey].destroy();
  };

  SubtestEditView.prototype.saveSubtest = function() {
    return this.save();
  };

  SubtestEditView.prototype.save = function(options) {
    var base, prototype;
    if (options == null) {
      options = {};
    }
    if (this.activity !== null) {
      return false;
    }
    this.activity = "saving";
    options.prototypeSave = options.prototypeSave != null ? options.prorotypeSave : true;
    prototype = this.model.get("prototype");
    this.model.set({
      name: this.$el.find("#subtest_name").val(),
      enumeratorHelp: this.$el.find("#enumerator_help").val(),
      studentDialog: this.$el.find("#student_dialog").val(),
      transitionComment: this.$el.find("#transition_comment").val(),
      skippable: this.$el.find("#skip_radio input:radio[name=skippable]:checked").val() === "true",
      rtl: this.$el.find("#rtl_radio input:radio[name=rtl]:checked").val() === "true",
      backButton: this.$el.find("#back_button_radio input:radio[name=back_button]:checked").val() === "true",
      enumeratorHelp: this.$el.find("#enumerator_textarea").val(),
      studentDialog: this.$el.find("#dialog_textarea").val(),
      transitionComment: this.$el.find("#transition_textarea").val(),
      language: this.$el.find("#language").val(),
      displayCode: this.$el.find("#display_code").val(),
      fontFamily: this.$el.find("#font_family").val()
    });
    this.prototypeEditor.save(options);
    if (this.prototypeEditor.isValid() === false) {
      Utils.midAlert("There are errors on this page");
      if (typeof (base = this.prototypeEditor).showErrors === "function") {
        base.showErrors();
      }
      return this.activity = null;
    } else {
      return this.model.save(null, {
        success: (function(_this) {
          return function() {
            _this.activity = null;
            if (options.success) {
              return options.success();
            }
            Utils.midAlert("Subtest Saved");
            clearTimeout(_this.timer);
            return _this.timer = setTimeout(_this.goBack, 1000);
          };
        })(this),
        error: (function(_this) {
          return function() {
            _this.activity = null;
            if (options.error != null) {
              return options.error();
            }
            return Utils.midAlert("Save error");
          };
        })(this)
      });
    }
  };

  SubtestEditView.prototype.render = function() {
    var assessmentName, backButton, base, dialog, displayCode, enummerator, fontFamily, groupHandle, language, name, prototype, rtl, rtlEditHtml, skippable, transition;
    assessmentName = this.assessment.escape("name");
    name = this.model.escape("name");
    prototype = this.model.get("prototype");
    enummerator = this.model.getString("enumeratorHelp");
    dialog = this.model.getString("studentDialog");
    transition = this.model.getString("transitionComment");
    skippable = this.model.getBoolean("skippable");
    rtl = this.model.getBoolean("rtl");
    backButton = this.model.getBoolean("backButton");
    fontFamily = this.model.getEscapedString("fontFamily");
    displayCode = this.model.getString("displayCode");
    language = this.model.getString("language");
    groupHandle = Tangerine.settings.getEscapedString("groupHandle");
    rtlEditHtml = "";
    if (prototype === 'grid') {
      rtlEditHtml = "<div class='label_value'> <label>Right-to-Left direction</label><br> <div class='menu_box'> <div id='rtl_radio' class='buttonset'> <label for='rtl_true'>Yes</label><input name='rtl' type='radio' value='true' id='rtl_true' " + (rtl ? 'checked' : void 0) + "> <label for='rtl_false'>No</label><input name='rtl' type='radio' value='false' id='rtl_false' " + (!rtl ? 'checked' : void 0) + "> </div> </div> </div>";
    }
    this.$el.html("<h1>Subtest Editor</h1> <table class='basic_info'> <tr> <th>Group</th> <td>" + groupHandle + "</td> </tr> <tr> <th>Assessment</th> <td>" + assessmentName + "</td> </tr> </table> <button class='save_subtest command'>Done</button> <div id='subtest_edit_form' class='edit_form'> <div class='label_value'> <label for='subtest_name'>Name</label> <input id='subtest_name' value='" + name + "'> </div> <div class='label_value'> <label for='subtest_prototype' title='This is a basic type of subtest. (e.g. Survey, Grid, Location, Id, Consent). This property is set in assessment builder when you add a subtest. It is unchangeable.'>Prototype</label><br> <div class='info_box'>" + prototype + "</div> </div> <div class='label_value'> <label for='language'>Language code</label> <input id='language' value='" + language + "'> </div> <div class='label_value'> <label>Skippable</label><br> <div class='menu_box'> <div id='skip_radio' class='buttonset'> <label for='skip_true'>Yes</label><input name='skippable' type='radio' value='true' id='skip_true' " + (skippable ? 'checked' : void 0) + "> <label for='skip_false'>No</label><input name='skippable' type='radio' value='false' id='skip_false' " + (!skippable ? 'checked' : void 0) + "> </div> </div> </div> " + (rtlEditHtml || '') + " <div class='label_value'> <label>Display Back button</label><br> <div class='menu_box'> <div id='back_button_radio' class='buttonset'> <label for='back_button_true'>Yes</label><input name='back_button' type='radio' value='true' id='back_button_true' " + (backButton ? 'checked' : void 0) + "> <label for='back_button_false'>No</label><input name='back_button' type='radio' value='false' id='back_button_false' " + (!backButton ? 'checked' : void 0) + "> </div> </div> </div> <div class='label_value' data-richtextKey='enumerator'> <label for='enumerator_textarea' title='If text is supplied, a help button will appear at the top of the subtest as a reference for the enumerator. If you are pasting from word it is recommended to paste into a plain text editor first, and then into this box.'>Enumerator help <button class='richtext_edit command'>Edit</button></label> <div class='info_box_wide enumerator_preview'>" + enummerator + "</div> <textarea id='enumerator_textarea' class='confirmation'>" + enummerator + "</textarea> <div class='enumerator_buttons confirmation'> <button class='richtext_save command'>Save</button> <button class='richtext_cancel command'>Cancel</button> </div> </div> <div class='label_value' data-richtextKey='dialog'> <label for='dialog_textarea' title='Generally this is a script that will be read to the student. If you are pasting from word it is recommended to paste into a plain text editor first, and then into this box.'>Student Dialog <button class='richtext_edit command'>Edit</button></label> <div class='info_box_wide dialog_preview'>" + dialog + "</div> <textarea id='dialog_textarea' class='confirmation'>" + dialog + "</textarea> <div class='dialog_buttons confirmation'> <button class='richtext_save command'>Save</button> <button class='richtext_cancel command'>Cancel</button> </div> </div> <div class='label_value' data-richtextKey='transition'> <label for='transition_testarea' title='This will be displayed with a grey background above the next button, similar to the student dialog text. If you are pasting from Word it is recommended to paste into a plain text editor first, and then into this box.'>Transition Comment <button class='richtext_edit command'>Edit</button></label> <div class='info_box_wide transition_preview'>" + transition + "</div> <textarea id='transition_textarea' class='confirmation'>" + transition + "</textarea> <div class='transition_buttons confirmation'> <button class='richtext_save command'>Save</button> <button class='richtext_cancel command'>Cancel</button> </div> </div> <div class='label_value'> <label for='font_family' title='Please be aware that whatever font is specified, must be available on the user`s system. When multiple fonts are entered separated by commas, they are ranked in order of preference from left to right. Font names with spaces must be wrapped in double quotes.'>Preferred font</label> <input id='font_family' value='" + fontFamily + "'> </div> <div class='menu_box'> <div class='label_value'> <label for='display_code' title='This CoffeeScript code will be executed when this question is shown. This option may only be used when Focus Mode is on.'>Action on display</label> <textarea id='display_code'>" + displayCode + "</textarea> </div> </div> </div> <div id='prototype_attributes'></div> <button class='save_subtest command'>Done</button>");
    this.prototypeEditor.setElement(this.$el.find('#prototype_attributes'));
    if (typeof (base = this.prototypeEditor).render === "function") {
      base.render();
    }
    return this.trigger("rendered");
  };

  SubtestEditView.prototype.afterRender = function() {
    var ref;
    return (ref = this.prototypeEditor) != null ? typeof ref.afterRender === "function" ? ref.afterRender() : void 0 : void 0;
  };

  SubtestEditView.prototype.onClose = function() {
    var base;
    return typeof (base = this.prototypeEditor).close === "function" ? base.close() : void 0;
  };

  return SubtestEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvU3VidGVzdEVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGVBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs7NEJBRUosU0FBQSxHQUFXOzs0QkFFWCxNQUFBLEdBQ0U7SUFBQSxvQkFBQSxFQUErQixRQUEvQjtJQUNBLHFCQUFBLEVBQStCLGFBRC9CO0lBR0Esc0JBQUEsRUFBNkIsY0FIN0I7SUFJQSxzQkFBQSxFQUE2QixjQUo3QjtJQUtBLHdCQUFBLEVBQTZCLGdCQUw3QjtJQU1BLHNCQUFBLEVBQXlCLGdCQU56Qjs7OzRCQVNGLGNBQUEsR0FBZ0I7SUFDWjtNQUFBLEtBQUEsRUFBa0IsWUFBbEI7TUFDQSxlQUFBLEVBQWtCLGdCQURsQjtLQURZLEVBSVo7TUFBQSxLQUFBLEVBQWtCLFFBQWxCO01BQ0EsZUFBQSxFQUFrQixlQURsQjtLQUpZLEVBT1o7TUFBQSxLQUFBLEVBQWtCLFlBQWxCO01BQ0EsZUFBQSxFQUFrQixtQkFEbEI7S0FQWTs7OzRCQVdoQixVQUFBLEdBQVksU0FBRSxPQUFGO0lBRVYsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUNaLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFFVCxJQUFDLENBQUEsWUFBRCxHQUFnQixDQUFDLENBQUMsS0FBRixDQUFRLElBQUMsQ0FBQSxjQUFULEVBQXlCLEtBQXpCO0lBRWhCLElBQUMsQ0FBQSxLQUFELEdBQWMsT0FBTyxDQUFDO0lBQ3RCLElBQUMsQ0FBQSxVQUFELEdBQWMsT0FBTyxDQUFDO0lBQ3RCLElBQUMsQ0FBQSxNQUFELEdBQWMsU0FBUyxDQUFDLE1BQU0sQ0FBQztJQUUvQixJQUFDLENBQUEsY0FBRCxHQUFtQixTQUFTLENBQUMsTUFBTSxDQUFDLEdBQWpCLENBQXFCLGdCQUFyQjtJQUNuQixPQUFPLENBQUMsR0FBUixDQUFZLDBCQUFBLEdBQTZCLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFdBQVgsQ0FBekM7SUFDQSxJQUFDLENB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QUFDIiwiZmlsZSI6InN1YnRlc3QvU3VidGVzdEVkaXRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgU3VidGVzdEVkaXRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJzdWJ0ZXN0X2VkaXRcIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLmJhY2tfYnV0dG9uJyAgICAgICAgIDogJ2dvQmFjaydcbiAgICAnY2xpY2sgLnNhdmVfc3VidGVzdCcgICAgICAgIDogJ3NhdmVTdWJ0ZXN0J1xuXG4gICAgJ2NsaWNrIC5yaWNodGV4dF9lZGl0JyAgICAgOiAncmljaHRleHRFZGl0J1xuICAgICdjbGljayAucmljaHRleHRfc2F2ZScgICAgIDogJ3JpY2h0ZXh0U2F2ZSdcbiAgICAnY2xpY2sgLnJpY2h0ZXh0X2NhbmNlbCcgICA6ICdyaWNodGV4dENhbmNlbCdcbiAgICAnY2hhbmdlICNkaXNwbGF5X2NvZGUnIDogJ3ZhbGlkYXRlU3ludGF4J1xuXG5cbiAgcmljaHRleHRDb25maWc6IFtcbiAgICAgIFwia2V5XCIgICAgICAgICAgIDogXCJlbnVtZXJhdG9yXCJcbiAgICAgIFwiYXR0cmlidXRlTmFtZVwiIDogXCJlbnVtZXJhdG9ySGVscFwiXG4gICAgLFxuICAgICAgXCJrZXlcIiAgICAgICAgICAgOiBcImRpYWxvZ1wiXG4gICAgICBcImF0dHJpYnV0ZU5hbWVcIiA6IFwic3R1ZGVudERpYWxvZ1wiXG4gICAgLFxuICAgICAgXCJrZXlcIiAgICAgICAgICAgOiBcInRyYW5zaXRpb25cIlxuICAgICAgXCJhdHRyaWJ1dGVOYW1lXCIgOiBcInRyYW5zaXRpb25Db21tZW50XCJcbiAgXVxuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApIC0+XG5cbiAgICBAYWN0aXZpdHkgPSBudWxsXG4gICAgQHRpbWVyID0gMFxuICAgIFxuICAgIEByaWNodGV4dEtleXMgPSBfLnBsdWNrKEByaWNodGV4dENvbmZpZywgXCJrZXlcIilcblxuICAgIEBtb2RlbCAgICAgID0gb3B0aW9ucy5tb2RlbFxuICAgIEBhc3Nlc3NtZW50ID0gb3B0aW9ucy5hc3Nlc3NtZW50XG4gICAgQGNvbmZpZyAgICAgPSBUYW5nZXJpbmUuY29uZmlnLnN1YnRlc3RcblxuICAgIEBwcm90b3R5cGVWaWV3cyAgPSBUYW5nZXJpbmUuY29uZmlnLmdldCBcInByb3RvdHlwZVZpZXdzXCJcbiAgICBjb25zb2xlLmxvZyhcIkBtb2RlbC5nZXQgJ3Byb3RvdHlwZSc6IFwiICsgQG1vZGVsLmdldCAncHJvdG90eXBlJylcbiAgICBAcHJvdG90eXBlRWRpdG9yID0gbmV3IHdpbmRvd1tAcHJvdG90eXBlVmlld3NbQG1vZGVsLmdldCAncHJvdG90eXBlJ11bJ2VkaXQnXV1cbiAgICAgIG1vZGVsOiBAbW9kZWxcbiAgICAgIHBhcmVudDogQFxuXG4gICAgQHByb3RvdHlwZUVkaXRvci5vbiBcInF1ZXN0aW9uLWVkaXRcIiwgKHF1ZXN0aW9uSWQpID0+XG4gICAgICBAc2F2ZVxuICAgICAgICBxdWVzdGlvblNhdmUgIDogZmFsc2VcbiAgICAgICAgc3VjY2VzcyAgICAgICA6IC0+IFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJxdWVzdGlvbi8je3F1ZXN0aW9uSWR9XCIsIHRydWVcblxuICBnb0JhY2s6ID0+XG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImVkaXQvXCIgKyBAbW9kZWwuZ2V0KFwiYXNzZXNzbWVudElkXCIpLCB0cnVlXG5cblxuICB2YWxpZGF0ZVN5bnRheDogKGV2ZW50KSAtPlxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICBjb2RlID0gJHRhcmdldC52YWwoKVxuICAgIGlmIG5vdCBfLmlzRW1wdHkoY29kZSlcbiAgICAgIHRyeVxuICAgICAgICBvbGRBbnN3ZXIgPSBAYW5zd2VyXG4gICAgICAgIEBhbnN3ZXIgPSB7fVxuICAgICAgICBAaXNWYWxpZCA9IENvZmZlZVNjcmlwdC5jb21waWxlLmFwcGx5KEAsIFtjb2RlXSlcbiAgICAgICAgaWYgb2xkQW5zd2VyPyB0aGVuIEBhbnN3ZXIgPSBvbGRBbnN3ZXIgZWxzZSBkZWxldGUgdGhpc1tcImFuc3dlclwiXVxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgbmFtZSA9ICgoL2Z1bmN0aW9uICguezEsfSlcXCgvKS5leGVjKGVycm9yLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkpWzFdKVxuICAgICAgICB3aGVyZSA9ICR0YXJnZXQuYXR0cignaWQnKS5odW1hbml6ZSgpXG4gICAgICAgIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlXG4gICAgICAgIGFsZXJ0IFwiRXJyb3IgaW4gI3t3aGVyZX1cXG5cXG4je25hbWV9XFxuXFxuI3ttZXNzYWdlfVwiXG5cbiAgZ2V0UmljaHRleHRDb25maWc6IChldmVudCkgLT5cblxuICAgIGlmIF8uaXNTdHJpbmcgZXZlbnRcbiAgICAgIGRhdGFLZXkgPSBldmVudFxuICAgIGVsc2VcbiAgICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICAgIGRhdGFLZXkgPSAkdGFyZ2V0LnBhcmVudCgpLmF0dHIoXCJkYXRhLXJpY2h0ZXh0S2V5XCIpIHx8ICR0YXJnZXQucGFyZW50KCkucGFyZW50KCkuYXR0cihcImRhdGEtcmljaHRleHRLZXlcIilcblxuICAgIGF0dHJpYnV0ZU5hbWUgPSBfLndoZXJlKEByaWNodGV4dENvbmZpZywgXCJrZXlcIjpkYXRhS2V5KVswXS5hdHRyaWJ1dGVOYW1lXG5cbiAgICByZXR1cm4ge1xuICAgICAgXCJkYXRhS2V5XCIgICAgICAgOiBkYXRhS2V5XG4gICAgICBcImF0dHJpYnV0ZU5hbWVcIiA6IGF0dHJpYnV0ZU5hbWVcbiAgICB9XG5cblxuICByaWNodGV4dEVkaXQ6IChldmVudCkgLT5cblxuICAgIGNvbmZpZyA9IEBnZXRSaWNodGV4dENvbmZpZyBldmVudFxuXG4gICAgQCRlbC5maW5kKFwiLiN7Y29uZmlnLmRhdGFLZXl9X3ByZXZpZXcsIC4je2NvbmZpZy5kYXRhS2V5fV9lZGl0LCAuI3tjb25maWcuZGF0YUtleX1fYnV0dG9uc1wiKS5mYWRlVG9nZ2xlKDI1MClcbiAgICBcbiAgICBAZWRpdG9yID0ge30gaWYgbm90IEBlZGl0b3I/XG4gICAgQCRlbC5maW5kKFwidGV4dGFyZWEjI3tjb25maWcuZGF0YUtleX1fdGV4dGFyZWFcIikuaHRtbChAbW9kZWwuZXNjYXBlKGNvbmZpZy5hdHRyaWJ1dGVOYW1lKSB8fCBcIlwiKVxuICAgIEBlZGl0b3JbY29uZmlnLmRhdGFLZXldID0gQ0tFRElUT1IucmVwbGFjZShcIiN7Y29uZmlnLmRhdGFLZXl9X3RleHRhcmVhXCIpXG5cbiAgcmljaHRleHRTYXZlOiAoZXZlbnQpIC0+XG5cbiAgICBjb25maWcgPSBAZ2V0UmljaHRleHRDb25maWcgZXZlbnRcbiAgICBuZXdBdHRyaWJ1dGVzID0ge31cbiAgICBuZXdBdHRyaWJ1dGVzW2NvbmZpZy5hdHRyaWJ1dGVOYW1lXSA9IEBlZGl0b3JbY29uZmlnLmRhdGFLZXldLmdldERhdGEoKVxuXG4gICAgQG1vZGVsLnNhdmUgbmV3QXR0cmlidXRlcywgXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBAcmljaHRleHRDYW5jZWwoY29uZmlnLmRhdGFLZXkpXG4gICAgICBlcnJvcjogPT5cbiAgICAgICAgYWxlcnQgXCJTYXZlIGVycm9yLiBQbGVhc2UgdHJ5IGFnYWluLlwiXG5cbiAgcmljaHRleHRDYW5jZWw6IChldmVudCkgLT5cblxuICAgIGNvbmZpZyA9IEBnZXRSaWNodGV4dENvbmZpZyBldmVudFxuXG4gICAgJHByZXZpZXcgPSAkKFwiZGl2LiN7Y29uZmlnLmRhdGFLZXl9X3ByZXZpZXdcIilcbiAgICAkcHJldmlldy5odG1sIEBtb2RlbC5nZXQoY29uZmlnLmF0dHJpYnV0ZU5hbWUpIHx8IFwiXCJcbiAgICAkcHJldmlldy5mYWRlSW4oMjUwKVxuICAgIEAkZWwuZmluZChcImJ1dHRvbi4je2NvbmZpZy5kYXRhS2V5fV9lZGl0LCAuI3tjb25maWcuZGF0YUtleX1fYnV0dG9uc1wiKS5mYWRlVG9nZ2xlKDI1MClcbiAgICBAZWRpdG9yW2NvbmZpZy5kYXRhS2V5XS5kZXN0cm95KClcblxuICBzYXZlU3VidGVzdDogLT4gQHNhdmUoKVxuXG4gIHNhdmU6ICggb3B0aW9ucz17fSApID0+XG5cbiAgICByZXR1cm4gZmFsc2UgdW5sZXNzIEBhY3Rpdml0eSA9PSBudWxsXG4gICAgQGFjdGl2aXR5ID0gXCJzYXZpbmdcIlxuXG4gICAgIyBieSBkZWZhdWx0IHNhdmUgcHJvdG90eXBlIGFzIHdlbGxcbiAgICBvcHRpb25zLnByb3RvdHlwZVNhdmUgPSBpZiBvcHRpb25zLnByb3RvdHlwZVNhdmU/IHRoZW4gb3B0aW9ucy5wcm9yb3R5cGVTYXZlIGVsc2UgdHJ1ZVxuXG4gICAgcHJvdG90eXBlID0gQG1vZGVsLmdldChcInByb3RvdHlwZVwiKVxuXG4gICAgQG1vZGVsLnNldFxuICAgICAgbmFtZSAgICAgICAgICAgICAgOiBAJGVsLmZpbmQoXCIjc3VidGVzdF9uYW1lXCIpLnZhbCgpXG4gICAgICBlbnVtZXJhdG9ySGVscCAgICA6IEAkZWwuZmluZChcIiNlbnVtZXJhdG9yX2hlbHBcIikudmFsKClcbiAgICAgIHN0dWRlbnREaWFsb2cgICAgIDogQCRlbC5maW5kKFwiI3N0dWRlbnRfZGlhbG9nXCIpLnZhbCgpXG4gICAgICB0cmFuc2l0aW9uQ29tbWVudCA6IEAkZWwuZmluZChcIiN0cmFuc2l0aW9uX2NvbW1lbnRcIikudmFsKClcbiAgICAgIHNraXBwYWJsZSAgICAgICAgIDogQCRlbC5maW5kKFwiI3NraXBfcmFkaW8gaW5wdXQ6cmFkaW9bbmFtZT1za2lwcGFibGVdOmNoZWNrZWRcIikudmFsKCkgPT0gXCJ0cnVlXCJcbiAgICAgIHJ0bCAgICAgICAgICAgICAgIDogQCRlbC5maW5kKFwiI3J0bF9yYWRpbyBpbnB1dDpyYWRpb1tuYW1lPXJ0bF06Y2hlY2tlZFwiKS52YWwoKSA9PSBcInRydWVcIlxuICAgICAgYmFja0J1dHRvbiAgICAgICAgOiBAJGVsLmZpbmQoXCIjYmFja19idXR0b25fcmFkaW8gaW5wdXQ6cmFkaW9bbmFtZT1iYWNrX2J1dHRvbl06Y2hlY2tlZFwiKS52YWwoKSA9PSBcInRydWVcIlxuXG4gICAgICBlbnVtZXJhdG9ySGVscCAgICA6IEAkZWwuZmluZChcIiNlbnVtZXJhdG9yX3RleHRhcmVhXCIpLnZhbCgpXG4gICAgICBzdHVkZW50RGlhbG9nICAgICA6IEAkZWwuZmluZChcIiNkaWFsb2dfdGV4dGFyZWFcIikudmFsKClcbiAgICAgIHRyYW5zaXRpb25Db21tZW50IDogQCRlbC5maW5kKFwiI3RyYW5zaXRpb25fdGV4dGFyZWFcIikudmFsKClcblxuICAgICAgbGFuZ3VhZ2UgOiBAJGVsLmZpbmQoXCIjbGFuZ3VhZ2VcIikudmFsKClcblxuXG4gICAgICBkaXNwbGF5Q29kZSA6IEAkZWwuZmluZChcIiNkaXNwbGF5X2NvZGVcIikudmFsKClcblxuICAgICAgZm9udEZhbWlseSA6IEAkZWwuZmluZChcIiNmb250X2ZhbWlseVwiKS52YWwoKVxuXG4gICAgIyBpbXBvcnRhbnQgbm90IHRvIGxldCBwcm90b3R5cGVzIHVzZSBzdWNjZXNzIG9yIGVycm9yXG4gICAgQHByb3RvdHlwZUVkaXRvci5zYXZlKG9wdGlvbnMpXG5cbiAgICAjIG9ubHkgY2FyZSBhYm91dCBlcnJvcnMgaWYgaXQncyBub3QgYW4gXCJvbiBlZGl0XCIgc2F2ZVxuICAgIGlmIEBwcm90b3R5cGVFZGl0b3IuaXNWYWxpZCgpID09IGZhbHNlXG4gICAgICBVdGlscy5taWRBbGVydCBcIlRoZXJlIGFyZSBlcnJvcnMgb24gdGhpcyBwYWdlXCJcbiAgICAgIEBwcm90b3R5cGVFZGl0b3Iuc2hvd0Vycm9ycz8oKVxuICAgICAgQGFjdGl2aXR5ID0gbnVsbFxuICAgIGVsc2VcbiAgICAgIEBtb2RlbC5zYXZlIG51bGwsXG4gICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgQGFjdGl2aXR5ID0gbnVsbFxuICAgICAgICAgICMgcHJlZmVyIHRoZSBzdWNjZXNzIGNhbGxiYWNrXG4gICAgICAgICAgcmV0dXJuIG9wdGlvbnMuc3VjY2VzcygpIGlmIG9wdGlvbnMuc3VjY2Vzc1xuICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiU3VidGVzdCBTYXZlZFwiXG4gICAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lclxuICAgICAgICAgIEB0aW1lciA9IHNldFRpbWVvdXQgQGdvQmFjaywgMTAwMFxuXG4gICAgICAgIGVycm9yOiA9PlxuICAgICAgICAgIEBhY3Rpdml0eSA9IG51bGxcbiAgICAgICAgICByZXR1cm4gb3B0aW9ucy5lcnJvcigpIGlmIG9wdGlvbnMuZXJyb3I/XG4gICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJTYXZlIGVycm9yXCJcblxuXG4gIHJlbmRlcjogLT5cbiAgICBhc3Nlc3NtZW50TmFtZSA9IEBhc3Nlc3NtZW50LmVzY2FwZSBcIm5hbWVcIlxuICAgIG5hbWUgICAgICAgID0gQG1vZGVsLmVzY2FwZSBcIm5hbWVcIlxuICAgIHByb3RvdHlwZSAgID0gQG1vZGVsLmdldCBcInByb3RvdHlwZVwiXG4gICAgZW51bW1lcmF0b3IgPSBAbW9kZWwuZ2V0U3RyaW5nKFwiZW51bWVyYXRvckhlbHBcIilcbiAgICBkaWFsb2cgICAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJzdHVkZW50RGlhbG9nXCIpXG4gICAgdHJhbnNpdGlvbiAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwidHJhbnNpdGlvbkNvbW1lbnRcIilcbiAgICBza2lwcGFibGUgICA9IEBtb2RlbC5nZXRCb29sZWFuKFwic2tpcHBhYmxlXCIpXG4gICAgcnRsICAgICAgICAgPSBAbW9kZWwuZ2V0Qm9vbGVhbihcInJ0bFwiKVxuICAgIGJhY2tCdXR0b24gID0gQG1vZGVsLmdldEJvb2xlYW4oXCJiYWNrQnV0dG9uXCIpXG4gICAgZm9udEZhbWlseSAgPSBAbW9kZWwuZ2V0RXNjYXBlZFN0cmluZyhcImZvbnRGYW1pbHlcIilcbiAgICBkaXNwbGF5Q29kZSA9IEBtb2RlbC5nZXRTdHJpbmcoXCJkaXNwbGF5Q29kZVwiKVxuICAgIGxhbmd1YWdlICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxhbmd1YWdlXCIpXG4gICAgZ3JvdXBIYW5kbGUgPSBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0RXNjYXBlZFN0cmluZyhcImdyb3VwSGFuZGxlXCIpXG5cbiAgICBydGxFZGl0SHRtbCA9IFwiXCJcbiAgICBpZiBwcm90b3R5cGUgaXMgJ2dyaWQnXG4gICAgICBydGxFZGl0SHRtbCA9IFwiXG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbD5SaWdodC10by1MZWZ0IGRpcmVjdGlvbjwvbGFiZWw+PGJyPlxuICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgICAgPGRpdiBpZD0ncnRsX3JhZGlvJyBjbGFzcz0nYnV0dG9uc2V0Jz5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J3J0bF90cnVlJz5ZZXM8L2xhYmVsPjxpbnB1dCBuYW1lPSdydGwnIHR5cGU9J3JhZGlvJyB2YWx1ZT0ndHJ1ZScgaWQ9J3J0bF90cnVlJyAjeydjaGVja2VkJyBpZiBydGx9PlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0ncnRsX2ZhbHNlJz5ObzwvbGFiZWw+PGlucHV0IG5hbWU9J3J0bCcgdHlwZT0ncmFkaW8nIHZhbHVlPSdmYWxzZScgaWQ9J3J0bF9mYWxzZScgI3snY2hlY2tlZCcgaWYgbm90IHJ0bH0+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XCJcblxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGgxPlN1YnRlc3QgRWRpdG9yPC9oMT5cbiAgICAgIDx0YWJsZSBjbGFzcz0nYmFzaWNfaW5mbyc+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+R3JvdXA8L3RoPlxuICAgICAgICAgIDx0ZD4je2dyb3VwSGFuZGxlfTwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+QXNzZXNzbWVudDwvdGg+XG4gICAgICAgICAgPHRkPiN7YXNzZXNzbWVudE5hbWV9PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgIDwvdGFibGU+XG4gICAgICA8YnV0dG9uIGNsYXNzPSdzYXZlX3N1YnRlc3QgY29tbWFuZCc+RG9uZTwvYnV0dG9uPlxuICAgICAgPGRpdiBpZD0nc3VidGVzdF9lZGl0X2Zvcm0nIGNsYXNzPSdlZGl0X2Zvcm0nPlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0nc3VidGVzdF9uYW1lJz5OYW1lPC9sYWJlbD5cbiAgICAgICAgICA8aW5wdXQgaWQ9J3N1YnRlc3RfbmFtZScgdmFsdWU9JyN7bmFtZX0nPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgIDxsYWJlbCBmb3I9J3N1YnRlc3RfcHJvdG90eXBlJyB0aXRsZT0nVGhpcyBpcyBhIGJhc2ljIHR5cGUgb2Ygc3VidGVzdC4gKGUuZy4gU3VydmV5LCBHcmlkLCBMb2NhdGlvbiwgSWQsIENvbnNlbnQpLiBUaGlzIHByb3BlcnR5IGlzIHNldCBpbiBhc3Nlc3NtZW50IGJ1aWxkZXIgd2hlbiB5b3UgYWRkIGEgc3VidGVzdC4gSXQgaXMgdW5jaGFuZ2VhYmxlLic+UHJvdG90eXBlPC9sYWJlbD48YnI+XG4gICAgICAgICAgPGRpdiBjbGFzcz0naW5mb19ib3gnPiN7cHJvdG90eXBlfTwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgIDxsYWJlbCBmb3I9J2xhbmd1YWdlJz5MYW5ndWFnZSBjb2RlPC9sYWJlbD5cbiAgICAgICAgICA8aW5wdXQgaWQ9J2xhbmd1YWdlJyB2YWx1ZT0nI3tsYW5ndWFnZX0nPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsPlNraXBwYWJsZTwvbGFiZWw+PGJyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICAgIDxkaXYgaWQ9J3NraXBfcmFkaW8nIGNsYXNzPSdidXR0b25zZXQnPlxuICAgICAgICAgICAgICA8bGFiZWwgZm9yPSdza2lwX3RydWUnPlllczwvbGFiZWw+PGlucHV0IG5hbWU9J3NraXBwYWJsZScgdHlwZT0ncmFkaW8nIHZhbHVlPSd0cnVlJyBpZD0nc2tpcF90cnVlJyAjeydjaGVja2VkJyBpZiBza2lwcGFibGV9PlxuICAgICAgICAgICAgICA8bGFiZWwgZm9yPSdza2lwX2ZhbHNlJz5ObzwvbGFiZWw+PGlucHV0IG5hbWU9J3NraXBwYWJsZScgdHlwZT0ncmFkaW8nIHZhbHVlPSdmYWxzZScgaWQ9J3NraXBfZmFsc2UnICN7J2NoZWNrZWQnIGlmIG5vdCBza2lwcGFibGV9PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgICN7cnRsRWRpdEh0bWx8fCcnfVxuXG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICA8bGFiZWw+RGlzcGxheSBCYWNrIGJ1dHRvbjwvbGFiZWw+PGJyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICAgIDxkaXYgaWQ9J2JhY2tfYnV0dG9uX3JhZGlvJyBjbGFzcz0nYnV0dG9uc2V0Jz5cbiAgICAgICAgICAgICAgPGxhYmVsIGZvcj0nYmFja19idXR0b25fdHJ1ZSc+WWVzPC9sYWJlbD48aW5wdXQgbmFtZT0nYmFja19idXR0b24nIHR5cGU9J3JhZGlvJyB2YWx1ZT0ndHJ1ZScgaWQ9J2JhY2tfYnV0dG9uX3RydWUnICN7J2NoZWNrZWQnIGlmIGJhY2tCdXR0b259PlxuICAgICAgICAgICAgICA8bGFiZWwgZm9yPSdiYWNrX2J1dHRvbl9mYWxzZSc+Tm88L2xhYmVsPjxpbnB1dCBuYW1lPSdiYWNrX2J1dHRvbicgdHlwZT0ncmFkaW8nIHZhbHVlPSdmYWxzZScgaWQ9J2JhY2tfYnV0dG9uX2ZhbHNlJyAjeydjaGVja2VkJyBpZiBub3QgYmFja0J1dHRvbn0+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJyBkYXRhLXJpY2h0ZXh0S2V5PSdlbnVtZXJhdG9yJz5cbiAgICAgICAgICA8bGFiZWwgZm9yPSdlbnVtZXJhdG9yX3RleHRhcmVhJyB0aXRsZT0nSWYgdGV4dCBpcyBzdXBwbGllZCwgYSBoZWxwIGJ1dHRvbiB3aWxsIGFwcGVhciBhdCB0aGUgdG9wIG9mIHRoZSBzdWJ0ZXN0IGFzIGEgcmVmZXJlbmNlIGZvciB0aGUgZW51bWVyYXRvci4gSWYgeW91IGFyZSBwYXN0aW5nIGZyb20gd29yZCBpdCBpcyByZWNvbW1lbmRlZCB0byBwYXN0ZSBpbnRvIGEgcGxhaW4gdGV4dCBlZGl0b3IgZmlyc3QsIGFuZCB0aGVuIGludG8gdGhpcyBib3guJz5FbnVtZXJhdG9yIGhlbHAgPGJ1dHRvbiBjbGFzcz0ncmljaHRleHRfZWRpdCBjb21tYW5kJz5FZGl0PC9idXR0b24+PC9sYWJlbD5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdpbmZvX2JveF93aWRlIGVudW1lcmF0b3JfcHJldmlldyc+I3tlbnVtbWVyYXRvcn08L2Rpdj5cbiAgICAgICAgICA8dGV4dGFyZWEgaWQ9J2VudW1lcmF0b3JfdGV4dGFyZWEnIGNsYXNzPSdjb25maXJtYXRpb24nPiN7ZW51bW1lcmF0b3J9PC90ZXh0YXJlYT5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdlbnVtZXJhdG9yX2J1dHRvbnMgY29uZmlybWF0aW9uJz5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J3JpY2h0ZXh0X3NhdmUgY29tbWFuZCc+U2F2ZTwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0ncmljaHRleHRfY2FuY2VsIGNvbW1hbmQnPkNhbmNlbDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnIGRhdGEtcmljaHRleHRLZXk9J2RpYWxvZyc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0nZGlhbG9nX3RleHRhcmVhJyB0aXRsZT0nR2VuZXJhbGx5IHRoaXMgaXMgYSBzY3JpcHQgdGhhdCB3aWxsIGJlIHJlYWQgdG8gdGhlIHN0dWRlbnQuIElmIHlvdSBhcmUgcGFzdGluZyBmcm9tIHdvcmQgaXQgaXMgcmVjb21tZW5kZWQgdG8gcGFzdGUgaW50byBhIHBsYWluIHRleHQgZWRpdG9yIGZpcnN0LCBhbmQgdGhlbiBpbnRvIHRoaXMgYm94Lic+U3R1ZGVudCBEaWFsb2cgPGJ1dHRvbiBjbGFzcz0ncmljaHRleHRfZWRpdCBjb21tYW5kJz5FZGl0PC9idXR0b24+PC9sYWJlbD5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdpbmZvX2JveF93aWRlIGRpYWxvZ19wcmV2aWV3Jz4je2RpYWxvZ308L2Rpdj5cbiAgICAgICAgICA8dGV4dGFyZWEgaWQ9J2RpYWxvZ190ZXh0YXJlYScgY2xhc3M9J2NvbmZpcm1hdGlvbic+I3tkaWFsb2d9PC90ZXh0YXJlYT5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdkaWFsb2dfYnV0dG9ucyBjb25maXJtYXRpb24nPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0ncmljaHRleHRfc2F2ZSBjb21tYW5kJz5TYXZlPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdyaWNodGV4dF9jYW5jZWwgY29tbWFuZCc+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZScgZGF0YS1yaWNodGV4dEtleT0ndHJhbnNpdGlvbic+XG4gICAgICAgICAgPGxhYmVsIGZvcj0ndHJhbnNpdGlvbl90ZXN0YXJlYScgdGl0bGU9J1RoaXMgd2lsbCBiZSBkaXNwbGF5ZWQgd2l0aCBhIGdyZXkgYmFja2dyb3VuZCBhYm92ZSB0aGUgbmV4dCBidXR0b24sIHNpbWlsYXIgdG8gdGhlIHN0dWRlbnQgZGlhbG9nIHRleHQuIElmIHlvdSBhcmUgcGFzdGluZyBmcm9tIFdvcmQgaXQgaXMgcmVjb21tZW5kZWQgdG8gcGFzdGUgaW50byBhIHBsYWluIHRleHQgZWRpdG9yIGZpcnN0LCBhbmQgdGhlbiBpbnRvIHRoaXMgYm94Lic+VHJhbnNpdGlvbiBDb21tZW50IDxidXR0b24gY2xhc3M9J3JpY2h0ZXh0X2VkaXQgY29tbWFuZCc+RWRpdDwvYnV0dG9uPjwvbGFiZWw+XG4gICAgICAgICAgPGRpdiBjbGFzcz0naW5mb19ib3hfd2lkZSB0cmFuc2l0aW9uX3ByZXZpZXcnPiN7dHJhbnNpdGlvbn08L2Rpdj5cbiAgICAgICAgICA8dGV4dGFyZWEgaWQ9J3RyYW5zaXRpb25fdGV4dGFyZWEnIGNsYXNzPSdjb25maXJtYXRpb24nPiN7dHJhbnNpdGlvbn08L3RleHRhcmVhPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J3RyYW5zaXRpb25fYnV0dG9ucyBjb25maXJtYXRpb24nPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0ncmljaHRleHRfc2F2ZSBjb21tYW5kJz5TYXZlPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdyaWNodGV4dF9jYW5jZWwgY29tbWFuZCc+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0nZm9udF9mYW1pbHknIHRpdGxlPSdQbGVhc2UgYmUgYXdhcmUgdGhhdCB3aGF0ZXZlciBmb250IGlzIHNwZWNpZmllZCwgbXVzdCBiZSBhdmFpbGFibGUgb24gdGhlIHVzZXJgcyBzeXN0ZW0uIFdoZW4gbXVsdGlwbGUgZm9udHMgYXJlIGVudGVyZWQgc2VwYXJhdGVkIGJ5IGNvbW1hcywgdGhleSBhcmUgcmFua2VkIGluIG9yZGVyIG9mIHByZWZlcmVuY2UgZnJvbSBsZWZ0IHRvIHJpZ2h0LiBGb250IG5hbWVzIHdpdGggc3BhY2VzIG11c3QgYmUgd3JhcHBlZCBpbiBkb3VibGUgcXVvdGVzLic+UHJlZmVycmVkIGZvbnQ8L2xhYmVsPlxuICAgICAgICAgIDxpbnB1dCBpZD0nZm9udF9mYW1pbHknIHZhbHVlPScje2ZvbnRGYW1pbHl9Jz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdkaXNwbGF5X2NvZGUnIHRpdGxlPSdUaGlzIENvZmZlZVNjcmlwdCBjb2RlIHdpbGwgYmUgZXhlY3V0ZWQgd2hlbiB0aGlzIHF1ZXN0aW9uIGlzIHNob3duLiBUaGlzIG9wdGlvbiBtYXkgb25seSBiZSB1c2VkIHdoZW4gRm9jdXMgTW9kZSBpcyBvbi4nPkFjdGlvbiBvbiBkaXNwbGF5PC9sYWJlbD5cbiAgICAgICAgICAgIDx0ZXh0YXJlYSBpZD0nZGlzcGxheV9jb2RlJz4je2Rpc3BsYXlDb2RlfTwvdGV4dGFyZWE+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgaWQ9J3Byb3RvdHlwZV9hdHRyaWJ1dGVzJz48L2Rpdj5cblxuICAgICAgPGJ1dHRvbiBjbGFzcz0nc2F2ZV9zdWJ0ZXN0IGNvbW1hbmQnPkRvbmU8L2J1dHRvbj5cbiAgICAgIFwiXG5cbiAgICBAcHJvdG90eXBlRWRpdG9yLnNldEVsZW1lbnQgQCRlbC5maW5kKCcjcHJvdG90eXBlX2F0dHJpYnV0ZXMnKVxuICAgIEBwcm90b3R5cGVFZGl0b3IucmVuZGVyPygpXG4gICAgXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgYWZ0ZXJSZW5kZXI6IC0+XG4gICAgQHByb3RvdHlwZUVkaXRvcj8uYWZ0ZXJSZW5kZXI/KClcblxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgQHByb3RvdHlwZUVkaXRvci5jbG9zZT8oKVxuXG4iXX0=
