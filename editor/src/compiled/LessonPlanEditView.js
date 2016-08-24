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
    'change #element_type_select': 'addElement',
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

  LessonPlanEditView.prototype.addElement = function() {
    var value;
    value = $('#element_type_select').val();
    if (value === 'media') {
      $('#files').show();
      $('#html_div').hide();
    }
    if (value === 'html') {
      $('#html_div').show();
      return $('#files').hide();
    }
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
      name: this.$el.find("#lessonPlan_title").val(),
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
    if (CKEDITOR.instances.html.getData() !== 'undefined') {
      this.model.set({
        "html": CKEDITOR.instances.html.getData()
      });
      newAttributes = $.extend(newAttributes, {
        html: this.model.get('html')
      });
    }
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
    var arch, archiveChecked, elementLegend, elementTypeSelect, html, i, k, key, len, lessonPlan_day, lessonPlan_grade, lessonPlan_subject, lessonPlan_subject_Engish, lessonPlan_subject_Kiswahili, lessonPlan_title, lessonPlan_week, notArchiveChecked, ref, sequences, value;
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
    html = this.model.get("html") || "";
    this.$el.html("<button class='back navigation'>Back</button> <h1>LessonPlan Builder</h1> <div id='basic'> <label for='lessonPlan_d_key' title='This key is used to import the lessonPlan from a tablet.'>Download Key</label><br> <div class='info_box'>" + (this.model.id.substr(-5, 5)) + "</div> </div> <label title='Only active lessonPlans will be displayed in the main lessonPlan list.'>Status</label><br> <div id='archive_buttons' class='buttonset'> <input type='radio' id='archive_false' name='archive' value='false' " + notArchiveChecked + "><label for='archive_false'>Active</label> <input type='radio' id='archive_true'  name='archive' value='true'  " + archiveChecked + "><label for='archive_true'>Archived</label> </div> <div class='label_value'> <label for='lessonPlan_title'>LessonPlan Title</label> <input id='lessonPlan_title' value='" + lessonPlan_title + "'> </div> <label title='You must choose one of these subjects.' for='lessonPlan_subject_buttons'>LessonPlan subject</label><br> <div id='lessonPlan_subject_buttons' class='buttonset'> <input type='radio' id='lessonPlan_subject_Engish' name='lessonPlan_subject' value='1' " + lessonPlan_subject_Engish + "><label for='lessonPlan_subject_Engish'>Engish</label> <input type='radio' id='lessonPlan_subject_Kiswahili'  name='lessonPlan_subject' value='2'  " + lessonPlan_subject_Kiswahili + "><label for='lessonPlan_subject_Kiswahili'>Kiswahili</label> </div> <div class='label_value'> <label for='lessonPlan_grade'>LessonPlan Grade</label> <input id='lessonPlan_grade' value='" + lessonPlan_grade + "'> </div> <div class='label_value'> <label for='lessonPlan_week'>LessonPlan Week</label> <input id='lessonPlan_week' value='" + lessonPlan_week + "'> </div> <div class='label_value'> <label for='lessonPlan_day'>LessonPlan Day</label> <input id='lessonPlan_day' value='" + lessonPlan_day + "'> </div> <h2>Elements</h2> <div class='menu_box'> <!-- <progress min='0' max='100' value='0'></progress> --> <div> <ul id='element_list'> </ul> </div> <button class='new_element_button command'>Add Element</button> <div class='new_element_form confirmation'> <div class='menu_box'> <h2>New Element</h2> <label for='element_type_select'>Type</label><br> " + elementTypeSelect + "<br> <label for='new_element_name'>Name</label><br> <input type='text' id='new_element_name'> <input type='file' name='files' id='files' multiple='multiple' /> <div id='html_div' class='label_value'> <label for='html'>Html</label> <textarea id='html'>" + html + "</textarea> </div> <button class='new_element_save command'>Add</button> <button class='new_element_cancel command'>Cancel</button> </div> </div> </div> <h2></h2> <div class='label_value' style='display: none;'> <label for='sequences' title='This is a list of acceptable orders of elements, which will be randomly selected each time an lessonPlan is run. Element indicies are separated by commas, new lines separate sequences. '>Random Sequences</label> <div id='element_legend'>" + elementLegend + "</div> <textarea id='sequences'>" + sequences + "</textarea> </div> <button class='save command'>Save</button>");
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

  LessonPlanEditView.prototype.afterRender = function() {
    var ref;
    if ((ref = this.elementEditor) != null) {
      if (typeof ref.afterRender === "function") {
        ref.afterRender();
      }
    }
    CKEDITOR.replace("html");
    $('#files').hide();
    return $('#html_div').hide();
  };

  return LessonPlanEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlc3NvblBsYW4vTGVzc29uUGxhbkVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGtCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7OytCQUVKLFNBQUEsR0FBWTs7K0JBRVosTUFBQSxHQUNFO0lBQUEsNkJBQUEsRUFBaUMsWUFBakM7SUFDQSw4QkFBQSxFQUFpQyxNQURqQztJQUVBLGFBQUEsRUFBaUMsUUFGakM7SUFHQSwyQkFBQSxFQUFpQyxzQkFIakM7SUFJQSwyQkFBQSxFQUFpQyxzQkFKakM7SUFNQSw0QkFBQSxFQUFpQyxnQkFOakM7SUFPQSx5QkFBQSxFQUFpQyxnQkFQakM7SUFTQSxxQkFBQSxFQUFpQyxNQVRqQztJQVVBLGFBQUEsRUFBaUMsTUFWakM7OzsrQkFZRixVQUFBLEdBQVksU0FBQyxPQUFEO0lBQ1YsSUFBQyxDQUFBLEtBQUQsR0FBUyxPQUFPLENBQUM7SUFDakIsSUFBQyxDQUFBLG1CQUFELEdBQTJCLElBQUEsbUJBQUEsQ0FDekI7TUFBQSxZQUFBLEVBQWUsSUFBQyxDQUFBLEtBQWhCO01BQ0EsWUFBQSxFQUFlLElBQUMsQ0FBQSxLQURoQjtLQUR5QjtJQUkzQixJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFoQixDQUFtQixlQUFuQixFQUFvQyxJQUFDLENBQUEsbUJBQW1CLENBQUMsTUFBekQ7V0FDQSxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFoQixDQUFtQixLQUFuQixFQUEwQixJQUFDLENBQUEsbUJBQTNCO0VBUFU7OytCQVNaLFVBQUEsR0FBWSxTQUFBO0FBQ1YsUUFBQTtJQUFBLEtBQUEsR0FBUSxDQUFBLENBQUUsc0JBQUYsQ0FBeUIsQ0FBQyxHQUExQixDQUFBO0lBQ1IsSUFBRyxLQUFBLEtBQVMsT0FBWjtNQUNFLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxJQUFaLENBQUE7TUFDQSxDQUFBLENBQUUsV0FBRixDQUFjLENBQUMsSUFBZixD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SUFBQSxhQUFBLEdBQWdCO0lBQ2hCLElBQUMsQ0FBQSxLQUFLLENBQUMsUUFBUSxDQUFDLElBQWhCLENBQXFCLFNBQUMsT0FBRCxFQUFVLENBQVY7YUFDbkIsYUFBQSxJQUFpQiwwQkFBQSxHQUEyQixDQUEzQixHQUE2QixLQUE3QixHQUFpQyxDQUFDLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBWixDQUFELENBQWpDLEdBQXNEO0lBRHBELENBQXJCO0lBRUEsZUFBQSxHQUFrQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxpQkFBVjtJQUNsQixJQUF1QyxlQUFlLENBQUMsTUFBaEIsS0FBMEIsQ0FBakU7TUFBQSxlQUFlLENBQUMsSUFBaEIsQ0FBcUIsYUFBckIsRUFBQTs7QUFDQSxXQUFPO0VBTlk7OytCQVFyQixPQUFBLEdBQVMsU0FBQTtXQUNQLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxLQUFyQixDQUFBO0VBRE87OytCQUdULFdBQUEsR0FBYSxTQUFBO0FBQ1gsUUFBQTs7O1dBQWMsQ0FBRTs7O0lBQ2hCLFFBQVEsQ0FBQyxPQUFULENBQWlCLE1BQWpCO0lBQ0EsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLElBQVosQ0FBQTtXQUNBLENBQUEsQ0FBRSxXQUFGLENBQWMsQ0FBQyxJQUFmLENBQUE7RUFKVzs7OztHQWhXa0IsUUFBUSxDQUFDIiwiZmlsZSI6Imxlc3NvblBsYW4vTGVzc29uUGxhbkVkaXRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTGVzc29uUGxhbkVkaXRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6ICdsZXNzb25QbGFuX2VkaXRfdmlldydcblxuICBldmVudHMgOlxuICAgICdjaGFuZ2UgI2VsZW1lbnRfdHlwZV9zZWxlY3QnICA6ICdhZGRFbGVtZW50J1xuICAgICdjbGljayAjYXJjaGl2ZV9idXR0b25zIGlucHV0JyA6ICdzYXZlJ1xuICAgICdjbGljayAuYmFjaycgICAgICAgICAgICAgICAgICA6ICdnb0JhY2snXG4gICAgJ2NsaWNrIC5uZXdfZWxlbWVudF9idXR0b24nICAgIDogJ3RvZ2dsZU5ld0VsZW1lbnRGb3JtJ1xuICAgICdjbGljayAubmV3X2VsZW1lbnRfY2FuY2VsJyAgICA6ICd0b2dnbGVOZXdFbGVtZW50Rm9ybSdcblxuICAgICdrZXlwcmVzcyAjbmV3X2VsZW1lbnRfbmFtZScgICA6ICdzYXZlTmV3RWxlbWVudCdcbiAgICAnY2xpY2sgLm5ld19lbGVtZW50X3NhdmUnICAgICAgOiAnc2F2ZU5ld0VsZW1lbnQnXG5cbiAgICAnY2hhbmdlICNiYXNpYyBpbnB1dCcgICAgICAgICAgOiAnc2F2ZSdcbiAgICAnY2xpY2sgLnNhdmUnICAgICAgICAgICAgICAgICAgOiAnc2F2ZSdcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBAbW9kZWwgPSBvcHRpb25zLm1vZGVsXG4gICAgQGVsZW1lbnRMaXN0RWRpdFZpZXcgPSBuZXcgRWxlbWVudExpc3RFZGl0Vmlld1xuICAgICAgXCJsZXNzb25QbGFuXCIgOiBAbW9kZWxcbiAgICAgIFwiYXNzZXNzbWVudFwiIDogQG1vZGVsXG5cbiAgICBAbW9kZWwuZWxlbWVudHMub24gXCJjaGFuZ2UgcmVtb3ZlXCIsIEBlbGVtZW50TGlzdEVkaXRWaWV3LnJlbmRlclxuICAgIEBtb2RlbC5lbGVtZW50cy5vbiBcImFsbFwiLCBAdXBkYXRlRWxlbWVudExlZ2VuZFxuXG4gIGFkZEVsZW1lbnQ6ICgpIC0+XG4gICAgdmFsdWUgPSAkKCcjZWxlbWVudF90eXBlX3NlbGVjdCcpLnZhbCgpXG4gICAgaWYgdmFsdWUgPT0gJ21lZGlhJyAgXG4gICAgICAkKCcjZmlsZXMnKS5zaG93KClcbiAgICAgICQoJyNodG1sX2RpdicpLmhpZGUoKVxuICAgIGlmIHZhbHVlID09ICdodG1sJyBcbiAgICAgICQoJyNodG1sX2RpdicpLnNob3coKVxuICAgICAgJCgnI2ZpbGVzJykuaGlkZSgpXG5cbiAgc2F2ZTogPT5cbiAgICBpZiBAdXBkYXRlTW9kZWwoKVxuICAgICAgQG1vZGVsLnNhdmUgbnVsbCxcbiAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICBVdGlscy5taWRBbGVydCBcIiN7QG1vZGVsLmdldChcIm5hbWVcIil9IHNhdmVkXCJcbiAgICAgICAgZXJyb3I6ID0+XG4gICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJMZXNzb25QbGFuIHNhdmUgZXJyb3IuIFBsZWFzZSB0cnkgYWdhaW4uXCJcblxuICBnb0JhY2s6IC0+IFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJhc3Nlc3NtZW50c1wiLCB0cnVlXG5cbiAgdXBkYXRlTW9kZWw6ID0+XG5cbiNcbiMgcGFyc2UgYWNjZXB0YWJsZSByYW5kb20gc2VxdWVuY2VzXG4jXG5cbiAgICBlbGVtZW50Q291bnQgPSBAbW9kZWwuZWxlbWVudHMubW9kZWxzLmxlbmd0aFxuXG4gICAgIyByZW1vdmUgZXZlcnl0aGluZyBleGNlcHQgbnVtYmVycywgY29tbWFzIGFuZCBuZXcgbGluZXNcbiAgICBzZXF1ZW5jZXNWYWx1ZSA9IEAkZWwuZmluZChcIiNzZXF1ZW5jZXNcIikudmFsKCkucmVwbGFjZSgvW14wLTksXFxuXS9nLFwiXCIpXG4gICAgc2VxdWVuY2VzID0gc2VxdWVuY2VzVmFsdWUuc3BsaXQoXCJcXG5cIilcblxuICAgICMgcGFyc2Ugc3RyaW5ncyB0byBudW1iZXJzIGFuZCBjb2xsZWN0IGVycm9yc1xuICAgIGZvciBzZXF1ZW5jZSwgaSBpbiBzZXF1ZW5jZXNcblxuICAgICAgc2VxdWVuY2UgPSBzZXF1ZW5jZS5zcGxpdChcIixcIilcbiAgICAgIGZvciBlbGVtZW50LCBqIGluIHNlcXVlbmNlXG4gICAgICAgIHNlcXVlbmNlW2pdID0gcGFyc2VJbnQoZWxlbWVudClcbiAgICAgICAgcmFuZ2VFcnJvciA9IHRydWUgaWYgc2VxdWVuY2Vbal0gPCAwIG9yIHNlcXVlbmNlW2pdID49IGVsZW1lbnRDb3VudFxuICAgICAgICBlbXB0eUVycm9yID0gdHJ1ZSBpZiBpc05hTihzZXF1ZW5jZVtqXSlcblxuICAgICAgc2VxdWVuY2VzW2ldID0gc2VxdWVuY2VcblxuICAgICAgIyBkZXRlY3QgZXJyb3JzXG4gICAgICB0b29NYW55RXJyb3IgPSB0cnVlIGlmIHNlcXVlbmNlLmxlbmd0aCA+IGVsZW1lbnRDb3VudFxuICAgICAgdG9vRmV3RXJyb3IgID0gdHJ1ZSBpZiBzZXF1ZW5jZS5sZW5ndGggPCBlbGVtZW50Q291bnRcbiAgICAgIGRvdWJsZXNFcnJvciA9IHRydWUgaWYgc2VxdWVuY2UubGVuZ3RoICE9IF8udW5pcShzZXF1ZW5jZSkubGVuZ3RoXG5cbiAgICAjIHNob3cgZXJyb3JzIGlmIHRoZXkgZXhpc3QgYW5kIHNlcXVlbmNlcyBleGlzdFxuICAgIGlmIG5vdCBfLmlzRW1wdHkgXy5yZWplY3QoIF8uZmxhdHRlbihzZXF1ZW5jZXMpLCAoZSkgLT4gcmV0dXJuIGlzTmFOKGUpKSAjIHJlbW92ZSB1bnBhcnNhYmxlIGVtcHRpZXMsIGRvbid0IF8uY29tcGFjdC4gd2lsbCByZW1vdmUgMHNcbiAgICAgIHNlcXVlbmNlRXJyb3JzID0gW11cbiAgICAgIGlmIGVtcHR5RXJyb3IgICB0aGVuIHNlcXVlbmNlRXJyb3JzLnB1c2ggXCJTb21lIHNlcXVlbmNlcyBjb250YWluIGVtcHR5IHZhbHVlcy5cIlxuICAgICAgaWYgcmFuZ2VFcnJvciAgIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgbnVtYmVycyBkbyBub3QgcmVmZXJlbmNlIGEgZWxlbWVudCBmcm9tIHRoZSBsZWdlbmQuXCJcbiAgICAgIGlmIHRvb01hbnlFcnJvciB0aGVuIHNlcXVlbmNlRXJyb3JzLnB1c2ggXCJTb21lIHNlcXVlbmNlcyBhcmUgbG9uZ2VyIHRoYW4gdGhlIHRvdGFsIG51bWJlciBvZiBhbGwgZWxlbWVudHMuXCJcbiAgICAgIGlmIHRvb0Zld0Vycm9yICB0aGVuIHNlcXVlbmNlRXJyb3JzLnB1c2ggXCJTb21lIHNlcXVlbmNlcyBhcmUgc2hvcnRlciB0aGFuIHRoZSB0b3RhbCBudW1iZXIgb2YgYWxsIGVsZW1lbnRzLlwiXG4gICAgICBpZiBkb3VibGVzRXJyb3IgdGhlbiBzZXF1ZW5jZUVycm9ycy5wdXNoIFwiU29tZSBzZXF1ZW5jZXMgY29udGFpbiBkb3VibGVzLlwiXG5cbiAgICAgIGlmIHNlcXVlbmNlRXJyb3JzLmxlbmd0aCA9PSAwXG4jIGlmIHRoZXJlJ3Mgbm8gZXJyb3JzLCBjbGVhbiB1cCB0aGUgdGV4dGFyZWEgY29udGVudFxuICAgICAgICB2YWxpZGF0ZWRTZXF1ZW5jZXMgPSAoc2VxdWVuY2Uuam9pbihcIiwgXCIpIGZvciBzZXF1ZW5jZSBpbiBzZXF1ZW5jZXMpLmpvaW4oXCJcXG5cIilcbiAgICAgICAgQCRlbC5maW5kKFwiI3NlcXVlbmNlc1wiKS52YWwodmFsaWRhdGVkU2VxdWVuY2VzKVxuICAgICAgZWxzZSAjIGlmIHRoZXJlJ3MgZXJyb3JzLCB0aGV5IGNhbiBzdGlsbCBzYXZlLiBKdXN0IHNob3cgYSB3YXJuaW5nXG4gICAgICAgIGFsZXJ0IFwiV2FybmluZ1xcblxcbiN7c2VxdWVuY2VFcnJvcnMuam9pbihcIlxcblwiKX1cIlxuXG4jIG5vdGhpbmcgcmVzZW1ibGluZyBhIHZhbGlkIHNlcXVlbmNlIHdhcyBmb3VuZFxuICAgIGVsc2VcbiAgICAgIEAkZWwuZmluZChcIiNzZXF1ZW5jZXNcIikudmFsKFwiXCIpICMgY2xlYW4gdGV4dCBhcmVhXG5cbiAgICBAbW9kZWwuc2V0XG4gICAgICBzZXF1ZW5jZXMgOiBzZXF1ZW5jZXNcbiAgICAgIGFyY2hpdmVkICA6IEAkZWwuZmluZChcIiNhcmNoaXZlX2J1dHRvbnMgaW5wdXQ6Y2hlY2tlZFwiKS52YWwoKSA9PSBcInRydWVcIlxuICAgICAgbmFtZSAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fdGl0bGVcIikudmFsKClcbiAgICAgIGRLZXkgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX2Rfa2V5XCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuX3RpdGxlICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl90aXRsZVwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl9sZXNzb25fdGV4dCAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fbGVzc29uX3RleHRcIikudmFsKClcbiMgICAgICBsZXNzb25QbGFuX3N1YmplY3QgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX3N1YmplY3RcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5fc3ViamVjdCAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fc3ViamVjdF9idXR0b25zIGlucHV0OmNoZWNrZWRcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5fZ3JhZGUgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX2dyYWRlXCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuX3dlZWsgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX3dlZWtcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5fZGF5ICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9kYXlcIikudmFsKClcbiMgICAgICBsZXNzb25QbGFuX2ltYWdlICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9pbWFnZVwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbklkIDogQG1vZGVsLmlkXG4gICAgICBhc3Nlc3NtZW50SWQgOiBAbW9kZWwuaWRcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHRvZ2dsZU5ld0VsZW1lbnRGb3JtOiAoZXZlbnQpIC0+XG4gICAgQCRlbC5maW5kKFwiLm5ld19lbGVtZW50X2Zvcm0sIC5uZXdfZWxlbWVudF9idXR0b25cIikudG9nZ2xlKClcblxuICAgIEAkZWwuZmluZChcIiNuZXdfZWxlbWVudF9uYW1lXCIpLnZhbChcIlwiKVxuICAgIEAkZWwuZmluZChcIiNlbGVtZW50X3R5cGVfc2VsZWN0XCIpLnZhbChcIm5vbmVcIilcblxuXG4gICAgZmFsc2VcblxuICBzYXZlTmV3RWxlbWVudDogKGV2ZW50KSA9PlxuXG4gICAgaWYgZXZlbnQudHlwZSAhPSBcImNsaWNrXCIgJiYgZXZlbnQud2hpY2ggIT0gMTNcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICAjIGlmIG5vIGVsZW1lbnQgdHlwZSBzZWxlY3RlZCwgc2hvdyBlcnJvclxuICAgIGlmIEAkZWwuZmluZChcIiNlbGVtZW50X3R5cGVfc2VsZWN0IG9wdGlvbjpzZWxlY3RlZFwiKS52YWwoKSA9PSBcIm5vbmVcIlxuICAgICAgVXRpbHMubWlkQWxlcnQgXCJQbGVhc2Ugc2VsZWN0IGFuIGVsZW1lbnQgdHlwZVwiXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgICMgZ2VuZXJhbCB0ZW1wbGF0ZVxuICAgIG5ld0F0dHJpYnV0ZXMgPSBUYW5nZXJpbmUudGVtcGxhdGVzLmdldChcImVsZW1lbnRcIilcblxuICAgICMgcHJvdG90eXBlIHRlbXBsYXRlXG4gICAgcHJvdG90eXBlVGVtcGxhdGUgPSBUYW5nZXJpbmUudGVtcGxhdGVzLmdldChcImVsZW1lbnRUeXBlc1wiKVtAJGVsLmZpbmQoXCIjZWxlbWVudF90eXBlX3NlbGVjdFwiKS52YWwoKV1cblxuICAgICMgYml0IG1vcmUgc3BlY2lmaWMgdGVtcGxhdGVcbiAgICB1c2VUeXBlVGVtcGxhdGUgPSBUYW5nZXJpbmUudGVtcGxhdGVzLmdldChcImVsZW1lbnRcIik7XG5cbiAgICBmaWxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWxlc1wiKS5maWxlc1swXVxuICAgIGlmIHR5cGVvZiBmaWxlICE9ICd1bmRlZmluZWQnXG4gICAgICBmZCA9IG5ldyBGb3JtRGF0YSgpXG4gICAgICBmZC5hcHBlbmQoXCJmaWxlXCIsIGZpbGUpXG5cbiAgIFxuXG4gICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIG5ld0F0dHJpYnV0ZXMsIHByb3RvdHlwZVRlbXBsYXRlXG4gICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIG5ld0F0dHJpYnV0ZXMsIHVzZVR5cGVUZW1wbGF0ZVxuICAgIG5ld0F0dHJpYnV0ZXMgPSAkLmV4dGVuZCBuZXdBdHRyaWJ1dGVzLFxuICAgICAgbmFtZSAgICAgICAgIDogQCRlbC5maW5kKFwiI25ld19lbGVtZW50X25hbWVcIikudmFsKClcbiAgICAgIGVsZW1lbnQgICAgICAgICA6IEAkZWwuZmluZChcIiNlbGVtZW50X3R5cGVfc2VsZWN0XCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuSWQgOiBAbW9kZWwuaWRcbiAgICAgIGFzc2Vzc21lbnRJZCA6IEBtb2RlbC5pZFxuICAgICAgb3JkZXIgICAgICAgIDogQG1vZGVsLmVsZW1lbnRzLmxlbmd0aFxuXG4gICAgaWYgQ0tFRElUT1IuaW5zdGFuY2VzLmh0bWwuZ2V0RGF0YSgpICE9ICd1bmRlZmluZWQnXG4gICAgICBAbW9kZWwuc2V0XG4gICAgICAgIFwiaHRtbFwiIDogQ0tFRElUT1IuaW5zdGFuY2VzLmh0bWwuZ2V0RGF0YSgpXG4gICAgICBuZXdBdHRyaWJ1dGVzID0gJC5leHRlbmQgbmV3QXR0cmlidXRlcyxcbiAgICAgICAgaHRtbDogQG1vZGVsLmdldCgnaHRtbCcpXG5cbiAgICBpZiB0eXBlb2YgZmlsZSAhPSAndW5kZWZpbmVkJ1xuICAgICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIG5ld0F0dHJpYnV0ZXMsXG4gICAgICAgIGZpbGVUeXBlICA6IGZpbGUudHlwZVxuICAgICAgICBmaWxlTmFtZSAgOiBmaWxlLm5hbWVcbiAgICAgICAgZmlsZVNpemUgIDogZmlsZS5zaXplXG5cbiAgICBpZiB0eXBlb2YgZmlsZSA9PSAndW5kZWZpbmVkJ1xuICAgICAgb3B0aW9ucyA9XG4gICAgICAgIHN1Y2Nlc3M6IChtb2RlbCwgcmVzcCkgPT5cbiAgICAgICAgICBjb25zb2xlLmxvZyhcIk1vZGVsIGNyZWF0ZWQuXCIpXG4gICAgICAgIGVycm9yOiAobW9kZWwsIGVycikgPT5cbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiArIEpTT04uc3RyaW5naWZ5KGVycikgKyBcIiBNb2RlbDogXCIgKyBKU09OLnN0cmluZ2lmeShtb2RlbCkpXG4gICAgZWxzZVxuICAgICAgb3B0aW9ucyA9XG4gICAgICAgIHN1Y2Nlc3M6IChtb2RlbCwgcmVzcCkgPT5cbiAgIyAgICAgICAgY29uc29sZS5sb2coXCJjcmVhdGVkOiBcIiArIEpTT04uc3RyaW5naWZ5KHJlc3ApICsgXCIgTW9kZWw6IFwiICsgSlNPTi5zdHJpbmdpZnkobW9kZWwpKVxuICAgICAgICAgIHVybCA9IFwiI3tUYW5nZXJpbmUuY29uZmlnLmdldCgncm9iYmVydCcpfS9maWxlc1wiXG4gICAgICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgeGhyLnVwbG9hZC5vbmVycm9yID0gKGUpID0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yIFVwbG9hZGluZyBpbWFnZTogXCIgKyBKU09OLnN0cmluZ2lmeShlKSlcbiAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT5cbiAgICAgICAgICAgIGlmIHhoci5yZWFkeVN0YXRlID09IDRcbiAgICAgICAgICAgICAgaWYgeGhyLnN0YXR1cyA9PSAyMDBcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh4aHIucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJUaGVyZSB3YXMgYW4gZXJyb3IgdXBsb2FkaW5nIHRoZSBmaWxlOiBcIiArIHhoci5yZXNwb25zZVRleHQgKyBcIiBTdGF0dXM6IFwiICsgeGhyLnN0YXR1cylcbiMgICAgICAgICAgICAgICAgYWxlcnQoXCJUaGVyZSB3YXMgYW4gZXJyb3IgdXBsb2FkaW5nIHRoZSBmaWxlOiBcIiArIHhoci5yZXNwb25zZVRleHQgKyBcIiBTdGF0dXM6IFwiICsgeGhyLnN0YXR1cylcbiAgICAgICAgICB4aHIub25lcnJvciA9ICAoZXJyKSA9PlxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJUaGVyZSB3YXMgYW4gZXJyb3IgdXBsb2FkaW5nIHRoZSBmaWxlOiBcIiArIGVycilcbiMgICAgICAgICAgICBhbGVydChcIlRoZXJlIHdhcyBhbiBlcnJvciB1cGxvYWRpbmcgdGhlIGZpbGU6IFwiICsgeGhyLnJlc3BvbnNlVGV4dCArIFwiIFN0YXR1czogXCIgKyB4aHIuc3RhdHVzKVxuXG4gICAgICAgICAgIyBkZWZpbmUgb3VyIGZpbmlzaCBmblxuICAgICAgICAgIGxvYWRlZCA9ICgpLT5cbiAgIyAgICAgICAgICBjb25zb2xlLmxvZygnZmluaXNoZWQgdXBsb2FkaW5nJylcbiAgICAgICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lciAnbG9hZCcsIGxvYWRlZCwgZmFsc2VcbiMgICAgICAgICAgcHJvZ3Jlc3NCYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdwcm9ncmVzcycpO1xuIyAgICAgICAgICB4aHIudXBsb2FkLm9ucHJvZ3Jlc3MgPSAoZSkgPT5cbiMgICAgICAgICAgICBpZiBlLmxlbmd0aENvbXB1dGFibGVcbiMgICAgICAgICAgICAgIHByb2dyZXNzQmFyLnZhbHVlID0gKGUubG9hZGVkIC8gZS50b3RhbCkgKiAxMDA7XG4jICAgICAgICAgICAgICBwcm9ncmVzc0Jhci50ZXh0Q29udGVudCA9IHByb2dyZXNzQmFyLnZhbHVlO1xuIyAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJwcm9ncmVzczogXCIgKyBwcm9ncmVzc0Jhci52YWx1ZSlcbiAgICAgICAgICB4aHIub3BlbignUE9TVCcsIHVybCwgdHJ1ZSk7XG4gICAgICAgICAgeGhyLnNlbmQoZmQpO1xuICAgICAgICBlcnJvcjogKG1vZGVsLCBlcnIpID0+XG4gICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIgKyBKU09OLnN0cmluZ2lmeShlcnIpICsgXCIgTW9kZWw6IFwiICsgSlNPTi5zdHJpbmdpZnkobW9kZWwpKVxuXG4gICAgbmV3RWxlbWVudCA9IEBtb2RlbC5lbGVtZW50cy5jcmVhdGUgbmV3QXR0cmlidXRlcywgb3B0aW9uc1xuIyAgICBuZXdFbGVtZW50Lm9uKCdwcm9ncmVzcycsIChldnQpIC0+XG4jICAgICAgY29uc29sZS5sb2coXCJMb2dnaW5nIG5ld0VsZW1lbnQ6IFwiICsgZXZ0KVxuIyAgICApXG5cbiAgICBAdG9nZ2xlTmV3RWxlbWVudEZvcm0oKVxuICAgIHJldHVybiBmYWxzZVxuXG4gIHJlbmRlcjogPT5cbiAgICBsZXNzb25QbGFuX3RpdGxlICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxlc3NvblBsYW5fdGl0bGVcIilcbiMgICAgbGVzc29uUGxhbl9sZXNzb25fdGV4dCAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX2xlc3Nvbl90ZXh0XCIpXG4gICAgbGVzc29uUGxhbl9zdWJqZWN0ICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxlc3NvblBsYW5fc3ViamVjdFwiKVxuICAgIGxlc3NvblBsYW5fZ3JhZGUgICAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwibGVzc29uUGxhbl9ncmFkZVwiKVxuICAgIGxlc3NvblBsYW5fd2VlayAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX3dlZWtcIilcbiAgICBsZXNzb25QbGFuX2RheSAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX2RheVwiKVxuICAgIHNlcXVlbmNlcyA9IFwiXCJcbiAgICBpZiBAbW9kZWwuaGFzKFwic2VxdWVuY2VzXCIpXG4gICAgICBzZXF1ZW5jZXMgPSBAbW9kZWwuZ2V0KFwic2VxdWVuY2VzXCIpXG4gICAgICBzZXF1ZW5jZXMgPSBzZXF1ZW5jZXMuam9pbihcIlxcblwiKVxuXG4gICAgICBpZiBfLmlzQXJyYXkoc2VxdWVuY2VzKVxuICAgICAgICBmb3Igc2VxdWVuY2VzLCBpIGluIHNlcXVlbmNlc1xuICAgICAgICAgIHNlcXVlbmNlc1tpXSA9IHNlcXVlbmNlcy5qb2luKFwiLCBcIilcblxuICAgIGVsZW1lbnRMZWdlbmQgPSBAdXBkYXRlRWxlbWVudExlZ2VuZCgpXG5cbiAgICBhcmNoID0gQG1vZGVsLmdldCgnYXJjaGl2ZWQnKVxuICAgIGFyY2hpdmVDaGVja2VkICAgID0gaWYgKGFyY2ggPT0gdHJ1ZSBvciBhcmNoID09ICd0cnVlJykgdGhlbiBcImNoZWNrZWRcIiBlbHNlIFwiXCJcbiAgICBub3RBcmNoaXZlQ2hlY2tlZCA9IGlmIGFyY2hpdmVDaGVja2VkIHRoZW4gXCJcIiBlbHNlIFwiY2hlY2tlZFwiXG5cbiAgICBsZXNzb25QbGFuX3N1YmplY3RfRW5naXNoICAgID0gaWYgKGxlc3NvblBsYW5fc3ViamVjdCA9PSAnMScpIHRoZW4gXCJjaGVja2VkXCIgZWxzZSBcIlwiXG4gICAgbGVzc29uUGxhbl9zdWJqZWN0X0tpc3dhaGlsaSA9IGlmIChsZXNzb25QbGFuX3N1YmplY3QgPT0gJzInKSB0aGVuIFwiY2hlY2tlZFwiIGVsc2UgXCJcIlxuXG4gICAgIyBsaXN0IG9mIFwidGVtcGxhdGVzXCJcbiAgICBlbGVtZW50VHlwZVNlbGVjdCA9IFwiPHNlbGVjdCBpZD0nZWxlbWVudF90eXBlX3NlbGVjdCc+XG4gICAgICA8b3B0aW9uIHZhbHVlPSdub25lJyBkaXNhYmxlZD0nZGlzYWJsZWQnIHNlbGVjdGVkPSdzZWxlY3RlZCc+UGxlYXNlIHNlbGVjdCBhIGVsZW1lbnQgdHlwZTwvb3B0aW9uPlwiXG4gICAgZm9yIGtleSwgdmFsdWUgb2YgVGFuZ2VyaW5lLnRlbXBsYXRlcy5nZXQoXCJlbGVtZW50VHlwZXNcIilcbiMgICAgICBlbGVtZW50VHlwZVNlbGVjdCArPSBcIjxvcHRncm91cCBsYWJlbD0nI3trZXkuaHVtYW5pemUoKX0nPlwiXG4jICAgICAgZm9yIHN1YktleSwgc3ViVmFsdWUgb2YgdmFsdWVcbiAgICAgICAgZWxlbWVudFR5cGVTZWxlY3QgKz0gXCI8b3B0aW9uIHZhbHVlPScje2tleX0nIGRhdGEtdGVtcGxhdGU9JyN7a2V5fSc+I3trZXkuaHVtYW5pemUoKX08L29wdGlvbj5cIlxuIyAgICAgIGVsZW1lbnRUeXBlU2VsZWN0ICs9IFwiPC9vcHRncm91cD5cIlxuICAgIGVsZW1lbnRUeXBlU2VsZWN0ICs9IFwiPC9zZWxlY3Q+XCJcbiAgICBodG1sID0gQG1vZGVsLmdldChcImh0bWxcIikgfHwgXCJcIlxuXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8YnV0dG9uIGNsYXNzPSdiYWNrIG5hdmlnYXRpb24nPkJhY2s8L2J1dHRvbj5cbiAgICAgICAgPGgxPkxlc3NvblBsYW4gQnVpbGRlcjwvaDE+XG4gICAgICA8ZGl2IGlkPSdiYXNpYyc+XG4gICAgICBcblxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX2Rfa2V5JyB0aXRsZT0nVGhpcyBrZXkgaXMgdXNlZCB0byBpbXBvcnQgdGhlIGxlc3NvblBsYW4gZnJvbSBhIHRhYmxldC4nPkRvd25sb2FkIEtleTwvbGFiZWw+PGJyPlxuICAgICAgICA8ZGl2IGNsYXNzPSdpbmZvX2JveCc+I3tAbW9kZWwuaWQuc3Vic3RyKC01LDUpfTwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxsYWJlbCB0aXRsZT0nT25seSBhY3RpdmUgbGVzc29uUGxhbnMgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIG1haW4gbGVzc29uUGxhbiBsaXN0Lic+U3RhdHVzPC9sYWJlbD48YnI+XG4gICAgICA8ZGl2IGlkPSdhcmNoaXZlX2J1dHRvbnMnIGNsYXNzPSdidXR0b25zZXQnPlxuICAgICAgICA8aW5wdXQgdHlwZT0ncmFkaW8nIGlkPSdhcmNoaXZlX2ZhbHNlJyBuYW1lPSdhcmNoaXZlJyB2YWx1ZT0nZmFsc2UnICN7bm90QXJjaGl2ZUNoZWNrZWR9PjxsYWJlbCBmb3I9J2FyY2hpdmVfZmFsc2UnPkFjdGl2ZTwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCB0eXBlPSdyYWRpbycgaWQ9J2FyY2hpdmVfdHJ1ZScgIG5hbWU9J2FyY2hpdmUnIHZhbHVlPSd0cnVlJyAgI3thcmNoaXZlQ2hlY2tlZH0+PGxhYmVsIGZvcj0nYXJjaGl2ZV90cnVlJz5BcmNoaXZlZDwvbGFiZWw+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX3RpdGxlJz5MZXNzb25QbGFuIFRpdGxlPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IGlkPSdsZXNzb25QbGFuX3RpdGxlJyB2YWx1ZT0nI3tsZXNzb25QbGFuX3RpdGxlfSc+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGxhYmVsIHRpdGxlPSdZb3UgbXVzdCBjaG9vc2Ugb25lIG9mIHRoZXNlIHN1YmplY3RzLicgZm9yPSdsZXNzb25QbGFuX3N1YmplY3RfYnV0dG9ucyc+TGVzc29uUGxhbiBzdWJqZWN0PC9sYWJlbD48YnI+XG4gICAgICA8ZGl2IGlkPSdsZXNzb25QbGFuX3N1YmplY3RfYnV0dG9ucycgY2xhc3M9J2J1dHRvbnNldCc+XG4gICAgICAgIDxpbnB1dCB0eXBlPSdyYWRpbycgaWQ9J2xlc3NvblBsYW5fc3ViamVjdF9Fbmdpc2gnIG5hbWU9J2xlc3NvblBsYW5fc3ViamVjdCcgdmFsdWU9JzEnICN7bGVzc29uUGxhbl9zdWJqZWN0X0VuZ2lzaH0+PGxhYmVsIGZvcj0nbGVzc29uUGxhbl9zdWJqZWN0X0VuZ2lzaCc+RW5naXNoPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IHR5cGU9J3JhZGlvJyBpZD0nbGVzc29uUGxhbl9zdWJqZWN0X0tpc3dhaGlsaScgIG5hbWU9J2xlc3NvblBsYW5fc3ViamVjdCcgdmFsdWU9JzInICAje2xlc3NvblBsYW5fc3ViamVjdF9LaXN3YWhpbGl9PjxsYWJlbCBmb3I9J2xlc3NvblBsYW5fc3ViamVjdF9LaXN3YWhpbGknPktpc3dhaGlsaTwvbGFiZWw+XG4gICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX2dyYWRlJz5MZXNzb25QbGFuIEdyYWRlPC9sYWJlbD5cbiAgICAgIDxpbnB1dCBpZD0nbGVzc29uUGxhbl9ncmFkZScgdmFsdWU9JyN7bGVzc29uUGxhbl9ncmFkZX0nPlxuICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nbGVzc29uUGxhbl93ZWVrJz5MZXNzb25QbGFuIFdlZWs8L2xhYmVsPlxuICAgICAgPGlucHV0IGlkPSdsZXNzb25QbGFuX3dlZWsnIHZhbHVlPScje2xlc3NvblBsYW5fd2Vla30nPlxuICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nbGVzc29uUGxhbl9kYXknPkxlc3NvblBsYW4gRGF5PC9sYWJlbD5cbiAgICAgIDxpbnB1dCBpZD0nbGVzc29uUGxhbl9kYXknIHZhbHVlPScje2xlc3NvblBsYW5fZGF5fSc+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGgyPkVsZW1lbnRzPC9oMj5cbiAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbjwhLS1cbiAgICAgICAgPHByb2dyZXNzIG1pbj0nMCcgbWF4PScxMDAnIHZhbHVlPScwJz48L3Byb2dyZXNzPlxuLS0+XG4gICAgICAgIDxkaXY+XG4gICAgICAgIDx1bCBpZD0nZWxlbWVudF9saXN0Jz5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxidXR0b24gY2xhc3M9J25ld19lbGVtZW50X2J1dHRvbiBjb21tYW5kJz5BZGQgRWxlbWVudDwvYnV0dG9uPlxuICAgICAgICA8ZGl2IGNsYXNzPSduZXdfZWxlbWVudF9mb3JtIGNvbmZpcm1hdGlvbic+XG4gICAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgICAgPGgyPk5ldyBFbGVtZW50PC9oMj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J2VsZW1lbnRfdHlwZV9zZWxlY3QnPlR5cGU8L2xhYmVsPjxicj5cbiAgICAgICAgICAgICN7ZWxlbWVudFR5cGVTZWxlY3R9PGJyPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0nbmV3X2VsZW1lbnRfbmFtZSc+TmFtZTwvbGFiZWw+PGJyPlxuICAgICAgICAgICAgPGlucHV0IHR5cGU9J3RleHQnIGlkPSduZXdfZWxlbWVudF9uYW1lJz5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPSdmaWxlJyBuYW1lPSdmaWxlcycgaWQ9J2ZpbGVzJyBtdWx0aXBsZT0nbXVsdGlwbGUnIC8+XG4gICAgICAgICAgICA8ZGl2IGlkPSdodG1sX2RpdicgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICAgICAgPGxhYmVsIGZvcj0naHRtbCc+SHRtbDwvbGFiZWw+XG4gICAgICAgICAgICAgIDx0ZXh0YXJlYSBpZD0naHRtbCc+I3todG1sfTwvdGV4dGFyZWE+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25ld19lbGVtZW50X3NhdmUgY29tbWFuZCc+QWRkPC9idXR0b24+IDxidXR0b24gY2xhc3M9J25ld19lbGVtZW50X2NhbmNlbCBjb21tYW5kJz5DYW5jZWw8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxoMj48L2gyPlxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnIHN0eWxlPSdkaXNwbGF5OiBub25lOyc+IFxuICAgICAgICA8bGFiZWwgZm9yPSdzZXF1ZW5jZXMnIHRpdGxlPSdUaGlzIGlzIGEgbGlzdCBvZiBhY2NlcHRhYmxlIG9yZGVycyBvZiBlbGVtZW50cywgd2hpY2ggd2lsbCBiZSByYW5kb21seSBzZWxlY3RlZCBlYWNoIHRpbWUgYW4gbGVzc29uUGxhbiBpcyBydW4uIEVsZW1lbnQgaW5kaWNpZXMgYXJlIHNlcGFyYXRlZCBieSBjb21tYXMsIG5ldyBsaW5lcyBzZXBhcmF0ZSBzZXF1ZW5jZXMuICc+UmFuZG9tIFNlcXVlbmNlczwvbGFiZWw+XG4gICAgICAgIDxkaXYgaWQ9J2VsZW1lbnRfbGVnZW5kJz4je2VsZW1lbnRMZWdlbmR9PC9kaXY+XG4gICAgICAgIDx0ZXh0YXJlYSBpZD0nc2VxdWVuY2VzJz4je3NlcXVlbmNlc308L3RleHRhcmVhPlxuICAgICAgPC9kaXY+XG4gICAgICA8YnV0dG9uIGNsYXNzPSdzYXZlIGNvbW1hbmQnPlNhdmU8L2J1dHRvbj5cbiAgICAgIFwiXG5cbiAgICAjIHJlbmRlciBuZXcgZWxlbWVudCB2aWV3c1xuICAgIEBlbGVtZW50TGlzdEVkaXRWaWV3LnNldEVsZW1lbnQoQCRlbC5maW5kKFwiI2VsZW1lbnRfbGlzdFwiKSlcbiAgICBAZWxlbWVudExpc3RFZGl0Vmlldy5yZW5kZXIoKVxuXG4gICAgIyBtYWtlIGl0IHNvcnRhYmxlXG4gICAgQCRlbC5maW5kKFwiI2VsZW1lbnRfbGlzdFwiKS5zb3J0YWJsZVxuICAgICAgaGFuZGxlIDogJy5zb3J0YWJsZV9oYW5kbGUnXG4gICAgICBzdGFydDogKGV2ZW50LCB1aSkgLT4gdWkuaXRlbS5hZGRDbGFzcyBcImRyYWdfc2hhZG93XCJcbiAgICAgIHN0b3A6ICAoZXZlbnQsIHVpKSAtPiB1aS5pdGVtLnJlbW92ZUNsYXNzIFwiZHJhZ19zaGFkb3dcIlxuICAgICAgdXBkYXRlIDogKGV2ZW50LCB1aSkgPT5cbiAgICAgICAgZm9yIGlkLCBpIGluICgkKGxpKS5hdHRyKFwiZGF0YS1pZFwiKSBmb3IgbGkgaW4gQCRlbC5maW5kKFwiI2VsZW1lbnRfbGlzdCBsaVwiKSlcbiAgICAgICAgICBAbW9kZWwuZWxlbWVudHMuZ2V0KGlkKS5zZXQoe1wib3JkZXJcIjppfSx7c2lsZW50OnRydWV9KS5zYXZlKG51bGwse3NpbGVudDp0cnVlfSlcbiAgICAgICAgQG1vZGVsLmVsZW1lbnRzLnNvcnQoKVxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cblxuICB1cGRhdGVFbGVtZW50TGVnZW5kOiA9PlxuICAgIGVsZW1lbnRMZWdlbmQgPSBcIlwiXG4gICAgQG1vZGVsLmVsZW1lbnRzLmVhY2ggKGVsZW1lbnQsIGkpIC0+XG4gICAgICBlbGVtZW50TGVnZW5kICs9IFwiPGRpdiBjbGFzcz0nc21hbGxfZ3JleSc+I3tpfSAtICN7ZWxlbWVudC5nZXQoXCJuYW1lXCIpfTwvZGl2Pjxicj5cIlxuICAgICRlbGVtZW50V3JhcHBlciA9IEAkZWwuZmluZChcIiNlbGVtZW50X2xlZ2VuZFwiKVxuICAgICRlbGVtZW50V3JhcHBlci5odG1sKGVsZW1lbnRMZWdlbmQpIGlmICRlbGVtZW50V3JhcHBlci5sZW5ndGggIT0gMFxuICAgIHJldHVybiBlbGVtZW50TGVnZW5kXG5cbiAgb25DbG9zZTogLT5cbiAgICBAZWxlbWVudExpc3RFZGl0Vmlldy5jbG9zZSgpXG4gIFxuICBhZnRlclJlbmRlcjogLT5cbiAgICBAZWxlbWVudEVkaXRvcj8uYWZ0ZXJSZW5kZXI/KClcbiAgICBDS0VESVRPUi5yZXBsYWNlKFwiaHRtbFwiKVxuICAgICQoJyNmaWxlcycpLmhpZGUoKVxuICAgICQoJyNodG1sX2RpdicpLmhpZGUoKSJdfQ==
