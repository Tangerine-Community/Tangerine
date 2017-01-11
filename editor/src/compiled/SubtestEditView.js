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
    'change #input-sound': 'uploadInputSound',
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
    options.parent = this;
    this.prototypeViews = Tangerine.config.get("prototypeViews");
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

  SubtestEditView.prototype.renderInputSound = function() {
    var audio;
    audio = this.model.getObject('inputAudio', {
      name: 'None'
    });
    return this.$el.find('#input-sound-container').html("<div class='menu_box'> <label style='display:block;'>" + audio.name + "</label> <audio src='data:" + audio.type + ";base64," + audio.data + "' controls></audio> <input id='input-sound' type='file'> </div>");
  };

  SubtestEditView.prototype.uploadInputSound = function(e) {
    var file, files, reader;
    files = e.target.files;
    file = files[0];
    if (files && file) {
      reader = new FileReader();
      reader.onload = (function(_this) {
        return function(readerEvt) {
          var sound64;
          sound64 = btoa(readerEvt.target.result);
          return _this.model.save({
            inputAudio: {
              data: sound64,
              type: file.type,
              name: file.name
            }
          }, {
            success: function() {
              Utils.midAlert("Subtest saved.");
              return _this.renderInputSound();
            }
          });
        };
      })(this);
      return reader.readAsBinaryString(file);
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
    this.$el.html("<h1>Subtest Editor</h1> <table class='basic_info'> <tr> <th>Group</th> <td>" + groupHandle + "</td> </tr> <tr> <th>Assessment</th> <td>" + assessmentName + "</td> </tr> </table> <button class='save_subtest command'>Done</button> <div id='subtest_edit_form' class='edit_form'> <div class='label_value'> <label for='subtest_name'>Name</label> <input id='subtest_name' value='" + name + "'> </div> <div class='label_value'> <label for='subtest_prototype' title='This is a basic type of subtest. (e.g. Survey, Grid, Location, Id, Consent). This property is set in assessment builder when you add a subtest. It is unchangeable.'>Prototype</label><br> <div class='info_box'>" + prototype + "</div> </div> <div class='label_value'> <label for='language'>Language code</label> <input id='language' value='" + language + "'> </div> <div class='label_value'> <label>Skippable</label><br> <div class='menu_box'> <div id='skip_radio' class='buttonset'> <label for='skip_true'>Yes</label><input name='skippable' type='radio' value='true' id='skip_true' " + (skippable ? 'checked' : void 0) + "> <label for='skip_false'>No</label><input name='skippable' type='radio' value='false' id='skip_false' " + (!skippable ? 'checked' : void 0) + "> </div> </div> </div> " + (rtlEditHtml || '') + " <div class='label_value'> <label>Display Back button</label><br> <div class='menu_box'> <div id='back_button_radio' class='buttonset'> <label for='back_button_true'>Yes</label><input name='back_button' type='radio' value='true' id='back_button_true' " + (backButton ? 'checked' : void 0) + "> <label for='back_button_false'>No</label><input name='back_button' type='radio' value='false' id='back_button_false' " + (!backButton ? 'checked' : void 0) + "> </div> </div> </div> <div class='label_value' data-richtextKey='enumerator'> <label for='enumerator_textarea' title='If text is supplied, a help button will appear at the top of the subtest as a reference for the enumerator. If you are pasting from word it is recommended to paste into a plain text editor first, and then into this box.'>Enumerator help <button class='richtext_edit command'>Edit</button></label> <div class='info_box_wide enumerator_preview'>" + enummerator + "</div> <textarea id='enumerator_textarea' class='confirmation'>" + enummerator + "</textarea> <div class='enumerator_buttons confirmation'> <button class='richtext_save command'>Save</button> <button class='richtext_cancel command'>Cancel</button> </div> </div> <div class='label_value' data-richtextKey='dialog'> <label for='dialog_textarea' title='Generally this is a script that will be read to the student. If you are pasting from word it is recommended to paste into a plain text editor first, and then into this box.'>Student Dialog <button class='richtext_edit command'>Edit</button></label> <div class='info_box_wide dialog_preview'>" + dialog + "</div> <textarea id='dialog_textarea' class='confirmation'>" + dialog + "</textarea> <div class='dialog_buttons confirmation'> <button class='richtext_save command'>Save</button> <button class='richtext_cancel command'>Cancel</button> </div> </div> <div class='label_value' data-richtextKey='transition'> <label for='transition_testarea' title='This will be displayed with a grey background above the next button, similar to the student dialog text. If you are pasting from Word it is recommended to paste into a plain text editor first, and then into this box.'>Transition Comment <button class='richtext_edit command'>Edit</button></label> <div class='info_box_wide transition_preview'>" + transition + "</div> <textarea id='transition_textarea' class='confirmation'>" + transition + "</textarea> <div class='transition_buttons confirmation'> <button class='richtext_save command'>Save</button> <button class='richtext_cancel command'>Cancel</button> </div> </div> <div class='label_value'> <label for='font_family' title='Please be aware that whatever font is specified, must be available on the user`s system. When multiple fonts are entered separated by commas, they are ranked in order of preference from left to right. Font names with spaces must be wrapped in double quotes.'>Preferred font</label> <input id='font_family' value='" + fontFamily + "'> </div> <div class='label_value'> <label for='input-sound' title='Sound to be played when a user interacts with the assessment.'>Input sound</label> <div id='input-sound-container'></div> </div> <div class='menu_box'> <div class='label_value'> <label for='display_code' title='This CoffeeScript code will be executed when this question is shown. This option may only be used when Focus Mode is on.'>Action on display</label> <textarea id='display_code'>" + displayCode + "</textarea> </div> </div> </div> <div id='prototype_attributes'></div> <button class='save_subtest command'>Done</button>");
    this.prototypeEditor.setElement(this.$el.find('#prototype_attributes'));
    if (typeof (base = this.prototypeEditor).render === "function") {
      base.render();
    }
    this.renderInputSound();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvU3VidGVzdEVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGVBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs7NEJBRUosU0FBQSxHQUFXOzs0QkFFWCxNQUFBLEdBQ0U7SUFBQSxvQkFBQSxFQUErQixRQUEvQjtJQUNBLHFCQUFBLEVBQStCLGFBRC9CO0lBRUEscUJBQUEsRUFBK0Isa0JBRi9CO0lBSUEsc0JBQUEsRUFBNkIsY0FKN0I7SUFLQSxzQkFBQSxFQUE2QixjQUw3QjtJQU1BLHdCQUFBLEVBQTZCLGdCQU43QjtJQU9BLHNCQUFBLEVBQXlCLGdCQVB6Qjs7OzRCQVVGLGNBQUEsR0FBZ0I7SUFDWjtNQUFBLEtBQUEsRUFBa0IsWUFBbEI7TUFDQSxlQUFBLEVBQWtCLGdCQURsQjtLQURZLEVBSVo7TUFBQSxLQUFBLEVBQWtCLFFBQWxCO01BQ0EsZUFBQSxFQUFrQixlQURsQjtLQUpZLEVBT1o7TUFBQSxLQUFBLEVBQWtCLFlBQWxCO01BQ0EsZUFBQSxFQUFrQixtQkFEbEI7S0FQWTs7OzRCQVdoQixVQUFBLEdBQVksU0FBRSxPQUFGO0lBRVYsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUNaLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFFVCxJQUFDLENBQUEsWUFBRCxHQUFnQixDQUFDLENBQUMsS0FBRixDQUFRLElBQUMsQ0FBQSxjQUFULEVBQXlCLEtBQXpCO0lBRWhCLElBQUMsQ0FBQSxLQUFELEdBQWMsT0FBTyxDQUFDO0lBQ3RCLElBQUMsQ0FBQSxVQUFELEdBQWMsT0FBTyxDQUFDO0lBQ3RCLElBQUMsQ0FBQSxNQUFELEdBQWMsU0FBUyxDQUFDLE1BQU0sQ0FBQztJQUUvQixPQUFPLENBQUMsTUFBUixHQUFpQjtJQUNqQixJQUFDLENBQUEsY0FBRCxHQUFtQixTQUFTLENBQUMsTUFBTSxDQUFDLEdBQWpCLENBQXFCLGdCQUFyQjtJQUNuQixJQUFDLENBQUEsZUFBRCxHQUF1QixJQUFBLE1BQU8sQ0FB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YnRlc3QvU3VidGVzdEVkaXRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgU3VidGVzdEVkaXRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJzdWJ0ZXN0X2VkaXRcIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLmJhY2tfYnV0dG9uJyAgICAgICAgIDogJ2dvQmFjaydcbiAgICAnY2xpY2sgLnNhdmVfc3VidGVzdCcgICAgICAgIDogJ3NhdmVTdWJ0ZXN0J1xuICAgICdjaGFuZ2UgI2lucHV0LXNvdW5kJyAgICAgICAgOiAndXBsb2FkSW5wdXRTb3VuZCdcblxuICAgICdjbGljayAucmljaHRleHRfZWRpdCcgICAgIDogJ3JpY2h0ZXh0RWRpdCdcbiAgICAnY2xpY2sgLnJpY2h0ZXh0X3NhdmUnICAgICA6ICdyaWNodGV4dFNhdmUnXG4gICAgJ2NsaWNrIC5yaWNodGV4dF9jYW5jZWwnICAgOiAncmljaHRleHRDYW5jZWwnXG4gICAgJ2NoYW5nZSAjZGlzcGxheV9jb2RlJyA6ICd2YWxpZGF0ZVN5bnRheCdcblxuXG4gIHJpY2h0ZXh0Q29uZmlnOiBbXG4gICAgICBcImtleVwiICAgICAgICAgICA6IFwiZW51bWVyYXRvclwiXG4gICAgICBcImF0dHJpYnV0ZU5hbWVcIiA6IFwiZW51bWVyYXRvckhlbHBcIlxuICAgICxcbiAgICAgIFwia2V5XCIgICAgICAgICAgIDogXCJkaWFsb2dcIlxuICAgICAgXCJhdHRyaWJ1dGVOYW1lXCIgOiBcInN0dWRlbnREaWFsb2dcIlxuICAgICxcbiAgICAgIFwia2V5XCIgICAgICAgICAgIDogXCJ0cmFuc2l0aW9uXCJcbiAgICAgIFwiYXR0cmlidXRlTmFtZVwiIDogXCJ0cmFuc2l0aW9uQ29tbWVudFwiXG4gIF1cblxuICBpbml0aWFsaXplOiAoIG9wdGlvbnMgKSAtPlxuXG4gICAgQGFjdGl2aXR5ID0gbnVsbFxuICAgIEB0aW1lciA9IDBcbiAgICBcbiAgICBAcmljaHRleHRLZXlzID0gXy5wbHVjayhAcmljaHRleHRDb25maWcsIFwia2V5XCIpXG5cbiAgICBAbW9kZWwgICAgICA9IG9wdGlvbnMubW9kZWxcbiAgICBAYXNzZXNzbWVudCA9IG9wdGlvbnMuYXNzZXNzbWVudFxuICAgIEBjb25maWcgICAgID0gVGFuZ2VyaW5lLmNvbmZpZy5zdWJ0ZXN0XG5cbiAgICBvcHRpb25zLnBhcmVudCA9IEBcbiAgICBAcHJvdG90eXBlVmlld3MgID0gVGFuZ2VyaW5lLmNvbmZpZy5nZXQgXCJwcm90b3R5cGVWaWV3c1wiXG4gICAgQHByb3RvdHlwZUVkaXRvciA9IG5ldyB3aW5kb3dbQHByb3RvdHlwZVZpZXdzW0Btb2RlbC5nZXQgJ3Byb3RvdHlwZSddWydlZGl0J11dXG4gICAgICBtb2RlbDogQG1vZGVsXG4gICAgICBwYXJlbnQ6IEBcblxuICAgIEBwcm90b3R5cGVFZGl0b3Iub24gXCJxdWVzdGlvbi1lZGl0XCIsIChxdWVzdGlvbklkKSA9PlxuICAgICAgQHNhdmVcbiAgICAgICAgcXVlc3Rpb25TYXZlICA6IGZhbHNlXG4gICAgICAgIHN1Y2Nlc3MgICAgICAgOiAtPiBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwicXVlc3Rpb24vI3txdWVzdGlvbklkfVwiLCB0cnVlXG5cbiAgZ29CYWNrOiA9PlxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJlZGl0L1wiICsgQG1vZGVsLmdldChcImFzc2Vzc21lbnRJZFwiKSwgdHJ1ZVxuXG5cbiAgdmFsaWRhdGVTeW50YXg6IChldmVudCkgLT5cbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgY29kZSA9ICR0YXJnZXQudmFsKClcbiAgICBpZiBub3QgXy5pc0VtcHR5KGNvZGUpXG4gICAgICB0cnlcbiAgICAgICAgb2xkQW5zd2VyID0gQGFuc3dlclxuICAgICAgICBAYW5zd2VyID0ge31cbiAgICAgICAgQGlzVmFsaWQgPSBDb2ZmZWVTY3JpcHQuY29tcGlsZS5hcHBseShALCBbY29kZV0pXG4gICAgICAgIGlmIG9sZEFuc3dlcj8gdGhlbiBAYW5zd2VyID0gb2xkQW5zd2VyIGVsc2UgZGVsZXRlIHRoaXNbXCJhbnN3ZXJcIl1cbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgIG5hbWUgPSAoKC9mdW5jdGlvbiAoLnsxLH0pXFwoLykuZXhlYyhlcnJvci5jb25zdHJ1Y3Rvci50b1N0cmluZygpKVsxXSlcbiAgICAgICAgd2hlcmUgPSAkdGFyZ2V0LmF0dHIoJ2lkJykuaHVtYW5pemUoKVxuICAgICAgICBtZXNzYWdlID0gZXJyb3IubWVzc2FnZVxuICAgICAgICBhbGVydCBcIkVycm9yIGluICN7d2hlcmV9XFxuXFxuI3tuYW1lfVxcblxcbiN7bWVzc2FnZX1cIlxuXG4gIGdldFJpY2h0ZXh0Q29uZmlnOiAoZXZlbnQpIC0+XG5cbiAgICBpZiBfLmlzU3RyaW5nIGV2ZW50XG4gICAgICBkYXRhS2V5ID0gZXZlbnRcbiAgICBlbHNlXG4gICAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgICBkYXRhS2V5ID0gJHRhcmdldC5wYXJlbnQoKS5hdHRyKFwiZGF0YS1yaWNodGV4dEtleVwiKSB8fCAkdGFyZ2V0LnBhcmVudCgpLnBhcmVudCgpLmF0dHIoXCJkYXRhLXJpY2h0ZXh0S2V5XCIpXG5cbiAgICBhdHRyaWJ1dGVOYW1lID0gXy53aGVyZShAcmljaHRleHRDb25maWcsIFwia2V5XCI6ZGF0YUtleSlbMF0uYXR0cmlidXRlTmFtZVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIFwiZGF0YUtleVwiICAgICAgIDogZGF0YUtleVxuICAgICAgXCJhdHRyaWJ1dGVOYW1lXCIgOiBhdHRyaWJ1dGVOYW1lXG4gICAgfVxuXG5cbiAgcmljaHRleHRFZGl0OiAoZXZlbnQpIC0+XG5cbiAgICBjb25maWcgPSBAZ2V0UmljaHRleHRDb25maWcgZXZlbnRcblxuICAgIEAkZWwuZmluZChcIi4je2NvbmZpZy5kYXRhS2V5fV9wcmV2aWV3LCAuI3tjb25maWcuZGF0YUtleX1fZWRpdCwgLiN7Y29uZmlnLmRhdGFLZXl9X2J1dHRvbnNcIikuZmFkZVRvZ2dsZSgyNTApXG4gICAgXG4gICAgQGVkaXRvciA9IHt9IGlmIG5vdCBAZWRpdG9yP1xuICAgIEAkZWwuZmluZChcInRleHRhcmVhIyN7Y29uZmlnLmRhdGFLZXl9X3RleHRhcmVhXCIpLmh0bWwoQG1vZGVsLmVzY2FwZShjb25maWcuYXR0cmlidXRlTmFtZSkgfHwgXCJcIilcbiAgICBAZWRpdG9yW2NvbmZpZy5kYXRhS2V5XSA9IENLRURJVE9SLnJlcGxhY2UoXCIje2NvbmZpZy5kYXRhS2V5fV90ZXh0YXJlYVwiKVxuXG4gIHJpY2h0ZXh0U2F2ZTogKGV2ZW50KSAtPlxuXG4gICAgY29uZmlnID0gQGdldFJpY2h0ZXh0Q29uZmlnIGV2ZW50XG4gICAgbmV3QXR0cmlidXRlcyA9IHt9XG4gICAgbmV3QXR0cmlidXRlc1tjb25maWcuYXR0cmlidXRlTmFtZV0gPSBAZWRpdG9yW2NvbmZpZy5kYXRhS2V5XS5nZXREYXRhKClcblxuICAgIEBtb2RlbC5zYXZlIG5ld0F0dHJpYnV0ZXMsIFxuICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgQHJpY2h0ZXh0Q2FuY2VsKGNvbmZpZy5kYXRhS2V5KVxuICAgICAgZXJyb3I6ID0+XG4gICAgICAgIGFsZXJ0IFwiU2F2ZSBlcnJvci4gUGxlYXNlIHRyeSBhZ2Fpbi5cIlxuXG4gIHJpY2h0ZXh0Q2FuY2VsOiAoZXZlbnQpIC0+XG5cbiAgICBjb25maWcgPSBAZ2V0UmljaHRleHRDb25maWcgZXZlbnRcblxuICAgICRwcmV2aWV3ID0gJChcImRpdi4je2NvbmZpZy5kYXRhS2V5fV9wcmV2aWV3XCIpXG4gICAgJHByZXZpZXcuaHRtbCBAbW9kZWwuZ2V0KGNvbmZpZy5hdHRyaWJ1dGVOYW1lKSB8fCBcIlwiXG4gICAgJHByZXZpZXcuZmFkZUluKDI1MClcbiAgICBAJGVsLmZpbmQoXCJidXR0b24uI3tjb25maWcuZGF0YUtleX1fZWRpdCwgLiN7Y29uZmlnLmRhdGFLZXl9X2J1dHRvbnNcIikuZmFkZVRvZ2dsZSgyNTApXG4gICAgQGVkaXRvcltjb25maWcuZGF0YUtleV0uZGVzdHJveSgpXG5cbiAgc2F2ZVN1YnRlc3Q6IC0+IEBzYXZlKClcblxuICBzYXZlOiAoIG9wdGlvbnM9e30gKSA9PlxuXG4gICAgcmV0dXJuIGZhbHNlIHVubGVzcyBAYWN0aXZpdHkgPT0gbnVsbFxuICAgIEBhY3Rpdml0eSA9IFwic2F2aW5nXCJcblxuICAgICMgYnkgZGVmYXVsdCBzYXZlIHByb3RvdHlwZSBhcyB3ZWxsXG4gICAgb3B0aW9ucy5wcm90b3R5cGVTYXZlID0gaWYgb3B0aW9ucy5wcm90b3R5cGVTYXZlPyB0aGVuIG9wdGlvbnMucHJvcm90eXBlU2F2ZSBlbHNlIHRydWVcblxuICAgIHByb3RvdHlwZSA9IEBtb2RlbC5nZXQoXCJwcm90b3R5cGVcIilcblxuICAgIEBtb2RlbC5zZXRcbiAgICAgIG5hbWUgICAgICAgICAgICAgIDogQCRlbC5maW5kKFwiI3N1YnRlc3RfbmFtZVwiKS52YWwoKVxuICAgICAgZW51bWVyYXRvckhlbHAgICAgOiBAJGVsLmZpbmQoXCIjZW51bWVyYXRvcl9oZWxwXCIpLnZhbCgpXG4gICAgICBzdHVkZW50RGlhbG9nICAgICA6IEAkZWwuZmluZChcIiNzdHVkZW50X2RpYWxvZ1wiKS52YWwoKVxuICAgICAgdHJhbnNpdGlvbkNvbW1lbnQgOiBAJGVsLmZpbmQoXCIjdHJhbnNpdGlvbl9jb21tZW50XCIpLnZhbCgpXG4gICAgICBza2lwcGFibGUgICAgICAgICA6IEAkZWwuZmluZChcIiNza2lwX3JhZGlvIGlucHV0OnJhZGlvW25hbWU9c2tpcHBhYmxlXTpjaGVja2VkXCIpLnZhbCgpID09IFwidHJ1ZVwiXG4gICAgICBydGwgICAgICAgICAgICAgICA6IEAkZWwuZmluZChcIiNydGxfcmFkaW8gaW5wdXQ6cmFkaW9bbmFtZT1ydGxdOmNoZWNrZWRcIikudmFsKCkgPT0gXCJ0cnVlXCJcbiAgICAgIGJhY2tCdXR0b24gICAgICAgIDogQCRlbC5maW5kKFwiI2JhY2tfYnV0dG9uX3JhZGlvIGlucHV0OnJhZGlvW25hbWU9YmFja19idXR0b25dOmNoZWNrZWRcIikudmFsKCkgPT0gXCJ0cnVlXCJcblxuICAgICAgZW51bWVyYXRvckhlbHAgICAgOiBAJGVsLmZpbmQoXCIjZW51bWVyYXRvcl90ZXh0YXJlYVwiKS52YWwoKVxuICAgICAgc3R1ZGVudERpYWxvZyAgICAgOiBAJGVsLmZpbmQoXCIjZGlhbG9nX3RleHRhcmVhXCIpLnZhbCgpXG4gICAgICB0cmFuc2l0aW9uQ29tbWVudCA6IEAkZWwuZmluZChcIiN0cmFuc2l0aW9uX3RleHRhcmVhXCIpLnZhbCgpXG5cbiAgICAgIGxhbmd1YWdlIDogQCRlbC5maW5kKFwiI2xhbmd1YWdlXCIpLnZhbCgpXG5cblxuICAgICAgZGlzcGxheUNvZGUgOiBAJGVsLmZpbmQoXCIjZGlzcGxheV9jb2RlXCIpLnZhbCgpXG5cbiAgICAgIGZvbnRGYW1pbHkgOiBAJGVsLmZpbmQoXCIjZm9udF9mYW1pbHlcIikudmFsKClcblxuICAgICMgaW1wb3J0YW50IG5vdCB0byBsZXQgcHJvdG90eXBlcyB1c2Ugc3VjY2VzcyBvciBlcnJvclxuICAgIEBwcm90b3R5cGVFZGl0b3Iuc2F2ZShvcHRpb25zKVxuXG4gICAgIyBvbmx5IGNhcmUgYWJvdXQgZXJyb3JzIGlmIGl0J3Mgbm90IGFuIFwib24gZWRpdFwiIHNhdmVcbiAgICBpZiBAcHJvdG90eXBlRWRpdG9yLmlzVmFsaWQoKSA9PSBmYWxzZVxuICAgICAgVXRpbHMubWlkQWxlcnQgXCJUaGVyZSBhcmUgZXJyb3JzIG9uIHRoaXMgcGFnZVwiXG4gICAgICBAcHJvdG90eXBlRWRpdG9yLnNob3dFcnJvcnM/KClcbiAgICAgIEBhY3Rpdml0eSA9IG51bGxcbiAgICBlbHNlXG4gICAgICBAbW9kZWwuc2F2ZSBudWxsLFxuICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgIEBhY3Rpdml0eSA9IG51bGxcbiAgICAgICAgICAjIHByZWZlciB0aGUgc3VjY2VzcyBjYWxsYmFja1xuICAgICAgICAgIHJldHVybiBvcHRpb25zLnN1Y2Nlc3MoKSBpZiBvcHRpb25zLnN1Y2Nlc3NcbiAgICAgICAgICBVdGlscy5taWRBbGVydCBcIlN1YnRlc3QgU2F2ZWRcIlxuICAgICAgICAgIGNsZWFyVGltZW91dCBAdGltZXJcbiAgICAgICAgICBAdGltZXIgPSBzZXRUaW1lb3V0IEBnb0JhY2ssIDEwMDBcblxuICAgICAgICBlcnJvcjogPT5cbiAgICAgICAgICBAYWN0aXZpdHkgPSBudWxsXG4gICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZXJyb3IoKSBpZiBvcHRpb25zLmVycm9yP1xuICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiU2F2ZSBlcnJvclwiXG5cbiAgcmVuZGVySW5wdXRTb3VuZDogLT5cbiAgICBhdWRpbyAgPSBAbW9kZWwuZ2V0T2JqZWN0KCdpbnB1dEF1ZGlvJyx7bmFtZTonTm9uZSd9KVxuICAgIEAkZWwuZmluZCgnI2lucHV0LXNvdW5kLWNvbnRhaW5lcicpLmh0bWwgXCJcbiAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgPGxhYmVsIHN0eWxlPSdkaXNwbGF5OmJsb2NrOyc+I3thdWRpby5uYW1lfTwvbGFiZWw+XG4gICAgICAgIDxhdWRpbyBzcmM9J2RhdGE6I3thdWRpby50eXBlfTtiYXNlNjQsI3thdWRpby5kYXRhfScgY29udHJvbHM+PC9hdWRpbz5cbiAgICAgICAgPGlucHV0IGlkPSdpbnB1dC1zb3VuZCcgdHlwZT0nZmlsZSc+XG4gICAgICA8L2Rpdj5cbiAgICBcIlxuXG4gIHVwbG9hZElucHV0U291bmQ6IChlKSAtPlxuICAgIGZpbGVzID0gZS50YXJnZXQuZmlsZXNcbiAgICBmaWxlID0gZmlsZXNbMF1cblxuICAgIGlmIGZpbGVzICYmIGZpbGVcbiAgICAgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcblxuICAgICAgcmVhZGVyLm9ubG9hZCA9IChyZWFkZXJFdnQpID0+XG4gICAgICAgIHNvdW5kNjQgPSBidG9hKHJlYWRlckV2dC50YXJnZXQucmVzdWx0KVxuXG4gICAgICAgIEBtb2RlbC5zYXZlXG4gICAgICAgICAgaW5wdXRBdWRpbyA6XG4gICAgICAgICAgICBkYXRhIDogc291bmQ2NFxuICAgICAgICAgICAgdHlwZSA6IGZpbGUudHlwZVxuICAgICAgICAgICAgbmFtZSA6IGZpbGUubmFtZVxuICAgICAgICAsXG4gICAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiU3VidGVzdCBzYXZlZC5cIlxuICAgICAgICAgICAgQHJlbmRlcklucHV0U291bmQoKVxuXG4gICAgICByZWFkZXIucmVhZEFzQmluYXJ5U3RyaW5nKGZpbGUpXG5cbiAgcmVuZGVyOiAtPlxuICAgIGFzc2Vzc21lbnROYW1lID0gQGFzc2Vzc21lbnQuZXNjYXBlIFwibmFtZVwiXG4gICAgbmFtZSAgICAgICAgPSBAbW9kZWwuZXNjYXBlIFwibmFtZVwiXG4gICAgcHJvdG90eXBlICAgPSBAbW9kZWwuZ2V0IFwicHJvdG90eXBlXCJcbiAgICBlbnVtbWVyYXRvciA9IEBtb2RlbC5nZXRTdHJpbmcoXCJlbnVtZXJhdG9ySGVscFwiKVxuICAgIGRpYWxvZyAgICAgID0gQG1vZGVsLmdldFN0cmluZyhcInN0dWRlbnREaWFsb2dcIilcbiAgICB0cmFuc2l0aW9uICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJ0cmFuc2l0aW9uQ29tbWVudFwiKVxuICAgIHNraXBwYWJsZSAgID0gQG1vZGVsLmdldEJvb2xlYW4oXCJza2lwcGFibGVcIilcbiAgICBydGwgICAgICAgICA9IEBtb2RlbC5nZXRCb29sZWFuKFwicnRsXCIpXG4gICAgYmFja0J1dHRvbiAgPSBAbW9kZWwuZ2V0Qm9vbGVhbihcImJhY2tCdXR0b25cIilcbiAgICBmb250RmFtaWx5ICA9IEBtb2RlbC5nZXRFc2NhcGVkU3RyaW5nKFwiZm9udEZhbWlseVwiKVxuICAgIGRpc3BsYXlDb2RlID0gQG1vZGVsLmdldFN0cmluZyhcImRpc3BsYXlDb2RlXCIpXG4gICAgbGFuZ3VhZ2UgICAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwibGFuZ3VhZ2VcIilcbiAgICBncm91cEhhbmRsZSA9IFRhbmdlcmluZS5zZXR0aW5ncy5nZXRFc2NhcGVkU3RyaW5nKFwiZ3JvdXBIYW5kbGVcIilcblxuICAgIHJ0bEVkaXRIdG1sID0gXCJcIlxuICAgIGlmIHByb3RvdHlwZSBpcyAnZ3JpZCdcbiAgICAgIHJ0bEVkaXRIdG1sID0gXCJcbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsPlJpZ2h0LXRvLUxlZnQgZGlyZWN0aW9uPC9sYWJlbD48YnI+XG4gICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICA8ZGl2IGlkPSdydGxfcmFkaW8nIGNsYXNzPSdidXR0b25zZXQnPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0ncnRsX3RydWUnPlllczwvbGFiZWw+PGlucHV0IG5hbWU9J3J0bCcgdHlwZT0ncmFkaW8nIHZhbHVlPSd0cnVlJyBpZD0ncnRsX3RydWUnICN7J2NoZWNrZWQnIGlmIHJ0bH0+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdydGxfZmFsc2UnPk5vPC9sYWJlbD48aW5wdXQgbmFtZT0ncnRsJyB0eXBlPSdyYWRpbycgdmFsdWU9J2ZhbHNlJyBpZD0ncnRsX2ZhbHNlJyAjeydjaGVja2VkJyBpZiBub3QgcnRsfT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cIlxuXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8aDE+U3VidGVzdCBFZGl0b3I8L2gxPlxuICAgICAgPHRhYmxlIGNsYXNzPSdiYXNpY19pbmZvJz5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0aD5Hcm91cDwvdGg+XG4gICAgICAgICAgPHRkPiN7Z3JvdXBIYW5kbGV9PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0aD5Bc3Nlc3NtZW50PC90aD5cbiAgICAgICAgICA8dGQ+I3thc3Nlc3NtZW50TmFtZX08L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgPC90YWJsZT5cbiAgICAgIDxidXR0b24gY2xhc3M9J3NhdmVfc3VidGVzdCBjb21tYW5kJz5Eb25lPC9idXR0b24+XG4gICAgICA8ZGl2IGlkPSdzdWJ0ZXN0X2VkaXRfZm9ybScgY2xhc3M9J2VkaXRfZm9ybSc+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICA8bGFiZWwgZm9yPSdzdWJ0ZXN0X25hbWUnPk5hbWU8L2xhYmVsPlxuICAgICAgICAgIDxpbnB1dCBpZD0nc3VidGVzdF9uYW1lJyB2YWx1ZT0nI3tuYW1lfSc+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0nc3VidGVzdF9wcm90b3R5cGUnIHRpdGxlPSdUaGlzIGlzIGEgYmFzaWMgdHlwZSBvZiBzdWJ0ZXN0LiAoZS5nLiBTdXJ2ZXksIEdyaWQsIExvY2F0aW9uLCBJZCwgQ29uc2VudCkuIFRoaXMgcHJvcGVydHkgaXMgc2V0IGluIGFzc2Vzc21lbnQgYnVpbGRlciB3aGVuIHlvdSBhZGQgYSBzdWJ0ZXN0LiBJdCBpcyB1bmNoYW5nZWFibGUuJz5Qcm90b3R5cGU8L2xhYmVsPjxicj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdpbmZvX2JveCc+I3twcm90b3R5cGV9PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0nbGFuZ3VhZ2UnPkxhbmd1YWdlIGNvZGU8L2xhYmVsPlxuICAgICAgICAgIDxpbnB1dCBpZD0nbGFuZ3VhZ2UnIHZhbHVlPScje2xhbmd1YWdlfSc+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICA8bGFiZWw+U2tpcHBhYmxlPC9sYWJlbD48YnI+XG4gICAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgICAgPGRpdiBpZD0nc2tpcF9yYWRpbycgY2xhc3M9J2J1dHRvbnNldCc+XG4gICAgICAgICAgICAgIDxsYWJlbCBmb3I9J3NraXBfdHJ1ZSc+WWVzPC9sYWJlbD48aW5wdXQgbmFtZT0nc2tpcHBhYmxlJyB0eXBlPSdyYWRpbycgdmFsdWU9J3RydWUnIGlkPSdza2lwX3RydWUnICN7J2NoZWNrZWQnIGlmIHNraXBwYWJsZX0+XG4gICAgICAgICAgICAgIDxsYWJlbCBmb3I9J3NraXBfZmFsc2UnPk5vPC9sYWJlbD48aW5wdXQgbmFtZT0nc2tpcHBhYmxlJyB0eXBlPSdyYWRpbycgdmFsdWU9J2ZhbHNlJyBpZD0nc2tpcF9mYWxzZScgI3snY2hlY2tlZCcgaWYgbm90IHNraXBwYWJsZX0+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgI3tydGxFZGl0SHRtbHx8Jyd9XG5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgIDxsYWJlbD5EaXNwbGF5IEJhY2sgYnV0dG9uPC9sYWJlbD48YnI+XG4gICAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgICAgPGRpdiBpZD0nYmFja19idXR0b25fcmFkaW8nIGNsYXNzPSdidXR0b25zZXQnPlxuICAgICAgICAgICAgICA8bGFiZWwgZm9yPSdiYWNrX2J1dHRvbl90cnVlJz5ZZXM8L2xhYmVsPjxpbnB1dCBuYW1lPSdiYWNrX2J1dHRvbicgdHlwZT0ncmFkaW8nIHZhbHVlPSd0cnVlJyBpZD0nYmFja19idXR0b25fdHJ1ZScgI3snY2hlY2tlZCcgaWYgYmFja0J1dHRvbn0+XG4gICAgICAgICAgICAgIDxsYWJlbCBmb3I9J2JhY2tfYnV0dG9uX2ZhbHNlJz5ObzwvbGFiZWw+PGlucHV0IG5hbWU9J2JhY2tfYnV0dG9uJyB0eXBlPSdyYWRpbycgdmFsdWU9J2ZhbHNlJyBpZD0nYmFja19idXR0b25fZmFsc2UnICN7J2NoZWNrZWQnIGlmIG5vdCBiYWNrQnV0dG9ufT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnIGRhdGEtcmljaHRleHRLZXk9J2VudW1lcmF0b3InPlxuICAgICAgICAgIDxsYWJlbCBmb3I9J2VudW1lcmF0b3JfdGV4dGFyZWEnIHRpdGxlPSdJZiB0ZXh0IGlzIHN1cHBsaWVkLCBhIGhlbHAgYnV0dG9uIHdpbGwgYXBwZWFyIGF0IHRoZSB0b3Agb2YgdGhlIHN1YnRlc3QgYXMgYSByZWZlcmVuY2UgZm9yIHRoZSBlbnVtZXJhdG9yLiBJZiB5b3UgYXJlIHBhc3RpbmcgZnJvbSB3b3JkIGl0IGlzIHJlY29tbWVuZGVkIHRvIHBhc3RlIGludG8gYSBwbGFpbiB0ZXh0IGVkaXRvciBmaXJzdCwgYW5kIHRoZW4gaW50byB0aGlzIGJveC4nPkVudW1lcmF0b3IgaGVscCA8YnV0dG9uIGNsYXNzPSdyaWNodGV4dF9lZGl0IGNvbW1hbmQnPkVkaXQ8L2J1dHRvbj48L2xhYmVsPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J2luZm9fYm94X3dpZGUgZW51bWVyYXRvcl9wcmV2aWV3Jz4je2VudW1tZXJhdG9yfTwvZGl2PlxuICAgICAgICAgIDx0ZXh0YXJlYSBpZD0nZW51bWVyYXRvcl90ZXh0YXJlYScgY2xhc3M9J2NvbmZpcm1hdGlvbic+I3tlbnVtbWVyYXRvcn08L3RleHRhcmVhPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J2VudW1lcmF0b3JfYnV0dG9ucyBjb25maXJtYXRpb24nPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0ncmljaHRleHRfc2F2ZSBjb21tYW5kJz5TYXZlPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdyaWNodGV4dF9jYW5jZWwgY29tbWFuZCc+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZScgZGF0YS1yaWNodGV4dEtleT0nZGlhbG9nJz5cbiAgICAgICAgICA8bGFiZWwgZm9yPSdkaWFsb2dfdGV4dGFyZWEnIHRpdGxlPSdHZW5lcmFsbHkgdGhpcyBpcyBhIHNjcmlwdCB0aGF0IHdpbGwgYmUgcmVhZCB0byB0aGUgc3R1ZGVudC4gSWYgeW91IGFyZSBwYXN0aW5nIGZyb20gd29yZCBpdCBpcyByZWNvbW1lbmRlZCB0byBwYXN0ZSBpbnRvIGEgcGxhaW4gdGV4dCBlZGl0b3IgZmlyc3QsIGFuZCB0aGVuIGludG8gdGhpcyBib3guJz5TdHVkZW50IERpYWxvZyA8YnV0dG9uIGNsYXNzPSdyaWNodGV4dF9lZGl0IGNvbW1hbmQnPkVkaXQ8L2J1dHRvbj48L2xhYmVsPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J2luZm9fYm94X3dpZGUgZGlhbG9nX3ByZXZpZXcnPiN7ZGlhbG9nfTwvZGl2PlxuICAgICAgICAgIDx0ZXh0YXJlYSBpZD0nZGlhbG9nX3RleHRhcmVhJyBjbGFzcz0nY29uZmlybWF0aW9uJz4je2RpYWxvZ308L3RleHRhcmVhPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J2RpYWxvZ19idXR0b25zIGNvbmZpcm1hdGlvbic+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdyaWNodGV4dF9zYXZlIGNvbW1hbmQnPlNhdmU8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J3JpY2h0ZXh0X2NhbmNlbCBjb21tYW5kJz5DYW5jZWw8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJyBkYXRhLXJpY2h0ZXh0S2V5PSd0cmFuc2l0aW9uJz5cbiAgICAgICAgICA8bGFiZWwgZm9yPSd0cmFuc2l0aW9uX3Rlc3RhcmVhJyB0aXRsZT0nVGhpcyB3aWxsIGJlIGRpc3BsYXllZCB3aXRoIGEgZ3JleSBiYWNrZ3JvdW5kIGFib3ZlIHRoZSBuZXh0IGJ1dHRvbiwgc2ltaWxhciB0byB0aGUgc3R1ZGVudCBkaWFsb2cgdGV4dC4gSWYgeW91IGFyZSBwYXN0aW5nIGZyb20gV29yZCBpdCBpcyByZWNvbW1lbmRlZCB0byBwYXN0ZSBpbnRvIGEgcGxhaW4gdGV4dCBlZGl0b3IgZmlyc3QsIGFuZCB0aGVuIGludG8gdGhpcyBib3guJz5UcmFuc2l0aW9uIENvbW1lbnQgPGJ1dHRvbiBjbGFzcz0ncmljaHRleHRfZWRpdCBjb21tYW5kJz5FZGl0PC9idXR0b24+PC9sYWJlbD5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdpbmZvX2JveF93aWRlIHRyYW5zaXRpb25fcHJldmlldyc+I3t0cmFuc2l0aW9ufTwvZGl2PlxuICAgICAgICAgIDx0ZXh0YXJlYSBpZD0ndHJhbnNpdGlvbl90ZXh0YXJlYScgY2xhc3M9J2NvbmZpcm1hdGlvbic+I3t0cmFuc2l0aW9ufTwvdGV4dGFyZWE+XG4gICAgICAgICAgPGRpdiBjbGFzcz0ndHJhbnNpdGlvbl9idXR0b25zIGNvbmZpcm1hdGlvbic+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdyaWNodGV4dF9zYXZlIGNvbW1hbmQnPlNhdmU8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J3JpY2h0ZXh0X2NhbmNlbCBjb21tYW5kJz5DYW5jZWw8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICA8bGFiZWwgZm9yPSdmb250X2ZhbWlseScgdGl0bGU9J1BsZWFzZSBiZSBhd2FyZSB0aGF0IHdoYXRldmVyIGZvbnQgaXMgc3BlY2lmaWVkLCBtdXN0IGJlIGF2YWlsYWJsZSBvbiB0aGUgdXNlcmBzIHN5c3RlbS4gV2hlbiBtdWx0aXBsZSBmb250cyBhcmUgZW50ZXJlZCBzZXBhcmF0ZWQgYnkgY29tbWFzLCB0aGV5IGFyZSByYW5rZWQgaW4gb3JkZXIgb2YgcHJlZmVyZW5jZSBmcm9tIGxlZnQgdG8gcmlnaHQuIEZvbnQgbmFtZXMgd2l0aCBzcGFjZXMgbXVzdCBiZSB3cmFwcGVkIGluIGRvdWJsZSBxdW90ZXMuJz5QcmVmZXJyZWQgZm9udDwvbGFiZWw+XG4gICAgICAgICAgPGlucHV0IGlkPSdmb250X2ZhbWlseScgdmFsdWU9JyN7Zm9udEZhbWlseX0nPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgIDxsYWJlbCBmb3I9J2lucHV0LXNvdW5kJyB0aXRsZT0nU291bmQgdG8gYmUgcGxheWVkIHdoZW4gYSB1c2VyIGludGVyYWN0cyB3aXRoIHRoZSBhc3Nlc3NtZW50Lic+SW5wdXQgc291bmQ8L2xhYmVsPlxuICAgICAgICAgIDxkaXYgaWQ9J2lucHV0LXNvdW5kLWNvbnRhaW5lcic+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0nZGlzcGxheV9jb2RlJyB0aXRsZT0nVGhpcyBDb2ZmZWVTY3JpcHQgY29kZSB3aWxsIGJlIGV4ZWN1dGVkIHdoZW4gdGhpcyBxdWVzdGlvbiBpcyBzaG93bi4gVGhpcyBvcHRpb24gbWF5IG9ubHkgYmUgdXNlZCB3aGVuIEZvY3VzIE1vZGUgaXMgb24uJz5BY3Rpb24gb24gZGlzcGxheTwvbGFiZWw+XG4gICAgICAgICAgICA8dGV4dGFyZWEgaWQ9J2Rpc3BsYXlfY29kZSc+I3tkaXNwbGF5Q29kZX08L3RleHRhcmVhPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGlkPSdwcm90b3R5cGVfYXR0cmlidXRlcyc+PC9kaXY+XG5cbiAgICAgIDxidXR0b24gY2xhc3M9J3NhdmVfc3VidGVzdCBjb21tYW5kJz5Eb25lPC9idXR0b24+XG4gICAgICBcIlxuXG4gICAgQHByb3RvdHlwZUVkaXRvci5zZXRFbGVtZW50IEAkZWwuZmluZCgnI3Byb3RvdHlwZV9hdHRyaWJ1dGVzJylcbiAgICBAcHJvdG90eXBlRWRpdG9yLnJlbmRlcj8oKVxuICAgIEByZW5kZXJJbnB1dFNvdW5kKClcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4gIGFmdGVyUmVuZGVyOiAtPlxuICAgIEBwcm90b3R5cGVFZGl0b3I/LmFmdGVyUmVuZGVyPygpXG5cblxuICBvbkNsb3NlOiAtPlxuICAgIEBwcm90b3R5cGVFZGl0b3IuY2xvc2U/KClcblxuIl19
