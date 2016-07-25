var AssessmentListElementView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

AssessmentListElementView = (function(superClass) {
  extend(AssessmentListElementView, superClass);

  function AssessmentListElementView() {
    this.assessmentDelete = bind(this.assessmentDelete, this);
    this.updateResultCount = bind(this.updateResultCount, this);
    this.update = bind(this.update, this);
    this.ghostLogin = bind(this.ghostLogin, this);
    return AssessmentListElementView.__super__.constructor.apply(this, arguments);
  }

  AssessmentListElementView.prototype.className = "AssessmentListElementView";

  AssessmentListElementView.prototype.tagName = "li";

  AssessmentListElementView.prototype.events = Modernizr.touch ? {
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

  AssessmentListElementView.prototype.blankResultCount = "-";

  AssessmentListElementView.prototype.initialize = function(options) {
    this.model = options.model;
    this.parent = options.parent;
    return this.isAdmin = Tangerine.user.isAdmin();
  };

  AssessmentListElementView.prototype.respondToLink = function(event) {
    var $target, route;
    $target = $(event.target);
    route = $target.attr("href");
    return Tangerine.router.navigate(route, true);
  };

  AssessmentListElementView.prototype.duplicate = function() {
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

  AssessmentListElementView.prototype.copyTo = function(group) {
    return this.model.replicate(group, (function(_this) {
      return function() {
        return window.location = Tangerine.settings.urlIndex(group, "assessments");
      };
    })(this));
  };

  AssessmentListElementView.prototype.ghostLogin = function() {
    return Tangerine.user.ghostLogin(Tangerine.settings.upUser, Tangerine.settings.upPass);
  };

  AssessmentListElementView.prototype.update = function() {
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

  AssessmentListElementView.prototype.togglePrint = function() {
    return this.$el.find(".print_format_wrapper").toggle();
  };

  AssessmentListElementView.prototype.print = function() {
    var format;
    format = this.$el.find("#print_format option:selected").attr("data-format");
    if (format === "cancel") {
      this.$el.find(".print_format_wrapper").toggle();
      this.$el.find("#print_format").val("reset");
      return;
    }
    return Tangerine.router.navigate("print/" + this.model.id + "/" + format, true);
  };

  AssessmentListElementView.prototype.updateResultCount = function() {};

  AssessmentListElementView.prototype.archive = function() {
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

  AssessmentListElementView.prototype.assessmentMenuToggle = function() {
    this.$el.find('.assessment_menu_toggle').toggleClass('sp_down').toggleClass('sp_right');
    return this.$el.find('.assessment_menu').toggle();
  };

  AssessmentListElementView.prototype.assessmentDeleteToggle = function() {
    this.$el.find(".sp_assessment_delete_confirm").toggle();
    return false;
  };

  AssessmentListElementView.prototype.assessmentDelete = function() {
    return this.model.destroy();
  };

  AssessmentListElementView.prototype.spriteListLink = function() {
    var i, len, name, names, result, tagName;
    tagName = arguments[0], names = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    result = "";
    for (i = 0, len = names.length; i < len; i++) {
      name = names[i];
      result += "<" + tagName + " class='sp_" + (name.underscore()) + "'><a href='#" + name + "/" + this.model.id + "'>" + (name.underscore().titleize()) + "</a></" + tagName + ">";
    }
    return result;
  };

  AssessmentListElementView.prototype.spriteEvents = function() {
    var i, len, name, names, result, tagName;
    tagName = arguments[0], names = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    result = "";
    for (i = 0, len = names.length; i < len; i++) {
      name = names[i];
      result += "<" + tagName + "><button class='sp_" + (name.underscore()) + "' title='" + (name.underscore().titleize()) + "'>" + (name.underscore().titleize()) + "</button></" + tagName + "> ";
    }
    return result;
  };

  AssessmentListElementView.prototype.ul = function(options) {
    var html;
    html = "<ul " + (options.cssClass ? "class='" + options.cssClass + "'" : '') + ">";
    html += this.spriteListLink.apply(this, ["li"].concat(options.links));
    html += options.other || '';
    return html += "</ul>";
  };

  AssessmentListElementView.prototype.render = function() {
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

  return AssessmentListElementView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2Vzc21lbnQvQXNzZXNzbWVudExpc3RFbGVtZW50Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSx5QkFBQTtFQUFBOzs7OztBQUFNOzs7Ozs7Ozs7OztzQ0FFSixTQUFBLEdBQVk7O3NDQUVaLE9BQUEsR0FBVTs7c0NBRVYsTUFBQSxHQUFXLFNBQVMsQ0FBQyxLQUFiLEdBQXdCO0lBQzlCLCtCQUFBLEVBQXdDLHNCQURWO0lBRTlCLG1CQUFBLEVBQXdDLHNCQUZWO0lBRzlCLDZCQUFBLEVBQXdDLHdCQUhWO0lBSTlCLG9DQUFBLEVBQXdDLHdCQUpWO0lBSzlCLHFDQUFBLEVBQXdDLGtCQUxWO0lBTTlCLGdCQUFBLEVBQXdDLFFBTlY7SUFPOUIscUJBQUEsRUFBd0MsV0FQVjtJQVE5QixrQkFBQSxFQUF3QyxRQVJWO0lBUzlCLGlCQUFBLEVBQXdDLGFBVFY7SUFVOUIsZ0JBQUEsRUFBd0MsU0FWVjtJQVc5QixTQUFBLEVBQVksZUFYa0I7SUFhOUIsc0JBQUEsRUFBcUMsT0FiUDtHQUF4QixHQWNEO0lBQ0wsK0JBQUEsRUFBd0Msc0JBRG5DO0lBRUwsbUJBQUEsRUFBd0Msc0JBRm5DO0lBR0wsNkJBQUEsRUFBd0Msd0JBSG5DO0lBSUwsb0NBQUEsRUFBd0Msd0JBSm5DO0lBS0wscUNBQUEsRUFBd0Msa0JBTG5DO0lBTUwsZ0JBQUEsRUFBd0MsUUFObkM7SUFPTCxxQkFBQSxFQUF3QyxXQVBuQztJQVFMLGtCQUFBLEVBQXdDLFFBUm5DO0lBU0wsaUJBQUEsRUFBd0MsYUFUbkM7SUFVTCxnQkFBQSxFQUF3QyxTQVZuQztJQVlMLHNCQUFBLEVBQXFDLE9BWmhDOzs7c0NBZVAsZ0JBQUEsR0FBa0I7O3NDQUVsQixVQUFBLEdBQVksU0FBQyxPQUFEO0lBTVYsSUFBQyxDQUFBLEtBQUQsR0FBWSxPQUFPLENBQUM7SUFDcEIsSUFBQyxDQUFBLE1BQUQsR0FBWSxPQUFPLENBQUM7V0FHcEIsSUFBQyxDQUFBLE9BQUQsR0FBZSxT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LElBQWEsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFuQixDQUE4QixXQUE5QixDQUFoQjtNQUVILElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFFBQUEsR0FFSixZQUZJLEdBRVMsR0FGVCxHQUdKLFNBSEksR0FHTSxVQUhOLEdBTVAsQ0FBQyxJQUFDLENBQUEsRUFBRCxDQUNBO1FBQUEsUUFBQSxFQUFVLGlCQUFWO1FBQ0EsS0FBQSxFQUFRLENBQUMsS0FBRCxFQUFPLFNBQVAsRUFBaUIsTUFBakIsRUFBd0IsTUFBeEIsRUFBK0IsT0FBL0IsQ0FEUjtRQUVBLEtBQUEsRUFBUSxJQUFDLENBQUEsWUFBRCxDQUFjLElBQWQsRUFBb0IsV0FBcEIsRUFBaUMsbUJBQWpDLENBQUEsR0FBd0QsV0FGaEU7T0FEQSxDQUFELENBTk8sR0FVUCwyQkFWTyxHQVlKLGFBWkksR0FZVSxHQVpWLEdBYUosYUFiSSxHQWFVLFNBYnBCLEVBRkc7S0FBQSxNQUFBO01Bb0JILElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLDBCQUFBLEdBRUwsQ0FBQyxJQUFDLENBQUEsY0FBRCxDQUFnQixNQUFoQixFQUF1QixLQUF2QixDQUFELENBRkssR0FFNEIsSUFGNUIsR0FFaUMsR0FGakMsR0FFbUMsQ0FBQyxJQUFDLENBQUEsY0FBRCxDQUFnQixNQUFoQixFQUF1QixTQUF2QixDQUFELENBRm5DLEdBRXNFLEdBRnRFLEdBRXdFLENBQUMsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsTUFBaEIsRUFBdUIsT0FBdkIsQ0FBRCxDQUZ4RSxHQUV5RyxrQ0FGekcsR0FLSixhQUxJLEdBS1UsU0FMcEIsRUFwQkc7O1dBOEJMLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQXBGTTs7OztHQTNKOEIsUUFBUSxDQUFDIiwiZmlsZSI6ImFzc2Vzc21lbnQvQXNzZXNzbWVudExpc3RFbGVtZW50Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEFzc2Vzc21lbnRMaXN0RWxlbWVudFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJBc3Nlc3NtZW50TGlzdEVsZW1lbnRWaWV3XCJcblxuICB0YWdOYW1lIDogXCJsaVwiXG5cbiAgZXZlbnRzOiBpZiBNb2Rlcm5penIudG91Y2ggdGhlbiB7XG4gICAgJ2NsaWNrIC5hc3Nlc3NtZW50X21lbnVfdG9nZ2xlJyAgICAgICA6ICdhc3Nlc3NtZW50TWVudVRvZ2dsZSdcbiAgICAnY2xpY2sgLmFkbWluX25hbWUnICAgICAgICAgICAgICAgICAgIDogJ2Fzc2Vzc21lbnRNZW51VG9nZ2xlJ1xuICAgICdjbGljayAuc3BfYXNzZXNzbWVudF9kZWxldGUnICAgICAgICAgOiAnYXNzZXNzbWVudERlbGV0ZVRvZ2dsZSdcbiAgICAnY2xpY2sgLnNwX2Fzc2Vzc21lbnRfZGVsZXRlX2NhbmNlbCcgIDogJ2Fzc2Vzc21lbnREZWxldGVUb2dnbGUnXG4gICAgJ2NsaWNrIC5zcF9hc3Nlc3NtZW50X2RlbGV0ZV9jb25maXJtJyA6ICdhc3Nlc3NtZW50RGVsZXRlJ1xuICAgICdjbGljayAuc3BfY29weScgICAgICAgICAgICAgICAgICAgICAgOiAnY29weVRvJ1xuICAgICdjbGljayAuc3BfZHVwbGljYXRlJyAgICAgICAgICAgICAgICAgOiAnZHVwbGljYXRlJ1xuICAgICdjbGljayAuc3BfdXBkYXRlJyAgICAgICAgICAgICAgICAgICAgOiAndXBkYXRlJ1xuICAgICdjbGljayAuc3BfcHJpbnQnICAgICAgICAgICAgICAgICAgICAgOiAndG9nZ2xlUHJpbnQnXG4gICAgJ2NsaWNrIC5hcmNoaXZlJyAgICAgICAgICAgICAgICAgICAgICA6ICdhcmNoaXZlJ1xuICAgICdjbGljayBhJyA6ICdyZXNwb25kVG9MaW5rJ1xuXG4gICAgJ2NoYW5nZSAjcHJpbnRfZm9ybWF0JyAgICAgICAgICAgICA6ICdwcmludCdcbiAgfSBlbHNlIHtcbiAgICAnY2xpY2sgLmFzc2Vzc21lbnRfbWVudV90b2dnbGUnICAgICAgIDogJ2Fzc2Vzc21lbnRNZW51VG9nZ2xlJ1xuICAgICdjbGljayAuYWRtaW5fbmFtZScgICAgICAgICAgICAgICAgICAgOiAnYXNzZXNzbWVudE1lbnVUb2dnbGUnXG4gICAgJ2NsaWNrIC5zcF9hc3Nlc3NtZW50X2RlbGV0ZScgICAgICAgICA6ICdhc3Nlc3NtZW50RGVsZXRlVG9nZ2xlJ1xuICAgICdjbGljayAuc3BfYXNzZXNzbWVudF9kZWxldGVfY2FuY2VsJyAgOiAnYXNzZXNzbWVudERlbGV0ZVRvZ2dsZSdcbiAgICAnY2xpY2sgLnNwX2Fzc2Vzc21lbnRfZGVsZXRlX2NvbmZpcm0nIDogJ2Fzc2Vzc21lbnREZWxldGUnXG4gICAgJ2NsaWNrIC5zcF9jb3B5JyAgICAgICAgICAgICAgICAgICAgICA6ICdjb3B5VG8nXG4gICAgJ2NsaWNrIC5zcF9kdXBsaWNhdGUnICAgICAgICAgICAgICAgICA6ICdkdXBsaWNhdGUnXG4gICAgJ2NsaWNrIC5zcF91cGRhdGUnICAgICAgICAgICAgICAgICAgICA6ICd1cGRhdGUnXG4gICAgJ2NsaWNrIC5zcF9wcmludCcgICAgICAgICAgICAgICAgICAgICA6ICd0b2dnbGVQcmludCdcbiAgICAnY2xpY2sgLmFyY2hpdmUnICAgICAgICAgICAgICAgICAgICAgIDogJ2FyY2hpdmUnXG5cbiAgICAnY2hhbmdlICNwcmludF9mb3JtYXQnICAgICAgICAgICAgIDogJ3ByaW50J1xuICB9XG5cbiAgYmxhbmtSZXN1bHRDb3VudDogXCItXCJcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgICMgZXZlbnRzXG4gICAgIyBvcHRpb25zLm1vZGVsLm9uIFwicmVzdWx0Q291bnRcIiwgQHVwZGF0ZVJlc3VsdENvdW50XG5cbiAgICAjYXJndW1lbnRzXG4gICAgQG1vZGVsICAgID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgICA9IG9wdGlvbnMucGFyZW50XG5cbiAgICAjIHN3aXRjaGVzIGFuZCB0aGluZ3NcbiAgICBAaXNBZG1pbiAgICAgPSBUYW5nZXJpbmUudXNlci5pc0FkbWluKClcblxuICByZXNwb25kVG9MaW5rOiAoZXZlbnQpIC0+XG4gICAgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KVxuICAgIHJvdXRlICAgPSAkdGFyZ2V0LmF0dHIoXCJocmVmXCIpXG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZShyb3V0ZSwgdHJ1ZSlcblxuICBkdXBsaWNhdGU6IC0+XG4gICAgbmV3TmFtZSA9IFwiQ29weSBvZiBcIiArIEBtb2RlbC5nZXQoXCJuYW1lXCIpXG4gICAgQG1vZGVsLmR1cGxpY2F0ZSB7IG5hbWUgOiBuZXdOYW1lIH0sIG51bGwsIG51bGwsIChhc3Nlc3NtZW50KSA9PlxuICAgICAgQG1vZGVsLnRyaWdnZXIgXCJuZXdcIiwgYXNzZXNzbWVudFxuXG4gIGNvcHlUbzogKGdyb3VwKSAtPlxuICAgIEBtb2RlbC5yZXBsaWNhdGUgZ3JvdXAsID0+XG4gICAgICB3aW5kb3cubG9jYXRpb24gPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsSW5kZXgoZ3JvdXAsIFwiYXNzZXNzbWVudHNcIilcblxuICBnaG9zdExvZ2luOiA9PlxuICAgIFRhbmdlcmluZS51c2VyLmdob3N0TG9naW4gVGFuZ2VyaW5lLnNldHRpbmdzLnVwVXNlciwgVGFuZ2VyaW5lLnNldHRpbmdzLnVwUGFzc1xuXG4gIHVwZGF0ZTogPT5cbiAgICBVdGlscy5taWRBbGVydCBcIlZlcmlmeWluZyBjb25uZWN0aW9uXCJcbiAgICBVdGlscy53b3JraW5nIHRydWVcblxuICAgIEBtb2RlbC52ZXJpZnlDb25uZWN0aW9uXG4gICAgICBlcnJvcjogPT5cbiAgICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgICBVdGlscy5taWRBbGVydCBcIlZlcmlmeWluZyBjb25uZWN0aW9uPGJyPlBsZWFzZSByZXRyeSB1cGRhdGUuXCJcbiAgICAgICAgXy5kZWxheSA9PlxuICAgICAgICAgIEBnaG9zdExvZ2luKClcbiAgICAgICAgLCA1MDAwXG5cbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgICAgQG1vZGVsLm9uIFwic3RhdHVzXCIsIChtZXNzYWdlKSA9PlxuICAgICAgICAgIGlmIG1lc3NhZ2UgPT0gXCJpbXBvcnQgbG9va3VwXCJcbiAgICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiVXBkYXRlIHN0YXJ0aW5nXCJcbiAgICAgICAgICBlbHNlIGlmIG1lc3NhZ2UgPT0gXCJpbXBvcnQgc3VjY2Vzc1wiXG4gICAgICAgICAgICBVdGlscy5taWRBbGVydCBcIlVwZGF0ZWRcIlxuICAgICAgICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgICAgICAgQG1vZGVsLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgICAgICAgQHJlbmRlcigpXG4gICAgICAgICAgZWxzZSBpZiBtZXNzYWdlID09IFwiaW1wb3J0IGVycm9yXCJcbiAgICAgICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiVXBkYXRlIGZhaWxlZFwiXG4gICAgICAgIFV0aWxzLndvcmtpbmcgdHJ1ZVxuICAgICAgICBAbW9kZWwudXBkYXRlRnJvbVNlcnZlcigpXG5cbiAgdG9nZ2xlUHJpbnQ6IC0+XG4gICAgQCRlbC5maW5kKFwiLnByaW50X2Zvcm1hdF93cmFwcGVyXCIpLnRvZ2dsZSgpXG5cbiAgcHJpbnQ6IC0+XG4gICAgZm9ybWF0ID0gQCRlbC5maW5kKFwiI3ByaW50X2Zvcm1hdCBvcHRpb246c2VsZWN0ZWRcIikuYXR0cihcImRhdGEtZm9ybWF0XCIpXG5cbiAgICBpZiBmb3JtYXQgPT0gXCJjYW5jZWxcIlxuICAgICAgQCRlbC5maW5kKFwiLnByaW50X2Zvcm1hdF93cmFwcGVyXCIpLnRvZ2dsZSgpXG4gICAgICBAJGVsLmZpbmQoXCIjcHJpbnRfZm9ybWF0XCIpLnZhbChcInJlc2V0XCIpXG4gICAgICByZXR1cm5cblxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJwcmludC8je0Btb2RlbC5pZH0vI3tmb3JtYXR9XCIsIHRydWVcblxuXG4gIHVwZGF0ZVJlc3VsdENvdW50OiA9PlxuICAgICNAcmVzdWx0Q291bnQgPSBNYXRoLmNvbW1hcyBAbW9kZWwucmVzdWx0Q291bnRcbiAgICAjQCRlbC5maW5kKFwiLnJlc3VsdF9jb3VudFwiKS5odG1sIFwiUmVzdWx0cyA8Yj4je0ByZXN1bHRDb3VudH08L2I+XCJcblxuICBhcmNoaXZlOiAtPlxuICAgIHJlc3VsdCA9IEAkZWwuZmluZChcIi5hcmNoaXZlIDpzZWxlY3RlZFwiKS52YWwoKSA9PSBcInRydWVcIlxuICAgIGlmIHJlc3VsdCA9PSB0cnVlXG4gICAgICBAJGVsLmZpbmQoXCIuYWRtaW5fbmFtZVwiKS5hZGRDbGFzcyBcImFyY2hpdmVkX2Fzc2Vzc21lbnRcIlxuICAgIGVsc2VcbiAgICAgIEAkZWwuZmluZChcIi5hZG1pbl9uYW1lXCIpLnJlbW92ZUNsYXNzIFwiYXJjaGl2ZWRfYXNzZXNzbWVudFwiXG5cbiAgICBAbW9kZWwuc2F2ZVxuICAgICAgYXJjaGl2ZWQgOiByZXN1bHRcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIGFzc2Vzc21lbnRNZW51VG9nZ2xlOiAtPlxuICAgIEAkZWwuZmluZCgnLmFzc2Vzc21lbnRfbWVudV90b2dnbGUnKS50b2dnbGVDbGFzcygnc3BfZG93bicpLnRvZ2dsZUNsYXNzKCdzcF9yaWdodCcpXG4gICAgQCRlbC5maW5kKCcuYXNzZXNzbWVudF9tZW51JykudG9nZ2xlKClcblxuICBhc3Nlc3NtZW50RGVsZXRlVG9nZ2xlOiAtPlxuICAgIEAkZWwuZmluZChcIi5zcF9hc3Nlc3NtZW50X2RlbGV0ZV9jb25maXJtXCIpLnRvZ2dsZSgpOyBmYWxzZVxuXG4gICMgZGVlcCBub24tZ2VybmVyaWMgZGVsZXRlXG4gIGFzc2Vzc21lbnREZWxldGU6ID0+XG4gICAgIyByZW1vdmVzIGZyb20gY29sbGVjdGlvblxuICAgIEBtb2RlbC5kZXN0cm95KClcblxuICBzcHJpdGVMaXN0TGluazogKCB0YWdOYW1lLCBuYW1lcy4uLiApIC0+XG4gICAgcmVzdWx0ID0gXCJcIlxuICAgIGZvciBuYW1lIGluIG5hbWVzXG4gICAgICByZXN1bHQgKz0gXCI8I3t0YWdOYW1lfSBjbGFzcz0nc3BfI3tuYW1lLnVuZGVyc2NvcmUoKX0nPjxhIGhyZWY9JyMje25hbWV9LyN7QG1vZGVsLmlkfSc+I3tuYW1lLnVuZGVyc2NvcmUoKS50aXRsZWl6ZSgpfTwvYT48LyN7dGFnTmFtZX0+XCJcbiAgICByZXR1cm4gcmVzdWx0XG5cbiAgc3ByaXRlRXZlbnRzOiAoIHRhZ05hbWUsIG5hbWVzLi4uKSAtPlxuICAgIHJlc3VsdCA9IFwiXCJcbiAgICBmb3IgbmFtZSBpbiBuYW1lc1xuICAgICAgcmVzdWx0ICs9IFwiPCN7dGFnTmFtZX0+PGJ1dHRvbiBjbGFzcz0nc3BfI3tuYW1lLnVuZGVyc2NvcmUoKX0nIHRpdGxlPScje25hbWUudW5kZXJzY29yZSgpLnRpdGxlaXplKCl9Jz4je25hbWUudW5kZXJzY29yZSgpLnRpdGxlaXplKCl9PC9idXR0b24+PC8je3RhZ05hbWV9PiBcIlxuICAgIHJldHVybiByZXN1bHRcblxuICB1bDogKG9wdGlvbnMpLT5cblxuICAgIGh0bWwgPSBcIjx1bCAje2lmIG9wdGlvbnMuY3NzQ2xhc3MgdGhlbiBcImNsYXNzPScje29wdGlvbnMuY3NzQ2xhc3N9J1wiIGVsc2UgJyd9PlwiXG4gICAgaHRtbCArPSBAc3ByaXRlTGlzdExpbmsuYXBwbHkgQCwgW1wibGlcIl0uY29uY2F0KG9wdGlvbnMubGlua3MpXG4gICAgaHRtbCArPSBvcHRpb25zLm90aGVyIHx8ICcnXG4gICAgaHRtbCArPSBcIjwvdWw+XCJcblxuICByZW5kZXI6IC0+XG5cbiAgICBpc0FyY2hpdmVkID0gQG1vZGVsLmdldEJvb2xlYW4oJ2FyY2hpdmVkJylcblxuICAgICMgY29tbWFuZHNcblxuICAgICMgaW5kaWNhdG9ycyBhbmQgdmFyaWFibGVzXG4gICAgYXJjaGl2ZUNsYXNzICAgICA9IGlmIGlzQXJjaGl2ZWQgdGhlbiBcIiBhcmNoaXZlZF9hc3Nlc3NtZW50XCIgZWxzZSBcIlwiXG5cbiAgICB0b2dnbGVCdXR0b24gICAgID0gXCI8ZGl2IGNsYXNzPSdhc3Nlc3NtZW50X21lbnVfdG9nZ2xlIHNwX3JpZ2h0Jz48ZGl2PjwvZGl2PjwvZGl2PlwiXG4gICAgbmFtZSAgICAgICAgICAgICA9IFwiPGJ1dHRvbiBjbGFzcz0nbmFtZSBjbGlja2FibGUnPiN7QG1vZGVsLmdldCgnbmFtZScpfTwvYnV0dG9uPlwiXG4gICAgYWRtaW5OYW1lICAgICAgICA9IFwiPGJ1dHRvbiBjbGFzcz0nYWRtaW5fbmFtZSBjbGlja2FibGUgI3thcmNoaXZlQ2xhc3N9Jz4je0Btb2RlbC5nZXQoJ25hbWUnKX08L2J1dHRvbj5cIlxuICAgIGFkbWluUmVzdWx0Q291bnQgPSBcIjxsYWJlbCBjbGFzcz0ncmVzdWx0X2NvdW50IHNtYWxsX2dyZXkgbm9faGVscCcgdGl0bGU9J1Jlc3VsdCBjb3VudC4gQ2xpY2sgdG8gdXBkYXRlLic+UmVzdWx0cyA8Yj4je0ByZXN1bHRDb3VudH08L2I+PC9sYWJlbD5cIlxuICAgIHJlc3VsdENvdW50ICAgICAgPSBcIjxzcGFuIGNsYXNzPSdyZXN1bHRfY291bnQgbm9faGVscCc+UmVzdWx0cyA8Yj4je0ByZXN1bHRDb3VudH08L2I+PC9zcGFuPlwiXG4gICAgc2VsZWN0ZWQgICAgICAgICA9IFwiIHNlbGVjdGVkPSdzZWxlY3RlZCdcIlxuXG4gICAgZGVsZXRlQ29uZmlybSAgID0gXCI8c3BhbiBjbGFzcz0nc3BfYXNzZXNzbWVudF9kZWxldGVfY29uZmlybSBjb25maXJtYXRpb24nPjxkaXYgY2xhc3M9J21lbnVfYm94Jz5Db25maXJtIDxidXR0b24gY2xhc3M9J3NwX2Fzc2Vzc21lbnRfZGVsZXRlX3llcyBjb21tYW5kX3JlZCc+RGVsZXRlPC9idXR0b24+IDxidXR0b24gY2xhc3M9J3NwX2Fzc2Vzc21lbnRfZGVsZXRlX2NhbmNlbCBjb21tYW5kJz5DYW5jZWw8L2J1dHRvbj48L2Rpdj48L3NwYW4+XCJcblxuICAgIHByaW50U2VsZWN0b3IgICA9IFwiXG4gICAgICA8ZGl2IGNsYXNzPSdwcmludF9mb3JtYXRfd3JhcHBlciBjb25maXJtYXRpb24nPlxuICAgICAgICA8c2VsZWN0IGlkPSdwcmludF9mb3JtYXQnPlxuICAgICAgICA8b3B0aW9uIGRpc2FibGVkPSdkaXNhYmxlZCcgc2VsZWN0ZWQ9J3NlbGVjdGVkJyB2YWx1ZT0ncmVzZXQnPlNlbGVjdCBhIHByaW50IGZvcm1hdDwvb3B0aW9uPlxuICAgICAgICAjeyhcIjxvcHRpb24gZGF0YS1mb3JtYXQ9JyN7Zm9ybWF0LmtleX0nPiN7Zm9ybWF0Lm5hbWV9PC9vcHRpb24+XCIpIGZvciBmb3JtYXQgaW4gVGFuZ2VyaW5lLnNldHRpbmdzLmNvbmZpZy5nZXQoXCJwcmludEZvcm1hdHNcIil9XG4gICAgICAgIDxvcHRpb24gZGF0YS1mb3JtYXQ9J2NhbmNlbCc+Q2FuY2VsPC9vcHRpb24+XG4gICAgICAgIDwvc2VsZWN0PlxuICAgICAgPC9kaXY+XG4gICAgXCJcblxuICAgIGRvd25sb2FkS2V5ICAgPSBcIjxsaSBjbGFzcz0nZG93bmxvYWRfa2V5IHNtYWxsX2dyZXknPkRvd25sb2FkIGtleSA8Yj4je0Btb2RlbC5nZXQoXCJfaWRcIikuc3Vic3RyKC01LDUpfTwvYj48L2xpPlwiXG4gICAgYXJjaGl2ZVN3aXRjaCA9IFwiXG4gICAgICA8c2VsZWN0IGNsYXNzPSdhcmNoaXZlJz5cbiAgICAgICAgPG9wdGlvbiB2YWx1ZT0nZmFsc2UnICN7aWYgaXNBcmNoaXZlZCB0aGVuIHNlbGVjdGVkIGVsc2UgJyd9PkFjdGl2ZTwvb3B0aW9uPlxuICAgICAgICA8b3B0aW9uIHZhbHVlPSd0cnVlJyAgI3tpZiBpc0FyY2hpdmVkIHRoZW4gc2VsZWN0ZWQgZWxzZSAnJ30+QXJjaGl2ZWQ8L29wdGlvbj5cbiAgICAgIDwvc2VsZWN0PlxuICAgIFwiXG5cbiAgICBpZiBAaXNBZG1pblxuICAgICAgIyBhZG1pbiBzdGFuZGFyZFxuICAgICAgQCRlbC5odG1sIFwiXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgI3t0b2dnbGVCdXR0b259XG4gICAgICAgICAgI3thZG1pbk5hbWV9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICAje0B1bFxuICAgICAgICAgIGNzc0NsYXNzIDogXCJhc3Nlc3NtZW50X21lbnVcIlxuICAgICAgICAgIGxpbmtzIDogW1wicnVuXCIsIFwiZGF0YUVudHJ5XCIsIFwicmVzdWx0c1wiLCBcImVkaXRcIiwgXCJzeW5jXCIsIFwicHJpbnRcIiBdXG4gICAgICAgICAgb3RoZXIgOiBAc3ByaXRlRXZlbnRzKFwibGlcIiwgXCJkdXBsaWNhdGVcIiwgXCJhc3Nlc3NtZW50X2RlbGV0ZVwiKSArIGRvd25sb2FkS2V5XG4gICAgICAgIH1cbiAgICAgICAgPGRpdiBjbGFzcz0nc3ViX21lbnVzJz5cbiAgICAgICAgICAje2RlbGV0ZUNvbmZpcm19XG4gICAgICAgICAgI3twcmludFNlbGVjdG9yfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgXCJcblxuICAgIGVsc2UgaWYgQGlzQWRtaW4gYW5kIFRhbmdlcmluZS5zZXR0aW5ncy5nZXRCb29sZWFuKCdzYXRlbGxpdGUnKVxuXG4gICAgICBAJGVsLmh0bWwgXCJcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAje3RvZ2dsZUJ1dHRvbn1cbiAgICAgICAgICAje2FkbWluTmFtZX1cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgI3tAdWxcbiAgICAgICAgICBjc3NDbGFzczogXCJhc3Nlc3NtZW50X21lbnVcIlxuICAgICAgICAgIGxpbmtzIDogW1wicnVuXCIsXCJyZXN1bHRzXCIsXCJlZGl0XCIsXCJzeW5jXCIsXCJwcmludFwiXVxuICAgICAgICAgIG90aGVyIDogQHNwcml0ZUV2ZW50cyhcImxpXCIsIFwiZHVwbGljYXRlXCIsIFwiYXNzZXNzbWVudF9kZWxldGVcIikgKyBkb3dubG9hZEtleVxuICAgICAgICB9XG4gICAgICAgIDxkaXYgY2xhc3M9J3N1Yl9tZW51cyc+XG4gICAgICAgICAgI3tkZWxldGVDb25maXJtfVxuICAgICAgICAgICN7cHJpbnRTZWxlY3Rvcn1cbiAgICAgICAgPC9kaXY+XG4gICAgICBcIlxuXG4gICAgZWxzZVxuICAgICAgQCRlbC5odG1sIFwiXG4gICAgICAgIDxkaXYgY2xhc3M9J25vbl9hZG1pbic+XG4gICAgICAgICAgI3tAc3ByaXRlTGlzdExpbmsoXCJzcGFuXCIsJ3J1bicpfSN7bmFtZX0gI3tAc3ByaXRlTGlzdExpbmsoXCJzcGFuXCIsJ3Jlc3VsdHMnKX0gI3tAc3ByaXRlTGlzdExpbmsoXCJzcGFuXCIsJ3ByaW50Jyl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdzdWJfbWVudXMnPlxuICAgICAgICAgICN7cHJpbnRTZWxlY3Rvcn1cbiAgICAgICAgPC9kaXY+XG4gICAgICBcIlxuXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiJdfQ==
