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
      lessonPlan_subject: this.$el.find("#lessonPlan_subject_buttons input:checked").val(),
      lessonPlan_grade: this.$el.find("#lessonPlan_grade").val(),
      lessonPlan_week: this.$el.find("#lessonPlan_week").val(),
      lessonPlan_day: this.$el.find("#lessonPlan_day").val(),
      lessonPlanId: this.model.id,
      assessmentId: this.model.id
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
      assessmentId: this.model.id,
      order: this.model.subtests.length
    });
    newSubtest = this.model.subtests.create(newAttributes);
    this.toggleNewSubtestForm();
    return false;
  };

  LessonPlanEditView.prototype.render = function() {
    var arch, archiveChecked, i, k, key, len, lessonPlan_day, lessonPlan_grade, lessonPlan_lesson_text, lessonPlan_subject, lessonPlan_subject_Engish, lessonPlan_subject_Kiswahili, lessonPlan_title, lessonPlan_week, notArchiveChecked, ref, sequences, subKey, subValue, subtestLegend, subtestTypeSelect, value;
    lessonPlan_title = this.model.getString("lessonPlan_title");
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
    lessonPlan_subject_Engish = lessonPlan_subject === '1' ? "checked" : "";
    lessonPlan_subject_Kiswahili = lessonPlan_subject === '2' ? "checked" : "";
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
    this.$el.html("<button class='back navigation'>Back</button> <h1>LessonPlan Builder</h1> <div id='basic'> <label for='lessonPlan_name'>Name</label> <input id='lessonPlan_name' value='" + (this.model.escape("name")) + "'> <label for='lessonPlan_d_key' title='This key is used to import the lessonPlan from a tablet.'>Download Key</label><br> <div class='info_box'>" + (this.model.id.substr(-5, 5)) + "</div> </div> <label title='Only active lessonPlans will be displayed in the main lessonPlan list.'>Status</label><br> <div id='archive_buttons' class='buttonset'> <input type='radio' id='archive_false' name='archive' value='false' " + notArchiveChecked + "><label for='archive_false'>Active</label> <input type='radio' id='archive_true'  name='archive' value='true'  " + archiveChecked + "><label for='archive_true'>Archived</label> </div> <div class='label_value'> <label for='lessonPlan_title'>LessonPlan Title</label> <input id='lessonPlan_title' value='" + lessonPlan_title + "'> </div> <div class='menu_box'> <div class='label_value'> <label for='lessonPlan_lesson_text' title='Lesson Text.'>LessonPlan Text</label> <textarea id='lessonPlan_lesson_text'>" + lessonPlan_lesson_text + "</textarea> </div> </div> <label title='You must choose one of these subjects.' for='lessonPlan_subject_buttons'>LessonPlan subject</label><br> <div id='lessonPlan_subject_buttons' class='buttonset'> <input type='radio' id='lessonPlan_subject_Engish' name='lessonPlan_subject' value='1' " + lessonPlan_subject_Engish + "><label for='lessonPlan_subject_Engish'>Engish</label> <input type='radio' id='lessonPlan_subject_Kiswahili'  name='lessonPlan_subject' value='2'  " + lessonPlan_subject_Kiswahili + "><label for='lessonPlan_subject_Kiswahili'>Kiswahili</label> </div> <div class='label_value'> <label for='lessonPlan_grade'>LessonPlan Grade</label> <input id='lessonPlan_grade' value='" + lessonPlan_grade + "'> </div> <div class='label_value'> <label for='lessonPlan_week'>LessonPlan Week</label> <input id='lessonPlan_week' value='" + lessonPlan_week + "'> </div> <div class='label_value'> <label for='lessonPlan_day'>LessonPlan Day</label> <input id='lessonPlan_day' value='" + lessonPlan_day + "'> </div> <h2>Subtests</h2> <div class='menu_box'> <div> <ul id='subtest_list'> </ul> </div> <button class='new_subtest_button command'>Add Subtest</button> <div class='new_subtest_form confirmation'> <div class='menu_box'> <h2>New Subtest</h2> <label for='subtest_type_select'>Type</label><br> " + subtestTypeSelect + "<br> <label for='new_subtest_name'>Name</label><br> <input type='text' id='new_subtest_name'> <button class='new_subtest_save command'>Add</button> <button class='new_subtest_cancel command'>Cancel</button> </div> </div> </div> <h2>Options</h2> <div class='label_value'> <label for='sequences' title='This is a list of acceptable orders of subtests, which will be randomly selected each time an lessonPlan is run. Subtest indicies are separated by commas, new lines separate sequences. '>Random Sequences</label> <div id='subtest_legend'>" + subtestLegend + "</div> <textarea id='sequences'>" + sequences + "</textarea> </div> <button class='save command'>Save</button>");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlc3NvblBsYW4vTGVzc29uUGxhbkVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGtCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7OytCQUVKLFNBQUEsR0FBWTs7K0JBRVosTUFBQSxHQUNFO0lBQUEsOEJBQUEsRUFBaUMsTUFBakM7SUFDQSxhQUFBLEVBQWlDLFFBRGpDO0lBRUEsMkJBQUEsRUFBaUMsc0JBRmpDO0lBR0EsMkJBQUEsRUFBaUMsc0JBSGpDO0lBS0EsNEJBQUEsRUFBaUMsZ0JBTGpDO0lBTUEseUJBQUEsRUFBaUMsZ0JBTmpDO0lBUUEscUJBQUEsRUFBaUMsTUFSakM7SUFTQSxhQUFBLEVBQWlDLE1BVGpDOzs7K0JBV0YsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO0lBQ2pCLElBQUMsQ0FBQSxtQkFBRCxHQUEyQixJQUFBLG1CQUFBLENBQ3pCO01BQUEsWUFBQSxFQUFlLElBQUMsQ0FBQSxLQUFoQjtNQUNBLFlBQUEsRUFBZSxJQUFDLENBQUEsS0FEaEI7S0FEeUI7SUFJM0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBaEIsQ0FBbUIsZUFBbkIsRUFBb0MsSUFBQyxDQUFBLG1CQUFtQixDQUFDLE1BQXpEO1dBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBaEIsQ0FBbUIsS0FBbkIsRUFBMEIsSUFBQyxDQUFBLG1CQUEzQjtFQVBVOzsrQkFTWixJQUFBLEdBQU0sU0FBQTtJQUNKLElBQUcsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFIO2FBQ0UsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksSUFBWixFQUNFO1FBQUEsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ1AsS0FBSyxDQUFDLFFBQU4sQ0FBaUIsQ0FBQyxLQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFY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QUMiLCJmaWxlIjoibGVzc29uUGxhbi9MZXNzb25QbGFuRWRpdFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBMZXNzb25QbGFuRWRpdFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogJ2xlc3NvblBsYW5fZWRpdF92aWV3J1xuXG4gIGV2ZW50cyA6XG4gICAgJ2NsaWNrICNhcmNoaXZlX2J1dHRvbnMgaW5wdXQnIDogJ3NhdmUnXG4gICAgJ2NsaWNrIC5iYWNrJyAgICAgICAgICAgICAgICAgIDogJ2dvQmFjaydcbiAgICAnY2xpY2sgLm5ld19zdWJ0ZXN0X2J1dHRvbicgICAgOiAndG9nZ2xlTmV3U3VidGVzdEZvcm0nXG4gICAgJ2NsaWNrIC5uZXdfc3VidGVzdF9jYW5jZWwnICAgIDogJ3RvZ2dsZU5ld1N1YnRlc3RGb3JtJ1xuXG4gICAgJ2tleXByZXNzICNuZXdfc3VidGVzdF9uYW1lJyAgIDogJ3NhdmVOZXdTdWJ0ZXN0J1xuICAgICdjbGljayAubmV3X3N1YnRlc3Rfc2F2ZScgICAgICA6ICdzYXZlTmV3U3VidGVzdCdcblxuICAgICdjaGFuZ2UgI2Jhc2ljIGlucHV0JyAgICAgICAgICA6ICdzYXZlJ1xuICAgICdjbGljayAuc2F2ZScgICAgICAgICAgICAgICAgICA6ICdzYXZlJ1xuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEBtb2RlbCA9IG9wdGlvbnMubW9kZWxcbiAgICBAc3VidGVzdExpc3RFZGl0VmlldyA9IG5ldyBTdWJ0ZXN0TGlzdEVkaXRWaWV3XG4gICAgICBcImxlc3NvblBsYW5cIiA6IEBtb2RlbFxuICAgICAgXCJhc3Nlc3NtZW50XCIgOiBAbW9kZWxcblxuICAgIEBtb2RlbC5zdWJ0ZXN0cy5vbiBcImNoYW5nZSByZW1vdmVcIiwgQHN1YnRlc3RMaXN0RWRpdFZpZXcucmVuZGVyXG4gICAgQG1vZGVsLnN1YnRlc3RzLm9uIFwiYWxsXCIsIEB1cGRhdGVTdWJ0ZXN0TGVnZW5kXG5cbiAgc2F2ZTogPT5cbiAgICBpZiBAdXBkYXRlTW9kZWwoKVxuICAgICAgQG1vZGVsLnNhdmUgbnVsbCxcbiAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICBVdGlscy5taWRBbGVydCBcIiN7QG1vZGVsLmdldChcIm5hbWVcIil9IHNhdmVkXCJcbiAgICAgICAgZXJyb3I6ID0+XG4gICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJMZXNzb25QbGFuIHNhdmUgZXJyb3IuIFBsZWFzZSB0cnkgYWdhaW4uXCJcblxuICBnb0JhY2s6IC0+IFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJhc3Nlc3NtZW50c1wiLCB0cnVlXG5cbiAgdXBkYXRlTW9kZWw6ID0+XG5cbiNcbiMgcGFyc2UgYWNjZXB0YWJsZSByYW5kb20gc2VxdWVuY2VzXG4jXG5cbiAgICBzdWJ0ZXN0Q291bnQgPSBAbW9kZWwuc3VidGVzdHMubW9kZWxzLmxlbmd0aFxuXG4gICAgIyByZW1vdmUgZXZlcnl0aGluZyBleGNlcHQgbnVtYmVycywgY29tbWFzIGFuZCBuZXcgbGluZXNcbiAgICBzZXF1ZW5jZXNWYWx1ZSA9IEAkZWwuZmluZChcIiNzZXF1ZW5jZXNcIikudmFsKCkucmVwbGFjZSgvW14wLTksXFxuXS9nLFwiXCIpXG4gICAgc2VxdWVuY2VzID0gc2VxdWVuY2VzVmFsdWUuc3BsaXQoXCJcXG5cIilcblxuICAgICMgcGFyc2Ugc3RyaW5ncyB0byBudW1iZXJzIGFuZCBjb2xsZWN0IGVycm9yc1xuICAgIGZvciBzZXF1ZW5jZSwgaSBpbiBzZXF1ZW5jZXNcblxuICAgICAgc2VxdWVuY2UgPSBzZXF1ZW5jZS5zcGxpdChcIixcIilcbiAgICAgIGZvciBlbGVtZW50LCBqIGluIHNlcXVlbmNlXG4gICAgICAgIHNlcXVlbmNlW2pdID0gcGFyc2VJbnQoZWxlbWVudClcbiAgICAgICAgcmFuZ2VFcnJvciA9IHRydWUgaWYgc2VxdWVuY2Vbal0gPCAwIG9yIHNlcXVlbmNlW2pdID49IHN1YnRlc3RDb3VudFxuICAgICAgICBlbXB0eUVycm9yID0gdHJ1ZSBpZiBpc05hTihzZXF1ZW5jZVtqXSlcblxuICAgICAgc2VxdWVuY2VzW2ldID0gc2VxdWVuY2VcblxuICAgICAgIyBkZXRlY3QgZXJyb3JzXG4gICAgICB0b29NYW55RXJyb3IgPSB0cnVlIGlmIHNlcXVlbmNlLmxlbmd0aCA+IHN1YnRlc3RDb3VudFxuICAgICAgdG9vRmV3RXJyb3IgID0gdHJ1ZSBpZiBzZXF1ZW5jZS5sZW5ndGggPCBzdWJ0ZXN0Q291bnRcbiAgICAgIGRvdWJsZXNFcnJvciA9IHRydWUgaWYgc2VxdWVuY2UubGVuZ3RoICE9IF8udW5pcShzZXF1ZW5jZSkubGVuZ3RoXG5cbiAgICAjIHNob3cgZXJyb3JzIGlmIHRoZXkgZXhpc3QgYW5kIHNlcXVlbmNlcyBleGlzdFxuICAgIGlmIG5vdCBfLmlzRW1wdHkgXy5yZWplY3QoIF8uZmxhdHRlbihzZXF1ZW5jZXMpLCAoZSkgLT4gcmV0dXJuIGlzTmFOKGUpKSAjIHJlbW92ZSB1bnBhcnNhYmxlIGVtcHRpZXMsIGRvbid0IF8uY29tcGFjdC4gd2lsbCByZW1vdmUgMHNcbiAgICAgIHNlcXVlbmNlRXJyb3JzID0gW11cbiAgICAgIGlmIGVtcHR5RXJyb3IgICB0aGVuIHNlcXVlbmNlRXJyb3JzLnB1c2ggXCJTb21lIHNlcXVlbmNlcyBjb250YWluIGVtcHR5IHZhbHVlcy5cIlxuICAgICAgaWYgcmFuZ2VFcnJvciAgIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgbnVtYmVycyBkbyBub3QgcmVmZXJlbmNlIGEgc3VidGVzdCBmcm9tIHRoZSBsZWdlbmQuXCJcbiAgICAgIGlmIHRvb01hbnlFcnJvciB0aGVuIHNlcXVlbmNlRXJyb3JzLnB1c2ggXCJTb21lIHNlcXVlbmNlcyBhcmUgbG9uZ2VyIHRoYW4gdGhlIHRvdGFsIG51bWJlciBvZiBhbGwgc3VidGVzdHMuXCJcbiAgICAgIGlmIHRvb0Zld0Vycm9yICB0aGVuIHNlcXVlbmNlRXJyb3JzLnB1c2ggXCJTb21lIHNlcXVlbmNlcyBhcmUgc2hvcnRlciB0aGFuIHRoZSB0b3RhbCBudW1iZXIgb2YgYWxsIHN1YnRlc3RzLlwiXG4gICAgICBpZiBkb3VibGVzRXJyb3IgdGhlbiBzZXF1ZW5jZUVycm9ycy5wdXNoIFwiU29tZSBzZXF1ZW5jZXMgY29udGFpbiBkb3VibGVzLlwiXG5cbiAgICAgIGlmIHNlcXVlbmNlRXJyb3JzLmxlbmd0aCA9PSAwXG4jIGlmIHRoZXJlJ3Mgbm8gZXJyb3JzLCBjbGVhbiB1cCB0aGUgdGV4dGFyZWEgY29udGVudFxuICAgICAgICB2YWxpZGF0ZWRTZXF1ZW5jZXMgPSAoc2VxdWVuY2Uuam9pbihcIiwgXCIpIGZvciBzZXF1ZW5jZSBpbiBzZXF1ZW5jZXMpLmpvaW4oXCJcXG5cIilcbiAgICAgICAgQCRlbC5maW5kKFwiI3NlcXVlbmNlc1wiKS52YWwodmFsaWRhdGVkU2VxdWVuY2VzKVxuICAgICAgZWxzZSAjIGlmIHRoZXJlJ3MgZXJyb3JzLCB0aGV5IGNhbiBzdGlsbCBzYXZlLiBKdXN0IHNob3cgYSB3YXJuaW5nXG4gICAgICAgIGFsZXJ0IFwiV2FybmluZ1xcblxcbiN7c2VxdWVuY2VFcnJvcnMuam9pbihcIlxcblwiKX1cIlxuXG4jIG5vdGhpbmcgcmVzZW1ibGluZyBhIHZhbGlkIHNlcXVlbmNlIHdhcyBmb3VuZFxuICAgIGVsc2VcbiAgICAgIEAkZWwuZmluZChcIiNzZXF1ZW5jZXNcIikudmFsKFwiXCIpICMgY2xlYW4gdGV4dCBhcmVhXG5cbiAgICBAbW9kZWwuc2V0XG4gICAgICBzZXF1ZW5jZXMgOiBzZXF1ZW5jZXNcbiAgICAgIGFyY2hpdmVkICA6IEAkZWwuZmluZChcIiNhcmNoaXZlX2J1dHRvbnMgaW5wdXQ6Y2hlY2tlZFwiKS52YWwoKSA9PSBcInRydWVcIlxuICAgICAgbmFtZSAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fbmFtZVwiKS52YWwoKVxuICAgICAgZEtleSAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fZF9rZXlcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5fdGl0bGUgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX3RpdGxlXCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuX2xlc3Nvbl90ZXh0ICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9sZXNzb25fdGV4dFwiKS52YWwoKVxuIyAgICAgIGxlc3NvblBsYW5fc3ViamVjdCAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fc3ViamVjdFwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl9zdWJqZWN0ICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9zdWJqZWN0X2J1dHRvbnMgaW5wdXQ6Y2hlY2tlZFwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl9ncmFkZSAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fZ3JhZGVcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5fd2VlayAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fd2Vla1wiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl9kYXkgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX2RheVwiKS52YWwoKVxuIyAgICAgIGxlc3NvblBsYW5faW1hZ2UgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX2ltYWdlXCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuSWQgOiBAbW9kZWwuaWRcbiAgICAgIGFzc2Vzc21lbnRJZCA6IEBtb2RlbC5pZFxuICAgIHJldHVybiB0cnVlXG5cbiAgdG9nZ2xlTmV3U3VidGVzdEZvcm06IChldmVudCkgLT5cbiAgICBAJGVsLmZpbmQoXCIubmV3X3N1YnRlc3RfZm9ybSwgLm5ld19zdWJ0ZXN0X2J1dHRvblwiKS50b2dnbGUoKVxuXG4gICAgQCRlbC5maW5kKFwiI25ld19zdWJ0ZXN0X25hbWVcIikudmFsKFwiXCIpXG4gICAgQCRlbC5maW5kKFwiI3N1YnRlc3RfdHlwZV9zZWxlY3RcIikudmFsKFwibm9uZVwiKVxuXG4gICAgZmFsc2VcblxuICBzYXZlTmV3U3VidGVzdDogKGV2ZW50KSA9PlxuXG4gICAgaWYgZXZlbnQudHlwZSAhPSBcImNsaWNrXCIgJiYgZXZlbnQud2hpY2ggIT0gMTNcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICAjIGlmIG5vIHN1YnRlc3QgdHlwZSBzZWxlY3RlZCwgc2hvdyBlcnJvclxuICAgIGlmIEAkZWwuZmluZChcIiNzdWJ0ZXN0X3R5cGVfc2VsZWN0IG9wdGlvbjpzZWxlY3RlZFwiKS52YWwoKSA9PSBcIm5vbmVcIlxuICAgICAgVXRpbHMubWlkQWxlcnQgXCJQbGVhc2Ugc2VsZWN0IGEgc3VidGVzdCB0eXBlXCJcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgIyBnZW5lcmFsIHRlbXBsYXRlXG4gICAgbmV3QXR0cmlidXRlcyA9IFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwic3VidGVzdFwiKVxuXG4gICAgIyBwcm90b3R5cGUgdGVtcGxhdGVcbiAgICBwcm90b3R5cGVUZW1wbGF0ZSA9IFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwicHJvdG90eXBlc1wiKVtAJGVsLmZpbmQoXCIjc3VidGVzdF90eXBlX3NlbGVjdFwiKS52YWwoKV1cblxuICAgICMgYml0IG1vcmUgc3BlY2lmaWMgdGVtcGxhdGVcbiAgICB1c2VUeXBlID0gQCRlbC5maW5kKFwiI3N1YnRlc3RfdHlwZV9zZWxlY3QgOnNlbGVjdGVkXCIpLmF0dHIgJ2RhdGEtdGVtcGxhdGUnXG4gICAgdXNlVHlwZVRlbXBsYXRlID0gVGFuZ2VyaW5lLnRlbXBsYXRlcy5nZXQoXCJzdWJ0ZXN0VGVtcGxhdGVzXCIpW0AkZWwuZmluZChcIiNzdWJ0ZXN0X3R5cGVfc2VsZWN0XCIpLnZhbCgpXVt1c2VUeXBlXVxuXG4gICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIG5ld0F0dHJpYnV0ZXMsIHByb3RvdHlwZVRlbXBsYXRlXG4gICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIG5ld0F0dHJpYnV0ZXMsIHVzZVR5cGVUZW1wbGF0ZVxuICAgIG5ld0F0dHJpYnV0ZXMgPSAkLmV4dGVuZCBuZXdBdHRyaWJ1dGVzLFxuICAgICAgbmFtZSAgICAgICAgIDogQCRlbC5maW5kKFwiI25ld19zdWJ0ZXN0X25hbWVcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5JZCA6IEBtb2RlbC5pZFxuICAgICAgYXNzZXNzbWVudElkIDogQG1vZGVsLmlkXG4gICAgICBvcmRlciAgICAgICAgOiBAbW9kZWwuc3VidGVzdHMubGVuZ3RoXG4gICAgbmV3U3VidGVzdCA9IEBtb2RlbC5zdWJ0ZXN0cy5jcmVhdGUgbmV3QXR0cmlidXRlc1xuICAgIEB0b2dnbGVOZXdTdWJ0ZXN0Rm9ybSgpXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgcmVuZGVyOiA9PlxuICAgIGxlc3NvblBsYW5fdGl0bGUgICAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwibGVzc29uUGxhbl90aXRsZVwiKVxuICAgIGxlc3NvblBsYW5fbGVzc29uX3RleHQgICAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwibGVzc29uUGxhbl9sZXNzb25fdGV4dFwiKVxuICAgIGxlc3NvblBsYW5fc3ViamVjdCAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX3N1YmplY3RcIilcbiAgICBsZXNzb25QbGFuX2dyYWRlICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxlc3NvblBsYW5fZ3JhZGVcIilcbiAgICBsZXNzb25QbGFuX3dlZWsgICAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwibGVzc29uUGxhbl93ZWVrXCIpXG4gICAgbGVzc29uUGxhbl9kYXkgICAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwibGVzc29uUGxhbl9kYXlcIilcbiAgICBzZXF1ZW5jZXMgPSBcIlwiXG4gICAgaWYgQG1vZGVsLmhhcyhcInNlcXVlbmNlc1wiKVxuICAgICAgc2VxdWVuY2VzID0gQG1vZGVsLmdldChcInNlcXVlbmNlc1wiKVxuICAgICAgc2VxdWVuY2VzID0gc2VxdWVuY2VzLmpvaW4oXCJcXG5cIilcblxuICAgICAgaWYgXy5pc0FycmF5KHNlcXVlbmNlcylcbiAgICAgICAgZm9yIHNlcXVlbmNlcywgaSBpbiBzZXF1ZW5jZXNcbiAgICAgICAgICBzZXF1ZW5jZXNbaV0gPSBzZXF1ZW5jZXMuam9pbihcIiwgXCIpXG5cbiAgICBzdWJ0ZXN0TGVnZW5kID0gQHVwZGF0ZVN1YnRlc3RMZWdlbmQoKVxuXG4gICAgYXJjaCA9IEBtb2RlbC5nZXQoJ2FyY2hpdmVkJylcbiAgICBhcmNoaXZlQ2hlY2tlZCAgICA9IGlmIChhcmNoID09IHRydWUgb3IgYXJjaCA9PSAndHJ1ZScpIHRoZW4gXCJjaGVja2VkXCIgZWxzZSBcIlwiXG4gICAgbm90QXJjaGl2ZUNoZWNrZWQgPSBpZiBhcmNoaXZlQ2hlY2tlZCB0aGVuIFwiXCIgZWxzZSBcImNoZWNrZWRcIlxuXG4gICAgbGVzc29uUGxhbl9zdWJqZWN0X0VuZ2lzaCAgICA9IGlmIChsZXNzb25QbGFuX3N1YmplY3QgPT0gJzEnKSB0aGVuIFwiY2hlY2tlZFwiIGVsc2UgXCJcIlxuICAgIGxlc3NvblBsYW5fc3ViamVjdF9LaXN3YWhpbGkgPSBpZiAobGVzc29uUGxhbl9zdWJqZWN0ID09ICcyJykgdGhlbiBcImNoZWNrZWRcIiBlbHNlIFwiXCJcblxuICAgICMgbGlzdCBvZiBcInRlbXBsYXRlc1wiXG4gICAgc3VidGVzdFR5cGVTZWxlY3QgPSBcIjxzZWxlY3QgaWQ9J3N1YnRlc3RfdHlwZV9zZWxlY3QnPlxuICAgICAgPG9wdGlvbiB2YWx1ZT0nbm9uZScgZGlzYWJsZWQ9J2Rpc2FibGVkJyBzZWxlY3RlZD0nc2VsZWN0ZWQnPlBsZWFzZSBzZWxlY3QgYSBzdWJ0ZXN0IHR5cGU8L29wdGlvbj5cIlxuICAgIGZvciBrZXksIHZhbHVlIG9mIFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwic3VidGVzdFRlbXBsYXRlc1wiKVxuICAgICAgc3VidGVzdFR5cGVTZWxlY3QgKz0gXCI8b3B0Z3JvdXAgbGFiZWw9JyN7a2V5Lmh1bWFuaXplKCl9Jz5cIlxuICAgICAgZm9yIHN1YktleSwgc3ViVmFsdWUgb2YgdmFsdWVcbiAgICAgICAgc3VidGVzdFR5cGVTZWxlY3QgKz0gXCI8b3B0aW9uIHZhbHVlPScje2tleX0nIGRhdGEtdGVtcGxhdGU9JyN7c3ViS2V5fSc+I3tzdWJLZXl9PC9vcHRpb24+XCJcbiAgICAgIHN1YnRlc3RUeXBlU2VsZWN0ICs9IFwiPC9vcHRncm91cD5cIlxuICAgIHN1YnRlc3RUeXBlU2VsZWN0ICs9IFwiPC9zZWxlY3Q+XCJcblxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGJ1dHRvbiBjbGFzcz0nYmFjayBuYXZpZ2F0aW9uJz5CYWNrPC9idXR0b24+XG4gICAgICAgIDxoMT5MZXNzb25QbGFuIEJ1aWxkZXI8L2gxPlxuICAgICAgPGRpdiBpZD0nYmFzaWMnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX25hbWUnPk5hbWU8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgaWQ9J2xlc3NvblBsYW5fbmFtZScgdmFsdWU9JyN7QG1vZGVsLmVzY2FwZShcIm5hbWVcIil9Jz5cblxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX2Rfa2V5JyB0aXRsZT0nVGhpcyBrZXkgaXMgdXNlZCB0byBpbXBvcnQgdGhlIGxlc3NvblBsYW4gZnJvbSBhIHRhYmxldC4nPkRvd25sb2FkIEtleTwvbGFiZWw+PGJyPlxuICAgICAgICA8ZGl2IGNsYXNzPSdpbmZvX2JveCc+I3tAbW9kZWwuaWQuc3Vic3RyKC01LDUpfTwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxsYWJlbCB0aXRsZT0nT25seSBhY3RpdmUgbGVzc29uUGxhbnMgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIG1haW4gbGVzc29uUGxhbiBsaXN0Lic+U3RhdHVzPC9sYWJlbD48YnI+XG4gICAgICA8ZGl2IGlkPSdhcmNoaXZlX2J1dHRvbnMnIGNsYXNzPSdidXR0b25zZXQnPlxuICAgICAgICA8aW5wdXQgdHlwZT0ncmFkaW8nIGlkPSdhcmNoaXZlX2ZhbHNlJyBuYW1lPSdhcmNoaXZlJyB2YWx1ZT0nZmFsc2UnICN7bm90QXJjaGl2ZUNoZWNrZWR9PjxsYWJlbCBmb3I9J2FyY2hpdmVfZmFsc2UnPkFjdGl2ZTwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCB0eXBlPSdyYWRpbycgaWQ9J2FyY2hpdmVfdHJ1ZScgIG5hbWU9J2FyY2hpdmUnIHZhbHVlPSd0cnVlJyAgI3thcmNoaXZlQ2hlY2tlZH0+PGxhYmVsIGZvcj0nYXJjaGl2ZV90cnVlJz5BcmNoaXZlZDwvbGFiZWw+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX3RpdGxlJz5MZXNzb25QbGFuIFRpdGxlPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IGlkPSdsZXNzb25QbGFuX3RpdGxlJyB2YWx1ZT0nI3tsZXNzb25QbGFuX3RpdGxlfSc+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0nbGVzc29uUGxhbl9sZXNzb25fdGV4dCcgdGl0bGU9J0xlc3NvbiBUZXh0Lic+TGVzc29uUGxhbiBUZXh0PC9sYWJlbD5cbiAgICAgICAgICA8dGV4dGFyZWEgaWQ9J2xlc3NvblBsYW5fbGVzc29uX3RleHQnPiN7bGVzc29uUGxhbl9sZXNzb25fdGV4dH08L3RleHRhcmVhPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8bGFiZWwgdGl0bGU9J1lvdSBtdXN0IGNob29zZSBvbmUgb2YgdGhlc2Ugc3ViamVjdHMuJyBmb3I9J2xlc3NvblBsYW5fc3ViamVjdF9idXR0b25zJz5MZXNzb25QbGFuIHN1YmplY3Q8L2xhYmVsPjxicj5cbiAgICAgIDxkaXYgaWQ9J2xlc3NvblBsYW5fc3ViamVjdF9idXR0b25zJyBjbGFzcz0nYnV0dG9uc2V0Jz5cbiAgICAgICAgPGlucHV0IHR5cGU9J3JhZGlvJyBpZD0nbGVzc29uUGxhbl9zdWJqZWN0X0VuZ2lzaCcgbmFtZT0nbGVzc29uUGxhbl9zdWJqZWN0JyB2YWx1ZT0nMScgI3tsZXNzb25QbGFuX3N1YmplY3RfRW5naXNofT48bGFiZWwgZm9yPSdsZXNzb25QbGFuX3N1YmplY3RfRW5naXNoJz5Fbmdpc2g8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgdHlwZT0ncmFkaW8nIGlkPSdsZXNzb25QbGFuX3N1YmplY3RfS2lzd2FoaWxpJyAgbmFtZT0nbGVzc29uUGxhbl9zdWJqZWN0JyB2YWx1ZT0nMicgICN7bGVzc29uUGxhbl9zdWJqZWN0X0tpc3dhaGlsaX0+PGxhYmVsIGZvcj0nbGVzc29uUGxhbl9zdWJqZWN0X0tpc3dhaGlsaSc+S2lzd2FoaWxpPC9sYWJlbD5cbiAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2xlc3NvblBsYW5fZ3JhZGUnPkxlc3NvblBsYW4gR3JhZGU8L2xhYmVsPlxuICAgICAgPGlucHV0IGlkPSdsZXNzb25QbGFuX2dyYWRlJyB2YWx1ZT0nI3tsZXNzb25QbGFuX2dyYWRlfSc+XG4gICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX3dlZWsnPkxlc3NvblBsYW4gV2VlazwvbGFiZWw+XG4gICAgICA8aW5wdXQgaWQ9J2xlc3NvblBsYW5fd2VlaycgdmFsdWU9JyN7bGVzc29uUGxhbl93ZWVrfSc+XG4gICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX2RheSc+TGVzc29uUGxhbiBEYXk8L2xhYmVsPlxuICAgICAgPGlucHV0IGlkPSdsZXNzb25QbGFuX2RheScgdmFsdWU9JyN7bGVzc29uUGxhbl9kYXl9Jz5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8aDI+U3VidGVzdHM8L2gyPlxuICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICA8ZGl2PlxuICAgICAgICA8dWwgaWQ9J3N1YnRlc3RfbGlzdCc+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8YnV0dG9uIGNsYXNzPSduZXdfc3VidGVzdF9idXR0b24gY29tbWFuZCc+QWRkIFN1YnRlc3Q8L2J1dHRvbj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbmV3X3N1YnRlc3RfZm9ybSBjb25maXJtYXRpb24nPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICAgIDxoMj5OZXcgU3VidGVzdDwvaDI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdzdWJ0ZXN0X3R5cGVfc2VsZWN0Jz5UeXBlPC9sYWJlbD48YnI+XG4gICAgICAgICAgICAje3N1YnRlc3RUeXBlU2VsZWN0fTxicj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J25ld19zdWJ0ZXN0X25hbWUnPk5hbWU8L2xhYmVsPjxicj5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPSd0ZXh0JyBpZD0nbmV3X3N1YnRlc3RfbmFtZSc+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduZXdfc3VidGVzdF9zYXZlIGNvbW1hbmQnPkFkZDwvYnV0dG9uPiA8YnV0dG9uIGNsYXNzPSduZXdfc3VidGVzdF9jYW5jZWwgY29tbWFuZCc+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8aDI+T3B0aW9uczwvaDI+XG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J3NlcXVlbmNlcycgdGl0bGU9J1RoaXMgaXMgYSBsaXN0IG9mIGFjY2VwdGFibGUgb3JkZXJzIG9mIHN1YnRlc3RzLCB3aGljaCB3aWxsIGJlIHJhbmRvbWx5IHNlbGVjdGVkIGVhY2ggdGltZSBhbiBsZXNzb25QbGFuIGlzIHJ1bi4gU3VidGVzdCBpbmRpY2llcyBhcmUgc2VwYXJhdGVkIGJ5IGNvbW1hcywgbmV3IGxpbmVzIHNlcGFyYXRlIHNlcXVlbmNlcy4gJz5SYW5kb20gU2VxdWVuY2VzPC9sYWJlbD5cbiAgICAgICAgPGRpdiBpZD0nc3VidGVzdF9sZWdlbmQnPiN7c3VidGVzdExlZ2VuZH08L2Rpdj5cbiAgICAgICAgPHRleHRhcmVhIGlkPSdzZXF1ZW5jZXMnPiN7c2VxdWVuY2VzfTwvdGV4dGFyZWE+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxidXR0b24gY2xhc3M9J3NhdmUgY29tbWFuZCc+U2F2ZTwvYnV0dG9uPlxuICAgICAgXCJcblxuICAgICMgcmVuZGVyIG5ldyBzdWJ0ZXN0IHZpZXdzXG4gICAgQHN1YnRlc3RMaXN0RWRpdFZpZXcuc2V0RWxlbWVudChAJGVsLmZpbmQoXCIjc3VidGVzdF9saXN0XCIpKVxuICAgIEBzdWJ0ZXN0TGlzdEVkaXRWaWV3LnJlbmRlcigpXG5cbiAgICAjIG1ha2UgaXQgc29ydGFibGVcbiAgICBAJGVsLmZpbmQoXCIjc3VidGVzdF9saXN0XCIpLnNvcnRhYmxlXG4gICAgICBoYW5kbGUgOiAnLnNvcnRhYmxlX2hhbmRsZSdcbiAgICAgIHN0YXJ0OiAoZXZlbnQsIHVpKSAtPiB1aS5pdGVtLmFkZENsYXNzIFwiZHJhZ19zaGFkb3dcIlxuICAgICAgc3RvcDogIChldmVudCwgdWkpIC0+IHVpLml0ZW0ucmVtb3ZlQ2xhc3MgXCJkcmFnX3NoYWRvd1wiXG4gICAgICB1cGRhdGUgOiAoZXZlbnQsIHVpKSA9PlxuICAgICAgICBmb3IgaWQsIGkgaW4gKCQobGkpLmF0dHIoXCJkYXRhLWlkXCIpIGZvciBsaSBpbiBAJGVsLmZpbmQoXCIjc3VidGVzdF9saXN0IGxpXCIpKVxuICAgICAgICAgIEBtb2RlbC5zdWJ0ZXN0cy5nZXQoaWQpLnNldCh7XCJvcmRlclwiOml9LHtzaWxlbnQ6dHJ1ZX0pLnNhdmUobnVsbCx7c2lsZW50OnRydWV9KVxuICAgICAgICBAbW9kZWwuc3VidGVzdHMuc29ydCgpXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuXG4gIHVwZGF0ZVN1YnRlc3RMZWdlbmQ6ID0+XG4gICAgc3VidGVzdExlZ2VuZCA9IFwiXCJcbiAgICBAbW9kZWwuc3VidGVzdHMuZWFjaCAoc3VidGVzdCwgaSkgLT5cbiAgICAgIHN1YnRlc3RMZWdlbmQgKz0gXCI8ZGl2IGNsYXNzPSdzbWFsbF9ncmV5Jz4je2l9IC0gI3tzdWJ0ZXN0LmdldChcIm5hbWVcIil9PC9kaXY+PGJyPlwiXG4gICAgJHN1YnRlc3RXcmFwcGVyID0gQCRlbC5maW5kKFwiI3N1YnRlc3RfbGVnZW5kXCIpXG4gICAgJHN1YnRlc3RXcmFwcGVyLmh0bWwoc3VidGVzdExlZ2VuZCkgaWYgJHN1YnRlc3RXcmFwcGVyLmxlbmd0aCAhPSAwXG4gICAgcmV0dXJuIHN1YnRlc3RMZWdlbmRcblxuICBvbkNsb3NlOiAtPlxuICAgIEBzdWJ0ZXN0TGlzdEVkaXRWaWV3LmNsb3NlKClcbiAgICBcbiJdfQ==
