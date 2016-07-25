var AssessmentsMenuView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AssessmentsMenuView = (function(superClass) {
  extend(AssessmentsMenuView, superClass);

  function AssessmentsMenuView() {
    this.newSave = bind(this.newSave, this);
    this.addLessonPlan = bind(this.addLessonPlan, this);
    this.addCurriculum = bind(this.addCurriculum, this);
    this.addAssessment = bind(this.addAssessment, this);
    this.render = bind(this.render, this);
    this.syncTablets = bind(this.syncTablets, this);
    return AssessmentsMenuView.__super__.constructor.apply(this, arguments);
  }

  AssessmentsMenuView.prototype.className = "AssessmentsMenuView";

  AssessmentsMenuView.prototype.events = {
    'keypress .new_name': 'newSave',
    'click .new_save': 'newSave',
    'click .new_cancel': 'newToggle',
    'click .new': 'newToggle',
    'click .import': 'import',
    'click .apk': 'apk',
    'click .groups': 'gotoGroups',
    'click .universal_upload': 'universalUpload',
    'click .sync_tablets': 'syncTablets',
    'click .results': 'results',
    'click .settings': 'editInPlace',
    'keyup .edit_in_place': 'saveInPlace',
    'change .edit_in_place': 'saveInPlace'
  };

  AssessmentsMenuView.prototype.syncTablets = function() {
    return this.tabletManager.sync();
  };

  AssessmentsMenuView.prototype.editInPlace = function(event) {
    var $target, attribute, classes, input, margins;
    if (!Tangerine.user.isAdmin()) {
      return;
    }
    $target = $(event.target);
    attribute = $target.attr("data-attribtue");
    this.oldTarget = $target.clone();
    classes = $target.attr("class").replace("settings", "");
    margins = $target.css("margin");
    $target.after("<input type='text' style='margin:" + margins + ";' data-attribute='" + attribute + "' class='edit_in_place " + classes + "' value='" + (_.escape($target.html())) + "'>");
    input = $target.next().focus();
    return $target.remove();
  };

  AssessmentsMenuView.prototype.saveInPlace = function(event) {
    var $target, attribute, updatedAttributes, value;
    if (this.alreadySaving) {
      return;
    }
    if (event.keyCode) {
      if (event.keyCode === 27) {
        $(event.target).after(this.oldTarget).remove();
        return;
      } else if (event.keyCode !== 13) {
        return true;
      }
    }
    this.alreadySaving = true;
    $target = $(event.target);
    attribute = $target.attr("data-attribute");
    value = $target.val();
    updatedAttributes = {};
    updatedAttributes[attribute] = value;
    return Tangerine.settings.save(updatedAttributes, {
      success: (function(_this) {
        return function() {
          _this.alreadySaving = false;
          Utils.topAlert("Saved");
          return $target.after(_this.oldTarget.html(value)).remove();
        };
      })(this),
      error: (function(_this) {
        return function() {
          _this.alreadySaving = false;
          Utils.topAlert("Save error");
          return $target.after(_this.oldTarget).remove();
        };
      })(this)
    });
  };

  AssessmentsMenuView.prototype.results = function() {
    return Tangerine.router.navigate("dashboard", true);
  };

  AssessmentsMenuView.prototype.universalUpload = function() {
    return Utils.universalUpload();
  };

  AssessmentsMenuView.prototype.apk = function() {
    return TangerineTree.make({
      success: function(data) {
        var a;
        a = document.createElement("a");
        a.href = Tangerine.settings.config.get("tree");
        return Utils.sticky("<h1>APK link</h1><p>" + a.host + "/tree/" + data.token + "</p>");
      },
      error: function(xhr, response) {
        return Utils.sticky(response.message);
      }
    });
  };

  AssessmentsMenuView.prototype.gotoGroups = function() {
    return Tangerine.router.navigate("groups", true);
  };

  AssessmentsMenuView.prototype["import"] = function() {
    return Tangerine.router.navigate("import", true);
  };

  AssessmentsMenuView.prototype.i18n = function() {
    return this.text = {
      "new": t("AssessmentMenuView.button.new"),
      "import": t("AssessmentMenuView.button.import"),
      apk: t("AssessmentMenuView.button.apk"),
      groups: t("AssessmentMenuView.button.groups"),
      universal_upload: t("AssessmentMenuView.button.universal_upload"),
      sync_tablets: t("AssessmentMenuView.button.sync_tablets"),
      results: t("AssessmentMenuView.button.results"),
      save: t("AssessmentMenuView.button.save"),
      cancel: t("AssessmentMenuView.button.cancel"),
      assessment: t("AssessmentMenuView.label.assessment"),
      assessments: t("AssessmentMenuView.label.assessments"),
      curriculum: t("AssessmentMenuView.label.curriculum"),
      lesson_plan: t("AssessmentMenuView.label.lesson_plan")
    };
  };

  AssessmentsMenuView.prototype.initialize = function(options) {
    var key, value;
    this.i18n();
    for (key in options) {
      value = options[key];
      this[key] = value;
    }
    this.assessments.each((function(_this) {
      return function(assessment) {
        return assessment.on("new", _this.addAssessment);
      };
    })(this));
    this.curricula.each((function(_this) {
      return function(curriculum) {
        return curriculum.on("new", _this.addCurriculum);
      };
    })(this));
    this.lessonPlans.each((function(_this) {
      return function(lessonPlan) {
        return lessonPlan.on("new", _this.addLessonPlan);
      };
    })(this));
    this.curriculaListView = new CurriculaListView({
      "curricula": this.curricula
    });
    this.lessonPlansListView = new LessonPlansListView({
      "lessonPlans": this.lessonPlans,
      "parent": this
    });
    this.assessmentsView = new AssessmentsView({
      "assessments": this.assessments,
      "parent": this
    });
    return this.usersMenuView = new UsersMenuView;
  };

  AssessmentsMenuView.prototype.render = function() {
    var apkButton, containers, groupHandle, groupsButton, html, importButton, isAdmin, newButton, resultsButton, syncTabletsButton, uploadButton;
    isAdmin = Tangerine.user.isAdmin();
    newButton = "<button class='new command'>" + this.text["new"] + "</button>";
    importButton = "<button class='import command'>" + this.text["import"] + "</button>";
    apkButton = "<button class='apk navigation'>" + this.text.apk + "</button>";
    groupsButton = "<button class='navigation groups'>" + this.text.groups + "</button>";
    uploadButton = "<button class='command universal_upload'>" + this.text.universal_upload + "</button>";
    syncTabletsButton = "<button class='command sync_tablets'>" + this.text.sync_tablets + "</button>";
    resultsButton = "<button class='navigation results'>" + this.text.results + "</button>";
    groupHandle = "<h2 class='settings grey' data-attribtue='groupHandle'>" + (Tangerine.settings.getEscapedString('groupHandle') || Tangerine.settings.get('groupName')) + "</h2>";
    containers = [];
    if (this.curricula.length !== 0) {
      containers.push("<section id='curricula_container' class='CurriculaListView'></section>");
    }
    if (this.klasses.length !== 0) {
      containers.push("<section id='klass_container' class='KlassesView'></section>");
    }
    if (this.teachers.length !== 0) {
      containers.push("<section id='teachers_container' class='TeachersView'></section>");
    }
    containers.push("<section id='users_menu_container' class='UsersMenuView'></section>");
    html = groupsButton + " " + apkButton + " " + resultsButton + " " + groupHandle + " <section> <h1>" + this.text.assessments + "</h1>";
    if (isAdmin) {
      html += newButton + " " + importButton + " <div class='new_form confirmation'> <div class='menu_box'> <input type='text' class='new_name' placeholder='Name'> <select id='new_type'> <option value='assessment'>" + this.text.assessment + "</option> <option value='curriculum'>" + this.text.curriculum + "</option> <option value='lesson_plan'>" + this.text.lesson_plan + "</option> </select><br> <button class='new_save command'>" + this.text.save + "</button> <button class='new_cancel command'>" + this.text.cancel + "</button> </div> </div> <div id='assessments_container'></div> <div id='lessonPlans_container'></div> </section> " + (containers.join(''));
    } else {
      html += "<div id='assessments_container'></div> <div id='lessonPlans_container'></div> </section>";
    }
    this.$el.html(html);
    this.assessmentsView.setElement(this.$el.find("#assessments_container"));
    this.assessmentsView.render();
    this.curriculaListView.setElement(this.$el.find("#curricula_container"));
    this.curriculaListView.render();
    this.lessonPlansListView.setElement(this.$el.find("#lessonPlans_container"));
    this.lessonPlansListView.render();
    this.usersMenuView.setElement(this.$el.find("#users_menu_container"));
    this.usersMenuView.render();
    if (this.klasses.length > 0) {
      this.klassesView = new KlassesView({
        klasses: this.klasses,
        curricula: this.curricula,
        teachers: this.teachers
      });
      this.klassesView.setElement(this.$el.find("#klass_container"));
      this.klassesView.render();
    } else {
      this.$el.find("#klass_container").remove();
    }
    if (this.teachers.length > 0) {
      this.teachersView = new TeachersView({
        teachers: this.teachers,
        users: this.users
      });
      this.teachersView.setElement(this.$el.find("#teachers_container"));
      this.teachersView.render();
    } else {
      this.$el.find("#teachers_container").remove();
    }
    this.trigger("rendered");
  };

  AssessmentsMenuView.prototype.addAssessment = function(newOne) {
    this.assessments.add(newOne);
    return newOne.on("new", this.addAssessment);
  };

  AssessmentsMenuView.prototype.addCurriculum = function(newOne) {
    this.curricula.add(newOne);
    return newOne.on("new", this.addCurriculum);
  };

  AssessmentsMenuView.prototype.addLessonPlan = function(newOne) {
    this.lessonPlans.add(newOne);
    return newOne.on("new", this.addLessonPlan);
  };

  AssessmentsMenuView.prototype.newToggle = function() {
    this.$el.find('.new_form, .new').toggle();
    return false;
  };

  AssessmentsMenuView.prototype.newSave = function(event) {
    var callback, name, newId, newObject, newType;
    if (event.type !== "click" && event.which !== 13) {
      return true;
    }
    name = this.$el.find('.new_name').val();
    newType = this.$el.find("#new_type option:selected").val();
    newId = Utils.guid();
    if (name.length === 0) {
      Utils.midAlert("<span class='error'>Could not save <img src='images/icon_close.png' class='clear_message'></span>");
      return false;
    }
    if (newType === "assessment") {
      newObject = new Assessment({
        "name": name,
        "_id": newId,
        "assessmentId": newId,
        "archived": false
      });
      callback = this.addAssessment;
    } else if (newType === "curriculum") {
      newObject = new Curriculum({
        "name": name,
        "_id": newId,
        "curriculumId": newId
      });
      callback = this.addCurriculum;
    } else if (newType === "lesson_plan") {
      newObject = new LessonPlan({
        "name": name,
        "_id": newId,
        "lessonPlanId": newId
      });
      callback = this.addLessonPlan;
    }
    newObject.save(null, {
      success: (function(_this) {
        return function() {
          callback(newObject);
          _this.$el.find('.new_form, .new').toggle();
          _this.$el.find('.new_name').val("");
          return Utils.midAlert(name + " saved");
        };
      })(this),
      error: (function(_this) {
        return function() {
          _this.$el.find('.new_form, .new').toggle();
          _this.$el.find('.new_name').val("");
          return Utils.midAlert("Please try again. Error saving.");
        };
      })(this)
    });
    return false;
  };

  AssessmentsMenuView.prototype.closeViews = function() {
    this.assessmentsView.close();
    return this.curriculaListView.close();
  };

  AssessmentsMenuView.prototype.onClose = function() {
    return this.closeViews();
  };

  return AssessmentsMenuView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2Vzc21lbnQvQXNzZXNzbWVudHNNZW51Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxtQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7Ozs7Z0NBRUosU0FBQSxHQUFXOztnQ0FFWCxNQUFBLEdBQ0U7SUFBQSxvQkFBQSxFQUF1QixTQUF2QjtJQUNBLGlCQUFBLEVBQXVCLFNBRHZCO0lBRUEsbUJBQUEsRUFBdUIsV0FGdkI7SUFHQSxZQUFBLEVBQXVCLFdBSHZCO0lBSUEsZUFBQSxFQUF1QixRQUp2QjtJQUtBLFlBQUEsRUFBdUIsS0FMdkI7SUFNQSxlQUFBLEVBQXVCLFlBTnZCO0lBT0EseUJBQUEsRUFBNEIsaUJBUDVCO0lBU0EscUJBQUEsRUFBd0IsYUFUeEI7SUFXQSxnQkFBQSxFQUEwQixTQVgxQjtJQVlBLGlCQUFBLEVBQTBCLGFBWjFCO0lBYUEsc0JBQUEsRUFBMEIsYUFiMUI7SUFjQSx1QkFBQSxFQUEyQixhQWQzQjs7O2dDQWdCRixXQUFBLEdBQWEsU0FBQTtXQUNYLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFBO0VBRFc7O2dDQUdiLFdBQUEsR0FBYSxTQUFDLEtBQUQ7QUFDWCxRQUFBO0lBQUEsSUFBQSxDQUFjLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBZixDQUFBLENBQWQ7QUFBQSxhQUFBOztJQUNBLE9BQUEsR0FBYSxDQUFBLENBQUUsS0FBSyxDQUFDLE1BQVI7SUFDYixTQUFBLEdBQWEsT0FBTyxDQUFDLElBQVIsQ0FBYSxnQkFBYjtJQUNiLElBQUMsQ0FBQSxTQUFELEdBQWEsT0FBTyxDQUFDLEtBQVIsQ0FBQTtJQUNiLE9BQUEsR0FBVSxPQUFPLENBQUMsSUFBUixDQUFhLE9BQWIsQ0FBcUIsQ0FBQyxPQUF0QixDQUE4QixVQUE5QixFQUF5QyxFQUF6QztJQUNWLE9BQUEsR0FBVSxPQUFPLENBQUMsR0FBUixDQUFZLFFBQVo7SUFDVixPQUFPLENBQUMsS0FBUixDQUFjLG1DQUFBLEdB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QUMsQ0FBQSxpQkFBaUIsQ0FBQyxLQUFuQixDQUFBO0VBRlU7O2dDQUlaLE9BQUEsR0FBUyxTQUFBO1dBQ1AsSUFBQyxDQUFBLFVBQUQsQ0FBQTtFQURPOzs7O0dBdFN1QixRQUFRLENBQUMiLCJmaWxlIjoiYXNzZXNzbWVudC9Bc3Nlc3NtZW50c01lbnVWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQXNzZXNzbWVudHNNZW51VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiQXNzZXNzbWVudHNNZW51Vmlld1wiXG5cbiAgZXZlbnRzOlxuICAgICdrZXlwcmVzcyAubmV3X25hbWUnIDogJ25ld1NhdmUnXG4gICAgJ2NsaWNrIC5uZXdfc2F2ZScgICAgOiAnbmV3U2F2ZSdcbiAgICAnY2xpY2sgLm5ld19jYW5jZWwnICA6ICduZXdUb2dnbGUnXG4gICAgJ2NsaWNrIC5uZXcnICAgICAgICAgOiAnbmV3VG9nZ2xlJ1xuICAgICdjbGljayAuaW1wb3J0JyAgICAgIDogJ2ltcG9ydCdcbiAgICAnY2xpY2sgLmFwaycgICAgICAgICA6ICdhcGsnXG4gICAgJ2NsaWNrIC5ncm91cHMnICAgICAgOiAnZ290b0dyb3VwcydcbiAgICAnY2xpY2sgLnVuaXZlcnNhbF91cGxvYWQnIDogJ3VuaXZlcnNhbFVwbG9hZCdcblxuICAgICdjbGljayAuc3luY190YWJsZXRzJyA6ICdzeW5jVGFibGV0cydcblxuICAgICdjbGljayAucmVzdWx0cycgICAgICAgIDogJ3Jlc3VsdHMnXG4gICAgJ2NsaWNrIC5zZXR0aW5ncycgICAgICAgOiAnZWRpdEluUGxhY2UnXG4gICAgJ2tleXVwIC5lZGl0X2luX3BsYWNlJyAgOiAnc2F2ZUluUGxhY2UnXG4gICAgJ2NoYW5nZSAuZWRpdF9pbl9wbGFjZScgIDogJ3NhdmVJblBsYWNlJ1xuXG4gIHN5bmNUYWJsZXRzOiA9PlxuICAgIEB0YWJsZXRNYW5hZ2VyLnN5bmMoKVxuXG4gIGVkaXRJblBsYWNlOiAoZXZlbnQpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBUYW5nZXJpbmUudXNlci5pc0FkbWluKClcbiAgICAkdGFyZ2V0ICAgID0gJChldmVudC50YXJnZXQpXG4gICAgYXR0cmlidXRlICA9ICR0YXJnZXQuYXR0cihcImRhdGEtYXR0cmlidHVlXCIpXG4gICAgQG9sZFRhcmdldCA9ICR0YXJnZXQuY2xvbmUoKVxuICAgIGNsYXNzZXMgPSAkdGFyZ2V0LmF0dHIoXCJjbGFzc1wiKS5yZXBsYWNlKFwic2V0dGluZ3NcIixcIlwiKVxuICAgIG1hcmdpbnMgPSAkdGFyZ2V0LmNzcyhcIm1hcmdpblwiKVxuICAgICR0YXJnZXQuYWZ0ZXIoXCI8aW5wdXQgdHlwZT0ndGV4dCcgc3R5bGU9J21hcmdpbjoje21hcmdpbnN9OycgZGF0YS1hdHRyaWJ1dGU9JyN7YXR0cmlidXRlfScgY2xhc3M9J2VkaXRfaW5fcGxhY2UgI3tjbGFzc2VzfScgdmFsdWU9JyN7Xy5lc2NhcGUoJHRhcmdldC5odG1sKCkpfSc+XCIpXG4gICAgaW5wdXQgPSAkdGFyZ2V0Lm5leHQoKS5mb2N1cygpXG4gICAgJHRhcmdldC5yZW1vdmUoKVxuXG4gIHNhdmVJblBsYWNlOiAoZXZlbnQpIC0+XG5cbiAgICByZXR1cm4gaWYgQGFscmVhZHlTYXZpbmdcblxuICAgIGlmIGV2ZW50LmtleUNvZGVcbiAgICAgIGlmIGV2ZW50LmtleUNvZGUgPT0gMjdcbiAgICAgICAgJChldmVudC50YXJnZXQpLmFmdGVyKEBvbGRUYXJnZXQpLnJlbW92ZSgpXG4gICAgICAgIHJldHVyblxuICAgICAgZWxzZSBpZiBldmVudC5rZXlDb2RlICE9IDEzXG4gICAgICAgIHJldHVybiB0cnVlXG5cbiAgICBAYWxyZWFkeVNhdmluZyA9IHRydWVcbiAgICAkdGFyZ2V0ICAgPSAkKGV2ZW50LnRhcmdldClcbiAgICBhdHRyaWJ1dGUgPSAkdGFyZ2V0LmF0dHIoXCJkYXRhLWF0dHJpYnV0ZVwiKVxuICAgIHZhbHVlICAgICA9ICR0YXJnZXQudmFsKClcblxuICAgIHVwZGF0ZWRBdHRyaWJ1dGVzICAgICAgICAgICAgPSB7fVxuICAgIHVwZGF0ZWRBdHRyaWJ1dGVzW2F0dHJpYnV0ZV0gPSB2YWx1ZVxuXG4gICAgVGFuZ2VyaW5lLnNldHRpbmdzLnNhdmUgdXBkYXRlZEF0dHJpYnV0ZXMsXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBAYWxyZWFkeVNhdmluZyA9IGZhbHNlXG4gICAgICAgIFV0aWxzLnRvcEFsZXJ0KFwiU2F2ZWRcIilcbiAgICAgICAgJHRhcmdldC5hZnRlcihAb2xkVGFyZ2V0Lmh0bWwodmFsdWUpKS5yZW1vdmUoKVxuICAgICAgZXJyb3I6ID0+XG4gICAgICAgIEBhbHJlYWR5U2F2aW5nID0gZmFsc2VcbiAgICAgICAgVXRpbHMudG9wQWxlcnQoXCJTYXZlIGVycm9yXCIpXG4gICAgICAgICR0YXJnZXQuYWZ0ZXIoQG9sZFRhcmdldCkucmVtb3ZlKClcblxuICByZXN1bHRzOiAtPiBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiZGFzaGJvYXJkXCIsIHRydWVcblxuICB1bml2ZXJzYWxVcGxvYWQ6IC0+IFV0aWxzLnVuaXZlcnNhbFVwbG9hZCgpXG5cbiAgYXBrOiAtPlxuICAgIFRhbmdlcmluZVRyZWUubWFrZVxuICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKVxuICAgICAgICBhLmhyZWYgPSBUYW5nZXJpbmUuc2V0dGluZ3MuY29uZmlnLmdldChcInRyZWVcIilcbiAgICAgICAgVXRpbHMuc3RpY2t5KFwiPGgxPkFQSyBsaW5rPC9oMT48cD4je2EuaG9zdH0vdHJlZS8je2RhdGEudG9rZW59PC9wPlwiKVxuICAgICAgZXJyb3I6ICh4aHIsIHJlc3BvbnNlKSAtPlxuICAgICAgICBVdGlscy5zdGlja3kgcmVzcG9uc2UubWVzc2FnZVxuXG4gIGdvdG9Hcm91cHM6IC0+IFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJncm91cHNcIiwgdHJ1ZVxuXG4gIGltcG9ydDogICAgIC0+IFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJpbXBvcnRcIiwgdHJ1ZVxuXG4gIGkxOG46IC0+XG4gICAgQHRleHQgPVxuICAgICAgXCJuZXdcIiAgICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24ubmV3XCIpXG4gICAgICBpbXBvcnQgICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24uaW1wb3J0XCIpXG4gICAgICBhcGsgICAgICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24uYXBrXCIpXG4gICAgICBncm91cHMgICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24uZ3JvdXBzXCIpXG4gICAgICB1bml2ZXJzYWxfdXBsb2FkIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24udW5pdmVyc2FsX3VwbG9hZFwiKVxuICAgICAgc3luY190YWJsZXRzICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLnN5bmNfdGFibGV0c1wiKVxuICAgICAgcmVzdWx0cyAgICAgICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLnJlc3VsdHNcIilcbiAgICAgIHNhdmUgICAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5zYXZlXCIpXG4gICAgICBjYW5jZWwgICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24uY2FuY2VsXCIpXG4gICAgICBhc3Nlc3NtZW50ICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcubGFiZWwuYXNzZXNzbWVudFwiKVxuICAgICAgYXNzZXNzbWVudHMgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmxhYmVsLmFzc2Vzc21lbnRzXCIpXG4gICAgICBjdXJyaWN1bHVtICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcubGFiZWwuY3VycmljdWx1bVwiKVxuICAgICAgbGVzc29uX3BsYW4gIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5sYWJlbC5sZXNzb25fcGxhblwiKVxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQGkxOG4oKVxuXG4gICAgQFtrZXldID0gdmFsdWUgZm9yIGtleSwgdmFsdWUgb2Ygb3B0aW9uc1xuXG4gICAgQGFzc2Vzc21lbnRzLmVhY2ggKGFzc2Vzc21lbnQpID0+IGFzc2Vzc21lbnQub24gXCJuZXdcIiwgQGFkZEFzc2Vzc21lbnRcbiAgICBAY3VycmljdWxhLmVhY2ggICAoY3VycmljdWx1bSkgPT4gY3VycmljdWx1bS5vbiBcIm5ld1wiLCBAYWRkQ3VycmljdWx1bVxuICAgIEBsZXNzb25QbGFucy5lYWNoICAgKGxlc3NvblBsYW4pID0+IGxlc3NvblBsYW4ub24gXCJuZXdcIiwgQGFkZExlc3NvblBsYW5cblxuICAgIEBjdXJyaWN1bGFMaXN0VmlldyA9IG5ldyBDdXJyaWN1bGFMaXN0Vmlld1xuICAgICAgXCJjdXJyaWN1bGFcIiA6IEBjdXJyaWN1bGFcblxuICAgIEBsZXNzb25QbGFuc0xpc3RWaWV3ID0gbmV3IExlc3NvblBsYW5zTGlzdFZpZXdcbiAgICAgIFwibGVzc29uUGxhbnNcIiA6IEBsZXNzb25QbGFuc1xuICAgICAgXCJwYXJlbnRcIiAgICAgIDogQFxuXG4gICAgQGFzc2Vzc21lbnRzVmlldyA9IG5ldyBBc3Nlc3NtZW50c1ZpZXdcbiAgICAgIFwiYXNzZXNzbWVudHNcIiA6IEBhc3Nlc3NtZW50c1xuICAgICAgXCJwYXJlbnRcIiAgICAgIDogQFxuXG4gICAgQHVzZXJzTWVudVZpZXcgPSBuZXcgVXNlcnNNZW51Vmlld1xuXG4gIHJlbmRlcjogPT5cblxuICAgIGlzQWRtaW4gPSBUYW5nZXJpbmUudXNlci5pc0FkbWluKClcblxuICAgIG5ld0J1dHRvbiAgICAgPSBcIjxidXR0b24gY2xhc3M9J25ldyBjb21tYW5kJz4je0B0ZXh0Lm5ld308L2J1dHRvbj5cIlxuICAgIGltcG9ydEJ1dHRvbiAgPSBcIjxidXR0b24gY2xhc3M9J2ltcG9ydCBjb21tYW5kJz4je0B0ZXh0LmltcG9ydH08L2J1dHRvbj5cIlxuICAgIGFwa0J1dHRvbiAgICAgPSBcIjxidXR0b24gY2xhc3M9J2FwayBuYXZpZ2F0aW9uJz4je0B0ZXh0LmFwa308L2J1dHRvbj5cIlxuICAgIGdyb3Vwc0J1dHRvbiAgPSBcIjxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gZ3JvdXBzJz4je0B0ZXh0Lmdyb3Vwc308L2J1dHRvbj5cIlxuICAgIHVwbG9hZEJ1dHRvbiAgPSBcIjxidXR0b24gY2xhc3M9J2NvbW1hbmQgdW5pdmVyc2FsX3VwbG9hZCc+I3tAdGV4dC51bml2ZXJzYWxfdXBsb2FkfTwvYnV0dG9uPlwiXG4gICAgc3luY1RhYmxldHNCdXR0b24gPSBcIjxidXR0b24gY2xhc3M9J2NvbW1hbmQgc3luY190YWJsZXRzJz4je0B0ZXh0LnN5bmNfdGFibGV0c308L2J1dHRvbj5cIlxuICAgIHJlc3VsdHNCdXR0b24gPSBcIjxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gcmVzdWx0cyc+I3tAdGV4dC5yZXN1bHRzfTwvYnV0dG9uPlwiXG4gICAgZ3JvdXBIYW5kbGUgICA9IFwiPGgyIGNsYXNzPSdzZXR0aW5ncyBncmV5JyBkYXRhLWF0dHJpYnR1ZT0nZ3JvdXBIYW5kbGUnPiN7VGFuZ2VyaW5lLnNldHRpbmdzLmdldEVzY2FwZWRTdHJpbmcoJ2dyb3VwSGFuZGxlJykgfHwgVGFuZ2VyaW5lLnNldHRpbmdzLmdldCgnZ3JvdXBOYW1lJyl9PC9oMj5cIlxuXG5cbiAgICBjb250YWluZXJzID0gW11cbiAgICBjb250YWluZXJzLnB1c2ggXCI8c2VjdGlvbiBpZD0nY3VycmljdWxhX2NvbnRhaW5lcicgY2xhc3M9J0N1cnJpY3VsYUxpc3RWaWV3Jz48L3NlY3Rpb24+XCIgaWYgQGN1cnJpY3VsYS5sZW5ndGggaXNudCAwXG4gICAgY29udGFpbmVycy5wdXNoIFwiPHNlY3Rpb24gaWQ9J2tsYXNzX2NvbnRhaW5lcicgY2xhc3M9J0tsYXNzZXNWaWV3Jz48L3NlY3Rpb24+XCIgICAgICAgICBpZiBAa2xhc3Nlcy5sZW5ndGggaXNudCAwXG4gICAgY29udGFpbmVycy5wdXNoIFwiPHNlY3Rpb24gaWQ9J3RlYWNoZXJzX2NvbnRhaW5lcicgY2xhc3M9J1RlYWNoZXJzVmlldyc+PC9zZWN0aW9uPlwiICAgICBpZiBAdGVhY2hlcnMubGVuZ3RoIGlzbnQgMFxuICAgIGNvbnRhaW5lcnMucHVzaCBcIjxzZWN0aW9uIGlkPSd1c2Vyc19tZW51X2NvbnRhaW5lcicgY2xhc3M9J1VzZXJzTWVudVZpZXcnPjwvc2VjdGlvbj5cIlxuXG5cblxuICAgIGh0bWwgPSBcIlxuICAgICAgI3tncm91cHNCdXR0b259XG4gICAgICAje2Fwa0J1dHRvbn1cbiAgICAgICN7cmVzdWx0c0J1dHRvbn1cbiAgICAgICN7Z3JvdXBIYW5kbGV9XG4gICAgICA8c2VjdGlvbj5cbiAgICAgICAgPGgxPiN7QHRleHQuYXNzZXNzbWVudHN9PC9oMT5cbiAgICBcIlxuXG4gICAgaWYgaXNBZG1pblxuICAgICAgaHRtbCArPSBcIlxuICAgICAgICAgICN7bmV3QnV0dG9ufVxuICAgICAgICAgICN7aW1wb3J0QnV0dG9ufVxuXG4gICAgICAgICAgPGRpdiBjbGFzcz0nbmV3X2Zvcm0gY29uZmlybWF0aW9uJz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9J3RleHQnIGNsYXNzPSduZXdfbmFtZScgcGxhY2Vob2xkZXI9J05hbWUnPlxuICAgICAgICAgICAgICA8c2VsZWN0IGlkPSduZXdfdHlwZSc+XG4gICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0nYXNzZXNzbWVudCc+I3tAdGV4dC5hc3Nlc3NtZW50fTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9J2N1cnJpY3VsdW0nPiN7QHRleHQuY3VycmljdWx1bX08L29wdGlvbj5cbiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSdsZXNzb25fcGxhbic+I3tAdGV4dC5sZXNzb25fcGxhbn08L29wdGlvbj5cbiAgICAgICAgICAgICAgPC9zZWxlY3Q+PGJyPlxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduZXdfc2F2ZSBjb21tYW5kJz4je0B0ZXh0LnNhdmV9PC9idXR0b24+IDxidXR0b24gY2xhc3M9J25ld19jYW5jZWwgY29tbWFuZCc+I3tAdGV4dC5jYW5jZWx9PC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGlkPSdhc3Nlc3NtZW50c19jb250YWluZXInPjwvZGl2PlxuICAgICAgICAgIDxkaXYgaWQ9J2xlc3NvblBsYW5zX2NvbnRhaW5lcic+PC9kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICAje2NvbnRhaW5lcnMuam9pbignJyl9XG5cbiAgICAgIFwiXG4gICAgZWxzZVxuICAgICAgaHRtbCArPSBcIlxuICAgICAgICA8ZGl2IGlkPSdhc3Nlc3NtZW50c19jb250YWluZXInPjwvZGl2PlxuICAgICAgICA8ZGl2IGlkPSdsZXNzb25QbGFuc19jb250YWluZXInPjwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuICAgICAgXCJcblxuICAgIEAkZWwuaHRtbCBodG1sXG5cbiAgICBAYXNzZXNzbWVudHNWaWV3LnNldEVsZW1lbnQoIEAkZWwuZmluZChcIiNhc3Nlc3NtZW50c19jb250YWluZXJcIikgKVxuICAgIEBhc3Nlc3NtZW50c1ZpZXcucmVuZGVyKClcblxuICAgIEBjdXJyaWN1bGFMaXN0Vmlldy5zZXRFbGVtZW50KCBAJGVsLmZpbmQoXCIjY3VycmljdWxhX2NvbnRhaW5lclwiKSApXG4gICAgQGN1cnJpY3VsYUxpc3RWaWV3LnJlbmRlcigpXG5cbiAgICBAbGVzc29uUGxhbnNMaXN0Vmlldy5zZXRFbGVtZW50KCBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbnNfY29udGFpbmVyXCIpIClcbiAgICBAbGVzc29uUGxhbnNMaXN0Vmlldy5yZW5kZXIoKVxuXG4gICAgQHVzZXJzTWVudVZpZXcuc2V0RWxlbWVudCggQCRlbC5maW5kKFwiI3VzZXJzX21lbnVfY29udGFpbmVyXCIpIClcbiAgICBAdXNlcnNNZW51Vmlldy5yZW5kZXIoKVxuXG4gICAgaWYgQGtsYXNzZXMubGVuZ3RoID4gMFxuICAgICAgQGtsYXNzZXNWaWV3ID0gbmV3IEtsYXNzZXNWaWV3XG4gICAgICAgIGtsYXNzZXMgOiBAa2xhc3Nlc1xuICAgICAgICBjdXJyaWN1bGEgOiBAY3VycmljdWxhXG4gICAgICAgIHRlYWNoZXJzIDogQHRlYWNoZXJzXG4gICAgICBAa2xhc3Nlc1ZpZXcuc2V0RWxlbWVudCBAJGVsLmZpbmQoXCIja2xhc3NfY29udGFpbmVyXCIpXG4gICAgICBAa2xhc3Nlc1ZpZXcucmVuZGVyKClcbiAgICBlbHNlXG4gICAgICBAJGVsLmZpbmQoXCIja2xhc3NfY29udGFpbmVyXCIpLnJlbW92ZSgpXG5cblxuICAgIGlmIEB0ZWFjaGVycy5sZW5ndGggPiAwXG4gICAgICBAdGVhY2hlcnNWaWV3ID0gbmV3IFRlYWNoZXJzVmlld1xuICAgICAgICB0ZWFjaGVycyA6IEB0ZWFjaGVyc1xuICAgICAgICB1c2VycyA6IEB1c2Vyc1xuICAgICAgQHRlYWNoZXJzVmlldy5zZXRFbGVtZW50IEAkZWwuZmluZChcIiN0ZWFjaGVyc19jb250YWluZXJcIilcbiAgICAgIEB0ZWFjaGVyc1ZpZXcucmVuZGVyKClcbiAgICBlbHNlXG4gICAgICBAJGVsLmZpbmQoXCIjdGVhY2hlcnNfY29udGFpbmVyXCIpLnJlbW92ZSgpXG5cblxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgICByZXR1cm5cblxuXG4gIGFkZEFzc2Vzc21lbnQ6IChuZXdPbmUpID0+XG4gICAgQGFzc2Vzc21lbnRzLmFkZCBuZXdPbmVcbiAgICBuZXdPbmUub24gXCJuZXdcIiwgQGFkZEFzc2Vzc21lbnRcblxuICBhZGRDdXJyaWN1bHVtOiAobmV3T25lKSA9PlxuICAgIEBjdXJyaWN1bGEuYWRkIG5ld09uZVxuICAgIG5ld09uZS5vbiBcIm5ld1wiLCBAYWRkQ3VycmljdWx1bVxuXG4gIGFkZExlc3NvblBsYW46IChuZXdPbmUpID0+XG4gICAgQGxlc3NvblBsYW5zLmFkZCBuZXdPbmVcbiAgICBuZXdPbmUub24gXCJuZXdcIiwgQGFkZExlc3NvblBsYW5cblxuICAjIE1ha2luZyBhIG5ldyBhc3Nlc3NtZW50XG4gIG5ld1RvZ2dsZTogLT4gQCRlbC5maW5kKCcubmV3X2Zvcm0sIC5uZXcnKS50b2dnbGUoKTsgZmFsc2VcblxuICBuZXdTYXZlOiAoZXZlbnQpID0+XG5cbiAgICAjIHRoaXMgaGFuZGxlcyBhbWJpZ3VvdXMgZXZlbnRzXG4gICAgIyB0aGUgaWRlYSBpcyB0byBzdXBwb3J0IGNsaWNrcyBhbmQgdGhlIGVudGVyIGtleVxuICAgICMgbG9naWM6XG4gICAgIyBpdCBpdCdzIGEga2V5c3Ryb2tlIGFuZCBpdCdzIG5vdCBlbnRlciwgYWN0IG5vcm1hbGx5LCBqdXN0IGEga2V5IHN0cm9rZVxuICAgICMgaWYgaXQncyBhIGNsaWNrIG9yIGVudGVyLCBwcm9jZXNzIHRoZSBmb3JtXG5cbiAgICBpZiBldmVudC50eXBlICE9IFwiY2xpY2tcIiAmJiBldmVudC53aGljaCAhPSAxM1xuICAgICAgcmV0dXJuIHRydWVcblxuICAgIG5hbWUgICAgPSBAJGVsLmZpbmQoJy5uZXdfbmFtZScpLnZhbCgpXG4gICAgbmV3VHlwZSA9IEAkZWwuZmluZChcIiNuZXdfdHlwZSBvcHRpb246c2VsZWN0ZWRcIikudmFsKClcbiAgICBuZXdJZCAgID0gVXRpbHMuZ3VpZCgpXG5cbiAgICBpZiBuYW1lLmxlbmd0aCA9PSAwXG4gICAgICBVdGlscy5taWRBbGVydCBcIjxzcGFuIGNsYXNzPSdlcnJvcic+Q291bGQgbm90IHNhdmUgPGltZyBzcmM9J2ltYWdlcy9pY29uX2Nsb3NlLnBuZycgY2xhc3M9J2NsZWFyX21lc3NhZ2UnPjwvc3Bhbj5cIlxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBpZiBuZXdUeXBlID09IFwiYXNzZXNzbWVudFwiXG4gICAgICBuZXdPYmplY3QgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICBcIm5hbWVcIiAgICAgICAgIDogbmFtZVxuICAgICAgICBcIl9pZFwiICAgICAgICAgIDogbmV3SWRcbiAgICAgICAgXCJhc3Nlc3NtZW50SWRcIiA6IG5ld0lkXG4gICAgICAgIFwiYXJjaGl2ZWRcIiAgICAgOiBmYWxzZVxuICAgICAgY2FsbGJhY2sgPSBAYWRkQXNzZXNzbWVudFxuICAgIGVsc2UgaWYgbmV3VHlwZSA9PSBcImN1cnJpY3VsdW1cIlxuICAgICAgbmV3T2JqZWN0ID0gbmV3IEN1cnJpY3VsdW1cbiAgICAgICAgXCJuYW1lXCIgICAgICAgICA6IG5hbWVcbiAgICAgICAgXCJfaWRcIiAgICAgICAgICA6IG5ld0lkXG4gICAgICAgIFwiY3VycmljdWx1bUlkXCIgOiBuZXdJZFxuICAgICAgY2FsbGJhY2sgPSBAYWRkQ3VycmljdWx1bVxuICAgIGVsc2UgaWYgbmV3VHlwZSA9PSBcImxlc3Nvbl9wbGFuXCJcbiAgICAgIG5ld09iamVjdCA9IG5ldyBMZXNzb25QbGFuXG4gICAgICAgIFwibmFtZVwiICAgICAgICAgOiBuYW1lXG4gICAgICAgIFwiX2lkXCIgICAgICAgICAgOiBuZXdJZFxuICAgICAgICBcImxlc3NvblBsYW5JZFwiIDogbmV3SWRcbiAgICAgIGNhbGxiYWNrID0gQGFkZExlc3NvblBsYW5cblxuICAgIG5ld09iamVjdC5zYXZlIG51bGwsXG4gICAgICBzdWNjZXNzIDogPT5cbiAgICAgICAgY2FsbGJhY2sobmV3T2JqZWN0KVxuICAgICAgICBAJGVsLmZpbmQoJy5uZXdfZm9ybSwgLm5ldycpLnRvZ2dsZSgpXG4gICAgICAgIEAkZWwuZmluZCgnLm5ld19uYW1lJykudmFsIFwiXCJcbiAgICAgICAgVXRpbHMubWlkQWxlcnQgXCIje25hbWV9IHNhdmVkXCJcbiAgICAgIGVycm9yOiA9PlxuICAgICAgICBAJGVsLmZpbmQoJy5uZXdfZm9ybSwgLm5ldycpLnRvZ2dsZSgpXG4gICAgICAgIEAkZWwuZmluZCgnLm5ld19uYW1lJykudmFsIFwiXCJcbiAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJQbGVhc2UgdHJ5IGFnYWluLiBFcnJvciBzYXZpbmcuXCJcblxuICAgIHJldHVybiBmYWxzZVxuXG4gICMgVmlld01hbmFnZXJcbiAgY2xvc2VWaWV3czogLT5cbiAgICBAYXNzZXNzbWVudHNWaWV3LmNsb3NlKClcbiAgICBAY3VycmljdWxhTGlzdFZpZXcuY2xvc2UoKVxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgQGNsb3NlVmlld3MoKVxuIl19
