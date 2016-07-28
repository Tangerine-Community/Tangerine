var LessonPlanEditView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LessonPlanEditView = (function(superClass) {
  extend(LessonPlanEditView, superClass);

  function LessonPlanEditView() {
    this.updateSubtestLegend = bind(this.updateSubtestLegend, this);
    this.render = bind(this.render, this);
    this.saveNewSubtest = bind(this.saveNewSubtest, this);
    this.updateModel = bind(this.updateModel, this);
    this.save = bind(this.save, this);
    return LessonPlanEditView.__super__.constructor.apply(this, arguments);
  }

  LessonPlanEditView.prototype.className = 'lessonPlan_edit_view';

  LessonPlanEditView.prototype.events = {
    'click #archive_buttons input': 'save',
    'click .back': 'goBack',
    'click .new_subtest_button': 'toggleNewSubtestForm',
    'click .new_subtest_cancel': 'toggleNewSubtestForm',
    'keypress #new_subtest_name': 'saveNewSubtest',
    'click .new_subtest_save': 'saveNewSubtest',
    'change #basic input': 'save',
    'click .save': 'save'
  };

  LessonPlanEditView.prototype.initialize = function(options) {
    this.model = options.model;
    this.subtestListEditView = new SubtestListEditView({
      "lessonPlan": this.model,
      "assessment": this.model
    });
    this.model.subtests.on("change remove", this.subtestListEditView.render);
    return this.model.subtests.on("all", this.updateSubtestLegend);
  };

  LessonPlanEditView.prototype.save = function() {
    if (this.updateModel()) {
      return this.model.save(null, {
        success: (function(_this) {
          return function() {
            return Utils.midAlert((_this.model.get("name")) + " saved");
          };
        })(this),
        error: (function(_this) {
          return function() {
            return Utils.midAlert("LessonPlan save error. Please try again.");
          };
        })(this)
      });
    }
  };

  LessonPlanEditView.prototype.goBack = function() {
    return Tangerine.router.navigate("assessments", true);
  };

  LessonPlanEditView.prototype.updateModel = function() {
    var doublesError, element, emptyError, i, j, k, l, len, len1, rangeError, sequence, sequenceErrors, sequences, sequencesValue, subtestCount, tooFewError, tooManyError, validatedSequences;
    subtestCount = this.model.subtests.models.length;
    sequencesValue = this.$el.find("#sequences").val().replace(/[^0-9,\n]/g, "");
    sequences = sequencesValue.split("\n");
    for (i = k = 0, len = sequences.length; k < len; i = ++k) {
      sequence = sequences[i];
      sequence = sequence.split(",");
      for (j = l = 0, len1 = sequence.length; l < len1; j = ++l) {
        element = sequence[j];
        sequence[j] = parseInt(element);
        if (sequence[j] < 0 || sequence[j] >= subtestCount) {
          rangeError = true;
        }
        if (isNaN(sequence[j])) {
          emptyError = true;
        }
      }
      sequences[i] = sequence;
      if (sequence.length > subtestCount) {
        tooManyError = true;
      }
      if (sequence.length < subtestCount) {
        tooFewError = true;
      }
      if (sequence.length !== _.uniq(sequence).length) {
        doublesError = true;
      }
    }
    if (!_.isEmpty(_.reject(_.flatten(sequences), function(e) {
      return isNaN(e);
    }))) {
      sequenceErrors = [];
      if (emptyError) {
        sequenceErrors.push("Some sequences contain empty values.");
      }
      if (rangeError) {
        sequenceErrors.push("Some numbers do not reference a subtest from the legend.");
      }
      if (tooManyError) {
        sequenceErrors.push("Some sequences are longer than the total number of all subtests.");
      }
      if (tooFewError) {
        sequenceErrors.push("Some sequences are shorter than the total number of all subtests.");
      }
      if (doublesError) {
        sequenceErrors.push("Some sequences contain doubles.");
      }
      if (sequenceErrors.length === 0) {
        validatedSequences = ((function() {
          var len2, m, results;
          results = [];
          for (m = 0, len2 = sequences.length; m < len2; m++) {
            sequence = sequences[m];
            results.push(sequence.join(", "));
          }
          return results;
        })()).join("\n");
        this.$el.find("#sequences").val(validatedSequences);
      } else {
        alert("Warning\n\n" + (sequenceErrors.join("\n")));
      }
    } else {
      this.$el.find("#sequences").val("");
    }
    this.model.set({
      sequences: sequences,
      archived: this.$el.find("#archive_buttons input:checked").val() === "true",
      name: this.$el.find("#lessonPlan_name").val(),
      dKey: this.$el.find("#lessonPlan_d_key").val(),
      lessonPlan_title: this.$el.find("#lessonPlan_title").val(),
      lessonPlan_lesson_text: this.$el.find("#lessonPlan_lesson_text").val(),
      lessonPlan_subject: this.$el.find("#lessonPlan_subject").val(),
      lessonPlan_grade: this.$el.find("#lessonPlan_grade").val(),
      lessonPlan_week: this.$el.find("#lessonPlan_week").val(),
      lessonPlan_day: this.$el.find("#lessonPlan_day").val(),
      lessonPlanId: this.model.id
    });
    return true;
  };

  LessonPlanEditView.prototype.toggleNewSubtestForm = function(event) {
    this.$el.find(".new_subtest_form, .new_subtest_button").toggle();
    this.$el.find("#new_subtest_name").val("");
    this.$el.find("#subtest_type_select").val("none");
    return false;
  };

  LessonPlanEditView.prototype.saveNewSubtest = function(event) {
    var newAttributes, newSubtest, prototypeTemplate, useType, useTypeTemplate;
    if (event.type !== "click" && event.which !== 13) {
      return true;
    }
    if (this.$el.find("#subtest_type_select option:selected").val() === "none") {
      Utils.midAlert("Please select a subtest type");
      return false;
    }
    newAttributes = Tangerine.templates.get("subtest");
    prototypeTemplate = Tangerine.templates.get("prototypes")[this.$el.find("#subtest_type_select").val()];
    useType = this.$el.find("#subtest_type_select :selected").attr('data-template');
    useTypeTemplate = Tangerine.templates.get("subtestTemplates")[this.$el.find("#subtest_type_select").val()][useType];
    newAttributes = $.extend(newAttributes, prototypeTemplate);
    newAttributes = $.extend(newAttributes, useTypeTemplate);
    newAttributes = $.extend(newAttributes, {
      name: this.$el.find("#new_subtest_name").val(),
      lessonPlanId: this.model.id,
      order: this.model.subtests.length
    });
    newSubtest = this.model.subtests.create(newAttributes);
    this.toggleNewSubtestForm();
    return false;
  };

  LessonPlanEditView.prototype.render = function() {
    var arch, archiveChecked, i, k, key, len, lessonPlan_day, lessonPlan_grade, lessonPlan_lesson_text, lessonPlan_subject, lessonPlan_title, lessonPlan_week, notArchiveChecked, ref, sequences, subKey, subValue, subtestLegend, subtestTypeSelect, value;
    lessonPlan_title = this.model.getString("title");
    lessonPlan_lesson_text = this.model.getString("lessonPlan_lesson_text");
    lessonPlan_subject = this.model.getString("lessonPlan_subject");
    lessonPlan_grade = this.model.getString("lessonPlan_grade");
    lessonPlan_week = this.model.getString("lessonPlan_week");
    lessonPlan_day = this.model.getString("lessonPlan_day");
    sequences = "";
    if (this.model.has("sequences")) {
      sequences = this.model.get("sequences");
      sequences = sequences.join("\n");
      if (_.isArray(sequences)) {
        for (i = k = 0, len = sequences.length; k < len; i = ++k) {
          sequences = sequences[i];
          sequences[i] = sequences.join(", ");
        }
      }
    }
    subtestLegend = this.updateSubtestLegend();
    arch = this.model.get('archived');
    archiveChecked = arch === true || arch === 'true' ? "checked" : "";
    notArchiveChecked = archiveChecked ? "" : "checked";
    subtestTypeSelect = "<select id='subtest_type_select'> <option value='none' disabled='disabled' selected='selected'>Please select a subtest type</option>";
    ref = Tangerine.templates.get("subtestTemplates");
    for (key in ref) {
      value = ref[key];
      subtestTypeSelect += "<optgroup label='" + (key.humanize()) + "'>";
      for (subKey in value) {
        subValue = value[subKey];
        subtestTypeSelect += "<option value='" + key + "' data-template='" + subKey + "'>" + subKey + "</option>";
      }
      subtestTypeSelect += "</optgroup>";
    }
    subtestTypeSelect += "</select>";
    this.$el.html("<button class='back navigation'>Back</button> <h1>LessonPlan Builder</h1> <div id='basic'> <label for='lessonPlan_name'>Name</label> <input id='lessonPlan_name' value='" + (this.model.escape("name")) + "'> <label for='lessonPlan_d_key' title='This key is used to import the lessonPlan from a tablet.'>Download Key</label><br> <div class='info_box'>" + (this.model.id.substr(-5, 5)) + "</div> </div> <label title='Only active lessonPlans will be displayed in the main lessonPlan list.'>Status</label><br> <div id='archive_buttons' class='buttonset'> <input type='radio' id='archive_false' name='archive' value='false' " + notArchiveChecked + "><label for='archive_false'>Active</label> <input type='radio' id='archive_true'  name='archive' value='true'  " + archiveChecked + "><label for='archive_true'>Archived</label> </div> <div class='label_value'> <label for='lessonPlan_title'>LessonPlan Title</label> <input id='lessonPlan_title' value='" + lessonPlan_title + "'> </div> <div class='menu_box'> <div class='label_value'> <label for='lessonPlan_lesson_text' title='Lesson Text.'>LessonPlan Text</label> <textarea id='lessonPlan_lesson_text'>" + lessonPlan_lesson_text + "</textarea> </div> </div> <div class='label_value'> <label for='lessonPlan_subject'>LessonPlan subject</label><br> <div class='menu_box'> <select id='lessonPlan_subject'> <option value=''>None</option> <option value='1'>Engish</option> <option value='2'>Kiswahili</option> </select> </div> </div> <div class='label_value'> <label for='lessonPlan_grade'>LessonPlan Grade</label> <input id='lessonPlan_grade' value='" + lessonPlan_grade + "'> </div> <div class='label_value'> <label for='lessonPlan_week'>LessonPlan Week</label> <input id='lessonPlan_week' value='" + lessonPlan_week + "'> </div> <div class='label_value'> <label for='lessonPlan_day'>LessonPlan Day</label> <input id='lessonPlan_day' value='" + lessonPlan_day + "'> </div> <h2>Subtests</h2> <div class='menu_box'> <div> <ul id='subtest_list'> </ul> </div> <button class='new_subtest_button command'>Add Subtest</button> <div class='new_subtest_form confirmation'> <div class='menu_box'> <h2>New Subtest</h2> <label for='subtest_type_select'>Type</label><br> " + subtestTypeSelect + "<br> <label for='new_subtest_name'>Name</label><br> <input type='text' id='new_subtest_name'> <button class='new_subtest_save command'>Add</button> <button class='new_subtest_cancel command'>Cancel</button> </div> </div> </div> <h2>Options</h2> <div class='label_value'> <label for='sequences' title='This is a list of acceptable orders of subtests, which will be randomly selected each time an lessonPlan is run. Subtest indicies are separated by commas, new lines separate sequences. '>Random Sequences</label> <div id='subtest_legend'>" + subtestLegend + "</div> <textarea id='sequences'>" + sequences + "</textarea> </div> <button class='save command'>Save</button>");
    this.subtestListEditView.setElement(this.$el.find("#subtest_list"));
    this.subtestListEditView.render();
    this.$el.find("#subtest_list").sortable({
      handle: '.sortable_handle',
      start: function(event, ui) {
        return ui.item.addClass("drag_shadow");
      },
      stop: function(event, ui) {
        return ui.item.removeClass("drag_shadow");
      },
      update: (function(_this) {
        return function(event, ui) {
          var id, l, len1, li, ref1;
          ref1 = (function() {
            var len1, m, ref1, results;
            ref1 = this.$el.find("#subtest_list li");
            results = [];
            for (m = 0, len1 = ref1.length; m < len1; m++) {
              li = ref1[m];
              results.push($(li).attr("data-id"));
            }
            return results;
          }).call(_this);
          for (i = l = 0, len1 = ref1.length; l < len1; i = ++l) {
            id = ref1[i];
            _this.model.subtests.get(id).set({
              "order": i
            }, {
              silent: true
            }).save(null, {
              silent: true
            });
          }
          return _this.model.subtests.sort();
        };
      })(this)
    });
    return this.trigger("rendered");
  };

  LessonPlanEditView.prototype.updateSubtestLegend = function() {
    var $subtestWrapper, subtestLegend;
    subtestLegend = "";
    this.model.subtests.each(function(subtest, i) {
      return subtestLegend += "<div class='small_grey'>" + i + " - " + (subtest.get("name")) + "</div><br>";
    });
    $subtestWrapper = this.$el.find("#subtest_legend");
    if ($subtestWrapper.length !== 0) {
      $subtestWrapper.html(subtestLegend);
    }
    return subtestLegend;
  };

  LessonPlanEditView.prototype.onClose = function() {
    return this.subtestListEditView.close();
  };

  return LessonPlanEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlc3NvblBsYW4vTGVzc29uUGxhbkVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGtCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7OytCQUVKLFNBQUEsR0FBWTs7K0JBRVosTUFBQSxHQUNFO0lBQUEsOEJBQUEsRUFBaUMsTUFBakM7SUFDQSxhQUFBLEVBQWlDLFFBRGpDO0lBRUEsMkJBQUEsRUFBaUMsc0JBRmpDO0lBR0EsMkJBQUEsRUFBaUMsc0JBSGpDO0lBS0EsNEJBQUEsRUFBaUMsZ0JBTGpDO0lBTUEseUJBQUEsRUFBaUMsZ0JBTmpDO0lBUUEscUJBQUEsRUFBaUMsTUFSakM7SUFTQSxhQUFBLEVBQWlDLE1BVGpDOzs7K0JBV0YsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO0lBQ2pCLElBQUMsQ0FBQSxtQkFBRCxHQUEyQixJQUFBLG1CQUFBLENBQ3pCO01BQUEsWUFBQSxFQUFlLElBQUMsQ0FBQSxLQUFoQjtNQUNBLFlBQUEsRUFBZSxJQUFDLENBQUEsS0FEaEI7S0FEeUI7SUFJM0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBaEIsQ0FBbUIsZUFBbkIsRUFBb0MsSUFBQyxDQUFBLG1CQUFtQixDQUFDLE1BQXpEO1dBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBaEIsQ0FBbUIsS0FBbkIsRUFBMEIsSUFBQyxDQUFBLG1CQUEzQjtFQVBVOzsrQkFTWixJQUFBLEdBQU0sU0FBQTtJQUNKLElBQUcsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFIO2FBQ0UsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksSUFBWixFQUNFO1FBQUEsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ1AsS0FBSyxDQUFDLFFBQU4sQ0FBaUIsQ0FBQyxLQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFY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QUFzRCxDQUFDLElBQXZELENBQTRELElBQTVELEVBQWlFO2NBQUMsTUFBQSxFQUFPLElBQVI7YUFBakU7QUFERjtpQkFFQSxLQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFoQixDQUFBO1FBSE87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSFQ7S0FERjtXQVNBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQTNITTs7K0JBOEhSLG1CQUFBLEdBQXFCLFNBQUE7QUFDbkIsUUFBQTtJQUFBLGFBQUEsR0FBZ0I7SUFDaEIsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBaEIsQ0FBcUIsU0FBQyxPQUFELEVBQVUsQ0FBVjthQUNuQixhQUFBLElBQWlCLDBCQUFBLEdBQTJCLENBQTNCLEdBQTZCLEtBQTdCLEdBQWlDLENBQUMsT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLENBQUQsQ0FBakMsR0FBc0Q7SUFEcEQsQ0FBckI7SUFFQSxlQUFBLEdBQWtCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlCQUFWO0lBQ2xCLElBQXVDLGVBQWUsQ0FBQyxNQUFoQixLQUEwQixDQUFqRTtNQUFBLGVBQWUsQ0FBQyxJQUFoQixDQUFxQixhQUFyQixFQUFBOztBQUNBLFdBQU87RUFOWTs7K0JBUXJCLE9BQUEsR0FBUyxTQUFBO1dBQ1AsSUFBQyxDQUFBLG1CQUFtQixDQUFDLEtBQXJCLENBQUE7RUFETzs7OztHQTdRc0IsUUFBUSxDQUFDIiwiZmlsZSI6Imxlc3NvblBsYW4vTGVzc29uUGxhbkVkaXRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTGVzc29uUGxhbkVkaXRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6ICdsZXNzb25QbGFuX2VkaXRfdmlldydcblxuICBldmVudHMgOlxuICAgICdjbGljayAjYXJjaGl2ZV9idXR0b25zIGlucHV0JyA6ICdzYXZlJ1xuICAgICdjbGljayAuYmFjaycgICAgICAgICAgICAgICAgICA6ICdnb0JhY2snXG4gICAgJ2NsaWNrIC5uZXdfc3VidGVzdF9idXR0b24nICAgIDogJ3RvZ2dsZU5ld1N1YnRlc3RGb3JtJ1xuICAgICdjbGljayAubmV3X3N1YnRlc3RfY2FuY2VsJyAgICA6ICd0b2dnbGVOZXdTdWJ0ZXN0Rm9ybSdcblxuICAgICdrZXlwcmVzcyAjbmV3X3N1YnRlc3RfbmFtZScgICA6ICdzYXZlTmV3U3VidGVzdCdcbiAgICAnY2xpY2sgLm5ld19zdWJ0ZXN0X3NhdmUnICAgICAgOiAnc2F2ZU5ld1N1YnRlc3QnXG5cbiAgICAnY2hhbmdlICNiYXNpYyBpbnB1dCcgICAgICAgICAgOiAnc2F2ZSdcbiAgICAnY2xpY2sgLnNhdmUnICAgICAgICAgICAgICAgICAgOiAnc2F2ZSdcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBAbW9kZWwgPSBvcHRpb25zLm1vZGVsXG4gICAgQHN1YnRlc3RMaXN0RWRpdFZpZXcgPSBuZXcgU3VidGVzdExpc3RFZGl0Vmlld1xuICAgICAgXCJsZXNzb25QbGFuXCIgOiBAbW9kZWxcbiAgICAgIFwiYXNzZXNzbWVudFwiIDogQG1vZGVsXG5cbiAgICBAbW9kZWwuc3VidGVzdHMub24gXCJjaGFuZ2UgcmVtb3ZlXCIsIEBzdWJ0ZXN0TGlzdEVkaXRWaWV3LnJlbmRlclxuICAgIEBtb2RlbC5zdWJ0ZXN0cy5vbiBcImFsbFwiLCBAdXBkYXRlU3VidGVzdExlZ2VuZFxuXG4gIHNhdmU6ID0+XG4gICAgaWYgQHVwZGF0ZU1vZGVsKClcbiAgICAgIEBtb2RlbC5zYXZlIG51bGwsXG4gICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCIje0Btb2RlbC5nZXQoXCJuYW1lXCIpfSBzYXZlZFwiXG4gICAgICAgIGVycm9yOiA9PlxuICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiTGVzc29uUGxhbiBzYXZlIGVycm9yLiBQbGVhc2UgdHJ5IGFnYWluLlwiXG5cbiAgZ29CYWNrOiAtPiBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiYXNzZXNzbWVudHNcIiwgdHJ1ZVxuXG4gIHVwZGF0ZU1vZGVsOiA9PlxuXG4jXG4jIHBhcnNlIGFjY2VwdGFibGUgcmFuZG9tIHNlcXVlbmNlc1xuI1xuXG4gICAgc3VidGVzdENvdW50ID0gQG1vZGVsLnN1YnRlc3RzLm1vZGVscy5sZW5ndGhcblxuICAgICMgcmVtb3ZlIGV2ZXJ5dGhpbmcgZXhjZXB0IG51bWJlcnMsIGNvbW1hcyBhbmQgbmV3IGxpbmVzXG4gICAgc2VxdWVuY2VzVmFsdWUgPSBAJGVsLmZpbmQoXCIjc2VxdWVuY2VzXCIpLnZhbCgpLnJlcGxhY2UoL1teMC05LFxcbl0vZyxcIlwiKVxuICAgIHNlcXVlbmNlcyA9IHNlcXVlbmNlc1ZhbHVlLnNwbGl0KFwiXFxuXCIpXG5cbiAgICAjIHBhcnNlIHN0cmluZ3MgdG8gbnVtYmVycyBhbmQgY29sbGVjdCBlcnJvcnNcbiAgICBmb3Igc2VxdWVuY2UsIGkgaW4gc2VxdWVuY2VzXG5cbiAgICAgIHNlcXVlbmNlID0gc2VxdWVuY2Uuc3BsaXQoXCIsXCIpXG4gICAgICBmb3IgZWxlbWVudCwgaiBpbiBzZXF1ZW5jZVxuICAgICAgICBzZXF1ZW5jZVtqXSA9IHBhcnNlSW50KGVsZW1lbnQpXG4gICAgICAgIHJhbmdlRXJyb3IgPSB0cnVlIGlmIHNlcXVlbmNlW2pdIDwgMCBvciBzZXF1ZW5jZVtqXSA+PSBzdWJ0ZXN0Q291bnRcbiAgICAgICAgZW1wdHlFcnJvciA9IHRydWUgaWYgaXNOYU4oc2VxdWVuY2Vbal0pXG5cbiAgICAgIHNlcXVlbmNlc1tpXSA9IHNlcXVlbmNlXG5cbiAgICAgICMgZGV0ZWN0IGVycm9yc1xuICAgICAgdG9vTWFueUVycm9yID0gdHJ1ZSBpZiBzZXF1ZW5jZS5sZW5ndGggPiBzdWJ0ZXN0Q291bnRcbiAgICAgIHRvb0Zld0Vycm9yICA9IHRydWUgaWYgc2VxdWVuY2UubGVuZ3RoIDwgc3VidGVzdENvdW50XG4gICAgICBkb3VibGVzRXJyb3IgPSB0cnVlIGlmIHNlcXVlbmNlLmxlbmd0aCAhPSBfLnVuaXEoc2VxdWVuY2UpLmxlbmd0aFxuXG4gICAgIyBzaG93IGVycm9ycyBpZiB0aGV5IGV4aXN0IGFuZCBzZXF1ZW5jZXMgZXhpc3RcbiAgICBpZiBub3QgXy5pc0VtcHR5IF8ucmVqZWN0KCBfLmZsYXR0ZW4oc2VxdWVuY2VzKSwgKGUpIC0+IHJldHVybiBpc05hTihlKSkgIyByZW1vdmUgdW5wYXJzYWJsZSBlbXB0aWVzLCBkb24ndCBfLmNvbXBhY3QuIHdpbGwgcmVtb3ZlIDBzXG4gICAgICBzZXF1ZW5jZUVycm9ycyA9IFtdXG4gICAgICBpZiBlbXB0eUVycm9yICAgdGhlbiBzZXF1ZW5jZUVycm9ycy5wdXNoIFwiU29tZSBzZXF1ZW5jZXMgY29udGFpbiBlbXB0eSB2YWx1ZXMuXCJcbiAgICAgIGlmIHJhbmdlRXJyb3IgICB0aGVuIHNlcXVlbmNlRXJyb3JzLnB1c2ggXCJTb21lIG51bWJlcnMgZG8gbm90IHJlZmVyZW5jZSBhIHN1YnRlc3QgZnJvbSB0aGUgbGVnZW5kLlwiXG4gICAgICBpZiB0b29NYW55RXJyb3IgdGhlbiBzZXF1ZW5jZUVycm9ycy5wdXNoIFwiU29tZSBzZXF1ZW5jZXMgYXJlIGxvbmdlciB0aGFuIHRoZSB0b3RhbCBudW1iZXIgb2YgYWxsIHN1YnRlc3RzLlwiXG4gICAgICBpZiB0b29GZXdFcnJvciAgdGhlbiBzZXF1ZW5jZUVycm9ycy5wdXNoIFwiU29tZSBzZXF1ZW5jZXMgYXJlIHNob3J0ZXIgdGhhbiB0aGUgdG90YWwgbnVtYmVyIG9mIGFsbCBzdWJ0ZXN0cy5cIlxuICAgICAgaWYgZG91Ymxlc0Vycm9yIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgc2VxdWVuY2VzIGNvbnRhaW4gZG91Ymxlcy5cIlxuXG4gICAgICBpZiBzZXF1ZW5jZUVycm9ycy5sZW5ndGggPT0gMFxuIyBpZiB0aGVyZSdzIG5vIGVycm9ycywgY2xlYW4gdXAgdGhlIHRleHRhcmVhIGNvbnRlbnRcbiAgICAgICAgdmFsaWRhdGVkU2VxdWVuY2VzID0gKHNlcXVlbmNlLmpvaW4oXCIsIFwiKSBmb3Igc2VxdWVuY2UgaW4gc2VxdWVuY2VzKS5qb2luKFwiXFxuXCIpXG4gICAgICAgIEAkZWwuZmluZChcIiNzZXF1ZW5jZXNcIikudmFsKHZhbGlkYXRlZFNlcXVlbmNlcylcbiAgICAgIGVsc2UgIyBpZiB0aGVyZSdzIGVycm9ycywgdGhleSBjYW4gc3RpbGwgc2F2ZS4gSnVzdCBzaG93IGEgd2FybmluZ1xuICAgICAgICBhbGVydCBcIldhcm5pbmdcXG5cXG4je3NlcXVlbmNlRXJyb3JzLmpvaW4oXCJcXG5cIil9XCJcblxuIyBub3RoaW5nIHJlc2VtYmxpbmcgYSB2YWxpZCBzZXF1ZW5jZSB3YXMgZm91bmRcbiAgICBlbHNlXG4gICAgICBAJGVsLmZpbmQoXCIjc2VxdWVuY2VzXCIpLnZhbChcIlwiKSAjIGNsZWFuIHRleHQgYXJlYVxuXG4gICAgQG1vZGVsLnNldFxuICAgICAgc2VxdWVuY2VzIDogc2VxdWVuY2VzXG4gICAgICBhcmNoaXZlZCAgOiBAJGVsLmZpbmQoXCIjYXJjaGl2ZV9idXR0b25zIGlucHV0OmNoZWNrZWRcIikudmFsKCkgPT0gXCJ0cnVlXCJcbiAgICAgIG5hbWUgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX25hbWVcIikudmFsKClcbiAgICAgIGRLZXkgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX2Rfa2V5XCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuX3RpdGxlICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl90aXRsZVwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl9sZXNzb25fdGV4dCAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fbGVzc29uX3RleHRcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5fc3ViamVjdCAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fc3ViamVjdFwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl9ncmFkZSAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fZ3JhZGVcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5fd2VlayAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fd2Vla1wiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl9kYXkgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX2RheVwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbklkIDogQG1vZGVsLmlkXG4gICAgcmV0dXJuIHRydWVcblxuICB0b2dnbGVOZXdTdWJ0ZXN0Rm9ybTogKGV2ZW50KSAtPlxuICAgIEAkZWwuZmluZChcIi5uZXdfc3VidGVzdF9mb3JtLCAubmV3X3N1YnRlc3RfYnV0dG9uXCIpLnRvZ2dsZSgpXG5cbiAgICBAJGVsLmZpbmQoXCIjbmV3X3N1YnRlc3RfbmFtZVwiKS52YWwoXCJcIilcbiAgICBAJGVsLmZpbmQoXCIjc3VidGVzdF90eXBlX3NlbGVjdFwiKS52YWwoXCJub25lXCIpXG5cbiAgICBmYWxzZVxuXG4gIHNhdmVOZXdTdWJ0ZXN0OiAoZXZlbnQpID0+XG5cbiAgICBpZiBldmVudC50eXBlICE9IFwiY2xpY2tcIiAmJiBldmVudC53aGljaCAhPSAxM1xuICAgICAgcmV0dXJuIHRydWVcblxuICAgICMgaWYgbm8gc3VidGVzdCB0eXBlIHNlbGVjdGVkLCBzaG93IGVycm9yXG4gICAgaWYgQCRlbC5maW5kKFwiI3N1YnRlc3RfdHlwZV9zZWxlY3Qgb3B0aW9uOnNlbGVjdGVkXCIpLnZhbCgpID09IFwibm9uZVwiXG4gICAgICBVdGlscy5taWRBbGVydCBcIlBsZWFzZSBzZWxlY3QgYSBzdWJ0ZXN0IHR5cGVcIlxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAjIGdlbmVyYWwgdGVtcGxhdGVcbiAgICBuZXdBdHRyaWJ1dGVzID0gVGFuZ2VyaW5lLnRlbXBsYXRlcy5nZXQoXCJzdWJ0ZXN0XCIpXG5cbiAgICAjIHByb3RvdHlwZSB0ZW1wbGF0ZVxuICAgIHByb3RvdHlwZVRlbXBsYXRlID0gVGFuZ2VyaW5lLnRlbXBsYXRlcy5nZXQoXCJwcm90b3R5cGVzXCIpW0AkZWwuZmluZChcIiNzdWJ0ZXN0X3R5cGVfc2VsZWN0XCIpLnZhbCgpXVxuXG4gICAgIyBiaXQgbW9yZSBzcGVjaWZpYyB0ZW1wbGF0ZVxuICAgIHVzZVR5cGUgPSBAJGVsLmZpbmQoXCIjc3VidGVzdF90eXBlX3NlbGVjdCA6c2VsZWN0ZWRcIikuYXR0ciAnZGF0YS10ZW1wbGF0ZSdcbiAgICB1c2VUeXBlVGVtcGxhdGUgPSBUYW5nZXJpbmUudGVtcGxhdGVzLmdldChcInN1YnRlc3RUZW1wbGF0ZXNcIilbQCRlbC5maW5kKFwiI3N1YnRlc3RfdHlwZV9zZWxlY3RcIikudmFsKCldW3VzZVR5cGVdXG5cbiAgICBuZXdBdHRyaWJ1dGVzID0gJC5leHRlbmQgbmV3QXR0cmlidXRlcywgcHJvdG90eXBlVGVtcGxhdGVcbiAgICBuZXdBdHRyaWJ1dGVzID0gJC5leHRlbmQgbmV3QXR0cmlidXRlcywgdXNlVHlwZVRlbXBsYXRlXG4gICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIG5ld0F0dHJpYnV0ZXMsXG4gICAgICBuYW1lICAgICAgICAgOiBAJGVsLmZpbmQoXCIjbmV3X3N1YnRlc3RfbmFtZVwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbklkIDogQG1vZGVsLmlkXG4gICAgICBvcmRlciAgICAgICAgOiBAbW9kZWwuc3VidGVzdHMubGVuZ3RoXG4gICAgbmV3U3VidGVzdCA9IEBtb2RlbC5zdWJ0ZXN0cy5jcmVhdGUgbmV3QXR0cmlidXRlc1xuICAgIEB0b2dnbGVOZXdTdWJ0ZXN0Rm9ybSgpXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgcmVuZGVyOiA9PlxuICAgIGxlc3NvblBsYW5fdGl0bGUgICAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwidGl0bGVcIilcbiAgICBsZXNzb25QbGFuX2xlc3Nvbl90ZXh0ICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxlc3NvblBsYW5fbGVzc29uX3RleHRcIilcbiAgICBsZXNzb25QbGFuX3N1YmplY3QgICAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwibGVzc29uUGxhbl9zdWJqZWN0XCIpXG4gICAgbGVzc29uUGxhbl9ncmFkZSAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX2dyYWRlXCIpXG4gICAgbGVzc29uUGxhbl93ZWVrICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxlc3NvblBsYW5fd2Vla1wiKVxuICAgIGxlc3NvblBsYW5fZGF5ICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxlc3NvblBsYW5fZGF5XCIpXG4gICAgc2VxdWVuY2VzID0gXCJcIlxuICAgIGlmIEBtb2RlbC5oYXMoXCJzZXF1ZW5jZXNcIilcbiAgICAgIHNlcXVlbmNlcyA9IEBtb2RlbC5nZXQoXCJzZXF1ZW5jZXNcIilcbiAgICAgIHNlcXVlbmNlcyA9IHNlcXVlbmNlcy5qb2luKFwiXFxuXCIpXG5cbiAgICAgIGlmIF8uaXNBcnJheShzZXF1ZW5jZXMpXG4gICAgICAgIGZvciBzZXF1ZW5jZXMsIGkgaW4gc2VxdWVuY2VzXG4gICAgICAgICAgc2VxdWVuY2VzW2ldID0gc2VxdWVuY2VzLmpvaW4oXCIsIFwiKVxuXG4gICAgc3VidGVzdExlZ2VuZCA9IEB1cGRhdGVTdWJ0ZXN0TGVnZW5kKClcblxuICAgIGFyY2ggPSBAbW9kZWwuZ2V0KCdhcmNoaXZlZCcpXG4gICAgYXJjaGl2ZUNoZWNrZWQgICAgPSBpZiAoYXJjaCA9PSB0cnVlIG9yIGFyY2ggPT0gJ3RydWUnKSB0aGVuIFwiY2hlY2tlZFwiIGVsc2UgXCJcIlxuICAgIG5vdEFyY2hpdmVDaGVja2VkID0gaWYgYXJjaGl2ZUNoZWNrZWQgdGhlbiBcIlwiIGVsc2UgXCJjaGVja2VkXCJcblxuICAgICMgbGlzdCBvZiBcInRlbXBsYXRlc1wiXG4gICAgc3VidGVzdFR5cGVTZWxlY3QgPSBcIjxzZWxlY3QgaWQ9J3N1YnRlc3RfdHlwZV9zZWxlY3QnPlxuICAgICAgPG9wdGlvbiB2YWx1ZT0nbm9uZScgZGlzYWJsZWQ9J2Rpc2FibGVkJyBzZWxlY3RlZD0nc2VsZWN0ZWQnPlBsZWFzZSBzZWxlY3QgYSBzdWJ0ZXN0IHR5cGU8L29wdGlvbj5cIlxuICAgIGZvciBrZXksIHZhbHVlIG9mIFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwic3VidGVzdFRlbXBsYXRlc1wiKVxuICAgICAgc3VidGVzdFR5cGVTZWxlY3QgKz0gXCI8b3B0Z3JvdXAgbGFiZWw9JyN7a2V5Lmh1bWFuaXplKCl9Jz5cIlxuICAgICAgZm9yIHN1YktleSwgc3ViVmFsdWUgb2YgdmFsdWVcbiAgICAgICAgc3VidGVzdFR5cGVTZWxlY3QgKz0gXCI8b3B0aW9uIHZhbHVlPScje2tleX0nIGRhdGEtdGVtcGxhdGU9JyN7c3ViS2V5fSc+I3tzdWJLZXl9PC9vcHRpb24+XCJcbiAgICAgIHN1YnRlc3RUeXBlU2VsZWN0ICs9IFwiPC9vcHRncm91cD5cIlxuICAgIHN1YnRlc3RUeXBlU2VsZWN0ICs9IFwiPC9zZWxlY3Q+XCJcblxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGJ1dHRvbiBjbGFzcz0nYmFjayBuYXZpZ2F0aW9uJz5CYWNrPC9idXR0b24+XG4gICAgICAgIDxoMT5MZXNzb25QbGFuIEJ1aWxkZXI8L2gxPlxuICAgICAgPGRpdiBpZD0nYmFzaWMnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX25hbWUnPk5hbWU8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgaWQ9J2xlc3NvblBsYW5fbmFtZScgdmFsdWU9JyN7QG1vZGVsLmVzY2FwZShcIm5hbWVcIil9Jz5cblxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX2Rfa2V5JyB0aXRsZT0nVGhpcyBrZXkgaXMgdXNlZCB0byBpbXBvcnQgdGhlIGxlc3NvblBsYW4gZnJvbSBhIHRhYmxldC4nPkRvd25sb2FkIEtleTwvbGFiZWw+PGJyPlxuICAgICAgICA8ZGl2IGNsYXNzPSdpbmZvX2JveCc+I3tAbW9kZWwuaWQuc3Vic3RyKC01LDUpfTwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxsYWJlbCB0aXRsZT0nT25seSBhY3RpdmUgbGVzc29uUGxhbnMgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIG1haW4gbGVzc29uUGxhbiBsaXN0Lic+U3RhdHVzPC9sYWJlbD48YnI+XG4gICAgICA8ZGl2IGlkPSdhcmNoaXZlX2J1dHRvbnMnIGNsYXNzPSdidXR0b25zZXQnPlxuICAgICAgICA8aW5wdXQgdHlwZT0ncmFkaW8nIGlkPSdhcmNoaXZlX2ZhbHNlJyBuYW1lPSdhcmNoaXZlJyB2YWx1ZT0nZmFsc2UnICN7bm90QXJjaGl2ZUNoZWNrZWR9PjxsYWJlbCBmb3I9J2FyY2hpdmVfZmFsc2UnPkFjdGl2ZTwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCB0eXBlPSdyYWRpbycgaWQ9J2FyY2hpdmVfdHJ1ZScgIG5hbWU9J2FyY2hpdmUnIHZhbHVlPSd0cnVlJyAgI3thcmNoaXZlQ2hlY2tlZH0+PGxhYmVsIGZvcj0nYXJjaGl2ZV90cnVlJz5BcmNoaXZlZDwvbGFiZWw+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX3RpdGxlJz5MZXNzb25QbGFuIFRpdGxlPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IGlkPSdsZXNzb25QbGFuX3RpdGxlJyB2YWx1ZT0nI3tsZXNzb25QbGFuX3RpdGxlfSc+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgIDxsYWJlbCBmb3I9J2xlc3NvblBsYW5fbGVzc29uX3RleHQnIHRpdGxlPSdMZXNzb24gVGV4dC4nPkxlc3NvblBsYW4gVGV4dDwvbGFiZWw+XG4gICAgICAgICAgICAgIDx0ZXh0YXJlYSBpZD0nbGVzc29uUGxhbl9sZXNzb25fdGV4dCc+I3tsZXNzb25QbGFuX2xlc3Nvbl90ZXh0fTwvdGV4dGFyZWE+XG4gICAgICA8L2Rpdj5cbiAgICAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgPGxhYmVsIGZvcj0nbGVzc29uUGxhbl9zdWJqZWN0Jz5MZXNzb25QbGFuIHN1YmplY3Q8L2xhYmVsPjxicj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgIDxzZWxlY3QgaWQ9J2xlc3NvblBsYW5fc3ViamVjdCc+XG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPScnPk5vbmU8L29wdGlvbj5cbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9JzEnPkVuZ2lzaDwvb3B0aW9uPlxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0nMic+S2lzd2FoaWxpPC9vcHRpb24+XG4gICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nbGVzc29uUGxhbl9ncmFkZSc+TGVzc29uUGxhbiBHcmFkZTwvbGFiZWw+XG4gICAgICA8aW5wdXQgaWQ9J2xlc3NvblBsYW5fZ3JhZGUnIHZhbHVlPScje2xlc3NvblBsYW5fZ3JhZGV9Jz5cbiAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2xlc3NvblBsYW5fd2Vlayc+TGVzc29uUGxhbiBXZWVrPC9sYWJlbD5cbiAgICAgIDxpbnB1dCBpZD0nbGVzc29uUGxhbl93ZWVrJyB2YWx1ZT0nI3tsZXNzb25QbGFuX3dlZWt9Jz5cbiAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2xlc3NvblBsYW5fZGF5Jz5MZXNzb25QbGFuIERheTwvbGFiZWw+XG4gICAgICA8aW5wdXQgaWQ9J2xlc3NvblBsYW5fZGF5JyB2YWx1ZT0nI3tsZXNzb25QbGFuX2RheX0nPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxoMj5TdWJ0ZXN0czwvaDI+XG4gICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgIDxkaXY+XG4gICAgICAgIDx1bCBpZD0nc3VidGVzdF9saXN0Jz5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxidXR0b24gY2xhc3M9J25ld19zdWJ0ZXN0X2J1dHRvbiBjb21tYW5kJz5BZGQgU3VidGVzdDwvYnV0dG9uPlxuICAgICAgICA8ZGl2IGNsYXNzPSduZXdfc3VidGVzdF9mb3JtIGNvbmZpcm1hdGlvbic+XG4gICAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgICAgPGgyPk5ldyBTdWJ0ZXN0PC9oMj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J3N1YnRlc3RfdHlwZV9zZWxlY3QnPlR5cGU8L2xhYmVsPjxicj5cbiAgICAgICAgICAgICN7c3VidGVzdFR5cGVTZWxlY3R9PGJyPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0nbmV3X3N1YnRlc3RfbmFtZSc+TmFtZTwvbGFiZWw+PGJyPlxuICAgICAgICAgICAgPGlucHV0IHR5cGU9J3RleHQnIGlkPSduZXdfc3VidGVzdF9uYW1lJz5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25ld19zdWJ0ZXN0X3NhdmUgY29tbWFuZCc+QWRkPC9idXR0b24+IDxidXR0b24gY2xhc3M9J25ld19zdWJ0ZXN0X2NhbmNlbCBjb21tYW5kJz5DYW5jZWw8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxoMj5PcHRpb25zPC9oMj5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nc2VxdWVuY2VzJyB0aXRsZT0nVGhpcyBpcyBhIGxpc3Qgb2YgYWNjZXB0YWJsZSBvcmRlcnMgb2Ygc3VidGVzdHMsIHdoaWNoIHdpbGwgYmUgcmFuZG9tbHkgc2VsZWN0ZWQgZWFjaCB0aW1lIGFuIGxlc3NvblBsYW4gaXMgcnVuLiBTdWJ0ZXN0IGluZGljaWVzIGFyZSBzZXBhcmF0ZWQgYnkgY29tbWFzLCBuZXcgbGluZXMgc2VwYXJhdGUgc2VxdWVuY2VzLiAnPlJhbmRvbSBTZXF1ZW5jZXM8L2xhYmVsPlxuICAgICAgICA8ZGl2IGlkPSdzdWJ0ZXN0X2xlZ2VuZCc+I3tzdWJ0ZXN0TGVnZW5kfTwvZGl2PlxuICAgICAgICA8dGV4dGFyZWEgaWQ9J3NlcXVlbmNlcyc+I3tzZXF1ZW5jZXN9PC90ZXh0YXJlYT5cbiAgICAgIDwvZGl2PlxuICAgICAgPGJ1dHRvbiBjbGFzcz0nc2F2ZSBjb21tYW5kJz5TYXZlPC9idXR0b24+XG4gICAgICBcIlxuXG4gICAgIyByZW5kZXIgbmV3IHN1YnRlc3Qgdmlld3NcbiAgICBAc3VidGVzdExpc3RFZGl0Vmlldy5zZXRFbGVtZW50KEAkZWwuZmluZChcIiNzdWJ0ZXN0X2xpc3RcIikpXG4gICAgQHN1YnRlc3RMaXN0RWRpdFZpZXcucmVuZGVyKClcblxuICAgICMgbWFrZSBpdCBzb3J0YWJsZVxuICAgIEAkZWwuZmluZChcIiNzdWJ0ZXN0X2xpc3RcIikuc29ydGFibGVcbiAgICAgIGhhbmRsZSA6ICcuc29ydGFibGVfaGFuZGxlJ1xuICAgICAgc3RhcnQ6IChldmVudCwgdWkpIC0+IHVpLml0ZW0uYWRkQ2xhc3MgXCJkcmFnX3NoYWRvd1wiXG4gICAgICBzdG9wOiAgKGV2ZW50LCB1aSkgLT4gdWkuaXRlbS5yZW1vdmVDbGFzcyBcImRyYWdfc2hhZG93XCJcbiAgICAgIHVwZGF0ZSA6IChldmVudCwgdWkpID0+XG4gICAgICAgIGZvciBpZCwgaSBpbiAoJChsaSkuYXR0cihcImRhdGEtaWRcIikgZm9yIGxpIGluIEAkZWwuZmluZChcIiNzdWJ0ZXN0X2xpc3QgbGlcIikpXG4gICAgICAgICAgQG1vZGVsLnN1YnRlc3RzLmdldChpZCkuc2V0KHtcIm9yZGVyXCI6aX0se3NpbGVudDp0cnVlfSkuc2F2ZShudWxsLHtzaWxlbnQ6dHJ1ZX0pXG4gICAgICAgIEBtb2RlbC5zdWJ0ZXN0cy5zb3J0KClcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG5cbiAgdXBkYXRlU3VidGVzdExlZ2VuZDogPT5cbiAgICBzdWJ0ZXN0TGVnZW5kID0gXCJcIlxuICAgIEBtb2RlbC5zdWJ0ZXN0cy5lYWNoIChzdWJ0ZXN0LCBpKSAtPlxuICAgICAgc3VidGVzdExlZ2VuZCArPSBcIjxkaXYgY2xhc3M9J3NtYWxsX2dyZXknPiN7aX0gLSAje3N1YnRlc3QuZ2V0KFwibmFtZVwiKX08L2Rpdj48YnI+XCJcbiAgICAkc3VidGVzdFdyYXBwZXIgPSBAJGVsLmZpbmQoXCIjc3VidGVzdF9sZWdlbmRcIilcbiAgICAkc3VidGVzdFdyYXBwZXIuaHRtbChzdWJ0ZXN0TGVnZW5kKSBpZiAkc3VidGVzdFdyYXBwZXIubGVuZ3RoICE9IDBcbiAgICByZXR1cm4gc3VidGVzdExlZ2VuZFxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgQHN1YnRlc3RMaXN0RWRpdFZpZXcuY2xvc2UoKVxuICAgIFxuIl19
