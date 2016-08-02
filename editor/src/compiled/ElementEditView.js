var ElementEditView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ElementEditView = (function(superClass) {
  extend(ElementEditView, superClass);

  function ElementEditView() {
    this.save = bind(this.save, this);
    this.goBack = bind(this.goBack, this);
    return ElementEditView.__super__.constructor.apply(this, arguments);
  }

  ElementEditView.prototype.className = "element_edit";

  ElementEditView.prototype.events = {
    'click .back_button': 'goBack',
    'click .save_element': 'saveElement',
    'click .richtext_edit': 'richtextEdit',
    'click .richtext_save': 'richtextSave',
    'click .richtext_cancel': 'richtextCancel',
    'change #display_code': 'validateSyntax'
  };

  ElementEditView.prototype.richtextConfig = [
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

  ElementEditView.prototype.initialize = function(options) {
    this.activity = null;
    this.timer = 0;
    this.richtextKeys = _.pluck(this.richtextConfig, "key");
    this.model = options.model;
    this.assessment = options.assessment;
    this.elementViews = Tangerine.config.get("elementViews");
    console.log("@model.get 'element': " + this.model.get('element'));
    this.elementEditor = new window[this.elementViews[this.model.get('element')]['edit']]({
      model: this.model,
      parent: this
    });
    return this.elementEditor.on("question-edit", (function(_this) {
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

  ElementEditView.prototype.goBack = function() {
    return Tangerine.router.navigate("editLP/" + this.model.get("assessmentId"), true);
  };

  ElementEditView.prototype.validateSyntax = function(event) {
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

  ElementEditView.prototype.getRichtextConfig = function(event) {
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

  ElementEditView.prototype.richtextEdit = function(event) {
    var config;
    config = this.getRichtextConfig(event);
    this.$el.find("." + config.dataKey + "_preview, ." + config.dataKey + "_edit, ." + config.dataKey + "_buttons").fadeToggle(250);
    if (this.editor == null) {
      this.editor = {};
    }
    this.$el.find("textarea#" + config.dataKey + "_textarea").html(this.model.escape(config.attributeName) || "");
    return this.editor[config.dataKey] = CKEDITOR.replace(config.dataKey + "_textarea");
  };

  ElementEditView.prototype.richtextSave = function(event) {
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

  ElementEditView.prototype.richtextCancel = function(event) {
    var $preview, config;
    config = this.getRichtextConfig(event);
    $preview = $("div." + config.dataKey + "_preview");
    $preview.html(this.model.get(config.attributeName) || "");
    $preview.fadeIn(250);
    this.$el.find("button." + config.dataKey + "_edit, ." + config.dataKey + "_buttons").fadeToggle(250);
    return this.editor[config.dataKey].destroy();
  };

  ElementEditView.prototype.saveElement = function() {
    return this.save();
  };

  ElementEditView.prototype.save = function(options) {
    var base, element;
    if (options == null) {
      options = {};
    }
    if (this.activity !== null) {
      return false;
    }
    this.activity = "saving";
    options.elementSave = options.elementSave != null ? options.elementSave : true;
    element = this.model.get("element");
    this.model.set({
      name: this.$el.find("#element_name").val(),
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
    this.elementEditor.save(options);
    if (this.elementEditor.isValid() === false) {
      Utils.midAlert("There are errors on this page");
      if (typeof (base = this.elementEditor).showErrors === "function") {
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
            Utils.midAlert("Element Saved");
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

  ElementEditView.prototype.render = function() {
    var assessmentName, backButton, base, dialog, displayCode, element, enummerator, fontFamily, groupHandle, language, name, rtl, rtlEditHtml, skippable, transition;
    assessmentName = this.assessment.escape("lessonPlan_title");
    name = this.model.escape("name");
    element = this.model.get("element");
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
    this.$el.html("<h1>Element Editor</h1> <table class='basic_info'> <tr> <th>Group</th> <td>" + groupHandle + "</td> </tr> <tr> <th>Assessment</th> <td>" + assessmentName + "</td> </tr> </table> <button class='save_element command'>Done</button> <div id='element_edit_form' class='edit_form'> <div class='label_value'> <label for='element_name'>Name</label> <input id='element_name' value='" + name + "'> </div> <div class='label_value'> <label for='element_element' title='This is a basic type of element. (e.g. Survey, Grid, Location, Id, Consent). This property is set in assessment builder when you add a element. It is unchangeable.'>Element</label><br> <div class='info_box'>" + element + "</div> </div> " + (rtlEditHtml || '') + " </div> <div id='element_attributes'></div> <button class='save_element command'>Done</button>");
    this.elementEditor.setElement(this.$el.find('#element_attributes'));
    if (typeof (base = this.elementEditor).render === "function") {
      base.render();
    }
    return this.trigger("rendered");
  };

  ElementEditView.prototype.afterRender = function() {
    var ref;
    return (ref = this.elementEditor) != null ? typeof ref.afterRender === "function" ? ref.afterRender() : void 0 : void 0;
  };

  ElementEditView.prototype.onClose = function() {
    var base;
    return typeof (base = this.elementEditor).close === "function" ? base.close() : void 0;
  };

  return ElementEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVsZW1lbnQvRWxlbWVudEVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGVBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs7NEJBRUosU0FBQSxHQUFXOzs0QkFFWCxNQUFBLEdBQ0U7SUFBQSxvQkFBQSxFQUErQixRQUEvQjtJQUNBLHFCQUFBLEVBQStCLGFBRC9CO0lBR0Esc0JBQUEsRUFBNkIsY0FIN0I7SUFJQSxzQkFBQSxFQUE2QixjQUo3QjtJQUtBLHdCQUFBLEVBQTZCLGdCQUw3QjtJQU1BLHNCQUFBLEVBQXlCLGdCQU56Qjs7OzRCQVNGLGNBQUEsR0FBZ0I7SUFDWjtNQUFBLEtBQUEsRUFBa0IsWUFBbEI7TUFDQSxlQUFBLEVBQWtCLGdCQURsQjtLQURZLEVBSVo7TUFBQSxLQUFBLEVBQWtCLFFBQWxCO01BQ0EsZUFBQSxFQUFrQixlQURsQjtLQUpZLEVBT1o7TUFBQSxLQUFBLEVBQWtCLFlBQWxCO01BQ0EsZUFBQSxFQUFrQixtQkFEbEI7S0FQWTs7OzRCQVdoQixVQUFBLEdBQVksU0FBRSxPQUFGO0lBRVYsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUNaLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFFVCxJQUFDLENBQUEsWUFBRCxHQUFnQixDQUFDLENBQUMsS0FBRixDQUFRLElBQUMsQ0FBQSxjQUFULEVBQXlCLEtBQXpCO0lBRWhCLElBQUMsQ0FBQSxLQUFELEdBQWMsT0FBTyxDQUFDO0lBQ3RCLElBQUMsQ0FBQSxVQUFELEdBQWMsT0FBTyxDQUFDO0lBR3RCLElBQUMsQ0FBQSxZQUFELEdBQWlCLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBakIsQ0FBcUIsY0FBckI7SUFDakIsT0FBTyxDQUFDLEdBQVIsQ0FBWSx3QkFBQSxHQUEyQixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxTQUFYLENBQXZDO0lBQ0EsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxNQUFPLENBQUEsSUFBQyxDQUFBLFlBQWEsQ0FB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VixDQUExQjs7VUFDYyxDQUFDOztXQUVmLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQW5ETTs7NEJBcURSLFdBQUEsR0FBYSxTQUFBO0FBQ1gsUUFBQTsyRkFBYyxDQUFFO0VBREw7OzRCQUliLE9BQUEsR0FBUyxTQUFBO0FBQ1AsUUFBQTt5RUFBYyxDQUFDO0VBRFI7Ozs7R0FuT21CLFFBQVEsQ0FBQyIsImZpbGUiOiJlbGVtZW50L0VsZW1lbnRFZGl0Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEVsZW1lbnRFZGl0VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiZWxlbWVudF9lZGl0XCJcblxuICBldmVudHM6XG4gICAgJ2NsaWNrIC5iYWNrX2J1dHRvbicgICAgICAgICA6ICdnb0JhY2snXG4gICAgJ2NsaWNrIC5zYXZlX2VsZW1lbnQnICAgICAgICA6ICdzYXZlRWxlbWVudCdcblxuICAgICdjbGljayAucmljaHRleHRfZWRpdCcgICAgIDogJ3JpY2h0ZXh0RWRpdCdcbiAgICAnY2xpY2sgLnJpY2h0ZXh0X3NhdmUnICAgICA6ICdyaWNodGV4dFNhdmUnXG4gICAgJ2NsaWNrIC5yaWNodGV4dF9jYW5jZWwnICAgOiAncmljaHRleHRDYW5jZWwnXG4gICAgJ2NoYW5nZSAjZGlzcGxheV9jb2RlJyA6ICd2YWxpZGF0ZVN5bnRheCdcblxuXG4gIHJpY2h0ZXh0Q29uZmlnOiBbXG4gICAgICBcImtleVwiICAgICAgICAgICA6IFwiZW51bWVyYXRvclwiXG4gICAgICBcImF0dHJpYnV0ZU5hbWVcIiA6IFwiZW51bWVyYXRvckhlbHBcIlxuICAgICxcbiAgICAgIFwia2V5XCIgICAgICAgICAgIDogXCJkaWFsb2dcIlxuICAgICAgXCJhdHRyaWJ1dGVOYW1lXCIgOiBcInN0dWRlbnREaWFsb2dcIlxuICAgICxcbiAgICAgIFwia2V5XCIgICAgICAgICAgIDogXCJ0cmFuc2l0aW9uXCJcbiAgICAgIFwiYXR0cmlidXRlTmFtZVwiIDogXCJ0cmFuc2l0aW9uQ29tbWVudFwiXG4gIF1cblxuICBpbml0aWFsaXplOiAoIG9wdGlvbnMgKSAtPlxuXG4gICAgQGFjdGl2aXR5ID0gbnVsbFxuICAgIEB0aW1lciA9IDBcbiAgICBcbiAgICBAcmljaHRleHRLZXlzID0gXy5wbHVjayhAcmljaHRleHRDb25maWcsIFwia2V5XCIpXG5cbiAgICBAbW9kZWwgICAgICA9IG9wdGlvbnMubW9kZWxcbiAgICBAYXNzZXNzbWVudCA9IG9wdGlvbnMuYXNzZXNzbWVudFxuIyAgICBAY29uZmlnICAgICA9IFRhbmdlcmluZS5jb25maWcuZWxlbWVudFxuXG4gICAgQGVsZW1lbnRWaWV3cyAgPSBUYW5nZXJpbmUuY29uZmlnLmdldCBcImVsZW1lbnRWaWV3c1wiXG4gICAgY29uc29sZS5sb2coXCJAbW9kZWwuZ2V0ICdlbGVtZW50JzogXCIgKyBAbW9kZWwuZ2V0ICdlbGVtZW50JylcbiAgICBAZWxlbWVudEVkaXRvciA9IG5ldyB3aW5kb3dbQGVsZW1lbnRWaWV3c1tAbW9kZWwuZ2V0ICdlbGVtZW50J11bJ2VkaXQnXV1cbiAgICAgIG1vZGVsOiBAbW9kZWxcbiAgICAgIHBhcmVudDogQFxuXG4gICAgQGVsZW1lbnRFZGl0b3Iub24gXCJxdWVzdGlvbi1lZGl0XCIsIChxdWVzdGlvbklkKSA9PlxuICAgICAgQHNhdmVcbiAgICAgICAgcXVlc3Rpb25TYXZlICA6IGZhbHNlXG4gICAgICAgIHN1Y2Nlc3MgICAgICAgOiAtPiBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwicXVlc3Rpb24vI3txdWVzdGlvbklkfVwiLCB0cnVlXG5cbiAgZ29CYWNrOiA9PlxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJlZGl0TFAvXCIgKyBAbW9kZWwuZ2V0KFwiYXNzZXNzbWVudElkXCIpLCB0cnVlXG5cblxuICB2YWxpZGF0ZVN5bnRheDogKGV2ZW50KSAtPlxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICBjb2RlID0gJHRhcmdldC52YWwoKVxuICAgIGlmIG5vdCBfLmlzRW1wdHkoY29kZSlcbiAgICAgIHRyeVxuICAgICAgICBvbGRBbnN3ZXIgPSBAYW5zd2VyXG4gICAgICAgIEBhbnN3ZXIgPSB7fVxuICAgICAgICBAaXNWYWxpZCA9IENvZmZlZVNjcmlwdC5jb21waWxlLmFwcGx5KEAsIFtjb2RlXSlcbiAgICAgICAgaWYgb2xkQW5zd2VyPyB0aGVuIEBhbnN3ZXIgPSBvbGRBbnN3ZXIgZWxzZSBkZWxldGUgdGhpc1tcImFuc3dlclwiXVxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgbmFtZSA9ICgoL2Z1bmN0aW9uICguezEsfSlcXCgvKS5leGVjKGVycm9yLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkpWzFdKVxuICAgICAgICB3aGVyZSA9ICR0YXJnZXQuYXR0cignaWQnKS5odW1hbml6ZSgpXG4gICAgICAgIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlXG4gICAgICAgIGFsZXJ0IFwiRXJyb3IgaW4gI3t3aGVyZX1cXG5cXG4je25hbWV9XFxuXFxuI3ttZXNzYWdlfVwiXG5cbiAgZ2V0UmljaHRleHRDb25maWc6IChldmVudCkgLT5cblxuICAgIGlmIF8uaXNTdHJpbmcgZXZlbnRcbiAgICAgIGRhdGFLZXkgPSBldmVudFxuICAgIGVsc2VcbiAgICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICAgIGRhdGFLZXkgPSAkdGFyZ2V0LnBhcmVudCgpLmF0dHIoXCJkYXRhLXJpY2h0ZXh0S2V5XCIpIHx8ICR0YXJnZXQucGFyZW50KCkucGFyZW50KCkuYXR0cihcImRhdGEtcmljaHRleHRLZXlcIilcblxuICAgIGF0dHJpYnV0ZU5hbWUgPSBfLndoZXJlKEByaWNodGV4dENvbmZpZywgXCJrZXlcIjpkYXRhS2V5KVswXS5hdHRyaWJ1dGVOYW1lXG5cbiAgICByZXR1cm4ge1xuICAgICAgXCJkYXRhS2V5XCIgICAgICAgOiBkYXRhS2V5XG4gICAgICBcImF0dHJpYnV0ZU5hbWVcIiA6IGF0dHJpYnV0ZU5hbWVcbiAgICB9XG5cblxuICByaWNodGV4dEVkaXQ6IChldmVudCkgLT5cblxuICAgIGNvbmZpZyA9IEBnZXRSaWNodGV4dENvbmZpZyBldmVudFxuXG4gICAgQCRlbC5maW5kKFwiLiN7Y29uZmlnLmRhdGFLZXl9X3ByZXZpZXcsIC4je2NvbmZpZy5kYXRhS2V5fV9lZGl0LCAuI3tjb25maWcuZGF0YUtleX1fYnV0dG9uc1wiKS5mYWRlVG9nZ2xlKDI1MClcbiAgICBcbiAgICBAZWRpdG9yID0ge30gaWYgbm90IEBlZGl0b3I/XG4gICAgQCRlbC5maW5kKFwidGV4dGFyZWEjI3tjb25maWcuZGF0YUtleX1fdGV4dGFyZWFcIikuaHRtbChAbW9kZWwuZXNjYXBlKGNvbmZpZy5hdHRyaWJ1dGVOYW1lKSB8fCBcIlwiKVxuICAgIEBlZGl0b3JbY29uZmlnLmRhdGFLZXldID0gQ0tFRElUT1IucmVwbGFjZShcIiN7Y29uZmlnLmRhdGFLZXl9X3RleHRhcmVhXCIpXG5cbiAgcmljaHRleHRTYXZlOiAoZXZlbnQpIC0+XG5cbiAgICBjb25maWcgPSBAZ2V0UmljaHRleHRDb25maWcgZXZlbnRcbiAgICBuZXdBdHRyaWJ1dGVzID0ge31cbiAgICBuZXdBdHRyaWJ1dGVzW2NvbmZpZy5hdHRyaWJ1dGVOYW1lXSA9IEBlZGl0b3JbY29uZmlnLmRhdGFLZXldLmdldERhdGEoKVxuXG4gICAgQG1vZGVsLnNhdmUgbmV3QXR0cmlidXRlcywgXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBAcmljaHRleHRDYW5jZWwoY29uZmlnLmRhdGFLZXkpXG4gICAgICBlcnJvcjogPT5cbiAgICAgICAgYWxlcnQgXCJTYXZlIGVycm9yLiBQbGVhc2UgdHJ5IGFnYWluLlwiXG5cbiAgcmljaHRleHRDYW5jZWw6IChldmVudCkgLT5cblxuICAgIGNvbmZpZyA9IEBnZXRSaWNodGV4dENvbmZpZyBldmVudFxuXG4gICAgJHByZXZpZXcgPSAkKFwiZGl2LiN7Y29uZmlnLmRhdGFLZXl9X3ByZXZpZXdcIilcbiAgICAkcHJldmlldy5odG1sIEBtb2RlbC5nZXQoY29uZmlnLmF0dHJpYnV0ZU5hbWUpIHx8IFwiXCJcbiAgICAkcHJldmlldy5mYWRlSW4oMjUwKVxuICAgIEAkZWwuZmluZChcImJ1dHRvbi4je2NvbmZpZy5kYXRhS2V5fV9lZGl0LCAuI3tjb25maWcuZGF0YUtleX1fYnV0dG9uc1wiKS5mYWRlVG9nZ2xlKDI1MClcbiAgICBAZWRpdG9yW2NvbmZpZy5kYXRhS2V5XS5kZXN0cm95KClcblxuICBzYXZlRWxlbWVudDogLT4gQHNhdmUoKVxuXG4gIHNhdmU6ICggb3B0aW9ucz17fSApID0+XG5cbiAgICByZXR1cm4gZmFsc2UgdW5sZXNzIEBhY3Rpdml0eSA9PSBudWxsXG4gICAgQGFjdGl2aXR5ID0gXCJzYXZpbmdcIlxuXG4gICAgIyBieSBkZWZhdWx0IHNhdmUgZWxlbWVudCBhcyB3ZWxsXG4gICAgb3B0aW9ucy5lbGVtZW50U2F2ZSA9IGlmIG9wdGlvbnMuZWxlbWVudFNhdmU/IHRoZW4gb3B0aW9ucy5lbGVtZW50U2F2ZSBlbHNlIHRydWVcblxuICAgIGVsZW1lbnQgPSBAbW9kZWwuZ2V0KFwiZWxlbWVudFwiKVxuXG4gICAgQG1vZGVsLnNldFxuICAgICAgbmFtZSAgICAgICAgICAgICAgOiBAJGVsLmZpbmQoXCIjZWxlbWVudF9uYW1lXCIpLnZhbCgpXG4gICAgICBlbnVtZXJhdG9ySGVscCAgICA6IEAkZWwuZmluZChcIiNlbnVtZXJhdG9yX2hlbHBcIikudmFsKClcbiAgICAgIHN0dWRlbnREaWFsb2cgICAgIDogQCRlbC5maW5kKFwiI3N0dWRlbnRfZGlhbG9nXCIpLnZhbCgpXG4gICAgICB0cmFuc2l0aW9uQ29tbWVudCA6IEAkZWwuZmluZChcIiN0cmFuc2l0aW9uX2NvbW1lbnRcIikudmFsKClcbiAgICAgIHNraXBwYWJsZSAgICAgICAgIDogQCRlbC5maW5kKFwiI3NraXBfcmFkaW8gaW5wdXQ6cmFkaW9bbmFtZT1za2lwcGFibGVdOmNoZWNrZWRcIikudmFsKCkgPT0gXCJ0cnVlXCJcbiAgICAgIHJ0bCAgICAgICAgICAgICAgIDogQCRlbC5maW5kKFwiI3J0bF9yYWRpbyBpbnB1dDpyYWRpb1tuYW1lPXJ0bF06Y2hlY2tlZFwiKS52YWwoKSA9PSBcInRydWVcIlxuICAgICAgYmFja0J1dHRvbiAgICAgICAgOiBAJGVsLmZpbmQoXCIjYmFja19idXR0b25fcmFkaW8gaW5wdXQ6cmFkaW9bbmFtZT1iYWNrX2J1dHRvbl06Y2hlY2tlZFwiKS52YWwoKSA9PSBcInRydWVcIlxuXG4gICAgICBlbnVtZXJhdG9ySGVscCAgICA6IEAkZWwuZmluZChcIiNlbnVtZXJhdG9yX3RleHRhcmVhXCIpLnZhbCgpXG4gICAgICBzdHVkZW50RGlhbG9nICAgICA6IEAkZWwuZmluZChcIiNkaWFsb2dfdGV4dGFyZWFcIikudmFsKClcbiAgICAgIHRyYW5zaXRpb25Db21tZW50IDogQCRlbC5maW5kKFwiI3RyYW5zaXRpb25fdGV4dGFyZWFcIikudmFsKClcblxuICAgICAgbGFuZ3VhZ2UgOiBAJGVsLmZpbmQoXCIjbGFuZ3VhZ2VcIikudmFsKClcblxuXG4gICAgICBkaXNwbGF5Q29kZSA6IEAkZWwuZmluZChcIiNkaXNwbGF5X2NvZGVcIikudmFsKClcblxuICAgICAgZm9udEZhbWlseSA6IEAkZWwuZmluZChcIiNmb250X2ZhbWlseVwiKS52YWwoKVxuXG4gICAgIyBpbXBvcnRhbnQgbm90IHRvIGxldCBlbGVtZW50cyB1c2Ugc3VjY2VzcyBvciBlcnJvclxuICAgIEBlbGVtZW50RWRpdG9yLnNhdmUob3B0aW9ucylcblxuICAgICMgb25seSBjYXJlIGFib3V0IGVycm9ycyBpZiBpdCdzIG5vdCBhbiBcIm9uIGVkaXRcIiBzYXZlXG4gICAgaWYgQGVsZW1lbnRFZGl0b3IuaXNWYWxpZCgpID09IGZhbHNlXG4gICAgICBVdGlscy5taWRBbGVydCBcIlRoZXJlIGFyZSBlcnJvcnMgb24gdGhpcyBwYWdlXCJcbiAgICAgIEBlbGVtZW50RWRpdG9yLnNob3dFcnJvcnM/KClcbiAgICAgIEBhY3Rpdml0eSA9IG51bGxcbiAgICBlbHNlXG4gICAgICBAbW9kZWwuc2F2ZSBudWxsLFxuICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgIEBhY3Rpdml0eSA9IG51bGxcbiAgICAgICAgICAjIHByZWZlciB0aGUgc3VjY2VzcyBjYWxsYmFja1xuICAgICAgICAgIHJldHVybiBvcHRpb25zLnN1Y2Nlc3MoKSBpZiBvcHRpb25zLnN1Y2Nlc3NcbiAgICAgICAgICBVdGlscy5taWRBbGVydCBcIkVsZW1lbnQgU2F2ZWRcIlxuICAgICAgICAgIGNsZWFyVGltZW91dCBAdGltZXJcbiAgICAgICAgICBAdGltZXIgPSBzZXRUaW1lb3V0IEBnb0JhY2ssIDEwMDBcblxuICAgICAgICBlcnJvcjogPT5cbiAgICAgICAgICBAYWN0aXZpdHkgPSBudWxsXG4gICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZXJyb3IoKSBpZiBvcHRpb25zLmVycm9yP1xuICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiU2F2ZSBlcnJvclwiXG5cblxuICByZW5kZXI6IC0+XG4gICAgYXNzZXNzbWVudE5hbWUgPSBAYXNzZXNzbWVudC5lc2NhcGUgXCJsZXNzb25QbGFuX3RpdGxlXCJcbiAgICBuYW1lICAgICAgICA9IEBtb2RlbC5lc2NhcGUgXCJuYW1lXCJcbiAgICBlbGVtZW50ICAgPSBAbW9kZWwuZ2V0IFwiZWxlbWVudFwiXG4gICAgZW51bW1lcmF0b3IgPSBAbW9kZWwuZ2V0U3RyaW5nKFwiZW51bWVyYXRvckhlbHBcIilcbiAgICBkaWFsb2cgICAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJzdHVkZW50RGlhbG9nXCIpXG4gICAgdHJhbnNpdGlvbiAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwidHJhbnNpdGlvbkNvbW1lbnRcIilcbiAgICBza2lwcGFibGUgICA9IEBtb2RlbC5nZXRCb29sZWFuKFwic2tpcHBhYmxlXCIpXG4gICAgcnRsICAgICAgICAgPSBAbW9kZWwuZ2V0Qm9vbGVhbihcInJ0bFwiKVxuICAgIGJhY2tCdXR0b24gID0gQG1vZGVsLmdldEJvb2xlYW4oXCJiYWNrQnV0dG9uXCIpXG4gICAgZm9udEZhbWlseSAgPSBAbW9kZWwuZ2V0RXNjYXBlZFN0cmluZyhcImZvbnRGYW1pbHlcIilcbiAgICBkaXNwbGF5Q29kZSA9IEBtb2RlbC5nZXRTdHJpbmcoXCJkaXNwbGF5Q29kZVwiKVxuICAgIGxhbmd1YWdlICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxhbmd1YWdlXCIpXG4gICAgZ3JvdXBIYW5kbGUgPSBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0RXNjYXBlZFN0cmluZyhcImdyb3VwSGFuZGxlXCIpXG5cbiAgICBydGxFZGl0SHRtbCA9IFwiXCJcblxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGgxPkVsZW1lbnQgRWRpdG9yPC9oMT5cbiAgICAgIDx0YWJsZSBjbGFzcz0nYmFzaWNfaW5mbyc+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+R3JvdXA8L3RoPlxuICAgICAgICAgIDx0ZD4je2dyb3VwSGFuZGxlfTwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+QXNzZXNzbWVudDwvdGg+XG4gICAgICAgICAgPHRkPiN7YXNzZXNzbWVudE5hbWV9PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgIDwvdGFibGU+XG4gICAgICA8YnV0dG9uIGNsYXNzPSdzYXZlX2VsZW1lbnQgY29tbWFuZCc+RG9uZTwvYnV0dG9uPlxuICAgICAgPGRpdiBpZD0nZWxlbWVudF9lZGl0X2Zvcm0nIGNsYXNzPSdlZGl0X2Zvcm0nPlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0nZWxlbWVudF9uYW1lJz5OYW1lPC9sYWJlbD5cbiAgICAgICAgICA8aW5wdXQgaWQ9J2VsZW1lbnRfbmFtZScgdmFsdWU9JyN7bmFtZX0nPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgIDxsYWJlbCBmb3I9J2VsZW1lbnRfZWxlbWVudCcgdGl0bGU9J1RoaXMgaXMgYSBiYXNpYyB0eXBlIG9mIGVsZW1lbnQuIChlLmcuIFN1cnZleSwgR3JpZCwgTG9jYXRpb24sIElkLCBDb25zZW50KS4gVGhpcyBwcm9wZXJ0eSBpcyBzZXQgaW4gYXNzZXNzbWVudCBidWlsZGVyIHdoZW4geW91IGFkZCBhIGVsZW1lbnQuIEl0IGlzIHVuY2hhbmdlYWJsZS4nPkVsZW1lbnQ8L2xhYmVsPjxicj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdpbmZvX2JveCc+I3tlbGVtZW50fTwvZGl2PlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICAje3J0bEVkaXRIdG1sfHwnJ31cblxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGlkPSdlbGVtZW50X2F0dHJpYnV0ZXMnPjwvZGl2PlxuXG4gICAgICA8YnV0dG9uIGNsYXNzPSdzYXZlX2VsZW1lbnQgY29tbWFuZCc+RG9uZTwvYnV0dG9uPlxuICAgICAgXCJcblxuICAgIEBlbGVtZW50RWRpdG9yLnNldEVsZW1lbnQgQCRlbC5maW5kKCcjZWxlbWVudF9hdHRyaWJ1dGVzJylcbiAgICBAZWxlbWVudEVkaXRvci5yZW5kZXI/KClcbiAgICBcbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICBhZnRlclJlbmRlcjogLT5cbiAgICBAZWxlbWVudEVkaXRvcj8uYWZ0ZXJSZW5kZXI/KClcblxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgQGVsZW1lbnRFZGl0b3IuY2xvc2U/KClcblxuIl19
