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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2Vzc21lbnQvQXNzZXNzbWVudHNNZW51Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxtQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7OztnQ0FFSixTQUFBLEdBQVc7O2dDQUVYLE1BQUEsR0FDRTtJQUFBLG9CQUFBLEVBQXVCLFNBQXZCO0lBQ0EsaUJBQUEsRUFBdUIsU0FEdkI7SUFFQSxtQkFBQSxFQUF1QixXQUZ2QjtJQUdBLFlBQUEsRUFBdUIsV0FIdkI7SUFJQSxlQUFBLEVBQXVCLFFBSnZCO0lBS0EsWUFBQSxFQUF1QixLQUx2QjtJQU1BLGVBQUEsRUFBdUIsWUFOdkI7SUFPQSx5QkFBQSxFQUE0QixpQkFQNUI7SUFTQSxxQkFBQSxFQUF3QixhQVR4QjtJQVdBLGdCQUFBLEVBQTBCLFNBWDFCO0lBWUEsaUJBQUEsRUFBMEIsYUFaMUI7SUFhQSxzQkFBQSxFQUEwQixhQWIxQjtJQWNBLHVCQUFBLEVBQTJCLGFBZDNCOzs7Z0NBZ0JGLFdBQUEsR0FBYSxTQUFBO1dBQ1gsSUFBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQUE7RUFEVzs7Z0NBR2IsV0FBQSxHQUFhLFNBQUMsS0FBRDtBQUNYLFFBQUE7SUFBQSxJQUFBLENBQWMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFmLENBQUEsQ0FBZDtBQUFBLGFBQUE7O0lBQ0EsT0FBQSxHQUFhLENBQUEsQ0FBRSxLQUFLLENBQUMsTUFBUjtJQUNiLFNBQUEsR0FBYSxPQUFPLENBQUMsSUFBUixDQUFhLGdCQUFiO0lBQ2IsSUFBQyxDQUFBLFNBQUQsR0FBYSxPQUFPLENBQUMsS0FBUixDQUFBO0lBQ2IsT0FBQSxHQUFVLE9BQU8sQ0FBQyxJQUFSLENBQWEsT0FBYixDQUFxQixDQUFDLE9BQXRCLENBQThCLFVBQTlCLEVBQXlDLEVBQXpDO0lBQ1YsT0FBQSxHQUFVLE9BQU8sQ0FBQyxHQUFSLENBQVksUUFBWjtJQUNWLE9BQU8sQ0FBQyxLQUFSLENBQWMsbUNBQUEsR0FB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LEtBQUssQ0FBQyxRQUFOLENBQWUsaUNBQWY7UUFISztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FMUDtLQURGO0FBV0EsV0FBTztFQTVDQTs7Z0NBK0NULFVBQUEsR0FBWSxTQUFBO0lBQ1YsSUFBQyxDQUFBLGVBQWUsQ0FBQyxLQUFqQixDQUFBO1dBQ0EsSUFBQyxDQUFBLGlCQUFpQixDQUFDLEtBQW5CLENBQUE7RUFGVTs7Z0NBSVosT0FBQSxHQUFTLFNBQUE7V0FDUCxJQUFDLENBQUEsVUFBRCxDQUFBO0VBRE87Ozs7R0FsUnVCLFFBQVEsQ0FBQyIsImZpbGUiOiJhc3Nlc3NtZW50L0Fzc2Vzc21lbnRzTWVudVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBBc3Nlc3NtZW50c01lbnVWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJBc3Nlc3NtZW50c01lbnVWaWV3XCJcblxuICBldmVudHM6XG4gICAgJ2tleXByZXNzIC5uZXdfbmFtZScgOiAnbmV3U2F2ZSdcbiAgICAnY2xpY2sgLm5ld19zYXZlJyAgICA6ICduZXdTYXZlJ1xuICAgICdjbGljayAubmV3X2NhbmNlbCcgIDogJ25ld1RvZ2dsZSdcbiAgICAnY2xpY2sgLm5ldycgICAgICAgICA6ICduZXdUb2dnbGUnXG4gICAgJ2NsaWNrIC5pbXBvcnQnICAgICAgOiAnaW1wb3J0J1xuICAgICdjbGljayAuYXBrJyAgICAgICAgIDogJ2FwaydcbiAgICAnY2xpY2sgLmdyb3VwcycgICAgICA6ICdnb3RvR3JvdXBzJ1xuICAgICdjbGljayAudW5pdmVyc2FsX3VwbG9hZCcgOiAndW5pdmVyc2FsVXBsb2FkJ1xuXG4gICAgJ2NsaWNrIC5zeW5jX3RhYmxldHMnIDogJ3N5bmNUYWJsZXRzJ1xuXG4gICAgJ2NsaWNrIC5yZXN1bHRzJyAgICAgICAgOiAncmVzdWx0cydcbiAgICAnY2xpY2sgLnNldHRpbmdzJyAgICAgICA6ICdlZGl0SW5QbGFjZSdcbiAgICAna2V5dXAgLmVkaXRfaW5fcGxhY2UnICA6ICdzYXZlSW5QbGFjZSdcbiAgICAnY2hhbmdlIC5lZGl0X2luX3BsYWNlJyAgOiAnc2F2ZUluUGxhY2UnXG5cbiAgc3luY1RhYmxldHM6ID0+XG4gICAgQHRhYmxldE1hbmFnZXIuc3luYygpXG5cbiAgZWRpdEluUGxhY2U6IChldmVudCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKVxuICAgICR0YXJnZXQgICAgPSAkKGV2ZW50LnRhcmdldClcbiAgICBhdHRyaWJ1dGUgID0gJHRhcmdldC5hdHRyKFwiZGF0YS1hdHRyaWJ0dWVcIilcbiAgICBAb2xkVGFyZ2V0ID0gJHRhcmdldC5jbG9uZSgpXG4gICAgY2xhc3NlcyA9ICR0YXJnZXQuYXR0cihcImNsYXNzXCIpLnJlcGxhY2UoXCJzZXR0aW5nc1wiLFwiXCIpXG4gICAgbWFyZ2lucyA9ICR0YXJnZXQuY3NzKFwibWFyZ2luXCIpXG4gICAgJHRhcmdldC5hZnRlcihcIjxpbnB1dCB0eXBlPSd0ZXh0JyBzdHlsZT0nbWFyZ2luOiN7bWFyZ2luc307JyBkYXRhLWF0dHJpYnV0ZT0nI3thdHRyaWJ1dGV9JyBjbGFzcz0nZWRpdF9pbl9wbGFjZSAje2NsYXNzZXN9JyB2YWx1ZT0nI3tfLmVzY2FwZSgkdGFyZ2V0Lmh0bWwoKSl9Jz5cIilcbiAgICBpbnB1dCA9ICR0YXJnZXQubmV4dCgpLmZvY3VzKClcbiAgICAkdGFyZ2V0LnJlbW92ZSgpXG5cbiAgc2F2ZUluUGxhY2U6IChldmVudCkgLT5cblxuICAgIHJldHVybiBpZiBAYWxyZWFkeVNhdmluZ1xuXG4gICAgaWYgZXZlbnQua2V5Q29kZVxuICAgICAgaWYgZXZlbnQua2V5Q29kZSA9PSAyN1xuICAgICAgICAkKGV2ZW50LnRhcmdldCkuYWZ0ZXIoQG9sZFRhcmdldCkucmVtb3ZlKClcbiAgICAgICAgcmV0dXJuXG4gICAgICBlbHNlIGlmIGV2ZW50LmtleUNvZGUgIT0gMTNcbiAgICAgICAgcmV0dXJuIHRydWVcblxuICAgIEBhbHJlYWR5U2F2aW5nID0gdHJ1ZVxuICAgICR0YXJnZXQgICA9ICQoZXZlbnQudGFyZ2V0KVxuICAgIGF0dHJpYnV0ZSA9ICR0YXJnZXQuYXR0cihcImRhdGEtYXR0cmlidXRlXCIpXG4gICAgdmFsdWUgICAgID0gJHRhcmdldC52YWwoKVxuXG4gICAgdXBkYXRlZEF0dHJpYnV0ZXMgICAgICAgICAgICA9IHt9XG4gICAgdXBkYXRlZEF0dHJpYnV0ZXNbYXR0cmlidXRlXSA9IHZhbHVlXG5cbiAgICBUYW5nZXJpbmUuc2V0dGluZ3Muc2F2ZSB1cGRhdGVkQXR0cmlidXRlcyxcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgIEBhbHJlYWR5U2F2aW5nID0gZmFsc2VcbiAgICAgICAgVXRpbHMudG9wQWxlcnQoXCJTYXZlZFwiKVxuICAgICAgICAkdGFyZ2V0LmFmdGVyKEBvbGRUYXJnZXQuaHRtbCh2YWx1ZSkpLnJlbW92ZSgpXG4gICAgICBlcnJvcjogPT5cbiAgICAgICAgQGFscmVhZHlTYXZpbmcgPSBmYWxzZVxuICAgICAgICBVdGlscy50b3BBbGVydChcIlNhdmUgZXJyb3JcIilcbiAgICAgICAgJHRhcmdldC5hZnRlcihAb2xkVGFyZ2V0KS5yZW1vdmUoKVxuXG4gIHJlc3VsdHM6IC0+IFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJkYXNoYm9hcmRcIiwgdHJ1ZVxuXG4gIHVuaXZlcnNhbFVwbG9hZDogLT4gVXRpbHMudW5pdmVyc2FsVXBsb2FkKClcblxuICBhcGs6IC0+XG4gICAgVGFuZ2VyaW5lVHJlZS5tYWtlXG4gICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpXG4gICAgICAgIGEuaHJlZiA9IFRhbmdlcmluZS5zZXR0aW5ncy5jb25maWcuZ2V0KFwidHJlZVwiKVxuICAgICAgICBVdGlscy5zdGlja3koXCI8aDE+QVBLIGxpbms8L2gxPjxwPiN7YS5ob3N0fS90cmVlLyN7ZGF0YS50b2tlbn08L3A+XCIpXG4gICAgICBlcnJvcjogKHhociwgcmVzcG9uc2UpIC0+XG4gICAgICAgIFV0aWxzLnN0aWNreSByZXNwb25zZS5tZXNzYWdlXG5cbiAgZ290b0dyb3VwczogLT4gVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImdyb3Vwc1wiLCB0cnVlXG5cbiAgaW1wb3J0OiAgICAgLT4gVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImltcG9ydFwiLCB0cnVlXG5cbiAgaTE4bjogLT5cbiAgICBAdGV4dCA9XG4gICAgICBcIm5ld1wiICAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5uZXdcIilcbiAgICAgIGltcG9ydCAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5pbXBvcnRcIilcbiAgICAgIGFwayAgICAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5hcGtcIilcbiAgICAgIGdyb3VwcyAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5ncm91cHNcIilcbiAgICAgIHVuaXZlcnNhbF91cGxvYWQgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi51bml2ZXJzYWxfdXBsb2FkXCIpXG4gICAgICBzeW5jX3RhYmxldHMgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24uc3luY190YWJsZXRzXCIpXG4gICAgICByZXN1bHRzICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24ucmVzdWx0c1wiKVxuICAgICAgc2F2ZSAgICAgICAgICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLnNhdmVcIilcbiAgICAgIGNhbmNlbCAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5jYW5jZWxcIilcbiAgICAgIGFzc2Vzc21lbnQgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5sYWJlbC5hc3Nlc3NtZW50XCIpXG4gICAgICBhc3Nlc3NtZW50cyA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcubGFiZWwuYXNzZXNzbWVudHNcIilcbiAgICAgIGN1cnJpY3VsdW0gIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5sYWJlbC5jdXJyaWN1bHVtXCIpXG5cblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgIEBpMThuKClcblxuICAgIEBba2V5XSA9IHZhbHVlIGZvciBrZXksIHZhbHVlIG9mIG9wdGlvbnNcblxuICAgIEBhc3Nlc3NtZW50cy5lYWNoIChhc3Nlc3NtZW50KSA9PiBhc3Nlc3NtZW50Lm9uIFwibmV3XCIsIEBhZGRBc3Nlc3NtZW50XG4gICAgQGN1cnJpY3VsYS5lYWNoICAgKGN1cnJpY3VsdW0pID0+IGN1cnJpY3VsdW0ub24gXCJuZXdcIiwgQGFkZEN1cnJpY3VsdW1cblxuICAgIEBjdXJyaWN1bGFMaXN0VmlldyA9IG5ldyBDdXJyaWN1bGFMaXN0Vmlld1xuICAgICAgXCJjdXJyaWN1bGFcIiA6IEBjdXJyaWN1bGFcblxuICAgIEBhc3Nlc3NtZW50c1ZpZXcgPSBuZXcgQXNzZXNzbWVudHNWaWV3XG4gICAgICBcImFzc2Vzc21lbnRzXCIgOiBAYXNzZXNzbWVudHNcbiAgICAgIFwicGFyZW50XCIgICAgICA6IEBcblxuICAgIEB1c2Vyc01lbnVWaWV3ID0gbmV3IFVzZXJzTWVudVZpZXdcblxuXG4gIHJlbmRlcjogPT5cblxuICAgIGlzQWRtaW4gPSBUYW5nZXJpbmUudXNlci5pc0FkbWluKClcblxuICAgIG5ld0J1dHRvbiAgICAgPSBcIjxidXR0b24gY2xhc3M9J25ldyBjb21tYW5kJz4je0B0ZXh0Lm5ld308L2J1dHRvbj5cIlxuICAgIGltcG9ydEJ1dHRvbiAgPSBcIjxidXR0b24gY2xhc3M9J2ltcG9ydCBjb21tYW5kJz4je0B0ZXh0LmltcG9ydH08L2J1dHRvbj5cIlxuICAgIGFwa0J1dHRvbiAgICAgPSBcIjxidXR0b24gY2xhc3M9J2FwayBuYXZpZ2F0aW9uJz4je0B0ZXh0LmFwa308L2J1dHRvbj5cIlxuICAgIGdyb3Vwc0J1dHRvbiAgPSBcIjxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gZ3JvdXBzJz4je0B0ZXh0Lmdyb3Vwc308L2J1dHRvbj5cIlxuICAgIHVwbG9hZEJ1dHRvbiAgPSBcIjxidXR0b24gY2xhc3M9J2NvbW1hbmQgdW5pdmVyc2FsX3VwbG9hZCc+I3tAdGV4dC51bml2ZXJzYWxfdXBsb2FkfTwvYnV0dG9uPlwiXG4gICAgc3luY1RhYmxldHNCdXR0b24gPSBcIjxidXR0b24gY2xhc3M9J2NvbW1hbmQgc3luY190YWJsZXRzJz4je0B0ZXh0LnN5bmNfdGFibGV0c308L2J1dHRvbj5cIlxuICAgIHJlc3VsdHNCdXR0b24gPSBcIjxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gcmVzdWx0cyc+I3tAdGV4dC5yZXN1bHRzfTwvYnV0dG9uPlwiXG4gICAgZ3JvdXBIYW5kbGUgICA9IFwiPGgyIGNsYXNzPSdzZXR0aW5ncyBncmV5JyBkYXRhLWF0dHJpYnR1ZT0nZ3JvdXBIYW5kbGUnPiN7VGFuZ2VyaW5lLnNldHRpbmdzLmdldEVzY2FwZWRTdHJpbmcoJ2dyb3VwSGFuZGxlJykgfHwgVGFuZ2VyaW5lLnNldHRpbmdzLmdldCgnZ3JvdXBOYW1lJyl9PC9oMj5cIlxuXG5cbiAgICBjb250YWluZXJzID0gW11cbiAgICBjb250YWluZXJzLnB1c2ggXCI8c2VjdGlvbiBpZD0nY3VycmljdWxhX2NvbnRhaW5lcicgY2xhc3M9J0N1cnJpY3VsYUxpc3RWaWV3Jz48L3NlY3Rpb24+XCIgaWYgQGN1cnJpY3VsYS5sZW5ndGggaXNudCAwXG4gICAgY29udGFpbmVycy5wdXNoIFwiPHNlY3Rpb24gaWQ9J2tsYXNzX2NvbnRhaW5lcicgY2xhc3M9J0tsYXNzZXNWaWV3Jz48L3NlY3Rpb24+XCIgICAgICAgICBpZiBAa2xhc3Nlcy5sZW5ndGggaXNudCAwXG4gICAgY29udGFpbmVycy5wdXNoIFwiPHNlY3Rpb24gaWQ9J3RlYWNoZXJzX2NvbnRhaW5lcicgY2xhc3M9J1RlYWNoZXJzVmlldyc+PC9zZWN0aW9uPlwiICAgICBpZiBAdGVhY2hlcnMubGVuZ3RoIGlzbnQgMFxuICAgIGNvbnRhaW5lcnMucHVzaCBcIjxzZWN0aW9uIGlkPSd1c2Vyc19tZW51X2NvbnRhaW5lcicgY2xhc3M9J1VzZXJzTWVudVZpZXcnPjwvc2VjdGlvbj5cIlxuXG5cblxuICAgIGh0bWwgPSBcIlxuICAgICAgI3tncm91cHNCdXR0b259XG4gICAgICAje2Fwa0J1dHRvbn1cbiAgICAgICN7cmVzdWx0c0J1dHRvbn1cbiAgICAgICN7Z3JvdXBIYW5kbGV9XG4gICAgICA8c2VjdGlvbj5cbiAgICAgICAgPGgxPiN7QHRleHQuYXNzZXNzbWVudHN9PC9oMT5cbiAgICBcIlxuXG4gICAgaWYgaXNBZG1pblxuICAgICAgaHRtbCArPSBcIlxuICAgICAgICAgICN7bmV3QnV0dG9ufVxuICAgICAgICAgICN7aW1wb3J0QnV0dG9ufVxuXG4gICAgICAgICAgPGRpdiBjbGFzcz0nbmV3X2Zvcm0gY29uZmlybWF0aW9uJz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9J3RleHQnIGNsYXNzPSduZXdfbmFtZScgcGxhY2Vob2xkZXI9J05hbWUnPlxuICAgICAgICAgICAgICA8c2VsZWN0IGlkPSduZXdfdHlwZSc+XG4gICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0nYXNzZXNzbWVudCc+I3tAdGV4dC5hc3Nlc3NtZW50fTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9J2N1cnJpY3VsdW0nPiN7QHRleHQuY3VycmljdWx1bX08L29wdGlvbj5cbiAgICAgICAgICAgICAgPC9zZWxlY3Q+PGJyPlxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduZXdfc2F2ZSBjb21tYW5kJz4je0B0ZXh0LnNhdmV9PC9idXR0b24+IDxidXR0b24gY2xhc3M9J25ld19jYW5jZWwgY29tbWFuZCc+I3tAdGV4dC5jYW5jZWx9PC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGlkPSdhc3Nlc3NtZW50c19jb250YWluZXInPjwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgI3tjb250YWluZXJzLmpvaW4oJycpfVxuXG4gICAgICBcIlxuICAgIGVsc2VcbiAgICAgIGh0bWwgKz0gXCJcbiAgICAgICAgPGRpdiBpZD0nYXNzZXNzbWVudHNfY29udGFpbmVyJz48L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cbiAgICAgIFwiXG5cbiAgICBAJGVsLmh0bWwgaHRtbFxuXG4gICAgQGFzc2Vzc21lbnRzVmlldy5zZXRFbGVtZW50KCBAJGVsLmZpbmQoXCIjYXNzZXNzbWVudHNfY29udGFpbmVyXCIpIClcbiAgICBAYXNzZXNzbWVudHNWaWV3LnJlbmRlcigpXG5cbiAgICBAY3VycmljdWxhTGlzdFZpZXcuc2V0RWxlbWVudCggQCRlbC5maW5kKFwiI2N1cnJpY3VsYV9jb250YWluZXJcIikgKVxuICAgIEBjdXJyaWN1bGFMaXN0Vmlldy5yZW5kZXIoKVxuXG4gICAgQHVzZXJzTWVudVZpZXcuc2V0RWxlbWVudCggQCRlbC5maW5kKFwiI3VzZXJzX21lbnVfY29udGFpbmVyXCIpIClcbiAgICBAdXNlcnNNZW51Vmlldy5yZW5kZXIoKVxuXG4gICAgaWYgQGtsYXNzZXMubGVuZ3RoID4gMFxuICAgICAgQGtsYXNzZXNWaWV3ID0gbmV3IEtsYXNzZXNWaWV3XG4gICAgICAgIGtsYXNzZXMgOiBAa2xhc3Nlc1xuICAgICAgICBjdXJyaWN1bGEgOiBAY3VycmljdWxhXG4gICAgICAgIHRlYWNoZXJzIDogQHRlYWNoZXJzXG4gICAgICBAa2xhc3Nlc1ZpZXcuc2V0RWxlbWVudCBAJGVsLmZpbmQoXCIja2xhc3NfY29udGFpbmVyXCIpXG4gICAgICBAa2xhc3Nlc1ZpZXcucmVuZGVyKClcbiAgICBlbHNlXG4gICAgICBAJGVsLmZpbmQoXCIja2xhc3NfY29udGFpbmVyXCIpLnJlbW92ZSgpXG5cblxuICAgIGlmIEB0ZWFjaGVycy5sZW5ndGggPiAwXG4gICAgICBAdGVhY2hlcnNWaWV3ID0gbmV3IFRlYWNoZXJzVmlld1xuICAgICAgICB0ZWFjaGVycyA6IEB0ZWFjaGVyc1xuICAgICAgICB1c2VycyA6IEB1c2Vyc1xuICAgICAgQHRlYWNoZXJzVmlldy5zZXRFbGVtZW50IEAkZWwuZmluZChcIiN0ZWFjaGVyc19jb250YWluZXJcIilcbiAgICAgIEB0ZWFjaGVyc1ZpZXcucmVuZGVyKClcbiAgICBlbHNlXG4gICAgICBAJGVsLmZpbmQoXCIjdGVhY2hlcnNfY29udGFpbmVyXCIpLnJlbW92ZSgpXG5cblxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgICByZXR1cm5cblxuXG4gIGFkZEFzc2Vzc21lbnQ6IChuZXdPbmUpID0+XG4gICAgQGFzc2Vzc21lbnRzLmFkZCBuZXdPbmVcbiAgICBuZXdPbmUub24gXCJuZXdcIiwgQGFkZEFzc2Vzc21lbnRcblxuICBhZGRDdXJyaWN1bHVtOiAobmV3T25lKSA9PlxuICAgIEBjdXJyaWN1bGEuYWRkIG5ld09uZVxuICAgIG5ld09uZS5vbiBcIm5ld1wiLCBAYWRkQ3VycmljdWx1bVxuXG4gICMgTWFraW5nIGEgbmV3IGFzc2Vzc21lbnRcbiAgbmV3VG9nZ2xlOiAtPiBAJGVsLmZpbmQoJy5uZXdfZm9ybSwgLm5ldycpLnRvZ2dsZSgpOyBmYWxzZVxuXG4gIG5ld1NhdmU6IChldmVudCkgPT5cblxuICAgICMgdGhpcyBoYW5kbGVzIGFtYmlndW91cyBldmVudHNcbiAgICAjIHRoZSBpZGVhIGlzIHRvIHN1cHBvcnQgY2xpY2tzIGFuZCB0aGUgZW50ZXIga2V5XG4gICAgIyBsb2dpYzpcbiAgICAjIGl0IGl0J3MgYSBrZXlzdHJva2UgYW5kIGl0J3Mgbm90IGVudGVyLCBhY3Qgbm9ybWFsbHksIGp1c3QgYSBrZXkgc3Ryb2tlXG4gICAgIyBpZiBpdCdzIGEgY2xpY2sgb3IgZW50ZXIsIHByb2Nlc3MgdGhlIGZvcm1cblxuICAgIGlmIGV2ZW50LnR5cGUgIT0gXCJjbGlja1wiICYmIGV2ZW50LndoaWNoICE9IDEzXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgbmFtZSAgICA9IEAkZWwuZmluZCgnLm5ld19uYW1lJykudmFsKClcbiAgICBuZXdUeXBlID0gQCRlbC5maW5kKFwiI25ld190eXBlIG9wdGlvbjpzZWxlY3RlZFwiKS52YWwoKVxuICAgIG5ld0lkICAgPSBVdGlscy5ndWlkKClcblxuICAgIGlmIG5hbWUubGVuZ3RoID09IDBcbiAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiPHNwYW4gY2xhc3M9J2Vycm9yJz5Db3VsZCBub3Qgc2F2ZSA8aW1nIHNyYz0naW1hZ2VzL2ljb25fY2xvc2UucG5nJyBjbGFzcz0nY2xlYXJfbWVzc2FnZSc+PC9zcGFuPlwiXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIGlmIG5ld1R5cGUgPT0gXCJhc3Nlc3NtZW50XCJcbiAgICAgIG5ld09iamVjdCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgIFwibmFtZVwiICAgICAgICAgOiBuYW1lXG4gICAgICAgIFwiX2lkXCIgICAgICAgICAgOiBuZXdJZFxuICAgICAgICBcImFzc2Vzc21lbnRJZFwiIDogbmV3SWRcbiAgICAgICAgXCJhcmNoaXZlZFwiICAgICA6IGZhbHNlXG4gICAgICBjYWxsYmFjayA9IEBhZGRBc3Nlc3NtZW50XG4gICAgZWxzZSBpZiBuZXdUeXBlID09IFwiY3VycmljdWx1bVwiXG4gICAgICBuZXdPYmplY3QgPSBuZXcgQ3VycmljdWx1bVxuICAgICAgICBcIm5hbWVcIiAgICAgICAgIDogbmFtZVxuICAgICAgICBcIl9pZFwiICAgICAgICAgIDogbmV3SWRcbiAgICAgICAgXCJjdXJyaWN1bHVtSWRcIiA6IG5ld0lkXG4gICAgICBjYWxsYmFjayA9IEBhZGRDdXJyaWN1bHVtXG5cbiAgICBuZXdPYmplY3Quc2F2ZSBudWxsLFxuICAgICAgc3VjY2VzcyA6ID0+XG4gICAgICAgIGNhbGxiYWNrKG5ld09iamVjdClcbiAgICAgICAgQCRlbC5maW5kKCcubmV3X2Zvcm0sIC5uZXcnKS50b2dnbGUoKVxuICAgICAgICBAJGVsLmZpbmQoJy5uZXdfbmFtZScpLnZhbCBcIlwiXG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiI3tuYW1lfSBzYXZlZFwiXG4gICAgICBlcnJvcjogPT5cbiAgICAgICAgQCRlbC5maW5kKCcubmV3X2Zvcm0sIC5uZXcnKS50b2dnbGUoKVxuICAgICAgICBAJGVsLmZpbmQoJy5uZXdfbmFtZScpLnZhbCBcIlwiXG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiUGxlYXNlIHRyeSBhZ2Fpbi4gRXJyb3Igc2F2aW5nLlwiXG5cbiAgICByZXR1cm4gZmFsc2VcblxuICAjIFZpZXdNYW5hZ2VyXG4gIGNsb3NlVmlld3M6IC0+XG4gICAgQGFzc2Vzc21lbnRzVmlldy5jbG9zZSgpXG4gICAgQGN1cnJpY3VsYUxpc3RWaWV3LmNsb3NlKClcblxuICBvbkNsb3NlOiAtPlxuICAgIEBjbG9zZVZpZXdzKClcbiJdfQ==
