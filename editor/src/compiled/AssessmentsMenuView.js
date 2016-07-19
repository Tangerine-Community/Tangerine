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
    console.log("ptions: " + JSON.stringify(options));
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
      "lessonPlans": this.lessonPlans
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2Vzc21lbnQvQXNzZXNzbWVudHNNZW51Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxtQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7Ozs7Z0NBRUosU0FBQSxHQUFXOztnQ0FFWCxNQUFBLEdBQ0U7SUFBQSxvQkFBQSxFQUF1QixTQUF2QjtJQUNBLGlCQUFBLEVBQXVCLFNBRHZCO0lBRUEsbUJBQUEsRUFBdUIsV0FGdkI7SUFHQSxZQUFBLEVBQXVCLFdBSHZCO0lBSUEsZUFBQSxFQUF1QixRQUp2QjtJQUtBLFlBQUEsRUFBdUIsS0FMdkI7SUFNQSxlQUFBLEVBQXVCLFlBTnZCO0lBT0EseUJBQUEsRUFBNEIsaUJBUDVCO0lBU0EscUJBQUEsRUFBd0IsYUFUeEI7SUFXQSxnQkFBQSxFQUEwQixTQVgxQjtJQVlBLGlCQUFBLEVBQTBCLGFBWjFCO0lBYUEsc0JBQUEsRUFBMEIsYUFiMUI7SUFjQSx1QkFBQSxFQUEyQixhQWQzQjs7O2dDQWdCRixXQUFBLEdBQWEsU0FBQTtXQUNYLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFBO0VBRFc7O2dDQUdiLFdBQUEsR0FBYSxTQUFDLEtBQUQ7QUFDWCxRQUFBO0lBQUEsSUFBQSxDQUFjLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBZixDQUFBLENBQWQ7QUFBQSxhQUFBOztJQUNBLE9BQUEsR0FBYSxDQUFBLENBQUUsS0FBSyxDQUFDLE1BQVI7SUFDYixTQUFBLEdBQWEsT0FBTyxDQUFDLElBQVIsQ0FBYSxnQkFBYjtJQUNiLElBQUMsQ0FBQSxTQUFELEdBQWEsT0FBTyxDQUFDLEtBQVIsQ0FBQTtJQUNiLE9BQUEsR0FBVSxPQUFPLENBQUMsSUFBUixDQUFhLE9BQWIsQ0FBcUIsQ0FBQyxPQUF0QixDQUE4QixVQUE5QixFQUF5QyxFQUF6QztJQUNWLE9BQUEsR0FBVSxPQUFPLENBQUMsR0FBUixDQUFZLFFBQVo7SUFDVixPQUFPLENBQUMsS0FBUixDQUFjLG1DQUFBLEdBQW9DLE9BQXBDLEdBQTRDLHFCQUE1QyxHQUFpRSxTQUFqRSxHQUEyRSx5QkFBM0UsR0FBb0csT0FBcEcsR0FBNEcsV0FBNUcsR0FBc0gsQ0FBQyxDQUFDLENBQUMsTUFBRixDQUFTLE9BQU8sQ0FBQyxJQUFSLENBQUEsQ0FBVCxDQUFELENBQXRILEdBQWdKLElBQTlKO0lBQ0EsS0FBQSxHQUFRLE9BQU8sQ0FBQyxJQUFSLENBQUEsQ0FBYyxDQUFDLEtBQWYsQ0FBQTtXQUNSLE9BQU8sQ0FBQyxNQUFSLENBQUE7RUFUVzs7Z0NBV2IsV0FBQSxHQUFhLFNBQUMsS0FBRDtBQUVYLFFBQUE7SUFBQSxJQUFVLElBQUMsQ0FBQSxhQUFYO0FBQUEsYUFBQTs7SUFFQSxJQUFHLEtBQUssQ0FBQyxPQUFUO01BQ0UsSUFBRyxLQUFLLENBQUMsT0FBTixLQUFpQixFQUFwQjtRQUNFLENBQUEsQ0FBRSxLQUFLLENBQUMsTUFBUixDQUFlLENBQUMsS0FBaEIsQ0FBc0IsSUFBQyxDQUFBLFNBQXZCLENBQWlDLENBQUMsTUFBbEMsQ0FBQTtBQUNBLGVBRkY7T0FBQSxNQUdLLElBQUcsS0FBSyxDQUFDLE9BQU4sS0FBaUIsRUFBcEI7QUFDSCxlQUFPLEtBREo7T0FKUDs7SUFPQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUNqQixPQUFBLEdBQVksQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSO0lBQ1osU0FBQSxHQUFZLE9BQU8sQ0FBQyxJQUFSLENBQWEsZ0JBQWI7SUFDWixLQUFBLEdBQVksT0FBTyxDQUFDLEdBQVIsQ0FBQTtJQUVaLGlCQUFBLEdBQStCO0lBQy9CLGlCQUFrQixDQUFBLFNBQUEsQ0FBbEIsR0FBK0I7V0FFL0IsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFuQixDQUF3QixpQkFBeEIsRUFDRTtNQUFBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDUCxLQUFDLENBQUEsYUFBRCxHQUFpQjtVQUNqQixLQUFLLENBQUMsUUFBTixDQUFlLE9BQWY7aUJBQ0EsT0FBTyxDQUFDLEtBQVIsQ0FBYyxLQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBZCxDQUFxQyxDQUFDLE1BQXRDLENBQUE7UUFITztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVDtNQUlBLEtBQUEsRUFBTyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDTCxLQUFDLENBQUEsYUFBRCxHQUFpQjtVQUNqQixLQUFLLENBQUMsUUFBTixDQUFlLFlBQWY7aUJBQ0EsT0FBTyxDQUFDLEtBQVIsQ0FBYyxLQUFDLENBQUEsU0FBZixDQUF5QixDQUFDLE1BQTFCLENBQUE7UUFISztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FKUDtLQURGO0VBbkJXOztnQ0E2QmIsT0FBQSxHQUFTLFNBQUE7V0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLFdBQTFCLEVBQXVDLElBQXZDO0VBQUg7O2dDQUVULGVBQUEsR0FBaUIsU0FBQTtXQUFHLEtBQUssQ0FBQyxlQUFOLENBQUE7RUFBSDs7Z0NBRWpCLEdBQUEsR0FBSyxTQUFBO1dBQ0gsYUFBYSxDQUFDLElBQWQsQ0FDRTtNQUFBLE9BQUEsRUFBUyxTQUFDLElBQUQ7QUFDUCxZQUFBO1FBQUEsQ0FBQSxHQUFJLFFBQVEsQ0FBQyxhQUFULENBQXVCLEdBQXZCO1FBQ0osQ0FBQyxDQUFDLElBQUYsR0FBUyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUExQixDQUE4QixNQUE5QjtlQUNULEtBQUssQ0FBQyxNQUFOLENBQWEsc0JBQUEsR0FBdUIsQ0FBQyxDQUFDLElBQXpCLEdBQThCLFFBQTlCLEdBQXNDLElBQUksQ0FBQyxLQUEzQyxHQUFpRCxNQUE5RDtNQUhPLENBQVQ7TUFJQSxLQUFBLEVBQU8sU0FBQyxHQUFELEVBQU0sUUFBTjtlQUNMLEtBQUssQ0FBQyxNQUFOLENBQWEsUUFBUSxDQUFDLE9BQXRCO01BREssQ0FKUDtLQURGO0VBREc7O2dDQVNMLFVBQUEsR0FBWSxTQUFBO1dBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFqQixDQUEwQixRQUExQixFQUFvQyxJQUFwQztFQUFIOztnQ0FFWixTQUFBLEdBQVksU0FBQTtXQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBakIsQ0FBMEIsUUFBMUIsRUFBb0MsSUFBcEM7RUFBSDs7Z0NBRVosSUFBQSxHQUFNLFNBQUE7V0FDSixJQUFDLENBQUEsSUFBRCxHQUNFO01BQUEsS0FBQSxFQUFtQixDQUFBLENBQUUsK0JBQUYsQ0FBbkI7TUFDQSxRQUFBLEVBQW1CLENBQUEsQ0FBRSxrQ0FBRixDQURuQjtNQUVBLEdBQUEsRUFBbUIsQ0FBQSxDQUFFLCtCQUFGLENBRm5CO01BR0EsTUFBQSxFQUFtQixDQUFBLENBQUUsa0NBQUYsQ0FIbkI7TUFJQSxnQkFBQSxFQUFtQixDQUFBLENBQUUsNENBQUYsQ0FKbkI7TUFLQSxZQUFBLEVBQW1CLENBQUEsQ0FBRSx3Q0FBRixDQUxuQjtNQU1BLE9BQUEsRUFBbUIsQ0FBQSxDQUFFLG1DQUFGLENBTm5CO01BT0EsSUFBQSxFQUFtQixDQUFBLENBQUUsZ0NBQUYsQ0FQbkI7TUFRQSxNQUFBLEVBQW1CLENBQUEsQ0FBRSxrQ0FBRixDQVJuQjtNQVNBLFVBQUEsRUFBYyxDQUFBLENBQUUscUNBQUYsQ0FUZDtNQVVBLFdBQUEsRUFBYyxDQUFBLENBQUUsc0NBQUYsQ0FWZDtNQVdBLFVBQUEsRUFBYyxDQUFBLENBQUUscUNBQUYsQ0FYZDtNQVlBLFdBQUEsRUFBZSxDQUFBLENBQUUsc0NBQUYsQ0FaZjs7RUFGRTs7Z0NBaUJOLFVBQUEsR0FBWSxTQUFDLE9BQUQ7QUFFVixRQUFBO0lBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxVQUFBLEdBQWEsSUFBSSxDQUFDLFNBQUwsQ0FBZSxPQUFmLENBQXpCO0lBQ0EsSUFBQyxDQUFBLElBQUQsQ0FBQTtBQUVBLFNBQUEsY0FBQTs7TUFBQSxJQUFFLENBQUEsR0FBQSxDQUFGLEdBQVM7QUFBVDtJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFrQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsVUFBRDtlQUFnQixVQUFVLENBQUMsRUFBWCxDQUFjLEtBQWQsRUFBcUIsS0FBQyxDQUFBLGFBQXRCO01BQWhCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQjtJQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFrQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsVUFBRDtlQUFnQixVQUFVLENBQUMsRUFBWCxDQUFjLEtBQWQsRUFBcUIsS0FBQyxDQUFBLGFBQXRCO01BQWhCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQjtJQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFvQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsVUFBRDtlQUFnQixVQUFVLENBQUMsRUFBWCxDQUFjLEtBQWQsRUFBcUIsS0FBQyxDQUFBLGFBQXRCO01BQWhCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQjtJQUVBLElBQUMsQ0FBQSxpQkFBRCxHQUF5QixJQUFBLGlCQUFBLENBQ3ZCO01BQUEsV0FBQSxFQUFjLElBQUMsQ0FBQSxTQUFmO0tBRHVCO0lBR3pCLElBQUMsQ0FBQSxtQkFBRCxHQUEyQixJQUFBLG1CQUFBLENBQ3pCO01BQUEsYUFBQSxFQUFnQixJQUFDLENBQUEsV0FBakI7S0FEeUI7SUFHM0IsSUFBQyxDQUFBLGVBQUQsR0FBdUIsSUFBQSxlQUFBLENBQ3JCO01BQUEsYUFBQSxFQUFnQixJQUFDLENBQUEsV0FBakI7TUFDQSxRQUFBLEVBQWdCLElBRGhCO0tBRHFCO1dBSXZCLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7RUFyQlg7O2dDQXdCWixNQUFBLEdBQVEsU0FBQTtBQUVOLFFBQUE7SUFBQSxPQUFBLEdBQVUsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFmLENBQUE7SUFFVixTQUFBLEdBQWdCLDhCQUFBLEdBQStCLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBRCxDQUFwQyxHQUF5QztJQUN6RCxZQUFBLEdBQWdCLGlDQUFBLEdBQWtDLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBRCxDQUF2QyxHQUErQztJQUMvRCxTQUFBLEdBQWdCLGlDQUFBLEdBQWtDLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBeEMsR0FBNEM7SUFDNUQsWUFBQSxHQUFnQixvQ0FBQSxHQUFxQyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQTNDLEdBQWtEO0lBQ2xFLFlBQUEsR0FBZ0IsMkNBQUEsR0FBNEMsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBbEQsR0FBbUU7SUFDbkYsaUJBQUEsR0FBb0IsdUNBQUEsR0FBd0MsSUFBQyxDQUFBLElBQUksQ0FBQyxZQUE5QyxHQUEyRDtJQUMvRSxhQUFBLEdBQWdCLHFDQUFBLEdBQXNDLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBNUMsR0FBb0Q7SUFDcEUsV0FBQSxHQUFnQix5REFBQSxHQUF5RCxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsZ0JBQW5CLENBQW9DLGFBQXBDLENBQUEsSUFBc0QsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFuQixDQUF1QixXQUF2QixDQUF2RCxDQUF6RCxHQUFvSjtJQUdwSyxVQUFBLEdBQWE7SUFDYixJQUE0RixJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsS0FBdUIsQ0FBbkg7TUFBQSxVQUFVLENBQUMsSUFBWCxDQUFnQix3RUFBaEIsRUFBQTs7SUFDQSxJQUEwRixJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsS0FBcUIsQ0FBL0c7TUFBQSxVQUFVLENBQUMsSUFBWCxDQUFnQiw4REFBaEIsRUFBQTs7SUFDQSxJQUEwRixJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsS0FBc0IsQ0FBaEg7TUFBQSxVQUFVLENBQUMsSUFBWCxDQUFnQixrRUFBaEIsRUFBQTs7SUFDQSxVQUFVLENBQUMsSUFBWCxDQUFnQixxRUFBaEI7SUFJQSxJQUFBLEdBQ0ksWUFBRCxHQUFjLEdBQWQsR0FDQyxTQURELEdBQ1csR0FEWCxHQUVDLGFBRkQsR0FFZSxHQUZmLEdBR0MsV0FIRCxHQUdhLGlCQUhiLEdBS08sSUFBQyxDQUFBLElBQUksQ0FBQyxXQUxiLEdBS3lCO0lBRzVCLElBQUcsT0FBSDtNQUNFLElBQUEsSUFDTSxTQUFELEdBQVcsR0FBWCxHQUNDLFlBREQsR0FDYyx3S0FEZCxHQU9rQyxJQUFDLENBQUEsSUFBSSxDQUFDLFVBUHhDLEdBT21ELHVDQVBuRCxHQVFrQyxJQUFDLENBQUEsSUFBSSxDQUFDLFVBUnhDLEdBUW1ELHdDQVJuRCxHQVNtQyxJQUFDLENBQUEsSUFBSSxDQUFDLFdBVHpDLEdBU3FELDJEQVRyRCxHQVdzQyxJQUFDLENBQUEsSUFBSSxDQUFDLElBWDVDLEdBV2lELCtDQVhqRCxHQVdnRyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BWHRHLEdBVzZHLG1IQVg3RyxHQWtCRixDQUFDLFVBQVUsQ0FBQyxJQUFYLENBQWdCLEVBQWhCLENBQUQsRUFwQkw7S0FBQSxNQUFBO01Bd0JFLElBQUEsSUFBUSwyRkF4QlY7O0lBOEJBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLElBQVY7SUFFQSxJQUFDLENBQUEsZUFBZSxDQUFDLFVBQWpCLENBQTZCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLHdCQUFWLENBQTdCO0lBQ0EsSUFBQyxDQUFBLGVBQWUsQ0FBQyxNQUFqQixDQUFBO0lBRUEsSUFBQyxDQUFBLGlCQUFpQixDQUFDLFVBQW5CLENBQStCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLHNCQUFWLENBQS9CO0lBQ0EsSUFBQyxDQUFBLGlCQUFpQixDQUFDLE1BQW5CLENBQUE7SUFFQSxJQUFDLENBQUEsbUJBQW1CLENBQUMsVUFBckIsQ0FBaUMsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsd0JBQVYsQ0FBakM7SUFDQSxJQUFDLENBQUEsbUJBQW1CLENBQUMsTUFBckIsQ0FBQTtJQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsVUFBZixDQUEyQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSx1QkFBVixDQUEzQjtJQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixDQUFBO0lBRUEsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsR0FBa0IsQ0FBckI7TUFDRSxJQUFDLENBQUEsV0FBRCxHQUFtQixJQUFBLFdBQUEsQ0FDakI7UUFBQSxPQUFBLEVBQVUsSUFBQyxDQUFBLE9BQVg7UUFDQSxTQUFBLEVBQVksSUFBQyxDQUFBLFNBRGI7UUFFQSxRQUFBLEVBQVcsSUFBQyxDQUFBLFFBRlo7T0FEaUI7TUFJbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUFiLENBQXdCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGtCQUFWLENBQXhCO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUFiLENBQUEsRUFORjtLQUFBLE1BQUE7TUFRRSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxrQkFBVixDQUE2QixDQUFDLE1BQTlCLENBQUEsRUFSRjs7SUFXQSxJQUFHLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixHQUFtQixDQUF0QjtNQUNFLElBQUMsQ0FBQSxZQUFELEdBQW9CLElBQUEsWUFBQSxDQUNsQjtRQUFBLFFBQUEsRUFBVyxJQUFDLENBQUEsUUFBWjtRQUNBLEtBQUEsRUFBUSxJQUFDLENBQUEsS0FEVDtPQURrQjtNQUdwQixJQUFDLENBQUEsWUFBWSxDQUFDLFVBQWQsQ0FBeUIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUscUJBQVYsQ0FBekI7TUFDQSxJQUFDLENBQUEsWUFBWSxDQUFDLE1BQWQsQ0FBQSxFQUxGO0tBQUEsTUFBQTtNQU9FLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLHFCQUFWLENBQWdDLENBQUMsTUFBakMsQ0FBQSxFQVBGOztJQVdBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQWpHTTs7Z0NBc0dSLGFBQUEsR0FBZSxTQUFDLE1BQUQ7SUFDYixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsTUFBakI7V0FDQSxNQUFNLENBQUMsRUFBUCxDQUFVLEtBQVYsRUFBaUIsSUFBQyxDQUFBLGFBQWxCO0VBRmE7O2dDQUlmLGFBQUEsR0FBZSxTQUFDLE1BQUQ7SUFDYixJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxNQUFmO1dBQ0EsTUFBTSxDQUFDLEVBQVAsQ0FBVSxLQUFWLEVBQWlCLElBQUMsQ0FBQSxhQUFsQjtFQUZhOztnQ0FJZixhQUFBLEdBQWUsU0FBQyxNQUFEO0lBQ2IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLE1BQWpCO1dBQ0EsTUFBTSxDQUFDLEVBQVAsQ0FBVSxLQUFWLEVBQWlCLElBQUMsQ0FBQSxhQUFsQjtFQUZhOztnQ0FLZixTQUFBLEdBQVcsU0FBQTtJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlCQUFWLENBQTRCLENBQUMsTUFBN0IsQ0FBQTtXQUF1QztFQUExQzs7Z0NBRVgsT0FBQSxHQUFTLFNBQUMsS0FBRDtBQVFQLFFBQUE7SUFBQSxJQUFHLEtBQUssQ0FBQyxJQUFOLEtBQWMsT0FBZCxJQUF5QixLQUFLLENBQUMsS0FBTixLQUFlLEVBQTNDO0FBQ0UsYUFBTyxLQURUOztJQUdBLElBQUEsR0FBVSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxXQUFWLENBQXNCLENBQUMsR0FBdkIsQ0FBQTtJQUNWLE9BQUEsR0FBVSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSwyQkFBVixDQUFzQyxDQUFDLEdBQXZDLENBQUE7SUFDVixLQUFBLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBQTtJQUVWLElBQUcsSUFBSSxDQUFDLE1BQUwsS0FBZSxDQUFsQjtNQUNFLEtBQUssQ0FBQyxRQUFOLENBQWUsbUdBQWY7QUFDQSxhQUFPLE1BRlQ7O0lBSUEsSUFBRyxPQUFBLEtBQVcsWUFBZDtNQUNFLFNBQUEsR0FBZ0IsSUFBQSxVQUFBLENBQ2Q7UUFBQSxNQUFBLEVBQWlCLElBQWpCO1FBQ0EsS0FBQSxFQUFpQixLQURqQjtRQUVBLGNBQUEsRUFBaUIsS0FGakI7UUFHQSxVQUFBLEVBQWlCLEtBSGpCO09BRGM7TUFLaEIsUUFBQSxHQUFXLElBQUMsQ0FBQSxjQU5kO0tBQUEsTUFPSyxJQUFHLE9BQUEsS0FBVyxZQUFkO01BQ0gsU0FBQSxHQUFnQixJQUFBLFVBQUEsQ0FDZDtRQUFBLE1BQUEsRUFBaUIsSUFBakI7UUFDQSxLQUFBLEVBQWlCLEtBRGpCO1FBRUEsY0FBQSxFQUFpQixLQUZqQjtPQURjO01BSWhCLFFBQUEsR0FBVyxJQUFDLENBQUEsY0FMVDtLQUFBLE1BTUEsSUFBRyxPQUFBLEtBQVcsYUFBZDtNQUNILFNBQUEsR0FBZ0IsSUFBQSxVQUFBLENBQ2Q7UUFBQSxNQUFBLEVBQWlCLElBQWpCO1FBQ0EsS0FBQSxFQUFpQixLQURqQjtRQUVBLGNBQUEsRUFBaUIsS0FGakI7T0FEYztNQUloQixRQUFBLEdBQVcsSUFBQyxDQUFBLGNBTFQ7O0lBT0wsU0FBUyxDQUFDLElBQVYsQ0FBZSxJQUFmLEVBQ0U7TUFBQSxPQUFBLEVBQVUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ1IsUUFBQSxDQUFTLFNBQVQ7VUFDQSxLQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxpQkFBVixDQUE0QixDQUFDLE1BQTdCLENBQUE7VUFDQSxLQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxXQUFWLENBQXNCLENBQUMsR0FBdkIsQ0FBMkIsRUFBM0I7aUJBQ0EsS0FBSyxDQUFDLFFBQU4sQ0FBa0IsSUFBRCxHQUFNLFFBQXZCO1FBSlE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVY7TUFLQSxLQUFBLEVBQU8sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ0wsS0FBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsaUJBQVYsQ0FBNEIsQ0FBQyxNQUE3QixDQUFBO1VBQ0EsS0FBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsV0FBVixDQUFzQixDQUFDLEdBQXZCLENBQTJCLEVBQTNCO2lCQUNBLEtBQUssQ0FBQyxRQUFOLENBQWUsaUNBQWY7UUFISztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FMUDtLQURGO0FBV0EsV0FBTztFQWxEQTs7Z0NBcURULFVBQUEsR0FBWSxTQUFBO0lBQ1YsSUFBQyxDQUFBLGVBQWUsQ0FBQyxLQUFqQixDQUFBO1dBQ0EsSUFBQyxDQUFBLGlCQUFpQixDQUFDLEtBQW5CLENBQUE7RUFGVTs7Z0NBSVosT0FBQSxHQUFTLFNBQUE7V0FDUCxJQUFDLENBQUEsVUFBRCxDQUFBO0VBRE87Ozs7R0F4U3VCLFFBQVEsQ0FBQyIsImZpbGUiOiJhc3Nlc3NtZW50L0Fzc2Vzc21lbnRzTWVudVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBBc3Nlc3NtZW50c01lbnVWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJBc3Nlc3NtZW50c01lbnVWaWV3XCJcblxuICBldmVudHM6XG4gICAgJ2tleXByZXNzIC5uZXdfbmFtZScgOiAnbmV3U2F2ZSdcbiAgICAnY2xpY2sgLm5ld19zYXZlJyAgICA6ICduZXdTYXZlJ1xuICAgICdjbGljayAubmV3X2NhbmNlbCcgIDogJ25ld1RvZ2dsZSdcbiAgICAnY2xpY2sgLm5ldycgICAgICAgICA6ICduZXdUb2dnbGUnXG4gICAgJ2NsaWNrIC5pbXBvcnQnICAgICAgOiAnaW1wb3J0J1xuICAgICdjbGljayAuYXBrJyAgICAgICAgIDogJ2FwaydcbiAgICAnY2xpY2sgLmdyb3VwcycgICAgICA6ICdnb3RvR3JvdXBzJ1xuICAgICdjbGljayAudW5pdmVyc2FsX3VwbG9hZCcgOiAndW5pdmVyc2FsVXBsb2FkJ1xuXG4gICAgJ2NsaWNrIC5zeW5jX3RhYmxldHMnIDogJ3N5bmNUYWJsZXRzJ1xuXG4gICAgJ2NsaWNrIC5yZXN1bHRzJyAgICAgICAgOiAncmVzdWx0cydcbiAgICAnY2xpY2sgLnNldHRpbmdzJyAgICAgICA6ICdlZGl0SW5QbGFjZSdcbiAgICAna2V5dXAgLmVkaXRfaW5fcGxhY2UnICA6ICdzYXZlSW5QbGFjZSdcbiAgICAnY2hhbmdlIC5lZGl0X2luX3BsYWNlJyAgOiAnc2F2ZUluUGxhY2UnXG5cbiAgc3luY1RhYmxldHM6ID0+XG4gICAgQHRhYmxldE1hbmFnZXIuc3luYygpXG5cbiAgZWRpdEluUGxhY2U6IChldmVudCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKVxuICAgICR0YXJnZXQgICAgPSAkKGV2ZW50LnRhcmdldClcbiAgICBhdHRyaWJ1dGUgID0gJHRhcmdldC5hdHRyKFwiZGF0YS1hdHRyaWJ0dWVcIilcbiAgICBAb2xkVGFyZ2V0ID0gJHRhcmdldC5jbG9uZSgpXG4gICAgY2xhc3NlcyA9ICR0YXJnZXQuYXR0cihcImNsYXNzXCIpLnJlcGxhY2UoXCJzZXR0aW5nc1wiLFwiXCIpXG4gICAgbWFyZ2lucyA9ICR0YXJnZXQuY3NzKFwibWFyZ2luXCIpXG4gICAgJHRhcmdldC5hZnRlcihcIjxpbnB1dCB0eXBlPSd0ZXh0JyBzdHlsZT0nbWFyZ2luOiN7bWFyZ2luc307JyBkYXRhLWF0dHJpYnV0ZT0nI3thdHRyaWJ1dGV9JyBjbGFzcz0nZWRpdF9pbl9wbGFjZSAje2NsYXNzZXN9JyB2YWx1ZT0nI3tfLmVzY2FwZSgkdGFyZ2V0Lmh0bWwoKSl9Jz5cIilcbiAgICBpbnB1dCA9ICR0YXJnZXQubmV4dCgpLmZvY3VzKClcbiAgICAkdGFyZ2V0LnJlbW92ZSgpXG5cbiAgc2F2ZUluUGxhY2U6IChldmVudCkgLT5cblxuICAgIHJldHVybiBpZiBAYWxyZWFkeVNhdmluZ1xuXG4gICAgaWYgZXZlbnQua2V5Q29kZVxuICAgICAgaWYgZXZlbnQua2V5Q29kZSA9PSAyN1xuICAgICAgICAkKGV2ZW50LnRhcmdldCkuYWZ0ZXIoQG9sZFRhcmdldCkucmVtb3ZlKClcbiAgICAgICAgcmV0dXJuXG4gICAgICBlbHNlIGlmIGV2ZW50LmtleUNvZGUgIT0gMTNcbiAgICAgICAgcmV0dXJuIHRydWVcblxuICAgIEBhbHJlYWR5U2F2aW5nID0gdHJ1ZVxuICAgICR0YXJnZXQgICA9ICQoZXZlbnQudGFyZ2V0KVxuICAgIGF0dHJpYnV0ZSA9ICR0YXJnZXQuYXR0cihcImRhdGEtYXR0cmlidXRlXCIpXG4gICAgdmFsdWUgICAgID0gJHRhcmdldC52YWwoKVxuXG4gICAgdXBkYXRlZEF0dHJpYnV0ZXMgICAgICAgICAgICA9IHt9XG4gICAgdXBkYXRlZEF0dHJpYnV0ZXNbYXR0cmlidXRlXSA9IHZhbHVlXG5cbiAgICBUYW5nZXJpbmUuc2V0dGluZ3Muc2F2ZSB1cGRhdGVkQXR0cmlidXRlcyxcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgIEBhbHJlYWR5U2F2aW5nID0gZmFsc2VcbiAgICAgICAgVXRpbHMudG9wQWxlcnQoXCJTYXZlZFwiKVxuICAgICAgICAkdGFyZ2V0LmFmdGVyKEBvbGRUYXJnZXQuaHRtbCh2YWx1ZSkpLnJlbW92ZSgpXG4gICAgICBlcnJvcjogPT5cbiAgICAgICAgQGFscmVhZHlTYXZpbmcgPSBmYWxzZVxuICAgICAgICBVdGlscy50b3BBbGVydChcIlNhdmUgZXJyb3JcIilcbiAgICAgICAgJHRhcmdldC5hZnRlcihAb2xkVGFyZ2V0KS5yZW1vdmUoKVxuXG4gIHJlc3VsdHM6IC0+IFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJkYXNoYm9hcmRcIiwgdHJ1ZVxuXG4gIHVuaXZlcnNhbFVwbG9hZDogLT4gVXRpbHMudW5pdmVyc2FsVXBsb2FkKClcblxuICBhcGs6IC0+XG4gICAgVGFuZ2VyaW5lVHJlZS5tYWtlXG4gICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpXG4gICAgICAgIGEuaHJlZiA9IFRhbmdlcmluZS5zZXR0aW5ncy5jb25maWcuZ2V0KFwidHJlZVwiKVxuICAgICAgICBVdGlscy5zdGlja3koXCI8aDE+QVBLIGxpbms8L2gxPjxwPiN7YS5ob3N0fS90cmVlLyN7ZGF0YS50b2tlbn08L3A+XCIpXG4gICAgICBlcnJvcjogKHhociwgcmVzcG9uc2UpIC0+XG4gICAgICAgIFV0aWxzLnN0aWNreSByZXNwb25zZS5tZXNzYWdlXG5cbiAgZ290b0dyb3VwczogLT4gVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImdyb3Vwc1wiLCB0cnVlXG5cbiAgaW1wb3J0OiAgICAgLT4gVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImltcG9ydFwiLCB0cnVlXG5cbiAgaTE4bjogLT5cbiAgICBAdGV4dCA9XG4gICAgICBcIm5ld1wiICAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5uZXdcIilcbiAgICAgIGltcG9ydCAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5pbXBvcnRcIilcbiAgICAgIGFwayAgICAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5hcGtcIilcbiAgICAgIGdyb3VwcyAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5ncm91cHNcIilcbiAgICAgIHVuaXZlcnNhbF91cGxvYWQgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi51bml2ZXJzYWxfdXBsb2FkXCIpXG4gICAgICBzeW5jX3RhYmxldHMgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24uc3luY190YWJsZXRzXCIpXG4gICAgICByZXN1bHRzICAgICAgICAgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5idXR0b24ucmVzdWx0c1wiKVxuICAgICAgc2F2ZSAgICAgICAgICAgICA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcuYnV0dG9uLnNhdmVcIilcbiAgICAgIGNhbmNlbCAgICAgICAgICAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmJ1dHRvbi5jYW5jZWxcIilcbiAgICAgIGFzc2Vzc21lbnQgIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5sYWJlbC5hc3Nlc3NtZW50XCIpXG4gICAgICBhc3Nlc3NtZW50cyA6IHQoXCJBc3Nlc3NtZW50TWVudVZpZXcubGFiZWwuYXNzZXNzbWVudHNcIilcbiAgICAgIGN1cnJpY3VsdW0gIDogdChcIkFzc2Vzc21lbnRNZW51Vmlldy5sYWJlbC5jdXJyaWN1bHVtXCIpXG4gICAgICBsZXNzb25fcGxhbiAgOiB0KFwiQXNzZXNzbWVudE1lbnVWaWV3LmxhYmVsLmxlc3Nvbl9wbGFuXCIpXG5cblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgIGNvbnNvbGUubG9nKFwicHRpb25zOiBcIiArIEpTT04uc3RyaW5naWZ5KG9wdGlvbnMpKVxuICAgIEBpMThuKClcblxuICAgIEBba2V5XSA9IHZhbHVlIGZvciBrZXksIHZhbHVlIG9mIG9wdGlvbnNcblxuICAgIEBhc3Nlc3NtZW50cy5lYWNoIChhc3Nlc3NtZW50KSA9PiBhc3Nlc3NtZW50Lm9uIFwibmV3XCIsIEBhZGRBc3Nlc3NtZW50XG4gICAgQGN1cnJpY3VsYS5lYWNoICAgKGN1cnJpY3VsdW0pID0+IGN1cnJpY3VsdW0ub24gXCJuZXdcIiwgQGFkZEN1cnJpY3VsdW1cbiAgICBAbGVzc29uUGxhbnMuZWFjaCAgIChsZXNzb25QbGFuKSA9PiBsZXNzb25QbGFuLm9uIFwibmV3XCIsIEBhZGRMZXNzb25QbGFuXG5cbiAgICBAY3VycmljdWxhTGlzdFZpZXcgPSBuZXcgQ3VycmljdWxhTGlzdFZpZXdcbiAgICAgIFwiY3VycmljdWxhXCIgOiBAY3VycmljdWxhXG5cbiAgICBAbGVzc29uUGxhbnNMaXN0VmlldyA9IG5ldyBMZXNzb25QbGFuc0xpc3RWaWV3XG4gICAgICBcImxlc3NvblBsYW5zXCIgOiBAbGVzc29uUGxhbnNcblxuICAgIEBhc3Nlc3NtZW50c1ZpZXcgPSBuZXcgQXNzZXNzbWVudHNWaWV3XG4gICAgICBcImFzc2Vzc21lbnRzXCIgOiBAYXNzZXNzbWVudHNcbiAgICAgIFwicGFyZW50XCIgICAgICA6IEBcblxuICAgIEB1c2Vyc01lbnVWaWV3ID0gbmV3IFVzZXJzTWVudVZpZXdcblxuXG4gIHJlbmRlcjogPT5cblxuICAgIGlzQWRtaW4gPSBUYW5nZXJpbmUudXNlci5pc0FkbWluKClcblxuICAgIG5ld0J1dHRvbiAgICAgPSBcIjxidXR0b24gY2xhc3M9J25ldyBjb21tYW5kJz4je0B0ZXh0Lm5ld308L2J1dHRvbj5cIlxuICAgIGltcG9ydEJ1dHRvbiAgPSBcIjxidXR0b24gY2xhc3M9J2ltcG9ydCBjb21tYW5kJz4je0B0ZXh0LmltcG9ydH08L2J1dHRvbj5cIlxuICAgIGFwa0J1dHRvbiAgICAgPSBcIjxidXR0b24gY2xhc3M9J2FwayBuYXZpZ2F0aW9uJz4je0B0ZXh0LmFwa308L2J1dHRvbj5cIlxuICAgIGdyb3Vwc0J1dHRvbiAgPSBcIjxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gZ3JvdXBzJz4je0B0ZXh0Lmdyb3Vwc308L2J1dHRvbj5cIlxuICAgIHVwbG9hZEJ1dHRvbiAgPSBcIjxidXR0b24gY2xhc3M9J2NvbW1hbmQgdW5pdmVyc2FsX3VwbG9hZCc+I3tAdGV4dC51bml2ZXJzYWxfdXBsb2FkfTwvYnV0dG9uPlwiXG4gICAgc3luY1RhYmxldHNCdXR0b24gPSBcIjxidXR0b24gY2xhc3M9J2NvbW1hbmQgc3luY190YWJsZXRzJz4je0B0ZXh0LnN5bmNfdGFibGV0c308L2J1dHRvbj5cIlxuICAgIHJlc3VsdHNCdXR0b24gPSBcIjxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gcmVzdWx0cyc+I3tAdGV4dC5yZXN1bHRzfTwvYnV0dG9uPlwiXG4gICAgZ3JvdXBIYW5kbGUgICA9IFwiPGgyIGNsYXNzPSdzZXR0aW5ncyBncmV5JyBkYXRhLWF0dHJpYnR1ZT0nZ3JvdXBIYW5kbGUnPiN7VGFuZ2VyaW5lLnNldHRpbmdzLmdldEVzY2FwZWRTdHJpbmcoJ2dyb3VwSGFuZGxlJykgfHwgVGFuZ2VyaW5lLnNldHRpbmdzLmdldCgnZ3JvdXBOYW1lJyl9PC9oMj5cIlxuXG5cbiAgICBjb250YWluZXJzID0gW11cbiAgICBjb250YWluZXJzLnB1c2ggXCI8c2VjdGlvbiBpZD0nY3VycmljdWxhX2NvbnRhaW5lcicgY2xhc3M9J0N1cnJpY3VsYUxpc3RWaWV3Jz48L3NlY3Rpb24+XCIgaWYgQGN1cnJpY3VsYS5sZW5ndGggaXNudCAwXG4gICAgY29udGFpbmVycy5wdXNoIFwiPHNlY3Rpb24gaWQ9J2tsYXNzX2NvbnRhaW5lcicgY2xhc3M9J0tsYXNzZXNWaWV3Jz48L3NlY3Rpb24+XCIgICAgICAgICBpZiBAa2xhc3Nlcy5sZW5ndGggaXNudCAwXG4gICAgY29udGFpbmVycy5wdXNoIFwiPHNlY3Rpb24gaWQ9J3RlYWNoZXJzX2NvbnRhaW5lcicgY2xhc3M9J1RlYWNoZXJzVmlldyc+PC9zZWN0aW9uPlwiICAgICBpZiBAdGVhY2hlcnMubGVuZ3RoIGlzbnQgMFxuICAgIGNvbnRhaW5lcnMucHVzaCBcIjxzZWN0aW9uIGlkPSd1c2Vyc19tZW51X2NvbnRhaW5lcicgY2xhc3M9J1VzZXJzTWVudVZpZXcnPjwvc2VjdGlvbj5cIlxuXG5cblxuICAgIGh0bWwgPSBcIlxuICAgICAgI3tncm91cHNCdXR0b259XG4gICAgICAje2Fwa0J1dHRvbn1cbiAgICAgICN7cmVzdWx0c0J1dHRvbn1cbiAgICAgICN7Z3JvdXBIYW5kbGV9XG4gICAgICA8c2VjdGlvbj5cbiAgICAgICAgPGgxPiN7QHRleHQuYXNzZXNzbWVudHN9PC9oMT5cbiAgICBcIlxuXG4gICAgaWYgaXNBZG1pblxuICAgICAgaHRtbCArPSBcIlxuICAgICAgICAgICN7bmV3QnV0dG9ufVxuICAgICAgICAgICN7aW1wb3J0QnV0dG9ufVxuXG4gICAgICAgICAgPGRpdiBjbGFzcz0nbmV3X2Zvcm0gY29uZmlybWF0aW9uJz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9J3RleHQnIGNsYXNzPSduZXdfbmFtZScgcGxhY2Vob2xkZXI9J05hbWUnPlxuICAgICAgICAgICAgICA8c2VsZWN0IGlkPSduZXdfdHlwZSc+XG4gICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0nYXNzZXNzbWVudCc+I3tAdGV4dC5hc3Nlc3NtZW50fTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9J2N1cnJpY3VsdW0nPiN7QHRleHQuY3VycmljdWx1bX08L29wdGlvbj5cbiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSdsZXNzb25fcGxhbic+I3tAdGV4dC5sZXNzb25fcGxhbn08L29wdGlvbj5cbiAgICAgICAgICAgICAgPC9zZWxlY3Q+PGJyPlxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduZXdfc2F2ZSBjb21tYW5kJz4je0B0ZXh0LnNhdmV9PC9idXR0b24+IDxidXR0b24gY2xhc3M9J25ld19jYW5jZWwgY29tbWFuZCc+I3tAdGV4dC5jYW5jZWx9PC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGlkPSdhc3Nlc3NtZW50c19jb250YWluZXInPjwvZGl2PlxuICAgICAgICAgIDxkaXYgaWQ9J2xlc3NvblBsYW5zX2NvbnRhaW5lcic+PC9kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICAje2NvbnRhaW5lcnMuam9pbignJyl9XG5cbiAgICAgIFwiXG4gICAgZWxzZVxuICAgICAgaHRtbCArPSBcIlxuICAgICAgICA8ZGl2IGlkPSdhc3Nlc3NtZW50c19jb250YWluZXInPjwvZGl2PlxuICAgICAgICA8ZGl2IGlkPSdsZXNzb25QbGFuc19jb250YWluZXInPjwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuICAgICAgXCJcblxuICAgIEAkZWwuaHRtbCBodG1sXG5cbiAgICBAYXNzZXNzbWVudHNWaWV3LnNldEVsZW1lbnQoIEAkZWwuZmluZChcIiNhc3Nlc3NtZW50c19jb250YWluZXJcIikgKVxuICAgIEBhc3Nlc3NtZW50c1ZpZXcucmVuZGVyKClcblxuICAgIEBjdXJyaWN1bGFMaXN0Vmlldy5zZXRFbGVtZW50KCBAJGVsLmZpbmQoXCIjY3VycmljdWxhX2NvbnRhaW5lclwiKSApXG4gICAgQGN1cnJpY3VsYUxpc3RWaWV3LnJlbmRlcigpXG5cbiAgICBAbGVzc29uUGxhbnNMaXN0Vmlldy5zZXRFbGVtZW50KCBAJGVsLmZpbmQoXCIjbGVzc29uUGxhbnNfY29udGFpbmVyXCIpIClcbiAgICBAbGVzc29uUGxhbnNMaXN0Vmlldy5yZW5kZXIoKVxuXG4gICAgQHVzZXJzTWVudVZpZXcuc2V0RWxlbWVudCggQCRlbC5maW5kKFwiI3VzZXJzX21lbnVfY29udGFpbmVyXCIpIClcbiAgICBAdXNlcnNNZW51Vmlldy5yZW5kZXIoKVxuXG4gICAgaWYgQGtsYXNzZXMubGVuZ3RoID4gMFxuICAgICAgQGtsYXNzZXNWaWV3ID0gbmV3IEtsYXNzZXNWaWV3XG4gICAgICAgIGtsYXNzZXMgOiBAa2xhc3Nlc1xuICAgICAgICBjdXJyaWN1bGEgOiBAY3VycmljdWxhXG4gICAgICAgIHRlYWNoZXJzIDogQHRlYWNoZXJzXG4gICAgICBAa2xhc3Nlc1ZpZXcuc2V0RWxlbWVudCBAJGVsLmZpbmQoXCIja2xhc3NfY29udGFpbmVyXCIpXG4gICAgICBAa2xhc3Nlc1ZpZXcucmVuZGVyKClcbiAgICBlbHNlXG4gICAgICBAJGVsLmZpbmQoXCIja2xhc3NfY29udGFpbmVyXCIpLnJlbW92ZSgpXG5cblxuICAgIGlmIEB0ZWFjaGVycy5sZW5ndGggPiAwXG4gICAgICBAdGVhY2hlcnNWaWV3ID0gbmV3IFRlYWNoZXJzVmlld1xuICAgICAgICB0ZWFjaGVycyA6IEB0ZWFjaGVyc1xuICAgICAgICB1c2VycyA6IEB1c2Vyc1xuICAgICAgQHRlYWNoZXJzVmlldy5zZXRFbGVtZW50IEAkZWwuZmluZChcIiN0ZWFjaGVyc19jb250YWluZXJcIilcbiAgICAgIEB0ZWFjaGVyc1ZpZXcucmVuZGVyKClcbiAgICBlbHNlXG4gICAgICBAJGVsLmZpbmQoXCIjdGVhY2hlcnNfY29udGFpbmVyXCIpLnJlbW92ZSgpXG5cblxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgICByZXR1cm5cblxuXG4gIGFkZEFzc2Vzc21lbnQ6IChuZXdPbmUpID0+XG4gICAgQGFzc2Vzc21lbnRzLmFkZCBuZXdPbmVcbiAgICBuZXdPbmUub24gXCJuZXdcIiwgQGFkZEFzc2Vzc21lbnRcblxuICBhZGRDdXJyaWN1bHVtOiAobmV3T25lKSA9PlxuICAgIEBjdXJyaWN1bGEuYWRkIG5ld09uZVxuICAgIG5ld09uZS5vbiBcIm5ld1wiLCBAYWRkQ3VycmljdWx1bVxuXG4gIGFkZExlc3NvblBsYW46IChuZXdPbmUpID0+XG4gICAgQGxlc3NvblBsYW5zLmFkZCBuZXdPbmVcbiAgICBuZXdPbmUub24gXCJuZXdcIiwgQGFkZExlc3NvblBsYW5cblxuICAjIE1ha2luZyBhIG5ldyBhc3Nlc3NtZW50XG4gIG5ld1RvZ2dsZTogLT4gQCRlbC5maW5kKCcubmV3X2Zvcm0sIC5uZXcnKS50b2dnbGUoKTsgZmFsc2VcblxuICBuZXdTYXZlOiAoZXZlbnQpID0+XG5cbiAgICAjIHRoaXMgaGFuZGxlcyBhbWJpZ3VvdXMgZXZlbnRzXG4gICAgIyB0aGUgaWRlYSBpcyB0byBzdXBwb3J0IGNsaWNrcyBhbmQgdGhlIGVudGVyIGtleVxuICAgICMgbG9naWM6XG4gICAgIyBpdCBpdCdzIGEga2V5c3Ryb2tlIGFuZCBpdCdzIG5vdCBlbnRlciwgYWN0IG5vcm1hbGx5LCBqdXN0IGEga2V5IHN0cm9rZVxuICAgICMgaWYgaXQncyBhIGNsaWNrIG9yIGVudGVyLCBwcm9jZXNzIHRoZSBmb3JtXG5cbiAgICBpZiBldmVudC50eXBlICE9IFwiY2xpY2tcIiAmJiBldmVudC53aGljaCAhPSAxM1xuICAgICAgcmV0dXJuIHRydWVcblxuICAgIG5hbWUgICAgPSBAJGVsLmZpbmQoJy5uZXdfbmFtZScpLnZhbCgpXG4gICAgbmV3VHlwZSA9IEAkZWwuZmluZChcIiNuZXdfdHlwZSBvcHRpb246c2VsZWN0ZWRcIikudmFsKClcbiAgICBuZXdJZCAgID0gVXRpbHMuZ3VpZCgpXG5cbiAgICBpZiBuYW1lLmxlbmd0aCA9PSAwXG4gICAgICBVdGlscy5taWRBbGVydCBcIjxzcGFuIGNsYXNzPSdlcnJvcic+Q291bGQgbm90IHNhdmUgPGltZyBzcmM9J2ltYWdlcy9pY29uX2Nsb3NlLnBuZycgY2xhc3M9J2NsZWFyX21lc3NhZ2UnPjwvc3Bhbj5cIlxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBpZiBuZXdUeXBlID09IFwiYXNzZXNzbWVudFwiXG4gICAgICBuZXdPYmplY3QgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICBcIm5hbWVcIiAgICAgICAgIDogbmFtZVxuICAgICAgICBcIl9pZFwiICAgICAgICAgIDogbmV3SWRcbiAgICAgICAgXCJhc3Nlc3NtZW50SWRcIiA6IG5ld0lkXG4gICAgICAgIFwiYXJjaGl2ZWRcIiAgICAgOiBmYWxzZVxuICAgICAgY2FsbGJhY2sgPSBAYWRkQXNzZXNzbWVudFxuICAgIGVsc2UgaWYgbmV3VHlwZSA9PSBcImN1cnJpY3VsdW1cIlxuICAgICAgbmV3T2JqZWN0ID0gbmV3IEN1cnJpY3VsdW1cbiAgICAgICAgXCJuYW1lXCIgICAgICAgICA6IG5hbWVcbiAgICAgICAgXCJfaWRcIiAgICAgICAgICA6IG5ld0lkXG4gICAgICAgIFwiY3VycmljdWx1bUlkXCIgOiBuZXdJZFxuICAgICAgY2FsbGJhY2sgPSBAYWRkQ3VycmljdWx1bVxuICAgIGVsc2UgaWYgbmV3VHlwZSA9PSBcImxlc3Nvbl9wbGFuXCJcbiAgICAgIG5ld09iamVjdCA9IG5ldyBMZXNzb25QbGFuXG4gICAgICAgIFwibmFtZVwiICAgICAgICAgOiBuYW1lXG4gICAgICAgIFwiX2lkXCIgICAgICAgICAgOiBuZXdJZFxuICAgICAgICBcImxlc3NvblBsYW5JZFwiIDogbmV3SWRcbiAgICAgIGNhbGxiYWNrID0gQGFkZExlc3NvblBsYW5cblxuICAgIG5ld09iamVjdC5zYXZlIG51bGwsXG4gICAgICBzdWNjZXNzIDogPT5cbiAgICAgICAgY2FsbGJhY2sobmV3T2JqZWN0KVxuICAgICAgICBAJGVsLmZpbmQoJy5uZXdfZm9ybSwgLm5ldycpLnRvZ2dsZSgpXG4gICAgICAgIEAkZWwuZmluZCgnLm5ld19uYW1lJykudmFsIFwiXCJcbiAgICAgICAgVXRpbHMubWlkQWxlcnQgXCIje25hbWV9IHNhdmVkXCJcbiAgICAgIGVycm9yOiA9PlxuICAgICAgICBAJGVsLmZpbmQoJy5uZXdfZm9ybSwgLm5ldycpLnRvZ2dsZSgpXG4gICAgICAgIEAkZWwuZmluZCgnLm5ld19uYW1lJykudmFsIFwiXCJcbiAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJQbGVhc2UgdHJ5IGFnYWluLiBFcnJvciBzYXZpbmcuXCJcblxuICAgIHJldHVybiBmYWxzZVxuXG4gICMgVmlld01hbmFnZXJcbiAgY2xvc2VWaWV3czogLT5cbiAgICBAYXNzZXNzbWVudHNWaWV3LmNsb3NlKClcbiAgICBAY3VycmljdWxhTGlzdFZpZXcuY2xvc2UoKVxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgQGNsb3NlVmlld3MoKVxuIl19
