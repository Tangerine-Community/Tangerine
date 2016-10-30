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
    var elementFilename, extension, fd, file, fileName, fileNameArr, finalLessonPlanTitle, finalName, lessonPlanTitle, name, newAttributes, newElement, numElements, options, prototypeTemplate, sanitizedName, timestamp, type, useTypeTemplate;
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
    name = this.$el.find("#new_element_name").val();
    type = this.$el.find("#element_type_select").val();
    file = document.getElementById("files").files[0];
    if (typeof file !== 'undefined') {
      fileName = file.name;
      fileNameArr = file.name.split('.');
      extension = fileNameArr.pop();
    }
    if (type === "media") {
      numElements = this.model.elements.length;
      sanitizedName = Sanitize(name);
      lessonPlanTitle = Sanitize(this.model.get("lessonPlan_title"));
      if (sanitizedName !== "") {
        finalName = "_" + sanitizedName;
      } else {
        finalName = "";
      }
      if (lessonPlanTitle !== "") {
        finalLessonPlanTitle = lessonPlanTitle;
      } else {
        finalLessonPlanTitle = "LP";
      }
      timestamp = (new Date()).getTime();
      elementFilename = finalLessonPlanTitle + "_" + type + finalName + "_" + numElements + "_" + timestamp + "." + extension;
      console.log("elementFilename: " + elementFilename);
    }
    if (typeof file !== 'undefined') {
      fd = new FormData();
      fd.append("file", file);
      fd.append("groupName", Tangerine.settings.get("groupName"));
      fd.append("elementFilename", elementFilename);
    }
    newAttributes = $.extend(newAttributes, prototypeTemplate);
    newAttributes = $.extend(newAttributes, useTypeTemplate);
    newAttributes = $.extend(newAttributes, {
      name: name,
      element: type,
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
        fileSize: file.size,
        elementFilename: elementFilename
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlc3NvblBsYW4vTGVzc29uUGxhbkVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGtCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7OytCQUVKLFNBQUEsR0FBWTs7K0JBRVosTUFBQSxHQUNFO0lBQUEsNkJBQUEsRUFBaUMsWUFBakM7SUFDQSw4QkFBQSxFQUFpQyxNQURqQztJQUVBLGFBQUEsRUFBaUMsUUFGakM7SUFHQSwyQkFBQSxFQUFpQyxzQkFIakM7SUFJQSwyQkFBQSxFQUFpQyxzQkFKakM7SUFNQSw0QkFBQSxFQUFpQyxnQkFOakM7SUFPQSx5QkFBQSxFQUFpQyxnQkFQakM7SUFTQSxxQkFBQSxFQUFpQyxNQVRqQztJQVVBLGFBQUEsRUFBaUMsTUFWakM7OzsrQkFZRixVQUFBLEdBQVksU0FBQyxPQUFEO0lBQ1YsSUFBQyxDQUFBLEtBQUQsR0FBUyxPQUFPLENBQUM7SUFDakIsSUFBQyxDQUFBLG1CQUFELEdBQTJCLElBQUEsbUJBQUEsQ0FDekI7TUFBQSxZQUFBLEVBQWUsSUFBQyxDQUFBLEtBQWhCO01BQ0EsWUFBQSxFQUFlLElBQUMsQ0FBQSxLQURoQjtLQUR5QjtJQUkzQixJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFoQixDQUFtQixlQUFuQixFQUFvQyxJQUFDLENBQUEsbUJBQW1CLENBQUMsTUFBekQ7V0FDQSxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFoQixDQUFtQixLQUFuQixFQUEwQixJQUFDLENBQUEsbUJBQTNCO0VBUFU7OytCQVNaLFVBQUEsR0FBWSxTQUFBO0FBQ1YsUUFBQTtJQUFBLEtBQUEsR0FBUSxDQUFBLENBQUUsc0JBQUYsQ0FBeUIsQ0FBQyxHQUExQixDQUFBO0lBQ1IsSUFBRyxLQUFBLEtBQVMsT0FBWjtNQUNFLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxJQUFaLENBQUE7TUFDQSxDQUFBLENBQUUsV0FBRixDQUFjLENBQUMsSUFBZixD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SUFBQyxDQUFBLG1CQUFtQixDQUFDLEtBQXJCLENBQUE7RUFETzs7K0JBR1QsV0FBQSxHQUFhLFNBQUE7QUFDWCxRQUFBOzs7V0FBYyxDQUFFOzs7SUFDaEIsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsTUFBakI7SUFDQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsSUFBWixDQUFBO1dBQ0EsQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLElBQWYsQ0FBQTtFQUpXOzs7O0dBMVlrQixRQUFRLENBQUMiLCJmaWxlIjoibGVzc29uUGxhbi9MZXNzb25QbGFuRWRpdFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBMZXNzb25QbGFuRWRpdFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogJ2xlc3NvblBsYW5fZWRpdF92aWV3J1xuXG4gIGV2ZW50cyA6XG4gICAgJ2NoYW5nZSAjZWxlbWVudF90eXBlX3NlbGVjdCcgIDogJ2FkZEVsZW1lbnQnXG4gICAgJ2NsaWNrICNhcmNoaXZlX2J1dHRvbnMgaW5wdXQnIDogJ3NhdmUnXG4gICAgJ2NsaWNrIC5iYWNrJyAgICAgICAgICAgICAgICAgIDogJ2dvQmFjaydcbiAgICAnY2xpY2sgLm5ld19lbGVtZW50X2J1dHRvbicgICAgOiAndG9nZ2xlTmV3RWxlbWVudEZvcm0nXG4gICAgJ2NsaWNrIC5uZXdfZWxlbWVudF9jYW5jZWwnICAgIDogJ3RvZ2dsZU5ld0VsZW1lbnRGb3JtJ1xuXG4gICAgJ2tleXByZXNzICNuZXdfZWxlbWVudF9uYW1lJyAgIDogJ3NhdmVOZXdFbGVtZW50J1xuICAgICdjbGljayAubmV3X2VsZW1lbnRfc2F2ZScgICAgICA6ICdzYXZlTmV3RWxlbWVudCdcblxuICAgICdjaGFuZ2UgI2Jhc2ljIGlucHV0JyAgICAgICAgICA6ICdzYXZlJ1xuICAgICdjbGljayAuc2F2ZScgICAgICAgICAgICAgICAgICA6ICdzYXZlJ1xuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEBtb2RlbCA9IG9wdGlvbnMubW9kZWxcbiAgICBAZWxlbWVudExpc3RFZGl0VmlldyA9IG5ldyBFbGVtZW50TGlzdEVkaXRWaWV3XG4gICAgICBcImxlc3NvblBsYW5cIiA6IEBtb2RlbFxuICAgICAgXCJhc3Nlc3NtZW50XCIgOiBAbW9kZWxcblxuICAgIEBtb2RlbC5lbGVtZW50cy5vbiBcImNoYW5nZSByZW1vdmVcIiwgQGVsZW1lbnRMaXN0RWRpdFZpZXcucmVuZGVyXG4gICAgQG1vZGVsLmVsZW1lbnRzLm9uIFwiYWxsXCIsIEB1cGRhdGVFbGVtZW50TGVnZW5kXG5cbiAgYWRkRWxlbWVudDogKCkgLT5cbiAgICB2YWx1ZSA9ICQoJyNlbGVtZW50X3R5cGVfc2VsZWN0JykudmFsKClcbiAgICBpZiB2YWx1ZSA9PSAnbWVkaWEnICBcbiAgICAgICQoJyNmaWxlcycpLnNob3coKVxuICAgICAgJCgnI2h0bWxfZGl2JykuaGlkZSgpXG4gICAgaWYgdmFsdWUgPT0gJ2h0bWwnIFxuICAgICAgJCgnI2h0bWxfZGl2Jykuc2hvdygpXG4gICAgICAkKCcjZmlsZXMnKS5oaWRlKClcblxuICBzYXZlOiA9PlxuICAgIGlmIEB1cGRhdGVNb2RlbCgpXG4gICAgICBAbW9kZWwuc2F2ZSBudWxsLFxuICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiI3tAbW9kZWwuZ2V0KFwibmFtZVwiKX0gc2F2ZWRcIlxuICAgICAgICBlcnJvcjogPT5cbiAgICAgICAgICBVdGlscy5taWRBbGVydCBcIkxlc3NvblBsYW4gc2F2ZSBlcnJvci4gUGxlYXNlIHRyeSBhZ2Fpbi5cIlxuXG4gIGdvQmFjazogLT4gVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImFzc2Vzc21lbnRzXCIsIHRydWVcblxuICB1cGRhdGVNb2RlbDogPT5cblxuI1xuIyBwYXJzZSBhY2NlcHRhYmxlIHJhbmRvbSBzZXF1ZW5jZXNcbiNcblxuICAgIGVsZW1lbnRDb3VudCA9IEBtb2RlbC5lbGVtZW50cy5tb2RlbHMubGVuZ3RoXG5cbiAgICAjIHJlbW92ZSBldmVyeXRoaW5nIGV4Y2VwdCBudW1iZXJzLCBjb21tYXMgYW5kIG5ldyBsaW5lc1xuICAgIHNlcXVlbmNlc1ZhbHVlID0gQCRlbC5maW5kKFwiI3NlcXVlbmNlc1wiKS52YWwoKS5yZXBsYWNlKC9bXjAtOSxcXG5dL2csXCJcIilcbiAgICBzZXF1ZW5jZXMgPSBzZXF1ZW5jZXNWYWx1ZS5zcGxpdChcIlxcblwiKVxuXG4gICAgIyBwYXJzZSBzdHJpbmdzIHRvIG51bWJlcnMgYW5kIGNvbGxlY3QgZXJyb3JzXG4gICAgZm9yIHNlcXVlbmNlLCBpIGluIHNlcXVlbmNlc1xuXG4gICAgICBzZXF1ZW5jZSA9IHNlcXVlbmNlLnNwbGl0KFwiLFwiKVxuICAgICAgZm9yIGVsZW1lbnQsIGogaW4gc2VxdWVuY2VcbiAgICAgICAgc2VxdWVuY2Vbal0gPSBwYXJzZUludChlbGVtZW50KVxuICAgICAgICByYW5nZUVycm9yID0gdHJ1ZSBpZiBzZXF1ZW5jZVtqXSA8IDAgb3Igc2VxdWVuY2Vbal0gPj0gZWxlbWVudENvdW50XG4gICAgICAgIGVtcHR5RXJyb3IgPSB0cnVlIGlmIGlzTmFOKHNlcXVlbmNlW2pdKVxuXG4gICAgICBzZXF1ZW5jZXNbaV0gPSBzZXF1ZW5jZVxuXG4gICAgICAjIGRldGVjdCBlcnJvcnNcbiAgICAgIHRvb01hbnlFcnJvciA9IHRydWUgaWYgc2VxdWVuY2UubGVuZ3RoID4gZWxlbWVudENvdW50XG4gICAgICB0b29GZXdFcnJvciAgPSB0cnVlIGlmIHNlcXVlbmNlLmxlbmd0aCA8IGVsZW1lbnRDb3VudFxuICAgICAgZG91Ymxlc0Vycm9yID0gdHJ1ZSBpZiBzZXF1ZW5jZS5sZW5ndGggIT0gXy51bmlxKHNlcXVlbmNlKS5sZW5ndGhcblxuICAgICMgc2hvdyBlcnJvcnMgaWYgdGhleSBleGlzdCBhbmQgc2VxdWVuY2VzIGV4aXN0XG4gICAgaWYgbm90IF8uaXNFbXB0eSBfLnJlamVjdCggXy5mbGF0dGVuKHNlcXVlbmNlcyksIChlKSAtPiByZXR1cm4gaXNOYU4oZSkpICMgcmVtb3ZlIHVucGFyc2FibGUgZW1wdGllcywgZG9uJ3QgXy5jb21wYWN0LiB3aWxsIHJlbW92ZSAwc1xuICAgICAgc2VxdWVuY2VFcnJvcnMgPSBbXVxuICAgICAgaWYgZW1wdHlFcnJvciAgIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgc2VxdWVuY2VzIGNvbnRhaW4gZW1wdHkgdmFsdWVzLlwiXG4gICAgICBpZiByYW5nZUVycm9yICAgdGhlbiBzZXF1ZW5jZUVycm9ycy5wdXNoIFwiU29tZSBudW1iZXJzIGRvIG5vdCByZWZlcmVuY2UgYSBlbGVtZW50IGZyb20gdGhlIGxlZ2VuZC5cIlxuICAgICAgaWYgdG9vTWFueUVycm9yIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgc2VxdWVuY2VzIGFyZSBsb25nZXIgdGhhbiB0aGUgdG90YWwgbnVtYmVyIG9mIGFsbCBlbGVtZW50cy5cIlxuICAgICAgaWYgdG9vRmV3RXJyb3IgIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgc2VxdWVuY2VzIGFyZSBzaG9ydGVyIHRoYW4gdGhlIHRvdGFsIG51bWJlciBvZiBhbGwgZWxlbWVudHMuXCJcbiAgICAgIGlmIGRvdWJsZXNFcnJvciB0aGVuIHNlcXVlbmNlRXJyb3JzLnB1c2ggXCJTb21lIHNlcXVlbmNlcyBjb250YWluIGRvdWJsZXMuXCJcblxuICAgICAgaWYgc2VxdWVuY2VFcnJvcnMubGVuZ3RoID09IDBcbiMgaWYgdGhlcmUncyBubyBlcnJvcnMsIGNsZWFuIHVwIHRoZSB0ZXh0YXJlYSBjb250ZW50XG4gICAgICAgIHZhbGlkYXRlZFNlcXVlbmNlcyA9IChzZXF1ZW5jZS5qb2luKFwiLCBcIikgZm9yIHNlcXVlbmNlIGluIHNlcXVlbmNlcykuam9pbihcIlxcblwiKVxuICAgICAgICBAJGVsLmZpbmQoXCIjc2VxdWVuY2VzXCIpLnZhbCh2YWxpZGF0ZWRTZXF1ZW5jZXMpXG4gICAgICBlbHNlICMgaWYgdGhlcmUncyBlcnJvcnMsIHRoZXkgY2FuIHN0aWxsIHNhdmUuIEp1c3Qgc2hvdyBhIHdhcm5pbmdcbiAgICAgICAgYWxlcnQgXCJXYXJuaW5nXFxuXFxuI3tzZXF1ZW5jZUVycm9ycy5qb2luKFwiXFxuXCIpfVwiXG5cbiMgbm90aGluZyByZXNlbWJsaW5nIGEgdmFsaWQgc2VxdWVuY2Ugd2FzIGZvdW5kXG4gICAgZWxzZVxuICAgICAgQCRlbC5maW5kKFwiI3NlcXVlbmNlc1wiKS52YWwoXCJcIikgIyBjbGVhbiB0ZXh0IGFyZWFcblxuICAgIEBtb2RlbC5zZXRcbiAgICAgIHNlcXVlbmNlcyA6IHNlcXVlbmNlc1xuICAgICAgYXJjaGl2ZWQgIDogQCRlbC5maW5kKFwiI2FyY2hpdmVfYnV0dG9ucyBpbnB1dDpjaGVja2VkXCIpLnZhbCgpID09IFwidHJ1ZVwiXG4gICAgICBuYW1lICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl90aXRsZVwiKS52YWwoKVxuICAgICAgZEtleSAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fZF9rZXlcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5fdGl0bGUgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX3RpdGxlXCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuX2xlc3Nvbl90ZXh0ICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9sZXNzb25fdGV4dFwiKS52YWwoKVxuIyAgICAgIGxlc3NvblBsYW5fc3ViamVjdCAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fc3ViamVjdFwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl9zdWJqZWN0ICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9zdWJqZWN0X2J1dHRvbnMgaW5wdXQ6Y2hlY2tlZFwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl9ncmFkZSAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fZ3JhZGVcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5fd2VlayAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fd2Vla1wiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl9kYXkgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX2RheVwiKS52YWwoKVxuIyAgICAgIGxlc3NvblBsYW5faW1hZ2UgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX2ltYWdlXCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuSWQgOiBAbW9kZWwuaWRcbiAgICAgIGFzc2Vzc21lbnRJZCA6IEBtb2RlbC5pZFxuICAgIHJldHVybiB0cnVlXG5cbiAgdG9nZ2xlTmV3RWxlbWVudEZvcm06IChldmVudCkgLT5cbiAgICBAJGVsLmZpbmQoXCIubmV3X2VsZW1lbnRfZm9ybSwgLm5ld19lbGVtZW50X2J1dHRvblwiKS50b2dnbGUoKVxuXG4gICAgQCRlbC5maW5kKFwiI25ld19lbGVtZW50X25hbWVcIikudmFsKFwiXCIpXG4gICAgQCRlbC5maW5kKFwiI2VsZW1lbnRfdHlwZV9zZWxlY3RcIikudmFsKFwibm9uZVwiKVxuXG5cbiAgICBmYWxzZVxuXG4gIHNhdmVOZXdFbGVtZW50OiAoZXZlbnQpID0+XG5cbiAgICBpZiBldmVudC50eXBlICE9IFwiY2xpY2tcIiAmJiBldmVudC53aGljaCAhPSAxM1xuICAgICAgcmV0dXJuIHRydWVcblxuICAgICMgaWYgbm8gZWxlbWVudCB0eXBlIHNlbGVjdGVkLCBzaG93IGVycm9yXG4gICAgaWYgQCRlbC5maW5kKFwiI2VsZW1lbnRfdHlwZV9zZWxlY3Qgb3B0aW9uOnNlbGVjdGVkXCIpLnZhbCgpID09IFwibm9uZVwiXG4gICAgICBVdGlscy5taWRBbGVydCBcIlBsZWFzZSBzZWxlY3QgYW4gZWxlbWVudCB0eXBlXCJcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgIyBnZW5lcmFsIHRlbXBsYXRlXG4gICAgbmV3QXR0cmlidXRlcyA9IFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwiZWxlbWVudFwiKVxuXG4gICAgIyBwcm90b3R5cGUgdGVtcGxhdGVcbiAgICBwcm90b3R5cGVUZW1wbGF0ZSA9IFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwiZWxlbWVudFR5cGVzXCIpW0AkZWwuZmluZChcIiNlbGVtZW50X3R5cGVfc2VsZWN0XCIpLnZhbCgpXVxuXG4gICAgIyBiaXQgbW9yZSBzcGVjaWZpYyB0ZW1wbGF0ZVxuICAgIHVzZVR5cGVUZW1wbGF0ZSA9IFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwiZWxlbWVudFwiKTtcblxuICAgICMgZXh0cmFjdCBzb21lIHZhbHVlcyBmcm9tIEAkZWwuXG4gICAgbmFtZSA9IEAkZWwuZmluZChcIiNuZXdfZWxlbWVudF9uYW1lXCIpLnZhbCgpXG4gICAgdHlwZSA9IEAkZWwuZmluZChcIiNlbGVtZW50X3R5cGVfc2VsZWN0XCIpLnZhbCgpXG5cbiAgICAjIEdldCB0aGUgZmlsZSBmcm9tIHRoZSBmb3JtLlxuICAgIGZpbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbGVzXCIpLmZpbGVzWzBdXG4gICAgaWYgdHlwZW9mIGZpbGUgIT0gJ3VuZGVmaW5lZCdcbiAgICAgIGZpbGVOYW1lID0gZmlsZS5uYW1lXG4gICAgICBmaWxlTmFtZUFyciA9IGZpbGUubmFtZS5zcGxpdCgnLicpXG4gICAgICBleHRlbnNpb24gPSBmaWxlTmFtZUFyci5wb3AoKVxuXG4gICAgIyBidWlsZCB0aGUgZWxlbWVudEZpbGVuYW1lXG4gICAgaWYgdHlwZSA9PSBcIm1lZGlhXCJcbiAgICAgIG51bUVsZW1lbnRzID0gQG1vZGVsLmVsZW1lbnRzLmxlbmd0aFxuICAgICAgc2FuaXRpemVkTmFtZSA9IFNhbml0aXplICBuYW1lXG4gICAgICBsZXNzb25QbGFuVGl0bGUgPSBTYW5pdGl6ZSBAbW9kZWwuZ2V0KFwibGVzc29uUGxhbl90aXRsZVwiKVxuICAgICAgaWYgc2FuaXRpemVkTmFtZSAhPSBcIlwiXG4gICAgICAgIGZpbmFsTmFtZSA9IFwiX1wiICsgc2FuaXRpemVkTmFtZVxuICAgICAgZWxzZVxuICAgICAgICBmaW5hbE5hbWUgPSBcIlwiXG4gICAgICBpZiBsZXNzb25QbGFuVGl0bGUgIT0gXCJcIlxuICAgICAgICBmaW5hbExlc3NvblBsYW5UaXRsZSA9ICBsZXNzb25QbGFuVGl0bGVcbiAgICAgIGVsc2VcbiAgICAgICAgZmluYWxMZXNzb25QbGFuVGl0bGUgPSBcIkxQXCJcbiAgICAgIHRpbWVzdGFtcCA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKClcbiAgICAgIGVsZW1lbnRGaWxlbmFtZSA9IGZpbmFsTGVzc29uUGxhblRpdGxlICsgXCJfXCIgKyB0eXBlICsgZmluYWxOYW1lICArIFwiX1wiICsgbnVtRWxlbWVudHMgKyBcIl9cIiArIHRpbWVzdGFtcCArIFwiLlwiICsgZXh0ZW5zaW9uXG4gICAgICBjb25zb2xlLmxvZyhcImVsZW1lbnRGaWxlbmFtZTogXCIgKyBlbGVtZW50RmlsZW5hbWUpXG5cbiAgICBpZiB0eXBlb2YgZmlsZSAhPSAndW5kZWZpbmVkJ1xuICAgICAgZmQgPSBuZXcgRm9ybURhdGEoKVxuICAgICAgZmQuYXBwZW5kKFwiZmlsZVwiLCBmaWxlKVxuICAgICAgZmQuYXBwZW5kKFwiZ3JvdXBOYW1lXCIsIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJncm91cE5hbWVcIikpXG4gICAgICBmZC5hcHBlbmQoXCJlbGVtZW50RmlsZW5hbWVcIiwgZWxlbWVudEZpbGVuYW1lKVxuXG4gICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIG5ld0F0dHJpYnV0ZXMsIHByb3RvdHlwZVRlbXBsYXRlXG4gICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIG5ld0F0dHJpYnV0ZXMsIHVzZVR5cGVUZW1wbGF0ZVxuICAgIG5ld0F0dHJpYnV0ZXMgPSAkLmV4dGVuZCBuZXdBdHRyaWJ1dGVzLFxuICAgICAgbmFtZSAgICAgICAgIDogbmFtZVxuICAgICAgZWxlbWVudCAgICAgICAgIDogdHlwZVxuICAgICAgbGVzc29uUGxhbklkIDogQG1vZGVsLmlkXG4gICAgICBhc3Nlc3NtZW50SWQgOiBAbW9kZWwuaWRcbiAgICAgIG9yZGVyICAgICAgICA6IEBtb2RlbC5lbGVtZW50cy5sZW5ndGhcblxuICAgIGlmIENLRURJVE9SLmluc3RhbmNlcy5odG1sLmdldERhdGEoKSAhPSAndW5kZWZpbmVkJ1xuICAgICAgQG1vZGVsLnNldFxuICAgICAgICBcImh0bWxcIiA6IENLRURJVE9SLmluc3RhbmNlcy5odG1sLmdldERhdGEoKVxuICAgICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIG5ld0F0dHJpYnV0ZXMsXG4gICAgICAgIGh0bWw6IEBtb2RlbC5nZXQoJ2h0bWwnKVxuXG5cbiAgICBpZiB0eXBlb2YgZmlsZSAhPSAndW5kZWZpbmVkJ1xuICAgICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIG5ld0F0dHJpYnV0ZXMsXG4gICAgICAgIGZpbGVUeXBlICA6IGZpbGUudHlwZVxuICAgICAgICBmaWxlTmFtZSAgOiBmaWxlLm5hbWVcbiAgICAgICAgZmlsZVNpemUgIDogZmlsZS5zaXplXG4gICAgICAgIGVsZW1lbnRGaWxlbmFtZSAgOiBlbGVtZW50RmlsZW5hbWVcblxuICAgIGlmIHR5cGVvZiBmaWxlID09ICd1bmRlZmluZWQnXG4gICAgICBvcHRpb25zID1cbiAgICAgICAgc3VjY2VzczogKG1vZGVsLCByZXNwKSA9PlxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiTW9kZWwgY3JlYXRlZC5cIilcbiAgICAgICAgZXJyb3I6IChtb2RlbCwgZXJyKSA9PlxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6IFwiICsgSlNPTi5zdHJpbmdpZnkoZXJyKSArIFwiIE1vZGVsOiBcIiArIEpTT04uc3RyaW5naWZ5KG1vZGVsKSlcbiAgICBlbHNlXG4gICAgICBvcHRpb25zID1cbiAgICAgICAgc3VjY2VzczogKG1vZGVsLCByZXNwKSA9PlxuICAjICAgICAgICBjb25zb2xlLmxvZyhcImNyZWF0ZWQ6IFwiICsgSlNPTi5zdHJpbmdpZnkocmVzcCkgKyBcIiBNb2RlbDogXCIgKyBKU09OLnN0cmluZ2lmeShtb2RlbCkpXG4gICAgICAgICAgdXJsID0gXCIje1RhbmdlcmluZS5jb25maWcuZ2V0KCdyb2JiZXJ0Jyl9L2ZpbGVzXCJcbiAgICAgICAgICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICB4aHIudXBsb2FkLm9uZXJyb3IgPSAoZSkgPT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3IgVXBsb2FkaW5nIGltYWdlOiBcIiArIEpTT04uc3RyaW5naWZ5KGUpKVxuICAgICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PlxuICAgICAgICAgICAgaWYgeGhyLnJlYWR5U3RhdGUgPT0gNFxuICAgICAgICAgICAgICBpZiB4aHIuc3RhdHVzID09IDIwMFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHhoci5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRoZXJlIHdhcyBhbiBlcnJvciB1cGxvYWRpbmcgdGhlIGZpbGU6IFwiICsgeGhyLnJlc3BvbnNlVGV4dCArIFwiIFN0YXR1czogXCIgKyB4aHIuc3RhdHVzKVxuIyAgICAgICAgICAgICAgICBhbGVydChcIlRoZXJlIHdhcyBhbiBlcnJvciB1cGxvYWRpbmcgdGhlIGZpbGU6IFwiICsgeGhyLnJlc3BvbnNlVGV4dCArIFwiIFN0YXR1czogXCIgKyB4aHIuc3RhdHVzKVxuICAgICAgICAgIHhoci5vbmVycm9yID0gIChlcnIpID0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRoZXJlIHdhcyBhbiBlcnJvciB1cGxvYWRpbmcgdGhlIGZpbGU6IFwiICsgZXJyKVxuIyAgICAgICAgICAgIGFsZXJ0KFwiVGhlcmUgd2FzIGFuIGVycm9yIHVwbG9hZGluZyB0aGUgZmlsZTogXCIgKyB4aHIucmVzcG9uc2VUZXh0ICsgXCIgU3RhdHVzOiBcIiArIHhoci5zdGF0dXMpXG5cbiAgICAgICAgICAjIGRlZmluZSBvdXIgZmluaXNoIGZuXG4gICAgICAgICAgbG9hZGVkID0gKCktPlxuICAjICAgICAgICAgIGNvbnNvbGUubG9nKCdmaW5pc2hlZCB1cGxvYWRpbmcnKVxuICAgICAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyICdsb2FkJywgbG9hZGVkLCBmYWxzZVxuIyAgICAgICAgICBwcm9ncmVzc0JhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3Byb2dyZXNzJyk7XG4jICAgICAgICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IChlKSA9PlxuIyAgICAgICAgICAgIGlmIGUubGVuZ3RoQ29tcHV0YWJsZVxuIyAgICAgICAgICAgICAgcHJvZ3Jlc3NCYXIudmFsdWUgPSAoZS5sb2FkZWQgLyBlLnRvdGFsKSAqIDEwMDtcbiMgICAgICAgICAgICAgIHByb2dyZXNzQmFyLnRleHRDb250ZW50ID0gcHJvZ3Jlc3NCYXIudmFsdWU7XG4jICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInByb2dyZXNzOiBcIiArIHByb2dyZXNzQmFyLnZhbHVlKVxuICAgICAgICAgIHhoci5vcGVuKCdQT1NUJywgdXJsLCB0cnVlKTtcbiAgICAgICAgICB4aHIuc2VuZChmZCk7XG4gICAgICAgIGVycm9yOiAobW9kZWwsIGVycikgPT5cbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiArIEpTT04uc3RyaW5naWZ5KGVycikgKyBcIiBNb2RlbDogXCIgKyBKU09OLnN0cmluZ2lmeShtb2RlbCkpXG5cbiAgICBuZXdFbGVtZW50ID0gQG1vZGVsLmVsZW1lbnRzLmNyZWF0ZSBuZXdBdHRyaWJ1dGVzLCBvcHRpb25zXG4jICAgIG5ld0VsZW1lbnQub24oJ3Byb2dyZXNzJywgKGV2dCkgLT5cbiMgICAgICBjb25zb2xlLmxvZyhcIkxvZ2dpbmcgbmV3RWxlbWVudDogXCIgKyBldnQpXG4jICAgIClcblxuICAgIEB0b2dnbGVOZXdFbGVtZW50Rm9ybSgpXG4gICAgJChcIiNmaWxlc1wiKS52YWwoJycpO1xuICAgIENLRURJVE9SLmluc3RhbmNlc1snaHRtbCddLnNldERhdGEoXCJcIik7XG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgcmVuZGVyOiA9PlxuICAgIGxlc3NvblBsYW5fdGl0bGUgICAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwibGVzc29uUGxhbl90aXRsZVwiKVxuIyAgICBsZXNzb25QbGFuX2xlc3Nvbl90ZXh0ICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxlc3NvblBsYW5fbGVzc29uX3RleHRcIilcbiAgICBsZXNzb25QbGFuX3N1YmplY3QgICAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwibGVzc29uUGxhbl9zdWJqZWN0XCIpXG4gICAgbGVzc29uUGxhbl9ncmFkZSAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX2dyYWRlXCIpXG4gICAgbGVzc29uUGxhbl93ZWVrICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxlc3NvblBsYW5fd2Vla1wiKVxuICAgIGxlc3NvblBsYW5fZGF5ICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxlc3NvblBsYW5fZGF5XCIpXG4gICAgc2VxdWVuY2VzID0gXCJcIlxuICAgIGlmIEBtb2RlbC5oYXMoXCJzZXF1ZW5jZXNcIilcbiAgICAgIHNlcXVlbmNlcyA9IEBtb2RlbC5nZXQoXCJzZXF1ZW5jZXNcIilcbiAgICAgIHNlcXVlbmNlcyA9IHNlcXVlbmNlcy5qb2luKFwiXFxuXCIpXG5cbiAgICAgIGlmIF8uaXNBcnJheShzZXF1ZW5jZXMpXG4gICAgICAgIGZvciBzZXF1ZW5jZXMsIGkgaW4gc2VxdWVuY2VzXG4gICAgICAgICAgc2VxdWVuY2VzW2ldID0gc2VxdWVuY2VzLmpvaW4oXCIsIFwiKVxuXG4gICAgZWxlbWVudExlZ2VuZCA9IEB1cGRhdGVFbGVtZW50TGVnZW5kKClcblxuICAgIGFyY2ggPSBAbW9kZWwuZ2V0KCdhcmNoaXZlZCcpXG4gICAgYXJjaGl2ZUNoZWNrZWQgICAgPSBpZiAoYXJjaCA9PSB0cnVlIG9yIGFyY2ggPT0gJ3RydWUnKSB0aGVuIFwiY2hlY2tlZFwiIGVsc2UgXCJcIlxuICAgIG5vdEFyY2hpdmVDaGVja2VkID0gaWYgYXJjaGl2ZUNoZWNrZWQgdGhlbiBcIlwiIGVsc2UgXCJjaGVja2VkXCJcblxuICAgIGxlc3NvblBsYW5fc3ViamVjdF9BZmFhbl9Pcm9tbyAgICA9IGlmIChsZXNzb25QbGFuX3N1YmplY3QgPT0gJzEnKSB0aGVuIFwiY2hlY2tlZFwiIGVsc2UgXCJcIlxuICAgIGxlc3NvblBsYW5fc3ViamVjdF9BZl9Tb21hbGkgPSBpZiAobGVzc29uUGxhbl9zdWJqZWN0ID09ICcyJykgdGhlbiBcImNoZWNrZWRcIiBlbHNlIFwiXCJcbiAgICBsZXNzb25QbGFuX3N1YmplY3RfQW1oYXJpYyA9IGlmIChsZXNzb25QbGFuX3N1YmplY3QgPT0gJzMnKSB0aGVuIFwiY2hlY2tlZFwiIGVsc2UgXCJcIlxuICAgIGxlc3NvblBsYW5fc3ViamVjdF9IYWRpeXlpc2EgPSBpZiAobGVzc29uUGxhbl9zdWJqZWN0ID09ICc0JykgdGhlbiBcImNoZWNrZWRcIiBlbHNlIFwiXCJcbiAgICBsZXNzb25QbGFuX3N1YmplY3RfU2lkYWFtdV9BZm9vID0gaWYgKGxlc3NvblBsYW5fc3ViamVjdCA9PSAnNScpIHRoZW4gXCJjaGVja2VkXCIgZWxzZSBcIlwiXG4gICAgbGVzc29uUGxhbl9zdWJqZWN0X1RpZ3JpbnlhID0gaWYgKGxlc3NvblBsYW5fc3ViamVjdCA9PSAnNicpIHRoZW4gXCJjaGVja2VkXCIgZWxzZSBcIlwiXG4gICAgbGVzc29uUGxhbl9zdWJqZWN0X1dvbGF5dHRhdHRvID0gaWYgKGxlc3NvblBsYW5fc3ViamVjdCA9PSAnNycpIHRoZW4gXCJjaGVja2VkXCIgZWxzZSBcIlwiXG5cblxuICAgICMgbGlzdCBvZiBcInRlbXBsYXRlc1wiXG4gICAgZWxlbWVudFR5cGVTZWxlY3QgPSBcIjxzZWxlY3QgaWQ9J2VsZW1lbnRfdHlwZV9zZWxlY3QnPlxuICAgICAgPG9wdGlvbiB2YWx1ZT0nbm9uZScgZGlzYWJsZWQ9J2Rpc2FibGVkJyBzZWxlY3RlZD0nc2VsZWN0ZWQnPlBsZWFzZSBzZWxlY3QgYSBlbGVtZW50IHR5cGU8L29wdGlvbj5cIlxuICAgIGZvciBrZXksIHZhbHVlIG9mIFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwiZWxlbWVudFR5cGVzXCIpXG4jICAgICAgZWxlbWVudFR5cGVTZWxlY3QgKz0gXCI8b3B0Z3JvdXAgbGFiZWw9JyN7a2V5Lmh1bWFuaXplKCl9Jz5cIlxuIyAgICAgIGZvciBzdWJLZXksIHN1YlZhbHVlIG9mIHZhbHVlXG4gICAgICAgIGVsZW1lbnRUeXBlU2VsZWN0ICs9IFwiPG9wdGlvbiB2YWx1ZT0nI3trZXl9JyBkYXRhLXRlbXBsYXRlPScje2tleX0nPiN7a2V5Lmh1bWFuaXplKCl9PC9vcHRpb24+XCJcbiMgICAgICBlbGVtZW50VHlwZVNlbGVjdCArPSBcIjwvb3B0Z3JvdXA+XCJcbiAgICBlbGVtZW50VHlwZVNlbGVjdCArPSBcIjwvc2VsZWN0PlwiXG4gICAgaHRtbCA9IEBtb2RlbC5nZXQoXCJodG1sXCIpIHx8IFwiXCJcblxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGJ1dHRvbiBjbGFzcz0nYmFjayBuYXZpZ2F0aW9uJz5CYWNrPC9idXR0b24+XG4gICAgICAgIDxoMT5MZXNzb25QbGFuIEJ1aWxkZXI8L2gxPlxuICAgICAgPGRpdiBpZD0nYmFzaWMnPlxuICAgICAgXG5cbiAgICAgICAgPGxhYmVsIGZvcj0nbGVzc29uUGxhbl9kX2tleScgdGl0bGU9J1RoaXMga2V5IGlzIHVzZWQgdG8gaW1wb3J0IHRoZSBsZXNzb25QbGFuIGZyb20gYSB0YWJsZXQuJz5Eb3dubG9hZCBLZXk8L2xhYmVsPjxicj5cbiAgICAgICAgPGRpdiBjbGFzcz0naW5mb19ib3gnPiN7QG1vZGVsLmlkLnN1YnN0cigtNSw1KX08L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8bGFiZWwgdGl0bGU9J09ubHkgYWN0aXZlIGxlc3NvblBsYW5zIHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBtYWluIGxlc3NvblBsYW4gbGlzdC4nPlN0YXR1czwvbGFiZWw+PGJyPlxuICAgICAgPGRpdiBpZD0nYXJjaGl2ZV9idXR0b25zJyBjbGFzcz0nYnV0dG9uc2V0Jz5cbiAgICAgICAgPGlucHV0IHR5cGU9J3JhZGlvJyBpZD0nYXJjaGl2ZV9mYWxzZScgbmFtZT0nYXJjaGl2ZScgdmFsdWU9J2ZhbHNlJyAje25vdEFyY2hpdmVDaGVja2VkfT48bGFiZWwgZm9yPSdhcmNoaXZlX2ZhbHNlJz5BY3RpdmU8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgdHlwZT0ncmFkaW8nIGlkPSdhcmNoaXZlX3RydWUnICBuYW1lPSdhcmNoaXZlJyB2YWx1ZT0ndHJ1ZScgICN7YXJjaGl2ZUNoZWNrZWR9PjxsYWJlbCBmb3I9J2FyY2hpdmVfdHJ1ZSc+QXJjaGl2ZWQ8L2xhYmVsPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nbGVzc29uUGxhbl90aXRsZSc+TGVzc29uUGxhbiBUaXRsZTwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCBpZD0nbGVzc29uUGxhbl90aXRsZScgdmFsdWU9JyN7bGVzc29uUGxhbl90aXRsZX0nPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxsYWJlbCB0aXRsZT0nWW91IG11c3QgY2hvb3NlIG9uZSBvZiB0aGVzZSBzdWJqZWN0cy4nIGZvcj0nbGVzc29uUGxhbl9zdWJqZWN0X2J1dHRvbnMnPkxlc3NvblBsYW4gc3ViamVjdDwvbGFiZWw+PGJyPlxuICAgICAgPGRpdiBpZD0nbGVzc29uUGxhbl9zdWJqZWN0X2J1dHRvbnMnIGNsYXNzPSdidXR0b25zZXQnPlxuICAgICAgICA8aW5wdXQgdHlwZT0ncmFkaW8nIGlkPSdsZXNzb25QbGFuX3N1YmplY3RfQWZhYW5fT3JvbW8nIG5hbWU9J2xlc3NvblBsYW5fc3ViamVjdCcgdmFsdWU9JzEnICN7bGVzc29uUGxhbl9zdWJqZWN0X0FmYWFuX09yb21vfT48bGFiZWwgZm9yPSdsZXNzb25QbGFuX3N1YmplY3RfQWZhYW5fT3JvbW8nPkFmYWFuIE9yb21vPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IHR5cGU9J3JhZGlvJyBpZD0nbGVzc29uUGxhbl9zdWJqZWN0X0FmX1NvbWFsaScgIG5hbWU9J2xlc3NvblBsYW5fc3ViamVjdCcgdmFsdWU9JzInICAje2xlc3NvblBsYW5fc3ViamVjdF9BZl9Tb21hbGl9PjxsYWJlbCBmb3I9J2xlc3NvblBsYW5fc3ViamVjdF9BZl9Tb21hbGknPkFmLVNvbWFsaTwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCB0eXBlPSdyYWRpbycgaWQ9J2xlc3NvblBsYW5fc3ViamVjdF9BbWhhcmljJyAgbmFtZT0nbGVzc29uUGxhbl9zdWJqZWN0JyB2YWx1ZT0nMycgICN7bGVzc29uUGxhbl9zdWJqZWN0X0FtaGFyaWN9PjxsYWJlbCBmb3I9J2xlc3NvblBsYW5fc3ViamVjdF9BbWhhcmljJz5BbWhhcmljPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IHR5cGU9J3JhZGlvJyBpZD0nbGVzc29uUGxhbl9zdWJqZWN0X0hhZGl5eWlzYScgIG5hbWU9J2xlc3NvblBsYW5fc3ViamVjdCcgdmFsdWU9JzQnICAje2xlc3NvblBsYW5fc3ViamVjdF9IYWRpeXlpc2F9PjxsYWJlbCBmb3I9J2xlc3NvblBsYW5fc3ViamVjdF9IYWRpeXlpc2EnPkhhZGl5eWlzYTwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCB0eXBlPSdyYWRpbycgaWQ9J2xlc3NvblBsYW5fc3ViamVjdF9TaWRhYW11X0Fmb28nICBuYW1lPSdsZXNzb25QbGFuX3N1YmplY3QnIHZhbHVlPSc1JyAgI3tsZXNzb25QbGFuX3N1YmplY3RfU2lkYWFtdV9BZm9vfT48bGFiZWwgZm9yPSdsZXNzb25QbGFuX3N1YmplY3RfU2lkYWFtdV9BZm9vJz5TaWRhYW11IEFmb288L2xhYmVsPlxuICAgICAgICA8aW5wdXQgdHlwZT0ncmFkaW8nIGlkPSdsZXNzb25QbGFuX3N1YmplY3RfVGlncmlueWEnICBuYW1lPSdsZXNzb25QbGFuX3N1YmplY3QnIHZhbHVlPSc2JyAgI3tsZXNzb25QbGFuX3N1YmplY3RfVGlncmlueWF9PjxsYWJlbCBmb3I9J2xlc3NvblBsYW5fc3ViamVjdF9UaWdyaW55YSc+VGlncmlueWE8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgdHlwZT0ncmFkaW8nIGlkPSdsZXNzb25QbGFuX3N1YmplY3RfV29sYXl0dGF0dG8nICBuYW1lPSdsZXNzb25QbGFuX3N1YmplY3QnIHZhbHVlPSc3JyAgI3tsZXNzb25QbGFuX3N1YmplY3RfV29sYXl0dGF0dG99PjxsYWJlbCBmb3I9J2xlc3NvblBsYW5fc3ViamVjdF9Xb2xheXR0YXR0byc+V29sYXl0dGF0dG88L2xhYmVsPlxuICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nbGVzc29uUGxhbl9ncmFkZSc+TGVzc29uUGxhbiBHcmFkZTwvbGFiZWw+XG4gICAgICA8aW5wdXQgaWQ9J2xlc3NvblBsYW5fZ3JhZGUnIHZhbHVlPScje2xlc3NvblBsYW5fZ3JhZGV9Jz5cbiAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2xlc3NvblBsYW5fd2Vlayc+TGVzc29uUGxhbiBXZWVrPC9sYWJlbD5cbiAgICAgIDxpbnB1dCBpZD0nbGVzc29uUGxhbl93ZWVrJyB2YWx1ZT0nI3tsZXNzb25QbGFuX3dlZWt9Jz5cbiAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2xlc3NvblBsYW5fZGF5Jz5MZXNzb25QbGFuIERheTwvbGFiZWw+XG4gICAgICA8aW5wdXQgaWQ9J2xlc3NvblBsYW5fZGF5JyB2YWx1ZT0nI3tsZXNzb25QbGFuX2RheX0nPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxoMj5FbGVtZW50czwvaDI+XG4gICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG48IS0tXG4gICAgICAgIDxwcm9ncmVzcyBtaW49JzAnIG1heD0nMTAwJyB2YWx1ZT0nMCc+PC9wcm9ncmVzcz5cbi0tPlxuICAgICAgICA8ZGl2PlxuICAgICAgICA8dWwgaWQ9J2VsZW1lbnRfbGlzdCc+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8YnV0dG9uIGNsYXNzPSduZXdfZWxlbWVudF9idXR0b24gY29tbWFuZCc+QWRkIEVsZW1lbnQ8L2J1dHRvbj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbmV3X2VsZW1lbnRfZm9ybSBjb25maXJtYXRpb24nPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICAgIDxoMj5OZXcgRWxlbWVudDwvaDI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdlbGVtZW50X3R5cGVfc2VsZWN0Jz5UeXBlPC9sYWJlbD48YnI+XG4gICAgICAgICAgICAje2VsZW1lbnRUeXBlU2VsZWN0fTxicj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J25ld19lbGVtZW50X25hbWUnPk5hbWU8L2xhYmVsPjxicj5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPSd0ZXh0JyBpZD0nbmV3X2VsZW1lbnRfbmFtZSc+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT0nZmlsZScgbmFtZT0nZmlsZXMnIGlkPSdmaWxlcycgbXVsdGlwbGU9J211bHRpcGxlJyAvPlxuICAgICAgICAgICAgPGRpdiBpZD0naHRtbF9kaXYnIGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgICAgIDxsYWJlbCBmb3I9J2h0bWwnPkh0bWw8L2xhYmVsPlxuICAgICAgICAgICAgICA8dGV4dGFyZWEgaWQ9J2h0bWwnPiN7aHRtbH08L3RleHRhcmVhPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduZXdfZWxlbWVudF9zYXZlIGNvbW1hbmQnPkFkZDwvYnV0dG9uPiA8YnV0dG9uIGNsYXNzPSduZXdfZWxlbWVudF9jYW5jZWwgY29tbWFuZCc+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8aDI+PC9oMj5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJyBzdHlsZT0nZGlzcGxheTogbm9uZTsnPiBcbiAgICAgICAgPGxhYmVsIGZvcj0nc2VxdWVuY2VzJyB0aXRsZT0nVGhpcyBpcyBhIGxpc3Qgb2YgYWNjZXB0YWJsZSBvcmRlcnMgb2YgZWxlbWVudHMsIHdoaWNoIHdpbGwgYmUgcmFuZG9tbHkgc2VsZWN0ZWQgZWFjaCB0aW1lIGFuIGxlc3NvblBsYW4gaXMgcnVuLiBFbGVtZW50IGluZGljaWVzIGFyZSBzZXBhcmF0ZWQgYnkgY29tbWFzLCBuZXcgbGluZXMgc2VwYXJhdGUgc2VxdWVuY2VzLiAnPlJhbmRvbSBTZXF1ZW5jZXM8L2xhYmVsPlxuICAgICAgICA8ZGl2IGlkPSdlbGVtZW50X2xlZ2VuZCc+I3tlbGVtZW50TGVnZW5kfTwvZGl2PlxuICAgICAgICA8dGV4dGFyZWEgaWQ9J3NlcXVlbmNlcyc+I3tzZXF1ZW5jZXN9PC90ZXh0YXJlYT5cbiAgICAgIDwvZGl2PlxuICAgICAgPGJ1dHRvbiBjbGFzcz0nc2F2ZSBjb21tYW5kJz5TYXZlPC9idXR0b24+XG4gICAgICBcIlxuXG4gICAgIyByZW5kZXIgbmV3IGVsZW1lbnQgdmlld3NcbiAgICBAZWxlbWVudExpc3RFZGl0Vmlldy5zZXRFbGVtZW50KEAkZWwuZmluZChcIiNlbGVtZW50X2xpc3RcIikpXG4gICAgQGVsZW1lbnRMaXN0RWRpdFZpZXcucmVuZGVyKClcblxuICAgICMgbWFrZSBpdCBzb3J0YWJsZVxuICAgIEAkZWwuZmluZChcIiNlbGVtZW50X2xpc3RcIikuc29ydGFibGVcbiAgICAgIGhhbmRsZSA6ICcuc29ydGFibGVfaGFuZGxlJ1xuICAgICAgc3RhcnQ6IChldmVudCwgdWkpIC0+IHVpLml0ZW0uYWRkQ2xhc3MgXCJkcmFnX3NoYWRvd1wiXG4gICAgICBzdG9wOiAgKGV2ZW50LCB1aSkgLT4gdWkuaXRlbS5yZW1vdmVDbGFzcyBcImRyYWdfc2hhZG93XCJcbiAgICAgIHVwZGF0ZSA6IChldmVudCwgdWkpID0+XG4gICAgICAgIGZvciBpZCwgaSBpbiAoJChsaSkuYXR0cihcImRhdGEtaWRcIikgZm9yIGxpIGluIEAkZWwuZmluZChcIiNlbGVtZW50X2xpc3QgbGlcIikpXG4gICAgICAgICAgQG1vZGVsLmVsZW1lbnRzLmdldChpZCkuc2V0KHtcIm9yZGVyXCI6aX0se3NpbGVudDp0cnVlfSkuc2F2ZShudWxsLHtzaWxlbnQ6dHJ1ZX0pXG4gICAgICAgIEBtb2RlbC5lbGVtZW50cy5zb3J0KClcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG5cbiAgdXBkYXRlRWxlbWVudExlZ2VuZDogPT5cbiAgICBlbGVtZW50TGVnZW5kID0gXCJcIlxuICAgIEBtb2RlbC5lbGVtZW50cy5lYWNoIChlbGVtZW50LCBpKSAtPlxuICAgICAgZWxlbWVudExlZ2VuZCArPSBcIjxkaXYgY2xhc3M9J3NtYWxsX2dyZXknPiN7aX0gLSAje2VsZW1lbnQuZ2V0KFwibmFtZVwiKX08L2Rpdj48YnI+XCJcbiAgICAkZWxlbWVudFdyYXBwZXIgPSBAJGVsLmZpbmQoXCIjZWxlbWVudF9sZWdlbmRcIilcbiAgICAkZWxlbWVudFdyYXBwZXIuaHRtbChlbGVtZW50TGVnZW5kKSBpZiAkZWxlbWVudFdyYXBwZXIubGVuZ3RoICE9IDBcbiAgICByZXR1cm4gZWxlbWVudExlZ2VuZFxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgQGVsZW1lbnRMaXN0RWRpdFZpZXcuY2xvc2UoKVxuICBcbiAgYWZ0ZXJSZW5kZXI6IC0+XG4gICAgQGVsZW1lbnRFZGl0b3I/LmFmdGVyUmVuZGVyPygpXG4gICAgQ0tFRElUT1IucmVwbGFjZShcImh0bWxcIilcbiAgICAkKCcjZmlsZXMnKS5oaWRlKClcbiAgICAkKCcjaHRtbF9kaXYnKS5oaWRlKCkiXX0=
