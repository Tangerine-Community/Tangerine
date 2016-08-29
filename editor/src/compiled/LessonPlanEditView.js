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
      fd.append("groupName", Tangerine.settings.get("groupName"));
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
    $("#files").val('');
    CKEDITOR.instances['html'].setData("");
    return false;
  };

  LessonPlanEditView.prototype.render = function() {
    var arch, archiveChecked, elementLegend, elementTypeSelect, html, i, k, key, len, lessonPlan_day, lessonPlan_grade, lessonPlan_subject, lessonPlan_subject_Af_Somali, lessonPlan_subject_Afaan_Oromo, lessonPlan_subject_Amharic, lessonPlan_subject_Hadiyyisa, lessonPlan_subject_Sidaamu_Afoo, lessonPlan_subject_Tigrinya, lessonPlan_subject_Wolayttatto, lessonPlan_title, lessonPlan_week, notArchiveChecked, ref, sequences, value;
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
    lessonPlan_subject_Afaan_Oromo = lessonPlan_subject === '1' ? "checked" : "";
    lessonPlan_subject_Af_Somali = lessonPlan_subject === '2' ? "checked" : "";
    lessonPlan_subject_Amharic = lessonPlan_subject === '3' ? "checked" : "";
    lessonPlan_subject_Hadiyyisa = lessonPlan_subject === '4' ? "checked" : "";
    lessonPlan_subject_Sidaamu_Afoo = lessonPlan_subject === '5' ? "checked" : "";
    lessonPlan_subject_Tigrinya = lessonPlan_subject === '6' ? "checked" : "";
    lessonPlan_subject_Wolayttatto = lessonPlan_subject === '7' ? "checked" : "";
    elementTypeSelect = "<select id='element_type_select'> <option value='none' disabled='disabled' selected='selected'>Please select a element type</option>";
    ref = Tangerine.templates.get("elementTypes");
    for (key in ref) {
      value = ref[key];
      elementTypeSelect += "<option value='" + key + "' data-template='" + key + "'>" + (key.humanize()) + "</option>";
    }
    elementTypeSelect += "</select>";
    html = this.model.get("html") || "";
    this.$el.html("<button class='back navigation'>Back</button> <h1>LessonPlan Builder</h1> <div id='basic'> <label for='lessonPlan_d_key' title='This key is used to import the lessonPlan from a tablet.'>Download Key</label><br> <div class='info_box'>" + (this.model.id.substr(-5, 5)) + "</div> </div> <label title='Only active lessonPlans will be displayed in the main lessonPlan list.'>Status</label><br> <div id='archive_buttons' class='buttonset'> <input type='radio' id='archive_false' name='archive' value='false' " + notArchiveChecked + "><label for='archive_false'>Active</label> <input type='radio' id='archive_true'  name='archive' value='true'  " + archiveChecked + "><label for='archive_true'>Archived</label> </div> <div class='label_value'> <label for='lessonPlan_title'>LessonPlan Title</label> <input id='lessonPlan_title' value='" + lessonPlan_title + "'> </div> <label title='You must choose one of these subjects.' for='lessonPlan_subject_buttons'>LessonPlan subject</label><br> <div id='lessonPlan_subject_buttons' class='buttonset'> <input type='radio' id='lessonPlan_subject_Afaan_Oromo' name='lessonPlan_subject' value='1' " + lessonPlan_subject_Afaan_Oromo + "><label for='lessonPlan_subject_Afaan_Oromo'>Afaan Oromo</label> <input type='radio' id='lessonPlan_subject_Af_Somali'  name='lessonPlan_subject' value='2'  " + lessonPlan_subject_Af_Somali + "><label for='lessonPlan_subject_Af_Somali'>Af-Somali</label> <input type='radio' id='lessonPlan_subject_Amharic'  name='lessonPlan_subject' value='3'  " + lessonPlan_subject_Amharic + "><label for='lessonPlan_subject_Amharic'>Amharic</label> <input type='radio' id='lessonPlan_subject_Hadiyyisa'  name='lessonPlan_subject' value='4'  " + lessonPlan_subject_Hadiyyisa + "><label for='lessonPlan_subject_Hadiyyisa'>Hadiyyisa</label> <input type='radio' id='lessonPlan_subject_Sidaamu_Afoo'  name='lessonPlan_subject' value='5'  " + lessonPlan_subject_Sidaamu_Afoo + "><label for='lessonPlan_subject_Sidaamu_Afoo'>Sidaamu Afoo</label> <input type='radio' id='lessonPlan_subject_Tigrinya'  name='lessonPlan_subject' value='6'  " + lessonPlan_subject_Tigrinya + "><label for='lessonPlan_subject_Tigrinya'>Tigrinya</label> <input type='radio' id='lessonPlan_subject_Wolayttatto'  name='lessonPlan_subject' value='7'  " + lessonPlan_subject_Wolayttatto + "><label for='lessonPlan_subject_Wolayttatto'>Wolayttatto</label> </div> <div class='label_value'> <label for='lessonPlan_grade'>LessonPlan Grade</label> <input id='lessonPlan_grade' value='" + lessonPlan_grade + "'> </div> <div class='label_value'> <label for='lessonPlan_week'>LessonPlan Week</label> <input id='lessonPlan_week' value='" + lessonPlan_week + "'> </div> <div class='label_value'> <label for='lessonPlan_day'>LessonPlan Day</label> <input id='lessonPlan_day' value='" + lessonPlan_day + "'> </div> <h2>Elements</h2> <div class='menu_box'> <!-- <progress min='0' max='100' value='0'></progress> --> <div> <ul id='element_list'> </ul> </div> <button class='new_element_button command'>Add Element</button> <div class='new_element_form confirmation'> <div class='menu_box'> <h2>New Element</h2> <label for='element_type_select'>Type</label><br> " + elementTypeSelect + "<br> <label for='new_element_name'>Name</label><br> <input type='text' id='new_element_name'> <input type='file' name='files' id='files' multiple='multiple' /> <div id='html_div' class='label_value'> <label for='html'>Html</label> <textarea id='html'>" + html + "</textarea> </div> <button class='new_element_save command'>Add</button> <button class='new_element_cancel command'>Cancel</button> </div> </div> </div> <h2></h2> <div class='label_value' style='display: none;'> <label for='sequences' title='This is a list of acceptable orders of elements, which will be randomly selected each time an lessonPlan is run. Element indicies are separated by commas, new lines separate sequences. '>Random Sequences</label> <div id='element_legend'>" + elementLegend + "</div> <textarea id='sequences'>" + sequences + "</textarea> </div> <button class='save command'>Save</button>");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlc3NvblBsYW4vTGVzc29uUGxhbkVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGtCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7OytCQUVKLFNBQUEsR0FBWTs7K0JBRVosTUFBQSxHQUNFO0lBQUEsNkJBQUEsRUFBaUMsWUFBakM7SUFDQSw4QkFBQSxFQUFpQyxNQURqQztJQUVBLGFBQUEsRUFBaUMsUUFGakM7SUFHQSwyQkFBQSxFQUFpQyxzQkFIakM7SUFJQSwyQkFBQSxFQUFpQyxzQkFKakM7SUFNQSw0QkFBQSxFQUFpQyxnQkFOakM7SUFPQSx5QkFBQSxFQUFpQyxnQkFQakM7SUFTQSxxQkFBQSxFQUFpQyxNQVRqQztJQVVBLGFBQUEsRUFBaUMsTUFWakM7OzsrQkFZRixVQUFBLEdBQVksU0FBQyxPQUFEO0lBQ1YsSUFBQyxDQUFBLEtBQUQsR0FBUyxPQUFPLENBQUM7SUFDakIsSUFBQyxDQUFBLG1CQUFELEdBQTJCLElBQUEsbUJBQUEsQ0FDekI7TUFBQSxZQUFBLEVBQWUsSUFBQyxDQUFBLEtBQWhCO01BQ0EsWUFBQSxFQUFlLElBQUMsQ0FBQSxLQURoQjtLQUR5QjtJQUkzQixJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFoQixDQUFtQixlQUFuQixFQUFvQyxJQUFDLENBQUEsbUJBQW1CLENBQUMsTUFBekQ7V0FDQSxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFoQixDQUFtQixLQUFuQixFQUEwQixJQUFDLENBQUEsbUJBQTNCO0VBUFU7OytCQVNaLFVBQUEsR0FBWSxTQUFBO0FBQ1YsUUFBQTtJQUFBLEtBQUEsR0FBUSxDQUFBLENBQUUsc0JBQUYsQ0FBeUIsQ0FBQyxHQUExQixDQUFBO0lBQ1IsSUFBRyxLQUFBLEtBQVMsT0FBWjtNQUNFLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxJQUFaLENBQUE7TUFDQSxDQUFBLENBQUUsV0FBRixDQUFjLENBQUMsSUFBZixD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QWUsQ0FBQyxJQUFoQixDQUFxQixhQUFyQixFQUFBOztBQUNBLFdBQU87RUFOWTs7K0JBUXJCLE9BQUEsR0FBUyxTQUFBO1dBQ1AsSUFBQyxDQUFBLG1CQUFtQixDQUFDLEtBQXJCLENBQUE7RUFETzs7K0JBR1QsV0FBQSxHQUFhLFNBQUE7QUFDWCxRQUFBOzs7V0FBYyxDQUFFOzs7SUFDaEIsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsTUFBakI7SUFDQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsSUFBWixDQUFBO1dBQ0EsQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLElBQWYsQ0FBQTtFQUpXOzs7O0dBNVdrQixRQUFRLENBQUMiLCJmaWxlIjoibGVzc29uUGxhbi9MZXNzb25QbGFuRWRpdFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBMZXNzb25QbGFuRWRpdFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogJ2xlc3NvblBsYW5fZWRpdF92aWV3J1xuXG4gIGV2ZW50cyA6XG4gICAgJ2NoYW5nZSAjZWxlbWVudF90eXBlX3NlbGVjdCcgIDogJ2FkZEVsZW1lbnQnXG4gICAgJ2NsaWNrICNhcmNoaXZlX2J1dHRvbnMgaW5wdXQnIDogJ3NhdmUnXG4gICAgJ2NsaWNrIC5iYWNrJyAgICAgICAgICAgICAgICAgIDogJ2dvQmFjaydcbiAgICAnY2xpY2sgLm5ld19lbGVtZW50X2J1dHRvbicgICAgOiAndG9nZ2xlTmV3RWxlbWVudEZvcm0nXG4gICAgJ2NsaWNrIC5uZXdfZWxlbWVudF9jYW5jZWwnICAgIDogJ3RvZ2dsZU5ld0VsZW1lbnRGb3JtJ1xuXG4gICAgJ2tleXByZXNzICNuZXdfZWxlbWVudF9uYW1lJyAgIDogJ3NhdmVOZXdFbGVtZW50J1xuICAgICdjbGljayAubmV3X2VsZW1lbnRfc2F2ZScgICAgICA6ICdzYXZlTmV3RWxlbWVudCdcblxuICAgICdjaGFuZ2UgI2Jhc2ljIGlucHV0JyAgICAgICAgICA6ICdzYXZlJ1xuICAgICdjbGljayAuc2F2ZScgICAgICAgICAgICAgICAgICA6ICdzYXZlJ1xuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEBtb2RlbCA9IG9wdGlvbnMubW9kZWxcbiAgICBAZWxlbWVudExpc3RFZGl0VmlldyA9IG5ldyBFbGVtZW50TGlzdEVkaXRWaWV3XG4gICAgICBcImxlc3NvblBsYW5cIiA6IEBtb2RlbFxuICAgICAgXCJhc3Nlc3NtZW50XCIgOiBAbW9kZWxcblxuICAgIEBtb2RlbC5lbGVtZW50cy5vbiBcImNoYW5nZSByZW1vdmVcIiwgQGVsZW1lbnRMaXN0RWRpdFZpZXcucmVuZGVyXG4gICAgQG1vZGVsLmVsZW1lbnRzLm9uIFwiYWxsXCIsIEB1cGRhdGVFbGVtZW50TGVnZW5kXG5cbiAgYWRkRWxlbWVudDogKCkgLT5cbiAgICB2YWx1ZSA9ICQoJyNlbGVtZW50X3R5cGVfc2VsZWN0JykudmFsKClcbiAgICBpZiB2YWx1ZSA9PSAnbWVkaWEnICBcbiAgICAgICQoJyNmaWxlcycpLnNob3coKVxuICAgICAgJCgnI2h0bWxfZGl2JykuaGlkZSgpXG4gICAgaWYgdmFsdWUgPT0gJ2h0bWwnIFxuICAgICAgJCgnI2h0bWxfZGl2Jykuc2hvdygpXG4gICAgICAkKCcjZmlsZXMnKS5oaWRlKClcblxuICBzYXZlOiA9PlxuICAgIGlmIEB1cGRhdGVNb2RlbCgpXG4gICAgICBAbW9kZWwuc2F2ZSBudWxsLFxuICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiI3tAbW9kZWwuZ2V0KFwibmFtZVwiKX0gc2F2ZWRcIlxuICAgICAgICBlcnJvcjogPT5cbiAgICAgICAgICBVdGlscy5taWRBbGVydCBcIkxlc3NvblBsYW4gc2F2ZSBlcnJvci4gUGxlYXNlIHRyeSBhZ2Fpbi5cIlxuXG4gIGdvQmFjazogLT4gVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImFzc2Vzc21lbnRzXCIsIHRydWVcblxuICB1cGRhdGVNb2RlbDogPT5cblxuI1xuIyBwYXJzZSBhY2NlcHRhYmxlIHJhbmRvbSBzZXF1ZW5jZXNcbiNcblxuICAgIGVsZW1lbnRDb3VudCA9IEBtb2RlbC5lbGVtZW50cy5tb2RlbHMubGVuZ3RoXG5cbiAgICAjIHJlbW92ZSBldmVyeXRoaW5nIGV4Y2VwdCBudW1iZXJzLCBjb21tYXMgYW5kIG5ldyBsaW5lc1xuICAgIHNlcXVlbmNlc1ZhbHVlID0gQCRlbC5maW5kKFwiI3NlcXVlbmNlc1wiKS52YWwoKS5yZXBsYWNlKC9bXjAtOSxcXG5dL2csXCJcIilcbiAgICBzZXF1ZW5jZXMgPSBzZXF1ZW5jZXNWYWx1ZS5zcGxpdChcIlxcblwiKVxuXG4gICAgIyBwYXJzZSBzdHJpbmdzIHRvIG51bWJlcnMgYW5kIGNvbGxlY3QgZXJyb3JzXG4gICAgZm9yIHNlcXVlbmNlLCBpIGluIHNlcXVlbmNlc1xuXG4gICAgICBzZXF1ZW5jZSA9IHNlcXVlbmNlLnNwbGl0KFwiLFwiKVxuICAgICAgZm9yIGVsZW1lbnQsIGogaW4gc2VxdWVuY2VcbiAgICAgICAgc2VxdWVuY2Vbal0gPSBwYXJzZUludChlbGVtZW50KVxuICAgICAgICByYW5nZUVycm9yID0gdHJ1ZSBpZiBzZXF1ZW5jZVtqXSA8IDAgb3Igc2VxdWVuY2Vbal0gPj0gZWxlbWVudENvdW50XG4gICAgICAgIGVtcHR5RXJyb3IgPSB0cnVlIGlmIGlzTmFOKHNlcXVlbmNlW2pdKVxuXG4gICAgICBzZXF1ZW5jZXNbaV0gPSBzZXF1ZW5jZVxuXG4gICAgICAjIGRldGVjdCBlcnJvcnNcbiAgICAgIHRvb01hbnlFcnJvciA9IHRydWUgaWYgc2VxdWVuY2UubGVuZ3RoID4gZWxlbWVudENvdW50XG4gICAgICB0b29GZXdFcnJvciAgPSB0cnVlIGlmIHNlcXVlbmNlLmxlbmd0aCA8IGVsZW1lbnRDb3VudFxuICAgICAgZG91Ymxlc0Vycm9yID0gdHJ1ZSBpZiBzZXF1ZW5jZS5sZW5ndGggIT0gXy51bmlxKHNlcXVlbmNlKS5sZW5ndGhcblxuICAgICMgc2hvdyBlcnJvcnMgaWYgdGhleSBleGlzdCBhbmQgc2VxdWVuY2VzIGV4aXN0XG4gICAgaWYgbm90IF8uaXNFbXB0eSBfLnJlamVjdCggXy5mbGF0dGVuKHNlcXVlbmNlcyksIChlKSAtPiByZXR1cm4gaXNOYU4oZSkpICMgcmVtb3ZlIHVucGFyc2FibGUgZW1wdGllcywgZG9uJ3QgXy5jb21wYWN0LiB3aWxsIHJlbW92ZSAwc1xuICAgICAgc2VxdWVuY2VFcnJvcnMgPSBbXVxuICAgICAgaWYgZW1wdHlFcnJvciAgIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgc2VxdWVuY2VzIGNvbnRhaW4gZW1wdHkgdmFsdWVzLlwiXG4gICAgICBpZiByYW5nZUVycm9yICAgdGhlbiBzZXF1ZW5jZUVycm9ycy5wdXNoIFwiU29tZSBudW1iZXJzIGRvIG5vdCByZWZlcmVuY2UgYSBlbGVtZW50IGZyb20gdGhlIGxlZ2VuZC5cIlxuICAgICAgaWYgdG9vTWFueUVycm9yIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgc2VxdWVuY2VzIGFyZSBsb25nZXIgdGhhbiB0aGUgdG90YWwgbnVtYmVyIG9mIGFsbCBlbGVtZW50cy5cIlxuICAgICAgaWYgdG9vRmV3RXJyb3IgIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgc2VxdWVuY2VzIGFyZSBzaG9ydGVyIHRoYW4gdGhlIHRvdGFsIG51bWJlciBvZiBhbGwgZWxlbWVudHMuXCJcbiAgICAgIGlmIGRvdWJsZXNFcnJvciB0aGVuIHNlcXVlbmNlRXJyb3JzLnB1c2ggXCJTb21lIHNlcXVlbmNlcyBjb250YWluIGRvdWJsZXMuXCJcblxuICAgICAgaWYgc2VxdWVuY2VFcnJvcnMubGVuZ3RoID09IDBcbiMgaWYgdGhlcmUncyBubyBlcnJvcnMsIGNsZWFuIHVwIHRoZSB0ZXh0YXJlYSBjb250ZW50XG4gICAgICAgIHZhbGlkYXRlZFNlcXVlbmNlcyA9IChzZXF1ZW5jZS5qb2luKFwiLCBcIikgZm9yIHNlcXVlbmNlIGluIHNlcXVlbmNlcykuam9pbihcIlxcblwiKVxuICAgICAgICBAJGVsLmZpbmQoXCIjc2VxdWVuY2VzXCIpLnZhbCh2YWxpZGF0ZWRTZXF1ZW5jZXMpXG4gICAgICBlbHNlICMgaWYgdGhlcmUncyBlcnJvcnMsIHRoZXkgY2FuIHN0aWxsIHNhdmUuIEp1c3Qgc2hvdyBhIHdhcm5pbmdcbiAgICAgICAgYWxlcnQgXCJXYXJuaW5nXFxuXFxuI3tzZXF1ZW5jZUVycm9ycy5qb2luKFwiXFxuXCIpfVwiXG5cbiMgbm90aGluZyByZXNlbWJsaW5nIGEgdmFsaWQgc2VxdWVuY2Ugd2FzIGZvdW5kXG4gICAgZWxzZVxuICAgICAgQCRlbC5maW5kKFwiI3NlcXVlbmNlc1wiKS52YWwoXCJcIikgIyBjbGVhbiB0ZXh0IGFyZWFcblxuICAgIEBtb2RlbC5zZXRcbiAgICAgIHNlcXVlbmNlcyA6IHNlcXVlbmNlc1xuICAgICAgYXJjaGl2ZWQgIDogQCRlbC5maW5kKFwiI2FyY2hpdmVfYnV0dG9ucyBpbnB1dDpjaGVja2VkXCIpLnZhbCgpID09IFwidHJ1ZVwiXG4gICAgICBuYW1lICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl90aXRsZVwiKS52YWwoKVxuICAgICAgZEtleSAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fZF9rZXlcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5fdGl0bGUgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX3RpdGxlXCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuX2xlc3Nvbl90ZXh0ICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9sZXNzb25fdGV4dFwiKS52YWwoKVxuIyAgICAgIGxlc3NvblBsYW5fc3ViamVjdCAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fc3ViamVjdFwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl9zdWJqZWN0ICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9zdWJqZWN0X2J1dHRvbnMgaW5wdXQ6Y2hlY2tlZFwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl9ncmFkZSAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fZ3JhZGVcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5fd2VlayAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fd2Vla1wiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl9kYXkgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX2RheVwiKS52YWwoKVxuIyAgICAgIGxlc3NvblBsYW5faW1hZ2UgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX2ltYWdlXCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuSWQgOiBAbW9kZWwuaWRcbiAgICAgIGFzc2Vzc21lbnRJZCA6IEBtb2RlbC5pZFxuICAgIHJldHVybiB0cnVlXG5cbiAgdG9nZ2xlTmV3RWxlbWVudEZvcm06IChldmVudCkgLT5cbiAgICBAJGVsLmZpbmQoXCIubmV3X2VsZW1lbnRfZm9ybSwgLm5ld19lbGVtZW50X2J1dHRvblwiKS50b2dnbGUoKVxuXG4gICAgQCRlbC5maW5kKFwiI25ld19lbGVtZW50X25hbWVcIikudmFsKFwiXCIpXG4gICAgQCRlbC5maW5kKFwiI2VsZW1lbnRfdHlwZV9zZWxlY3RcIikudmFsKFwibm9uZVwiKVxuXG5cbiAgICBmYWxzZVxuXG4gIHNhdmVOZXdFbGVtZW50OiAoZXZlbnQpID0+XG5cbiAgICBpZiBldmVudC50eXBlICE9IFwiY2xpY2tcIiAmJiBldmVudC53aGljaCAhPSAxM1xuICAgICAgcmV0dXJuIHRydWVcblxuICAgICMgaWYgbm8gZWxlbWVudCB0eXBlIHNlbGVjdGVkLCBzaG93IGVycm9yXG4gICAgaWYgQCRlbC5maW5kKFwiI2VsZW1lbnRfdHlwZV9zZWxlY3Qgb3B0aW9uOnNlbGVjdGVkXCIpLnZhbCgpID09IFwibm9uZVwiXG4gICAgICBVdGlscy5taWRBbGVydCBcIlBsZWFzZSBzZWxlY3QgYW4gZWxlbWVudCB0eXBlXCJcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgIyBnZW5lcmFsIHRlbXBsYXRlXG4gICAgbmV3QXR0cmlidXRlcyA9IFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwiZWxlbWVudFwiKVxuXG4gICAgIyBwcm90b3R5cGUgdGVtcGxhdGVcbiAgICBwcm90b3R5cGVUZW1wbGF0ZSA9IFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwiZWxlbWVudFR5cGVzXCIpW0AkZWwuZmluZChcIiNlbGVtZW50X3R5cGVfc2VsZWN0XCIpLnZhbCgpXVxuXG4gICAgIyBiaXQgbW9yZSBzcGVjaWZpYyB0ZW1wbGF0ZVxuICAgIHVzZVR5cGVUZW1wbGF0ZSA9IFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwiZWxlbWVudFwiKTtcblxuICAgIGZpbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbGVzXCIpLmZpbGVzWzBdXG4gICAgaWYgdHlwZW9mIGZpbGUgIT0gJ3VuZGVmaW5lZCdcbiAgICAgIGZkID0gbmV3IEZvcm1EYXRhKClcbiAgICAgIGZkLmFwcGVuZChcImZpbGVcIiwgZmlsZSlcbiAgICAgIGZkLmFwcGVuZChcImdyb3VwTmFtZVwiLCBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiZ3JvdXBOYW1lXCIpKVxuXG4gICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIG5ld0F0dHJpYnV0ZXMsIHByb3RvdHlwZVRlbXBsYXRlXG4gICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIG5ld0F0dHJpYnV0ZXMsIHVzZVR5cGVUZW1wbGF0ZVxuICAgIG5ld0F0dHJpYnV0ZXMgPSAkLmV4dGVuZCBuZXdBdHRyaWJ1dGVzLFxuICAgICAgbmFtZSAgICAgICAgIDogQCRlbC5maW5kKFwiI25ld19lbGVtZW50X25hbWVcIikudmFsKClcbiAgICAgIGVsZW1lbnQgICAgICAgICA6IEAkZWwuZmluZChcIiNlbGVtZW50X3R5cGVfc2VsZWN0XCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuSWQgOiBAbW9kZWwuaWRcbiAgICAgIGFzc2Vzc21lbnRJZCA6IEBtb2RlbC5pZFxuICAgICAgb3JkZXIgICAgICAgIDogQG1vZGVsLmVsZW1lbnRzLmxlbmd0aFxuXG4gICAgaWYgQ0tFRElUT1IuaW5zdGFuY2VzLmh0bWwuZ2V0RGF0YSgpICE9ICd1bmRlZmluZWQnXG4gICAgICBAbW9kZWwuc2V0XG4gICAgICAgIFwiaHRtbFwiIDogQ0tFRElUT1IuaW5zdGFuY2VzLmh0bWwuZ2V0RGF0YSgpXG4gICAgICBuZXdBdHRyaWJ1dGVzID0gJC5leHRlbmQgbmV3QXR0cmlidXRlcyxcbiAgICAgICAgaHRtbDogQG1vZGVsLmdldCgnaHRtbCcpXG5cbiAgICBpZiB0eXBlb2YgZmlsZSAhPSAndW5kZWZpbmVkJ1xuICAgICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIG5ld0F0dHJpYnV0ZXMsXG4gICAgICAgIGZpbGVUeXBlICA6IGZpbGUudHlwZVxuICAgICAgICBmaWxlTmFtZSAgOiBmaWxlLm5hbWVcbiAgICAgICAgZmlsZVNpemUgIDogZmlsZS5zaXplXG5cbiAgICBpZiB0eXBlb2YgZmlsZSA9PSAndW5kZWZpbmVkJ1xuICAgICAgb3B0aW9ucyA9XG4gICAgICAgIHN1Y2Nlc3M6IChtb2RlbCwgcmVzcCkgPT5cbiAgICAgICAgICBjb25zb2xlLmxvZyhcIk1vZGVsIGNyZWF0ZWQuXCIpXG4gICAgICAgIGVycm9yOiAobW9kZWwsIGVycikgPT5cbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiArIEpTT04uc3RyaW5naWZ5KGVycikgKyBcIiBNb2RlbDogXCIgKyBKU09OLnN0cmluZ2lmeShtb2RlbCkpXG4gICAgZWxzZVxuICAgICAgb3B0aW9ucyA9XG4gICAgICAgIHN1Y2Nlc3M6IChtb2RlbCwgcmVzcCkgPT5cbiAgIyAgICAgICAgY29uc29sZS5sb2coXCJjcmVhdGVkOiBcIiArIEpTT04uc3RyaW5naWZ5KHJlc3ApICsgXCIgTW9kZWw6IFwiICsgSlNPTi5zdHJpbmdpZnkobW9kZWwpKVxuICAgICAgICAgIHVybCA9IFwiI3tUYW5nZXJpbmUuY29uZmlnLmdldCgncm9iYmVydCcpfS9maWxlc1wiXG4gICAgICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgeGhyLnVwbG9hZC5vbmVycm9yID0gKGUpID0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yIFVwbG9hZGluZyBpbWFnZTogXCIgKyBKU09OLnN0cmluZ2lmeShlKSlcbiAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT5cbiAgICAgICAgICAgIGlmIHhoci5yZWFkeVN0YXRlID09IDRcbiAgICAgICAgICAgICAgaWYgeGhyLnN0YXR1cyA9PSAyMDBcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh4aHIucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJUaGVyZSB3YXMgYW4gZXJyb3IgdXBsb2FkaW5nIHRoZSBmaWxlOiBcIiArIHhoci5yZXNwb25zZVRleHQgKyBcIiBTdGF0dXM6IFwiICsgeGhyLnN0YXR1cylcbiMgICAgICAgICAgICAgICAgYWxlcnQoXCJUaGVyZSB3YXMgYW4gZXJyb3IgdXBsb2FkaW5nIHRoZSBmaWxlOiBcIiArIHhoci5yZXNwb25zZVRleHQgKyBcIiBTdGF0dXM6IFwiICsgeGhyLnN0YXR1cylcbiAgICAgICAgICB4aHIub25lcnJvciA9ICAoZXJyKSA9PlxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJUaGVyZSB3YXMgYW4gZXJyb3IgdXBsb2FkaW5nIHRoZSBmaWxlOiBcIiArIGVycilcbiMgICAgICAgICAgICBhbGVydChcIlRoZXJlIHdhcyBhbiBlcnJvciB1cGxvYWRpbmcgdGhlIGZpbGU6IFwiICsgeGhyLnJlc3BvbnNlVGV4dCArIFwiIFN0YXR1czogXCIgKyB4aHIuc3RhdHVzKVxuXG4gICAgICAgICAgIyBkZWZpbmUgb3VyIGZpbmlzaCBmblxuICAgICAgICAgIGxvYWRlZCA9ICgpLT5cbiAgIyAgICAgICAgICBjb25zb2xlLmxvZygnZmluaXNoZWQgdXBsb2FkaW5nJylcbiAgICAgICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lciAnbG9hZCcsIGxvYWRlZCwgZmFsc2VcbiMgICAgICAgICAgcHJvZ3Jlc3NCYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdwcm9ncmVzcycpO1xuIyAgICAgICAgICB4aHIudXBsb2FkLm9ucHJvZ3Jlc3MgPSAoZSkgPT5cbiMgICAgICAgICAgICBpZiBlLmxlbmd0aENvbXB1dGFibGVcbiMgICAgICAgICAgICAgIHByb2dyZXNzQmFyLnZhbHVlID0gKGUubG9hZGVkIC8gZS50b3RhbCkgKiAxMDA7XG4jICAgICAgICAgICAgICBwcm9ncmVzc0Jhci50ZXh0Q29udGVudCA9IHByb2dyZXNzQmFyLnZhbHVlO1xuIyAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJwcm9ncmVzczogXCIgKyBwcm9ncmVzc0Jhci52YWx1ZSlcbiAgICAgICAgICB4aHIub3BlbignUE9TVCcsIHVybCwgdHJ1ZSk7XG4gICAgICAgICAgeGhyLnNlbmQoZmQpO1xuICAgICAgICBlcnJvcjogKG1vZGVsLCBlcnIpID0+XG4gICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIgKyBKU09OLnN0cmluZ2lmeShlcnIpICsgXCIgTW9kZWw6IFwiICsgSlNPTi5zdHJpbmdpZnkobW9kZWwpKVxuXG4gICAgbmV3RWxlbWVudCA9IEBtb2RlbC5lbGVtZW50cy5jcmVhdGUgbmV3QXR0cmlidXRlcywgb3B0aW9uc1xuIyAgICBuZXdFbGVtZW50Lm9uKCdwcm9ncmVzcycsIChldnQpIC0+XG4jICAgICAgY29uc29sZS5sb2coXCJMb2dnaW5nIG5ld0VsZW1lbnQ6IFwiICsgZXZ0KVxuIyAgICApXG5cbiAgICBAdG9nZ2xlTmV3RWxlbWVudEZvcm0oKVxuICAgICQoXCIjZmlsZXNcIikudmFsKCcnKTtcbiAgICBDS0VESVRPUi5pbnN0YW5jZXNbJ2h0bWwnXS5zZXREYXRhKFwiXCIpO1xuICAgIHJldHVybiBmYWxzZVxuXG4gIHJlbmRlcjogPT5cbiAgICBsZXNzb25QbGFuX3RpdGxlICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxlc3NvblBsYW5fdGl0bGVcIilcbiMgICAgbGVzc29uUGxhbl9sZXNzb25fdGV4dCAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX2xlc3Nvbl90ZXh0XCIpXG4gICAgbGVzc29uUGxhbl9zdWJqZWN0ICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxlc3NvblBsYW5fc3ViamVjdFwiKVxuICAgIGxlc3NvblBsYW5fZ3JhZGUgICAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwibGVzc29uUGxhbl9ncmFkZVwiKVxuICAgIGxlc3NvblBsYW5fd2VlayAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX3dlZWtcIilcbiAgICBsZXNzb25QbGFuX2RheSAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX2RheVwiKVxuICAgIHNlcXVlbmNlcyA9IFwiXCJcbiAgICBpZiBAbW9kZWwuaGFzKFwic2VxdWVuY2VzXCIpXG4gICAgICBzZXF1ZW5jZXMgPSBAbW9kZWwuZ2V0KFwic2VxdWVuY2VzXCIpXG4gICAgICBzZXF1ZW5jZXMgPSBzZXF1ZW5jZXMuam9pbihcIlxcblwiKVxuXG4gICAgICBpZiBfLmlzQXJyYXkoc2VxdWVuY2VzKVxuICAgICAgICBmb3Igc2VxdWVuY2VzLCBpIGluIHNlcXVlbmNlc1xuICAgICAgICAgIHNlcXVlbmNlc1tpXSA9IHNlcXVlbmNlcy5qb2luKFwiLCBcIilcblxuICAgIGVsZW1lbnRMZWdlbmQgPSBAdXBkYXRlRWxlbWVudExlZ2VuZCgpXG5cbiAgICBhcmNoID0gQG1vZGVsLmdldCgnYXJjaGl2ZWQnKVxuICAgIGFyY2hpdmVDaGVja2VkICAgID0gaWYgKGFyY2ggPT0gdHJ1ZSBvciBhcmNoID09ICd0cnVlJykgdGhlbiBcImNoZWNrZWRcIiBlbHNlIFwiXCJcbiAgICBub3RBcmNoaXZlQ2hlY2tlZCA9IGlmIGFyY2hpdmVDaGVja2VkIHRoZW4gXCJcIiBlbHNlIFwiY2hlY2tlZFwiXG5cbiAgICBsZXNzb25QbGFuX3N1YmplY3RfQWZhYW5fT3JvbW8gICAgPSBpZiAobGVzc29uUGxhbl9zdWJqZWN0ID09ICcxJykgdGhlbiBcImNoZWNrZWRcIiBlbHNlIFwiXCJcbiAgICBsZXNzb25QbGFuX3N1YmplY3RfQWZfU29tYWxpID0gaWYgKGxlc3NvblBsYW5fc3ViamVjdCA9PSAnMicpIHRoZW4gXCJjaGVja2VkXCIgZWxzZSBcIlwiXG4gICAgbGVzc29uUGxhbl9zdWJqZWN0X0FtaGFyaWMgPSBpZiAobGVzc29uUGxhbl9zdWJqZWN0ID09ICczJykgdGhlbiBcImNoZWNrZWRcIiBlbHNlIFwiXCJcbiAgICBsZXNzb25QbGFuX3N1YmplY3RfSGFkaXl5aXNhID0gaWYgKGxlc3NvblBsYW5fc3ViamVjdCA9PSAnNCcpIHRoZW4gXCJjaGVja2VkXCIgZWxzZSBcIlwiXG4gICAgbGVzc29uUGxhbl9zdWJqZWN0X1NpZGFhbXVfQWZvbyA9IGlmIChsZXNzb25QbGFuX3N1YmplY3QgPT0gJzUnKSB0aGVuIFwiY2hlY2tlZFwiIGVsc2UgXCJcIlxuICAgIGxlc3NvblBsYW5fc3ViamVjdF9UaWdyaW55YSA9IGlmIChsZXNzb25QbGFuX3N1YmplY3QgPT0gJzYnKSB0aGVuIFwiY2hlY2tlZFwiIGVsc2UgXCJcIlxuICAgIGxlc3NvblBsYW5fc3ViamVjdF9Xb2xheXR0YXR0byA9IGlmIChsZXNzb25QbGFuX3N1YmplY3QgPT0gJzcnKSB0aGVuIFwiY2hlY2tlZFwiIGVsc2UgXCJcIlxuXG5cbiAgICAjIGxpc3Qgb2YgXCJ0ZW1wbGF0ZXNcIlxuICAgIGVsZW1lbnRUeXBlU2VsZWN0ID0gXCI8c2VsZWN0IGlkPSdlbGVtZW50X3R5cGVfc2VsZWN0Jz5cbiAgICAgIDxvcHRpb24gdmFsdWU9J25vbmUnIGRpc2FibGVkPSdkaXNhYmxlZCcgc2VsZWN0ZWQ9J3NlbGVjdGVkJz5QbGVhc2Ugc2VsZWN0IGEgZWxlbWVudCB0eXBlPC9vcHRpb24+XCJcbiAgICBmb3Iga2V5LCB2YWx1ZSBvZiBUYW5nZXJpbmUudGVtcGxhdGVzLmdldChcImVsZW1lbnRUeXBlc1wiKVxuIyAgICAgIGVsZW1lbnRUeXBlU2VsZWN0ICs9IFwiPG9wdGdyb3VwIGxhYmVsPScje2tleS5odW1hbml6ZSgpfSc+XCJcbiMgICAgICBmb3Igc3ViS2V5LCBzdWJWYWx1ZSBvZiB2YWx1ZVxuICAgICAgICBlbGVtZW50VHlwZVNlbGVjdCArPSBcIjxvcHRpb24gdmFsdWU9JyN7a2V5fScgZGF0YS10ZW1wbGF0ZT0nI3trZXl9Jz4je2tleS5odW1hbml6ZSgpfTwvb3B0aW9uPlwiXG4jICAgICAgZWxlbWVudFR5cGVTZWxlY3QgKz0gXCI8L29wdGdyb3VwPlwiXG4gICAgZWxlbWVudFR5cGVTZWxlY3QgKz0gXCI8L3NlbGVjdD5cIlxuICAgIGh0bWwgPSBAbW9kZWwuZ2V0KFwiaHRtbFwiKSB8fCBcIlwiXG5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICAgIDxidXR0b24gY2xhc3M9J2JhY2sgbmF2aWdhdGlvbic+QmFjazwvYnV0dG9uPlxuICAgICAgICA8aDE+TGVzc29uUGxhbiBCdWlsZGVyPC9oMT5cbiAgICAgIDxkaXYgaWQ9J2Jhc2ljJz5cbiAgICAgIFxuXG4gICAgICAgIDxsYWJlbCBmb3I9J2xlc3NvblBsYW5fZF9rZXknIHRpdGxlPSdUaGlzIGtleSBpcyB1c2VkIHRvIGltcG9ydCB0aGUgbGVzc29uUGxhbiBmcm9tIGEgdGFibGV0Lic+RG93bmxvYWQgS2V5PC9sYWJlbD48YnI+XG4gICAgICAgIDxkaXYgY2xhc3M9J2luZm9fYm94Jz4je0Btb2RlbC5pZC5zdWJzdHIoLTUsNSl9PC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGxhYmVsIHRpdGxlPSdPbmx5IGFjdGl2ZSBsZXNzb25QbGFucyB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgbWFpbiBsZXNzb25QbGFuIGxpc3QuJz5TdGF0dXM8L2xhYmVsPjxicj5cbiAgICAgIDxkaXYgaWQ9J2FyY2hpdmVfYnV0dG9ucycgY2xhc3M9J2J1dHRvbnNldCc+XG4gICAgICAgIDxpbnB1dCB0eXBlPSdyYWRpbycgaWQ9J2FyY2hpdmVfZmFsc2UnIG5hbWU9J2FyY2hpdmUnIHZhbHVlPSdmYWxzZScgI3tub3RBcmNoaXZlQ2hlY2tlZH0+PGxhYmVsIGZvcj0nYXJjaGl2ZV9mYWxzZSc+QWN0aXZlPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IHR5cGU9J3JhZGlvJyBpZD0nYXJjaGl2ZV90cnVlJyAgbmFtZT0nYXJjaGl2ZScgdmFsdWU9J3RydWUnICAje2FyY2hpdmVDaGVja2VkfT48bGFiZWwgZm9yPSdhcmNoaXZlX3RydWUnPkFyY2hpdmVkPC9sYWJlbD5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2xlc3NvblBsYW5fdGl0bGUnPkxlc3NvblBsYW4gVGl0bGU8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgaWQ9J2xlc3NvblBsYW5fdGl0bGUnIHZhbHVlPScje2xlc3NvblBsYW5fdGl0bGV9Jz5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8bGFiZWwgdGl0bGU9J1lvdSBtdXN0IGNob29zZSBvbmUgb2YgdGhlc2Ugc3ViamVjdHMuJyBmb3I9J2xlc3NvblBsYW5fc3ViamVjdF9idXR0b25zJz5MZXNzb25QbGFuIHN1YmplY3Q8L2xhYmVsPjxicj5cbiAgICAgIDxkaXYgaWQ9J2xlc3NvblBsYW5fc3ViamVjdF9idXR0b25zJyBjbGFzcz0nYnV0dG9uc2V0Jz5cbiAgICAgICAgPGlucHV0IHR5cGU9J3JhZGlvJyBpZD0nbGVzc29uUGxhbl9zdWJqZWN0X0FmYWFuX09yb21vJyBuYW1lPSdsZXNzb25QbGFuX3N1YmplY3QnIHZhbHVlPScxJyAje2xlc3NvblBsYW5fc3ViamVjdF9BZmFhbl9Pcm9tb30+PGxhYmVsIGZvcj0nbGVzc29uUGxhbl9zdWJqZWN0X0FmYWFuX09yb21vJz5BZmFhbiBPcm9tbzwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCB0eXBlPSdyYWRpbycgaWQ9J2xlc3NvblBsYW5fc3ViamVjdF9BZl9Tb21hbGknICBuYW1lPSdsZXNzb25QbGFuX3N1YmplY3QnIHZhbHVlPScyJyAgI3tsZXNzb25QbGFuX3N1YmplY3RfQWZfU29tYWxpfT48bGFiZWwgZm9yPSdsZXNzb25QbGFuX3N1YmplY3RfQWZfU29tYWxpJz5BZi1Tb21hbGk8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgdHlwZT0ncmFkaW8nIGlkPSdsZXNzb25QbGFuX3N1YmplY3RfQW1oYXJpYycgIG5hbWU9J2xlc3NvblBsYW5fc3ViamVjdCcgdmFsdWU9JzMnICAje2xlc3NvblBsYW5fc3ViamVjdF9BbWhhcmljfT48bGFiZWwgZm9yPSdsZXNzb25QbGFuX3N1YmplY3RfQW1oYXJpYyc+QW1oYXJpYzwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCB0eXBlPSdyYWRpbycgaWQ9J2xlc3NvblBsYW5fc3ViamVjdF9IYWRpeXlpc2EnICBuYW1lPSdsZXNzb25QbGFuX3N1YmplY3QnIHZhbHVlPSc0JyAgI3tsZXNzb25QbGFuX3N1YmplY3RfSGFkaXl5aXNhfT48bGFiZWwgZm9yPSdsZXNzb25QbGFuX3N1YmplY3RfSGFkaXl5aXNhJz5IYWRpeXlpc2E8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgdHlwZT0ncmFkaW8nIGlkPSdsZXNzb25QbGFuX3N1YmplY3RfU2lkYWFtdV9BZm9vJyAgbmFtZT0nbGVzc29uUGxhbl9zdWJqZWN0JyB2YWx1ZT0nNScgICN7bGVzc29uUGxhbl9zdWJqZWN0X1NpZGFhbXVfQWZvb30+PGxhYmVsIGZvcj0nbGVzc29uUGxhbl9zdWJqZWN0X1NpZGFhbXVfQWZvbyc+U2lkYWFtdSBBZm9vPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IHR5cGU9J3JhZGlvJyBpZD0nbGVzc29uUGxhbl9zdWJqZWN0X1RpZ3JpbnlhJyAgbmFtZT0nbGVzc29uUGxhbl9zdWJqZWN0JyB2YWx1ZT0nNicgICN7bGVzc29uUGxhbl9zdWJqZWN0X1RpZ3JpbnlhfT48bGFiZWwgZm9yPSdsZXNzb25QbGFuX3N1YmplY3RfVGlncmlueWEnPlRpZ3JpbnlhPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IHR5cGU9J3JhZGlvJyBpZD0nbGVzc29uUGxhbl9zdWJqZWN0X1dvbGF5dHRhdHRvJyAgbmFtZT0nbGVzc29uUGxhbl9zdWJqZWN0JyB2YWx1ZT0nNycgICN7bGVzc29uUGxhbl9zdWJqZWN0X1dvbGF5dHRhdHRvfT48bGFiZWwgZm9yPSdsZXNzb25QbGFuX3N1YmplY3RfV29sYXl0dGF0dG8nPldvbGF5dHRhdHRvPC9sYWJlbD5cbiAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2xlc3NvblBsYW5fZ3JhZGUnPkxlc3NvblBsYW4gR3JhZGU8L2xhYmVsPlxuICAgICAgPGlucHV0IGlkPSdsZXNzb25QbGFuX2dyYWRlJyB2YWx1ZT0nI3tsZXNzb25QbGFuX2dyYWRlfSc+XG4gICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX3dlZWsnPkxlc3NvblBsYW4gV2VlazwvbGFiZWw+XG4gICAgICA8aW5wdXQgaWQ9J2xlc3NvblBsYW5fd2VlaycgdmFsdWU9JyN7bGVzc29uUGxhbl93ZWVrfSc+XG4gICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX2RheSc+TGVzc29uUGxhbiBEYXk8L2xhYmVsPlxuICAgICAgPGlucHV0IGlkPSdsZXNzb25QbGFuX2RheScgdmFsdWU9JyN7bGVzc29uUGxhbl9kYXl9Jz5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8aDI+RWxlbWVudHM8L2gyPlxuICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuPCEtLVxuICAgICAgICA8cHJvZ3Jlc3MgbWluPScwJyBtYXg9JzEwMCcgdmFsdWU9JzAnPjwvcHJvZ3Jlc3M+XG4tLT5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgPHVsIGlkPSdlbGVtZW50X2xpc3QnPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmV3X2VsZW1lbnRfYnV0dG9uIGNvbW1hbmQnPkFkZCBFbGVtZW50PC9idXR0b24+XG4gICAgICAgIDxkaXYgY2xhc3M9J25ld19lbGVtZW50X2Zvcm0gY29uZmlybWF0aW9uJz5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgICAgICA8aDI+TmV3IEVsZW1lbnQ8L2gyPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0nZWxlbWVudF90eXBlX3NlbGVjdCc+VHlwZTwvbGFiZWw+PGJyPlxuICAgICAgICAgICAgI3tlbGVtZW50VHlwZVNlbGVjdH08YnI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSduZXdfZWxlbWVudF9uYW1lJz5OYW1lPC9sYWJlbD48YnI+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT0ndGV4dCcgaWQ9J25ld19lbGVtZW50X25hbWUnPlxuICAgICAgICAgICAgPGlucHV0IHR5cGU9J2ZpbGUnIG5hbWU9J2ZpbGVzJyBpZD0nZmlsZXMnIG11bHRpcGxlPSdtdWx0aXBsZScgLz5cbiAgICAgICAgICAgIDxkaXYgaWQ9J2h0bWxfZGl2JyBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgICAgICA8bGFiZWwgZm9yPSdodG1sJz5IdG1sPC9sYWJlbD5cbiAgICAgICAgICAgICAgPHRleHRhcmVhIGlkPSdodG1sJz4je2h0bWx9PC90ZXh0YXJlYT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmV3X2VsZW1lbnRfc2F2ZSBjb21tYW5kJz5BZGQ8L2J1dHRvbj4gPGJ1dHRvbiBjbGFzcz0nbmV3X2VsZW1lbnRfY2FuY2VsIGNvbW1hbmQnPkNhbmNlbDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGgyPjwvaDI+XG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZScgc3R5bGU9J2Rpc3BsYXk6IG5vbmU7Jz4gXG4gICAgICAgIDxsYWJlbCBmb3I9J3NlcXVlbmNlcycgdGl0bGU9J1RoaXMgaXMgYSBsaXN0IG9mIGFjY2VwdGFibGUgb3JkZXJzIG9mIGVsZW1lbnRzLCB3aGljaCB3aWxsIGJlIHJhbmRvbWx5IHNlbGVjdGVkIGVhY2ggdGltZSBhbiBsZXNzb25QbGFuIGlzIHJ1bi4gRWxlbWVudCBpbmRpY2llcyBhcmUgc2VwYXJhdGVkIGJ5IGNvbW1hcywgbmV3IGxpbmVzIHNlcGFyYXRlIHNlcXVlbmNlcy4gJz5SYW5kb20gU2VxdWVuY2VzPC9sYWJlbD5cbiAgICAgICAgPGRpdiBpZD0nZWxlbWVudF9sZWdlbmQnPiN7ZWxlbWVudExlZ2VuZH08L2Rpdj5cbiAgICAgICAgPHRleHRhcmVhIGlkPSdzZXF1ZW5jZXMnPiN7c2VxdWVuY2VzfTwvdGV4dGFyZWE+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxidXR0b24gY2xhc3M9J3NhdmUgY29tbWFuZCc+U2F2ZTwvYnV0dG9uPlxuICAgICAgXCJcblxuICAgICMgcmVuZGVyIG5ldyBlbGVtZW50IHZpZXdzXG4gICAgQGVsZW1lbnRMaXN0RWRpdFZpZXcuc2V0RWxlbWVudChAJGVsLmZpbmQoXCIjZWxlbWVudF9saXN0XCIpKVxuICAgIEBlbGVtZW50TGlzdEVkaXRWaWV3LnJlbmRlcigpXG5cbiAgICAjIG1ha2UgaXQgc29ydGFibGVcbiAgICBAJGVsLmZpbmQoXCIjZWxlbWVudF9saXN0XCIpLnNvcnRhYmxlXG4gICAgICBoYW5kbGUgOiAnLnNvcnRhYmxlX2hhbmRsZSdcbiAgICAgIHN0YXJ0OiAoZXZlbnQsIHVpKSAtPiB1aS5pdGVtLmFkZENsYXNzIFwiZHJhZ19zaGFkb3dcIlxuICAgICAgc3RvcDogIChldmVudCwgdWkpIC0+IHVpLml0ZW0ucmVtb3ZlQ2xhc3MgXCJkcmFnX3NoYWRvd1wiXG4gICAgICB1cGRhdGUgOiAoZXZlbnQsIHVpKSA9PlxuICAgICAgICBmb3IgaWQsIGkgaW4gKCQobGkpLmF0dHIoXCJkYXRhLWlkXCIpIGZvciBsaSBpbiBAJGVsLmZpbmQoXCIjZWxlbWVudF9saXN0IGxpXCIpKVxuICAgICAgICAgIEBtb2RlbC5lbGVtZW50cy5nZXQoaWQpLnNldCh7XCJvcmRlclwiOml9LHtzaWxlbnQ6dHJ1ZX0pLnNhdmUobnVsbCx7c2lsZW50OnRydWV9KVxuICAgICAgICBAbW9kZWwuZWxlbWVudHMuc29ydCgpXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuXG4gIHVwZGF0ZUVsZW1lbnRMZWdlbmQ6ID0+XG4gICAgZWxlbWVudExlZ2VuZCA9IFwiXCJcbiAgICBAbW9kZWwuZWxlbWVudHMuZWFjaCAoZWxlbWVudCwgaSkgLT5cbiAgICAgIGVsZW1lbnRMZWdlbmQgKz0gXCI8ZGl2IGNsYXNzPSdzbWFsbF9ncmV5Jz4je2l9IC0gI3tlbGVtZW50LmdldChcIm5hbWVcIil9PC9kaXY+PGJyPlwiXG4gICAgJGVsZW1lbnRXcmFwcGVyID0gQCRlbC5maW5kKFwiI2VsZW1lbnRfbGVnZW5kXCIpXG4gICAgJGVsZW1lbnRXcmFwcGVyLmh0bWwoZWxlbWVudExlZ2VuZCkgaWYgJGVsZW1lbnRXcmFwcGVyLmxlbmd0aCAhPSAwXG4gICAgcmV0dXJuIGVsZW1lbnRMZWdlbmRcblxuICBvbkNsb3NlOiAtPlxuICAgIEBlbGVtZW50TGlzdEVkaXRWaWV3LmNsb3NlKClcbiAgXG4gIGFmdGVyUmVuZGVyOiAtPlxuICAgIEBlbGVtZW50RWRpdG9yPy5hZnRlclJlbmRlcj8oKVxuICAgIENLRURJVE9SLnJlcGxhY2UoXCJodG1sXCIpXG4gICAgJCgnI2ZpbGVzJykuaGlkZSgpXG4gICAgJCgnI2h0bWxfZGl2JykuaGlkZSgpIl19
