var AssessmentsMenuView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AssessmentsMenuView = (function(superClass) {
  extend(AssessmentsMenuView, superClass);

  function AssessmentsMenuView() {
    this.newSave = bind(this.newSave, this);
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
      curriculum: t("AssessmentMenuView.label.curriculum")
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
    this.curriculaListView = new CurriculaListView({
      "curricula": this.curricula
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
    containers.push("<section id='workflow_menu_container' class='WorkflowMenuView'></section>");
    html = groupsButton + " " + apkButton + " " + resultsButton + " " + groupHandle + " <section> <h1>" + this.text.assessments + "</h1>";
    if (isAdmin) {
      html += newButton + " " + importButton + " <div class='new_form confirmation'> <div class='menu_box'> <input type='text' class='new_name' placeholder='Name'> <select id='new_type'> <option value='assessment'>" + this.text.assessment + "</option> <option value='curriculum'>" + this.text.curriculum + "</option> </select><br> <button class='new_save command'>" + this.text.save + "</button> <button class='new_cancel command'>" + this.text.cancel + "</button> </div> </div> <div id='assessments_container'></div> </section> " + (containers.join(''));
    } else {
      html += "<div id='assessments_container'></div> </section>";
    }
    this.$el.html(html);
    this.assessmentsView.setElement(this.$el.find("#assessments_container"));
    this.assessmentsView.render();
    this.curriculaListView.setElement(this.$el.find("#curricula_container"));
    this.curriculaListView.render();
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
    if (Tangerine.settings.get('showWorkflows') === true) {
      this.workflowMenuView = new WorkflowMenuView({
        workflows: this.workflows,
        feedbacks: this.feedbacks
      });
      this.workflowMenuView.setElement(this.$el.find("#workflow_menu_container"));
      this.workflowMenuView.render();
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXNzbWVudC9Bc3Nlc3NtZW50c01lbnVWaWV3LmpzIiwic291cmNlcyI6WyJhc3Nlc3NtZW50L0Fzc2Vzc21lbnRzTWVudVZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsbUJBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs7Ozs7Z0NBRUosU0FBQSxHQUFXOztnQ0FFWCxNQUFBLEdBQ0U7SUFBQSxvQkFBQSxFQUF1QixTQUF2QjtJQUNBLGlCQUFBLEVBQXVCLFNBRHZCO0lBRUEsbUJBQUEsRUFBdUIsV0FGdkI7SUFHQSxZQUFBLEVBQXVCLFdBSHZCO0lBSUEsZUFBQSxFQUF1QixRQUp2QjtJQUtBLFlBQUEsRUFBdUIsS0FMdkI7SUFNQSxlQUFBLEVBQXVCLFlBTnZCO0lBT0EseUJBQUEsRUFBNEIsaUJBUDVCO0lBU0EscUJBQUEsRUFBd0IsYUFUeEI7SUFXQSxnQkFBQSxFQUEwQixTQVgxQjtJQVlBLGlCQUFBLEVBQTBCLGFBWjFCO0lBYUEsc0JBQUEsRUFBMEIsYUFiMUI7SUFjQSx1QkFBQSxFQUEyQixhQWQzQjs7O2dDQWdCRixXQUFBLEdBQWEsU0FBQTtXQUNYLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFBO0VBRFc7O2dDQUdiLFdBQUEsR0FBYSxTQUFDLEtBQUQ7QUFDWCxRQUFBO0lBQUEsSUFBQSxDQUFjLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBZixDQUFBLENBQWQ7QUFBQSxhQUFBOztJQUNBLE9BQUEsR0FBYSxDQUFBLENBQUUsS0FBSyxDQUFDLE1BQVI7SUFDYixTQUFBLEdBQWEsT0FBTyxDQUFDLElBQVIsQ0FBYSxnQkFBYjtJQUNiLElBQUMsQ0FBQSxTQUFELEdBQWEsT0FBTyxDQUFDLEtBQVIsQ0FBQTtJQUNiLE9BQUEsR0FBVSxPQUFPLENBQUMsSUFBUixDQUFhLE9BQWIsQ0FBcUIsQ0FBQyxPQUF0QixDQUE4QixVQUE5QixFQUF5QyxFQUF6QztJQUNWLE9BQUEsR0FBVSxPQUFPLENBQUMsR0FBUixD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Q0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlCQUFWLENBQTRCLENBQUMsTUFBN0IsQ0FBQTtVQUNBLEtBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFdBQVYsQ0FBc0IsQ0FBQyxHQUF2QixDQUEyQixFQUEzQjtpQkFDQSxLQUFLLENBQUMsUUFBTixDQUFrQixJQUFELEdBQU0sUUFBdkI7UUFKUTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVjtNQUtBLEtBQUEsRUFBTyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDTCxLQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxpQkFBVixDQUE0QixDQUFDLE1BQTdCLENBQUE7VUFDQSxLQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxXQUFWLENBQXNCLENBQUMsR0FBdkIsQ0FBMkIsRUFBM0I7aUJBQ0EsS0FBSyxDQUFDLFFBQU4sQ0FBZSxpQ0FBZjtRQUhLO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUxQO0tBREY7QUFXQSxXQUFPO0VBNUNBOztnQ0ErQ1QsVUFBQSxHQUFZLFNBQUE7SUFDVixJQUFDLENBQUEsZUFBZSxDQUFDLEtBQWpCLENBQUE7V0FDQSxJQUFDLENBQUEsaUJBQWlCLENBQUMsS0FBbkIsQ0FBQTtFQUZVOztnQ0FJWixPQUFBLEdBQVMsU0FBQTtXQUNQLElBQUMsQ0FBQSxVQUFELENBQUE7RUFETzs7OztHQXpSdUIsUUFBUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQXNzZXNzbWVudHNNZW51VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiQXNzZXNzbWVudHNNZW51Vmlld1wiXG5cbiAgZXZlbnRzOlxuICAgICdrZXlwcmVzcyAubmV3X25hbWUnIDogJ25ld1NhdmUnXG4gICAgJ2NsaWNrIC5uZXdfc2F2ZScgICAgOiAnbmV3U2F2ZSdcbiAgICAnY2xpY2sgLm5ld19jYW5jZWwnICA6ICduZXdUb2dnbGUnXG4gICAgJ2NsaWNrIC5uZXcnICAgICAgICAgOiAnbmV3VG9nZ2xlJ1xuICAgICdjbGljayAuaW1wb3J0JyAgICAgIDogJ2ltcG9ydCdcbiAgICAnY2xpY2sgLmFwaycgICAgICAgICA6ICdhcGsnXG4gICAgJ2NsaWNrIC5ncm91cHMnICAgICAgOiAnZ290b0dyb3VwcydcbiAgICAnY2xpY2sgLnVuaXZlcnNhbF91cGxvYWQnIDogJ3VuaXZlcnNhbFVwbG9hZCdcblxuICAgICdjbGljayAuc3luY190YWJsZXRzJyA6ICdzeW5jVGFibGV0cydcblxuICAgICdjbGljayAucmVzdWx0cycgICAgICAgIDogJ3Jlc3VsdHMnXG4gICAgJ2NsaWNrIC5zZXR0aW5ncycgICAgICAgOiAnZWRpdEluUGxhY2UnXG4gICAgJ2tleXVwIC5lZGl0X2luX3BsYWNlJyAgOiAnc2F2ZUluUGxhY2UnXG4gICAgJ2NoYW5nZSAuZWRpdF9pbl9wbGFjZScgIDogJ3NhdmVJblBsYWNlJ1xuXG4gIHN5bmNUYWJsZXRzOiA9PlxuICAgIEB0YWJsZXRNYW5hZ2VyLnN5bmMoKVxuXG4gIGVkaXRJblBsYWNlOiAoZXZlbnQpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBUYW5nZXJpbmUudXNlci5pc0FkbWluKClcbiAgICAkdGFyZ2V0ICAgID0gJChldmVudC50YXJnZXQpXG4gICAgYXR0cmlidXRlICA9ICR0YXJnZXQuYXR0cihcImRhdGEtYXR0cmlidHVlXCIpXG4gICAgQG9sZFRhcmdldCA9ICR0YXJnZXQuY2xvbmUoKVxuICAgIGNsYXNzZXMgPSAkdGFyZ2V0LmF0dHIoXCJjbGFzc1wiKS5yZXBsYWNlKFwic2V0dGluZ3NcIixcIlwiKVxuICAgIG1hcmdpbnMgPSAkdGFyZ2V0LmNzcyhcIm1hcmdpblwiKVxuICAgICR0YXJnZXQuYWZ0ZXIoXCI8aW5wdXQgdHlwZT0ndGV4dCcgc3R5bGU9J21hcmdpbjoje21hcmdpbnN9OycgZGF0YS1hdHRyaWJ1dGU9JyN7YXR0cmlidXRlfScgY2xhc3M9J2VkaXRfaW5fcGxhY2UgI3tjbGFzc2VzfScgdmFsdWU9JyN7Xy5lc2NhcGUoJHRhcmdldC5odG1sKCkpfSc+XCIpXG4gICAgaW5wdXQgPSAkdGFyZ2V0Lm5leHQoKS5mb2N1cygpXG4gICAgJHRhcmdldC5yZW1vdmUoKVxuXG4gIHNhdmVJblBsYWNlOiAoZXZlbnQpIC0+XG5cbiAgICByZXR1cm4gaWYgQGFscmVhZHlTYXZpbmdcblxuICAgIGlmIGV2ZW50LmtleUNvZGVcbiAgICAgIGlmIGV2ZW50LmtleUNvZGUgPT0gMjdcbiAgICAgICAgJChldmVudC50YXJnZXQpLmFmdGVyKEBvbGRUYXJnZXQpLnJlbW92ZSgpXG4gICAgICAgIHJldHVyblxuICAgICAgZWxzZSBpZiBldmVudC5rZXlDb2RlICE9IDEzXG4gICAgICAgIHJldHVybiB0cnVlXG5cbiAgICBAYWxyZWFkeVNhdmluZyA9IHRydWVcbiAgICAkdGFyZ2V0ICAgPSAkKGV2ZW50LnRhcmdldClcbiAgICBhdHRyaWJ1dGUgPSAkdGFyZ2V0LmF0dHIoXCJkYXRhLWF0dHJpYnV0ZVwiKVxuICAgIHZhbHVlICAgICA9ICR0YXJnZXQudmFsKClcblxuICAgIHVwZGF0ZWRBdHRyaWJ1dGVzICAgICAgICAgICAgPSB7fVxuICAgIHVwZGF0ZWRBdHRyaWJ1dGVzW2F0dHJpYnV0ZV0gPSB2YWx1ZVxuXG4gICAgVGFuZ2VyaW5lLnNldHRpbmdzLnNhdmUgdXBkYXRlZEF0dHJpYnV0ZXMsXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBAYWxyZWFkeVNhdmluZyA9IGZhbHNlXG4gICAgICAgIFV0aWxzLnRvcEFsZXJ0KFwiU2F2ZWRcIilcbiAgICAgICAgJHRhcmdldC5hZnRlcihAb2xkVGFyZ2V0Lmh0bWwodmFsdWUpKS5yZW1vdmUoKVxuICAgICAgZXJyb3I6ID0+XG4gICAgICAgIEBhbHJlYWR5U2F2aW5nID0gZmFsc2VcbiAgICAgICAgVXRpbHMudG9wQWxlcnQoXCJTYXZlIGVycm9yXCIpXG4gICAgICAgICR0YXJnZXQuYWZ0ZXIoQG9sZFRhcmdldCkucmVtb3ZlKClcblxuICByZXN1bHRzOiAtPiBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiZGFzaGJvYXJkXCIsIHRydWVcblxuICB1bml2ZXJzYWxVcGxvYWQ6IC0+IFV0aWxzLnVuaXZlcnNhbFVwbG9hZCgpXG5cbiAgYXBrOiAtPlxuICAgIFRhbmdlcmluZVRyZWUubWFrZVxuICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKVxuICAgICAgICBhLmhyZWYgPSBUYW5nZXJpbmUuc2V0dGluZ3MuY29uZmlnLmdldChcInRyZWVcIilcbiAgICAgICAgVXRpbHMuc3RpY2t5KFwiPGgxPkFQSyBsaW5rPC9oMT48cD4je2EuaG9zdH0vdHJlZS8je2RhdGEudG9rZW59PC9wPlwiKVxuICAgICAgZXJyb3I6ICh4aHIsIHJlc3BvbnNlKSAtPlxuICAgICAgICBVdGlscy5zdGlja3kgcmVzcG9uc2UubWVzc2FnZVxuXG4gIGdvdG9Hcm91cHM6IC0+IFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJncm91cHNcIiwgdHJ1ZVxuXG4gIGltcG9ydDogICAgIC0+IFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJpbXBvcnRcIiwgdHJ1ZVxuXG4gIGkxOG46IC0+XG4gICAgQHRleHQgPVxuICAgICAgXCJuZXdcIiAgICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24ubmV3XCIpXG4gICAgICBpbXBvcnQgICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24uaW1wb3J0XCIpXG4gICAgICBhcGsgICAgICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24uYXBrXCIpXG4gICAgICBncm91cHMgICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24uZ3JvdXBzXCIpXG4gICAgICB1bml2ZXJzYWxfdXBsb2FkIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24udW5pdmVyc2FsX3VwbG9hZFwiKVxuICAgICAgc3luY190YWJsZXRzICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLnN5bmNfdGFibGV0c1wiKVxuICAgICAgcmVzdWx0cyAgICAgICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLnJlc3VsdHNcIilcbiAgICAgIHNhdmUgICAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5zYXZlXCIpXG4gICAgICBjYW5jZWwgICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24uY2FuY2VsXCIpXG4gICAgICBhc3Nlc3NtZW50ICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcubGFiZWwuYXNzZXNzbWVudFwiKVxuICAgICAgYXNzZXNzbWVudHMgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmxhYmVsLmFzc2Vzc21lbnRzXCIpXG4gICAgICBjdXJyaWN1bHVtICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcubGFiZWwuY3VycmljdWx1bVwiKVxuXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICBAaTE4bigpXG5cbiAgICBAW2tleV0gPSB2YWx1ZSBmb3Iga2V5LCB2YWx1ZSBvZiBvcHRpb25zXG5cbiAgICBAYXNzZXNzbWVudHMuZWFjaCAoYXNzZXNzbWVudCkgPT4gYXNzZXNzbWVudC5vbiBcIm5ld1wiLCBAYWRkQXNzZXNzbWVudFxuICAgIEBjdXJyaWN1bGEuZWFjaCAgIChjdXJyaWN1bHVtKSA9PiBjdXJyaWN1bHVtLm9uIFwibmV3XCIsIEBhZGRDdXJyaWN1bHVtXG5cbiAgICBAY3VycmljdWxhTGlzdFZpZXcgPSBuZXcgQ3VycmljdWxhTGlzdFZpZXdcbiAgICAgIFwiY3VycmljdWxhXCIgOiBAY3VycmljdWxhXG5cbiAgICBAYXNzZXNzbWVudHNWaWV3ID0gbmV3IEFzc2Vzc21lbnRzVmlld1xuICAgICAgXCJhc3Nlc3NtZW50c1wiIDogQGFzc2Vzc21lbnRzXG4gICAgICBcInBhcmVudFwiICAgICAgOiBAXG5cbiAgICBAdXNlcnNNZW51VmlldyA9IG5ldyBVc2Vyc01lbnVWaWV3XG5cblxuICByZW5kZXI6ID0+XG5cbiAgICBpc0FkbWluID0gVGFuZ2VyaW5lLnVzZXIuaXNBZG1pbigpXG5cbiAgICBuZXdCdXR0b24gICAgID0gXCI8YnV0dG9uIGNsYXNzPSduZXcgY29tbWFuZCc+I3tAdGV4dC5uZXd9PC9idXR0b24+XCJcbiAgICBpbXBvcnRCdXR0b24gID0gXCI8YnV0dG9uIGNsYXNzPSdpbXBvcnQgY29tbWFuZCc+I3tAdGV4dC5pbXBvcnR9PC9idXR0b24+XCJcbiAgICBhcGtCdXR0b24gICAgID0gXCI8YnV0dG9uIGNsYXNzPSdhcGsgbmF2aWdhdGlvbic+I3tAdGV4dC5hcGt9PC9idXR0b24+XCJcbiAgICBncm91cHNCdXR0b24gID0gXCI8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIGdyb3Vwcyc+I3tAdGV4dC5ncm91cHN9PC9idXR0b24+XCJcbiAgICB1cGxvYWRCdXR0b24gID0gXCI8YnV0dG9uIGNsYXNzPSdjb21tYW5kIHVuaXZlcnNhbF91cGxvYWQnPiN7QHRleHQudW5pdmVyc2FsX3VwbG9hZH08L2J1dHRvbj5cIlxuICAgIHN5bmNUYWJsZXRzQnV0dG9uID0gXCI8YnV0dG9uIGNsYXNzPSdjb21tYW5kIHN5bmNfdGFibGV0cyc+I3tAdGV4dC5zeW5jX3RhYmxldHN9PC9idXR0b24+XCJcbiAgICByZXN1bHRzQnV0dG9uID0gXCI8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIHJlc3VsdHMnPiN7QHRleHQucmVzdWx0c308L2J1dHRvbj5cIlxuICAgIGdyb3VwSGFuZGxlICAgPSBcIjxoMiBjbGFzcz0nc2V0dGluZ3MgZ3JleScgZGF0YS1hdHRyaWJ0dWU9J2dyb3VwSGFuZGxlJz4je1RhbmdlcmluZS5zZXR0aW5ncy5nZXRFc2NhcGVkU3RyaW5nKCdncm91cEhhbmRsZScpIHx8IFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoJ2dyb3VwTmFtZScpfTwvaDI+XCJcblxuXG4gICAgY29udGFpbmVycyA9IFtdXG4gICAgY29udGFpbmVycy5wdXNoIFwiPHNlY3Rpb24gaWQ9J2N1cnJpY3VsYV9jb250YWluZXInIGNsYXNzPSdDdXJyaWN1bGFMaXN0Vmlldyc+PC9zZWN0aW9uPlwiIGlmIEBjdXJyaWN1bGEubGVuZ3RoIGlzbnQgMFxuICAgIGNvbnRhaW5lcnMucHVzaCBcIjxzZWN0aW9uIGlkPSdrbGFzc19jb250YWluZXInIGNsYXNzPSdLbGFzc2VzVmlldyc+PC9zZWN0aW9uPlwiICAgICAgICAgaWYgQGtsYXNzZXMubGVuZ3RoIGlzbnQgMFxuICAgIGNvbnRhaW5lcnMucHVzaCBcIjxzZWN0aW9uIGlkPSd0ZWFjaGVyc19jb250YWluZXInIGNsYXNzPSdUZWFjaGVyc1ZpZXcnPjwvc2VjdGlvbj5cIiAgICAgaWYgQHRlYWNoZXJzLmxlbmd0aCBpc250IDBcbiAgICBjb250YWluZXJzLnB1c2ggXCI8c2VjdGlvbiBpZD0ndXNlcnNfbWVudV9jb250YWluZXInIGNsYXNzPSdVc2Vyc01lbnVWaWV3Jz48L3NlY3Rpb24+XCJcbiAgICBjb250YWluZXJzLnB1c2ggXCI8c2VjdGlvbiBpZD0nd29ya2Zsb3dfbWVudV9jb250YWluZXInIGNsYXNzPSdXb3JrZmxvd01lbnVWaWV3Jz48L3NlY3Rpb24+XCJcblxuXG5cbiAgICBodG1sID0gXCJcbiAgICAgICN7Z3JvdXBzQnV0dG9ufVxuICAgICAgI3thcGtCdXR0b259XG4gICAgICAje3Jlc3VsdHNCdXR0b259XG4gICAgICAje2dyb3VwSGFuZGxlfVxuICAgICAgPHNlY3Rpb24+XG4gICAgICAgIDxoMT4je0B0ZXh0LmFzc2Vzc21lbnRzfTwvaDE+XG4gICAgXCJcblxuICAgIGlmIGlzQWRtaW5cbiAgICAgIGh0bWwgKz0gXCJcbiAgICAgICAgICAje25ld0J1dHRvbn1cbiAgICAgICAgICAje2ltcG9ydEJ1dHRvbn1cblxuICAgICAgICAgIDxkaXYgY2xhc3M9J25ld19mb3JtIGNvbmZpcm1hdGlvbic+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSd0ZXh0JyBjbGFzcz0nbmV3X25hbWUnIHBsYWNlaG9sZGVyPSdOYW1lJz5cbiAgICAgICAgICAgICAgPHNlbGVjdCBpZD0nbmV3X3R5cGUnPlxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9J2Fzc2Vzc21lbnQnPiN7QHRleHQuYXNzZXNzbWVudH08L29wdGlvbj5cbiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSdjdXJyaWN1bHVtJz4je0B0ZXh0LmN1cnJpY3VsdW19PC9vcHRpb24+XG4gICAgICAgICAgICAgIDwvc2VsZWN0Pjxicj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nbmV3X3NhdmUgY29tbWFuZCc+I3tAdGV4dC5zYXZlfTwvYnV0dG9uPiA8YnV0dG9uIGNsYXNzPSduZXdfY2FuY2VsIGNvbW1hbmQnPiN7QHRleHQuY2FuY2VsfTwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBpZD0nYXNzZXNzbWVudHNfY29udGFpbmVyJz48L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgICN7Y29udGFpbmVycy5qb2luKCcnKX1cblxuICAgICAgXCJcbiAgICBlbHNlXG4gICAgICBodG1sICs9IFwiXG4gICAgICAgIDxkaXYgaWQ9J2Fzc2Vzc21lbnRzX2NvbnRhaW5lcic+PC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgICBcIlxuXG4gICAgQCRlbC5odG1sIGh0bWxcblxuICAgIEBhc3Nlc3NtZW50c1ZpZXcuc2V0RWxlbWVudCggQCRlbC5maW5kKFwiI2Fzc2Vzc21lbnRzX2NvbnRhaW5lclwiKSApXG4gICAgQGFzc2Vzc21lbnRzVmlldy5yZW5kZXIoKVxuXG4gICAgQGN1cnJpY3VsYUxpc3RWaWV3LnNldEVsZW1lbnQoIEAkZWwuZmluZChcIiNjdXJyaWN1bGFfY29udGFpbmVyXCIpIClcbiAgICBAY3VycmljdWxhTGlzdFZpZXcucmVuZGVyKClcblxuICAgIEB1c2Vyc01lbnVWaWV3LnNldEVsZW1lbnQoIEAkZWwuZmluZChcIiN1c2Vyc19tZW51X2NvbnRhaW5lclwiKSApXG4gICAgQHVzZXJzTWVudVZpZXcucmVuZGVyKClcblxuICAgIGlmIEBrbGFzc2VzLmxlbmd0aCA+IDBcbiAgICAgIEBrbGFzc2VzVmlldyA9IG5ldyBLbGFzc2VzVmlld1xuICAgICAgICBrbGFzc2VzIDogQGtsYXNzZXNcbiAgICAgICAgY3VycmljdWxhIDogQGN1cnJpY3VsYVxuICAgICAgICB0ZWFjaGVycyA6IEB0ZWFjaGVyc1xuICAgICAgQGtsYXNzZXNWaWV3LnNldEVsZW1lbnQgQCRlbC5maW5kKFwiI2tsYXNzX2NvbnRhaW5lclwiKVxuICAgICAgQGtsYXNzZXNWaWV3LnJlbmRlcigpXG4gICAgZWxzZVxuICAgICAgQCRlbC5maW5kKFwiI2tsYXNzX2NvbnRhaW5lclwiKS5yZW1vdmUoKVxuXG5cbiAgICBpZiBAdGVhY2hlcnMubGVuZ3RoID4gMFxuICAgICAgQHRlYWNoZXJzVmlldyA9IG5ldyBUZWFjaGVyc1ZpZXdcbiAgICAgICAgdGVhY2hlcnMgOiBAdGVhY2hlcnNcbiAgICAgICAgdXNlcnMgOiBAdXNlcnNcbiAgICAgIEB0ZWFjaGVyc1ZpZXcuc2V0RWxlbWVudCBAJGVsLmZpbmQoXCIjdGVhY2hlcnNfY29udGFpbmVyXCIpXG4gICAgICBAdGVhY2hlcnNWaWV3LnJlbmRlcigpXG4gICAgZWxzZVxuICAgICAgQCRlbC5maW5kKFwiI3RlYWNoZXJzX2NvbnRhaW5lclwiKS5yZW1vdmUoKVxuXG4gICAgaWYgVGFuZ2VyaW5lLnNldHRpbmdzLmdldCgnc2hvd1dvcmtmbG93cycpID09IHRydWVcbiAgICAgIEB3b3JrZmxvd01lbnVWaWV3ID0gbmV3IFdvcmtmbG93TWVudVZpZXdcbiAgICAgICAgd29ya2Zsb3dzIDogQHdvcmtmbG93c1xuICAgICAgICBmZWVkYmFja3MgOiBAZmVlZGJhY2tzXG4gICAgICBAd29ya2Zsb3dNZW51Vmlldy5zZXRFbGVtZW50IEAkZWwuZmluZChcIiN3b3JrZmxvd19tZW51X2NvbnRhaW5lclwiKVxuICAgICAgQHdvcmtmbG93TWVudVZpZXcucmVuZGVyKClcblxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgICByZXR1cm5cblxuXG4gIGFkZEFzc2Vzc21lbnQ6IChuZXdPbmUpID0+XG4gICAgQGFzc2Vzc21lbnRzLmFkZCBuZXdPbmVcbiAgICBuZXdPbmUub24gXCJuZXdcIiwgQGFkZEFzc2Vzc21lbnRcblxuICBhZGRDdXJyaWN1bHVtOiAobmV3T25lKSA9PlxuICAgIEBjdXJyaWN1bGEuYWRkIG5ld09uZVxuICAgIG5ld09uZS5vbiBcIm5ld1wiLCBAYWRkQ3VycmljdWx1bVxuXG4gICMgTWFraW5nIGEgbmV3IGFzc2Vzc21lbnRcbiAgbmV3VG9nZ2xlOiAtPiBAJGVsLmZpbmQoJy5uZXdfZm9ybSwgLm5ldycpLnRvZ2dsZSgpOyBmYWxzZVxuXG4gIG5ld1NhdmU6IChldmVudCkgPT5cblxuICAgICMgdGhpcyBoYW5kbGVzIGFtYmlndW91cyBldmVudHNcbiAgICAjIHRoZSBpZGVhIGlzIHRvIHN1cHBvcnQgY2xpY2tzIGFuZCB0aGUgZW50ZXIga2V5XG4gICAgIyBsb2dpYzpcbiAgICAjIGl0IGl0J3MgYSBrZXlzdHJva2UgYW5kIGl0J3Mgbm90IGVudGVyLCBhY3Qgbm9ybWFsbHksIGp1c3QgYSBrZXkgc3Ryb2tlXG4gICAgIyBpZiBpdCdzIGEgY2xpY2sgb3IgZW50ZXIsIHByb2Nlc3MgdGhlIGZvcm1cblxuICAgIGlmIGV2ZW50LnR5cGUgIT0gXCJjbGlja1wiICYmIGV2ZW50LndoaWNoICE9IDEzXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgbmFtZSAgICA9IEAkZWwuZmluZCgnLm5ld19uYW1lJykudmFsKClcbiAgICBuZXdUeXBlID0gQCRlbC5maW5kKFwiI25ld190eXBlIG9wdGlvbjpzZWxlY3RlZFwiKS52YWwoKVxuICAgIG5ld0lkICAgPSBVdGlscy5ndWlkKClcblxuICAgIGlmIG5hbWUubGVuZ3RoID09IDBcbiAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiPHNwYW4gY2xhc3M9J2Vycm9yJz5Db3VsZCBub3Qgc2F2ZSA8aW1nIHNyYz0naW1hZ2VzL2ljb25fY2xvc2UucG5nJyBjbGFzcz0nY2xlYXJfbWVzc2FnZSc+PC9zcGFuPlwiXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIGlmIG5ld1R5cGUgPT0gXCJhc3Nlc3NtZW50XCJcbiAgICAgIG5ld09iamVjdCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgIFwibmFtZVwiICAgICAgICAgOiBuYW1lXG4gICAgICAgIFwiX2lkXCIgICAgICAgICAgOiBuZXdJZFxuICAgICAgICBcImFzc2Vzc21lbnRJZFwiIDogbmV3SWRcbiAgICAgICAgXCJhcmNoaXZlZFwiICAgICA6IGZhbHNlXG4gICAgICBjYWxsYmFjayA9IEBhZGRBc3Nlc3NtZW50XG4gICAgZWxzZSBpZiBuZXdUeXBlID09IFwiY3VycmljdWx1bVwiXG4gICAgICBuZXdPYmplY3QgPSBuZXcgQ3VycmljdWx1bVxuICAgICAgICBcIm5hbWVcIiAgICAgICAgIDogbmFtZVxuICAgICAgICBcIl9pZFwiICAgICAgICAgIDogbmV3SWRcbiAgICAgICAgXCJjdXJyaWN1bHVtSWRcIiA6IG5ld0lkXG4gICAgICBjYWxsYmFjayA9IEBhZGRDdXJyaWN1bHVtXG5cbiAgICBuZXdPYmplY3Quc2F2ZSBudWxsLFxuICAgICAgc3VjY2VzcyA6ID0+XG4gICAgICAgIGNhbGxiYWNrKG5ld09iamVjdClcbiAgICAgICAgQCRlbC5maW5kKCcubmV3X2Zvcm0sIC5uZXcnKS50b2dnbGUoKVxuICAgICAgICBAJGVsLmZpbmQoJy5uZXdfbmFtZScpLnZhbCBcIlwiXG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiI3tuYW1lfSBzYXZlZFwiXG4gICAgICBlcnJvcjogPT5cbiAgICAgICAgQCRlbC5maW5kKCcubmV3X2Zvcm0sIC5uZXcnKS50b2dnbGUoKVxuICAgICAgICBAJGVsLmZpbmQoJy5uZXdfbmFtZScpLnZhbCBcIlwiXG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiUGxlYXNlIHRyeSBhZ2Fpbi4gRXJyb3Igc2F2aW5nLlwiXG5cbiAgICByZXR1cm4gZmFsc2VcblxuICAjIFZpZXdNYW5hZ2VyXG4gIGNsb3NlVmlld3M6IC0+XG4gICAgQGFzc2Vzc21lbnRzVmlldy5jbG9zZSgpXG4gICAgQGN1cnJpY3VsYUxpc3RWaWV3LmNsb3NlKClcblxuICBvbkNsb3NlOiAtPlxuICAgIEBjbG9zZVZpZXdzKClcbiJdfQ==
