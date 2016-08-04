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
      fileType: file.type,
      fileName: file.name,
      fileSize: file.size
    });
    options = {
      success: (function(_this) {
        return function(model, resp) {
          var loaded, progressBar, url, xhr;
          console.log("created: " + JSON.stringify(resp) + " Model: " + JSON.stringify(model));
          url = (Tangerine.config.get('robbert')) + "/files";
          console.log("url: " + url);
          console.log("file size: " + file.size);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlc3NvblBsYW4vTGVzc29uUGxhbkVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGtCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7OytCQUVKLFNBQUEsR0FBWTs7K0JBRVosTUFBQSxHQUNFO0lBQUEsOEJBQUEsRUFBaUMsTUFBakM7SUFDQSxhQUFBLEVBQWlDLFFBRGpDO0lBRUEsMkJBQUEsRUFBaUMsc0JBRmpDO0lBR0EsMkJBQUEsRUFBaUMsc0JBSGpDO0lBS0EsNEJBQUEsRUFBaUMsZ0JBTGpDO0lBTUEseUJBQUEsRUFBaUMsZ0JBTmpDO0lBUUEscUJBQUEsRUFBaUMsTUFSakM7SUFTQSxhQUFBLEVBQWlDLE1BVGpDOzs7K0JBV0YsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO0lBQ2pCLElBQUMsQ0FBQSxtQkFBRCxHQUEyQixJQUFBLG1CQUFBLENBQ3pCO01BQUEsWUFBQSxFQUFlLElBQUMsQ0FBQSxLQUFoQjtNQUNBLFlBQUEsRUFBZSxJQUFDLENBQUEsS0FEaEI7S0FEeUI7SUFJM0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBaEIsQ0FBbUIsZUFBbkIsRUFBb0MsSUFBQyxDQUFBLG1CQUFtQixDQUFDLE1BQXpEO1dBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBaEIsQ0FBbUIsS0FBbkIsRUFBMEIsSUFBQyxDQUFBLG1CQUEzQjtFQVBVOzsrQkFTWixJQUFBLEdBQU0sU0FBQTtJQUNKLElBQUcsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFIO2FBQ0UsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksSUFBWixFQUNFO1FBQUEsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ1AsS0FBSyxDQUFDLFFBQU4sQ0FBaUIsQ0FBQyxLQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFY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LE1BQVosQ0FBRCxDQUFqQyxHQUFzRDtJQURwRCxDQUFyQjtJQUVBLGVBQUEsR0FBa0IsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsaUJBQVY7SUFDbEIsSUFBdUMsZUFBZSxDQUFDLE1BQWhCLEtBQTBCLENBQWpFO01BQUEsZUFBZSxDQUFDLElBQWhCLENBQXFCLGFBQXJCLEVBQUE7O0FBQ0EsV0FBTztFQU5ZOzsrQkFRckIsT0FBQSxHQUFTLFNBQUE7V0FDUCxJQUFDLENBQUEsbUJBQW1CLENBQUMsS0FBckIsQ0FBQTtFQURPOzs7O0dBdlVzQixRQUFRLENBQUMiLCJmaWxlIjoibGVzc29uUGxhbi9MZXNzb25QbGFuRWRpdFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBMZXNzb25QbGFuRWRpdFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogJ2xlc3NvblBsYW5fZWRpdF92aWV3J1xuXG4gIGV2ZW50cyA6XG4gICAgJ2NsaWNrICNhcmNoaXZlX2J1dHRvbnMgaW5wdXQnIDogJ3NhdmUnXG4gICAgJ2NsaWNrIC5iYWNrJyAgICAgICAgICAgICAgICAgIDogJ2dvQmFjaydcbiAgICAnY2xpY2sgLm5ld19lbGVtZW50X2J1dHRvbicgICAgOiAndG9nZ2xlTmV3RWxlbWVudEZvcm0nXG4gICAgJ2NsaWNrIC5uZXdfZWxlbWVudF9jYW5jZWwnICAgIDogJ3RvZ2dsZU5ld0VsZW1lbnRGb3JtJ1xuXG4gICAgJ2tleXByZXNzICNuZXdfZWxlbWVudF9uYW1lJyAgIDogJ3NhdmVOZXdFbGVtZW50J1xuICAgICdjbGljayAubmV3X2VsZW1lbnRfc2F2ZScgICAgICA6ICdzYXZlTmV3RWxlbWVudCdcblxuICAgICdjaGFuZ2UgI2Jhc2ljIGlucHV0JyAgICAgICAgICA6ICdzYXZlJ1xuICAgICdjbGljayAuc2F2ZScgICAgICAgICAgICAgICAgICA6ICdzYXZlJ1xuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEBtb2RlbCA9IG9wdGlvbnMubW9kZWxcbiAgICBAZWxlbWVudExpc3RFZGl0VmlldyA9IG5ldyBFbGVtZW50TGlzdEVkaXRWaWV3XG4gICAgICBcImxlc3NvblBsYW5cIiA6IEBtb2RlbFxuICAgICAgXCJhc3Nlc3NtZW50XCIgOiBAbW9kZWxcblxuICAgIEBtb2RlbC5lbGVtZW50cy5vbiBcImNoYW5nZSByZW1vdmVcIiwgQGVsZW1lbnRMaXN0RWRpdFZpZXcucmVuZGVyXG4gICAgQG1vZGVsLmVsZW1lbnRzLm9uIFwiYWxsXCIsIEB1cGRhdGVFbGVtZW50TGVnZW5kXG5cbiAgc2F2ZTogPT5cbiAgICBpZiBAdXBkYXRlTW9kZWwoKVxuICAgICAgQG1vZGVsLnNhdmUgbnVsbCxcbiAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICBVdGlscy5taWRBbGVydCBcIiN7QG1vZGVsLmdldChcIm5hbWVcIil9IHNhdmVkXCJcbiAgICAgICAgZXJyb3I6ID0+XG4gICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJMZXNzb25QbGFuIHNhdmUgZXJyb3IuIFBsZWFzZSB0cnkgYWdhaW4uXCJcblxuICBnb0JhY2s6IC0+IFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJhc3Nlc3NtZW50c1wiLCB0cnVlXG5cbiAgdXBkYXRlTW9kZWw6ID0+XG5cbiNcbiMgcGFyc2UgYWNjZXB0YWJsZSByYW5kb20gc2VxdWVuY2VzXG4jXG5cbiAgICBlbGVtZW50Q291bnQgPSBAbW9kZWwuZWxlbWVudHMubW9kZWxzLmxlbmd0aFxuXG4gICAgIyByZW1vdmUgZXZlcnl0aGluZyBleGNlcHQgbnVtYmVycywgY29tbWFzIGFuZCBuZXcgbGluZXNcbiAgICBzZXF1ZW5jZXNWYWx1ZSA9IEAkZWwuZmluZChcIiNzZXF1ZW5jZXNcIikudmFsKCkucmVwbGFjZSgvW14wLTksXFxuXS9nLFwiXCIpXG4gICAgc2VxdWVuY2VzID0gc2VxdWVuY2VzVmFsdWUuc3BsaXQoXCJcXG5cIilcblxuICAgICMgcGFyc2Ugc3RyaW5ncyB0byBudW1iZXJzIGFuZCBjb2xsZWN0IGVycm9yc1xuICAgIGZvciBzZXF1ZW5jZSwgaSBpbiBzZXF1ZW5jZXNcblxuICAgICAgc2VxdWVuY2UgPSBzZXF1ZW5jZS5zcGxpdChcIixcIilcbiAgICAgIGZvciBlbGVtZW50LCBqIGluIHNlcXVlbmNlXG4gICAgICAgIHNlcXVlbmNlW2pdID0gcGFyc2VJbnQoZWxlbWVudClcbiAgICAgICAgcmFuZ2VFcnJvciA9IHRydWUgaWYgc2VxdWVuY2Vbal0gPCAwIG9yIHNlcXVlbmNlW2pdID49IGVsZW1lbnRDb3VudFxuICAgICAgICBlbXB0eUVycm9yID0gdHJ1ZSBpZiBpc05hTihzZXF1ZW5jZVtqXSlcblxuICAgICAgc2VxdWVuY2VzW2ldID0gc2VxdWVuY2VcblxuICAgICAgIyBkZXRlY3QgZXJyb3JzXG4gICAgICB0b29NYW55RXJyb3IgPSB0cnVlIGlmIHNlcXVlbmNlLmxlbmd0aCA+IGVsZW1lbnRDb3VudFxuICAgICAgdG9vRmV3RXJyb3IgID0gdHJ1ZSBpZiBzZXF1ZW5jZS5sZW5ndGggPCBlbGVtZW50Q291bnRcbiAgICAgIGRvdWJsZXNFcnJvciA9IHRydWUgaWYgc2VxdWVuY2UubGVuZ3RoICE9IF8udW5pcShzZXF1ZW5jZSkubGVuZ3RoXG5cbiAgICAjIHNob3cgZXJyb3JzIGlmIHRoZXkgZXhpc3QgYW5kIHNlcXVlbmNlcyBleGlzdFxuICAgIGlmIG5vdCBfLmlzRW1wdHkgXy5yZWplY3QoIF8uZmxhdHRlbihzZXF1ZW5jZXMpLCAoZSkgLT4gcmV0dXJuIGlzTmFOKGUpKSAjIHJlbW92ZSB1bnBhcnNhYmxlIGVtcHRpZXMsIGRvbid0IF8uY29tcGFjdC4gd2lsbCByZW1vdmUgMHNcbiAgICAgIHNlcXVlbmNlRXJyb3JzID0gW11cbiAgICAgIGlmIGVtcHR5RXJyb3IgICB0aGVuIHNlcXVlbmNlRXJyb3JzLnB1c2ggXCJTb21lIHNlcXVlbmNlcyBjb250YWluIGVtcHR5IHZhbHVlcy5cIlxuICAgICAgaWYgcmFuZ2VFcnJvciAgIHRoZW4gc2VxdWVuY2VFcnJvcnMucHVzaCBcIlNvbWUgbnVtYmVycyBkbyBub3QgcmVmZXJlbmNlIGEgZWxlbWVudCBmcm9tIHRoZSBsZWdlbmQuXCJcbiAgICAgIGlmIHRvb01hbnlFcnJvciB0aGVuIHNlcXVlbmNlRXJyb3JzLnB1c2ggXCJTb21lIHNlcXVlbmNlcyBhcmUgbG9uZ2VyIHRoYW4gdGhlIHRvdGFsIG51bWJlciBvZiBhbGwgZWxlbWVudHMuXCJcbiAgICAgIGlmIHRvb0Zld0Vycm9yICB0aGVuIHNlcXVlbmNlRXJyb3JzLnB1c2ggXCJTb21lIHNlcXVlbmNlcyBhcmUgc2hvcnRlciB0aGFuIHRoZSB0b3RhbCBudW1iZXIgb2YgYWxsIGVsZW1lbnRzLlwiXG4gICAgICBpZiBkb3VibGVzRXJyb3IgdGhlbiBzZXF1ZW5jZUVycm9ycy5wdXNoIFwiU29tZSBzZXF1ZW5jZXMgY29udGFpbiBkb3VibGVzLlwiXG5cbiAgICAgIGlmIHNlcXVlbmNlRXJyb3JzLmxlbmd0aCA9PSAwXG4jIGlmIHRoZXJlJ3Mgbm8gZXJyb3JzLCBjbGVhbiB1cCB0aGUgdGV4dGFyZWEgY29udGVudFxuICAgICAgICB2YWxpZGF0ZWRTZXF1ZW5jZXMgPSAoc2VxdWVuY2Uuam9pbihcIiwgXCIpIGZvciBzZXF1ZW5jZSBpbiBzZXF1ZW5jZXMpLmpvaW4oXCJcXG5cIilcbiAgICAgICAgQCRlbC5maW5kKFwiI3NlcXVlbmNlc1wiKS52YWwodmFsaWRhdGVkU2VxdWVuY2VzKVxuICAgICAgZWxzZSAjIGlmIHRoZXJlJ3MgZXJyb3JzLCB0aGV5IGNhbiBzdGlsbCBzYXZlLiBKdXN0IHNob3cgYSB3YXJuaW5nXG4gICAgICAgIGFsZXJ0IFwiV2FybmluZ1xcblxcbiN7c2VxdWVuY2VFcnJvcnMuam9pbihcIlxcblwiKX1cIlxuXG4jIG5vdGhpbmcgcmVzZW1ibGluZyBhIHZhbGlkIHNlcXVlbmNlIHdhcyBmb3VuZFxuICAgIGVsc2VcbiAgICAgIEAkZWwuZmluZChcIiNzZXF1ZW5jZXNcIikudmFsKFwiXCIpICMgY2xlYW4gdGV4dCBhcmVhXG5cbiAgICBAbW9kZWwuc2V0XG4gICAgICBzZXF1ZW5jZXMgOiBzZXF1ZW5jZXNcbiAgICAgIGFyY2hpdmVkICA6IEAkZWwuZmluZChcIiNhcmNoaXZlX2J1dHRvbnMgaW5wdXQ6Y2hlY2tlZFwiKS52YWwoKSA9PSBcInRydWVcIlxuICAgICAgbmFtZSAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fbmFtZVwiKS52YWwoKVxuICAgICAgZEtleSAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fZF9rZXlcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5fdGl0bGUgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX3RpdGxlXCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuX2xlc3Nvbl90ZXh0ICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9sZXNzb25fdGV4dFwiKS52YWwoKVxuIyAgICAgIGxlc3NvblBsYW5fc3ViamVjdCAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fc3ViamVjdFwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl9zdWJqZWN0ICAgICAgOiBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbl9zdWJqZWN0X2J1dHRvbnMgaW5wdXQ6Y2hlY2tlZFwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl9ncmFkZSAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fZ3JhZGVcIikudmFsKClcbiAgICAgIGxlc3NvblBsYW5fd2VlayAgICAgIDogQCRlbC5maW5kKFwiI2xlc3NvblBsYW5fd2Vla1wiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbl9kYXkgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX2RheVwiKS52YWwoKVxuIyAgICAgIGxlc3NvblBsYW5faW1hZ2UgICAgICA6IEAkZWwuZmluZChcIiNsZXNzb25QbGFuX2ltYWdlXCIpLnZhbCgpXG4gICAgICBsZXNzb25QbGFuSWQgOiBAbW9kZWwuaWRcbiAgICAgIGFzc2Vzc21lbnRJZCA6IEBtb2RlbC5pZFxuICAgIHJldHVybiB0cnVlXG5cbiAgdG9nZ2xlTmV3RWxlbWVudEZvcm06IChldmVudCkgLT5cbiAgICBAJGVsLmZpbmQoXCIubmV3X2VsZW1lbnRfZm9ybSwgLm5ld19lbGVtZW50X2J1dHRvblwiKS50b2dnbGUoKVxuXG4gICAgQCRlbC5maW5kKFwiI25ld19lbGVtZW50X25hbWVcIikudmFsKFwiXCIpXG4gICAgQCRlbC5maW5kKFwiI2VsZW1lbnRfdHlwZV9zZWxlY3RcIikudmFsKFwibm9uZVwiKVxuXG4gICAgZmFsc2VcblxuICBzYXZlTmV3RWxlbWVudDogKGV2ZW50KSA9PlxuXG4gICAgaWYgZXZlbnQudHlwZSAhPSBcImNsaWNrXCIgJiYgZXZlbnQud2hpY2ggIT0gMTNcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICAjIGlmIG5vIGVsZW1lbnQgdHlwZSBzZWxlY3RlZCwgc2hvdyBlcnJvclxuICAgIGlmIEAkZWwuZmluZChcIiNlbGVtZW50X3R5cGVfc2VsZWN0IG9wdGlvbjpzZWxlY3RlZFwiKS52YWwoKSA9PSBcIm5vbmVcIlxuICAgICAgVXRpbHMubWlkQWxlcnQgXCJQbGVhc2Ugc2VsZWN0IGFuIGVsZW1lbnQgdHlwZVwiXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgICMgZ2VuZXJhbCB0ZW1wbGF0ZVxuICAgIG5ld0F0dHJpYnV0ZXMgPSBUYW5nZXJpbmUudGVtcGxhdGVzLmdldChcImVsZW1lbnRcIilcblxuICAgICMgcHJvdG90eXBlIHRlbXBsYXRlXG4gICAgcHJvdG90eXBlVGVtcGxhdGUgPSBUYW5nZXJpbmUudGVtcGxhdGVzLmdldChcImVsZW1lbnRUeXBlc1wiKVtAJGVsLmZpbmQoXCIjZWxlbWVudF90eXBlX3NlbGVjdFwiKS52YWwoKV1cblxuICAgICMgYml0IG1vcmUgc3BlY2lmaWMgdGVtcGxhdGVcbiMgICAgdXNlVHlwZSA9IEAkZWwuZmluZChcIiNlbGVtZW50X3R5cGVfc2VsZWN0IDpzZWxlY3RlZFwiKS5hdHRyICdkYXRhLXRlbXBsYXRlJ1xuIyAgICB1c2VUeXBlVGVtcGxhdGUgPSBUYW5nZXJpbmUudGVtcGxhdGVzLmdldChcImVsZW1lbnRUZW1wbGF0ZXNcIilbQCRlbC5maW5kKFwiI2VsZW1lbnRfdHlwZV9zZWxlY3RcIikudmFsKCldW3VzZVR5cGVdXG4gICAgdXNlVHlwZVRlbXBsYXRlID0gVGFuZ2VyaW5lLnRlbXBsYXRlcy5nZXQoXCJlbGVtZW50XCIpO1xuXG4jICAgIGZpbGUgPSAkKCc6aW5wdXRbdHlwZT1cImZpbGVcIl0nKVswXS5maWxlc1swXTtcbiAgICBmaWxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWxlc1wiKS5maWxlc1swXVxuICAgIGZkID0gbmV3IEZvcm1EYXRhKClcbiAgICBmZC5hcHBlbmQoXCJmaWxlXCIsIGZpbGUpXG5cbiAgICBuZXdBdHRyaWJ1dGVzID0gJC5leHRlbmQgbmV3QXR0cmlidXRlcywgcHJvdG90eXBlVGVtcGxhdGVcbiAgICBuZXdBdHRyaWJ1dGVzID0gJC5leHRlbmQgbmV3QXR0cmlidXRlcywgdXNlVHlwZVRlbXBsYXRlXG4gICAgbmV3QXR0cmlidXRlcyA9ICQuZXh0ZW5kIG5ld0F0dHJpYnV0ZXMsXG4gICAgICBuYW1lICAgICAgICAgOiBAJGVsLmZpbmQoXCIjbmV3X2VsZW1lbnRfbmFtZVwiKS52YWwoKVxuICAgICAgbGVzc29uUGxhbklkIDogQG1vZGVsLmlkXG4gICAgICBhc3Nlc3NtZW50SWQgOiBAbW9kZWwuaWRcbiAgICAgIG9yZGVyICAgICAgICA6IEBtb2RlbC5lbGVtZW50cy5sZW5ndGhcbiAgICAgIGZpbGVUeXBlICAgICAgICA6IGZpbGUudHlwZVxuICAgICAgZmlsZU5hbWUgIDpmaWxlLm5hbWVcbiAgICAgIGZpbGVTaXplICA6ZmlsZS5zaXplXG5cbiMgICAgICAgIGZpbGVzIDogQCRlbC5maW5kKFwiI19hdHRhY2htZW50c1wiKS52YWwoKVxuICAgICMgICAgZm9ybURhdGE6IGZhbHNlXG5cbiAgICBvcHRpb25zID1cbiAgICAgIHN1Y2Nlc3M6IChtb2RlbCwgcmVzcCkgPT5cbiAgICAgICAgY29uc29sZS5sb2coXCJjcmVhdGVkOiBcIiArIEpTT04uc3RyaW5naWZ5KHJlc3ApICsgXCIgTW9kZWw6IFwiICsgSlNPTi5zdHJpbmdpZnkobW9kZWwpKVxuIyAgICAgICAgdXJsID0gXCIje0JhY2tib25lLmNvdWNoX2Nvbm5lY3Rvci5jb25maWcuYmFzZV91cmx9LyN7VGFuZ2VyaW5lLnNldHRpbmdzLmdyb3VwREJ9LyN7cmVzcC5faWR9LyN7ZmlsZS5uYW1lfT9yZXY9I3tyZXNwLl9yZXZ9XCJcbiAgICAgICAgdXJsID0gXCIje1RhbmdlcmluZS5jb25maWcuZ2V0KCdyb2JiZXJ0Jyl9L2ZpbGVzXCJcbiAgICAgICAgY29uc29sZS5sb2coXCJ1cmw6IFwiICsgdXJsKVxuIyAgICAgICAgJC5hamF4XG4jICAgICAgICAgIHVybDogdXJsXG4jICAgICAgICAgIHR5cGU6ICdQVVQnXG4jICAgICAgICAgIHN1Y2Nlc3M6IChyZXN1bHQpIC0+XG4jICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZXN1bHQ6IFwiICsgSlNPTi5zdHJpbmdpZnkocmVzdWx0KSlcbiMgICAgICAgICAgZXJyb3I6IChyZXN1bHQpIC0+XG4jICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZXN1bHQ6IFwiICsgIEpTT04uc3RyaW5naWZ5KHJlc3VsdCkpXG5cbiMgICAgICAgIGZpbGUgPSBuZXcgQmxvYihbJ2hlbGxvIHdvcmxkJ10sIHt0eXBlOiAndGV4dC9wbGFpbid9KVxuICAgICAgICBjb25zb2xlLmxvZyhcImZpbGUgc2l6ZTogXCIgKyBmaWxlLnNpemUpXG4gICAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgICMgZGVmaW5lIG91ciBmaW5pc2ggZm5cbiAgICAgICAgbG9hZGVkID0gKCktPlxuICAgICAgICAgIGNvbnNvbGUubG9nKCdmaW5pc2hlZCB1cGxvYWRpbmcnKVxuIyAgICAgICAgICAkKFwiI2FkZEZpbGVcIikub25lIFwiY2xpY2tcIiwgaGFuZGxlclxuXG4gICAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyICdsb2FkJywgbG9hZGVkLCBmYWxzZVxuICAgICAgICBwcm9ncmVzc0JhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3Byb2dyZXNzJyk7XG4gICAgICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IChlKSA9PlxuICAgICAgICAgIGlmIGUubGVuZ3RoQ29tcHV0YWJsZVxuICAgICAgICAgICAgcHJvZ3Jlc3NCYXIudmFsdWUgPSAoZS5sb2FkZWQgLyBlLnRvdGFsKSAqIDEwMDtcbiAgICAgICAgICAgIHByb2dyZXNzQmFyLnRleHRDb250ZW50ID0gcHJvZ3Jlc3NCYXIudmFsdWU7XG5cbiMgICAgICAgIHhoci5vcGVuKCdQVVQnLCB1cmwsIHRydWUpO1xuICAgICAgICB4aHIub3BlbignUE9TVCcsIHVybCwgdHJ1ZSk7XG4gICAgICAgIHhoci5zZW5kKGZkKTtcbiAgICAgIGVycm9yOiAobW9kZWwsIGVycikgPT5cbiAgICAgICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIgKyBKU09OLnN0cmluZ2lmeShlcnIpICsgXCIgTW9kZWw6IFwiICsgSlNPTi5zdHJpbmdpZnkobW9kZWwpKVxuICAgIG5ld0VsZW1lbnQgPSBAbW9kZWwuZWxlbWVudHMuY3JlYXRlIG5ld0F0dHJpYnV0ZXMsIG9wdGlvbnNcbiAgICBuZXdFbGVtZW50Lm9uKCdwcm9ncmVzcycsIChldnQpIC0+XG4gICAgICBjb25zb2xlLmxvZyhldnQpXG4gICAgKVxuXG4gICAgQHRvZ2dsZU5ld0VsZW1lbnRGb3JtKClcbiAgICByZXR1cm4gZmFsc2VcblxuICByZW5kZXI6ID0+XG4gICAgbGVzc29uUGxhbl90aXRsZSAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX3RpdGxlXCIpXG4gICAgbGVzc29uUGxhbl9sZXNzb25fdGV4dCAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX2xlc3Nvbl90ZXh0XCIpXG4gICAgbGVzc29uUGxhbl9zdWJqZWN0ICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxlc3NvblBsYW5fc3ViamVjdFwiKVxuICAgIGxlc3NvblBsYW5fZ3JhZGUgICAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwibGVzc29uUGxhbl9ncmFkZVwiKVxuICAgIGxlc3NvblBsYW5fd2VlayAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX3dlZWtcIilcbiAgICBsZXNzb25QbGFuX2RheSAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJsZXNzb25QbGFuX2RheVwiKVxuICAgIHNlcXVlbmNlcyA9IFwiXCJcbiAgICBpZiBAbW9kZWwuaGFzKFwic2VxdWVuY2VzXCIpXG4gICAgICBzZXF1ZW5jZXMgPSBAbW9kZWwuZ2V0KFwic2VxdWVuY2VzXCIpXG4gICAgICBzZXF1ZW5jZXMgPSBzZXF1ZW5jZXMuam9pbihcIlxcblwiKVxuXG4gICAgICBpZiBfLmlzQXJyYXkoc2VxdWVuY2VzKVxuICAgICAgICBmb3Igc2VxdWVuY2VzLCBpIGluIHNlcXVlbmNlc1xuICAgICAgICAgIHNlcXVlbmNlc1tpXSA9IHNlcXVlbmNlcy5qb2luKFwiLCBcIilcblxuICAgIGVsZW1lbnRMZWdlbmQgPSBAdXBkYXRlRWxlbWVudExlZ2VuZCgpXG5cbiAgICBhcmNoID0gQG1vZGVsLmdldCgnYXJjaGl2ZWQnKVxuICAgIGFyY2hpdmVDaGVja2VkICAgID0gaWYgKGFyY2ggPT0gdHJ1ZSBvciBhcmNoID09ICd0cnVlJykgdGhlbiBcImNoZWNrZWRcIiBlbHNlIFwiXCJcbiAgICBub3RBcmNoaXZlQ2hlY2tlZCA9IGlmIGFyY2hpdmVDaGVja2VkIHRoZW4gXCJcIiBlbHNlIFwiY2hlY2tlZFwiXG5cbiAgICBsZXNzb25QbGFuX3N1YmplY3RfRW5naXNoICAgID0gaWYgKGxlc3NvblBsYW5fc3ViamVjdCA9PSAnMScpIHRoZW4gXCJjaGVja2VkXCIgZWxzZSBcIlwiXG4gICAgbGVzc29uUGxhbl9zdWJqZWN0X0tpc3dhaGlsaSA9IGlmIChsZXNzb25QbGFuX3N1YmplY3QgPT0gJzInKSB0aGVuIFwiY2hlY2tlZFwiIGVsc2UgXCJcIlxuXG4gICAgIyBsaXN0IG9mIFwidGVtcGxhdGVzXCJcbiAgICBlbGVtZW50VHlwZVNlbGVjdCA9IFwiPHNlbGVjdCBpZD0nZWxlbWVudF90eXBlX3NlbGVjdCc+XG4gICAgICA8b3B0aW9uIHZhbHVlPSdub25lJyBkaXNhYmxlZD0nZGlzYWJsZWQnIHNlbGVjdGVkPSdzZWxlY3RlZCc+UGxlYXNlIHNlbGVjdCBhIGVsZW1lbnQgdHlwZTwvb3B0aW9uPlwiXG4gICAgZm9yIGtleSwgdmFsdWUgb2YgVGFuZ2VyaW5lLnRlbXBsYXRlcy5nZXQoXCJlbGVtZW50VHlwZXNcIilcbiMgICAgICBlbGVtZW50VHlwZVNlbGVjdCArPSBcIjxvcHRncm91cCBsYWJlbD0nI3trZXkuaHVtYW5pemUoKX0nPlwiXG4jICAgICAgZm9yIHN1YktleSwgc3ViVmFsdWUgb2YgdmFsdWVcbiAgICAgICAgZWxlbWVudFR5cGVTZWxlY3QgKz0gXCI8b3B0aW9uIHZhbHVlPScje2tleX0nIGRhdGEtdGVtcGxhdGU9JyN7a2V5fSc+I3trZXkuaHVtYW5pemUoKX08L29wdGlvbj5cIlxuIyAgICAgIGVsZW1lbnRUeXBlU2VsZWN0ICs9IFwiPC9vcHRncm91cD5cIlxuICAgIGVsZW1lbnRUeXBlU2VsZWN0ICs9IFwiPC9zZWxlY3Q+XCJcblxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGJ1dHRvbiBjbGFzcz0nYmFjayBuYXZpZ2F0aW9uJz5CYWNrPC9idXR0b24+XG4gICAgICAgIDxoMT5MZXNzb25QbGFuIEJ1aWxkZXI8L2gxPlxuICAgICAgPGRpdiBpZD0nYmFzaWMnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX25hbWUnPk5hbWU8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgaWQ9J2xlc3NvblBsYW5fbmFtZScgdmFsdWU9JyN7QG1vZGVsLmVzY2FwZShcIm5hbWVcIil9Jz5cblxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX2Rfa2V5JyB0aXRsZT0nVGhpcyBrZXkgaXMgdXNlZCB0byBpbXBvcnQgdGhlIGxlc3NvblBsYW4gZnJvbSBhIHRhYmxldC4nPkRvd25sb2FkIEtleTwvbGFiZWw+PGJyPlxuICAgICAgICA8ZGl2IGNsYXNzPSdpbmZvX2JveCc+I3tAbW9kZWwuaWQuc3Vic3RyKC01LDUpfTwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxsYWJlbCB0aXRsZT0nT25seSBhY3RpdmUgbGVzc29uUGxhbnMgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIG1haW4gbGVzc29uUGxhbiBsaXN0Lic+U3RhdHVzPC9sYWJlbD48YnI+XG4gICAgICA8ZGl2IGlkPSdhcmNoaXZlX2J1dHRvbnMnIGNsYXNzPSdidXR0b25zZXQnPlxuICAgICAgICA8aW5wdXQgdHlwZT0ncmFkaW8nIGlkPSdhcmNoaXZlX2ZhbHNlJyBuYW1lPSdhcmNoaXZlJyB2YWx1ZT0nZmFsc2UnICN7bm90QXJjaGl2ZUNoZWNrZWR9PjxsYWJlbCBmb3I9J2FyY2hpdmVfZmFsc2UnPkFjdGl2ZTwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCB0eXBlPSdyYWRpbycgaWQ9J2FyY2hpdmVfdHJ1ZScgIG5hbWU9J2FyY2hpdmUnIHZhbHVlPSd0cnVlJyAgI3thcmNoaXZlQ2hlY2tlZH0+PGxhYmVsIGZvcj0nYXJjaGl2ZV90cnVlJz5BcmNoaXZlZDwvbGFiZWw+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX3RpdGxlJz5MZXNzb25QbGFuIFRpdGxlPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IGlkPSdsZXNzb25QbGFuX3RpdGxlJyB2YWx1ZT0nI3tsZXNzb25QbGFuX3RpdGxlfSc+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0nbGVzc29uUGxhbl9sZXNzb25fdGV4dCcgdGl0bGU9J0xlc3NvbiBUZXh0Lic+TGVzc29uUGxhbiBUZXh0PC9sYWJlbD5cbiAgICAgICAgICA8dGV4dGFyZWEgaWQ9J2xlc3NvblBsYW5fbGVzc29uX3RleHQnPiN7bGVzc29uUGxhbl9sZXNzb25fdGV4dH08L3RleHRhcmVhPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8bGFiZWwgdGl0bGU9J1lvdSBtdXN0IGNob29zZSBvbmUgb2YgdGhlc2Ugc3ViamVjdHMuJyBmb3I9J2xlc3NvblBsYW5fc3ViamVjdF9idXR0b25zJz5MZXNzb25QbGFuIHN1YmplY3Q8L2xhYmVsPjxicj5cbiAgICAgIDxkaXYgaWQ9J2xlc3NvblBsYW5fc3ViamVjdF9idXR0b25zJyBjbGFzcz0nYnV0dG9uc2V0Jz5cbiAgICAgICAgPGlucHV0IHR5cGU9J3JhZGlvJyBpZD0nbGVzc29uUGxhbl9zdWJqZWN0X0VuZ2lzaCcgbmFtZT0nbGVzc29uUGxhbl9zdWJqZWN0JyB2YWx1ZT0nMScgI3tsZXNzb25QbGFuX3N1YmplY3RfRW5naXNofT48bGFiZWwgZm9yPSdsZXNzb25QbGFuX3N1YmplY3RfRW5naXNoJz5Fbmdpc2g8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgdHlwZT0ncmFkaW8nIGlkPSdsZXNzb25QbGFuX3N1YmplY3RfS2lzd2FoaWxpJyAgbmFtZT0nbGVzc29uUGxhbl9zdWJqZWN0JyB2YWx1ZT0nMicgICN7bGVzc29uUGxhbl9zdWJqZWN0X0tpc3dhaGlsaX0+PGxhYmVsIGZvcj0nbGVzc29uUGxhbl9zdWJqZWN0X0tpc3dhaGlsaSc+S2lzd2FoaWxpPC9sYWJlbD5cbiAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2xlc3NvblBsYW5fZ3JhZGUnPkxlc3NvblBsYW4gR3JhZGU8L2xhYmVsPlxuICAgICAgPGlucHV0IGlkPSdsZXNzb25QbGFuX2dyYWRlJyB2YWx1ZT0nI3tsZXNzb25QbGFuX2dyYWRlfSc+XG4gICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX3dlZWsnPkxlc3NvblBsYW4gV2VlazwvbGFiZWw+XG4gICAgICA8aW5wdXQgaWQ9J2xlc3NvblBsYW5fd2VlaycgdmFsdWU9JyN7bGVzc29uUGxhbl93ZWVrfSc+XG4gICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdsZXNzb25QbGFuX2RheSc+TGVzc29uUGxhbiBEYXk8L2xhYmVsPlxuICAgICAgPGlucHV0IGlkPSdsZXNzb25QbGFuX2RheScgdmFsdWU9JyN7bGVzc29uUGxhbl9kYXl9Jz5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8aDI+RWxlbWVudHM8L2gyPlxuICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICA8cHJvZ3Jlc3MgbWluPScwJyBtYXg9JzEwMCcgdmFsdWU9JzAnPjwvcHJvZ3Jlc3M+XG4gICAgICAgIDxkaXY+XG4gICAgICAgIDx1bCBpZD0nZWxlbWVudF9saXN0Jz5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxidXR0b24gY2xhc3M9J25ld19lbGVtZW50X2J1dHRvbiBjb21tYW5kJz5BZGQgRWxlbWVudDwvYnV0dG9uPlxuICAgICAgICA8ZGl2IGNsYXNzPSduZXdfZWxlbWVudF9mb3JtIGNvbmZpcm1hdGlvbic+XG4gICAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgICAgPGgyPk5ldyBFbGVtZW50PC9oMj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J2VsZW1lbnRfdHlwZV9zZWxlY3QnPlR5cGU8L2xhYmVsPjxicj5cbiAgICAgICAgICAgICN7ZWxlbWVudFR5cGVTZWxlY3R9PGJyPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0nbmV3X2VsZW1lbnRfbmFtZSc+TmFtZTwvbGFiZWw+PGJyPlxuICAgICAgICAgICAgPGlucHV0IHR5cGU9J3RleHQnIGlkPSduZXdfZWxlbWVudF9uYW1lJz5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPSdmaWxlJyBuYW1lPSdmaWxlcycgaWQ9J2ZpbGVzJyBtdWx0aXBsZT0nbXVsdGlwbGUnIC8+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduZXdfZWxlbWVudF9zYXZlIGNvbW1hbmQnPkFkZDwvYnV0dG9uPiA8YnV0dG9uIGNsYXNzPSduZXdfZWxlbWVudF9jYW5jZWwgY29tbWFuZCc+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8aDI+T3B0aW9uczwvaDI+XG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J3NlcXVlbmNlcycgdGl0bGU9J1RoaXMgaXMgYSBsaXN0IG9mIGFjY2VwdGFibGUgb3JkZXJzIG9mIGVsZW1lbnRzLCB3aGljaCB3aWxsIGJlIHJhbmRvbWx5IHNlbGVjdGVkIGVhY2ggdGltZSBhbiBsZXNzb25QbGFuIGlzIHJ1bi4gRWxlbWVudCBpbmRpY2llcyBhcmUgc2VwYXJhdGVkIGJ5IGNvbW1hcywgbmV3IGxpbmVzIHNlcGFyYXRlIHNlcXVlbmNlcy4gJz5SYW5kb20gU2VxdWVuY2VzPC9sYWJlbD5cbiAgICAgICAgPGRpdiBpZD0nZWxlbWVudF9sZWdlbmQnPiN7ZWxlbWVudExlZ2VuZH08L2Rpdj5cbiAgICAgICAgPHRleHRhcmVhIGlkPSdzZXF1ZW5jZXMnPiN7c2VxdWVuY2VzfTwvdGV4dGFyZWE+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxidXR0b24gY2xhc3M9J3NhdmUgY29tbWFuZCc+U2F2ZTwvYnV0dG9uPlxuICAgICAgXCJcblxuICAgICMgcmVuZGVyIG5ldyBlbGVtZW50IHZpZXdzXG4gICAgQGVsZW1lbnRMaXN0RWRpdFZpZXcuc2V0RWxlbWVudChAJGVsLmZpbmQoXCIjZWxlbWVudF9saXN0XCIpKVxuICAgIEBlbGVtZW50TGlzdEVkaXRWaWV3LnJlbmRlcigpXG5cbiAgICAjIG1ha2UgaXQgc29ydGFibGVcbiAgICBAJGVsLmZpbmQoXCIjZWxlbWVudF9saXN0XCIpLnNvcnRhYmxlXG4gICAgICBoYW5kbGUgOiAnLnNvcnRhYmxlX2hhbmRsZSdcbiAgICAgIHN0YXJ0OiAoZXZlbnQsIHVpKSAtPiB1aS5pdGVtLmFkZENsYXNzIFwiZHJhZ19zaGFkb3dcIlxuICAgICAgc3RvcDogIChldmVudCwgdWkpIC0+IHVpLml0ZW0ucmVtb3ZlQ2xhc3MgXCJkcmFnX3NoYWRvd1wiXG4gICAgICB1cGRhdGUgOiAoZXZlbnQsIHVpKSA9PlxuICAgICAgICBmb3IgaWQsIGkgaW4gKCQobGkpLmF0dHIoXCJkYXRhLWlkXCIpIGZvciBsaSBpbiBAJGVsLmZpbmQoXCIjZWxlbWVudF9saXN0IGxpXCIpKVxuICAgICAgICAgIEBtb2RlbC5lbGVtZW50cy5nZXQoaWQpLnNldCh7XCJvcmRlclwiOml9LHtzaWxlbnQ6dHJ1ZX0pLnNhdmUobnVsbCx7c2lsZW50OnRydWV9KVxuICAgICAgICBAbW9kZWwuZWxlbWVudHMuc29ydCgpXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuXG4gIHVwZGF0ZUVsZW1lbnRMZWdlbmQ6ID0+XG4gICAgZWxlbWVudExlZ2VuZCA9IFwiXCJcbiAgICBAbW9kZWwuZWxlbWVudHMuZWFjaCAoZWxlbWVudCwgaSkgLT5cbiAgICAgIGVsZW1lbnRMZWdlbmQgKz0gXCI8ZGl2IGNsYXNzPSdzbWFsbF9ncmV5Jz4je2l9IC0gI3tlbGVtZW50LmdldChcIm5hbWVcIil9PC9kaXY+PGJyPlwiXG4gICAgJGVsZW1lbnRXcmFwcGVyID0gQCRlbC5maW5kKFwiI2VsZW1lbnRfbGVnZW5kXCIpXG4gICAgJGVsZW1lbnRXcmFwcGVyLmh0bWwoZWxlbWVudExlZ2VuZCkgaWYgJGVsZW1lbnRXcmFwcGVyLmxlbmd0aCAhPSAwXG4gICAgcmV0dXJuIGVsZW1lbnRMZWdlbmRcblxuICBvbkNsb3NlOiAtPlxuICAgIEBlbGVtZW50TGlzdEVkaXRWaWV3LmNsb3NlKClcbiAgICBcbiJdfQ==
