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
        var a, groupName, language, languageCodes;
        a = document.createElement("a");
        a.href = Tangerine.settings.config.get("tree");
        groupName = Tangerine.settings.get('groupName');
        languageCodes = {
          af_somali: 'SO',
          amharic: 'AM',
          afaan_oromo: 'OR',
          hadiyysa: 'HY',
          sidaamu_affo: 'SD',
          tigrinya: 'TG',
          wolayttatto: 'WT'
        };
        language = languageCodes[groupName];
        if (typeof language === 'undefined') {
          language = groupName;
        }
        return Utils.sticky("<h1>APK link</h1><p><a href='http://" + a.host + "/tree/" + data.token + "/" + language + "'>" + a.host + "/tree/" + data.token + "/" + language + "</a></p>");
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
      lesson_plans: t("AssessmentMenuView.label.lesson_plans"),
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
    Tangerine.available = [];
    Tangerine.firstLessonId = null;
    this.lessonPlans.each((function(_this) {
      return function(lessonPlan) {
        var day, id, week;
        lessonPlan.on("new", _this.addLessonPlan);
        week = lessonPlan.get("lessonPlan_week");
        day = lessonPlan.get("lessonPlan_day");
        id = lessonPlan.get("_id");
        if (week === '1' && day === '1') {
          Tangerine.firstLessonId = id;
        }
        return Tangerine.available.push([week, day, id]);
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
    html = groupsButton + " " + apkButton + " " + resultsButton + " " + groupHandle + " <section> <h1>" + this.text.lesson_plans + "</h1>";
    if (isAdmin) {
      html += newButton + " " + importButton + " <div class='new_form confirmation'> <div class='menu_box'> <input type='text' class='new_name' placeholder='Name'> <select id='new_type'> <option value='lesson_plan'>" + this.text.lesson_plan + "</option> </select><br> <button class='new_save command'>" + this.text.save + "</button> <button class='new_cancel command'>" + this.text.cancel + "</button> </div> </div> <div id='assessments_container'></div> <div id='lessonPlans_container'></div> </section> " + (containers.join(''));
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
        "lessonPlan_title": name,
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2Vzc21lbnQvQXNzZXNzbWVudHNNZW51Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxtQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7Ozs7Z0NBRUosU0FBQSxHQUFXOztnQ0FFWCxNQUFBLEdBQ0U7SUFBQSxvQkFBQSxFQUF1QixTQUF2QjtJQUNBLGlCQUFBLEVBQXVCLFNBRHZCO0lBRUEsbUJBQUEsRUFBdUIsV0FGdkI7SUFHQSxZQUFBLEVBQXVCLFdBSHZCO0lBSUEsZUFBQSxFQUF1QixRQUp2QjtJQUtBLFlBQUEsRUFBdUIsS0FMdkI7SUFNQSxlQUFBLEVBQXVCLFlBTnZCO0lBT0EseUJBQUEsRUFBNEIsaUJBUDVCO0lBU0EscUJBQUEsRUFBd0IsYUFUeEI7SUFXQSxnQkFBQSxFQUEwQixTQVgxQjtJQVlBLGlCQUFBLEVBQTBCLGFBWjFCO0lBYUEsc0JBQUEsRUFBMEIsYUFiMUI7SUFjQSx1QkFBQSxFQUEyQixhQWQzQjs7O2dDQWdCRixXQUFBLEdBQWEsU0FBQTtXQUNYLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFBO0VBRFc7O2dDQUdiLFdBQUEsR0FBYSxTQUFDLEtBQUQ7QUFDWCxRQUFBO0lBQUEsSUFBQSxDQUFjLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBZixDQUFBLENBQWQ7QUFBQSxhQUFBOztJQUNBLE9BQUEsR0FBYSxDQUFBLENBQUUsS0FBSyxDQUFDLE1BQVI7SUFDYixTQUFBLEdBQWEsT0FBTyxDQUFDLElBQVIsQ0FBYSxnQkFBYjtJQUNiLElBQUMsQ0FBQSxTQUFELEdBQWEsT0FBTyxDQUFDLEtBQVIsQ0FBQTtJQUNiLE9BQUEsR0FBVSxPQUFPLENBQUMsSUFBUixDQUFhLE9BQWIsQ0FBcUIsQ0FBQyxPQUF0QixDQUE4QixVQUE5QixFQUF5QyxFQUF6QztJQUNWLE9BQUEsR0FBVSxPQUFPLENBQUMsR0FBUixDQUFZLFFBQVo7SUFDVixPQUFPLENBQUMsS0FBUixDQUFjLG1DQUFBLEdB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QUE2QixJQUQ3QjtRQUVBLEtBQUEsRUFBaUIsS0FGakI7UUFHQSxjQUFBLEVBQWlCLEtBSGpCO09BRGM7TUFLaEIsUUFBQSxHQUFXLElBQUMsQ0FBQSxjQU5UOztJQVFMLFNBQVMsQ0FBQyxJQUFWLENBQWUsSUFBZixFQUNFO01BQUEsT0FBQSxFQUFVLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNSLFFBQUEsQ0FBUyxTQUFUO1VBQ0EsS0FBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsaUJBQVYsQ0FBNEIsQ0FBQyxNQUE3QixDQUFBO1VBQ0EsS0FBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsV0FBVixDQUFzQixDQUFDLEdBQXZCLENBQTJCLEVBQTNCO2lCQUNBLEtBQUssQ0FBQyxRQUFOLENBQWtCLElBQUQsR0FBTSxRQUF2QjtRQUpRO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFWO01BS0EsS0FBQSxFQUFPLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNMLEtBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlCQUFWLENBQTRCLENBQUMsTUFBN0IsQ0FBQTtVQUNBLEtBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFdBQVYsQ0FBc0IsQ0FBQyxHQUF2QixDQUEyQixFQUEzQjtpQkFDQSxLQUFLLENBQUMsUUFBTixDQUFlLGlDQUFmO1FBSEs7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTFA7S0FERjtBQVdBLFdBQU87RUFuREE7O2dDQXNEVCxVQUFBLEdBQVksU0FBQTtJQUNWLElBQUMsQ0FBQSxlQUFlLENBQUMsS0FBakIsQ0FBQTtXQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxLQUFuQixDQUFBO0VBRlU7O2dDQUlaLE9BQUEsR0FBUyxTQUFBO1dBQ1AsSUFBQyxDQUFBLFVBQUQsQ0FBQTtFQURPOzs7O0dBelV1QixRQUFRLENBQUMiLCJmaWxlIjoiYXNzZXNzbWVudC9Bc3Nlc3NtZW50c01lbnVWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQXNzZXNzbWVudHNNZW51VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiQXNzZXNzbWVudHNNZW51Vmlld1wiXG5cbiAgZXZlbnRzOlxuICAgICdrZXlwcmVzcyAubmV3X25hbWUnIDogJ25ld1NhdmUnXG4gICAgJ2NsaWNrIC5uZXdfc2F2ZScgICAgOiAnbmV3U2F2ZSdcbiAgICAnY2xpY2sgLm5ld19jYW5jZWwnICA6ICduZXdUb2dnbGUnXG4gICAgJ2NsaWNrIC5uZXcnICAgICAgICAgOiAnbmV3VG9nZ2xlJ1xuICAgICdjbGljayAuaW1wb3J0JyAgICAgIDogJ2ltcG9ydCdcbiAgICAnY2xpY2sgLmFwaycgICAgICAgICA6ICdhcGsnXG4gICAgJ2NsaWNrIC5ncm91cHMnICAgICAgOiAnZ290b0dyb3VwcydcbiAgICAnY2xpY2sgLnVuaXZlcnNhbF91cGxvYWQnIDogJ3VuaXZlcnNhbFVwbG9hZCdcblxuICAgICdjbGljayAuc3luY190YWJsZXRzJyA6ICdzeW5jVGFibGV0cydcblxuICAgICdjbGljayAucmVzdWx0cycgICAgICAgIDogJ3Jlc3VsdHMnXG4gICAgJ2NsaWNrIC5zZXR0aW5ncycgICAgICAgOiAnZWRpdEluUGxhY2UnXG4gICAgJ2tleXVwIC5lZGl0X2luX3BsYWNlJyAgOiAnc2F2ZUluUGxhY2UnXG4gICAgJ2NoYW5nZSAuZWRpdF9pbl9wbGFjZScgIDogJ3NhdmVJblBsYWNlJ1xuXG4gIHN5bmNUYWJsZXRzOiA9PlxuICAgIEB0YWJsZXRNYW5hZ2VyLnN5bmMoKVxuXG4gIGVkaXRJblBsYWNlOiAoZXZlbnQpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBUYW5nZXJpbmUudXNlci5pc0FkbWluKClcbiAgICAkdGFyZ2V0ICAgID0gJChldmVudC50YXJnZXQpXG4gICAgYXR0cmlidXRlICA9ICR0YXJnZXQuYXR0cihcImRhdGEtYXR0cmlidHVlXCIpXG4gICAgQG9sZFRhcmdldCA9ICR0YXJnZXQuY2xvbmUoKVxuICAgIGNsYXNzZXMgPSAkdGFyZ2V0LmF0dHIoXCJjbGFzc1wiKS5yZXBsYWNlKFwic2V0dGluZ3NcIixcIlwiKVxuICAgIG1hcmdpbnMgPSAkdGFyZ2V0LmNzcyhcIm1hcmdpblwiKVxuICAgICR0YXJnZXQuYWZ0ZXIoXCI8aW5wdXQgdHlwZT0ndGV4dCcgc3R5bGU9J21hcmdpbjoje21hcmdpbnN9OycgZGF0YS1hdHRyaWJ1dGU9JyN7YXR0cmlidXRlfScgY2xhc3M9J2VkaXRfaW5fcGxhY2UgI3tjbGFzc2VzfScgdmFsdWU9JyN7Xy5lc2NhcGUoJHRhcmdldC5odG1sKCkpfSc+XCIpXG4gICAgaW5wdXQgPSAkdGFyZ2V0Lm5leHQoKS5mb2N1cygpXG4gICAgJHRhcmdldC5yZW1vdmUoKVxuXG4gIHNhdmVJblBsYWNlOiAoZXZlbnQpIC0+XG5cbiAgICByZXR1cm4gaWYgQGFscmVhZHlTYXZpbmdcblxuICAgIGlmIGV2ZW50LmtleUNvZGVcbiAgICAgIGlmIGV2ZW50LmtleUNvZGUgPT0gMjdcbiAgICAgICAgJChldmVudC50YXJnZXQpLmFmdGVyKEBvbGRUYXJnZXQpLnJlbW92ZSgpXG4gICAgICAgIHJldHVyblxuICAgICAgZWxzZSBpZiBldmVudC5rZXlDb2RlICE9IDEzXG4gICAgICAgIHJldHVybiB0cnVlXG5cbiAgICBAYWxyZWFkeVNhdmluZyA9IHRydWVcbiAgICAkdGFyZ2V0ICAgPSAkKGV2ZW50LnRhcmdldClcbiAgICBhdHRyaWJ1dGUgPSAkdGFyZ2V0LmF0dHIoXCJkYXRhLWF0dHJpYnV0ZVwiKVxuICAgIHZhbHVlICAgICA9ICR0YXJnZXQudmFsKClcblxuICAgIHVwZGF0ZWRBdHRyaWJ1dGVzICAgICAgICAgICAgPSB7fVxuICAgIHVwZGF0ZWRBdHRyaWJ1dGVzW2F0dHJpYnV0ZV0gPSB2YWx1ZVxuXG4gICAgVGFuZ2VyaW5lLnNldHRpbmdzLnNhdmUgdXBkYXRlZEF0dHJpYnV0ZXMsXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBAYWxyZWFkeVNhdmluZyA9IGZhbHNlXG4gICAgICAgIFV0aWxzLnRvcEFsZXJ0KFwiU2F2ZWRcIilcbiAgICAgICAgJHRhcmdldC5hZnRlcihAb2xkVGFyZ2V0Lmh0bWwodmFsdWUpKS5yZW1vdmUoKVxuICAgICAgZXJyb3I6ID0+XG4gICAgICAgIEBhbHJlYWR5U2F2aW5nID0gZmFsc2VcbiAgICAgICAgVXRpbHMudG9wQWxlcnQoXCJTYXZlIGVycm9yXCIpXG4gICAgICAgICR0YXJnZXQuYWZ0ZXIoQG9sZFRhcmdldCkucmVtb3ZlKClcblxuICByZXN1bHRzOiAtPiBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiZGFzaGJvYXJkXCIsIHRydWVcblxuICB1bml2ZXJzYWxVcGxvYWQ6IC0+IFV0aWxzLnVuaXZlcnNhbFVwbG9hZCgpXG5cbiAgYXBrOiAtPlxuICAgIFRhbmdlcmluZVRyZWUubWFrZVxuICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKVxuICAgICAgICBhLmhyZWYgPSBUYW5nZXJpbmUuc2V0dGluZ3MuY29uZmlnLmdldChcInRyZWVcIilcbiAgICAgICAgZ3JvdXBOYW1lID0gVGFuZ2VyaW5lLnNldHRpbmdzLmdldCgnZ3JvdXBOYW1lJylcbiAgICAgICAgbGFuZ3VhZ2VDb2RlcyA9IHtcbiAgICAgICAgICBhZl9zb21hbGk6ICdTTycsXG4gICAgICAgICAgYW1oYXJpYzogJ0FNJyxcbiAgICAgICAgICBhZmFhbl9vcm9tbzogJ09SJyxcbiAgICAgICAgICBoYWRpeXlzYTogJ0hZJyxcbiAgICAgICAgICBzaWRhYW11X2FmZm86ICdTRCcsXG4gICAgICAgICAgdGlncmlueWE6ICdURycsXG4gICAgICAgICAgd29sYXl0dGF0dG86ICdXVCdcbiAgICAgICAgfVxuICAgICAgICBsYW5ndWFnZSA9IGxhbmd1YWdlQ29kZXNbZ3JvdXBOYW1lXTtcbiAgICAgICAgaWYgdHlwZW9mIGxhbmd1YWdlID09ICd1bmRlZmluZWQnXG4gICAgICAgICAgbGFuZ3VhZ2UgPSBncm91cE5hbWVcbiAgICAgICAgVXRpbHMuc3RpY2t5KFwiPGgxPkFQSyBsaW5rPC9oMT48cD48YSBocmVmPSdodHRwOi8vI3thLmhvc3R9L3RyZWUvI3tkYXRhLnRva2VufS8je2xhbmd1YWdlfSc+I3thLmhvc3R9L3RyZWUvI3tkYXRhLnRva2VufS8je2xhbmd1YWdlfTwvYT48L3A+XCIpXG4gICAgICBlcnJvcjogKHhociwgcmVzcG9uc2UpIC0+XG4gICAgICAgIFV0aWxzLnN0aWNreSByZXNwb25zZS5tZXNzYWdlXG5cbiAgZ290b0dyb3VwczogLT4gVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImdyb3Vwc1wiLCB0cnVlXG5cbiAgaW1wb3J0OiAgICAgLT4gVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImltcG9ydFwiLCB0cnVlXG5cbiAgaTE4bjogLT5cbiAgICBAdGV4dCA9XG4gICAgICBcIm5ld1wiICAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5uZXdcIilcbiAgICAgIGltcG9ydCAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5pbXBvcnRcIilcbiAgICAgIGFwayAgICAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5hcGtcIilcbiAgICAgIGdyb3VwcyAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5ncm91cHNcIilcbiAgICAgIHVuaXZlcnNhbF91cGxvYWQgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi51bml2ZXJzYWxfdXBsb2FkXCIpXG4gICAgICBzeW5jX3RhYmxldHMgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24uc3luY190YWJsZXRzXCIpXG4gICAgICByZXN1bHRzICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24ucmVzdWx0c1wiKVxuICAgICAgc2F2ZSAgICAgICAgICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLnNhdmVcIilcbiAgICAgIGNhbmNlbCAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5jYW5jZWxcIilcbiAgICAgIGFzc2Vzc21lbnQgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5sYWJlbC5hc3Nlc3NtZW50XCIpXG4gICAgICBhc3Nlc3NtZW50cyA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcubGFiZWwuYXNzZXNzbWVudHNcIilcbiAgICAgIGxlc3Nvbl9wbGFucyA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcubGFiZWwubGVzc29uX3BsYW5zXCIpXG4gICAgICBjdXJyaWN1bHVtICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcubGFiZWwuY3VycmljdWx1bVwiKVxuICAgICAgbGVzc29uX3BsYW4gIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5sYWJlbC5sZXNzb25fcGxhblwiKVxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQGkxOG4oKVxuXG4gICAgQFtrZXldID0gdmFsdWUgZm9yIGtleSwgdmFsdWUgb2Ygb3B0aW9uc1xuXG4gICAgQGFzc2Vzc21lbnRzLmVhY2ggKGFzc2Vzc21lbnQpID0+IGFzc2Vzc21lbnQub24gXCJuZXdcIiwgQGFkZEFzc2Vzc21lbnRcbiAgICBAY3VycmljdWxhLmVhY2ggICAoY3VycmljdWx1bSkgPT4gY3VycmljdWx1bS5vbiBcIm5ld1wiLCBAYWRkQ3VycmljdWx1bVxuICAgIFRhbmdlcmluZS5hdmFpbGFibGUgPSBbXTtcbiAgICBUYW5nZXJpbmUuZmlyc3RMZXNzb25JZCA9IG51bGw7XG4gICAgQGxlc3NvblBsYW5zLmVhY2ggICAobGVzc29uUGxhbikgPT5cbiAgICAgIGxlc3NvblBsYW4ub24gXCJuZXdcIiwgQGFkZExlc3NvblBsYW5cbiMgICAgICBzdWJqZWN0ID0gVGFuZ2VyaW5lLmVudW0uc3ViamVjdHNbbGVzc29uUGxhbi5nZXQoXCJsZXNzb25QbGFuX3N1YmplY3RcIildXG4jICAgICAgZ3JhZGUgICA9IGxlc3NvblBsYW4uZ2V0KFwibGVzc29uUGxhbl9ncmFkZVwiKVxuICAgICAgd2VlayAgICA9IGxlc3NvblBsYW4uZ2V0KFwibGVzc29uUGxhbl93ZWVrXCIpXG4gICAgICBkYXkgICAgID0gbGVzc29uUGxhbi5nZXQoXCJsZXNzb25QbGFuX2RheVwiKVxuICAgICAgaWQgICAgICA9IGxlc3NvblBsYW4uZ2V0KFwiX2lkXCIpXG4jICAgICAgY29uc29sZS5sb2coXCJMZXNzb25zIGF2YWlsYWJsZTogXCIgKyBbd2VlaywgZGF5LCBpZF0pXG4gICAgICBpZiB3ZWVrID09ICcxJyAmJiBkYXkgPT0gJzEnXG4gICAgICAgIFRhbmdlcmluZS5maXJzdExlc3NvbklkID0gaWRcbiMgICAgICAgIGNvbnNvbGUubG9nKFwiZmlyc3RMZXNzb246IFwiICsgW3dlZWssIGRheSwgaWRdKVxuICAgICAgVGFuZ2VyaW5lLmF2YWlsYWJsZS5wdXNoIFt3ZWVrLCBkYXksIGlkXVxuIyAgICBjb25zb2xlLmxvZyhcIm5hdmlnYXRpbmcgdG8gXCIgKyBUYW5nZXJpbmUuZmlyc3RMZXNzb25JZClcbiMgICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcInJ1bi9cIiArIFRhbmdlcmluZS5maXJzdExlc3NvbklkLCBmYWxzZVxuIyAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKClcblxuICAgIEBjdXJyaWN1bGFMaXN0VmlldyA9IG5ldyBDdXJyaWN1bGFMaXN0Vmlld1xuICAgICAgXCJjdXJyaWN1bGFcIiA6IEBjdXJyaWN1bGFcblxuICAgIEBsZXNzb25QbGFuc0xpc3RWaWV3ID0gbmV3IExlc3NvblBsYW5zTGlzdFZpZXdcbiAgICAgIFwibGVzc29uUGxhbnNcIiA6IEBsZXNzb25QbGFuc1xuICAgICAgXCJwYXJlbnRcIiAgICAgIDogQFxuXG4gICAgQGFzc2Vzc21lbnRzVmlldyA9IG5ldyBBc3Nlc3NtZW50c1ZpZXdcbiAgICAgIFwiYXNzZXNzbWVudHNcIiA6IEBhc3Nlc3NtZW50c1xuICAgICAgXCJwYXJlbnRcIiAgICAgIDogQFxuXG4gICAgQHVzZXJzTWVudVZpZXcgPSBuZXcgVXNlcnNNZW51Vmlld1xuXG4gIHJlbmRlcjogPT5cblxuIyAgICBUYW5nZXJpbmUuTGVzc29uTWVudVZpZXcgICA9IG5ldyBMZXNzb25NZW51VmlldyBhdmFpbGFibGU6IFRhbmdlcmluZS5hdmFpbGFibGVcbiMgICAgZGFzaGJvYXJkTGF5b3V0LmhlYWRlclJlZ2lvbi5yZXNldCgpO1xuIyAgICBkYXNoYm9hcmRMYXlvdXQuaGVhZGVyUmVnaW9uLnNob3coVGFuZ2VyaW5lLkxlc3Nvbk1lbnVWaWV3KVxuIyAgICBUYW5nZXJpbmUuTGVzc29uTWVudVZpZXcuc2V0RWxlbWVudCgkKFwiI21lbnVcIikpLnJlbmRlcigpXG5cblxuICAgIGlzQWRtaW4gPSBUYW5nZXJpbmUudXNlci5pc0FkbWluKClcblxuICAgIG5ld0J1dHRvbiAgICAgPSBcIjxidXR0b24gY2xhc3M9J25ldyBjb21tYW5kJz4je0B0ZXh0Lm5ld308L2J1dHRvbj5cIlxuICAgIGltcG9ydEJ1dHRvbiAgPSBcIjxidXR0b24gY2xhc3M9J2ltcG9ydCBjb21tYW5kJz4je0B0ZXh0LmltcG9ydH08L2J1dHRvbj5cIlxuICAgIGFwa0J1dHRvbiAgICAgPSBcIjxidXR0b24gY2xhc3M9J2FwayBuYXZpZ2F0aW9uJz4je0B0ZXh0LmFwa308L2J1dHRvbj5cIlxuICAgIGdyb3Vwc0J1dHRvbiAgPSBcIjxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gZ3JvdXBzJz4je0B0ZXh0Lmdyb3Vwc308L2J1dHRvbj5cIlxuICAgIHVwbG9hZEJ1dHRvbiAgPSBcIjxidXR0b24gY2xhc3M9J2NvbW1hbmQgdW5pdmVyc2FsX3VwbG9hZCc+I3tAdGV4dC51bml2ZXJzYWxfdXBsb2FkfTwvYnV0dG9uPlwiXG4gICAgc3luY1RhYmxldHNCdXR0b24gPSBcIjxidXR0b24gY2xhc3M9J2NvbW1hbmQgc3luY190YWJsZXRzJz4je0B0ZXh0LnN5bmNfdGFibGV0c308L2J1dHRvbj5cIlxuICAgIHJlc3VsdHNCdXR0b24gPSBcIjxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gcmVzdWx0cyc+I3tAdGV4dC5yZXN1bHRzfTwvYnV0dG9uPlwiXG4gICAgZ3JvdXBIYW5kbGUgICA9IFwiPGgyIGNsYXNzPSdzZXR0aW5ncyBncmV5JyBkYXRhLWF0dHJpYnR1ZT0nZ3JvdXBIYW5kbGUnPiN7VGFuZ2VyaW5lLnNldHRpbmdzLmdldEVzY2FwZWRTdHJpbmcoJ2dyb3VwSGFuZGxlJykgfHwgVGFuZ2VyaW5lLnNldHRpbmdzLmdldCgnZ3JvdXBOYW1lJyl9PC9oMj5cIlxuXG5cbiAgICBjb250YWluZXJzID0gW11cbiAgICBjb250YWluZXJzLnB1c2ggXCI8c2VjdGlvbiBpZD0nY3VycmljdWxhX2NvbnRhaW5lcicgY2xhc3M9J0N1cnJpY3VsYUxpc3RWaWV3Jz48L3NlY3Rpb24+XCIgaWYgQGN1cnJpY3VsYS5sZW5ndGggaXNudCAwXG4gICAgY29udGFpbmVycy5wdXNoIFwiPHNlY3Rpb24gaWQ9J2tsYXNzX2NvbnRhaW5lcicgY2xhc3M9J0tsYXNzZXNWaWV3Jz48L3NlY3Rpb24+XCIgICAgICAgICBpZiBAa2xhc3Nlcy5sZW5ndGggaXNudCAwXG4gICAgY29udGFpbmVycy5wdXNoIFwiPHNlY3Rpb24gaWQ9J3RlYWNoZXJzX2NvbnRhaW5lcicgY2xhc3M9J1RlYWNoZXJzVmlldyc+PC9zZWN0aW9uPlwiICAgICBpZiBAdGVhY2hlcnMubGVuZ3RoIGlzbnQgMFxuICAgIGNvbnRhaW5lcnMucHVzaCBcIjxzZWN0aW9uIGlkPSd1c2Vyc19tZW51X2NvbnRhaW5lcicgY2xhc3M9J1VzZXJzTWVudVZpZXcnPjwvc2VjdGlvbj5cIlxuXG5cblxuICAgIGh0bWwgPSBcIlxuICAgICAgI3tncm91cHNCdXR0b259XG4gICAgICAje2Fwa0J1dHRvbn1cbiAgICAgICN7cmVzdWx0c0J1dHRvbn1cbiAgICAgICN7Z3JvdXBIYW5kbGV9XG4gICAgICA8c2VjdGlvbj5cbiAgICAgICAgPGgxPiN7QHRleHQubGVzc29uX3BsYW5zfTwvaDE+XG4gICAgXCJcblxuICAgIGlmIGlzQWRtaW5cbiAgICAgIGh0bWwgKz0gXCJcbiAgICAgICAgICAje25ld0J1dHRvbn1cbiAgICAgICAgICAje2ltcG9ydEJ1dHRvbn1cblxuICAgICAgICAgIDxkaXYgY2xhc3M9J25ld19mb3JtIGNvbmZpcm1hdGlvbic+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSd0ZXh0JyBjbGFzcz0nbmV3X25hbWUnIHBsYWNlaG9sZGVyPSdOYW1lJz5cbiAgICAgICAgICAgICAgPHNlbGVjdCBpZD0nbmV3X3R5cGUnPlxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9J2xlc3Nvbl9wbGFuJz4je0B0ZXh0Lmxlc3Nvbl9wbGFufTwvb3B0aW9uPlxuICAgICAgICAgICAgICA8L3NlbGVjdD48YnI+XG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25ld19zYXZlIGNvbW1hbmQnPiN7QHRleHQuc2F2ZX08L2J1dHRvbj4gPGJ1dHRvbiBjbGFzcz0nbmV3X2NhbmNlbCBjb21tYW5kJz4je0B0ZXh0LmNhbmNlbH08L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgaWQ9J2Fzc2Vzc21lbnRzX2NvbnRhaW5lcic+PC9kaXY+XG4gICAgICAgICAgPGRpdiBpZD0nbGVzc29uUGxhbnNfY29udGFpbmVyJz48L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgICN7Y29udGFpbmVycy5qb2luKCcnKX1cblxuICAgICAgXCJcbiAgICBlbHNlXG4gICAgICBodG1sICs9IFwiXG4gICAgICAgIDxkaXYgaWQ9J2Fzc2Vzc21lbnRzX2NvbnRhaW5lcic+PC9kaXY+XG4gICAgICAgIDxkaXYgaWQ9J2xlc3NvblBsYW5zX2NvbnRhaW5lcic+PC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgICBcIlxuXG4gICAgQCRlbC5odG1sIGh0bWxcblxuICAgIEBhc3Nlc3NtZW50c1ZpZXcuc2V0RWxlbWVudCggQCRlbC5maW5kKFwiI2Fzc2Vzc21lbnRzX2NvbnRhaW5lclwiKSApXG4gICAgQGFzc2Vzc21lbnRzVmlldy5yZW5kZXIoKVxuXG4gICAgQGN1cnJpY3VsYUxpc3RWaWV3LnNldEVsZW1lbnQoIEAkZWwuZmluZChcIiNjdXJyaWN1bGFfY29udGFpbmVyXCIpIClcbiAgICBAY3VycmljdWxhTGlzdFZpZXcucmVuZGVyKClcblxuICAgIEBsZXNzb25QbGFuc0xpc3RWaWV3LnNldEVsZW1lbnQoIEAkZWwuZmluZChcIiNsZXNzb25QbGFuc19jb250YWluZXJcIikgKVxuICAgIEBsZXNzb25QbGFuc0xpc3RWaWV3LnJlbmRlcigpXG5cbiAgICBAdXNlcnNNZW51Vmlldy5zZXRFbGVtZW50KCBAJGVsLmZpbmQoXCIjdXNlcnNfbWVudV9jb250YWluZXJcIikgKVxuICAgIEB1c2Vyc01lbnVWaWV3LnJlbmRlcigpXG5cbiAgICBpZiBAa2xhc3Nlcy5sZW5ndGggPiAwXG4gICAgICBAa2xhc3Nlc1ZpZXcgPSBuZXcgS2xhc3Nlc1ZpZXdcbiAgICAgICAga2xhc3NlcyA6IEBrbGFzc2VzXG4gICAgICAgIGN1cnJpY3VsYSA6IEBjdXJyaWN1bGFcbiAgICAgICAgdGVhY2hlcnMgOiBAdGVhY2hlcnNcbiAgICAgIEBrbGFzc2VzVmlldy5zZXRFbGVtZW50IEAkZWwuZmluZChcIiNrbGFzc19jb250YWluZXJcIilcbiAgICAgIEBrbGFzc2VzVmlldy5yZW5kZXIoKVxuICAgIGVsc2VcbiAgICAgIEAkZWwuZmluZChcIiNrbGFzc19jb250YWluZXJcIikucmVtb3ZlKClcblxuXG4gICAgaWYgQHRlYWNoZXJzLmxlbmd0aCA+IDBcbiAgICAgIEB0ZWFjaGVyc1ZpZXcgPSBuZXcgVGVhY2hlcnNWaWV3XG4gICAgICAgIHRlYWNoZXJzIDogQHRlYWNoZXJzXG4gICAgICAgIHVzZXJzIDogQHVzZXJzXG4gICAgICBAdGVhY2hlcnNWaWV3LnNldEVsZW1lbnQgQCRlbC5maW5kKFwiI3RlYWNoZXJzX2NvbnRhaW5lclwiKVxuICAgICAgQHRlYWNoZXJzVmlldy5yZW5kZXIoKVxuICAgIGVsc2VcbiAgICAgIEAkZWwuZmluZChcIiN0ZWFjaGVyc19jb250YWluZXJcIikucmVtb3ZlKClcblxuXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICAgIHJldHVyblxuXG5cbiAgYWRkQXNzZXNzbWVudDogKG5ld09uZSkgPT5cbiAgICBAYXNzZXNzbWVudHMuYWRkIG5ld09uZVxuICAgIG5ld09uZS5vbiBcIm5ld1wiLCBAYWRkQXNzZXNzbWVudFxuXG4gIGFkZEN1cnJpY3VsdW06IChuZXdPbmUpID0+XG4gICAgQGN1cnJpY3VsYS5hZGQgbmV3T25lXG4gICAgbmV3T25lLm9uIFwibmV3XCIsIEBhZGRDdXJyaWN1bHVtXG5cbiAgYWRkTGVzc29uUGxhbjogKG5ld09uZSkgPT5cbiAgICBAbGVzc29uUGxhbnMuYWRkIG5ld09uZVxuICAgIG5ld09uZS5vbiBcIm5ld1wiLCBAYWRkTGVzc29uUGxhblxuXG4gICMgTWFraW5nIGEgbmV3IGFzc2Vzc21lbnRcbiAgbmV3VG9nZ2xlOiAtPiBAJGVsLmZpbmQoJy5uZXdfZm9ybSwgLm5ldycpLnRvZ2dsZSgpOyBmYWxzZVxuXG4gIG5ld1NhdmU6IChldmVudCkgPT5cblxuICAgICMgdGhpcyBoYW5kbGVzIGFtYmlndW91cyBldmVudHNcbiAgICAjIHRoZSBpZGVhIGlzIHRvIHN1cHBvcnQgY2xpY2tzIGFuZCB0aGUgZW50ZXIga2V5XG4gICAgIyBsb2dpYzpcbiAgICAjIGl0IGl0J3MgYSBrZXlzdHJva2UgYW5kIGl0J3Mgbm90IGVudGVyLCBhY3Qgbm9ybWFsbHksIGp1c3QgYSBrZXkgc3Ryb2tlXG4gICAgIyBpZiBpdCdzIGEgY2xpY2sgb3IgZW50ZXIsIHByb2Nlc3MgdGhlIGZvcm1cblxuICAgIGlmIGV2ZW50LnR5cGUgIT0gXCJjbGlja1wiICYmIGV2ZW50LndoaWNoICE9IDEzXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgbmFtZSAgICA9IEAkZWwuZmluZCgnLm5ld19uYW1lJykudmFsKClcbiAgICBuZXdUeXBlID0gQCRlbC5maW5kKFwiI25ld190eXBlIG9wdGlvbjpzZWxlY3RlZFwiKS52YWwoKVxuICAgIG5ld0lkICAgPSBVdGlscy5ndWlkKClcblxuICAgIGlmIG5hbWUubGVuZ3RoID09IDBcbiAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiPHNwYW4gY2xhc3M9J2Vycm9yJz5Db3VsZCBub3Qgc2F2ZSA8aW1nIHNyYz0naW1hZ2VzL2ljb25fY2xvc2UucG5nJyBjbGFzcz0nY2xlYXJfbWVzc2FnZSc+PC9zcGFuPlwiXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIGlmIG5ld1R5cGUgPT0gXCJhc3Nlc3NtZW50XCJcbiAgICAgIG5ld09iamVjdCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgIFwibmFtZVwiICAgICAgICAgOiBuYW1lXG4gICAgICAgIFwiX2lkXCIgICAgICAgICAgOiBuZXdJZFxuICAgICAgICBcImFzc2Vzc21lbnRJZFwiIDogbmV3SWRcbiAgICAgICAgXCJhcmNoaXZlZFwiICAgICA6IGZhbHNlXG4gICAgICBjYWxsYmFjayA9IEBhZGRBc3Nlc3NtZW50XG4gICAgZWxzZSBpZiBuZXdUeXBlID09IFwiY3VycmljdWx1bVwiXG4gICAgICBuZXdPYmplY3QgPSBuZXcgQ3VycmljdWx1bVxuICAgICAgICBcIm5hbWVcIiAgICAgICAgIDogbmFtZVxuICAgICAgICBcIl9pZFwiICAgICAgICAgIDogbmV3SWRcbiAgICAgICAgXCJjdXJyaWN1bHVtSWRcIiA6IG5ld0lkXG4gICAgICBjYWxsYmFjayA9IEBhZGRDdXJyaWN1bHVtXG4gICAgZWxzZSBpZiBuZXdUeXBlID09IFwibGVzc29uX3BsYW5cIlxuICAgICAgbmV3T2JqZWN0ID0gbmV3IExlc3NvblBsYW5cbiAgICAgICAgXCJuYW1lXCIgICAgICAgICA6IG5hbWVcbiAgICAgICAgXCJsZXNzb25QbGFuX3RpdGxlXCIgICAgICAgICA6IG5hbWVcbiAgICAgICAgXCJfaWRcIiAgICAgICAgICA6IG5ld0lkXG4gICAgICAgIFwibGVzc29uUGxhbklkXCIgOiBuZXdJZFxuICAgICAgY2FsbGJhY2sgPSBAYWRkTGVzc29uUGxhblxuXG4gICAgbmV3T2JqZWN0LnNhdmUgbnVsbCxcbiAgICAgIHN1Y2Nlc3MgOiA9PlxuICAgICAgICBjYWxsYmFjayhuZXdPYmplY3QpXG4gICAgICAgIEAkZWwuZmluZCgnLm5ld19mb3JtLCAubmV3JykudG9nZ2xlKClcbiAgICAgICAgQCRlbC5maW5kKCcubmV3X25hbWUnKS52YWwgXCJcIlxuICAgICAgICBVdGlscy5taWRBbGVydCBcIiN7bmFtZX0gc2F2ZWRcIlxuICAgICAgZXJyb3I6ID0+XG4gICAgICAgIEAkZWwuZmluZCgnLm5ld19mb3JtLCAubmV3JykudG9nZ2xlKClcbiAgICAgICAgQCRlbC5maW5kKCcubmV3X25hbWUnKS52YWwgXCJcIlxuICAgICAgICBVdGlscy5taWRBbGVydCBcIlBsZWFzZSB0cnkgYWdhaW4uIEVycm9yIHNhdmluZy5cIlxuXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgIyBWaWV3TWFuYWdlclxuICBjbG9zZVZpZXdzOiAtPlxuICAgIEBhc3Nlc3NtZW50c1ZpZXcuY2xvc2UoKVxuICAgIEBjdXJyaWN1bGFMaXN0Vmlldy5jbG9zZSgpXG5cbiAgb25DbG9zZTogLT5cbiAgICBAY2xvc2VWaWV3cygpXG4iXX0=
