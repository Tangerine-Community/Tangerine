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
    if (typeof file !== 'undefined') {
      fd = new FormData();
      fd.append("file", file);
    }
    newAttributes = $.extend(newAttributes, prototypeTemplate);
    newAttributes = $.extend(newAttributes, useTypeTemplate);
    newAttributes = $.extend(newAttributes, {
      name: this.$el.find("#new_element_name").val(),
      element: this.$el.find("#element_type_select").val(),
      lessonPlanId: this.model.id,
      assessmentId: this.model.id,
      order: this.model.elements.length
    });
    if (typeof file !== 'undefined') {
      newAttributes = $.extend(newAttributes, {
        fileType: file.type,
        fileName: file.name,
        fileSize: file.size
      });
    }
    if (typeof file === 'undefined') {
      options = {
        success: (function(_this) {
          return function(model, resp) {
            return console.log("Model created.");
          };
        })(this),
        error: (function(_this) {
          return function(model, err) {
            return console.log("Error: " + JSON.stringify(err) + " Model: " + JSON.stringify(model));
          };
        })(this)
      };
    } else {
      options = {
        success: (function(_this) {
          return function(model, resp) {
            var loaded, progressBar, url, xhr;
            url = (Tangerine.config.get('robbert')) + "/files";
            xhr = new XMLHttpRequest();
            xhr.upload.onerror = function(e) {
              return console.log("Error Uploading image: " + JSON.stringify(e));
            };
            xhr.onreadystatechange = function() {
              if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                  return console.log(xhr.responseText);
                } else {
                  console.log("There was an error uploading the file: " + xhr.responseText + " Status: " + xhr.status);
                  return alert("There was an error uploading the file: " + xhr.responseText + " Status: " + xhr.status);
                }
              }
            };
            xhr.onerror = function() {
              return alert("There was an error uploading the file: " + xhr.responseText + " Status: " + xhr.status);
            };
            loaded = function() {};
            xhr.addEventListener('load', loaded, false);
            progressBar = document.querySelector('progress');
            xhr.upload.onprogress = function(e) {
              if (e.lengthComputable) {
                progressBar.value = (e.loaded / e.total) * 100;
                progressBar.textContent = progressBar.value;
                return console.log("progress: " + progressBar.value);
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
    }
    newElement = this.model.elements.create(newAttributes, options);
    newElement.on('progress', function(evt) {
      return console.log("Logging newElement: " + evt);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlc3NvblBsYW4vTGVzc29uUGxhbkVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGtCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7OytCQUVKLFNBQUEsR0FBWTs7K0JBRVosTUFBQSxHQUNFO0lBQUEsOEJBQUEsRUFBaUMsTUFBakM7SUFDQSxhQUFBLEVBQWlDLFFBRGpDO0lBRUEsMkJBQUEsRUFBaUMsc0JBRmpDO0lBR0EsMkJBQUEsRUFBaUMsc0JBSGpDO0lBS0EsNEJBQUEsRUFBaUMsZ0JBTGpDO0lBTUEseUJBQUEsRUFBaUMsZ0JBTmpDO0lBUUEscUJBQUEsRUFBaUMsTUFSakM7SUFTQSxhQUFBLEVBQWlDLE1BVGpDOzs7K0JBV0YsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO0lBQ2pCLElBQUMsQ0FBQSxtQkFBRCxHQUEyQixJQUFBLG1CQUFBLENBQ3pCO01BQUEsWUFBQSxFQUFlLElBQUMsQ0FBQSxLQUFoQjtNQUNBLFlBQUEsRUFBZSxJQUFDLENBQUEsS0FEaEI7S0FEeUI7SUFJM0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBaEIsQ0FBbUIsZUFBbkIsRUFBb0MsSUFBQyxDQUFBLG1CQUFtQixDQUFDLE1BQXpEO1dBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBaEIsQ0FBbUIsS0FBbkIsRUFBMEIsSUFBQyxDQUFBLG1CQUEzQjtFQVBVOzsrQkFTWixJQUFBLEdBQU0sU0FBQTtJQUNKLElBQUcsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFIO2FBQ0UsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksSUFBWixFQUNFO1FBQUEsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ1AsS0FBSyxDQUFDLFFBQU4sQ0FBaUIsQ0FBQyxLQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFY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USxDQUFDLElBQWhCLENBQXFCLFNBQUMsT0FBRCxFQUFVLENBQVY7YUFDbkIsYUFBQSxJQUFpQiwwQkFBQSxHQUEyQixDQUEzQixHQUE2QixLQUE3QixHQUFpQyxDQUFDLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBWixDQUFELENBQWpDLEdBQXNEO0lBRHBELENBQXJCO0lBRUEsZUFBQSxHQUFrQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxpQkFBVjtJQUNsQixJQUF1QyxlQUFlLENBQUMsTUFBaEIsS0FBMEIsQ0FBakU7TUFBQSxlQUFlLENBQUMsSUFBaEIsQ0FBcUIsYUFBckIsRUFBQTs7QUFDQSxXQUFPO0VBTlk7OytCQVFyQixPQUFBLEdBQVMsU0FBQTtXQUNQLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxLQUFyQixDQUFBO0VBRE87Ozs7R0ExVXNCLFFBQVEsQ0FBQyIsImZpbGUiOiJsZXNzb25QbGFuL0xlc3NvblBsYW5FZGl0Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIExlc3NvblBsYW5FZGl0VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiAnbGVzc29uUGxhbl9lZGl0X3ZpZXcnXG5cbiAgZXZlbnRzIDpcbiAgICAnY2xpY2sgI2FyY2hpdmVfYnV0dG9ucyBpbnB1dCcgOiAnc2F2ZSdcbiAgICAnY2xpY2sgLmJhY2snICAgICAgICAgICAgICAgICAgOiAnZ29CYWNrJ1xuICAgICdjbGljayAubmV3X2VsZW1lbnRfYnV0dG9uJyAgICA6ICd0b2dnbGVOZXdFbGVtZW50Rm9ybSdcbiAgICAnY2xpY2sgLm5ld19lbGVtZW50X2NhbmNlbCcgICAgOiAndG9nZ2xlTmV3RWxlbWVudEZvcm0nXG5cbiAgICAna2V5cHJlc3MgI25ld19lbGVtZW50X25hbWUnICAgOiAnc2F2ZU5ld0VsZW1lbnQnXG4gICAgJ2NsaWNrIC5uZXdfZWxlbWVudF9zYXZlJyAgICAgIDogJ3NhdmVOZXdFbGVtZW50J1xuXG4gICAgJ2NoYW5nZSAjYmFzaWMgaW5wdXQnICAgICAgICAgIDogJ3NhdmUnXG4gICAgJ2NsaWNrIC5zYXZlJyAgICAgICAgICAgICAgICAgIDogJ3NhdmUnXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQG1vZGVsID0gb3B0aW9ucy5tb2RlbFxuICAgIEBlbGVtZW50TGlzdEVkaXRWaWV3ID0gbmV3IEVsZW1lbnRMaXN0RWRpdFZpZXdcbiAgICAgIFwibGVzc29uUGxhblwiIDogQG1vZGVsXG4gICAgICBcImFzc2Vzc21lbnRcIiA6IEBtb2RlbFxuXG4gICAgQG1vZGVsLmVsZW1lbnRzLm9uIFwiY2hhbmdlIHJlbW92ZVwiLCBAZWxlbWVudExpc3RFZGl0Vmlldy5yZW5kZXJcbiAgICBAbW9kZWwuZWxlbWVudHMub24gXCJhbGxcIiwgQHVwZGF0ZUVsZW1lbnRMZWdlbmRcblxuICBzYXZlOiA9PlxuICAgIGlmIEB1cGRhdGVNb2RlbCgpXG4gICAgICBAbW9kZWwuc2F2ZSBudWxsLFxuICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiI3tAbW9kZWwuZ2V0KFwibmFtZVwiKX0gc2F2ZWRcIlxuICAgICAgICBlcnJvcjogPT5cbiAgICAgICAgICBVdGlscy5taWRBbGVydCBcIkxlc3NvblBsYW4gc2F2ZSBlcnJvci4gUGxlYXNlIHRyeSBhZ2Fpbi5cIlxuXG4gIGdvQmFjazogLT4gVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImFzc2Vzc21lbnRzXCIsIHRydWVcblxuICB1cGRhdGVNb2RlbDogPT5cblxuI1xuIyBwYXJzZSBhY2NlcHRhYmxlIHJhbmRvbSBzZXF1ZW5jZXNcbiNcblxuICAgIGVsZW1lbnRDb3VudCA9IEBtb2RlbC5lbGVtZW50cy5tb2RlbHMubGVuZ3RoXG5cbiAgICAjIHJlbW92ZSBldmVyeXRoaW5nIGV4Y2VwdCBudW1iZXJzLCBjb21tYXMgYW5kIG5ldyBsaW5lc1xuICAgIHNlcXVlbmNlc1ZhbHVlID0gQCRlbC5maW5kKFwiI3NlcXVlbmNlc1wiKS52YWwoKS5yZXBsYWNlKC9bXjAtOSxcXG5dL2csXCJcIilcbiAgICBzZXF1ZW5jZXMgPSBzZXF1ZW5jZXNWYWx1ZS5zcGxpdChcIlxcblwiKVxuXG4gICAgIyBwYXJzZSBzdHJpbmdzIHRvIG51bWJlcnMgYW5kIGNvbGxlY3QgZXJyb3JzXG4gICAgZm9yIHNlcXVlbmNlLCBpIGluIHNlcXVlbmNlc1xuXG4gICAgICBzZXF1ZW5jZSA9IHNlcXVlbmNlLnNwbGl0KFwiLFwiKVxuICAgICAgZm9yIGVsZW1lbnQsIGogaW4gc2VxdWVuY2VcbiAgICAgICAgc2VxdWVuY2Vbal0gPSBwYXJzZUludChlbGVtZW50KVxuICAgICAgICByYW5nZUVycm9yID0gdHJ1ZSBpZiBzZXF1ZW5jZVtqXSA8IDAgb3Igc2VxdWVuY2Vbal0gPj0gZWxlbWVudENvdW50XG4gICAgICAgIGVtcHR5RXJyb3IgPSB0cnVlIGlmIGlzTmFOKHNlcXVlbmNlW2pdKVxuXG4gICAgICBzZXF1ZW5jZXNbaV0gPSBzZXF1ZW5jZVxuXG4gICAgICAjIGRldGVjdCBlcnJvcnNcbiAgICAgIHRvb01hbnlFcnJvciA9IHRydWUgaWYgc2VxdWVuY2UubGVuZ3RoID4gZWxlbWVudENvdW50XG4gICAgICB0b29GZXdFcnJvciAgPSB0cnVlIGlmIHNlcXVlbmNlLmxlbmd0aCA8IGVsZW1lbnRDb3VudFxuICAgICAgZG91Ymxlc0Vycm9yID0gdHJ1ZSBpZiBzZXF1ZW5jZS5sZW5ndGggIT0gXy51bmlxKHNlcXVlbmNlKS5sZW5ndGhcblxuICAgICMgc2hvdyBlcnJvcnMgaWYgdGhleSBleGlzdCBhbmQgc2VxdWVuY2VzIGV4aXN0XG4gICAgaWYgbm90IF8uaXNFbXB0eSBfLnJlamVjdCggXy5mbGF0dGVuKHNlcXVlbmNlcyksIChlKSAtPiByZXR1cm4gaXNOYU4oZSkpICMgcmVtb3ZlIHVucGFyc2FibGUgZW1wdGllcywgZG9uJ3QgXy5jb21wYWN0LiB3aWxsIHJlbW92ZSAwc1xuICAgICAgc2VxdWVuY2VFcnJvcnMgPSBbXVxuICAgICAgaWYgZW1wdHlFcnJvciAgIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgc2VxdWVuY2VzIGNvbnRhaW4gZW1wdHkgdmFsdWVzLlwiXG4gICAgICBpZiByYW5nZUVycm9yICAgdGhlbiBzZXF1ZW5jZUVycm9ycy5wdXNoIFwiU29tZSBudW1iZXJzIGRvIG5vdCByZWZlcmVuY2UgYSBlbGVtZW50IGZyb20gdGhlIGxlZ2VuZC5cIlxuICAgICAgaWYgdG9vTWFueUVycm9yIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgc2VxdWVuY2VzIGFyZSBsb25nZXIgdGhhbiB0aGUgdG90YWwgbnVtYmVyIG9mIGFsbCBlbGVtZW50cy5cIlxuICAgICAgaWYgdG9vRmV3RXJyb3IgIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgc2VxdWVuY2VzIGFyZSBzaG9ydGVyIHRoYW4gdGhlIHRvdGFsIG51bWJlciBvZiBhbGwgZWxlbWVudHMuXCJcbiAgICAgIGlmIGRvdWJsZXNFcnJvciB0aGVuIHNlcXVlbmNlRXJyb3JzLnB1c2ggXCJTb21lIHNlcXVlbmNlcyBjb250YWluIGRvdWJsZXMuXCJcblxuICAgICAgaWYgc2VxdWVuY2VFcnJvcnMubGVuZ3RoID09IDBcbiMgaWYgdGhlcmUncyBubyBlcnJvcnMsIGNsZWFuIHVwIHRoZSB0ZXh0YXJlYSBjb250ZW50XG4gICAgICAgIHZhbGlkYXRlZFNlcXVlbmNlcyA9IChzZXF1ZW5jZS5qb2luKFwiLCBcIikgZm9yIHNlcXVlbmNlIGluIHNlcXVlbmNlcykuam9pbihcIlxcblwiKVxuICAgICAgICBAJGVsLmZpbmQoXCIjc2VxdWVuY2VzXCIpLnZhbCh2YWxpZGF0ZWRTZXF1ZW5jZXMpXG4gICAgICBlbHNlICMgaWYgdGhlcmUncyBlcnJvcnMsIHRoZXkgY2FuIHN0aWxsIHNhdmUuIEp1c3Qgc2hvdyBhIHdhcm5pbmdcbiAgICAgICAgYWxlcnQgXCJXYXJuaW5nXFxuXFxuI3tzZXF1ZW5jZUVycm9ycy5qb2luKFwiXFxuXCIpfVwiXG5cbiMgbm90aGluZyByZXNlbWJsaW5nIGEgdmFsaWQgc2VxdWVuY2Ugd2FzIGZvdW5kXG4gICAgZWxzZVxuICAgICAgQCRlbC5maW5kKFwiI3NlcXVlbmNlc1wiKS52YWwoXCJcIikgIyBjbGVhbiB0ZXh0IGFyZWFcblxuICAgIEBtb2RlbC5zZXRcbiAgICAgIHNlcXVlbmNlcyA6IHNlcXVlbmNlc1xuICAgICAgYXJjaGl2ZWQgIDogQCRlbC5maW5kKFwiI2FyY2hpdmVfYnV0dG9ucyBpbnB1dDpjaGVja2VkXCIpLnZhbCgpID09IFwidHJ1ZVwiXG4gICAgICBuYW1lICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9uYW1lXCIpLnZhbCgpXG4gICAgICBkS2V5ICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9kX2tleVwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl90aXRsZSAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fdGl0bGVcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5fbGVzc29uX3RleHQgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX2xlc3Nvbl90ZXh0XCIpLnZhbCgpXG4jICAgICAgbGVzc29uUGxhbl9zdWJqZWN0ICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9zdWJqZWN0XCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuX3N1YmplY3QgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX3N1YmplY3RfYnV0dG9ucyBpbnB1dDpjaGVja2VkXCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuX2dyYWRlICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9ncmFkZVwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl93ZWVrICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl93ZWVrXCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuX2RheSAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fZGF5XCIpLnZhbCgpXG4jICAgICAgbGVzc29uUGxhbl9pbWFnZSAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5faW1hZ2VcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5JZCA6IEBtb2RlbC5pZFxuICAgICAgYXNzZXNzbWVudElkIDogQG1vZGVsLmlkXG4gICAgcmV0dXJuIHRydWVcblxuICB0b2dnbGVOZXdFbGVtZW50Rm9ybTogKGV2ZW50KSAtPlxuICAgIEAkZWwuZmluZChcIi5uZXdfZWxlbWVudF9mb3JtLCAubmV3X2VsZW1lbnRfYnV0dG9uXCIpLnRvZ2dsZSgpXG5cbiAgICBAJGVsLmZpbmQoXCIjbmV3X2VsZW1lbnRfbmFtZVwiKS52YWwoXCJcIilcbiAgICBAJGVsLmZpbmQoXCIjZWxlbWVudF90eXBlX3NlbGVjdFwiKS52YWwoXCJub25lXCIpXG5cbiAgICBmYWxzZVxuXG4gIHNhdmVOZXdFbGVtZW50OiAoZXZlbnQpID0+XG5cbiAgICBpZiBldmVudC50eXBlICE9IFwiY2xpY2tcIiAmJiBldmVudC53aGljaCAhPSAxM1xuICAgICAgcmV0dXJuIHRydWVcblxuICAgICMgaWYgbm8gZWxlbWVudCB0eXBlIHNlbGVjdGVkLCBzaG93IGVycm9yXG4gICAgaWYgQCRlbC5maW5kKFwiI2VsZW1lbnRfdHlwZV9zZWxlY3Qgb3B0aW9uOnNlbGVjdGVkXCIpLnZhbCgpID09IFwibm9uZVwiXG4gICAgICBVdGlscy5taWRBbGVydCBcIlBsZWFzZSBzZWxlY3QgYW4gZWxlbWVudCB0eXBlXCJcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgIyBnZW5lcmFsIHRlbXBsYXRlXG4gICAgbmV3QXR0cmlidXRlcyA9IFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwiZWxlbWVudFwiKVxuXG4gICAgIyBwcm90b3R5cGUgdGVtcGxhdGVcbiAgICBwcm90b3R5cGVUZW1wbGF0ZSA9IFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwiZWxlbWVudFR5cGVzXCIpW0AkZWwuZmluZChcIiNlbGVtZW50X3R5cGVfc2VsZWN0XCIpLnZhbCgpXVxuXG4gICAgIyBiaXQgbW9yZSBzcGVjaWZpYyB0ZW1wbGF0ZVxuICAgIHVzZVR5cGVUZW1wbGF0ZSA9IFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwiZWxlbWVudFwiKTtcblxuICAgIGZpbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbGVzXCIpLmZpbGVzWzBdXG4gICAgaWYgdHlwZW9mIGZpbGUgIT0gJ3VuZGVmaW5lZCdcbiAgICAgIGZkID0gbmV3IEZvcm1EYXRhKClcbiAgICAgIGZkLmFwcGVuZChcImZpbGVcIiwgZmlsZSlcblxuICAgIG5ld0F0dHJpYnV0ZXMgPSAkLmV4dGVuZCBuZXdBdHRyaWJ1dGVzLCBwcm90b3R5cGVUZW1wbGF0ZVxuICAgIG5ld0F0dHJpYnV0ZXMgPSAkLmV4dGVuZCBuZXdBdHRyaWJ1dGVzLCB1c2VUeXBlVGVtcGxhdGVcbiAgICBuZXdBdHRyaWJ1dGVzID0gJC5leHRlbmQgbmV3QXR0cmlidXRlcyxcbiAgICAgIG5hbWUgICAgICAgICA6IEAkZWwuZmluZChcIiNuZXdfZWxlbWVudF9uYW1lXCIpLnZhbCgpXG4gICAgICBlbGVtZW50ICAgICAgICAgOiBAJGVsLmZpbmQoXCIjZWxlbWVudF90eXBlX3NlbGVjdFwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbklkIDogQG1vZGVsLmlkXG4gICAgICBhc3Nlc3NtZW50SWQgOiBAbW9kZWwuaWRcbiAgICAgIG9yZGVyICAgICAgICA6IEBtb2RlbC5lbGVtZW50cy5sZW5ndGhcblxuICAgIGlmIHR5cGVvZiBmaWxlICE9ICd1bmRlZmluZWQnXG4gICAgICBuZXdBdHRyaWJ1dGVzID0gJC5leHRlbmQgbmV3QXR0cmlidXRlcyxcbiAgICAgICAgZmlsZVR5cGUgIDogZmlsZS50eXBlXG4gICAgICAgIGZpbGVOYW1lICA6IGZpbGUubmFtZVxuICAgICAgICBmaWxlU2l6ZSAgOiBmaWxlLnNpemVcblxuICAgIGlmIHR5cGVvZiBmaWxlID09ICd1bmRlZmluZWQnXG4gICAgICBvcHRpb25zID1cbiAgICAgICAgc3VjY2VzczogKG1vZGVsLCByZXNwKSA9PlxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiTW9kZWwgY3JlYXRlZC5cIilcbiAgICAgICAgZXJyb3I6IChtb2RlbCwgZXJyKSA9PlxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6IFwiICsgSlNPTi5zdHJpbmdpZnkoZXJyKSArIFwiIE1vZGVsOiBcIiArIEpTT04uc3RyaW5naWZ5KG1vZGVsKSlcbiAgICBlbHNlXG4gICAgICBvcHRpb25zID1cbiAgICAgICAgc3VjY2VzczogKG1vZGVsLCByZXNwKSA9PlxuICAjICAgICAgICBjb25zb2xlLmxvZyhcImNyZWF0ZWQ6IFwiICsgSlNPTi5zdHJpbmdpZnkocmVzcCkgKyBcIiBNb2RlbDogXCIgKyBKU09OLnN0cmluZ2lmeShtb2RlbCkpXG4gICAgICAgICAgdXJsID0gXCIje1RhbmdlcmluZS5jb25maWcuZ2V0KCdyb2JiZXJ0Jyl9L2ZpbGVzXCJcbiAgICAgICAgICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICB4aHIudXBsb2FkLm9uZXJyb3IgPSAoZSkgPT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3IgVXBsb2FkaW5nIGltYWdlOiBcIiArIEpTT04uc3RyaW5naWZ5KGUpKVxuICAgICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PlxuICAgICAgICAgICAgaWYgeGhyLnJlYWR5U3RhdGUgPT0gNFxuICAgICAgICAgICAgICBpZiB4aHIuc3RhdHVzID09IDIwMFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHhoci5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRoZXJlIHdhcyBhbiBlcnJvciB1cGxvYWRpbmcgdGhlIGZpbGU6IFwiICsgeGhyLnJlc3BvbnNlVGV4dCArIFwiIFN0YXR1czogXCIgKyB4aHIuc3RhdHVzKVxuICAgICAgICAgICAgICAgIGFsZXJ0KFwiVGhlcmUgd2FzIGFuIGVycm9yIHVwbG9hZGluZyB0aGUgZmlsZTogXCIgKyB4aHIucmVzcG9uc2VUZXh0ICsgXCIgU3RhdHVzOiBcIiArIHhoci5zdGF0dXMpXG4gICAgICAgICAgeGhyLm9uZXJyb3IgPSAgKCkgPT5cbiAgICAgICAgICAgIGFsZXJ0KFwiVGhlcmUgd2FzIGFuIGVycm9yIHVwbG9hZGluZyB0aGUgZmlsZTogXCIgKyB4aHIucmVzcG9uc2VUZXh0ICsgXCIgU3RhdHVzOiBcIiArIHhoci5zdGF0dXMpXG5cbiAgICAgICAgICAjIGRlZmluZSBvdXIgZmluaXNoIGZuXG4gICAgICAgICAgbG9hZGVkID0gKCktPlxuICAjICAgICAgICAgIGNvbnNvbGUubG9nKCdmaW5pc2hlZCB1cGxvYWRpbmcnKVxuICAgICAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyICdsb2FkJywgbG9hZGVkLCBmYWxzZVxuICAgICAgICAgIHByb2dyZXNzQmFyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcigncHJvZ3Jlc3MnKTtcbiAgICAgICAgICB4aHIudXBsb2FkLm9ucHJvZ3Jlc3MgPSAoZSkgPT5cbiAgICAgICAgICAgIGlmIGUubGVuZ3RoQ29tcHV0YWJsZVxuICAgICAgICAgICAgICBwcm9ncmVzc0Jhci52YWx1ZSA9IChlLmxvYWRlZCAvIGUudG90YWwpICogMTAwO1xuICAgICAgICAgICAgICBwcm9ncmVzc0Jhci50ZXh0Q29udGVudCA9IHByb2dyZXNzQmFyLnZhbHVlO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInByb2dyZXNzOiBcIiArIHByb2dyZXNzQmFyLnZhbHVlKVxuICAgICAgICAgIHhoci5vcGVuKCdQT1NUJywgdXJsLCB0cnVlKTtcbiAgICAgICAgICB4aHIuc2VuZChmZCk7XG4gICAgICAgIGVycm9yOiAobW9kZWwsIGVycikgPT5cbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiArIEpTT04uc3RyaW5naWZ5KGVycikgKyBcIiBNb2RlbDogXCIgKyBKU09OLnN0cmluZ2lmeShtb2RlbCkpXG5cbiAgICBuZXdFbGVtZW50ID0gQG1vZGVsLmVsZW1lbnRzLmNyZWF0ZSBuZXdBdHRyaWJ1dGVzLCBvcHRpb25zXG4gICAgbmV3RWxlbWVudC5vbigncHJvZ3Jlc3MnLCAoZXZ0KSAtPlxuICAgICAgY29uc29sZS5sb2coXCJMb2dnaW5nIG5ld0VsZW1lbnQ6IFwiICsgZXZ0KVxuICAgIClcblxuICAgIEB0b2dnbGVOZXdFbGVtZW50Rm9ybSgpXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgcmVuZGVyOiA9PlxuICAgIGxlc3NvblBsYW5fdGl0bGUgICAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwibGVzc29uUGxhbl90aXRsZVwiKVxuICAgIGxlc3NvblBsYW5fbGVzc29uX3RleHQgICAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwibGVzc29uUGxhbl9sZXNzb25fdGV4dFwiKVxuICAgIGxlc3NvblBsYW5fc3ViamVjdCAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX3N1YmplY3RcIilcbiAgICBsZXNzb25QbGFuX2dyYWRlICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxlc3NvblBsYW5fZ3JhZGVcIilcbiAgICBsZXNzb25QbGFuX3dlZWsgICAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwibGVzc29uUGxhbl93ZWVrXCIpXG4gICAgbGVzc29uUGxhbl9kYXkgICAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwibGVzc29uUGxhbl9kYXlcIilcbiAgICBzZXF1ZW5jZXMgPSBcIlwiXG4gICAgaWYgQG1vZGVsLmhhcyhcInNlcXVlbmNlc1wiKVxuICAgICAgc2VxdWVuY2VzID0gQG1vZGVsLmdldChcInNlcXVlbmNlc1wiKVxuICAgICAgc2VxdWVuY2VzID0gc2VxdWVuY2VzLmpvaW4oXCJcXG5cIilcblxuICAgICAgaWYgXy5pc0FycmF5KHNlcXVlbmNlcylcbiAgICAgICAgZm9yIHNlcXVlbmNlcywgaSBpbiBzZXF1ZW5jZXNcbiAgICAgICAgICBzZXF1ZW5jZXNbaV0gPSBzZXF1ZW5jZXMuam9pbihcIiwgXCIpXG5cbiAgICBlbGVtZW50TGVnZW5kID0gQHVwZGF0ZUVsZW1lbnRMZWdlbmQoKVxuXG4gICAgYXJjaCA9IEBtb2RlbC5nZXQoJ2FyY2hpdmVkJylcbiAgICBhcmNoaXZlQ2hlY2tlZCAgICA9IGlmIChhcmNoID09IHRydWUgb3IgYXJjaCA9PSAndHJ1ZScpIHRoZW4gXCJjaGVja2VkXCIgZWxzZSBcIlwiXG4gICAgbm90QXJjaGl2ZUNoZWNrZWQgPSBpZiBhcmNoaXZlQ2hlY2tlZCB0aGVuIFwiXCIgZWxzZSBcImNoZWNrZWRcIlxuXG4gICAgbGVzc29uUGxhbl9zdWJqZWN0X0VuZ2lzaCAgICA9IGlmIChsZXNzb25QbGFuX3N1YmplY3QgPT0gJzEnKSB0aGVuIFwiY2hlY2tlZFwiIGVsc2UgXCJcIlxuICAgIGxlc3NvblBsYW5fc3ViamVjdF9LaXN3YWhpbGkgPSBpZiAobGVzc29uUGxhbl9zdWJqZWN0ID09ICcyJykgdGhlbiBcImNoZWNrZWRcIiBlbHNlIFwiXCJcblxuICAgICMgbGlzdCBvZiBcInRlbXBsYXRlc1wiXG4gICAgZWxlbWVudFR5cGVTZWxlY3QgPSBcIjxzZWxlY3QgaWQ9J2VsZW1lbnRfdHlwZV9zZWxlY3QnPlxuICAgICAgPG9wdGlvbiB2YWx1ZT0nbm9uZScgZGlzYWJsZWQ9J2Rpc2FibGVkJyBzZWxlY3RlZD0nc2VsZWN0ZWQnPlBsZWFzZSBzZWxlY3QgYSBlbGVtZW50IHR5cGU8L29wdGlvbj5cIlxuICAgIGZvciBrZXksIHZhbHVlIG9mIFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwiZWxlbWVudFR5cGVzXCIpXG4jICAgICAgZWxlbWVudFR5cGVTZWxlY3QgKz0gXCI8b3B0Z3JvdXAgbGFiZWw9JyN7a2V5Lmh1bWFuaXplKCl9Jz5cIlxuIyAgICAgIGZvciBzdWJLZXksIHN1YlZhbHVlIG9mIHZhbHVlXG4gICAgICAgIGVsZW1lbnRUeXBlU2VsZWN0ICs9IFwiPG9wdGlvbiB2YWx1ZT0nI3trZXl9JyBkYXRhLXRlbXBsYXRlPScje2tleX0nPiN7a2V5Lmh1bWFuaXplKCl9PC9vcHRpb24+XCJcbiMgICAgICBlbGVtZW50VHlwZVNlbGVjdCArPSBcIjwvb3B0Z3JvdXA+XCJcbiAgICBlbGVtZW50VHlwZVNlbGVjdCArPSBcIjwvc2VsZWN0PlwiXG5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICAgIDxidXR0b24gY2xhc3M9J2JhY2sgbmF2aWdhdGlvbic+QmFjazwvYnV0dG9uPlxuICAgICAgICA8aDE+TGVzc29uUGxhbiBCdWlsZGVyPC9oMT5cbiAgICAgIDxkaXYgaWQ9J2Jhc2ljJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nbGVzc29uUGxhbl9uYW1lJz5OYW1lPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IGlkPSdsZXNzb25QbGFuX25hbWUnIHZhbHVlPScje0Btb2RlbC5lc2NhcGUoXCJuYW1lXCIpfSc+XG5cbiAgICAgICAgPGxhYmVsIGZvcj0nbGVzc29uUGxhbl9kX2tleScgdGl0bGU9J1RoaXMga2V5IGlzIHVzZWQgdG8gaW1wb3J0IHRoZSBsZXNzb25QbGFuIGZyb20gYSB0YWJsZXQuJz5Eb3dubG9hZCBLZXk8L2xhYmVsPjxicj5cbiAgICAgICAgPGRpdiBjbGFzcz0naW5mb19ib3gnPiN7QG1vZGVsLmlkLnN1YnN0cigtNSw1KX08L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8bGFiZWwgdGl0bGU9J09ubHkgYWN0aXZlIGxlc3NvblBsYW5zIHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBtYWluIGxlc3NvblBsYW4gbGlzdC4nPlN0YXR1czwvbGFiZWw+PGJyPlxuICAgICAgPGRpdiBpZD0nYXJjaGl2ZV9idXR0b25zJyBjbGFzcz0nYnV0dG9uc2V0Jz5cbiAgICAgICAgPGlucHV0IHR5cGU9J3JhZGlvJyBpZD0nYXJjaGl2ZV9mYWxzZScgbmFtZT0nYXJjaGl2ZScgdmFsdWU9J2ZhbHNlJyAje25vdEFyY2hpdmVDaGVja2VkfT48bGFiZWwgZm9yPSdhcmNoaXZlX2ZhbHNlJz5BY3RpdmU8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgdHlwZT0ncmFkaW8nIGlkPSdhcmNoaXZlX3RydWUnICBuYW1lPSdhcmNoaXZlJyB2YWx1ZT0ndHJ1ZScgICN7YXJjaGl2ZUNoZWNrZWR9PjxsYWJlbCBmb3I9J2FyY2hpdmVfdHJ1ZSc+QXJjaGl2ZWQ8L2xhYmVsPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nbGVzc29uUGxhbl90aXRsZSc+TGVzc29uUGxhbiBUaXRsZTwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCBpZD0nbGVzc29uUGxhbl90aXRsZScgdmFsdWU9JyN7bGVzc29uUGxhbl90aXRsZX0nPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgIDxsYWJlbCBmb3I9J2xlc3NvblBsYW5fbGVzc29uX3RleHQnIHRpdGxlPSdMZXNzb24gVGV4dC4nPkxlc3NvblBsYW4gVGV4dDwvbGFiZWw+XG4gICAgICAgICAgPHRleHRhcmVhIGlkPSdsZXNzb25QbGFuX2xlc3Nvbl90ZXh0Jz4je2xlc3NvblBsYW5fbGVzc29uX3RleHR9PC90ZXh0YXJlYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGxhYmVsIHRpdGxlPSdZb3UgbXVzdCBjaG9vc2Ugb25lIG9mIHRoZXNlIHN1YmplY3RzLicgZm9yPSdsZXNzb25QbGFuX3N1YmplY3RfYnV0dG9ucyc+TGVzc29uUGxhbiBzdWJqZWN0PC9sYWJlbD48YnI+XG4gICAgICA8ZGl2IGlkPSdsZXNzb25QbGFuX3N1YmplY3RfYnV0dG9ucycgY2xhc3M9J2J1dHRvbnNldCc+XG4gICAgICAgIDxpbnB1dCB0eXBlPSdyYWRpbycgaWQ9J2xlc3NvblBsYW5fc3ViamVjdF9Fbmdpc2gnIG5hbWU9J2xlc3NvblBsYW5fc3ViamVjdCcgdmFsdWU9JzEnICN7bGVzc29uUGxhbl9zdWJqZWN0X0VuZ2lzaH0+PGxhYmVsIGZvcj0nbGVzc29uUGxhbl9zdWJqZWN0X0VuZ2lzaCc+RW5naXNoPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IHR5cGU9J3JhZGlvJyBpZD0nbGVzc29uUGxhbl9zdWJqZWN0X0tpc3dhaGlsaScgIG5hbWU9J2xlc3NvblBsYW5fc3ViamVjdCcgdmFsdWU9JzInICAje2xlc3NvblBsYW5fc3ViamVjdF9LaXN3YWhpbGl9PjxsYWJlbCBmb3I9J2xlc3NvblBsYW5fc3ViamVjdF9LaXN3YWhpbGknPktpc3dhaGlsaTwvbGFiZWw+XG4gICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX2dyYWRlJz5MZXNzb25QbGFuIEdyYWRlPC9sYWJlbD5cbiAgICAgIDxpbnB1dCBpZD0nbGVzc29uUGxhbl9ncmFkZScgdmFsdWU9JyN7bGVzc29uUGxhbl9ncmFkZX0nPlxuICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nbGVzc29uUGxhbl93ZWVrJz5MZXNzb25QbGFuIFdlZWs8L2xhYmVsPlxuICAgICAgPGlucHV0IGlkPSdsZXNzb25QbGFuX3dlZWsnIHZhbHVlPScje2xlc3NvblBsYW5fd2Vla30nPlxuICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nbGVzc29uUGxhbl9kYXknPkxlc3NvblBsYW4gRGF5PC9sYWJlbD5cbiAgICAgIDxpbnB1dCBpZD0nbGVzc29uUGxhbl9kYXknIHZhbHVlPScje2xlc3NvblBsYW5fZGF5fSc+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGgyPkVsZW1lbnRzPC9oMj5cbiAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgPHByb2dyZXNzIG1pbj0nMCcgbWF4PScxMDAnIHZhbHVlPScwJz48L3Byb2dyZXNzPlxuICAgICAgICA8ZGl2PlxuICAgICAgICA8dWwgaWQ9J2VsZW1lbnRfbGlzdCc+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8YnV0dG9uIGNsYXNzPSduZXdfZWxlbWVudF9idXR0b24gY29tbWFuZCc+QWRkIEVsZW1lbnQ8L2J1dHRvbj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbmV3X2VsZW1lbnRfZm9ybSBjb25maXJtYXRpb24nPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICAgIDxoMj5OZXcgRWxlbWVudDwvaDI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdlbGVtZW50X3R5cGVfc2VsZWN0Jz5UeXBlPC9sYWJlbD48YnI+XG4gICAgICAgICAgICAje2VsZW1lbnRUeXBlU2VsZWN0fTxicj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J25ld19lbGVtZW50X25hbWUnPk5hbWU8L2xhYmVsPjxicj5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPSd0ZXh0JyBpZD0nbmV3X2VsZW1lbnRfbmFtZSc+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT0nZmlsZScgbmFtZT0nZmlsZXMnIGlkPSdmaWxlcycgbXVsdGlwbGU9J211bHRpcGxlJyAvPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmV3X2VsZW1lbnRfc2F2ZSBjb21tYW5kJz5BZGQ8L2J1dHRvbj4gPGJ1dHRvbiBjbGFzcz0nbmV3X2VsZW1lbnRfY2FuY2VsIGNvbW1hbmQnPkNhbmNlbDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGgyPk9wdGlvbnM8L2gyPlxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdzZXF1ZW5jZXMnIHRpdGxlPSdUaGlzIGlzIGEgbGlzdCBvZiBhY2NlcHRhYmxlIG9yZGVycyBvZiBlbGVtZW50cywgd2hpY2ggd2lsbCBiZSByYW5kb21seSBzZWxlY3RlZCBlYWNoIHRpbWUgYW4gbGVzc29uUGxhbiBpcyBydW4uIEVsZW1lbnQgaW5kaWNpZXMgYXJlIHNlcGFyYXRlZCBieSBjb21tYXMsIG5ldyBsaW5lcyBzZXBhcmF0ZSBzZXF1ZW5jZXMuICc+UmFuZG9tIFNlcXVlbmNlczwvbGFiZWw+XG4gICAgICAgIDxkaXYgaWQ9J2VsZW1lbnRfbGVnZW5kJz4je2VsZW1lbnRMZWdlbmR9PC9kaXY+XG4gICAgICAgIDx0ZXh0YXJlYSBpZD0nc2VxdWVuY2VzJz4je3NlcXVlbmNlc308L3RleHRhcmVhPlxuICAgICAgPC9kaXY+XG4gICAgICA8YnV0dG9uIGNsYXNzPSdzYXZlIGNvbW1hbmQnPlNhdmU8L2J1dHRvbj5cbiAgICAgIFwiXG5cbiAgICAjIHJlbmRlciBuZXcgZWxlbWVudCB2aWV3c1xuICAgIEBlbGVtZW50TGlzdEVkaXRWaWV3LnNldEVsZW1lbnQoQCRlbC5maW5kKFwiI2VsZW1lbnRfbGlzdFwiKSlcbiAgICBAZWxlbWVudExpc3RFZGl0Vmlldy5yZW5kZXIoKVxuXG4gICAgIyBtYWtlIGl0IHNvcnRhYmxlXG4gICAgQCRlbC5maW5kKFwiI2VsZW1lbnRfbGlzdFwiKS5zb3J0YWJsZVxuICAgICAgaGFuZGxlIDogJy5zb3J0YWJsZV9oYW5kbGUnXG4gICAgICBzdGFydDogKGV2ZW50LCB1aSkgLT4gdWkuaXRlbS5hZGRDbGFzcyBcImRyYWdfc2hhZG93XCJcbiAgICAgIHN0b3A6ICAoZXZlbnQsIHVpKSAtPiB1aS5pdGVtLnJlbW92ZUNsYXNzIFwiZHJhZ19zaGFkb3dcIlxuICAgICAgdXBkYXRlIDogKGV2ZW50LCB1aSkgPT5cbiAgICAgICAgZm9yIGlkLCBpIGluICgkKGxpKS5hdHRyKFwiZGF0YS1pZFwiKSBmb3IgbGkgaW4gQCRlbC5maW5kKFwiI2VsZW1lbnRfbGlzdCBsaVwiKSlcbiAgICAgICAgICBAbW9kZWwuZWxlbWVudHMuZ2V0KGlkKS5zZXQoe1wib3JkZXJcIjppfSx7c2lsZW50OnRydWV9KS5zYXZlKG51bGwse3NpbGVudDp0cnVlfSlcbiAgICAgICAgQG1vZGVsLmVsZW1lbnRzLnNvcnQoKVxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cblxuICB1cGRhdGVFbGVtZW50TGVnZW5kOiA9PlxuICAgIGVsZW1lbnRMZWdlbmQgPSBcIlwiXG4gICAgQG1vZGVsLmVsZW1lbnRzLmVhY2ggKGVsZW1lbnQsIGkpIC0+XG4gICAgICBlbGVtZW50TGVnZW5kICs9IFwiPGRpdiBjbGFzcz0nc21hbGxfZ3JleSc+I3tpfSAtICN7ZWxlbWVudC5nZXQoXCJuYW1lXCIpfTwvZGl2Pjxicj5cIlxuICAgICRlbGVtZW50V3JhcHBlciA9IEAkZWwuZmluZChcIiNlbGVtZW50X2xlZ2VuZFwiKVxuICAgICRlbGVtZW50V3JhcHBlci5odG1sKGVsZW1lbnRMZWdlbmQpIGlmICRlbGVtZW50V3JhcHBlci5sZW5ndGggIT0gMFxuICAgIHJldHVybiBlbGVtZW50TGVnZW5kXG5cbiAgb25DbG9zZTogLT5cbiAgICBAZWxlbWVudExpc3RFZGl0Vmlldy5jbG9zZSgpXG4gICAgXG4iXX0=
