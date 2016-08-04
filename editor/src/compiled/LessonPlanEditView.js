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
    this.$el.find("#files").toggle();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlc3NvblBsYW4vTGVzc29uUGxhbkVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGtCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7OytCQUVKLFNBQUEsR0FBWTs7K0JBRVosTUFBQSxHQUNFO0lBQUEsOEJBQUEsRUFBaUMsTUFBakM7SUFDQSxhQUFBLEVBQWlDLFFBRGpDO0lBRUEsMkJBQUEsRUFBaUMsc0JBRmpDO0lBR0EsMkJBQUEsRUFBaUMsc0JBSGpDO0lBS0EsNEJBQUEsRUFBaUMsZ0JBTGpDO0lBTUEseUJBQUEsRUFBaUMsZ0JBTmpDO0lBUUEscUJBQUEsRUFBaUMsTUFSakM7SUFTQSxhQUFBLEVBQWlDLE1BVGpDOzs7K0JBV0YsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO0lBQ2pCLElBQUMsQ0FBQSxtQkFBRCxHQUEyQixJQUFBLG1CQUFBLENBQ3pCO01BQUEsWUFBQSxFQUFlLElBQUMsQ0FBQSxLQUFoQjtNQUNBLFlBQUEsRUFBZSxJQUFDLENBQUEsS0FEaEI7S0FEeUI7SUFJM0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBaEIsQ0FBbUIsZUFBbkIsRUFBb0MsSUFBQyxDQUFBLG1CQUFtQixDQUFDLE1BQXpEO1dBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBaEIsQ0FBbUIsS0FBbkIsRUFBMEIsSUFBQyxDQUFBLG1CQUEzQjtFQVBVOzsrQkFTWixJQUFBLEdBQU0sU0FBQTtJQUNKLElBQUcsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFIO2FBQ0UsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksSUFBWixFQUNFO1FBQUEsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ1AsS0FBSyxDQUFDLFFBQU4sQ0FBaUIsQ0FBQyxLQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFY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LFNBQUE7QUFDbkIsUUFBQTtJQUFBLGFBQUEsR0FBZ0I7SUFDaEIsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBaEIsQ0FBcUIsU0FBQyxPQUFELEVBQVUsQ0FBVjthQUNuQixhQUFBLElBQWlCLDBCQUFBLEdBQTJCLENBQTNCLEdBQTZCLEtBQTdCLEdBQWlDLENBQUMsT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLENBQUQsQ0FBakMsR0FBc0Q7SUFEcEQsQ0FBckI7SUFFQSxlQUFBLEdBQWtCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlCQUFWO0lBQ2xCLElBQXVDLGVBQWUsQ0FBQyxNQUFoQixLQUEwQixDQUFqRTtNQUFBLGVBQWUsQ0FBQyxJQUFoQixDQUFxQixhQUFyQixFQUFBOztBQUNBLFdBQU87RUFOWTs7K0JBUXJCLE9BQUEsR0FBUyxTQUFBO1dBQ1AsSUFBQyxDQUFBLG1CQUFtQixDQUFDLEtBQXJCLENBQUE7RUFETzs7OztHQTNVc0IsUUFBUSxDQUFDIiwiZmlsZSI6Imxlc3NvblBsYW4vTGVzc29uUGxhbkVkaXRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTGVzc29uUGxhbkVkaXRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6ICdsZXNzb25QbGFuX2VkaXRfdmlldydcblxuICBldmVudHMgOlxuICAgICdjbGljayAjYXJjaGl2ZV9idXR0b25zIGlucHV0JyA6ICdzYXZlJ1xuICAgICdjbGljayAuYmFjaycgICAgICAgICAgICAgICAgICA6ICdnb0JhY2snXG4gICAgJ2NsaWNrIC5uZXdfZWxlbWVudF9idXR0b24nICAgIDogJ3RvZ2dsZU5ld0VsZW1lbnRGb3JtJ1xuICAgICdjbGljayAubmV3X2VsZW1lbnRfY2FuY2VsJyAgICA6ICd0b2dnbGVOZXdFbGVtZW50Rm9ybSdcblxuICAgICdrZXlwcmVzcyAjbmV3X2VsZW1lbnRfbmFtZScgICA6ICdzYXZlTmV3RWxlbWVudCdcbiAgICAnY2xpY2sgLm5ld19lbGVtZW50X3NhdmUnICAgICAgOiAnc2F2ZU5ld0VsZW1lbnQnXG5cbiAgICAnY2hhbmdlICNiYXNpYyBpbnB1dCcgICAgICAgICAgOiAnc2F2ZSdcbiAgICAnY2xpY2sgLnNhdmUnICAgICAgICAgICAgICAgICAgOiAnc2F2ZSdcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBAbW9kZWwgPSBvcHRpb25zLm1vZGVsXG4gICAgQGVsZW1lbnRMaXN0RWRpdFZpZXcgPSBuZXcgRWxlbWVudExpc3RFZGl0Vmlld1xuICAgICAgXCJsZXNzb25QbGFuXCIgOiBAbW9kZWxcbiAgICAgIFwiYXNzZXNzbWVudFwiIDogQG1vZGVsXG5cbiAgICBAbW9kZWwuZWxlbWVudHMub24gXCJjaGFuZ2UgcmVtb3ZlXCIsIEBlbGVtZW50TGlzdEVkaXRWaWV3LnJlbmRlclxuICAgIEBtb2RlbC5lbGVtZW50cy5vbiBcImFsbFwiLCBAdXBkYXRlRWxlbWVudExlZ2VuZFxuXG4gIHNhdmU6ID0+XG4gICAgaWYgQHVwZGF0ZU1vZGVsKClcbiAgICAgIEBtb2RlbC5zYXZlIG51bGwsXG4gICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCIje0Btb2RlbC5nZXQoXCJuYW1lXCIpfSBzYXZlZFwiXG4gICAgICAgIGVycm9yOiA9PlxuICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiTGVzc29uUGxhbiBzYXZlIGVycm9yLiBQbGVhc2UgdHJ5IGFnYWluLlwiXG5cbiAgZ29CYWNrOiAtPiBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiYXNzZXNzbWVudHNcIiwgdHJ1ZVxuXG4gIHVwZGF0ZU1vZGVsOiA9PlxuXG4jXG4jIHBhcnNlIGFjY2VwdGFibGUgcmFuZG9tIHNlcXVlbmNlc1xuI1xuXG4gICAgZWxlbWVudENvdW50ID0gQG1vZGVsLmVsZW1lbnRzLm1vZGVscy5sZW5ndGhcblxuICAgICMgcmVtb3ZlIGV2ZXJ5dGhpbmcgZXhjZXB0IG51bWJlcnMsIGNvbW1hcyBhbmQgbmV3IGxpbmVzXG4gICAgc2VxdWVuY2VzVmFsdWUgPSBAJGVsLmZpbmQoXCIjc2VxdWVuY2VzXCIpLnZhbCgpLnJlcGxhY2UoL1teMC05LFxcbl0vZyxcIlwiKVxuICAgIHNlcXVlbmNlcyA9IHNlcXVlbmNlc1ZhbHVlLnNwbGl0KFwiXFxuXCIpXG5cbiAgICAjIHBhcnNlIHN0cmluZ3MgdG8gbnVtYmVycyBhbmQgY29sbGVjdCBlcnJvcnNcbiAgICBmb3Igc2VxdWVuY2UsIGkgaW4gc2VxdWVuY2VzXG5cbiAgICAgIHNlcXVlbmNlID0gc2VxdWVuY2Uuc3BsaXQoXCIsXCIpXG4gICAgICBmb3IgZWxlbWVudCwgaiBpbiBzZXF1ZW5jZVxuICAgICAgICBzZXF1ZW5jZVtqXSA9IHBhcnNlSW50KGVsZW1lbnQpXG4gICAgICAgIHJhbmdlRXJyb3IgPSB0cnVlIGlmIHNlcXVlbmNlW2pdIDwgMCBvciBzZXF1ZW5jZVtqXSA+PSBlbGVtZW50Q291bnRcbiAgICAgICAgZW1wdHlFcnJvciA9IHRydWUgaWYgaXNOYU4oc2VxdWVuY2Vbal0pXG5cbiAgICAgIHNlcXVlbmNlc1tpXSA9IHNlcXVlbmNlXG5cbiAgICAgICMgZGV0ZWN0IGVycm9yc1xuICAgICAgdG9vTWFueUVycm9yID0gdHJ1ZSBpZiBzZXF1ZW5jZS5sZW5ndGggPiBlbGVtZW50Q291bnRcbiAgICAgIHRvb0Zld0Vycm9yICA9IHRydWUgaWYgc2VxdWVuY2UubGVuZ3RoIDwgZWxlbWVudENvdW50XG4gICAgICBkb3VibGVzRXJyb3IgPSB0cnVlIGlmIHNlcXVlbmNlLmxlbmd0aCAhPSBfLnVuaXEoc2VxdWVuY2UpLmxlbmd0aFxuXG4gICAgIyBzaG93IGVycm9ycyBpZiB0aGV5IGV4aXN0IGFuZCBzZXF1ZW5jZXMgZXhpc3RcbiAgICBpZiBub3QgXy5pc0VtcHR5IF8ucmVqZWN0KCBfLmZsYXR0ZW4oc2VxdWVuY2VzKSwgKGUpIC0+IHJldHVybiBpc05hTihlKSkgIyByZW1vdmUgdW5wYXJzYWJsZSBlbXB0aWVzLCBkb24ndCBfLmNvbXBhY3QuIHdpbGwgcmVtb3ZlIDBzXG4gICAgICBzZXF1ZW5jZUVycm9ycyA9IFtdXG4gICAgICBpZiBlbXB0eUVycm9yICAgdGhlbiBzZXF1ZW5jZUVycm9ycy5wdXNoIFwiU29tZSBzZXF1ZW5jZXMgY29udGFpbiBlbXB0eSB2YWx1ZXMuXCJcbiAgICAgIGlmIHJhbmdlRXJyb3IgICB0aGVuIHNlcXVlbmNlRXJyb3JzLnB1c2ggXCJTb21lIG51bWJlcnMgZG8gbm90IHJlZmVyZW5jZSBhIGVsZW1lbnQgZnJvbSB0aGUgbGVnZW5kLlwiXG4gICAgICBpZiB0b29NYW55RXJyb3IgdGhlbiBzZXF1ZW5jZUVycm9ycy5wdXNoIFwiU29tZSBzZXF1ZW5jZXMgYXJlIGxvbmdlciB0aGFuIHRoZSB0b3RhbCBudW1iZXIgb2YgYWxsIGVsZW1lbnRzLlwiXG4gICAgICBpZiB0b29GZXdFcnJvciAgdGhlbiBzZXF1ZW5jZUVycm9ycy5wdXNoIFwiU29tZSBzZXF1ZW5jZXMgYXJlIHNob3J0ZXIgdGhhbiB0aGUgdG90YWwgbnVtYmVyIG9mIGFsbCBlbGVtZW50cy5cIlxuICAgICAgaWYgZG91Ymxlc0Vycm9yIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgc2VxdWVuY2VzIGNvbnRhaW4gZG91Ymxlcy5cIlxuXG4gICAgICBpZiBzZXF1ZW5jZUVycm9ycy5sZW5ndGggPT0gMFxuIyBpZiB0aGVyZSdzIG5vIGVycm9ycywgY2xlYW4gdXAgdGhlIHRleHRhcmVhIGNvbnRlbnRcbiAgICAgICAgdmFsaWRhdGVkU2VxdWVuY2VzID0gKHNlcXVlbmNlLmpvaW4oXCIsIFwiKSBmb3Igc2VxdWVuY2UgaW4gc2VxdWVuY2VzKS5qb2luKFwiXFxuXCIpXG4gICAgICAgIEAkZWwuZmluZChcIiNzZXF1ZW5jZXNcIikudmFsKHZhbGlkYXRlZFNlcXVlbmNlcylcbiAgICAgIGVsc2UgIyBpZiB0aGVyZSdzIGVycm9ycywgdGhleSBjYW4gc3RpbGwgc2F2ZS4gSnVzdCBzaG93IGEgd2FybmluZ1xuICAgICAgICBhbGVydCBcIldhcm5pbmdcXG5cXG4je3NlcXVlbmNlRXJyb3JzLmpvaW4oXCJcXG5cIil9XCJcblxuIyBub3RoaW5nIHJlc2VtYmxpbmcgYSB2YWxpZCBzZXF1ZW5jZSB3YXMgZm91bmRcbiAgICBlbHNlXG4gICAgICBAJGVsLmZpbmQoXCIjc2VxdWVuY2VzXCIpLnZhbChcIlwiKSAjIGNsZWFuIHRleHQgYXJlYVxuXG4gICAgQG1vZGVsLnNldFxuICAgICAgc2VxdWVuY2VzIDogc2VxdWVuY2VzXG4gICAgICBhcmNoaXZlZCAgOiBAJGVsLmZpbmQoXCIjYXJjaGl2ZV9idXR0b25zIGlucHV0OmNoZWNrZWRcIikudmFsKCkgPT0gXCJ0cnVlXCJcbiAgICAgIG5hbWUgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX25hbWVcIikudmFsKClcbiAgICAgIGRLZXkgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX2Rfa2V5XCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuX3RpdGxlICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl90aXRsZVwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl9sZXNzb25fdGV4dCAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fbGVzc29uX3RleHRcIikudmFsKClcbiMgICAgICBsZXNzb25QbGFuX3N1YmplY3QgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX3N1YmplY3RcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5fc3ViamVjdCAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fc3ViamVjdF9idXR0b25zIGlucHV0OmNoZWNrZWRcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5fZ3JhZGUgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX2dyYWRlXCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuX3dlZWsgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX3dlZWtcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5fZGF5ICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9kYXlcIikudmFsKClcbiMgICAgICBsZXNzb25QbGFuX2ltYWdlICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9pbWFnZVwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbklkIDogQG1vZGVsLmlkXG4gICAgICBhc3Nlc3NtZW50SWQgOiBAbW9kZWwuaWRcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHRvZ2dsZU5ld0VsZW1lbnRGb3JtOiAoZXZlbnQpIC0+XG4gICAgQCRlbC5maW5kKFwiLm5ld19lbGVtZW50X2Zvcm0sIC5uZXdfZWxlbWVudF9idXR0b25cIikudG9nZ2xlKClcblxuICAgIEAkZWwuZmluZChcIiNuZXdfZWxlbWVudF9uYW1lXCIpLnZhbChcIlwiKVxuICAgIEAkZWwuZmluZChcIiNlbGVtZW50X3R5cGVfc2VsZWN0XCIpLnZhbChcIm5vbmVcIilcbiAgICBAJGVsLmZpbmQoXCIjZmlsZXNcIikudG9nZ2xlKClcblxuICAgIGZhbHNlXG5cbiAgc2F2ZU5ld0VsZW1lbnQ6IChldmVudCkgPT5cblxuICAgIGlmIGV2ZW50LnR5cGUgIT0gXCJjbGlja1wiICYmIGV2ZW50LndoaWNoICE9IDEzXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgIyBpZiBubyBlbGVtZW50IHR5cGUgc2VsZWN0ZWQsIHNob3cgZXJyb3JcbiAgICBpZiBAJGVsLmZpbmQoXCIjZWxlbWVudF90eXBlX3NlbGVjdCBvcHRpb246c2VsZWN0ZWRcIikudmFsKCkgPT0gXCJub25lXCJcbiAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiUGxlYXNlIHNlbGVjdCBhbiBlbGVtZW50IHR5cGVcIlxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAjIGdlbmVyYWwgdGVtcGxhdGVcbiAgICBuZXdBdHRyaWJ1dGVzID0gVGFuZ2VyaW5lLnRlbXBsYXRlcy5nZXQoXCJlbGVtZW50XCIpXG5cbiAgICAjIHByb3RvdHlwZSB0ZW1wbGF0ZVxuICAgIHByb3RvdHlwZVRlbXBsYXRlID0gVGFuZ2VyaW5lLnRlbXBsYXRlcy5nZXQoXCJlbGVtZW50VHlwZXNcIilbQCRlbC5maW5kKFwiI2VsZW1lbnRfdHlwZV9zZWxlY3RcIikudmFsKCldXG5cbiAgICAjIGJpdCBtb3JlIHNwZWNpZmljIHRlbXBsYXRlXG4gICAgdXNlVHlwZVRlbXBsYXRlID0gVGFuZ2VyaW5lLnRlbXBsYXRlcy5nZXQoXCJlbGVtZW50XCIpO1xuXG4gICAgZmlsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsZXNcIikuZmlsZXNbMF1cbiAgICBpZiB0eXBlb2YgZmlsZSAhPSAndW5kZWZpbmVkJ1xuICAgICAgZmQgPSBuZXcgRm9ybURhdGEoKVxuICAgICAgZmQuYXBwZW5kKFwiZmlsZVwiLCBmaWxlKVxuXG4gICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIG5ld0F0dHJpYnV0ZXMsIHByb3RvdHlwZVRlbXBsYXRlXG4gICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIG5ld0F0dHJpYnV0ZXMsIHVzZVR5cGVUZW1wbGF0ZVxuICAgIG5ld0F0dHJpYnV0ZXMgPSAkLmV4dGVuZCBuZXdBdHRyaWJ1dGVzLFxuICAgICAgbmFtZSAgICAgICAgIDogQCRlbC5maW5kKFwiI25ld19lbGVtZW50X25hbWVcIikudmFsKClcbiAgICAgIGVsZW1lbnQgICAgICAgICA6IEAkZWwuZmluZChcIiNlbGVtZW50X3R5cGVfc2VsZWN0XCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuSWQgOiBAbW9kZWwuaWRcbiAgICAgIGFzc2Vzc21lbnRJZCA6IEBtb2RlbC5pZFxuICAgICAgb3JkZXIgICAgICAgIDogQG1vZGVsLmVsZW1lbnRzLmxlbmd0aFxuXG4gICAgaWYgdHlwZW9mIGZpbGUgIT0gJ3VuZGVmaW5lZCdcbiAgICAgIG5ld0F0dHJpYnV0ZXMgPSAkLmV4dGVuZCBuZXdBdHRyaWJ1dGVzLFxuICAgICAgICBmaWxlVHlwZSAgOiBmaWxlLnR5cGVcbiAgICAgICAgZmlsZU5hbWUgIDogZmlsZS5uYW1lXG4gICAgICAgIGZpbGVTaXplICA6IGZpbGUuc2l6ZVxuXG4gICAgaWYgdHlwZW9mIGZpbGUgPT0gJ3VuZGVmaW5lZCdcbiAgICAgIG9wdGlvbnMgPVxuICAgICAgICBzdWNjZXNzOiAobW9kZWwsIHJlc3ApID0+XG4gICAgICAgICAgY29uc29sZS5sb2coXCJNb2RlbCBjcmVhdGVkLlwiKVxuICAgICAgICBlcnJvcjogKG1vZGVsLCBlcnIpID0+XG4gICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIgKyBKU09OLnN0cmluZ2lmeShlcnIpICsgXCIgTW9kZWw6IFwiICsgSlNPTi5zdHJpbmdpZnkobW9kZWwpKVxuICAgIGVsc2VcbiAgICAgIG9wdGlvbnMgPVxuICAgICAgICBzdWNjZXNzOiAobW9kZWwsIHJlc3ApID0+XG4gICMgICAgICAgIGNvbnNvbGUubG9nKFwiY3JlYXRlZDogXCIgKyBKU09OLnN0cmluZ2lmeShyZXNwKSArIFwiIE1vZGVsOiBcIiArIEpTT04uc3RyaW5naWZ5KG1vZGVsKSlcbiAgICAgICAgICB1cmwgPSBcIiN7VGFuZ2VyaW5lLmNvbmZpZy5nZXQoJ3JvYmJlcnQnKX0vZmlsZXNcIlxuICAgICAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgIHhoci51cGxvYWQub25lcnJvciA9IChlKSA9PlxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvciBVcGxvYWRpbmcgaW1hZ2U6IFwiICsgSlNPTi5zdHJpbmdpZnkoZSkpXG4gICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9ICgpID0+XG4gICAgICAgICAgICBpZiB4aHIucmVhZHlTdGF0ZSA9PSA0XG4gICAgICAgICAgICAgIGlmIHhoci5zdGF0dXMgPT0gMjAwXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coeGhyLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGhlcmUgd2FzIGFuIGVycm9yIHVwbG9hZGluZyB0aGUgZmlsZTogXCIgKyB4aHIucmVzcG9uc2VUZXh0ICsgXCIgU3RhdHVzOiBcIiArIHhoci5zdGF0dXMpXG4gICAgICAgICAgICAgICAgYWxlcnQoXCJUaGVyZSB3YXMgYW4gZXJyb3IgdXBsb2FkaW5nIHRoZSBmaWxlOiBcIiArIHhoci5yZXNwb25zZVRleHQgKyBcIiBTdGF0dXM6IFwiICsgeGhyLnN0YXR1cylcbiAgICAgICAgICB4aHIub25lcnJvciA9ICAoKSA9PlxuICAgICAgICAgICAgYWxlcnQoXCJUaGVyZSB3YXMgYW4gZXJyb3IgdXBsb2FkaW5nIHRoZSBmaWxlOiBcIiArIHhoci5yZXNwb25zZVRleHQgKyBcIiBTdGF0dXM6IFwiICsgeGhyLnN0YXR1cylcblxuICAgICAgICAgICMgZGVmaW5lIG91ciBmaW5pc2ggZm5cbiAgICAgICAgICBsb2FkZWQgPSAoKS0+XG4gICMgICAgICAgICAgY29uc29sZS5sb2coJ2ZpbmlzaGVkIHVwbG9hZGluZycpXG4gICAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIgJ2xvYWQnLCBsb2FkZWQsIGZhbHNlXG4gICAgICAgICAgcHJvZ3Jlc3NCYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdwcm9ncmVzcycpO1xuICAgICAgICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IChlKSA9PlxuICAgICAgICAgICAgaWYgZS5sZW5ndGhDb21wdXRhYmxlXG4gICAgICAgICAgICAgIHByb2dyZXNzQmFyLnZhbHVlID0gKGUubG9hZGVkIC8gZS50b3RhbCkgKiAxMDA7XG4gICAgICAgICAgICAgIHByb2dyZXNzQmFyLnRleHRDb250ZW50ID0gcHJvZ3Jlc3NCYXIudmFsdWU7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicHJvZ3Jlc3M6IFwiICsgcHJvZ3Jlc3NCYXIudmFsdWUpXG4gICAgICAgICAgeGhyLm9wZW4oJ1BPU1QnLCB1cmwsIHRydWUpO1xuICAgICAgICAgIHhoci5zZW5kKGZkKTtcbiAgICAgICAgZXJyb3I6IChtb2RlbCwgZXJyKSA9PlxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6IFwiICsgSlNPTi5zdHJpbmdpZnkoZXJyKSArIFwiIE1vZGVsOiBcIiArIEpTT04uc3RyaW5naWZ5KG1vZGVsKSlcblxuICAgIG5ld0VsZW1lbnQgPSBAbW9kZWwuZWxlbWVudHMuY3JlYXRlIG5ld0F0dHJpYnV0ZXMsIG9wdGlvbnNcbiAgICBuZXdFbGVtZW50Lm9uKCdwcm9ncmVzcycsIChldnQpIC0+XG4gICAgICBjb25zb2xlLmxvZyhcIkxvZ2dpbmcgbmV3RWxlbWVudDogXCIgKyBldnQpXG4gICAgKVxuXG4gICAgQHRvZ2dsZU5ld0VsZW1lbnRGb3JtKClcbiAgICByZXR1cm4gZmFsc2VcblxuICByZW5kZXI6ID0+XG4gICAgbGVzc29uUGxhbl90aXRsZSAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX3RpdGxlXCIpXG4gICAgbGVzc29uUGxhbl9sZXNzb25fdGV4dCAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX2xlc3Nvbl90ZXh0XCIpXG4gICAgbGVzc29uUGxhbl9zdWJqZWN0ICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxlc3NvblBsYW5fc3ViamVjdFwiKVxuICAgIGxlc3NvblBsYW5fZ3JhZGUgICAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwibGVzc29uUGxhbl9ncmFkZVwiKVxuICAgIGxlc3NvblBsYW5fd2VlayAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX3dlZWtcIilcbiAgICBsZXNzb25QbGFuX2RheSAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX2RheVwiKVxuICAgIHNlcXVlbmNlcyA9IFwiXCJcbiAgICBpZiBAbW9kZWwuaGFzKFwic2VxdWVuY2VzXCIpXG4gICAgICBzZXF1ZW5jZXMgPSBAbW9kZWwuZ2V0KFwic2VxdWVuY2VzXCIpXG4gICAgICBzZXF1ZW5jZXMgPSBzZXF1ZW5jZXMuam9pbihcIlxcblwiKVxuXG4gICAgICBpZiBfLmlzQXJyYXkoc2VxdWVuY2VzKVxuICAgICAgICBmb3Igc2VxdWVuY2VzLCBpIGluIHNlcXVlbmNlc1xuICAgICAgICAgIHNlcXVlbmNlc1tpXSA9IHNlcXVlbmNlcy5qb2luKFwiLCBcIilcblxuICAgIGVsZW1lbnRMZWdlbmQgPSBAdXBkYXRlRWxlbWVudExlZ2VuZCgpXG5cbiAgICBhcmNoID0gQG1vZGVsLmdldCgnYXJjaGl2ZWQnKVxuICAgIGFyY2hpdmVDaGVja2VkICAgID0gaWYgKGFyY2ggPT0gdHJ1ZSBvciBhcmNoID09ICd0cnVlJykgdGhlbiBcImNoZWNrZWRcIiBlbHNlIFwiXCJcbiAgICBub3RBcmNoaXZlQ2hlY2tlZCA9IGlmIGFyY2hpdmVDaGVja2VkIHRoZW4gXCJcIiBlbHNlIFwiY2hlY2tlZFwiXG5cbiAgICBsZXNzb25QbGFuX3N1YmplY3RfRW5naXNoICAgID0gaWYgKGxlc3NvblBsYW5fc3ViamVjdCA9PSAnMScpIHRoZW4gXCJjaGVja2VkXCIgZWxzZSBcIlwiXG4gICAgbGVzc29uUGxhbl9zdWJqZWN0X0tpc3dhaGlsaSA9IGlmIChsZXNzb25QbGFuX3N1YmplY3QgPT0gJzInKSB0aGVuIFwiY2hlY2tlZFwiIGVsc2UgXCJcIlxuXG4gICAgIyBsaXN0IG9mIFwidGVtcGxhdGVzXCJcbiAgICBlbGVtZW50VHlwZVNlbGVjdCA9IFwiPHNlbGVjdCBpZD0nZWxlbWVudF90eXBlX3NlbGVjdCc+XG4gICAgICA8b3B0aW9uIHZhbHVlPSdub25lJyBkaXNhYmxlZD0nZGlzYWJsZWQnIHNlbGVjdGVkPSdzZWxlY3RlZCc+UGxlYXNlIHNlbGVjdCBhIGVsZW1lbnQgdHlwZTwvb3B0aW9uPlwiXG4gICAgZm9yIGtleSwgdmFsdWUgb2YgVGFuZ2VyaW5lLnRlbXBsYXRlcy5nZXQoXCJlbGVtZW50VHlwZXNcIilcbiMgICAgICBlbGVtZW50VHlwZVNlbGVjdCArPSBcIjxvcHRncm91cCBsYWJlbD0nI3trZXkuaHVtYW5pemUoKX0nPlwiXG4jICAgICAgZm9yIHN1YktleSwgc3ViVmFsdWUgb2YgdmFsdWVcbiAgICAgICAgZWxlbWVudFR5cGVTZWxlY3QgKz0gXCI8b3B0aW9uIHZhbHVlPScje2tleX0nIGRhdGEtdGVtcGxhdGU9JyN7a2V5fSc+I3trZXkuaHVtYW5pemUoKX08L29wdGlvbj5cIlxuIyAgICAgIGVsZW1lbnRUeXBlU2VsZWN0ICs9IFwiPC9vcHRncm91cD5cIlxuICAgIGVsZW1lbnRUeXBlU2VsZWN0ICs9IFwiPC9zZWxlY3Q+XCJcblxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGJ1dHRvbiBjbGFzcz0nYmFjayBuYXZpZ2F0aW9uJz5CYWNrPC9idXR0b24+XG4gICAgICAgIDxoMT5MZXNzb25QbGFuIEJ1aWxkZXI8L2gxPlxuICAgICAgPGRpdiBpZD0nYmFzaWMnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX25hbWUnPk5hbWU8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgaWQ9J2xlc3NvblBsYW5fbmFtZScgdmFsdWU9JyN7QG1vZGVsLmVzY2FwZShcIm5hbWVcIil9Jz5cblxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX2Rfa2V5JyB0aXRsZT0nVGhpcyBrZXkgaXMgdXNlZCB0byBpbXBvcnQgdGhlIGxlc3NvblBsYW4gZnJvbSBhIHRhYmxldC4nPkRvd25sb2FkIEtleTwvbGFiZWw+PGJyPlxuICAgICAgICA8ZGl2IGNsYXNzPSdpbmZvX2JveCc+I3tAbW9kZWwuaWQuc3Vic3RyKC01LDUpfTwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxsYWJlbCB0aXRsZT0nT25seSBhY3RpdmUgbGVzc29uUGxhbnMgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIG1haW4gbGVzc29uUGxhbiBsaXN0Lic+U3RhdHVzPC9sYWJlbD48YnI+XG4gICAgICA8ZGl2IGlkPSdhcmNoaXZlX2J1dHRvbnMnIGNsYXNzPSdidXR0b25zZXQnPlxuICAgICAgICA8aW5wdXQgdHlwZT0ncmFkaW8nIGlkPSdhcmNoaXZlX2ZhbHNlJyBuYW1lPSdhcmNoaXZlJyB2YWx1ZT0nZmFsc2UnICN7bm90QXJjaGl2ZUNoZWNrZWR9PjxsYWJlbCBmb3I9J2FyY2hpdmVfZmFsc2UnPkFjdGl2ZTwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCB0eXBlPSdyYWRpbycgaWQ9J2FyY2hpdmVfdHJ1ZScgIG5hbWU9J2FyY2hpdmUnIHZhbHVlPSd0cnVlJyAgI3thcmNoaXZlQ2hlY2tlZH0+PGxhYmVsIGZvcj0nYXJjaGl2ZV90cnVlJz5BcmNoaXZlZDwvbGFiZWw+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX3RpdGxlJz5MZXNzb25QbGFuIFRpdGxlPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IGlkPSdsZXNzb25QbGFuX3RpdGxlJyB2YWx1ZT0nI3tsZXNzb25QbGFuX3RpdGxlfSc+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0nbGVzc29uUGxhbl9sZXNzb25fdGV4dCcgdGl0bGU9J0xlc3NvbiBUZXh0Lic+TGVzc29uUGxhbiBUZXh0PC9sYWJlbD5cbiAgICAgICAgICA8dGV4dGFyZWEgaWQ9J2xlc3NvblBsYW5fbGVzc29uX3RleHQnPiN7bGVzc29uUGxhbl9sZXNzb25fdGV4dH08L3RleHRhcmVhPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8bGFiZWwgdGl0bGU9J1lvdSBtdXN0IGNob29zZSBvbmUgb2YgdGhlc2Ugc3ViamVjdHMuJyBmb3I9J2xlc3NvblBsYW5fc3ViamVjdF9idXR0b25zJz5MZXNzb25QbGFuIHN1YmplY3Q8L2xhYmVsPjxicj5cbiAgICAgIDxkaXYgaWQ9J2xlc3NvblBsYW5fc3ViamVjdF9idXR0b25zJyBjbGFzcz0nYnV0dG9uc2V0Jz5cbiAgICAgICAgPGlucHV0IHR5cGU9J3JhZGlvJyBpZD0nbGVzc29uUGxhbl9zdWJqZWN0X0VuZ2lzaCcgbmFtZT0nbGVzc29uUGxhbl9zdWJqZWN0JyB2YWx1ZT0nMScgI3tsZXNzb25QbGFuX3N1YmplY3RfRW5naXNofT48bGFiZWwgZm9yPSdsZXNzb25QbGFuX3N1YmplY3RfRW5naXNoJz5Fbmdpc2g8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgdHlwZT0ncmFkaW8nIGlkPSdsZXNzb25QbGFuX3N1YmplY3RfS2lzd2FoaWxpJyAgbmFtZT0nbGVzc29uUGxhbl9zdWJqZWN0JyB2YWx1ZT0nMicgICN7bGVzc29uUGxhbl9zdWJqZWN0X0tpc3dhaGlsaX0+PGxhYmVsIGZvcj0nbGVzc29uUGxhbl9zdWJqZWN0X0tpc3dhaGlsaSc+S2lzd2FoaWxpPC9sYWJlbD5cbiAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2xlc3NvblBsYW5fZ3JhZGUnPkxlc3NvblBsYW4gR3JhZGU8L2xhYmVsPlxuICAgICAgPGlucHV0IGlkPSdsZXNzb25QbGFuX2dyYWRlJyB2YWx1ZT0nI3tsZXNzb25QbGFuX2dyYWRlfSc+XG4gICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX3dlZWsnPkxlc3NvblBsYW4gV2VlazwvbGFiZWw+XG4gICAgICA8aW5wdXQgaWQ9J2xlc3NvblBsYW5fd2VlaycgdmFsdWU9JyN7bGVzc29uUGxhbl93ZWVrfSc+XG4gICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX2RheSc+TGVzc29uUGxhbiBEYXk8L2xhYmVsPlxuICAgICAgPGlucHV0IGlkPSdsZXNzb25QbGFuX2RheScgdmFsdWU9JyN7bGVzc29uUGxhbl9kYXl9Jz5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8aDI+RWxlbWVudHM8L2gyPlxuICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICA8cHJvZ3Jlc3MgbWluPScwJyBtYXg9JzEwMCcgdmFsdWU9JzAnPjwvcHJvZ3Jlc3M+XG4gICAgICAgIDxkaXY+XG4gICAgICAgIDx1bCBpZD0nZWxlbWVudF9saXN0Jz5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxidXR0b24gY2xhc3M9J25ld19lbGVtZW50X2J1dHRvbiBjb21tYW5kJz5BZGQgRWxlbWVudDwvYnV0dG9uPlxuICAgICAgICA8ZGl2IGNsYXNzPSduZXdfZWxlbWVudF9mb3JtIGNvbmZpcm1hdGlvbic+XG4gICAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgICAgPGgyPk5ldyBFbGVtZW50PC9oMj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J2VsZW1lbnRfdHlwZV9zZWxlY3QnPlR5cGU8L2xhYmVsPjxicj5cbiAgICAgICAgICAgICN7ZWxlbWVudFR5cGVTZWxlY3R9PGJyPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0nbmV3X2VsZW1lbnRfbmFtZSc+TmFtZTwvbGFiZWw+PGJyPlxuICAgICAgICAgICAgPGlucHV0IHR5cGU9J3RleHQnIGlkPSduZXdfZWxlbWVudF9uYW1lJz5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPSdmaWxlJyBuYW1lPSdmaWxlcycgaWQ9J2ZpbGVzJyBtdWx0aXBsZT0nbXVsdGlwbGUnIC8+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduZXdfZWxlbWVudF9zYXZlIGNvbW1hbmQnPkFkZDwvYnV0dG9uPiA8YnV0dG9uIGNsYXNzPSduZXdfZWxlbWVudF9jYW5jZWwgY29tbWFuZCc+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8aDI+T3B0aW9uczwvaDI+XG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J3NlcXVlbmNlcycgdGl0bGU9J1RoaXMgaXMgYSBsaXN0IG9mIGFjY2VwdGFibGUgb3JkZXJzIG9mIGVsZW1lbnRzLCB3aGljaCB3aWxsIGJlIHJhbmRvbWx5IHNlbGVjdGVkIGVhY2ggdGltZSBhbiBsZXNzb25QbGFuIGlzIHJ1bi4gRWxlbWVudCBpbmRpY2llcyBhcmUgc2VwYXJhdGVkIGJ5IGNvbW1hcywgbmV3IGxpbmVzIHNlcGFyYXRlIHNlcXVlbmNlcy4gJz5SYW5kb20gU2VxdWVuY2VzPC9sYWJlbD5cbiAgICAgICAgPGRpdiBpZD0nZWxlbWVudF9sZWdlbmQnPiN7ZWxlbWVudExlZ2VuZH08L2Rpdj5cbiAgICAgICAgPHRleHRhcmVhIGlkPSdzZXF1ZW5jZXMnPiN7c2VxdWVuY2VzfTwvdGV4dGFyZWE+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxidXR0b24gY2xhc3M9J3NhdmUgY29tbWFuZCc+U2F2ZTwvYnV0dG9uPlxuICAgICAgXCJcblxuICAgICMgcmVuZGVyIG5ldyBlbGVtZW50IHZpZXdzXG4gICAgQGVsZW1lbnRMaXN0RWRpdFZpZXcuc2V0RWxlbWVudChAJGVsLmZpbmQoXCIjZWxlbWVudF9saXN0XCIpKVxuICAgIEBlbGVtZW50TGlzdEVkaXRWaWV3LnJlbmRlcigpXG5cbiAgICAjIG1ha2UgaXQgc29ydGFibGVcbiAgICBAJGVsLmZpbmQoXCIjZWxlbWVudF9saXN0XCIpLnNvcnRhYmxlXG4gICAgICBoYW5kbGUgOiAnLnNvcnRhYmxlX2hhbmRsZSdcbiAgICAgIHN0YXJ0OiAoZXZlbnQsIHVpKSAtPiB1aS5pdGVtLmFkZENsYXNzIFwiZHJhZ19zaGFkb3dcIlxuICAgICAgc3RvcDogIChldmVudCwgdWkpIC0+IHVpLml0ZW0ucmVtb3ZlQ2xhc3MgXCJkcmFnX3NoYWRvd1wiXG4gICAgICB1cGRhdGUgOiAoZXZlbnQsIHVpKSA9PlxuICAgICAgICBmb3IgaWQsIGkgaW4gKCQobGkpLmF0dHIoXCJkYXRhLWlkXCIpIGZvciBsaSBpbiBAJGVsLmZpbmQoXCIjZWxlbWVudF9saXN0IGxpXCIpKVxuICAgICAgICAgIEBtb2RlbC5lbGVtZW50cy5nZXQoaWQpLnNldCh7XCJvcmRlclwiOml9LHtzaWxlbnQ6dHJ1ZX0pLnNhdmUobnVsbCx7c2lsZW50OnRydWV9KVxuICAgICAgICBAbW9kZWwuZWxlbWVudHMuc29ydCgpXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuXG4gIHVwZGF0ZUVsZW1lbnRMZWdlbmQ6ID0+XG4gICAgZWxlbWVudExlZ2VuZCA9IFwiXCJcbiAgICBAbW9kZWwuZWxlbWVudHMuZWFjaCAoZWxlbWVudCwgaSkgLT5cbiAgICAgIGVsZW1lbnRMZWdlbmQgKz0gXCI8ZGl2IGNsYXNzPSdzbWFsbF9ncmV5Jz4je2l9IC0gI3tlbGVtZW50LmdldChcIm5hbWVcIil9PC9kaXY+PGJyPlwiXG4gICAgJGVsZW1lbnRXcmFwcGVyID0gQCRlbC5maW5kKFwiI2VsZW1lbnRfbGVnZW5kXCIpXG4gICAgJGVsZW1lbnRXcmFwcGVyLmh0bWwoZWxlbWVudExlZ2VuZCkgaWYgJGVsZW1lbnRXcmFwcGVyLmxlbmd0aCAhPSAwXG4gICAgcmV0dXJuIGVsZW1lbnRMZWdlbmRcblxuICBvbkNsb3NlOiAtPlxuICAgIEBlbGVtZW50TGlzdEVkaXRWaWV3LmNsb3NlKClcbiAgICBcbiJdfQ==
