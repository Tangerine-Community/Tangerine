var KlassEditView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassEditView = (function(superClass) {
  extend(KlassEditView, superClass);

  function KlassEditView() {
    this.renderStudents = bind(this.renderStudents, this);
    this.onSubviewRendered = bind(this.onSubviewRendered, this);
    this.registerStudent = bind(this.registerStudent, this);
    return KlassEditView.__super__.constructor.apply(this, arguments);
  }

  KlassEditView.prototype.className = "KlassEditView";

  KlassEditView.prototype.events = {
    'click .back': 'back',
    'click .save': 'basicInfoSave',
    'click .basic_info_edit': 'basicInfoToggle',
    'click .basic_info_cancel': 'basicInfoToggle',
    'change #teacher_select': 'teacherSelect',
    'click .add_student': 'addStudentToggle',
    'click .add_student_cancel': 'addStudentToggle',
    'click .add_student_add': 'addStudent',
    'click .register_student': 'registerStudentToggle',
    'click .register_student_cancel': 'registerStudentToggle',
    'click .register_student_save': 'registerStudent'
  };

  KlassEditView.prototype.teacherSelect = function(event) {
    var teacherId;
    teacherId = this.$el.find("#teacher_select option:selected").attr("data-teacherId");
    return this.klass.set("teacherId", teacherId);
  };

  KlassEditView.prototype.addStudentToggle = function() {
    this.$el.find(".register_student_form input").val("");
    return this.$el.find(".add_student_form, .add_student").toggle();
  };

  KlassEditView.prototype.registerStudentToggle = function() {
    this.$el.find(".register_student_form, .register_student").toggle();
    if (this.$el.find(".register_student_form").is(":visible")) {
      this.$el.find(".register_student_form").scrollTo();
    }
    return this.$el.find("#register_student_name ,#register_student_gender, #register_student_age").val("");
  };

  KlassEditView.prototype.addStudent = function() {
    var newStudent, studentId;
    if (this.$el.find("#add_student_select option:selected").val() === "_none") {
      return alert("Please select a student, or cancel.");
    } else {
      studentId = this.$el.find("#add_student_select option:selected").attr("data-id");
      newStudent = this.allStudents.get(studentId);
      return newStudent.save({
        klassId: this.klass.id
      }, {
        success: (function(_this) {
          return function() {
            _this.students.add(newStudent);
            return _this.addStudentToggle();
          };
        })(this)
      });
    }
  };

  KlassEditView.prototype.registerStudent = function() {
    var student;
    student = new Student;
    return student.save({
      name: this.$el.find("#register_student_name").val(),
      gender: this.$el.find("#register_student_gender").val(),
      age: this.$el.find("#register_student_age").val(),
      klassId: this.klass.id
    }, {
      success: (function(_this) {
        return function() {
          _this.students.add(student);
          return _this.registerStudentToggle();
        };
      })(this)
    });
  };

  KlassEditView.prototype.basicInfoToggle = function() {
    var $basicInfo;
    this.$el.find(".basic_info").toggle();
    $basicInfo = $(this.$el.find(".basic_info")[1]);
    if ($basicInfo.is(":visible")) {
      $basicInfo.scrollTo();
      this.$el.find("#year").focus();
    }
    this.$el.find("#school_name").val(this.klass.getString("schoolName"));
    this.$el.find("#year").val(this.klass.getString("year"));
    this.$el.find("#grade").val(this.klass.getString("grade"));
    return this.$el.find("#stream").val(this.klass.getString("stream"));
  };

  KlassEditView.prototype.basicInfoSave = function() {
    var inputs, newDate;
    inputs = this.$el.find("#start_date").val().split("/");
    newDate = new Date();
    newDate.setFullYear(parseInt(inputs[0]));
    newDate.setMonth(parseInt(inputs[1]) - 1);
    newDate.setDate(parseInt(inputs[2]));
    return this.klass.save({
      schoolName: this.$el.find("#school_name").val(),
      year: this.$el.find("#year").val(),
      grade: this.$el.find("#grade").val(),
      stream: this.$el.find("#stream").val(),
      startDate: newDate.getTime()
    }, {
      success: (function(_this) {
        return function() {
          return _this.render();
        };
      })(this),
      error: (function(_this) {
        return function() {
          return Utils.midAlert("Save error<br>Please try again.");
        };
      })(this)
    });
  };

  KlassEditView.prototype.back = function() {
    return window.history.back();
  };

  KlassEditView.prototype.initialize = function(options) {
    this.klass = options.klass;
    this.students = options.students;
    this.allStudents = options.allStudents;
    this.teachers = options.teachers;
    this.students.on("add remove change", this.renderStudents);
    return this.views = [];
  };

  KlassEditView.prototype.closeViews = function() {
    var i, len, ref, view;
    ref = this.views;
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      view.close();
    }
    return this.views = [];
  };

  KlassEditView.prototype.onSubviewRendered = function() {
    return this.trigger("subRendered");
  };

  KlassEditView.prototype.renderStudents = function() {
    var $ul, i, len, ref, student, view;
    $ul = $("<ul>").addClass("student_list");
    this.closeViews();
    ref = this.students.models;
    for (i = 0, len = ref.length; i < len; i++) {
      student = ref[i];
      view = new StudentListElementView({
        student: student,
        students: this.students
      });
      this.views.push(view);
      view.on("rendered", this.onSubviewRendered);
      view.render();
      view.on("change", this.renderStudents);
      $ul.append(view.el);
    }
    return this.$el.find("#student_list_wrapper").html($ul);

    /*
     * Add student feature
    studentOptionList = "<option value='_none' disabled='disabled' selected='selected'>(#{$.t('name')}) - (#{$.t('age')})</option>"
    for student in @allStudents.models
      isInClass = false
      for double in @students.models
        if double.id == student.id then isInClass = true
      if not isInClass
        studentOptionList += "<option data-id='#{student.id}'>#{student.get 'name'} - #{student.get 'age'}</option>"
    
    @$el.find("#add_student_select").html studentOptionList
     */
  };

  KlassEditView.prototype.render = function() {
    var grade, htmlInfoTeacher, htmlTeacherSelect, schoolName, startDate, stream, teacher, teacherName, year;
    schoolName = this.klass.getString("schoolName");
    year = this.klass.getString("year");
    grade = this.klass.getString("grade");
    stream = this.klass.getString("stream");
    startDate = new Date(this.klass.getNumber("startDate"));
    if (this.klass.get("teacherId") === "admin") {
      teacherName = "admin";
    } else {
      teacherName = this.teachers.get(this.klass.get('teacherId')) && this.teachers.get(this.klass.get('teacherId')).has('name') ? this.teachers.get(this.klass.get('teacherId')).get('name') : "unknown";
    }
    if (Tangerine.user.isAdmin()) {
      htmlInfoTeacher = "<tr><td><label>Teacher</label></td><td>" + teacherName + "</td></tr>";
    }
    if (Tangerine.user.isAdmin()) {
      htmlTeacherSelect = "<label>Teacher</label><br> <select id='teacher_select'> " + ((function() {
        var i, len, ref, results;
        ref = this.teachers.models;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          teacher = ref[i];
          results.push("<option " + (teacher.id === this.klass.get('teacherId') ? "selected='selected' " : "") + " data-teacherId='" + teacher.id + "'>" + (teacher.get('name')) + "</option>");
        }
        return results;
      }).call(this)) + " </select>";
    }
    this.$el.html("<button class='back navigation'>" + (t('back')) + "</button> <h1>" + (t('class editor')) + "</h1> <h2>" + (t('basic info')) + "</h2> <table class='info_box basic_info'> <tr><td><label>School name</label></td><td>" + schoolName + "</td></tr> " + (htmlInfoTeacher || "") + " <tr><td><label>School year</label></td><td>" + year + "</td></tr> <tr><td><label>" + (t('grade')) + "</label></td><td>" + grade + "</td></tr> <tr><td><label>" + (t('stream')) + "</label></td><td>" + stream + "</td></tr> <tr><td><label>" + (t('starting date')) + "</label></td><td>" + (startDate.getFullYear() + "/" + (startDate.getMonth() + 1) + "/" + startDate.getDate()) + "</td></tr> <tr><td colspan='2'><button class='basic_info_edit command'>" + (t('edit')) + "</button></td></tr> </table> <div class='basic_info confirmation'> <div class='menu_box'> <div class='label_value'> <label for='school_name'>School name</label> <input id='school_name' value='" + schoolName + "'> </div> <div class='label_value'> " + (htmlTeacherSelect || "") + " </div> <div class='label_value'> <label for='year'>School year</label> <input id='year' value='" + year + "'> </div> <div class='label_value'> <label for='grade'>" + (t('grade')) + "</label> <input id='grade' value='" + grade + "'> </div> <div class='label_value'> <label for='stream'>" + (t('stream')) + "</label> <input id='stream' value='" + stream + "'> </div> <div class='label_value'> <label for='start_date'>" + (t('starting date')) + "</label> <input id='start_date' value='" + (startDate.getFullYear() + "/" + (startDate.getMonth() + 1) + "/" + startDate.getDate()) + "'> </div> <button class='save command'>" + (t('save')) + "</button> <button class='basic_info_cancel command'>" + (t('cancel')) + "</button> </div> </div> <h2>" + (t('students').capitalize()) + "</h2> <div id='student_list_wrapper'></div> <!-- add student feature --> <!--button class='add_student command'>Add student</button> <div class='add_student_form menu_box confirmation'> <div class='label_value'> <label for='add_student_select'>" + (t('add student')) + "</label><br> <select id='add_student_select'> </select> </div> <button class='add_student_add command'>" + (t('add')) + "</button><button class='add_student_cancel command'>" + (t('cancel')) + "</button> </div--> <button class='register_student command'>" + ($.t("register student")) + "</button> <div class='register_student_form menu_box confirmation'> <h2>" + (t('register student')) + "</h2> <div class='label_value'> <label for='register_student_name'>Full name</label> <input id='register_student_name' value=''> </div> <div class='label_value'> <label for='register_student_gender'>" + (t('gender')) + "</label> <input id='register_student_gender' value=''> </div> <div class='label_value'> <label for='register_student_age'>" + (t('age')) + "</label> <input id='register_student_age' value=''> </div> <button class='register_student_save command'>" + (t('save')) + "</button> <button class='register_student_cancel command'>" + (t('cancel')) + "</button> </div>");
    this.trigger("rendered");
    return this.renderStudents();
  };

  return KlassEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtsYXNzL0tsYXNzRWRpdFZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsYUFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7MEJBRUosU0FBQSxHQUFZOzswQkFFWixNQUFBLEdBQ0U7SUFBQSxhQUFBLEVBQW1DLE1BQW5DO0lBQ0EsYUFBQSxFQUFtQyxlQURuQztJQUVBLHdCQUFBLEVBQW1DLGlCQUZuQztJQUdBLDBCQUFBLEVBQW1DLGlCQUhuQztJQUtBLHdCQUFBLEVBQW1DLGVBTG5DO0lBT0Esb0JBQUEsRUFBbUMsa0JBUG5DO0lBUUEsMkJBQUEsRUFBbUMsa0JBUm5DO0lBU0Esd0JBQUEsRUFBbUMsWUFUbkM7SUFVQSx5QkFBQSxFQUFtQyx1QkFWbkM7SUFXQSxnQ0FBQSxFQUFtQyx1QkFYbkM7SUFZQSw4QkFBQSxFQUFtQyxpQkFabkM7OzswQkFlRixhQUFBLEdBQWUsU0FBQyxLQUFEO0FBQ2IsUUFBQTtJQUFBLFNBQUEsR0FBWSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxpQ0FBVixDQUE0QyxDQUFDLElBQTdDLENBQWtELGdCQUFsRDtXQUNaLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFdBQVgsRUFBd0IsU0FBeEI7RUFGYTs7MEJBSWYsZ0JBQUEsR0FBa0IsU0FBQTtJQUNoQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSw4QkFBVixDQUF5QyxDQUFDLEdBQTFDLENBQThDLEVBQTlDO1dBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsaUNBQVYsQ0FBNEMsQ0FBQyxNQUE3QyxDQUFBO0VBRmdCOzswQkFJbEIscUJBQUEsR0FBdUIsU0FBQTtJQUNyQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSwyQ0FBVixDQUFzRCxDQUFDLE1BQXZELENBQUE7SUFFQSxJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLHdCQUFWLENBQW1DLENBQUMsRUFBcEMsQ0FB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QUFDLENBQUEsQ0FBRSxNQUFGLENBQUQsQ0F4Q3hCLEdBd0NtQyxzREF4Q25DLEdBd0N3RixDQUFDLENBQUEsQ0FBRSxRQUFGLENBQUQsQ0F4Q3hGLEdBd0NxRyw4QkF4Q3JHLEdBNENMLENBQUMsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLFVBQWQsQ0FBQSxDQUFELENBNUNLLEdBNEN1QixzUEE1Q3ZCLEdBa0QyQixDQUFDLENBQUEsQ0FBRSxhQUFGLENBQUQsQ0FsRDNCLEdBa0Q2Qyx5R0FsRDdDLEdBc0RpQyxDQUFDLENBQUEsQ0FBRSxLQUFGLENBQUQsQ0F0RGpDLEdBc0QyQyxzREF0RDNDLEdBc0RnRyxDQUFDLENBQUEsQ0FBRSxRQUFGLENBQUQsQ0F0RGhHLEdBc0Q2Ryw4REF0RDdHLEdBMERnQyxDQUFDLENBQUMsQ0FBQyxDQUFGLENBQUksa0JBQUosQ0FBRCxDQTFEaEMsR0EwRHlELDBFQTFEekQsR0E0REgsQ0FBQyxDQUFBLENBQUUsa0JBQUYsQ0FBRCxDQTVERyxHQTREb0IseU1BNURwQixHQWtFZ0MsQ0FBQyxDQUFBLENBQUUsUUFBRixDQUFELENBbEVoQyxHQWtFNkMsNEhBbEU3QyxHQXNFNkIsQ0FBQyxDQUFBLENBQUUsS0FBRixDQUFELENBdEU3QixHQXNFdUMsMkdBdEV2QyxHQXlFdUMsQ0FBQyxDQUFBLENBQUUsTUFBRixDQUFELENBekV2QyxHQXlFa0QsNERBekVsRCxHQTBFeUMsQ0FBQyxDQUFBLENBQUUsUUFBRixDQUFELENBMUV6QyxHQTBFc0Qsa0JBMUVoRTtJQThFQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7V0FFQSxJQUFDLENBQUEsY0FBRCxDQUFBO0VBN0dNOzs7O0dBbEprQixRQUFRLENBQUMiLCJmaWxlIjoia2xhc3MvS2xhc3NFZGl0Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEtsYXNzRWRpdFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJLbGFzc0VkaXRWaWV3XCJcblxuICBldmVudHM6IFxuICAgICdjbGljayAuYmFjaycgICAgICAgICAgICAgICAgICAgIDogJ2JhY2snXG4gICAgJ2NsaWNrIC5zYXZlJyAgICAgICAgICAgICAgICAgICAgOiAnYmFzaWNJbmZvU2F2ZSdcbiAgICAnY2xpY2sgLmJhc2ljX2luZm9fZWRpdCcgICAgICAgICA6ICdiYXNpY0luZm9Ub2dnbGUnXG4gICAgJ2NsaWNrIC5iYXNpY19pbmZvX2NhbmNlbCcgICAgICAgOiAnYmFzaWNJbmZvVG9nZ2xlJ1xuXG4gICAgJ2NoYW5nZSAjdGVhY2hlcl9zZWxlY3QnICAgICAgICAgOiAndGVhY2hlclNlbGVjdCdcbiAgICBcbiAgICAnY2xpY2sgLmFkZF9zdHVkZW50JyAgICAgICAgICAgICA6ICdhZGRTdHVkZW50VG9nZ2xlJ1xuICAgICdjbGljayAuYWRkX3N0dWRlbnRfY2FuY2VsJyAgICAgIDogJ2FkZFN0dWRlbnRUb2dnbGUnXG4gICAgJ2NsaWNrIC5hZGRfc3R1ZGVudF9hZGQnICAgICAgICAgOiAnYWRkU3R1ZGVudCdcbiAgICAnY2xpY2sgLnJlZ2lzdGVyX3N0dWRlbnQnICAgICAgICA6ICdyZWdpc3RlclN0dWRlbnRUb2dnbGUnXG4gICAgJ2NsaWNrIC5yZWdpc3Rlcl9zdHVkZW50X2NhbmNlbCcgOiAncmVnaXN0ZXJTdHVkZW50VG9nZ2xlJ1xuICAgICdjbGljayAucmVnaXN0ZXJfc3R1ZGVudF9zYXZlJyAgIDogJ3JlZ2lzdGVyU3R1ZGVudCdcblxuXG4gIHRlYWNoZXJTZWxlY3Q6IChldmVudCkgLT5cbiAgICB0ZWFjaGVySWQgPSBAJGVsLmZpbmQoXCIjdGVhY2hlcl9zZWxlY3Qgb3B0aW9uOnNlbGVjdGVkXCIpLmF0dHIoXCJkYXRhLXRlYWNoZXJJZFwiKVxuICAgIEBrbGFzcy5zZXQgXCJ0ZWFjaGVySWRcIiwgdGVhY2hlcklkXG5cbiAgYWRkU3R1ZGVudFRvZ2dsZTogLT4gXG4gICAgQCRlbC5maW5kKFwiLnJlZ2lzdGVyX3N0dWRlbnRfZm9ybSBpbnB1dFwiKS52YWwoXCJcIilcbiAgICBAJGVsLmZpbmQoXCIuYWRkX3N0dWRlbnRfZm9ybSwgLmFkZF9zdHVkZW50XCIpLnRvZ2dsZSgpXG5cbiAgcmVnaXN0ZXJTdHVkZW50VG9nZ2xlOiAtPiBcbiAgICBAJGVsLmZpbmQoXCIucmVnaXN0ZXJfc3R1ZGVudF9mb3JtLCAucmVnaXN0ZXJfc3R1ZGVudFwiKS50b2dnbGUoKVxuICAgICMgc2Nyb2xsIHRvIG5ldyBmb3JtIGlmIGl0J3Mgdmlzc2libGVcbiAgICBpZiBAJGVsLmZpbmQoXCIucmVnaXN0ZXJfc3R1ZGVudF9mb3JtXCIpLmlzKFwiOnZpc2libGVcIikgdGhlbiBAJGVsLmZpbmQoXCIucmVnaXN0ZXJfc3R1ZGVudF9mb3JtXCIpLnNjcm9sbFRvKClcbiAgICBAJGVsLmZpbmQoXCIjcmVnaXN0ZXJfc3R1ZGVudF9uYW1lICwjcmVnaXN0ZXJfc3R1ZGVudF9nZW5kZXIsICNyZWdpc3Rlcl9zdHVkZW50X2FnZVwiKS52YWwoXCJcIilcblxuICBhZGRTdHVkZW50OiAtPlxuICAgIGlmIEAkZWwuZmluZChcIiNhZGRfc3R1ZGVudF9zZWxlY3Qgb3B0aW9uOnNlbGVjdGVkXCIpLnZhbCgpID09IFwiX25vbmVcIlxuICAgICAgYWxlcnQgKFwiUGxlYXNlIHNlbGVjdCBhIHN0dWRlbnQsIG9yIGNhbmNlbC5cIilcbiAgICBlbHNlXG4gICAgICBzdHVkZW50SWQgPSBAJGVsLmZpbmQoXCIjYWRkX3N0dWRlbnRfc2VsZWN0IG9wdGlvbjpzZWxlY3RlZFwiKS5hdHRyKFwiZGF0YS1pZFwiKVxuICAgICAgbmV3U3R1ZGVudCA9IEBhbGxTdHVkZW50cy5nZXQgc3R1ZGVudElkXG4gICAgICBuZXdTdHVkZW50LnNhdmVcbiAgICAgICAga2xhc3NJZCA6IEBrbGFzcy5pZFxuICAgICAgLFxuICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgIEBzdHVkZW50cy5hZGQgbmV3U3R1ZGVudFxuICAgICAgICAgIEBhZGRTdHVkZW50VG9nZ2xlKClcblxuICByZWdpc3RlclN0dWRlbnQ6ID0+XG4gICAgc3R1ZGVudCA9IG5ldyBTdHVkZW50XG4gICAgc3R1ZGVudC5zYXZlXG4gICAgICBuYW1lICAgIDogQCRlbC5maW5kKFwiI3JlZ2lzdGVyX3N0dWRlbnRfbmFtZVwiKS52YWwoKVxuICAgICAgZ2VuZGVyICA6IEAkZWwuZmluZChcIiNyZWdpc3Rlcl9zdHVkZW50X2dlbmRlclwiKS52YWwoKVxuICAgICAgYWdlICAgICA6IEAkZWwuZmluZChcIiNyZWdpc3Rlcl9zdHVkZW50X2FnZVwiKS52YWwoKVxuICAgICAga2xhc3NJZCA6IEBrbGFzcy5pZFxuICAgICwgXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBAc3R1ZGVudHMuYWRkIHN0dWRlbnRcbiAgICAgICAgQHJlZ2lzdGVyU3R1ZGVudFRvZ2dsZSgpXG4gICAgICAgIFxuICAgIFxuXG4gIGJhc2ljSW5mb1RvZ2dsZTogLT5cbiAgICBAJGVsLmZpbmQoXCIuYmFzaWNfaW5mb1wiKS50b2dnbGUoKVxuICAgIFxuICAgICRiYXNpY0luZm8gPSAkKEAkZWwuZmluZChcIi5iYXNpY19pbmZvXCIpWzFdKVxuICAgIFxuICAgIGlmICRiYXNpY0luZm8uaXMoXCI6dmlzaWJsZVwiKVxuICAgICAgJGJhc2ljSW5mby5zY3JvbGxUbygpXG4gICAgICBAJGVsLmZpbmQoXCIjeWVhclwiKS5mb2N1cygpXG5cbiAgICBAJGVsLmZpbmQoXCIjc2Nob29sX25hbWVcIikudmFsIEBrbGFzcy5nZXRTdHJpbmcoXCJzY2hvb2xOYW1lXCIpXG4gICAgQCRlbC5maW5kKFwiI3llYXJcIikudmFsICAgICAgICBAa2xhc3MuZ2V0U3RyaW5nKFwieWVhclwiKVxuICAgIEAkZWwuZmluZChcIiNncmFkZVwiKS52YWwgICAgICAgQGtsYXNzLmdldFN0cmluZyhcImdyYWRlXCIpXG4gICAgQCRlbC5maW5kKFwiI3N0cmVhbVwiKS52YWwgICAgICBAa2xhc3MuZ2V0U3RyaW5nKFwic3RyZWFtXCIpXG4gIFxuICBiYXNpY0luZm9TYXZlOiAtPlxuICAgIGlucHV0cyA9IEAkZWwuZmluZChcIiNzdGFydF9kYXRlXCIpLnZhbCgpLnNwbGl0KFwiL1wiKVxuICAgIG5ld0RhdGUgPSBuZXcgRGF0ZSgpXG4gICAgbmV3RGF0ZS5zZXRGdWxsWWVhcihwYXJzZUludChpbnB1dHNbMF0pKVxuICAgIG5ld0RhdGUuc2V0TW9udGgocGFyc2VJbnQoaW5wdXRzWzFdKSAtIDEpXG4gICAgbmV3RGF0ZS5zZXREYXRlKHBhcnNlSW50KGlucHV0c1syXSkpXG5cbiAgICBcbiAgICBAa2xhc3Muc2F2ZVxuICAgICAgc2Nob29sTmFtZSA6IEAkZWwuZmluZChcIiNzY2hvb2xfbmFtZVwiKS52YWwoKVxuICAgICAgeWVhciAgICAgICA6IEAkZWwuZmluZChcIiN5ZWFyXCIpLnZhbCgpXG4gICAgICBncmFkZSAgICAgIDogQCRlbC5maW5kKFwiI2dyYWRlXCIpLnZhbCgpXG4gICAgICBzdHJlYW0gICAgIDogQCRlbC5maW5kKFwiI3N0cmVhbVwiKS52YWwoKVxuICAgICAgc3RhcnREYXRlICA6IG5ld0RhdGUuZ2V0VGltZSgpXG4gICAgLFxuICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgQHJlbmRlcigpXG4gICAgICBlcnJvcjogPT5cbiAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJTYXZlIGVycm9yPGJyPlBsZWFzZSB0cnkgYWdhaW4uXCJcblxuICBiYWNrOiAtPlxuICAgIHdpbmRvdy5oaXN0b3J5LmJhY2soKVxuICAgIFxuICBpbml0aWFsaXplOiAoIG9wdGlvbnMgKSAtPlxuICAgIEBrbGFzcyAgICAgICA9IG9wdGlvbnMua2xhc3NcbiAgICBAc3R1ZGVudHMgICAgPSBvcHRpb25zLnN0dWRlbnRzXG4gICAgQGFsbFN0dWRlbnRzID0gb3B0aW9ucy5hbGxTdHVkZW50c1xuICAgIEB0ZWFjaGVycyAgICA9IG9wdGlvbnMudGVhY2hlcnNcblxuICAgIEBzdHVkZW50cy5vbiBcImFkZCByZW1vdmUgY2hhbmdlXCIsIEByZW5kZXJTdHVkZW50c1xuXG4gICAgQHZpZXdzID0gW11cblxuXG4gIGNsb3NlVmlld3M6IC0+XG4gICAgZm9yIHZpZXcgaW4gQHZpZXdzXG4gICAgICB2aWV3LmNsb3NlKClcbiAgICBAdmlld3MgPSBbXVxuXG4gIG9uU3Vidmlld1JlbmRlcmVkOiA9PlxuICAgIEB0cmlnZ2VyIFwic3ViUmVuZGVyZWRcIlxuXG4gIHJlbmRlclN0dWRlbnRzOiA9PlxuICAgICR1bCA9ICQoXCI8dWw+XCIpLmFkZENsYXNzKFwic3R1ZGVudF9saXN0XCIpXG5cbiAgICBAY2xvc2VWaWV3cygpXG4gICAgZm9yIHN0dWRlbnQgaW4gQHN0dWRlbnRzLm1vZGVsc1xuICAgICAgdmlldyA9IG5ldyBTdHVkZW50TGlzdEVsZW1lbnRWaWV3XG4gICAgICAgIHN0dWRlbnQgOiBzdHVkZW50XG4gICAgICAgIHN0dWRlbnRzIDogQHN0dWRlbnRzXG4gICAgICBAdmlld3MucHVzaCB2aWV3XG4gICAgICB2aWV3Lm9uIFwicmVuZGVyZWRcIiwgQG9uU3Vidmlld1JlbmRlcmVkXG4gICAgICB2aWV3LnJlbmRlcigpXG4gICAgICB2aWV3Lm9uIFwiY2hhbmdlXCIsIEByZW5kZXJTdHVkZW50c1xuICAgICAgJHVsLmFwcGVuZCB2aWV3LmVsXG5cbiAgICBAJGVsLmZpbmQoXCIjc3R1ZGVudF9saXN0X3dyYXBwZXJcIikuaHRtbCAkdWxcbiAgICBcbiAgICAjIyNcbiAgICAjIEFkZCBzdHVkZW50IGZlYXR1cmVcbiAgICBzdHVkZW50T3B0aW9uTGlzdCA9IFwiPG9wdGlvbiB2YWx1ZT0nX25vbmUnIGRpc2FibGVkPSdkaXNhYmxlZCcgc2VsZWN0ZWQ9J3NlbGVjdGVkJz4oI3skLnQoJ25hbWUnKX0pIC0gKCN7JC50KCdhZ2UnKX0pPC9vcHRpb24+XCJcbiAgICBmb3Igc3R1ZGVudCBpbiBAYWxsU3R1ZGVudHMubW9kZWxzXG4gICAgICBpc0luQ2xhc3MgPSBmYWxzZVxuICAgICAgZm9yIGRvdWJsZSBpbiBAc3R1ZGVudHMubW9kZWxzXG4gICAgICAgIGlmIGRvdWJsZS5pZCA9PSBzdHVkZW50LmlkIHRoZW4gaXNJbkNsYXNzID0gdHJ1ZVxuICAgICAgaWYgbm90IGlzSW5DbGFzc1xuICAgICAgICBzdHVkZW50T3B0aW9uTGlzdCArPSBcIjxvcHRpb24gZGF0YS1pZD0nI3tzdHVkZW50LmlkfSc+I3tzdHVkZW50LmdldCAnbmFtZSd9IC0gI3tzdHVkZW50LmdldCAnYWdlJ308L29wdGlvbj5cIlxuXG4gICAgQCRlbC5maW5kKFwiI2FkZF9zdHVkZW50X3NlbGVjdFwiKS5odG1sIHN0dWRlbnRPcHRpb25MaXN0XG4gICAgIyMjXG5cbiAgcmVuZGVyOiAtPlxuXG4gICAgc2Nob29sTmFtZSA9IEBrbGFzcy5nZXRTdHJpbmcgXCJzY2hvb2xOYW1lXCJcbiAgICB5ZWFyICAgICAgID0gQGtsYXNzLmdldFN0cmluZyBcInllYXJcIlxuICAgIGdyYWRlICAgICAgPSBAa2xhc3MuZ2V0U3RyaW5nIFwiZ3JhZGVcIlxuICAgIHN0cmVhbSAgICAgPSBAa2xhc3MuZ2V0U3RyaW5nIFwic3RyZWFtXCJcblxuICAgIHN0YXJ0RGF0ZSAgPSBuZXcgRGF0ZSBAa2xhc3MuZ2V0TnVtYmVyIFwic3RhcnREYXRlXCJcblxuICAgIGlmIEBrbGFzcy5nZXQoXCJ0ZWFjaGVySWRcIikgPT0gXCJhZG1pblwiXG4gICAgICB0ZWFjaGVyTmFtZSA9IFwiYWRtaW5cIlxuICAgIGVsc2UgXG4gICAgICB0ZWFjaGVyTmFtZSA9IFxuICAgICAgICBpZiBAdGVhY2hlcnMuZ2V0KEBrbGFzcy5nZXQoJ3RlYWNoZXJJZCcpKSAmJiBAdGVhY2hlcnMuZ2V0KEBrbGFzcy5nZXQoJ3RlYWNoZXJJZCcpKS5oYXMoJ25hbWUnKVxuICAgICAgICAgIEB0ZWFjaGVycy5nZXQoQGtsYXNzLmdldCgndGVhY2hlcklkJykpLmdldCgnbmFtZScpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBcInVua25vd25cIlxuXG4gICAgaHRtbEluZm9UZWFjaGVyID0gXCJcbiAgICAgIDx0cj48dGQ+PGxhYmVsPlRlYWNoZXI8L2xhYmVsPjwvdGQ+PHRkPiN7dGVhY2hlck5hbWV9PC90ZD48L3RyPlxuICAgIFwiIGlmIFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKVxuXG4gICAgaHRtbFRlYWNoZXJTZWxlY3QgPSBcIlxuICAgICAgPGxhYmVsPlRlYWNoZXI8L2xhYmVsPjxicj5cbiAgICAgIDxzZWxlY3QgaWQ9J3RlYWNoZXJfc2VsZWN0Jz5cbiAgICAgICN7KFwiPG9wdGlvbiAje2lmIHRlYWNoZXIuaWQgPT0gQGtsYXNzLmdldCgndGVhY2hlcklkJykgdGhlbiBcInNlbGVjdGVkPSdzZWxlY3RlZCcgXCIgZWxzZSBcIlwifSBkYXRhLXRlYWNoZXJJZD0nI3t0ZWFjaGVyLmlkfSc+I3t0ZWFjaGVyLmdldCgnbmFtZScpfTwvb3B0aW9uPlwiKSBmb3IgdGVhY2hlciBpbiBAdGVhY2hlcnMubW9kZWxzfVxuICAgICAgPC9zZWxlY3Q+XG4gICAgXCIgaWYgVGFuZ2VyaW5lLnVzZXIuaXNBZG1pbigpXG5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICA8YnV0dG9uIGNsYXNzPSdiYWNrIG5hdmlnYXRpb24nPiN7dCgnYmFjaycpfTwvYnV0dG9uPlxuICAgIDxoMT4je3QoJ2NsYXNzIGVkaXRvcicpfTwvaDE+XG4gICAgPGgyPiN7dCgnYmFzaWMgaW5mbycpfTwvaDI+XG4gICAgPHRhYmxlIGNsYXNzPSdpbmZvX2JveCBiYXNpY19pbmZvJz5cbiAgICAgIDx0cj48dGQ+PGxhYmVsPlNjaG9vbCBuYW1lPC9sYWJlbD48L3RkPjx0ZD4je3NjaG9vbE5hbWV9PC90ZD48L3RyPlxuICAgICAgI3todG1sSW5mb1RlYWNoZXIgfHwgXCJcIn1cbiAgICAgIDx0cj48dGQ+PGxhYmVsPlNjaG9vbCB5ZWFyPC9sYWJlbD48L3RkPjx0ZD4je3llYXJ9PC90ZD48L3RyPlxuICAgICAgPHRyPjx0ZD48bGFiZWw+I3t0KCdncmFkZScpfTwvbGFiZWw+PC90ZD48dGQ+I3tncmFkZX08L3RkPjwvdHI+XG4gICAgICA8dHI+PHRkPjxsYWJlbD4je3QoJ3N0cmVhbScpfTwvbGFiZWw+PC90ZD48dGQ+I3tzdHJlYW19PC90ZD48L3RyPlxuICAgICAgPHRyPjx0ZD48bGFiZWw+I3t0KCdzdGFydGluZyBkYXRlJyl9PC9sYWJlbD48L3RkPjx0ZD4je3N0YXJ0RGF0ZS5nZXRGdWxsWWVhcigpK1wiL1wiKyhzdGFydERhdGUuZ2V0TW9udGgoKSsxKStcIi9cIitzdGFydERhdGUuZ2V0RGF0ZSgpfTwvdGQ+PC90cj5cbiAgICAgIDx0cj48dGQgY29sc3Bhbj0nMic+PGJ1dHRvbiBjbGFzcz0nYmFzaWNfaW5mb19lZGl0IGNvbW1hbmQnPiN7dCgnZWRpdCcpfTwvYnV0dG9uPjwvdGQ+PC90cj5cbiAgICA8L3RhYmxlPlxuICAgIDxkaXYgY2xhc3M9J2Jhc2ljX2luZm8gY29uZmlybWF0aW9uJz5cbiAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cblxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0nc2Nob29sX25hbWUnPlNjaG9vbCBuYW1lPC9sYWJlbD5cbiAgICAgICAgICA8aW5wdXQgaWQ9J3NjaG9vbF9uYW1lJyB2YWx1ZT0nI3tzY2hvb2xOYW1lfSc+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgI3todG1sVGVhY2hlclNlbGVjdCB8fCBcIlwifVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgIDxsYWJlbCBmb3I9J3llYXInPlNjaG9vbCB5ZWFyPC9sYWJlbD5cbiAgICAgICAgICA8aW5wdXQgaWQ9J3llYXInIHZhbHVlPScje3llYXJ9Jz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICA8bGFiZWwgZm9yPSdncmFkZSc+I3t0KCdncmFkZScpfTwvbGFiZWw+XG4gICAgICAgICAgPGlucHV0IGlkPSdncmFkZScgdmFsdWU9JyN7Z3JhZGV9Jz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICA8bGFiZWwgZm9yPSdzdHJlYW0nPiN7dCgnc3RyZWFtJyl9PC9sYWJlbD5cbiAgICAgICAgICA8aW5wdXQgaWQ9J3N0cmVhbScgdmFsdWU9JyN7c3RyZWFtfSc+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0nc3RhcnRfZGF0ZSc+I3t0KCdzdGFydGluZyBkYXRlJyl9PC9sYWJlbD5cbiAgICAgICAgICA8aW5wdXQgaWQ9J3N0YXJ0X2RhdGUnIHZhbHVlPScje3N0YXJ0RGF0ZS5nZXRGdWxsWWVhcigpK1wiL1wiKyhzdGFydERhdGUuZ2V0TW9udGgoKSsxKStcIi9cIitzdGFydERhdGUuZ2V0RGF0ZSgpfSc+XG4gICAgICAgIDwvZGl2PlxuICAgICAgXG4gICAgICAgIDxidXR0b24gY2xhc3M9J3NhdmUgY29tbWFuZCc+I3t0KCdzYXZlJyl9PC9idXR0b24+IDxidXR0b24gY2xhc3M9J2Jhc2ljX2luZm9fY2FuY2VsIGNvbW1hbmQnPiN7dCgnY2FuY2VsJyl9PC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBcbiAgICA8aDI+I3t0KCdzdHVkZW50cycpLmNhcGl0YWxpemUoKX08L2gyPlxuICAgIDxkaXYgaWQ9J3N0dWRlbnRfbGlzdF93cmFwcGVyJz48L2Rpdj5cbiAgICA8IS0tIGFkZCBzdHVkZW50IGZlYXR1cmUgLS0+XG4gICAgPCEtLWJ1dHRvbiBjbGFzcz0nYWRkX3N0dWRlbnQgY29tbWFuZCc+QWRkIHN0dWRlbnQ8L2J1dHRvbj5cbiAgICA8ZGl2IGNsYXNzPSdhZGRfc3R1ZGVudF9mb3JtIG1lbnVfYm94IGNvbmZpcm1hdGlvbic+XG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2FkZF9zdHVkZW50X3NlbGVjdCc+I3t0KCdhZGQgc3R1ZGVudCcpfTwvbGFiZWw+PGJyPlxuICAgICAgICA8c2VsZWN0IGlkPSdhZGRfc3R1ZGVudF9zZWxlY3QnPlxuICAgICAgICA8L3NlbGVjdD5cbiAgICAgIDwvZGl2PiAgICAgIFxuICAgICAgPGJ1dHRvbiBjbGFzcz0nYWRkX3N0dWRlbnRfYWRkIGNvbW1hbmQnPiN7dCgnYWRkJyl9PC9idXR0b24+PGJ1dHRvbiBjbGFzcz0nYWRkX3N0dWRlbnRfY2FuY2VsIGNvbW1hbmQnPiN7dCgnY2FuY2VsJyl9PC9idXR0b24+XG4gICAgPC9kaXYtLT5cblxuXG4gICAgPGJ1dHRvbiBjbGFzcz0ncmVnaXN0ZXJfc3R1ZGVudCBjb21tYW5kJz4jeyQudChcInJlZ2lzdGVyIHN0dWRlbnRcIil9PC9idXR0b24+XG4gICAgPGRpdiBjbGFzcz0ncmVnaXN0ZXJfc3R1ZGVudF9mb3JtIG1lbnVfYm94IGNvbmZpcm1hdGlvbic+XG4gICAgICA8aDI+I3t0KCdyZWdpc3RlciBzdHVkZW50Jyl9PC9oMj5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0ncmVnaXN0ZXJfc3R1ZGVudF9uYW1lJz5GdWxsIG5hbWU8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgaWQ9J3JlZ2lzdGVyX3N0dWRlbnRfbmFtZScgdmFsdWU9Jyc+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0ncmVnaXN0ZXJfc3R1ZGVudF9nZW5kZXInPiN7dCgnZ2VuZGVyJyl9PC9sYWJlbD5cbiAgICAgICAgPGlucHV0IGlkPSdyZWdpc3Rlcl9zdHVkZW50X2dlbmRlcicgdmFsdWU9Jyc+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0ncmVnaXN0ZXJfc3R1ZGVudF9hZ2UnPiN7dCgnYWdlJyl9PC9sYWJlbD5cbiAgICAgICAgPGlucHV0IGlkPSdyZWdpc3Rlcl9zdHVkZW50X2FnZScgdmFsdWU9Jyc+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxidXR0b24gY2xhc3M9J3JlZ2lzdGVyX3N0dWRlbnRfc2F2ZSBjb21tYW5kJz4je3QoJ3NhdmUnKX08L2J1dHRvbj5cbiAgICAgIDxidXR0b24gY2xhc3M9J3JlZ2lzdGVyX3N0dWRlbnRfY2FuY2VsIGNvbW1hbmQnPiN7dCgnY2FuY2VsJyl9PC9idXR0b24+XG4gICAgPC9kaXY+XG4gICAgXCJcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4gICAgQHJlbmRlclN0dWRlbnRzKClcbiJdfQ==
