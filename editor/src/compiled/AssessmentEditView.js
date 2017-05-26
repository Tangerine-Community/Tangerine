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
    archiveChecked = (arch === true || arch === 'true') ? "checked" : "";
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXNzbWVudC9Bc3Nlc3NtZW50RWRpdFZpZXcuanMiLCJzb3VyY2VzIjpbImFzc2Vzc21lbnQvQXNzZXNzbWVudEVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGtCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7OytCQUVKLFNBQUEsR0FBWTs7K0JBRVosTUFBQSxHQUNFO0lBQUEsOEJBQUEsRUFBaUMsTUFBakM7SUFDQSxhQUFBLEVBQWlDLFFBRGpDO0lBRUEsMkJBQUEsRUFBaUMsc0JBRmpDO0lBR0EsMkJBQUEsRUFBaUMsc0JBSGpDO0lBS0EsNEJBQUEsRUFBaUMsZ0JBTGpDO0lBTUEseUJBQUEsRUFBaUMsZ0JBTmpDO0lBUUEscUJBQUEsRUFBaUMsTUFSakM7SUFTQSxhQUFBLEVBQWlDLE1BVGpDOzs7K0JBV0YsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO0lBQ2pCLElBQUMsQ0FBQSxtQkFBRCxHQUF1QixJQUFJLG1CQUFKLENBQ3JCO01BQUEsWUFBQSxFQUFlLElBQUMsQ0FBQSxLQUFoQjtLQURxQjtJQUd2QixJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFoQixDQUFtQixlQUFuQixFQUFvQyxJQUFDLENBQUEsbUJBQW1CLENBQUMsTUFBekQ7V0FDQSxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFoQixDQUFtQixLQUFuQixFQUEwQixJQUFDLENBQUEsbUJBQTNCO0VBTlU7OytCQVFaLElBQUEsR0FBTSxTQUFBO0lBQ0osSUFBRyxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUg7YUFDRSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxJQUFaLEVBQ0U7UUFBQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDUCxLQUFLLENBQUMsUUFBTixDQUFpQixDQUFDLEtBQUMsQ0FBQSxLQUFLLENBQUMsR0FB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RUFBTyxJQUFSO2FBQWpFO0FBREY7aUJBRUEsS0FBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBaEIsQ0FBQTtRQUhPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhUO0tBREY7V0FTQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUFwRk07OytCQXVGUixtQkFBQSxHQUFxQixTQUFBO0FBQ25CLFFBQUE7SUFBQSxhQUFBLEdBQWdCO0lBQ2hCLElBQUMsQ0FBQSxLQUFLLENBQUMsUUFBUSxDQUFDLElBQWhCLENBQXFCLFNBQUMsT0FBRCxFQUFVLENBQVY7YUFDbkIsYUFBQSxJQUFpQiwwQkFBQSxHQUEyQixDQUEzQixHQUE2QixLQUE3QixHQUFpQyxDQUFDLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBWixDQUFELENBQWpDLEdBQXNEO0lBRHBELENBQXJCO0lBRUEsZUFBQSxHQUFrQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxpQkFBVjtJQUNsQixJQUF1QyxlQUFlLENBQUMsTUFBaEIsS0FBMEIsQ0FBakU7TUFBQSxlQUFlLENBQUMsSUFBaEIsQ0FBcUIsYUFBckIsRUFBQTs7QUFDQSxXQUFPO0VBTlk7OytCQVFyQixPQUFBLEdBQVMsU0FBQTtXQUNQLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxLQUFyQixDQUFBO0VBRE87Ozs7R0EvTnNCLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEFzc2Vzc21lbnRFZGl0VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiAnYXNzZXNzbWVudF9lZGl0X3ZpZXcnXG5cbiAgZXZlbnRzIDpcbiAgICAnY2xpY2sgI2FyY2hpdmVfYnV0dG9ucyBpbnB1dCcgOiAnc2F2ZSdcbiAgICAnY2xpY2sgLmJhY2snICAgICAgICAgICAgICAgICAgOiAnZ29CYWNrJ1xuICAgICdjbGljayAubmV3X3N1YnRlc3RfYnV0dG9uJyAgICA6ICd0b2dnbGVOZXdTdWJ0ZXN0Rm9ybSdcbiAgICAnY2xpY2sgLm5ld19zdWJ0ZXN0X2NhbmNlbCcgICAgOiAndG9nZ2xlTmV3U3VidGVzdEZvcm0nXG5cbiAgICAna2V5cHJlc3MgI25ld19zdWJ0ZXN0X25hbWUnICAgOiAnc2F2ZU5ld1N1YnRlc3QnXG4gICAgJ2NsaWNrIC5uZXdfc3VidGVzdF9zYXZlJyAgICAgIDogJ3NhdmVOZXdTdWJ0ZXN0J1xuXG4gICAgJ2NoYW5nZSAjYmFzaWMgaW5wdXQnICAgICAgICAgIDogJ3NhdmUnXG4gICAgJ2NsaWNrIC5zYXZlJyAgICAgICAgICAgICAgICAgIDogJ3NhdmUnXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQG1vZGVsID0gb3B0aW9ucy5tb2RlbFxuICAgIEBzdWJ0ZXN0TGlzdEVkaXRWaWV3ID0gbmV3IFN1YnRlc3RMaXN0RWRpdFZpZXdcbiAgICAgIFwiYXNzZXNzbWVudFwiIDogQG1vZGVsXG5cbiAgICBAbW9kZWwuc3VidGVzdHMub24gXCJjaGFuZ2UgcmVtb3ZlXCIsIEBzdWJ0ZXN0TGlzdEVkaXRWaWV3LnJlbmRlclxuICAgIEBtb2RlbC5zdWJ0ZXN0cy5vbiBcImFsbFwiLCBAdXBkYXRlU3VidGVzdExlZ2VuZFxuXG4gIHNhdmU6ID0+XG4gICAgaWYgQHVwZGF0ZU1vZGVsKClcbiAgICAgIEBtb2RlbC5zYXZlIG51bGwsXG4gICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCIje0Btb2RlbC5nZXQoXCJuYW1lXCIpfSBzYXZlZFwiIFxuICAgICAgICBlcnJvcjogPT5cbiAgICAgICAgICBVdGlscy5taWRBbGVydCBcIkFzc2Vzc21lbnQgc2F2ZSBlcnJvci4gUGxlYXNlIHRyeSBhZ2Fpbi5cIiBcblxuICBnb0JhY2s6IC0+IFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJhc3Nlc3NtZW50c1wiLCB0cnVlXG5cbiAgdXBkYXRlTW9kZWw6ID0+XG5cbiAgICAjXG4gICAgIyBwYXJzZSBhY2NlcHRhYmxlIHJhbmRvbSBzZXF1ZW5jZXNcbiAgICAjXG5cbiAgICBzdWJ0ZXN0Q291bnQgPSBAbW9kZWwuc3VidGVzdHMubW9kZWxzLmxlbmd0aFxuXG4gICAgIyByZW1vdmUgZXZlcnl0aGluZyBleGNlcHQgbnVtYmVycywgY29tbWFzIGFuZCBuZXcgbGluZXNcbiAgICBzZXF1ZW5jZXNWYWx1ZSA9IEAkZWwuZmluZChcIiNzZXF1ZW5jZXNcIikudmFsKCkucmVwbGFjZSgvW14wLTksXFxuXS9nLFwiXCIpXG4gICAgc2VxdWVuY2VzID0gc2VxdWVuY2VzVmFsdWUuc3BsaXQoXCJcXG5cIilcblxuICAgICMgcGFyc2Ugc3RyaW5ncyB0byBudW1iZXJzIGFuZCBjb2xsZWN0IGVycm9yc1xuICAgIGZvciBzZXF1ZW5jZSwgaSBpbiBzZXF1ZW5jZXNcblxuICAgICAgc2VxdWVuY2UgPSBzZXF1ZW5jZS5zcGxpdChcIixcIilcbiAgICAgIGZvciBlbGVtZW50LCBqIGluIHNlcXVlbmNlXG4gICAgICAgIHNlcXVlbmNlW2pdID0gcGFyc2VJbnQoZWxlbWVudClcbiAgICAgICAgcmFuZ2VFcnJvciA9IHRydWUgaWYgc2VxdWVuY2Vbal0gPCAwIG9yIHNlcXVlbmNlW2pdID49IHN1YnRlc3RDb3VudFxuICAgICAgICBlbXB0eUVycm9yID0gdHJ1ZSBpZiBpc05hTihzZXF1ZW5jZVtqXSlcbiAgICAgIFxuICAgICAgc2VxdWVuY2VzW2ldID0gc2VxdWVuY2VcbiAgICAgIFxuICAgICAgIyBkZXRlY3QgZXJyb3JzXG4gICAgICB0b29NYW55RXJyb3IgPSB0cnVlIGlmIHNlcXVlbmNlLmxlbmd0aCA+IHN1YnRlc3RDb3VudFxuICAgICAgdG9vRmV3RXJyb3IgID0gdHJ1ZSBpZiBzZXF1ZW5jZS5sZW5ndGggPCBzdWJ0ZXN0Q291bnRcbiAgICAgIGRvdWJsZXNFcnJvciA9IHRydWUgaWYgc2VxdWVuY2UubGVuZ3RoICE9IF8udW5pcShzZXF1ZW5jZSkubGVuZ3RoXG4gICAgXG4gICAgIyBzaG93IGVycm9ycyBpZiB0aGV5IGV4aXN0IGFuZCBzZXF1ZW5jZXMgZXhpc3RcbiAgICBpZiBub3QgXy5pc0VtcHR5IF8ucmVqZWN0KCBfLmZsYXR0ZW4oc2VxdWVuY2VzKSwgKGUpIC0+IHJldHVybiBpc05hTihlKSkgIyByZW1vdmUgdW5wYXJzYWJsZSBlbXB0aWVzLCBkb24ndCBfLmNvbXBhY3QuIHdpbGwgcmVtb3ZlIDBzXG4gICAgICBzZXF1ZW5jZUVycm9ycyA9IFtdXG4gICAgICBpZiBlbXB0eUVycm9yICAgdGhlbiBzZXF1ZW5jZUVycm9ycy5wdXNoIFwiU29tZSBzZXF1ZW5jZXMgY29udGFpbiBlbXB0eSB2YWx1ZXMuXCJcbiAgICAgIGlmIHJhbmdlRXJyb3IgICB0aGVuIHNlcXVlbmNlRXJyb3JzLnB1c2ggXCJTb21lIG51bWJlcnMgZG8gbm90IHJlZmVyZW5jZSBhIHN1YnRlc3QgZnJvbSB0aGUgbGVnZW5kLlwiXG4gICAgICBpZiB0b29NYW55RXJyb3IgdGhlbiBzZXF1ZW5jZUVycm9ycy5wdXNoIFwiU29tZSBzZXF1ZW5jZXMgYXJlIGxvbmdlciB0aGFuIHRoZSB0b3RhbCBudW1iZXIgb2YgYWxsIHN1YnRlc3RzLlwiXG4gICAgICBpZiB0b29GZXdFcnJvciAgdGhlbiBzZXF1ZW5jZUVycm9ycy5wdXNoIFwiU29tZSBzZXF1ZW5jZXMgYXJlIHNob3J0ZXIgdGhhbiB0aGUgdG90YWwgbnVtYmVyIG9mIGFsbCBzdWJ0ZXN0cy5cIlxuICAgICAgaWYgZG91Ymxlc0Vycm9yIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgc2VxdWVuY2VzIGNvbnRhaW4gZG91Ymxlcy5cIlxuXG4gICAgICBpZiBzZXF1ZW5jZUVycm9ycy5sZW5ndGggPT0gMFxuICAgICAgICAjIGlmIHRoZXJlJ3Mgbm8gZXJyb3JzLCBjbGVhbiB1cCB0aGUgdGV4dGFyZWEgY29udGVudFxuICAgICAgICB2YWxpZGF0ZWRTZXF1ZW5jZXMgPSAoc2VxdWVuY2Uuam9pbihcIiwgXCIpIGZvciBzZXF1ZW5jZSBpbiBzZXF1ZW5jZXMpLmpvaW4oXCJcXG5cIilcbiAgICAgICAgQCRlbC5maW5kKFwiI3NlcXVlbmNlc1wiKS52YWwodmFsaWRhdGVkU2VxdWVuY2VzKVxuICAgICAgZWxzZSAjIGlmIHRoZXJlJ3MgZXJyb3JzLCB0aGV5IGNhbiBzdGlsbCBzYXZlLiBKdXN0IHNob3cgYSB3YXJuaW5nXG4gICAgICAgIGFsZXJ0IFwiV2FybmluZ1xcblxcbiN7c2VxdWVuY2VFcnJvcnMuam9pbihcIlxcblwiKX1cIlxuXG4gICAgIyBub3RoaW5nIHJlc2VtYmxpbmcgYSB2YWxpZCBzZXF1ZW5jZSB3YXMgZm91bmRcbiAgICBlbHNlXG4gICAgICBAJGVsLmZpbmQoXCIjc2VxdWVuY2VzXCIpLnZhbChcIlwiKSAjIGNsZWFuIHRleHQgYXJlYVxuXG4gICAgQG1vZGVsLnNldFxuICAgICAgc2VxdWVuY2VzIDogc2VxdWVuY2VzXG4gICAgICBhcmNoaXZlZCAgOiBAJGVsLmZpbmQoXCIjYXJjaGl2ZV9idXR0b25zIGlucHV0OmNoZWNrZWRcIikudmFsKCkgPT0gXCJ0cnVlXCJcbiAgICAgIG5hbWUgICAgICA6IEAkZWwuZmluZChcIiNhc3Nlc3NtZW50X25hbWVcIikudmFsKClcbiAgICAgIGRLZXkgICAgICA6IEAkZWwuZmluZChcIiNhc3Nlc3NtZW50X2Rfa2V5XCIpLnZhbCgpXG4gICAgICBhc3Nlc3NtZW50SWQgOiBAbW9kZWwuaWRcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHRvZ2dsZU5ld1N1YnRlc3RGb3JtOiAoZXZlbnQpIC0+XG4gICAgQCRlbC5maW5kKFwiLm5ld19zdWJ0ZXN0X2Zvcm0sIC5uZXdfc3VidGVzdF9idXR0b25cIikudG9nZ2xlKClcblxuICAgIEAkZWwuZmluZChcIiNuZXdfc3VidGVzdF9uYW1lXCIpLnZhbChcIlwiKVxuICAgIEAkZWwuZmluZChcIiNzdWJ0ZXN0X3R5cGVfc2VsZWN0XCIpLnZhbChcIm5vbmVcIilcblxuICAgIGZhbHNlXG5cbiAgc2F2ZU5ld1N1YnRlc3Q6IChldmVudCkgPT5cbiAgICBcbiAgICBpZiBldmVudC50eXBlICE9IFwiY2xpY2tcIiAmJiBldmVudC53aGljaCAhPSAxM1xuICAgICAgcmV0dXJuIHRydWVcbiAgICBcbiAgICAjIGlmIG5vIHN1YnRlc3QgdHlwZSBzZWxlY3RlZCwgc2hvdyBlcnJvclxuICAgIGlmIEAkZWwuZmluZChcIiNzdWJ0ZXN0X3R5cGVfc2VsZWN0IG9wdGlvbjpzZWxlY3RlZFwiKS52YWwoKSA9PSBcIm5vbmVcIlxuICAgICAgVXRpbHMubWlkQWxlcnQgXCJQbGVhc2Ugc2VsZWN0IGEgc3VidGVzdCB0eXBlXCJcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIFxuICAgICMgZ2VuZXJhbCB0ZW1wbGF0ZVxuICAgIG5ld0F0dHJpYnV0ZXMgPSBUYW5nZXJpbmUudGVtcGxhdGVzLmdldChcInN1YnRlc3RcIilcbiAgICBcbiAgICAjIHByb3RvdHlwZSB0ZW1wbGF0ZVxuICAgIHByb3RvdHlwZVRlbXBsYXRlID0gVGFuZ2VyaW5lLnRlbXBsYXRlcy5nZXQoXCJwcm90b3R5cGVzXCIpW0AkZWwuZmluZChcIiNzdWJ0ZXN0X3R5cGVfc2VsZWN0XCIpLnZhbCgpXVxuICAgIFxuICAgICMgYml0IG1vcmUgc3BlY2lmaWMgdGVtcGxhdGVcbiAgICB1c2VUeXBlID0gQCRlbC5maW5kKFwiI3N1YnRlc3RfdHlwZV9zZWxlY3QgOnNlbGVjdGVkXCIpLmF0dHIgJ2RhdGEtdGVtcGxhdGUnXG4gICAgdXNlVHlwZVRlbXBsYXRlID0gVGFuZ2VyaW5lLnRlbXBsYXRlcy5nZXQoXCJzdWJ0ZXN0VGVtcGxhdGVzXCIpW0AkZWwuZmluZChcIiNzdWJ0ZXN0X3R5cGVfc2VsZWN0XCIpLnZhbCgpXVt1c2VUeXBlXVxuXG4gICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIG5ld0F0dHJpYnV0ZXMsIHByb3RvdHlwZVRlbXBsYXRlXG4gICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIG5ld0F0dHJpYnV0ZXMsIHVzZVR5cGVUZW1wbGF0ZVxuICAgIG5ld0F0dHJpYnV0ZXMgPSAkLmV4dGVuZCBuZXdBdHRyaWJ1dGVzLFxuICAgICAgbmFtZSAgICAgICAgIDogQCRlbC5maW5kKFwiI25ld19zdWJ0ZXN0X25hbWVcIikudmFsKClcbiAgICAgIGFzc2Vzc21lbnRJZCA6IEBtb2RlbC5pZFxuICAgICAgb3JkZXIgICAgICAgIDogQG1vZGVsLnN1YnRlc3RzLmxlbmd0aFxuICAgIG5ld1N1YnRlc3QgPSBAbW9kZWwuc3VidGVzdHMuY3JlYXRlIG5ld0F0dHJpYnV0ZXNcbiAgICBAdG9nZ2xlTmV3U3VidGVzdEZvcm0oKVxuICAgIHJldHVybiBmYWxzZVxuICBcbiAgcmVuZGVyOiA9PlxuICAgIHNlcXVlbmNlcyA9IFwiXCJcbiAgICBpZiBAbW9kZWwuaGFzKFwic2VxdWVuY2VzXCIpIFxuICAgICAgc2VxdWVuY2VzID0gQG1vZGVsLmdldChcInNlcXVlbmNlc1wiKVxuICAgICAgc2VxdWVuY2VzID0gc2VxdWVuY2VzLmpvaW4oXCJcXG5cIilcblxuICAgICAgaWYgXy5pc0FycmF5KHNlcXVlbmNlcylcbiAgICAgICAgZm9yIHNlcXVlbmNlcywgaSBpbiBzZXF1ZW5jZXMgXG4gICAgICAgICAgc2VxdWVuY2VzW2ldID0gc2VxdWVuY2VzLmpvaW4oXCIsIFwiKVxuXG4gICAgc3VidGVzdExlZ2VuZCA9IEB1cGRhdGVTdWJ0ZXN0TGVnZW5kKClcblxuICAgIGFyY2ggPSBAbW9kZWwuZ2V0KCdhcmNoaXZlZCcpXG4gICAgYXJjaGl2ZUNoZWNrZWQgICAgPSBpZiAoYXJjaCA9PSB0cnVlIG9yIGFyY2ggPT0gJ3RydWUnKSB0aGVuIFwiY2hlY2tlZFwiIGVsc2UgXCJcIlxuICAgIG5vdEFyY2hpdmVDaGVja2VkID0gaWYgYXJjaGl2ZUNoZWNrZWQgdGhlbiBcIlwiIGVsc2UgXCJjaGVja2VkXCJcblxuICAgICMgbGlzdCBvZiBcInRlbXBsYXRlc1wiXG4gICAgc3VidGVzdFR5cGVTZWxlY3QgPSBcIjxzZWxlY3QgaWQ9J3N1YnRlc3RfdHlwZV9zZWxlY3QnPlxuICAgICAgPG9wdGlvbiB2YWx1ZT0nbm9uZScgZGlzYWJsZWQ9J2Rpc2FibGVkJyBzZWxlY3RlZD0nc2VsZWN0ZWQnPlBsZWFzZSBzZWxlY3QgYSBzdWJ0ZXN0IHR5cGU8L29wdGlvbj5cIlxuICAgIGZvciBrZXksIHZhbHVlIG9mIFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwic3VidGVzdFRlbXBsYXRlc1wiKVxuICAgICAgc3VidGVzdFR5cGVTZWxlY3QgKz0gXCI8b3B0Z3JvdXAgbGFiZWw9JyN7a2V5Lmh1bWFuaXplKCl9Jz5cIlxuICAgICAgZm9yIHN1YktleSwgc3ViVmFsdWUgb2YgdmFsdWVcbiAgICAgICAgc3VidGVzdFR5cGVTZWxlY3QgKz0gXCI8b3B0aW9uIHZhbHVlPScje2tleX0nIGRhdGEtdGVtcGxhdGU9JyN7c3ViS2V5fSc+I3tzdWJLZXl9PC9vcHRpb24+XCJcbiAgICAgIHN1YnRlc3RUeXBlU2VsZWN0ICs9IFwiPC9vcHRncm91cD5cIlxuICAgIHN1YnRlc3RUeXBlU2VsZWN0ICs9IFwiPC9zZWxlY3Q+XCJcblxuICAgIFxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGJ1dHRvbiBjbGFzcz0nYmFjayBuYXZpZ2F0aW9uJz5CYWNrPC9idXR0b24+XG4gICAgICAgIDxoMT5Bc3Nlc3NtZW50IEJ1aWxkZXI8L2gxPlxuICAgICAgPGRpdiBpZD0nYmFzaWMnPlxuICAgICAgICA8bGFiZWwgZm9yPSdhc3Nlc3NtZW50X25hbWUnPk5hbWU8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgaWQ9J2Fzc2Vzc21lbnRfbmFtZScgdmFsdWU9JyN7QG1vZGVsLmVzY2FwZShcIm5hbWVcIil9Jz5cblxuICAgICAgICA8bGFiZWwgZm9yPSdhc3Nlc3NtZW50X2Rfa2V5JyB0aXRsZT0nVGhpcyBrZXkgaXMgdXNlZCB0byBpbXBvcnQgdGhlIGFzc2Vzc21lbnQgZnJvbSBhIHRhYmxldC4nPkRvd25sb2FkIEtleTwvbGFiZWw+PGJyPlxuICAgICAgICA8ZGl2IGNsYXNzPSdpbmZvX2JveCc+I3tAbW9kZWwuaWQuc3Vic3RyKC01LDUpfTwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxsYWJlbCB0aXRsZT0nT25seSBhY3RpdmUgYXNzZXNzbWVudHMgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIG1haW4gYXNzZXNzbWVudCBsaXN0Lic+U3RhdHVzPC9sYWJlbD48YnI+XG4gICAgICA8ZGl2IGlkPSdhcmNoaXZlX2J1dHRvbnMnIGNsYXNzPSdidXR0b25zZXQnPlxuICAgICAgICA8aW5wdXQgdHlwZT0ncmFkaW8nIGlkPSdhcmNoaXZlX2ZhbHNlJyBuYW1lPSdhcmNoaXZlJyB2YWx1ZT0nZmFsc2UnICN7bm90QXJjaGl2ZUNoZWNrZWR9PjxsYWJlbCBmb3I9J2FyY2hpdmVfZmFsc2UnPkFjdGl2ZTwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCB0eXBlPSdyYWRpbycgaWQ9J2FyY2hpdmVfdHJ1ZScgIG5hbWU9J2FyY2hpdmUnIHZhbHVlPSd0cnVlJyAgI3thcmNoaXZlQ2hlY2tlZH0+PGxhYmVsIGZvcj0nYXJjaGl2ZV90cnVlJz5BcmNoaXZlZDwvbGFiZWw+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxoMj5TdWJ0ZXN0czwvaDI+XG4gICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgIDxkaXY+XG4gICAgICAgIDx1bCBpZD0nc3VidGVzdF9saXN0Jz5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxidXR0b24gY2xhc3M9J25ld19zdWJ0ZXN0X2J1dHRvbiBjb21tYW5kJz5BZGQgU3VidGVzdDwvYnV0dG9uPlxuICAgICAgICA8ZGl2IGNsYXNzPSduZXdfc3VidGVzdF9mb3JtIGNvbmZpcm1hdGlvbic+XG4gICAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgICAgPGgyPk5ldyBTdWJ0ZXN0PC9oMj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J3N1YnRlc3RfdHlwZV9zZWxlY3QnPlR5cGU8L2xhYmVsPjxicj5cbiAgICAgICAgICAgICN7c3VidGVzdFR5cGVTZWxlY3R9PGJyPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0nbmV3X3N1YnRlc3RfbmFtZSc+TmFtZTwvbGFiZWw+PGJyPlxuICAgICAgICAgICAgPGlucHV0IHR5cGU9J3RleHQnIGlkPSduZXdfc3VidGVzdF9uYW1lJz5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25ld19zdWJ0ZXN0X3NhdmUgY29tbWFuZCc+QWRkPC9idXR0b24+IDxidXR0b24gY2xhc3M9J25ld19zdWJ0ZXN0X2NhbmNlbCBjb21tYW5kJz5DYW5jZWw8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxoMj5PcHRpb25zPC9oMj5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nc2VxdWVuY2VzJyB0aXRsZT0nVGhpcyBpcyBhIGxpc3Qgb2YgYWNjZXB0YWJsZSBvcmRlcnMgb2Ygc3VidGVzdHMsIHdoaWNoIHdpbGwgYmUgcmFuZG9tbHkgc2VsZWN0ZWQgZWFjaCB0aW1lIGFuIGFzc2Vzc21lbnQgaXMgcnVuLiBTdWJ0ZXN0IGluZGljaWVzIGFyZSBzZXBhcmF0ZWQgYnkgY29tbWFzLCBuZXcgbGluZXMgc2VwYXJhdGUgc2VxdWVuY2VzLiAnPlJhbmRvbSBTZXF1ZW5jZXM8L2xhYmVsPlxuICAgICAgICA8ZGl2IGlkPSdzdWJ0ZXN0X2xlZ2VuZCc+I3tzdWJ0ZXN0TGVnZW5kfTwvZGl2PlxuICAgICAgICA8dGV4dGFyZWEgaWQ9J3NlcXVlbmNlcyc+I3tzZXF1ZW5jZXN9PC90ZXh0YXJlYT5cbiAgICAgIDwvZGl2PlxuICAgICAgPGJ1dHRvbiBjbGFzcz0nc2F2ZSBjb21tYW5kJz5TYXZlPC9idXR0b24+XG4gICAgICBcIlxuXG4gICAgIyByZW5kZXIgbmV3IHN1YnRlc3Qgdmlld3NcbiAgICBAc3VidGVzdExpc3RFZGl0Vmlldy5zZXRFbGVtZW50KEAkZWwuZmluZChcIiNzdWJ0ZXN0X2xpc3RcIikpXG4gICAgQHN1YnRlc3RMaXN0RWRpdFZpZXcucmVuZGVyKClcbiAgICBcbiAgICAjIG1ha2UgaXQgc29ydGFibGVcbiAgICBAJGVsLmZpbmQoXCIjc3VidGVzdF9saXN0XCIpLnNvcnRhYmxlXG4gICAgICBoYW5kbGUgOiAnLnNvcnRhYmxlX2hhbmRsZSdcbiAgICAgIHN0YXJ0OiAoZXZlbnQsIHVpKSAtPiB1aS5pdGVtLmFkZENsYXNzIFwiZHJhZ19zaGFkb3dcIlxuICAgICAgc3RvcDogIChldmVudCwgdWkpIC0+IHVpLml0ZW0ucmVtb3ZlQ2xhc3MgXCJkcmFnX3NoYWRvd1wiXG4gICAgICB1cGRhdGUgOiAoZXZlbnQsIHVpKSA9PlxuICAgICAgICBmb3IgaWQsIGkgaW4gKCQobGkpLmF0dHIoXCJkYXRhLWlkXCIpIGZvciBsaSBpbiBAJGVsLmZpbmQoXCIjc3VidGVzdF9saXN0IGxpXCIpKVxuICAgICAgICAgIEBtb2RlbC5zdWJ0ZXN0cy5nZXQoaWQpLnNldCh7XCJvcmRlclwiOml9LHtzaWxlbnQ6dHJ1ZX0pLnNhdmUobnVsbCx7c2lsZW50OnRydWV9KVxuICAgICAgICBAbW9kZWwuc3VidGVzdHMuc29ydCgpXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICBcbiAgdXBkYXRlU3VidGVzdExlZ2VuZDogPT5cbiAgICBzdWJ0ZXN0TGVnZW5kID0gXCJcIlxuICAgIEBtb2RlbC5zdWJ0ZXN0cy5lYWNoIChzdWJ0ZXN0LCBpKSAtPlxuICAgICAgc3VidGVzdExlZ2VuZCArPSBcIjxkaXYgY2xhc3M9J3NtYWxsX2dyZXknPiN7aX0gLSAje3N1YnRlc3QuZ2V0KFwibmFtZVwiKX08L2Rpdj48YnI+XCJcbiAgICAkc3VidGVzdFdyYXBwZXIgPSBAJGVsLmZpbmQoXCIjc3VidGVzdF9sZWdlbmRcIilcbiAgICAkc3VidGVzdFdyYXBwZXIuaHRtbChzdWJ0ZXN0TGVnZW5kKSBpZiAkc3VidGVzdFdyYXBwZXIubGVuZ3RoICE9IDBcbiAgICByZXR1cm4gc3VidGVzdExlZ2VuZFxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgQHN1YnRlc3RMaXN0RWRpdFZpZXcuY2xvc2UoKVxuICAgIFxuIl19
