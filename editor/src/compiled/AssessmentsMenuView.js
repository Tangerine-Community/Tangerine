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
      instruments: t("AssessmentMenuView.label.instruments"),
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
    html = groupsButton + " " + apkButton + " " + resultsButton + " " + groupHandle + " <section> <h1>" + this.text.instruments + "</h1>";
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2Vzc21lbnQvQXNzZXNzbWVudHNNZW51Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxtQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7Ozs7Z0NBRUosU0FBQSxHQUFXOztnQ0FFWCxNQUFBLEdBQ0U7SUFBQSxvQkFBQSxFQUF1QixTQUF2QjtJQUNBLGlCQUFBLEVBQXVCLFNBRHZCO0lBRUEsbUJBQUEsRUFBdUIsV0FGdkI7SUFHQSxZQUFBLEVBQXVCLFdBSHZCO0lBSUEsZUFBQSxFQUF1QixRQUp2QjtJQUtBLFlBQUEsRUFBdUIsS0FMdkI7SUFNQSxlQUFBLEVBQXVCLFlBTnZCO0lBT0EseUJBQUEsRUFBNEIsaUJBUDVCO0lBU0EscUJBQUEsRUFBd0IsYUFUeEI7SUFXQSxnQkFBQSxFQUEwQixTQVgxQjtJQVlBLGlCQUFBLEVBQTBCLGFBWjFCO0lBYUEsc0JBQUEsRUFBMEIsYUFiMUI7SUFjQSx1QkFBQSxFQUEyQixhQWQzQjs7O2dDQWdCRixXQUFBLEdBQWEsU0FBQTtXQUNYLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFBO0VBRFc7O2dDQUdiLFdBQUEsR0FBYSxTQUFDLEtBQUQ7QUFDWCxRQUFBO0lBQUEsSUFBQSxDQUFjLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBZixDQUFBLENBQWQ7QUFBQSxhQUFBOztJQUNBLE9BQUEsR0FBYSxDQUFBLENBQUUsS0FBSyxDQUFDLE1BQVI7SUFDYixTQUFBLEdBQWEsT0FBTyxDQUFDLElBQVIsQ0FBYSxnQkFBYjtJQUNiLElBQUMsQ0FBQSxTQUFELEdBQWEsT0FBTyxDQUFDLEtBQVIsQ0FBQTtJQUNiLE9BQUEsR0FBVSxPQUFPLENBQUMsSUFBUixDQUFhLE9BQWIsQ0FBcUIsQ0FBQyxPQUF0QixDQUE4QixVQUE5QixFQUF5QyxFQUF6QztJQUNWLE9BQUEsR0FBVSxPQUFPLENBQUMsR0FBUixDQUFZLFFBQVo7SUFDVixPQUFPLENBQUMsS0FBUixDQUFjLG1DQUFBLEdB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LFVBQUEsR0FBWSxTQUFBO0lBQ1YsSUFBQyxDQUFBLGVBQWUsQ0FBQyxLQUFqQixDQUFBO1dBQ0EsSUFBQyxDQUFBLGlCQUFpQixDQUFDLEtBQW5CLENBQUE7RUFGVTs7Z0NBSVosT0FBQSxHQUFTLFNBQUE7V0FDUCxJQUFDLENBQUEsVUFBRCxDQUFBO0VBRE87Ozs7R0F4U3VCLFFBQVEsQ0FBQyIsImZpbGUiOiJhc3Nlc3NtZW50L0Fzc2Vzc21lbnRzTWVudVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBBc3Nlc3NtZW50c01lbnVWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJBc3Nlc3NtZW50c01lbnVWaWV3XCJcblxuICBldmVudHM6XG4gICAgJ2tleXByZXNzIC5uZXdfbmFtZScgOiAnbmV3U2F2ZSdcbiAgICAnY2xpY2sgLm5ld19zYXZlJyAgICA6ICduZXdTYXZlJ1xuICAgICdjbGljayAubmV3X2NhbmNlbCcgIDogJ25ld1RvZ2dsZSdcbiAgICAnY2xpY2sgLm5ldycgICAgICAgICA6ICduZXdUb2dnbGUnXG4gICAgJ2NsaWNrIC5pbXBvcnQnICAgICAgOiAnaW1wb3J0J1xuICAgICdjbGljayAuYXBrJyAgICAgICAgIDogJ2FwaydcbiAgICAnY2xpY2sgLmdyb3VwcycgICAgICA6ICdnb3RvR3JvdXBzJ1xuICAgICdjbGljayAudW5pdmVyc2FsX3VwbG9hZCcgOiAndW5pdmVyc2FsVXBsb2FkJ1xuXG4gICAgJ2NsaWNrIC5zeW5jX3RhYmxldHMnIDogJ3N5bmNUYWJsZXRzJ1xuXG4gICAgJ2NsaWNrIC5yZXN1bHRzJyAgICAgICAgOiAncmVzdWx0cydcbiAgICAnY2xpY2sgLnNldHRpbmdzJyAgICAgICA6ICdlZGl0SW5QbGFjZSdcbiAgICAna2V5dXAgLmVkaXRfaW5fcGxhY2UnICA6ICdzYXZlSW5QbGFjZSdcbiAgICAnY2hhbmdlIC5lZGl0X2luX3BsYWNlJyAgOiAnc2F2ZUluUGxhY2UnXG5cbiAgc3luY1RhYmxldHM6ID0+XG4gICAgQHRhYmxldE1hbmFnZXIuc3luYygpXG5cbiAgZWRpdEluUGxhY2U6IChldmVudCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKVxuICAgICR0YXJnZXQgICAgPSAkKGV2ZW50LnRhcmdldClcbiAgICBhdHRyaWJ1dGUgID0gJHRhcmdldC5hdHRyKFwiZGF0YS1hdHRyaWJ0dWVcIilcbiAgICBAb2xkVGFyZ2V0ID0gJHRhcmdldC5jbG9uZSgpXG4gICAgY2xhc3NlcyA9ICR0YXJnZXQuYXR0cihcImNsYXNzXCIpLnJlcGxhY2UoXCJzZXR0aW5nc1wiLFwiXCIpXG4gICAgbWFyZ2lucyA9ICR0YXJnZXQuY3NzKFwibWFyZ2luXCIpXG4gICAgJHRhcmdldC5hZnRlcihcIjxpbnB1dCB0eXBlPSd0ZXh0JyBzdHlsZT0nbWFyZ2luOiN7bWFyZ2luc307JyBkYXRhLWF0dHJpYnV0ZT0nI3thdHRyaWJ1dGV9JyBjbGFzcz0nZWRpdF9pbl9wbGFjZSAje2NsYXNzZXN9JyB2YWx1ZT0nI3tfLmVzY2FwZSgkdGFyZ2V0Lmh0bWwoKSl9Jz5cIilcbiAgICBpbnB1dCA9ICR0YXJnZXQubmV4dCgpLmZvY3VzKClcbiAgICAkdGFyZ2V0LnJlbW92ZSgpXG5cbiAgc2F2ZUluUGxhY2U6IChldmVudCkgLT5cblxuICAgIHJldHVybiBpZiBAYWxyZWFkeVNhdmluZ1xuXG4gICAgaWYgZXZlbnQua2V5Q29kZVxuICAgICAgaWYgZXZlbnQua2V5Q29kZSA9PSAyN1xuICAgICAgICAkKGV2ZW50LnRhcmdldCkuYWZ0ZXIoQG9sZFRhcmdldCkucmVtb3ZlKClcbiAgICAgICAgcmV0dXJuXG4gICAgICBlbHNlIGlmIGV2ZW50LmtleUNvZGUgIT0gMTNcbiAgICAgICAgcmV0dXJuIHRydWVcblxuICAgIEBhbHJlYWR5U2F2aW5nID0gdHJ1ZVxuICAgICR0YXJnZXQgICA9ICQoZXZlbnQudGFyZ2V0KVxuICAgIGF0dHJpYnV0ZSA9ICR0YXJnZXQuYXR0cihcImRhdGEtYXR0cmlidXRlXCIpXG4gICAgdmFsdWUgICAgID0gJHRhcmdldC52YWwoKVxuXG4gICAgdXBkYXRlZEF0dHJpYnV0ZXMgICAgICAgICAgICA9IHt9XG4gICAgdXBkYXRlZEF0dHJpYnV0ZXNbYXR0cmlidXRlXSA9IHZhbHVlXG5cbiAgICBUYW5nZXJpbmUuc2V0dGluZ3Muc2F2ZSB1cGRhdGVkQXR0cmlidXRlcyxcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgIEBhbHJlYWR5U2F2aW5nID0gZmFsc2VcbiAgICAgICAgVXRpbHMudG9wQWxlcnQoXCJTYXZlZFwiKVxuICAgICAgICAkdGFyZ2V0LmFmdGVyKEBvbGRUYXJnZXQuaHRtbCh2YWx1ZSkpLnJlbW92ZSgpXG4gICAgICBlcnJvcjogPT5cbiAgICAgICAgQGFscmVhZHlTYXZpbmcgPSBmYWxzZVxuICAgICAgICBVdGlscy50b3BBbGVydChcIlNhdmUgZXJyb3JcIilcbiAgICAgICAgJHRhcmdldC5hZnRlcihAb2xkVGFyZ2V0KS5yZW1vdmUoKVxuXG4gIHJlc3VsdHM6IC0+IFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJkYXNoYm9hcmRcIiwgdHJ1ZVxuXG4gIHVuaXZlcnNhbFVwbG9hZDogLT4gVXRpbHMudW5pdmVyc2FsVXBsb2FkKClcblxuICBhcGs6IC0+XG4gICAgVGFuZ2VyaW5lVHJlZS5tYWtlXG4gICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpXG4gICAgICAgIGEuaHJlZiA9IFRhbmdlcmluZS5zZXR0aW5ncy5jb25maWcuZ2V0KFwidHJlZVwiKVxuICAgICAgICBVdGlscy5zdGlja3koXCI8aDE+QVBLIGxpbms8L2gxPjxwPiN7YS5ob3N0fS90cmVlLyN7ZGF0YS50b2tlbn08L3A+XCIpXG4gICAgICBlcnJvcjogKHhociwgcmVzcG9uc2UpIC0+XG4gICAgICAgIFV0aWxzLnN0aWNreSByZXNwb25zZS5tZXNzYWdlXG5cbiAgZ290b0dyb3VwczogLT4gVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImdyb3Vwc1wiLCB0cnVlXG5cbiAgaW1wb3J0OiAgICAgLT4gVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImltcG9ydFwiLCB0cnVlXG5cbiAgaTE4bjogLT5cbiAgICBAdGV4dCA9XG4gICAgICBcIm5ld1wiICAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5uZXdcIilcbiAgICAgIGltcG9ydCAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5pbXBvcnRcIilcbiAgICAgIGFwayAgICAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5hcGtcIilcbiAgICAgIGdyb3VwcyAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5ncm91cHNcIilcbiAgICAgIHVuaXZlcnNhbF91cGxvYWQgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi51bml2ZXJzYWxfdXBsb2FkXCIpXG4gICAgICBzeW5jX3RhYmxldHMgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24uc3luY190YWJsZXRzXCIpXG4gICAgICByZXN1bHRzICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24ucmVzdWx0c1wiKVxuICAgICAgc2F2ZSAgICAgICAgICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLnNhdmVcIilcbiAgICAgIGNhbmNlbCAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5jYW5jZWxcIilcbiAgICAgIGFzc2Vzc21lbnQgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5sYWJlbC5hc3Nlc3NtZW50XCIpXG4gICAgICBhc3Nlc3NtZW50cyA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcubGFiZWwuYXNzZXNzbWVudHNcIilcbiAgICAgIGluc3RydW1lbnRzIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5sYWJlbC5pbnN0cnVtZW50c1wiKVxuICAgICAgY3VycmljdWx1bSAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmxhYmVsLmN1cnJpY3VsdW1cIilcbiAgICAgIGxlc3Nvbl9wbGFuICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcubGFiZWwubGVzc29uX3BsYW5cIilcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgIEBpMThuKClcblxuICAgIEBba2V5XSA9IHZhbHVlIGZvciBrZXksIHZhbHVlIG9mIG9wdGlvbnNcblxuICAgIEBhc3Nlc3NtZW50cy5lYWNoIChhc3Nlc3NtZW50KSA9PiBhc3Nlc3NtZW50Lm9uIFwibmV3XCIsIEBhZGRBc3Nlc3NtZW50XG4gICAgQGN1cnJpY3VsYS5lYWNoICAgKGN1cnJpY3VsdW0pID0+IGN1cnJpY3VsdW0ub24gXCJuZXdcIiwgQGFkZEN1cnJpY3VsdW1cbiAgICBAbGVzc29uUGxhbnMuZWFjaCAgIChsZXNzb25QbGFuKSA9PiBsZXNzb25QbGFuLm9uIFwibmV3XCIsIEBhZGRMZXNzb25QbGFuXG5cbiAgICBAY3VycmljdWxhTGlzdFZpZXcgPSBuZXcgQ3VycmljdWxhTGlzdFZpZXdcbiAgICAgIFwiY3VycmljdWxhXCIgOiBAY3VycmljdWxhXG5cbiAgICBAbGVzc29uUGxhbnNMaXN0VmlldyA9IG5ldyBMZXNzb25QbGFuc0xpc3RWaWV3XG4gICAgICBcImxlc3NvblBsYW5zXCIgOiBAbGVzc29uUGxhbnNcbiAgICAgIFwicGFyZW50XCIgICAgICA6IEBcblxuICAgIEBhc3Nlc3NtZW50c1ZpZXcgPSBuZXcgQXNzZXNzbWVudHNWaWV3XG4gICAgICBcImFzc2Vzc21lbnRzXCIgOiBAYXNzZXNzbWVudHNcbiAgICAgIFwicGFyZW50XCIgICAgICA6IEBcblxuICAgIEB1c2Vyc01lbnVWaWV3ID0gbmV3IFVzZXJzTWVudVZpZXdcblxuICByZW5kZXI6ID0+XG5cbiAgICBpc0FkbWluID0gVGFuZ2VyaW5lLnVzZXIuaXNBZG1pbigpXG5cbiAgICBuZXdCdXR0b24gICAgID0gXCI8YnV0dG9uIGNsYXNzPSduZXcgY29tbWFuZCc+I3tAdGV4dC5uZXd9PC9idXR0b24+XCJcbiAgICBpbXBvcnRCdXR0b24gID0gXCI8YnV0dG9uIGNsYXNzPSdpbXBvcnQgY29tbWFuZCc+I3tAdGV4dC5pbXBvcnR9PC9idXR0b24+XCJcbiAgICBhcGtCdXR0b24gICAgID0gXCI8YnV0dG9uIGNsYXNzPSdhcGsgbmF2aWdhdGlvbic+I3tAdGV4dC5hcGt9PC9idXR0b24+XCJcbiAgICBncm91cHNCdXR0b24gID0gXCI8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIGdyb3Vwcyc+I3tAdGV4dC5ncm91cHN9PC9idXR0b24+XCJcbiAgICB1cGxvYWRCdXR0b24gID0gXCI8YnV0dG9uIGNsYXNzPSdjb21tYW5kIHVuaXZlcnNhbF91cGxvYWQnPiN7QHRleHQudW5pdmVyc2FsX3VwbG9hZH08L2J1dHRvbj5cIlxuICAgIHN5bmNUYWJsZXRzQnV0dG9uID0gXCI8YnV0dG9uIGNsYXNzPSdjb21tYW5kIHN5bmNfdGFibGV0cyc+I3tAdGV4dC5zeW5jX3RhYmxldHN9PC9idXR0b24+XCJcbiAgICByZXN1bHRzQnV0dG9uID0gXCI8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIHJlc3VsdHMnPiN7QHRleHQucmVzdWx0c308L2J1dHRvbj5cIlxuICAgIGdyb3VwSGFuZGxlICAgPSBcIjxoMiBjbGFzcz0nc2V0dGluZ3MgZ3JleScgZGF0YS1hdHRyaWJ0dWU9J2dyb3VwSGFuZGxlJz4je1RhbmdlcmluZS5zZXR0aW5ncy5nZXRFc2NhcGVkU3RyaW5nKCdncm91cEhhbmRsZScpIHx8IFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoJ2dyb3VwTmFtZScpfTwvaDI+XCJcblxuXG4gICAgY29udGFpbmVycyA9IFtdXG4gICAgY29udGFpbmVycy5wdXNoIFwiPHNlY3Rpb24gaWQ9J2N1cnJpY3VsYV9jb250YWluZXInIGNsYXNzPSdDdXJyaWN1bGFMaXN0Vmlldyc+PC9zZWN0aW9uPlwiIGlmIEBjdXJyaWN1bGEubGVuZ3RoIGlzbnQgMFxuICAgIGNvbnRhaW5lcnMucHVzaCBcIjxzZWN0aW9uIGlkPSdrbGFzc19jb250YWluZXInIGNsYXNzPSdLbGFzc2VzVmlldyc+PC9zZWN0aW9uPlwiICAgICAgICAgaWYgQGtsYXNzZXMubGVuZ3RoIGlzbnQgMFxuICAgIGNvbnRhaW5lcnMucHVzaCBcIjxzZWN0aW9uIGlkPSd0ZWFjaGVyc19jb250YWluZXInIGNsYXNzPSdUZWFjaGVyc1ZpZXcnPjwvc2VjdGlvbj5cIiAgICAgaWYgQHRlYWNoZXJzLmxlbmd0aCBpc250IDBcbiAgICBjb250YWluZXJzLnB1c2ggXCI8c2VjdGlvbiBpZD0ndXNlcnNfbWVudV9jb250YWluZXInIGNsYXNzPSdVc2Vyc01lbnVWaWV3Jz48L3NlY3Rpb24+XCJcblxuXG5cbiAgICBodG1sID0gXCJcbiAgICAgICN7Z3JvdXBzQnV0dG9ufVxuICAgICAgI3thcGtCdXR0b259XG4gICAgICAje3Jlc3VsdHNCdXR0b259XG4gICAgICAje2dyb3VwSGFuZGxlfVxuICAgICAgPHNlY3Rpb24+XG4gICAgICAgIDxoMT4je0B0ZXh0Lmluc3RydW1lbnRzfTwvaDE+XG4gICAgXCJcblxuICAgIGlmIGlzQWRtaW5cbiAgICAgIGh0bWwgKz0gXCJcbiAgICAgICAgICAje25ld0J1dHRvbn1cbiAgICAgICAgICAje2ltcG9ydEJ1dHRvbn1cblxuICAgICAgICAgIDxkaXYgY2xhc3M9J25ld19mb3JtIGNvbmZpcm1hdGlvbic+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSd0ZXh0JyBjbGFzcz0nbmV3X25hbWUnIHBsYWNlaG9sZGVyPSdOYW1lJz5cbiAgICAgICAgICAgICAgPHNlbGVjdCBpZD0nbmV3X3R5cGUnPlxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9J2Fzc2Vzc21lbnQnPiN7QHRleHQuYXNzZXNzbWVudH08L29wdGlvbj5cbiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSdjdXJyaWN1bHVtJz4je0B0ZXh0LmN1cnJpY3VsdW19PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0nbGVzc29uX3BsYW4nPiN7QHRleHQubGVzc29uX3BsYW59PC9vcHRpb24+XG4gICAgICAgICAgICAgIDwvc2VsZWN0Pjxicj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmV3X3NhdmUgY29tbWFuZCc+I3tAdGV4dC5zYXZlfTwvYnV0dG9uPiA8YnV0dG9uIGNsYXNzPSduZXdfY2FuY2VsIGNvbW1hbmQnPiN7QHRleHQuY2FuY2VsfTwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBpZD0nYXNzZXNzbWVudHNfY29udGFpbmVyJz48L2Rpdj5cbiAgICAgICAgICA8ZGl2IGlkPSdsZXNzb25QbGFuc19jb250YWluZXInPjwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgI3tjb250YWluZXJzLmpvaW4oJycpfVxuXG4gICAgICBcIlxuICAgIGVsc2VcbiAgICAgIGh0bWwgKz0gXCJcbiAgICAgICAgPGRpdiBpZD0nYXNzZXNzbWVudHNfY29udGFpbmVyJz48L2Rpdj5cbiAgICAgICAgPGRpdiBpZD0nbGVzc29uUGxhbnNfY29udGFpbmVyJz48L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cbiAgICAgIFwiXG5cbiAgICBAJGVsLmh0bWwgaHRtbFxuXG4gICAgQGFzc2Vzc21lbnRzVmlldy5zZXRFbGVtZW50KCBAJGVsLmZpbmQoXCIjYXNzZXNzbWVudHNfY29udGFpbmVyXCIpIClcbiAgICBAYXNzZXNzbWVudHNWaWV3LnJlbmRlcigpXG5cbiAgICBAY3VycmljdWxhTGlzdFZpZXcuc2V0RWxlbWVudCggQCRlbC5maW5kKFwiI2N1cnJpY3VsYV9jb250YWluZXJcIikgKVxuICAgIEBjdXJyaWN1bGFMaXN0Vmlldy5yZW5kZXIoKVxuXG4gICAgQGxlc3NvblBsYW5zTGlzdFZpZXcuc2V0RWxlbWVudCggQCRlbC5maW5kKFwiI2xlc3NvblBsYW5zX2NvbnRhaW5lclwiKSApXG4gICAgQGxlc3NvblBsYW5zTGlzdFZpZXcucmVuZGVyKClcblxuICAgIEB1c2Vyc01lbnVWaWV3LnNldEVsZW1lbnQoIEAkZWwuZmluZChcIiN1c2Vyc19tZW51X2NvbnRhaW5lclwiKSApXG4gICAgQHVzZXJzTWVudVZpZXcucmVuZGVyKClcblxuICAgIGlmIEBrbGFzc2VzLmxlbmd0aCA+IDBcbiAgICAgIEBrbGFzc2VzVmlldyA9IG5ldyBLbGFzc2VzVmlld1xuICAgICAgICBrbGFzc2VzIDogQGtsYXNzZXNcbiAgICAgICAgY3VycmljdWxhIDogQGN1cnJpY3VsYVxuICAgICAgICB0ZWFjaGVycyA6IEB0ZWFjaGVyc1xuICAgICAgQGtsYXNzZXNWaWV3LnNldEVsZW1lbnQgQCRlbC5maW5kKFwiI2tsYXNzX2NvbnRhaW5lclwiKVxuICAgICAgQGtsYXNzZXNWaWV3LnJlbmRlcigpXG4gICAgZWxzZVxuICAgICAgQCRlbC5maW5kKFwiI2tsYXNzX2NvbnRhaW5lclwiKS5yZW1vdmUoKVxuXG5cbiAgICBpZiBAdGVhY2hlcnMubGVuZ3RoID4gMFxuICAgICAgQHRlYWNoZXJzVmlldyA9IG5ldyBUZWFjaGVyc1ZpZXdcbiAgICAgICAgdGVhY2hlcnMgOiBAdGVhY2hlcnNcbiAgICAgICAgdXNlcnMgOiBAdXNlcnNcbiAgICAgIEB0ZWFjaGVyc1ZpZXcuc2V0RWxlbWVudCBAJGVsLmZpbmQoXCIjdGVhY2hlcnNfY29udGFpbmVyXCIpXG4gICAgICBAdGVhY2hlcnNWaWV3LnJlbmRlcigpXG4gICAgZWxzZVxuICAgICAgQCRlbC5maW5kKFwiI3RlYWNoZXJzX2NvbnRhaW5lclwiKS5yZW1vdmUoKVxuXG5cblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4gICAgcmV0dXJuXG5cblxuICBhZGRBc3Nlc3NtZW50OiAobmV3T25lKSA9PlxuICAgIEBhc3Nlc3NtZW50cy5hZGQgbmV3T25lXG4gICAgbmV3T25lLm9uIFwibmV3XCIsIEBhZGRBc3Nlc3NtZW50XG5cbiAgYWRkQ3VycmljdWx1bTogKG5ld09uZSkgPT5cbiAgICBAY3VycmljdWxhLmFkZCBuZXdPbmVcbiAgICBuZXdPbmUub24gXCJuZXdcIiwgQGFkZEN1cnJpY3VsdW1cblxuICBhZGRMZXNzb25QbGFuOiAobmV3T25lKSA9PlxuICAgIEBsZXNzb25QbGFucy5hZGQgbmV3T25lXG4gICAgbmV3T25lLm9uIFwibmV3XCIsIEBhZGRMZXNzb25QbGFuXG5cbiAgIyBNYWtpbmcgYSBuZXcgYXNzZXNzbWVudFxuICBuZXdUb2dnbGU6IC0+IEAkZWwuZmluZCgnLm5ld19mb3JtLCAubmV3JykudG9nZ2xlKCk7IGZhbHNlXG5cbiAgbmV3U2F2ZTogKGV2ZW50KSA9PlxuXG4gICAgIyB0aGlzIGhhbmRsZXMgYW1iaWd1b3VzIGV2ZW50c1xuICAgICMgdGhlIGlkZWEgaXMgdG8gc3VwcG9ydCBjbGlja3MgYW5kIHRoZSBlbnRlciBrZXlcbiAgICAjIGxvZ2ljOlxuICAgICMgaXQgaXQncyBhIGtleXN0cm9rZSBhbmQgaXQncyBub3QgZW50ZXIsIGFjdCBub3JtYWxseSwganVzdCBhIGtleSBzdHJva2VcbiAgICAjIGlmIGl0J3MgYSBjbGljayBvciBlbnRlciwgcHJvY2VzcyB0aGUgZm9ybVxuXG4gICAgaWYgZXZlbnQudHlwZSAhPSBcImNsaWNrXCIgJiYgZXZlbnQud2hpY2ggIT0gMTNcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICBuYW1lICAgID0gQCRlbC5maW5kKCcubmV3X25hbWUnKS52YWwoKVxuICAgIG5ld1R5cGUgPSBAJGVsLmZpbmQoXCIjbmV3X3R5cGUgb3B0aW9uOnNlbGVjdGVkXCIpLnZhbCgpXG4gICAgbmV3SWQgICA9IFV0aWxzLmd1aWQoKVxuXG4gICAgaWYgbmFtZS5sZW5ndGggPT0gMFxuICAgICAgVXRpbHMubWlkQWxlcnQgXCI8c3BhbiBjbGFzcz0nZXJyb3InPkNvdWxkIG5vdCBzYXZlIDxpbWcgc3JjPSdpbWFnZXMvaWNvbl9jbG9zZS5wbmcnIGNsYXNzPSdjbGVhcl9tZXNzYWdlJz48L3NwYW4+XCJcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgaWYgbmV3VHlwZSA9PSBcImFzc2Vzc21lbnRcIlxuICAgICAgbmV3T2JqZWN0ID0gbmV3IEFzc2Vzc21lbnRcbiAgICAgICAgXCJuYW1lXCIgICAgICAgICA6IG5hbWVcbiAgICAgICAgXCJfaWRcIiAgICAgICAgICA6IG5ld0lkXG4gICAgICAgIFwiYXNzZXNzbWVudElkXCIgOiBuZXdJZFxuICAgICAgICBcImFyY2hpdmVkXCIgICAgIDogZmFsc2VcbiAgICAgIGNhbGxiYWNrID0gQGFkZEFzc2Vzc21lbnRcbiAgICBlbHNlIGlmIG5ld1R5cGUgPT0gXCJjdXJyaWN1bHVtXCJcbiAgICAgIG5ld09iamVjdCA9IG5ldyBDdXJyaWN1bHVtXG4gICAgICAgIFwibmFtZVwiICAgICAgICAgOiBuYW1lXG4gICAgICAgIFwiX2lkXCIgICAgICAgICAgOiBuZXdJZFxuICAgICAgICBcImN1cnJpY3VsdW1JZFwiIDogbmV3SWRcbiAgICAgIGNhbGxiYWNrID0gQGFkZEN1cnJpY3VsdW1cbiAgICBlbHNlIGlmIG5ld1R5cGUgPT0gXCJsZXNzb25fcGxhblwiXG4gICAgICBuZXdPYmplY3QgPSBuZXcgTGVzc29uUGxhblxuICAgICAgICBcIm5hbWVcIiAgICAgICAgIDogbmFtZVxuICAgICAgICBcImxlc3NvblBsYW5fdGl0bGVcIiAgICAgICAgIDogbmFtZVxuICAgICAgICBcIl9pZFwiICAgICAgICAgIDogbmV3SWRcbiAgICAgICAgXCJsZXNzb25QbGFuSWRcIiA6IG5ld0lkXG4gICAgICBjYWxsYmFjayA9IEBhZGRMZXNzb25QbGFuXG5cbiAgICBuZXdPYmplY3Quc2F2ZSBudWxsLFxuICAgICAgc3VjY2VzcyA6ID0+XG4gICAgICAgIGNhbGxiYWNrKG5ld09iamVjdClcbiAgICAgICAgQCRlbC5maW5kKCcubmV3X2Zvcm0sIC5uZXcnKS50b2dnbGUoKVxuICAgICAgICBAJGVsLmZpbmQoJy5uZXdfbmFtZScpLnZhbCBcIlwiXG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiI3tuYW1lfSBzYXZlZFwiXG4gICAgICBlcnJvcjogPT5cbiAgICAgICAgQCRlbC5maW5kKCcubmV3X2Zvcm0sIC5uZXcnKS50b2dnbGUoKVxuICAgICAgICBAJGVsLmZpbmQoJy5uZXdfbmFtZScpLnZhbCBcIlwiXG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiUGxlYXNlIHRyeSBhZ2Fpbi4gRXJyb3Igc2F2aW5nLlwiXG5cbiAgICByZXR1cm4gZmFsc2VcblxuICAjIFZpZXdNYW5hZ2VyXG4gIGNsb3NlVmlld3M6IC0+XG4gICAgQGFzc2Vzc21lbnRzVmlldy5jbG9zZSgpXG4gICAgQGN1cnJpY3VsYUxpc3RWaWV3LmNsb3NlKClcblxuICBvbkNsb3NlOiAtPlxuICAgIEBjbG9zZVZpZXdzKClcbiJdfQ==
