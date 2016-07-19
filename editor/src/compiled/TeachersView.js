var TeachersView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

TeachersView = (function(superClass) {
  extend(TeachersView, superClass);

  function TeachersView() {
    return TeachersView.__super__.constructor.apply(this, arguments);
  }

  TeachersView.prototype.className = "TeachersView";

  TeachersView.prototype.events = {
    "click .edit_in_place": "editInPlace",
    "focusout .editing": "editing",
    "keyup    .editing": "editing",
    "keydown  .editing": "editing",
    'click    .change_password': "changePassword",
    'change   .show_password': "showPassword",
    'click    .save_password': 'savePassword',
    'click    .back': 'goBack'
  };

  TeachersView.prototype.goBack = function() {
    return window.history.back();
  };

  TeachersView.prototype.initialize = function(options) {
    this.teachers = options.teachers;
    this.users = options.users;
    this.usersByTeacherId = this.users.indexBy("teacherId");
    return this.teacherProperties = [
      {
        "key": "name",
        "editable": true,
        "headerless": true
      }, {
        "key": "first",
        "label": "First",
        "editable": true,
        "escaped": true
      }, {
        "key": "last",
        "label": "Last",
        "editable": true,
        "escaped": true
      }, {
        "key": "gender",
        "label": "Gender",
        "editable": true
      }, {
        "key": "school",
        "label": "School name",
        "editable": true
      }, {
        "key": "contact",
        "label": "Contact Information",
        "editable": true
      }
    ];
  };

  TeachersView.prototype.showPassword = function(event) {
    var $target, teacherId;
    $target = $(event.target);
    teacherId = $target.attr("data-teacherId");
    if (this.$el.find("." + teacherId + "_password").attr("type") === "password") {
      return this.$el.find("." + teacherId + "_password").attr("type", "text");
    } else {
      return this.$el.find("." + teacherId + "_password").attr("type", "password");
    }
  };

  TeachersView.prototype.changePassword = function(event) {
    var $target, teacherId;
    $target = $(event.target);
    teacherId = $target.attr("data-teacherId");
    this.$el.find("." + teacherId + "_menu").toggleClass("confirmation");
    this.$el.find("." + teacherId).scrollTo();
    return this.$el.find("." + teacherId + "_password").focus();
  };

  TeachersView.prototype.savePassword = function(event) {
    var $target, teacherId, teacherModel, userModel;
    $target = $(event.target);
    teacherId = $target.attr("data-teacherId");
    teacherModel = this.teachers.get(teacherId);
    userModel = this.usersByTeacherId[teacherId][0];
    userModel.setPassword(this.$el.find("." + teacherId + "_password").val());
    return userModel.save(null, {
      success: (function(_this) {
        return function() {
          Utils.midAlert("Teacher's password saved");
          _this.$el.find("." + teacherId + "_password").val("");
          return _this.$el.find("." + teacherId + "_menu").toggleClass("confirmation");
        };
      })(this),
      error: (function(_this) {
        return function() {
          return Utils.midAlert("Save error");
        };
      })(this)
    });
  };

  TeachersView.prototype.render = function() {
    var deleteButton, teacherTable;
    teacherTable = this.getTeacherTable();
    deleteButton = "<button class='command_red delete'>Delete</button>";
    this.$el.html("<h1>Teachers</h1> <div id='teacher_table_container'> " + teacherTable + " </div>");
    return this.trigger("rendered");
  };

  TeachersView.prototype.updateTable = function() {
    return this.$el.find("#teacher_table_container").html(this.getTeacherTable());
  };

  TeachersView.prototype.getTeacherTable = function() {
    var html, i, j, len, len1, prop, ref, ref1, teacher;
    html = "";
    ref = this.teachers.models;
    for (i = 0, len = ref.length; i < len; i++) {
      teacher = ref[i];
      html += "<table class='class_table teachers " + teacher.id + "' > <tbody>";
      ref1 = this.teacherProperties;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        prop = ref1[j];
        html += this.propCookRow(prop, teacher);
      }
      html += "<tr class='last'><th><button class='change_password command' data-teacherId='" + teacher.id + "'>Change Password</button><br> <div class='" + teacher.id + "_menu confirmation'> <div class='menu_box'> <input type='password' class='" + teacher.id + "_password'> <table><tr> <th style='padding:0;'><label for='" + teacher.id + "_show_password'>Show password</label></th> <th style='padding:10px'><input type='checkbox' id='" + teacher.id + "_show_password' class='show_password' data-teacherId='" + teacher.id + "'></th> </tr></table> <button class='save_password command' data-teacherId='" + teacher.id + "'>Save</button> </div> </div> </th> </tr> </tbody> </table>";
    }
    return html;
  };

  TeachersView.prototype.propCookRow = function(prop, teacher) {
    var header;
    if (prop.headerless) {
      prop.tagName = "th";
    } else {
      header = "<th>" + prop.label + "</th>";
    }
    return "<tr>" + (header || "") + (this.propCook(prop, teacher)) + "</tr>";
  };

  TeachersView.prototype.propCook = function(prop, teacher) {
    var editOrNot, numberOrNot, tagName, value;
    value = prop.key != null ? teacher.get(prop.key) : "&nbsp;";
    value = prop.escape ? teacher.escape(prop.key) : value;
    if (value == null) {
      value = "_";
    }
    tagName = prop.tagName || "td";
    editOrNot = prop.editable ? "edit_in_place" : "";
    numberOrNot = _.isNumber(value) ? "data-isNumber='true'" : "data-isNumber='false'";
    return "<" + tagName + " class='" + editOrNot + "'><span data-teacherId='" + teacher.id + "' data-key='" + prop.key + "' data-value='" + value + "' " + editOrNot + " " + numberOrNot + ">" + value + "</div></" + tagName + ">";
  };

  TeachersView.prototype.editInPlace = function(event) {
    var $span, $target, $td, $textarea, classes, guid, isNumber, key, margins, oldValue, teacher, teacherId, transferVariables;
    if (this.alreadyEditing) {
      return;
    }
    this.alreadyEditing = true;
    $span = $(event.target);
    if ($span.prop("tagName") === "TD") {
      $span = $span.find("span");
      if ($span.length === 0) {
        return;
      }
    }
    $td = $span.parent();
    this.$oldSpan = $span.clone();
    if ($span.prop("tagName") === "TEXTAREA") {
      return;
    }
    guid = Utils.guid();
    key = $span.attr("data-key");
    isNumber = $span.attr("data-isNumber") === "true";
    teacherId = $span.attr("data-teacherId");
    teacher = this.teachers.get(teacherId);
    oldValue = isNumber ? teacher.getNumber(key) : teacher.getString(key);
    $target = $(event.target);
    classes = ($target.attr("class") || "").replace("settings", "");
    margins = $target.css("margin");
    if (key === 'items') {
      oldValue = oldValue.join(" ");
    }
    transferVariables = "data-isNumber='" + isNumber + "' data-key='" + key + "' data-teacherId='" + teacherId + "' ";
    $td.html("<textarea id='" + guid + "' " + transferVariables + " class='editing " + classes + "' style='margin:" + margins + "'>" + oldValue + "</textarea>");
    $textarea = $("#" + guid);
    return $textarea.focus();
  };

  TeachersView.prototype.editing = function(event) {
    var $target, $td, attributes, isNumber, key, newValue, oldValue, teacher, teacherId;
    $target = $(event.target);
    $td = $target.parent();
    if (event.which === 27 || event.type === "focusout") {
      $target.remove();
      $td.html(this.$oldSpan);
      this.alreadyEditing = false;
      return;
    }
    if (!(event.which === 13 && event.type === "keydown")) {
      return true;
    }
    this.alreadyEditing = false;
    key = $target.attr("data-key");
    isNumber = $target.attr("data-isNumber") === "true";
    teacherId = $target.attr("data-teacherId");
    teacher = this.teachers.get(teacherId);
    oldValue = teacher.get(key);
    newValue = $target.val();
    newValue = isNumber ? parseInt(newValue) : newValue;
    if (key === "items") {
      newValue = newValue.replace(/\s+/g, ' ');
      if (/\t|,/.test(newValue)) {
        alert("Please remember\n\nGrid items are space \" \" delimited");
      }
      newValue = _.compact(newValue.split(" "));
    }
    if (String(newValue) !== String(oldValue)) {
      attributes = {};
      attributes[key] = newValue;
      teacher.save(attributes, {
        success: (function(_this) {
          return function() {
            Utils.topAlert("Teacher saved");
            return teacher.fetch({
              success: function() {
                return _this.updateTable();
              }
            });
          };
        })(this),
        error: (function(_this) {
          return function() {
            return teacher.fetch({
              success: function() {
                _this.updateTable();
                return alert("Please try to save again, it didn't work that time.");
              }
            });
          };
        })(this)
      });
    }
    return false;
  };

  return TeachersView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlYWNoZXIvVGVhY2hlcnNWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFlBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7eUJBRUosU0FBQSxHQUFXOzt5QkFFWCxNQUFBLEdBQ0U7SUFBQSxzQkFBQSxFQUEwQixhQUExQjtJQUNBLG1CQUFBLEVBQXNCLFNBRHRCO0lBRUEsbUJBQUEsRUFBc0IsU0FGdEI7SUFHQSxtQkFBQSxFQUFzQixTQUh0QjtJQUlBLDJCQUFBLEVBQThCLGdCQUo5QjtJQUtBLHlCQUFBLEVBQTRCLGNBTDVCO0lBTUEseUJBQUEsRUFBNEIsY0FONUI7SUFPQSxnQkFBQSxFQUFtQixRQVBuQjs7O3lCQVNGLE1BQUEsR0FBUSxTQUFBO1dBQ04sTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFmLENBQUE7RUFETTs7eUJBR1IsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxRQUFELEdBQVksT0FBTyxDQUFDO0lBQ3BCLElBQUMsQ0FBQSxLQUFELEdBQVksT0FBTyxDQUFDO0lBRXBCLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBZSxXQUFmO1dBRXBCLElBQUMsQ0FBQSxpQkFBRCxHQUNFO01BQ0U7UUFDRSxLQUFBLEVBQWEsTUFEZjtRQUVFLFVBQUEsRUFBYSxJQUZmO1FBR0UsWUFBQSxFQUFlLElBSGpCO09BREYsRUFNRTtRQUNFLEtBQUEsRUFBYSxPQURmO1FBRUUsT0FBQSxFQUFhLE9BRmY7UUFHRSxVQUFBLEVBQWEsSUFIZjtRQUlFLFNBQUEsRUFBYSxJQUpmO09BTkYsRUFZRTtRQUNFLEtBQUEsRUFBYSxNQURmO1FBRUUsT0FBQSxFQUFhLE1BRmY7UUFHRSxVQUFBLEVBQWEsSUFIZjtRQUlFLFNBQUEsRUFBYSxJQUpmO09BWkYsRUFrQkU7UUFDRSxLQUFBLEVBQWEsUUFEZjtRQUVFLE9BQUEsRUFBYSxRQUZmO1FBR0UsVUFBQSxFQUFhLElBSGY7T0Fs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cnNWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgVGVhY2hlcnNWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJUZWFjaGVyc1ZpZXdcIlxuXG4gIGV2ZW50cyA6XG4gICAgXCJjbGljayAuZWRpdF9pbl9wbGFjZVwiICA6IFwiZWRpdEluUGxhY2VcIlxuICAgIFwiZm9jdXNvdXQgLmVkaXRpbmdcIiA6IFwiZWRpdGluZ1wiXG4gICAgXCJrZXl1cCAgICAuZWRpdGluZ1wiIDogXCJlZGl0aW5nXCJcbiAgICBcImtleWRvd24gIC5lZGl0aW5nXCIgOiBcImVkaXRpbmdcIlxuICAgICdjbGljayAgICAuY2hhbmdlX3Bhc3N3b3JkJyA6IFwiY2hhbmdlUGFzc3dvcmRcIlxuICAgICdjaGFuZ2UgICAuc2hvd19wYXNzd29yZCcgOiBcInNob3dQYXNzd29yZFwiXG4gICAgJ2NsaWNrICAgIC5zYXZlX3Bhc3N3b3JkJyA6ICdzYXZlUGFzc3dvcmQnXG4gICAgJ2NsaWNrICAgIC5iYWNrJyA6ICdnb0JhY2snXG5cbiAgZ29CYWNrOiAtPlxuICAgIHdpbmRvdy5oaXN0b3J5LmJhY2soKVxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEB0ZWFjaGVycyA9IG9wdGlvbnMudGVhY2hlcnNcbiAgICBAdXNlcnMgICAgPSBvcHRpb25zLnVzZXJzXG5cbiAgICBAdXNlcnNCeVRlYWNoZXJJZCA9IEB1c2Vycy5pbmRleEJ5KFwidGVhY2hlcklkXCIpXG5cbiAgICBAdGVhY2hlclByb3BlcnRpZXMgPVxuICAgICAgW1xuICAgICAgICB7XG4gICAgICAgICAgXCJrZXlcIiAgICAgIDogXCJuYW1lXCJcbiAgICAgICAgICBcImVkaXRhYmxlXCIgOiB0cnVlXG4gICAgICAgICAgXCJoZWFkZXJsZXNzXCIgOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImtleVwiICAgICAgOiBcImZpcnN0XCJcbiAgICAgICAgICBcImxhYmVsXCIgICAgOiBcIkZpcnN0XCJcbiAgICAgICAgICBcImVkaXRhYmxlXCIgOiB0cnVlXG4gICAgICAgICAgXCJlc2NhcGVkXCIgIDogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJrZXlcIiAgICAgIDogXCJsYXN0XCJcbiAgICAgICAgICBcImxhYmVsXCIgICAgOiBcIkxhc3RcIlxuICAgICAgICAgIFwiZWRpdGFibGVcIiA6IHRydWVcbiAgICAgICAgICBcImVzY2FwZWRcIiAgOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImtleVwiICAgICAgOiBcImdlbmRlclwiXG4gICAgICAgICAgXCJsYWJlbFwiICAgIDogXCJHZW5kZXJcIlxuICAgICAgICAgIFwiZWRpdGFibGVcIiA6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwia2V5XCIgICAgICA6IFwic2Nob29sXCJcbiAgICAgICAgICBcImxhYmVsXCIgICAgOiBcIlNjaG9vbCBuYW1lXCJcbiAgICAgICAgICBcImVkaXRhYmxlXCIgOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImtleVwiICAgICAgOiBcImNvbnRhY3RcIlxuICAgICAgICAgIFwibGFiZWxcIiAgICA6IFwiQ29udGFjdCBJbmZvcm1hdGlvblwiXG4gICAgICAgICAgXCJlZGl0YWJsZVwiIDogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgXVxuXG4gIHNob3dQYXNzd29yZDogKGV2ZW50KSAtPlxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICB0ZWFjaGVySWQgPSAkdGFyZ2V0LmF0dHIoXCJkYXRhLXRlYWNoZXJJZFwiKVxuICAgIGlmIEAkZWwuZmluZChcIi4je3RlYWNoZXJJZH1fcGFzc3dvcmRcIikuYXR0cihcInR5cGVcIikgPT0gXCJwYXNzd29yZFwiXG4gICAgICBAJGVsLmZpbmQoXCIuI3t0ZWFjaGVySWR9X3Bhc3N3b3JkXCIpLmF0dHIoXCJ0eXBlXCIsIFwidGV4dFwiKVxuICAgIGVsc2VcbiAgICAgIEAkZWwuZmluZChcIi4je3RlYWNoZXJJZH1fcGFzc3dvcmRcIikuYXR0cihcInR5cGVcIiwgXCJwYXNzd29yZFwiKVxuXG5cbiAgY2hhbmdlUGFzc3dvcmQ6IChldmVudCkgLT5cbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgdGVhY2hlcklkID0gJHRhcmdldC5hdHRyKFwiZGF0YS10ZWFjaGVySWRcIilcbiAgICBAJGVsLmZpbmQoXCIuI3t0ZWFjaGVySWR9X21lbnVcIikudG9nZ2xlQ2xhc3MoXCJjb25maXJtYXRpb25cIilcbiAgICBAJGVsLmZpbmQoXCIuI3t0ZWFjaGVySWR9XCIpLnNjcm9sbFRvKClcbiAgICBAJGVsLmZpbmQoXCIuI3t0ZWFjaGVySWR9X3Bhc3N3b3JkXCIpLmZvY3VzKClcblxuICBzYXZlUGFzc3dvcmQ6IChldmVudCkgLT5cbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgdGVhY2hlcklkID0gJHRhcmdldC5hdHRyKFwiZGF0YS10ZWFjaGVySWRcIilcblxuICAgIHRlYWNoZXJNb2RlbCA9IEB0ZWFjaGVycy5nZXQodGVhY2hlcklkKVxuICAgIHVzZXJNb2RlbCAgICA9IEB1c2Vyc0J5VGVhY2hlcklkW3RlYWNoZXJJZF1bMF1cbiAgICB1c2VyTW9kZWwuc2V0UGFzc3dvcmQgQCRlbC5maW5kKFwiLiN7dGVhY2hlcklkfV9wYXNzd29yZFwiKS52YWwoKVxuICAgIHVzZXJNb2RlbC5zYXZlIG51bGwsXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBVdGlscy5taWRBbGVydCBcIlRlYWNoZXIncyBwYXNzd29yZCBzYXZlZFwiXG4gICAgICAgIEAkZWwuZmluZChcIi4je3RlYWNoZXJJZH1fcGFzc3dvcmRcIikudmFsKFwiXCIpXG4gICAgICAgIEAkZWwuZmluZChcIi4je3RlYWNoZXJJZH1fbWVudVwiKS50b2dnbGVDbGFzcyhcImNvbmZpcm1hdGlvblwiKVxuICAgICAgZXJyb3I6ID0+XG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiU2F2ZSBlcnJvclwiXG5cblxuXG4gIHJlbmRlcjogLT5cbiAgICB0ZWFjaGVyVGFibGUgPSBAZ2V0VGVhY2hlclRhYmxlKClcbiAgICBkZWxldGVCdXR0b24gPSBcIjxidXR0b24gY2xhc3M9J2NvbW1hbmRfcmVkIGRlbGV0ZSc+RGVsZXRlPC9idXR0b24+XCJcblxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGgxPlRlYWNoZXJzPC9oMT5cblxuICAgICAgPGRpdiBpZD0ndGVhY2hlcl90YWJsZV9jb250YWluZXInPlxuICAgICAgICAje3RlYWNoZXJUYWJsZX1cbiAgICAgIDwvZGl2PlxuICAgIFwiXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICB1cGRhdGVUYWJsZTogLT4gQCRlbC5maW5kKFwiI3RlYWNoZXJfdGFibGVfY29udGFpbmVyXCIpLmh0bWwgQGdldFRlYWNoZXJUYWJsZSgpXG5cbiAgZ2V0VGVhY2hlclRhYmxlOiAtPlxuXG4gICAgaHRtbCA9IFwiXCJcblxuICAgIGZvciB0ZWFjaGVyIGluIEB0ZWFjaGVycy5tb2RlbHNcblxuICAgICAgaHRtbCArPSBcIlxuICAgICAgPHRhYmxlIGNsYXNzPSdjbGFzc190YWJsZSB0ZWFjaGVycyAje3RlYWNoZXIuaWR9JyA+XG4gICAgICAgIDx0Ym9keT5cbiAgICAgIFwiXG5cbiAgICAgIGZvciBwcm9wIGluIEB0ZWFjaGVyUHJvcGVydGllc1xuICAgICAgICBodG1sICs9IEBwcm9wQ29va1Jvdyhwcm9wLCB0ZWFjaGVyKVxuXG4gICAgICBodG1sICs9IFwiXG4gICAgICAgICAgPHRyIGNsYXNzPSdsYXN0Jz48dGg+PGJ1dHRvbiBjbGFzcz0nY2hhbmdlX3Bhc3N3b3JkIGNvbW1hbmQnIGRhdGEtdGVhY2hlcklkPScje3RlYWNoZXIuaWR9Jz5DaGFuZ2UgUGFzc3dvcmQ8L2J1dHRvbj48YnI+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9JyN7dGVhY2hlci5pZH1fbWVudSBjb25maXJtYXRpb24nPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9J3Bhc3N3b3JkJyBjbGFzcz0nI3t0ZWFjaGVyLmlkfV9wYXNzd29yZCc+XG4gICAgICAgICAgICAgICAgPHRhYmxlPjx0cj5cbiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT0ncGFkZGluZzowOyc+PGxhYmVsIGZvcj0nI3t0ZWFjaGVyLmlkfV9zaG93X3Bhc3N3b3JkJz5TaG93IHBhc3N3b3JkPC9sYWJlbD48L3RoPlxuICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPSdwYWRkaW5nOjEwcHgnPjxpbnB1dCB0eXBlPSdjaGVja2JveCcgaWQ9JyN7dGVhY2hlci5pZH1fc2hvd19wYXNzd29yZCcgY2xhc3M9J3Nob3dfcGFzc3dvcmQnIGRhdGEtdGVhY2hlcklkPScje3RlYWNoZXIuaWR9Jz48L3RoPlxuICAgICAgICAgICAgICAgIDwvdHI+PC90YWJsZT5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdzYXZlX3Bhc3N3b3JkIGNvbW1hbmQnIGRhdGEtdGVhY2hlcklkPScje3RlYWNoZXIuaWR9Jz5TYXZlPC9idXR0b24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDwvdGg+XG4gICAgICAgICAgPC90cj5cbiAgICAgICAgPC90Ym9keT5cbiAgICAgIDwvdGFibGU+XG4gICAgICBcIlxuXG4gICAgcmV0dXJuIGh0bWxcblxuXG4gIHByb3BDb29rUm93OiAocHJvcCwgdGVhY2hlcikgLT5cblxuICAgIGlmIHByb3AuaGVhZGVybGVzc1xuICAgICAgcHJvcC50YWdOYW1lID0gXCJ0aFwiXG4gICAgZWxzZVxuICAgICAgaGVhZGVyID0gXCI8dGg+I3twcm9wLmxhYmVsfTwvdGg+XCJcblxuICAgIFwiPHRyPiN7aGVhZGVyfHxcIlwifSN7QHByb3BDb29rKHByb3AsIHRlYWNoZXIpfTwvdHI+XCJcblxuICBwcm9wQ29vazogKHByb3AsIHRlYWNoZXIpLT5cblxuICAgICMgY29vayB0aGUgdmFsdWVcbiAgICB2YWx1ZSA9IGlmIHByb3Aua2V5PyAgIHRoZW4gdGVhY2hlci5nZXQocHJvcC5rZXkpICAgIGVsc2UgXCImbmJzcDtcIlxuICAgIHZhbHVlID0gaWYgcHJvcC5lc2NhcGUgdGhlbiB0ZWFjaGVyLmVzY2FwZShwcm9wLmtleSkgZWxzZSB2YWx1ZVxuICAgIHZhbHVlID0gXCJfXCIgaWYgbm90IHZhbHVlP1xuXG4gICAgIyBjYWxjdWxhdGUgdGFnXG4gICAgdGFnTmFtZSA9IHByb3AudGFnTmFtZSB8fCBcInRkXCJcblxuICAgICMgd2hhdCBpcyBpdFxuICAgIGVkaXRPck5vdCAgID0gaWYgcHJvcC5lZGl0YWJsZSB0aGVuIFwiZWRpdF9pbl9wbGFjZVwiIGVsc2UgXCJcIlxuXG4gICAgbnVtYmVyT3JOb3QgPSBpZiBfLmlzTnVtYmVyKHZhbHVlKSB0aGVuIFwiZGF0YS1pc051bWJlcj0ndHJ1ZSdcIiBlbHNlIFwiZGF0YS1pc051bWJlcj0nZmFsc2UnXCJcblxuICAgIHJldHVybiBcIjwje3RhZ05hbWV9IGNsYXNzPScje2VkaXRPck5vdH0nPjxzcGFuIGRhdGEtdGVhY2hlcklkPScje3RlYWNoZXIuaWR9JyBkYXRhLWtleT0nI3twcm9wLmtleX0nIGRhdGEtdmFsdWU9JyN7dmFsdWV9JyAje2VkaXRPck5vdH0gI3tudW1iZXJPck5vdH0+I3t2YWx1ZX08L2Rpdj48LyN7dGFnTmFtZX0+XCJcblxuXG4gIGVkaXRJblBsYWNlOiAoZXZlbnQpIC0+XG5cbiAgICByZXR1cm4gaWYgQGFscmVhZHlFZGl0aW5nXG4gICAgQGFscmVhZHlFZGl0aW5nID0gdHJ1ZVxuXG4gICAgIyBzYXZlIHN0YXRlXG4gICAgIyByZXBsYWNlIHdpdGggdGV4dCBhcmVhXG4gICAgIyBvbiBzYXZlLCBzYXZlIGFuZCByZS1yZXBsYWNlXG4gICAgJHNwYW4gPSAkKGV2ZW50LnRhcmdldClcblxuICAgIGlmICRzcGFuLnByb3AoXCJ0YWdOYW1lXCIpID09IFwiVERcIlxuICAgICAgJHNwYW4gPSAkc3Bhbi5maW5kKFwic3BhblwiKVxuICAgICAgcmV0dXJuIGlmICRzcGFuLmxlbmd0aCA9PSAwXG4gICAgJHRkICA9ICRzcGFuLnBhcmVudCgpXG5cbiAgICBAJG9sZFNwYW4gPSAkc3Bhbi5jbG9uZSgpXG5cbiAgICByZXR1cm4gaWYgJHNwYW4ucHJvcChcInRhZ05hbWVcIikgPT0gXCJURVhUQVJFQVwiXG5cbiAgICBndWlkICAgICAgICAgPSBVdGlscy5ndWlkKClcblxuICAgIGtleSAgICAgICAgICA9ICRzcGFuLmF0dHIoXCJkYXRhLWtleVwiKVxuICAgIGlzTnVtYmVyICAgICA9ICRzcGFuLmF0dHIoXCJkYXRhLWlzTnVtYmVyXCIpID09IFwidHJ1ZVwiXG5cbiAgICB0ZWFjaGVySWQgICAgPSAkc3Bhbi5hdHRyKFwiZGF0YS10ZWFjaGVySWRcIilcbiAgICB0ZWFjaGVyICAgICAgPSBAdGVhY2hlcnMuZ2V0KHRlYWNoZXJJZClcbiAgICBvbGRWYWx1ZSAgICAgPVxuICAgICAgaWYgaXNOdW1iZXJcbiAgICAgICAgdGVhY2hlci5nZXROdW1iZXIoa2V5KVxuICAgICAgZWxzZVxuICAgICAgICB0ZWFjaGVyLmdldFN0cmluZyhrZXkpXG5cbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgY2xhc3NlcyA9ICgkdGFyZ2V0LmF0dHIoXCJjbGFzc1wiKSB8fCBcIlwiKS5yZXBsYWNlKFwic2V0dGluZ3NcIixcIlwiKVxuICAgIG1hcmdpbnMgPSAkdGFyZ2V0LmNzcyhcIm1hcmdpblwiKVxuXG4gICAgI3NwZWNpYWwgY2FzZVxuICAgIG9sZFZhbHVlID0gb2xkVmFsdWUuam9pbiBcIiBcIiBpZiBrZXkgPT0gJ2l0ZW1zJ1xuXG4gICAgdHJhbnNmZXJWYXJpYWJsZXMgPSBcImRhdGEtaXNOdW1iZXI9JyN7aXNOdW1iZXJ9JyBkYXRhLWtleT0nI3trZXl9JyBkYXRhLXRlYWNoZXJJZD0nI3t0ZWFjaGVySWR9JyBcIlxuXG4gICAgIyBzZXRzIHdpZHRoL2hlaWdodCB3aXRoIHN0eWxlIGF0dHJpYnV0ZVxuICAgICR0ZC5odG1sKFwiPHRleHRhcmVhIGlkPScje2d1aWR9JyAje3RyYW5zZmVyVmFyaWFibGVzfSBjbGFzcz0nZWRpdGluZyAje2NsYXNzZXN9JyBzdHlsZT0nbWFyZ2luOiN7bWFyZ2luc30nPiN7b2xkVmFsdWV9PC90ZXh0YXJlYT5cIilcbiAgICAjIHN0eWxlPSd3aWR0aDoje29sZFdpZHRofXB4OyBoZWlnaHQ6ICN7b2xkSGVpZ2h0fXB4OydcbiAgICAkdGV4dGFyZWEgPSAkKFwiIyN7Z3VpZH1cIilcbiAgICAkdGV4dGFyZWEuZm9jdXMoKVxuXG4gIGVkaXRpbmc6IChldmVudCkgLT5cblxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICAkdGQgPSAkdGFyZ2V0LnBhcmVudCgpXG5cbiAgICBpZiBldmVudC53aGljaCA9PSAyNyBvciBldmVudC50eXBlID09IFwiZm9jdXNvdXRcIlxuICAgICAgJHRhcmdldC5yZW1vdmUoKVxuICAgICAgJHRkLmh0bWwoQCRvbGRTcGFuKVxuICAgICAgQGFscmVhZHlFZGl0aW5nID0gZmFsc2VcbiAgICAgIHJldHVyblxuXG4gICAgIyBhY3Qgbm9ybWFsLCB1bmxlc3MgaXQncyBhbiBlbnRlciBrZXkgb24ga2V5ZG93blxuICAgIHJldHVybiB0cnVlIHVubGVzcyBldmVudC53aGljaCA9PSAxMyBhbmQgZXZlbnQudHlwZSA9PSBcImtleWRvd25cIlxuXG4gICAgQGFscmVhZHlFZGl0aW5nID0gZmFsc2VcblxuICAgIGtleSAgICAgICAgICA9ICR0YXJnZXQuYXR0cihcImRhdGEta2V5XCIpXG4gICAgaXNOdW1iZXIgICAgID0gJHRhcmdldC5hdHRyKFwiZGF0YS1pc051bWJlclwiKSA9PSBcInRydWVcIlxuXG4gICAgdGVhY2hlcklkICAgID0gJHRhcmdldC5hdHRyKFwiZGF0YS10ZWFjaGVySWRcIilcbiAgICB0ZWFjaGVyICAgICAgPSBAdGVhY2hlcnMuZ2V0KHRlYWNoZXJJZClcbiAgICBvbGRWYWx1ZSAgICAgPSB0ZWFjaGVyLmdldChrZXkpXG5cbiAgICBuZXdWYWx1ZSA9ICR0YXJnZXQudmFsKClcbiAgICBuZXdWYWx1ZSA9IGlmIGlzTnVtYmVyIHRoZW4gcGFyc2VJbnQobmV3VmFsdWUpIGVsc2UgbmV3VmFsdWVcblxuICAgICNzcGVjaWFsIGNhc2VcblxuICAgICMgdGhpcyBpcyBub3QgRFJZLiByZXBlYXRlZCBpbiBncmlkIHByb3RvdHlwZS5cbiAgICBpZiBrZXkgPT0gXCJpdGVtc1wiXG4gICAgICAjIGNsZWFuIHdoaXRlc3BhY2UsIGdpdmUgcmVtaW5kZXIgaWYgdGFicyBvciBjb21tYXMgZm91bmQsIGNvbnZlcnQgYmFjayB0byBhcnJheVxuICAgICAgbmV3VmFsdWUgPSBuZXdWYWx1ZS5yZXBsYWNlKC9cXHMrL2csICcgJylcbiAgICAgIGlmIC9cXHR8LC8udGVzdChuZXdWYWx1ZSkgdGhlbiBhbGVydCBcIlBsZWFzZSByZW1lbWJlclxcblxcbkdyaWQgaXRlbXMgYXJlIHNwYWNlIFxcXCIgXFxcIiBkZWxpbWl0ZWRcIlxuICAgICAgbmV3VmFsdWUgPSBfLmNvbXBhY3QgbmV3VmFsdWUuc3BsaXQoXCIgXCIpXG5cbiAgICAjIElmIHRoZXJlIHdhcyBhIGNoYW5nZSwgc2F2ZSBpdFxuICAgIGlmIFN0cmluZyhuZXdWYWx1ZSkgIT0gU3RyaW5nKG9sZFZhbHVlKVxuICAgICAgYXR0cmlidXRlcyA9IHt9XG4gICAgICBhdHRyaWJ1dGVzW2tleV0gPSBuZXdWYWx1ZVxuICAgICAgdGVhY2hlci5zYXZlIGF0dHJpYnV0ZXMsXG4gICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgVXRpbHMudG9wQWxlcnQgXCJUZWFjaGVyIHNhdmVkXCJcbiAgICAgICAgICB0ZWFjaGVyLmZldGNoXG4gICAgICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgICAgICBAdXBkYXRlVGFibGUoKVxuICAgICAgICBlcnJvcjogPT5cbiAgICAgICAgICB0ZWFjaGVyLmZldGNoXG4gICAgICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgICAgICBAdXBkYXRlVGFibGUoKVxuICAgICAgICAgICAgICAjIGlkZWFsbHkgd2Ugd291bGRuJ3QgaGF2ZSB0byBzYXZlIHRoaXMgYnV0IGNvbmZsaWN0cyBoYXBwZW4gc29tZXRpbWVzXG4gICAgICAgICAgICAgICMgQFRPRE8gbWFrZSB0aGUgbW9kZWwgdHJ5IGFnYWluIHdoZW4gdW5zdWNjZXNzZnVsLlxuICAgICAgICAgICAgICBhbGVydCBcIlBsZWFzZSB0cnkgdG8gc2F2ZSBhZ2FpbiwgaXQgZGlkbid0IHdvcmsgdGhhdCB0aW1lLlwiXG5cbiAgICAjIHRoaXMgZW5zdXJlcyB3ZSBkbyBub3QgaW5zZXJ0IGEgbmV3bGluZSBjaGFyYWN0ZXIgd2hlbiB3ZSBwcmVzcyBlbnRlclxuICAgIHJldHVybiBmYWxzZVxuIl19
