var AssessmentEditView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AssessmentEditView = (function(superClass) {
  extend(AssessmentEditView, superClass);

  function AssessmentEditView() {
    this.updateSubtestLegend = bind(this.updateSubtestLegend, this);
    this.render = bind(this.render, this);
    this.saveNewSubtest = bind(this.saveNewSubtest, this);
    this.updateModel = bind(this.updateModel, this);
    this.save = bind(this.save, this);
    return AssessmentEditView.__super__.constructor.apply(this, arguments);
  }

  AssessmentEditView.prototype.className = 'assessment_edit_view';

  AssessmentEditView.prototype.events = {
    'click #archive_buttons input': 'save',
    'click .back': 'goBack',
    'click .new_subtest_button': 'toggleNewSubtestForm',
    'click .new_subtest_cancel': 'toggleNewSubtestForm',
    'keypress #new_subtest_name': 'saveNewSubtest',
    'click .new_subtest_save': 'saveNewSubtest',
    'change #basic input': 'save',
    'click .save': 'save'
  };

  AssessmentEditView.prototype.initialize = function(options) {
    this.model = options.model;
    this.subtestListEditView = new SubtestListEditView({
      "assessment": this.model
    });
    this.model.subtests.on("change remove", this.subtestListEditView.render);
    return this.model.subtests.on("all", this.updateSubtestLegend);
  };

  AssessmentEditView.prototype.save = function() {
    if (this.updateModel()) {
      return this.model.save(null, {
        success: (function(_this) {
          return function() {
            return Utils.midAlert((_this.model.get("name")) + " saved");
          };
        })(this),
        error: (function(_this) {
          return function() {
            return Utils.midAlert("Assessment save error. Please try again.");
          };
        })(this)
      });
    }
  };

  AssessmentEditView.prototype.goBack = function() {
    return Tangerine.router.navigate("assessments", true);
  };

  AssessmentEditView.prototype.updateModel = function() {
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
      name: this.$el.find("#assessment_name").val(),
      dKey: this.$el.find("#assessment_d_key").val(),
      assessmentId: this.model.id
    });
    return true;
  };

  AssessmentEditView.prototype.toggleNewSubtestForm = function(event) {
    this.$el.find(".new_subtest_form, .new_subtest_button").toggle();
    this.$el.find("#new_subtest_name").val("");
    this.$el.find("#subtest_type_select").val("none");
    return false;
  };

  AssessmentEditView.prototype.saveNewSubtest = function(event) {
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
      assessmentId: this.model.id,
      order: this.model.subtests.length
    });
    newSubtest = this.model.subtests.create(newAttributes);
    this.toggleNewSubtestForm();
    return false;
  };

  AssessmentEditView.prototype.render = function() {
    var arch, archiveChecked, i, k, key, len, notArchiveChecked, ref, sequences, subKey, subValue, subtestLegend, subtestTypeSelect, value;
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
    this.$el.html("<button class='back navigation'>Back</button> <h1>Assessment Builder</h1> <div id='basic'> <label for='assessment_name'>Name</label> <input id='assessment_name' value='" + (this.model.escape("name")) + "'> <label for='assessment_d_key' title='This key is used to import the assessment from a tablet.'>Download Key</label><br> <div class='info_box'>" + (this.model.id.substr(-5, 5)) + "</div> </div> <label title='Only active assessments will be displayed in the main assessment list.'>Status</label><br> <div id='archive_buttons' class='buttonset'> <input type='radio' id='archive_false' name='archive' value='false' " + notArchiveChecked + "><label for='archive_false'>Active</label> <input type='radio' id='archive_true'  name='archive' value='true'  " + archiveChecked + "><label for='archive_true'>Archived</label> </div> <h2>Subtests</h2> <div class='menu_box'> <div> <ul id='subtest_list'> </ul> </div> <button class='new_subtest_button command'>Add Subtest</button> <div class='new_subtest_form confirmation'> <div class='menu_box'> <h2>New Subtest</h2> <label for='subtest_type_select'>Type</label><br> " + subtestTypeSelect + "<br> <label for='new_subtest_name'>Name</label><br> <input type='text' id='new_subtest_name'> <button class='new_subtest_save command'>Add</button> <button class='new_subtest_cancel command'>Cancel</button> </div> </div> </div> <h2>Options</h2> <div class='label_value'> <label for='sequences' title='This is a list of acceptable orders of subtests, which will be randomly selected each time an assessment is run. Subtest indicies are separated by commas, new lines separate sequences. '>Random Sequences</label> <div id='subtest_legend'>" + subtestLegend + "</div> <textarea id='sequences'>" + sequences + "</textarea> </div> <button class='save command'>Save</button>");
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

  AssessmentEditView.prototype.updateSubtestLegend = function() {
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

  AssessmentEditView.prototype.onClose = function() {
    return this.subtestListEditView.close();
  };

  return AssessmentEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXNzbWVudC9Bc3Nlc3NtZW50RWRpdFZpZXcuanMiLCJzb3VyY2VzIjpbImFzc2Vzc21lbnQvQXNzZXNzbWVudEVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGtCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7OytCQUVKLFNBQUEsR0FBWTs7K0JBRVosTUFBQSxHQUNFO0lBQUEsOEJBQUEsRUFBaUMsTUFBakM7SUFDQSxhQUFBLEVBQWlDLFFBRGpDO0lBRUEsMkJBQUEsRUFBaUMsc0JBRmpDO0lBR0EsMkJBQUEsRUFBaUMsc0JBSGpDO0lBS0EsNEJBQUEsRUFBaUMsZ0JBTGpDO0lBTUEseUJBQUEsRUFBaUMsZ0JBTmpDO0lBUUEscUJBQUEsRUFBaUMsTUFSakM7SUFTQSxhQUFBLEVBQWlDLE1BVGpDOzs7K0JBV0YsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO0lBQ2pCLElBQUMsQ0FBQSxtQkFBRCxHQUF1QixJQUFJLG1CQUFKLENBQ3JCO01BQUEsWUFBQSxFQUFlLElBQUMsQ0FBQSxLQUFoQjtLQURxQjtJQUd2QixJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFoQixDQUFtQixlQUFuQixFQUFvQyxJQUFDLENBQUEsbUJBQW1CLENBQUMsTUFBekQ7V0FDQSxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFoQixDQUFtQixLQUFuQixFQUEwQixJQUFDLENBQUEsbUJBQTNCO0VBTlU7OytCQVFaLElBQUEsR0FBTSxTQUFBO0lBQ0osSUFBRyxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUg7YUFDRSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxJQUFaLEVBQ0U7UUFBQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDUCxLQUFLLENBQUMsUUFBTixDQUFpQixDQUFDLEtBQUMsQ0FBQSxLQUFLLENBQUMsR0FB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YUFBakU7QUFERjtpQkFFQSxLQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFoQixDQUFBO1FBSE87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSFQ7S0FERjtXQVNBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQXBGTTs7K0JBdUZSLG1CQUFBLEdBQXFCLFNBQUE7QUFDbkIsUUFBQTtJQUFBLGFBQUEsR0FBZ0I7SUFDaEIsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBaEIsQ0FBcUIsU0FBQyxPQUFELEVBQVUsQ0FBVjthQUNuQixhQUFBLElBQWlCLDBCQUFBLEdBQTJCLENBQTNCLEdBQTZCLEtBQTdCLEdBQWlDLENBQUMsT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLENBQUQsQ0FBakMsR0FBc0Q7SUFEcEQsQ0FBckI7SUFFQSxlQUFBLEdBQWtCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlCQUFWO0lBQ2xCLElBQXVDLGVBQWUsQ0FBQyxNQUFoQixLQUEwQixDQUFqRTtNQUFBLGVBQWUsQ0FBQyxJQUFoQixDQUFxQixhQUFyQixFQUFBOztBQUNBLFdBQU87RUFOWTs7K0JBUXJCLE9BQUEsR0FBUyxTQUFBO1dBQ1AsSUFBQyxDQUFBLG1CQUFtQixDQUFDLEtBQXJCLENBQUE7RUFETzs7OztHQS9Oc0IsUUFBUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQXNzZXNzbWVudEVkaXRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6ICdhc3Nlc3NtZW50X2VkaXRfdmlldydcblxuICBldmVudHMgOlxuICAgICdjbGljayAjYXJjaGl2ZV9idXR0b25zIGlucHV0JyA6ICdzYXZlJ1xuICAgICdjbGljayAuYmFjaycgICAgICAgICAgICAgICAgICA6ICdnb0JhY2snXG4gICAgJ2NsaWNrIC5uZXdfc3VidGVzdF9idXR0b24nICAgIDogJ3RvZ2dsZU5ld1N1YnRlc3RGb3JtJ1xuICAgICdjbGljayAubmV3X3N1YnRlc3RfY2FuY2VsJyAgICA6ICd0b2dnbGVOZXdTdWJ0ZXN0Rm9ybSdcblxuICAgICdrZXlwcmVzcyAjbmV3X3N1YnRlc3RfbmFtZScgICA6ICdzYXZlTmV3U3VidGVzdCdcbiAgICAnY2xpY2sgLm5ld19zdWJ0ZXN0X3NhdmUnICAgICAgOiAnc2F2ZU5ld1N1YnRlc3QnXG5cbiAgICAnY2hhbmdlICNiYXNpYyBpbnB1dCcgICAgICAgICAgOiAnc2F2ZSdcbiAgICAnY2xpY2sgLnNhdmUnICAgICAgICAgICAgICAgICAgOiAnc2F2ZSdcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBAbW9kZWwgPSBvcHRpb25zLm1vZGVsXG4gICAgQHN1YnRlc3RMaXN0RWRpdFZpZXcgPSBuZXcgU3VidGVzdExpc3RFZGl0Vmlld1xuICAgICAgXCJhc3Nlc3NtZW50XCIgOiBAbW9kZWxcblxuICAgIEBtb2RlbC5zdWJ0ZXN0cy5vbiBcImNoYW5nZSByZW1vdmVcIiwgQHN1YnRlc3RMaXN0RWRpdFZpZXcucmVuZGVyXG4gICAgQG1vZGVsLnN1YnRlc3RzLm9uIFwiYWxsXCIsIEB1cGRhdGVTdWJ0ZXN0TGVnZW5kXG5cbiAgc2F2ZTogPT5cbiAgICBpZiBAdXBkYXRlTW9kZWwoKVxuICAgICAgQG1vZGVsLnNhdmUgbnVsbCxcbiAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICBVdGlscy5taWRBbGVydCBcIiN7QG1vZGVsLmdldChcIm5hbWVcIil9IHNhdmVkXCIgXG4gICAgICAgIGVycm9yOiA9PlxuICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiQXNzZXNzbWVudCBzYXZlIGVycm9yLiBQbGVhc2UgdHJ5IGFnYWluLlwiIFxuXG4gIGdvQmFjazogLT4gVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImFzc2Vzc21lbnRzXCIsIHRydWVcblxuICB1cGRhdGVNb2RlbDogPT5cblxuICAgICNcbiAgICAjIHBhcnNlIGFjY2VwdGFibGUgcmFuZG9tIHNlcXVlbmNlc1xuICAgICNcblxuICAgIHN1YnRlc3RDb3VudCA9IEBtb2RlbC5zdWJ0ZXN0cy5tb2RlbHMubGVuZ3RoXG5cbiAgICAjIHJlbW92ZSBldmVyeXRoaW5nIGV4Y2VwdCBudW1iZXJzLCBjb21tYXMgYW5kIG5ldyBsaW5lc1xuICAgIHNlcXVlbmNlc1ZhbHVlID0gQCRlbC5maW5kKFwiI3NlcXVlbmNlc1wiKS52YWwoKS5yZXBsYWNlKC9bXjAtOSxcXG5dL2csXCJcIilcbiAgICBzZXF1ZW5jZXMgPSBzZXF1ZW5jZXNWYWx1ZS5zcGxpdChcIlxcblwiKVxuXG4gICAgIyBwYXJzZSBzdHJpbmdzIHRvIG51bWJlcnMgYW5kIGNvbGxlY3QgZXJyb3JzXG4gICAgZm9yIHNlcXVlbmNlLCBpIGluIHNlcXVlbmNlc1xuXG4gICAgICBzZXF1ZW5jZSA9IHNlcXVlbmNlLnNwbGl0KFwiLFwiKVxuICAgICAgZm9yIGVsZW1lbnQsIGogaW4gc2VxdWVuY2VcbiAgICAgICAgc2VxdWVuY2Vbal0gPSBwYXJzZUludChlbGVtZW50KVxuICAgICAgICByYW5nZUVycm9yID0gdHJ1ZSBpZiBzZXF1ZW5jZVtqXSA8IDAgb3Igc2VxdWVuY2Vbal0gPj0gc3VidGVzdENvdW50XG4gICAgICAgIGVtcHR5RXJyb3IgPSB0cnVlIGlmIGlzTmFOKHNlcXVlbmNlW2pdKVxuICAgICAgXG4gICAgICBzZXF1ZW5jZXNbaV0gPSBzZXF1ZW5jZVxuICAgICAgXG4gICAgICAjIGRldGVjdCBlcnJvcnNcbiAgICAgIHRvb01hbnlFcnJvciA9IHRydWUgaWYgc2VxdWVuY2UubGVuZ3RoID4gc3VidGVzdENvdW50XG4gICAgICB0b29GZXdFcnJvciAgPSB0cnVlIGlmIHNlcXVlbmNlLmxlbmd0aCA8IHN1YnRlc3RDb3VudFxuICAgICAgZG91Ymxlc0Vycm9yID0gdHJ1ZSBpZiBzZXF1ZW5jZS5sZW5ndGggIT0gXy51bmlxKHNlcXVlbmNlKS5sZW5ndGhcbiAgICBcbiAgICAjIHNob3cgZXJyb3JzIGlmIHRoZXkgZXhpc3QgYW5kIHNlcXVlbmNlcyBleGlzdFxuICAgIGlmIG5vdCBfLmlzRW1wdHkgXy5yZWplY3QoIF8uZmxhdHRlbihzZXF1ZW5jZXMpLCAoZSkgLT4gcmV0dXJuIGlzTmFOKGUpKSAjIHJlbW92ZSB1bnBhcnNhYmxlIGVtcHRpZXMsIGRvbid0IF8uY29tcGFjdC4gd2lsbCByZW1vdmUgMHNcbiAgICAgIHNlcXVlbmNlRXJyb3JzID0gW11cbiAgICAgIGlmIGVtcHR5RXJyb3IgICB0aGVuIHNlcXVlbmNlRXJyb3JzLnB1c2ggXCJTb21lIHNlcXVlbmNlcyBjb250YWluIGVtcHR5IHZhbHVlcy5cIlxuICAgICAgaWYgcmFuZ2VFcnJvciAgIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgbnVtYmVycyBkbyBub3QgcmVmZXJlbmNlIGEgc3VidGVzdCBmcm9tIHRoZSBsZWdlbmQuXCJcbiAgICAgIGlmIHRvb01hbnlFcnJvciB0aGVuIHNlcXVlbmNlRXJyb3JzLnB1c2ggXCJTb21lIHNlcXVlbmNlcyBhcmUgbG9uZ2VyIHRoYW4gdGhlIHRvdGFsIG51bWJlciBvZiBhbGwgc3VidGVzdHMuXCJcbiAgICAgIGlmIHRvb0Zld0Vycm9yICB0aGVuIHNlcXVlbmNlRXJyb3JzLnB1c2ggXCJTb21lIHNlcXVlbmNlcyBhcmUgc2hvcnRlciB0aGFuIHRoZSB0b3RhbCBudW1iZXIgb2YgYWxsIHN1YnRlc3RzLlwiXG4gICAgICBpZiBkb3VibGVzRXJyb3IgdGhlbiBzZXF1ZW5jZUVycm9ycy5wdXNoIFwiU29tZSBzZXF1ZW5jZXMgY29udGFpbiBkb3VibGVzLlwiXG5cbiAgICAgIGlmIHNlcXVlbmNlRXJyb3JzLmxlbmd0aCA9PSAwXG4gICAgICAgICMgaWYgdGhlcmUncyBubyBlcnJvcnMsIGNsZWFuIHVwIHRoZSB0ZXh0YXJlYSBjb250ZW50XG4gICAgICAgIHZhbGlkYXRlZFNlcXVlbmNlcyA9IChzZXF1ZW5jZS5qb2luKFwiLCBcIikgZm9yIHNlcXVlbmNlIGluIHNlcXVlbmNlcykuam9pbihcIlxcblwiKVxuICAgICAgICBAJGVsLmZpbmQoXCIjc2VxdWVuY2VzXCIpLnZhbCh2YWxpZGF0ZWRTZXF1ZW5jZXMpXG4gICAgICBlbHNlICMgaWYgdGhlcmUncyBlcnJvcnMsIHRoZXkgY2FuIHN0aWxsIHNhdmUuIEp1c3Qgc2hvdyBhIHdhcm5pbmdcbiAgICAgICAgYWxlcnQgXCJXYXJuaW5nXFxuXFxuI3tzZXF1ZW5jZUVycm9ycy5qb2luKFwiXFxuXCIpfVwiXG5cbiAgICAjIG5vdGhpbmcgcmVzZW1ibGluZyBhIHZhbGlkIHNlcXVlbmNlIHdhcyBmb3VuZFxuICAgIGVsc2VcbiAgICAgIEAkZWwuZmluZChcIiNzZXF1ZW5jZXNcIikudmFsKFwiXCIpICMgY2xlYW4gdGV4dCBhcmVhXG5cbiAgICBAbW9kZWwuc2V0XG4gICAgICBzZXF1ZW5jZXMgOiBzZXF1ZW5jZXNcbiAgICAgIGFyY2hpdmVkICA6IEAkZWwuZmluZChcIiNhcmNoaXZlX2J1dHRvbnMgaW5wdXQ6Y2hlY2tlZFwiKS52YWwoKSA9PSBcInRydWVcIlxuICAgICAgbmFtZSAgICAgIDogQCRlbC5maW5kKFwiI2Fzc2Vzc21lbnRfbmFtZVwiKS52YWwoKVxuICAgICAgZEtleSAgICAgIDogQCRlbC5maW5kKFwiI2Fzc2Vzc21lbnRfZF9rZXlcIikudmFsKClcbiAgICAgIGFzc2Vzc21lbnRJZCA6IEBtb2RlbC5pZFxuICAgIHJldHVybiB0cnVlXG5cbiAgdG9nZ2xlTmV3U3VidGVzdEZvcm06IChldmVudCkgLT5cbiAgICBAJGVsLmZpbmQoXCIubmV3X3N1YnRlc3RfZm9ybSwgLm5ld19zdWJ0ZXN0X2J1dHRvblwiKS50b2dnbGUoKVxuXG4gICAgQCRlbC5maW5kKFwiI25ld19zdWJ0ZXN0X25hbWVcIikudmFsKFwiXCIpXG4gICAgQCRlbC5maW5kKFwiI3N1YnRlc3RfdHlwZV9zZWxlY3RcIikudmFsKFwibm9uZVwiKVxuXG4gICAgZmFsc2VcblxuICBzYXZlTmV3U3VidGVzdDogKGV2ZW50KSA9PlxuICAgIFxuICAgIGlmIGV2ZW50LnR5cGUgIT0gXCJjbGlja1wiICYmIGV2ZW50LndoaWNoICE9IDEzXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIFxuICAgICMgaWYgbm8gc3VidGVzdCB0eXBlIHNlbGVjdGVkLCBzaG93IGVycm9yXG4gICAgaWYgQCRlbC5maW5kKFwiI3N1YnRlc3RfdHlwZV9zZWxlY3Qgb3B0aW9uOnNlbGVjdGVkXCIpLnZhbCgpID09IFwibm9uZVwiXG4gICAgICBVdGlscy5taWRBbGVydCBcIlBsZWFzZSBzZWxlY3QgYSBzdWJ0ZXN0IHR5cGVcIlxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgXG4gICAgIyBnZW5lcmFsIHRlbXBsYXRlXG4gICAgbmV3QXR0cmlidXRlcyA9IFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwic3VidGVzdFwiKVxuICAgIFxuICAgICMgcHJvdG90eXBlIHRlbXBsYXRlXG4gICAgcHJvdG90eXBlVGVtcGxhdGUgPSBUYW5nZXJpbmUudGVtcGxhdGVzLmdldChcInByb3RvdHlwZXNcIilbQCRlbC5maW5kKFwiI3N1YnRlc3RfdHlwZV9zZWxlY3RcIikudmFsKCldXG4gICAgXG4gICAgIyBiaXQgbW9yZSBzcGVjaWZpYyB0ZW1wbGF0ZVxuICAgIHVzZVR5cGUgPSBAJGVsLmZpbmQoXCIjc3VidGVzdF90eXBlX3NlbGVjdCA6c2VsZWN0ZWRcIikuYXR0ciAnZGF0YS10ZW1wbGF0ZSdcbiAgICB1c2VUeXBlVGVtcGxhdGUgPSBUYW5nZXJpbmUudGVtcGxhdGVzLmdldChcInN1YnRlc3RUZW1wbGF0ZXNcIilbQCRlbC5maW5kKFwiI3N1YnRlc3RfdHlwZV9zZWxlY3RcIikudmFsKCldW3VzZVR5cGVdXG5cbiAgICBuZXdBdHRyaWJ1dGVzID0gJC5leHRlbmQgbmV3QXR0cmlidXRlcywgcHJvdG90eXBlVGVtcGxhdGVcbiAgICBuZXdBdHRyaWJ1dGVzID0gJC5leHRlbmQgbmV3QXR0cmlidXRlcywgdXNlVHlwZVRlbXBsYXRlXG4gICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIG5ld0F0dHJpYnV0ZXMsXG4gICAgICBuYW1lICAgICAgICAgOiBAJGVsLmZpbmQoXCIjbmV3X3N1YnRlc3RfbmFtZVwiKS52YWwoKVxuICAgICAgYXNzZXNzbWVudElkIDogQG1vZGVsLmlkXG4gICAgICBvcmRlciAgICAgICAgOiBAbW9kZWwuc3VidGVzdHMubGVuZ3RoXG4gICAgbmV3U3VidGVzdCA9IEBtb2RlbC5zdWJ0ZXN0cy5jcmVhdGUgbmV3QXR0cmlidXRlc1xuICAgIEB0b2dnbGVOZXdTdWJ0ZXN0Rm9ybSgpXG4gICAgcmV0dXJuIGZhbHNlXG4gIFxuICByZW5kZXI6ID0+XG4gICAgc2VxdWVuY2VzID0gXCJcIlxuICAgIGlmIEBtb2RlbC5oYXMoXCJzZXF1ZW5jZXNcIikgXG4gICAgICBzZXF1ZW5jZXMgPSBAbW9kZWwuZ2V0KFwic2VxdWVuY2VzXCIpXG4gICAgICBzZXF1ZW5jZXMgPSBzZXF1ZW5jZXMuam9pbihcIlxcblwiKVxuXG4gICAgICBpZiBfLmlzQXJyYXkoc2VxdWVuY2VzKVxuICAgICAgICBmb3Igc2VxdWVuY2VzLCBpIGluIHNlcXVlbmNlcyBcbiAgICAgICAgICBzZXF1ZW5jZXNbaV0gPSBzZXF1ZW5jZXMuam9pbihcIiwgXCIpXG5cbiAgICBzdWJ0ZXN0TGVnZW5kID0gQHVwZGF0ZVN1YnRlc3RMZWdlbmQoKVxuXG4gICAgYXJjaCA9IEBtb2RlbC5nZXQoJ2FyY2hpdmVkJylcbiAgICBhcmNoaXZlQ2hlY2tlZCAgICA9IGlmIChhcmNoID09IHRydWUgb3IgYXJjaCA9PSAndHJ1ZScpIHRoZW4gXCJjaGVja2VkXCIgZWxzZSBcIlwiXG4gICAgbm90QXJjaGl2ZUNoZWNrZWQgPSBpZiBhcmNoaXZlQ2hlY2tlZCB0aGVuIFwiXCIgZWxzZSBcImNoZWNrZWRcIlxuXG4gICAgIyBsaXN0IG9mIFwidGVtcGxhdGVzXCJcbiAgICBzdWJ0ZXN0VHlwZVNlbGVjdCA9IFwiPHNlbGVjdCBpZD0nc3VidGVzdF90eXBlX3NlbGVjdCc+XG4gICAgICA8b3B0aW9uIHZhbHVlPSdub25lJyBkaXNhYmxlZD0nZGlzYWJsZWQnIHNlbGVjdGVkPSdzZWxlY3RlZCc+UGxlYXNlIHNlbGVjdCBhIHN1YnRlc3QgdHlwZTwvb3B0aW9uPlwiXG4gICAgZm9yIGtleSwgdmFsdWUgb2YgVGFuZ2VyaW5lLnRlbXBsYXRlcy5nZXQoXCJzdWJ0ZXN0VGVtcGxhdGVzXCIpXG4gICAgICBzdWJ0ZXN0VHlwZVNlbGVjdCArPSBcIjxvcHRncm91cCBsYWJlbD0nI3trZXkuaHVtYW5pemUoKX0nPlwiXG4gICAgICBmb3Igc3ViS2V5LCBzdWJWYWx1ZSBvZiB2YWx1ZVxuICAgICAgICBzdWJ0ZXN0VHlwZVNlbGVjdCArPSBcIjxvcHRpb24gdmFsdWU9JyN7a2V5fScgZGF0YS10ZW1wbGF0ZT0nI3tzdWJLZXl9Jz4je3N1YktleX08L29wdGlvbj5cIlxuICAgICAgc3VidGVzdFR5cGVTZWxlY3QgKz0gXCI8L29wdGdyb3VwPlwiXG4gICAgc3VidGVzdFR5cGVTZWxlY3QgKz0gXCI8L3NlbGVjdD5cIlxuXG4gICAgXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8YnV0dG9uIGNsYXNzPSdiYWNrIG5hdmlnYXRpb24nPkJhY2s8L2J1dHRvbj5cbiAgICAgICAgPGgxPkFzc2Vzc21lbnQgQnVpbGRlcjwvaDE+XG4gICAgICA8ZGl2IGlkPSdiYXNpYyc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2Fzc2Vzc21lbnRfbmFtZSc+TmFtZTwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCBpZD0nYXNzZXNzbWVudF9uYW1lJyB2YWx1ZT0nI3tAbW9kZWwuZXNjYXBlKFwibmFtZVwiKX0nPlxuXG4gICAgICAgIDxsYWJlbCBmb3I9J2Fzc2Vzc21lbnRfZF9rZXknIHRpdGxlPSdUaGlzIGtleSBpcyB1c2VkIHRvIGltcG9ydCB0aGUgYXNzZXNzbWVudCBmcm9tIGEgdGFibGV0Lic+RG93bmxvYWQgS2V5PC9sYWJlbD48YnI+XG4gICAgICAgIDxkaXYgY2xhc3M9J2luZm9fYm94Jz4je0Btb2RlbC5pZC5zdWJzdHIoLTUsNSl9PC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGxhYmVsIHRpdGxlPSdPbmx5IGFjdGl2ZSBhc3Nlc3NtZW50cyB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgbWFpbiBhc3Nlc3NtZW50IGxpc3QuJz5TdGF0dXM8L2xhYmVsPjxicj5cbiAgICAgIDxkaXYgaWQ9J2FyY2hpdmVfYnV0dG9ucycgY2xhc3M9J2J1dHRvbnNldCc+XG4gICAgICAgIDxpbnB1dCB0eXBlPSdyYWRpbycgaWQ9J2FyY2hpdmVfZmFsc2UnIG5hbWU9J2FyY2hpdmUnIHZhbHVlPSdmYWxzZScgI3tub3RBcmNoaXZlQ2hlY2tlZH0+PGxhYmVsIGZvcj0nYXJjaGl2ZV9mYWxzZSc+QWN0aXZlPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IHR5cGU9J3JhZGlvJyBpZD0nYXJjaGl2ZV90cnVlJyAgbmFtZT0nYXJjaGl2ZScgdmFsdWU9J3RydWUnICAje2FyY2hpdmVDaGVja2VkfT48bGFiZWwgZm9yPSdhcmNoaXZlX3RydWUnPkFyY2hpdmVkPC9sYWJlbD5cbiAgICAgIDwvZGl2PlxuICAgICAgPGgyPlN1YnRlc3RzPC9oMj5cbiAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgPHVsIGlkPSdzdWJ0ZXN0X2xpc3QnPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmV3X3N1YnRlc3RfYnV0dG9uIGNvbW1hbmQnPkFkZCBTdWJ0ZXN0PC9idXR0b24+XG4gICAgICAgIDxkaXYgY2xhc3M9J25ld19zdWJ0ZXN0X2Zvcm0gY29uZmlybWF0aW9uJz5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgICAgICA8aDI+TmV3IFN1YnRlc3Q8L2gyPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0nc3VidGVzdF90eXBlX3NlbGVjdCc+VHlwZTwvbGFiZWw+PGJyPlxuICAgICAgICAgICAgI3tzdWJ0ZXN0VHlwZVNlbGVjdH08YnI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSduZXdfc3VidGVzdF9uYW1lJz5OYW1lPC9sYWJlbD48YnI+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT0ndGV4dCcgaWQ9J25ld19zdWJ0ZXN0X25hbWUnPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmV3X3N1YnRlc3Rfc2F2ZSBjb21tYW5kJz5BZGQ8L2J1dHRvbj4gPGJ1dHRvbiBjbGFzcz0nbmV3X3N1YnRlc3RfY2FuY2VsIGNvbW1hbmQnPkNhbmNlbDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGgyPk9wdGlvbnM8L2gyPlxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdzZXF1ZW5jZXMnIHRpdGxlPSdUaGlzIGlzIGEgbGlzdCBvZiBhY2NlcHRhYmxlIG9yZGVycyBvZiBzdWJ0ZXN0cywgd2hpY2ggd2lsbCBiZSByYW5kb21seSBzZWxlY3RlZCBlYWNoIHRpbWUgYW4gYXNzZXNzbWVudCBpcyBydW4uIFN1YnRlc3QgaW5kaWNpZXMgYXJlIHNlcGFyYXRlZCBieSBjb21tYXMsIG5ldyBsaW5lcyBzZXBhcmF0ZSBzZXF1ZW5jZXMuICc+UmFuZG9tIFNlcXVlbmNlczwvbGFiZWw+XG4gICAgICAgIDxkaXYgaWQ9J3N1YnRlc3RfbGVnZW5kJz4je3N1YnRlc3RMZWdlbmR9PC9kaXY+XG4gICAgICAgIDx0ZXh0YXJlYSBpZD0nc2VxdWVuY2VzJz4je3NlcXVlbmNlc308L3RleHRhcmVhPlxuICAgICAgPC9kaXY+XG4gICAgICA8YnV0dG9uIGNsYXNzPSdzYXZlIGNvbW1hbmQnPlNhdmU8L2J1dHRvbj5cbiAgICAgIFwiXG5cbiAgICAjIHJlbmRlciBuZXcgc3VidGVzdCB2aWV3c1xuICAgIEBzdWJ0ZXN0TGlzdEVkaXRWaWV3LnNldEVsZW1lbnQoQCRlbC5maW5kKFwiI3N1YnRlc3RfbGlzdFwiKSlcbiAgICBAc3VidGVzdExpc3RFZGl0Vmlldy5yZW5kZXIoKVxuICAgIFxuICAgICMgbWFrZSBpdCBzb3J0YWJsZVxuICAgIEAkZWwuZmluZChcIiNzdWJ0ZXN0X2xpc3RcIikuc29ydGFibGVcbiAgICAgIGhhbmRsZSA6ICcuc29ydGFibGVfaGFuZGxlJ1xuICAgICAgc3RhcnQ6IChldmVudCwgdWkpIC0+IHVpLml0ZW0uYWRkQ2xhc3MgXCJkcmFnX3NoYWRvd1wiXG4gICAgICBzdG9wOiAgKGV2ZW50LCB1aSkgLT4gdWkuaXRlbS5yZW1vdmVDbGFzcyBcImRyYWdfc2hhZG93XCJcbiAgICAgIHVwZGF0ZSA6IChldmVudCwgdWkpID0+XG4gICAgICAgIGZvciBpZCwgaSBpbiAoJChsaSkuYXR0cihcImRhdGEtaWRcIikgZm9yIGxpIGluIEAkZWwuZmluZChcIiNzdWJ0ZXN0X2xpc3QgbGlcIikpXG4gICAgICAgICAgQG1vZGVsLnN1YnRlc3RzLmdldChpZCkuc2V0KHtcIm9yZGVyXCI6aX0se3NpbGVudDp0cnVlfSkuc2F2ZShudWxsLHtzaWxlbnQ6dHJ1ZX0pXG4gICAgICAgIEBtb2RlbC5zdWJ0ZXN0cy5zb3J0KClcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4gIFxuICB1cGRhdGVTdWJ0ZXN0TGVnZW5kOiA9PlxuICAgIHN1YnRlc3RMZWdlbmQgPSBcIlwiXG4gICAgQG1vZGVsLnN1YnRlc3RzLmVhY2ggKHN1YnRlc3QsIGkpIC0+XG4gICAgICBzdWJ0ZXN0TGVnZW5kICs9IFwiPGRpdiBjbGFzcz0nc21hbGxfZ3JleSc+I3tpfSAtICN7c3VidGVzdC5nZXQoXCJuYW1lXCIpfTwvZGl2Pjxicj5cIlxuICAgICRzdWJ0ZXN0V3JhcHBlciA9IEAkZWwuZmluZChcIiNzdWJ0ZXN0X2xlZ2VuZFwiKVxuICAgICRzdWJ0ZXN0V3JhcHBlci5odG1sKHN1YnRlc3RMZWdlbmQpIGlmICRzdWJ0ZXN0V3JhcHBlci5sZW5ndGggIT0gMFxuICAgIHJldHVybiBzdWJ0ZXN0TGVnZW5kXG5cbiAgb25DbG9zZTogLT5cbiAgICBAc3VidGVzdExpc3RFZGl0Vmlldy5jbG9zZSgpXG4gICAgXG4iXX0=
