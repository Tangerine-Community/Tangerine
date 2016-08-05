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
            var loaded, url, xhr;
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
                  return console.log("There was an error uploading the file: " + xhr.responseText + " Status: " + xhr.status);
                }
              }
            };
            xhr.onerror = function(err) {
              return console.log("There was an error uploading the file: " + err);
            };
            loaded = function() {};
            xhr.addEventListener('load', loaded, false);
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
    this.toggleNewElementForm();
    return false;
  };

  LessonPlanEditView.prototype.render = function() {
    var arch, archiveChecked, elementLegend, elementTypeSelect, i, k, key, len, lessonPlan_day, lessonPlan_grade, lessonPlan_subject, lessonPlan_subject_Engish, lessonPlan_subject_Kiswahili, lessonPlan_title, lessonPlan_week, notArchiveChecked, ref, sequences, value;
    lessonPlan_title = this.model.getString("lessonPlan_title");
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
    this.$el.html("<button class='back navigation'>Back</button> <h1>LessonPlan Builder</h1> <div id='basic'> <label for='lessonPlan_name'>Name</label> <input id='lessonPlan_name' value='" + (this.model.escape("name")) + "'> <label for='lessonPlan_d_key' title='This key is used to import the lessonPlan from a tablet.'>Download Key</label><br> <div class='info_box'>" + (this.model.id.substr(-5, 5)) + "</div> </div> <label title='Only active lessonPlans will be displayed in the main lessonPlan list.'>Status</label><br> <div id='archive_buttons' class='buttonset'> <input type='radio' id='archive_false' name='archive' value='false' " + notArchiveChecked + "><label for='archive_false'>Active</label> <input type='radio' id='archive_true'  name='archive' value='true'  " + archiveChecked + "><label for='archive_true'>Archived</label> </div> <div class='label_value'> <label for='lessonPlan_title'>LessonPlan Title</label> <input id='lessonPlan_title' value='" + lessonPlan_title + "'> </div> <label title='You must choose one of these subjects.' for='lessonPlan_subject_buttons'>LessonPlan subject</label><br> <div id='lessonPlan_subject_buttons' class='buttonset'> <input type='radio' id='lessonPlan_subject_Engish' name='lessonPlan_subject' value='1' " + lessonPlan_subject_Engish + "><label for='lessonPlan_subject_Engish'>Engish</label> <input type='radio' id='lessonPlan_subject_Kiswahili'  name='lessonPlan_subject' value='2'  " + lessonPlan_subject_Kiswahili + "><label for='lessonPlan_subject_Kiswahili'>Kiswahili</label> </div> <div class='label_value'> <label for='lessonPlan_grade'>LessonPlan Grade</label> <input id='lessonPlan_grade' value='" + lessonPlan_grade + "'> </div> <div class='label_value'> <label for='lessonPlan_week'>LessonPlan Week</label> <input id='lessonPlan_week' value='" + lessonPlan_week + "'> </div> <div class='label_value'> <label for='lessonPlan_day'>LessonPlan Day</label> <input id='lessonPlan_day' value='" + lessonPlan_day + "'> </div> <h2>Elements</h2> <div class='menu_box'> <!-- <progress min='0' max='100' value='0'></progress> --> <div> <ul id='element_list'> </ul> </div> <button class='new_element_button command'>Add Element</button> <div class='new_element_form confirmation'> <div class='menu_box'> <h2>New Element</h2> <label for='element_type_select'>Type</label><br> " + elementTypeSelect + "<br> <label for='new_element_name'>Name</label><br> <input type='text' id='new_element_name'> <input type='file' name='files' id='files' multiple='multiple' /> <button class='new_element_save command'>Add</button> <button class='new_element_cancel command'>Cancel</button> </div> </div> </div> <h2>Options</h2> <div class='label_value'> <label for='sequences' title='This is a list of acceptable orders of elements, which will be randomly selected each time an lessonPlan is run. Element indicies are separated by commas, new lines separate sequences. '>Random Sequences</label> <div id='element_legend'>" + elementLegend + "</div> <textarea id='sequences'>" + sequences + "</textarea> </div> <button class='save command'>Save</button>");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlc3NvblBsYW4vTGVzc29uUGxhbkVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGtCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7OytCQUVKLFNBQUEsR0FBWTs7K0JBRVosTUFBQSxHQUNFO0lBQUEsOEJBQUEsRUFBaUMsTUFBakM7SUFDQSxhQUFBLEVBQWlDLFFBRGpDO0lBRUEsMkJBQUEsRUFBaUMsc0JBRmpDO0lBR0EsMkJBQUEsRUFBaUMsc0JBSGpDO0lBS0EsNEJBQUEsRUFBaUMsZ0JBTGpDO0lBTUEseUJBQUEsRUFBaUMsZ0JBTmpDO0lBUUEscUJBQUEsRUFBaUMsTUFSakM7SUFTQSxhQUFBLEVBQWlDLE1BVGpDOzs7K0JBV0YsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO0lBQ2pCLElBQUMsQ0FBQSxtQkFBRCxHQUEyQixJQUFBLG1CQUFBLENBQ3pCO01BQUEsWUFBQSxFQUFlLElBQUMsQ0FBQSxLQUFoQjtNQUNBLFlBQUEsRUFBZSxJQUFDLENBQUEsS0FEaEI7S0FEeUI7SUFJM0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBaEIsQ0FBbUIsZUFBbkIsRUFBb0MsSUFBQyxDQUFBLG1CQUFtQixDQUFDLE1BQXpEO1dBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBaEIsQ0FBbUIsS0FBbkIsRUFBMEIsSUFBQyxDQUFBLG1CQUEzQjtFQVBVOzsrQkFTWixJQUFBLEdBQU0sU0FBQTtJQUNKLElBQUcsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFIO2FBQ0UsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksSUFBWixFQUNFO1FBQUEsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ1AsS0FBSyxDQUFDLFFBQU4sQ0FBaUIsQ0FBQyxLQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFY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YUFBNUIsRUFBd0M7Y0FBQyxNQUFBLEVBQU8sSUFBUjthQUF4QyxDQUFzRCxDQUFDLElBQXZELENBQTRELElBQTVELEVBQWlFO2NBQUMsTUFBQSxFQUFPLElBQVI7YUFBakU7QUFERjtpQkFFQSxLQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFoQixDQUFBO1FBSE87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSFQ7S0FERjtXQVNBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQXhITTs7K0JBMkhSLG1CQUFBLEdBQXFCLFNBQUE7QUFDbkIsUUFBQTtJQUFBLGFBQUEsR0FBZ0I7SUFDaEIsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBaEIsQ0FBcUIsU0FBQyxPQUFELEVBQVUsQ0FBVjthQUNuQixhQUFBLElBQWlCLDBCQUFBLEdBQTJCLENBQTNCLEdBQTZCLEtBQTdCLEdBQWlDLENBQUMsT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLENBQUQsQ0FBakMsR0FBc0Q7SUFEcEQsQ0FBckI7SUFFQSxlQUFBLEdBQWtCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlCQUFWO0lBQ2xCLElBQXVDLGVBQWUsQ0FBQyxNQUFoQixLQUEwQixDQUFqRTtNQUFBLGVBQWUsQ0FBQyxJQUFoQixDQUFxQixhQUFyQixFQUFBOztBQUNBLFdBQU87RUFOWTs7K0JBUXJCLE9BQUEsR0FBUyxTQUFBO1dBQ1AsSUFBQyxDQUFBLG1CQUFtQixDQUFDLEtBQXJCLENBQUE7RUFETzs7OztHQXZVc0IsUUFBUSxDQUFDIiwiZmlsZSI6Imxlc3NvblBsYW4vTGVzc29uUGxhbkVkaXRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTGVzc29uUGxhbkVkaXRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6ICdsZXNzb25QbGFuX2VkaXRfdmlldydcblxuICBldmVudHMgOlxuICAgICdjbGljayAjYXJjaGl2ZV9idXR0b25zIGlucHV0JyA6ICdzYXZlJ1xuICAgICdjbGljayAuYmFjaycgICAgICAgICAgICAgICAgICA6ICdnb0JhY2snXG4gICAgJ2NsaWNrIC5uZXdfZWxlbWVudF9idXR0b24nICAgIDogJ3RvZ2dsZU5ld0VsZW1lbnRGb3JtJ1xuICAgICdjbGljayAubmV3X2VsZW1lbnRfY2FuY2VsJyAgICA6ICd0b2dnbGVOZXdFbGVtZW50Rm9ybSdcblxuICAgICdrZXlwcmVzcyAjbmV3X2VsZW1lbnRfbmFtZScgICA6ICdzYXZlTmV3RWxlbWVudCdcbiAgICAnY2xpY2sgLm5ld19lbGVtZW50X3NhdmUnICAgICAgOiAnc2F2ZU5ld0VsZW1lbnQnXG5cbiAgICAnY2hhbmdlICNiYXNpYyBpbnB1dCcgICAgICAgICAgOiAnc2F2ZSdcbiAgICAnY2xpY2sgLnNhdmUnICAgICAgICAgICAgICAgICAgOiAnc2F2ZSdcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBAbW9kZWwgPSBvcHRpb25zLm1vZGVsXG4gICAgQGVsZW1lbnRMaXN0RWRpdFZpZXcgPSBuZXcgRWxlbWVudExpc3RFZGl0Vmlld1xuICAgICAgXCJsZXNzb25QbGFuXCIgOiBAbW9kZWxcbiAgICAgIFwiYXNzZXNzbWVudFwiIDogQG1vZGVsXG5cbiAgICBAbW9kZWwuZWxlbWVudHMub24gXCJjaGFuZ2UgcmVtb3ZlXCIsIEBlbGVtZW50TGlzdEVkaXRWaWV3LnJlbmRlclxuICAgIEBtb2RlbC5lbGVtZW50cy5vbiBcImFsbFwiLCBAdXBkYXRlRWxlbWVudExlZ2VuZFxuXG4gIHNhdmU6ID0+XG4gICAgaWYgQHVwZGF0ZU1vZGVsKClcbiAgICAgIEBtb2RlbC5zYXZlIG51bGwsXG4gICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCIje0Btb2RlbC5nZXQoXCJuYW1lXCIpfSBzYXZlZFwiXG4gICAgICAgIGVycm9yOiA9PlxuICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiTGVzc29uUGxhbiBzYXZlIGVycm9yLiBQbGVhc2UgdHJ5IGFnYWluLlwiXG5cbiAgZ29CYWNrOiAtPiBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiYXNzZXNzbWVudHNcIiwgdHJ1ZVxuXG4gIHVwZGF0ZU1vZGVsOiA9PlxuXG4jXG4jIHBhcnNlIGFjY2VwdGFibGUgcmFuZG9tIHNlcXVlbmNlc1xuI1xuXG4gICAgZWxlbWVudENvdW50ID0gQG1vZGVsLmVsZW1lbnRzLm1vZGVscy5sZW5ndGhcblxuICAgICMgcmVtb3ZlIGV2ZXJ5dGhpbmcgZXhjZXB0IG51bWJlcnMsIGNvbW1hcyBhbmQgbmV3IGxpbmVzXG4gICAgc2VxdWVuY2VzVmFsdWUgPSBAJGVsLmZpbmQoXCIjc2VxdWVuY2VzXCIpLnZhbCgpLnJlcGxhY2UoL1teMC05LFxcbl0vZyxcIlwiKVxuICAgIHNlcXVlbmNlcyA9IHNlcXVlbmNlc1ZhbHVlLnNwbGl0KFwiXFxuXCIpXG5cbiAgICAjIHBhcnNlIHN0cmluZ3MgdG8gbnVtYmVycyBhbmQgY29sbGVjdCBlcnJvcnNcbiAgICBmb3Igc2VxdWVuY2UsIGkgaW4gc2VxdWVuY2VzXG5cbiAgICAgIHNlcXVlbmNlID0gc2VxdWVuY2Uuc3BsaXQoXCIsXCIpXG4gICAgICBmb3IgZWxlbWVudCwgaiBpbiBzZXF1ZW5jZVxuICAgICAgICBzZXF1ZW5jZVtqXSA9IHBhcnNlSW50KGVsZW1lbnQpXG4gICAgICAgIHJhbmdlRXJyb3IgPSB0cnVlIGlmIHNlcXVlbmNlW2pdIDwgMCBvciBzZXF1ZW5jZVtqXSA+PSBlbGVtZW50Q291bnRcbiAgICAgICAgZW1wdHlFcnJvciA9IHRydWUgaWYgaXNOYU4oc2VxdWVuY2Vbal0pXG5cbiAgICAgIHNlcXVlbmNlc1tpXSA9IHNlcXVlbmNlXG5cbiAgICAgICMgZGV0ZWN0IGVycm9yc1xuICAgICAgdG9vTWFueUVycm9yID0gdHJ1ZSBpZiBzZXF1ZW5jZS5sZW5ndGggPiBlbGVtZW50Q291bnRcbiAgICAgIHRvb0Zld0Vycm9yICA9IHRydWUgaWYgc2VxdWVuY2UubGVuZ3RoIDwgZWxlbWVudENvdW50XG4gICAgICBkb3VibGVzRXJyb3IgPSB0cnVlIGlmIHNlcXVlbmNlLmxlbmd0aCAhPSBfLnVuaXEoc2VxdWVuY2UpLmxlbmd0aFxuXG4gICAgIyBzaG93IGVycm9ycyBpZiB0aGV5IGV4aXN0IGFuZCBzZXF1ZW5jZXMgZXhpc3RcbiAgICBpZiBub3QgXy5pc0VtcHR5IF8ucmVqZWN0KCBfLmZsYXR0ZW4oc2VxdWVuY2VzKSwgKGUpIC0+IHJldHVybiBpc05hTihlKSkgIyByZW1vdmUgdW5wYXJzYWJsZSBlbXB0aWVzLCBkb24ndCBfLmNvbXBhY3QuIHdpbGwgcmVtb3ZlIDBzXG4gICAgICBzZXF1ZW5jZUVycm9ycyA9IFtdXG4gICAgICBpZiBlbXB0eUVycm9yICAgdGhlbiBzZXF1ZW5jZUVycm9ycy5wdXNoIFwiU29tZSBzZXF1ZW5jZXMgY29udGFpbiBlbXB0eSB2YWx1ZXMuXCJcbiAgICAgIGlmIHJhbmdlRXJyb3IgICB0aGVuIHNlcXVlbmNlRXJyb3JzLnB1c2ggXCJTb21lIG51bWJlcnMgZG8gbm90IHJlZmVyZW5jZSBhIGVsZW1lbnQgZnJvbSB0aGUgbGVnZW5kLlwiXG4gICAgICBpZiB0b29NYW55RXJyb3IgdGhlbiBzZXF1ZW5jZUVycm9ycy5wdXNoIFwiU29tZSBzZXF1ZW5jZXMgYXJlIGxvbmdlciB0aGFuIHRoZSB0b3RhbCBudW1iZXIgb2YgYWxsIGVsZW1lbnRzLlwiXG4gICAgICBpZiB0b29GZXdFcnJvciAgdGhlbiBzZXF1ZW5jZUVycm9ycy5wdXNoIFwiU29tZSBzZXF1ZW5jZXMgYXJlIHNob3J0ZXIgdGhhbiB0aGUgdG90YWwgbnVtYmVyIG9mIGFsbCBlbGVtZW50cy5cIlxuICAgICAgaWYgZG91Ymxlc0Vycm9yIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgc2VxdWVuY2VzIGNvbnRhaW4gZG91Ymxlcy5cIlxuXG4gICAgICBpZiBzZXF1ZW5jZUVycm9ycy5sZW5ndGggPT0gMFxuIyBpZiB0aGVyZSdzIG5vIGVycm9ycywgY2xlYW4gdXAgdGhlIHRleHRhcmVhIGNvbnRlbnRcbiAgICAgICAgdmFsaWRhdGVkU2VxdWVuY2VzID0gKHNlcXVlbmNlLmpvaW4oXCIsIFwiKSBmb3Igc2VxdWVuY2UgaW4gc2VxdWVuY2VzKS5qb2luKFwiXFxuXCIpXG4gICAgICAgIEAkZWwuZmluZChcIiNzZXF1ZW5jZXNcIikudmFsKHZhbGlkYXRlZFNlcXVlbmNlcylcbiAgICAgIGVsc2UgIyBpZiB0aGVyZSdzIGVycm9ycywgdGhleSBjYW4gc3RpbGwgc2F2ZS4gSnVzdCBzaG93IGEgd2FybmluZ1xuICAgICAgICBhbGVydCBcIldhcm5pbmdcXG5cXG4je3NlcXVlbmNlRXJyb3JzLmpvaW4oXCJcXG5cIil9XCJcblxuIyBub3RoaW5nIHJlc2VtYmxpbmcgYSB2YWxpZCBzZXF1ZW5jZSB3YXMgZm91bmRcbiAgICBlbHNlXG4gICAgICBAJGVsLmZpbmQoXCIjc2VxdWVuY2VzXCIpLnZhbChcIlwiKSAjIGNsZWFuIHRleHQgYXJlYVxuXG4gICAgQG1vZGVsLnNldFxuICAgICAgc2VxdWVuY2VzIDogc2VxdWVuY2VzXG4gICAgICBhcmNoaXZlZCAgOiBAJGVsLmZpbmQoXCIjYXJjaGl2ZV9idXR0b25zIGlucHV0OmNoZWNrZWRcIikudmFsKCkgPT0gXCJ0cnVlXCJcbiAgICAgIG5hbWUgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX25hbWVcIikudmFsKClcbiAgICAgIGRLZXkgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX2Rfa2V5XCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuX3RpdGxlICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl90aXRsZVwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl9sZXNzb25fdGV4dCAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fbGVzc29uX3RleHRcIikudmFsKClcbiMgICAgICBsZXNzb25QbGFuX3N1YmplY3QgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX3N1YmplY3RcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5fc3ViamVjdCAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fc3ViamVjdF9idXR0b25zIGlucHV0OmNoZWNrZWRcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5fZ3JhZGUgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX2dyYWRlXCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuX3dlZWsgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX3dlZWtcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5fZGF5ICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9kYXlcIikudmFsKClcbiMgICAgICBsZXNzb25QbGFuX2ltYWdlICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9pbWFnZVwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbklkIDogQG1vZGVsLmlkXG4gICAgICBhc3Nlc3NtZW50SWQgOiBAbW9kZWwuaWRcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHRvZ2dsZU5ld0VsZW1lbnRGb3JtOiAoZXZlbnQpIC0+XG4gICAgQCRlbC5maW5kKFwiLm5ld19lbGVtZW50X2Zvcm0sIC5uZXdfZWxlbWVudF9idXR0b25cIikudG9nZ2xlKClcblxuICAgIEAkZWwuZmluZChcIiNuZXdfZWxlbWVudF9uYW1lXCIpLnZhbChcIlwiKVxuICAgIEAkZWwuZmluZChcIiNlbGVtZW50X3R5cGVfc2VsZWN0XCIpLnZhbChcIm5vbmVcIilcblxuXG4gICAgZmFsc2VcblxuICBzYXZlTmV3RWxlbWVudDogKGV2ZW50KSA9PlxuXG4gICAgaWYgZXZlbnQudHlwZSAhPSBcImNsaWNrXCIgJiYgZXZlbnQud2hpY2ggIT0gMTNcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICAjIGlmIG5vIGVsZW1lbnQgdHlwZSBzZWxlY3RlZCwgc2hvdyBlcnJvclxuICAgIGlmIEAkZWwuZmluZChcIiNlbGVtZW50X3R5cGVfc2VsZWN0IG9wdGlvbjpzZWxlY3RlZFwiKS52YWwoKSA9PSBcIm5vbmVcIlxuICAgICAgVXRpbHMubWlkQWxlcnQgXCJQbGVhc2Ugc2VsZWN0IGFuIGVsZW1lbnQgdHlwZVwiXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgICMgZ2VuZXJhbCB0ZW1wbGF0ZVxuICAgIG5ld0F0dHJpYnV0ZXMgPSBUYW5nZXJpbmUudGVtcGxhdGVzLmdldChcImVsZW1lbnRcIilcblxuICAgICMgcHJvdG90eXBlIHRlbXBsYXRlXG4gICAgcHJvdG90eXBlVGVtcGxhdGUgPSBUYW5nZXJpbmUudGVtcGxhdGVzLmdldChcImVsZW1lbnRUeXBlc1wiKVtAJGVsLmZpbmQoXCIjZWxlbWVudF90eXBlX3NlbGVjdFwiKS52YWwoKV1cblxuICAgICMgYml0IG1vcmUgc3BlY2lmaWMgdGVtcGxhdGVcbiAgICB1c2VUeXBlVGVtcGxhdGUgPSBUYW5nZXJpbmUudGVtcGxhdGVzLmdldChcImVsZW1lbnRcIik7XG5cbiAgICBmaWxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWxlc1wiKS5maWxlc1swXVxuICAgIGlmIHR5cGVvZiBmaWxlICE9ICd1bmRlZmluZWQnXG4gICAgICBmZCA9IG5ldyBGb3JtRGF0YSgpXG4gICAgICBmZC5hcHBlbmQoXCJmaWxlXCIsIGZpbGUpXG5cbiAgICBuZXdBdHRyaWJ1dGVzID0gJC5leHRlbmQgbmV3QXR0cmlidXRlcywgcHJvdG90eXBlVGVtcGxhdGVcbiAgICBuZXdBdHRyaWJ1dGVzID0gJC5leHRlbmQgbmV3QXR0cmlidXRlcywgdXNlVHlwZVRlbXBsYXRlXG4gICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIG5ld0F0dHJpYnV0ZXMsXG4gICAgICBuYW1lICAgICAgICAgOiBAJGVsLmZpbmQoXCIjbmV3X2VsZW1lbnRfbmFtZVwiKS52YWwoKVxuICAgICAgZWxlbWVudCAgICAgICAgIDogQCRlbC5maW5kKFwiI2VsZW1lbnRfdHlwZV9zZWxlY3RcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5JZCA6IEBtb2RlbC5pZFxuICAgICAgYXNzZXNzbWVudElkIDogQG1vZGVsLmlkXG4gICAgICBvcmRlciAgICAgICAgOiBAbW9kZWwuZWxlbWVudHMubGVuZ3RoXG5cbiAgICBpZiB0eXBlb2YgZmlsZSAhPSAndW5kZWZpbmVkJ1xuICAgICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIG5ld0F0dHJpYnV0ZXMsXG4gICAgICAgIGZpbGVUeXBlICA6IGZpbGUudHlwZVxuICAgICAgICBmaWxlTmFtZSAgOiBmaWxlLm5hbWVcbiAgICAgICAgZmlsZVNpemUgIDogZmlsZS5zaXplXG5cbiAgICBpZiB0eXBlb2YgZmlsZSA9PSAndW5kZWZpbmVkJ1xuICAgICAgb3B0aW9ucyA9XG4gICAgICAgIHN1Y2Nlc3M6IChtb2RlbCwgcmVzcCkgPT5cbiAgICAgICAgICBjb25zb2xlLmxvZyhcIk1vZGVsIGNyZWF0ZWQuXCIpXG4gICAgICAgIGVycm9yOiAobW9kZWwsIGVycikgPT5cbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiArIEpTT04uc3RyaW5naWZ5KGVycikgKyBcIiBNb2RlbDogXCIgKyBKU09OLnN0cmluZ2lmeShtb2RlbCkpXG4gICAgZWxzZVxuICAgICAgb3B0aW9ucyA9XG4gICAgICAgIHN1Y2Nlc3M6IChtb2RlbCwgcmVzcCkgPT5cbiAgIyAgICAgICAgY29uc29sZS5sb2coXCJjcmVhdGVkOiBcIiArIEpTT04uc3RyaW5naWZ5KHJlc3ApICsgXCIgTW9kZWw6IFwiICsgSlNPTi5zdHJpbmdpZnkobW9kZWwpKVxuICAgICAgICAgIHVybCA9IFwiI3tUYW5nZXJpbmUuY29uZmlnLmdldCgncm9iYmVydCcpfS9maWxlc1wiXG4gICAgICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgeGhyLnVwbG9hZC5vbmVycm9yID0gKGUpID0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yIFVwbG9hZGluZyBpbWFnZTogXCIgKyBKU09OLnN0cmluZ2lmeShlKSlcbiAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT5cbiAgICAgICAgICAgIGlmIHhoci5yZWFkeVN0YXRlID09IDRcbiAgICAgICAgICAgICAgaWYgeGhyLnN0YXR1cyA9PSAyMDBcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh4aHIucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJUaGVyZSB3YXMgYW4gZXJyb3IgdXBsb2FkaW5nIHRoZSBmaWxlOiBcIiArIHhoci5yZXNwb25zZVRleHQgKyBcIiBTdGF0dXM6IFwiICsgeGhyLnN0YXR1cylcbiMgICAgICAgICAgICAgICAgYWxlcnQoXCJUaGVyZSB3YXMgYW4gZXJyb3IgdXBsb2FkaW5nIHRoZSBmaWxlOiBcIiArIHhoci5yZXNwb25zZVRleHQgKyBcIiBTdGF0dXM6IFwiICsgeGhyLnN0YXR1cylcbiAgICAgICAgICB4aHIub25lcnJvciA9ICAoZXJyKSA9PlxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJUaGVyZSB3YXMgYW4gZXJyb3IgdXBsb2FkaW5nIHRoZSBmaWxlOiBcIiArIGVycilcbiMgICAgICAgICAgICBhbGVydChcIlRoZXJlIHdhcyBhbiBlcnJvciB1cGxvYWRpbmcgdGhlIGZpbGU6IFwiICsgeGhyLnJlc3BvbnNlVGV4dCArIFwiIFN0YXR1czogXCIgKyB4aHIuc3RhdHVzKVxuXG4gICAgICAgICAgIyBkZWZpbmUgb3VyIGZpbmlzaCBmblxuICAgICAgICAgIGxvYWRlZCA9ICgpLT5cbiAgIyAgICAgICAgICBjb25zb2xlLmxvZygnZmluaXNoZWQgdXBsb2FkaW5nJylcbiAgICAgICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lciAnbG9hZCcsIGxvYWRlZCwgZmFsc2VcbiMgICAgICAgICAgcHJvZ3Jlc3NCYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdwcm9ncmVzcycpO1xuIyAgICAgICAgICB4aHIudXBsb2FkLm9ucHJvZ3Jlc3MgPSAoZSkgPT5cbiMgICAgICAgICAgICBpZiBlLmxlbmd0aENvbXB1dGFibGVcbiMgICAgICAgICAgICAgIHByb2dyZXNzQmFyLnZhbHVlID0gKGUubG9hZGVkIC8gZS50b3RhbCkgKiAxMDA7XG4jICAgICAgICAgICAgICBwcm9ncmVzc0Jhci50ZXh0Q29udGVudCA9IHByb2dyZXNzQmFyLnZhbHVlO1xuIyAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJwcm9ncmVzczogXCIgKyBwcm9ncmVzc0Jhci52YWx1ZSlcbiAgICAgICAgICB4aHIub3BlbignUE9TVCcsIHVybCwgdHJ1ZSk7XG4gICAgICAgICAgeGhyLnNlbmQoZmQpO1xuICAgICAgICBlcnJvcjogKG1vZGVsLCBlcnIpID0+XG4gICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIgKyBKU09OLnN0cmluZ2lmeShlcnIpICsgXCIgTW9kZWw6IFwiICsgSlNPTi5zdHJpbmdpZnkobW9kZWwpKVxuXG4gICAgbmV3RWxlbWVudCA9IEBtb2RlbC5lbGVtZW50cy5jcmVhdGUgbmV3QXR0cmlidXRlcywgb3B0aW9uc1xuIyAgICBuZXdFbGVtZW50Lm9uKCdwcm9ncmVzcycsIChldnQpIC0+XG4jICAgICAgY29uc29sZS5sb2coXCJMb2dnaW5nIG5ld0VsZW1lbnQ6IFwiICsgZXZ0KVxuIyAgICApXG5cbiAgICBAdG9nZ2xlTmV3RWxlbWVudEZvcm0oKVxuICAgIHJldHVybiBmYWxzZVxuXG4gIHJlbmRlcjogPT5cbiAgICBsZXNzb25QbGFuX3RpdGxlICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxlc3NvblBsYW5fdGl0bGVcIilcbiMgICAgbGVzc29uUGxhbl9sZXNzb25fdGV4dCAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX2xlc3Nvbl90ZXh0XCIpXG4gICAgbGVzc29uUGxhbl9zdWJqZWN0ICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxlc3NvblBsYW5fc3ViamVjdFwiKVxuICAgIGxlc3NvblBsYW5fZ3JhZGUgICAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwibGVzc29uUGxhbl9ncmFkZVwiKVxuICAgIGxlc3NvblBsYW5fd2VlayAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX3dlZWtcIilcbiAgICBsZXNzb25QbGFuX2RheSAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX2RheVwiKVxuICAgIHNlcXVlbmNlcyA9IFwiXCJcbiAgICBpZiBAbW9kZWwuaGFzKFwic2VxdWVuY2VzXCIpXG4gICAgICBzZXF1ZW5jZXMgPSBAbW9kZWwuZ2V0KFwic2VxdWVuY2VzXCIpXG4gICAgICBzZXF1ZW5jZXMgPSBzZXF1ZW5jZXMuam9pbihcIlxcblwiKVxuXG4gICAgICBpZiBfLmlzQXJyYXkoc2VxdWVuY2VzKVxuICAgICAgICBmb3Igc2VxdWVuY2VzLCBpIGluIHNlcXVlbmNlc1xuICAgICAgICAgIHNlcXVlbmNlc1tpXSA9IHNlcXVlbmNlcy5qb2luKFwiLCBcIilcblxuICAgIGVsZW1lbnRMZWdlbmQgPSBAdXBkYXRlRWxlbWVudExlZ2VuZCgpXG5cbiAgICBhcmNoID0gQG1vZGVsLmdldCgnYXJjaGl2ZWQnKVxuICAgIGFyY2hpdmVDaGVja2VkICAgID0gaWYgKGFyY2ggPT0gdHJ1ZSBvciBhcmNoID09ICd0cnVlJykgdGhlbiBcImNoZWNrZWRcIiBlbHNlIFwiXCJcbiAgICBub3RBcmNoaXZlQ2hlY2tlZCA9IGlmIGFyY2hpdmVDaGVja2VkIHRoZW4gXCJcIiBlbHNlIFwiY2hlY2tlZFwiXG5cbiAgICBsZXNzb25QbGFuX3N1YmplY3RfRW5naXNoICAgID0gaWYgKGxlc3NvblBsYW5fc3ViamVjdCA9PSAnMScpIHRoZW4gXCJjaGVja2VkXCIgZWxzZSBcIlwiXG4gICAgbGVzc29uUGxhbl9zdWJqZWN0X0tpc3dhaGlsaSA9IGlmIChsZXNzb25QbGFuX3N1YmplY3QgPT0gJzInKSB0aGVuIFwiY2hlY2tlZFwiIGVsc2UgXCJcIlxuXG4gICAgIyBsaXN0IG9mIFwidGVtcGxhdGVzXCJcbiAgICBlbGVtZW50VHlwZVNlbGVjdCA9IFwiPHNlbGVjdCBpZD0nZWxlbWVudF90eXBlX3NlbGVjdCc+XG4gICAgICA8b3B0aW9uIHZhbHVlPSdub25lJyBkaXNhYmxlZD0nZGlzYWJsZWQnIHNlbGVjdGVkPSdzZWxlY3RlZCc+UGxlYXNlIHNlbGVjdCBhIGVsZW1lbnQgdHlwZTwvb3B0aW9uPlwiXG4gICAgZm9yIGtleSwgdmFsdWUgb2YgVGFuZ2VyaW5lLnRlbXBsYXRlcy5nZXQoXCJlbGVtZW50VHlwZXNcIilcbiMgICAgICBlbGVtZW50VHlwZVNlbGVjdCArPSBcIjxvcHRncm91cCBsYWJlbD0nI3trZXkuaHVtYW5pemUoKX0nPlwiXG4jICAgICAgZm9yIHN1YktleSwgc3ViVmFsdWUgb2YgdmFsdWVcbiAgICAgICAgZWxlbWVudFR5cGVTZWxlY3QgKz0gXCI8b3B0aW9uIHZhbHVlPScje2tleX0nIGRhdGEtdGVtcGxhdGU9JyN7a2V5fSc+I3trZXkuaHVtYW5pemUoKX08L29wdGlvbj5cIlxuIyAgICAgIGVsZW1lbnRUeXBlU2VsZWN0ICs9IFwiPC9vcHRncm91cD5cIlxuICAgIGVsZW1lbnRUeXBlU2VsZWN0ICs9IFwiPC9zZWxlY3Q+XCJcblxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGJ1dHRvbiBjbGFzcz0nYmFjayBuYXZpZ2F0aW9uJz5CYWNrPC9idXR0b24+XG4gICAgICAgIDxoMT5MZXNzb25QbGFuIEJ1aWxkZXI8L2gxPlxuICAgICAgPGRpdiBpZD0nYmFzaWMnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX25hbWUnPk5hbWU8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgaWQ9J2xlc3NvblBsYW5fbmFtZScgdmFsdWU9JyN7QG1vZGVsLmVzY2FwZShcIm5hbWVcIil9Jz5cblxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX2Rfa2V5JyB0aXRsZT0nVGhpcyBrZXkgaXMgdXNlZCB0byBpbXBvcnQgdGhlIGxlc3NvblBsYW4gZnJvbSBhIHRhYmxldC4nPkRvd25sb2FkIEtleTwvbGFiZWw+PGJyPlxuICAgICAgICA8ZGl2IGNsYXNzPSdpbmZvX2JveCc+I3tAbW9kZWwuaWQuc3Vic3RyKC01LDUpfTwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxsYWJlbCB0aXRsZT0nT25seSBhY3RpdmUgbGVzc29uUGxhbnMgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIG1haW4gbGVzc29uUGxhbiBsaXN0Lic+U3RhdHVzPC9sYWJlbD48YnI+XG4gICAgICA8ZGl2IGlkPSdhcmNoaXZlX2J1dHRvbnMnIGNsYXNzPSdidXR0b25zZXQnPlxuICAgICAgICA8aW5wdXQgdHlwZT0ncmFkaW8nIGlkPSdhcmNoaXZlX2ZhbHNlJyBuYW1lPSdhcmNoaXZlJyB2YWx1ZT0nZmFsc2UnICN7bm90QXJjaGl2ZUNoZWNrZWR9PjxsYWJlbCBmb3I9J2FyY2hpdmVfZmFsc2UnPkFjdGl2ZTwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCB0eXBlPSdyYWRpbycgaWQ9J2FyY2hpdmVfdHJ1ZScgIG5hbWU9J2FyY2hpdmUnIHZhbHVlPSd0cnVlJyAgI3thcmNoaXZlQ2hlY2tlZH0+PGxhYmVsIGZvcj0nYXJjaGl2ZV90cnVlJz5BcmNoaXZlZDwvbGFiZWw+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX3RpdGxlJz5MZXNzb25QbGFuIFRpdGxlPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IGlkPSdsZXNzb25QbGFuX3RpdGxlJyB2YWx1ZT0nI3tsZXNzb25QbGFuX3RpdGxlfSc+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGxhYmVsIHRpdGxlPSdZb3UgbXVzdCBjaG9vc2Ugb25lIG9mIHRoZXNlIHN1YmplY3RzLicgZm9yPSdsZXNzb25QbGFuX3N1YmplY3RfYnV0dG9ucyc+TGVzc29uUGxhbiBzdWJqZWN0PC9sYWJlbD48YnI+XG4gICAgICA8ZGl2IGlkPSdsZXNzb25QbGFuX3N1YmplY3RfYnV0dG9ucycgY2xhc3M9J2J1dHRvbnNldCc+XG4gICAgICAgIDxpbnB1dCB0eXBlPSdyYWRpbycgaWQ9J2xlc3NvblBsYW5fc3ViamVjdF9Fbmdpc2gnIG5hbWU9J2xlc3NvblBsYW5fc3ViamVjdCcgdmFsdWU9JzEnICN7bGVzc29uUGxhbl9zdWJqZWN0X0VuZ2lzaH0+PGxhYmVsIGZvcj0nbGVzc29uUGxhbl9zdWJqZWN0X0VuZ2lzaCc+RW5naXNoPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IHR5cGU9J3JhZGlvJyBpZD0nbGVzc29uUGxhbl9zdWJqZWN0X0tpc3dhaGlsaScgIG5hbWU9J2xlc3NvblBsYW5fc3ViamVjdCcgdmFsdWU9JzInICAje2xlc3NvblBsYW5fc3ViamVjdF9LaXN3YWhpbGl9PjxsYWJlbCBmb3I9J2xlc3NvblBsYW5fc3ViamVjdF9LaXN3YWhpbGknPktpc3dhaGlsaTwvbGFiZWw+XG4gICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX2dyYWRlJz5MZXNzb25QbGFuIEdyYWRlPC9sYWJlbD5cbiAgICAgIDxpbnB1dCBpZD0nbGVzc29uUGxhbl9ncmFkZScgdmFsdWU9JyN7bGVzc29uUGxhbl9ncmFkZX0nPlxuICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nbGVzc29uUGxhbl93ZWVrJz5MZXNzb25QbGFuIFdlZWs8L2xhYmVsPlxuICAgICAgPGlucHV0IGlkPSdsZXNzb25QbGFuX3dlZWsnIHZhbHVlPScje2xlc3NvblBsYW5fd2Vla30nPlxuICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nbGVzc29uUGxhbl9kYXknPkxlc3NvblBsYW4gRGF5PC9sYWJlbD5cbiAgICAgIDxpbnB1dCBpZD0nbGVzc29uUGxhbl9kYXknIHZhbHVlPScje2xlc3NvblBsYW5fZGF5fSc+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGgyPkVsZW1lbnRzPC9oMj5cbiAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbjwhLS1cbiAgICAgICAgPHByb2dyZXNzIG1pbj0nMCcgbWF4PScxMDAnIHZhbHVlPScwJz48L3Byb2dyZXNzPlxuLS0+XG4gICAgICAgIDxkaXY+XG4gICAgICAgIDx1bCBpZD0nZWxlbWVudF9saXN0Jz5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxidXR0b24gY2xhc3M9J25ld19lbGVtZW50X2J1dHRvbiBjb21tYW5kJz5BZGQgRWxlbWVudDwvYnV0dG9uPlxuICAgICAgICA8ZGl2IGNsYXNzPSduZXdfZWxlbWVudF9mb3JtIGNvbmZpcm1hdGlvbic+XG4gICAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgICAgPGgyPk5ldyBFbGVtZW50PC9oMj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J2VsZW1lbnRfdHlwZV9zZWxlY3QnPlR5cGU8L2xhYmVsPjxicj5cbiAgICAgICAgICAgICN7ZWxlbWVudFR5cGVTZWxlY3R9PGJyPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0nbmV3X2VsZW1lbnRfbmFtZSc+TmFtZTwvbGFiZWw+PGJyPlxuICAgICAgICAgICAgPGlucHV0IHR5cGU9J3RleHQnIGlkPSduZXdfZWxlbWVudF9uYW1lJz5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPSdmaWxlJyBuYW1lPSdmaWxlcycgaWQ9J2ZpbGVzJyBtdWx0aXBsZT0nbXVsdGlwbGUnIC8+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduZXdfZWxlbWVudF9zYXZlIGNvbW1hbmQnPkFkZDwvYnV0dG9uPiA8YnV0dG9uIGNsYXNzPSduZXdfZWxlbWVudF9jYW5jZWwgY29tbWFuZCc+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8aDI+T3B0aW9uczwvaDI+XG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J3NlcXVlbmNlcycgdGl0bGU9J1RoaXMgaXMgYSBsaXN0IG9mIGFjY2VwdGFibGUgb3JkZXJzIG9mIGVsZW1lbnRzLCB3aGljaCB3aWxsIGJlIHJhbmRvbWx5IHNlbGVjdGVkIGVhY2ggdGltZSBhbiBsZXNzb25QbGFuIGlzIHJ1bi4gRWxlbWVudCBpbmRpY2llcyBhcmUgc2VwYXJhdGVkIGJ5IGNvbW1hcywgbmV3IGxpbmVzIHNlcGFyYXRlIHNlcXVlbmNlcy4gJz5SYW5kb20gU2VxdWVuY2VzPC9sYWJlbD5cbiAgICAgICAgPGRpdiBpZD0nZWxlbWVudF9sZWdlbmQnPiN7ZWxlbWVudExlZ2VuZH08L2Rpdj5cbiAgICAgICAgPHRleHRhcmVhIGlkPSdzZXF1ZW5jZXMnPiN7c2VxdWVuY2VzfTwvdGV4dGFyZWE+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxidXR0b24gY2xhc3M9J3NhdmUgY29tbWFuZCc+U2F2ZTwvYnV0dG9uPlxuICAgICAgXCJcblxuICAgICMgcmVuZGVyIG5ldyBlbGVtZW50IHZpZXdzXG4gICAgQGVsZW1lbnRMaXN0RWRpdFZpZXcuc2V0RWxlbWVudChAJGVsLmZpbmQoXCIjZWxlbWVudF9saXN0XCIpKVxuICAgIEBlbGVtZW50TGlzdEVkaXRWaWV3LnJlbmRlcigpXG5cbiAgICAjIG1ha2UgaXQgc29ydGFibGVcbiAgICBAJGVsLmZpbmQoXCIjZWxlbWVudF9saXN0XCIpLnNvcnRhYmxlXG4gICAgICBoYW5kbGUgOiAnLnNvcnRhYmxlX2hhbmRsZSdcbiAgICAgIHN0YXJ0OiAoZXZlbnQsIHVpKSAtPiB1aS5pdGVtLmFkZENsYXNzIFwiZHJhZ19zaGFkb3dcIlxuICAgICAgc3RvcDogIChldmVudCwgdWkpIC0+IHVpLml0ZW0ucmVtb3ZlQ2xhc3MgXCJkcmFnX3NoYWRvd1wiXG4gICAgICB1cGRhdGUgOiAoZXZlbnQsIHVpKSA9PlxuICAgICAgICBmb3IgaWQsIGkgaW4gKCQobGkpLmF0dHIoXCJkYXRhLWlkXCIpIGZvciBsaSBpbiBAJGVsLmZpbmQoXCIjZWxlbWVudF9saXN0IGxpXCIpKVxuICAgICAgICAgIEBtb2RlbC5lbGVtZW50cy5nZXQoaWQpLnNldCh7XCJvcmRlclwiOml9LHtzaWxlbnQ6dHJ1ZX0pLnNhdmUobnVsbCx7c2lsZW50OnRydWV9KVxuICAgICAgICBAbW9kZWwuZWxlbWVudHMuc29ydCgpXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuXG4gIHVwZGF0ZUVsZW1lbnRMZWdlbmQ6ID0+XG4gICAgZWxlbWVudExlZ2VuZCA9IFwiXCJcbiAgICBAbW9kZWwuZWxlbWVudHMuZWFjaCAoZWxlbWVudCwgaSkgLT5cbiAgICAgIGVsZW1lbnRMZWdlbmQgKz0gXCI8ZGl2IGNsYXNzPSdzbWFsbF9ncmV5Jz4je2l9IC0gI3tlbGVtZW50LmdldChcIm5hbWVcIil9PC9kaXY+PGJyPlwiXG4gICAgJGVsZW1lbnRXcmFwcGVyID0gQCRlbC5maW5kKFwiI2VsZW1lbnRfbGVnZW5kXCIpXG4gICAgJGVsZW1lbnRXcmFwcGVyLmh0bWwoZWxlbWVudExlZ2VuZCkgaWYgJGVsZW1lbnRXcmFwcGVyLmxlbmd0aCAhPSAwXG4gICAgcmV0dXJuIGVsZW1lbnRMZWdlbmRcblxuICBvbkNsb3NlOiAtPlxuICAgIEBlbGVtZW50TGlzdEVkaXRWaWV3LmNsb3NlKClcbiAgICBcbiJdfQ==
