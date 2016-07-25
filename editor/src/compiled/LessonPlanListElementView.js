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
    return this.model.destroy();
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
    adminName = "<button class='admin_name clickable " + archiveClass + "'>" + (this.model.get('name')) + "</button>";
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
        links: ["run", "dataEntry", "results", "edit", "sync", "print"],
        other: this.spriteEvents("li", "duplicate", "assessment_delete") + downloadKey
      })) + " <div class='sub_menus'> " + deleteConfirm + " " + printSelector + " </div>");
    } else if (this.isAdmin && Tangerine.settings.getBoolean('satellite')) {
      this.$el.html("<div> " + toggleButton + " " + adminName + " </div> " + (this.ul({
        cssClass: "assessment_menu",
        links: ["run", "results", "edit", "sync", "print"],
        other: this.spriteEvents("li", "duplicate", "assessment_delete") + downloadKey
      })) + " <div class='sub_menus'> " + deleteConfirm + " " + printSelector + " </div>");
    } else {
      this.$el.html("<div class='non_admin'> " + (this.spriteListLink("span", 'run')) + name + " " + (this.spriteListLink("span", 'results')) + " " + (this.spriteListLink("span", 'print')) + " </div> <div class='sub_menus'> " + printSelector + " </div>");
    }
    return this.trigger("rendered");
  };

  return LessonPlanListElementView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlc3NvblBsYW4vTGVzc29uUGxhbkxpc3RFbGVtZW50Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSx5QkFBQTtFQUFBOzs7OztBQUFNOzs7Ozs7Ozs7OztzQ0FFSixTQUFBLEdBQVk7O3NDQUVaLE9BQUEsR0FBVTs7c0NBRVYsTUFBQSxHQUFXLFNBQVMsQ0FBQyxLQUFiLEdBQXdCO0lBQzlCLCtCQUFBLEVBQXdDLHNCQURWO0lBRTlCLG1CQUFBLEVBQXdDLHNCQUZWO0lBRzlCLDZCQUFBLEVBQXdDLHdCQUhWO0lBSTlCLG9DQUFBLEVBQXdDLHdCQUpWO0lBSzlCLHFDQUFBLEVBQXdDLGtCQUxWO0lBTTlCLGdCQUFBLEVBQXdDLFFBTlY7SUFPOUIscUJBQUEsRUFBd0MsV0FQVjtJQVE5QixrQkFBQSxFQUF3QyxRQVJWO0lBUzlCLGlCQUFBLEVBQXdDLGFBVFY7SUFVOUIsZ0JBQUEsRUFBd0MsU0FWVjtJQVc5QixTQUFBLEVBQVksZUFYa0I7SUFhOUIsc0JBQUEsRUFBcUMsT0FiUDtHQUF4QixHQWNEO0lBQ0wsK0JBQUEsRUFBd0Msc0JBRG5DO0lBRUwsbUJBQUEsRUFBd0Msc0JBRm5DO0lBR0wsNkJBQUEsRUFBd0Msd0JBSG5DO0lBSUwsb0NBQUEsRUFBd0Msd0JBSm5DO0lBS0wscUNBQUEsRUFBd0Msa0JBTG5DO0lBTUwsZ0JBQUEsRUFBd0MsUUFObkM7SUFPTCxxQkFBQSxFQUF3QyxXQVBuQztJQVFMLGtCQUFBLEVBQXdDLFFBUm5DO0lBU0wsaUJBQUEsRUFBd0MsYUFUbkM7SUFVTCxnQkFBQSxFQUF3QyxTQVZuQztJQVlMLHNCQUFBLEVBQXFDLE9BWmhDOzs7c0NBZ0JQLGdCQUFBLEdBQWtCOztzQ0FFbEIsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUdWLElBQUMsQ0FBQSxLQUFELEdBQVksT0FBTyxDQUFDO0lBQ3BCLElBQUMsQ0FBQSxNQUFELEdBQVksT0FBTyxDQUFDO1dBR3BCLElBQUMsQ0FBQSxPQUFELEdBQWUs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RCxJQUFhLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBbkIsQ0FBOEIsV0FBOUIsQ0FBaEI7TUFFSCxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxRQUFBLEdBRUosWUFGSSxHQUVTLEdBRlQsR0FHSixTQUhJLEdBR00sVUFITixHQU1QLENBQUMsSUFBQyxDQUFBLEVBQUQsQ0FDRjtRQUFBLFFBQUEsRUFBVSxpQkFBVjtRQUNBLEtBQUEsRUFBUSxDQUFDLEtBQUQsRUFBTyxTQUFQLEVBQWlCLE1BQWpCLEVBQXdCLE1BQXhCLEVBQStCLE9BQS9CLENBRFI7UUFFQSxLQUFBLEVBQVEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFkLEVBQW9CLFdBQXBCLEVBQWlDLG1CQUFqQyxDQUFBLEdBQXdELFdBRmhFO09BREUsQ0FBRCxDQU5PLEdBVVQsMkJBVlMsR0FZSixhQVpJLEdBWVUsR0FaVixHQWFKLGFBYkksR0FhVSxTQWJwQixFQUZHO0tBQUEsTUFBQTtNQW9CSCxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSwwQkFBQSxHQUVMLENBQUMsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsTUFBaEIsRUFBdUIsS0FBdkIsQ0FBRCxDQUZLLEdBRTRCLElBRjVCLEdBRWlDLEdBRmpDLEdBRW1DLENBQUMsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsTUFBaEIsRUFBdUIsU0FBdkIsQ0FBRCxDQUZuQyxHQUVzRSxHQUZ0RSxHQUV3RSxDQUFDLElBQUMsQ0FBQSxjQUFELENBQWdCLE1BQWhCLEVBQXVCLE9BQXZCLENBQUQsQ0FGeEUsR0FFeUcsa0NBRnpHLEdBS0osYUFMSSxHQUtVLFNBTHBCLEVBcEJHOztXQThCTCxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUFwRk07Ozs7R0F6SjhCLFFBQVEsQ0FBQyIsImZpbGUiOiJsZXNzb25QbGFuL0xlc3NvblBsYW5MaXN0RWxlbWVudFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBMZXNzb25QbGFuTGlzdEVsZW1lbnRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiTGVzc29uUGxhbkxpc3RFbGVtZW50Vmlld1wiXG5cbiAgdGFnTmFtZSA6IFwibGlcIlxuXG4gIGV2ZW50czogaWYgTW9kZXJuaXpyLnRvdWNoIHRoZW4ge1xuICAgICdjbGljayAuYXNzZXNzbWVudF9tZW51X3RvZ2dsZScgICAgICAgOiAnYXNzZXNzbWVudE1lbnVUb2dnbGUnXG4gICAgJ2NsaWNrIC5hZG1pbl9uYW1lJyAgICAgICAgICAgICAgICAgICA6ICdhc3Nlc3NtZW50TWVudVRvZ2dsZSdcbiAgICAnY2xpY2sgLnNwX2Fzc2Vzc21lbnRfZGVsZXRlJyAgICAgICAgIDogJ2Fzc2Vzc21lbnREZWxldGVUb2dnbGUnXG4gICAgJ2NsaWNrIC5zcF9hc3Nlc3NtZW50X2RlbGV0ZV9jYW5jZWwnICA6ICdhc3Nlc3NtZW50RGVsZXRlVG9nZ2xlJ1xuICAgICdjbGljayAuc3BfYXNzZXNzbWVudF9kZWxldGVfY29uZmlybScgOiAnYXNzZXNzbWVudERlbGV0ZSdcbiAgICAnY2xpY2sgLnNwX2NvcHknICAgICAgICAgICAgICAgICAgICAgIDogJ2NvcHlUbydcbiAgICAnY2xpY2sgLnNwX2R1cGxpY2F0ZScgICAgICAgICAgICAgICAgIDogJ2R1cGxpY2F0ZSdcbiAgICAnY2xpY2sgLnNwX3VwZGF0ZScgICAgICAgICAgICAgICAgICAgIDogJ3VwZGF0ZSdcbiAgICAnY2xpY2sgLnNwX3ByaW50JyAgICAgICAgICAgICAgICAgICAgIDogJ3RvZ2dsZVByaW50J1xuICAgICdjbGljayAuYXJjaGl2ZScgICAgICAgICAgICAgICAgICAgICAgOiAnYXJjaGl2ZSdcbiAgICAnY2xpY2sgYScgOiAncmVzcG9uZFRvTGluaydcblxuICAgICdjaGFuZ2UgI3ByaW50X2Zvcm1hdCcgICAgICAgICAgICAgOiAncHJpbnQnXG4gIH0gZWxzZSB7XG4gICAgJ2NsaWNrIC5hc3Nlc3NtZW50X21lbnVfdG9nZ2xlJyAgICAgICA6ICdhc3Nlc3NtZW50TWVudVRvZ2dsZSdcbiAgICAnY2xpY2sgLmFkbWluX25hbWUnICAgICAgICAgICAgICAgICAgIDogJ2Fzc2Vzc21lbnRNZW51VG9nZ2xlJ1xuICAgICdjbGljayAuc3BfYXNzZXNzbWVudF9kZWxldGUnICAgICAgICAgOiAnYXNzZXNzbWVudERlbGV0ZVRvZ2dsZSdcbiAgICAnY2xpY2sgLnNwX2Fzc2Vzc21lbnRfZGVsZXRlX2NhbmNlbCcgIDogJ2Fzc2Vzc21lbnREZWxldGVUb2dnbGUnXG4gICAgJ2NsaWNrIC5zcF9hc3Nlc3NtZW50X2RlbGV0ZV9jb25maXJtJyA6ICdhc3Nlc3NtZW50RGVsZXRlJ1xuICAgICdjbGljayAuc3BfY29weScgICAgICAgICAgICAgICAgICAgICAgOiAnY29weVRvJ1xuICAgICdjbGljayAuc3BfZHVwbGljYXRlJyAgICAgICAgICAgICAgICAgOiAnZHVwbGljYXRlJ1xuICAgICdjbGljayAuc3BfdXBkYXRlJyAgICAgICAgICAgICAgICAgICAgOiAndXBkYXRlJ1xuICAgICdjbGljayAuc3BfcHJpbnQnICAgICAgICAgICAgICAgICAgICAgOiAndG9nZ2xlUHJpbnQnXG4gICAgJ2NsaWNrIC5hcmNoaXZlJyAgICAgICAgICAgICAgICAgICAgICA6ICdhcmNoaXZlJ1xuXG4gICAgJ2NoYW5nZSAjcHJpbnRfZm9ybWF0JyAgICAgICAgICAgICA6ICdwcmludCdcbiAgfVxuXG5cbiAgYmxhbmtSZXN1bHRDb3VudDogXCItXCJcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBcbiAgICAjYXJndW1lbnRzXG4gICAgQG1vZGVsICAgID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgICA9IG9wdGlvbnMucGFyZW50XG5cbiAgICAjIHN3aXRjaGVzIGFuZCB0aGluZ3NcbiAgICBAaXNBZG1pbiAgICAgPSBUYW5nZXJpbmUudXNlci5pc0FkbWluKClcblxuICByZXNwb25kVG9MaW5rOiAoZXZlbnQpIC0+XG4gICAgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KVxuICAgIHJvdXRlICAgPSAkdGFyZ2V0LmF0dHIoXCJocmVmXCIpXG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZShyb3V0ZSwgdHJ1ZSlcblxuICBkdXBsaWNhdGU6IC0+XG4gICAgbmV3TmFtZSA9IFwiQ29weSBvZiBcIiArIEBtb2RlbC5nZXQoXCJuYW1lXCIpXG4gICAgQG1vZGVsLmR1cGxpY2F0ZSB7IG5hbWUgOiBuZXdOYW1lIH0sIG51bGwsIG51bGwsIChhc3Nlc3NtZW50KSA9PlxuICAgICAgQG1vZGVsLnRyaWdnZXIgXCJuZXdcIiwgYXNzZXNzbWVudFxuXG4gIGNvcHlUbzogKGdyb3VwKSAtPlxuICAgIEBtb2RlbC5yZXBsaWNhdGUgZ3JvdXAsID0+XG4gICAgICB3aW5kb3cubG9jYXRpb24gPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsSW5kZXgoZ3JvdXAsIFwiYXNzZXNzbWVudHNcIilcblxuICBnaG9zdExvZ2luOiA9PlxuICAgIFRhbmdlcmluZS51c2VyLmdob3N0TG9naW4gVGFuZ2VyaW5lLnNldHRpbmdzLnVwVXNlciwgVGFuZ2VyaW5lLnNldHRpbmdzLnVwUGFzc1xuXG4gIHVwZGF0ZTogPT5cbiAgICBVdGlscy5taWRBbGVydCBcIlZlcmlmeWluZyBjb25uZWN0aW9uXCJcbiAgICBVdGlscy53b3JraW5nIHRydWVcblxuICAgIEBtb2RlbC52ZXJpZnlDb25uZWN0aW9uXG4gICAgICBlcnJvcjogPT5cbiAgICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgICBVdGlscy5taWRBbGVydCBcIlZlcmlmeWluZyBjb25uZWN0aW9uPGJyPlBsZWFzZSByZXRyeSB1cGRhdGUuXCJcbiAgICAgICAgXy5kZWxheSA9PlxuICAgICAgICAgIEBnaG9zdExvZ2luKClcbiAgICAgICAgLCA1MDAwXG5cbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgICAgQG1vZGVsLm9uIFwic3RhdHVzXCIsIChtZXNzYWdlKSA9PlxuICAgICAgICAgIGlmIG1lc3NhZ2UgPT0gXCJpbXBvcnQgbG9va3VwXCJcbiAgICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiVXBkYXRlIHN0YXJ0aW5nXCJcbiAgICAgICAgICBlbHNlIGlmIG1lc3NhZ2UgPT0gXCJpbXBvcnQgc3VjY2Vzc1wiXG4gICAgICAgICAgICBVdGlscy5taWRBbGVydCBcIlVwZGF0ZWRcIlxuICAgICAgICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgICAgICAgQG1vZGVsLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgICAgICAgQHJlbmRlcigpXG4gICAgICAgICAgZWxzZSBpZiBtZXNzYWdlID09IFwiaW1wb3J0IGVycm9yXCJcbiAgICAgICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiVXBkYXRlIGZhaWxlZFwiXG4gICAgICAgIFV0aWxzLndvcmtpbmcgdHJ1ZVxuICAgICAgICBAbW9kZWwudXBkYXRlRnJvbVNlcnZlcigpXG5cbiAgdG9nZ2xlUHJpbnQ6IC0+XG4gICAgQCRlbC5maW5kKFwiLnByaW50X2Zvcm1hdF93cmFwcGVyXCIpLnRvZ2dsZSgpXG5cbiAgcHJpbnQ6IC0+XG4gICAgZm9ybWF0ID0gQCRlbC5maW5kKFwiI3ByaW50X2Zvcm1hdCBvcHRpb246c2VsZWN0ZWRcIikuYXR0cihcImRhdGEtZm9ybWF0XCIpXG5cbiAgICBpZiBmb3JtYXQgPT0gXCJjYW5jZWxcIlxuICAgICAgQCRlbC5maW5kKFwiLnByaW50X2Zvcm1hdF93cmFwcGVyXCIpLnRvZ2dsZSgpXG4gICAgICBAJGVsLmZpbmQoXCIjcHJpbnRfZm9ybWF0XCIpLnZhbChcInJlc2V0XCIpXG4gICAgICByZXR1cm5cblxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJwcmludC8je0Btb2RlbC5pZH0vI3tmb3JtYXR9XCIsIHRydWVcblxuXG4gIHVwZGF0ZVJlc3VsdENvdW50OiA9PlxuI0ByZXN1bHRDb3VudCA9IE1hdGguY29tbWFzIEBtb2RlbC5yZXN1bHRDb3VudFxuI0AkZWwuZmluZChcIi5yZXN1bHRfY291bnRcIikuaHRtbCBcIlJlc3VsdHMgPGI+I3tAcmVzdWx0Q291bnR9PC9iPlwiXG5cbiAgYXJjaGl2ZTogLT5cbiAgICByZXN1bHQgPSBAJGVsLmZpbmQoXCIuYXJjaGl2ZSA6c2VsZWN0ZWRcIikudmFsKCkgPT0gXCJ0cnVlXCJcbiAgICBpZiByZXN1bHQgPT0gdHJ1ZVxuICAgICAgQCRlbC5maW5kKFwiLmFkbWluX25hbWVcIikuYWRkQ2xhc3MgXCJhcmNoaXZlZF9hc3Nlc3NtZW50XCJcbiAgICBlbHNlXG4gICAgICBAJGVsLmZpbmQoXCIuYWRtaW5fbmFtZVwiKS5yZW1vdmVDbGFzcyBcImFyY2hpdmVkX2Fzc2Vzc21lbnRcIlxuXG4gICAgQG1vZGVsLnNhdmVcbiAgICAgIGFyY2hpdmVkIDogcmVzdWx0XG4gICAgcmV0dXJuIHRydWVcblxuICBhc3Nlc3NtZW50TWVudVRvZ2dsZTogLT5cbiAgICBAJGVsLmZpbmQoJy5hc3Nlc3NtZW50X21lbnVfdG9nZ2xlJykudG9nZ2xlQ2xhc3MoJ3NwX2Rvd24nKS50b2dnbGVDbGFzcygnc3BfcmlnaHQnKVxuICAgIEAkZWwuZmluZCgnLmFzc2Vzc21lbnRfbWVudScpLnRvZ2dsZSgpXG5cbiAgYXNzZXNzbWVudERlbGV0ZVRvZ2dsZTogLT5cbiAgICBAJGVsLmZpbmQoXCIuc3BfYXNzZXNzbWVudF9kZWxldGVfY29uZmlybVwiKS50b2dnbGUoKTsgZmFsc2VcblxuIyBkZWVwIG5vbi1nZXJuZXJpYyBkZWxldGVcbiAgYXNzZXNzbWVudERlbGV0ZTogPT5cbiMgcmVtb3ZlcyBmcm9tIGNvbGxlY3Rpb25cbiAgICBAbW9kZWwuZGVzdHJveSgpXG5cbiAgc3ByaXRlTGlzdExpbms6ICggdGFnTmFtZSwgbmFtZXMuLi4gKSAtPlxuICAgIHJlc3VsdCA9IFwiXCJcbiAgICBmb3IgbmFtZSBpbiBuYW1lc1xuICAgICAgcmVzdWx0ICs9IFwiPCN7dGFnTmFtZX0gY2xhc3M9J3NwXyN7bmFtZS51bmRlcnNjb3JlKCl9Jz48YSBocmVmPScjI3tuYW1lfS8je0Btb2RlbC5pZH0nPiN7bmFtZS51bmRlcnNjb3JlKCkudGl0bGVpemUoKX08L2E+PC8je3RhZ05hbWV9PlwiXG4gICAgcmV0dXJuIHJlc3VsdFxuXG4gIHNwcml0ZUV2ZW50czogKCB0YWdOYW1lLCBuYW1lcy4uLikgLT5cbiAgICByZXN1bHQgPSBcIlwiXG4gICAgZm9yIG5hbWUgaW4gbmFtZXNcbiAgICAgIHJlc3VsdCArPSBcIjwje3RhZ05hbWV9PjxidXR0b24gY2xhc3M9J3NwXyN7bmFtZS51bmRlcnNjb3JlKCl9JyB0aXRsZT0nI3tuYW1lLnVuZGVyc2NvcmUoKS50aXRsZWl6ZSgpfSc+I3tuYW1lLnVuZGVyc2NvcmUoKS50aXRsZWl6ZSgpfTwvYnV0dG9uPjwvI3t0YWdOYW1lfT4gXCJcbiAgICByZXR1cm4gcmVzdWx0XG5cbiAgdWw6IChvcHRpb25zKS0+XG5cbiAgICBodG1sID0gXCI8dWwgI3tpZiBvcHRpb25zLmNzc0NsYXNzIHRoZW4gXCJjbGFzcz0nI3tvcHRpb25zLmNzc0NsYXNzfSdcIiBlbHNlICcnfT5cIlxuICAgIGh0bWwgKz0gQHNwcml0ZUxpc3RMaW5rLmFwcGx5IEAsIFtcImxpXCJdLmNvbmNhdChvcHRpb25zLmxpbmtzKVxuICAgIGh0bWwgKz0gb3B0aW9ucy5vdGhlciB8fCAnJ1xuICAgIGh0bWwgKz0gXCI8L3VsPlwiXG5cbiAgcmVuZGVyOiAtPlxuXG4gICAgaXNBcmNoaXZlZCA9IEBtb2RlbC5nZXRCb29sZWFuKCdhcmNoaXZlZCcpXG5cbiAgICAjIGNvbW1hbmRzXG5cbiAgICAjIGluZGljYXRvcnMgYW5kIHZhcmlhYmxlc1xuICAgIGFyY2hpdmVDbGFzcyAgICAgPSBpZiBpc0FyY2hpdmVkIHRoZW4gXCIgYXJjaGl2ZWRfYXNzZXNzbWVudFwiIGVsc2UgXCJcIlxuXG4gICAgdG9nZ2xlQnV0dG9uICAgICA9IFwiPGRpdiBjbGFzcz0nYXNzZXNzbWVudF9tZW51X3RvZ2dsZSBzcF9yaWdodCc+PGRpdj48L2Rpdj48L2Rpdj5cIlxuICAgIG5hbWUgICAgICAgICAgICAgPSBcIjxidXR0b24gY2xhc3M9J25hbWUgY2xpY2thYmxlJz4je0Btb2RlbC5nZXQoJ25hbWUnKX08L2J1dHRvbj5cIlxuICAgIGFkbWluTmFtZSAgICAgICAgPSBcIjxidXR0b24gY2xhc3M9J2FkbWluX25hbWUgY2xpY2thYmxlICN7YXJjaGl2ZUNsYXNzfSc+I3tAbW9kZWwuZ2V0KCduYW1lJyl9PC9idXR0b24+XCJcbiAgICBhZG1pblJlc3VsdENvdW50ID0gXCI8bGFiZWwgY2xhc3M9J3Jlc3VsdF9jb3VudCBzbWFsbF9ncmV5IG5vX2hlbHAnIHRpdGxlPSdSZXN1bHQgY291bnQuIENsaWNrIHRvIHVwZGF0ZS4nPlJlc3VsdHMgPGI+I3tAcmVzdWx0Q291bnR9PC9iPjwvbGFiZWw+XCJcbiAgICByZXN1bHRDb3VudCAgICAgID0gXCI8c3BhbiBjbGFzcz0ncmVzdWx0X2NvdW50IG5vX2hlbHAnPlJlc3VsdHMgPGI+I3tAcmVzdWx0Q291bnR9PC9iPjwvc3Bhbj5cIlxuICAgIHNlbGVjdGVkICAgICAgICAgPSBcIiBzZWxlY3RlZD0nc2VsZWN0ZWQnXCJcblxuICAgIGRlbGV0ZUNvbmZpcm0gICA9IFwiPHNwYW4gY2xhc3M9J3NwX2Fzc2Vzc21lbnRfZGVsZXRlX2NvbmZpcm0gY29uZmlybWF0aW9uJz48ZGl2IGNsYXNzPSdtZW51X2JveCc+Q29uZmlybSA8YnV0dG9uIGNsYXNzPSdzcF9hc3Nlc3NtZW50X2RlbGV0ZV95ZXMgY29tbWFuZF9yZWQnPkRlbGV0ZTwvYnV0dG9uPiA8YnV0dG9uIGNsYXNzPSdzcF9hc3Nlc3NtZW50X2RlbGV0ZV9jYW5jZWwgY29tbWFuZCc+Q2FuY2VsPC9idXR0b24+PC9kaXY+PC9zcGFuPlwiXG5cbiAgICBwcmludFNlbGVjdG9yICAgPSBcIlxuICAgICAgPGRpdiBjbGFzcz0ncHJpbnRfZm9ybWF0X3dyYXBwZXIgY29uZmlybWF0aW9uJz5cbiAgICAgICAgPHNlbGVjdCBpZD0ncHJpbnRfZm9ybWF0Jz5cbiAgICAgICAgPG9wdGlvbiBkaXNhYmxlZD0nZGlzYWJsZWQnIHNlbGVjdGVkPSdzZWxlY3RlZCcgdmFsdWU9J3Jlc2V0Jz5TZWxlY3QgYSBwcmludCBmb3JtYXQ8L29wdGlvbj5cbiAgICAgICAgI3soXCI8b3B0aW9uIGRhdGEtZm9ybWF0PScje2Zvcm1hdC5rZXl9Jz4je2Zvcm1hdC5uYW1lfTwvb3B0aW9uPlwiKSBmb3IgZm9ybWF0IGluIFRhbmdlcmluZS5zZXR0aW5ncy5jb25maWcuZ2V0KFwicHJpbnRGb3JtYXRzXCIpfVxuICAgICAgICA8b3B0aW9uIGRhdGEtZm9ybWF0PSdjYW5jZWwnPkNhbmNlbDwvb3B0aW9uPlxuICAgICAgICA8L3NlbGVjdD5cbiAgICAgIDwvZGl2PlxuICAgIFwiXG5cbiAgICBkb3dubG9hZEtleSAgID0gXCI8bGkgY2xhc3M9J2Rvd25sb2FkX2tleSBzbWFsbF9ncmV5Jz5Eb3dubG9hZCBrZXkgPGI+I3tAbW9kZWwuZ2V0KFwiX2lkXCIpLnN1YnN0cigtNSw1KX08L2I+PC9saT5cIlxuICAgIGFyY2hpdmVTd2l0Y2ggPSBcIlxuICAgICAgPHNlbGVjdCBjbGFzcz0nYXJjaGl2ZSc+XG4gICAgICAgIDxvcHRpb24gdmFsdWU9J2ZhbHNlJyAje2lmIGlzQXJjaGl2ZWQgdGhlbiBzZWxlY3RlZCBlbHNlICcnfT5BY3RpdmU8L29wdGlvbj5cbiAgICAgICAgPG9wdGlvbiB2YWx1ZT0ndHJ1ZScgICN7aWYgaXNBcmNoaXZlZCB0aGVuIHNlbGVjdGVkIGVsc2UgJyd9PkFyY2hpdmVkPC9vcHRpb24+XG4gICAgICA8L3NlbGVjdD5cbiAgICBcIlxuXG4gICAgaWYgQGlzQWRtaW5cbiMgYWRtaW4gc3RhbmRhcmRcbiAgICAgIEAkZWwuaHRtbCBcIlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICN7dG9nZ2xlQnV0dG9ufVxuICAgICAgICAgICN7YWRtaW5OYW1lfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgI3tAdWxcbiAgICAgICAgY3NzQ2xhc3MgOiBcImFzc2Vzc21lbnRfbWVudVwiXG4gICAgICAgIGxpbmtzIDogW1wicnVuXCIsIFwiZGF0YUVudHJ5XCIsIFwicmVzdWx0c1wiLCBcImVkaXRcIiwgXCJzeW5jXCIsIFwicHJpbnRcIiBdXG4gICAgICAgIG90aGVyIDogQHNwcml0ZUV2ZW50cyhcImxpXCIsIFwiZHVwbGljYXRlXCIsIFwiYXNzZXNzbWVudF9kZWxldGVcIikgKyBkb3dubG9hZEtleVxuICAgICAgfVxuICAgICAgICA8ZGl2IGNsYXNzPSdzdWJfbWVudXMnPlxuICAgICAgICAgICN7ZGVsZXRlQ29uZmlybX1cbiAgICAgICAgICAje3ByaW50U2VsZWN0b3J9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBcIlxuXG4gICAgZWxzZSBpZiBAaXNBZG1pbiBhbmQgVGFuZ2VyaW5lLnNldHRpbmdzLmdldEJvb2xlYW4oJ3NhdGVsbGl0ZScpXG5cbiAgICAgIEAkZWwuaHRtbCBcIlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICN7dG9nZ2xlQnV0dG9ufVxuICAgICAgICAgICN7YWRtaW5OYW1lfVxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICAje0B1bFxuICAgICAgICBjc3NDbGFzczogXCJhc3Nlc3NtZW50X21lbnVcIlxuICAgICAgICBsaW5rcyA6IFtcInJ1blwiLFwicmVzdWx0c1wiLFwiZWRpdFwiLFwic3luY1wiLFwicHJpbnRcIl1cbiAgICAgICAgb3RoZXIgOiBAc3ByaXRlRXZlbnRzKFwibGlcIiwgXCJkdXBsaWNhdGVcIiwgXCJhc3Nlc3NtZW50X2RlbGV0ZVwiKSArIGRvd25sb2FkS2V5XG4gICAgICB9XG4gICAgICAgIDxkaXYgY2xhc3M9J3N1Yl9tZW51cyc+XG4gICAgICAgICAgI3tkZWxldGVDb25maXJtfVxuICAgICAgICAgICN7cHJpbnRTZWxlY3Rvcn1cbiAgICAgICAgPC9kaXY+XG4gICAgICBcIlxuXG4gICAgZWxzZVxuICAgICAgQCRlbC5odG1sIFwiXG4gICAgICAgIDxkaXYgY2xhc3M9J25vbl9hZG1pbic+XG4gICAgICAgICAgI3tAc3ByaXRlTGlzdExpbmsoXCJzcGFuXCIsJ3J1bicpfSN7bmFtZX0gI3tAc3ByaXRlTGlzdExpbmsoXCJzcGFuXCIsJ3Jlc3VsdHMnKX0gI3tAc3ByaXRlTGlzdExpbmsoXCJzcGFuXCIsJ3ByaW50Jyl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdzdWJfbWVudXMnPlxuICAgICAgICAgICN7cHJpbnRTZWxlY3Rvcn1cbiAgICAgICAgPC9kaXY+XG4gICAgICBcIlxuXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiJdfQ==
