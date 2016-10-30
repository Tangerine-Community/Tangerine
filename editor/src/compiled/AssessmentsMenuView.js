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
    Tangerine.LessonMenuView = new LessonMenuView({
      available: Tangerine.available
    });
    Tangerine.LessonMenuView.setElement($("#menu")).render();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2Vzc21lbnQvQXNzZXNzbWVudHNNZW51Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxtQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7Ozs7Z0NBRUosU0FBQSxHQUFXOztnQ0FFWCxNQUFBLEdBQ0U7SUFBQSxvQkFBQSxFQUF1QixTQUF2QjtJQUNBLGlCQUFBLEVBQXVCLFNBRHZCO0lBRUEsbUJBQUEsRUFBdUIsV0FGdkI7SUFHQSxZQUFBLEVBQXVCLFdBSHZCO0lBSUEsZUFBQSxFQUF1QixRQUp2QjtJQUtBLFlBQUEsRUFBdUIsS0FMdkI7SUFNQSxlQUFBLEVBQXVCLFlBTnZCO0lBT0EseUJBQUEsRUFBNEIsaUJBUDVCO0lBU0EscUJBQUEsRUFBd0IsYUFUeEI7SUFXQSxnQkFBQSxFQUEwQixTQVgxQjtJQVlBLGlCQUFBLEVBQTBCLGFBWjFCO0lBYUEsc0JBQUEsRUFBMEIsYUFiMUI7SUFjQSx1QkFBQSxFQUEyQixhQWQzQjs7O2dDQWdCRixXQUFBLEdBQWEsU0FBQTtXQUNYLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFBO0VBRFc7O2dDQUdiLFdBQUEsR0FBYSxTQUFDLEtBQUQ7QUFDWCxRQUFBO0lBQUEsSUFBQSxDQUFjLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBZixDQUFBLENBQWQ7QUFBQSxhQUFBOztJQUNBLE9BQUEsR0FBYSxDQUFBLENBQUUsS0FBSyxDQUFDLE1BQVI7SUFDYixTQUFBLEdBQWEsT0FBTyxDQUFDLElBQVIsQ0FBYSxnQkFBYjtJQUNiLElBQUMsQ0FBQSxTQUFELEdBQWEsT0FBTyxDQUFDLEtBQVIsQ0FBQTtJQUNiLE9BQUEsR0FBVSxPQUFPLENBQUMsSUFBUixDQUFhLE9BQWIsQ0FBcUIsQ0FBQyxPQUF0QixDQUE4QixVQUE5QixFQUF5QyxFQUF6QztJQUNWLE9BQUEsR0FBVSxPQUFPLENBQUMsR0FBUixDQUFZLFFBQVo7SUFDVixPQUFPLENBQUMsS0FBUixDQUFjLG1DQUFBLEdB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LEtBQW5CLENBQUE7RUFGVTs7Z0NBSVosT0FBQSxHQUFTLFNBQUE7V0FDUCxJQUFDLENBQUEsVUFBRCxDQUFBO0VBRE87Ozs7R0F6VXVCLFFBQVEsQ0FBQyIsImZpbGUiOiJhc3Nlc3NtZW50L0Fzc2Vzc21lbnRzTWVudVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBBc3Nlc3NtZW50c01lbnVWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJBc3Nlc3NtZW50c01lbnVWaWV3XCJcblxuICBldmVudHM6XG4gICAgJ2tleXByZXNzIC5uZXdfbmFtZScgOiAnbmV3U2F2ZSdcbiAgICAnY2xpY2sgLm5ld19zYXZlJyAgICA6ICduZXdTYXZlJ1xuICAgICdjbGljayAubmV3X2NhbmNlbCcgIDogJ25ld1RvZ2dsZSdcbiAgICAnY2xpY2sgLm5ldycgICAgICAgICA6ICduZXdUb2dnbGUnXG4gICAgJ2NsaWNrIC5pbXBvcnQnICAgICAgOiAnaW1wb3J0J1xuICAgICdjbGljayAuYXBrJyAgICAgICAgIDogJ2FwaydcbiAgICAnY2xpY2sgLmdyb3VwcycgICAgICA6ICdnb3RvR3JvdXBzJ1xuICAgICdjbGljayAudW5pdmVyc2FsX3VwbG9hZCcgOiAndW5pdmVyc2FsVXBsb2FkJ1xuXG4gICAgJ2NsaWNrIC5zeW5jX3RhYmxldHMnIDogJ3N5bmNUYWJsZXRzJ1xuXG4gICAgJ2NsaWNrIC5yZXN1bHRzJyAgICAgICAgOiAncmVzdWx0cydcbiAgICAnY2xpY2sgLnNldHRpbmdzJyAgICAgICA6ICdlZGl0SW5QbGFjZSdcbiAgICAna2V5dXAgLmVkaXRfaW5fcGxhY2UnICA6ICdzYXZlSW5QbGFjZSdcbiAgICAnY2hhbmdlIC5lZGl0X2luX3BsYWNlJyAgOiAnc2F2ZUluUGxhY2UnXG5cbiAgc3luY1RhYmxldHM6ID0+XG4gICAgQHRhYmxldE1hbmFnZXIuc3luYygpXG5cbiAgZWRpdEluUGxhY2U6IChldmVudCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKVxuICAgICR0YXJnZXQgICAgPSAkKGV2ZW50LnRhcmdldClcbiAgICBhdHRyaWJ1dGUgID0gJHRhcmdldC5hdHRyKFwiZGF0YS1hdHRyaWJ0dWVcIilcbiAgICBAb2xkVGFyZ2V0ID0gJHRhcmdldC5jbG9uZSgpXG4gICAgY2xhc3NlcyA9ICR0YXJnZXQuYXR0cihcImNsYXNzXCIpLnJlcGxhY2UoXCJzZXR0aW5nc1wiLFwiXCIpXG4gICAgbWFyZ2lucyA9ICR0YXJnZXQuY3NzKFwibWFyZ2luXCIpXG4gICAgJHRhcmdldC5hZnRlcihcIjxpbnB1dCB0eXBlPSd0ZXh0JyBzdHlsZT0nbWFyZ2luOiN7bWFyZ2luc307JyBkYXRhLWF0dHJpYnV0ZT0nI3thdHRyaWJ1dGV9JyBjbGFzcz0nZWRpdF9pbl9wbGFjZSAje2NsYXNzZXN9JyB2YWx1ZT0nI3tfLmVzY2FwZSgkdGFyZ2V0Lmh0bWwoKSl9Jz5cIilcbiAgICBpbnB1dCA9ICR0YXJnZXQubmV4dCgpLmZvY3VzKClcbiAgICAkdGFyZ2V0LnJlbW92ZSgpXG5cbiAgc2F2ZUluUGxhY2U6IChldmVudCkgLT5cblxuICAgIHJldHVybiBpZiBAYWxyZWFkeVNhdmluZ1xuXG4gICAgaWYgZXZlbnQua2V5Q29kZVxuICAgICAgaWYgZXZlbnQua2V5Q29kZSA9PSAyN1xuICAgICAgICAkKGV2ZW50LnRhcmdldCkuYWZ0ZXIoQG9sZFRhcmdldCkucmVtb3ZlKClcbiAgICAgICAgcmV0dXJuXG4gICAgICBlbHNlIGlmIGV2ZW50LmtleUNvZGUgIT0gMTNcbiAgICAgICAgcmV0dXJuIHRydWVcblxuICAgIEBhbHJlYWR5U2F2aW5nID0gdHJ1ZVxuICAgICR0YXJnZXQgICA9ICQoZXZlbnQudGFyZ2V0KVxuICAgIGF0dHJpYnV0ZSA9ICR0YXJnZXQuYXR0cihcImRhdGEtYXR0cmlidXRlXCIpXG4gICAgdmFsdWUgICAgID0gJHRhcmdldC52YWwoKVxuXG4gICAgdXBkYXRlZEF0dHJpYnV0ZXMgICAgICAgICAgICA9IHt9XG4gICAgdXBkYXRlZEF0dHJpYnV0ZXNbYXR0cmlidXRlXSA9IHZhbHVlXG5cbiAgICBUYW5nZXJpbmUuc2V0dGluZ3Muc2F2ZSB1cGRhdGVkQXR0cmlidXRlcyxcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgIEBhbHJlYWR5U2F2aW5nID0gZmFsc2VcbiAgICAgICAgVXRpbHMudG9wQWxlcnQoXCJTYXZlZFwiKVxuICAgICAgICAkdGFyZ2V0LmFmdGVyKEBvbGRUYXJnZXQuaHRtbCh2YWx1ZSkpLnJlbW92ZSgpXG4gICAgICBlcnJvcjogPT5cbiAgICAgICAgQGFscmVhZHlTYXZpbmcgPSBmYWxzZVxuICAgICAgICBVdGlscy50b3BBbGVydChcIlNhdmUgZXJyb3JcIilcbiAgICAgICAgJHRhcmdldC5hZnRlcihAb2xkVGFyZ2V0KS5yZW1vdmUoKVxuXG4gIHJlc3VsdHM6IC0+IFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJkYXNoYm9hcmRcIiwgdHJ1ZVxuXG4gIHVuaXZlcnNhbFVwbG9hZDogLT4gVXRpbHMudW5pdmVyc2FsVXBsb2FkKClcblxuICBhcGs6IC0+XG4gICAgVGFuZ2VyaW5lVHJlZS5tYWtlXG4gICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpXG4gICAgICAgIGEuaHJlZiA9IFRhbmdlcmluZS5zZXR0aW5ncy5jb25maWcuZ2V0KFwidHJlZVwiKVxuICAgICAgICBncm91cE5hbWUgPSBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KCdncm91cE5hbWUnKVxuICAgICAgICBsYW5ndWFnZUNvZGVzID0ge1xuICAgICAgICAgIGFmX3NvbWFsaTogJ1NPJyxcbiAgICAgICAgICBhbWhhcmljOiAnQU0nLFxuICAgICAgICAgIGFmYWFuX29yb21vOiAnT1InLFxuICAgICAgICAgIGhhZGl5eXNhOiAnSFknLFxuICAgICAgICAgIHNpZGFhbXVfYWZmbzogJ1NEJyxcbiAgICAgICAgICB0aWdyaW55YTogJ1RHJyxcbiAgICAgICAgICB3b2xheXR0YXR0bzogJ1dUJ1xuICAgICAgICB9XG4gICAgICAgIGxhbmd1YWdlID0gbGFuZ3VhZ2VDb2Rlc1tncm91cE5hbWVdO1xuICAgICAgICBpZiB0eXBlb2YgbGFuZ3VhZ2UgPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgICBsYW5ndWFnZSA9IGdyb3VwTmFtZVxuICAgICAgICBVdGlscy5zdGlja3koXCI8aDE+QVBLIGxpbms8L2gxPjxwPjxhIGhyZWY9J2h0dHA6Ly8je2EuaG9zdH0vdHJlZS8je2RhdGEudG9rZW59LyN7bGFuZ3VhZ2V9Jz4je2EuaG9zdH0vdHJlZS8je2RhdGEudG9rZW59LyN7bGFuZ3VhZ2V9PC9hPjwvcD5cIilcbiAgICAgIGVycm9yOiAoeGhyLCByZXNwb25zZSkgLT5cbiAgICAgICAgVXRpbHMuc3RpY2t5IHJlc3BvbnNlLm1lc3NhZ2VcblxuICBnb3RvR3JvdXBzOiAtPiBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiZ3JvdXBzXCIsIHRydWVcblxuICBpbXBvcnQ6ICAgICAtPiBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiaW1wb3J0XCIsIHRydWVcblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID1cbiAgICAgIFwibmV3XCIgICAgICAgICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLm5ld1wiKVxuICAgICAgaW1wb3J0ICAgICAgICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLmltcG9ydFwiKVxuICAgICAgYXBrICAgICAgICAgICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLmFwa1wiKVxuICAgICAgZ3JvdXBzICAgICAgICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLmdyb3Vwc1wiKVxuICAgICAgdW5pdmVyc2FsX3VwbG9hZCA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLnVuaXZlcnNhbF91cGxvYWRcIilcbiAgICAgIHN5bmNfdGFibGV0cyAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5zeW5jX3RhYmxldHNcIilcbiAgICAgIHJlc3VsdHMgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5yZXN1bHRzXCIpXG4gICAgICBzYXZlICAgICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24uc2F2ZVwiKVxuICAgICAgY2FuY2VsICAgICAgICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLmNhbmNlbFwiKVxuICAgICAgYXNzZXNzbWVudCAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmxhYmVsLmFzc2Vzc21lbnRcIilcbiAgICAgIGFzc2Vzc21lbnRzIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5sYWJlbC5hc3Nlc3NtZW50c1wiKVxuICAgICAgbGVzc29uX3BsYW5zIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5sYWJlbC5sZXNzb25fcGxhbnNcIilcbiAgICAgIGN1cnJpY3VsdW0gIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5sYWJlbC5jdXJyaWN1bHVtXCIpXG4gICAgICBsZXNzb25fcGxhbiAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmxhYmVsLmxlc3Nvbl9wbGFuXCIpXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICBAaTE4bigpXG5cbiAgICBAW2tleV0gPSB2YWx1ZSBmb3Iga2V5LCB2YWx1ZSBvZiBvcHRpb25zXG5cbiAgICBAYXNzZXNzbWVudHMuZWFjaCAoYXNzZXNzbWVudCkgPT4gYXNzZXNzbWVudC5vbiBcIm5ld1wiLCBAYWRkQXNzZXNzbWVudFxuICAgIEBjdXJyaWN1bGEuZWFjaCAgIChjdXJyaWN1bHVtKSA9PiBjdXJyaWN1bHVtLm9uIFwibmV3XCIsIEBhZGRDdXJyaWN1bHVtXG4gICAgVGFuZ2VyaW5lLmF2YWlsYWJsZSA9IFtdO1xuICAgIFRhbmdlcmluZS5maXJzdExlc3NvbklkID0gbnVsbDtcbiAgICBAbGVzc29uUGxhbnMuZWFjaCAgIChsZXNzb25QbGFuKSA9PlxuICAgICAgbGVzc29uUGxhbi5vbiBcIm5ld1wiLCBAYWRkTGVzc29uUGxhblxuIyAgICAgIHN1YmplY3QgPSBUYW5nZXJpbmUuZW51bS5zdWJqZWN0c1tsZXNzb25QbGFuLmdldChcImxlc3NvblBsYW5fc3ViamVjdFwiKV1cbiMgICAgICBncmFkZSAgID0gbGVzc29uUGxhbi5nZXQoXCJsZXNzb25QbGFuX2dyYWRlXCIpXG4gICAgICB3ZWVrICAgID0gbGVzc29uUGxhbi5nZXQoXCJsZXNzb25QbGFuX3dlZWtcIilcbiAgICAgIGRheSAgICAgPSBsZXNzb25QbGFuLmdldChcImxlc3NvblBsYW5fZGF5XCIpXG4gICAgICBpZCAgICAgID0gbGVzc29uUGxhbi5nZXQoXCJfaWRcIilcbiMgICAgICBjb25zb2xlLmxvZyhcIkxlc3NvbnMgYXZhaWxhYmxlOiBcIiArIFt3ZWVrLCBkYXksIGlkXSlcbiAgICAgIGlmIHdlZWsgPT0gJzEnICYmIGRheSA9PSAnMSdcbiAgICAgICAgVGFuZ2VyaW5lLmZpcnN0TGVzc29uSWQgPSBpZFxuIyAgICAgICAgY29uc29sZS5sb2coXCJmaXJzdExlc3NvbjogXCIgKyBbd2VlaywgZGF5LCBpZF0pXG4gICAgICBUYW5nZXJpbmUuYXZhaWxhYmxlLnB1c2ggW3dlZWssIGRheSwgaWRdXG4jICAgIGNvbnNvbGUubG9nKFwibmF2aWdhdGluZyB0byBcIiArIFRhbmdlcmluZS5maXJzdExlc3NvbklkKVxuIyAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwicnVuL1wiICsgVGFuZ2VyaW5lLmZpcnN0TGVzc29uSWQsIGZhbHNlXG4jICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuXG4gICAgQGN1cnJpY3VsYUxpc3RWaWV3ID0gbmV3IEN1cnJpY3VsYUxpc3RWaWV3XG4gICAgICBcImN1cnJpY3VsYVwiIDogQGN1cnJpY3VsYVxuXG4gICAgQGxlc3NvblBsYW5zTGlzdFZpZXcgPSBuZXcgTGVzc29uUGxhbnNMaXN0Vmlld1xuICAgICAgXCJsZXNzb25QbGFuc1wiIDogQGxlc3NvblBsYW5zXG4gICAgICBcInBhcmVudFwiICAgICAgOiBAXG5cbiAgICBAYXNzZXNzbWVudHNWaWV3ID0gbmV3IEFzc2Vzc21lbnRzVmlld1xuICAgICAgXCJhc3Nlc3NtZW50c1wiIDogQGFzc2Vzc21lbnRzXG4gICAgICBcInBhcmVudFwiICAgICAgOiBAXG5cbiAgICBAdXNlcnNNZW51VmlldyA9IG5ldyBVc2Vyc01lbnVWaWV3XG5cbiAgcmVuZGVyOiA9PlxuXG4gICAgVGFuZ2VyaW5lLkxlc3Nvbk1lbnVWaWV3ICAgPSBuZXcgTGVzc29uTWVudVZpZXcgYXZhaWxhYmxlOiBUYW5nZXJpbmUuYXZhaWxhYmxlXG4jICAgIGRhc2hib2FyZExheW91dC5oZWFkZXJSZWdpb24ucmVzZXQoKTtcbiMgICAgZGFzaGJvYXJkTGF5b3V0LmhlYWRlclJlZ2lvbi5zaG93KFRhbmdlcmluZS5MZXNzb25NZW51VmlldylcbiAgICBUYW5nZXJpbmUuTGVzc29uTWVudVZpZXcuc2V0RWxlbWVudCgkKFwiI21lbnVcIikpLnJlbmRlcigpXG5cblxuICAgIGlzQWRtaW4gPSBUYW5nZXJpbmUudXNlci5pc0FkbWluKClcblxuICAgIG5ld0J1dHRvbiAgICAgPSBcIjxidXR0b24gY2xhc3M9J25ldyBjb21tYW5kJz4je0B0ZXh0Lm5ld308L2J1dHRvbj5cIlxuICAgIGltcG9ydEJ1dHRvbiAgPSBcIjxidXR0b24gY2xhc3M9J2ltcG9ydCBjb21tYW5kJz4je0B0ZXh0LmltcG9ydH08L2J1dHRvbj5cIlxuICAgIGFwa0J1dHRvbiAgICAgPSBcIjxidXR0b24gY2xhc3M9J2FwayBuYXZpZ2F0aW9uJz4je0B0ZXh0LmFwa308L2J1dHRvbj5cIlxuICAgIGdyb3Vwc0J1dHRvbiAgPSBcIjxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gZ3JvdXBzJz4je0B0ZXh0Lmdyb3Vwc308L2J1dHRvbj5cIlxuICAgIHVwbG9hZEJ1dHRvbiAgPSBcIjxidXR0b24gY2xhc3M9J2NvbW1hbmQgdW5pdmVyc2FsX3VwbG9hZCc+I3tAdGV4dC51bml2ZXJzYWxfdXBsb2FkfTwvYnV0dG9uPlwiXG4gICAgc3luY1RhYmxldHNCdXR0b24gPSBcIjxidXR0b24gY2xhc3M9J2NvbW1hbmQgc3luY190YWJsZXRzJz4je0B0ZXh0LnN5bmNfdGFibGV0c308L2J1dHRvbj5cIlxuICAgIHJlc3VsdHNCdXR0b24gPSBcIjxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gcmVzdWx0cyc+I3tAdGV4dC5yZXN1bHRzfTwvYnV0dG9uPlwiXG4gICAgZ3JvdXBIYW5kbGUgICA9IFwiPGgyIGNsYXNzPSdzZXR0aW5ncyBncmV5JyBkYXRhLWF0dHJpYnR1ZT0nZ3JvdXBIYW5kbGUnPiN7VGFuZ2VyaW5lLnNldHRpbmdzLmdldEVzY2FwZWRTdHJpbmcoJ2dyb3VwSGFuZGxlJykgfHwgVGFuZ2VyaW5lLnNldHRpbmdzLmdldCgnZ3JvdXBOYW1lJyl9PC9oMj5cIlxuXG5cbiAgICBjb250YWluZXJzID0gW11cbiAgICBjb250YWluZXJzLnB1c2ggXCI8c2VjdGlvbiBpZD0nY3VycmljdWxhX2NvbnRhaW5lcicgY2xhc3M9J0N1cnJpY3VsYUxpc3RWaWV3Jz48L3NlY3Rpb24+XCIgaWYgQGN1cnJpY3VsYS5sZW5ndGggaXNudCAwXG4gICAgY29udGFpbmVycy5wdXNoIFwiPHNlY3Rpb24gaWQ9J2tsYXNzX2NvbnRhaW5lcicgY2xhc3M9J0tsYXNzZXNWaWV3Jz48L3NlY3Rpb24+XCIgICAgICAgICBpZiBAa2xhc3Nlcy5sZW5ndGggaXNudCAwXG4gICAgY29udGFpbmVycy5wdXNoIFwiPHNlY3Rpb24gaWQ9J3RlYWNoZXJzX2NvbnRhaW5lcicgY2xhc3M9J1RlYWNoZXJzVmlldyc+PC9zZWN0aW9uPlwiICAgICBpZiBAdGVhY2hlcnMubGVuZ3RoIGlzbnQgMFxuICAgIGNvbnRhaW5lcnMucHVzaCBcIjxzZWN0aW9uIGlkPSd1c2Vyc19tZW51X2NvbnRhaW5lcicgY2xhc3M9J1VzZXJzTWVudVZpZXcnPjwvc2VjdGlvbj5cIlxuXG5cblxuICAgIGh0bWwgPSBcIlxuICAgICAgI3tncm91cHNCdXR0b259XG4gICAgICAje2Fwa0J1dHRvbn1cbiAgICAgICN7cmVzdWx0c0J1dHRvbn1cbiAgICAgICN7Z3JvdXBIYW5kbGV9XG4gICAgICA8c2VjdGlvbj5cbiAgICAgICAgPGgxPiN7QHRleHQubGVzc29uX3BsYW5zfTwvaDE+XG4gICAgXCJcblxuICAgIGlmIGlzQWRtaW5cbiAgICAgIGh0bWwgKz0gXCJcbiAgICAgICAgICAje25ld0J1dHRvbn1cbiAgICAgICAgICAje2ltcG9ydEJ1dHRvbn1cblxuICAgICAgICAgIDxkaXYgY2xhc3M9J25ld19mb3JtIGNvbmZpcm1hdGlvbic+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSd0ZXh0JyBjbGFzcz0nbmV3X25hbWUnIHBsYWNlaG9sZGVyPSdOYW1lJz5cbiAgICAgICAgICAgICAgPHNlbGVjdCBpZD0nbmV3X3R5cGUnPlxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9J2xlc3Nvbl9wbGFuJz4je0B0ZXh0Lmxlc3Nvbl9wbGFufTwvb3B0aW9uPlxuICAgICAgICAgICAgICA8L3NlbGVjdD48YnI+XG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25ld19zYXZlIGNvbW1hbmQnPiN7QHRleHQuc2F2ZX08L2J1dHRvbj4gPGJ1dHRvbiBjbGFzcz0nbmV3X2NhbmNlbCBjb21tYW5kJz4je0B0ZXh0LmNhbmNlbH08L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgaWQ9J2Fzc2Vzc21lbnRzX2NvbnRhaW5lcic+PC9kaXY+XG4gICAgICAgICAgPGRpdiBpZD0nbGVzc29uUGxhbnNfY29udGFpbmVyJz48L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgICN7Y29udGFpbmVycy5qb2luKCcnKX1cblxuICAgICAgXCJcbiAgICBlbHNlXG4gICAgICBodG1sICs9IFwiXG4gICAgICAgIDxkaXYgaWQ9J2Fzc2Vzc21lbnRzX2NvbnRhaW5lcic+PC9kaXY+XG4gICAgICAgIDxkaXYgaWQ9J2xlc3NvblBsYW5zX2NvbnRhaW5lcic+PC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgICBcIlxuXG4gICAgQCRlbC5odG1sIGh0bWxcblxuICAgIEBhc3Nlc3NtZW50c1ZpZXcuc2V0RWxlbWVudCggQCRlbC5maW5kKFwiI2Fzc2Vzc21lbnRzX2NvbnRhaW5lclwiKSApXG4gICAgQGFzc2Vzc21lbnRzVmlldy5yZW5kZXIoKVxuXG4gICAgQGN1cnJpY3VsYUxpc3RWaWV3LnNldEVsZW1lbnQoIEAkZWwuZmluZChcIiNjdXJyaWN1bGFfY29udGFpbmVyXCIpIClcbiAgICBAY3VycmljdWxhTGlzdFZpZXcucmVuZGVyKClcblxuICAgIEBsZXNzb25QbGFuc0xpc3RWaWV3LnNldEVsZW1lbnQoIEAkZWwuZmluZChcIiNsZXNzb25QbGFuc19jb250YWluZXJcIikgKVxuICAgIEBsZXNzb25QbGFuc0xpc3RWaWV3LnJlbmRlcigpXG5cbiAgICBAdXNlcnNNZW51Vmlldy5zZXRFbGVtZW50KCBAJGVsLmZpbmQoXCIjdXNlcnNfbWVudV9jb250YWluZXJcIikgKVxuICAgIEB1c2Vyc01lbnVWaWV3LnJlbmRlcigpXG5cbiAgICBpZiBAa2xhc3Nlcy5sZW5ndGggPiAwXG4gICAgICBAa2xhc3Nlc1ZpZXcgPSBuZXcgS2xhc3Nlc1ZpZXdcbiAgICAgICAga2xhc3NlcyA6IEBrbGFzc2VzXG4gICAgICAgIGN1cnJpY3VsYSA6IEBjdXJyaWN1bGFcbiAgICAgICAgdGVhY2hlcnMgOiBAdGVhY2hlcnNcbiAgICAgIEBrbGFzc2VzVmlldy5zZXRFbGVtZW50IEAkZWwuZmluZChcIiNrbGFzc19jb250YWluZXJcIilcbiAgICAgIEBrbGFzc2VzVmlldy5yZW5kZXIoKVxuICAgIGVsc2VcbiAgICAgIEAkZWwuZmluZChcIiNrbGFzc19jb250YWluZXJcIikucmVtb3ZlKClcblxuXG4gICAgaWYgQHRlYWNoZXJzLmxlbmd0aCA+IDBcbiAgICAgIEB0ZWFjaGVyc1ZpZXcgPSBuZXcgVGVhY2hlcnNWaWV3XG4gICAgICAgIHRlYWNoZXJzIDogQHRlYWNoZXJzXG4gICAgICAgIHVzZXJzIDogQHVzZXJzXG4gICAgICBAdGVhY2hlcnNWaWV3LnNldEVsZW1lbnQgQCRlbC5maW5kKFwiI3RlYWNoZXJzX2NvbnRhaW5lclwiKVxuICAgICAgQHRlYWNoZXJzVmlldy5yZW5kZXIoKVxuICAgIGVsc2VcbiAgICAgIEAkZWwuZmluZChcIiN0ZWFjaGVyc19jb250YWluZXJcIikucmVtb3ZlKClcblxuXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICAgIHJldHVyblxuXG5cbiAgYWRkQXNzZXNzbWVudDogKG5ld09uZSkgPT5cbiAgICBAYXNzZXNzbWVudHMuYWRkIG5ld09uZVxuICAgIG5ld09uZS5vbiBcIm5ld1wiLCBAYWRkQXNzZXNzbWVudFxuXG4gIGFkZEN1cnJpY3VsdW06IChuZXdPbmUpID0+XG4gICAgQGN1cnJpY3VsYS5hZGQgbmV3T25lXG4gICAgbmV3T25lLm9uIFwibmV3XCIsIEBhZGRDdXJyaWN1bHVtXG5cbiAgYWRkTGVzc29uUGxhbjogKG5ld09uZSkgPT5cbiAgICBAbGVzc29uUGxhbnMuYWRkIG5ld09uZVxuICAgIG5ld09uZS5vbiBcIm5ld1wiLCBAYWRkTGVzc29uUGxhblxuXG4gICMgTWFraW5nIGEgbmV3IGFzc2Vzc21lbnRcbiAgbmV3VG9nZ2xlOiAtPiBAJGVsLmZpbmQoJy5uZXdfZm9ybSwgLm5ldycpLnRvZ2dsZSgpOyBmYWxzZVxuXG4gIG5ld1NhdmU6IChldmVudCkgPT5cblxuICAgICMgdGhpcyBoYW5kbGVzIGFtYmlndW91cyBldmVudHNcbiAgICAjIHRoZSBpZGVhIGlzIHRvIHN1cHBvcnQgY2xpY2tzIGFuZCB0aGUgZW50ZXIga2V5XG4gICAgIyBsb2dpYzpcbiAgICAjIGl0IGl0J3MgYSBrZXlzdHJva2UgYW5kIGl0J3Mgbm90IGVudGVyLCBhY3Qgbm9ybWFsbHksIGp1c3QgYSBrZXkgc3Ryb2tlXG4gICAgIyBpZiBpdCdzIGEgY2xpY2sgb3IgZW50ZXIsIHByb2Nlc3MgdGhlIGZvcm1cblxuICAgIGlmIGV2ZW50LnR5cGUgIT0gXCJjbGlja1wiICYmIGV2ZW50LndoaWNoICE9IDEzXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgbmFtZSAgICA9IEAkZWwuZmluZCgnLm5ld19uYW1lJykudmFsKClcbiAgICBuZXdUeXBlID0gQCRlbC5maW5kKFwiI25ld190eXBlIG9wdGlvbjpzZWxlY3RlZFwiKS52YWwoKVxuICAgIG5ld0lkICAgPSBVdGlscy5ndWlkKClcblxuICAgIGlmIG5hbWUubGVuZ3RoID09IDBcbiAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiPHNwYW4gY2xhc3M9J2Vycm9yJz5Db3VsZCBub3Qgc2F2ZSA8aW1nIHNyYz0naW1hZ2VzL2ljb25fY2xvc2UucG5nJyBjbGFzcz0nY2xlYXJfbWVzc2FnZSc+PC9zcGFuPlwiXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIGlmIG5ld1R5cGUgPT0gXCJhc3Nlc3NtZW50XCJcbiAgICAgIG5ld09iamVjdCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgIFwibmFtZVwiICAgICAgICAgOiBuYW1lXG4gICAgICAgIFwiX2lkXCIgICAgICAgICAgOiBuZXdJZFxuICAgICAgICBcImFzc2Vzc21lbnRJZFwiIDogbmV3SWRcbiAgICAgICAgXCJhcmNoaXZlZFwiICAgICA6IGZhbHNlXG4gICAgICBjYWxsYmFjayA9IEBhZGRBc3Nlc3NtZW50XG4gICAgZWxzZSBpZiBuZXdUeXBlID09IFwiY3VycmljdWx1bVwiXG4gICAgICBuZXdPYmplY3QgPSBuZXcgQ3VycmljdWx1bVxuICAgICAgICBcIm5hbWVcIiAgICAgICAgIDogbmFtZVxuICAgICAgICBcIl9pZFwiICAgICAgICAgIDogbmV3SWRcbiAgICAgICAgXCJjdXJyaWN1bHVtSWRcIiA6IG5ld0lkXG4gICAgICBjYWxsYmFjayA9IEBhZGRDdXJyaWN1bHVtXG4gICAgZWxzZSBpZiBuZXdUeXBlID09IFwibGVzc29uX3BsYW5cIlxuICAgICAgbmV3T2JqZWN0ID0gbmV3IExlc3NvblBsYW5cbiAgICAgICAgXCJuYW1lXCIgICAgICAgICA6IG5hbWVcbiAgICAgICAgXCJsZXNzb25QbGFuX3RpdGxlXCIgICAgICAgICA6IG5hbWVcbiAgICAgICAgXCJfaWRcIiAgICAgICAgICA6IG5ld0lkXG4gICAgICAgIFwibGVzc29uUGxhbklkXCIgOiBuZXdJZFxuICAgICAgY2FsbGJhY2sgPSBAYWRkTGVzc29uUGxhblxuXG4gICAgbmV3T2JqZWN0LnNhdmUgbnVsbCxcbiAgICAgIHN1Y2Nlc3MgOiA9PlxuICAgICAgICBjYWxsYmFjayhuZXdPYmplY3QpXG4gICAgICAgIEAkZWwuZmluZCgnLm5ld19mb3JtLCAubmV3JykudG9nZ2xlKClcbiAgICAgICAgQCRlbC5maW5kKCcubmV3X25hbWUnKS52YWwgXCJcIlxuICAgICAgICBVdGlscy5taWRBbGVydCBcIiN7bmFtZX0gc2F2ZWRcIlxuICAgICAgZXJyb3I6ID0+XG4gICAgICAgIEAkZWwuZmluZCgnLm5ld19mb3JtLCAubmV3JykudG9nZ2xlKClcbiAgICAgICAgQCRlbC5maW5kKCcubmV3X25hbWUnKS52YWwgXCJcIlxuICAgICAgICBVdGlscy5taWRBbGVydCBcIlBsZWFzZSB0cnkgYWdhaW4uIEVycm9yIHNhdmluZy5cIlxuXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgIyBWaWV3TWFuYWdlclxuICBjbG9zZVZpZXdzOiAtPlxuICAgIEBhc3Nlc3NtZW50c1ZpZXcuY2xvc2UoKVxuICAgIEBjdXJyaWN1bGFMaXN0Vmlldy5jbG9zZSgpXG5cbiAgb25DbG9zZTogLT5cbiAgICBAY2xvc2VWaWV3cygpXG4iXX0=
