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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2Vzc21lbnQvQXNzZXNzbWVudEVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGtCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7OytCQUVKLFNBQUEsR0FBWTs7K0JBRVosTUFBQSxHQUNFO0lBQUEsOEJBQUEsRUFBaUMsTUFBakM7SUFDQSxhQUFBLEVBQWlDLFFBRGpDO0lBRUEsMkJBQUEsRUFBaUMsc0JBRmpDO0lBR0EsMkJBQUEsRUFBaUMsc0JBSGpDO0lBS0EsNEJBQUEsRUFBaUMsZ0JBTGpDO0lBTUEseUJBQUEsRUFBaUMsZ0JBTmpDO0lBUUEscUJBQUEsRUFBaUMsTUFSakM7SUFTQSxhQUFBLEVBQWlDLE1BVGpDOzs7K0JBV0YsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO0lBQ2pCLElBQUMsQ0FBQSxtQkFBRCxHQUEyQixJQUFBLG1CQUFBLENBQ3pCO01BQUEsWUFBQSxFQUFlLElBQUMsQ0FBQSxLQUFoQjtLQUR5QjtJQUczQixJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFoQixDQUFtQixlQUFuQixFQUFvQyxJQUFDLENBQUEsbUJBQW1CLENBQUMsTUFBekQ7V0FDQSxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFoQixDQUFtQixLQUFuQixFQUEwQixJQUFDLENBQUEsbUJBQTNCO0VBTlU7OytCQVFaLElBQUEsR0FBTSxTQUFBO0lBQ0osSUFBRyxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUg7YUFDRSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxJQUFaLEVBQ0U7UUFBQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDUCxLQUFLLENBQUMsUUFBTixDQUFpQixDQUFDLEtBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBRCxDQUFBLEdBQW9CLFFBQXJDO1VBRE87UUFB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Q0FBQyxJQUFoQixDQUFBO1FBSE87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSFQ7S0FERjtXQVNBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQXBGTTs7K0JBdUZSLG1CQUFBLEdBQXFCLFNBQUE7QUFDbkIsUUFBQTtJQUFBLGFBQUEsR0FBZ0I7SUFDaEIsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBaEIsQ0FBcUIsU0FBQyxPQUFELEVBQVUsQ0FBVjthQUNuQixhQUFBLElBQWlCLDBCQUFBLEdBQTJCLENBQTNCLEdBQTZCLEtBQTdCLEdBQWlDLENBQUMsT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLENBQUQsQ0FBakMsR0FBc0Q7SUFEcEQsQ0FBckI7SUFFQSxlQUFBLEdBQWtCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlCQUFWO0lBQ2xCLElBQXVDLGVBQWUsQ0FBQyxNQUFoQixLQUEwQixDQUFqRTtNQUFBLGVBQWUsQ0FBQyxJQUFoQixDQUFxQixhQUFyQixFQUFBOztBQUNBLFdBQU87RUFOWTs7K0JBUXJCLE9BQUEsR0FBUyxTQUFBO1dBQ1AsSUFBQyxDQUFBLG1CQUFtQixDQUFDLEtBQXJCLENBQUE7RUFETzs7OztHQS9Oc0IsUUFBUSxDQUFDIiwiZmlsZSI6ImFzc2Vzc21lbnQvQXNzZXNzbWVudEVkaXRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQXNzZXNzbWVudEVkaXRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6ICdhc3Nlc3NtZW50X2VkaXRfdmlldydcblxuICBldmVudHMgOlxuICAgICdjbGljayAjYXJjaGl2ZV9idXR0b25zIGlucHV0JyA6ICdzYXZlJ1xuICAgICdjbGljayAuYmFjaycgICAgICAgICAgICAgICAgICA6ICdnb0JhY2snXG4gICAgJ2NsaWNrIC5uZXdfc3VidGVzdF9idXR0b24nICAgIDogJ3RvZ2dsZU5ld1N1YnRlc3RGb3JtJ1xuICAgICdjbGljayAubmV3X3N1YnRlc3RfY2FuY2VsJyAgICA6ICd0b2dnbGVOZXdTdWJ0ZXN0Rm9ybSdcblxuICAgICdrZXlwcmVzcyAjbmV3X3N1YnRlc3RfbmFtZScgICA6ICdzYXZlTmV3U3VidGVzdCdcbiAgICAnY2xpY2sgLm5ld19zdWJ0ZXN0X3NhdmUnICAgICAgOiAnc2F2ZU5ld1N1YnRlc3QnXG5cbiAgICAnY2hhbmdlICNiYXNpYyBpbnB1dCcgICAgICAgICAgOiAnc2F2ZSdcbiAgICAnY2xpY2sgLnNhdmUnICAgICAgICAgICAgICAgICAgOiAnc2F2ZSdcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBAbW9kZWwgPSBvcHRpb25zLm1vZGVsXG4gICAgQHN1YnRlc3RMaXN0RWRpdFZpZXcgPSBuZXcgU3VidGVzdExpc3RFZGl0Vmlld1xuICAgICAgXCJhc3Nlc3NtZW50XCIgOiBAbW9kZWxcblxuICAgIEBtb2RlbC5zdWJ0ZXN0cy5vbiBcImNoYW5nZSByZW1vdmVcIiwgQHN1YnRlc3RMaXN0RWRpdFZpZXcucmVuZGVyXG4gICAgQG1vZGVsLnN1YnRlc3RzLm9uIFwiYWxsXCIsIEB1cGRhdGVTdWJ0ZXN0TGVnZW5kXG5cbiAgc2F2ZTogPT5cbiAgICBpZiBAdXBkYXRlTW9kZWwoKVxuICAgICAgQG1vZGVsLnNhdmUgbnVsbCxcbiAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICBVdGlscy5taWRBbGVydCBcIiN7QG1vZGVsLmdldChcIm5hbWVcIil9IHNhdmVkXCIgXG4gICAgICAgIGVycm9yOiA9PlxuICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiQXNzZXNzbWVudCBzYXZlIGVycm9yLiBQbGVhc2UgdHJ5IGFnYWluLlwiXG5cbiAgZ29CYWNrOiAtPiBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiYXNzZXNzbWVudHNcIiwgdHJ1ZVxuXG4gIHVwZGF0ZU1vZGVsOiA9PlxuXG4gICAgI1xuICAgICMgcGFyc2UgYWNjZXB0YWJsZSByYW5kb20gc2VxdWVuY2VzXG4gICAgI1xuXG4gICAgc3VidGVzdENvdW50ID0gQG1vZGVsLnN1YnRlc3RzLm1vZGVscy5sZW5ndGhcblxuICAgICMgcmVtb3ZlIGV2ZXJ5dGhpbmcgZXhjZXB0IG51bWJlcnMsIGNvbW1hcyBhbmQgbmV3IGxpbmVzXG4gICAgc2VxdWVuY2VzVmFsdWUgPSBAJGVsLmZpbmQoXCIjc2VxdWVuY2VzXCIpLnZhbCgpLnJlcGxhY2UoL1teMC05LFxcbl0vZyxcIlwiKVxuICAgIHNlcXVlbmNlcyA9IHNlcXVlbmNlc1ZhbHVlLnNwbGl0KFwiXFxuXCIpXG5cbiAgICAjIHBhcnNlIHN0cmluZ3MgdG8gbnVtYmVycyBhbmQgY29sbGVjdCBlcnJvcnNcbiAgICBmb3Igc2VxdWVuY2UsIGkgaW4gc2VxdWVuY2VzXG5cbiAgICAgIHNlcXVlbmNlID0gc2VxdWVuY2Uuc3BsaXQoXCIsXCIpXG4gICAgICBmb3IgZWxlbWVudCwgaiBpbiBzZXF1ZW5jZVxuICAgICAgICBzZXF1ZW5jZVtqXSA9IHBhcnNlSW50KGVsZW1lbnQpXG4gICAgICAgIHJhbmdlRXJyb3IgPSB0cnVlIGlmIHNlcXVlbmNlW2pdIDwgMCBvciBzZXF1ZW5jZVtqXSA+PSBzdWJ0ZXN0Q291bnRcbiAgICAgICAgZW1wdHlFcnJvciA9IHRydWUgaWYgaXNOYU4oc2VxdWVuY2Vbal0pXG4gICAgICBcbiAgICAgIHNlcXVlbmNlc1tpXSA9IHNlcXVlbmNlXG4gICAgICBcbiAgICAgICMgZGV0ZWN0IGVycm9yc1xuICAgICAgdG9vTWFueUVycm9yID0gdHJ1ZSBpZiBzZXF1ZW5jZS5sZW5ndGggPiBzdWJ0ZXN0Q291bnRcbiAgICAgIHRvb0Zld0Vycm9yICA9IHRydWUgaWYgc2VxdWVuY2UubGVuZ3RoIDwgc3VidGVzdENvdW50XG4gICAgICBkb3VibGVzRXJyb3IgPSB0cnVlIGlmIHNlcXVlbmNlLmxlbmd0aCAhPSBfLnVuaXEoc2VxdWVuY2UpLmxlbmd0aFxuICAgIFxuICAgICMgc2hvdyBlcnJvcnMgaWYgdGhleSBleGlzdCBhbmQgc2VxdWVuY2VzIGV4aXN0XG4gICAgaWYgbm90IF8uaXNFbXB0eSBfLnJlamVjdCggXy5mbGF0dGVuKHNlcXVlbmNlcyksIChlKSAtPiByZXR1cm4gaXNOYU4oZSkpICMgcmVtb3ZlIHVucGFyc2FibGUgZW1wdGllcywgZG9uJ3QgXy5jb21wYWN0LiB3aWxsIHJlbW92ZSAwc1xuICAgICAgc2VxdWVuY2VFcnJvcnMgPSBbXVxuICAgICAgaWYgZW1wdHlFcnJvciAgIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgc2VxdWVuY2VzIGNvbnRhaW4gZW1wdHkgdmFsdWVzLlwiXG4gICAgICBpZiByYW5nZUVycm9yICAgdGhlbiBzZXF1ZW5jZUVycm9ycy5wdXNoIFwiU29tZSBudW1iZXJzIGRvIG5vdCByZWZlcmVuY2UgYSBzdWJ0ZXN0IGZyb20gdGhlIGxlZ2VuZC5cIlxuICAgICAgaWYgdG9vTWFueUVycm9yIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgc2VxdWVuY2VzIGFyZSBsb25nZXIgdGhhbiB0aGUgdG90YWwgbnVtYmVyIG9mIGFsbCBzdWJ0ZXN0cy5cIlxuICAgICAgaWYgdG9vRmV3RXJyb3IgIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgc2VxdWVuY2VzIGFyZSBzaG9ydGVyIHRoYW4gdGhlIHRvdGFsIG51bWJlciBvZiBhbGwgc3VidGVzdHMuXCJcbiAgICAgIGlmIGRvdWJsZXNFcnJvciB0aGVuIHNlcXVlbmNlRXJyb3JzLnB1c2ggXCJTb21lIHNlcXVlbmNlcyBjb250YWluIGRvdWJsZXMuXCJcblxuICAgICAgaWYgc2VxdWVuY2VFcnJvcnMubGVuZ3RoID09IDBcbiAgICAgICAgIyBpZiB0aGVyZSdzIG5vIGVycm9ycywgY2xlYW4gdXAgdGhlIHRleHRhcmVhIGNvbnRlbnRcbiAgICAgICAgdmFsaWRhdGVkU2VxdWVuY2VzID0gKHNlcXVlbmNlLmpvaW4oXCIsIFwiKSBmb3Igc2VxdWVuY2UgaW4gc2VxdWVuY2VzKS5qb2luKFwiXFxuXCIpXG4gICAgICAgIEAkZWwuZmluZChcIiNzZXF1ZW5jZXNcIikudmFsKHZhbGlkYXRlZFNlcXVlbmNlcylcbiAgICAgIGVsc2UgIyBpZiB0aGVyZSdzIGVycm9ycywgdGhleSBjYW4gc3RpbGwgc2F2ZS4gSnVzdCBzaG93IGEgd2FybmluZ1xuICAgICAgICBhbGVydCBcIldhcm5pbmdcXG5cXG4je3NlcXVlbmNlRXJyb3JzLmpvaW4oXCJcXG5cIil9XCJcblxuICAgICMgbm90aGluZyByZXNlbWJsaW5nIGEgdmFsaWQgc2VxdWVuY2Ugd2FzIGZvdW5kXG4gICAgZWxzZVxuICAgICAgQCRlbC5maW5kKFwiI3NlcXVlbmNlc1wiKS52YWwoXCJcIikgIyBjbGVhbiB0ZXh0IGFyZWFcblxuICAgIEBtb2RlbC5zZXRcbiAgICAgIHNlcXVlbmNlcyA6IHNlcXVlbmNlc1xuICAgICAgYXJjaGl2ZWQgIDogQCRlbC5maW5kKFwiI2FyY2hpdmVfYnV0dG9ucyBpbnB1dDpjaGVja2VkXCIpLnZhbCgpID09IFwidHJ1ZVwiXG4gICAgICBuYW1lICAgICAgOiBAJGVsLmZpbmQoXCIjYXNzZXNzbWVudF9uYW1lXCIpLnZhbCgpXG4gICAgICBkS2V5ICAgICAgOiBAJGVsLmZpbmQoXCIjYXNzZXNzbWVudF9kX2tleVwiKS52YWwoKVxuICAgICAgYXNzZXNzbWVudElkIDogQG1vZGVsLmlkXG4gICAgcmV0dXJuIHRydWVcblxuICB0b2dnbGVOZXdTdWJ0ZXN0Rm9ybTogKGV2ZW50KSAtPlxuICAgIEAkZWwuZmluZChcIi5uZXdfc3VidGVzdF9mb3JtLCAubmV3X3N1YnRlc3RfYnV0dG9uXCIpLnRvZ2dsZSgpXG5cbiAgICBAJGVsLmZpbmQoXCIjbmV3X3N1YnRlc3RfbmFtZVwiKS52YWwoXCJcIilcbiAgICBAJGVsLmZpbmQoXCIjc3VidGVzdF90eXBlX3NlbGVjdFwiKS52YWwoXCJub25lXCIpXG5cbiAgICBmYWxzZVxuXG4gIHNhdmVOZXdTdWJ0ZXN0OiAoZXZlbnQpID0+XG4gICAgXG4gICAgaWYgZXZlbnQudHlwZSAhPSBcImNsaWNrXCIgJiYgZXZlbnQud2hpY2ggIT0gMTNcbiAgICAgIHJldHVybiB0cnVlXG4gICAgXG4gICAgIyBpZiBubyBzdWJ0ZXN0IHR5cGUgc2VsZWN0ZWQsIHNob3cgZXJyb3JcbiAgICBpZiBAJGVsLmZpbmQoXCIjc3VidGVzdF90eXBlX3NlbGVjdCBvcHRpb246c2VsZWN0ZWRcIikudmFsKCkgPT0gXCJub25lXCJcbiAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiUGxlYXNlIHNlbGVjdCBhIHN1YnRlc3QgdHlwZVwiXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICBcbiAgICAjIGdlbmVyYWwgdGVtcGxhdGVcbiAgICBuZXdBdHRyaWJ1dGVzID0gVGFuZ2VyaW5lLnRlbXBsYXRlcy5nZXQoXCJzdWJ0ZXN0XCIpXG4gICAgXG4gICAgIyBwcm90b3R5cGUgdGVtcGxhdGVcbiAgICBwcm90b3R5cGVUZW1wbGF0ZSA9IFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwicHJvdG90eXBlc1wiKVtAJGVsLmZpbmQoXCIjc3VidGVzdF90eXBlX3NlbGVjdFwiKS52YWwoKV1cbiAgICBcbiAgICAjIGJpdCBtb3JlIHNwZWNpZmljIHRlbXBsYXRlXG4gICAgdXNlVHlwZSA9IEAkZWwuZmluZChcIiNzdWJ0ZXN0X3R5cGVfc2VsZWN0IDpzZWxlY3RlZFwiKS5hdHRyICdkYXRhLXRlbXBsYXRlJ1xuICAgIHVzZVR5cGVUZW1wbGF0ZSA9IFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwic3VidGVzdFRlbXBsYXRlc1wiKVtAJGVsLmZpbmQoXCIjc3VidGVzdF90eXBlX3NlbGVjdFwiKS52YWwoKV1bdXNlVHlwZV1cblxuICAgIG5ld0F0dHJpYnV0ZXMgPSAkLmV4dGVuZCBuZXdBdHRyaWJ1dGVzLCBwcm90b3R5cGVUZW1wbGF0ZVxuICAgIG5ld0F0dHJpYnV0ZXMgPSAkLmV4dGVuZCBuZXdBdHRyaWJ1dGVzLCB1c2VUeXBlVGVtcGxhdGVcbiAgICBuZXdBdHRyaWJ1dGVzID0gJC5leHRlbmQgbmV3QXR0cmlidXRlcyxcbiAgICAgIG5hbWUgICAgICAgICA6IEAkZWwuZmluZChcIiNuZXdfc3VidGVzdF9uYW1lXCIpLnZhbCgpXG4gICAgICBhc3Nlc3NtZW50SWQgOiBAbW9kZWwuaWRcbiAgICAgIG9yZGVyICAgICAgICA6IEBtb2RlbC5zdWJ0ZXN0cy5sZW5ndGhcbiAgICBuZXdTdWJ0ZXN0ID0gQG1vZGVsLnN1YnRlc3RzLmNyZWF0ZSBuZXdBdHRyaWJ1dGVzXG4gICAgQHRvZ2dsZU5ld1N1YnRlc3RGb3JtKClcbiAgICByZXR1cm4gZmFsc2VcbiAgXG4gIHJlbmRlcjogPT5cbiAgICBzZXF1ZW5jZXMgPSBcIlwiXG4gICAgaWYgQG1vZGVsLmhhcyhcInNlcXVlbmNlc1wiKSBcbiAgICAgIHNlcXVlbmNlcyA9IEBtb2RlbC5nZXQoXCJzZXF1ZW5jZXNcIilcbiAgICAgIHNlcXVlbmNlcyA9IHNlcXVlbmNlcy5qb2luKFwiXFxuXCIpXG5cbiAgICAgIGlmIF8uaXNBcnJheShzZXF1ZW5jZXMpXG4gICAgICAgIGZvciBzZXF1ZW5jZXMsIGkgaW4gc2VxdWVuY2VzIFxuICAgICAgICAgIHNlcXVlbmNlc1tpXSA9IHNlcXVlbmNlcy5qb2luKFwiLCBcIilcblxuICAgIHN1YnRlc3RMZWdlbmQgPSBAdXBkYXRlU3VidGVzdExlZ2VuZCgpXG5cbiAgICBhcmNoID0gQG1vZGVsLmdldCgnYXJjaGl2ZWQnKVxuICAgIGFyY2hpdmVDaGVja2VkICAgID0gaWYgKGFyY2ggPT0gdHJ1ZSBvciBhcmNoID09ICd0cnVlJykgdGhlbiBcImNoZWNrZWRcIiBlbHNlIFwiXCJcbiAgICBub3RBcmNoaXZlQ2hlY2tlZCA9IGlmIGFyY2hpdmVDaGVja2VkIHRoZW4gXCJcIiBlbHNlIFwiY2hlY2tlZFwiXG5cbiAgICAjIGxpc3Qgb2YgXCJ0ZW1wbGF0ZXNcIlxuICAgIHN1YnRlc3RUeXBlU2VsZWN0ID0gXCI8c2VsZWN0IGlkPSdzdWJ0ZXN0X3R5cGVfc2VsZWN0Jz5cbiAgICAgIDxvcHRpb24gdmFsdWU9J25vbmUnIGRpc2FibGVkPSdkaXNhYmxlZCcgc2VsZWN0ZWQ9J3NlbGVjdGVkJz5QbGVhc2Ugc2VsZWN0IGEgc3VidGVzdCB0eXBlPC9vcHRpb24+XCJcbiAgICBmb3Iga2V5LCB2YWx1ZSBvZiBUYW5nZXJpbmUudGVtcGxhdGVzLmdldChcInN1YnRlc3RUZW1wbGF0ZXNcIilcbiAgICAgIHN1YnRlc3RUeXBlU2VsZWN0ICs9IFwiPG9wdGdyb3VwIGxhYmVsPScje2tleS5odW1hbml6ZSgpfSc+XCJcbiAgICAgIGZvciBzdWJLZXksIHN1YlZhbHVlIG9mIHZhbHVlXG4gICAgICAgIHN1YnRlc3RUeXBlU2VsZWN0ICs9IFwiPG9wdGlvbiB2YWx1ZT0nI3trZXl9JyBkYXRhLXRlbXBsYXRlPScje3N1YktleX0nPiN7c3ViS2V5fTwvb3B0aW9uPlwiXG4gICAgICBzdWJ0ZXN0VHlwZVNlbGVjdCArPSBcIjwvb3B0Z3JvdXA+XCJcbiAgICBzdWJ0ZXN0VHlwZVNlbGVjdCArPSBcIjwvc2VsZWN0PlwiXG5cbiAgICBcbiAgICBAJGVsLmh0bWwgXCJcbiAgICAgIDxidXR0b24gY2xhc3M9J2JhY2sgbmF2aWdhdGlvbic+QmFjazwvYnV0dG9uPlxuICAgICAgICA8aDE+QXNzZXNzbWVudCBCdWlsZGVyPC9oMT5cbiAgICAgIDxkaXYgaWQ9J2Jhc2ljJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nYXNzZXNzbWVudF9uYW1lJz5OYW1lPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IGlkPSdhc3Nlc3NtZW50X25hbWUnIHZhbHVlPScje0Btb2RlbC5lc2NhcGUoXCJuYW1lXCIpfSc+XG5cbiAgICAgICAgPGxhYmVsIGZvcj0nYXNzZXNzbWVudF9kX2tleScgdGl0bGU9J1RoaXMga2V5IGlzIHVzZWQgdG8gaW1wb3J0IHRoZSBhc3Nlc3NtZW50IGZyb20gYSB0YWJsZXQuJz5Eb3dubG9hZCBLZXk8L2xhYmVsPjxicj5cbiAgICAgICAgPGRpdiBjbGFzcz0naW5mb19ib3gnPiN7QG1vZGVsLmlkLnN1YnN0cigtNSw1KX08L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8bGFiZWwgdGl0bGU9J09ubHkgYWN0aXZlIGFzc2Vzc21lbnRzIHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBtYWluIGFzc2Vzc21lbnQgbGlzdC4nPlN0YXR1czwvbGFiZWw+PGJyPlxuICAgICAgPGRpdiBpZD0nYXJjaGl2ZV9idXR0b25zJyBjbGFzcz0nYnV0dG9uc2V0Jz5cbiAgICAgICAgPGlucHV0IHR5cGU9J3JhZGlvJyBpZD0nYXJjaGl2ZV9mYWxzZScgbmFtZT0nYXJjaGl2ZScgdmFsdWU9J2ZhbHNlJyAje25vdEFyY2hpdmVDaGVja2VkfT48bGFiZWwgZm9yPSdhcmNoaXZlX2ZhbHNlJz5BY3RpdmU8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgdHlwZT0ncmFkaW8nIGlkPSdhcmNoaXZlX3RydWUnICBuYW1lPSdhcmNoaXZlJyB2YWx1ZT0ndHJ1ZScgICN7YXJjaGl2ZUNoZWNrZWR9PjxsYWJlbCBmb3I9J2FyY2hpdmVfdHJ1ZSc+QXJjaGl2ZWQ8L2xhYmVsPlxuICAgICAgPC9kaXY+XG4gICAgICA8aDI+U3VidGVzdHM8L2gyPlxuICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICA8ZGl2PlxuICAgICAgICA8dWwgaWQ9J3N1YnRlc3RfbGlzdCc+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8YnV0dG9uIGNsYXNzPSduZXdfc3VidGVzdF9idXR0b24gY29tbWFuZCc+QWRkIFN1YnRlc3Q8L2J1dHRvbj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbmV3X3N1YnRlc3RfZm9ybSBjb25maXJtYXRpb24nPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICAgIDxoMj5OZXcgU3VidGVzdDwvaDI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdzdWJ0ZXN0X3R5cGVfc2VsZWN0Jz5UeXBlPC9sYWJlbD48YnI+XG4gICAgICAgICAgICAje3N1YnRlc3RUeXBlU2VsZWN0fTxicj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J25ld19zdWJ0ZXN0X25hbWUnPk5hbWU8L2xhYmVsPjxicj5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPSd0ZXh0JyBpZD0nbmV3X3N1YnRlc3RfbmFtZSc+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduZXdfc3VidGVzdF9zYXZlIGNvbW1hbmQnPkFkZDwvYnV0dG9uPiA8YnV0dG9uIGNsYXNzPSduZXdfc3VidGVzdF9jYW5jZWwgY29tbWFuZCc+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8aDI+T3B0aW9uczwvaDI+XG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J3NlcXVlbmNlcycgdGl0bGU9J1RoaXMgaXMgYSBsaXN0IG9mIGFjY2VwdGFibGUgb3JkZXJzIG9mIHN1YnRlc3RzLCB3aGljaCB3aWxsIGJlIHJhbmRvbWx5IHNlbGVjdGVkIGVhY2ggdGltZSBhbiBhc3Nlc3NtZW50IGlzIHJ1bi4gU3VidGVzdCBpbmRpY2llcyBhcmUgc2VwYXJhdGVkIGJ5IGNvbW1hcywgbmV3IGxpbmVzIHNlcGFyYXRlIHNlcXVlbmNlcy4gJz5SYW5kb20gU2VxdWVuY2VzPC9sYWJlbD5cbiAgICAgICAgPGRpdiBpZD0nc3VidGVzdF9sZWdlbmQnPiN7c3VidGVzdExlZ2VuZH08L2Rpdj5cbiAgICAgICAgPHRleHRhcmVhIGlkPSdzZXF1ZW5jZXMnPiN7c2VxdWVuY2VzfTwvdGV4dGFyZWE+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxidXR0b24gY2xhc3M9J3NhdmUgY29tbWFuZCc+U2F2ZTwvYnV0dG9uPlxuICAgICAgXCJcblxuICAgICMgcmVuZGVyIG5ldyBzdWJ0ZXN0IHZpZXdzXG4gICAgQHN1YnRlc3RMaXN0RWRpdFZpZXcuc2V0RWxlbWVudChAJGVsLmZpbmQoXCIjc3VidGVzdF9saXN0XCIpKVxuICAgIEBzdWJ0ZXN0TGlzdEVkaXRWaWV3LnJlbmRlcigpXG4gICAgXG4gICAgIyBtYWtlIGl0IHNvcnRhYmxlXG4gICAgQCRlbC5maW5kKFwiI3N1YnRlc3RfbGlzdFwiKS5zb3J0YWJsZVxuICAgICAgaGFuZGxlIDogJy5zb3J0YWJsZV9oYW5kbGUnXG4gICAgICBzdGFydDogKGV2ZW50LCB1aSkgLT4gdWkuaXRlbS5hZGRDbGFzcyBcImRyYWdfc2hhZG93XCJcbiAgICAgIHN0b3A6ICAoZXZlbnQsIHVpKSAtPiB1aS5pdGVtLnJlbW92ZUNsYXNzIFwiZHJhZ19zaGFkb3dcIlxuICAgICAgdXBkYXRlIDogKGV2ZW50LCB1aSkgPT5cbiAgICAgICAgZm9yIGlkLCBpIGluICgkKGxpKS5hdHRyKFwiZGF0YS1pZFwiKSBmb3IgbGkgaW4gQCRlbC5maW5kKFwiI3N1YnRlc3RfbGlzdCBsaVwiKSlcbiAgICAgICAgICBAbW9kZWwuc3VidGVzdHMuZ2V0KGlkKS5zZXQoe1wib3JkZXJcIjppfSx7c2lsZW50OnRydWV9KS5zYXZlKG51bGwse3NpbGVudDp0cnVlfSlcbiAgICAgICAgQG1vZGVsLnN1YnRlc3RzLnNvcnQoKVxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgXG4gIHVwZGF0ZVN1YnRlc3RMZWdlbmQ6ID0+XG4gICAgc3VidGVzdExlZ2VuZCA9IFwiXCJcbiAgICBAbW9kZWwuc3VidGVzdHMuZWFjaCAoc3VidGVzdCwgaSkgLT5cbiAgICAgIHN1YnRlc3RMZWdlbmQgKz0gXCI8ZGl2IGNsYXNzPSdzbWFsbF9ncmV5Jz4je2l9IC0gI3tzdWJ0ZXN0LmdldChcIm5hbWVcIil9PC9kaXY+PGJyPlwiXG4gICAgJHN1YnRlc3RXcmFwcGVyID0gQCRlbC5maW5kKFwiI3N1YnRlc3RfbGVnZW5kXCIpXG4gICAgJHN1YnRlc3RXcmFwcGVyLmh0bWwoc3VidGVzdExlZ2VuZCkgaWYgJHN1YnRlc3RXcmFwcGVyLmxlbmd0aCAhPSAwXG4gICAgcmV0dXJuIHN1YnRlc3RMZWdlbmRcblxuICBvbkNsb3NlOiAtPlxuICAgIEBzdWJ0ZXN0TGlzdEVkaXRWaWV3LmNsb3NlKClcbiAgICBcbiJdfQ==
