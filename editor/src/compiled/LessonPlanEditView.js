var LessonPlanEditView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LessonPlanEditView = (function(superClass) {
  extend(LessonPlanEditView, superClass);

  function LessonPlanEditView() {
    this.updateElementLegend = bind(this.updateElementLegend, this);
    this.render = bind(this.render, this);
    this.saveNewElement = bind(this.saveNewElement, this);
    this.updateModel = bind(this.updateModel, this);
    this.save = bind(this.save, this);
    return LessonPlanEditView.__super__.constructor.apply(this, arguments);
  }

  LessonPlanEditView.prototype.className = 'lessonPlan_edit_view';

  LessonPlanEditView.prototype.events = {
    'click #archive_buttons input': 'save',
    'click .back': 'goBack',
    'click .new_element_button': 'toggleNewElementForm',
    'click .new_element_cancel': 'toggleNewElementForm',
    'keypress #new_element_name': 'saveNewElement',
    'click .new_element_save': 'saveNewElement',
    'change #basic input': 'save',
    'click .save': 'save'
  };

  LessonPlanEditView.prototype.initialize = function(options) {
    this.model = options.model;
    this.elementListEditView = new ElementListEditView({
      "lessonPlan": this.model,
      "assessment": this.model
    });
    this.model.elements.on("change remove", this.elementListEditView.render);
    return this.model.elements.on("all", this.updateElementLegend);
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
    var doublesError, element, elementCount, emptyError, i, j, k, l, len, len1, rangeError, sequence, sequenceErrors, sequences, sequencesValue, tooFewError, tooManyError, validatedSequences;
    elementCount = this.model.elements.models.length;
    sequencesValue = this.$el.find("#sequences").val().replace(/[^0-9,\n]/g, "");
    sequences = sequencesValue.split("\n");
    for (i = k = 0, len = sequences.length; k < len; i = ++k) {
      sequence = sequences[i];
      sequence = sequence.split(",");
      for (j = l = 0, len1 = sequence.length; l < len1; j = ++l) {
        element = sequence[j];
        sequence[j] = parseInt(element);
        if (sequence[j] < 0 || sequence[j] >= elementCount) {
          rangeError = true;
        }
        if (isNaN(sequence[j])) {
          emptyError = true;
        }
      }
      sequences[i] = sequence;
      if (sequence.length > elementCount) {
        tooManyError = true;
      }
      if (sequence.length < elementCount) {
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
        sequenceErrors.push("Some numbers do not reference a element from the legend.");
      }
      if (tooManyError) {
        sequenceErrors.push("Some sequences are longer than the total number of all elements.");
      }
      if (tooFewError) {
        sequenceErrors.push("Some sequences are shorter than the total number of all elements.");
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

  LessonPlanEditView.prototype.toggleNewElementForm = function(event) {
    this.$el.find(".new_element_form, .new_element_button").toggle();
    this.$el.find("#new_element_name").val("");
    this.$el.find("#element_type_select").val("none");
    return false;
  };

  LessonPlanEditView.prototype.saveNewElement = function(event) {
    var fd, file, newAttributes, newElement, options, prototypeTemplate, useTypeTemplate;
    if (event.type !== "click" && event.which !== 13) {
      return true;
    }
    if (this.$el.find("#element_type_select option:selected").val() === "none") {
      Utils.midAlert("Please select an element type");
      return false;
    }
    newAttributes = Tangerine.templates.get("element");
    prototypeTemplate = Tangerine.templates.get("elementTypes")[this.$el.find("#element_type_select").val()];
    useTypeTemplate = Tangerine.templates.get("element");
    file = document.getElementById("files").files[0];
    fd = new FormData();
    fd.append("file", file);
    newAttributes = $.extend(newAttributes, prototypeTemplate);
    newAttributes = $.extend(newAttributes, useTypeTemplate);
    newAttributes = $.extend(newAttributes, {
      name: this.$el.find("#new_element_name").val(),
      lessonPlanId: this.model.id,
      assessmentId: this.model.id,
      order: this.model.elements.length,
      fileType: file.type
    });
    options = {
      success: (function(_this) {
        return function(model, resp) {
          var loaded, progressBar, url, xhr;
          console.log("created: " + JSON.stringify(resp) + " Model: " + JSON.stringify(model));
          url = (Tangerine.config.get('robbert')) + "/files";
          console.log("url: " + url);
          console.log("fileObject size: " + file.size);
          xhr = new XMLHttpRequest();
          loaded = function() {
            return console.log('finished uploading');
          };
          xhr.addEventListener('load', loaded, false);
          progressBar = document.querySelector('progress');
          xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
              progressBar.value = (e.loaded / e.total) * 100;
              return progressBar.textContent = progressBar.value;
            }
          };
          xhr.open('POST', url, true);
          return xhr.send(fd);
        };
      })(this),
      error: (function(_this) {
        return function(model, err) {
          return console.log("Error: " + JSON.stringify(err) + " Model: " + JSON.stringify(model));
        };
      })(this)
    };
    newElement = this.model.elements.create(newAttributes, options);
    newElement.on('progress', function(evt) {
      return console.log(evt);
    });
    this.toggleNewElementForm();
    return false;
  };

  LessonPlanEditView.prototype.render = function() {
    var arch, archiveChecked, elementLegend, elementTypeSelect, i, k, key, len, lessonPlan_day, lessonPlan_grade, lessonPlan_lesson_text, lessonPlan_subject, lessonPlan_subject_Engish, lessonPlan_subject_Kiswahili, lessonPlan_title, lessonPlan_week, notArchiveChecked, ref, sequences, value;
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
    elementLegend = this.updateElementLegend();
    arch = this.model.get('archived');
    archiveChecked = arch === true || arch === 'true' ? "checked" : "";
    notArchiveChecked = archiveChecked ? "" : "checked";
    lessonPlan_subject_Engish = lessonPlan_subject === '1' ? "checked" : "";
    lessonPlan_subject_Kiswahili = lessonPlan_subject === '2' ? "checked" : "";
    elementTypeSelect = "<select id='element_type_select'> <option value='none' disabled='disabled' selected='selected'>Please select a element type</option>";
    ref = Tangerine.templates.get("elementTypes");
    for (key in ref) {
      value = ref[key];
      elementTypeSelect += "<option value='" + key + "' data-template='" + key + "'>" + (key.humanize()) + "</option>";
    }
    elementTypeSelect += "</select>";
    this.$el.html("<button class='back navigation'>Back</button> <h1>LessonPlan Builder</h1> <div id='basic'> <label for='lessonPlan_name'>Name</label> <input id='lessonPlan_name' value='" + (this.model.escape("name")) + "'> <label for='lessonPlan_d_key' title='This key is used to import the lessonPlan from a tablet.'>Download Key</label><br> <div class='info_box'>" + (this.model.id.substr(-5, 5)) + "</div> </div> <label title='Only active lessonPlans will be displayed in the main lessonPlan list.'>Status</label><br> <div id='archive_buttons' class='buttonset'> <input type='radio' id='archive_false' name='archive' value='false' " + notArchiveChecked + "><label for='archive_false'>Active</label> <input type='radio' id='archive_true'  name='archive' value='true'  " + archiveChecked + "><label for='archive_true'>Archived</label> </div> <div class='label_value'> <label for='lessonPlan_title'>LessonPlan Title</label> <input id='lessonPlan_title' value='" + lessonPlan_title + "'> </div> <div class='menu_box'> <div class='label_value'> <label for='lessonPlan_lesson_text' title='Lesson Text.'>LessonPlan Text</label> <textarea id='lessonPlan_lesson_text'>" + lessonPlan_lesson_text + "</textarea> </div> </div> <label title='You must choose one of these subjects.' for='lessonPlan_subject_buttons'>LessonPlan subject</label><br> <div id='lessonPlan_subject_buttons' class='buttonset'> <input type='radio' id='lessonPlan_subject_Engish' name='lessonPlan_subject' value='1' " + lessonPlan_subject_Engish + "><label for='lessonPlan_subject_Engish'>Engish</label> <input type='radio' id='lessonPlan_subject_Kiswahili'  name='lessonPlan_subject' value='2'  " + lessonPlan_subject_Kiswahili + "><label for='lessonPlan_subject_Kiswahili'>Kiswahili</label> </div> <div class='label_value'> <label for='lessonPlan_grade'>LessonPlan Grade</label> <input id='lessonPlan_grade' value='" + lessonPlan_grade + "'> </div> <div class='label_value'> <label for='lessonPlan_week'>LessonPlan Week</label> <input id='lessonPlan_week' value='" + lessonPlan_week + "'> </div> <div class='label_value'> <label for='lessonPlan_day'>LessonPlan Day</label> <input id='lessonPlan_day' value='" + lessonPlan_day + "'> </div> <h2>Elements</h2> <div class='menu_box'> <progress min='0' max='100' value='0'></progress> <div> <ul id='element_list'> </ul> </div> <button class='new_element_button command'>Add Element</button> <div class='new_element_form confirmation'> <div class='menu_box'> <h2>New Element</h2> <label for='element_type_select'>Type</label><br> " + elementTypeSelect + "<br> <label for='new_element_name'>Name</label><br> <input type='text' id='new_element_name'> <input type='file' name='files' id='files' multiple='multiple' /> <button class='new_element_save command'>Add</button> <button class='new_element_cancel command'>Cancel</button> </div> </div> </div> <h2>Options</h2> <div class='label_value'> <label for='sequences' title='This is a list of acceptable orders of elements, which will be randomly selected each time an lessonPlan is run. Element indicies are separated by commas, new lines separate sequences. '>Random Sequences</label> <div id='element_legend'>" + elementLegend + "</div> <textarea id='sequences'>" + sequences + "</textarea> </div> <button class='save command'>Save</button>");
    this.elementListEditView.setElement(this.$el.find("#element_list"));
    this.elementListEditView.render();
    this.$el.find("#element_list").sortable({
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
            ref1 = this.$el.find("#element_list li");
            results = [];
            for (m = 0, len1 = ref1.length; m < len1; m++) {
              li = ref1[m];
              results.push($(li).attr("data-id"));
            }
            return results;
          }).call(_this);
          for (i = l = 0, len1 = ref1.length; l < len1; i = ++l) {
            id = ref1[i];
            _this.model.elements.get(id).set({
              "order": i
            }, {
              silent: true
            }).save(null, {
              silent: true
            });
          }
          return _this.model.elements.sort();
        };
      })(this)
    });
    return this.trigger("rendered");
  };

  LessonPlanEditView.prototype.updateElementLegend = function() {
    var $elementWrapper, elementLegend;
    elementLegend = "";
    this.model.elements.each(function(element, i) {
      return elementLegend += "<div class='small_grey'>" + i + " - " + (element.get("name")) + "</div><br>";
    });
    $elementWrapper = this.$el.find("#element_legend");
    if ($elementWrapper.length !== 0) {
      $elementWrapper.html(elementLegend);
    }
    return elementLegend;
  };

  LessonPlanEditView.prototype.onClose = function() {
    return this.elementListEditView.close();
  };

  return LessonPlanEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlc3NvblBsYW4vTGVzc29uUGxhbkVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGtCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7OytCQUVKLFNBQUEsR0FBWTs7K0JBRVosTUFBQSxHQUNFO0lBQUEsOEJBQUEsRUFBaUMsTUFBakM7SUFDQSxhQUFBLEVBQWlDLFFBRGpDO0lBRUEsMkJBQUEsRUFBaUMsc0JBRmpDO0lBR0EsMkJBQUEsRUFBaUMsc0JBSGpDO0lBS0EsNEJBQUEsRUFBaUMsZ0JBTGpDO0lBTUEseUJBQUEsRUFBaUMsZ0JBTmpDO0lBUUEscUJBQUEsRUFBaUMsTUFSakM7SUFTQSxhQUFBLEVBQWlDLE1BVGpDOzs7K0JBV0YsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO0lBQ2pCLElBQUMsQ0FBQSxtQkFBRCxHQUEyQixJQUFBLG1CQUFBLENBQ3pCO01BQUEsWUFBQSxFQUFlLElBQUMsQ0FBQSxLQUFoQjtNQUNBLFlBQUEsRUFBZSxJQUFDLENBQUEsS0FEaEI7S0FEeUI7SUFJM0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBaEIsQ0FBbUIsZUFBbkIsRUFBb0MsSUFBQyxDQUFBLG1CQUFtQixDQUFDLE1BQXpEO1dBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBaEIsQ0FBbUIsS0FBbkIsRUFBMEIsSUFBQyxDQUFBLG1CQUEzQjtFQVBVOzsrQkFTWixJQUFBLEdBQU0sU0FBQTtJQUNKLElBQUcsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFIO2FBQ0UsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksSUFBWixFQUNFO1FBQUEsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ1AsS0FBSyxDQUFDLFFBQU4sQ0FBaUIsQ0FBQyxLQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFY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R0FBRyxDQUFDLElBQUwsQ0FBVSxpQkFBVjtJQUNsQixJQUF1QyxlQUFlLENBQUMsTUFBaEIsS0FBMEIsQ0FBakU7TUFBQSxlQUFlLENBQUMsSUFBaEIsQ0FBcUIsYUFBckIsRUFBQTs7QUFDQSxXQUFPO0VBTlk7OytCQVFyQixPQUFBLEdBQVMsU0FBQTtXQUNQLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxLQUFyQixDQUFBO0VBRE87Ozs7R0F0VXNCLFFBQVEsQ0FBQyIsImZpbGUiOiJsZXNzb25QbGFuL0xlc3NvblBsYW5FZGl0Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIExlc3NvblBsYW5FZGl0VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiAnbGVzc29uUGxhbl9lZGl0X3ZpZXcnXG5cbiAgZXZlbnRzIDpcbiAgICAnY2xpY2sgI2FyY2hpdmVfYnV0dG9ucyBpbnB1dCcgOiAnc2F2ZSdcbiAgICAnY2xpY2sgLmJhY2snICAgICAgICAgICAgICAgICAgOiAnZ29CYWNrJ1xuICAgICdjbGljayAubmV3X2VsZW1lbnRfYnV0dG9uJyAgICA6ICd0b2dnbGVOZXdFbGVtZW50Rm9ybSdcbiAgICAnY2xpY2sgLm5ld19lbGVtZW50X2NhbmNlbCcgICAgOiAndG9nZ2xlTmV3RWxlbWVudEZvcm0nXG5cbiAgICAna2V5cHJlc3MgI25ld19lbGVtZW50X25hbWUnICAgOiAnc2F2ZU5ld0VsZW1lbnQnXG4gICAgJ2NsaWNrIC5uZXdfZWxlbWVudF9zYXZlJyAgICAgIDogJ3NhdmVOZXdFbGVtZW50J1xuXG4gICAgJ2NoYW5nZSAjYmFzaWMgaW5wdXQnICAgICAgICAgIDogJ3NhdmUnXG4gICAgJ2NsaWNrIC5zYXZlJyAgICAgICAgICAgICAgICAgIDogJ3NhdmUnXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQG1vZGVsID0gb3B0aW9ucy5tb2RlbFxuICAgIEBlbGVtZW50TGlzdEVkaXRWaWV3ID0gbmV3IEVsZW1lbnRMaXN0RWRpdFZpZXdcbiAgICAgIFwibGVzc29uUGxhblwiIDogQG1vZGVsXG4gICAgICBcImFzc2Vzc21lbnRcIiA6IEBtb2RlbFxuXG4gICAgQG1vZGVsLmVsZW1lbnRzLm9uIFwiY2hhbmdlIHJlbW92ZVwiLCBAZWxlbWVudExpc3RFZGl0Vmlldy5yZW5kZXJcbiAgICBAbW9kZWwuZWxlbWVudHMub24gXCJhbGxcIiwgQHVwZGF0ZUVsZW1lbnRMZWdlbmRcblxuICBzYXZlOiA9PlxuICAgIGlmIEB1cGRhdGVNb2RlbCgpXG4gICAgICBAbW9kZWwuc2F2ZSBudWxsLFxuICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiI3tAbW9kZWwuZ2V0KFwibmFtZVwiKX0gc2F2ZWRcIlxuICAgICAgICBlcnJvcjogPT5cbiAgICAgICAgICBVdGlscy5taWRBbGVydCBcIkxlc3NvblBsYW4gc2F2ZSBlcnJvci4gUGxlYXNlIHRyeSBhZ2Fpbi5cIlxuXG4gIGdvQmFjazogLT4gVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImFzc2Vzc21lbnRzXCIsIHRydWVcblxuICB1cGRhdGVNb2RlbDogPT5cblxuI1xuIyBwYXJzZSBhY2NlcHRhYmxlIHJhbmRvbSBzZXF1ZW5jZXNcbiNcblxuICAgIGVsZW1lbnRDb3VudCA9IEBtb2RlbC5lbGVtZW50cy5tb2RlbHMubGVuZ3RoXG5cbiAgICAjIHJlbW92ZSBldmVyeXRoaW5nIGV4Y2VwdCBudW1iZXJzLCBjb21tYXMgYW5kIG5ldyBsaW5lc1xuICAgIHNlcXVlbmNlc1ZhbHVlID0gQCRlbC5maW5kKFwiI3NlcXVlbmNlc1wiKS52YWwoKS5yZXBsYWNlKC9bXjAtOSxcXG5dL2csXCJcIilcbiAgICBzZXF1ZW5jZXMgPSBzZXF1ZW5jZXNWYWx1ZS5zcGxpdChcIlxcblwiKVxuXG4gICAgIyBwYXJzZSBzdHJpbmdzIHRvIG51bWJlcnMgYW5kIGNvbGxlY3QgZXJyb3JzXG4gICAgZm9yIHNlcXVlbmNlLCBpIGluIHNlcXVlbmNlc1xuXG4gICAgICBzZXF1ZW5jZSA9IHNlcXVlbmNlLnNwbGl0KFwiLFwiKVxuICAgICAgZm9yIGVsZW1lbnQsIGogaW4gc2VxdWVuY2VcbiAgICAgICAgc2VxdWVuY2Vbal0gPSBwYXJzZUludChlbGVtZW50KVxuICAgICAgICByYW5nZUVycm9yID0gdHJ1ZSBpZiBzZXF1ZW5jZVtqXSA8IDAgb3Igc2VxdWVuY2Vbal0gPj0gZWxlbWVudENvdW50XG4gICAgICAgIGVtcHR5RXJyb3IgPSB0cnVlIGlmIGlzTmFOKHNlcXVlbmNlW2pdKVxuXG4gICAgICBzZXF1ZW5jZXNbaV0gPSBzZXF1ZW5jZVxuXG4gICAgICAjIGRldGVjdCBlcnJvcnNcbiAgICAgIHRvb01hbnlFcnJvciA9IHRydWUgaWYgc2VxdWVuY2UubGVuZ3RoID4gZWxlbWVudENvdW50XG4gICAgICB0b29GZXdFcnJvciAgPSB0cnVlIGlmIHNlcXVlbmNlLmxlbmd0aCA8IGVsZW1lbnRDb3VudFxuICAgICAgZG91Ymxlc0Vycm9yID0gdHJ1ZSBpZiBzZXF1ZW5jZS5sZW5ndGggIT0gXy51bmlxKHNlcXVlbmNlKS5sZW5ndGhcblxuICAgICMgc2hvdyBlcnJvcnMgaWYgdGhleSBleGlzdCBhbmQgc2VxdWVuY2VzIGV4aXN0XG4gICAgaWYgbm90IF8uaXNFbXB0eSBfLnJlamVjdCggXy5mbGF0dGVuKHNlcXVlbmNlcyksIChlKSAtPiByZXR1cm4gaXNOYU4oZSkpICMgcmVtb3ZlIHVucGFyc2FibGUgZW1wdGllcywgZG9uJ3QgXy5jb21wYWN0LiB3aWxsIHJlbW92ZSAwc1xuICAgICAgc2VxdWVuY2VFcnJvcnMgPSBbXVxuICAgICAgaWYgZW1wdHlFcnJvciAgIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgc2VxdWVuY2VzIGNvbnRhaW4gZW1wdHkgdmFsdWVzLlwiXG4gICAgICBpZiByYW5nZUVycm9yICAgdGhlbiBzZXF1ZW5jZUVycm9ycy5wdXNoIFwiU29tZSBudW1iZXJzIGRvIG5vdCByZWZlcmVuY2UgYSBlbGVtZW50IGZyb20gdGhlIGxlZ2VuZC5cIlxuICAgICAgaWYgdG9vTWFueUVycm9yIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgc2VxdWVuY2VzIGFyZSBsb25nZXIgdGhhbiB0aGUgdG90YWwgbnVtYmVyIG9mIGFsbCBlbGVtZW50cy5cIlxuICAgICAgaWYgdG9vRmV3RXJyb3IgIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgc2VxdWVuY2VzIGFyZSBzaG9ydGVyIHRoYW4gdGhlIHRvdGFsIG51bWJlciBvZiBhbGwgZWxlbWVudHMuXCJcbiAgICAgIGlmIGRvdWJsZXNFcnJvciB0aGVuIHNlcXVlbmNlRXJyb3JzLnB1c2ggXCJTb21lIHNlcXVlbmNlcyBjb250YWluIGRvdWJsZXMuXCJcblxuICAgICAgaWYgc2VxdWVuY2VFcnJvcnMubGVuZ3RoID09IDBcbiMgaWYgdGhlcmUncyBubyBlcnJvcnMsIGNsZWFuIHVwIHRoZSB0ZXh0YXJlYSBjb250ZW50XG4gICAgICAgIHZhbGlkYXRlZFNlcXVlbmNlcyA9IChzZXF1ZW5jZS5qb2luKFwiLCBcIikgZm9yIHNlcXVlbmNlIGluIHNlcXVlbmNlcykuam9pbihcIlxcblwiKVxuICAgICAgICBAJGVsLmZpbmQoXCIjc2VxdWVuY2VzXCIpLnZhbCh2YWxpZGF0ZWRTZXF1ZW5jZXMpXG4gICAgICBlbHNlICMgaWYgdGhlcmUncyBlcnJvcnMsIHRoZXkgY2FuIHN0aWxsIHNhdmUuIEp1c3Qgc2hvdyBhIHdhcm5pbmdcbiAgICAgICAgYWxlcnQgXCJXYXJuaW5nXFxuXFxuI3tzZXF1ZW5jZUVycm9ycy5qb2luKFwiXFxuXCIpfVwiXG5cbiMgbm90aGluZyByZXNlbWJsaW5nIGEgdmFsaWQgc2VxdWVuY2Ugd2FzIGZvdW5kXG4gICAgZWxzZVxuICAgICAgQCRlbC5maW5kKFwiI3NlcXVlbmNlc1wiKS52YWwoXCJcIikgIyBjbGVhbiB0ZXh0IGFyZWFcblxuICAgIEBtb2RlbC5zZXRcbiAgICAgIHNlcXVlbmNlcyA6IHNlcXVlbmNlc1xuICAgICAgYXJjaGl2ZWQgIDogQCRlbC5maW5kKFwiI2FyY2hpdmVfYnV0dG9ucyBpbnB1dDpjaGVja2VkXCIpLnZhbCgpID09IFwidHJ1ZVwiXG4gICAgICBuYW1lICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9uYW1lXCIpLnZhbCgpXG4gICAgICBkS2V5ICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9kX2tleVwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl90aXRsZSAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fdGl0bGVcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5fbGVzc29uX3RleHQgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX2xlc3Nvbl90ZXh0XCIpLnZhbCgpXG4jICAgICAgbGVzc29uUGxhbl9zdWJqZWN0ICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9zdWJqZWN0XCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuX3N1YmplY3QgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX3N1YmplY3RfYnV0dG9ucyBpbnB1dDpjaGVja2VkXCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuX2dyYWRlICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9ncmFkZVwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl93ZWVrICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl93ZWVrXCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuX2RheSAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fZGF5XCIpLnZhbCgpXG4jICAgICAgbGVzc29uUGxhbl9pbWFnZSAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5faW1hZ2VcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5JZCA6IEBtb2RlbC5pZFxuICAgICAgYXNzZXNzbWVudElkIDogQG1vZGVsLmlkXG4gICAgcmV0dXJuIHRydWVcblxuICB0b2dnbGVOZXdFbGVtZW50Rm9ybTogKGV2ZW50KSAtPlxuICAgIEAkZWwuZmluZChcIi5uZXdfZWxlbWVudF9mb3JtLCAubmV3X2VsZW1lbnRfYnV0dG9uXCIpLnRvZ2dsZSgpXG5cbiAgICBAJGVsLmZpbmQoXCIjbmV3X2VsZW1lbnRfbmFtZVwiKS52YWwoXCJcIilcbiAgICBAJGVsLmZpbmQoXCIjZWxlbWVudF90eXBlX3NlbGVjdFwiKS52YWwoXCJub25lXCIpXG5cbiAgICBmYWxzZVxuXG4gIHNhdmVOZXdFbGVtZW50OiAoZXZlbnQpID0+XG5cbiAgICBpZiBldmVudC50eXBlICE9IFwiY2xpY2tcIiAmJiBldmVudC53aGljaCAhPSAxM1xuICAgICAgcmV0dXJuIHRydWVcblxuICAgICMgaWYgbm8gZWxlbWVudCB0eXBlIHNlbGVjdGVkLCBzaG93IGVycm9yXG4gICAgaWYgQCRlbC5maW5kKFwiI2VsZW1lbnRfdHlwZV9zZWxlY3Qgb3B0aW9uOnNlbGVjdGVkXCIpLnZhbCgpID09IFwibm9uZVwiXG4gICAgICBVdGlscy5taWRBbGVydCBcIlBsZWFzZSBzZWxlY3QgYW4gZWxlbWVudCB0eXBlXCJcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgIyBnZW5lcmFsIHRlbXBsYXRlXG4gICAgbmV3QXR0cmlidXRlcyA9IFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwiZWxlbWVudFwiKVxuXG4gICAgIyBwcm90b3R5cGUgdGVtcGxhdGVcbiAgICBwcm90b3R5cGVUZW1wbGF0ZSA9IFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwiZWxlbWVudFR5cGVzXCIpW0AkZWwuZmluZChcIiNlbGVtZW50X3R5cGVfc2VsZWN0XCIpLnZhbCgpXVxuXG4gICAgIyBiaXQgbW9yZSBzcGVjaWZpYyB0ZW1wbGF0ZVxuIyAgICB1c2VUeXBlID0gQCRlbC5maW5kKFwiI2VsZW1lbnRfdHlwZV9zZWxlY3QgOnNlbGVjdGVkXCIpLmF0dHIgJ2RhdGEtdGVtcGxhdGUnXG4jICAgIHVzZVR5cGVUZW1wbGF0ZSA9IFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwiZWxlbWVudFRlbXBsYXRlc1wiKVtAJGVsLmZpbmQoXCIjZWxlbWVudF90eXBlX3NlbGVjdFwiKS52YWwoKV1bdXNlVHlwZV1cbiAgICB1c2VUeXBlVGVtcGxhdGUgPSBUYW5nZXJpbmUudGVtcGxhdGVzLmdldChcImVsZW1lbnRcIik7XG5cbiMgICAgZmlsZU9iamVjdCA9ICQoJzppbnB1dFt0eXBlPVwiZmlsZVwiXScpWzBdLmZpbGVzWzBdO1xuICAgIGZpbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbGVzXCIpLmZpbGVzWzBdXG4gICAgZmQgPSBuZXcgRm9ybURhdGEoKVxuICAgIGZkLmFwcGVuZChcImZpbGVcIiwgZmlsZSlcblxuICAgIG5ld0F0dHJpYnV0ZXMgPSAkLmV4dGVuZCBuZXdBdHRyaWJ1dGVzLCBwcm90b3R5cGVUZW1wbGF0ZVxuICAgIG5ld0F0dHJpYnV0ZXMgPSAkLmV4dGVuZCBuZXdBdHRyaWJ1dGVzLCB1c2VUeXBlVGVtcGxhdGVcbiAgICBuZXdBdHRyaWJ1dGVzID0gJC5leHRlbmQgbmV3QXR0cmlidXRlcyxcbiAgICAgIG5hbWUgICAgICAgICA6IEAkZWwuZmluZChcIiNuZXdfZWxlbWVudF9uYW1lXCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuSWQgOiBAbW9kZWwuaWRcbiAgICAgIGFzc2Vzc21lbnRJZCA6IEBtb2RlbC5pZFxuICAgICAgb3JkZXIgICAgICAgIDogQG1vZGVsLmVsZW1lbnRzLmxlbmd0aFxuICAgICAgZmlsZVR5cGUgICAgICAgIDogZmlsZS50eXBlXG4jICAgICAgZmlsZSAgOmZpbGVPYmplY3RcblxuIyAgICAgICAgZmlsZXMgOiBAJGVsLmZpbmQoXCIjX2F0dGFjaG1lbnRzXCIpLnZhbCgpXG4gICAgIyAgICBmb3JtRGF0YTogZmFsc2VcblxuICAgIG9wdGlvbnMgPVxuICAgICAgc3VjY2VzczogKG1vZGVsLCByZXNwKSA9PlxuICAgICAgICBjb25zb2xlLmxvZyhcImNyZWF0ZWQ6IFwiICsgSlNPTi5zdHJpbmdpZnkocmVzcCkgKyBcIiBNb2RlbDogXCIgKyBKU09OLnN0cmluZ2lmeShtb2RlbCkpXG4jICAgICAgICB1cmwgPSBcIiN7QmFja2JvbmUuY291Y2hfY29ubmVjdG9yLmNvbmZpZy5iYXNlX3VybH0vI3tUYW5nZXJpbmUuc2V0dGluZ3MuZ3JvdXBEQn0vI3tyZXNwLl9pZH0vI3tmaWxlT2JqZWN0Lm5hbWV9P3Jldj0je3Jlc3AuX3Jldn1cIlxuICAgICAgICB1cmwgPSBcIiN7VGFuZ2VyaW5lLmNvbmZpZy5nZXQoJ3JvYmJlcnQnKX0vZmlsZXNcIlxuICAgICAgICBjb25zb2xlLmxvZyhcInVybDogXCIgKyB1cmwpXG4jICAgICAgICAkLmFqYXhcbiMgICAgICAgICAgdXJsOiB1cmxcbiMgICAgICAgICAgdHlwZTogJ1BVVCdcbiMgICAgICAgICAgc3VjY2VzczogKHJlc3VsdCkgLT5cbiMgICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlc3VsdDogXCIgKyBKU09OLnN0cmluZ2lmeShyZXN1bHQpKVxuIyAgICAgICAgICBlcnJvcjogKHJlc3VsdCkgLT5cbiMgICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlc3VsdDogXCIgKyAgSlNPTi5zdHJpbmdpZnkocmVzdWx0KSlcblxuIyAgICAgICAgZmlsZU9iamVjdCA9IG5ldyBCbG9iKFsnaGVsbG8gd29ybGQnXSwge3R5cGU6ICd0ZXh0L3BsYWluJ30pXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmlsZU9iamVjdCBzaXplOiBcIiArIGZpbGUuc2l6ZSlcbiAgICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgIyBkZWZpbmUgb3VyIGZpbmlzaCBmblxuICAgICAgICBsb2FkZWQgPSAoKS0+XG4gICAgICAgICAgY29uc29sZS5sb2coJ2ZpbmlzaGVkIHVwbG9hZGluZycpXG4jICAgICAgICAgICQoXCIjYWRkRmlsZVwiKS5vbmUgXCJjbGlja1wiLCBoYW5kbGVyXG5cbiAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIgJ2xvYWQnLCBsb2FkZWQsIGZhbHNlXG4gICAgICAgIHByb2dyZXNzQmFyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcigncHJvZ3Jlc3MnKTtcbiAgICAgICAgeGhyLnVwbG9hZC5vbnByb2dyZXNzID0gKGUpID0+XG4gICAgICAgICAgaWYgZS5sZW5ndGhDb21wdXRhYmxlXG4gICAgICAgICAgICBwcm9ncmVzc0Jhci52YWx1ZSA9IChlLmxvYWRlZCAvIGUudG90YWwpICogMTAwO1xuICAgICAgICAgICAgcHJvZ3Jlc3NCYXIudGV4dENvbnRlbnQgPSBwcm9ncmVzc0Jhci52YWx1ZTtcblxuIyAgICAgICAgeGhyLm9wZW4oJ1BVVCcsIHVybCwgdHJ1ZSk7XG4gICAgICAgIHhoci5vcGVuKCdQT1NUJywgdXJsLCB0cnVlKTtcbiAgICAgICAgeGhyLnNlbmQoZmQpO1xuICAgICAgZXJyb3I6IChtb2RlbCwgZXJyKSA9PlxuICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiArIEpTT04uc3RyaW5naWZ5KGVycikgKyBcIiBNb2RlbDogXCIgKyBKU09OLnN0cmluZ2lmeShtb2RlbCkpXG4gICAgbmV3RWxlbWVudCA9IEBtb2RlbC5lbGVtZW50cy5jcmVhdGUgbmV3QXR0cmlidXRlcywgb3B0aW9uc1xuICAgIG5ld0VsZW1lbnQub24oJ3Byb2dyZXNzJywgKGV2dCkgLT5cbiAgICAgIGNvbnNvbGUubG9nKGV2dClcbiAgICApXG5cbiAgICBAdG9nZ2xlTmV3RWxlbWVudEZvcm0oKVxuICAgIHJldHVybiBmYWxzZVxuXG4gIHJlbmRlcjogPT5cbiAgICBsZXNzb25QbGFuX3RpdGxlICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxlc3NvblBsYW5fdGl0bGVcIilcbiAgICBsZXNzb25QbGFuX2xlc3Nvbl90ZXh0ICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxlc3NvblBsYW5fbGVzc29uX3RleHRcIilcbiAgICBsZXNzb25QbGFuX3N1YmplY3QgICAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwibGVzc29uUGxhbl9zdWJqZWN0XCIpXG4gICAgbGVzc29uUGxhbl9ncmFkZSAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX2dyYWRlXCIpXG4gICAgbGVzc29uUGxhbl93ZWVrICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxlc3NvblBsYW5fd2Vla1wiKVxuICAgIGxlc3NvblBsYW5fZGF5ICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxlc3NvblBsYW5fZGF5XCIpXG4gICAgc2VxdWVuY2VzID0gXCJcIlxuICAgIGlmIEBtb2RlbC5oYXMoXCJzZXF1ZW5jZXNcIilcbiAgICAgIHNlcXVlbmNlcyA9IEBtb2RlbC5nZXQoXCJzZXF1ZW5jZXNcIilcbiAgICAgIHNlcXVlbmNlcyA9IHNlcXVlbmNlcy5qb2luKFwiXFxuXCIpXG5cbiAgICAgIGlmIF8uaXNBcnJheShzZXF1ZW5jZXMpXG4gICAgICAgIGZvciBzZXF1ZW5jZXMsIGkgaW4gc2VxdWVuY2VzXG4gICAgICAgICAgc2VxdWVuY2VzW2ldID0gc2VxdWVuY2VzLmpvaW4oXCIsIFwiKVxuXG4gICAgZWxlbWVudExlZ2VuZCA9IEB1cGRhdGVFbGVtZW50TGVnZW5kKClcblxuICAgIGFyY2ggPSBAbW9kZWwuZ2V0KCdhcmNoaXZlZCcpXG4gICAgYXJjaGl2ZUNoZWNrZWQgICAgPSBpZiAoYXJjaCA9PSB0cnVlIG9yIGFyY2ggPT0gJ3RydWUnKSB0aGVuIFwiY2hlY2tlZFwiIGVsc2UgXCJcIlxuICAgIG5vdEFyY2hpdmVDaGVja2VkID0gaWYgYXJjaGl2ZUNoZWNrZWQgdGhlbiBcIlwiIGVsc2UgXCJjaGVja2VkXCJcblxuICAgIGxlc3NvblBsYW5fc3ViamVjdF9Fbmdpc2ggICAgPSBpZiAobGVzc29uUGxhbl9zdWJqZWN0ID09ICcxJykgdGhlbiBcImNoZWNrZWRcIiBlbHNlIFwiXCJcbiAgICBsZXNzb25QbGFuX3N1YmplY3RfS2lzd2FoaWxpID0gaWYgKGxlc3NvblBsYW5fc3ViamVjdCA9PSAnMicpIHRoZW4gXCJjaGVja2VkXCIgZWxzZSBcIlwiXG5cbiAgICAjIGxpc3Qgb2YgXCJ0ZW1wbGF0ZXNcIlxuICAgIGVsZW1lbnRUeXBlU2VsZWN0ID0gXCI8c2VsZWN0IGlkPSdlbGVtZW50X3R5cGVfc2VsZWN0Jz5cbiAgICAgIDxvcHRpb24gdmFsdWU9J25vbmUnIGRpc2FibGVkPSdkaXNhYmxlZCcgc2VsZWN0ZWQ9J3NlbGVjdGVkJz5QbGVhc2Ugc2VsZWN0IGEgZWxlbWVudCB0eXBlPC9vcHRpb24+XCJcbiAgICBmb3Iga2V5LCB2YWx1ZSBvZiBUYW5nZXJpbmUudGVtcGxhdGVzLmdldChcImVsZW1lbnRUeXBlc1wiKVxuIyAgICAgIGVsZW1lbnRUeXBlU2VsZWN0ICs9IFwiPG9wdGdyb3VwIGxhYmVsPScje2tleS5odW1hbml6ZSgpfSc+XCJcbiMgICAgICBmb3Igc3ViS2V5LCBzdWJWYWx1ZSBvZiB2YWx1ZVxuICAgICAgICBlbGVtZW50VHlwZVNlbGVjdCArPSBcIjxvcHRpb24gdmFsdWU9JyN7a2V5fScgZGF0YS10ZW1wbGF0ZT0nI3trZXl9Jz4je2tleS5odW1hbml6ZSgpfTwvb3B0aW9uPlwiXG4jICAgICAgZWxlbWVudFR5cGVTZWxlY3QgKz0gXCI8L29wdGdyb3VwPlwiXG4gICAgZWxlbWVudFR5cGVTZWxlY3QgKz0gXCI8L3NlbGVjdD5cIlxuXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8YnV0dG9uIGNsYXNzPSdiYWNrIG5hdmlnYXRpb24nPkJhY2s8L2J1dHRvbj5cbiAgICAgICAgPGgxPkxlc3NvblBsYW4gQnVpbGRlcjwvaDE+XG4gICAgICA8ZGl2IGlkPSdiYXNpYyc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2xlc3NvblBsYW5fbmFtZSc+TmFtZTwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCBpZD0nbGVzc29uUGxhbl9uYW1lJyB2YWx1ZT0nI3tAbW9kZWwuZXNjYXBlKFwibmFtZVwiKX0nPlxuXG4gICAgICAgIDxsYWJlbCBmb3I9J2xlc3NvblBsYW5fZF9rZXknIHRpdGxlPSdUaGlzIGtleSBpcyB1c2VkIHRvIGltcG9ydCB0aGUgbGVzc29uUGxhbiBmcm9tIGEgdGFibGV0Lic+RG93bmxvYWQgS2V5PC9sYWJlbD48YnI+XG4gICAgICAgIDxkaXYgY2xhc3M9J2luZm9fYm94Jz4je0Btb2RlbC5pZC5zdWJzdHIoLTUsNSl9PC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGxhYmVsIHRpdGxlPSdPbmx5IGFjdGl2ZSBsZXNzb25QbGFucyB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgbWFpbiBsZXNzb25QbGFuIGxpc3QuJz5TdGF0dXM8L2xhYmVsPjxicj5cbiAgICAgIDxkaXYgaWQ9J2FyY2hpdmVfYnV0dG9ucycgY2xhc3M9J2J1dHRvbnNldCc+XG4gICAgICAgIDxpbnB1dCB0eXBlPSdyYWRpbycgaWQ9J2FyY2hpdmVfZmFsc2UnIG5hbWU9J2FyY2hpdmUnIHZhbHVlPSdmYWxzZScgI3tub3RBcmNoaXZlQ2hlY2tlZH0+PGxhYmVsIGZvcj0nYXJjaGl2ZV9mYWxzZSc+QWN0aXZlPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IHR5cGU9J3JhZGlvJyBpZD0nYXJjaGl2ZV90cnVlJyAgbmFtZT0nYXJjaGl2ZScgdmFsdWU9J3RydWUnICAje2FyY2hpdmVDaGVja2VkfT48bGFiZWwgZm9yPSdhcmNoaXZlX3RydWUnPkFyY2hpdmVkPC9sYWJlbD5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2xlc3NvblBsYW5fdGl0bGUnPkxlc3NvblBsYW4gVGl0bGU8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgaWQ9J2xlc3NvblBsYW5fdGl0bGUnIHZhbHVlPScje2xlc3NvblBsYW5fdGl0bGV9Jz5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX2xlc3Nvbl90ZXh0JyB0aXRsZT0nTGVzc29uIFRleHQuJz5MZXNzb25QbGFuIFRleHQ8L2xhYmVsPlxuICAgICAgICAgIDx0ZXh0YXJlYSBpZD0nbGVzc29uUGxhbl9sZXNzb25fdGV4dCc+I3tsZXNzb25QbGFuX2xlc3Nvbl90ZXh0fTwvdGV4dGFyZWE+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxsYWJlbCB0aXRsZT0nWW91IG11c3QgY2hvb3NlIG9uZSBvZiB0aGVzZSBzdWJqZWN0cy4nIGZvcj0nbGVzc29uUGxhbl9zdWJqZWN0X2J1dHRvbnMnPkxlc3NvblBsYW4gc3ViamVjdDwvbGFiZWw+PGJyPlxuICAgICAgPGRpdiBpZD0nbGVzc29uUGxhbl9zdWJqZWN0X2J1dHRvbnMnIGNsYXNzPSdidXR0b25zZXQnPlxuICAgICAgICA8aW5wdXQgdHlwZT0ncmFkaW8nIGlkPSdsZXNzb25QbGFuX3N1YmplY3RfRW5naXNoJyBuYW1lPSdsZXNzb25QbGFuX3N1YmplY3QnIHZhbHVlPScxJyAje2xlc3NvblBsYW5fc3ViamVjdF9Fbmdpc2h9PjxsYWJlbCBmb3I9J2xlc3NvblBsYW5fc3ViamVjdF9Fbmdpc2gnPkVuZ2lzaDwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCB0eXBlPSdyYWRpbycgaWQ9J2xlc3NvblBsYW5fc3ViamVjdF9LaXN3YWhpbGknICBuYW1lPSdsZXNzb25QbGFuX3N1YmplY3QnIHZhbHVlPScyJyAgI3tsZXNzb25QbGFuX3N1YmplY3RfS2lzd2FoaWxpfT48bGFiZWwgZm9yPSdsZXNzb25QbGFuX3N1YmplY3RfS2lzd2FoaWxpJz5LaXN3YWhpbGk8L2xhYmVsPlxuICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nbGVzc29uUGxhbl9ncmFkZSc+TGVzc29uUGxhbiBHcmFkZTwvbGFiZWw+XG4gICAgICA8aW5wdXQgaWQ9J2xlc3NvblBsYW5fZ3JhZGUnIHZhbHVlPScje2xlc3NvblBsYW5fZ3JhZGV9Jz5cbiAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2xlc3NvblBsYW5fd2Vlayc+TGVzc29uUGxhbiBXZWVrPC9sYWJlbD5cbiAgICAgIDxpbnB1dCBpZD0nbGVzc29uUGxhbl93ZWVrJyB2YWx1ZT0nI3tsZXNzb25QbGFuX3dlZWt9Jz5cbiAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2xlc3NvblBsYW5fZGF5Jz5MZXNzb25QbGFuIERheTwvbGFiZWw+XG4gICAgICA8aW5wdXQgaWQ9J2xlc3NvblBsYW5fZGF5JyB2YWx1ZT0nI3tsZXNzb25QbGFuX2RheX0nPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxoMj5FbGVtZW50czwvaDI+XG4gICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgIDxwcm9ncmVzcyBtaW49JzAnIG1heD0nMTAwJyB2YWx1ZT0nMCc+PC9wcm9ncmVzcz5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgPHVsIGlkPSdlbGVtZW50X2xpc3QnPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmV3X2VsZW1lbnRfYnV0dG9uIGNvbW1hbmQnPkFkZCBFbGVtZW50PC9idXR0b24+XG4gICAgICAgIDxkaXYgY2xhc3M9J25ld19lbGVtZW50X2Zvcm0gY29uZmlybWF0aW9uJz5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgICAgICA8aDI+TmV3IEVsZW1lbnQ8L2gyPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0nZWxlbWVudF90eXBlX3NlbGVjdCc+VHlwZTwvbGFiZWw+PGJyPlxuICAgICAgICAgICAgI3tlbGVtZW50VHlwZVNlbGVjdH08YnI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSduZXdfZWxlbWVudF9uYW1lJz5OYW1lPC9sYWJlbD48YnI+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT0ndGV4dCcgaWQ9J25ld19lbGVtZW50X25hbWUnPlxuICAgICAgICAgICAgPGlucHV0IHR5cGU9J2ZpbGUnIG5hbWU9J2ZpbGVzJyBpZD0nZmlsZXMnIG11bHRpcGxlPSdtdWx0aXBsZScgLz5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25ld19lbGVtZW50X3NhdmUgY29tbWFuZCc+QWRkPC9idXR0b24+IDxidXR0b24gY2xhc3M9J25ld19lbGVtZW50X2NhbmNlbCBjb21tYW5kJz5DYW5jZWw8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxoMj5PcHRpb25zPC9oMj5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nc2VxdWVuY2VzJyB0aXRsZT0nVGhpcyBpcyBhIGxpc3Qgb2YgYWNjZXB0YWJsZSBvcmRlcnMgb2YgZWxlbWVudHMsIHdoaWNoIHdpbGwgYmUgcmFuZG9tbHkgc2VsZWN0ZWQgZWFjaCB0aW1lIGFuIGxlc3NvblBsYW4gaXMgcnVuLiBFbGVtZW50IGluZGljaWVzIGFyZSBzZXBhcmF0ZWQgYnkgY29tbWFzLCBuZXcgbGluZXMgc2VwYXJhdGUgc2VxdWVuY2VzLiAnPlJhbmRvbSBTZXF1ZW5jZXM8L2xhYmVsPlxuICAgICAgICA8ZGl2IGlkPSdlbGVtZW50X2xlZ2VuZCc+I3tlbGVtZW50TGVnZW5kfTwvZGl2PlxuICAgICAgICA8dGV4dGFyZWEgaWQ9J3NlcXVlbmNlcyc+I3tzZXF1ZW5jZXN9PC90ZXh0YXJlYT5cbiAgICAgIDwvZGl2PlxuICAgICAgPGJ1dHRvbiBjbGFzcz0nc2F2ZSBjb21tYW5kJz5TYXZlPC9idXR0b24+XG4gICAgICBcIlxuXG4gICAgIyByZW5kZXIgbmV3IGVsZW1lbnQgdmlld3NcbiAgICBAZWxlbWVudExpc3RFZGl0Vmlldy5zZXRFbGVtZW50KEAkZWwuZmluZChcIiNlbGVtZW50X2xpc3RcIikpXG4gICAgQGVsZW1lbnRMaXN0RWRpdFZpZXcucmVuZGVyKClcblxuICAgICMgbWFrZSBpdCBzb3J0YWJsZVxuICAgIEAkZWwuZmluZChcIiNlbGVtZW50X2xpc3RcIikuc29ydGFibGVcbiAgICAgIGhhbmRsZSA6ICcuc29ydGFibGVfaGFuZGxlJ1xuICAgICAgc3RhcnQ6IChldmVudCwgdWkpIC0+IHVpLml0ZW0uYWRkQ2xhc3MgXCJkcmFnX3NoYWRvd1wiXG4gICAgICBzdG9wOiAgKGV2ZW50LCB1aSkgLT4gdWkuaXRlbS5yZW1vdmVDbGFzcyBcImRyYWdfc2hhZG93XCJcbiAgICAgIHVwZGF0ZSA6IChldmVudCwgdWkpID0+XG4gICAgICAgIGZvciBpZCwgaSBpbiAoJChsaSkuYXR0cihcImRhdGEtaWRcIikgZm9yIGxpIGluIEAkZWwuZmluZChcIiNlbGVtZW50X2xpc3QgbGlcIikpXG4gICAgICAgICAgQG1vZGVsLmVsZW1lbnRzLmdldChpZCkuc2V0KHtcIm9yZGVyXCI6aX0se3NpbGVudDp0cnVlfSkuc2F2ZShudWxsLHtzaWxlbnQ6dHJ1ZX0pXG4gICAgICAgIEBtb2RlbC5lbGVtZW50cy5zb3J0KClcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG5cbiAgdXBkYXRlRWxlbWVudExlZ2VuZDogPT5cbiAgICBlbGVtZW50TGVnZW5kID0gXCJcIlxuICAgIEBtb2RlbC5lbGVtZW50cy5lYWNoIChlbGVtZW50LCBpKSAtPlxuICAgICAgZWxlbWVudExlZ2VuZCArPSBcIjxkaXYgY2xhc3M9J3NtYWxsX2dyZXknPiN7aX0gLSAje2VsZW1lbnQuZ2V0KFwibmFtZVwiKX08L2Rpdj48YnI+XCJcbiAgICAkZWxlbWVudFdyYXBwZXIgPSBAJGVsLmZpbmQoXCIjZWxlbWVudF9sZWdlbmRcIilcbiAgICAkZWxlbWVudFdyYXBwZXIuaHRtbChlbGVtZW50TGVnZW5kKSBpZiAkZWxlbWVudFdyYXBwZXIubGVuZ3RoICE9IDBcbiAgICByZXR1cm4gZWxlbWVudExlZ2VuZFxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgQGVsZW1lbnRMaXN0RWRpdFZpZXcuY2xvc2UoKVxuICAgIFxuIl19
