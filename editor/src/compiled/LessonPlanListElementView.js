var LessonPlanListElementView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

LessonPlanListElementView = (function(superClass) {
  extend(LessonPlanListElementView, superClass);

  function LessonPlanListElementView() {
    this.assessmentDelete = bind(this.assessmentDelete, this);
    this.updateResultCount = bind(this.updateResultCount, this);
    this.update = bind(this.update, this);
    this.ghostLogin = bind(this.ghostLogin, this);
    return LessonPlanListElementView.__super__.constructor.apply(this, arguments);
  }

  LessonPlanListElementView.prototype.className = "LessonPlanListElementView";

  LessonPlanListElementView.prototype.tagName = "li";

  LessonPlanListElementView.prototype.events = Modernizr.touch ? {
    'click .assessment_menu_toggle': 'assessmentMenuToggle',
    'click .admin_name': 'assessmentMenuToggle',
    'click .sp_assessment_delete': 'assessmentDeleteToggle',
    'click .sp_assessment_delete_cancel': 'assessmentDeleteToggle',
    'click .sp_assessment_delete_confirm': 'assessmentDelete',
    'click .sp_copy': 'copyTo',
    'click .sp_duplicate': 'duplicate',
    'click .sp_update': 'update',
    'click .sp_print': 'togglePrint',
    'click .archive': 'archive',
    'click a': 'respondToLink',
    'change #print_format': 'print'
  } : {
    'click .assessment_menu_toggle': 'assessmentMenuToggle',
    'click .admin_name': 'assessmentMenuToggle',
    'click .sp_assessment_delete': 'assessmentDeleteToggle',
    'click .sp_assessment_delete_cancel': 'assessmentDeleteToggle',
    'click .sp_assessment_delete_confirm': 'assessmentDelete',
    'click .sp_copy': 'copyTo',
    'click .sp_duplicate': 'duplicate',
    'click .sp_update': 'update',
    'click .sp_print': 'togglePrint',
    'click .archive': 'archive',
    'change #print_format': 'print'
  };

  LessonPlanListElementView.prototype.blankResultCount = "-";

  LessonPlanListElementView.prototype.initialize = function(options) {
    this.model = options.model;
    this.parent = options.parent;
    return this.isAdmin = Tangerine.user.isAdmin();
  };

  LessonPlanListElementView.prototype.respondToLink = function(event) {
    var $target, route;
    $target = $(event.target);
    route = $target.attr("href");
    return Tangerine.router.navigate(route, true);
  };

  LessonPlanListElementView.prototype.duplicate = function() {
    var newName;
    newName = "Copy of " + this.model.get("name");
    return this.model.duplicate({
      name: newName
    }, null, null, (function(_this) {
      return function(assessment) {
        return _this.model.trigger("new", assessment);
      };
    })(this));
  };

  LessonPlanListElementView.prototype.copyTo = function(group) {
    return this.model.replicate(group, (function(_this) {
      return function() {
        return window.location = Tangerine.settings.urlIndex(group, "assessments");
      };
    })(this));
  };

  LessonPlanListElementView.prototype.ghostLogin = function() {
    return Tangerine.user.ghostLogin(Tangerine.settings.upUser, Tangerine.settings.upPass);
  };

  LessonPlanListElementView.prototype.update = function() {
    Utils.midAlert("Verifying connection");
    Utils.working(true);
    return this.model.verifyConnection({
      error: (function(_this) {
        return function() {
          Utils.working(false);
          Utils.midAlert("Verifying connection<br>Please retry update.");
          return _.delay(function() {
            return _this.ghostLogin();
          }, 5000);
        };
      })(this),
      success: (function(_this) {
        return function() {
          Utils.working(false);
          _this.model.on("status", function(message) {
            if (message === "import lookup") {
              return Utils.midAlert("Update starting");
            } else if (message === "import success") {
              Utils.midAlert("Updated");
              Utils.working(false);
              return _this.model.fetch({
                success: function() {
                  return _this.render();
                }
              });
            } else if (message === "import error") {
              Utils.working(false);
              return Utils.midAlert("Update failed");
            }
          });
          Utils.working(true);
          return _this.model.updateFromServer();
        };
      })(this)
    });
  };

  LessonPlanListElementView.prototype.togglePrint = function() {
    return this.$el.find(".print_format_wrapper").toggle();
  };

  LessonPlanListElementView.prototype.print = function() {
    var format;
    format = this.$el.find("#print_format option:selected").attr("data-format");
    if (format === "cancel") {
      this.$el.find(".print_format_wrapper").toggle();
      this.$el.find("#print_format").val("reset");
      return;
    }
    return Tangerine.router.navigate("print/" + this.model.id + "/" + format, true);
  };

  LessonPlanListElementView.prototype.updateResultCount = function() {};

  LessonPlanListElementView.prototype.archive = function() {
    var result;
    result = this.$el.find(".archive :selected").val() === "true";
    if (result === true) {
      this.$el.find(".admin_name").addClass("archived_assessment");
    } else {
      this.$el.find(".admin_name").removeClass("archived_assessment");
    }
    this.model.save({
      archived: result
    });
    return true;
  };

  LessonPlanListElementView.prototype.assessmentMenuToggle = function() {
    this.$el.find('.assessment_menu_toggle').toggleClass('sp_down').toggleClass('sp_right');
    return this.$el.find('.assessment_menu').toggle();
  };

  LessonPlanListElementView.prototype.assessmentDeleteToggle = function() {
    this.$el.find(".sp_assessment_delete_confirm").toggle();
    return false;
  };

  LessonPlanListElementView.prototype.assessmentDelete = function() {
    var options;
    options = {
      success: function() {
        return document.location.reload();
      }
    };
    this.model.destroyLessonPlan(options);
    return this.assessmentDeleteToggle();
  };

  LessonPlanListElementView.prototype.spriteListLink = function() {
    var i, len, name, names, result, tagName;
    tagName = arguments[0], names = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    result = "";
    for (i = 0, len = names.length; i < len; i++) {
      name = names[i];
      result += "<" + tagName + " class='sp_" + (name.underscore()) + "'><a href='#" + name + "/" + this.model.id + "'>" + (name.underscore().titleize()) + "</a></" + tagName + ">";
    }
    return result;
  };

  LessonPlanListElementView.prototype.spriteEvents = function() {
    var i, len, name, names, result, tagName;
    tagName = arguments[0], names = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    result = "";
    for (i = 0, len = names.length; i < len; i++) {
      name = names[i];
      result += "<" + tagName + "><button class='sp_" + (name.underscore()) + "' title='" + (name.underscore().titleize()) + "'>" + (name.underscore().titleize()) + "</button></" + tagName + "> ";
    }
    return result;
  };

  LessonPlanListElementView.prototype.ul = function(options) {
    var html;
    html = "<ul " + (options.cssClass ? "class='" + options.cssClass + "'" : '') + ">";
    html += this.spriteListLink.apply(this, ["li"].concat(options.links));
    html += options.other || '';
    return html += "</ul>";
  };

  LessonPlanListElementView.prototype.render = function() {
    var adminName, adminResultCount, archiveClass, archiveSwitch, deleteConfirm, downloadKey, format, isArchived, name, printSelector, resultCount, selected, toggleButton;
    isArchived = this.model.getBoolean('archived');
    archiveClass = isArchived ? " archived_assessment" : "";
    toggleButton = "<div class='assessment_menu_toggle sp_right'><div></div></div>";
    name = "<button class='name clickable'>" + (this.model.get('name')) + "</button>";
    adminName = "<button class='admin_name clickable " + archiveClass + "'>" + (this.model.get('lessonPlan_title')) + "</button>";
    adminResultCount = "<label class='result_count small_grey no_help' title='Result count. Click to update.'>Results <b>" + this.resultCount + "</b></label>";
    resultCount = "<span class='result_count no_help'>Results <b>" + this.resultCount + "</b></span>";
    selected = " selected='selected'";
    deleteConfirm = "<span class='sp_assessment_delete_confirm confirmation'><div class='menu_box'>Confirm <button class='sp_assessment_delete_yes command_red'>Delete</button> <button class='sp_assessment_delete_cancel command'>Cancel</button></div></span>";
    printSelector = "<div class='print_format_wrapper confirmation'> <select id='print_format'> <option disabled='disabled' selected='selected' value='reset'>Select a print format</option> " + ((function() {
      var i, len, ref, results;
      ref = Tangerine.settings.config.get("printFormats");
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        format = ref[i];
        results.push("<option data-format='" + format.key + "'>" + format.name + "</option>");
      }
      return results;
    })()) + " <option data-format='cancel'>Cancel</option> </select> </div>";
    downloadKey = "<li class='download_key small_grey'>Download key <b>" + (this.model.get("_id").substr(-5, 5)) + "</b></li>";
    archiveSwitch = "<select class='archive'> <option value='false' " + (isArchived ? selected : '') + ">Active</option> <option value='true'  " + (isArchived ? selected : '') + ">Archived</option> </select>";
    if (this.isAdmin) {
      this.$el.html("<div> " + toggleButton + " " + adminName + " </div> " + (this.ul({
        cssClass: "assessment_menu",
        links: ["run", "editLP"],
        other: this.spriteEvents("li", "assessment_delete") + downloadKey
      })) + " <div class='sub_menus'> " + deleteConfirm + " " + printSelector + " </div>");
    } else if (this.isAdmin && Tangerine.settings.getBoolean('satellite')) {
      this.$el.html("<div> " + toggleButton + " " + adminName + " </div> " + (this.ul({
        cssClass: "assessment_menu",
        links: ["run", "editLP"],
        other: this.spriteEvents("li", "assessment_delete") + downloadKey
      })) + " <div class='sub_menus'> " + deleteConfirm + " " + printSelector + " </div>");
    } else {
      this.$el.html("<div class='non_admin'> " + (this.spriteListLink("span", 'run')) + name + " " + (this.spriteListLink("span", 'results')) + " " + (this.spriteListLink("span", 'print')) + " </div> <div class='sub_menus'> " + printSelector + " </div>");
    }
    return this.trigger("rendered");
  };

  return LessonPlanListElementView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlc3NvblBsYW4vTGVzc29uUGxhbkxpc3RFbGVtZW50Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSx5QkFBQTtFQUFBOzs7OztBQUFNOzs7Ozs7Ozs7OztzQ0FFSixTQUFBLEdBQVk7O3NDQUVaLE9BQUEsR0FBVTs7c0NBRVYsTUFBQSxHQUFXLFNBQVMsQ0FBQyxLQUFiLEdBQXdCO0lBQzlCLCtCQUFBLEVBQXdDLHNCQURWO0lBRTlCLG1CQUFBLEVBQXdDLHNCQUZWO0lBRzlCLDZCQUFBLEVBQXdDLHdCQUhWO0lBSTlCLG9DQUFBLEVBQXdDLHdCQUpWO0lBSzlCLHFDQUFBLEVBQXdDLGtCQUxWO0lBTTlCLGdCQUFBLEVBQXdDLFFBTlY7SUFPOUIscUJBQUEsRUFBd0MsV0FQVjtJQVE5QixrQkFBQSxFQUF3QyxRQVJWO0lBUzlCLGlCQUFBLEVBQXdDLGFBVFY7SUFVOUIsZ0JBQUEsRUFBd0MsU0FWVjtJQVc5QixTQUFBLEVBQVksZUFYa0I7SUFhOUIsc0JBQUEsRUFBcUMsT0FiUDtHQUF4QixHQWNEO0lBQ0wsK0JBQUEsRUFBd0Msc0JBRG5DO0lBRUwsbUJBQUEsRUFBd0Msc0JBRm5DO0lBR0wsNkJBQUEsRUFBd0Msd0JBSG5DO0lBSUwsb0NBQUEsRUFBd0Msd0JBSm5DO0lBS0wscUNBQUEsRUFBd0Msa0JBTG5DO0lBTUwsZ0JBQUEsRUFBd0MsUUFObkM7SUFPTCxxQkFBQSxFQUF3QyxXQVBuQztJQVFMLGtCQUFBLEVBQXdDLFFBUm5DO0lBU0wsaUJBQUEsRUFBd0MsYUFUbkM7SUFVTCxnQkFBQSxFQUF3QyxTQVZuQztJQVlMLHNCQUFBLEVBQXFDLE9BWmhDOzs7c0NBZ0JQLGdCQUFBLEdBQWtCOztzQ0FFbEIsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUdWLElBQUMsQ0FBQSxLQUFELEdBQVksT0FBTyxDQUFDO0lBQ3BCLElBQUMsQ0FBQSxNQUFELEdBQVksT0FBTyxDQUFDO1dBR3BCLElBQUMsQ0FBQSxPQUFELEdBQWUs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SSxHQVdVLEdBWFYsR0FZSixhQVpJLEdBWVUsU0FacEIsRUFGRjtLQUFBLE1Ba0JLLElBQUcsSUFBQyxDQUFBLE9BQUQsSUFBYSxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQW5CLENBQThCLFdBQTlCLENBQWhCO01BRUgsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsUUFBQSxHQUVKLFlBRkksR0FFUyxHQUZULEdBR0osU0FISSxHQUdNLFVBSE4sR0FNUCxDQUFDLElBQUMsQ0FBQSxFQUFELENBQ0Y7UUFBQSxRQUFBLEVBQVUsaUJBQVY7UUFDQSxLQUFBLEVBQVEsQ0FBQyxLQUFELEVBQU8sUUFBUCxDQURSO1FBRUEsS0FBQSxFQUFRLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBZCxFQUFtQixtQkFBbkIsQ0FBQSxHQUEwQyxXQUZsRDtPQURFLENBQUQsQ0FOTyxHQVVULDJCQVZTLEdBWUosYUFaSSxHQVlVLEdBWlYsR0FhSixhQWJJLEdBYVUsU0FicEIsRUFGRztLQUFBLE1BQUE7TUFvQkgsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsMEJBQUEsR0FFTCxDQUFDLElBQUMsQ0FBQSxjQUFELENBQWdCLE1BQWhCLEVBQXVCLEtBQXZCLENBQUQsQ0FGSyxHQUU0QixJQUY1QixHQUVpQyxHQUZqQyxHQUVtQyxDQUFDLElBQUMsQ0FBQSxjQUFELENBQWdCLE1BQWhCLEVBQXVCLFNBQXZCLENBQUQsQ0FGbkMsR0FFc0UsR0FGdEUsR0FFd0UsQ0FBQyxJQUFDLENBQUEsY0FBRCxDQUFnQixNQUFoQixFQUF1QixPQUF2QixDQUFELENBRnhFLEdBRXlHLGtDQUZ6RyxHQUtKLGFBTEksR0FLVSxTQUxwQixFQXBCRzs7V0E4QkwsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO0VBcEZNOzs7O0dBOUo4QixRQUFRLENBQUMiLCJmaWxlIjoibGVzc29uUGxhbi9MZXNzb25QbGFuTGlzdEVsZW1lbnRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTGVzc29uUGxhbkxpc3RFbGVtZW50VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiBcIkxlc3NvblBsYW5MaXN0RWxlbWVudFZpZXdcIlxuXG4gIHRhZ05hbWUgOiBcImxpXCJcblxuICBldmVudHM6IGlmIE1vZGVybml6ci50b3VjaCB0aGVuIHtcbiAgICAnY2xpY2sgLmFzc2Vzc21lbnRfbWVudV90b2dnbGUnICAgICAgIDogJ2Fzc2Vzc21lbnRNZW51VG9nZ2xlJ1xuICAgICdjbGljayAuYWRtaW5fbmFtZScgICAgICAgICAgICAgICAgICAgOiAnYXNzZXNzbWVudE1lbnVUb2dnbGUnXG4gICAgJ2NsaWNrIC5zcF9hc3Nlc3NtZW50X2RlbGV0ZScgICAgICAgICA6ICdhc3Nlc3NtZW50RGVsZXRlVG9nZ2xlJ1xuICAgICdjbGljayAuc3BfYXNzZXNzbWVudF9kZWxldGVfY2FuY2VsJyAgOiAnYXNzZXNzbWVudERlbGV0ZVRvZ2dsZSdcbiAgICAnY2xpY2sgLnNwX2Fzc2Vzc21lbnRfZGVsZXRlX2NvbmZpcm0nIDogJ2Fzc2Vzc21lbnREZWxldGUnXG4gICAgJ2NsaWNrIC5zcF9jb3B5JyAgICAgICAgICAgICAgICAgICAgICA6ICdjb3B5VG8nXG4gICAgJ2NsaWNrIC5zcF9kdXBsaWNhdGUnICAgICAgICAgICAgICAgICA6ICdkdXBsaWNhdGUnXG4gICAgJ2NsaWNrIC5zcF91cGRhdGUnICAgICAgICAgICAgICAgICAgICA6ICd1cGRhdGUnXG4gICAgJ2NsaWNrIC5zcF9wcmludCcgICAgICAgICAgICAgICAgICAgICA6ICd0b2dnbGVQcmludCdcbiAgICAnY2xpY2sgLmFyY2hpdmUnICAgICAgICAgICAgICAgICAgICAgIDogJ2FyY2hpdmUnXG4gICAgJ2NsaWNrIGEnIDogJ3Jlc3BvbmRUb0xpbmsnXG5cbiAgICAnY2hhbmdlICNwcmludF9mb3JtYXQnICAgICAgICAgICAgIDogJ3ByaW50J1xuICB9IGVsc2Uge1xuICAgICdjbGljayAuYXNzZXNzbWVudF9tZW51X3RvZ2dsZScgICAgICAgOiAnYXNzZXNzbWVudE1lbnVUb2dnbGUnXG4gICAgJ2NsaWNrIC5hZG1pbl9uYW1lJyAgICAgICAgICAgICAgICAgICA6ICdhc3Nlc3NtZW50TWVudVRvZ2dsZSdcbiAgICAnY2xpY2sgLnNwX2Fzc2Vzc21lbnRfZGVsZXRlJyAgICAgICAgIDogJ2Fzc2Vzc21lbnREZWxldGVUb2dnbGUnXG4gICAgJ2NsaWNrIC5zcF9hc3Nlc3NtZW50X2RlbGV0ZV9jYW5jZWwnICA6ICdhc3Nlc3NtZW50RGVsZXRlVG9nZ2xlJ1xuICAgICdjbGljayAuc3BfYXNzZXNzbWVudF9kZWxldGVfY29uZmlybScgOiAnYXNzZXNzbWVudERlbGV0ZSdcbiAgICAnY2xpY2sgLnNwX2NvcHknICAgICAgICAgICAgICAgICAgICAgIDogJ2NvcHlUbydcbiAgICAnY2xpY2sgLnNwX2R1cGxpY2F0ZScgICAgICAgICAgICAgICAgIDogJ2R1cGxpY2F0ZSdcbiAgICAnY2xpY2sgLnNwX3VwZGF0ZScgICAgICAgICAgICAgICAgICAgIDogJ3VwZGF0ZSdcbiAgICAnY2xpY2sgLnNwX3ByaW50JyAgICAgICAgICAgICAgICAgICAgIDogJ3RvZ2dsZVByaW50J1xuICAgICdjbGljayAuYXJjaGl2ZScgICAgICAgICAgICAgICAgICAgICAgOiAnYXJjaGl2ZSdcblxuICAgICdjaGFuZ2UgI3ByaW50X2Zvcm1hdCcgICAgICAgICAgICAgOiAncHJpbnQnXG4gIH1cblxuXG4gIGJsYW5rUmVzdWx0Q291bnQ6IFwiLVwiXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgXG4gICAgI2FyZ3VtZW50c1xuICAgIEBtb2RlbCAgICA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ICAgPSBvcHRpb25zLnBhcmVudFxuXG4gICAgIyBzd2l0Y2hlcyBhbmQgdGhpbmdzXG4gICAgQGlzQWRtaW4gICAgID0gVGFuZ2VyaW5lLnVzZXIuaXNBZG1pbigpXG5cbiAgcmVzcG9uZFRvTGluazogKGV2ZW50KSAtPlxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICByb3V0ZSAgID0gJHRhcmdldC5hdHRyKFwiaHJlZlwiKVxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUocm91dGUsIHRydWUpXG5cbiAgZHVwbGljYXRlOiAtPlxuICAgIG5ld05hbWUgPSBcIkNvcHkgb2YgXCIgKyBAbW9kZWwuZ2V0KFwibmFtZVwiKVxuICAgIEBtb2RlbC5kdXBsaWNhdGUgeyBuYW1lIDogbmV3TmFtZSB9LCBudWxsLCBudWxsLCAoYXNzZXNzbWVudCkgPT5cbiAgICAgIEBtb2RlbC50cmlnZ2VyIFwibmV3XCIsIGFzc2Vzc21lbnRcblxuICBjb3B5VG86IChncm91cCkgLT5cbiAgICBAbW9kZWwucmVwbGljYXRlIGdyb3VwLCA9PlxuICAgICAgd2luZG93LmxvY2F0aW9uID0gVGFuZ2VyaW5lLnNldHRpbmdzLnVybEluZGV4KGdyb3VwLCBcImFzc2Vzc21lbnRzXCIpXG5cbiAgZ2hvc3RMb2dpbjogPT5cbiAgICBUYW5nZXJpbmUudXNlci5naG9zdExvZ2luIFRhbmdlcmluZS5zZXR0aW5ncy51cFVzZXIsIFRhbmdlcmluZS5zZXR0aW5ncy51cFBhc3NcblxuICB1cGRhdGU6ID0+XG4gICAgVXRpbHMubWlkQWxlcnQgXCJWZXJpZnlpbmcgY29ubmVjdGlvblwiXG4gICAgVXRpbHMud29ya2luZyB0cnVlXG5cbiAgICBAbW9kZWwudmVyaWZ5Q29ubmVjdGlvblxuICAgICAgZXJyb3I6ID0+XG4gICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJWZXJpZnlpbmcgY29ubmVjdGlvbjxicj5QbGVhc2UgcmV0cnkgdXBkYXRlLlwiXG4gICAgICAgIF8uZGVsYXkgPT5cbiAgICAgICAgICBAZ2hvc3RMb2dpbigpXG4gICAgICAgICwgNTAwMFxuXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBVdGlscy53b3JraW5nIGZhbHNlXG4gICAgICAgIEBtb2RlbC5vbiBcInN0YXR1c1wiLCAobWVzc2FnZSkgPT5cbiAgICAgICAgICBpZiBtZXNzYWdlID09IFwiaW1wb3J0IGxvb2t1cFwiXG4gICAgICAgICAgICBVdGlscy5taWRBbGVydCBcIlVwZGF0ZSBzdGFydGluZ1wiXG4gICAgICAgICAgZWxzZSBpZiBtZXNzYWdlID09IFwiaW1wb3J0IHN1Y2Nlc3NcIlxuICAgICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJVcGRhdGVkXCJcbiAgICAgICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgICAgICAgIEBtb2RlbC5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgICAgICAgIEByZW5kZXIoKVxuICAgICAgICAgIGVsc2UgaWYgbWVzc2FnZSA9PSBcImltcG9ydCBlcnJvclwiXG4gICAgICAgICAgICBVdGlscy53b3JraW5nIGZhbHNlXG4gICAgICAgICAgICBVdGlscy5taWRBbGVydCBcIlVwZGF0ZSBmYWlsZWRcIlxuICAgICAgICBVdGlscy53b3JraW5nIHRydWVcbiAgICAgICAgQG1vZGVsLnVwZGF0ZUZyb21TZXJ2ZXIoKVxuXG4gIHRvZ2dsZVByaW50OiAtPlxuICAgIEAkZWwuZmluZChcIi5wcmludF9mb3JtYXRfd3JhcHBlclwiKS50b2dnbGUoKVxuXG4gIHByaW50OiAtPlxuICAgIGZvcm1hdCA9IEAkZWwuZmluZChcIiNwcmludF9mb3JtYXQgb3B0aW9uOnNlbGVjdGVkXCIpLmF0dHIoXCJkYXRhLWZvcm1hdFwiKVxuXG4gICAgaWYgZm9ybWF0ID09IFwiY2FuY2VsXCJcbiAgICAgIEAkZWwuZmluZChcIi5wcmludF9mb3JtYXRfd3JhcHBlclwiKS50b2dnbGUoKVxuICAgICAgQCRlbC5maW5kKFwiI3ByaW50X2Zvcm1hdFwiKS52YWwoXCJyZXNldFwiKVxuICAgICAgcmV0dXJuXG5cbiAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwicHJpbnQvI3tAbW9kZWwuaWR9LyN7Zm9ybWF0fVwiLCB0cnVlXG5cblxuICB1cGRhdGVSZXN1bHRDb3VudDogPT5cbiNAcmVzdWx0Q291bnQgPSBNYXRoLmNvbW1hcyBAbW9kZWwucmVzdWx0Q291bnRcbiNAJGVsLmZpbmQoXCIucmVzdWx0X2NvdW50XCIpLmh0bWwgXCJSZXN1bHRzIDxiPiN7QHJlc3VsdENvdW50fTwvYj5cIlxuXG4gIGFyY2hpdmU6IC0+XG4gICAgcmVzdWx0ID0gQCRlbC5maW5kKFwiLmFyY2hpdmUgOnNlbGVjdGVkXCIpLnZhbCgpID09IFwidHJ1ZVwiXG4gICAgaWYgcmVzdWx0ID09IHRydWVcbiAgICAgIEAkZWwuZmluZChcIi5hZG1pbl9uYW1lXCIpLmFkZENsYXNzIFwiYXJjaGl2ZWRfYXNzZXNzbWVudFwiXG4gICAgZWxzZVxuICAgICAgQCRlbC5maW5kKFwiLmFkbWluX25hbWVcIikucmVtb3ZlQ2xhc3MgXCJhcmNoaXZlZF9hc3Nlc3NtZW50XCJcblxuICAgIEBtb2RlbC5zYXZlXG4gICAgICBhcmNoaXZlZCA6IHJlc3VsdFxuICAgIHJldHVybiB0cnVlXG5cbiAgYXNzZXNzbWVudE1lbnVUb2dnbGU6IC0+XG4gICAgQCRlbC5maW5kKCcuYXNzZXNzbWVudF9tZW51X3RvZ2dsZScpLnRvZ2dsZUNsYXNzKCdzcF9kb3duJykudG9nZ2xlQ2xhc3MoJ3NwX3JpZ2h0JylcbiAgICBAJGVsLmZpbmQoJy5hc3Nlc3NtZW50X21lbnUnKS50b2dnbGUoKVxuXG4gIGFzc2Vzc21lbnREZWxldGVUb2dnbGU6IC0+XG4gICAgQCRlbC5maW5kKFwiLnNwX2Fzc2Vzc21lbnRfZGVsZXRlX2NvbmZpcm1cIikudG9nZ2xlKCk7IGZhbHNlXG5cbiMgZGVlcCBub24tZ2VybmVyaWMgZGVsZXRlXG4gIGFzc2Vzc21lbnREZWxldGU6ID0+XG4jIHJlbW92ZXMgZnJvbSBjb2xsZWN0aW9uXG4gICAgb3B0aW9ucyA9XG4gICAgICBzdWNjZXNzOiAoKS0+XG4gICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgQG1vZGVsLmRlc3Ryb3lMZXNzb25QbGFuKG9wdGlvbnMpXG4gICAgQGFzc2Vzc21lbnREZWxldGVUb2dnbGUoKVxuXG5cbiAgc3ByaXRlTGlzdExpbms6ICggdGFnTmFtZSwgbmFtZXMuLi4gKSAtPlxuICAgIHJlc3VsdCA9IFwiXCJcbiAgICBmb3IgbmFtZSBpbiBuYW1lc1xuICAgICAgcmVzdWx0ICs9IFwiPCN7dGFnTmFtZX0gY2xhc3M9J3NwXyN7bmFtZS51bmRlcnNjb3JlKCl9Jz48YSBocmVmPScjI3tuYW1lfS8je0Btb2RlbC5pZH0nPiN7bmFtZS51bmRlcnNjb3JlKCkudGl0bGVpemUoKX08L2E+PC8je3RhZ05hbWV9PlwiXG4gICAgcmV0dXJuIHJlc3VsdFxuXG4gIHNwcml0ZUV2ZW50czogKCB0YWdOYW1lLCBuYW1lcy4uLikgLT5cbiAgICByZXN1bHQgPSBcIlwiXG4gICAgZm9yIG5hbWUgaW4gbmFtZXNcbiAgICAgIHJlc3VsdCArPSBcIjwje3RhZ05hbWV9PjxidXR0b24gY2xhc3M9J3NwXyN7bmFtZS51bmRlcnNjb3JlKCl9JyB0aXRsZT0nI3tuYW1lLnVuZGVyc2NvcmUoKS50aXRsZWl6ZSgpfSc+I3tuYW1lLnVuZGVyc2NvcmUoKS50aXRsZWl6ZSgpfTwvYnV0dG9uPjwvI3t0YWdOYW1lfT4gXCJcbiAgICByZXR1cm4gcmVzdWx0XG5cbiAgdWw6IChvcHRpb25zKS0+XG5cbiAgICBodG1sID0gXCI8dWwgI3tpZiBvcHRpb25zLmNzc0NsYXNzIHRoZW4gXCJjbGFzcz0nI3tvcHRpb25zLmNzc0NsYXNzfSdcIiBlbHNlICcnfT5cIlxuICAgIGh0bWwgKz0gQHNwcml0ZUxpc3RMaW5rLmFwcGx5IEAsIFtcImxpXCJdLmNvbmNhdChvcHRpb25zLmxpbmtzKVxuICAgIGh0bWwgKz0gb3B0aW9ucy5vdGhlciB8fCAnJ1xuICAgIGh0bWwgKz0gXCI8L3VsPlwiXG5cbiAgcmVuZGVyOiAtPlxuXG4gICAgaXNBcmNoaXZlZCA9IEBtb2RlbC5nZXRCb29sZWFuKCdhcmNoaXZlZCcpXG5cbiAgICAjIGNvbW1hbmRzXG5cbiAgICAjIGluZGljYXRvcnMgYW5kIHZhcmlhYmxlc1xuICAgIGFyY2hpdmVDbGFzcyAgICAgPSBpZiBpc0FyY2hpdmVkIHRoZW4gXCIgYXJjaGl2ZWRfYXNzZXNzbWVudFwiIGVsc2UgXCJcIlxuXG4gICAgdG9nZ2xlQnV0dG9uICAgICA9IFwiPGRpdiBjbGFzcz0nYXNzZXNzbWVudF9tZW51X3RvZ2dsZSBzcF9yaWdodCc+PGRpdj48L2Rpdj48L2Rpdj5cIlxuICAgIG5hbWUgICAgICAgICAgICAgPSBcIjxidXR0b24gY2xhc3M9J25hbWUgY2xpY2thYmxlJz4je0Btb2RlbC5nZXQoJ25hbWUnKX08L2J1dHRvbj5cIlxuICAgIGFkbWluTmFtZSAgICAgICAgPSBcIjxidXR0b24gY2xhc3M9J2FkbWluX25hbWUgY2xpY2thYmxlICN7YXJjaGl2ZUNsYXNzfSc+I3tAbW9kZWwuZ2V0KCdsZXNzb25QbGFuX3RpdGxlJyl9PC9idXR0b24+XCJcbiAgICBhZG1pblJlc3VsdENvdW50ID0gXCI8bGFiZWwgY2xhc3M9J3Jlc3VsdF9jb3VudCBzbWFsbF9ncmV5IG5vX2hlbHAnIHRpdGxlPSdSZXN1bHQgY291bnQuIENsaWNrIHRvIHVwZGF0ZS4nPlJlc3VsdHMgPGI+I3tAcmVzdWx0Q291bnR9PC9iPjwvbGFiZWw+XCJcbiAgICByZXN1bHRDb3VudCAgICAgID0gXCI8c3BhbiBjbGFzcz0ncmVzdWx0X2NvdW50IG5vX2hlbHAnPlJlc3VsdHMgPGI+I3tAcmVzdWx0Q291bnR9PC9iPjwvc3Bhbj5cIlxuICAgIHNlbGVjdGVkICAgICAgICAgPSBcIiBzZWxlY3RlZD0nc2VsZWN0ZWQnXCJcblxuICAgIGRlbGV0ZUNvbmZpcm0gICA9IFwiPHNwYW4gY2xhc3M9J3NwX2Fzc2Vzc21lbnRfZGVsZXRlX2NvbmZpcm0gY29uZmlybWF0aW9uJz48ZGl2IGNsYXNzPSdtZW51X2JveCc+Q29uZmlybSA8YnV0dG9uIGNsYXNzPSdzcF9hc3Nlc3NtZW50X2RlbGV0ZV95ZXMgY29tbWFuZF9yZWQnPkRlbGV0ZTwvYnV0dG9uPiA8YnV0dG9uIGNsYXNzPSdzcF9hc3Nlc3NtZW50X2RlbGV0ZV9jYW5jZWwgY29tbWFuZCc+Q2FuY2VsPC9idXR0b24+PC9kaXY+PC9zcGFuPlwiXG5cbiAgICBwcmludFNlbGVjdG9yICAgPSBcIlxuICAgICAgPGRpdiBjbGFzcz0ncHJpbnRfZm9ybWF0X3dyYXBwZXIgY29uZmlybWF0aW9uJz5cbiAgICAgICAgPHNlbGVjdCBpZD0ncHJpbnRfZm9ybWF0Jz5cbiAgICAgICAgPG9wdGlvbiBkaXNhYmxlZD0nZGlzYWJsZWQnIHNlbGVjdGVkPSdzZWxlY3RlZCcgdmFsdWU9J3Jlc2V0Jz5TZWxlY3QgYSBwcmludCBmb3JtYXQ8L29wdGlvbj5cbiAgICAgICAgI3soXCI8b3B0aW9uIGRhdGEtZm9ybWF0PScje2Zvcm1hdC5rZXl9Jz4je2Zvcm1hdC5uYW1lfTwvb3B0aW9uPlwiKSBmb3IgZm9ybWF0IGluIFRhbmdlcmluZS5zZXR0aW5ncy5jb25maWcuZ2V0KFwicHJpbnRGb3JtYXRzXCIpfVxuICAgICAgICA8b3B0aW9uIGRhdGEtZm9ybWF0PSdjYW5jZWwnPkNhbmNlbDwvb3B0aW9uPlxuICAgICAgICA8L3NlbGVjdD5cbiAgICAgIDwvZGl2PlxuICAgIFwiXG5cbiAgICBkb3dubG9hZEtleSAgID0gXCI8bGkgY2xhc3M9J2Rvd25sb2FkX2tleSBzbWFsbF9ncmV5Jz5Eb3dubG9hZCBrZXkgPGI+I3tAbW9kZWwuZ2V0KFwiX2lkXCIpLnN1YnN0cigtNSw1KX08L2I+PC9saT5cIlxuICAgIGFyY2hpdmVTd2l0Y2ggPSBcIlxuICAgICAgPHNlbGVjdCBjbGFzcz0nYXJjaGl2ZSc+XG4gICAgICAgIDxvcHRpb24gdmFsdWU9J2ZhbHNlJyAje2lmIGlzQXJjaGl2ZWQgdGhlbiBzZWxlY3RlZCBlbHNlICcnfT5BY3RpdmU8L29wdGlvbj5cbiAgICAgICAgPG9wdGlvbiB2YWx1ZT0ndHJ1ZScgICN7aWYgaXNBcmNoaXZlZCB0aGVuIHNlbGVjdGVkIGVsc2UgJyd9PkFyY2hpdmVkPC9vcHRpb24+XG4gICAgICA8L3NlbGVjdD5cbiAgICBcIlxuXG4gICAgaWYgQGlzQWRtaW5cbiMgYWRtaW4gc3RhbmRhcmRcbiAgICAgIEAkZWwuaHRtbCBcIlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICN7dG9nZ2xlQnV0dG9ufVxuICAgICAgICAgICN7YWRtaW5OYW1lfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgI3tAdWxcbiAgICAgICAgY3NzQ2xhc3MgOiBcImFzc2Vzc21lbnRfbWVudVwiXG4gICAgICAgIGxpbmtzIDogW1wicnVuXCIsIFwiZWRpdExQXCIgXVxuICAgICAgICBvdGhlciA6IEBzcHJpdGVFdmVudHMoXCJsaVwiLCBcImFzc2Vzc21lbnRfZGVsZXRlXCIpICsgZG93bmxvYWRLZXlcbiAgICAgIH1cbiAgICAgICAgPGRpdiBjbGFzcz0nc3ViX21lbnVzJz5cbiAgICAgICAgICAje2RlbGV0ZUNvbmZpcm19XG4gICAgICAgICAgI3twcmludFNlbGVjdG9yfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgXCJcblxuICAgIGVsc2UgaWYgQGlzQWRtaW4gYW5kIFRhbmdlcmluZS5zZXR0aW5ncy5nZXRCb29sZWFuKCdzYXRlbGxpdGUnKVxuXG4gICAgICBAJGVsLmh0bWwgXCJcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAje3RvZ2dsZUJ1dHRvbn1cbiAgICAgICAgICAje2FkbWluTmFtZX1cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgI3tAdWxcbiAgICAgICAgY3NzQ2xhc3M6IFwiYXNzZXNzbWVudF9tZW51XCJcbiAgICAgICAgbGlua3MgOiBbXCJydW5cIixcImVkaXRMUFwiXVxuICAgICAgICBvdGhlciA6IEBzcHJpdGVFdmVudHMoXCJsaVwiLFwiYXNzZXNzbWVudF9kZWxldGVcIikgKyBkb3dubG9hZEtleVxuICAgICAgfVxuICAgICAgICA8ZGl2IGNsYXNzPSdzdWJfbWVudXMnPlxuICAgICAgICAgICN7ZGVsZXRlQ29uZmlybX1cbiAgICAgICAgICAje3ByaW50U2VsZWN0b3J9XG4gICAgICAgIDwvZGl2PlxuICAgICAgXCJcblxuICAgIGVsc2VcbiAgICAgIEAkZWwuaHRtbCBcIlxuICAgICAgICA8ZGl2IGNsYXNzPSdub25fYWRtaW4nPlxuICAgICAgICAgICN7QHNwcml0ZUxpc3RMaW5rKFwic3BhblwiLCdydW4nKX0je25hbWV9ICN7QHNwcml0ZUxpc3RMaW5rKFwic3BhblwiLCdyZXN1bHRzJyl9ICN7QHNwcml0ZUxpc3RMaW5rKFwic3BhblwiLCdwcmludCcpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nc3ViX21lbnVzJz5cbiAgICAgICAgICAje3ByaW50U2VsZWN0b3J9XG4gICAgICAgIDwvZGl2PlxuICAgICAgXCJcblxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4iXX0=
